# 01: Corrigir o campo de e-mail, retirar o título do login e reposicionar o controle do feed em /dash

**Status:** completed — owner explicitly validated and closed the portal adjustments on2026-10-31. Implementation already committed as `eb2cd35`; no new push/deploy.

**Prioridade:** P2 — apresentação inconsistente do login e controle sobreposto à identidade da conta; sem evidência de falha na autenticação ou perda de dados.

**Entrega:** corrigir dois pontos do portal existente: (1) apresentação do login, com e-mail visualmente consistente com senha e sem o título “Portal do Parceiro”; (2) controle de exibir/ocultar o feed do Instagram em posição própria, sem cobrir avatar ou outros controles.

**Bloqueadores:** nenhum para iniciar a correção. Ler CURRENT e conferir Git antes de editar; um executor escreve no checkout por vez. Não executar os tickets Safari/mobile por proximidade.

## Evidência e análise

Relato do proprietário em30/10/2026, com duas capturas anexadas ao chat:

- `Captura de Tela 2026-10-30 às 14.09.49.png`: e-mail parece texto solto, sem a superfície arredondada visível na senha. O proprietário também pediu remover “Portal do Parceiro”.
- `Captura de Tela 2026-10-30 às 14.12.56.png`: ícone de controle do feed aparece sobre o avatar ao lado de “Olá, Edrine”.

As capturas são evidência visual do relato, sem comprovação do navegador, zoom ou viewport CSS. Os originais estão anexados ao chat; os caminhos temporários do sistema não são uma dependência durável deste ticket.

Inspeção dos componentes reais:

- [Login](../../../app/routes/dash/login.tsx): o e-mail monta `PrismInputGroupInput` isolado; a senha monta o mesmo componente dentro de `PrismInputGroup`. Em [input-group](../../../app/components/prism/input-group.tsx), o input interno remove fundo/borda/ring próprios porque a superfície e os estados visuais pertencem ao grupo. Usá-lo sem o grupo explica a diferença mostrada. Corrigir a composição local com os primitivos existentes, preservando os demais consumidores.
- O título rejeitado é um `h1` explícito no login. A solicitação se refere a esse texto; não determina remoção da instrução “Informe seu e-mail e senha para acessar.” nem mudança do botão “Entrar no Portal”.
- [Página inicial do portal](../../../app/routes/dash/index.tsx): o botão `SidebarClose` usa `absolute top-4 left-4 z-50`, fora dos ramos mobile/desktop. Seus ancestrais de layout até o cabeçalho não estabelecem um contêiner posicionado local; ele pode alcançar a área do avatar do [layout /dash](../../../app/routes/dash.tsx). A estrutura é compatível com a sobreposição do print; a geometria final deve ser reproduzida em navegador antes da correção.
- O controle altera o parâmetro `sidebar`, usado pelo feed desktop (`lg+`). No mobile, Calendário/Feed já são abas próprias; o botão absoluto continua montado, mas não alterna essas abas. Delimitar o controle de sidebar ao desktop e preservar o acesso mobile pelas abas existentes.
- O botão tem somente ícone, sem nome acessível explícito e sem indicação do estado de expansão. Corrigir junto com seu posicionamento, sem redesenho geral.

Nesta preparação houve apenas inspeção de código e capturas. Não houve reprodução em navegador, teste funcional, acesso ao banco ou alteração do app.

## Critérios de aceite

- [ ] E-mail tem superfície, altura, alinhamento e espaçamento coerentes com Senha nos temas claro/escuro. Foco fica visível no campo/grupo correto; não resolver com estilos globais ou remoção de indicadores.
- [ ] Preservar rótulo associado, `type=email`, `name`, `autocomplete`, obrigatoriedade e edição do valor. Tab segue E-mail → Senha → mostrar/ocultar senha → Entrar; Enter envia uma única tentativa e mantém estados de carregamento/erro existentes.
- [ ] Remover o título visível “Portal do Parceiro”, ajustando o espaço para não deixar uma faixa vazia. Preservar logo, instrução e botão existentes; conferir identificação acessível do formulário após retirar o título.
- [ ] Colocar o botão de exibir/ocultar feed em área própria dos controles desktop, com espaço reservado no layout. Não cobrir avatar, saudação, seletor de parceiro, Sair ou controles do calendário; não corrigir só alterando `z-index` ou deslocando uma coordenada sobre o cabeçalho.
- [ ] Botão possui nome acessível em português que acompanha a ação (“Mostrar feed do Instagram” / “Ocultar feed do Instagram”) e estado expandido coerente. Enter/Espaço e clique alternam o mesmo painel; foco continua visível e utilizável nas duas posições.
- [ ] No desktop, o controle permanece alcançável com feed aberto ou fechado e o parâmetro `sidebar` continua funcionando, inclusive no carregamento direto da URL. Alternar não muda parceiro, período ou ações.
- [ ] Abaixo de `lg`, não exibir um botão de sidebar sem efeito. As abas Calendário/Feed continuam operáveis e sem sobreposição; resize entre mobile/desktop preserva o comportamento existente.
- [ ] Verificar largura estreita, desktop, saudação longa e um/vários parceiros, incluindo ambos os estados do feed. Avatar e controles têm caixas sem interseção; a correção não cria rolagem horizontal.
- [ ] Preservar autenticação por `/api/dash-auth`, cookie HttpOnly, autorização de parceiros e consultas pelo cliente do portal. Nenhuma mudança de sessão, APIs, banco ou revisão pública é necessária para esta entrega.

