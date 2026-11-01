# Planejamento — decisões de interface e escopo

Registrado em 01/11/2026 após avaliação do mockup pelo proprietário. Referências: [mockup e limites](social-planning-mockup.md) e [divisão dos tickets](social-planning-ticket-breakdown.md).

## Decisões aprovadas

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

Busca global e menu superior continuam com entrada para todos os membros da equipe; a página operacional do parceiro tem o botão com ícone junto ao seu nome. Parceiro permanece na URL, e ausência de parceiro oferece seleção entre os autorizados. A restrição de largura não transforma a funcionalidade em administrativa nem amplia o acesso aos parceiros.

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
