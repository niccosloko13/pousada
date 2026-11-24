# Auditoria do atendimento da Pousada em Pedrinhas
24 de novembro de 2026 · branch de desenvolvimento `feat/whatsapp-autonomous-bot`

## Atendimento observado

O WhatsApp Business indicava 96 conversas não lidas na abertura. A caixa recebe anúncios do Facebook e do Instagram, mensagens espontâneas e contatos alheios a hospedagem. O contador, portanto, não mede oportunidades nem vendas. Foram abertos históricos de conversas lidas e não lidas. As mensagens temporárias, áudios sem transcrição e a sincronização do navegador limitam a reconstrução de algumas negociações. Não houve conciliação com pagamentos ou reservas reais. Os exemplos abaixo são anônimos e os valores ilustram divergências históricas.

| Situação observada | O que aconteceu | Como atender |
|---|---|---|
| Entrada por anúncio | A frase pré-preenchida de reserva chegou sem datas. Em um caso, o pedido veio às 12h19 e a pergunta sobre a data às 12h42. | Responder no primeiro contato e pedir só os dados faltantes. Tratar o clique como início de conversa. |
| Datas enviadas aos poucos | Uma pessoa informou entrada, saída e dois adultos em três mensagens. A equipe voltou a perguntar a saída. | Agrupar as mensagens próximas, atualizar a memória e reconhecer correções antes de cotar. |
| Datas flexíveis | Ao perguntar em que dia havia vaga, o hóspede recebeu um pedido de data. Em outro histórico, depois de saber que a virada estava lotada, a própria pessoa sugeriu o Natal. | Perguntar qual semana ou mês serve e quantas noites deseja. Pesquisar alternativas reais. |
| Preço do anúncio | Uma família questionou por que a proposta era maior que o preço anunciado. A recepção explicou que o valor do anúncio era para casal sem filhos. | Explicar ocupação, idades, período, preço total, café e, se aplicável, condições do pacote. |
| Pagamento | Após receber o total do Natal com café, um casal reagiu positivamente e perguntou o número de parcelas. A resposta explicou o sinal, mas deixou o parcelamento em aberto. | Responder à pergunta específica ou encaminhar à recepção com o contexto. Não deduzir parcelas. |
| Localização e confiança | Apareceram dúvidas sobre outra localidade com o mesmo nome, distância da praia, comércio, cozinha e acesso de van. Um interessado pediu o endereço para pesquisar e recebeu orientação sobre o canal de contato. | Dar o endereço cadastrado, o mapa e uma resposta específica sobre o acesso. Validar distâncias, cozinha da unidade e condições para vans. |
| Mídia | Houve pedido de foto de quarto e envios em álbum, incluindo um conjunto de 10 fotos e 1 vídeo e outro de 25 fotos. | Associar fotos autorizadas à acomodação cotada, legendar e enviar primeiro o que a pessoa pediu. |
| Chegada e saída | Depois da cotação, um hóspede perguntou a que horas poderia entrar e até quando poderia ficar. | Vincular horários ao período e diferenciar regra geral de exceção autorizada. |

**Intenção e resultado.** Datas exatas com ocupação, retorno espontâneo, busca de outra data e pergunta de parcelamento após o orçamento são sinais de avanço. A resposta curta sobre lotação levou uma pessoa a explorar o Natal. Isso comprova continuidade do diálogo. Para atribuir conversão, vincular a negociação ao ID de uma reserva confirmada. Respostas sem retorno visível devem ficar como “aguardando hóspede”, sem baixa automática por perda. Não há evidência suficiente para atribuir causalmente mais vendas a uma frase da equipe.

## Cobertura e contagem

A lista foi percorrida até o fim carregado no WhatsApp Web. A contagem sistemática registrou 145 conversas distintas abertas, selecionadas por indícios comerciais na prévia e identificador distinguível na interface. Contatos com nome salvo ou prévias genéricas podem ter ficado de fora. Conversas lidas manualmente não foram somadas em separado, para evitar duplicação. Em 20 das 145 foi identificado o aviso inicial de criptografia. Nas demais foi examinado o histórico carregado, com busca de mensagens anteriores. Não foi possível atestar a integralidade desde o primeiro contato em todas. Nenhuma mensagem foi enviada. Abrir não lidas pode tê-las marcado como lidas, efeito autorizado durante a auditoria.

