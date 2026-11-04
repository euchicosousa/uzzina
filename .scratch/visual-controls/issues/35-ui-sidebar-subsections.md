# 35 — `/ui`: navegação lateral por microseções

**What to build:** ao selecionar uma seção no menu esquerdo da galeria, revelar abaixo dela os links para todas as suas microseções. Cada link leva diretamente ao trecho correspondente do conteúdo, facilitando a navegação em seções extensas.

**Blocked by:** nenhum.

**Status:** primeiro clique corrigido após reprodução no Comet e no histórico real (04/11); aguarda aceite visual final.

## Parte 1 — navegação funcional, sem animação

- [x] Inventariar todas as microseções existentes em Tokens, Prism e Uzzina, usando os títulos visíveis de cada bloco de conteúdo/playground. Cada bloco navegável aparece uma vez no submenu da seção correspondente.
- [x] Preservar todas as seções principais atuais do menu esquerdo. Selecionar uma seção mantém a navegação ao início dela e revela imediatamente seus links filhos, com recuo visual e hierarquia clara.
- [x] Mostrar microseções somente da seção selecionada. Ao selecionar outra seção, recolher os filhos anteriores e revelar os novos. Seção sem microseções não produz submenu vazio.
- [x] Cada microseção tem identificador estável e único e link com destino próprio. Clicar leva ao bloco correto dentro da área rolável da galeria, deixando o título visível abaixo dos controles fixos.
- [x] Um link direto a uma microseção abre a categoria e revela a seção principal correspondentes antes de posicionar o conteúdo. Atualização da página mantém o destino acessível. Preservar os links existentes das seções principais.
- [x] O clique em uma microseção mantém seu grupo aberto. Distinguir visualmente a seção principal selecionada e o destino filho ativo, sem confundir ambos.
- [x] Preservar busca, troca entre Tokens/Prism/Uzzina e navegação compacta. Links encontrados pela busca devem abrir o grupo correto antes de navegar, quando necessário.
- [x] Usar links e controles semânticos, nomes acessíveis, foco visível e teclado. Filhos recolhidos ficam fora do percurso de foco. Preservar valores dos playgrounds durante navegação dentro da categoria.
- [x] Integrar o submenu ao desenho atual do menu. Implementar a revelação diretamente na navegação existente, sem utilizar o componente Accordion da galeria.
- [x] Nesta parte, abrir/fechar os submenus imediatamente. Preservar o comportamento de rolagem existente, sem acoplar a entrega funcional à animação de expansão.
- [x] Conferir uma seção longa, uma curta e uma sem filhos; trocar de seção; navegar até a última microseção; abrir link direto e atualizar; usar teclado; conferir largura compacta e temas claro/escuro. Registrar roteiro curto e pendências reais para aceite do proprietário.

## Passagem para execução

Reutilizar a organização de navegação e rolagem já existente na rota da galeria e os títulos dos blocos compartilhados. Conferir o inventário no momento de implementar para incluir seções novas que já tenham sido entregues. Atualizar o tracker e o relatório central registrando a correção do glitch antes do encerramento.

## Relatório de entrega — Parte 1 (04/11/2026)

- **Arquivos tocados:**
  - `app/routes/ui.tsx`: inventário de microseções em `SIDEBAR_ITEMS`, suporte a hash direto, controle de expansão e scroll-spy refinado com sublinks.
  - `app/components/ui-sections/GalleryHelperComponents.tsx`: export de `SidebarSubsectionLink` e suporte a `id?: string` no primitivo `GalleryItem`.
  - Seções com múltiplos playgrounds recebendo identificadores únicos: `TokensColorsSection.tsx`, `TokensIconsSection.tsx`, `AvatarSection.tsx`, `BadgeSection.tsx`, `ButtonSection.tsx`, `CheckboxSection.tsx`, `ComboboxSection.tsx`, `InputSection.tsx`, `ToggleSection.tsx`, `UzzinaAvatarSection.tsx`, `UzzinaIconsSection.tsx`.
