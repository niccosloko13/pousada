import pg from 'pg';
import {bookingWarnings} from './storage.mjs';
import {policy} from './policy.mjs';

const [start,end]=process.argv.slice(2);
function valid(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const d=new Date(s+'T00:00:00Z');
  return Number.isFinite(+d) && d.toISOString().startsWith(s);
}
if (!valid(start) || !valid(end) || start>=end || !process.env.DATABASE_URL) {
  console.error('Informe DATABASE_URL e datas válidas: npm run calendar -- AAAA-MM-DD AAAA-MM-DD');
  process.exitCode=1;
} else {
  const db=new pg.Client({connectionString:process.env.DATABASE_URL});
  try {
    await db.connect();
    await db.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const notes=await bookingWarnings(db,start,end);
    const conflicts=await db.query(`
      SELECT DISTINCT r.slug FROM "Room" r
      WHERE r."isActive" AND (
        EXISTS (SELECT 1 FROM "Reservation" s WHERE s."roomId"=r.id
          AND (s.status IN ('CONFIRMED','CHECKED_IN') OR
            (s.status='PENDING_PAYMENT' AND (s."expiresAt" IS NULL OR s."expiresAt">CURRENT_TIMESTAMP)))
          AND s."checkinAt" < ($2::date + time '15:00') AND s."checkoutAt" > ($1::date + time '13:00'))
        OR EXISTS (SELECT 1 FROM "BlockedDate" b WHERE b."roomId"=r.id
          AND b."startDate" < ($2::date + time '15:00') AND b."endDate" > ($1::date + time '13:00')))
      ORDER BY r.slug`,[start,end]);
    await db.query('COMMIT');
    console.log(JSON.stringify({periodo:[start,end],lotacaoConfirmada:start<policy.soldOutEndExclusive && end>policy.soldOutStart,
      unidadesComConflitoNoSite:conflicts.rows.map(r=>r.slug),registrosDoGrupoParaConferir:notes,
      conclusao:'Conferir registros, horários e alterações antes de confirmar uma vaga'},null,2));
  } catch(err) {console.error('Consulta indisponível:',err.code || err.name);process.exitCode=1}
  finally {await db.end()}
}