| Tema presente no histórico | Conversas entre as 145 |
|---|---:|
| Preço, diária ou valor | 107 |
| Datas, período ou horários de estadia | 97 |
| Casal, adultos, crianças ou quantidade de pessoas | 84 |
| Fotos, vídeo ou álbum | 32 |
| Endereço, localização ou proximidade | 28 |
| Sinal, parcelas ou pagamento | 11 |

Contagem por ocorrência textual nas mensagens do hóspede e da equipe, inclusive saudação automática. Uma conversa pode aparecer em várias linhas. Os números medem temas presentes. Para identificar perguntas dos hóspedes, foram lidos os diálogos e o encadeamento das respostas, descritos na tabela qualitativa. Os números não medem pedidos de orçamento, intenção de compra, perdas ou conversões.

## O que o sistema já suporta

- O JSON descreve nove apartamentos e uma casa, comodidades, café, mapa e imagens. O seed faz upsert por slug e pode sobrescrever tarifas e metadados. Não executar o seed para inicializar o bot.
- Prisma e PostgreSQL modelam quartos ativos, capacidades, bloqueios, reservas por canal, cobrança e estados de pagamento. O cliente exige e-mail único. Um interessado no WhatsApp deve existir independentemente de um cadastro de hóspede.
- A página app/reserva/page.tsx já combina unidades ativas, capacidade, datas e valor. O motor de reservas já tem checkAvailability, computeStayPricing e regras da casa. A verificação considera bloqueios e estados pendente de pagamento, confirmado e hospedado. A criação do hold revalida sob trava por quarto e abre uma cobrança. O bot deve usar consulta de leitura na cotação e o fluxo de reserva existente somente após decisão do hóspede.
- A rota de importação do Booking existe. A presença de código não demonstra sincronização ativa nem cobertura das vendas no balcão e por WhatsApp. Confirmar qual calendário a equipe atualiza antes de oferecer vagas.
- A confirmação do Mercado Pago consulta o provedor. Vincular o atendimento ao status persistido. Uma foto de comprovante ou a frase “já paguei” deve iniciar verificação.
- O seed possui uma credencial administrativa padrão de desenvolvimento na ausência de configuração. Validar a configuração de implantação e o processo de seed antes de qualquer operação em produção.

## Regras confirmadas para o atendimento por WhatsApp

A diária do casal é R$ 350 e crianças de até 6 anos não pagam. Informar o sinal confirmado de 40% quando o hóspede perguntar sobre a reserva. Conduzir o atendimento pelo WhatsApp, sem orientar o hóspede a pagar no site. Consultar o calendário antes de oferecer vaga. Confirmar com a recepção o valor de grupos, pacotes de feriado e crianças a partir de 7 anos quando a tarifa aplicável não estiver definida.


Para a virada de 2026 para 2027, a recepção confirmou lotação nos dias 30 e 31 de dezembro e 1 e 2 de janeiro. Se a estadia incluir uma dessas noites, explicar a lotação e perguntar qual outra data serve. Consultar disponibilidade antes de oferecer outro período.

Quando a pessoa pedir fotos, enviar as imagens oficiais como mídia na conversa, escolhendo o quarto e os ambientes correspondentes. Quando enviar áudio, transcrever antes de responder. Em caso de trecho inaudível, pedir confirmação apenas desse trecho.

## Decisões comerciais pendentes

