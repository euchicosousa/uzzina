# DS08 — Criar página inicial institucional da UZZINA

**Status.** Encerrado pelo proprietário em 13/11/2026 sem implementação. Não é uma necessidade agora e os rascunhos não comunicaram bem o app. A rota `/` permanece como estava; os rascunhos da branch `proposal/ds08-landing` foram descartados. O registro abaixo é histórico.

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para montar e conferir a página responsiva com os componentes do projeto.
- **Anthropic** — Claude Sonnet 5.5, para estruturar a apresentação institucional e revisar a navegação.
- **Google** — Gemini 3.8 Flash, para implementar a página e conferir o layout e os links em desktop e celular.

**Entrega.** Transformar a rota `/` em uma apresentação institucional da UZZINA. A abertura apresenta o app de gestão da Agência CNVT. Depois entram duas seções, uma sobre o serviço de links e outra sobre a agência.

**Estudo de 13/11/2026.** Levantamento e proposta em [docs/audits/2026-11-13-ds08-landing-study.md](../../../docs/audits/2026-11-13-ds08-landing-study.md). Achado principal: `cnvt.link` hoje abre o mesmo site da agência, então não há destino próprio para o serviço de links. Aguarda o proprietário decidir o serviço de links, os textos, o material de marca e o tamanho da página. Nenhum código alterado.

**Rascunho de 13/11/2026 (segunda versão).** O proprietário achou que a primeira versão "não mudou muita coisa" e pediu uma landing page de fato. A rota `/` foi refeita na branch `proposal/ds08-landing` (sem commit): abertura "Da ideia ao post publicado." com botões Entrar e Ver como funciona e, ao lado, um cartão de ação fictício que avança sozinho pelas seis fases reais (para no lugar com movimento reduzido); seção das seis fases; três seções com exemplos visuais (calendário da semana, opções de estratégia da IA, portal do cliente com comentário); "Também da Agência CNVT" com LINK e CNVT; rodapé com o letreiro UZZINA. Todos os textos e exemplos são provisórios e fictícios, sinalizados por uma faixa no topo. Fonte Object Sans, imagem de prévia e peso da página continuam pendentes de decisão.

**Terceira versão (13/11/2026).** O proprietário pediu vender a organização e os recursos extras, não o quadro de fases: IA como agentes especialistas treinados em copy que converte, acesso fácil do cliente e trabalho além de rede social. A página passou a ter: abertura "A agência inteira, organizada." com cartões de Carrossel, Tráfego Pago e Gravação avançando pelas fases; "Não é só rede social" com os tipos de trabalho reais do app por área; faixa escura dos agentes (Estrategista, Redator por formato, Legenda, Leitor de arquivos) com o método CNVT, contexto da marca e modelos de última geração; organização do dia a dia (fases, Hoje, Sprint, calendário, vários responsáveis, datas comemorativas, busca e comandos); atalhos de teclado reais; portal com login e link de revisão sem cadastro; LINK e CNVT. Os textos descrevem recursos existentes no código; nomes de modelos e de fornecedores ficaram de fora (decisão do IA-M09). O fundo cheio da fase no cartão virou o [DS17](17-vivid-phase-color-cards.md).

**Dependência atendida.** A paleta pública Ônix foi aprovada no [ticket de paleta pública](07-public-palette.md) em 10/11/2026 e já está em produção.

## Aceite

- [ ] Apresentar o que é a UZZINA e dar contexto aos dois serviços relacionados. Usar tom de apresentação, com texto curto e composição institucional.
- [ ] Preservar o acesso à UZZINA e os destinos atuais do serviço de links e da Agência CNVT. Conferir rótulos e links na rota existente.
- [ ] Aplicar a paleta pública de DS07, conferir leitura, hierarquia, teclado e navegação em celular e desktop.
- [ ] Validar com o proprietário texto e material de marca que entrem na versão final. A descrição atual e os destinos da página servem de base para o rascunho.
