# 01: Corrigir o foco de Hoje e investigar controles dependentes de hover e wrappers focáveis

**Latest owner acceptance — 2026-11-01: approved and closed.** This supersedes historical pending-acceptance statements below. Separate media performance/carousel observations and Today design work remain in the [current queue](../../../docs/audits/2026-11-01-open-tickets.md).

**What to build:** em `/app/today`, retirar o wrapper “Ações do dia” do percurso de foco e eliminar seu contorno, além de revelar o botão “+” do parceiro quando receber foco pelo teclado. Complementar a revisão anterior com uma investigação dirigida nas telas/componentes existentes da UZZINA: controles cuja disponibilidade/visibilidade depende de hover e wrappers que recebem foco sem uma finalidade de interação. Entregar ocorrências verificadas, lacunas da revisão anterior e propostas delimitadas. Tab/Shift+Tab devem percorrer controles úteis, com indicação visual no controle efetivamente focado. Preservar rolagem, layout e abertura das ações.

**Priority:** P2 — interação de teclado e indicação visual incorretas; sem evidência de perda de dados ou bloqueio total.

**Status:** implemented locally on2026-10-31 — wrapper and creation focus corrected; bounded complementary investigation delivered. See [report](../../../docs/audits/2026-10-31-today-focus.md). Physical-device acceptance/publication remain separate.

Escopo ampliado pelo proprietário em29/10: dois ajustes confirmados em Hoje e investigação complementar do mesmo padrão no app. Preparar este ticket não executa a investigação ampliada nem inicia implementação.

**Blocked by:** None. Coordenar a escrita com o trabalho Safari/mobile em andamento: um executor escreve no checkout por vez.

## Relato e localização

O proprietário enviou uma captura com contorno envolvendo toda a área dos parceiros e pediu que eventual foco seja nos elementos internos, nunca no wrapper. Captura: `Captura de Tela 2026-10-29 às 15.58.55.png`, enviada em29/10/2026, com sexta-feira,30 de outubro selecionada.

Embora o relato mencione Home/Today, o layout corresponde à página dedicada `/app/today`, implementada em [TodayPageView](../../../app/components/features/today/TodayPageView.tsx). O bloco [HomeTodayView](../../../app/components/features/home/HomeTodayView.tsx), dentro de `/app`, usa outro wrapper, sem esse `tabIndex` e sem esse ring explícito. Preservar essa separação; a Home entra como verificação de não regressão.

## Diagnóstico confirmado e limites

- `TodayPageView.tsx:81–97`: a região “Ações do dia” tem `tabIndex={0}` e `focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset`. Ela é um ponto de Tab explícito e desenha um contorno em toda a área rolável. As linhas86–87 vêm do commit `11e015ed`, de28/10/2026, conforme `git blame`.
- O mesmo ramo atende Parceiros, Categorias e Feed. Kanban usa outro ramo e não monta esse wrapper.
- Probe temporário montou o componente real com os providers e a fixture existentes de `tests/today-page-heading.test.tsx`, quadro vazio e data30/10. Focou o radio “Visão por Parceiros” e executou `userEvent.tab()`. Resultado: `document.activeElement` passou a ser o `DIV` “Ações do dia”, com `tabIndex:0`. A expectativa de que o wrapper não recebesse foco falhou: `Expected: false; Received: true` (`0 pass, 1 fail`).
- O quadro vazio reproduz a parada extra sem nenhum card/parceiro interno: o defeito independe de dados reais, abertura da gaveta ou foco nos filhos. Não é necessário atribuí-lo a um modo novo da aplicação; há configuração explícita de foco no contêiner.
- Comando executado: `bun test --preload /Users/euchicosousa/vercel/uzzina/tests/dom-setup.ts /private/tmp/uzzina-today-focus-UWn70s/focus.test.tsx`. O probe é temporário, fora do checkout; não é uma regressão permanente da suíte. Usou React Testing Library/user-event/JSDOM, sem servidor, rede ou banco.
- O probe comprova transferência de foco no DOM; não renderiza Tailwind nem certifica a aparência no Safari. O contorno visual foi relatado pelo proprietário e é compatível com as classes encontradas. Não foi reproduzido o gesto original que levou ao estado da captura, nem confirmado navegador/versão.

