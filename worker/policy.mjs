export const policy = Object.freeze({
  coupleNight: 350, childNight: 175, depositPercent: 40,
  checkin: '13h', checkout: '15h', groupName: 'Reserva pousada',
  soldOutStart: '2026-12-30', soldOutEndExclusive: '2027-01-03'
});

export function quoteCouple(nights, childAges) {
  if (!Number.isSafeInteger(nights) || nights < 1 || !Array.isArray(childAges)) return null;
  let nightly = policy.coupleNight;
  for (const age of childAges) {
    if (!Number.isInteger(age) || age < 0 || age === 7 || age > 12) return null;
    if (age >= 8) nightly += policy.childNight;
  }
  const total = nightly * nights;
  return { nightly, total, deposit: total * policy.depositPercent / 100 };
}

export function normalize(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function resolveGroup(groups, configuredId) {
  const matches = Object.values(groups).filter(g => normalize(g.subject ?? '') === normalize(policy.groupName));
  const group = configuredId ? matches.find(g => g.id === configuredId) : matches.length === 1 && matches[0];
  if (!group) throw new Error('Grupo Reserva pousada ausente, duplicado ou ID divergente');
  return group.id;
}

export function dateRange(text, timestamp) {
  const tickets = [...text.matchAll(/\b(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(20\d{2}))?(?![\d/])/g)];
  if (tickets.length !== 2) return null;
  const local = new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Sao_Paulo'}).format(timestamp);
  const startMonth = Number(tickets[0][2]);
  const startYear = Number(tickets[0][3] || local.slice(0,4));
  const parts = tickets.map(([, day, month, year], i) => {
    const y = Number(year || startYear + Number(i === 1 && Number(month) < startMonth));
    const iso = [y, month.padStart(2,'0'), day.padStart(2,'0')].join('-');
    const ms = Date.parse(iso+'T00:00:00Z');
    return Number.isFinite(ms) && new Date(ms).toISOString().slice(0,10) === iso ? iso : null;
  });
  if (!parts[0] || !parts[1] || parts[0] >= parts[1]) return null;
  // Um mês anterior ao da mensagem pode pertencer ao próximo ano. Requer confirmação.
  if (!tickets[0][3] && startMonth < Number(local.slice(5,7))) return null;
  return {start:parts[0], end:parts[1]};
}

export function bookingNote(text, timestamp, kind) {
  const range = dateRange(text, timestamp);
  const units = [...text.matchAll(/\b(?:apto|apartamento)\s*(\d{1,2})\b/gi)];
  const unit = units.length === 1 ? units[0][1].padStart(2, '0') : null;
  let reason = 'validar registro da recepção';
  if (kind !== 'text') reason = 'revisar mídia ou alteração';
  else if (/cancel|remarc|mudou|alter/i.test(text)) reason = 'reconciliar alteração com a reserva anterior';
  else if (!range || !unit) reason = 'conferir período e unidade no contexto do grupo';
  return {range, unit, reason};
}

export function draftFor(current, previous = []) {
  const s = normalize(current.text);
  const incoming = previous.filter(e => e.direction === 'in');
  const relevant = [...incoming.slice(-5), current];
  const range = dateRange(current.text, current.at);
  const review = (text) => ({state:'review', text});
  const draft = (text) => ({state:'draft', text});
  if (current.kind === 'audio') return review('Transcrever o áudio antes de responder');
  if (current.kind !== 'text') return review('Conferir a mídia recebida');
  if (/pag(uei|amento aprovado)|comprovante|cancelar|estorno/.test(s)) return review('Conferir a reserva e o pagamento no sistema');
  if (/\bpet\b|cachorr|husky|porte grande/.test(s)) {
    if (/grande|medio|husky/.test(s)) return draft('Aqui na pousada aceitamos apenas pets de pequeno porte');
    return draft('Aceitamos pets de pequeno porte 😊');
  }
  if (range && range.start < policy.soldOutEndExclusive && range.end > policy.soldOutStart)
    return draft('Já estamos lotados nesse período da virada 😊 Outra data serviria para vocês?');
  if (/horario|que hora|check.?in|check.?out/.test(s))
    return draft('A entrada é a partir das 13h e a saída é às 15h 😊');
  if (/foto|imagem/.test(s)) return review('Anexar a galeria e as fotos da acomodação diretamente no WhatsApp');
  if (/sinal|entrada.*porcent|porcentagem/.test(s))
    return draft('O sinal da reserva é de 40% e o saldo é pago na entrada');
  if (/parcela|desconto|taxa|feriado|pacote/.test(s)) return review('Conferir a condição comercial para essa estadia');
  if (/diaria|valor|quanto custa/.test(s) && /casal/.test(s) && !/crianc|filh|pet|natal|virada|reveillon|\d/.test(s))
    return draft('A diária do casal é R$ 350 com café da manhã 😊');
  if (relevant.some(e => /\d/.test(e.text))) return review('Conferir datas, ocupação e informações já fornecidas antes da cotação');
  return review('Ler o contexto da conversa e consultar o calendário da recepção');
}
