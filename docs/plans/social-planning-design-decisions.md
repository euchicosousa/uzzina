# Planejamento — decisões de interface e escopo

Registrado em 01/11/2026 após avaliação do mockup pelo proprietário. Referências: [mockup e limites](social-planning-mockup.md) e [divisão dos tickets](social-planning-ticket-breakdown.md).

## Revisão do proprietário — 19/11/2026

Esta seção é a referência vigente para a retomada. As anotações anteriores abaixo registram as rodadas em que foram escritas. A prévia da Mesa recebeu aceite visual do proprietário. A série de recuperação continua em espera.

### Ajustes após conferir o Planejamento

- **Parceiro.** Usar o seletor de parceiros existente ao lado do título Planejamento. Escolha única com avatar e nome, sem rótulo visual acima. O endereço da Mesa acompanha a seleção e conserva as guardas de saída.
- **Período.** Limite aprovado de 60 dias civis, contando início e fim. A bancada compara atalhos Semana, 15 dias, Mês e 2 meses, ancorados no domingo da semana de referência. Em 19/11 a Semana é 15–21/11. Para testar, Mês usa 30 dias e 2 meses usa 60. Confirmar essas durações e a posição dos atalhos junto ao calendário pequeno do Prism. A seleção manual continua disponível.
- **Dias preferidos.** A frequência e o número de dias marcados são independentes. Sete publicações podem ocupar só segunda, quarta e sexta, distribuídas como 3/2/2. Ao trocar a frequência, manter os dias marcados e recalcular. A bancada dá a sobra ao primeiro dia preferido no exemplo 7/3 e corta os dias que ficam fora de semanas parciais. Confirmar esses detalhes.
- **Formatos.** Automático começa equilibrado. Em Definir quantidades, três sliders mostram as quantidades reais, sem pedir que a pessoa feche a soma. Estático, Carrossel e Reels têm essa ordem de prioridade. Ao reduzir Reels de 8 para 4, a bancada soma 3 Estáticos e 1 Carrossel. Ao aumentar um formato, os demais cedem, com maior redução no de menor prioridade quando há quantidade suficiente. Conferir arredondamento e comportamento no sentido inverso.
- **Prévia e direcionamento.** Por período, mostrar os placeholders e seus formatos no calendário lateral antes de gerar. Por tema, seis conteúdos exibem seis placeholders na lista, por exemplo 2/2/2 em automático e 3/2/1 após ajuste. Direcionamento obrigatório nos dois modos. O preenchimento pelo cadastro do parceiro continua na etapa do Direcionamento.
- **Comemorações.** O proprietário aprovou a apresentação e a lista filtrada pelo período. Conservar o controle existente. Nesta rodada, a bancada verifica os conteúdos regulares. O modo de combinar extras da própria proposta continua em discussão.

Na `main` local, a Mesa reaproveita o seletor de parceiros no cabeçalho, impede selecionar intervalos superiores a 60 dias no próprio calendário e exige Direcionamento. A frequência usa dias preferidos, os sliders preservam a soma e a prévia de lista ou calendário reage antes de gerar. Na prévia do calendário, os conteúdos aparecem em espaços quadrados com ícones dos formatos, borda com 50% e fundo com 10% da cor da categoria. O layout e os nomes dos atalhos seguem em estudo na bancada.

