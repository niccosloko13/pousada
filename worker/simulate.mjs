import {draftFor,quoteCouple} from './policy.mjs';
const text=process.argv.slice(2).join(' ') || 'Aceita pet? É um husky de porte grande';
console.log(draftFor({text,kind:'text',at:new Date()}));
console.log('Exemplo da família, seis noites e crianças de 8 e 12 anos:',quoteCouple(6,[8,12]));
