import {createCipheriv, createDecipheriv, createHmac, randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {bookingNote, draftFor} from './policy.mjs';

export const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');

export function vault(secret) {
  const key = Buffer.from(secret || '', 'base64');
  if (key.length !== 32) throw new Error('WORKER_DATA_KEY deve conter 32 bytes em base64');
  const digest = value => createHmac('sha256', key).update(value).digest('hex');
  return {
    digest,
    seal(value) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
    },
    open(value) {
      const data = Buffer.from(value, 'base64');
      const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(0,12));
      decipher.setAuthTag(data.subarray(12,28));
      return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString());
    }
  };
}

// Chamador fornece uma transação. Uma falha reverte mensagem, pendência e rascunho juntos.
export async function ingest(tx, crypto, group, event, live) {
  const stream = event.chat === group ? 'bookings' : /@(s\.whatsapp\.net|lid)$/.test(event.chat) ? 'guest' : null;
  if (!stream || !event.id || !event.at || !Number.isFinite(event.at.getTime())) return 'ignored';
  const chat = crypto.digest(event.chat), id = crypto.digest(event.id);
  const encrypted = crypto.seal({kind:event.kind, text:event.text, name:event.name});
  const saved = await tx.query(
    'INSERT INTO pousada_bot.messages VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING RETURNING message_id',
    [chat, id, stream, event.direction, event.at, encrypted]);
  if (!saved.rows.length) return 'duplicate';
  if (stream === 'bookings') {
    const note = bookingNote(event.text, event.at, event.kind);
    await tx.query('INSERT INTO pousada_bot.booking_notes VALUES ($1,$2,$3,$4,$5,$6)',
      [chat,id,note.range?.start ?? null,note.range?.end ?? null,note.unit,note.reason]);
    return 'booking_note';
  }
  if (!live || event.direction !== 'in') return 'history';
  const previous = await tx.query(
    'SELECT payload,direction FROM pousada_bot.messages WHERE chat_key=$1 AND message_id<>$2 AND occurred_at<=$3 ORDER BY occurred_at DESC,message_id DESC LIMIT 12',
    [chat,id,event.at]);
  const context = previous.rows.reverse().map(r=>({...crypto.open(r.payload),direction:r.direction}));
  const draft = draftFor(event,context);
  await tx.query('INSERT INTO pousada_bot.drafts VALUES ($1,$2,$3,$4)',[chat,id,crypto.seal(draft.text),draft.state]);
  return draft.state;
}

export async function bookingWarnings(db,start,end) {
  const result = await db.query(
    'SELECT starts_on,ends_on,unit,review_reason FROM pousada_bot.booking_notes WHERE starts_on IS NULL OR (starts_on<$2::date AND ends_on>$1::date) ORDER BY starts_on NULLS LAST',
    [start,end]);
  return result.rows;
}
