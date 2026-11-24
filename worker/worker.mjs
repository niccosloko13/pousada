import {mkdir} from 'node:fs/promises';
import {homedir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import makeSocket, {DisconnectReason,normalizeMessageContent,useMultiFileAuthState} from '@whiskeysockets/baileys';
import pg from 'pg';
import pino from 'pino';
import qr from 'qrcode-terminal';
import {ingest,schema,vault} from './storage.mjs';
import {resolveGroup} from './policy.mjs';

export function unpack(m) {
  const content = normalizeMessageContent(m.message);
  if (!m.key?.remoteJid || !m.key.id || !content) return null;
  const text = content.conversation ?? content.extendedTextMessage?.text ??
    content.imageMessage?.caption ?? content.videoMessage?.caption ?? content.documentMessage?.caption ?? '';
  const kind = content.audioMessage ? 'audio' : content.imageMessage ? 'image' : content.videoMessage ? 'video' :
    content.documentMessage ? 'document' : content.protocolMessage ? 'change' : text ? 'text' : 'other';
  return {chat:m.key.remoteJid,id:m.key.id,at:new Date(Number(m.messageTimestamp)*1000),
    direction:m.key.fromMe?'out':'in',kind,text,name:m.pushName || null};
}

async function pairOnly() {
  const dir = process.env.WA_SESSION_DIR || path.join(homedir(), '.pousada-whatsapp', 'session');
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const logger = pino({ level: 'silent' });
  let socket;
  let stopped = false;
  const start = () => {
    if (stopped) return;
    socket = makeSocket({ auth: state, logger, markOnlineOnConnect: false, syncFullHistory: false });
    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', update => {
      if (update.qr && process.stdout.isTTY) qr.generate(update.qr, { small: true });
      if (update.connection === 'open') console.log('WhatsApp conectado. Sessão salva em:', dir);
      if (update.connection === 'close' && !stopped) setTimeout(start, 3000);
    });
  };
  process.once('SIGINT', () => { stopped = true; socket?.end(undefined); });
  process.once('SIGTERM', () => { stopped = true; socket?.end(undefined); });
  start();
}

export async function main() {
  if (process.env.PAIR_ONLY === 'true') return pairOnly();
   {
  const crypto = vault(process.env.WORKER_DATA_KEY);
  if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL');
  const pool = new pg.Pool({connectionString:process.env.DATABASE_URL, max:3});
  const guard = await pool.connect();
  const locked = await guard.query("SELECT pg_try_advisory_lock(hashtext('pousada_whatsapp_worker')) AS ok");
  if (!locked.rows[0].ok) throw new Error('Outro worker já está ativo neste banco');
  await guard.query(schema);
  const dir = process.env.WA_SESSION_DIR || path.join(homedir(),'.pousada-whatsapp','session');
  await mkdir(dir,{recursive:true,mode:0o700});
  const {state,saveCreds} = await useMultiFileAuthState(dir);
  const logger = pino({level:'silent'});
  let attempts=0, stopping=false, timer, active, cancelWait, tasks=Promise.resolve(), credentials=Promise.resolve();
  const stop = async(code) => {
    if (stopping) return;
    stopping=true;
    clearTimeout(timer);
    cancelWait?.(false);
    active?.end(undefined);
    await Promise.allSettled([tasks,credentials]);
    guard.release();
    await pool.end();
    process.exitCode=code;
  };
  const fatal=()=>{console.error('Recepção interrompida. Verifique grupo, banco e sessão antes de reiniciar.');void stop(1)};
  guard.on('error',fatal);
  async function persist(event,live,group) {
    const db=await pool.connect();
    try {
      await db.query('BEGIN');
      await ingest(db,crypto,group,event,live);
      await db.query('COMMIT');
    } catch(err) {await db.query('ROLLBACK');throw err}
    finally {db.release()}
  }
  function connect() {
    if(stopping)return;
    const sock=makeSocket({auth:state,logger,markOnlineOnConnect:false,syncFullHistory:true});
    active=sock;
    let groupId, lookup, opened;
    const ready=new Promise(resolve=>{opened=resolve});
    cancelWait=opened;
    async function group() {
      if(!await ready) return null;
      lookup ??= sock.groupFetchAllParticipating().then(groups=>resolveGroup(groups,process.env.RESERVATION_GROUP_JID));
      groupId=await lookup;
      return groupId;
    }
    function queue(fn) {
      tasks=tasks.then(fn);
      tasks.catch(fatal);
    }
    function receive(messages,live) {
      queue(async()=>{
        const id=groupId || await group();
        if(!id)return;
        for(const message of messages){
          const event=unpack(message);
          if(event)await persist(event,live,id);
        }
      });
    }
    sock.ev.on('creds.update',()=>{credentials=credentials.then(saveCreds);credentials.catch(fatal)});
    sock.ev.on('messages.upsert',({messages,type})=>receive(messages,type==='notify'));
    sock.ev.on('messaging-history.set',({messages})=>receive(messages,false));
    // Edições e exclusões invalidam interpretações anteriores. Preservar como revisão,
    // sem liberar apartamento a partir de um evento isolado.
    const revision=(key,what,message)=>queue(async()=>{
      const target=groupId || await group();
      if(!target || key.remoteJid!==target)return;
      const change=message && normalizeMessageContent(message);
      const text=change?.conversation || change?.extendedTextMessage?.text || '';
      const payload=what+' '+text;
      const id='revision:'+crypto.digest(JSON.stringify([key.id || 'all',payload]));
      await persist({chat:target,id,at:new Date(),direction:key.fromMe?'out':'in',kind:'change',text:payload},false,target);
    });
    sock.ev.on('messages.update',updates=>{for(const {key,update} of updates)if('message' in update)revision(key,'revisar edição ou exclusão',update.message)});
    sock.ev.on('messages.delete',update=>{for(const key of update.keys || [{remoteJid:update.jid}])revision(key,'revisar exclusão')});
    sock.ev.on('connection.update',u=>{
      if(u.qr && process.stdout.isTTY)qr.generate(u.qr,{small:true});
      if(u.qr && !process.stdout.isTTY)console.warn('Pareamento requer um terminal privado interativo');
      if(u.connection==='open'){
        opened(true);
        void group().then(()=>{attempts=0;console.log('Grupo identificado. Recebimento ativo em simulação.')}).catch(fatal);
      }
      if(u.connection==='close'){
        opened(false);
        if(stopping || active!==sock)return;
        if(u.lastDisconnect?.error?.output?.statusCode===DisconnectReason.loggedOut){
          console.error('Sessão encerrada. Faça novo pareamento em diretório privado vazio.');void stop(1);return;
        }
        timer=setTimeout(connect,Math.min(60000,1000*2**Math.min(attempts++,6)));
      }
    });
  }
  process.once('SIGINT',()=>void stop(0));
  process.once('SIGTERM',()=>void stop(0));
  connect();
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch(err=>{console.error('Falha ao iniciar o worker:',err.code || err.name);process.exit(1)});