| Ponto                               | Definido                                                                                                                                                                                                                                                                                                                  | A fechar                                                                                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 · Acesso                         | Somente administradores ativos podem ver entradas, acessar a Mesa, ler, salvar, editar, aprovar, gerar e finalizar. Ocultar no menu do cabeçalho, na busca e na página do parceiro. URL direta, servidor e banco aplicam a mesma regra.                                                                                   | Verificar as fronteiras em ambiente isolado.                                                                                                                                                                             |
| D2 · Frequência e quantidade        | No modo calendário, dias são preferidos e independentes da quantidade por semana. O calendário inicia no domingo e a seleção tem até 60 dias. A prévia lateral enquadra o período e mostra os espaços calculados. Na quantidade fechada, mostra uma lista.                                                                | Arredondamento de uma semana parcial, ordem de sobras, duração exata dos atalhos e se também existe total fixo dentro de um intervalo.                                                                                   |
| D3 · Composição                     | Em automático, equilibrar formatos. No ajuste de quantidades, Estático, Carrossel e Reels têm sliders ligados e prioridade nessa ordem. Lista e calendário atualizam os placeholders. O total permanece fixo enquanto só a composição muda.                                                                               | Arredondamento e comportamento ao aumentar um formato, ordem dos formatos na prévia e regra dos extras.                                                                                                                  |
| D4 · Isolamento de ações existentes | O Planejamento tem acesso ao parceiro e às suas instruções, propostas e datas comemorativas selecionadas. O fluxo não consulta, exibe nem usa ações existentes para calcular, gerar, deduplicar ou finalizar. Uma ação já presente em um dia não impede uma nova. O admin decide o que fica pela aprovação das sugestões. | Efeito de uma comemoração sobre um dia regular da própria proposta e agrupamento de duas comemorações na mesma data.                                                                                                     |
| D5 · Data das ideias                | Decisão do proprietário em 19/11: toda sugestão tem data. Ideia gerada sem dia (Por tema) recebe a data do dia em que foi gerada. O admin organiza depois e pode definir outra data no editor da sugestão; sem escolha, permanece a data de hoje. Datas já escolhidas são preservadas e toda ação criada sai com data.    | Fuso e hora usados na ação criada, o que acontece com propostas antigas salvas sem data e como a confirmação apresenta aprovadas e pendentes.                                                                            |
| D6 · Direcionamento                 | O Direcionamento é obrigatório na geração. Vem da configuração do parceiro e pode ser alterado na solicitação. Contexto é opcional. A entrada efetiva é a versão usada para aquela proposta. O cadastro do parceiro oferece o direcionamento reutilizável.                                                                | Confirmar os campos de saída ainda em aberto e a mensagem quando o parceiro não tem direcionamento salvo. Proposta: permitir preencher na Mesa e guardar o texto na proposta, com alteração permanente só pelo cadastro. |

### Nome da proposta — ajuste futuro

O proprietário pediu que a IA retorne um nome curto para identificar cada planejamento. O nome será salvo com a proposta e exibido em Propostas salvas em vez do rótulo genérico Por tema ou Por período. O modo continua sendo dado da proposta. Para propostas antigas sem nome, a lista pode manter o rótulo atual. O pedido foi registrado para uma revisão posterior.

### Bancada antes de reescrever a Mesa

A [bancada interativa da Mesa](../../.scratch/social-planning-recovery/prototype/mesa-planejamento.html) está disponível no checkout local. Abre offline, com dados fictícios, e permite comparar opções de interação para os atalhos e regras ainda em discussão.

- **Cenas atuais.** Subir a frequência sem mudar os dias preferidos, distribuir 7 em 3 dias e ajustar formatos em uma lista de 6 placeholders.
- **Hipóteses.** O total fixo dentro de um período fica em discussão. As regras de sobras e o layout dos atalhos aguardam conferência.

- **Calendário.** Intervalo, frequência e dias preferidos à esquerda, calendário à direita. Aumentar frequência redistribui a quantidade nos dias marcados. Exibir na prévia todos os placeholders e seus formatos. Comparar grade mensal rolável com semana compacta conforme a extensão do intervalo.
- **Quantidade fechada.** Prototipar o total e as preferências à esquerda e uma lista por formato à direita. Estudar como esse recorte convive com **Por tema**, preservando o pedido por tema já previsto.
- **Formatos.** Prototipar sliders de quantidades com redistribuição determinística. Para seis ideias, começar em 2/2/2; ao reduzir Reels para 1, visualizar 3/2/1. Para 8 → 4 Reels, verificar 3 vagas para Estático e 1 para Carrossel.
- **Um resultado para a Mesa inteira.** Configuração deriva uma lista de itens com data opcional e formato. Prévia e resumo leem o mesmo resultado usado pela geração. Alterar a configuração não muda uma proposta salva que está em revisão. A prévia usa somente dados da proposta e do formulário, sem chamadas de IA ou gravação.

### Prism como requisito de aceite