- **Verificação:** `tsc --noEmit` aprovado com 0 erros, Biome lint aprovado sem erros ou avisos, Prettier formatado.
- **Comportamento validado:**
  - Seção sem microseções (ex: `spacing`, `Alert`, `Accordion`) não renderiza container vazio.
  - Seções com microseções (ex: `Button` com 2, `Input` com 5, `Foco` com 6) revelam sublinks aninhados imediatamente ao selecionar.
  - Links diretos com hash (ex: `/ui#focus-outer` ou `/ui#prism-input-timefield`) abrem a categoria correspondente e posicionam o viewport com offset de respiro.


## Decisão e estudo do glitch — 04/11/2026

Proprietário retirou a etapa de animação de expansão. Preservar a rolagem suave do painel direito. Estudo somente leitura por subagente leve identificou disputa entre clique/hash e scroll-spy: o ramo scrollTop menor que 80 força o primeiro destino, e o conjunto observado depende do grupo expandido. O scroll troca esse grupo e recria o listener, removendo filhos do conjunto durante o movimento.

Proposta para correção posterior: registrar destino programático e conservá-lo até chegada/interrupção; acompanhar rolagem manual separadamente; resolver os destinos sem depender da expansão visível; aplicar a mesma regra a hash e clique, respeitando movimento reduzido. Estudo estático sem reprodução de navegador nesta rodada. Correção funcional aplicada posteriormente, conforme seção abaixo.

## Correção do glitch implementada — 04/11/2026

Subagente leve corrigiu a disputa clique/scroll-spy. Lista de destinos independente do submenu; intenção versionada por clique/hash; acompanhamento manual reativado pela entrada do usuário; movimento reduzido respeitado. Sem animação de expansão nem timeouts. Prettier/lint/typecheck aprovados. Chromium verificou Button, ButtonGroup, cliques rápidos, hash direto e rolagem manual, sem erros e sem oscilação no registro do DOM. [Evidência](../../../docs/audits/2026-11-04-v35-selection-flicker-study.md). Aceite visual pendente.

## Ajuste solicitado após aceite do glitch — 04/11/2026

Clicar em seção pai com microseções agora seleciona/navega ao primeiro filho, expande o pai e usa o hash desse filho. Links antigos ao pai também resolvem para o primeiro item. Preservada a proteção contra disputa com scroll-spy. Chromium confirmou pai → primeiro filho, ButtonGroup, cliques rápidos, hash e scroll manual sem oscilação. Log /tmp/uzzina-v35-followup-browser.log. Aguarda conferência do proprietário.

## Reforço do primeiro clique — 04/11/2026

Após relato do proprietário em UAvatar, removida a sincronização por contador separado de navegação. Um único objeto identifica cada pedido e seu destino; a rolagem é medida/disparada no próximo frame após o commit do submenu. Pedido antigo é cancelado quando outro o substitui. Proteção do scroll-spy e retorno ao primeiro filho preservados.

O ensaio isolado inicial já chegou ao destino, portanto não comprovou a reprodução exata da falha no navegador do proprietário. A nova regressão verifica posição real do conteúdo, não apenas seleção: PhaseCombobox → pai UAvatar → UAvatar, UAvatarGroup, troca rápida para UAvatar e Calendar → Button → ButtonGroup chegaram ao deslocamento esperado no primeiro clique. Zero pageerror. Prettier/lint/typecheck aprovados. Log /tmp/uzzina-v35-firstclick-regression-final.log. Aguardando confirmação no navegador do proprietário.

## Causa do segundo clique confirmada — 04/11/2026

Reproduzido no Comet do proprietário e em teste com histórico real: `window.history.replaceState` acionava a rolagem automática do TanStack Router, que cancelava a animação do menu. Testes anteriores com histórico em memória não cobriam esse caminho. Correção usa `useNavigate` com `resetScroll: false` e `hashScrollIntoView: false`, mantendo o posicionamento exclusivamente na galeria. Confirmado um clique ResponsiblesCombobox → pai UAvatar no Comet. Regressão permanente de posição em `scripts/check-ui-sidebar-browser.cjs`, com fixture de histórico real/StrictMode, sem acesso a dados de produção. Detalhes e evidências no [estudo](../../../docs/audits/2026-11-04-v35-selection-flicker-study.md). Aguardando aceite final; sem commit/deploy.