## Execução e verificação previstas

1. Reproduzir os estados no código real com HTTP/identidades controlados, sem encaminhar fixtures de escrita ao banco de produção. Registrar dimensões e comportamento antes da correção.
2. Preparar regressão que falhe pelo defeito real de composição/apresentação e pela sobreposição do botão. Usar navegador com CSS real para geometria e estados de foco; testes que só conferem strings de classes não comprovam a correção visual.
3. Corrigir a composição do login e a posição/disponibilidade do controle do feed. Cobrir autenticação simulada (sucesso/erro/pendência), mostrar senha, envio por Enter, alternância do feed e abas mobile nos componentes reais.
4. Executar testes pertinentes, `bun run format`, `bun run lint`, `bun run typecheck` e build. Registrar separadamente navegador automatizado e Safari/aparelho físico quando disponíveis; viewport simulado não certifica o aparelho do proprietário.
5. Atualizar CURRENT com resultados e pendências reais. Código preparado, testes locais e publicação são estados distintos; push não confirma deploy Ready.

## Resultado da implementação — 30/10/2026

- Login usa `PrismInputGroup` também no e-mail, com o mesmo padding da senha. O título foi retirado, a instrução preservada com espaço antes dos campos e o formulário recebeu nome acessível “Acesso à UZZINA”.
- O calendário aceita conteúdo opcional no fim de seus controles (`endContent`). Somente a instância desktop do portal recebe ali o botão do feed, com ícone lateral à direita, nome contextual, `aria-expanded` e `aria-controls`. O botão absoluto foi removido; o painel fechado usa `hidden`, retirando também seus descendentes do percurso de foco. No mobile, continuam as abas existentes.
- Regressão permanente em [check-dash-layout-browser.cjs](../../../scripts/check-dash-layout-browser.cjs), sobre o build real com HTTP controlado e rede externa bloqueada. Antes: quatro falhas de superfície/altura do e-mail, quatro de botão indevido no mobile e quatro de sobreposição ao cabeçalho. E-mail media29px em390px/27px em1440px, sem fundo/arredondamento; senha48px. Depois:13 grupos passaram (campos claro/escuro, login por teclado/erro/pendência/sucesso e layout/alternância do feed), mais redimensionamento mobile→desktop. Viewports390/1023/1024/1440px, um/dois parceiros e nome mais longo; verificados foco visível do e-mail, ausência de interseção com cabeçalho/controles de data, estado e carregamento direto da URL de sidebar.
- `bun test tests/portal-client.test.ts tests/portal-actions.test.ts tests/content-portal.test.tsx`:39 pass/0 fail. `bun run format`, `bun run lint`, `bun run typecheck` e `bun run build` passaram. Lint mantém um aviso informativo preexistente em `tests/font-loading.test.ts`; build avisa sobre chunks grandes.
- Chromium automatizado com CSS real; sem Safari/aparelho físico, login real, banco ou provedor. Não certifica autenticação do servidor, que não foi alterada. O servidor de preview isolado foi encerrado ao terminar; servidor do proprietário e alterações externas preservados. Sem SQL, push ou deploy.

Reprodução: gerar o build (`bun run build`), servir com `vite preview` em127.0.0.1:5188 e executar `node scripts/check-dash-layout-browser.cjs`. O script aceita `PORTAL_TEST_URL`, `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE`; exige Playwright/Chromium disponíveis. Somente o HTTP da aplicação é simulado: componentes, roteador e estilos são os reais.

## Limites da entrega

Um ticket local com duas frentes de correção relacionadas ao portal, implementadas após autorização do proprietário. Não inclui redesenho completo do login/cabeçalho, novos recursos, alterações de autenticação, banco ou publicação. A análise geral de estilo permanece em trabalho separado; esta correção não depende de executá-la. Os critérios acima preservam o roteiro de aceite; a evidência executada e seus limites estão registrados neste resultado.

## Owner acceptance — 2026-10-31

Owner stated that the portal is already validated and authorized closing/committing this delivery. Login presentation and feed-control adjustments are accepted for the exercised scenarios; no repeat generic portal validation is required. Implementation already belongs to `eb2cd35`; this update records closure, not additional functional work or test execution. Publication remains separate.

The separately reported multi-user access failure remains an investigation note without a ticket; this presentation acceptance does not establish its cause or silently close that independent report. Shared-tabs ticket15 retains its non-portal acceptance scope.