A rota já usa vários controles Prism. O desvio está em trechos específicos: botões nativos de propostas salvas, filtros e cartões próprios de sugestões, superfícies `bg-card` montadas à mão e grade independente na revisão da proposta. A prévia do formulário já reaproveita a grade compartilhada do calendário. Reescrever esses trechos quando a composição com os componentes vigentes resolver. Reutilizar cabeçalho, AppBar, campos, alternadores, botões, diálogos e núcleo de calendário. Um componente composto pode coordenar vários controles com as mesmas regras de foco, estados, raios e tokens do Prism. A complexidade do comportamento não exige criar um segundo design system.

Conferir no aceite visual do desktop as duas colunas, a prévia antes da geração, teclado, claro e escuro, e a rolagem necessária no intervalo longo. O trabalho de calendário reaproveita a apresentação da grade com dados de sugestões e callbacks próprios, sem importar a camada operacional que lê ou move ações. [Padrões Prism](../contracts/prism-details.md)

### Evidência do código atual

- A rota tem estado independente de frequência, dias e contagens. A prévia reativa usa a grade compartilhada. A geração é local e a revisão de uma proposta gerada usa uma grade própria. [Mesa atual](../../app/routes/app/planejamento.tsx)
- O menu, a busca e a página de parceiro têm entradas para Planejamento. A migration preparada de propostas permite operações de membros em determinados casos. O contrato de admin exige revisitar as quatro fronteiras, incluindo a rota direta, e testar permissões reais sob uma instalação isolada. [Menu](../../app/components/layout/Header.tsx) · [Busca](../../app/components/features/GlobalSearchCommand.tsx) · [Página do parceiro](../../app/routes/app/partner/$slug.tsx) · [SQL preparado](../../supabase/migrations/20261102120000_social_plans.sql)
- Existe um campo versionado de instruções reutilizáveis do parceiro, registrado como aplicado em produção. A integração dele com cadastro e Mesa ainda precisa ser comprovada. Reaproveitar o campo após conferir seu significado e permissões. [Registro do campo](../contracts/database-and-deploy.md#banco)

## Decisões da rodada inicial de 01/11

- **Mesa de planejamento**, a segunda alternativa do mockup, é a direção escolhida.
- Planejamento é **mais uma página interna do sistema**, dentro do layout existente de `/app`. O cabeçalho superior é o mesmo do app, com logo, busca, menu, alinhamento e comportamento atuais. Não criar shell, barra superior, navegação ou cabeçalho global exclusivos do Planejamento.
- Uma página com configuração/criação à esquerda e visualização/revisão à direita, disponíveis simultaneamente. Configurar e revisar não se tornam etapas em páginas separadas.
- Página limpa, sem cartões, fundos de painel ou gutters externos entre colunas; somente divisórias estruturais e padding interno suficiente para os controles.
- A configuração deve ser fiel aos controles da Mesa mostrada na conversa: **Por período / Por tema**, **slider de conteúdos por semana**, **dias da semana abaixo do slider** e **Direcionamento** explícito. Inputs genéricos que substituam esses controles não representam o desenho aprovado. O [ticket00](../../.scratch/social-planning/issues/00-align-page-with-approved-mockup.md) registra essa correção visual, ainda não implementada.
- A área de visualização oferece lista e calendário das mesmas sugestões. Abrir/editar uma sugestão e confirmar a finalização pode usar superfícies próprias do app, sem transformar a página inteira no fluxo Etapas descartado.
- O calendário é **o calendário já disponível no aplicativo**, com seus controles, ajustes laterais e rolagens vertical e horizontal. Não implementar uma grade própria simplificada do mockup nem substituir esses comportamentos por outro calendário.
- Primeira versão destinada ao computador e a telas amplas. Tablet só está contemplado quando houver largura suficiente para a mesma mesa lado a lado; não há uma experiência específica de tablet.
- **Mobile e telas pequenas estão fora do escopo desta versão.** Não criar empilhamento das colunas, abas substituindo as colunas, drawer mobile, toolbar compacta, gestos específicos ou adaptações para teclado virtual do Planejamento.
- Usar os componentes reais e o design system do aplicativo. **Prism** é o nome do design system citado como “Prisma” na conversa; não introduzir outro sistema ou o ORM de nome semelhante.
- Quando faltar um componente, pode-se recorrer a uma fonte externa/CDN para obter a implementação necessária e incorporá-la ao Prism, preservando o estilo da UZZINA. Isso é uma diretriz para implementação futura; nenhuma instalação foi solicitada ou realizada nesta rodada.

## Composição da página

| Área                                | Responsabilidade                                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Cabeçalho global do app             | O existente, sem redesenho ou duplicação; recebe somente a entrada Planejamento no menu/busca já previstos                                     |
| Título e controles locais da página | Planejamento, parceiro atual e seleção de parceiro quando necessário, dentro da área de conteúdo do layout atual                               |
| Coluna esquerda                     | Modo por tema/período, direcionamento, quantidade/frequência, formatos, opção de comemorações, referência ao Contexto/Tom e comando de geração |
| Coluna direita                      | Estado inicial sem proposta, análise curta e sugestões; lista/calendário, revisão e contagem das decisões                                      |
| Finalização                         | Resumo das aprovadas e confirmação antes de criar ações; não gerar ações ao aprovar individualmente                                            |

Os detalhes visuais do mockup são ilustrativos. A escolha da composição não aprova CSS, medidas, cores próprias ou controles HTML do protótipo como substitutos dos componentes do app. Em particular, a barra superior desenhada e a grade simplificada do mockup não são propostas de substituição do cabeçalho e do calendário reais.

## Calendário e integração ao layout existente

- Reutilizar o calendário do app e os ajustes laterais que ele já oferece, mantendo a rolagem vertical e horizontal no espaço disponível à direita da configuração. Não comprimir a grade para eliminar a rolagem horizontal, cortar conteúdo ou expandir a página inteira como substituto da região rolável.
- Preservar os padrões de dimensionamento, controles e limites de rolagem existentes. Ajustes laterais não apagam edição, decisões ou datas das sugestões; a coluna de criação continua compondo a mesma página.
- A diferença é o dado exibido e o destino das operações: neste contexto o calendário mostra sugestões e arrastar altera a data da sugestão. Aprovar/mover/editar não grava ação real. A conversão permanece exclusiva da finalização.
- Se o componente atual estiver acoplado às mutações de ações, adaptar sua fronteira de dados/eventos ou extrair somente a parte compartilhada necessária. Isso não autoriza copiar/reimplementar um calendário paralelo, falsificar sugestões como ações ou remover recursos já existentes.
- Cabeçalho, AppBar, contêineres, margens e reserva de rolagem seguem o layout vigente do app. A Mesa organiza somente o conteúdo desta página; não altera o restante do sistema.

A rodada inicial previa a entrada para membros no menu superior, na busca e na página operacional do parceiro. A decisão de 19/11 restringe essas entradas e a própria Mesa a administradores ativos. Parceiro permanece na URL, e ausência de parceiro permite escolher um disponível.

## Largura mínima e redimensionamento

O proprietário definiu a necessidade de largura mínima, mas **não escolheu um número**. Referência inicial para detalhamento: 1024px de viewport CSS, a validar pela composição real com os componentes Prism. Esse valor é proposta técnica, não medida aprovada nem garantia de que qualquer tablet será utilizável.

- Determinar o limite pela largura útil necessária à mesa, e não por user-agent ou pelo nome do dispositivo. Antes de implementar o bloqueio, registrar a medida efetiva e sua justificativa; não aumentar/reduzir o limite silenciosamente para acomodar mobile.
- Abaixo do limite, somente a área de conteúdo da página oferece aviso simples de que Planejamento requer tela mais ampla e navegação de retorno do app; cabeçalho/layout globais permanecem os existentes. Não montar o workspace interativo nem iniciar geração por esse aviso. A entrada pode continuar disponível na busca/menu para manter a navegação compreensível.
- Se a janela encolher durante uso, preservar o estado/rascunho já existente; não apagar decisões, regenerar ou reenviar finalização ao ampliar novamente. Uma operação de servidor já aceita não é cancelada por uma mudança de largura. O mecanismo concreto deve seguir o fluxo de IA vigente quando a feature for implementada.
- Navegação por teclado, foco visível e nomes acessíveis continuam obrigatórios no desktop. Exclusão de mobile não dispensa uso com teclado ou apresentação legível dentro da largura suportada.

## Reutilização e componentes novos

1. Conferir componentes Prism/Uzzina, calendário, editor e exemplos da galeria antes de acrescentar dependências.
2. Compor os controles existentes com os tokens, temas, paletas, estados e padrões de foco da UZZINA. Evitar controles duplicados exclusivos do Planejamento.
3. Se houver uma lacuna concreta, identificar o componente externo e a fonte/CDN; conferir compatibilidade, licença e dependências estritamente necessárias.
4. Incorporar a implementação ao projeto e adaptar ao Prism, com React Aria, CVA e `cn()` onde aplicáveis. CDN não significa depender de um script remoto em produção ou copiar o estilo de outra biblioteca para dentro da página.
5. Exportar novos primitivos pelo índice e demonstrá-los na galeria `/ui`, conforme o guia do projeto. Distinguir primitivo reutilizável de componente de negócio do Planejamento.

Não há autorização para instalar um kit inteiro, trocar o design system ou refatorar outros consumidores sem necessidade concreta.

## Efeito sobre tickets e aprovações

- Ticket01 estabelece a Mesa de planejamento dentro do layout atual de `/app` e seus três acessos, seleção/URL e limite de largura. Não cria cabeçalho global ou shell. Tickets seguintes ampliam essa mesma página.
- Ticket02 revisa sugestões dentro da Mesa; ticket06 acrescenta calendário/arraste; ticket07 acrescenta confirmação e conversão. Não implementar o desenho Etapas como alternativa selecionável no produto.
- Ticket06 reutiliza o calendário existente com controles/ajustes laterais e rolagens vertical/horizontal preservados; a grade própria do mockup não é fonte de implementação.
- Removida a exigência de adaptar/verificar a interface do Planejamento em mobile. A verificação abaixo do limite se restringe ao aviso e à preservação de estado; não constitui suporte mobile.
- Verificação segue o AGENTS vigente: proprietário valida a aparência por roteiro curto; automação somente quando houver risco concreto, especialmente autorização, persistência, contagens e conversão sem duplicação. Não executar suites por rotina para um ajuste visual.
- A escolha visual não aprova automaticamente todas as regras editoriais/operacionais ainda propostas nos tickets, como limites de quantidade, pendentes após finalizar ou horário padrão.
- Escopo do registro inicial: **registrar as decisões antes de começar**. Nenhuma implementação, dependência, SQL, chamada real de IA, commit ou publicação naquele momento. Autorização posterior limitada à estrutura visual está registrada abaixo.

## Estrutura visual autorizada posteriormente — 01/11

Proprietário pediu delegar a um subagente mais leve apenas a criação da página `/app/planejamento`, sem funcionamento de negócio. A estrutura foi preparada por Luna no checkout, sem commit/deploy:

- Rota interna herdando o Header e a AppBar existentes; sem alteração no layout global. A AppBar não é ocultada por estar no Planejamento; o comportamento global ao abrir uma gaveta real permanece vigente.
- Duas colunas lado a lado com rolagens independentes e `AppBarSpacer` no final de ambas. Altura útil calculada pelo hook existente; a área da direita permite overflow vertical/horizontal para a futura integração do calendário.
- Somente campos e botão desativados à esquerda e espaço vazio de prévia à direita. Sem consulta de parceiros, URL de parceiro, persistência, geração, sugestões, calendário real ou conversão de ações nesta entrega estrutural.
- Aviso abaixo de `lg` usa1024px como referência técnica provisória do shell; não representa aceite do limite definitivo nem implementação mobile.
- Sem novos acessos na busca/menu/botão do parceiro nesta rodada; abrir diretamente a URL. Esses acessos permanecem no escopo futuro já registrado.
- Aprovação da aparência/rolagem desta casca pelo proprietário não significa conclusão do ticket01 completo. Funcionalidades e componentes do calendário seguem pendentes.

## Acessos e estrutura limpa preparados — 01/11

- O proprietário autorizou limpar a apresentação e implementar os três acessos. A página remove cartões, fundos decorativos, gutters entre colunas, títulos repetidos e vazio ilustrado; mantém título simples, divisória central, preenchimento interno dos campos e placeholder textual vazio. Header/AppBar globais permanecem intactos.
- Busca global e menu comum passam por `onBeforeLeave`/`leaveTo`; no contexto do parceiro levam `?partner=<slug>`, e no contexto da própria página preservam o slug autorizado atual. O botão contextual fica junto ao nome do parceiro operacional e usa `leaveOpenActions` antes de navegar.
- A rota valida `partner` opcionalmente, resolve apenas `AppContext.partners` e atualiza a URL pela seleção Prism. Slug indisponível não seleciona outro parceiro; a interface permite escolher um disponível. O filtro de parceiros da busca não participa dessa atribuição.
- O cabeçalho de `/dash` agora mantém avatar/identidade, seletor expansível e saída na mesma linha; em telas estreitas, saudação e texto de saída são visualmente compactados, mantendo nomes acessíveis. Sem mudança de sessão, query, seleção ou autenticação.
- Isto implementa apenas navegação/seleção do shell e apresentação. Geração, IA, persistência, calendário e sugestões continuam pendentes; os campos e botão de geração ficam desativados.

## Proposta histórica do Contrato do Planejamento (D1 a D6) — 02/11/2026

Proposta registrada na rodada anterior. As decisões e lacunas vigentes estão na revisão do proprietário de 19/11, no início deste documento.

- **D1 — Visibilidade e Compartilhamento:**
  - Compartilhado entre os membros autorizados ao parceiro comercial (`partners.users_ids` e administradores da agência). Propostas são vinculadas ao `partner_slug` e criadas pelo `user_id`. Leitura permitida para membros com acesso ao parceiro. Edição permitida ao autor da proposta e aos administradores. RLS e armazenamento isolados por parceiro e usuário, evitando vazamento entre clientes ou contas externas.
- **D2 — Frequência e Semanas:**
  - Início da semana civil: Domingo (0) a Sábado (6). Semanas parciais no início ou fim do período selecionam apenas os dias da semana explicitamente ativos pelo usuário contidos no intervalo. A quantidade de dias por semana selecionados no controle deve equivaler à frequência indicada pelo usuário.
- **D3 — Formatos:**
  - No modo manual, a soma das quantidades manuais (`reels` + `static` + `carousel`) deve ser estritamente igual ao número de slots regulares calculados no período (`targetCount`), bloqueando a geração com aviso claro se divergir. No modo automático, a distribuição divide os formatos equilibradamente pelo pool. Formatos extras de datas comemorativas são alocados no formato de maior impacto (carrossel ou estático) sem consumir os regulares.
- **D4 — Comemorações:**
  - Ocorrências de datas comemorativas selecionadas no intervalo são tratadas como conteúdos extras contextuais (`isExtra: true`), não consumindo a cota regular dos dias da semana. Múltiplas comemorações na mesma data são combinadas no título do mesmo slot comemorativo para evitar sobrecarga de publicações. Apenas comemorações que caem no intervalo de datas do período (`startDate <= date <= endDate`) são selecionadas.
- **D5 — Finalização:**
  - Apenas sugestões aprovadas com data prevista válida são convertidas em ações reais. Sugestões pendentes permanecem no rascunho da proposta sem criar ações. Sugestões rejeitadas são ignoradas. O mapeamento define `phase: "do"` (Fazer, decisão de 20/11), `partners: [partner_slug]`, `category: mapFormatToCategory(format)`, `responsibles: [userId]`, e `user_id: userId`. A finalização é atômica e idempotente: tentativas repetidas ou reaberturas após sucesso não duplicam ações criadas.
- **D6 — Contrato Editorial Mínimo:**
  - Entradas mínimas: parceiro com `title`, `context` (opcional) e `voice` (tom de voz), período ou quantidade de temas, direcionamento opcional. Saída estruturada de cada sugestão: `id`, `title`, `format` (`reels` | `static` | `carousel`), `objective`, `briefing`, `scheduled_date` (no modo período), `status` (`pending`), `is_commemorative` e `celebration_title` (se aplicável). Não há chat ou perguntas conversacionais.
