import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {randomBytes} from 'node:crypto';
import {bookingNote,dateRange,draftFor,quoteCouple,resolveGroup} from './policy.mjs';
import {ingest,bookingWarnings,schema,vault} from './storage.mjs';
import {unpack} from './worker.mjs';

const at=new Date('2026-11-24T16:00:00Z');
const guest={chat:'test@s.whatsapp.net',id:'fake-1',direction:'in',kind:'text',text:'Aceita pet?',at};
const group='test@g.us';

test('cotação autorizada, idade indefinida e inclusão de crianças',()=>{
  assert.deepEqual(quoteCouple(6,[8,12]),{nightly:700,total:4200,deposit:1680});
  assert.equal(quoteCouple(1,[6]).total,350);
  assert.equal(quoteCouple(1,[7]),null);
  assert.equal(quoteCouple(1,[13]),null);
});
test('lotação de fim de ano, datas inválidas, consulta e cancelamento',()=>{
  assert.deepEqual(dateRange('28/12 a 02/01',at),{start:'2026-12-28',end:'2027-01-02'});
  assert.equal(dateRange('31/02 a 04/03',at),null);
  assert.match(draftFor({...guest,text:'30/12 a 02/01'}).text,/lotados/);
  assert.equal(draftFor({...guest,text:'03/01/2027 a 08/01/2027'}).state,'review');
  assert.match(bookingNote('Cancelou apto 05',at,'text').reason,/alteração/);
});
test('grupo sem ambiguidade e apenas pet pequeno',()=>{
  const groups={a:{subject:'Reserva pousada',id:group},b:{subject:'Reserva pousada',id:'other@g.us'}};
  assert.throws(()=>resolveGroup(groups),/duplicado/);
  assert.equal(resolveGroup(groups,group),group);
  assert.match(draftFor({...guest,text:'Pode vir um husky?'}).text,/apenas pets de pequeno porte/);
  assert.match(draftFor({...guest,kind:'audio',text:''}).text,/Transcrever/);
});
test('evento Baileys realista e conexão PostgreSQL compatível em memória',async()=>{
  const message=unpack({key:{id:'fake-1',remoteJid:guest.chat},messageTimestamp:at.getTime()/1000,
    message:{extendedTextMessage:{text:'Aceita pet?'}}});
  const db=new PGlite(), crypto=vault(randomBytes(32).toString('base64'));
  try {
    await db.exec(schema);
    const save=(e,live=true)=>db.transaction(tx=>ingest(tx,crypto,group,e,live));
    assert.equal(await save(message),'draft');
    assert.equal(await save(message),'duplicate');
    assert.equal(await save({...guest,id:'old'},false),'history');
    assert.equal(await save({...guest,id:'staff',direction:'out'}),'history');
    assert.equal(await save({...guest,chat:'unrelated@g.us'}),'ignored');
    assert.equal(await save({...guest,chat:group,text:'28/12 a 02/01 apto 05'}),'booking_note');
    assert.equal(await save({...guest,chat:group,id:'change',kind:'change',text:'revisar exclusão'}),'booking_note');
    const notes=await bookingWarnings(db,'2026-12-29','2027-01-01');
    assert.equal(notes.length,2);assert.equal(notes[0].unit,'05');
    const saved=(await db.query('SELECT * FROM pousada_bot.messages WHERE message_id=$1 AND stream=$2',[crypto.digest('fake-1'),'guest'])).rows[0];
    assert.notEqual(saved.chat_key,guest.chat);
    assert.equal(crypto.open(saved.payload).text,'Aceita pet?');
    assert.equal((await db.query('SELECT * FROM pousada_bot.drafts')).rows.length,1);
  } finally {await db.close()}
});

test('restaura credenciais de sessão após reiniciar o armazenamento local',async()=>{
  const {useMultiFileAuthState}=await import('@whiskeysockets/baileys');
  const {mkdtemp,rm}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');
  const {join}=await import('node:path');
  const dir=await mkdtemp(join(tmpdir(),'pousada-auth-'));
  try {
    const first=await useMultiFileAuthState(dir);
    await first.saveCreds();
    const restored=await useMultiFileAuthState(dir);
    assert.deepEqual(restored.state.creds.noiseKey.public,first.state.creds.noiseKey.public);
    assert.equal(restored.state.creds.registrationId,first.state.creds.registrationId);
  } finally {await rm(dir,{recursive:true,force:true})}
});
