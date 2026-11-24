# Atendimento da Pousada em Pedrinhas

Primeiro módulo em modo de observação. Em uma sessão pareada, o worker recebe eventos, grava mensagens e produz rascunhos locais. A recepção continua responsável pelos envios e pelas confirmações.

## Windows e homologação

Use Node 22.12 ou superior. Em PowerShell, dentro de `worker`:

```powershell
npm ci
npm test
npm run simulate
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Coloque a chave em WORKER_DATA_KEY e a conexão do PostgreSQL de homologação em DATABASE_URL. Preserve a chave junto aos segredos da implantação. O worker cria somente as tabelas em pousada_bot. Use uma conta com permissão de criar esse esquema e ler o inventário existente para usar a consulta. Use TLS para conexões remotas.

Rode `npm start` num terminal interativo privado. O QR é mostrado apenas em terminal interativo. Em Aparelhos conectados, vincule a conta de homologação. O diretório padrão de sessão fica em .pousada-whatsapp/session no perfil do usuário. Proteja essa pasta por permissões da conta Windows e criptografia do disco. Para o piloto, as credenciais Baileys ficam em arquivos locais. Ao mover para hospedagem persistente, configure WA_SESSION_DIR em volume privado, valide a restauração e use um único processo por conta.

## O que acompanhar

O grupo é identificado pelo nome exato Reserva pousada, ignorando maiúsculas e acentos. Nomes duplicados exigem o ID em RESERVATION_GROUP_JID. O worker ignora grupos diferentes e canais. Importa a parte do histórico fornecida pelo WhatsApp, incluindo respostas humanas. Histórico importado não gera envio nem rascunho retroativo. Textos, nomes disponíveis, legendas e rascunhos são cifrados. Identificadores de conversa e mensagem são pseudonimizados. Mídia registra o tipo e a legenda disponível nesta etapa. Uma conversa pode aparecer sob identificadores distintos de dispositivo ou LID até a reconciliação de identidade.

Registros do grupo, inclusive alterações, ficam pendentes de conferência. Uma anotação de datas pode ser uma consulta ou uma reserva já alterada. Datas incompletas e mensagens divididas entre várias pessoas requerem leitura no grupo. O worker não interpreta silêncio, falha de sincronização ou ausência de mensagem como quarto livre.

Para cruzar os lançamentos com bloqueios e reservas do sistema existente:

```powershell
npm run calendar -- 2026-12-30 2027-01-02
```

O comando retorna conflitos e notas para a recepção verificar. A lotação informada de 30/12/2026 até 02/01/2027 inclui a noite do dia 2. Uma reserva que termina no dia 3 pode bloquear uma acomodação além desse período.

Os rascunhos usam regras explícitas e consultam o histórico recente. Áudios ficam aguardando transcrição, fotos aguardam anexo e o pagamento exige conferência no sistema. O painel, o mecanismo de IA para diálogo livre, a reconciliação do histórico anterior, a transcrição e os envios de mídia ainda são etapas seguintes. A duração da sessão e a entrega em tempo real dependem do WhatsApp, da conexão e do banco.