## Critérios de aceite

Diagnóstico complementar solicitado pelo proprietário: [wrapper, botão “+” e link do parceiro](../../../docs/audits/2026-10-29-today-focus-diagnosis.md). Chromium com CSS real confirmou também o ring do wrapper. O botão invisível no foco já é o achado K01 do inventário e sua correção integra agora este ticket. O proprietário confirmou depois que o link do parceiro funciona por Enter; sua dúvida era o uso de Espaço. Link de nome/avatar está correto e não é pendência de correção.

- [ ] Na página Hoje, Parceiros/Categorias/Feed não oferecem a região inteira como parada de Tab/Shift+Tab. Não basta ocultar o ring enquanto o wrapper continua recebendo foco.
- [ ] O wrapper não recebe foco ao clicar no espaço vazio nem quando um descendente ganha foco. Não criar redirecionamento global de foco, `focus-within` no quadro ou captura global de Tab.
- [ ] Os controles internos existentes continuam acessíveis e com indicador de foco no próprio controle: navegação de data, seletor de visualização, links e ações que estiverem disponíveis. Não desativar outlines/rings globalmente nem aplicar `tabIndex=-1` aos filhos.
- [ ] Após o link do parceiro, Tab revela o botão “+” e seu indicador de foco mesmo com o ponteiro fora da coluna. Shift+Tab também o revela. Manter o hover existente e nome acessível contextual, como “Criar ação para [parceiro]”. A política visual em repouso não muda automaticamente para sempre visível.
- [ ] Enter/Espaço no “+” abrem somente o rascunho contextual do parceiro/data, sem INSERT ao abrir e sem navegar pelo link do parceiro. Preservar ativação por ponteiro e o link único de nome/avatar, ativado por Enter.
- [ ] Tab após o seletor de visualização segue para o próximo controle útil existente. Quadro vazio/loading não cria parada artificial. Shift+Tab percorre o caminho inverso sem prender o usuário.
- [ ] Conferir a política de foco nativa dos contêineres roláveis nos navegadores suportados: remover apenas `tabIndex=0` pode não bastar onde o navegador torna áreas roláveis focáveis automaticamente. Resolver localmente e comprovar o resultado, sem impor previamente uma solução por CSS.
- [ ] Manter semântica de região/nome, cabeçalho fixo, área rolável, reset do scroll ao trocar dia/visualização e `AppBarSpacer`. Não trocar a rolagem interna pela da página inteira.
- [ ] Com ações além da área visível, navegar para controles internos torna o controle focado visível e preserva acesso ao fim do conteúdo; testar também mouse/trackpad e toque quando disponível.
- [ ] Trocar dia/visualização e abrir/fechar ação não transfere foco para o wrapper nem perde o comportamento de retorno de foco existente. Não alterar as guardas da gaveta.
- [ ] Verificar a Home, que compartilha `PartnersBoard`, após ajustar o “+”. `KanbanPhasesBoard.tsx:174–177` também tem regiões focáveis por coluna: investigar sua finalidade na etapa complementar, sem aplicar uma remoção automática a todas as colunas/primitivos.

## Investigação complementar requerida