| Tema | Evidência | Decisão necessária |
|---|---|---|
| Sinal e saldo | Foram observados sinais de 30% e 40%. O checkout calculava 50% na data da auditoria. | A pousada confirmou sinal de 40% para novas reservas em 24/11/2026. O saldo é de 60%. Parcelas e meios aceitos ainda dependem de validação. |
| Tarifa | O catálogo registra R$ 135 de base para casal. O atendimento mencionou diária a partir de R$ 350 e pacotes específicos de fim de ano. | Diária do casal confirmada em R$ 350. Definir exceções por data, unidade, ocupação e validade da cotação. |
| Horários | Em uma negociação a recepção informou entrada às 12h e saída às 16h. O motor usa 15h e 11h para o intervalo de reserva. | Definir horários de hospedagem, exceções e fuso oficial. |
| Crianças e grupos | A página de reserva apresenta 0–6 grátis, 7–12 meia e 13+ adulto. O cálculo da casa cobra por pessoa, inclusive crianças. A casa tem regra de 10 pessoas e duas noites no mínimo, R$ 100 por pessoa/noite no código. | Aprovar faixas etárias, lotações e condições de grupo por temporada. |
| Estrutura e acesso | A recepção aceitou van num caso. Houve dúvidas sobre cozinha e proximidade de serviços. | Confirmar porte, estacionamento, cozinha por unidade, acervo de mídia e informações de acesso. |

A política de cancelamento do site admite remarcação, crédito, devolução ou retenção conforme o caso. Definir prazos e percentuais antes de responder automaticamente a um pedido de cancelamento.

## Arquitetura e primeiro módulo

1. **Cotação assistida, somente leitura.** Receber período, adultos e idades. Validar datas e capacidade. Reaproveitar o motor de disponibilidade, preços e regras aprovadas. Retornar opções, inclusões, mídia, total e validade, ou a pergunta faltante, ou encaminhamento humano. Usar esse módulo antes de habilitar qualquer envio.
2. **Memória e interpretação.** Agrupar mensagens consecutivas, extrair intenção e fatos, atualizar apenas campos fornecidos ou corrigidos, registrar o estado e pedir um dado por vez. A IA redige com fatos estruturados. Valores, descontos, disponibilidade e confirmação vêm das ferramentas. Dúvida sem fonte vira atendimento humano, com pausa do robô.
3. **Transporte separado.** Worker Node único para Baileys, pareamento por QR em terminal privado, sessão persistente com acesso restrito e chaves fora do Git e dos logs. Tratar reconexão transitória com espera crescente e solicitar novo pareamento após logout. Identificar mensagens por ID e proteger reprocessamento, envios duplicados, mensagens próprias e histórico antigo.
4. **PostgreSQL existente.** Registros separados de conversa, mensagens, estado extraído e vínculo opcional de reserva. ID de contato protegido, retenção definida pela pousada, acesso administrativo restrito e ausência de conteúdo bruto em logs. Não copiar histórico pessoal para o repositório nem encaminhar dados desnecessários ao provedor de IA.
5. **Supervisão no Next.js existente.** Acompanhar pedidos novos, cotações, intenções fortes, pendências humanas e reservas confirmadas. Medir tempo até primeira resposta, propostas por conversa e reservas confirmadas por proposta com janela definida.
6. **Hospedagem.** Para piloto, Railway com um serviço persistente, suspensão desativada, reinício e volume para sessão. Hobby tem mínimo de US$ 5/mês, Pro US$ 20/mês, com excedente por consumo. Como alternativa, VPS DigitalOcean de 1 GiB por US$ 6/mês ou 2 GiB por US$ 12/mês, disco persistente e reinício via systemd. A VPS exige atualização, monitoramento e backup pela equipe. Estimativas excluem IA, impostos, câmbio, backup e eventual uso adicional do PostgreSQL. Manter o site na Vercel. Baileys é independente do WhatsApp, exige teste em número de homologação e plano de atendimento humano para desconexão ou restrição da conta.
7. **Aceite de homologação.** Usar conversas fictícias baseadas nos padrões observados. Verificar mensagens em fragmentos, correção de data, valor sazonal sem tabela, lotação com alternativa, indisponibilidade do banco, comprovante pendente, entrega duplicada, reinício com credenciais válidas e logout. Nenhum teste deve contactar hóspedes.

Fontes técnicas consultadas na branch: `data/pousada.json`, `prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts`, `lib/reservations/{engine,pricing,businessRules}.ts`, rotas de hold, pagamentos, webhook e importação do Booking.

Referências de operação: [Railway](https://railway.com/pricing), [volumes](https://docs.railway.com/volumes), [reinício](https://docs.railway.com/deployments/restart-policy), [DigitalOcean](https://www.digitalocean.com/pricing/droplets), [Baileys](https://github.com/WhiskeySockets/Baileys).
