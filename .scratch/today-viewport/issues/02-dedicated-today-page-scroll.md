# 02: Separar a página Hoje da Home e rolar somente o conteúdo em todas as visualizações

**What to build:** a página Hoje passa a ter um componente próprio, independente do bloco Hoje da Home. Nela, título, navegação de data e seletor de visualização ficam fixos no topo; a barra flutuante continua fixa embaixo; e Parceiros, Categorias e Feed do Instagram rolam somente dentro da área de conteúdo, como o Kanban já faz por coluna. O bloco Hoje da Home volta a ser um componente simples, sem modos ou opções que existem só por causa da página dedicada, para que a página Hoje possa evoluir sem precisar espelhar mudanças na Home.

**Blocked by:** None (can start immediately). Builds on 01 (Kanban de Hoje com altura útil), already committed.

**Status:** completed — approved by owner on 2026-10-28; local commit

## Contexto

- Hoje a página dedicada e a Home usam o mesmo componente, diferenciado por um modo standalone. Só o Kanban limita a altura e rola por coluna; Parceiros (visualização inicial), Categorias e Feed deixam a página inteira rolar, escondendo título e controles, e exibem uma barra de rolagem externa.
- Os quadros internos (Kanban, Categorias, Parceiros, Feed), a barra de calendário e o seletor de visualização podem ser reaproveitados como componentes internos; a separação é do contêiner/página, não uma cópia dos quadros.
- Os tickets de preferências registrados em `.scratch/account-preferences/` (visualização inicial de Hoje compartilhada e persistida) consideram Home e página dedicada; ao implementar, preservar a possibilidade de as duas lerem a mesma preferência sem voltar a compartilhar o contêiner.

## Acceptance criteria

- [x] A página Hoje usa um componente próprio. O bloco Hoje da Home deixa de receber opções específicas da página dedicada (modo standalone, preenchimento de altura, reserva da barra) e mantém sua aparência e comportamento atuais: colunas do Kanban de30vh, altura natural nas demais visualizações, título com link para a data exibida.
- [x] Na página Hoje, título, navegação de data e seletor de visualização permanecem visíveis em todas as visualizações; não há rolagem vertical da página.
- [x] Parceiros, Categorias e Feed do Instagram rolam dentro de uma única área de conteúdo abaixo do cabeçalho. A área termina com a reserva da barra flutuante, de modo que a última ação fica acessível acima dela.
- [x] Kanban mantém o comportamento aprovado no ticket01: cabeçalhos de fase fixos, rolagem por coluna, sem rolagem externa.
- [x] Listas curtas ou vazias não criam rolagem. A altura acompanha redimensionamento da janela e a quebra dos controles em telas menores, sem compensação fixa.
- [x] Trocar de dia ou de visualização começa a área de conteúdo do topo.
- [x] Seleção múltipla, abertura de ações na gaveta (principal/secundária), arraste, filtros de parceiros visíveis e navegação de data da Home para Hoje continuam funcionando. Navegação Home→Hoje e suíte completa conferidas; quadros internos inalterados, mas gaveta, seleção e arraste não foram exercitados no navegador nesta rodada; proprietário conferiu a página na própria sessão e aprovou.
- [x] AGENTS (contrato do Kanban de Hoje e da reserva da AppBar) é atualizado para descrever a página Hoje separada e a rolagem por área de conteúdo; KI de arquitetura acompanha.
- [x] Teste no componente real reproduz a rolagem externa em Parceiros antes da mudança e cobre as quatro visualizações da página Hoje e a preservação do bloco da Home.
- [x] Navegador com HTTP controlado em desktop e celular verifica cabeçalho fixo, ausência de rolagem da página, rolagem interna, última ação acima da barra, listas curtas/longas e resize, sem escrita real.
- [x] Testes pertinentes, format, lint, typecheck e build passam; limites da verificação são registrados em CURRENT.

## Local result

Dedicated page component plus shared Today parts; Home block restored to its simple wrapper. Route test failed before (no dedicated page/content region) and passes after, covering Partners/Categories/Feed, scroll reset by day/view, resize and the unchanged Home block. 492 tests/1727 assertions, format, lint, typecheck and build passed (known chunk warning). Built-in browser with an injected test session and controlled fetch (WebSocket and unmocked hosts blocked; zero blocked requests, zero writes), 90 actions: at 1024×768 and 390×700 the title stayed put while scrolling, page/document had no vertical overflow, the last item ended at the AppBar reserve (98px), Kanban kept per-column scroll, a 3-action day did not scroll, and Home kept its block without the page region. No real session, SQL, commit, push or deploy.

## Owner follow-up (2026-10-28)

Header of the Today page only: bottom divider, view name centered between title and controls on desktop (Status das ações, Categorias, Feed do Instagram, Parceiros) and hidden on mobile, "Feed do Instagram" removed from inside the content, and smaller vertical padding. Home block unchanged. Route test extended; 492 tests/1742 assertions, format, lint, typecheck and build passed. Built-in browser with the same controlled session (only mocked HEAD reads of notifications, nothing blocked) confirmed 1px divider, label hidden at 390px, no outer overflow and no Feed heading in the content.