O [ticket03 de foco/teclado](../../archive/resolved-tickets.md#keyboard-focus-issues-03-keyboard-stabilization) entregou uma revisão, não uma correção geral. O [inventário](../../../docs/audits/2026-10-29-keyboard-focus-inventory.md) já identificou o “+” invisível como K01, mas não registrou o wrapper de Hoje como defeito. Usar esse material como ponto de partida e explicar o que foi registrado, o que foi corrigido e o que não foi coberto; não presumir que um checklist de revisão concluído significa que os problemas foram resolvidos.

“Modo de foco”, neste relato, significa uso por teclado. Não criar uma preferência ou modo novo de aplicação. Hover e foco são estados diferentes: uma ação oferecida ao ponteiro precisa ser descobrível e operável pelo teclado quando aplicável.

- [ ] Fazer busca dirigida por controles revelados apenas por `hover`/`group-hover`, opacidade zero, `hidden`/`display:none`/visibilidade e alternativas exibidas ao passar o mouse. Conferir os consumidores e componentes compostos; apenas ter ring no primitivo não comprova que o botão está visível.
- [ ] Verificar dois tipos de falha: controles que recebem Tab invisíveis e controles que desaparecem do percurso por estarem ocultos, sem alternativa equivalente acessível pelo teclado. Não considerar corrigido somente porque hover funciona.
- [ ] Investigar wrappers, cards, cabeçalhos, regiões de rolagem e contêineres com `tabIndex`, foco programático ou foco automático do navegador. Distinguir alvos sem ação/finalidade de controles compostos com teclado próprio e regiões que realmente precisem de acesso por teclado. Não remover foco de todos os elementos não nativos indiscriminadamente.
- [ ] Começar por Hoje nos quatro modos, Home e consumidores dos componentes compartilhados; estender a busca dos mesmos padrões às demais telas existentes, reaproveitando a matriz do inventário. Registrar componentes/consumidores atingidos e limites reais, sem repetir toda a auditoria de teclado por rotina.
- [ ] Para cada ocorrência candidata, reproduzir com ponteiro fora da área e Tab/Shift+Tab; conferir foco real, visibilidade computada, indicador, ativação pertinente, rolagem e retorno de foco. Comparar com hover. Busca textual é triagem, não confirmação de defeito.
- [ ] Entregar tabela com tela/componente, comportamento no hover, comportamento no foco, finalidade do alvo, reprodução, impacto, cobertura anterior, ticket existente e encaminhamento. Separar confirmado, comportamento correto, inspeção estática e não testado. Não transformar ausência de cobertura em falha.
- [ ] Propor regressão e correção local para achados novos. Não abrir tickets duplicados nem implementar automaticamente todos os resultados da investigação. Relacionar K01 a esta entrega e K02 ao [ticket de mídia existente](../../media-controls/issues/01-always-visible-media-controls.md), preservando os limites de cada trabalho.
- [ ] Preservar contratos aprovados de gaveta, editores e overlays; sem captura global de Tab, remoção global de outlines ou migração de biblioteca. Widget Cloudinary e VoiceOver permanecem fora do escopo conforme decisão anterior.

## Execução e verificação

1. Executar a investigação complementar e registrar seus resultados, distinguindo-os dos dois defeitos já reproduzidos. Reutilizar as evidências anteriores, com novas reproduções somente onde forem necessárias.
2. Na futura implementação, criar regressões permanentes no componente real para a transferência de foco ao wrapper e para a visibilidade/ativação do “+” por teclado; usar os providers/fixtures existentes. Cobrir Parceiros/Categorias/Feed e quadro vazio/com ações para o wrapper, além da Home para o botão compartilhado. Não testar somente strings de classes ou copiar a implementação para o teste. Corrigir localmente os dois comportamentos confirmados, preservando a estrutura de rolagem.
3. Verificar no navegador com CSS real: Tab/Shift+Tab, clique no vazio, controle interno focado, conteúdo longo e troca de dia/modo, em desktop e viewport estreito. Usar HTTP/identidades controlados; não enviar fixtures para produção. Registrar separadamente Chromium, Safari real e o que não foi executado.
4. Executar testes pertinentes, `bun run format`, `bun run lint`, `bun run typecheck` e build; requisitos serverless somente se o escopo real os acionar. Atualizar CURRENT e contratos pertinentes após implementação.

## Fora do escopo e estado de entrega

Preparação de um único ticket, sem implementação autorizada nesta rodada. A investigação complementar dos padrões de hover/foco e wrappers faz parte do trabalho a executar; demais achados geram diagnóstico e propostas, sem correção automática. Não ampliar para redesenho da Home, novos atalhos, mudanças no banco ou execução dos tickets Safari/mobile. Não há correção entregue, commit, push ou deploy deste ticket.
