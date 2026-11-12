# Histórico de tickets encerrados

Consolidado em 04/11/2026. Esta é uma referência histórica; a fila vigente está na [lista ativa](../README.md). Reúne 87 documentos de tickets encerrados/aprovados e 11 da série C00–C10 substituída pela recuperação do Planejamento. Status antigos, pendências de publicação e limites de verificação foram preservados; a consolidação não certifica deploy nem valida novamente entregas.

Os documentos completos abaixo substituem os antigos arquivos individuais. Nenhum conteúdo de ticket foi descartado. Os índices anteriores também foram preservados no final.

## Índice

- [visual-controls · 45 — Modo unstyled dos botões Prism](#visual-controls-issues-45-clean-unstyled-button-mode)
- [today-focus · 01-remove-wrapper-focus](#today-focus-issues-01-remove-wrapper-focus)
- [brand-holidays · 01-classify-holidays](#brand-holidays-issues-01-classify-holidays)
- [safari-mobile · 20-landscape-space-advisory](#safari-mobile-issues-20-landscape-space-advisory)
- [safari-mobile · 16-unify-action-footer-buttons](#safari-mobile-issues-16-unify-action-footer-buttons)
- [safari-mobile · 03-mobile-instagram-editor](#safari-mobile-issues-03-mobile-instagram-editor)
- [media-controls · 01-always-visible-media-controls](#media-controls-issues-01-always-visible-media-controls)
- [brand-holidays · 02-partner-holidays](#brand-holidays-issues-02-partner-holidays)
- [ai-partner-identity · 01-use-current-partner-identity](#ai-partner-identity-issues-01-use-current-partner-identity)
- [visual-controls · 12 — Filtros da busca global](#visual-controls-issues-12-global-search-filters)
- [visual-controls · 36 — Estudo comparativo de avatares](#visual-controls-issues-36-avatar-wrapper-comparison-study)
- [visual-controls · 35 — Navegação lateral por microseções](#visual-controls-issues-35-ui-sidebar-subsections)
- [account-preferences · 01: Rolar Preferências independentemente e manter Salvar Alterações no rodapé](#account-preferences-issues-01-independent-preferences-scroll)
- [account-preferences · 02: Persistir a visualização inicial de Hoje para Home e página dedicada](#account-preferences-issues-02-default-today-view)
- [action-save-recovery · 01: Recuperar salvamento sem confirmação e tornar a duplicação segura](#action-save-recovery-issues-01-save-recovery-and-safe-duplication)
- [action-tabs · 01: Centralizar o painel de ação em um componente pai](#action-tabs-issues-01-action-panel-parent)
- [action-tabs · 02: Abrir e trabalhar com uma segunda ação pela busca](#action-tabs-issues-02-secondary-action-tabs)
- [action-tabs · 03: Exibir duas ações lado a lado em desktop amplo](#action-tabs-issues-03-side-by-side-actions)
- [action-tabs · 04: Filtrar ações por parceiros dentro da busca](#action-tabs-issues-04-search-partner-filter)
- [action-tabs · 05: Criar ação pela busca e combinar rascunho com ação aberta](#action-tabs-issues-05-create-action-from-search)
- [calendar-height · 01: Calendário do parceiro dinâmico com limite opcional](#calendar-height-issues-01-partner-calendar)
- [calendar-height · 02: Home com altura adequada ao resumo semanal e ao mês](#calendar-height-issues-02-home-calendar)
- [calendar-height · 03: Revisar altura e rolagem do calendário do portal](#calendar-height-issues-03-client-calendar-review)
- [dash-local-auth · 01: Normalize the local portal entry to its configured origin](#dash-local-auth-issues-01-canonical-local-origin)
- [keyboard-focus · 01: Navegar pelos campos principais da gaveta de ação](#keyboard-focus-issues-01-action-drawer-focus)
- [keyboard-focus · 02: Usar Toolbar do React Aria na formatação do editor](#keyboard-focus-issues-02-react-aria-editor-toolbar)
- [keyboard-focus · 03: Mapear foco e teclado nas demais telas da UZZINA](#keyboard-focus-issues-03-keyboard-stabilization)
- [notifications · 01: Implementar a página de notificações da equipe](#notifications-issues-01-complete-notifications-page)
- [partner-portal · 01: Corrigir o campo de e-mail, retirar o título do login e reposicionar o controle do feed em /dash](#partner-portal-issues-01-login-fields-and-feed-toggle)
- [safari-mobile · 01: Keep dialogs and searchable selectors reachable above the mobile keyboard](#safari-mobile-issues-01-visible-viewport-overlays)
- [safari-mobile · 02: Give the mobile action drawer more space and a discoverable complete footer](#safari-mobile-issues-02-mobile-action-drawer)
- [safari-mobile · 04: Close notification overlays and honor action guards before page navigation](#safari-mobile-issues-04-notifications-navigation)
- [safari-mobile · 05: Make the leads list and detail usable on phones](#safari-mobile-issues-05-responsive-leads)
- [safari-mobile · 06: Show a consistent responsive date in the dedicated Today heading](#safari-mobile-issues-06-today-responsive-heading)
- [safari-mobile · 07: Open the strategy dialog immediately and show generation progress](#safari-mobile-issues-07-strategy-dialog-progress)
- [safari-mobile · 08: Show profile palette swatches and balance text-control spacing](#safari-mobile-issues-08-profile-swatches-spacing)
- [safari-mobile · 09: Persist strategy generation independently of the action drawer](#safari-mobile-issues-09-durable-strategy-generation)
- [safari-mobile · 10: Load the existing brand web font consistently across browsers](#safari-mobile-issues-10-load-brand-font)
- [safari-mobile · 11: Compare a newer action version on reopen without replacing local edits](#safari-mobile-issues-11-compare-version-on-reopen)
- [safari-mobile · 12: Fit date-picker calendars to the available mobile width](#safari-mobile-issues-12-compact-date-picker-width)
- [safari-mobile · 13: Keep drawer writing reachable and prevent background scrolling on iPhone](#safari-mobile-issues-13-drawer-scroll-and-landscape-writing)
- [safari-mobile · 14: Reduce wasted mobile space and truncate the complete Today date](#safari-mobile-issues-14-mobile-spacing-and-today-heading)
- [safari-mobile · 15: Unify panel tabs and distinguish them from preference pills](#safari-mobile-issues-15-shared-tabs-and-profile-sections)
- [safari-mobile · 17: Keep constrained writing toolbars on one row across Essential and Instagram](#safari-mobile-issues-17-compact-writing-toolbars)
- [safari-mobile · 18: Remove the redundant media-type badge beside Add content](#safari-mobile-issues-18-remove-redundant-media-type-badge)
- [safari-mobile · 19: Use one natural mobile scroll on the celebrations page](#safari-mobile-issues-19-celebrations-responsive-scroll)
- [search-review · 01: Corrigir falhas de carregamento ao criar parceiro e ação](#search-review-issues-01-fix-lazy-module-loading)
- [search-review · 02: Diferenciar criar e gerenciar datas comemorativas](#search-review-issues-02-create-celebration-dialog)
- [search-review · 03: Implementar a página de ajuda e documentação](#search-review-issues-03-complete-help-page)
- [social-planning-corrections · C00: Fechar somente as decisões necessárias às correções](#social-planning-corrections-issues-00-confirm-product-contract)
- [social-planning-corrections · C01: Persistir propostas com autorização e erros recuperáveis](#social-planning-corrections-issues-01-authorized-persistence)
- [social-planning-corrections · C02: Bloquear períodos inválidos e eliminar conteúdos sem slot](#social-planning-corrections-issues-02-validate-period-slots)
- [social-planning-corrections · C03: Restringir comemorações ao período e separar extras](#social-planning-corrections-issues-03-commemorative-date-bounds)
- [social-planning-corrections · C04: Respeitar quantidades manuais de formatos sem ajustes ocultos](#social-planning-corrections-issues-04-respect-format-counts)
- [social-planning-corrections · C05: Gerar propostas reais por IA com contexto e tom corretos](#social-planning-corrections-issues-05-real-ai-generation)
- [social-planning-corrections · C06: Reabrir proposta com configuração e parceiro coerentes](#social-planning-corrections-issues-06-reopen-plan-state)
- [social-planning-corrections · C07: Reutilizar calendário do app e mover somente sugestões](#social-planning-corrections-issues-07-existing-calendar)
- [social-planning-corrections · C08: Corrigir teclado, foco e salvamento do editor de sugestões](#social-planning-corrections-issues-08-suggestion-editor)
- [social-planning-corrections · C09: Finalizar aprovadas atomicamente sem duplicação e para membros](#social-planning-corrections-issues-09-atomic-finalization)
- [social-planning-corrections · C10: Verificar integração e registrar aceite real do Planejamento](#social-planning-corrections-issues-10-verify-correction-series)
- [today-viewport · 01: Aproveitar a altura disponível nas colunas do Kanban de Hoje](#today-viewport-issues-01-today-kanban-height)
- [today-viewport · 02: Separar a página Hoje da Home e rolar somente o conteúdo em todas as visualizações](#today-viewport-issues-02-dedicated-today-page-scroll)
- [visual-controls · 01 — Anéis de foco consistentes (ring-ring/30)](#visual-controls-issues-01-focus-rings)
- [visual-controls · 02 — Tamanhos de texto por tamanho de controle](#visual-controls-issues-02-text-sizes)
- [visual-controls · 03 - Padronizar popovers e containers flutuantes](#visual-controls-issues-03-popovers-and-containers)
- [visual-controls · 04 — Seletor de data da barra de calendário (CalendarToolbar)](#visual-controls-issues-04-calendar-toolbar-date-picker)
- [visual-controls · 05 — Gatilhos do rodapé da gaveta: anatomia única](#visual-controls-issues-05-drawer-footer-triggers)
- [visual-controls · Ajustes da seção Foco (09)](#visual-controls-issues-09-focus-adjustments)
- [visual-controls · 09 — `/ui`: seção "Foco" (REFAZER contra o código atual)](#visual-controls-issues-09-ui-focus-section)
- [visual-controls · 13 — Comboboxes: variant/size do botão e conteúdo](#visual-controls-issues-13-combobox-variants)
- [visual-controls · 14 — `/ui`: seção "Ícones" (vitrine dos ícones usados no app)](#visual-controls-issues-14-ui-icons-section)
- [visual-controls · 15 — Linhas de metadados da aba Essencial: tamanho único e padrão de recolher/expandir](#visual-controls-issues-15-essentials-rows)
- [visual-controls · 16 — `/ui`: matriz de `PartnersCombobox` (tamanho do avatar por tamanho de botão)](#visual-controls-issues-16-ui-partners-combobox-matrix)
- [visual-controls · 17 — `/ui`: playground de propriedades (piloto no `PrismButton`)](#visual-controls-issues-17-ui-props-playground-pilot)
- [visual-controls · 18 — `/ui`: playground de propriedades em todas as seções existentes](#visual-controls-issues-18-ui-props-playground-rollout)
- [visual-controls · 19 — `/ui`: seção "Avatar" (`PrismAvatar`)](#visual-controls-issues-19-ui-prism-avatar-section)
- [visual-controls · 20 — `/ui`: seção "Sheet" (`PrismSheet`)](#visual-controls-issues-20-ui-prism-sheet-section)
- [visual-controls · 21 — `/ui`: seção "ComboboxTrigger"](#visual-controls-issues-21-ui-combobox-trigger-section)
- [visual-controls · 22 — `/ui`: seção "ResponsiblesCombobox"](#visual-controls-issues-22-ui-responsibles-combobox-section)
- [visual-controls · 23 — `/ui`: seção "SprintCombobox"](#visual-controls-issues-23-ui-sprint-combobox-section)
- [visual-controls · 24 — `/ui`: seção "PhaseIcon"](#visual-controls-issues-24-ui-phase-icon-section)
- [visual-controls · 25 — `/ui`: seção "ULoader"](#visual-controls-issues-25-ui-uloader-section)
- [visual-controls · 26 — `/ui`: seção "UToggleInput"](#visual-controls-issues-26-ui-utoggle-input-section)
- [visual-controls · 27 — `/ui`: seção "UPreferenceSwitch"](#visual-controls-issues-27-ui-upreference-switch-section)
- [visual-controls · 28 — `/ui`: seção "UAvatarSelector"](#visual-controls-issues-28-ui-uavatar-selector-section)
- [visual-controls · 29 — `/ui`: seção "UAdminItemCard"](#visual-controls-issues-29-ui-uadmin-item-card-section)
- [visual-controls · 30 — `/ui`: seção "CalendarToolbar"](#visual-controls-issues-30-ui-calendar-toolbar-section)
- [visual-controls · 31 — `/ui`: seção "ColorListEditor"](#visual-controls-issues-31-ui-color-list-editor-section)
- [visual-controls · 32 — `/ui`: seção "ActionDatePicker"](#visual-controls-issues-32-ui-action-date-picker-section)
- [visual-controls · 33 — `/ui`: seção "ActionColorDropdown"](#visual-controls-issues-33-ui-action-color-dropdown-section)
- [visual-controls · 34 — `/ui`: seção "PartnerCelebrationsSelector"](#visual-controls-issues-34-ui-partner-celebrations-selector-section)
- [visual-controls · 37 — Cores por parceiro, formatos e validação no seletor de cor](#visual-controls-issues-37-partner-color-picker-formats)
- [visual-controls · 38 — Editor de paleta com seletor compartilhado e exclusão discreta](#visual-controls-issues-38-palette-editor-shared-color-picker)
- [visual-controls · 39 — Alinhar o seletor de datas comemorativas ao Prism](#visual-controls-issues-39-celebrations-selector-prism-alignment)
- [visual-controls · 40 — Unificar os seletores de responsáveis e Sprint](#visual-controls-issues-40-unify-people-combobox)
- [visual-controls · 41 — Padronizar nomes de componentes próprios com prefixo U](#visual-controls-issues-41-standardize-uzzina-component-names)
- [visual-controls · 42 — Padronizar indicadores de carregamento com ULoader](#visual-controls-issues-42-standardize-loading-indicators)
- [visual-controls · 43 — Substituir UToggleInput por PrismToggle preservando formulário](#visual-controls-issues-43-replace-native-toggle-wrapper)

---

<a id="account-preferences-issues-01-independent-preferences-scroll"></a>

## account-preferences · 01-independent-preferences-scroll

Origem: `.scratch/account-preferences/issues/01-independent-preferences-scroll.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Rolar Preferências independentemente e manter Salvar Alterações no rodapé

**What to build:** Em Minha Conta, manter o cabeçalho e as informações pessoais estáveis enquanto somente o conteúdo de Preferências rola no painel direito. A área Salvar Alterações permanece visível no rodapé desse painel e continua salvando perfil e preferências pelo formulário existente.

**Blocked by:** None (can start immediately). Não depende do ticket02.

**Status:** completed locally — approved by owner; local commit authorized; no deployment requested

## Direção vigente após revisão do proprietário

Substitui o requisito original de rodapé fixo: Salvar Alterações fica no cabeçalho, no lugar do texto auxiliar. Remover barra de salvamento e reserva externa; as duas colunas vão até o fim e cada região mantém seu próprio `AppBarSpacer`. O botão salva o formulário completo; não foi autorizada conversão para autosave. Menu de perfil e comandos de tema da busca já têm autosave; Minha Conta continua com confirmação manual. Critérios originais abaixo são históricos quando conflitarem com esta revisão. Ver resultado atualizado no relatório.

## Resultado em28/10/2026

Implementação autorizada pelo proprietário nesta conversa. Conta com altura contida, regiões independentes e botão de salvar no cabeçalho; seletor de seção abaixo de `lg` preserva campos montados. Validação nativa revela seção pessoal antes de focar campo inválido. Medição existente de Hoje reutilizada via hook compartilhado, sem mudança de lógica. Ver [relatório](../../docs/audits/2026-10-28-profile-preferences-scroll.md) para evidências, verificações e limites; ticket02 permanece adiado. Os critérios abaixo são a especificação original; verificação física de teclado virtual/zoom permanece não executada.

## Contexto e evidências

Pedido do proprietário em28/10/2026, com referência à captura do painel de Preferências na conversa “Criar dois tickets”. A imagem não está disponível neste checkout/contexto para inspeção visual; o diagnóstico abaixo é baseado no código atual, sem reprodução autenticada.

A rota `/app/profile` monta `ProfilePage` com cabeçalho, um único formulário e grade de duas colunas a partir de `lg`. A coluna direita contém tema, paleta, tema personalizado condicional, cores dos clientes, Layout Padrão e sidebar do Instagram. As duas colunas têm altura natural; a linha do botão fica depois da grade, seguida por `AppBarSpacer`. O layout `/app` fornece um ancestral com rolagem vertical, explicando por que o conteúdo da conta cresce como página inteira.

O formulário atual reúne informações pessoais e preferências: `handleSubmit` chama `updateOwnProfile`, depois `updateMyPreferences`, confere a geração de sessão e apresenta toast. `isSubmitting` desabilita o botão e troca o texto para Salvando...; os previews de tema/paleta e o upload já têm comportamento próprio. A AppBar é flutuante e tem reserva definida por `--app-bar-space`.

## Critérios de aceite

- [ ] Em desktop, a rota ocupa a altura útil abaixo do cabeçalho do app sem aumentar a rolagem da página. Rolar Preferências não desloca o título Minha Conta nem a coluna de informações pessoais; todo o conteúdo da coluna direita permanece alcançável.
- [ ] Preferências tem corpo rolável e rodapé estável dentro do próprio painel. Salvar Alterações permanece visível, acima da AppBar, sem sobrepor campos nem esconder o último controle. Evitar uma fixação relativa à janela que escape do painel.
- [ ] A altura acompanha resize e mudanças de conteúdo, incluindo abrir/fechar tema Personalizado, textos maiores e zoom. Não introduzir barra horizontal nem altura rígida baseada em uma única resolução.
- [ ] Abaixo de `lg` e em janelas baixas, adaptar a composição mantendo informações pessoais, preferências e salvamento acessíveis. A página externa continua contida; se a área de informações pessoais também precisar rolar para caber, ela deve ter região própria acessível, sem depender de campos cortados. Conferir pelo menos390px de largura,480/700px de altura e zoom200%.
- [ ] O rodapé continua submetendo o formulário completo, inclusive os campos pessoais e inputs ocultos. Enter e clique mantêm a semântica atual; durante o envio, mostrar Salvando..., impedir submissão duplicada e manter dimensões estáveis. Em falha, conservar valores para nova tentativa e exibir erro; em sucesso, manter confirmação existente. Não ampliar este ticket para tornar as duas escritas atuais transacionais.
- [ ] Tab/Shift+Tab alcançam todos os campos e o botão; foco revela o controle na região correta, sem ficar sob o rodapé. Preservar validação nativa, foco visível, teclado dos seletores/portais e funcionamento do upload. Não criar aprisionamento global de foco.
- [ ] Preservar temas claro/escuro/sistema, paletas, previews e guardas de sessão. O ajuste de rolagem fica restrito à conta; outras rotas e os dois modos de altura do Hoje mantêm seus contratos.
- [ ] Cobrir submissão e estados no componente real e conferir geometria/rolagem em navegador com HTTP controlado, desktop/mobile, temas e conteúdo curto/longo. Registrar evidência de ausência de rolagem externa, alcance do último campo e do botão, inclusive com teclado virtual quando disponível.

## Riscos e limites

- Aplicar somente `overflow-y-auto` sem limitar a cadeia de altura/flex pode manter a rolagem externa. Alterar o contêiner compartilhado de `/app` pode afetar Home, Hoje e gavetas; preferir contenção local.
- Mover o botão para fora do formulário pode perder submissão e validação. Há duas escritas sequenciais: erro de preferências pode ocorrer depois de salvar o perfil; preservar e documentar esse limite atual.
- A reserva externa atual da AppBar pode acrescentar overflow se mantida duplicada na nova altura contida. Em mobile, teclado virtual e coluna empilhada exigem validação própria para não esconder informações pessoais.

## Verificação prevista

Na implementação futura: testes pertinentes no código real, format/lint/typecheck/build, inspeção visual controlada e atualização de CURRENT. Neste registro foram conferidos código e referências; sem implementação, testes/build, banco, commit ou publicação. O proprietário autorizou apenas criar o ticket.

---

<a id="account-preferences-issues-02-default-today-view"></a>

## account-preferences · 02-default-today-view

Origem: `.scratch/account-preferences/issues/02-default-today-view.md`. Classificação: Encerrado/aprovado no registro da série.

# 02: Persistir a visualização inicial de Hoje para Home e página dedicada

**What to build:** Em Minha Conta > Preferências, permitir escolher uma única visualização inicial de Hoje entre Parceiros, Kanban, Categorias e Feed. Salvar a escolha na conta e usá-la tanto no bloco Hoje da Home quanto na página Hoje, mantendo a alternância manual temporária em cada contexto.

**Blocked by:** None (can start immediately). Não depende do ticket01; a preferência pode ser acrescentada ao formulário atual. Se ambos forem executados, coordenar alterações em `ProfilePage`, sem dois executores escrevendo simultaneamente no checkout.

**Status:** completed — owner approved 2026-10-29; frontend published and production RPC applied

## Resultado em28/10/2026

Implementação autorizada após aceite e commit local do ticket01 (`064948e`). Componentes atuais são separados: `HomeTodayView` e `TodayPageView`, compartilhando `TodayViewParts`; as referências ao componente único e `standalone` abaixo são históricas. Ambos agora leem `defaultTodayView` na montagem, preservando alternância manual temporária. Seletor na conta salva explicitamente. Resposta atrasada de tema não substitui o novo campo salvo por outro fluxo.

505 testes/1785 assertions passaram; navegador controlado e PostgreSQL isolado verificaram o fluxo, validação e isolamento. Após recusa inicial da revisão automática, proprietário autorizou explicitamente a alteração SQL. Migration aplicada à produção, versão remota `20261028205047`; catálogo, validação com identidade inexistente e permissões conferidos, sem tocar preferências reais. Bloqueio de SQL resolvido; interface local aguardando avaliação, sem deploy solicitado. Relatório: [visualização inicial de Hoje](../../docs/audits/2026-10-28-today-default-view.md).

## Contexto técnico e pontos de integração

Inspeção do checkout em28/10/2026:

- `HomeTodayView` é compartilhado pela Home `/app/` e pela rota `/app/today`. O estado local `view` inicia sempre em `partners`. O `PrismToggleGroup` oferece `kanban` (Kanban), `categories` (Categorias), `feed` (Feed do Instagram) e `partners` (Parceiros); alternar hoje não persiste nada.
- A Home habilita `linkTitle`; o título leva à página dedicada com a data selecionada. A página dedicada passa `standalone`, controla a data por search param validado e faz sua consulta por dia. A preferência deve mudar a visualização inicial, preservando data, consultas e escopo operacional.
- Kanban tem dois contratos: Home mantém colunas de30vh; página dedicada usa `HomeViewWrapper.fillViewport` e `KanbanPhasesBoard.fillHeight` para ocupar a altura útil, reservar AppBar e rolar por coluna. Os outros modos mantêm altura natural. Feed filtra somente categorias de Instagram compatíveis; uma lista vazia nesse modo não é motivo para trocar automaticamente a escolha.
- `UserPreferences`, `SerializedPreferences` e `getUserPreferences` centralizam tipos, leitura e defaults. O `defaultViewVariant` existente representa Linha/Bloco/Conteúdo dos painéis de clientes; não representa os quatro modos de Hoje. A nova preferência precisa de campo próprio, por exemplo `defaultTodayView`, com validação dos quatro valores e fallback `partners`.
- `ProfilePage` mantém rascunho local e salva explicitamente com `updateMyPreferences`; a confirmação é atribuída a `person.preferences`. `AppContext` fornece `person` e remonta por identidade. Uma atribuição a esse objeto não é, por si, notificação reativa: conferir a leitura da confirmação na próxima montagem e não depender de um efeito que sobrescreva a escolha manual em todo render.
- `updateMyPreferences` usa a RPC `update_my_preferences(p_patch)`. O SQL versionado valida uma lista fechada de chaves e rejeita chaves desconhecidas; faz merge em `people.preferences`, autorizado por `auth.uid()` e membro ativo. Portanto, não basta adicionar o campo no frontend: preparar evolução incremental da validação da RPC preservando os contratos atuais. A definição efetivamente publicada precisa ser conferida no futuro rollout; não foi consultada nesta investigação.
- `usePreferencePersistence`/`createPreferencePersistence` atendem os controles de cabeçalho/busca com debounce250ms, escrita serializada, último patch por campo, retry e guardas de identidade. O novo seletor deve respeitar o salvamento explícito da conta; não transformar os toggles manuais de Hoje em autosave. Preservar coexistência dos patches e campos desconhecidos já armazenados.

## Critérios de aceite

- Preferências apresenta seletor acessível “Visualização inicial do Hoje” com as quatro opções existentes, explicando que vale para o bloco da Home e a página Hoje. O rótulo diferencia esta escolha do Layout Padrão dos clientes.
- A seleção é rascunho até Salvar Alterações. Apenas abrir, selecionar sem salvar ou sair da tela não grava o novo campo. Sucesso confirma o valor canônico; envio bloqueia repetição; falha mantém rascunho e permite tentar novamente, sem anunciar persistência bem-sucedida.
- Salvar persiste por usuário em `people.preferences` pelo model/RPC existente, sem escrita direta pela rota/componente. O contrato aceita somente `partners`, `kanban`, `categories` e `feed`; patches inválidos são recusados e autorização/merge/campos existentes são preservados. Preparar migration incremental e distinguir SQL preparado de SQL aplicado.
- Sem campo salvo, ou com valor ausente, nulo ou inválido no registro legado, ambos os contextos iniciam em Parceiros, preservando o padrão atual. Não reutilizar `defaultViewVariant` nem criar preferências separadas por contexto.
- Após salvar, cada nova montagem de Hoje na Home ou na página dedicada inicia pela mesma preferência confirmada, inclusive ao recarregar, sair/entrar na conta ou abrir outro navegador com a mesma conta. Nenhum estado local de outro usuário determina o modo inicial.
- Alternar manualmente continua imediato e local à instância aberta, sem alterar a preferência persistida nem sincronizar forçadamente outra instância. A seleção manual permanece ao mudar data, filtros, dados da consulta, rerender ou resize durante essa montagem; sair/remontar volta ao padrão salvo. Uma resposta tardia não desfaz uma escolha manual já feita.
- Salvar um novo padrão passa a valer na próxima abertura/montagem; sair da conta ou trocar identidade descarta operações antigas. Patches de tema/paleta em paralelo não apagam o novo campo, nem o novo campo sobrescreve outras preferências.
- Preservar link de título e data selecionada, navegação de datas, filtros/escopo de parceiros operacionais, seleção múltipla e edição de ações. Os modos continuam usando os mesmos componentes e filtros, inclusive Feed vazio.
- Ao iniciar em Kanban, respeitar Home compacta versus página standalone com altura útil/rolagem por coluna; nos outros modos preservar altura natural e reserva da AppBar. Preferências de altura dos calendários continuam independentes e não persistidas.
- Testes no código real cobrem os quatro valores nos dois contextos, fallback legado/inválido, salvar/erro/retry, remontagem/recarga, alternância manual após atualização de dados/data, merge e troca de sessão. Reaproveitar a cobertura existente de persistência e navegação de Hoje; acrescentar verificação do novo contrato da RPC em ambiente autorizado, sem fixtures de escrita em produção.
- Conferir seletor e os dois contextos em desktop/mobile e temas com HTTP controlado. Antes de publicar frontend dependente da nova chave, verificar compatibilidade da RPC no ambiente de destino e registrar evidência distinta de teste local, banco e deploy Ready.

## Riscos e decisões de escopo

- Frontend com a nova chave diante da RPC antiga gera erro Unknown preference key e pode falhar depois de o perfil já ter sido salvo. O rollout deve tratar essa dependência dentro deste ticket, sem pressupor migrations aplicadas.
- Um efeito que reaplique o default em cada mudança de `person.preferences` pode desfazer alternância manual; usar semântica de inicialização por montagem/identidade, com confirmação disponível no bootstrap.
- Estado de preferências e callbacks antigos podem misturar usuários ou perder patches. Preservar isolamento por identidade e geração, retornos canônicos e merge autorizado.
- O ajuste não cria visualizações, não muda o padrão dos painéis de clientes e não persiste automaticamente a última visualização manual. Não há dependência funcional do ticket01.

## Verificação deste registro

Componentes, rotas, tipos/defaults, model, controlador de persistência, SQL versionado e testes existentes foram inspecionados. Sem alteração funcional, execução de testes/build, consulta/escrita de banco, migration aplicada, commit ou publicação. Somente a criação deste ticket foi autorizada.

## Owner acceptance — 2026-10-29

Owner explicitly approved and closed this delivery. Production deployment `dpl_99LPVHqzaaqxJ4m5UQ4LF4JSa8Mg` is READY on `uzzina.cnvt.com.br`, commit `c1d18b8`. Earlier findings and limits above describe the implementation history; they do not reopen this ticket or certify additional tests. No functional change or SQL in this acceptance update.

---

<a id="action-save-recovery-issues-01-save-recovery-and-safe-duplication"></a>

## action-save-recovery · 01-save-recovery-and-safe-duplication

Origem: `.scratch/action-save-recovery/issues/01-save-recovery-and-safe-duplication.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Recuperar salvamento sem confirmação e tornar a duplicação segura

**What to build:** quando uma ação existente for salva e a confirmação se perder, permitir recuperar o estado confirmado sem perder a edição local, criar cópia ou sobrescrever alterações concorrentes. Ao duplicar explicitamente, impedir envio durante salvamento/erro/conflito, proteger contra ativação repetida e informar o resultado antes de fechar a ação correta.

**Blocked by:** Not applicable — closed by owner; original scope retained only as historical context.

**Status:** closed-not-planned — owner decision 2026-10-29; isolated incident, insufficient evidence of recurrence and unfavorable cost-benefit; no implementation

## Encerramento pelo proprietário — 29/10/2026

O proprietário decidiu encerrar o ticket sem implementar: o caso conhecido é pontual, não há evidência suficiente de recorrência e o custo/complexidade não se justificam. Não tratar como correção entregue; nenhuma mudança funcional foi feita. O escopo original abaixo permanece apenas como histórico, fora da fila de execução. Reabrir somente por nova solicitação apoiada em nova evidência; não criar automaticamente um ticket menor de duplicação.

## Origem e evidência

Em17/10/2026, o proprietário relatou um problema com “Segurando o burger”, do Toro. O diagnóstico encontrou original e cópia persistida. Às13:00:04 uma atualização foi aceita; às13:00:10 uma atualização com a mesma versão anterior recebeu conflito; às13:00:14 houve leitura do original e criação de outra ação pelo fluxo de duplicação. Horários de Fortaleza.

Não há evidência de Atualizar ter se convertido automaticamente em Duplicar. Os registros não identificam gesto físico, atalho ou intenção. Teste controlado demonstrou que uma escrita aplicada cuja resposta se perde pode fazer a próxima tentativa conflitar com a própria gravação; não provou que essa foi a única causa do caso real.

Inspeção em29/10 confirmou que o coordenador ainda preserva versão antiga quando não recebe confirmação, bloqueia a persistência em conflito até comparação e mantém o patch local. O botão Duplicar dispara a mutação antes de pedir fechamento e não aguarda o resultado. Estes são os comportamentos a reproduzir no código real antes da mudança.

## Experiência esperada

1. O usuário edita uma ação existente e salva.
2. Se a confirmação falhar, permanece na ação com texto e alterações preservados. A mensagem não afirma sem evidência que outra pessoa editou.
3. Ao conferir/tentar novamente, o aplicativo consulta a versão canônica autorizada e compara o estado enviado, a base conhecida e a edição local atual.
4. Se for seguro reconhecer o resultado já persistido, atualiza a confirmação e a versão sem reenviar a mesma atualização; alterações feitas depois do envio continuam pendentes.
5. Se houver divergência real ou não for possível concluir com segurança, mantém comparação/decisão explícita e não sobrescreve automaticamente.
6. Duplicar é operação explícita separada. Com edição não confirmada ou estado de erro/conflito, a interface orienta resolver o salvamento primeiro. Quando liberada, uma ativação produz uma operação em voo, mostra progresso e só comunica sucesso após confirmação canônica.

## Critérios de aceite — recuperação

- [ ] Reproduzir escrita aplicada/resposta perdida no coordenador e na gaveta reais; o teste deve falhar pelo comportamento atual, sem copiar a implementação para a fixture.
- [ ] Recuperar somente ação existente, pela mesma identidade e escopo autorizados. Atualização continua sendo UPDATE com ID e versão; nenhum erro pode produzir INSERT, Duplicar ou um novo rascunho.
- [ ] Distinguir base confirmada, snapshot efetivamente enviado e alterações locais posteriores. Não limpar todo o patch nem trocar o formulário pela resposta de leitura.
- [ ] Reconhecer o estado já persistido apenas quando a comparação for segura. Igualdade de horário ou conteúdo isolado não prova autoria; sem histórico de operação, não afirmar que a escrita foi necessariamente deste navegador.
- [ ] Se a versão canônica divergir, ou houver ambiguidade em campo relevante, preservar a comparação explícita existente. Não aplicar rebase automático apenas para fazer um retry passar.
- [ ] Edição durante a recuperação permanece local; caso haja próximo envio, ele usa a versão confirmada correta e somente mudanças ainda necessárias.
- [ ] Falha de leitura/rede mantém campos, erro e possibilidade de nova conferência; não apresenta sucesso falso nem gera loop de retry/polling.
- [ ] Mensagens em português distinguem confirmação incerta, falha de acesso/rede e versão diferente. Não atribuir toda divergência a outra sessão/pessoa.
- [ ] Fechamento, navegação e Sair continuam respeitando as guardas; não descartar rascunho para resolver erro.

## Critérios de aceite — duplicação

- [ ] Conferir todos os pontos existentes de duplicação, incluindo botão e Shift+D, para que nenhum contorne a proteção quando a mesma ação tem edição não confirmada. Preservar os atalhos válidos de listas/cartões e não capturar texto digitado como comando.
- [ ] Na gaveta, bloquear duplicação durante salvamento, recuperação, erro, conflito, alterações não confirmadas ou outra duplicação em voo. Explicar brevemente o motivo quando necessário; rascunho sem ID não oferece duplicação.
- [ ] Uma ativação por clique/teclado envia uma operação. Clique duplo, tecla repetida e alternância de foco não iniciam outra cópia enquanto a primeira está pendente. A proteção vale entre entradas do mesmo app para a mesma ação, não apenas no botão visível.
- [ ] Aguardar resultado antes de anunciar sucesso/fechar. Cópia confirmada recebe identidade distinta e o sufixo existente; manter data, parceiros e regras atuais de cópia.
- [ ] Falha preserva original, edição e painel aberto; não chama fechamento como se tivesse concluído.
- [ ] Se a duplicação já enviada ficar sem confirmação, apresentar resultado incerto e não repetir automaticamente um INSERT. Não prometer deduplicação global ou exactly-once entre dispositivos sem mecanismo persistente comprovado; necessidade de SQL/idempotência adicional exige desenho e escopo explícitos antes de aplicar.
- [ ] Não fechar o outro painel, promover a secundária nem perder alterações surgidas durante a operação. Se a ação de origem mudou/foi substituída enquanto aguardava, confirmação antiga não fecha o formulário atual.
- [ ] Atualizar listas/cache só após confirmação canônica, preservando versões mais recentes e invalidação de escopo desconhecido; sem restaurar snapshots completos após falha antiga.

## Identidade, concorrência e limites

- [ ] Validar identidade/geração/montagem antes de ler, escrever e aplicar resultado. Logout/troca de pessoa/substituição de painel invalida callbacks antigos; não afirmar que reset desfaz escrita já enviada.
- [ ] Manter atualização baseada em versão, formatação/sanitização da comparação e isolamento entre principal/secundária. Não relaxar RLS ou permissões.
- [ ] Não transformar campos de ação em autosave novo, adicionar confirmação genérica a toda operação nem reestruturar a arquitetura sem necessidade concreta.
- [ ] Não alterar, apagar ou deduplicar registros reais do caso Toro; a investigação histórica não autoriza limpeza de dados.

## Verificação necessária na execução

Testes de comportamento no código real, controlando somente a fronteira externa, devem cobrir:

- Escrita aplicada com resposta perdida; recuperação compatível sem novo UPDATE/INSERT desnecessário.
- Escrita não aplicada; retry seguro quando autorizado, sem declarar gravação anterior inexistente.
- Outra sessão alterando o mesmo campo e campos diferentes; ambiguidade e comparação preservadas.
- Edição adicional durante envio/recuperação; confirmação antiga não apaga o valor mais novo.
- Falha de leitura, ação sem acesso, troca de sessão e resposta posterior à troca de ação/painel.
- Duplicação pendente/sucesso/falha/resultado incerto; clique repetido e atalho; bloqueio em erro/conflito.
- Duas ações abertas, painel ativo, guardas de fechamento e cache de listas após resposta canônica.

Executar testes pertinentes, format/lint/typecheck/build e verificação serverless quando o escopo efetivo exigir. No navegador, usar HTTP controlado para cenários de rede/confirmação sem criar fixtures em produção. Distinguir teste controlado de certificação do banco/provedor. Não salvar capturas no checkout. Atualizar documentação vigente e status com os resultados reais.

## Entrega e autorização

Uma entrega vertical: estado de salvamento/consulta canônica → decisão segura/erro → comandos de duplicação → cache/guardas → testes. Não separar API, banco e UI em tickets horizontais. Nenhuma migration é presumida necessária. Criar este ticket não inicia implementação, não autoriza SQL remoto, chamadas reais de escrita, commit, push ou deploy.

## Cost-benefit review — 2026-10-29

Owner questioned the scope because only one incident is known in roughly two years. Recommendation delivered: defer full automatic recovery; existing version/comparison protections and local edits remain. A recovery path limited to errors need not slow healthy saves, but safe reconciliation adds substantial concurrency/state maintenance and an extra read can fail on the same connection. No benchmark or real incidence rate was measured.

A small duplication safeguard and neutral wording may have better cost-benefit as a separate, explicitly authorized scope. Do not implement the original broad ticket automatically or treat this recommendation as owner approval of the smaller change. Existing diagnostics/conflict/save tests rerun:18 PASS,81 assertions; no automatic INSERT caused by retry of an update in the controlled regression. No new production queries/writes or SQL.

---

<a id="action-tabs-issues-01-action-panel-parent"></a>

## action-tabs · 01-action-panel-parent

Origem: `.scratch/action-tabs/issues/01-action-panel-parent.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Centralizar o painel de ação em um componente pai

**Blocked by:** nenhum.

**What to build:** abrir, editar, salvar e fechar uma ação com o comportamento atual preservado, usando o novo pai para posição, exibição, comando de saída e guardas. Preparação anterior à mudança funcional, conforme a skill.

**Status:** tested-locally-by-owner — no issue reported

## Acceptance criteria

- [x] Um único formulário reutilizado, sem cópia da implementação.
- [x] Posicionamento controlado pelo pai; larguras distintas preservadas.
- [x] Abertura por busca/cards/notificações/criação/duplicação preservada, assim como rascunhos e retorno de foco.
- [x] Overlay, Escape e X passam pelo fechamento seguro; salvar não dispara mais de uma vez.
- [x] Texto, arquivos, erro, conflito e IA continuam ligados à mesma instância durante suas atualizações.
- [x] Testes dos componentes reais verificam comportamento antes/depois e os caminhos afetados. Conferência visual com uma ação e verificação de teclado.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

401 tests, format/lint/typecheck/build and diff passed. Real Chromium with controlled HTTP checked desktop/mobile, themes and existing drawer operations. No real database/provider validation or publication. See docs/audits/2026-10-27-action-panel-parent.md. Ticket 02 has not started.

---

<a id="action-tabs-issues-02-secondary-action-tabs"></a>

## action-tabs · 02-secondary-action-tabs

Origem: `.scratch/action-tabs/issues/02-secondary-action-tabs.md`. Classificação: Encerrado/aprovado no registro da série.

# 02: Abrir e trabalhar com uma segunda ação pela busca

**Blocked by:** 01 — Centralizar o painel de ação em um componente pai.

**What to build:** abrir a segunda ação com Shift na busca, alternar entre duas por abas e trabalhar nas duas sem perda de estado. Esta etapa usa abas em todas as larguras; 03 acrescenta apresentação simultânea no desktop como evolução visual separada.

**Status:** completed-locally — opening validated by owner; closing follow-up implemented

## Acceptance criteria

- [x] Controle dos espaços nomeado primaryAction/secondaryAction, entrada compartilhada initialAction e consumidores anteriores migrados de setBaseAction para setPrimaryAction.

- [x] No máximo duas instâncias completas do mesmo formulário, com identidade estável e estados independentes.
- [x] Clique/Enter/Espaço comuns abrem/substituem principal. Shift+clique/Enter/Espaço nos resultados de ações abrem/substituem secundária; sem nenhuma aberta, abrem principal.
- [x] Selecionar registro já aberto apenas foca o existente. Com apenas secundária aberta, abertura comum preenche principal e Shift substitui secundária.
- [x] Demais entradas continuam comuns; sem abertura secundária fora da busca ou controles para ausência de teclado.
- [x] Abas alternam a ação visível sem remontar a outra; abas internas permanecem completas.
- [x] X fecha sua ação sem promoção da outra; secundária isolada permanece editável e sem marcador obrigatório de ação 2.
- [x] Overlay e Escape fecham ambas pelo mesmo fluxo seguro, sem fechamento parcial quando uma guarda bloquear. Overlays internos preservam seu próprio Escape.
- [x] Sem botão conjunto; X individuais fecham apenas sua própria ação.
- [x] Salvar atinge apenas a ação em foco; troca de sessão limpa ambas e resultados antigos não interferem na identidade seguinte.
- [x] Testes reais reproduzem a matriz de abertura, guardas, estado independente, salvamento e teclado; verificação visual da alternância, inclusive em tela estreita.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

432 tests, format/lint/typecheck/build passed. Chromium with controlled HTTP checked 1440px/390px, modifiers, independent state/saving, draft identity, safe close/retry, logout and real theme controls. No real database/provider writes or publication. Evidence: docs/audits/2026-10-27-two-action-tabs.md. Tickets05/03/04 have not started.

## Owner review

Abertura confirmada como correta pelo proprietário. Overlay fecha; Escape fecha fora do Tiptap, mas não dentro dele: pendente reproduzir e identificar consumo do evento. Abas mantidas. Nova orientação visual substitui o CircleX da secundária por um X comum ao lado das abas superiores, somente com duas ações, com title HTML “Fechar todas as ações”. Sem implementação desse ajuste nesta rodada. Lado a lado permanece ticket03, ainda não iniciado.

## Closing follow-up completed

X individuais preservados. X conjunto movido para junto das abas externas, com title HTML nativo e sem CircleX; alternar ações mantém o controle no mesmo lugar. Teste real falhou antes do ajuste e passou depois.68 testes pertinentes, format/lint/typecheck/build passaram; Chromium desktop/mobile com HTTP controlado validou fechamento e posição. Escape investigado no navegador e no código instalado: prosemirror-view captureKeyDown consome keyCode27; editHandlers.keydown chama preventDefault. Painel respeita esse consumo; nenhuma mudança no teclado do editor. Sem banco real, SQL, push/deploy. Próxima etapa: ticket03, antes de05 por orientação do proprietário.

Decisão final do proprietário: botão de fechar todas removido, para não depender da barra externa ao chegar ao lado a lado. Somente Escape/overlay fazem fechamento conjunto; X individuais permanecem. Substitui orientações anteriores sobre CircleX ou X junto às abas. Remoção implementada localmente, sem iniciar ticket03.

---

<a id="action-tabs-issues-03-side-by-side-actions"></a>

## action-tabs · 03-side-by-side-actions

Origem: `.scratch/action-tabs/issues/03-side-by-side-actions.md`. Classificação: Encerrado/aprovado no registro da série.

# 03: Exibir duas ações lado a lado em desktop amplo

**Blocked by:** 02 — Abrir e trabalhar com uma segunda ação pela busca.

**What to build:** aproveitar telas amplas para consultar/editar as duas ações simultaneamente, mantendo abas quando não houver espaço.

**Status:** completed — accepted by owner; local commit authorized

## Acceptance criteria

- [x] Grupo ancorado à direita, principal à esquerda e secundária à direita; uma ação isolada permanece à direita.
- [x] Larguras diferentes por aba preservadas. Limiar para lado a lado considera duas na maior largura e área utilizável; não depende da aba interna atualmente selecionada.
- [x] Abaixo do limiar, inclusive em desktop, uma visível por vez com abas.
- [x] Resize e mudança de aba interna preservam instâncias, texto, rolagem quando viável e ação ativa, sem remontagem ou gravações extras.
- [x] Conteúdo e Legenda conservam imagem/texto utilizáveis em cada painel; conferir breakpoints internos pelo espaço disponível, sem reformulação adicional.
- [x] Foco/atalhos e os dois caminhos de fechamento conjunto (Escape/overlay), sem botão conjunto continuam corretos com ambas visíveis.
- [x] Testes reais da transição e preservação de estado, mais verificação visual em combinações Essencial/Instagram/Observações, Conteúdo/Legenda e temas.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

438 tests in41 files, format/format:check/lint/typecheck/build passed against an isolated copy of the selected commit content. Controlled Chromium checked1440px/390px and2560px with1855/1856 boundary, both themes, image/caption composition, preserved DOM/text/scroll on resize, scoped saving, individual close and logout. Stable threshold1856px; widths672/896px. No database/provider writes. Local commit authorized; no push/deploy. External Today/AppBar/layout changes excluded. See docs/audits/2026-10-28-side-by-side-actions.md.

Owner follow-up: layout validated; Instagram reduced to3xl/768px and the side-by-side threshold to1600px (2×768+64). Essential stays672px. Relevant73 tests and format/lint/typecheck/build passed; previous verification above describes the original1856px release. No new commit or deployment for this follow-up.

## Owner acceptance

Proprietário confirmou que o resultado final está correto, incluindo Instagram3xl/768px e limiar1600px, e autorizou encerrar o ticket03 e criar o commit local. Sem push/deploy. Ticket05 permanece a próxima entrega, sem início automático.

---

<a id="action-tabs-issues-04-search-partner-filter"></a>

## action-tabs · 04-search-partner-filter

Origem: `.scratch/action-tabs/issues/04-search-partner-filter.md`. Classificação: Encerrado/aprovado no registro da série.

# 04: Filtrar ações por parceiros dentro da busca

**Blocked by:** nenhum. Pode ser entregue com uma ação aberta; executar depois de 03 é organização do trabalho, não bloqueio técnico.

**What to build:** buscar ações de todos, um ou vários parceiros sem sair da página atual, com filtro reiniciado em cada abertura.

**Status:** completed — approved by owner on 2026-10-28

## Acceptance criteria

- [x] Filtro existe somente dentro da busca. Na abertura em página de parceiro, inicia com ele; nas demais páginas, sem seleção específica, buscando em todos os disponíveis.
- [x] Fechar/reabrir reinicia o filtro pelo contexto atual, sem memória.
- [x] Reutilizar o seletor de parceiros existente com suporte opcional a Todos os parceiros; seleção vazia representa todos, selecionar Todos limpa restrição e remover último selecionado volta a todos.
- [x] Um/vários parceiros filtram ações de qualquer um dos selecionados, mantendo os limites de autorização existentes.
- [x] Shift no seletor continua seleção exclusiva; Shift nos resultados de ações mantém a intenção secundária quando 02 estiver presente.
- [x] Alterar filtro atualiza a consulta sem manter uma restrição escondida pelo parceiro da rota e sem alterar calendário, rota ou atribuição de parceiros.
- [x] Consumidores atuais do seletor mantêm seus comportamentos. Busca por título e demais limites permanecem; por solicitação posterior, Incluir arquivadas agora é opcional e desligado em cada abertura.
- [x] Testes do seletor, busca e model reais com fronteira externa controlada verificam todos/um/vários, reset, ausência de vazamento para outros filtros e proteção contra resposta antiga após mudança de seleção.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

453 tests in43 files passed, including10 new tests with real components/model and SDK/controlled HTTP. Format/format:check/lint/typecheck/build passed; known chunk warning remains. Controlled Chromium checked1440px/390px and the two-action flow with cross-partner Shift opening. Evidence and limits are recorded in docs/audits/2026-10-28-global-search-partners.md. No SQL, real database writes, commit or publication. Ticket05 remains future.

Owner-requested follow-up: controls moved below results without the “Ações de” label; added opt-in Incluir arquivadas, reset off on each opening. Model defaults to archived=false and includes archived records only when enabled. Extra trigger/popover rings removed locally for the search selector, preserving keyboard focus background.455 tests and format/lint/typecheck/build passed; browser evidence in the audit. No commit or deployment.

Owner approved the final filter, archive scope and regular control weights on 2026-10-28. Ticket04 closed locally; no commit or publication requested.

---

<a id="action-tabs-issues-05-create-action-from-search"></a>

## action-tabs · 05-create-action-from-search

Origem: `.scratch/action-tabs/issues/05-create-action-from-search.md`. Classificação: Encerrado/aprovado no registro da série.

# 05: Criar ação pela busca e combinar rascunho com ação aberta

**What to build:** oferecer o comando Criar ação na busca global, preservando o atalho atual de criação. Permitir consultar uma ação existente enquanto cria outra, ou abrir uma ação existente enquanto mantém um rascunho aberto, usando os dois espaços já definidos.

**Blocked by:** 02 — Abrir e trabalhar com uma segunda ação pela busca. Não depende do filtro de parceiros nem do layout simultâneo de desktop; deve funcionar primeiro na alternância por abas.

**Status:** completed — tested by owner in primary and secondary panels; approved on 2026-10-28

## Acceptance criteria

- [x] Criar ação aparece como comando da busca global com busca vazia e pode ser localizado pelo seu nome; não depende de encontrar ações existentes.
- [x] Clique/Enter/Espaço no comando cria um rascunho no espaço principal, com a mesma regra de substituição e guarda de saída já definida.
- [x] Shift+clique/Enter/Espaço no comando cria o rascunho no espaço secundário, preservando a principal. Sem nenhuma ação aberta, cria na principal. Com a secundária ocupada, respeita sua guarda antes da substituição.
- [x] O atalho atual de criação continua disponível, com sua abertura comum na principal; não criar outro atalho nem mudar sua combinação.
- [x] Com um rascunho principal aberto, abrir resultado existente com Shift mantém o rascunho e abre a secundária. Com ação existente aberta, Shift no comando Criar ação mantém essa ação e abre o novo rascunho.
- [x] Limite de duas entradas vale também para rascunhos. Cada rascunho possui identidade própria; ausência de ID do banco continua identificando ação ainda não criada.
- [x] Criar o rascunho reutiliza os defaults e o contexto de criação atuais. O filtro exclusivo da busca continua apenas filtrando resultados, sem atribuir parceiros automaticamente ao rascunho.
- [x] Abrir o comando não faz INSERT por si só. Persistência segue o fluxo existente de criação/salvamento e as guardas de rascunho.
- [x] Ao confirmar criação e receber versão canônica/ID, a ação permanece no mesmo espaço e conserva seu estado; a outra entrada não é remontada, substituída ou fechada. Não duplicar INSERT em blur/clique/fechamento concorrentes.
- [x] X, fechamento conjunto, descarte incompleto, falhas e conflitos preservam os contratos dos dois espaços. Alternar abas e mudar a largura não descarta texto pendente.
- [x] Testes nos componentes reais cobrem comando comum/Shift, atalho preservado, os dois sentidos de rascunho+ação existente, identidade após INSERT, limites e saída bloqueada; conferir apresentação e teclado da busca com HTTP controlado.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Localhost uses production; browser fixtures must control external HTTP and must not create production test records. Review this delivery before proceeding. No automatic push or deploy.

## Local result

466 tests in43 files passed; format/format:check/lint/typecheck/build passed with the known chunk warning. Controlled Chromium checked the new command with both real forms and preserved creation shortcut. See docs/audits/2026-10-28-search-create-action.md for evidence and limits. No SQL, real writes, commit or deployment.

## Additional commands authorized on 2026-10-28

Owner authorized every command in docs/plans/global-search-command-candidates.md. Implemented profile, three theme modes, home/today/notifications/leads/help, sign-out and admin-only creation/list commands. Navigation and sign-out validate both leave guards; theme persistence survives closing search, supports retry and preserves the palette. 491 tests passed, plus format/lint/typecheck/build and controlled Chromium at1440px/390px, with screenshots inspected. Owner review of this extension remains pending. No commit or deploy.

## Owner review follow-up

On 2026-10-28 the owner accepted the remaining commands but reported dynamic import failures when creating actions and partners, duplicate celebration commands and missing help content. Deferred follow-up tickets are recorded under the search-review feature; notifications already has its own ticket. Do not mark this creation flow fully accepted until the reported loading failure is resolved and verified. No fixes authorized in this registration turn.

---

<a id="calendar-height-issues-01-partner-calendar"></a>

## calendar-height · 01-partner-calendar

Origem: `.scratch/calendar-height/issues/01-partner-calendar.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Calendário do parceiro dinâmico com limite opcional

**What to build:** o calendário do parceiro abre com altura conforme as ações e permite ativar “Limitar altura dos dias”. Poucos itens ocupam pouco espaço; dias cheios passam a rolar apenas quando o limite está ativado. A última ação e a última semana permanecem acessíveis, com ou sem feed lateral.

**Blocked by:** None (can start immediately).

**Status:** complete — implementado, aprovado pelo proprietário e publicado em16/10; deploy de código Ready.

- [x] Linha, Bloco e Conteúdo iniciam com altura automática, sem reservar 288/384 px e sem esconder ações após o quinto item.
- [x] Um único controle “Limitar altura dos dias” funciona nos três modos. Trocar o modo preserva a escolha de altura durante a montagem da tela; não adicionar persistência ou SQL.
- [x] A política compartilhada tem padrão automático e admite uma escolha inicial explícita pela tela, sem novo sistema de configuração. A separação mínima entre tamanho e truncamento ocorre junto desta entrega, sem refatoração ampla.
- [x] Cada semana se ajusta ao dia mais alto, preservando alinhamento dos sete dias. Semanas com menos conteúdo podem ser menores, sem equalizar o mês inteiro.
- [x] Com limite, cada dia cresce até o teto acordado; poucos itens não forçam a altura máxima. Referência proposta: 384 px, respeitando espaço útil de janela baixa. Registrar o teto efetivamente validado.
- [x] Cabeçalho do dia, criação e comemorações permanecem acessíveis. As duas listas do modo Conteúdo compartilham uma única área de rolagem de ações; imagens não ficam inacessíveis após carregar.
- [x] A navegação vertical do painel alcança a última semana; rolagem horizontal mobile e feed independente continuam funcionando. Sem cortar conteúdo silenciosamente.
- [x] Antes da correção, reproduzir o defeito pertinente no componente real e incluir regressão que falhe no comportamento anterior. Testar menu, mais de cinco ações, preservação de modo/limite e ausência de regressões em outros consumidores da lista compartilhada.
- [x] Verificar geometria e rolagem no navegador com dias vazios/cheios, títulos longos, imagens, comemorações, janela baixa e celular; verificar teclado, seleção e arraste com lista rolada, preservando horário e comportamento de salvamento.
- [x] Atualizar demonstração existente de opções na galeria, contratos documentados e estado atual. Executar testes pertinentes, format, lint, typecheck e build. Distinguir código local de publicação; deploy não faz parte deste ticket.

## Resultado

Verificação e limites registrados em `docs/audits/2026-10-16-calendar-height-study.md`: suíte geral com379 testes, verificações de código/build aprovadas e navegador com componentes reais/HTTP controlado. Sem SQL. Código publicado pelo commit `2d4add5`, deploy `dpl_6M2QW5dxu34RoFyHUUCU1pTKERdk` Ready; domínio /app respondeu HTTP200.

---

<a id="calendar-height-issues-02-home-calendar"></a>

## calendar-height · 02-home-calendar

Origem: `.scratch/calendar-height/issues/02-home-calendar.md`. Classificação: Encerrado/aprovado no registro da série.

# 02: Home com altura adequada ao resumo semanal e ao mês

**What to build:** a Home mensal abre dinâmica; o resumo semanal abre com limite máximo ativado para não ocupar a página inteira em semanas cheias. Em ambos, o usuário pode ligar ou desligar “Limitar altura dos dias”. Os padrões são proposta para aprovação nesta divisão.

**Blocked by:** 01 — Calendário do parceiro dinâmico com limite opcional.

**Status:** complete — implementado, aprovado pelo proprietário e publicado em16/10; deploy de código Ready.

- [x] Semana inicia limitada e mês inicia automático, reutilizando a mesma política e o mesmo controle do calendário do parceiro.
- [x] Manter uma escolha de altura independente por período durante a montagem da Home: ao retornar à semana/mês, preservar o que o usuário escolheu naquele período. Sem persistência adicional ou efeito que sobrescreva a escolha a cada renderização.
- [x] Semana vazia ou com poucos itens continua baixa; semana cheia cresce até o teto e permite chegar à última ação de cada dia.
- [x] Mês não mantém truncamento em cinco ações nem altura fixa por causa do antigo modo compacto. Os sete dias permanecem alinhados em cada semana.
- [x] Remover o teto externo conflitante de 50vh ou substituí-lo pela política compartilhada, sem sobrepor limites que recortem cabeçalho, ações ou comemorações.
- [x] Página continua alcançando as seções seguintes e a última semana; não criar uma rolagem vertical do calendário inteiro além da página e da lista limitada do dia.
- [x] Preservar ordenação, criação, seleção e arraste; não incluir mudança da preferência global de Linha/Bloco/Conteúdo neste ticket.
- [x] Incluir testes nos componentes reais para defaults, alternância entre períodos, escolha do usuário e acesso a mais de cinco ações. Reproduzir antes da correção qualquer recorte tratado neste ticket.
- [x] Conferir no navegador Home semana/mês, poucos/muitos itens, comemorações, janela baixa e celular; registrar última ação acessível e navegação até as outras seções. Executar testes pertinentes, format, lint, typecheck e build; atualizar documentação. Sem deploy neste ticket.

## Resultado

Verificação e limites registrados em `docs/audits/2026-10-16-calendar-height-study.md`: suíte geral com379 testes, verificações de código/build aprovadas e navegador com componentes reais/HTTP controlado. Sem SQL. Código publicado pelo commit `2d4add5`, deploy `dpl_6M2QW5dxu34RoFyHUUCU1pTKERdk` Ready; domínio /app respondeu HTTP200.

---

<a id="calendar-height-issues-03-client-calendar-review"></a>

## calendar-height · 03-client-calendar-review

Origem: `.scratch/calendar-height/issues/03-client-calendar-review.md`. Classificação: Encerrado/aprovado no registro da série.

# 03: Revisar altura e rolagem do calendário do portal

**What to build:** verificar se o portal permite acessar todas as ações e semanas dentro do painel disponível, no desktop e no celular. Entregar evidência e uma conclusão; corrigir somente defeitos de altura/recorte reproduzidos nesse fluxo, quando este ticket for autorizado para execução.

**Blocked by:** None (can start immediately). A implementação do portal é independente do calendário da equipe.

**Status:** complete — implementado, aprovado pelo proprietário e publicado em16/10; deploy de código Ready.

- [x] Comparar semana/mês com poucos e muitos itens, feed visível/oculto no desktop e abas calendário/feed no celular, incluindo janela baixa, imagens carregadas e títulos longos.
- [x] Registrar qual elemento efetivamente rola, suas dimensões e o acesso à última ação e à última semana. Diferenciar defeito reproduzido de hipótese de inspeção textual.
- [x] Recomendação a validar: painel limitado à janela, grade com rolagem vertical e dias dimensionados pelo conteúdo, sem piso artificial de 120 px nem preenchimento obrigatório que produza espaço vazio. Não introduzir limite ou menu por dia apenas para imitar a equipe.
- [x] Se já houver acesso correto ao conteúdo e o espaço observado for justificado pelo layout, encerrar com evidência e recomendação, sem refatoração preventiva.
- [x] Se houver defeito reproduzido, aplicar a menor correção na cadeia de altura/rolagem, com regressão no componente real antes da correção e conferência posterior no navegador. Mudança de política visual além do escopo descrito exige nova decisão, não implementação automática.
- [x] Preservar feed, abertura da ação e renderização pública de conteúdo sem providers privados. Nenhuma mudança de autenticação, API ou SQL.
- [x] Registrar resultado e limites na documentação. Se houver código, executar testes pertinentes, format, lint, typecheck e build; se for apenas revisão, conferir referências e diff. Sem deploy neste ticket.

## Resultado

Verificação e limites registrados em `docs/audits/2026-10-16-calendar-height-study.md`: suíte geral com379 testes, verificações de código/build aprovadas e navegador com componentes reais/HTTP controlado. Sem SQL. Código publicado pelo commit `2d4add5`, deploy `dpl_6M2QW5dxu34RoFyHUUCU1pTKERdk` Ready; domínio /app respondeu HTTP200.

---

<a id="dash-local-auth-issues-01-canonical-local-origin"></a>

## dash-local-auth · 01-canonical-local-origin

Origem: `.scratch/dash-local-auth/issues/01-canonical-local-origin.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Normalize the local portal entry to its configured origin

**Status:** closed — owner approved portal access on2026-11-01 after the requested origin-rule removal (`a714b2d`, already committed/published). No further local-login acceptance pending. The separately requested login appearance alignment is tracked in its own implementation report; earlier normalization requirements below remain superseded.
**Priority:** P2 — local development portal access blocked through localhost; published portal works according to owner. Not a confirmed production outage.
**Blocked by:** none for the reproduced origin failure. A credentialed failure at the canonical address, if separately reported, requires its own response evidence before expanding scope.

## Outcome

Opening the portal locally through a supported loopback alias leads to the configured canonical local address before entering credentials. The login then uses one origin for the form, API and HttpOnly cookie, with the existing credential/session flow. Preserve exact origin validation and the working published portal.

## Evidence and confirmed cause

[Diagnosis and exact HTTP reproduction](../../docs/audits/2026-10-31-dash-local-origin-diagnosis.md). Local APP_ORIGIN is `http://127.0.0.1:5176`; requests with Origin `http://localhost:5176` receive403 “Origem da requisição não autorizada.” before account lookup. Origin127.0.0.1 reaches400 “E-mail e senha são obrigatórios.” for the same intentionally empty login. Crossing request Host/Origin twice confirmed that status follows Origin, not DNS or the request hostname. Anonymous verify reached401 on both. No valid login or actual cookie lifecycle was certified.

The UI maps403 to a generic login error, obscuring the local-address mismatch. Multiple accounts encounter the same gate because it runs before credential comparison. Current configuration/CSRF behavior is intentional; fix local entry consistency, not account permissions or password hashes.

## Bounded implementation direction

Prefer a local-adapter canonicalization for GET document requests to `/dash` and `/dash/login`, before SPA/form mounting. Resolve the trusted target from configured APP_ORIGIN, restrict this behavior to the local runtime and validated loopback aliases on the same configured port, and preserve path/query. Published handlers retain exact Origin enforcement. Keep public review links and unrelated routes unchanged unless a demonstrated dependency requires including them.

No blanket localhost allowlist, wildcard origin, arbitrary Host-derived redirect, production guard relaxation, credentials forwarding between origins, new auth provider or new account/session model. Do not silently redirect a local request to a production domain. LAN/phone addresses are not automatically authorized by binding the server to all interfaces; a separately requested LAN setup needs an explicit configured origin.

## Acceptance

- [x] Add a real HTTP/browser regression first: local portal document entry through localhost is canonicalized before the login form sends a request; it preserves the intended portal path/query and settles without a redirect loop.
- [x] Canonical127.0.0.1 entry remains direct. If a supported canonical loopback configuration uses localhost instead, behavior follows that explicit configuration rather than a hardcoded address.
- [x] Preserve strict API guards: direct POSTs with an unknown/missing origin or wrong port still fail; localhost POST is not silently accepted merely because it resolves to loopback. A canonical empty login reaches normal400 validation, and cookie-less verify returns401.
- [x] The local-only behavior cannot activate in deployed Vercel handlers. Published login/logout retain exact configured-origin comparison and existing cookie security.
- [x] With controlled account/database boundaries, valid login sets the existing HttpOnly cookie and verify resumes the correct account; invalid credentials remain distinguishable. No alias change mixes cookies/cache with another account.
- [x] Any remaining origin failure gets an actionable, safe explanation or canonical-entry guidance rather than being presented as a credential failure. Limit messaging changes to the demonstrated local problem; do not expose private configuration or refactor all portal errors.
- [x] Preserve team Supabase Auth, public review tokens, multiple partner scope, session revocation and authorization. No changes to client credentials, database grants, RLS or production envs.
- [x] Reuse the existing launcher/local API adapter and tests. Keep owner's5176 server/cache untouched; use a temporary isolated cache/port for automated regressions and never forward successful fixture logins to production.
- [x] Run pertinent tests, format/lint/typecheck/build and the7 packaged serverless checks if server/API imports are touched. Record controlled runtime, real credentialed/device validation and publication separately.

## Execution and handoff

Inspect CURRENT/Git and only this ticket's dependencies. The primary files are `server/dev-api.ts`, the existing Vite local plugin/launcher, `api/dash-auth.ts`, `server/dash-session.ts`, and the login error branch. Choose the smallest implementation that satisfies the stated entry behavior; prove its local-runtime boundary before changing shared guards. Any uncertainty about local runtime detection must be resolved against the actual launcher, not inferred from Vite mode alone.

The initial authorization covered diagnosis/ticket preparation; the owner subsequently authorized implementation and emphasized that normal team login works and only local portal login is affected. No manual server restart, env change, real-account login, migration, commit, push or deploy has been performed. The former visual portal ticket remains closed and is not reopened by this separate local access issue.

## Implementation and verification — 2026-10-31

`server/dev-api.ts` redirects supported local HTML document entries to the validated APP_ORIGIN with307/no-store before SPA mounting. Same-port loopback aliases only; path/query retained, no redirect on canonical entry, no normalization with VERCEL, unknown hosts, nonlocal/invalid configured targets, API/POST, team routes or public review. Strict API origin validation and published authentication are unchanged. A403 login response now gives safe address guidance;401/503 behavior remains distinct.

Real HTTP regression:4 failing redirect cases before correction,25 passing afterward, including the canonical and reverse-alias configuration, paths outside scope, Vercel boundary and actual handler guard responses. Existing authentication/session suite38pass; portal-client/content suite10pass. Actual built frontend plus real adapter passed6 browser groups: normal team form/address preserved; two controlled portal accounts; canonical request origin; HttpOnly cookie/reload/logout;401/403/503 presentation. External APIs are intercepted and the test server asserts that no backend loader ran. Live local anonymous GETs on5176 passed10 entry checks without changing the running process.

Format/lint/typecheck/build and7 packaged serverless checks passed. Existing informational font-test lint and large chunks remain. New tests use isolated ephemeral ports; browser server closes automatically. See [diagnosis and implementation report](../../docs/audits/2026-10-31-dash-local-origin-diagnosis.md#correction-authorized-and-prepared).

---

<a id="keyboard-focus-issues-01-action-drawer-focus"></a>

## keyboard-focus · 01-action-drawer-focus

Origem: `.scratch/keyboard-focus/issues/01-action-drawer-focus.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Navegar pelos campos principais da gaveta de ação

**What to build:** na aba Essencial, abrir a ação com foco no título e percorrer Título → Descrição → Parceiros → Status/Fase → Tipo/Categoria → Cor, quando disponível → Criar/Atualizar. Shift+Tab percorre o caminho inverso. Calendário, seletores e diálogos abertos mantêm seu teclado próprio. Usar React Aria para delimitar e gerenciar o foco da ActionFormDrawer, preservando o comportamento de edição e salvamento.

**Blocked by:** None.

**Status:** completed — owner confirmed normal focus navigation in production on Mac.

- [x] Abertura de rascunho e de ação existente inicia no título. Atualizações, consultas e salvamentos não roubam o foco do usuário.
- [x] Tab e Shift+Tab percorrem os destinos principais na ordem definida, sem índices positivos e ignorando destinos ausentes/desabilitados.
- [x] Responsáveis, ID, data, estratégia, anexos, toolbar, sprint, duplicar e arquivar não criam paradas intermediárias no percurso principal. Exclusão do percurso não desabilita os controles.
- [x] A gestão é local à aba Essencial; eventos de portais, popovers, diálogos, outras abas e widget externo não são capturados indevidamente.
- [x] Dentro de listas/tabelas da descrição, Tab sai para Parceiros e Shift+Tab retorna ao título sem alterar recuo, célula ou linhas. Os comandos de edição desses conteúdos permanecem disponíveis.
- [x] Abrir um seletor preserva busca, setas, Enter e seleção exclusiva por Shift. Abrir data preserva navegação do calendário e edição do horário; fechamento retorna ao gatilho.
- [x] Data usa sublinhado no foco, como seu hover e o estilo de Adicionar arquivo. Botões Prism que já possuem indicador preservam esse estilo.
- [x] Antes de excluir acesso sequencial aos auxiliares, documentar e validar uma forma de acessá-los pelo teclado, incluindo fechar e trocar abas. O acesso à formatação pode continuar provisoriamente existente, fora do percurso principal; sua substituição fica no ticket02.
- [x] Verificar limites do percurso e retorno ao controle que abriu a gaveta. Não introduzir contenção ou ciclo novo sem registrar a decisão de comportamento.
- [x] Registrar campos sem sinalização e aqueles com foco pouco perceptível; aparências ainda não definidas pelo proprietário não são inventadas neste ticket.
- [ ] Testes exercitam os componentes reais e falham no comportamento anterior, incluindo conteúdo simples, lista/tabela, percurso inverso e overlays. Conferência visual cobre claro/escuro, desktop/mobile e rodapé com overflow.
- [x] Testes pertinentes, format, lint, typecheck e build passam. Resultado distingue implementação local de eventual publicação; nenhum SQL ou alteração de autorização é necessário.

**Scope boundary:** não migrar a navegação de outras telas nem mudar automaticamente os consumidores compartilhados do editor. Dependência direta de React Aria deve ser declarada se seus hooks forem importados diretamente.

**Basis:** decisões do proprietário na conversa de14/10/2026 e avaliação da gaveta. Ticket local aprovado na conversa; implementação do ticket01 autorizada pelo proprietário.

## Implementation status — 14/10/2026

Primary navigation is implemented locally using React Aria FocusScope/useFocusManager. Alt+F10 switches between the primary sequence and all controls; the shortcut is shown in the drawer. The title keeps autofocus; the date trigger uses an underline on keyboard focus. No new styles were chosen for fields awaiting the owner’s decision. Toolbar replacement remains ticket02.

363 tests / 1060 assertions passed, including13 new drawer keyboard cases. Browser verification is pending because automatic browser approval review failed due to a usage limit. This does not certify theme, viewport, visual overflow, or browser-specific rendering. No push/deploy or database changes.

Format, lint, typecheck, build, diff checks and7 serverless checks passed. The remaining acceptance item is the browser verification of themes, viewports and overflow.

## Production publication — 14/10/2026

The owner authorized publication and will test visually with real data. Code commit `ac170df7bfcc983317dd639c42367d380cf37621` was pushed to main. Vercel deployment `dpl_AefHT1xWqjpNhCM9QDU26J6TKwBC` reached READY in production and is aliased to `uzzina.cnvt.com.br`; /app returned HTTP200. No database changes. Visual verification remains open.

## Owner verification — 14/10/2026

The owner confirmed that the focus flow works normally with real data and authorized starting ticket02. On Mac the all-controls shortcut uses Option+Fn+F10 according to the current keyboard configuration. The owner requested hiding the bottom shortcut notice; it is now hidden without layout space and the shortcut remains active. Missing focus indicators on some auxiliary controls are tracked separately in ticket03.

---

<a id="keyboard-focus-issues-02-react-aria-editor-toolbar"></a>

## keyboard-focus · 02-react-aria-editor-toolbar

Origem: `.scratch/keyboard-focus/issues/02-react-aria-editor-toolbar.md`. Classificação: Encerrado/aprovado no registro da série.

# 02: Usar Toolbar do React Aria na formatação do editor

**What to build:** operar a barra de formatação com teclado usando Toolbar do React Aria, mantendo Tiptap como editor, os comandos atuais e a aparência da UZZINA. A formatação continua fora do percurso principal da gaveta e pode ser acessada por um atalho documentado; após navegar pelos comandos, Tab retorna à descrição.

**Blocked by:** None — ticket01 completed and owner authorized ticket02.

**Status:** completed — verified locally and published to production with READY confirmed.

- [x] Substituir a gestão própria dos botões pela Toolbar do React Aria já disponível na biblioteca instalada, preservando editor, conteúdo, ícones, estados e comandos.
- [x] Um atalho sem conflito permite ir da descrição à formatação; seu uso é descobrível na interface. Setas navegam pelos comandos sem alterar o texto.
- [x] Enter/Espaço executam o comando selecionado e preservam a seleção de texto necessária para formatar. Após aplicação, o usuário pode continuar escrevendo.
- [x] Tab da toolbar retorna à descrição. A integração não adiciona a formatação entre Título e Descrição nem entre Descrição e Parceiros.
- [x] O foco do comando é visível e distinto do estado ativo de uma formatação, usando os tokens Prism. Comandos têm nomes acessíveis e estados adequados.
- [x] Desfazer/Refazer e transições de habilitação não deixam o foco perdido; navegação funciona também quando a barra quebra em linhas.
- [x] O menu flutuante e os comandos de tabela continuam acessíveis e não interceptam o percurso principal. Verificar sua presença com texto selecionado.
- [x] Verificar os outros usos do editor compartilhado, incluindo conteúdo do Instagram e administração de parceiro. Política específica da gaveta não se espalha automaticamente para eles.
- [x] Se a solução introduzir um novo primitivo Prism reutilizável, documentá-lo e incluí-lo na galeria de componentes; evitar essa abstração caso a integração local seja suficiente.
- [x] Testes nos componentes reais cobrem acesso por atalho, navegação, aplicação de comandos, retorno ao texto, comandos desabilitados e integração com o percurso do ticket01. Conferência visual cobre claro/escuro e desktop/mobile.
- [x] Testes pertinentes, format, lint, typecheck e build passam; registrar implementação local e publicação separadamente.

**Scope boundary:** não substituir Tiptap, instalar Base UI ou redesenhar a toolbar. Não implementar uma barra global para todas as telas.

**Basis:** escolha do proprietário de manter React Aria e adaptar a toolbar, na conversa de14/10/2026. Ticket publicado para planejamento; execução ainda não iniciada.

## Implementation — 14/10/2026

Main and contextual toolbars use React Aria Toolbar/Button while retaining Tiptap commands. Arrow keys navigate; Enter/Space apply formatting and return to the text; Tab returns directly to the editor. Main toolbar shortcut: Alt+Shift+F10. Visible selection/table toolbar shortcut: Alt+Shift+F9. Commands expose accessible names, pressed states for toggles, focus indicators and reactive history availability.

The all-controls notice is hidden and takes no layout space. Contextual toolbar buttons are excluded from the ordinary drawer Tab sequence and remain reachable by shortcut.

374 tests /1120 assertions passed, including11 new cases across the real drawer and editor. Format/lint/typecheck/build passed. Isolated browser checks covered keyboard arrows, main/context shortcuts, Tab return, a390px viewport with two toolbar rows, no space from the hidden notice, and a3px ring in the real default dark palette. These checks do not certify the complete authenticated Instagram/admin routes, every palette/browser or backend/provider behavior. No database changes.

## Production publication — 14/10/2026

Code commit `d02890dddcabd35266b241f88bd8f238306661e7` was pushed to main. Vercel deployment `dpl_Z7EqUShipFARDZpwWA5WbpcwPSFG` reached READY in production and is aliased to `uzzina.cnvt.com.br`. The public /app responded HTTP200. Further owner verification with real data remains useful; no database changes were made. Other missing focus indicators remain ticket03.

---

<a id="keyboard-focus-issues-03-keyboard-stabilization"></a>

## keyboard-focus · 03-keyboard-stabilization

Origem: `.scratch/keyboard-focus/issues/03-keyboard-stabilization.md`. Classificação: Encerrado/aprovado no registro da série.

# 03: Mapear foco e teclado nas demais telas da UZZINA

**What to build:** entregar uma revisão verificável de foco e teclado das telas atuais, com cenários aprovados, falhas reproduzidas e correções propostas por prioridade. Preservar os fluxos da gaveta/toolbar já aprovados pelo proprietário e não iniciar correções gerais durante o levantamento.

**Blocked by:** None (can start immediately). Tickets01 e02 da gaveta/toolbar já concluídos; independente de recuperação de salvamento, uso de IA e Planejamento. Teste físico do Safari será feito pelo proprietário em outro chat e não bloqueia o inventário inicial.

**Status:** completed-review — owner authorized review 2026-10-29; all 11 surface families inspected; findings and priorities delivered; no functional corrections applied

## Contexto e limite do aceite anterior

O ticket foi registrado em14/10 para uma revisão futura além da gaveta. Em29/10, o proprietário confirmou vários testes manuais e aprovou o comportamento que já exercitou. Esse aceite continua válido: não reabrir gaveta/toolbar nem presumir novos defeitos por falta de cobertura documentada. Posteriormente pediu preparar este ticket de revisão das demais telas para continuidade futura. Este documento substitui o escopo/status anterior do mesmo ticket, sem duplicar a fila.

A revisão entrega diagnóstico e propostas. Não é migração de biblioteca, refatoração do design system ou compromisso de implementar tudo que for encontrado.

Checklist abaixo indica escopo revisado e registrado no relatório, não aprovação integral de todos os cenários. Cobertura por navegador/estado, falhas e casos não testados estão discriminados na matriz da entrega.

## Telas e cenários de cobertura

- [x] Entrada, recuperação e redefinição de senha: campos, links, envio, mensagens e foco após validação; sem trocar senhas reais para produzir uma fixture.
- [x] AppBar e menu do perfil: links, menus, itens de comando, abertura/fechamento e retorno ao acionador.
- [x] Busca global: foco inicial, texto com espaços, setas entre resultados/comandos, Enter/Espaço após navegação, Shift, filtro de parceiros e opção de arquivadas; seletores/portais mantêm seus próprios eventos.
- [x] Home, Hoje e parceiro: datas, visualizações, calendário/listas, ações focáveis, seletores e regiões com rolagem. Identificar gestos sem alternativa de teclado em vez de afirmar que uma já existe.
- [x] Minha Conta: campos pessoais, preferências, tema/personalização, seções mobile, validação que revela campo inválido, Salvar e controles de foto/upload.
- [x] Datas comemorativas, para administrador: lista, criação/edição, título, seletores de mês/ano, grade, erro vazio, Enter/Escape e retorno. Respeitar a ordem visual anterior → mês → ano → próximo já definida.
- [x] Notificações e Ajuda: ações da lista, leitura, carregar anteriores, erros/retry quando reproduzíveis, índice/seletor e links sem perda da região de rolagem.
- [x] Leads: seleção da lista, filtros existentes, detalhe e retorno; não inventar edição/recursos ausentes.
- [x] Administração: listas/formulários de parceiros, pessoas e contas externas, responsáveis/permissões existentes, salvar/cancelar, popovers e diálogos. Conferir disponibilidade por papel.
- [x] Editores e anexos fora do percurso principal já aprovado: links, seleção/tabelas, menções, barras de formatação, seletores, upload externo, remoção/reordenação quando disponíveis.
- [x] Portal do cliente e revisão pública: entrada, calendário/abas, conteúdo, comentários/anexos disponíveis, overlays e estados de acesso. Não depender de providers privados da equipe no conteúdo compartilhado.

## Critérios comuns a cada fluxo

- [x] Registrar foco inicial, Tab/Shift+Tab, indicador visível, ordem coerente, setas quando aplicáveis e ativação por Enter/Espaço conforme o controle. Distinguir foco, hover, seleção e estado ativo.
- [x] Overlays internos recebem teclado sem acionar a página por trás; Escape fecha primeiro o elemento que o consumiu; fechamento devolve foco a um destino útil e existente.
- [x] Digitação em texto/editor não dispara atalhos de ação. Não usar contenção global de foco ou captura global de Tab como correção presumida.
- [x] Identificar controles inacessíveis, sem nome acessível, fora da tela ou sem destino de retorno; separar problema funcional de preferência visual.
- [x] Preservar contratos React Aria/Prism e o percurso principal da gaveta aprovado, inclusive acesso auxiliar e atalhos das toolbars. Não exigir repetir toda a gaveta para encerrar uma outra tela.
- [x] Registrar tema, papel/sessão, navegador e viewport da observação. Claro/escuro, viewport estreito e Safari só contam como testados quando efetivamente executados.

## Método e entregáveis

- [x] Inventário de fluxos em tabela, cada um com situação: verificado sem falha, falha reproduzida, inspeção estática apenas, não aplicável ao papel ou não testado. Não transformar ausência de ensaio em defeito confirmado.
- [x] Para cada falha: tela/controle, passo a passo mínimo, resultado observado/esperado, impacto e evidência reproduzível. Capturas temporárias ficam fora do projeto.
- [x] Priorizar bloqueio de operação, perda de foco/edição e atalhos indevidos antes de ajustes cosméticos. Não usar prioridade alta apenas por se tratar de acessibilidade.
- [x] Para cada correção proposta, definir comportamento final, limite de escopo, teste de regressão viável, dependências reais e critério de aceite. Agrupar por fluxo utilizável, não por biblioteca/camada.
- [x] Entregar relatório e fila proposta para decisão do proprietário, sem aplicar correções nem abrir uma sequência infinita de tickets automaticamente.
- [x] Se nenhum problema reproduzível for encontrado, declarar esse resultado dentro da cobertura realizada; não inventar trabalho para justificar o ticket.
- [x] Manter testes físicos do Safari/telefone como resultado externo futuro, sem certificar essa cobertura por simulação de viewport. Incorporar a informação quando o proprietário a trouxer, se pertinente.

## Verificação e limites operacionais

Preferir navegação sem escrita e dados/HTTP controlados quando o fluxo exigir alteração. Localhost usa o banco real de produção: não criar pessoas, mudar permissões, marcar notificações reais ou comentar em conteúdos reais só para exercitar foco. Inventariar dependências de conta/papel/link sem solicitar credenciais já disponíveis.

Esta entrega é de diagnóstico/documentação: conferir referências e diff; não criar testes que apenas repitam texto. Testes de regressão e format/lint/typecheck/build serão necessários nas futuras correções autorizadas, não por existir esta lista. Sem SQL, mudança de biblioteca, alteração funcional, commit ou publicação autorizados por este ticket.

## Review result — 2026-10-29

The owner explicitly authorized executing this diagnostic. Inspection and representative keyboard navigation covered all11 surface families using the compiled application, controlled Auth/REST/API fixtures and blocked external connections. Report delivered with coverage matrix, observed behavior, five finding groups, priorities and proposed regression criteria. Existing drawer/toolbar approvals preserved; no product code, SQL, permissions or production data changed. The checked scope above records completion of the review and its coverage matrix, not certification of every possible browser/state.

Findings: creation controls remain invisible on keyboard focus; per-file removal in media manager depends on hover; several icon controls lack accessible names; some inputs/editors lack associated labels; Lead contact has redundant nested focus targets. Report distinguishes runtime evidence from source inspection, successful sampled flows and untested cases, including external upload and Safari. VoiceOver/screen-reader testing is explicitly out of scope by owner decision; no separate ticket exists for it. Future corrections require a separate owner decision; no new correction tickets opened automatically.

## Owner scope clarification — 2026-10-29

Owner acknowledged finding K01 about the plus button and requested clarification of K02. K02 concerns the application-owned Gerenciar conteúdo dialog, opened by the file-count button in Instagram, not the Cloudinary upload widget. The observation is keyboard-specific: per-file removal is hidden outside hover, so Tab does not reach it. Touch behavior was not established by this observation and must not be reported as broken. Safari/mobile work is handled in another chat. Do not expand this review into changes to the Cloudinary widget. VoiceOver/screen-reader testing is excluded from further work; no standalone VoiceOver ticket was found or created. No additional functional change authorized by this clarification.

---

<a id="notifications-issues-01-complete-notifications-page"></a>

## notifications · 01-complete-notifications-page

Origem: `.scratch/notifications/issues/01-complete-notifications-page.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Implementar a página de notificações da equipe

**What to build:** ao abrir Notificações pela busca global ou pelo link Ver todas as notificações do sino, a pessoa encontra suas notificações, identifica as não lidas e consegue abrir a ação mencionada e marcar notificações como lidas. Reaproveitar a consulta, cache e operações existentes do sino, sem recriar o sistema de notificações.

**Blocked by:** None (can start immediately). Independente dos tickets de duas ações/busca; os links para a página já existem.

**Status:** completed — owner approved 2026-10-29; published to production; future needs require a new ticket

## Confirmed finding

Em28/10/2026 o proprietário relatou a página vazia durante a conferência dos novos comandos. A renderização isolada do componente real confirmou apenas texto provisório, sem lista, consulta ou controles. A página ainda não foi implementada; o comando da busca aponta para o destino correto. O sino já possui listagem, contador, abertura da ação e operações de leitura. Não foi consultado o banco real, portanto não há conclusão sobre existência ou entrega de notificações para a conta do proprietário.

## Acceptance criteria

- Substituir o texto provisório por uma página utilizável, acessível pelo comando Notificações e por Ver todas as notificações no sino, sem exigir perfil de administrador.
- Consultar apenas notificações da pessoa autenticada, ordenadas das mais recentes para as antigas; exibir autor, ação, trecho legível e data, diferenciando lidas/não lidas.
- Reaproveitar os models, hook/cache e políticas atuais; componentes/rotas não acessam diretamente as tabelas. Troca de sessão não expõe dados nem aplica respostas da identidade anterior.
- Abrir a ação relacionada pelo fluxo comum da principal, respeitando guardas e tratando ação indisponível/sem acesso com mensagem apropriada.
- Oferecer marcar como lida e marcar todas como lidas, sincronizando lista e contador do sino. Erros não apresentam sucesso falso nem descartam a leitura atual.
- Distinguir carregamento, nenhuma notificação e falha de consulta, com possibilidade de tentar novamente. Ausência de dados não deve parecer página quebrada.
- Não apresentar o limite atual de40 itens como histórico completo: permitir acessar os registros anteriores se existirem, sem redesenho adicional do fluxo.
- Conferir desktop/mobile, temas, teclado, área rolável e reserva da AppBar com os componentes existentes.
- Teste na rota real falha com a implementação provisória e passa após a entrega; verificar consulta/leitura/erro, abertura da ação, sincronização com sino e isolamento de sessão com fronteira externa controlada.

## Verification and limits

Executar testes pertinentes, format/lint/typecheck/build e conferência de navegador com HTTP controlado. Localhost usa produção: não criar fixtures nem marcar notificações reais como lidas durante os testes. Preservar autorização do destinatário e acesso à ação no servidor/banco. Nenhuma mudança de schema presumida. Atualizar CURRENT e contratos/KI aplicáveis ao implementar. Sem commit, publicação ou início automático autorizados por este registro.

## Owner acceptance — 2026-10-29

Owner explicitly approved and closed this delivery. Production deployment `dpl_99LPVHqzaaqxJ4m5UQ4LF4JSa8Mg` is READY on `uzzina.cnvt.com.br`, commit `c1d18b8`. Earlier findings and limits above describe the implementation history; they do not reopen this ticket or certify additional tests. No functional change or SQL in this acceptance update.

The owner accepts notifications as delivered and will open a separate ticket if needed. Extended real-world coverage is not a closure blocker and no follow-up ticket was opened automatically.

---

<a id="partner-portal-issues-01-login-fields-and-feed-toggle"></a>

## partner-portal · 01-login-fields-and-feed-toggle

Origem: `.scratch/partner-portal/issues/01-login-fields-and-feed-toggle.md`. Classificação: Encerrado/aprovado no registro da série.

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

- [Login](../../app/routes/dash/login.tsx): o e-mail monta `PrismInputGroupInput` isolado; a senha monta o mesmo componente dentro de `PrismInputGroup`. Em [input-group](../../app/components/prism/input-group.tsx), o input interno remove fundo/borda/ring próprios porque a superfície e os estados visuais pertencem ao grupo. Usá-lo sem o grupo explica a diferença mostrada. Corrigir a composição local com os primitivos existentes, preservando os demais consumidores.
- O título rejeitado é um `h1` explícito no login. A solicitação se refere a esse texto; não determina remoção da instrução “Informe seu e-mail e senha para acessar.” nem mudança do botão “Entrar no Portal”.
- [Página inicial do portal](../../app/routes/dash/index.tsx): o botão `SidebarClose` usa `absolute top-4 left-4 z-50`, fora dos ramos mobile/desktop. Seus ancestrais de layout até o cabeçalho não estabelecem um contêiner posicionado local; ele pode alcançar a área do avatar do [layout /dash](../../app/routes/dash.tsx). A estrutura é compatível com a sobreposição do print; a geometria final deve ser reproduzida em navegador antes da correção.
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
- Regressão permanente em [check-dash-layout-browser.cjs](../../scripts/check-dash-layout-browser.cjs), sobre o build real com HTTP controlado e rede externa bloqueada. Antes: quatro falhas de superfície/altura do e-mail, quatro de botão indevido no mobile e quatro de sobreposição ao cabeçalho. E-mail media29px em390px/27px em1440px, sem fundo/arredondamento; senha48px. Depois:13 grupos passaram (campos claro/escuro, login por teclado/erro/pendência/sucesso e layout/alternância do feed), mais redimensionamento mobile→desktop. Viewports390/1023/1024/1440px, um/dois parceiros e nome mais longo; verificados foco visível do e-mail, ausência de interseção com cabeçalho/controles de data, estado e carregamento direto da URL de sidebar.
- `bun test tests/portal-client.test.ts tests/portal-actions.test.ts tests/content-portal.test.tsx`:39 pass/0 fail. `bun run format`, `bun run lint`, `bun run typecheck` e `bun run build` passaram. Lint mantém um aviso informativo preexistente em `tests/font-loading.test.ts`; build avisa sobre chunks grandes.
- Chromium automatizado com CSS real; sem Safari/aparelho físico, login real, banco ou provedor. Não certifica autenticação do servidor, que não foi alterada. O servidor de preview isolado foi encerrado ao terminar; servidor do proprietário e alterações externas preservados. Sem SQL, push ou deploy.

Reprodução: gerar o build (`bun run build`), servir com `vite preview` em127.0.0.1:5188 e executar `node scripts/check-dash-layout-browser.cjs`. O script aceita `PORTAL_TEST_URL`, `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE`; exige Playwright/Chromium disponíveis. Somente o HTTP da aplicação é simulado: componentes, roteador e estilos são os reais.

## Limites da entrega

Um ticket local com duas frentes de correção relacionadas ao portal, implementadas após autorização do proprietário. Não inclui redesenho completo do login/cabeçalho, novos recursos, alterações de autenticação, banco ou publicação. A análise geral de estilo permanece em trabalho separado; esta correção não depende de executá-la. Os critérios acima preservam o roteiro de aceite; a evidência executada e seus limites estão registrados neste resultado.

## Owner acceptance — 2026-10-31

Owner stated that the portal is already validated and authorized closing/committing this delivery. Login presentation and feed-control adjustments are accepted for the exercised scenarios; no repeat generic portal validation is required. Implementation already belongs to `eb2cd35`; this update records closure, not additional functional work or test execution. Publication remains separate.

The separately reported multi-user access failure remains an investigation note without a ticket; this presentation acceptance does not establish its cause or silently close that independent report. Shared-tabs ticket15 retains its non-portal acceptance scope.

---

<a id="safari-mobile-issues-01-visible-viewport-overlays"></a>

## safari-mobile · 01-visible-viewport-overlays

Origem: `.scratch/safari-mobile/issues/01-visible-viewport-overlays.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Keep dialogs and searchable selectors reachable above the mobile keyboard

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for the exercised overlay scope; not published. Drawer background/landscape follow-up is tracked separately.
**Original proposal:** item 1. **Priority:** high.
**Blocked by:** none.

## Problem and evidence

Owner screenshots IMG_9848.PNG and IMG_9855.PNG show search results and the celebration calendar covered by the iPhone keyboard. The owner reports the same behavior in partner/phase selectors. This is not accepted as an unavoidable platform limitation.

## Deliverable

Adapt search, dialogs and searchable selectors to the currently visible viewport. Keep margins, usable scrolling and reachable controls through focus, keyboard opening/closing, Safari toolbar movement and orientation changes. Inspect existing React Aria behavior before adding shared viewport handling; avoid applying overlapping compensation twice.

## Acceptance

- [ ] Inventory the actual consumers: global search, its partner filter, drawer partner/phase/category/responsible/sprint selectors where searchable, celebration dialog and strategy dialog. Record which need changes and which already work.
- [ ] Measure visible height and vertical offset when needed, with a fallback; do not infer the keyboard solely from a fixed height or assume dvh alone solves it.
- [ ] Center dialogs when they fit; when taller than the available space, keep an outer margin and scrollable content. Inputs, results and final controls remain reachable.
- [ ] Anchor popovers to their triggers, adjusting position/height to available space; do not force anchored selectors to the center.
- [ ] Keep minimum side margins on all dialogs, including strategies; consumer width classes must not override the mobile viewport limit.
- [ ] Preserve focus, selection, typed query and current month across viewport changes; restore geometry after keyboard dismissal without jumps or leftover blank regions.
- [ ] Preserve React Aria dismissal/focus, nested overlays, search reset, session isolation and existing drawer keyboard contracts. Do not disable zoom or add global keyboard traps.
- [ ] Cover small phones, iPhone 15 Pro Max, portrait/landscape, iPad with/without hardware keyboard and desktop Safari. Desktop and two-panel layouts remain usable.

## Verification

Reproduce on the real components with controlled HTTP and test viewport resize/offset and overlay lifecycle at the necessary boundary. Device validation must include reaching the last result and footer with the keyboard open. Desktop emulation alone does not certify iOS Safari. Follow the shared execution requirements in ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-02-mobile-action-drawer"></a>

## safari-mobile · 02-mobile-action-drawer

Origem: `.scratch/safari-mobile/issues/02-mobile-action-drawer.md`. Classificação: Encerrado/aprovado no registro da série.

# 02: Give the mobile action drawer more space and a discoverable complete footer

**Status:** implemented-owner-accepted — compact behavior reported OK on iPhone on 2026-10-30; footer visual unification and landscape reachability have follow-up; not published.
**Original proposal:** item 2, refined by owner. **Priority:** high.
**Blocked by:** none for implementation; final keyboard acceptance requires ticket 01.

## Evidence and entry points

IMG_9843.PNG and IMG_9856.PNG. Inspect ActionFormDrawer, EssentialsTab, ActionFormFooter, ActionDrawerFocusScope and ActionDatePicker. The footer currently scrolls only the first group; sprint/duplicate/archive and a wide save button consume the rest.

## Deliverable and approved decisions

- [ ] On mobile, preserve action tabs and title. The metadata summary shows only the date, an expansion icon and, when work attachments exist, a file indicator icon.
- [ ] No visible “Mais detalhes”, metadata labels, file count or extra explanatory text in the collapsed summary. Icon controls have accessible names; these are not visible labels.
- [ ] Expand/collapse the existing authorship/update/ID, strategy and work attachment controls without losing their state or changing their persistence. Preserve date access and long-date layout.
- [ ] Reuse an existing suitable file icon. Do not add a new attachment badge system.
- [ ] One horizontal mobile scrolling strip contains, in order, partner, phase/status, category, color when applicable, sprint, duplicate, archive/restore. Prioritize the first controls at initial scroll position.
- [ ] Keep Criar/Atualizar outside the scrolling strip, always reachable, icon-only on mobile with pending indicator and accessible state/name. Preserve existing desktop presentation.
- [ ] Show a subtle edge fade only where more content actually exists. At the end remove the right fade; show the left fade after scrolling. Do not introduce automatic scrolling, an extra fixed arrow button or a new operations menu.
- [ ] Do not mask the save button or intercept touch/focus through the fade. Keyboard focus brings offscreen controls into view. Swiping does not activate an operation.
- [ ] Preserve touch targets, draft-specific availability, category-specific color, sprint behavior, manual save/Shift+save, guards and the independent two-action forms.

## Verification and boundaries

Exercise new/existing/archived actions, long title/date, attachments absent/present, conditional color, keyboard-only scrolling and both ends of overflow. Verify focus navigation with expanded/collapsed details; hidden controls must not remain focusable. No second permanent footer row.

This ticket changes layout, not duplicate/save semantics; preserve the existing save/duplicate protections. The save-recovery/duplication ticket was closed without implementation and is not reopened here. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-04-notifications-navigation"></a>

## safari-mobile · 04-notifications-navigation

Origem: `.scratch/safari-mobile/issues/04-notifications-navigation.md`. Classificação: Encerrado/aprovado no registro da série.

# 04: Close notification overlays and honor action guards before page navigation

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for exercised notification/navigation flows; not published.
**Original proposal:** item 4. **Priority:** high.
**Blocked by:** none.

## Evidence

IMG_9856.PNG. Header.handleNotificationClick fetches an action and opens the primary drawer without explicitly closing the notification popover. “Ver todas as notificações” links to its page without coordinating closure of the open actions.

## Expected behavior

- [ ] Clicking a notification dismisses its popover and opens/focuses the requested action using existing primary-action behavior; mark-read and inaccessible-action feedback remain correct.
- [ ] Slow or failed detail loading never leaves the notification popover covering the action or silently presents stale content.
- [ ] “Ver todas” dismisses the popover, requests closeAllActions and navigates only after both action guards allow closure.
- [ ] If a guard blocks or requires resolution, keep the current route and editing state accessible. Never discard an unsaved form to force navigation.
- [ ] Inventory in-app page navigation paths, including header/menu, logo, AppBar, search commands and relevant page links. Apply the existing guarded-navigation pattern where a page change would remain hidden under open action drawers.
- [ ] Preserve intentional action opening/focusing without a page change, including primary/secondary and Shift behavior. Do not close drawers on every URL/search change: date/filters/lead selection may be local page state.
- [ ] Retain browser Back/Forward semantics; document how existing route-level guards interact rather than adding an unconditional route-change cleanup.
- [ ] Validate identity/generation for asynchronous action loads so an old notification response cannot reopen a drawer after logout or newer navigation.
- [ ] Both mobile and desktop show the destination visibly after allowed navigation, with no leftover notification overlay.

## Verification

Real Header and action-panel behavior: notification success/failure/delay, repeated clicks, “Ver todas” with zero/one/two panels, clean/dirty/saving/AI-processing states, cancelled guard and session reset during fetch. Controlled HTTP only; no production fixture writes. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-05-responsive-leads"></a>

## safari-mobile · 05-responsive-leads

Origem: `.scratch/safari-mobile/issues/05-responsive-leads.md`. Classificação: Encerrado/aprovado no registro da série.

# 05: Make the leads list and detail usable on phones

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for exercised lead flows; not published.
**Original proposal:** item 6. **Priority:** high.
**Blocked by:** none.

## Problem

IMG_9857.PNG shows the fixed-width list taking almost the entire phone screen while the detail is clipped to the right. app/routes/app/leads.tsx uses a permanent two-column flex layout with w-80/shrink-0 on the list.

## Acceptance

- [ ] On narrow screens, the initial view is the full-width list. Selecting a lead shows a full-width detail with an accessible “Voltar para leads” control.
- [ ] Returning restores the list search and scroll position during the current page visit. No hidden selected detail must replace the list simply because filteredLeads[0] exists.
- [ ] Preserve deep links through the current id search parameter. Define list versus explicit detail state consistently on reload and Back/Forward.
- [ ] Make mobile selection a navigable history step where appropriate; current replace:true must not prevent the user returning to the list with browser Back.
- [ ] Desktop keeps list/detail side by side. Resize/orientation preserves current selection and data without obscuring controls.
- [ ] Long names, dates, questionnaire answers and contact actions wrap or fit without horizontal page overflow.
- [ ] Loading, empty search, removed/inaccessible selection and errors remain understandable.
- [ ] Each visible scroll region ends with AppBarSpacer and keeps its final content reachable. Preserve authorized lead access and existing contact behavior.
- [ ] No modifications to the separate lead intake repository/API, database authorization or the questionnaire content.

## Verification

Test list→detail→return, direct link/reload, browser Back/Forward, search/scroll restoration, long answers, no leads, deleted/invalid id and orientation/desktop transition using real route/components and controlled data. Update existing flow documentation as required by AGENTS without asserting real-device verification from emulation. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-06-today-responsive-heading"></a>

## safari-mobile · 06-today-responsive-heading

Origem: `.scratch/safari-mobile/issues/06-today-responsive-heading.md`. Classificação: Encerrado/aprovado no registro da série.

# 06: Show a consistent responsive date in the dedicated Today heading

**Status:** completed — selected-date behavior accepted previously; the presentation follow-up was delivered and owner-approved through ticket14 (`53508d2`). Publication remains separate.
**Original proposal:** item 7. **Priority:** normal.
**Blocked by:** none.

## Evidence and entry points

IMG_9838.PNG and IMG_9839.PNG: today's title is only “Hoje”; a different date has a much longer heading that wraps. The latter also displays “Nenhuma ação para hoje.” Inspect TodayPageView, useTodayTitle and the shared TodayViewParts consumers.

## Acceptance

- [ ] Dedicated Today page always identifies the chosen date, including today.
- [ ] Wide-screen examples: “Hoje, quinta-feira, 29 de outubro” and a full weekday/date for another day, consistent with existing localization.
- [ ] Narrow-screen examples: “Hoje, 29 out.” and “Qua., 25 nov.”. Include year where needed to distinguish another year.
- [ ] Keep the same alignment/hierarchy across selected dates. Avoid avoidable two-line headings on normal phone widths; do not solve fitting by clipping meaningful date content.
- [ ] Compact mobile spacing between heading/date and view controls while retaining usable touch targets.
- [ ] Empty state for a different day says “Nenhuma ação para este dia” or equivalent date-correct copy. Inspect shared consumers before changing the copy so no misleading “hoje” remains.
- [ ] Preserve chosen day, router/calendar navigation, Back, defaultTodayView initialization, manual view selection, measured height, scroll resets and AppBar spacing.
- [ ] Do not redesign HomeTodayView or inadvertently expand its heading through a shared helper; dedicated-page improvements need not propagate to Home.

## Verification

Real heading/route behavior for today, another date, long weekday/month, another year, narrow/wide screen, day changes and Back. Assert selected-day meaning, not just copied formatting logic. Verify desktop header and mobile fit visually. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-07-strategy-dialog-progress"></a>

## safari-mobile · 07-strategy-dialog-progress

Origem: `.scratch/safari-mobile/issues/07-strategy-dialog-progress.md`. Classificação: Encerrado/aprovado no registro da série.

# 07: Open the strategy dialog immediately and show generation progress

**Status:** implemented-published — permanent09 integrated, committed and published Ready on2026-11-01; real signed worker/scheduler HTTP200 and heartbeat verified. [Rollout record](../../docs/audits/2026-11-01-strategy-permanent-rollout.md). No paid real generation or physical-device acceptance inferred. No implementation/activation step pending.
**Original proposal:** approved presentation from item 9. **Priority:** normal.
**Blocked by:** none for presentation; final viewport/margin acceptance integrates ticket 01. Coordinate operation state with ticket 09.

## Original behavior verified by source inspection (superseded by implementation above)

useActionAI calls /api/ai, parses its output, applies strategies locally, opens the dialog, then awaits updateAction to persist through the action save coordinator. The endpoint returns generated content; this flow is not a durable background job that saves strategies independently of the browser.

ActionFormDrawer.prepareLeave explicitly blocks action closure while aiProcessingRef is active. isPending includes AI processing but does not prove every field is disabled. Do not describe the entire application as locked.

## Approved deliverable

- [x] Open the strategy dialog on generation initiation, showing “Criando estratégias…” (and appropriate regeneration wording) before the response arrives.
- [x] Model generating, saving, confirmed and failure states truthfully. Generated options appearing locally are not proof of database persistence.
- [x] Do not let selection/use commands race against a pending strategy write. Keep prior strategies intact if regeneration fails and prevent duplicate generation requests.
- [x] Show generation errors in the dialog and allow deliberate retry after failure. If generation succeeded but saving failed, preserve generated results and offer the existing safe save/recovery path without charging a new generation merely to retry persistence.
- [x] Closing the strategy modal does not cancel the request. Retain a visible/reopenable progress indication in its action; a completed request must not unexpectedly reopen a modal the user dismissed.
- [x] Until ticket09 establishes durable server acceptance, preserve the current action leave guard while generation/persistence is pending. After that integration, allow accepted strategy work to continue independently while retaining guards for unrelated unsaved edits and other pending operations. A browser callback alone does not durably finish work.
- [x] Apply results only to the originating action/session generation. Preserve the independent other panel, conflict/version controls and local edits.
- [x] Maintain minimum mobile margins, reachable content and accessible loading/error announcements; use ticket 01's viewport behavior.
- [x] Keep current prompts, five-strategy contract, quota, server authorization and automatic strategy persistence unchanged.

## Scope and subsequently authorized extension

The owner subsequently authorized [ticket09](resolved-tickets.md#safari-mobile-issues-09-durable-strategy-generation), covering closure of the action/page while strategy work completes and persists. This presentation ticket does not itself add queues, jobs, SQL or background persistence; the temporary guard restriction is superseded only after ticket09's server-owned lifecycle is proven. No implementation starts merely from preparing either ticket.

## Verification

Real AI hook/dialog/coordinator with controlled responses: delayed generation, regeneration, generation failure, save failure/conflict, modal closed/reopened before completion, repeated activation, session reset and two panels. No real paid AI calls are necessary for these checks. Follow ../README.md.

---

<a id="safari-mobile-issues-08-profile-swatches-spacing"></a>

## safari-mobile · 08-profile-swatches-spacing

Origem: `.scratch/safari-mobile/issues/08-profile-swatches-spacing.md`. Classificação: Encerrado/aprovado no registro da série.

# 08: Show profile palette swatches and balance text-control spacing

**Status:** completed — colors accepted previously; spacing owner-approved through14 and section tabs through15 on2026-10-31. No remaining implementation/acceptance item in this scope; publication remains separate.
**Original proposal:** item 8, explicitly approved in the latest owner feedback.
**Priority:** normal.
**Blocked by:** none for palette functionality; finalize visual spacing after ticket 10 establishes actual font metrics.

## Evidence and entry points

IMG_9850.jpg, IMG_9851.jpg, IMG_9852.jpg and IMG_9853.jpg. The profile palette options show names without the color examples available in HeaderMenu. Personal/preferences tabs and the “Inativo” control have disproportionately small horizontal padding.

Inspect app/routes/app/profile.tsx, HeaderMenu in app/components/layout/Header.tsx, app/lib/palettes.ts and the actual Prism toggle-group/switch primitives used by these controls.

## Acceptance

- [ ] Show a palette swatch beside each named accent option on mobile and desktop, using the existing palette data and header presentation as the reference, without duplicating divergent color definitions.
- [ ] Preserve accessible option names and selection state; color alone is not the selection indicator. Handle Padrão/Energy/custom using their existing meanings rather than fabricated static colors.
- [ ] Keep profile preview, account manual save, custom theme draft and header automatic persistence semantics unchanged.
- [ ] Review horizontal versus vertical padding in the profile section tabs, theme/palette/view choices and active/inactive controls. Fix the disproportionate “Inativo” appearance.
- [ ] Determine whether the fault is local styles, font metrics or a shared variant before editing a primitive. Avoid indiscriminately increasing every icon button or every control in the app.
- [ ] Verify representative shared consumers in /ui if a shared variant changes. Labels, swatches and icons fit without clipped text or unintended horizontal page scroll.
- [ ] Retain touch targets, focus indication, React Aria keyboard behavior and mobile section validation/reveal.
- [ ] Preserve independent scrolling, header save button and AppBarSpacer layout on profile.

## Verification

Use real profile controls and controlled account responses for select/preview/save/reload behavior. Inspect selected/unselected and long-label spacing at phone/desktop widths, light/dark/system and after loading the intended font. Follow ../README.md. No new theme persistence mechanism or global design redesign.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-09-durable-strategy-generation"></a>

## safari-mobile · 09-durable-strategy-generation

Origem: `.scratch/safari-mobile/issues/09-durable-strategy-generation.md`. Classificação: Encerrado/aprovado no registro da série.

# 09: Persist strategy generation independently of the action drawer

**Status:** implemented-published — permanent09 integrated, committed and published Ready on2026-11-01; real signed worker/scheduler HTTP200 and heartbeat verified. [Rollout record](../../docs/audits/2026-11-01-strategy-permanent-rollout.md). No paid real generation or physical-device acceptance inferred. No implementation/activation step pending.
**Original proposal:** owner-authorized extension of item 9.
**Priority:** high.
**Blocked by:** none for design/source preparation; any remote database rollout requires verified environment/catalog and an explicit reviewed rollout. Integrates ticket 07 presentation.

## Original problem and behavior (superseded locally; rollout pending)

useActionAI calls the generation endpoint, applies all parsed strategies to local state, then calls updateAction({ strategies: newStrategies }). The full set is intended to persist in actions.strategies, not only the selected option. Selecting an option updates its selected marker and may adopt its headline as the action title.

The fetch does not specify an AbortController; unmounting alone is not a cancellation protocol. However, response handling and saving currently depend on the browser, and prepareLeave prevents closing the action while AI is processing. This is not durable execution after the drawer/page/browser closes.

## Deliverable

An authorized server-owned strategy operation accepts one request, records its identity and state, generates and persists its result, and lets the user close the drawer and later recover progress/results from the action. Completion must not depend on a mounted browser callback.

## Acceptance

Technical implementation and controlled regression criteria below are complete; real scheduler/HTTP/heartbeat verification is in the rollout record. Owner normal-use acceptance of a chosen paid generation is separate.

- [x] Inspect current hosting/runtime and choose the smallest execution design that proves durable progress within its lifecycle. A detached promise, browser-global hook or waitUntil alone is not evidence of restart/retry durability.
- [x] Record accepted operation identity, requesting identity, target action, relevant input/version and observable pending/succeeded/failed state before declaring the operation accepted. Distinguish accepted work from a request that never reached the server.
- [x] Authorize the saved action and operational scope on the server before accepting work; never treat supplied action ID, partner IDs or copied context as authorization. Derive/validate source data and model permissions.
- [x] Generation requested for a draft must first use the existing authorized action-creation flow and receive its canonical ID; if it cannot safely create/save, do not dispatch an orphan generation. Merely opening a draft still creates nothing.
- [x] Preserve five-strategy validation and current editorial prompts. Persist the full result set, including strategy fields; do not implicitly select an option or change action title/content on generation completion.
- [x] Make all five persisted options available on reopen, with canonical success shown only after confirmed persistence. An operation failure is visible and recoverable without pretending generated data is saved.
- [x] Duplicate activation/reconnect/repeated delivery for the same operation does not generate or persist twice. Preserve technical quota reservation before generation; design retries so retrying a write does not call the model again or consume another generation reservation.
- [x] Store/recover a generated result if its final action write fails. Treat ambiguous provider completion explicitly; do not promise exactly-once provider billing without evidence or blindly repeat an uncertain generation.
- [x] Prevent late regeneration results from overwriting newer results or user selection. Detect material action/context changes using recorded inputs/version; preserve unrelated title/content/media edits and route incompatible completion to explicit recovery rather than overwriting the action.
- [x] After server acceptance, closing the strategy modal/drawer or navigating does not cancel accepted work. Keep guards for unrelated unsaved edits, pending saves and other AI operations. Only relax the strategy-generation guard once acceptance/durability is established.
- [x] Closing the page/browser is not cancellation; operation status/result can be recovered on a later authorized visit. No unsolicited modal reopening or routing.
- [x] Logout/reset discards private client subscriptions/cache and old callbacks; server work must not transfer to a new identity. Recheck current authorization before final writes and status/result reads; define revoked/deleted-action behavior explicitly.
- [x] Keep two actions independent. A job belongs to action/operation identity, not primary/secondary slot. Avoid polling when inactive and use bounded status reads when needed.
- [x] No broad service-role access, relaxed RLS, anonymous result endpoints or token exposure. If new tables/models are necessary, document schema/security, migrations, AGENTS and required knowledge artifacts; verify actual grants/RLS and separate SQL prepared from SQL applied.

## Integration with ticket 07

Ticket 07 supplies immediate modal/progress/error presentation and remains independently deliverable with the old guard. This ticket supersedes its temporary guard limitation only for server-accepted durable strategy operations. Keep caption/content/post generation out of this ticket.

## Verification

Regression tests must exercise real acceptance/execution/persistence/status boundaries with controlled provider/database responses: close/unmount after acceptance, reopen/reload, duplicate request, worker retry/interruption, generated-result write failure, conflicting regeneration/selection, edits during processing, draft creation failure, revoked access and session switch. Verify that no browser callback is necessary to save results.

Use an operational rollout plan appropriate to the chosen mechanism; migrations alone do not certify it. Run applicable serverless checks before push and never use paid generations or production fixtures for automated regression. Follow ../README.md.

---

<a id="safari-mobile-issues-10-load-brand-font"></a>

## safari-mobile · 10-load-brand-font

Origem: `.scratch/safari-mobile/issues/10-load-brand-font.md`. Classificação: Encerrado/aprovado no registro da série.

# 10: Load the existing brand web font consistently across browsers

**Status:** implemented-owner-approved — explicitly tested and approved by owner on 2026-10-30; local commit exists, not published.
**Priority:** high, before final mobile spacing acceptance.
**Blocked by:** none.

## Finding

The owner calls the font “BB Objekt Sans”; the repository declares and ships “PP Object Sans”. Verify that the supplied assets are indeed the intended brand face before any replacement. Do not silently rename a family or download a different font based on the spoken name.

app/tailwind.css lists “PP Object Sans” first in --font-sans and applies it to html. public/object-sans/object-sans.css defines its four static faces, but neither app/main.tsx, app/tailwind.css nor index.html loads that stylesheet. Merely naming a family does not register the web font.

See ../../../docs/audits/2026-10-29-font-loading-diagnosis.md for the controlled browser evidence. No web font registrations/requests were observed before a temporary test-only stylesheet injection; after injection, the bundled Regular WOFF2 loaded and the actual rendered face was reported as a web font. The local Mac has the font installed, which masks the omission visually.

## Acceptance

- [ ] Load the existing font faces through the actual app CSS/HTML entry path, using a correct base URL for the shipped font assets. Preserve a usable system sans fallback.
- [ ] Inventory the actual file formats/signatures, not just extensions, and match each CSS src format() descriptor. The repository already contains WOFF2 and WOFF for all four weights; confirm that the targeted Safari/macOS/iOS versions support the supplied files. Record the tested browser/OS versions and format actually downloaded.
- [ ] Test the existing WOFF2 primary source and WOFF fallback in Safari, using controlled source failure where needed. Check HTTP status, correct font MIME type, asset integrity/decoding, same-origin delivery (or CORS if hosting changes), CSS family/weight/style matching and any missing glyphs. Do not mistake a missing stylesheet, HTML fallback response or a locally installed font for unsupported format.
- [ ] If existing assets cannot render on the target Safari despite correct registration/delivery, identify the specific missing/invalid format or face and document the required replacement file for the owner. Do not request another font merely because of the filename; do not silently replace the brand face or add obsolete SVG/EOT assets without a demonstrated need.
- [ ] Verify that a fresh browser without a local installation requests and renders the custom font; computed font-family alone is not proof.
- [ ] Confirm 300/400/500/700 assets, pt-BR accents, uppercase/lowercase, numbers and representative UI weights. Handle requested 600 consistently with the available files; do not falsely declare an unsupported variable weight range.
- [ ] Inspect actual rendering/network decoding in Safari on Mac/iPhone and another engine. No font decode errors, HTML returned as a font, missing assets or clipping caused by changed metrics.
- [ ] Confirm title/body/button/input/editor/dialog typography, light/dark and public portal/review shared typography without exposing private data.
- [ ] Keep font-display/fallback behavior usable under slow/failed requests; avoid preloading all weights without demonstrated benefit.
- [ ] Recheck narrow date headings, drawer tabs/footer, profile padding and editor toolbar after real font loading. Update layout tickets if corrected metrics change their reproduction.
- [ ] Prefer preserving the existing font: controlled Chromium evidence gives no reason yet to replace it. A change to system sans or Google-hosted/self-hosted alternative is a separate documented choice if the existing assets prove unsuitable; do not add an external font provider unnecessarily.

## Verification

Add a meaningful regression on the real entry path/browser font registration and rendered download, not a test that merely checks a font name string. Validate a production build's asset paths. Controlled Chromium proves web-font registration/loading, not actual iOS Safari compatibility or the published deployment. Follow ../README.md.

## Format reference

[WebKit: Improved Font Loading](https://webkit.org/blog/6643/improved-font-loading/) documents WOFF2 support on macOS Sierra/iOS10 and the WOFF2-first, WOFF-fallback src pattern already used by these assets. Format support is therefore not evidence that every supplied file is valid; actual target Safari decoding/rendering still needs verification. This reference was checked on 2026-10-29.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-11-compare-version-on-reopen"></a>

## safari-mobile · 11-compare-version-on-reopen

Origem: `.scratch/safari-mobile/issues/11-compare-version-on-reopen.md`. Classificação: Encerrado/aprovado no registro da série.

# 11: Compare a newer action version on reopen without replacing local edits

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for exercised reopen/comparison behavior; not published.
**Original proposal:** item 5; final owner decision: immediately editable, check in background, automatically show comparison only when a newer version exists.
**Priority:** high.
**Blocked by:** none for implementation; dialog viewport acceptance integrates ticket 01.

## Expected behavior

1. Open an existing action immediately from available data, already editable.
2. Perform one authorized canonical read for that opening in the background.
3. If its version matches the currently confirmed base, do nothing visibly: no modal, toast, form reset or unnecessary write.
4. If a newer version is found, open a comparison dialog showing the actual changed fields. This applies even when the local form is clean. Do not silently adopt the server data.
5. Preserve current edits and let the user decide using the existing version/conflict resolution flow, adapted to this earlier detection.

## Entry points and confirmed gap

Inspect useActionPanels, ActionFormDrawer, ActionSaveCoordinator, conflict-comparison.tsx, action models and relevant cache/media state. The drawer currently initializes from initialAction. ConflictComparison currently displays Object.keys(pending), which alone cannot show remote-only changes when the user has not edited anything. Reuse presentation/formatters, not a fabricated pending write patch.

## Acceptance

- [ ] Compare the read against the canonical base/version tracked by the real coordinator. Keep the opening base snapshot, current local values and newer server snapshot distinct. Do not compare only updated_at strings lexicographically or infer change merely from differences in display formatting.
- [ ] A same-version response must not trigger comparison just because the user typed locally. A response older than the coordinator's latest confirmation is stale and must not roll back state or trigger a false conflict, including after this user's own save.
- [ ] On a newer version, automatically display only meaningful changed fields, including remote-only title, date, partners, responsible, phase/category/color, strategy, archived state and media additions/removals/reordering where changed. If only technical version metadata changed, explain that truthfully without inventing a content change.
- [ ] Show the current server values and the current local values for those fields. Include local pending fields when needed to make the resolution clear, labeled accurately; do not describe a local-only change as a server change. No requirement for word-level rich-text diff or a new field-by-field merge editor.
- [ ] Preserve names/labels, formatted dates, sanitized rich HTML and literal caption from existing comparison. Distinguish display-only comparison fields from the actual pending write patch so accepting local edits does not send untouched old fields over newer server data.
- [ ] Never automatically replace the form or silently advance its expected write version upon receiving a newer row. Capture pending editor refs, IME composition, title, caption and media state without blur-triggered writes or lost keystrokes when opening the modal.
- [ ] Explicitly accepting the server version updates the whole action and all dependent refs/media/coordinator state consistently. If local edits would be discarded, make that consequence clear in the resolution action.
- [ ] Explicitly choosing the existing keep/save-local resolution sends only the true local patch against the reviewed version. No save occurs just from opening, closing or cancelling comparison. With no local changes, do not offer a meaningless overwrite/save operation.
- [ ] Cancelling comparison retains edits and the previous base; unresolved divergence remains guarded by the existing conflict handling. Stop subsequent queued autosaves once the newer version is known until explicit resolution; do not claim already-sent requests can be undone.
- [ ] If a save was already in flight, reconcile its canonical success/conflict before presenting a stale competing modal. A newer change arriving during resolution still receives the normal version check; never force-write through another conflict.
- [ ] Keep one comparison per currently relevant version; repeated callbacks do not stack or repeatedly reopen identical modals. Do not add continuous polling/realtime subscriptions as part of this ticket.
- [ ] Reads failing/network unavailable do not reset or disable the initially editable form, falsely report a newer version or advance its version. Use the established failure/retry feedback; saves retain version checks. Missing/revoked action access follows existing inaccessible-action handling rather than accepting stale access from cache.
- [ ] Validate session generation, action/panel identity and mount before applying reads. New drafts and focus of an already-open edited action do not reset or refetch as a new opening. Principal/secondary remain independent; present comparison for the originating active panel without stealing the other panel's identity or stacking dialogs.
- [ ] Preserve guarded close/navigation/logout and drawer focus restoration. The existing version-change-on-save flow remains effective if the initial read misses a later remote edit.

## Verification

Use the actual opening path, coordinator and comparison components with controlled reads/writes. Cover: same version with/without local edits; newer version with clean form; same-field and different-field edits while read is pending; remote-only media deletion; editor blur/IME; own-save confirmation racing the read; stale read; newer conflict during resolution; cancel/reopen comparison; accepting server; saving only the true local patch; read failure/access revoked; session/panel change and two actions.

No automatic merge, read-only opening gate or silent clean-form replacement is authorized. This is independent of the closed recovery/duplication ticket; do not reopen that work or add duplication safeguards here. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.

---

<a id="safari-mobile-issues-12-compact-date-picker-width"></a>

## safari-mobile · 12-compact-date-picker-width

Origem: `.scratch/safari-mobile/issues/12-compact-date-picker-width.md`. Classificação: Encerrado/aprovado no registro da série.

# 12: Fit date-picker calendars to the available mobile width

**Status:** completed — owner confirmed the device checks passed and authorized closure/commit on2026-10-31. Implementation in `ceafc6f`; publication remains separate.
**Blocked by:** none for reproduction. Preserve ticket01 viewport behavior and the approved celebration calendar.

## Report and evidence

Owner's `IMG_9903.PNG` shows the date picker opened from Today on an iPhone: oversized square cells, the rightmost weekday/date column clipped and the next-month control outside the visible area. The owner reports internal scrolling despite sufficient screen space. This is the small date picker, not the operational action calendar's week/day layout.

Source path: `CalendarToolbar` → `PrismPopover` → `PrismCalendar`. Calendar cells combine full-width/aspect-square layout, a minimum cell size and shared icon-button sizing; the popover has its own padding/maximum width. These are inspection targets, not a reproduced root cause. Measure computed sizes before choosing a fix.

## Acceptance

- [x] Reproduce with the real components/CSS/font at phone widths, including 320/375/390/430px, and record popover, grid and cell geometry. Do not infer CSS pixels from screenshot pixels.
- [x] All seven weekday/date columns and previous/month/year/next controls fit simultaneously without horizontal scrolling or clipping. Do not hide overflow to conceal inaccessible controls.
- [x] Choose bounded, consistent day cells based on available width; keep a practical touch target. Avoid stretching square cells simply to fill a large container.
- [ ] Keep selection, today indicator, focus ring and range states legible. Test long month labels, five/six-week months and increased text size.
- [x] Preserve authorized date changes, closing/return of focus, keyboard arrows/Enter/Escape and month/year selection.
- [x] Inventory other PrismCalendar consumers (action date, partner toolbar, celebration, gallery and any range use); verify affected ones, preserving celebration's approved fixed36px layout. Do not globally shrink unrelated app buttons.
- [x] In landscape/with a keyboard, retain vertical scrolling if content cannot fit the actual visible height; the goal is to eliminate unnecessary horizontal overflow, not prohibit necessary vertical scrolling.
- [ ] Add a failing browser geometry regression against real components before correcting. Verify Safari/iPhone separately from controlled Chromium/WebKit runs.

## Verification and boundary

Use controlled HTTP/data and the existing font. Run pertinent tests, format/lint/typecheck/build for the eventual runtime change; record actual device validation and deployment separately. No automatic implementation, production writes, paid generation, SQL or publication from creating this ticket. Coordinate mobile spacing with the [implementation analysis](../../docs/audits/2026-10-30-calendar-picker-width.md), without redesigning operational calendars.

## Local implementation result

CalendarToolbar now bounds day/navigation squares to32px and reduces only its caption padding; shared PrismCalendar, unrelated buttons, range and approved36px celebration styles remain unchanged. WebKit red at320px/text125% (scroll306/client280) became green (scroll270/client270);30 geometry cases passed including five/six-week months, desktop and100/125% text. Keyboard date/month/year selection, Escape/focus return and short-height vertical scrolling passed. Normal100% screenshot behavior was not reproduced, including the full Today route with controlled HTTP; do not mark that original symptom resolved. Format/lint/typecheck/build passed. Detailed browser results and limits are in the report. No commit/push/deploy, SQL or production writes.

## Completed verification after owner request

Owner requested verification/completion after accepting13/18/17. The final local CalendarToolbar correction uses bounded32–40px days matched to text size, width equal to seven cells,8px popover padding and a caption that wraps month/year with natural trigger height. A real200%-text failure (320px: scroll391/client256) went green (296/296), including numeric/caption text bounds; fonts are not reduced. Normal/125% remain green. Shared calendars/range/celebration36px are untouched.

Clean final verification: WebKit45 fixture geometries plus keyboard/selection/focus/short-height; Chromium15 geometries plus the same behavior; real Today WebKit15 controlled-HTTP geometries. Format/lint/typecheck/build and calendar caption test passed. Two final screenshots visually inspected. Implementation complete locally; physical Safari/iPhone acceptance and publication remain separate and pending. See report for exact source behavior, historical evidence and limits.

## Owner acceptance — 2026-10-31

Calendar width, legibility, controls and selection were accepted by the owner after the short device-validation guide. Earlier reproduction limitations remain historical evidence and do not reopen the accepted delivery. No new code, test execution, SQL, push or deployment in this acceptance update.

---

<a id="safari-mobile-issues-13-drawer-scroll-and-landscape-writing"></a>

## safari-mobile · 13-drawer-scroll-and-landscape-writing

Origem: `.scratch/safari-mobile/issues/13-drawer-scroll-and-landscape-writing.md`. Classificação: Encerrado/aprovado no registro da série.

# 13: Keep drawer writing reachable and prevent background scrolling on iPhone

**Status:** implemented, committed locally as4540ef6 and owner-confirmed on2026-10-30 for the reported iPhone flows. No push or deploy.
**Priority:** high — blocks writing in landscape.
**Blocked by:** none. Coordinate ticket17 toolbar height; do not wait for the general style review.

## Problem and evidence

Owner cannot reach/type the Essential description in landscape and reports scrolling the page behind the open drawer. Evidence: `UZZINA 4.png`, `IMG_9910.PNG`, `UZZINA 7.png`; [diagnosis](../../docs/audits/2026-10-30-drawer-scroll-landscape-writing.md). Still screenshots do not distinguish background scroll from visual viewport movement. Fixed panel, independent app scroller and nested clipped Essential containers are inspection targets, not a closed causal diagnosis.

## Delivery and acceptance

- [x] Reproduce with real drawer/editor components; measure document, app, panel and editor scroll positions, panel bounds and visualViewport height/offset. Separate background scroll, viewport pan and clipped content.
- [ ] Essential description is reachable and editable in portrait/landscape, keyboard open/closed and Safari bars expanded/collapsed, including phone-width and672px panels. Reach the caret and final lines with a deliberate scroll region, not by scrolling the background.
- [ ] Prevent gestures from moving the underlying app while any action is open; preserve/restore its exact position after the last action closes. Closing one of two actions must not unlock early.
- [ ] Preserve editor/panel scrolling, selection, pinch zoom, nested popover/dialog scrolling and upload. Avoid blanket touchmove prevention or global focus containment.
- [ ] Keep tabs, close and save reachable; preserve local edits, details expansion state, both action identities, leave guards and existing keyboard/focus contracts across rotation/resize.
- [x] Integrate the real visible height/offset if measurements require it; do not treat screen width or dvh alone as proof that the keyboard is accommodated. Do not silently assume a single root cause for both symptoms.
- [x] Add failing regressions at real layout/scroll boundaries before fixing. Test cleanup on close/reset/unmount and repeated/nested overlays. Record actual Safari/iPhone results separately from simulated viewport checks.

## Boundary and verification

Follow README verification rules and run relevant tests/format/lint/typecheck/build when implementing. Controlled data only; no production fixtures or new persistence. Ticket01/02 owner acceptance remains valid for reported earlier scopes; this is the new functional follow-up. No implementation, server restart, commit, push or deploy authorized merely by preparing this file.

## Implementation and evidence — 2026-10-30

Subsequent owner feedback: "13 confirmado." Accepted for the exercised device scenarios; the implementation-time limits below remain historical evidence, not a requirement to repeat the accepted flows. No additional automated/device execution is implied by this status update.

Owner explicitly authorized execution step1/ticket13. [Operation report](../../docs/audits/2026-10-30-drawer-scroll-landscape-writing.md) records red/green evidence and limits.

- Real app/Essential/Tiptap browser loop failed before correction at844×390: description wrapper height0 with hidden overflow; editor bounds377–532px were clipped below the usable tab area. A one-variable layout probe made text reachable while leaving the viewport and scroll-lock assertions failing.
- Essential now scrolls title/metadata/description deliberately, preserving metadata height and the editor minimum. Existing toolbar policy is unchanged (ticket17 remains separate).
- Drawer follows visible viewport height/offset. Dashboard locks both the document (existing React Aria implementation, shared with nested overlays) and its independent app scroll region for the lifetime of any open action; final close/reset/unmount restores styles and both app offsets.
- Browser regression passed portrait390px, landscape672px panel, simulated keyboard/bar resize/pan, long-text final caret/typing, stable editor identity across rotation, pinch geometry, real nested popover, native Chromium touch gesture, two-action close lifetime and session reset. Optional simulated iPhone platform also passed React Aria's iOS branch.
- 90 relevant tests passed (new scroll-lock tests, real drawer/focus/editor suite and visible-viewport overlays). Format/lint/typecheck/build passed; existing informational lint message and build chunk warning remain.

The automated boundary checks and Chromium gesture do **not** reproduce or certify native Safari's background-scroll engine. Actual iPhone portrait/landscape with keyboard and expanded/collapsed bars, selection/pinch and upload remains owner verification; no physical device was available. Earlier owner acceptance is preserved. No production/database/provider mutation, SQL or owner-server restart; isolated no-API Vite used port5189 and its own temporary cache, then stopped.

---

<a id="safari-mobile-issues-14-mobile-spacing-and-today-heading"></a>

## safari-mobile · 14-mobile-spacing-and-today-heading

Origem: `.scratch/safari-mobile/issues/14-mobile-spacing-and-today-heading.md`. Classificação: Encerrado/aprovado no registro da série.

# 14: Reduce wasted mobile space and truncate the complete Today date

**Status:** implemented and owner-approved on2026-10-30 for the reported scenarios; local commit authorized. No push or deploy.
**Priority:** normal.
**Blocked by:** none. Coordinate shared style recommendations; this bounded mobile correction need not wait for a general audit.

## Delivery

Use the full selected-date text with one-line ellipsis on the dedicated Today page and reduce accumulated mobile spacing in Today, Home Today and Profile while preserving the approved desktop composition. Evidence: `IMG_9902.PNG`, `UZZINA.png`, `UZZINA 2.png`; [implementation analysis](../../docs/audits/2026-10-30-mobile-spacing-today-heading.md).

## Acceptance

- [x] Measure nested margins/padding/gaps and usable content/header height before/after at320/375/390/430px and landscape. Specify local mobile overrides; do not globally shrink spacing or touch targets.
- [x] Dedicated Today uses the complete date wording and truncate, not a special mobile abbreviation. Keep selected day, today and different-year rules; full text remains available to assistive technology.
- [x] Give the heading a shrinkable width and preserve access to every date/view control. Reduce header height without clipping controls; use measured wrapping where one row cannot fit.
- [x] Reduce unnecessary outer/inner spacing in Today, Home Today and Profile, preserving legibility, focus indicators, comfortable touch targets and full text under increased text size.
- [x] Home's Today component stays separate: do not replace its heading with the dedicated page's date. Preserve natural Home height and existing Kanban behavior.
- [x] Preserve desktop spacing/composition, Profile mounted values/manual save/native validation, independent scroll regions, Today scroll reset and AppBarSpacer reservations.
- [x] Add relevant regressions on actual components before runtime changes; verify layout at the listed widths and a representative desktop width with the shipped font. Document actual device acceptance separately.

## Coordination and boundary

Supersedes the presentation follow-up of ticket06 and spacing remainder of08, not the accepted date logic or palette colors. Ticket15 owns profile tab appearance/semantics; ticket16 owns footer frames. General style analysis inventories wider inconsistencies without expanding this implementation to every page. Follow README checks. No implementation, commit or publication in this ticket-preparation round.

## Implementation and verification — 2026-10-30

Owner authorized this bounded correction after ticket19. [Operation report](../../docs/audits/2026-10-30-mobile-spacing-today-heading.md) records red/green measurements, checks and limits.

- Dedicated Today renders one complete selected-date string with ellipsis, preserving today/year rules and the full accessible text. Natural header wrapping leaves a useful title width rather than squeezing it beside all controls.
- At390px, Today/Home content starts at21px rather than49px. Today header101→93px, Home Today224→118px; at844px the dedicated header is65px. Home keeps its own title and natural height. HomeViewWrapper's compactMobile flag is opt-in only for HomeToday, preserving other blocks.
- Profile's local mobile gutters/top padding are12px; section padding24→12px and gaps24→16px. Local choice/switch/save wrapping preserves full labels at200% text and touch sizes. Desktop1440px spacing/composition and40px save height are unchanged.
- Four heading tests failed before correction;30 relevant component tests now pass. Chromium70 and WebKit71 real-route/browser assertions passed across320/375/390/430/844/1440px, including200% text, state retention/native validation and one explicit controlled profile save. Format/lint/typecheck/build passed.

The unchanged viewport-height hook produces two transient WebKit notifications (`ResizeObserver loop completed with undelivered notifications.`) during200% text changes on Today/Profile. A read-only previous-source/classes control reproduced the same two; the final check requires no recurrence after500ms of settling. Other page errors remain failures. Full Home/AppBar have preexisting overflow at320px/text200% outside this ticket; the corrected HomeToday content and the authorized date/profile controls remain contained. Screenshots reviewed by the coordinator. Physical iPhone/Safari acceptance remains separate; no production/database/provider writes or owner-server restart.

## Subsequent owner feedback

Owner accepted14/19 and requested their commit. The separate top-alignment follow-up from UZZINA9.png will be investigated after this accepted implementation and before15; it is not claimed fixed in this commit.

## Top alignment follow-up — clarified 2026-10-31

Owner clarified that “top” means the global logo/menu Header. The initial Today-heading interpretation was withdrawn before commit; accepted14 page spacing is preserved. Header now aligns to the inner vertical frame edges, including the actual scrollbar gutter. Chromium36/WebKit36 bounded assertions passed; final integrated results are in the [follow-up report](../../docs/audits/2026-10-30-today-header-alignment.md). Local correction, awaiting owner-device acceptance;14/19 remain accepted and committed as `53508d2`.

---

<a id="safari-mobile-issues-15-shared-tabs-and-profile-sections"></a>

## safari-mobile · 15-shared-tabs-and-profile-sections

Origem: `.scratch/safari-mobile/issues/15-shared-tabs-and-profile-sections.md`. Classificação: Encerrado/aprovado no registro da série.

# 15: Unify panel tabs and distinguish them from preference pills

**Status:** completed — owner confirmed the device checks passed and authorized closure/commit on2026-10-31. Implementation in `566cbbe`; portal already accepted separately; publication remains separate.
**Priority:** normal.
**Blocked by:** none for inventory. Agree the bounded shared presentation during execution before extending it to unrelated consumers.

## Problem and delivery

Profile uses PrismToggleGroup for both section navigation and preference choices (`UZZINA 2.png`). Deliver a shared panel-tab pattern using the existing React Aria/Prism stack, visually distinguishable from preference pills. Prism currently has no exported Tabs primitive; existing drawer tabs already use React Aria. Inspect existing implementations rather than importing another UI stack by default.

## Acceptance

- [x] Inventory actual tab consumers and distinguish tabs, routes, toggles and value selectors. Record which tab consumers adopt the shared pattern and any concrete justified exceptions.
- [x] Use a consistent tab frame, spacing, active indicator and focus/selection states (underline/divider direction from the agreed analysis). Keep preference pills as value choices.
- [x] Profile mobile navigation uses real tab/panel relationships, accessible names, arrow-key navigation and correct focus order; both sections remain mounted and edits survive switching.
- [x] Native invalid-field handling reveals the personal section before focusing; preserve the single form, external save button and scroll/AppBar reservations.
- [x] Adapt existing actual tabs without breaking the drawer's local Tab loop, active action identity, two-panel behavior, focus border, close/Escape semantics or mounted forms. Do not replace navigation links with tabs solely for visual similarity.
- [x] A new shared primitive belongs in Prism, is exported and demonstrated in /ui, using React Aria, existing tokens and conventions. Reuse existing buttons where appropriate; no parallel shadcn stack without a demonstrated missing capability.
- [x] Verify keyboard/focus on the composed component and real consumers, light/dark, mobile/desktop and increased text size. Add real functional regressions for behavior changed; follow README checks.

## Boundary

Resolves the section-navigation remainder of08. Cross-app visual review tracks further styling decisions separately. No redesign of values/preferences or existing save behavior. Creation of this ticket is not implementation, commit or publication.

## Implementation

Shared Prism tabs replace Profile section pills and unify action panels, action views, Instagram text sections and mobile portal views. Value selectors remain radios. Mounted forms, manual save, native validation, drawer keyboard loop and independent action identity are preserved. Primitive exported and demonstrated in /ui. Inventory, justified navigation exceptions, real regressions and verification limits: [report](../../docs/audits/2026-10-31-shared-tabs.md). No new library, database change, push or deploy.

## Owner acceptance — 2026-10-31

Profile and action/Instagram tabs were accepted by the owner after the short device-validation guide, including visual selection/content and retained account draft. Portal acceptance was already recorded separately; no repeat portal check required. No new code, test execution, SQL, push or deployment in this acceptance update.

---

<a id="safari-mobile-issues-17-compact-writing-toolbars"></a>

## safari-mobile · 17-compact-writing-toolbars

Origem: `.scratch/safari-mobile/issues/17-compact-writing-toolbars.md`. Classificação: Encerrado/aprovado no registro da série.

# 17: Keep constrained writing toolbars on one row across Essential and Instagram

**Status:** implemented locally and owner-approved ("17 ok") on2026-10-30 for the reported device scenarios; local commit authorized by owner; no push/deploy.
**Priority:** normal; coordinate with the high-priority landscape writing fix13.
**Blocked by:** none for Essential toolbar work. Final keyboard/landscape reachability requires integration with13.

## Evidence and delivery

`UZZINA 6.png` shows the Essential description's full toolbar wrapping. Only Instagram currently passes compactToolbar={writingLayout}; Essential uses default false. Extend the existing compact/More-formatting behavior to constrained Essential writing and ensure a consistent policy across the two editors. Do not report the screenshot as a reproduced Instagram toolbar failure.

## Acceptance

- [x] Define constrained mode using the actual panel width/available writing height, including landscape and keyboard, rather than assuming mobile portrait alone.
- [x] Toolbar stays one row, with secondary commands reachable in the existing Mais formatação pattern. No wrapped or clipped command row, and no lost formatting capability.
- [x] Preserve selection/caret on menu use, editor history, links/tables, enable/disable states and all command execution. Keep keyboard toolbar access (Alt+Shift+F10/F9, arrows, Tab-to-text) and contextual toolbar scope.
- [x] Verify Essential and Instagram independently, empty/long text, keyboard/rotation and two panels; normal desktop mode remains usable.
- [x] Integrate with13 so reducing toolbar height does not conceal a remaining unreachable editor. A one-row screenshot alone is not functional reachability acceptance.
- [x] Exercise real RichTextEditor/consumers in regressions for changed behavior; run README checks and declare actual Safari/device coverage.

## Boundary

No prompt/content/persistence changes or new toolbar implementation alongside the existing one. Coordinate with03 but preserve its original scope/history. No implementation, commit or deploy in registration.

## Implementation and verification — 2026-10-30

Owner explicitly authorized ticket17 after committing13/18. Essential now passes the existing compactToolbar flag using its real compact-panel state or the same useShortWritingPanel measurement already used by Instagram. No alternative toolbar or viewport tracker was added. The parent panel's ticket13 bounds already follow the visible viewport, so keyboard/bar changes resize the measured writing region even when the layout viewport stays fixed. Hysteresis and the existing editor instance are preserved.

Before the correction, two real Essential consumer tests failed for missing Mais formatação; the real app/CSS browser regression measured81px/two command rows at390px, with controls at vertical positions347/383px. After the correction it measured45px/one row, with all secondary commands in the existing menu. Landscape672px, simulated keyboard220px/top90 and normal desktop were verified independently for Essential and Instagram. The integrated ticket13 writing/caret/scroll lifecycle checks still pass.

[Operation report](../../docs/audits/2026-10-30-compact-writing-toolbars.md) records test counts, commands and limits. 100 pertinent tests and94 integrated browser assertions passed; format/lint/typecheck/build passed. Checkbox completion above refers to automated real-component/layout coverage. Physical Safari/iPhone, software-keyboard/chrome behavior and hardware keyboard remain owner acceptance; no device certification is implied.

## Subsequent owner acceptance

Owner reported "17 ok" after implementation and then authorized a local commit. This accepts the exercised scenarios; it does not imply new automated or device coverage beyond the reported checks.

---

<a id="safari-mobile-issues-18-remove-redundant-media-type-badge"></a>

## safari-mobile · 18-remove-redundant-media-type-badge

Origem: `.scratch/safari-mobile/issues/18-remove-redundant-media-type-badge.md`. Classificação: Encerrado/aprovado no registro da série.

# 18: Remove the redundant media-type badge beside Add content

**Status:** implemented, committed locally as4540ef6 and owner-approved ("18 ok") — 2026-10-30. No push or deploy.
**Priority:** low.
**Blocked by:** none.

## Evidence and delivery

`UZZINA 5.png` shows Imagem beside Adicionar conteúdo. ContentFilesManager already had this detected-type badge before the compact-layout commit; keeping upload visible in compact mode now places both together. Remove the informational type badge from this manager, including the corresponding Vídeo/Carrossel presentation, without removing media management or a useful file count there.

## Acceptance

- [x] Remove the redundant detected-type label and any code made unused solely by its removal; preserve type detection where previews or other consumers actually need it.
- [x] Keep Adicionar conteúdo and management/file-count controls accessible in empty/single/multiple image/video states and mobile/desktop layouts.
- [x] Keep the upload widget mounted through multiple success events; preserve file ordering, preview, reorder/removal and canonical save behavior. Do not remount upload to simplify the layout.
- [x] Run format, lint, typecheck and build; no existing focused real-component test was found for this cosmetic-only removal.

## Result — 2026-10-30

Removed the detected Imagem/Vídeo/Carrossel badge and the manager's now-unused `detectPostType` import/state. `ContentFilesManager` still renders the same mounted Cloudinary upload control, management button/file count and reorder dialog; preview type detection remains in `InstagramPreview`.

Verification: `bun run format`, `bun run lint`, `bun run typecheck` and `bun run build` passed. Lint reported one existing informational suggestion in `tests/font-loading.test.ts:69`; build reported the existing large-chunk warning. No targeted test or browser check was run because this change only removes a label and no focused test exists.

## Scope

Separate from17 toolbar work and the existing media-controls visibility ticket. No Cloudinary widget redesign or broad preview rewrite. Subsequently committed locally with13 as4540ef6 at the owner's request; no publication.

---

<a id="safari-mobile-issues-19-celebrations-responsive-scroll"></a>

## safari-mobile · 19-celebrations-responsive-scroll

Origem: `.scratch/safari-mobile/issues/19-celebrations-responsive-scroll.md`. Classificação: Encerrado/aprovado no registro da série.

# 19: Use one natural mobile scroll on the celebrations page

**Status:** implemented and owner-approved on2026-10-30 for the reported scenarios; local commit authorized. No push or deploy.

## Authorized scope

Owner's `UZZINA 8.png` shows a large empty gap, a clipped list and two scroll regions on the iPhone. Owner explicitly requested removing the nested/right-list scroll on mobile, keeping independent right-hand scrolling only when desktop columns are side by side. Ticket12's calendar picker appearance is outside this correction.

## Implementation and acceptance

- Below768px: form and list have natural height; the app region is the only vertical scroll owner. No blank full-height left column or nested list offset.
- At/above768px: independent columns retain bounded height and scrolling. Both end with AppBarSpacer so the form and final date remain reachable, including a short desktop window.
- Initial current-month/year positioning belongs only to the desktop list. Mobile does not scroll the page or consume that initialization. Entering desktop after mobile performs it once; later desktop resize preserves manual position.
- Existing administration guard, queries, month grouping, create/edit/delete handlers and error behavior remain unchanged. No calendar styling or shared component changes.

Real-route browser regression failed before correction at320/390/430/767px: root and list were both scroll owners, list pre-scrolled6192px and form/list gap162–190px at phone widths. After correction only the app scrolls, gap32px and inner offset0. Desktop768/1440 retained list scrolling. Wheel ownership, final-date/AppBar reachability, breakpoint transitions and short desktop form/list access are covered.

[Operation and verification report](../../docs/audits/2026-10-30-celebrations-responsive-scroll.md). HTTP/data controlled; no production writes, SQL, paid generation, commit, push or deploy. Owner's5176 server/cache preserved.

---

<a id="search-review-issues-01-fix-lazy-module-loading"></a>

## search-review · 01-fix-lazy-module-loading

Origem: `.scratch/search-review/issues/01-fix-lazy-module-loading.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Corrigir falhas de carregamento ao criar parceiro e ação

**What to build:** os comandos Criar parceiro e Criar ação abrem seus formulários no servidor local sem derrubar a interface por falha ao carregar módulos. Cobrir os dois fluxos na mesma investigação; separar a correção se as causas forem diferentes.

**Blocked by:** None (can start immediately).

**Status:** completed — tested and approved by owner on 2026-10-28

## Evidence

Em28/10/2026 o proprietário enviou duas capturas com erro Failed to fetch dynamically imported module. Criar parceiro apontou o editor de texto rico; criar ação apontou o formulário da gaveta. Na segunda captura a URL visível era a página Ajuda, portanto não assumir que o erro foi causado pela rota de Ajuda. Ambos os componentes são carregados sob demanda na implementação atual.

Na conferência posterior, os dois arquivos responderam HTTP200 ao servidor local. Isso não reproduz a navegação com a sessão/cache do navegador nem certifica as dependências transitivas. Os testes anteriores em preview compilado passaram, mas não certificam carregamento de módulos pelo servidor de desenvolvimento. Causa ainda não determinada: não atribuir a cache, compilação ou rede sem reprodução/evidência.

## Acceptance criteria

- [x] Reproduzir os dois caminhos no servidor local habitual, capturando a requisição que falha, status/resposta e erro do navegador, sem registrar segredos. Comparar sessão já aberta e primeira abertura após carregar a página.
- [x] Investigar o carregamento sob demanda e suas dependências; verificar se os erros compartilham causa antes de aplicar uma correção. Não trocar imports ou desativar otimizações sem evidência.
- [x] Criar parceiro abre o cadastro completo, inclusive campos com editor, e respeita acesso administrativo. Somente abrir não grava parceiro.
- [x] Criar ação funciona pela busca em principal/secundária e pelo atalho atual; preserva outra ação, identidade, guardas e limite de duas. Somente abrir não faz INSERT.
- [x] Falha de carregamento não vira sucesso silencioso nem causa perda de edição. Qualquer recuperação deve evitar gravação duplicada ou recarga automática que descarte trabalho.
- [x] Criar um teste/reprodutor na fronteira real que falhe pelo problema antes da correção, depois repetir os caminhos no Vite local além do build/preview.
- [x] Verificar carregamento inicial/reabertura, desktop/mobile e mensagens no console/rede; manter o modo local de produção e as proteções de sessão/banco.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e navegador com HTTP externo controlado. Não usar fixtures de escrita em produção nem alterar banco/envs por hipótese. Atualizar CURRENT com causa, evidência, resultado e limites. Sem implementação, commit ou publicação autorizados por este registro.

## Local result — 2026-10-28

Owner authorized implementation in the next turn. Confirmed the active Vite server had optimized dependencies missing from disk. A real two-process regression reproduced HTTP200 before a rejected reoptimizing duplicate start and HTTP504 afterward. Startup now checks the occupied port before launching Vite; optimizer cache is local to each checkout. The same regression now returns200. No lazy import replacement or automatic page reload was introduced.

Real dev browser checks passed at1440px and390px, including first opening, repeated opening and page reload, action primary/secondary, existing shortcut, partner editor and zero writes on open. Backend HTTP controlled; no real database/provider verification. Full verification is recorded in docs/audits/2026-10-28-local-lazy-imports.md and CURRENT. No commit or publication. Other deferred tickets not started.

---

<a id="search-review-issues-02-create-celebration-dialog"></a>

## search-review · 02-create-celebration-dialog

Origem: `.scratch/search-review/issues/02-create-celebration-dialog.md`. Classificação: Encerrado/aprovado no registro da série.

# 02: Diferenciar criar e gerenciar datas comemorativas

**What to build:** Criar data comemorativa na busca abre um modal simples com título e calendário para cadastrar. Gerenciar datas comemorativas continua abrindo a página administrativa existente. Evitar dois comandos diferentes com exatamente o mesmo destino/comportamento.

**Blocked by:** None (can start immediately).

**Status:** completed — approved by owner on 2026-10-28 after three visual passes; local commit, not pushed

## Resultado em28/10/2026

Proprietário autorizou iniciar o primeiro item da fila revisada, correspondente a este ticket. Criar data comemorativa agora abre modal com título e calendário em português, sem navegar nem fechar ações; Gerenciar mantém a página existente. Envio único, validação, erro/retry, cache canônico e guardas de sessão implementados.509 testes/1812 assertions, verificações de código/build e navegador controlado desktop/mobile passaram; cinco testes do modal repetidos após os ajustes finais de locale/altura. Relatório: [modal de data comemorativa](../../docs/audits/2026-10-28-create-celebration-dialog.md). Sem SQL, escrita real, commit ou publicação.

## Evidence

O proprietário observou em28/10/2026 que Criar data comemorativa e Gerenciar datas comemorativas abrem a mesma página. O código confirma os dois destinos iguais. A proposta registrada é tornar Criar um cadastro rápido por modal; nenhuma alteração foi iniciada.

## Acceptance criteria

- [x] Criar abre modal com campo de título, seleção de data por calendário e ações de cadastrar/cancelar, reutilizando componentes e operação de criação existentes.
- [x] Gerenciar mantém a página atual com listagem e administração. Não criar outra página ou outro sistema de datas comemorativas.
- [x] Ambos os comandos continuam exclusivos para administradores; preservar autorização no servidor/banco. Abrir/cancelar não grava dados.
- [x] Validar título/data, impedir envios duplicados e manter os dados preenchidos se houver falha. Sucesso atualiza o cache/lista existente sem recarregar a aplicação.
- [x] Preservar edição das ações abertas, guardas necessárias e teclado do calendário/modal, com foco inicial, Escape e retorno de foco adequados. Shift não ganha semântica de ação secundária para esse comando.
- [x] Testes nos componentes reais verificam distinção entre comandos, permissões, criação única, cancelamento, erro/retry e sincronização; conferir desktop/mobile e temas com HTTP controlado.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e atualizar CURRENT/contratos/KI aplicáveis. Não criar registros de teste no banco real. Sem implementação, commit ou publicação autorizados por este registro.

## Owner visual review (2026-10-28)

Owner found the modal cluttered (calendar stretched across the dialog, unlabeled date). Layout reworked in `CelebrationDialog` only, without changing the shared `PrismCalendar`: a "Data" label with the chosen date written out beside it, fixed 36px day cells inside a bordered block, outside-month days dimmed, and a dot marking today so it stays distinct from the selected day. Search suite (49 tests), format, lint and typecheck passed. Built-in browser with an injected test session and controlled fetch (only blocked calls were fake token refreshes; no writes) checked desktop and 390×700, title entry and day selection updating the written date. Still uncommitted, awaiting owner review.

Second owner pass (same day): border around the calendar removed; the grid now spans the dialog width while each day keeps a fixed 36px square (no oversized rows). Month/year pickers in `PrismCalendar` lost their field background and now read as plain caption text with only the chevron (hover and keyboard focus still show feedback); this applies to every calendar with dropdown captions, as the owner asked. Full suite (525 tests), format, lint and typecheck passed; checked in the built-in browser with the controlled session, no writes.

Third owner pass: month/year pickers now share the 36px height of the previous/next buttons (the trigger's default 48px height was overriding the caption style) with tighter horizontal padding; the written-out date next to "Data" was removed because the calendar already shows the selection. Search suite (49 tests), lint and typecheck passed; heights measured in the built-in browser (all four header controls 36px), no writes.

## Design review follow-up (2026-10-28)

Owner asked for a review with the design skills (design-critique, frontend-design, accessibility-review; read from their public repos because the newly enabled plugins only load in new sessions) and approved the three priorities:

- Empty title now shows the error under the field (aria-invalid, aria-describedby, focus back on the title) instead of the browser bubble; the form uses `noValidate`.
- `PrismCalendar` renders previous/next inside the caption row, so Tab follows the visual order (previous, month, year, next) in every calendar.
- Days from other months are hidden (space kept) and the redundant dialog description was removed.

While checking in the browser, a pre-existing defect showed up: React Aria's calendar renders a visually hidden "next" button without a type, so Enter in the title made it the form's default button and moved the calendar to the next month. The form now wraps only the title and the submit button joins it through the `form` attribute. Tests for the inline error, tab order and default button failed before and pass after; 528 tests, format, lint and typecheck passed. Built-in browser with the controlled session: inline error, month kept on Enter, one mocked POST with the selected date, no real writes. Approved by owner and committed locally, not pushed.

---

<a id="search-review-issues-03-complete-help-page"></a>

## search-review · 03-complete-help-page

Origem: `.scratch/search-review/issues/03-complete-help-page.md`. Classificação: Encerrado/aprovado no registro da série.

# 03: Implementar a página de ajuda e documentação

**What to build:** Ajuda e documentação na busca e no menu do perfil abre uma página útil de orientação sobre os fluxos atuais do aplicativo, em português brasileiro, em vez do texto provisório.

**Blocked by:** None (can start immediately). A falha de carregamento de formulários é investigada em01; não bloqueia a implementação do conteúdo desta página.

**Status:** completed — owner approved 2026-10-29; published to production

## Evidence

Em28/10/2026 o proprietário relatou Ajuda vazia. A renderização isolada do componente real confirmou somente texto provisório Hello, sem conteúdo de ajuda. A captura com URL de Ajuda e erro do formulário da gaveta está registrada no ticket01 como problema separado; não atribuir aquele erro ao conteúdo desta página.

## Acceptance criteria

- [x] Substituir texto provisório por página com título, orientações úteis e navegação legível; usar apenas recursos realmente existentes.
- [x] Cobrir busca global, criação/edição, duas ações com Shift, abas/lado a lado, X individual e fechamento conjunto, filtros da busca e atalhos atuais. Respeitar Escape consumido por editores/overlays internos.
- [x] Explicar acesso à conta e os três modos de tema; orientações administrativas aparecem somente para o perfil apropriado. Não expor material interno, segredos ou operações técnicas ao usuário.
- [x] Reaproveitar a documentação e os contratos vigentes, revisando os textos para quem usa o produto. Não adicionar suporte externo, chat, formulário de contato ou novas funcionalidades presumidas.
- [x] Acesso pela busca e pelo menu funciona para a equipe; conferir desktop/mobile, temas, teclado, rolagem e reserva da AppBar.
- [x] Teste na rota real demonstra ausência de conteúdo no estado anterior e verifica o conteúdo/navegação finais. Conferir visualmente sem consulta/escrita real.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e atualizar CURRENT/documentação/KI aplicáveis. Sem implementação, commit ou publicação autorizados por este registro.

## Result

`HelpPage` (`app/components/features/HelpPage.tsx`) in `/app/help`: sticky index (desktop) / section selector (mobile), sections for global search, creating/editing, two actions, action shortcuts, account/themes, and admin-only Administração. Test `tests/help-page.test.tsx` failed on the placeholder before. Browser: scroll fixed after reproducing a clipped-container shift (absolute sr-only captions), see CURRENT.

## Owner acceptance — 2026-10-29

Owner explicitly approved and closed this delivery. Production deployment `dpl_99LPVHqzaaqxJ4m5UQ4LF4JSa8Mg` is READY on `uzzina.cnvt.com.br`, commit `c1d18b8`. Earlier findings and limits above describe the implementation history; they do not reopen this ticket or certify additional tests. No functional change or SQL in this acceptance update.

---

<a id="social-planning-corrections-issues-00-confirm-product-contract"></a>

## social-planning-corrections · 00-confirm-product-contract

Origem: `.scratch/social-planning-corrections/issues/00-confirm-product-contract.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C00: Fechar somente as decisões necessárias às correções

**Status:** completed — decisões D1–D6 registradas em docs/plans/social-planning-design-decisions.md

**Blocked by:** Nenhum. Libera os pontos condicionais de C01, C02, C03, C04, C05 e C09.

**Prioridade:** Definição

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Um registro curto e inequívoco das decisões de produto que o código atual inventou ou que os tickets originais deixaram em aberto. Este ticket não implementa a funcionalidade.

## Ler primeiro

- README desta série e relatório da revisão.
- Tickets originais 01, 03, 04, 05 e 07 em `.scratch/social-planning/issues/`.
- Decisões de design vigentes em `docs/plans/social-planning-design-decisions.md`.

## Passos obrigatórios

1. Conferir se uma decisão já foi registrada depois da revisão. Citar sua fonte exata; não pedir novamente uma resposta existente.
2. Registrar cada item abaixo como **confirmado**, com a fonte, ou **pendente do proprietário**:
   - D1 — Visibilidade: proposta privada do autor ou compartilhada entre membros autorizados ao parceiro? Definir leitura e edição, inclusive papel de administrador. Vínculo ao parceiro continua obrigatório; usuário ativo não significa acesso universal.
   - D2 — Frequência: início da semana civil, semanas incompletas e diferença entre número do slider e dias selecionados. Não transformar o algoritmo atual (domingo, primeiros dias da semana) em decisão aprovada.
   - D3 — Formatos: a soma manual deve equivaler ao total regular? O que fazer quando o total muda? Qual regra automática usar? Como escolher formato dos extras?
   - D4 — Comemorações: ocorrência coincidindo com slot regular acrescenta outro conteúdo ou ocupa o regular? Duas comemorações na mesma data rendem um ou dois extras? Verificar recorrência no cadastro existente antes de propor regra nova.
   - D5 — Finalização: pendentes impedem finalizar ou ficam de fora? Rejeitadas não viram ações. Fixar mapeamento de campos, responsáveis/defaults, data, horário e fuso. Proposta por tema pode não ter data: decidir como coletá-la antes de converter.
   - D6 — Contrato editorial mínimo: quais entradas são obrigatórias e quais campos compõem a sugestão? Aproveitar Contexto/Tom e Direcionamento; não criar um chat ou um questionário extenso.
3. Registrar as respostas no documento de decisões do Planejamento e apontar cada resposta nos tickets dependentes.
4. Enquanto um item estiver pendente, não implementar a política correspondente. Trabalhar apenas nos passos independentes claramente indicados nos tickets.
5. Não exigir que o proprietário reavalie a Mesa, Header, AppBar ou desktop-only: essas escolhas já estão aprovadas.

## Fora do escopo

Redesenho do app, ofertas/catálogos novos, upload/análise de documentos, implantação e execução de SQL.

## Acceptance criteria

- [ ] D1–D6 têm resposta com fonte ou pendência específica identificada.
- [ ] Nenhum valor existente no mockup ou no código é apresentado como aprovação do proprietário.
- [ ] Cada bloqueio é ligado ao ticket afetado; decisões independentes não bloqueiam toda a série.
- [ ] Documento distingue decisão de produto de escolha técnica reversível.

---

<a id="social-planning-corrections-issues-01-authorized-persistence"></a>

## social-planning-corrections · 01-authorized-persistence

Origem: `.scratch/social-planning-corrections/issues/01-authorized-persistence.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C01: Persistir propostas com autorização e erros recuperáveis

**Status:** completed — storage isolado por parceiro e usuário, versionamento e migration preparada em supabase/migrations/20261102120000_social_plans.sql

**Blocked by:** C00/D1 para fixar a política de compartilhamento. Inventário e remoção da exposição local podem ser preparados antes.

**Prioridade:** P1

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** A pessoa autorizada salva, edita e reabre a mesma proposta em outro navegador, com isolamento entre contas e parceiros e mensagem real quando o salvamento falha.

## Problema comprovado

A chave global `uzzina_social_plans` permite listar todos os planos sem parceiro. Não há banco para propostas nem isolamento por identidade; `saveSocialPlan` esconde erro de quota. Trocar de conta mantém os dados da anterior.

## Pontos de entrada

- `app/lib/social-planning/storage.ts`, `types.ts`.
- `app/routes/app/planejamento.tsx`: lista, abertura e mutações de sugestões.
- Models e query keys existentes; singleton de sessão e reset de cache.
- Contratos de autorização vigentes; não copiar cegamente uma migration antiga.

## Passos obrigatórios

1. Inventariar todos os consumidores de storage, incluindo generator, editor e finalizer. Definir uma única fronteira de leitura/escrita do Planejamento em models/services; rota/componente não chama `.from()`.
2. Após D1, preparar persistência canônica de proposta, configuração completa, sugestões com IDs estáveis, decisões, timestamps e versão. Preservar distinção draft/finalized. Usar tipos validados, não `Record` sem validação nos limites.
3. Proteger leitura, criação e alteração no servidor/banco usando sessão real e parceiro autorizado. Revalidar autorização de parceiro em cada operação. IDs da URL/payload não autorizam acesso.
4. Fazer lista/detalhe/mutações usarem essa fronteira. Sem parceiro válido, mostrar seleção e não listar planos de todos os usuários. Chaves de cache incluem identidade e escopo.
5. Remover o uso automático dos registros antigos sem dono. Não atribuir a chave legada ao próximo usuário e não importá-la para o banco automaticamente. Documentar que esses dados não têm autoria confiável; não apagá-los silenciosamente.
6. Salvar somente após confirmação canônica. Distinguir carregamento, vazio, falha e conflito. Falha preserva edição e oferece retry; não mostrar “salvo” nem atualizar estado confirmado antecipadamente.
7. Usar versão esperada nas mutações para não sobrescrever edição remota em silêncio. Resposta antiga de sessão/parceiro/proposta não atualiza a tela ou cache atual.
8. Publicar no documento do ticket a interface final dos models, estados de erro e schema para C05–C09. Evitar refatoração de models de outras funcionalidades.
9. Preparar migration incremental; verificar catálogo antes de aplicar. Preparar SQL não equivale a aplicar. Atualizar guias/KIs exigidos pelo AGENTS quando houver alteração de banco/model.

## Verificação necessária pelo risco

Em ambiente controlado: usuário A/B com escopos diferentes; acesso por ID manipulado; parceiro arquivado/revogado; duas edições com a mesma versão; falha de escrita e retry; logout durante resposta; reabertura em outro navegador. Nenhuma fixture em produção.

## Acceptance criteria

- [ ] Conta B não vê nem altera proposta de A fora da política D1.
- [ ] Ausência de parceiro não expõe a coleção global local.
- [ ] Edição/aprovação/rejeição confirmadas sobrevivem à reabertura em outro dispositivo.
- [ ] Falha de persistência aparece ao usuário e conserva o rascunho.
- [ ] Dados legados sem dono não são importados/expostos automaticamente.
- [ ] Conflito e sessão antiga não sobrescrevem uma versão nova.
- [ ] Aplicação de SQL e publicação são reportadas separadamente, sem alegar deploy.

**Não fazer:** apenas prefixar localStorage por usuário e chamar isso de persistência compartilhada; usar service-role no navegador; ampliar RLS de ações; implementar o gerador real ou finalização neste ticket.

---

<a id="social-planning-corrections-issues-02-validate-period-slots"></a>

## social-planning-corrections · 02-validate-period-slots

Origem: `.scratch/social-planning-corrections/issues/02-validate-period-slots.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C02: Bloquear períodos inválidos e eliminar conteúdos sem slot

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** No modo Por período, o total mostrado e gerado corresponde exatamente às posições válidas confirmadas. Entrada inválida é explicada antes de gerar.

## Pontos de entrada

`app/lib/social-planning/slot-calculator.ts: calculatePeriodSlots`, `generator.ts: generateSocialPlan`; formulário e `handleGenerate` da rota de Planejamento. Não editar calendário global.

## Passos obrigatórios

1. Validar datas reais e formato de data civil, início menor/igual ao fim, frequência inteira positiva dentro dos limites já aprovados e IDs de dias válidos.
2. Remover a conversão de “zero slots” em seis conteúdos sem data. No modo período, zero slots é estado inválido para gerar, com motivo visível.
3. Não confundir modo tema sem data com período inválido. A quantidade do tema continua separada.
4. Exibir quantidade regular calculada antes de enviar. Mesma função de cálculo alimenta resumo e pedido; não duplicar algoritmo no JSX.
5. Relacionar slider/dias pelas decisões D2. Antes dessa resposta, conservar somente o comportamento definido e sinalizar casos ambíguos; não escolher semana civil, proporcionalidade ou dias adicionais por conta própria.
6. Fazer o handler validar novamente, mesmo se o botão estiver desabilitado. C05 deverá reutilizar essa validação no servidor; exportar contrato puro sem dependência de UI.
7. Datas civis não devem mudar de dia por conversão implícita UTC/local.
8. Mudança de configuração não altera a proposta já aberta: o resultado permanece ligado à entrada capturada no disparo. C06 cuida da reabertura completa.

## Casos verificáveis

- Início posterior ao fim, data impossível, nenhum dia selecionado e intervalo sem ocorrência dos dias: nenhuma geração e mensagem específica.
- Um único dia válido no intervalo: uma posição, sem preenchimento artificial.
- Com D2 definida: semana completa, incompleta, virada de mês/ano e quantidade de dias diferente do slider.
- Solicitar novamente mesmo período mantém o total inteiro; não consulta ações existentes.

## Acceptance criteria

- [x] Nunca há geração por período com zero slots nem fallback para tema.
- [x] Nenhuma posição calculada fica fora do intervalo inclusivo.
- [x] Quantidade regular do resumo é a mesma do pedido.
- [x] Configuração inválida não chama IA nem reserva quota.
- [x] Slider e dias aprovados permanecem na interface.
- [x] Regra de semana só muda após D2 estar registrada.

**Não fazer:** definir limites arbitrários, preencher datas faltantes com hoje, descontar ações existentes ou alterar Hoje/Home.

---

<a id="social-planning-corrections-issues-03-commemorative-date-bounds"></a>

## social-planning-corrections · 03-commemorative-date-bounds

Origem: `.scratch/social-planning-corrections/issues/03-commemorative-date-bounds.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C03: Restringir comemorações ao período e separar extras

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Considerar datas comemorativas inclui somente ocorrências válidas do intervalo selecionado e mostra extras separadamente da quantidade regular.

## Problema e pontos de entrada

A rota aceita qualquer registro do mesmo mês, inclusive outro ano ou fora de um intervalo curto. `mergeCommemorativeSlots` aceita IDs/datas sem validar limites. Ler `periodCelebrations` na rota, `slot-calculator.ts` e o model de comemorações existente.

## Passos obrigatórios

1. Remover o fallback por número do mês. Filtrar ocorrências pelo intervalo completo inclusivo, com ano e data válidos. Ordenar por data completa, não só dia do mês.
2. Conferir o contrato real do cadastro: data concreta ou regra recorrente. Se for concreta, não mudar seu ano automaticamente. Se existir recorrência suportada, resolver a ocorrência pelo mecanismo existente e registrar a data efetiva.
3. Alterar o merge para receber/validar o intervalo canônico. Um ID selecionado que saiu do período não pode inserir data externa.
4. Ao mudar intervalo ou desligar “considerar datas”, impedir que seleção antiga continue produzindo extras invisíveis. Atualizar seleção/resumo de forma explícita.
5. Manter IDs de origem e distinção regular/extra, inclusive quando há colisão. Aplicar somente D4 para coincidências e múltiplas datas no mesmo dia.
6. Mostrar “N regulares + M extras = T sugestões”. Regular não é reduzido para acomodar extras.
7. Entregar a C04 a quantidade regular e a quantidade extra separadas, com os mesmos dados que irão para C05.
8. Não implementar consulta de feriados nova nem mexer em seleção de feriados do parceiro.

## Casos verificáveis

Período 10–20/11/2026 exclui 01/11/2026, 30/11/2026 e novembro/2025; inclui os limites. Intervalo dezembro–janeiro respeita ano. Data inválida/ID removido não gera sugestão. Desligar o botão remove efeito dos extras. Colisões seguem D4, sem perder o total regular.

## Acceptance criteria

- [x] Nenhuma comemoração externa ao intervalo entra pelo filtro nem pelo merge.
- [x] Uma seleção antiga não injeta extras ocultos.
- [x] Datas não mudam de ano sem regra de recorrência existente.
- [x] Resumo, pedido e resultado distinguem regulares e extras.
- [x] Nenhuma alteração nos calendários ou cadastros de outras páginas.

---

<a id="social-planning-corrections-issues-04-respect-format-counts"></a>

## social-planning-corrections · 04-respect-format-counts

Origem: `.scratch/social-planning-corrections/issues/04-respect-format-counts.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C04: Respeitar quantidades manuais de formatos sem ajustes ocultos

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Quantidades de reels, estáticos e carrosséis informadas pelo usuário são respeitadas ou rejeitadas com explicação. O app não corta nem completa silenciosamente o pedido.

## Pontos de entrada

`distributeFormats` em `app/lib/social-planning/slot-calculator.ts`; campos e cálculo de formatos na rota; contrato do gerador.

## Passos obrigatórios

1. Remover os caminhos que truncam quantidades e preenchem o restante em ciclo sem consentimento.
2. Validar números inteiros não negativos, valores finitos e limites aprovados. Não converter entrada inválida em zero silenciosamente.
3. Comparar composição ao total regular segundo D3. Quando a configuração não for resolvida pela regra aprovada, apresentar divergência antes da geração e conservar os números digitados. Não inventar uma regra para acomodar o pedido.
4. Ao mudar período, frequência ou quantidade por tema, sinalizar que a composição precisa ser revista se perder validade. Não reajustar os campos sozinho.
5. Aplicar distribuição automática somente segundo D3; mostrar seu modo no resumo. Extras recebem regra própria de D3/D4 e não consomem a distribuição regular.
6. Persistir a composição completa na entrada do plano: modo, contagens solicitadas/confirmadas e contabilidade de extras. C01 fornece fronteira; combinar integração serialmente se ainda em andamento.
7. Fornecer contrato puro de validação à C05. Depois, o resultado da IA também precisa ser conferido: divergência não se corrige trocando rótulos silenciosamente.

## Casos verificáveis

Total seis com quatro reels e zero outros deve sinalizar divergência conforme D3, nunca virar cinco reels/um carrossel. Total três com quatro reels não pode descartar um sem aviso. Entrada negativa, decimal ou inválida não gera. Regular seis e dois extras conserva as quantidades regulares confirmadas.

## Acceptance criteria

- [x] Pedido manual não sofre truncamento ou preenchimento oculto.
- [x] Divergência aparece antes de chamar o provedor.
- [x] Mudança de total não apaga nem reequilibra contagens digitadas.
- [x] Modos por tema e por período usam a mesma regra validada.
- [x] Entrada persistida permite reconstruir exatamente o pedido.
- [x] Testes pequenos verificam contagens reais, não apenas repetem strings da UI.

**Não fazer:** ampliar catálogo de formatos, decidir percentuais arbitrários ou redesenhar os controles.

---

<a id="social-planning-corrections-issues-05-real-ai-generation"></a>

## social-planning-corrections · 05-real-ai-generation

Origem: `.scratch/social-planning-corrections/issues/05-real-ai-generation.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C05: Gerar propostas reais por IA com contexto e tom corretos

**Status:** completed — integração com voice e context canônicos do parceiro, sem geração de ações e com erros recuperáveis na UI

**Blocked by:** C01, C02, C03 e C04; C00/D6. Os contratos de entrada/saída precisam estar estáveis antes da integração.

**Prioridade:** P1

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Gerar usa IA real no servidor, com dados autorizados atuais da marca e configuração validada, e devolve uma proposta salva que pode ser reaberta sem nova geração.

## Problema e pontos de entrada

`generator.ts` usa nove templates síncronos. A rota lê `voice_tone`, mas o parceiro possui `voice`. Ler os contratos e handlers atuais de IA, quota, autenticação e estratégias09 antes de integrar. Não reutilizar automaticamente a operação de estratégia como se fosse planejamento.

## Passos obrigatórios

1. Remover o gerador de templates do fluxo de produção. Pode permanecer apenas como fixture explícita de teste, nunca como fallback ao usuário.
2. Criar/integrar operação específica de Planejamento usando serviços existentes. O navegador envia parceiro e configuração, não credenciais nem autoridade editorial.
3. Servidor autentica, verifica membro/parceiro ativo autorizado e lê nome, Contexto e `voice` canônicos. Verificar o ticket original 08 e a integração vigente de `planning_instructions`; incluir somente o que estiver disponível e autorizado, sem criar outro cadastro.
4. Validar `partner_name` e entrada D6 antes da reserva persistente de quota. Respeitar erros/quota e instrumentação vigentes; falha não ativa contador em memória nem templates.
5. Capturar configuração no disparo. Enviar direcionamento completo, sem truncar em cinquenta caracteres. Transmitir slots/formatos/regulares/extras já validados; revalidá-los no servidor.
6. Solicitar saída estruturada com os campos D6, validar tipos, quantidade, formatos e datas. IDs das sugestões e parceiro autorizado são controlados pela aplicação; texto do modelo não concede identidade/autorização.
7. Resultado inválido não vira proposta válida nem cria ações. Explicar erro sem destruir proposta anterior. Contexto insuficiente pede correção objetiva dos dados mínimos, sem transformar a página em chat.
8. Usar identidade estável de operação para retry técnico. Resultado aceito deve ser retido de modo que falha no salvamento não exija nova chamada paga. Repetição do mesmo pedido técnico não publica duplicatas.
9. Nova geração explícita cria operação/proposta novas e integrais, mesmo no mesmo período. Não buscar nem descontar ações reais.
10. UI diferencia gerando, salvando, concluído, erro, retry de escrita e resultado inválido. Sessão/parceiro antigos não recebem o resultado; não cancelar trabalho durável já aceito só por fechar a interface.
11. Documentar o ciclo de operação e integração com C01. Preservar estratégias09 sem flags, alterações no seu worker ou generalizações desnecessárias.

## Verificação necessária

Provedor/HTTP controlados: autenticação negativa, parceiro alheio, `voice` recebida, direção longa integral, nome inválido sem quota, limite/indisponibilidade, JSON inválido, contagem/formato/data divergentes, timeout/resultado retido, retry de gravação sem segunda geração e troca de sessão. Qualidade editorial real requer avaliação separada; mocks não a certificam.

## Acceptance criteria

- [ ] Há chamada real ao provedor via servidor no fluxo preparado.
- [ ] Nome/Contexto/Tom vêm da marca autorizada, sem cast para campo inexistente.
- [ ] Templates não aparecem como resultado de IA em falhas.
- [ ] Resultado validado é persistido e reabre sem regenerar.
- [ ] Retry técnico e nova geração explícita são operações distintas.
- [ ] Nenhuma ação nasce nesta etapa.
- [ ] Verificações de APIs e build ao publicar seguem AGENTS; relatório separa preparado/testado/publicado.

**Não fazer:** pagar chamadas para testes por rotina, colocar segredos no browser, criar chat, upload de documentos ou alterar quota e estratégias existentes.

---

<a id="social-planning-corrections-issues-06-reopen-plan-state"></a>

## social-planning-corrections · 06-reopen-plan-state

Origem: `.scratch/social-planning-corrections/issues/06-reopen-plan-state.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C06: Reabrir proposta com configuração e parceiro coerentes

**Status:** completed — restauração canônica de inputs e período em handleOpenPlan; encerramento limpo ao trocar de parceiro

**Blocked by:** C01. Pode ser implementado antes de C05 usando proposta canônica controlada.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Abrir proposta anterior restaura sua configuração e mostra suas sugestões no período correto. Trocar parceiro não deixa uma proposta de outro cliente aberta.

## Problema e pontos de entrada

`app/routes/app/planejamento.tsx` abre apenas `setCurrentPlan(plan)`; o calendário usa início/fim do formulário atual. A troca de parceiro atualiza a lista, mas não limpa/invalida a proposta aberta. Ler também `PlanningCalendarView.tsx` e o contrato C01.

## Passos obrigatórios

1. Criar uma única operação de abrir proposta: carregar versão autorizada, conferir parceiro/identidade e validar configuração persistida antes de aplicar.
2. Restaurar modo, período ou quantidade do tema, frequência, dias, direcionamento, formatos e seleção de comemorações a partir da entrada canônica. Não preencher campos ausentes inventando respostas.
3. Fazer a visualização usar dados da proposta selecionada. Alterar o formulário para preparar uma futura geração não deve mudar o período das sugestões já geradas.
4. Definir claramente configuração de nova geração e resultado aberto. Usar nomes/tipos explícitos; não duplicar todos os estados do app nem criar store global sem necessidade.
5. Ao trocar parceiro, passar pela guarda de alterações e encerrar/desassociar a proposta anterior. Não mostrar A sob título/URL de B. Partner inválido mantém seleção explícita, sem escolha automática.
6. Descartar leitura tardia de proposta/sessão anterior. Clique rápido em A e depois B termina em B.
7. Plano antigo com entrada incompleta mostra aviso de incompatibilidade/recuperação; não quebra render nem altera dados automaticamente.
8. Confirmação de escrita ou geração conserva relação com o parceiro e configuração capturados, mesmo se o formulário atual tiver mudado.

## Roteiro de validação

Abrir plano de novembro com formulário em dezembro: sugestões continuam visíveis em novembro. Abrir modo tema após período restaura direção/quantidade corretas. Trocar parceiro com edição pendente permite conservar/cancelar conforme guarda; resposta atrasada não reaparece. Redimensionar e voltar à largura suportada preserva estado sem reenviar operação.

## Acceptance criteria

- [ ] Reabrir recupera valores persistidos completos.
- [ ] Formulário de nova geração não desloca calendário da proposta aberta.
- [ ] Plano de A nunca permanece sob contexto/URL de B.
- [ ] Conflito, erro de leitura e acesso revogado têm estado explícito.
- [ ] Nenhuma reabertura gera IA ou cria ação.
- [ ] Header/AppBar, acessos e duas rolagens existentes permanecem.

---

<a id="social-planning-corrections-issues-07-existing-calendar"></a>

## social-planning-corrections · 07-existing-calendar

Origem: `.scratch/social-planning-corrections/issues/07-existing-calendar.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C07: Reutilizar calendário do app e mover somente sugestões

**Status:** completed — PlanningCalendarView adaptado ao padrão do app com rolagem em dois eixos, drag-and-drop de sugestões e zero mutações em ações

**Blocked by:** C01 e C06. Não depende de geração real C05 para trabalhar com proposta controlada.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** A mesma proposta aparece na lista e no calendário real do app, com ajustes laterais e rolagens nos dois eixos. Mudar uma sugestão de data salva somente essa sugestão.

## Pontos de entrada

`app/components/planning/PlanningCalendarView.tsx`; `app/components/features/Calendar.tsx`, `CalendarWithDnd.tsx`, `PartnerCalendarBoard.tsx`, `CalendarToolbar.tsx` e consumidores existentes. Os caminhos são pontos de pesquisa, não autorização para reescrever todos eles.

## Passos obrigatórios

1. Identificar a menor fronteira compartilhável de renderização/layout/controles do calendário existente. Documentar eventos de seleção e movimento antes de alterar.
2. Substituir a grade exclusiva do Planejamento por composição dessa implementação. Se houver acoplamento a ações, separar somente os dados/eventos necessários. Não copiar o calendário nem inventar ações falsas com IDs de sugestões.
3. Renderizar título, formato e decisão das sugestões da proposta aberta, preservando IDs.
4. Manter ajustes laterais, largura, altura por semana/célula e rolagem horizontal/vertical. A região direita não força o documento a crescer nem interfere na rolagem esquerda.
5. Arraste calcula nova data e persiste pela mutação de sugestão C01 com versão esperada. Implementar alternativa por teclado/formulário para a mesma operação.
6. Preview local não grava em ações. Falha remove somente o preview da operação; não restaurar snapshot completo sobre mudanças mais novas.
7. Respeitar limites de movimentação somente se aprovados. Não confundir limite da seleção de comemorações com proibição automática de mover sugestões.
8. Lista e calendário refletem mesma versão após confirmação. Sem gravação ao alternar visualização.
9. Preservar consumidores Home/parceiro. Mudança compartilhada exige verificação dirigida nesses consumidores; não redesenhá-los.

## Acceptance criteria

- [ ] Grade própria deixa de ser usada; recursos do calendário existente ficam disponíveis.
- [ ] Dois eixos e ajustes laterais funcionam dentro da coluna direita.
- [ ] Arrastar e editar data pelo teclado persistem na sugestão e sobrevivem à reabertura.
- [ ] Espionar fronteira de ações confirma zero INSERT/PATCH durante revisão/movimento.
- [ ] Falha/conflito e resposta antiga não corrompem outra sugestão.
- [ ] AppBar continua visível e reserva de rolagem segue o padrão vigente.
- [ ] Roteiro visual curto validado pelo proprietário; teste automatizado não substitui aceite visual.

**Não fazer:** nova biblioteca de calendário, novo shell, suporte mobile, alterações de ação real ou duplicação do calendário.

---

<a id="social-planning-corrections-issues-08-suggestion-editor"></a>

## social-planning-corrections · 08-suggestion-editor

Origem: `.scratch/social-planning-corrections/issues/08-suggestion-editor.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C08: Corrigir teclado, foco e salvamento do editor de sugestões

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Editar sugestão usa o diálogo existente do app, funciona por teclado e só fecha como salvo quando a escrita é confirmada.

## Problema e pontos de entrada

`app/components/planning/PlanningSuggestionEditor.tsx` usa div com `aria-modal`, sem gestão de foco/teclado; fechar usa “✕” sem nome. `handleSave` fecha imediatamente sem esperar confirmação. Conferir os diálogos Prism/React Aria já usados no app e seu exemplo em /ui antes de compor.

## Passos obrigatórios

1. Substituir a estrutura manual pelo diálogo/modal existente. Dar título acessível e nome “Fechar edição de sugestão” ao controle de fechar.
2. Foco inicial previsível, Tab/Shift+Tab contidos pelo padrão existente e retorno ao disparador. Não adicionar listeners globais de teclado.
3. Escape de select/calendário interno fecha primeiro o overlay interno; Escape de edição com alterações segue guarda de descarte existente, sem perda silenciosa.
4. Conferir identidade do rascunho: abrir outra sugestão não reutiliza os valores de useState da anterior. Reabrir edição lê a versão correta; não resetar texto a cada render.
5. Salvar valida os campos do contrato D6 e aguarda confirmação C01. Enquanto salva, impedir duplicação; erro conserva valores e exibe retry; conflito pede revisão, sem sobregravar.
6. Cancelar/fechar não faz mutação. Não permitir editar campos de vínculo, autoria ou ID mediante patch arbitrário do componente.
7. Reutilizar controles de formato/data existentes. Só sugerir primitivo novo se houver lacuna concreta; nesse caso cumprir galeria/Prism, sem kit externo.

## Acceptance criteria

- [x] É possível abrir, percorrer campos, salvar/cancelar e retornar por teclado.
- [x] Foco não escapa do diálogo por Tab e overlays internos mantêm seu teclado.
- [x] Diálogo e fechar têm nomes em português.
- [x] Falha de escrita mantém diálogo e rascunho, sem falso sucesso.
- [x] Abrir sugestão B depois de A mostra valores de B.
- [x] Nenhuma edição/aprovação cria ação real.

**Fora do escopo:** revisão visual geral do app, editor de ações/Instagram e adaptação mobile do Planejamento.

---

<a id="social-planning-corrections-issues-09-atomic-finalization"></a>

## social-planning-corrections · 09-atomic-finalization

Origem: `.scratch/social-planning-corrections/issues/09-atomic-finalization.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C09: Finalizar aprovadas atomicamente sem duplicação e para membros

**Status:** completed — finalização idempotente por created_action_id, responsibles de membro comum garantidos, validação estrita de data e relatório de falhas parciais

**Blocked by:** C01 e C06; C00/D5. Não depende de C05/C07 para implementar com proposta canônica controlada.

**Prioridade:** P1

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Confirmar finalização cria exatamente uma ação por sugestão aprovada elegível, ou nenhuma se a operação falhar antes de confirmar. Repetir a mesma finalização retorna os vínculos já criados.

## Pontos de entrada

`app/lib/social-planning/finalizer.ts`; `handleFinalize` na rota; botão em `PlanningSuggestionsList.tsx`; contrato canônico C01; `createActionDraft`/`resolveDraftPartners` em factory; schema/mutações de ações e autorização atual.

## Passos obrigatórios

1. Registrar D5 antes de fixar campos/data/horário/fuso/responsáveis e comportamento de pendentes. Remover defaults implícitos “10:00” e “hoje”. Para tema sem data, coletar o dado aprovado antes de confirmar; não salvar ações sem essa decisão.
2. Mostrar resumo: parceiro, aprovadas, pendentes, rejeitadas, quantidade elegível e datas. Somente aprovadas entram; pendentes seguem D5. Aprovar item não cria ação.
3. Substituir loop de INSERTs no navegador por operação transacional autorizada no servidor/banco. A mesma transação verifica versão, seleciona sugestões canônicas, cria ações, grava vínculos e finaliza. Uma falha reverte o conjunto inteiro.
4. Criar vínculo durável e unicidade por sugestão. Se necessário incluir parceiro/proposta no vínculo para integridade, usar chaves verificadas. Controle de clique é conveniência; unicidade e transação são a garantia.
5. Duas requisições/abas concorrentes não duplicam. Resposta perdida: consultar operação/vínculos canônicos antes de tentar de novo. Proposta já finalizada retorna resultado existente; não reexecuta INSERT.
6. Revalidar ator ativo, acesso ao parceiro, autoria/permissão D1, versão e estado no momento da transação. Navegador não escolhe IDs aprovados ou responsáveis para contornar autorização.
7. Mapear campos/defaults pelo fluxo canônico de criação e D5. Conferir especificamente responsáveis: membro comum precisa cumprir o contrato real de autorização; não preencher só `user_id`. Não afrouxar RLS de ações para fazer funcionar e não usar uma função privilegiada sem todas as verificações.
8. Respeitar categoria/formato e estados distintos de ação. Não gerar conteúdo final, legenda ou roteiro ausentes na proposta.
9. UI só anuncia sucesso após confirmação completa. Mostrar falha/conflito/resultado incerto corretamente; nunca “0 ações criadas com sucesso” após erro. Finalizado desabilita nova conversão e permite consultar resultado existente.
10. Atualizar cache de ações somente com versões canônicas e escopo conhecido; invalidar o necessário quando escopo for desconhecido. Respostas de sessão antiga não entram no cache atual. Antes de iniciar/reconciliar escrita conferir continuidade da sessão.
11. Exclusão posterior de ação ou perda de acesso não apaga vínculo de conversão nem faz retry recriá-la. Não expor ação agora inacessível.
12. Nova geração explícita é independente e pode criar novas ações em nova finalização. Não deduplicar por título/período nem buscar ações antigas para reduzir quota da proposta.

## Casos obrigatórios em ambiente controlado

- A/B/C aprovadas; erro na criação de B: zero ações/vínculos novos, proposta não finalizada.
- Retry após corrigir erro: três ações; segundo retry: mesmas três, nenhuma extra.
- Dois pedidos concorrentes e resposta perdida: um único conjunto canônico.
- Membro autorizado e administrador funcionam; membro alheio, parceiro arquivado, versão antiga e payload adulterado falham sem escrita parcial.
- Sessão trocada não inicia próxima operação nem adota resultado antigo.
- Pendentes, rejeitadas e ausência de data seguem D5.
- Excluir uma ação e repetir finalização não a recria.

## Acceptance criteria

- [ ] Associação e criação são realmente atômicas e idempotentes no banco, demonstradas pelos casos acima.
- [ ] Membros comuns funcionam sem ampliar permissões.
- [ ] Nenhuma falha parcial recebe status finalizado ou mensagem de sucesso.
- [ ] Data/hora/fuso e pendentes têm decisão documentada; nenhum default inventado.
- [ ] Resultado final inclui vínculos canônicos e cache correto.
- [ ] Preparação de SQL, aplicação e implantação são evidências separadas.

**Não fazer:** compensar INSERTs com deletes posteriores, confiar somente em botão desabilitado, guardar IDs apenas em localStorage ou alterar estratégias09.

---

<a id="social-planning-corrections-issues-10-verify-correction-series"></a>

## social-planning-corrections · 10-verify-correction-series

Origem: `.scratch/social-planning-corrections/issues/10-verify-correction-series.md`. Classificação: Histórico substituído; não considerar aceito pela série T.

# C10: Verificar integração e registrar aceite real do Planejamento

**Status:** completed — suíte de slots e storage (25 PASS), serverless runtime (9 PASS), tsc (0 erros) e relatório consolidado emitido

**Blocked by:** C01–C09 e decisões D1–D6 resolvidas para os comportamentos entregues.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Um parecer final verificável que demonstra que os achados foram corrigidos juntos, sem anunciar conclusão por uma suíte verde ou por um status documental.

## Passos obrigatórios

1. Ler o relatório original e montar matriz achado→ticket→evidência. Confirmar o commit revisado e os commits/código corrigidos; não confundir trabalhos posteriores de design com esta série.
2. Conferir tipos/contratos usados por toda a mesa: geração, persistência, reabertura, decisões, calendário e conversão compartilham a mesma proposta/versão.
3. Reexecutar somente verificações necessárias ao risco, aproveitando testes já entregues. Cobrir a cadeia configuração válida → IA controlada → salvamento → edição/aprovação → reabertura → movimento → finalização → retry sem duplicata.
4. Cobrir conta/escopo errados, falhas de geração/escrita, conflito, troca de sessão e parceiro. Não usar dados reais como fixtures.
5. Roteiro visual desktop: Header/AppBar originais, duas rolagens independentes, controles aprovados, seleção de parceiro na URL, entradas busca/menu/parceiro para membros, lista/calendário sincronizados e teclado no editor. Abaixo da largura suportada, somente aviso e preservação de estado.
6. Conferir que ações só nascem na finalização, com datas/defaults aprovados e sem redução por ações existentes.
7. Se houve alteração em API/dependências serverless, executar as verificações específicas do AGENTS; build ao publicar. Não executar suites amplas sem necessidade.
8. Atualizar CURRENT e relatório desta série com resultado e pendências reais. Registrar separadamente código preparado, SQL aplicado, teste controlado, provedor real, deploy Ready e aceite visual do proprietário.
9. Não encerrar/modificar tickets originais automaticamente. Recomendar aceite/reabertura com evidências. Se houver falha, apontar o ticket e cenário exato, sem criar melhorias de produto fora da série.

## Acceptance criteria

- [ ] Todos os achados originais e complementares têm evidência ou pendência explícita.
- [ ] Finalização concorrente/retry e acesso entre contas foram verificados em ambiente controlado.
- [ ] Nada é certificado como banco/provedor real só por mocks.
- [ ] Aceite visual permanece identificado como do proprietário.
- [ ] Sem regressão nos consumidores de calendário ou ações tocados pela integração.
- [ ] Nenhum push, SQL ou deploy é assumido como autorizado por este ticket documental.

**Não fazer:** benchmark amplo, nova auditoria de todo o app, suporte mobile ou “aproveitar” para implementar funcionalidades adicionais.

---

<a id="today-viewport-issues-01-today-kanban-height"></a>

## today-viewport · 01-today-kanban-height

Origem: `.scratch/today-viewport/issues/01-today-kanban-height.md`. Classificação: Encerrado/aprovado no registro da série.

# 01: Aproveitar a altura disponível nas colunas do Kanban de Hoje

**What to build:** na página Hoje, visualizar o Kanban com as colunas usando o espaço disponível até o limite útil da janela. Quando houver mais ações do que cabem, rolar somente a lista da coluna correspondente, mantendo o cabeçalho da fase visível.

**Blocked by:** None (can start immediately).

**Status:** completed — approved by owner on 2026-10-28; local commit

- [x] O Kanban da página dedicada deixa de limitar as colunas a30vh e aproveita a área disponível abaixo do título e dos controles, sem criar rolagem vertical externa.
- [x] Os cabeçalhos de fase continuam visíveis; ações excedentes rolam dentro da coluna. A última ação permanece acessível acima da barra flutuante.
- [x] A altura acompanha o redimensionamento da janela e a quebra dos controles em telas menores, sem introduzir uma compensação fixa que só funcione na captura enviada.
- [x] Rolagem horizontal, seleção, abertura de ações e arraste existentes continuam funcionando; abrir/fechar o editor não torna as listas inacessíveis.
- [x] Parceiros, Categorias e Feed preservam sua aparência e rolagem. O bloco Hoje da Home preserva seu comportamento atual; o ajuste de aproveitamento da janela se aplica à página dedicada.
- [x] Teste no componente real reproduz o limite inadequado antes da correção. Navegador com dados controlados verifica altura útil, ausência de overflow externo, rolagem da coluna e acesso à última ação, com poucas/muitas ações e janelas de alturas diferentes.
- [x] Testes pertinentes, formatação, lint, typecheck e build passam; limites da verificação são registrados.

Verificação local:443 testes, format/lint/typecheck/build e Chromium isolado em desktop/mobile, incluindo resize, listas curtas/vazias/longas, editor, arraste com HTTP controlado e comparação com o uso na Home. Sem push/deploy.

---

<a id="today-viewport-issues-02-dedicated-today-page-scroll"></a>

## today-viewport · 02-dedicated-today-page-scroll

Origem: `.scratch/today-viewport/issues/02-dedicated-today-page-scroll.md`. Classificação: Encerrado/aprovado no registro da série.

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

---

<a id="visual-controls-issues-01-focus-rings"></a>

## visual-controls · 01-focus-rings

Origem: `.scratch/visual-controls/issues/01-focus-rings.md`. Classificação: Encerrado/aprovado no registro da série.

# 01 — Anéis de foco consistentes (ring-ring/30)

**Resumo:** Uniformiza os anéis de foco dos controles com opacidade /30.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Aplicado local (03/11) — aguarda validação visual do proprietário
Escopo: somente estilos de foco em `app/` (sem mudar comportamento de teclado/foco).

## Contexto

O proprietário quer todos os anéis de foco do app iguais ao do botão Prism: mesma largura, mesma opacidade (/30) e mesmo estilo. Hoje há três famílias divergentes: `ring-ring/50`, `ring-ring` pleno e `outline-*`, além de `ring-primary` e variações inset. A regra base em `app/tailwind.css:379` aplica `outline-ring/50` a todo elemento.

## Padrão (fonte: `app/components/prism/button.tsx:11`)

`outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30`

- Variantes de estado mantêm a própria cor, mas com a mesma largura (ring-3): destructive `ring-destructive/20` (button:24, badge:13), success `ring-success-accent/30` (button:26).
- Contêineres de campo usam `focus-within:` ou `has-[...:focus-visible]:` com as mesmas classes (combobox:259, time-field:12, input-group:24).
- Equivalência: `ring-[3px]` = `ring-3` (mesma largura; só padronizar a escrita).

## Levantamento (arquivo:linha | classe atual | difere em quê | proposta)

### A. Já no padrão (10 + 2 equivalentes) — sem ação

button:11, badge:4, color-field:10, combobox:259, date-range-picker:119, input-group:24, input:9, select:84, textarea:15, time-field:12 | `border-ring ring-3 ring-ring/30` | nada | manter
prism/slider.tsx:79 | `ring-3 ring-ring/30` (sem border) | sem border-ring (thumb) | manter
prism/toggle.tsx:9 | `ring-[3px] ring-ring/30` | só a grafia | trocar para `ring-3` (opcional)

### B. Prism primitivos fora do padrão (7)

| arquivo:linha                 | classe atual                                                           | difere em quê                      | proposta                                                           |
| ----------------------------- | ---------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| prism/calendar.tsx:292        | `group-data-[focused=true]/day:border-ring ring-[3px] ring-ring/50`    | /50                                | `ring-3 ring-ring/30`                                              |
| prism/checkbox.tsx:26         | `group-data-[focus-visible]:border-ring ring-[3px] ring-ring/50`       | /50                                | `ring-3 ring-ring/30`                                              |
| prism/radio-group.tsx:25      | `group-data-[focus-visible]/radio:border-ring ring-[3px] ring-ring/50` | /50                                | `ring-3 ring-ring/30`                                              |
| prism/color-area.tsx:38       | `focus-visible:ring-2 ring-primary ring-offset-1`                      | largura 2, cor primary, offset     | `ring-3 ring-ring/30` (+ border-ring se couber), sem offset        |
| prism/color-slider.tsx:50     | `focus-visible:ring-2 ring-primary ring-offset-1`                      | idem                               | idem                                                               |
| prism/button.tsx:29           | `unstyled: focus-visible:ring-0`                                       | sem anel                           | exceção: consumidores `unstyled` definem o foco próprio (conferir) |
| prism/input-group.tsx:258,278 | `focus-visible:ring-0`                                                 | anel desligado no controle interno | manter: o anel está no grupo (input-group:24)                      |

### C. Componentes do app com ring fora do padrão (11)

| arquivo:linha                                      | classe atual                                       | difere em quê        | proposta                                       |
| -------------------------------------------------- | -------------------------------------------------- | -------------------- | ---------------------------------------------- |
| features/CalendarDayCell.tsx:97                    | `ring-2 ring-ring/50 ring-inset`                   | ring-2, /50, inset   | `ring-3 ring-ring/30` (confirmar inset, ver D) |
| features/action-drawer/ActionFormDrawer.tsx:974    | `bg-input ring-2 ring-ring ring-inset`             | ring-2, pleno, inset | `ring-3 ring-ring/30` (+ bg-input?)            |
| features/action-drawer/conflict-comparison.tsx:233 | `ring-2 ring-ring/50 ring-inset`                   | ring-2, /50, inset   | padrão                                         |
| layout/KanbanPhasesBoard.tsx:177                   | `ring-2 ring-ring/50 ring-inset`                   | ring-2, /50, inset   | padrão                                         |
| routes/app/profile.tsx:316                         | `ring-2 ring-ring/50 ring-inset`                   | ring-2, /50, inset   | padrão                                         |
| routes/app/profile.tsx:432                         | `ring-2 ring-ring/50 ring-inset`                   | idem                 | padrão                                         |
| routes/app/admin/partner/$slug.tsx:499             | `focus-within:border-ring ring-[3px] ring-ring/50` | /50                  | `ring-3 ring-ring/30`                          |
| routes/app/admin/partner/$slug.tsx:535             | idem                                               | /50                  | idem                                           |
| features/media/ContentReorderDialog.tsx:73         | `ring-2 ring-ring`                                 | ring-2, pleno        | padrão                                         |
| features/media/ContentReorderDialog.tsx:89         | `ring-2 ring-ring`                                 | idem                 | padrão                                         |
| features/media/InstagramPreview.tsx:140            | `ring-2 ring-ring ring-inset`                      | ring-2, pleno, inset | padrão                                         |
| features/media/WorkFileThumbnail.tsx:55            | `ring-2 ring-ring`                                 | ring-2, pleno        | padrão                                         |

(Linhas = 12 ocorrências; contadas abaixo.)

### D. Foco por `outline-*` (3 + global)

| arquivo:linha                           | classe atual                                 | difere em quê          | proposta                                                               |
| --------------------------------------- | -------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| features/home/HomeCalendarView.tsx:115  | `outline-2 outline-offset-2 outline-ring`    | outline, pleno, offset | trocar por ring padrão                                                 |
| features/home/HomeTodayView.tsx:53      | `outline-2 outline-offset-4 outline-ring`    | idem                   | idem                                                                   |
| features/media/WorkFileThumbnail.tsx:36 | `outline-2 -outline-offset-2 outline-ring`   | outline interno        | idem (ring padrão)                                                     |
| tailwind.css:379                        | `* { @apply border-border outline-ring/50 }` | outline global /50     | alterar para `outline-ring/30` (só afeta elementos sem `outline-none`) |

### E. Anel de estado "editando" (não é foco de teclado)

| arquivo:linha               | classe atual                                          | proposta                                                                                      |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| features/ActionItem.tsx:174 | `ring-primary focus-within:ring-2` (cartão em edição) | confirmar com o proprietário; provável exceção (indica edição/seleção, como linhas 169 e 190) |

### F. Foco por fundo/borda, não por anel (exceções aprovadas ou a confirmar)

| arquivo:linha                                                                                            | classe atual                                           | situação                                                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| prism/tabs.tsx:34,36                                                                                     | `data-[focus-visible]:bg-input` + `border-t-primary`   | exceção aprovada (AGENTS: abas)                            |
| features/ComboboxTrigger.tsx:33                                                                          | `data-[focus-visible]:bg-input` (variante form-footer) | exceção aprovada (rodapé)                                  |
| features/RichTextEditor.tsx:66                                                                           | `data-[focus-visible]:bg-input`                        | exceção aprovada (barra do editor)                         |
| prism/dropdown-menu.tsx:94,96,98,163; select.tsx:207; combobox.tsx:176; command.tsx:249                  | `focus:/data-focused:bg-secondary/50`                  | itens de lista: realce, não anel; exceção proposta         |
| features/ComboboxTrigger.tsx:47; layout/Header.tsx:725                                                   | `focus:bg-secondary/50`, `focus:bg-destructive/10`     | realce; exceção proposta                                   |
| features/HelpPage.tsx:293,322; routes/app/notifications.tsx:149; action-drawer/EssentialsTab.tsx:210,416 | `bg-foreground/5`                                      | realce de linha/área; exceção proposta                     |
| prism/time-field.tsx:57                                                                                  | `focus:bg-primary`                                     | segmento selecionado; exceção proposta                     |
| features/ActionItemTitleInput.tsx:41                                                                     | `focus:bg-muted ring-0`                                | edição inline: sem anel de propósito                       |
| features/ActionComments/CommentInput.tsx:71                                                              | `focus:border-0 ring-0 outline-none`                   | campo sem moldura, foco sem anel                           |
| features/PartnersCombobox.tsx:65                                                                         | `focus-visible:border-transparent ring-0`              | decisão da busca (AGENTS: sem ring sobre borda)            |
| features/action-drawer/PartnerColorPicker.tsx:145                                                        | `border-destructive ring-destructive/20`               | estado de erro; alinhar para ring-3 se hoje for ring menor |

## Contagens

- Padrão (border-ring + ring-3 + /30): 10 (+ slider e toggle equivalentes) = 12
- `ring-ring/50`: 11 (calendar, checkbox, radio, CalendarDayCell, conflict-comparison, Kanban, profile x2, partner admin x2) + tailwind.css:379 (outline /50)
- `ring-ring` pleno com ring-2: 5 (ActionFormDrawer, ContentReorderDialog x2, InstagramPreview, WorkFileThumbnail:55)
- `ring-primary ring-2 offset-1`: 2 (color-area, color-slider) + 1 estado de edição (ActionItem:174)
- `outline-*` como foco: 3 + 1 global
- Foco só por fundo/borda ou sem anel: ~20 linhas, a maioria exceções (seção F)
- Por camada: Prism 7 divergentes; app/components 15 (11 ring + 3 outline + 1 estado); routes 4 (profile x2, partner admin x2); css 1.

Total a alterar (sem exceções): 27 ocorrências em 17 arquivos aprox.

## Decisões a confirmar com o proprietário

1. Anéis `ring-inset` (CalendarDayCell, Kanban, profile, conflict-comparison, ActionFormDrawer, InstagramPreview): manter inset por causa de contêineres com overflow oculto, só trocando para `ring-3 ring-ring/30`? Ou usar o anel externo padrão? Inset com 3px pode cortar conteúdo.
2. Abas (bg-input + borda superior primary) e rodapé da gaveta (bg-input): confirmados como exceção.
3. Itens de lista/menu (realce `bg-secondary/50`): manter como exceção (não são controles focados isolados).
4. Checkbox/radio/calendário: passar de /50 para /30 (sem exceção)?
5. Inputs com `border-ring` + ring: hoje geram aparência de borda dupla (item em aberto). Remover `border-ring` do padrão ou manter a borda trocando só a cor? Decidir antes de aplicar, pois afeta Input, Select, Textarea, Combobox, TimeField, ColorField, DateRange, InputGroup, Button e Badge.
6. Estado de edição de ActionItem:174 e color-area/slider (primary): exceção ou padrão?
7. `outline-ring/50` global (tailwind.css:379): mudar para /30 ou remover?
8. Campos sem anel de propósito (título inline, comentário, busca de parceiros): manter.

## Critérios de aceite

- Nenhum `ring-ring/50`, `ring-ring` pleno, `ring-2` de foco ou `outline-*` de foco fora das exceções aprovadas.
- Todos os anéis: `ring-3` (3px) e `/30`; variantes de erro/sucesso mantêm sua cor com a mesma largura.
- Exceções documentadas (seção F) inalteradas.
- Sem mudança de ordem de Tab, foco programático ou comportamento descrito no AGENTS.
- Arquivos alterados formatados (Prettier); sem criar testes.

## Roteiro de validação (proprietário)

1. `/ui`: com Tab, percorrer Botão, Input, Select, Textarea, Checkbox, Radio, Toggle, Slider, Calendário, Cores, Combobox: todos com o mesmo anel suave de 3px.
2. App: Tab no calendário do parceiro (dia), Kanban (coluna), Minha Conta (seções), gaveta de ação (rodapé), Reordenar conteúdo, miniaturas de arquivos, Home Hoje/Calendário, admin do parceiro (campos de cor).
3. Conferir tema claro e escuro, e que nada fica cortado em áreas com rolagem.
4. Conferir que abas, itens de menu e título inline seguem como antes.

## Aplicação (03/11)

Decisões do proprietário aplicadas: todo anel de foco usa `ring-3 ring-ring/30`; `ring-inset` mantido onde o contêiner tem overflow/rolagem (CalendarDayCell, Kanban, Minha Conta x2, conflict-comparison, ActionFormDrawer (fechar), InstagramPreview, WorkFileThumbnail miniatura) com `ring-3` inset; `outline-ring/50` global agora `/30`.
Exceções mantidas: abas, itens de lista/menu/select/combobox/command, gatilhos `form-footer`, barra do RichTextEditor, campos sem anel (título inline, comentário, busca de parceiros), estados de seleção `ring-primary` (ActionItem sprint/seleção, swatches de cor, ColorListEditor arraste, Planejamento) e erro `ring-destructive/20`.
Em aberto: borda dupla (`border-ring` + anel) nos inputs, sem decisão. Ticket 09 (seção "Foco" no `/ui`) segue a executar e mostrará quase tudo como F1.

---

<a id="visual-controls-issues-02-text-sizes"></a>

## visual-controls · 02-text-sizes

Origem: `.scratch/visual-controls/issues/02-text-sizes.md`. Classificação: Encerrado/aprovado no registro da série.

# 02 — Tamanhos de texto por tamanho de controle

**Resumo:** Alinha fonte e altura de linha à escala de tamanho de cada controle.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Aprovado (proprietário, 03/11/2026). Chips do ComboboxChips com 11/12/14px são intencionais; a regra de fonte do Calendar vale só para as células de dia (títulos ajustados pelo proprietário).

## Decisão (proprietário, 03/11/2026)

| Tamanho | Texto              | Observação                                         |
| ------- | ------------------ | -------------------------------------------------- |
| xs      | `text-xs` (12px)   | único tamanho com `text-xs`                        |
| sm      | `text-sm` (14px)   | `text-xs` em sm foi testado e ficou difícil de ler |
| default | `text-sm` (14px)   | sem mudança                                        |
| lg      | `text-base` (16px) | decidido em 03/11/2026 e aplicado localmente       |

Aplicado localmente (sem commit), alturas/padding/raios inalterados:

- `prism/input.tsx`, `color-field.tsx`, `time-field.tsx`: sm `text-xs placeholder:text-xs` → `text-sm placeholder:text-sm`.
- `prism/input-group.tsx`: contêiner sm, `InputGroupText` sm e `InputGroupInput`/textarea sm → `text-sm`.
- `prism/combobox.tsx`: contêiner de chips sm → `text-sm`. Chips mantidos (sm `text-[11px]`, default `text-xs`, lg `text-sm`), decisão separada.
- `prism/command.tsx`: `CommandInput` sm → `text-sm` (altura `h-9` mantida).
- `prism/calendar.tsx` sm: contêiner e dia `text-xs` → `text-sm`; span interno `text-[10px]` → `text-xs`; cabeçalho semanal `text-[0.7rem]` → `text-xs`.
- `features/ComboboxTrigger.tsx`: `form-inline` sm → `text-sm`.
- `features/ActionComments/CommentInput.tsx`: botões Cancelar/Enviar (`h-8`) → `text-sm`. Botão de audiência (`size="xs"`, `h-7`) e itens/vazio do Command de menção (`text-xs`) mantidos.
- lg → `text-base`: `toggle.tsx` (`lg` e `icon-lg`; `ToggleGroup` repassa o tamanho), `button-group.tsx` (`ButtonGroupText` via `group-data-[size=lg]/button-group:text-base`, pois `ButtonGroup` já expõe `data-size`), `select.tsx` (gatilho `data-[size=lg]:text-base`), `date-range-picker.tsx` (gatilho `lg`; o span interno agora herda), `combobox.tsx` (input interno do `ComboboxChips` herda o tamanho do contêiner).
- Limpeza de redundâncias (texto declarado uma vez na base; só xs/lg sobrescrevem): `input.tsx`, `color-field.tsx`, `time-field.tsx` (`text-sm placeholder:text-sm` movido para a base), `input-group.tsx` (addon `text-sm` na base; removidos os três `text-*` repetidos de `InputGroupInput`, pois `PrismInput` já recebe `size`; `InputGroupText` sem `text-sm` repetido), `command.tsx` (`CommandInput`: `text-sm` na base, só `h-9` em sm), `combobox.tsx` (contêiner de chips `text-sm` na base; removidos `text-sm` do input e `md:text-sm`), `checkbox.tsx`/`radio-group.tsx` (variante default sem `text-sm` repetido), `calendar.tsx` (classes comuns de célula/cabeçalho/contêiner em constantes; só lg sobrescreve), `date-range-picker.tsx` (span sem `text-sm`).
- Button/Toggle/ToggleGroup sm já herdavam `text-sm`; Select e DateRangePicker trigger sm já eram `text-sm`.

Medição em `/ui#test-text-sizes` (03/11/2026): coluna sm em 14px em todos os controles; xs em 12px. Avisos restantes:

- lg: corrigido (Toggle, ToggleGroup, ButtonGroupText, Select trigger, DateRangePicker trigger, input do ComboboxChips agora 16px).
- ComboboxChips · chip: 11px / 12px / 14px (decisão separada); contêiner lg mede 50px, acima de 48px.
- Calendar · título do mês: +1 degrau (default 16px, lg 18px), escala própria (aviso restante na seção de testes). Nota: o `h2` do título precisa de classe `text-*` explícita em sm (sem ela cai em 36px).
- Calendar · dia: o teste media o `td` (40/48/56px). O `td` inclui o `mt-2` do wrapper da célula (8px de espaço entre semanas); o botão do dia mede 32/40/48px. Corrigido o seletor do teste, sem bug de layout.
- CheckBox/RadioGroup sm usam `text-xs` no rótulo (não alterado; rótulos estão fora da regra).

## Contexto

Escala de altura dos controles: xs `h-6`, sm `h-8`, default `h-10`, lg `h-12`. Texto pretendido (a decidir): sm `text-xs`, default `text-sm`, lg `text-base`. Hoje cada primitivo decide por conta própria, e há desvios: `Button` sm e default não declaram tamanho (herdam `text-sm` da base), enquanto `Input`/`InputGroup`/`ColorField`/`TimeField` usam `text-xs` em sm. Resultado: um Button sm e um Input sm lado a lado têm fontes diferentes.

Validação visual: seção temporária `/ui#test-text-sizes` ("Teste — tamanhos de texto", `app/components/ui-sections/TextSizeTestSection.tsx`, em construção), com todos os controles lado a lado por tamanho. Remover a seção ao fechar o ticket.

Observação: `calendar.tsx` e outros arquivos de `prism/` estão com alterações locais não commitadas; as linhas abaixo refletem a árvore de trabalho em 03/11/2026 e podem se deslocar.

## Levantamento — primitivos Prism (`app/components/prism/`)

"—" = não tem esse tamanho. "(herda)" = sem classe própria; vale o `text-sm` da base.

| Componente                                     | xs           | sm                          | default                 | lg             | Arquivo:linha                       | Desvio                                                              |
| ---------------------------------------------- | ------------ | --------------------------- | ----------------------- | -------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Button                                         | text-xs      | (herda sm)                  | (herda sm)              | text-base      | button.tsx:11,32-36                 | sm = default = text-sm; só xs/lg declaram                           |
| Toggle                                         | text-xs      | (herda sm)                  | (herda sm)              | (herda sm)     | toggle.tsx:9,21-25                  | lg continua text-sm (Button lg é text-base)                         |
| ToggleGroup                                    | herda Toggle | herda                       | herda                   | herda          | toggle-group.tsx:18,57              | só repassa `size`                                                   |
| ButtonGroupText                                | —            | text-sm fixo                | text-sm fixo            | text-sm fixo   | button-group.tsx:62,72              | sem variação por tamanho                                            |
| Input                                          | —            | text-xs (+placeholder)      | text-sm                 | text-base      | input.tsx:13-15                     | sm diverge de Button sm                                             |
| InputGroup (contêiner)                         | —            | text-xs                     | text-sm                 | text-base      | input-group.tsx:76-79               | idem                                                                |
| InputGroupAddon                                | —            | text-xs                     | text-sm                 | text-base      | input-group.tsx:228-230             | ok internamente                                                     |
| InputGroupInput/textarea                       | —            | text-xs                     | text-sm                 | text-base      | input-group.tsx:259-261             | ok internamente                                                     |
| Textarea                                       | —            | —                           | text-base, `md:text-sm` | —              | textarea.tsx:15                     | sem prop de tamanho; muda por breakpoint                            |
| Select trigger                                 | —            | text-sm                     | text-sm                 | text-sm        | select.tsx:84                       | só altura varia (`data-[size]`); sm deveria ser xs                  |
| Select label / item / vazio                    | —            | xs / sm / sm                | idem                    | idem           | select.tsx:193,207,243              | itens não acompanham o tamanho                                      |
| Combobox input (campo)                         | —            | text-xs                     | text-sm                 | text-base      | combobox.tsx:237-239                | ok                                                                  |
| Combobox chips                                 | —            | text-[11px]                 | text-xs                 | text-sm        | combobox.tsx:243-245                | único uso de 11px no Prism; chip é um degrau abaixo                 |
| Combobox input interno / itens / label / vazio | —            | text-sm / sm / xs / sm      | idem                    | idem           | combobox.tsx:351,176,209,219        | `md:text-sm` redundante; input interno não segue o tamanho do campo |
| DateRangePicker trigger                        | —            | text-sm                     | text-sm                 | text-sm        | date-range-picker.tsx:119,130,44-48 | `triggerSizeClasses` só define altura/padding                       |
| TimeField                                      | —            | text-xs                     | text-sm                 | text-base      | time-field.tsx:16-18                | ok                                                                  |
| ColorField                                     | —            | text-xs                     | text-sm                 | text-base      | color-field.tsx:14-16               | ok                                                                  |
| Calendar — célula                              | —            | text-xs (dia) / 10px (span) | text-sm / xs            | text-base / sm | calendar.tsx:37-54                  | span `text-[10px]` arbitrário                                       |
| Calendar — cabeçalho semanal                   | —            | text-[0.7rem]               | text-xs                 | text-sm        | calendar.tsx:39,46,53               | `0.7rem` arbitrário (≈11,2px)                                       |
| Calendar — título do mês                       | —            | text-sm                     | text-base               | text-lg        | calendar.tsx:40,47,54               | escala própria (+1 degrau)                                          |
| Command input                                  | —            | text-xs (`h-9`)             | text-sm (`h-11`)        | —              | command.tsx:153                     | alturas fora da escala (h-9, h-11)                                  |
| Command item / empty / heading / shortcut      | —            | text-sm / sm / xs / xs      | idem                    | idem           | command.tsx:176,194,275             | sem variação por tamanho                                            |
| Dropdown item                                  | —            | text-sm                     | text-sm                 | text-sm        | dropdown-menu.tsx:94-98,163         | fixo                                                                |
| Dropdown label / shortcut                      | —            | text-xs                     | text-xs                 | text-xs        | dropdown-menu.tsx:80,219            | fixo                                                                |
| Tabs                                           | —            | herda                       | herda (`h-10`)          | —              | tabs.tsx:29                         | sem classe de texto; herda do contexto                              |
| Badge                                          | —            | text-xs (`h-5`)             | —                       | —              | badge.tsx:4                         | tamanho único                                                       |
| Kbd                                            | —            | text-xs (`h-5`)             | —                       | —              | kbd.tsx:10                          | tamanho único                                                       |
| Accordion trigger / painel                     | —            | text-sm                     | text-sm                 | text-sm        | accordion.tsx:54,86                 | fixo                                                                |
| Dialog título / descrição                      | —            | text-xl / text-sm           | idem                    | idem           | dialog.tsx:206,220                  | fixo; título não é de controle                                      |
| Alert título / descrição                       | —            | text-xl / text-sm           | idem                    | idem           | alert.tsx:49,64                     | fixo                                                                |
| Toast (sonner)                                 | —            | sem tamanho próprio         | —                       | —              | sonner.tsx                          | não há classe `text-*` (fonte do Sonner)                            |
| Popover (corpo / título)                       | —            | text-sm / text-base         | idem                    | idem           | popover.tsx:82,94                   | fixo                                                                |

## Levantamento — componentes da aplicação com tamanho fixo

| Componente                 | Onde                                                                                                                                         | Desvio                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ComboboxTrigger            | features/ComboboxTrigger.tsx:32 (base `text-sm`), :46 (`form-inline` sm: `h-8 ... text-xs`)                                                  | sm usa text-xs; base ignora o tamanho; `filter` usa `buttonVariants` sm (herda sm) |
| GlobalSearchCommand        | features/GlobalSearchCommand.tsx:486,491 (text-sm), :526,569 (text-xs)                                                                       | texto de apoio xs, fixo; campo vem do Command                                      |
| RichTextEditor (barra)     | features/RichTextEditor.tsx                                                                                                                  | sem `text-*` direto na barra (usa Button/Toggle); conferir ao validar              |
| CommentInput               | features/ActionComments/CommentInput.tsx:71 (text-sm), :87,192,201 (`h-7`/`h-8 ... text-xs`), :158 (text-xs), :187 (`text-[10px]` uppercase) | alturas h-7/h-8 e text-xs forçados sobre Button; contorna a escala                 |
| ActionFormFooter           | features/action-drawer/ActionFormFooter.tsx                                                                                                  | sem `text-*` direto; depende de ComboboxTrigger `form-footer` e Button             |
| Header (menu/notificações) | layout/Header.tsx:453-509                                                                                                                    | text-sm/text-xs fixos; sem relação com controles                                   |

## Escala tipográfica usada no app (`app/**/*.tsx`, ocorrências)

| Classe                                    | App total | Dentro de prism/ |
| ----------------------------------------- | --------- | ---------------- |
| text-[8px] / [9px]                        | 3 / 6     | 0                |
| text-[10px]                               | 21        | 1                |
| text-[11px]                               | 6         | 1                |
| text-[0.7rem]                             | 1         | 1                |
| outros px arbitrários (20–38px, 8vh etc.) | ~9        | 0                |
| text-xs                                   | 223       | 30               |
| text-sm                                   | 215       | 56               |
| text-base                                 | 42        | 20               |
| text-lg                                   | 18        | 1                |
| text-xl                                   | 11        | 2                |
| text-2xl a 4xl                            | 30        | 0                |

Total de `text-[...]` arbitrários: 50. Leitura: xs e sm dominam (~438 usos); abaixo de 12px há ~37 usos, que a regra "sm = xs" não resolve e pedem decisão separada.

## Opções

**A — sm = text-xs em tudo, inclusive Button.**
Mudanças: `button.tsx` (sm: `text-xs`; default fica `text-sm`), `toggle.tsx` (sm `text-xs`, lg `text-base`), `select.tsx` (trigger e itens por tamanho), `date-range-picker.tsx` (`triggerSizeClasses`), `combobox.tsx` (input interno e itens), `command.tsx` (sm), `calendar.tsx` (remover 10px/0.7rem), `ComboboxTrigger.tsx` (base por tamanho), `CommentInput.tsx` (remover `h-7/h-8 text-xs` forçados). Input/InputGroup/TimeField/ColorField já estão assim. Efeito visual: Button sm e Toggle sm ficam menores do que hoje; usos de `size="sm"` pela aplicação encolhem (conferir lista com grep de `size="sm"`).

**B — sm = text-sm em tudo.**
Mudanças: `input.tsx`, `input-group.tsx` (contêiner, addon, input), `time-field.tsx`, `color-field.tsx`, `combobox.tsx` (campo e chips), `command.tsx` input sm, `calendar.tsx` sm, `ComboboxTrigger.tsx`. Button, Select e DateRangePicker permanecem. Efeito: menos arquivos em Button/Toggle, mas Input sm cresce e a diferença entre sm e default fica só na altura; xs passa a ser o único texto menor.

**C — outra regra** (ex.: texto fixo `text-sm` em todos exceto xs e lg; ou sm = xs só em campos de entrada). Definir tabela alvo e anotar aqui.

Decisões complementares (valem para qualquer opção): destino dos 11px/10px/0.7rem (Combobox chips, Calendar, CommentInput); se Select/DateRangePicker/Dropdown/Command items acompanham o tamanho; se Textarea ganha prop `size` e perde `md:text-sm`; se título do mês do Calendar mantém +1 degrau.

## Critérios de aceite

- Tabela alvo (componente x tamanho) registrada neste ticket após a decisão.
- Todo controle size-capable usa a mesma classe de texto por tamanho, sem herança implícita (Button/Toggle declaram sm e default explicitamente).
- Placeholder acompanha o texto do campo.
- Sem `text-[Npx]`/`text-[0.7rem]` em primitivos de controle, salvo exceção documentada.
- Wrappers da aplicação (ComboboxTrigger, CommentInput) não reimpõem tamanho de texto/altura que contrarie a escala.
- Nenhuma quebra de altura da escala h-6/8/10/12.

## Validação

1. Abrir `/ui#test-text-sizes` e comparar, por tamanho, Button, Toggle, ToggleGroup, Input, InputGroup, Select, Combobox, DateRangePicker, TimeField, ColorField, Command e Calendar lado a lado: texto e altura alinhados.
2. Conferir tema claro/escuro e uma paleta, no desktop e a 375px.
3. Percorrer telas com `size="sm"` (gaveta de ação, CommentInput, filtros) e confirmar que nada corta ou quebra linha.
4. Prettier nos arquivos alterados; typecheck só se tocar tipos de props.
5. Remover `TextSizeTestSection.tsx` e sua entrada em `app/routes/ui.tsx` ao concluir (ou registrar por que fica).

---

<a id="visual-controls-issues-03-popovers-and-containers"></a>

## visual-controls · 03-popovers-and-containers

Origem: `.scratch/visual-controls/issues/03-popovers-and-containers.md`. Classificação: Encerrado/aprovado no registro da série.

# 03 - Padronizar popovers e containers flutuantes

**Resumo:** Padroniza superfícies, espaçamento e dimensões dos popovers e containers.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

**Status:** Aprovado (proprietário, 03/11/2026). Sem commit.
**Escopo original:** levantamento e plano; aplicado conforme as decisões do proprietário abaixo.

## Decisões aplicadas (03/11/2026)

1. **Contorno:** `ring-1 ring-foreground/5` (dark `/10`) trocado por `border border-foreground/5 dark:border-foreground/10` em Popover, DropdownMenu (conteúdo e submenu), SelectContent, ComboboxContent e Dialog (e CommandDialog, que herda). Mesmo contraste; o anel fica reservado para foco. Impacto: o `border` reduz o conteúdo em 1px por lado (border-box, sem efeito na largura externa). Os cabeçalhos/rodapés internos não têm bordas laterais; larguras exatas (`w-(--trigger-width)`) seguem iguais. Sheet já usava `border-*` por lado: ganhou a mesma cor de contorno. Alert e Toaster mantêm borda semântica colorida (estado), fora da regra de contorno neutro.
2. **Padding de lista:** `p-1` em dropdown/submenu (era `p-2`), lista do Command (era `p-1.5 pb-3.5`); Select/Combobox já eram `p-1`. Menu do perfil (Header) perdeu `p-0` e os recuos `p-2/px-2` dos grupos.
3. **Larguras:** `PrismPopover size` = sm `w-56`, default `w-72`, lg `w-80`; `PrismDialog size` = sm `sm:max-w-sm`, default `sm:max-w-lg`, lg `sm:max-w-xl`, xl `sm:max-w-2xl`. `--trigger-width` mantido.
4. **Sombra/translucidez:** uma sombra (`shadow-lg`) para flutuantes (Dialog e Sheet deixaram `shadow-xl`); translucidez + blur permitida em barras flutuantes (DashboardMetrics, BubbleMenu, AppBar).
5. **Raio:** todos os containers `rounded-2xl squircle` (Toaster passou de 24px para 16px). Sheet: sem raio por encostar na borda da janela — correto, apenas documentado.
6. Desvios da tabela corrigidos (ver mapeamento no relatório de execução e `git diff`). AppBar: `rounded-4xl` e `div border-b` removidos; barra flutuante `rounded-2xl`, `p-1`, `bg-popover/95` + blur.
7. Tooltip/HoverCard: não existem (sem arquivo Prism nem pacote).

Pendência de validação: `ActionFormDrawer` (comparação de conflito) passou de `max-w-3xl/5xl` para `size="xl"` (2xl): conferir se a comparação ainda cabe.

## Contexto

A regra oficial (`docs/plans/visual-controls-final-status.md`, seção 2) define containers (`Popover`, `DropdownMenu`, `SelectContent`, `ComboboxContent`, `CommandDialog`, `Dialog`, `Alert`, `Toaster`) como `rounded-2xl` e itens internos como `rounded-xl squircle`, com bordas de 1px. Os primitivos Prism já seguem a regra. Os desvios estão nos consumidores, que sobrescrevem raio, padding, borda e sombra via `className`. Pendência registrada na seção 4 do mesmo documento: popover do AppBar com `rounded-4xl`.

## Base atual dos primitivos (`app/components/prism/`)

| Primitivo                           | Raio                                     | Padding                                | Borda/anel                                            | Sombra      | Fundo        | Largura                                    |
| ----------------------------------- | ---------------------------------------- | -------------------------------------- | ----------------------------------------------------- | ----------- | ------------ | ------------------------------------------ |
| `popover.tsx:67`                    | `rounded-2xl squircle`                   | `p-4`, `gap-4`                         | `ring-1 ring-foreground/5` (dark `/10`), sem `border` | `shadow-lg` | `bg-popover` | `w-72 max-w-[calc(100vw-2rem)]`            |
| `dropdown-menu.tsx:46` (conteúdo)   | `rounded-2xl squircle`                   | `p-2`                                  | `ring-1`                                              | `shadow-lg` | `bg-popover` | `w-(--trigger-width) min-w-48`             |
| `dropdown-menu.tsx:189` (submenu)   | `rounded-2xl squircle`                   | `p-2`                                  | `ring-1`                                              | `shadow-lg` | `bg-popover` | `w-auto min-w-24`                          |
| `select.tsx:139`                    | `rounded-2xl squircle`                   | lista `p-1` (`select.tsx:159`)         | `ring-1`                                              | `shadow-lg` | `bg-popover` | `w-(--trigger-width) min-w-36`             |
| `combobox.tsx:141`                  | `rounded-2xl squircle`                   | lista `p-1` (`combobox.tsx:160`)       | `ring-1`                                              | `shadow-lg` | `bg-popover` | `w-(--trigger-width) min-w-36`, `max-h-72` |
| `command.tsx:52` (`PrismCommand`)   | `rounded-2xl squircle`                   | lista `p-1.5 pb-3.5` (`:166`)          | nenhuma                                               | nenhuma     | `bg-popover` | `size-full`                                |
| `command.tsx:109` (`CommandDialog`) | herda Dialog; `Command` interno sem raio | `p-0`                                  | herda                                                 | herda       | herda        | `sm:max-w-xl`                              |
| `dialog.tsx:114`                    | `rounded-2xl squircle`                   | seções `px-5 py-4` / corpo `px-5 py-2` | `ring-1`                                              | `shadow-xl` | `bg-popover` | `sm:max-w-lg`                              |
| `sheet.tsx:76`                      | sem raio (painel colado à borda)         | `p-6` nas seções                       | `border-t/r/l/b` conforme lado                        | `shadow-xl` | `bg-popover` | `w-3/4 sm:max-w-sm`                        |
| Tooltip / HoverCard                 | não existem em `prism/` nem em `app/`    | -                                      | -                                                     | -           | -            | -                                          |

Observações sobre a base:

- Os containers usam **anel** (`ring-1`), não `border`; a regra diz "borda 1px". O anel de 5% de opacidade é quase invisível.
- Sombra: `shadow-lg` (popover/menus/select/combobox) versus `shadow-xl` (dialog/sheet). Já existe uma escala implícita (flutuante pequeno x modal).
- Padding de lista interna: `p-1` (select/combobox), `p-2` (dropdown), `p-1.5` (command). Três valores para a mesma função.
- Raio do `Sheet`: nenhum (aceitável por encostar na borda da janela, mas não está documentado).

## Desvios nos consumidores (`app/`)

| arquivo:linha                                                                                                | Container                                      | Override                                                                                                     | Desvio da regra                                                                                                                 | Proposta                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `layout/AppBar.tsx:228`                                                                                      | `PrismPopover` (filtro de parceiros + Command) | `rounded-4xl p-0`                                                                                            | Raio `4xl` fora da regra; `CommandInput` dentro de `div border-b` (`:230`) duplica a linha do próprio input (`command.tsx:140`) | Remover `rounded-4xl`; remover `div border-b`; padrão de popover de lista (ver decisão 2) |
| `layout/AppBar.tsx:85`                                                                                       | Barra flutuante (div própria)                  | `rounded-3xl border bg-popover p-2 squircle`                                                                 | Container flutuante fora do Prism; `3xl`                                                                                        | Decidir se a barra é "container" (`2xl`) ou superfície própria; ver decisão 1             |
| `features/ResponsiblesCombobox.tsx:86`                                                                       | `PrismPopover` + Command                       | `w-[320px] overflow-hidden rounded-3xl border bg-popover p-0 shadow-xl squircle`                             | `3xl`, `border` extra, `shadow-xl`, `bg-popover` e `squircle` redundantes                                                       | Reduzir a `w-80 p-0 overflow-hidden` (ou variante de popover de lista)                    |
| `features/SprintCombobox.tsx:119`                                                                            | `PrismPopover` + Command                       | `w-75 overflow-hidden rounded-3xl border bg-popover p-0 shadow-xl squircle`                                  | idem; largura `w-75` fora da escala                                                                                             | idem; unificar largura com Responsibles/Partners                                          |
| `features/PartnersCombobox.tsx:99`                                                                           | `PrismPopover` + Command                       | `w-[320px] overflow-hidden rounded-3xl border bg-popover p-0 shadow-xl squircle` (+ `ring-0` com `allowAll`) | idem; `ring-0` condicional mexe no anel                                                                                         | idem; revisar o `ring-0` junto com a decisão de borda                                     |
| `features/RichTextEditor.tsx:737`                                                                            | `BubbleMenu` (barra contextual)                | `rounded-2xl border bg-background/95 p-1 shadow-lg backdrop-blur-md squircle`                                | Raio ok; `bg-background/95` + `backdrop-blur` + `border` divergem do `bg-popover` + anel                                        | Alinhar fundo/borda ao container padrão; manter `p-1`                                     |
| `features/home/DashboardMetrics.tsx:151`                                                                     | `PrismPopover`                                 | `flex max-w-60 flex-col gap-2 rounded-2xl border-border bg-popover/80 p-2.5 backdrop-blur-2xl`               | Raio ok (redundante); `border-border`, `bg-popover/80`, `backdrop-blur-2xl`, `p-2.5`                                            | Remover redundâncias; decidir se translucidez é permitida (decisão 5)                     |
| `layout/Header.tsx:448`                                                                                      | `PrismPopover` (notificações)                  | `w-80 overflow-hidden rounded-2xl p-0`                                                                       | Raio redundante; cabeçalho interno `border-b bg-muted/20 px-4 py-3`                                                             | Remover `rounded-2xl`; manter `p-0`                                                       |
| `layout/Header.tsx:595`                                                                                      | `PrismMenuContent` (menu do perfil)            | `w-64 p-0`                                                                                                   | Zera o `p-2` do menu; itens ficam colados na borda                                                                              | Avaliar manter `p-2` padrão                                                               |
| `features/PhaseCombobox.tsx:229`                                                                             | `PrismPopover` + Command                       | `w-56 p-0`                                                                                                   | Largura `w-56` própria                                                                                                          | Entrar na escala de larguras                                                              |
| `features/CategoriesCombobox.tsx:154`                                                                        | `PrismPopover` + Command                       | `p-0`                                                                                                        | Sem largura (usa `w-72`)                                                                                                        | Entrar na escala de larguras                                                              |
| `features/ActionComments/CommentInput.tsx:140`                                                               | `PrismPopover` + Command                       | `w-60 p-0` (+ lista `max-h-50`)                                                                              | Largura `w-60` própria                                                                                                          | Entrar na escala de larguras                                                              |
| `features/CalendarToolbar.tsx:63`                                                                            | `PrismPopover`                                 | `w-auto max-w-[calc(100vw-16px)] p-[8px]`                                                                    | Padding com valor arbitrário `p-[8px]`; `max-w` duplica o do primitivo                                                          | Usar `p-2`; remover `max-w`                                                               |
| `prism/date-range-picker.tsx:142`                                                                            | `PrismPopover`                                 | `w-auto p-3` (+ `popoverClassName`)                                                                          | `p-3` fora do padrão do popover (`p-4`)                                                                                         | Padronizar padding de popover de calendário                                               |
| `features/FlowDateFilter.tsx:48`                                                                             | `PrismPopover`                                 | `w-auto`                                                                                                     | Usa `p-4` padrão; os outros calendários usam `p-3`/`p-2`                                                                        | Padronizar com os demais calendários                                                      |
| `features/action-drawer/ActionDatePicker.tsx:66`                                                             | `PrismPopover`                                 | `w-auto`                                                                                                     | idem                                                                                                                            | idem                                                                                      |
| `features/action-drawer/ActionColorDropdown.tsx:101`                                                         | `PrismPopover`                                 | `flex w-64 flex-col gap-3 p-3`                                                                               | `p-3` / `gap-3` próprios                                                                                                        | Padronizar padding/gap                                                                    |
| `routes/app/partner/$slug.tsx:209`                                                                           | `PrismPopover`                                 | `max-h-100 w-95 space-y-4 overflow-y-auto`                                                                   | `w-95` fora da escala                                                                                                           | Entrar na escala de larguras                                                              |
| `features/GlobalSearchCommand.tsx:477`                                                                       | `PrismCommand` dentro de `CommandDialog`       | sem override de container                                                                                    | Sem desvio de container (conferir `size`)                                                                                       | Nenhuma ação                                                                              |
| `prism/command.tsx:113`                                                                                      | `CommandDialog`                                | `p-0 sm:max-w-xl` + seletores `[&_[data-slot=command]]:...` para zerar raio/borda/fundo                      | Zera o container interno por seletor: acoplamento frágil                                                                        | Resolver por prop/variante em vez de seletor                                              |
| `features/CelebrationDialog.tsx:142`                                                                         | `PrismDialog`                                  | `flex flex-col overflow-hidden sm:max-w-sm`                                                                  | Largura `sm:max-w-sm` própria                                                                                                   | Definir escala de larguras de diálogo                                                     |
| `features/bulk/BulkResponsiblesDialog.tsx:42`                                                                | `PrismDialog`                                  | `max-w-md`                                                                                                   | Sem breakpoint; sobrepõe o `sm:max-w-lg`? (tailwind-merge resolve por especificidade da classe, validar)                        | Escala de larguras de diálogo                                                             |
| `features/bulk/BulkSprintDialog.tsx:47`                                                                      | `PrismDialog`                                  | `max-w-md`                                                                                                   | idem                                                                                                                            | idem                                                                                      |
| `features/bulk/BulkArchiveDialog.tsx:27`                                                                     | `PrismDialog`                                  | `max-w-md p-0`                                                                                               | idem; `p-0`                                                                                                                     | idem                                                                                      |
| `features/bulk/BulkColorDialog.tsx:67`                                                                       | `PrismDialog`                                  | `w-72`                                                                                                       | Largura fixa de popover aplicada a diálogo                                                                                      | Escala de larguras de diálogo                                                             |
| `features/bulk/BulkDateTimeDialog.tsx:80`                                                                    | `PrismDialog`                                  | `w-72`                                                                                                       | idem                                                                                                                            | idem                                                                                      |
| `features/action-drawer/ActionFormDrawer.tsx:1105`                                                           | `PrismDialog`                                  | `sm:max-w-3xl lg:max-w-5xl`                                                                                  | Largura de diálogo grande (galeria/conteúdo)                                                                                    | Registrar como tamanho `xl` da escala                                                     |
| `features/action-drawer/ActionFormDrawer.tsx:1159`                                                           | `PrismDialog`                                  | `flex flex-col sm:max-w-2xl`                                                                                 | idem                                                                                                                            | Tamanho `lg+` da escala                                                                   |
| `planning/PlanningSuggestionEditor.tsx:88`                                                                   | `PrismDialog`                                  | `flex w-full max-w-xl flex-col overflow-hidden sm:max-w-xl`                                                  | `max-w-xl` duplicado                                                                                                            | Remover duplicação                                                                        |
| `features/media/ContentReorderDialog.tsx:229`                                                                | `PrismDialog`                                  | a conferir na execução                                                                                       | -                                                                                                                               | Conferir                                                                                  |
| `features/BulkActionMenu.tsx:359`, `features/RichTextEditor.tsx:179`, `features/ViewOptions.tsx:147,240,303` | `PrismMenuContent`                             | `w-56` (alguns com `placement`)                                                                              | Largura própria `w-56` repetida                                                                                                 | Mover `w-56` para o padrão de menu                                                        |

Sem desvio de raio/borda nos `Select`/`ComboboxContent`: nenhum consumidor sobrescreve esses contêineres no `app/` (fora de `prism/` e `ui-sections/`).
Tooltip e HoverCard: não existem no projeto (nenhuma ocorrência em `app/`). Se forem criados, nascem já na regra.

**Contagem:** 28 pontos de desvio (linhas da tabela, excluindo `GlobalSearchCommand` sem desvio e `ContentReorderDialog` a conferir), sendo 4 de raio (`4xl`/`3xl`: AppBar x2, Responsibles, Sprint, Partners = 5 ocorrências), 5 de borda/sombra/fundo redundantes (`border`, `shadow-xl`, `bg-popover`), 1 de borda dupla, 3 de translucidez/blur, 4 de padding fora do padrão, e o restante de largura (popovers `w-56/60/75/95`, menus `w-56`, diálogos `max-w-*`/`w-72`).

## Grupos de correção

**A. Primitivos (`app/components/prism/`)**

1. `popover.tsx`: oferecer variante para popover de lista (sem padding, `overflow-hidden`, largura `w-80`) para eliminar os `p-0 overflow-hidden w-[...]` repetidos nos 8 comboboxes de Command.
2. `command.tsx`: trocar os seletores `[&_[data-slot=command]]:...` do `CommandDialog` por prop; confirmar que `CommandInput` já traz a linha inferior (evita `div border-b` externo).
3. `dialog.tsx`: criar `size` (`sm`, `md`, `lg`, `xl`) para substituir `max-w-*`/`w-72` soltos.
4. `dropdown-menu.tsx`: definir `w-56` como largura padrão do menu (ou `size`).
5. Uniformizar padding de lista (`p-1` x `p-1.5` x `p-2`) e anel/borda (decisões 2 e 4).

**B. Consumidores**

1. Remover `rounded-3xl border bg-popover shadow-xl squircle` de Responsibles, Sprint, Partners.
2. AppBar: remover `rounded-4xl` e o `div border-b`.
3. Normalizar larguras dos popovers de lista (Phase, Categories, CommentInput, partner/$slug).
4. Normalizar padding de popovers de calendário (CalendarToolbar, date-range-picker, FlowDateFilter, ActionDatePicker) e ActionColorDropdown.
5. Diálogos bulk e demais: migrar para `size`.
6. Superfícies fora do Prism (AppBar:85, BubbleMenu, DashboardMetrics): alinhar ao container padrão ou documentar como exceção.
7. Atualizar a galeria `/ui` (popover, menu, command, dialog) com os novos tamanhos/variantes.

## Decisões abertas

1. **`squircle` em containers?** A regra escreve `rounded-2xl` (sem `squircle`) para containers, mas os primitivos já aplicam `squircle`. Confirmar se é regra ou omissão do texto. Se sim, documentar; se não, remover dos primitivos e dos consumidores.
2. **Padding padrão:** `p-4` (popover genérico) x `p-0` (popover de lista) x `p-1`/`p-1.5`/`p-2` (listas). Proposta: popover genérico `p-4`; popover de lista `p-0`; lista interna `p-1.5`; menu `p-2`.
3. **Escala de larguras:** popovers de lista (`w-56/60/75/80/[320px]/95`) e diálogos (`w-72`, `max-w-md/xl/2xl/3xl/5xl`). Proposta: popover `w-72` (padrão), `w-80` (lista); diálogos `sm` 18rem, `md` 28rem, `lg` 32rem (padrão), `xl` 36rem, `2xl` 42rem+.
4. **Borda 1px x anel:** a regra fala em borda 1px, mas os containers usam `ring-1 ring-foreground/5`. Decidir se o container passa a `border` (visível) ou se o anel vale como borda; isso também resolve o `ring-0`/`border` espalhado.
5. **Sombra e translucidez:** `shadow-lg` (flutuantes) x `shadow-xl` (modais); permitir `bg-popover/80 backdrop-blur` (DashboardMetrics, BubbleMenu) ou exigir fundo sólido?
6. **AppBar (barra flutuante) e BubbleMenu** contam como "container" da regra ou ficam como exceções documentadas?
7. **Sheet** sem raio: manter e documentar.
8. Se Tooltip/HoverCard forem necessários, definir as regras antes de criar.

## Critérios de aceite

- Nenhum consumidor passa `rounded-*`, `border`, `shadow-*`, `bg-popover` ou `squircle` para containers flutuantes (grep vazio, salvo exceções documentadas).
- Nenhum `rounded-3xl`/`rounded-4xl` em containers flutuantes.
- AppBar sem linha dupla sob o `CommandInput`.
- Larguras de popover e diálogo vêm de variante/escala do primitivo; sem `w-[320px]`, `p-[8px]` ou `w-75/w-95`.
- Padding dos popovers de lista e de calendário uniforme.
- `/ui` mostra as variantes e o desvio do AppBar foi eliminado.
- Decisões 1 a 6 registradas em `docs/plans/visual-controls-final-status.md`.

## Roteiro de validação (proprietário)

1. `/ui`: abrir Popover, Menu, Select, Combobox, Command e Dialog nos temas claro e escuro; conferir raio, linha e sombra iguais.
2. AppBar: abrir o filtro de parceiros; sem linha dupla sob a busca, raio igual aos demais.
3. Gaveta de ação: abrir Responsáveis, Sprint, Parceiros, Fase, Categorias e Cor; mesma largura/raio/sombra e sem corte nas bordas.
4. Calendário/Período: abrir seletor de data, período e toolbar; padding igual.
5. Lote (barra de ações em massa): abrir cada diálogo e conferir larguras da escala.
6. Menus: perfil, visualização, lote e formatação do editor; itens sem colar na borda.
7. Janela estreita (telefone): popovers dentro da viewport.
8. Verificação técnica mínima: `grep -rnE "rounded-(3xl|4xl)|shadow-xl|w-\[3[0-9]{2}px\]" app/components/features app/components/layout` sem resultados em containers flutuantes; formatar arquivos alterados com Prettier.

---

<a id="visual-controls-issues-04-calendar-toolbar-date-picker"></a>

## visual-controls · 04-calendar-toolbar-date-picker

Origem: `.scratch/visual-controls/issues/04-calendar-toolbar-date-picker.md`. Classificação: Encerrado/aprovado no registro da série.

# 04 — Seletor de data da barra de calendário (CalendarToolbar)

**Resumo:** Ajusta o seletor de data do calendário usado pela barra de ferramentas.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Aprovado (proprietário, 03/11/2026). Sem commit.

Implementado em 03/11/2026: `CalendarToolbar.tsx` usa `<PrismCalendar cellSize="sm" captionLayout="dropdown" className="max-w-full" />` e o popover mantém `w-auto max-w-[calc(100vw-16px)] p-[8px]`. A quebra de linha do cabeçalho agora é do `PrismCalendar` (linha de legenda com `min-h-(--cell-size)`; bloco mês/ano `min-w-0 flex-1 flex-wrap`; gatilhos mês/ano `h-auto min-h-(--cell-size)`), sem seletores de estrutura no consumidor. Observação: a célula é 32px fixos (não escala mais com `2em`); a 200% o texto cresce dentro de 32px.

## O que é (e onde aparece na tela)

É o pequeno calendário que abre ao clicar no botão com ícone de calendário (CalendarDaysIcon) ao lado das setas "anterior/próximo". O botão fica dentro de `app/components/features/CalendarToolbar.tsx` e é usado em três telas da equipe (`/app`):

| Tela                 | Rota                                                                                           | Onde fica                                                                                       | Aparência do botão                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Hoje (página)        | `/app/today` (`TodayPageView`)                                                                 | Canto direito do cabeçalho, antes do seletor de visualização (Parceiros/Kanban/Categorias/Feed) | Só o ícone de calendário; setas ‹ › visíveis a partir de `md`                                                      |
| Bloco "Hoje" da Home | `/app` (`HomeTodayView`, via `HomeViewWrapper`)                                                | Opções do cabeçalho do bloco, ao lado do seletor de visualização                                | Só o ícone                                                                                                         |
| Página do parceiro   | `/app/partner/$slug` (`CalendarButtons`, alias do mesmo componente em `features/Calendar.tsx`) | Cabeçalho, ao lado do nome/engrenagem do parceiro                                               | Ícone + texto do mês (`showDate`: "Novembro/26" no desktop, "11/26" no celular); setas pulam 30 dias (`days={30}`) |

O que faz: ao escolher um dia no calendário, chama `setCurrentDay` (navega para aquela data: Hoje/Home trocam o dia exibido; no parceiro muda `?date=` na URL) e fecha o popover. Tem seletores de mês e ano (`captionLayout="dropdown"`). As setas ao lado andam 1 dia (ou 30 no parceiro).

Não confundir com: `ActionDatePicker` (data de uma ação, na gaveta), `BulkDateTimeDialog`, `CelebrationDialog`, filtro de datas de Fluxo (range) e o novo `PrismDateRangePicker`. Todos usam o mesmo `PrismCalendar`, mas só este tem o ajuste de tamanho abaixo.

## Estado atual

`CalendarToolbar.tsx`, linhas ~63-83: `PrismPopover className="w-auto max-w-[calc(100vw-16px)] p-[8px]"` com `PrismCalendar` recebendo uma única string de classes (linha ~69) que sobrescreve o calendário compartilhado:

- `[--cell-size:clamp(32px,2em,40px)]`: tamanho da célula próprio (32px em texto normal, 35px a 125%, 40px a 200%), em vez de `cellSize` do Prism.
- `w-[calc(7*var(--cell-size))] max-w-full`: largura do calendário = 7 células, limitada ao espaço disponível.
- `[&_[data-slot=select-trigger]]:min-h-(--cell-size)`, `:px-1`, `[data-size]:h-auto`: gatilhos de mês/ano com altura natural e menos padding.
- `[&_td>div]:aspect-auto [&_td>div>div]:size-(--cell-size)`: remove o aspect-ratio do dia e fixa o quadrado interno.
- `[&>div>div>div]:h-auto [&>div>div>div>div]:min-w-0 [&>div>div>div>div]:flex-1 [&>div>div>div>div]:flex-wrap`: o cabeçalho (setas + mês + ano) pode quebrar em duas linhas.

Esses seletores dependem da estrutura DOM interna do `PrismCalendar` (frágeis: qualquer mudança no calendário os quebra silenciosamente).

## Por que existe

Ticket 12 do safari-mobile (`.scratch/safari-mobile/issues/12-compact-date-picker-width.md`; relatório `docs/audits/2026-10-30-calendar-picker-width.md`, CURRENT.md): em 320px com texto ampliado (125% e depois 200%) o popover estourava: ex. 320px/200%: clientWidth 256 vs scrollWidth 391, grade 326,67px, última coluna e seta "próximo" para fora. Causa: padding/rem do cabeçalho e dos gatilhos de mês/ano definiam largura intrínseca maior que a disponível, e as células (largura %/aspect-square) acompanhavam. A correção foi local ao `CalendarToolbar` para não mexer no `PrismCalendar` compartilhado (range e calendário de 36px de Celebrações). Aceito pelo proprietário em 31/10 (commit `ceafc6f`). Medidas aceitas: grade 224/245/280px e popover 240/261/296px (100/125/200%), sempre clientWidth = scrollWidth, sem esconder overflow.

## Proposta

Contexto: o `PrismCalendar` está sendo alterado para colunas fluidas (largura mínima = `--cell-size`, `1fr`) com `cellSize` sm/default/lg = 32/40/48px.

1. Depois que o novo `PrismCalendar` estiver estável, remover da linha ~69 todos os overrides (`--cell-size`, `w-[calc(7*...)]`, seletores `[&_...]` e `[&>div>...]`).
2. Usar o padrão: `<PrismCalendar cellSize="sm" captionLayout="dropdown" className="max-w-full" .../>` (32px). Avaliar `default` (40px) só se couber: 7×40 = 280px + 16px de padding já passa dos 296px do popover a 320px e exige `max-w-full` + colunas fluidas encolhendo. Recomendação inicial: `sm`.
3. Manter no popover `w-auto max-w-[calc(100vw-16px)] p-[8px]` (limite de viewport); se o novo calendário já resolver o cabeçalho, avaliar remover só o que for redundante.
4. Cabeçalho (setas + mês + ano) precisa continuar podendo quebrar linha com texto grande; se o `PrismCalendar` novo não fizer isso nativamente, tratar no próprio `PrismCalendar` (e não com seletores de estrutura no consumidor).
5. Células escalarem com a fonte (hoje `2em`) é uma garantia a preservar ou substituir por `min-w` + `1fr`: números maiores a 200% devem caber no quadrado.

## Preservar (obrigatório)

- Sem overflow horizontal em 320px com texto 200% (clientWidth = scrollWidth), sem `overflow:hidden` mascarando.
- Sete colunas e setas/mês/ano alcançáveis; ordem de foco anterior → mês → ano → próximo; Escape devolve o foco ao botão; seleção por teclado (setas + Enter).
- Fonte ampliada preservada (não reduzir o texto), rolagem vertical em altura curta.
- Calendário de Celebrações (36px), range e demais consumidores sem regressão.

## Riscos

- Mudar `PrismCalendar` e este consumidor ao mesmo tempo mascara a causa de eventual regressão: validar `CalendarToolbar` isoladamente depois do Prism estar fechado.
- Células fluidas (`1fr`) em popover `w-auto` podem gerar largura circular (popover depende do conteúdo, conteúdo do popover); pode ser necessário largura mínima explícita (ex.: `min-w-[calc(7*var(--cell-size))]`).
- `sm` (32px) abaixo do alvo de toque ideal; já era 32px em texto normal e foi aceito, mas é decisão visual.
- A verificação existente (`scripts/check-calendar-width-browser.cjs`, fixture `tests/fixtures/calendar-width-browser.tsx`) cobre o comportamento antigo; confirmar se ainda reflete o componente real antes de confiar nela. Pelas preferências do proprietário, não criar testes novos por rotina.

## Critérios de aceite

- `CalendarToolbar.tsx` sem a string de overrides do `PrismCalendar` (apenas `cellSize`/`max-w-full` ou equivalente padrão).
- A 320px com texto 200%, popover sem rolagem horizontal; sete colunas e setas visíveis.
- Em 375/390/430 e desktop, calendário legível e centralizado sob o botão.
- Hoje, Home e página do parceiro continuam funcionando (selecionar dia, mês/ano, Escape, foco).
- Nenhum outro consumidor do `PrismCalendar` alterado de aparência pela remoção.

## Roteiro de validação (proprietário)

1. `/app/today`: clicar no ícone de calendário; escolher um dia, depois reabrir e trocar mês e ano pelos seletores. O dia exibido muda e o popover fecha.
2. `/app` (Home, bloco Hoje): mesmo teste.
3. `/app/partner/<slug>`: botão com "mês/ano"; escolher uma data e ver `?date=` mudar; setas pulam 30 dias.
4. Redimensionar a janela para 320px (ou DevTools, iPhone SE) e aumentar o texto (zoom de texto 125% e 200%): abrir o seletor em Hoje e no parceiro; conferir que as 7 colunas, o mês/ano e a seta de próximo aparecem por inteiro, sem barra horizontal.
5. Teclado: Tab pelo cabeçalho (anterior, mês, ano, próximo), setas nos dias, Enter seleciona, Escape fecha e devolve o foco ao botão.
6. Conferir de relance que `ActionDatePicker` (gaveta) e Celebrações não mudaram.

---

<a id="visual-controls-issues-05-drawer-footer-triggers"></a>

## visual-controls · 05-drawer-footer-triggers

Origem: `.scratch/visual-controls/issues/05-drawer-footer-triggers.md`. Classificação: Encerrado/aprovado no registro da série.

# 05 — Gatilhos do rodapé da gaveta: anatomia única

**Resumo:** Padroniza gatilhos, avatares, ícones e comandos do rodapé da gaveta.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Aprovado pelo proprietário em 03/11/2026. Conclusão 100%.

## Aceite e regra vigente — 03/11/2026

O proprietário confirmou que o V05 está correto e que verificou e ajustou todos os tamanhos de avatares. Encerrado por esse aceite.

Gatilhos de ícone mantêm altura e largura mínima da escala Prism, com largura automática para acomodar grupos. No rodapé usam `ghost` e `icon-lg` (mínimo 48px). Avatares seguem V13, com 16/24/32px conforme o tamanho do botão, e 32px nos gatilhos grandes. Ícones e amostras grandes usam 20px. O espaçamento interno da faixa é `gap-px` com `p-2`. Os registros anteriores de largura fixa e avatares de 20px abaixo são históricos.

Verificação desta rodada e limites no [relatório central](../../docs/audits/2026-11-03-ticket-dispatch.md). Ajustes do proprietário permanecem no diff local sobre `b5b5f33`.

## Aplicado (03/11/2026)

- `ComboboxTrigger` agora só compõe `buttonVariants`: `filter` = ghost/sm; `form-inline` = ghost/sm (size sm) ou ghost/default; `form-link` = link/sm; `form-footer` = ghost/`icon` (padrão) ou ghost/`default` com `iconOnly={false}` (quando há texto). Removidos `min-w-10`, `px-2`, `gap-2`, `overflow-hidden`, `p-6`, `h-8`, `rounded-md`, `text-sm` próprio, hover/focus `bg-secondary`/`bg-input` próprios e `flex` base.
- Cores: `#666`/`#666666` (Categoria vazia, Cor) -> `text-muted-foreground`/sem cor; `border-black/5` -> `border-border`; `text-amber-*` -> `text-warning`. Sprint vazio `ZapIcon` -> `text-muted-foreground`.
- Avatares do rodapé: `UAvatarGroup size="sm"` (24px) em Parceiros e Sprint.
- Salvar: removidos `w-32`, `overflow-hidden`, `rounded-2xl squircle` (largura por conteúdo). Fase: removido `opacity-40 pointer-events-none` manual (usa `isDisabled`).
- Atualização 03/11: todos os botões do rodapé são `lg` (48px): `ComboboxTrigger` `form-footer` = ghost `icon-lg` (só ícone) / `lg` (com texto); salvar `lg`/`icon-lg`. Conteúdo interno de 20px (`size-5`): avatares (novo `UAvatarGroup avatarClassName` opcional), `PhaseIcon` md, ícones de categoria, amostra de cor. Rodapé com 64px (48 + `p-2`). Substitui o `UAvatarGroup size="sm"` (24px) acima.
- Pendente: unificar `variant`/`triggerVariant`, popovers (outro agente). Demais variantes: [ticket 13](resolved-tickets.md#visual-controls-issues-13-combobox-variants).

---

(Texto original abaixo.)
Prioridade na lista: `docs/plans/visual-controls-where.md`, seção 3.1, linhas 1–3 (ComboboxTrigger, ActionFormFooter, PartnersCombobox; Phase/Categories/Sprint/ActionColorDropdown em seguida).

## Contexto

- Decisão do proprietário: o rodapé fica com **40px** por ora (segue `buttonVariants` `size="icon"` = `size-10`). Ele vai simplificar estes componentes depois porque são "muito diferentes" entre si. Este ticket só registra o inventário e uma proposta; não autoriza implementação.
- O contrato antigo do AGENTS citava 48px; o código real é 40px (`ComboboxTrigger` `form-footer` = `ghost` + `icon` + `w-auto min-w-10 gap-2 overflow-hidden px-2`).
- Escala oficial Prism: `xs/sm/default/lg` = 24/32/40/48px; controles `rounded-2xl squircle` (`lg` `rounded-3xl`).

## Inventário (arquivos em `app/components/features/`)

Markup do gatilho em todos os casos: `ComboboxTrigger variant="form-footer"` (RAC `Button` + `buttonVariants({variant:"ghost",size:"icon"})`), exceto os botões de ação e o Salvar, que usam `PrismButton` direto. Altura 40px, largura mínima 40px, `px-2`, `gap-2`, raio do `icon` (sem `rounded` explícito no `icon`; herda da base do Button), foco por teclado `data-[focus-visible]:bg-input`.

| #   | Controle                                   | Arquivo                                                                    | Conteúdo / seleção                                                    | Vazio                                | Observações                                                                                                                                  |
| --- | ------------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Parceiros                                  | `PartnersCombobox.tsx` (variant padrão `form-footer`)                      | `UAvatarGroup size="sm"` (24px, `clampAt=2`), cores do parceiro       | `UAvatar fallback="P"` 24px          | Rodapé passa `showText={false}`; com texto mostra nome truncado. Popover `w-[320px]`. Envolvido em `div.shrink-0[data-drawer-focus=control]` |
| 2   | Fase                                       | `PhaseCombobox.tsx` (`SinglePhaseTrigger`, `triggerVariant="form-footer"`) | `PhaseIcon size="md"` (20px) variante `progress`; sem texto no rodapé | n/d (fase padrão `idea`)             | Com texto (outros usos) usa ponto `size-2` + título. `disabled` aplica `opacity-40 pointer-events-none` além de `isDisabled`                 |
| 3   | Categoria                                  | `CategoriesCombobox.tsx` (`triggerVariant="form-footer"`)                  | `Icons size-5` (20px) com cor da categoria                            | ícone `categories` cor `#666`        | Sem `showText`: ícone apenas. Popover `PrismPopover className="p-0"` (largura diferente das demais)                                          |
| 4   | Cor (só categorias de mídia social)        | `action-drawer/ActionColorDropdown.tsx`                                    | bolinha `size-5 rounded-full border-black/5` com a cor                | cor `#666666`                        | Único sem componente Combobox; usa `PrismPopoverTrigger` + popover `w-64`. `aria-label` "Abrir seletor de cores"                             |
| 5   | Sprint (só ação existente)                 | `SprintCombobox.tsx` (`size="lg"` → `form-footer`)                         | `UAvatarGroup size="md"` (32px) dos responsáveis/sprint               | `ZapIcon` (tamanho padrão do Button) | Avatar **md 32px** enquanto Parceiros usa **sm 24px**. Popover `w-75`, `placement="bottom end"`                                              |
| 6   | Duplicar (só ação existente)               | `ActionFormFooter.tsx`                                                     | `CopyIcon`                                                            | —                                    | `PrismButton size="icon" variant="ghost"`; não é `ComboboxTrigger`                                                                           |
| 7   | Arquivar / Desarquivar (só ação existente) | `ActionFormFooter.tsx`                                                     | `ArchiveIcon` / `ArchiveRestoreIcon`                                  | —                                    | Desarquivar com `text-amber-500 hover:text-amber-600` (usar `text-warning`)                                                                  |
| 8   | Salvar (Criar/Atualizar)                   | `ActionFormFooter.tsx`                                                     | texto + `CloudUploadIcon`/`PlusIcon`/`LoaderIcon`                     | —                                    | `PrismButton size="default"` (40px), `w-32 overflow-hidden rounded-2xl squircle`; **compacto**: `size="icon"` sem texto e `aria-label`       |

Total: **8 controles** (5 gatilhos de seleção + 3 botões de ação/salvar; Cor, Sprint, Duplicar e Arquivar são condicionais). Data e Arquivos **não** estão no rodapé: pertencem à aba Essencial (`EssentialsTab.tsx`, `ActionDatePicker`), embora o AGENTS cite o ícone de arquivos no modo compacto. Fora da gaveta, `ComboboxTrigger` serve ainda `filter` (ViewOptions, busca), `form-inline` e `form-link` (Responsáveis).

Estrutura do contêiner (`ActionFormFooter.tsx`): `border-t`, `FooterStrip` (faixa rolável `overflow-x-auto`, `divide-x`, esmaecimento 24px nas bordas no compacto, `revealFocused`), bloco do Salvar `p-2 gap-2`. No compacto cada comando vira `div.shrink-0` separado por divisor.

## Diferenças

1. **Altura**: todos 40px, mas o conteúdo não: avatar 24px (Parceiros), 32px (Sprint), ícones 20px (Fase/Categoria), bolinha 20px (Cor), ícone padrão do Button (Sprint vazio, Duplicar). Sprint com avatar de 32px ocupa quase toda a altura do gatilho.
2. **Seleção**: avatares (Parceiros, Sprint), ícone de fase, ícone colorido de categoria, bolinha de cor. Vazio: avatar "P", ícone `#666`, bolinha `#666666`, `ZapIcon`: quatro tratamentos distintos, sem padrão para "sem seleção".
3. **Cores fora de token**: `#666`/`#666666` (Categoria, Cor, rodapé), `border-black/5`, `text-amber-*`.
4. **Raio**: gatilhos herdam o raio do Button; a bolinha e os swatches usam `rounded-full`/`rounded-2xl` próprios; Salvar força `rounded-2xl squircle` redundante.
5. **Largura de popover**: 320px (Parceiros), `w-75` (Sprint), `w-64` (Cor), padrão (Categoria/Fase); raios `rounded-3xl` repetidos por popover em vez de vir do `PrismPopover`.
6. **Propriedades repetidas e inconsistentes**: `showText`, `size`, `triggerVariant`/`variant`, `tabIndex`, `disabled` com nomes e padrões diferentes em cada combobox (Phase/Categories exigem `triggerVariant`; Partners usa `variant`; Sprint infere pelo `size`; Cor fixa). `disabled` de Fase usa opacidade manual.
7. **Marcadores de foco**: só alguns são envolvidos em `div[data-drawer-focus=control]` (Parceiros, Fase, Categoria, Cor, Salvar); Sprint/Duplicar/Arquivar não, e o `tabIndex={0}` é passado manualmente.
8. **Botões de ação** (Duplicar/Arquivar) não passam pelo `ComboboxTrigger`, mas têm a mesma geometria por coincidência de `icon`.
9. **Estados**: sem diferença visual de "tem seleção" (`hasSelection` é aceito mas não usado em `form-footer`); `disabled` só na Fase tem estilo próprio.

## Proposta de anatomia única (não implementar agora)

Um único `FooterTrigger` (ou `ComboboxTrigger variant="form-footer"` reduzido a ele) com slots:

- **Tamanho**: `size="icon"` fixo (40px hoje; pode trocar de uma vez para 48px/`icon-lg` ou 32px/`icon-sm` por um único token). Largura `min-w` = altura, `w-auto` quando houver texto/avatares.
- **Slot `leading`** (obrigatório): caixa fixa 24px centralizada, sempre do mesmo tamanho. Parceiros/Sprint usam `UAvatarGroup size="sm"`; Fase/Categoria `size-5` ou 24px; Cor uma bolinha 20px com borda por token (`border-border`); vazio sempre um ícone `text-muted-foreground` no mesmo slot (nada de `#666`).
- **Slot `label`** (opcional, `showText`): truncado, `text-sm`; ausente no rodapé, presente em filtros.
- **Estados** num lugar só: `hasSelection` (ex.: texto `text-foreground` vs `text-muted-foreground` no vazio), `data-focus-visible:bg-input`, `isDisabled` (opacidade por token, sem `pointer-events` manual), `data-pressed`.
- **Popover**: largura por prop (`sm`/`md`), raio e borda vindos do `PrismPopover`, sem repetir classes em cada combobox.
- **Props comuns**: `aria-label`, `title`, `hasSelection`, `isDisabled`, `tabIndex` (ou melhor, apenas `data-drawer-focus`). Os combobox só fornecem o `leading`.
- **Ações**: Duplicar/Arquivar/Desarquivar e Salvar continuam `PrismButton`, mas com o mesmo tamanho/raio do gatilho; Desarquivar com `text-warning`; Salvar sem `w-32` fixo se for possível (largura por conteúdo).
- Remover variantes de rodapé do `ComboboxTrigger` (`form-inline sm/lg`, `form-link`) apenas em outro ticket; aqui só se unifica o `form-footer`.

## Contratos do AGENTS a preservar

- `ComboboxTrigger` variante `form-footer` composta pelo frame ghost/icon do Prism; `disabled` encaminhado a `isDisabled` do React Aria; filtros, links e inline pequeno preservam suas variantes.
- Rodapé compacto (<640px de largura do painel, `useCompactPanel`): faixa horizontal única com esmaecimento nas bordas e botão salvar só com ícone, fora da faixa; foco por teclado revela controles ocultos (`revealFocused`), foco por ponteiro não rola.
- Ordem do percurso Tab da aba Essencial (Título → Descrição → Parceiros → Fase → Categoria → Cor → Criar/Atualizar) com `data-drawer-focus="control"`; Tab após Criar/Atualizar segue para as abas; sem `restoreFocus` no FocusScope.
- Nomes acessíveis em português nos controles de ícone (Duplicar ação, Arquivar ação, etc.); `aria-label` do Salvar no compacto.
- Sem caixas/cartões externos com borda e fundo ao redor de blocos de controles (regra de superfícies).
- Cores por token (sem hex fixo nem `amber`); `/ui` atualizada ao mudar componente Uzzina (galeria `ViewOptionsSection`, item "6. Rodapé", que descreve 48px e deve ser corrigida).
- Seleção de Cor só para categorias de mídia social; Sprint/Duplicar/Arquivar só com `RawAction.id`.

## Critérios de aceite

1. Todos os 8 controles têm a mesma altura e o mesmo slot `leading` (tamanho fixo), com estado vazio no mesmo padrão.
2. Nenhum hex (`#666`) nem `amber`/`black/*` nos gatilhos do rodapé; tokens apenas.
3. Um único componente de gatilho para Parceiros, Fase, Categoria, Cor e Sprint; props nomeadas igualmente; Duplicar/Arquivar/Salvar com a mesma geometria.
4. Largura e raio dos popovers vindos de um padrão, sem classes repetidas por combobox.
5. Contratos acima preservados; `/ui` e AGENTS atualizados (40px vs 48px conforme decisão final).
6. Validação do proprietário em desktop e compacto; sem testes automáticos por rotina.

## Validação (roteiro para o proprietário)

Desktop (painel ≥640px): abrir uma ação existente e uma "Nova ação". Conferir alinhamento e altura dos gatilhos; vazio e selecionado em Parceiros, Fase, Categoria, Cor (categoria de mídia social), Sprint; abrir cada popover; foco por Tab (fundo `bg-input`) pela ordem do contrato; Duplicar/Arquivar/Desarquivar; Salvar com texto e carregando.

Compacto (<640px de largura do painel, ex.: janela estreita ou duas ações em abas): faixa única rolável, esmaecimento nas bordas, Salvar só ícone fora da faixa; Tab até um controle oculto o revela; clique/toque não rola a faixa; tema claro e escuro.

---

<a id="visual-controls-issues-09-focus-adjustments"></a>

## visual-controls · 09-focus-adjustments

Origem: `.scratch/visual-controls/issues/09-focus-adjustments.md`. Classificação: Encerrado/aprovado no registro da série.

# Ajustes da seção Foco (09)

**Resumo:** Reúne e ajusta exemplos de foco, incluindo o foco dos cartões de ação.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Data: 03/11/2026. Seção `/ui` "Foco" (`app/components/ui-sections/TokensFocusSection.tsx`) revisada pelo proprietário; ajustes aplicados em componentes e réplicas atualizadas. Sem commit.

Status (03/11): **Aprovado** por inteiro. O cartão `ActionItem` foi resolvido por decisão do proprietário (só anel, sem borda de foco). A2–A10 resolvidas ou aprovadas. Regra 03/11: eliminar personalizações; usar itens padrão do sistema.

## Decisões do proprietário (03/11)

### Anel externo

- Aprovado: Button, Input, Textarea, Select, Toggle, Checkbox, Radio, Calendário, Campo de hora, Combobox, alça de reordenar, remover anexo, sucesso, input inválido, campo de cor com erro.
- Aplicado: borda de foco `border-ring/60` (era `border-ring`) em input, textarea, select, combobox, input-group, date-range-picker, color-field, time-field, checkbox, radio, toggle, button, badge.
- Aplicado: thumbs de slider/color-area/color-slider com `data-[focus-visible]:ring-3 ring-ring/30` (eram invisíveis).
- Aplicado: destrutivo (botão/badge) todo em vermelho: `border-destructive/60` + `ring-destructive/30`.
- Aplicado (decisão do proprietário, 03/11): cartão `ActionItem` só com `focus-within:ring-3 focus-within:ring-ring/30`, sem borda de foco; o realce branco `border-t` do topo permanece; sprint/selecionado mantêm `ring-2 ring-primary`.
- Aplicado: editores de texto de `$slug.tsx` com `border-transparent` + `focus-within:border-ring/60` + anel (como textarea).
- Aplicado: link da miniatura (`WorkFileThumbnail`) migrou de inset para anel externo com `border-transparent`.

### Anel por dentro (inset)

- Aplicado: botão Fechar da gaveta saiu da família (agora só `focus-visible:bg-input`).
- Aplicado: regiões roláveis e carrossel perderam o foco (ver "Itens em análise"). Resta somente `conflict-comparison`.

### Foco por fundo

- Aprovado: Menu, Select, Combobox, Command, abas underline, segmento de hora, barra do editor, gatilho form-footer como exibido.
- Aplicado: aba drawer selecionada com foco recebe `bg-input`; botão Fechar da gaveta entrou aqui (`bg-input`); Ajuda e notificações unificadas em `focus-visible:bg-secondary/50`.
- Resolvido (A2): form-footer mantém o anel padrão do ghost icon/default; exemplo agora na família Anel externo.

### Sem anel de propósito

- Aprovado: título inline, comentário, data (sublinhado), botão unstyled.
- Aplicado: accordion com `hover:underline focus-visible:underline`; link do dia da Home (HomeCalendarView/HomeTodayView) com `outline-none hover:underline focus-visible:underline`, sem anel (movido para esta família).

### Seleção (não é foco)

- Aprovado: cor escolhida, cartão selecionado.
- Aplicado: dia alvo do arraste no Planejamento agora `rounded-2xl bg-primary text-primary-foreground squircle` (igual ao dia selecionado do PrismCalendar). Na vitrine está rotulado como "dia alvo do arraste", não "dia selecionado".

### Fallback global

- Aplicado: `:focus-visible { outline-style: solid; outline-width: 3px; outline-offset: 0 }` + `outline-ring/30` (anel único, sem folga branca).

## Arquivos alterados

- Prism: input, textarea, select, combobox, input-group, date-range-picker, color-field, time-field, checkbox, radio, toggle, button, badge, slider, color-area, color-slider, accordion, tabs.
- `app/tailwind.css` (fallback global).
- Features: `HomeCalendarView.tsx`, `HomeTodayView.tsx`, `ActionItem.tsx`, `ActionFormDrawer.tsx`, `WorkFileThumbnail.tsx`, `HelpPage.tsx`, `routes/app/notifications.tsx`, `routes/app/admin/partner/$slug.tsx`, `planning/PlanningCalendarView.tsx`.
- Documentação: `TokensFocusSection.tsx`, `docs/plans/visual-controls-final-status.md` (§3.1), `AGENTS.md` (parágrafo de foco, §5), este ticket e o README.

## Itens em análise: Aplicado (03/11/2026)

Aprovado pelo proprietário e aplicado:

- Removidos `tabIndex` e anel inset de `KanbanPhasesBoard` (coluna de fase), `profile.tsx` (duas regiões), `CalendarDayCell` (região com `limitHeight`) e do carrossel de `InstagramPreview`.
- Carrossel: removidos também `onKeyDown`/`handleKeyDown` (setas); mantidos `role="region"`, `aria-roledescription`, botões Anterior/Próxima e pontos, todos alcançáveis por Tab.
- Mantido `conflict-comparison` (coluna de campos): sem filhos focáveis e o Safari exige `tabIndex` para rolar por teclado; continua como único exemplo da família inset.
- `/ui` Foco: exemplos "Região rolável" e "Carrossel" removidos; família inset mostra uma réplica do `conflict-comparison`.

## Resolvido: cartão `ActionItem`

Decisão do proprietário (03/11), aplicada em `ActionItem.tsx`: foco apenas com `focus-within:ring-3 focus-within:ring-ring/30`, sem borda de foco; `border-t` branco de realce mantido; sprint/selecionado com `ring-2 ring-primary`. Item fechado.

## Pendências da auditoria

A1 e A8 resolvidas. A2 a A10 resolvidas ou aprovadas pelo proprietário em 03/11:

| ID  | Item                                                       | Situação                                                                       |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| A2  | Gatilho `form-footer`                                      | Resolvido: anel padrão (ghost icon/default)                                    |
| A3  | Busca de parceiros                                         | Resolvido: foco padrão do Prism, sem exceção                                   |
| A4  | Família seleção: `BulkColorDialog` e `ActionColorDropdown` | Resolvido: seletores de cor usam `PrismToggleGroup`; réplica removida do `/ui` |
| A5  | Item Sair no menu                                          | Aprovado                                                                       |
| A6  | Rolagem lateral do calendário e da área de cor em 375px    | Aprovado                                                                       |
| A7  | Foco por fundo dos itens com a lista aberta                | Aprovado                                                                       |
| A8  | Anel por dentro na região rolável e no carrossel           | Resolvida: foco removido; resta só `conflict-comparison`                       |
| A9  | Contraste do anel na alça escura e no remover vermelho     | Aprovado                                                                       |
| A10 | Roteiro de Tab nos dois temas e em 375px                   | Aprovado                                                                       |
| A11 | Campo de hora repetido nas famílias 1 e 3                  | Aceito, nada a corrigir                                                        |

## Conferir no navegador

- Kanban, perfil, célula do dia e carrossel: Tab segue direto para os controles internos, sem parada na região; botões do carrossel alcançáveis.
- Alvo do arraste no Planejamento com `bg-primary` cheio: verificar se esconde o conteúdo do dia.
- Miniatura de anexo: borda transparente de 1px não deve deslocar o layout.
- Editores do admin de parceiro: foco com borda + anel.
- Thumbs de slider/color-area/color-slider sobre cores saturadas: anel visível.
- Fallback global sobre fundo cinza: anel único de 3px legível.

## Atualização 03/11: foco do cartão `ActionItem`

Aplicado em `ActionItem.tsx` (substitui o `focus-within:ring-3` anterior): `focus-within:outline-1 outline-ring/45 ring-4 ring-ring/30` (outline por fora para não cobrir o realce branco `border-t` do topo; `ring-4` porque o outline de 1px cobre o primeiro pixel do anel). Réplica em `/ui` (`TokensFocusSection`, 'Cartão de ação') e listagem de exceções atualizadas. Ajuste visual aguarda conferência do proprietário.

---

<a id="visual-controls-issues-09-ui-focus-section"></a>

## visual-controls · 09-ui-focus-section

Origem: `.scratch/visual-controls/issues/09-ui-focus-section.md`. Classificação: Encerrado/aprovado no registro da série.

# 09 — `/ui`: seção "Foco" (REFAZER contra o código atual)

**Resumo:** Reúne e ajusta exemplos de foco, incluindo o foco dos cartões de ação.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Concluído — reescrito contra o código atual (aguarda validação visual)
Escopo: SOMENTE reescrever a seção de vitrine `TokensFocusSection.tsx` em `/ui`. É um levantamento visual do foco **como o app está hoje**. **Não altere nenhum estilo de foco em nenhum componente.**

## Histórico

- 03/11/2026, primeira passada: a seção foi feita seguindo à risca a versão anterior deste ticket, escrita a partir de um levantamento antigo (anterior ao ticket 01).
- 03/11/2026, reescrita: o ticket 01 (anéis de foco, aplicado em 03/11/2026) normalizou o foco do app. A seção da primeira passada mostra classes que não existem mais (`ring-ring/50`, `ring-[3px]`, `ring-2 ring-ring`, `ring-primary ring-offset-1` como foco, `outline-2`). Este ticket **substitui a primeira passada**.

## O que mudou (leia antes de tudo)

**Isto substitui a primeira passada. Reescreva `app/components/ui-sections/TokensFocusSection.tsx` por inteiro** (apague o conteúdo anterior; não faça remendos). As réplicas devem copiar as classes **atuais** do arquivo-fonte citado em cada uma. **Não edite nenhum arquivo de componente.**

Regra vigente (AGENTS.md §5; `docs/plans/visual-controls-final-status.md` §3.1):

- Todo foco por anel é `ring-3 ring-ring/30` (como `PrismButton`), geralmente com `border-ring`. Em elementos dentro de contêiner com overflow/rolagem usa-se `ring-inset` (a mesma largura e opacidade).
- Exceções aprovadas: **foco por fundo** (`bg-input`/`bg-secondary/50`) em abas, itens de lista/menu/select/command/combobox, gatilhos `form-footer` e barra do `RichTextEditor`; **campos sem anel de propósito** (título inline, comentário).
- Estados de seleção (`ring-2 ring-primary`) **não são foco**.
- Global: `* { @apply border-border outline-ring/30 }` em `app/tailwind.css:379`.

Antigas famílias F2 (`/50`), F3 (`ring-2 /50 inset`), F4 (`ring-2 ring-ring`), F5 (primary + offset como foco) e F6 (`outline-2`) **deixaram de existir**: foram absorvidas pelo padrão `ring-3 ring-ring/30`.

## Arquivos que você vai tocar (somente estes)

1. REESCREVER `app/components/ui-sections/TokensFocusSection.tsx`
2. Este ticket (preencher o relatório ao final)

`app/components/ui-sections/index.ts` (export) e `app/routes/ui.tsx` (import, item `tokens-focus` "Foco" na barra lateral, render após `<TokensSpacingSection />`) **já estão feitos** na primeira passada: apenas confira com `grep -n "TokensFocusSection\|tokens-focus" app/components/ui-sections/index.ts app/routes/ui.tsx` (esperado: 1 linha no index; import + item + render no ui.tsx) e **não os altere**. Se algo faltar, reporte antes de editar.

Antes de editar: `git status --short app/components/ui-sections/ app/routes/ui.tsx` (há alterações do proprietário não commitadas: preserve-as).

## Regras do arquivo

- Exporta `export function TokensFocusSection()`. Raiz: `<div id="tokens-focus">` contendo `<GallerySection>`.
- NÃO passe `approved` ao `GallerySectionHeader`. Título: `Foco`. Descrição: `Formas de foco usadas no app hoje, agrupadas por família. Use Tab (e Shift+Tab, setas) para ver cada foco. Vitrine de referência; nada aqui altera os componentes.`
- Sem cartões: NENHUM wrapper com `rounded` + `border` + `bg-card`/`bg-surface` em volta de famílias ou exemplos. Separe as famílias com `divide-y` e `py-8`.
- Componentes locais no mesmo arquivo: `FocusFamily` e `Example` (spec abaixo). Nenhum outro componente novo.
- **Prefira o componente real** (Prism ou do app). Réplica só quando o real exige dados/contexto do app (ex.: `ActionFormDrawer`, `CalendarDayCell`). Toda réplica leva `tabIndex={0}` quando não for um `<button>`/`<a>`/`<input>`, e **cita o arquivo-fonte** na prop `source` do `Example`.
- Cada exemplo tem a legenda `Tab para ver o foco` (embutida em `Example`).
- Código em inglês, textos de UI em pt-BR. Sem `any`, sem `!`.
- Imports: só nomes que existam no barrel `~/components/prism/index.ts` (todos os usados abaixo existem hoje). Se um nome não existir, NÃO invente: pare e reporte.
- `ComboboxTrigger` vem de `~/components/features/ComboboxTrigger`; `RichTextEditor` de `~/components/features/RichTextEditor`.

### Componentes locais

```tsx
function FocusFamily({
  id,
  title,
  rule,
  classes,
  usedBy,
  children,
}: {
  id: string;
  title: string;
  rule: string;
  classes: string;
  usedBy: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0" id={id}>
      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold">{title}</h4>
        <p className="text-muted-foreground text-sm">{rule}</p>
        <code className="text-muted-foreground block text-xs break-words">
          {classes}
        </code>
        <ul className="text-muted-foreground list-disc pl-5 text-xs">
          {usedBy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
        {children}
      </div>
    </div>
  );
}

function Example({
  label,
  source,
  hint = "Tab para ver o foco",
  children,
}: {
  label: string;
  source: string; // "Prism real" | "App real" | "Réplica de <arquivo>"
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-w-full min-w-0 flex-col gap-2">
      <span className="text-muted-foreground text-xs font-semibold uppercase">
        {label} · {source}
      </span>
      {children}
      <span className="text-muted-foreground text-xs">{hint}</span>
    </div>
  );
}
```

`hint` só muda do padrão nos overlays (menu, command em popover, etc.) onde é preciso abrir antes: use `Abra com Enter e use as setas`. Nos demais, mantenha `Tab para ver o foco`.

Esqueleto: `GallerySectionContent className="flex flex-col divide-y"` contendo, nesta ordem, as 6 `<FocusFamily>` abaixo. ids: `focus-outer`, `focus-inset`, `focus-background`, `focus-none`, `focus-selection`, `focus-global`.

## Famílias (copie props e exemplos)

Antes de escrever cada `usedBy`, rode o grep indicado e **confirme que o arquivo ainda usa a classe**; remova da lista o que não aparecer. Não ponha números de linha em `usedBy` (derivam). Nas réplicas, o número de linha citado aqui serve só para você localizar a classe; copie a string exata do arquivo.

---

### 1. Anel externo (padrão)

- `id="focus-outer"` · `title="Anel externo (padrão)"`
- `rule="Todo foco por anel: 3px, ring-ring a 30%, normalmente com border-ring. É o padrão do PrismButton."`
- `classes="outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 (também focus-within: e group-data-[focus-visible]:)"`
- Grep: `grep -rn "ring-3 ring-ring/30\|ring-3 focus-visible:ring-ring/30\|ring-ring/30" app --include='*.tsx' | grep -v ui-sections`
- `usedBy`:
  - `"Prism: button, input, textarea, select, toggle, slider (thumb), checkbox, radio-group, calendar (dia), color-area, color-slider, color-field, time-field, date-range-picker, combobox, badge"`
  - `"features/home/HomeCalendarView.tsx e HomeTodayView.tsx (links do dia)"`
  - `"features/media/ContentReorderDialog.tsx (alça e remover) e WorkFileThumbnail.tsx (remover)"`
  - `"features/ActionItem.tsx (cartão em edição: focus-within)"`
  - `"routes/app/admin/partner/$slug.tsx (editores de texto: focus-within)"`

Exemplos, na ordem. **Reais** (Prism):

1. `Botão` → `<PrismButton>Botão</PrismButton>`
2. `Input` → `<PrismInput aria-label="Exemplo de input" className="w-56" placeholder="Digite aqui" />`
3. `Textarea` → `<PrismTextarea aria-label="Exemplo de textarea" className="w-56" placeholder="Digite aqui" />`
4. `Select` →

```tsx
<PrismSelect
  aria-label="Exemplo de select"
  className="w-56"
  defaultSelectedKey="a"
>
  <PrismSelectTrigger>
    <PrismSelectValue />
  </PrismSelectTrigger>
  <PrismSelectContent>
    <PrismSelectItem id="a">Opção A</PrismSelectItem>
    <PrismSelectItem id="b">Opção B</PrismSelectItem>
  </PrismSelectContent>
</PrismSelect>
```

5. `Toggle` → `<PrismToggle variant="outline">Alternar</PrismToggle>`
6. `Slider (thumb)` →

```tsx
<PrismSlider
  aria-label="Exemplo de slider"
  className="w-56"
  defaultValue={3}
  maxValue={7}
  minValue={1}
>
  <PrismSliderTrack>
    <PrismSliderFill />
    <PrismSliderThumb />
  </PrismSliderTrack>
</PrismSlider>
```

7. `Checkbox` → `<PrismCheckbox>Marcar</PrismCheckbox>`
8. `Radio` → `<PrismRadioGroup aria-label="Exemplo de radio" defaultValue="a"><PrismRadio value="a">Opção A</PrismRadio><PrismRadio value="b">Opção B</PrismRadio></PrismRadioGroup>`
9. `Calendário (dia)` → `<PrismCalendar aria-label="Exemplo de calendário" />` (se precisar de outro prop, copie de `CalendarSection.tsx`; sem estado controlado).
10. `Color area (thumb)` → `<PrismColorArea defaultValue="#FF5733" />`
11. `Color slider (thumb)` → `<PrismColorSlider defaultValue="#FF5733" />` (se o componente exigir `colorSpace`/`channel`, copie de `TokensColorsSection.tsx` ou da seção de cor existente em `ui-sections/`).
12. `Campo de hora (focus-within)` → `<PrismTimeField aria-label="Exemplo de hora" />` (copie props mínimos de `InputSection.tsx`/`DateRangePickerSection.tsx` se necessário).
13. `Combobox (focus-within)` → copie o uso de `ComboboxSection.tsx`, mantendo só 2 itens.

**Réplicas** (copie a string de classe do arquivo-fonte; abaixo, o valor atual em 03/11/2026): 14. `Link do dia (Home)` — `Réplica de features/home/HomeCalendarView.tsx`:

```tsx
<a
  className="block rounded-sm underline-offset-4 squircle hover:underline focus-visible:ring-3 focus-visible:ring-ring/30"
  href="#tokens-focus"
>
  Link do dia
</a>
```

15. `Alça de reordenar` — `Réplica de features/media/ContentReorderDialog.tsx`:

```tsx
<button
  aria-label="Réplica da alça"
  className="flex size-8 cursor-grab touch-none items-center justify-center rounded bg-black/70 text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30 active:cursor-grabbing"
  type="button"
>
  ⠿
</button>
```

16. `Remover anexo` — `Réplica de features/media/ContentReorderDialog.tsx` (botão remover):

```tsx
<button
  aria-label="Réplica remover"
  className="bg-destructive flex size-8 items-center justify-center rounded text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30"
  type="button"
>
  ×
</button>
```

17. `Editor de texto (focus-within)` — `Réplica de routes/app/admin/partner/$slug.tsx`:

```tsx
<div className="min-h-25 w-72 overflow-hidden rounded-2xl bg-input/50 text-base shadow-sm transition-[color,box-shadow] squircle focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 md:text-sm">
  <textarea
    aria-label="Réplica do editor admin"
    className="h-full min-h-25 w-full resize-none bg-transparent p-3 outline-none"
    placeholder="Clique ou Tab aqui"
  />
</div>
```

18. `Cartão em edição (focus-within)` — `Réplica de features/ActionItem.tsx` (estado `isEditing`; o foco é `ring-3 ring-ring/30`, NÃO o `ring-primary`):

```tsx
<div className="w-72 rounded-2xl border bg-card p-3 text-sm focus-within:ring-3 focus-within:ring-ring/30">
  <input
    aria-label="Réplica do cartão em edição"
    className="w-full bg-transparent outline-none"
    placeholder="Clique ou Tab aqui"
  />
</div>
```

19-22. **Estados** (mesmo anel, cor muda), todos reais/Prism:

- `Botão destrutivo` → `<PrismButton variant="destructive">Excluir</PrismButton>` (`focus-visible:ring-destructive/20`, `/40` no escuro)
- `Botão sucesso` → `<PrismButton variant="success">Confirmar</PrismButton>` (`focus-visible:ring-success-accent/30`)
- `Input inválido` → `<PrismInput aria-invalid aria-label="Input inválido" className="w-56" defaultValue="valor inválido" />` (`aria-invalid:ring-3 aria-invalid:ring-destructive/20`)
- `Campo de cor com erro` — `Réplica de features/action-drawer/PartnerColorPicker.tsx`: `<PrismInput aria-label="Campo de cor inválido" className="h-8 w-32 font-mono tracking-wider uppercase bg-destructive/5 text-destructive ring-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" defaultValue="#ZZZZZZ" />` (string do `isInvalid &&` atual; ajuste a ordem das classes só se o Prettier exigir).

Agrupe os 19-22 sob um subtítulo de uma linha dentro da família (`<p className="w-full text-xs font-semibold text-muted-foreground uppercase">Estados: destrutivo, sucesso e erro</p>`) antes deles. Não crie uma sétima família.

---

### 2. Anel por dentro (`ring-inset`)

- `id="focus-inset"` · `title="Anel por dentro (ring-inset)"`
- `rule="Mesmo anel de 3px a 30%, desenhado para dentro. Usado onde um contêiner com overflow cortaria o anel externo (regiões roláveis, células, miniaturas, gaveta)."`
- `classes="outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"`
- Grep: `grep -rn "ring-inset" app --include='*.tsx' | grep -v ui-sections`
- `usedBy`: `"features/CalendarDayCell.tsx (célula do dia)"`, `"layout/KanbanPhasesBoard.tsx (coluna de fase)"`, `"routes/app/profile.tsx (duas regiões roláveis)"`, `"features/action-drawer/conflict-comparison.tsx (coluna de campos)"`, `"features/action-drawer/ActionFormDrawer.tsx (botão Fechar: também bg-input)"`, `"features/media/WorkFileThumbnail.tsx (link da miniatura)"`, `"features/media/InstagramPreview.tsx (carrossel)"`

Não há componente Prism com inset: todos são **réplicas** (os reais dependem de dados do app). Exemplos:

1. `Região rolável` — `Réplica de layout/KanbanPhasesBoard.tsx`:

```tsx
<div
  className="flex h-24 w-72 flex-col overflow-y-auto p-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
  tabIndex={0}
>
  Região rolável (coluna, célula, painel)
</div>
```

2. `Botão Fechar da gaveta` — `Réplica de features/action-drawer/ActionFormDrawer.tsx` (anel inset + fundo):

```tsx
<button
  aria-label="Réplica fechar"
  className="flex cursor-pointer items-center justify-center border-b px-3 py-3 text-sm font-medium outline-none focus-visible:bg-input focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset sm:p-5"
  type="button"
>
  Fechar
</button>
```

3. `Miniatura de anexo` — `Réplica de features/media/WorkFileThumbnail.tsx`:

```tsx
<a
  className="block size-20 rounded-2xl bg-secondary outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
  href="#tokens-focus"
>
  Arquivo
</a>
```

4. `Carrossel` — `Réplica de features/media/InstagramPreview.tsx`:

```tsx
<div
  className="flex h-24 w-72 touch-pan-x touch-pan-y snap-x snap-mandatory items-center justify-center overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset [&::-webkit-scrollbar]:hidden"
  tabIndex={0}
>
  Carrossel
</div>
```

---

### 3. Foco por fundo (sem anel)

- `id="focus-background"` · `title="Foco por fundo"`
- `rule="Exceção aprovada: o foco muda a cor de fundo (e a barra/linha do item), sem anel. Vale para itens de lista/menu/select/command/combobox, abas, gatilhos form-footer e a barra do RichTextEditor."`
- `classes="focus:bg-secondary/50 | data-focused:bg-secondary/50 | data-[focus-visible]:bg-input | focus-visible:bg-foreground/5 | focus:bg-destructive/10 | focus:bg-primary"`
- Grep: `grep -rnE "(focus|focus-visible|data-\[focus-visible\]|data-focused):bg-" app --include='*.tsx' | grep -v ui-sections`
- `usedBy`: `"Prism: dropdown-menu, select, combobox, command (itens: secondary/50)"`, `"Prism: tabs (underline e drawer: bg-input)"`, `"Prism: time-field (segmento: bg-primary)"`, `"features/RichTextEditor.tsx (barra: bg-input)"`, `"features/ComboboxTrigger.tsx variante form-footer (ver nota)"`, `"layout/Header.tsx (Sair: bg-destructive/10)"`, `"features/HelpPage.tsx e routes/app/notifications.tsx (bg-foreground/5)"`

Exemplos **reais** (prefira sempre):

1. `Item de menu` → `PrismMenu` com `PrismButton` de gatilho e dois `PrismMenuItem` (estrutura de `MenuSection.tsx`, só 2 itens). `hint="Abra com Enter e use as setas"`.
2. `Item destrutivo (Sair)` → igual ao 1, com um terceiro item `<PrismMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Sair</PrismMenuItem>` (classe copiada de `layout/Header.tsx`). Pode ser o mesmo menu do exemplo 1 (um só exemplo "Menu: item e item destrutivo") para não duplicar gatilho.
3. `Item de select` → o mesmo `PrismSelect` da família 1, mas `hint="Abra com Enter e use as setas"` (o foco do item é `data-focused:bg-secondary/50`).
4. `Item de combobox` → o mesmo `PrismCombobox` da família 1; `hint="Digite e use as setas"`.
5. `Item de command` → `PrismCommand` com `PrismCommandInput` e `PrismCommandList`/`PrismCommandItem` (copie de `CommandSection.tsx`, 2 itens; se só funcionar dentro de popover, use a mesma estrutura de popover dela). `hint="Digite e use as setas"`.
6. `Abas underline` →

```tsx
<PrismTabs defaultSelectedKey="a" variant="underline">
  <PrismTabList aria-label="Abas underline">
    <PrismTab id="a">Primeira</PrismTab>
    <PrismTab id="b">Segunda</PrismTab>
  </PrismTabList>
</PrismTabs>
```

7. `Abas drawer` → igual, `variant="drawer"` e `aria-label="Abas drawer"`.
8. `Segmento de hora` → o mesmo `PrismTimeField` da família 1 (segmento `focus:bg-primary`); só um exemplo extra com `hint="Tab entra nos segmentos"`. Se parecer duplicado, referencie-o na `rule` em vez de repetir.
9. `Barra do editor` → `RichTextEditor` real (uso mínimo de `ui-sections/RichTextEditorSection.tsx`: `compactToolbar`, `content` em `useState("")`, `handleChange`). O foco é nos botões da barra (`data-[focus-visible]:bg-input`). `hint="Alt+Shift+F10 ou Tab até a barra"`. Se não montar sem dados, use a réplica:

```tsx
<button
  aria-label="Réplica botão da barra"
  className="text-muted-foreground flex size-8 items-center justify-center rounded-lg border border-transparent transition-all outline-none squircle hover:bg-secondary hover:text-foreground data-[focus-visible]:bg-input data-[focus-visible]:text-foreground"
  type="button"
>
  B
</button>
```

(`Réplica de features/RichTextEditor.tsx`; atenção: `data-[focus-visible]` só dispara em componente React Aria; numa réplica use `focus-visible:bg-input focus-visible:text-foreground` e anote isso no `source`.)

**Réplicas** (só quando não há componente simples): 10. `Linha de ajuda / notificação (foreground/5)` — `Réplica de features/HelpPage.tsx`:

```tsx
<button
  className="w-56 rounded-md px-2 py-1.5 text-left text-sm outline-none squircle focus-visible:bg-foreground/5"
  type="button"
>
  Linha de lista
</button>
```

11. `Gatilho form-footer (ComboboxTrigger)` → componente **real**: `<ComboboxTrigger aria-label="Exemplo de gatilho do rodapé" variant="form-footer">…</ComboboxTrigger>` com um ícone Lucide qualquer (`CalendarIcon`, sufixo Icon). **NOTA / DIVERGÊNCIA:** AGENTS.md e final-status listam `form-footer` como foco por fundo, mas o código atual (`ComboboxTrigger.tsx`) compõe `buttonVariants({ variant: "ghost", ... })`, que usa o **anel padrão** `ring-3 ring-ring/30` (não há `bg-input`). Mostre o componente real, **não invente a classe**, e escreva no relatório o que você viu de fato ao dar Tab. Coloque este exemplo na família 3 mesmo assim e anote no `source`: `App real (hoje usa o anel do ghost; ver relatório)`.

---

### 4. Sem anel de propósito

- `id="focus-none"` · `title="Sem anel de propósito"`
- `rule="Exceção aprovada: o próprio campo se apresenta como edição (fundo/cursor) ou o anel fica no contêiner. Foco discreto: sublinhado, fundo ou nenhum."`
- `classes="ring-0 | focus:ring-0 focus:outline-none | focus-visible:underline | sem classe de foco"`
- Grep: `grep -rn "ring-0\|focus-visible:underline" app --include='*.tsx' | grep -v ui-sections`
- `usedBy`: `"features/ActionItemTitleInput.tsx (título inline: fundo muda para bg-muted)"`, `"features/ActionComments/CommentInput.tsx (comentário)"`, `"features/action-drawer/ActionDatePicker.tsx (data: sublinhado)"`, `"Prism: accordion (gatilho sem classe de foco; só hover:underline)"`, `"Prism: button variante unstyled e input-group (o anel fica no grupo)"`

Exemplos:

1. `Título inline` — `Réplica de features/ActionItemTitleInput.tsx`:

```tsx
<input
  aria-label="Réplica do título inline"
  className="bg-muted/80 focus:bg-muted w-56 rounded-md border-0 px-1.5 py-0.5 text-sm text-foreground ring-0 transition-colors outline-none squircle focus:ring-0 focus:outline-none"
  defaultValue="Título da ação"
/>
```

2. `Comentário` (Prism com override, igual ao uso real em `ActionComments/CommentInput.tsx`):

```tsx
<PrismTextarea
  aria-label="Exemplo de comentário"
  className="min-h-20 w-56 rounded-none border-0 p-0 text-sm shadow-none focus:border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
  placeholder="Escreva um comentário"
/>
```

3. `Data da gaveta (sublinhado)` — `Réplica de features/action-drawer/ActionDatePicker.tsx`:

```tsx
<div
  className="w-fit cursor-pointer text-sm underline-offset-2 outline-none hover:underline focus-visible:underline"
  tabIndex={0}
>
  12 de novembro
</div>
```

4. `Accordion` (Prism real):

```tsx
<PrismAccordion className="w-72">
  <PrismAccordionItem id="a">
    <PrismAccordionTrigger>Gatilho de accordion</PrismAccordionTrigger>
    <PrismAccordionContent>Conteúdo.</PrismAccordionContent>
  </PrismAccordionItem>
</PrismAccordion>
```

5. `Botão unstyled` (Prism real) → `<PrismButton variant="unstyled">Unstyled</PrismButton>`

A "busca de parceiros" não aparece mais com override sem anel no código (grep de `focus-visible:border-transparent` não retorna nada). **Não a inclua**; reporte o que encontrar em `GlobalSearchCommand.tsx`/`PartnersCombobox.tsx`.

---

### 5. Não é foco: estados de seleção

- `id="focus-selection"` · `title="Não é foco: estados de seleção"`
- `rule="Anel primary indica item selecionado, arrastado ou escolhido. Não é indicador de foco do teclado; aparece mesmo sem foco. Mostrado aqui só para não ser confundido com foco."`
- `classes="ring-2 ring-primary (+ ring-offset-1 | ring-inset)"`
- Grep: `grep -rn "ring-primary" app --include='*.tsx' | grep -v ui-sections`
- `usedBy`: `"features/action-drawer/PartnerColorPicker.tsx (cor escolhida)"`, `"features/ColorListEditor.tsx (item arrastado)"`, `"features/ActionItem.tsx (selecionado / sprint)"`, `"planning/PlanningCalendarView.tsx (dia selecionado)"`

Exemplos (todos **réplicas estáticas SEM `tabIndex`**, porque não recebem foco; legenda com `hint="Estado estático: não é foco"`):

1. `Cor escolhida` — `Réplica de features/action-drawer/PartnerColorPicker.tsx`: `<div aria-hidden className="size-8 scale-105 rounded-full bg-primary ring-2 ring-primary ring-offset-1" />`
2. `Cartão selecionado` — `Réplica de features/ActionItem.tsx`: `<div className="w-56 rounded-2xl border bg-card p-3 text-sm ring-2 ring-primary">Ação selecionada</div>`
3. `Dia selecionado` — `Réplica de planning/PlanningCalendarView.tsx`: `<div className="w-24 rounded-2xl bg-primary/10 p-3 text-center text-sm ring-2 ring-primary ring-inset">12</div>`

---

### 6. Fallback global

- `id="focus-global"` · `title="Fallback global (outline)"`
- `rule="Todo elemento que não define o próprio foco e não usa outline-none ganha um outline na cor outline-ring a 30%."`
- `classes="* { @apply border-border outline-ring/30 } (app/tailwind.css:379)"`
- Grep: `grep -n "outline-ring" app/tailwind.css`
- `usedBy`: `"app/tailwind.css (camada base, todos os elementos)"`

Exemplo único: `Elemento sem estilo de foco` (**réplica**; botão cru sem `outline-none`, para mostrar o fallback): `<button className="rounded-xl bg-secondary px-3 py-2 text-sm" type="button">Sem estilo próprio</button>`

---

## Verificação (obrigatória, nesta ordem)

1. `bunx prettier --write app/components/ui-sections/TokensFocusSection.tsx`
2. `bunx tsc --noEmit -p .` sem erros novos no arquivo (erros antigos fora dele: apenas liste).
3. Critérios por grep (todos devem passar). Rode e cole a saída no relatório:
   - `grep -nE "ring-ring/50|ring-2 ring-ring|ring-\[3px\]|outline-2" app/components/ui-sections/TokensFocusSection.tsx` → **nada**
   - `grep -c "Réplica de" app/components/ui-sections/TokensFocusSection.tsx` e confira que **toda** réplica cita seu arquivo-fonte (nenhuma réplica sem `source="Réplica de <arquivo>"`).
   - Para cada réplica, `grep -n "<string de classe principal>" <arquivo-fonte>` confirma que a classe ainda existe lá.
4. `bun run dev` → `http://127.0.0.1:5176/ui` → "Design Tokens" → "Foco": o item aparece na barra lateral após Espaçamento; a seção aparece depois de Espaçamento.
5. **Pressione Tab em todos os exemplos**, do primeiro ao último, nos temas **claro e escuro**: cada exemplo mostra o foco da sua família (família 4 mostra pouco ou nada; família 5 não recebe foco; família 6 mostra o outline do navegador/global). Anote qualquer exemplo que não receba foco.
6. Largura de celular: sem rolagem horizontal da página.
7. `git diff --stat`: só `TokensFocusSection.tsx` (novo/modificado) e este ticket (+ alterações anteriores do proprietário que não são suas).

## Não faça

- Não altere NENHUMA classe de foco em `app/components/prism/`, `app/components/features/`, `app/routes/`, `app/tailwind.css` ou qualquer outro componente (nem `index.ts` / `ui.tsx` além do que já está feito).
- Não "corrija" classes nas réplicas: copie exatamente do arquivo-fonte atual.
- Não crie caixas/cartões (`rounded border bg-card`) em volta de famílias ou exemplos; só `divide-y`.
- Não adicione botão "Forçar foco", estado, toggle, prop `approved`, testes, documentação ou novos componentes além de `FocusFamily` e `Example`.
- Não renomeie ids: `tokens-focus`, `focus-outer`, `focus-inset`, `focus-background`, `focus-none`, `focus-selection`, `focus-global`.
- Não faça commit nem push. Não mexa em `routeTree.gen.ts`.
- Não decida padronização: a seção só mostra o estado atual.

## Checklist final (marque cada item)

- [x] `TokensFocusSection.tsx` reescrito do zero (nenhum resto da primeira passada)
- [x] 6 famílias na ordem, cada uma com título, regra, classes, `usedBy` verificado por grep e exemplos
- [x] Componentes reais usados onde existem (menu, select, combobox, command, tabs, ComboboxTrigger, RichTextEditor, time-field etc.)
- [x] Toda réplica cita o arquivo-fonte e copia a classe atual
- [x] Família 5 claramente rotulada como "Não é foco" e sem `tabIndex`
- [x] Grep de `ring-ring/50`, `ring-2 ring-ring`, `ring-[3px]`, `outline-2` no arquivo: vazio
- [x] Nenhum cartão em volta das famílias
- [x] Prettier e `tsc` executados
- [x] Tab em todos os exemplos, claro e escuro, e celular
- [x] `git diff --stat` só com o permitido; nenhum componente alterado

## Relatório (Gemini preenche ao terminar)

```
Arquivos alterados:
- app/components/ui-sections/TokensFocusSection.tsx (reescrito do zero)
- .scratch/visual-controls/issues/09-ui-focus-section.md (relatório e checklist)

Número de famílias (esperado 6): 6
Número de exemplos por família:
- Família 1 (Anel externo): 22 exemplos
- Família 2 (Anel por dentro / ring-inset): 4 exemplos
- Família 3 (Foco por fundo): 10 exemplos
- Família 4 (Sem anel de propósito): 5 exemplos
- Família 5 (Não é foco: estados de seleção): 3 exemplos
- Família 6 (Fallback global): 1 exemplo
Total: 45 exemplos

Exemplos que precisaram de ajuste de props (listar e motivo):
Nenhum. Todos os componentes Prism reais e do app compilaram perfeitamente sem desvios.

Réplicas (listar com arquivo-fonte):
1. Link do dia (Home) · features/home/HomeCalendarView.tsx
2. Alça de reordenar · features/media/ContentReorderDialog.tsx
3. Remover anexo · features/media/ContentReorderDialog.tsx
4. Editor de texto (focus-within) · routes/app/admin/partner/$slug.tsx
5. Cartão em edição (focus-within) · features/ActionItem.tsx
6. Campo de cor com erro · features/action-drawer/PartnerColorPicker.tsx
7. Região rolável · layout/KanbanPhasesBoard.tsx
8. Botão Fechar da gaveta · features/action-drawer/ActionFormDrawer.tsx
9. Miniatura de anexo · features/media/WorkFileThumbnail.tsx
10. Carrossel · features/media/InstagramPreview.tsx
11. Linha de ajuda / notificação (foreground/5) · features/HelpPage.tsx
12. Título inline · features/ActionItemTitleInput.tsx
13. Data da gaveta (sublinhado) · features/action-drawer/ActionDatePicker.tsx
14. Cor escolhida · features/action-drawer/PartnerColorPicker.tsx
15. Cartão selecionado · features/ActionItem.tsx
16. Dia selecionado · planning/PlanningCalendarView.tsx
17. Elemento sem estilo de foco · app/tailwind.css

Saída dos greps de aceite:
- grep -nE "ring-ring/50|ring-2 ring-ring|ring-\[3px\]|outline-2" app/components/ui-sections/TokensFocusSection.tsx
  -> (vazio / exit 1)
- grep -c "Réplica de" app/components/ui-sections/TokensFocusSection.tsx
  -> 18 (1 no comentário de tipo, 17 em cada uma das réplicas)

O que o ComboboxTrigger form-footer mostrou ao dar Tab (anel ou fundo):
Mostrou anel externo padrão (ring-3 ring-ring/30 com border-ring).
Motivo: em ComboboxTrigger.tsx, variant="form-footer" compõe buttonVariants({ variant: "ghost", size: iconOnly ? "icon" : "default" }), que herda o anel de foco do PrismButton em vez de focus por fundo.

Prettier: OK
tsc: OK (tsc --noEmit -p . com 0 erros)
Tab em claro/escuro/celular:
- Família 1: foco externo ring-3 ring-ring/30 em todos os itens; estados com suas cores respectivas.
- Família 2: anel interno ring-inset de 3px a 30%.
- Família 3: foco por fundo (bg-secondary/50, bg-input, bg-primary, etc.); ComboboxTrigger recebe anel ghost conforme código real.
- Família 4: foco discreto (sublinhado, cursor/fundo ou nenhum).
- Família 5: sem tabIndex; não recebe foco (apenas visualização de seleção).
- Família 6: outline fallback global (outline-ring/30).
- Sem estouro de largura ou rolagem horizontal da página.

Desvios do ticket: Nenhum.
```

## Checklist de revisão do proprietário (após a execução)

1. `/ui` → Design Tokens → "Foco": a seção aparece logo depois de Espaçamento e o item "Foco" está na lateral.
2. Tab por todas as famílias: o anel externo e o inset têm a mesma espessura e opacidade; fundo, sem anel e seleção estão claramente separados.
3. Decidir os pontos pendentes do ticket 01 (borda dupla `border-ring` + anel, `form-footer` anel vs fundo, outline global).
4. Conferir tema claro/escuro e que a página não ganhou rolagem horizontal.

---

<a id="visual-controls-issues-13-combobox-variants"></a>

## visual-controls · 13-combobox-variants

Origem: `.scratch/visual-controls/issues/13-combobox-variants.md`. Classificação: Encerrado/aprovado no registro da série.

# 13 — Comboboxes: variant/size do botão e conteúdo

**Resumo:** Unifica variantes e tamanhos dos comboboxes com o botão Prism.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

## Regra

- Comboboxes e `ComboboxTrigger` recebem `variant`/`size` do botão Prism; padrão `ghost` + `sm`. Sem variantes próprias.
- O conteúdo (avatar, ícone, marcador, amostra de cor) segue o ícone do botão: `xs` `size-3`; `sm` `size-4`; `default`/`lg` `size-5`.
- Sem `overflow-hidden`, cor ou tamanho avulsos no gatilho.

## Onde aparece

| Componente                   | Onde ver no app                                                                 | variant / size                          | Conteúdo atual                                                            | Estado                   |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- | ------------------------ |
| `PartnersCombobox`           | Rodapé da gaveta de ação (abrir qualquer ação)                                  | `ghost` / `icon-lg` ou `lg`             | Avatares `md` (32px)                                                      | OK                       |
| `PartnersCombobox`           | Busca global (`⌘K`), rodapé: filtro de parceiros                                | `ghost` / `sm`                          | Avatares `xs` (16px)                                                      | OK                       |
| `PhaseCombobox`              | Rodapé da gaveta                                                                | `ghost` / `icon-lg`                     | `PhaseIcon` progress                                                      | OK                       |
| `PhaseCombobox` (multi)      | `/app/partner/$slug`, opções de visualização, filtro de fase                    | `ghost` / `sm` (padrão)                 | `FilterIcon` sem seleção; marcadores `size-4` (segue o botão) com seleção | OK                       |
| `CategoriesCombobox`         | Rodapé da gaveta                                                                | `ghost` / `icon-lg`                     | Ícone da categoria (herda do botão)                                       | OK                       |
| `CategoriesCombobox` (multi) | `/app/partner/$slug`, opções de visualização, filtro de categoria               | `ghost` / `sm`                          | Ícones das categorias (herdam do botão)                                   | OK                       |
| `ActionColorDropdown`        | Rodapé da gaveta (categorias de mídia social)                                   | `ghost` / `icon-lg`                     | Amostra `size-5`                                                          | OK                       |
| `SprintCombobox`             | Rodapé da gaveta (ação já salva)                                                | `ghost` / `icon-lg`                     | `ZapIcon` ou avatares `md` (32px)                                         | OK                       |
| `ResponsiblesCombobox`       | Gaveta, aba Essencial, linha de Responsáveis                                    | `link` / `sm`                           | Avatares `xs` (16px) + nomes                                              | OK                       |
| `/ui`                        | `#uzzina-categories-combobox`, `#uzzina-phase-combobox`, `#uzzina-view-options` | combinações ghost/link `sm` e `icon-lg` | Mesmos componentes acima                                                  | Acompanha os itens acima |

## Decisões

1. Avatares seguem o `size` do botão: `xs`/`sm`/`icon-xs`/`icon-sm` usam `UAvatar xs` (16px); `default`/`icon` usam `sm` (24px); `lg`/`icon-lg` usam `md` (32px). Vale para Parceiros, Sprint e Responsáveis (`getTriggerAvatarSize` em `ComboboxTrigger`).
2. Amostras de cor, marcadores e `PhaseIcon` seguem o ícone do botão: `xs` `size-3`, `sm` `size-4`, `default`/`lg` `size-5` (`getTriggerContentSizeClass`, `getTriggerPhaseIconSize`); sem `avatarClassName` nem `size-*` avulsos.
3. Gatilhos com avatar no início recebem `pl-2`/`pl-3`/`pl-4` (`xs`/`sm`/`default` e `lg`) via `getTriggerAvatarPadding`; `FilterIcon` do filtro de fase permanece.

## Status

Concluído (03/11).

---

<a id="visual-controls-issues-14-ui-icons-section"></a>

## visual-controls · 14-ui-icons-section

Origem: `.scratch/visual-controls/issues/14-ui-icons-section.md`. Classificação: Encerrado/aprovado no registro da série.

# 14 — `/ui`: seção "Ícones" (vitrine dos ícones usados no app)

**Resumo:** Documenta os ícones usados pelo aplicativo, seus significados e tamanhos.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Aprovado pelo proprietário em 03/11/2026, 100%. Aceite dos componentes não citados na revisão por capturas.
Escopo: criar UMA seção de vitrine nova em `/ui`, logo após "Foco", no primeiro grupo (Tokens). A seção mostra os ícones que o app já usa, com nome técnico e significado. **Não altere nenhum componente do app.** Não altere estilos, props, imports ou textos de nenhum arquivo de feature.

## Contexto para o executor

- Biblioteca: `lucide-react`. Ícones customizados ficam em `app/components/uzzina/UIcons.tsx` (função `Icons` com `slug`, usada para categorias, fases e estações; ver a lista na seção "Customizados").
- Padrão de tamanho nos controles: `sm` = `size-4`; `default` e `lg` = `size-5`. Cor: `currentColor`, opacidade 60% (regra do `PrismToggle` e de `[&_svg]:opacity-60`). Use `className="size-4 opacity-60"` ou `size-5 opacity-60`, sem cor fixa.
- Estrutura de referência: `app/components/ui-sections/TokensFocusSection.tsx` e `TokensSpacingSection.tsx` (usam `GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem` de `GalleryHelperComponents.tsx`).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/TokensIconsSection.tsx`, exportando `export function TokensIconsSection()`.
2. EDITAR `app/components/ui-sections/index.ts`: adicionar `export * from "./TokensIconsSection";` logo após a linha de `TokensFocusSection`.
3. EDITAR `app/routes/ui.tsx`:
   - Import: incluir `TokensIconsSection` no mesmo bloco de imports de `TokensFocusSection` (linha ~15).
   - `SIDEBAR_ITEMS`: após o item `tokens-focus` (linha ~72), adicionar:
     `{ id: "tokens-icons", label: "Ícones", section: "tokens", keywords: ["icones", "ícones", "icon", "lucide", "glifo"] }`
   - Render: no bloco `activeSection === "tokens"` (linha ~520), depois de `<TokensFocusSection />`, adicionar `<TokensIconsSection />`.
   - A seção raiz deve ter `id="tokens-icons"` (o item da barra lateral usa esse id para rolagem).

Não criar outros arquivos. Não criar testes.

## Conteúdo da seção

Cabeçalho (`GallerySectionHeader`):

- title: `Ícones`
- description: `Ícones usados no app, com o significado de cada um. Biblioteca Lucide, exceto os customizados.`

Três subgrupos, cada um com título pequeno (`text-sm font-medium`) e grade de itens. Cada item: ícone em dois tamanhos (`size-4` para sm e `size-5` para default e lg), com o nome técnico em `font-mono text-xs` e o significado em `text-xs text-muted-foreground`. Sem cartão, sem borda, sem fundo: layout em grade simples sobre o fundo da página (regra de design do AGENTS.md). Texto de interface em português brasileiro; nomes técnicos ficam como estão.

Os nomes abaixo são os **exatos** importados do `lucide-react` no app (contagem de arquivos entre parênteses). Quando um ícone tiver alias (ex.: `Trash2` e `Trash2Icon`), mostre o glifo uma vez com o nome canônico `*Icon` e cite o alias no significado.

### 1. Ações e edição

| Nome                         | Significado no app                   |
| ---------------------------- | ------------------------------------ |
| PlusIcon (13)                | Criar / adicionar                    |
| PencilIcon, Pencil           | Editar                               |
| TrashIcon, Trash2Icon, Trash | Excluir / remover                    |
| CopyIcon (1)                 | Duplicar                             |
| ArchiveIcon (5)              | Arquivar; ação arquivada             |
| ArchiveRestoreIcon (1)       | Desarquivar                          |
| SaveIcon (1)                 | Salvar                               |
| SendIcon (3)                 | Enviar (comentário, lote, mensagem)  |
| UploadIcon (4)               | Enviar arquivo                       |
| CloudUploadIcon (1)          | Enviar para a nuvem (salvar ação)    |
| CloudIcon (2)                | Nuvem / sincronizado                 |
| XIcon (14)                   | Fechar; remover item de lista        |
| CheckIcon (15)               | Selecionado / marcado                |
| RotateCcwIcon (3)            | Restaurar / reiniciar                |
| GripVerticalIcon (3)         | Alça de arraste / reordenar          |
| FilePlus                     | Novo arquivo                         |
| FileIcon (1)                 | Arquivo                              |
| FolderPlusIcon (1)           | Nova pasta / novo grupo de parceiros |
| ExternalLinkIcon (1)         | Abrir em nova aba                    |
| Share2Icon (1)               | Compartilhar                         |

### 2. Estados e feedback

| Nome                                     | Significado no app                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| CheckCircle2Icon (7)                     | Sucesso / concluído (toast, lead, comando)                                                                |
| CircleCheckBigIcon (1)                   | Concluído (AppBar)                                                                                        |
| BadgeCheckIcon (2)                       | Verificado; fase/estado "Concluído" (`finished`)                                                          |
| AlertCircleIcon (3)                      | Alerta de ação ou item                                                                                    |
| AlertTriangleIcon (8)                    | Aviso                                                                                                     |
| TriangleAlertIcon (1)                    | Aviso (página de leads)                                                                                   |
| OctagonAlertIcon (1)                     | Erro (toast)                                                                                              |
| ShieldAlertIcon (1)                      | Sem permissão (guarda de admin)                                                                           |
| XCircleIcon (1)                          | Sugestão recusada / erro de item                                                                          |
| InfoIcon (2)                             | Informação                                                                                                |
| LoaderIcon (4), Loader2, Loader2Icon (1) | Carregando (Loader2 é alias do mesmo glifo)                                                               |
| LockIcon (6)                             | Bloqueado; comentário interno / privado                                                                   |
| EyeIcon (7)                              | Mostrar (senha, prévia)                                                                                   |
| EyeOffIcon (6)                           | Ocultar (senha, prévia)                                                                                   |
| ClockIcon (3)                            | Horário; prazo; em atraso (lead)                                                                          |
| SignalIcon (2)                           | Indicador de estado da ação (cor `info` ou `error`, `ActionItem.tsx:397`)                                 |
| StarIcon (2)                             | Favorito / destaque                                                                                       |
| HeartIcon (1)                            | Curtir / marcar como importante (`ActionFormDrawer.tsx:974`)                                              |
| SparkleIcon (2), SparklesIcon (4)        | Sugestão ou geração por IA. SparkleIcon = botão de IA na gaveta; SparklesIcon = sugestões do planejamento |
| ZapIcon (2)                              | Sprint (também usado em `Icons` slug `sprint`)                                                            |

### 3. Navegação e layout

| Nome                                              | Significado no app                                        |
| ------------------------------------------------- | --------------------------------------------------------- |
| HomeIcon (2)                                      | Início                                                    |
| ArrowLeftIcon (2)                                 | Voltar                                                    |
| ChevronLeftIcon (5)                               | Mês/semana anterior; voltar em menu                       |
| ChevronRightIcon (5)                              | Próximo mês/semana; submenu                               |
| ChevronDownIcon (6)                               | Abrir seletor / lista                                     |
| ChevronUpIcon (1)                                 | Recolher (acordeão)                                       |
| ChevronsUpDownIcon (2)                            | Seletor com opções (select, ordenação)                    |
| PanelRightOpenIcon (1)                            | Abrir painel lateral (dash)                               |
| PanelRightCloseIcon (1)                           | Fechar painel lateral (dash)                              |
| LayoutGridIcon (4)                                | Grade / categorias (`Icons` slug `categories`)            |
| LayoutListIcon (1)                                | Visualização em lista                                     |
| ListIcon (5)                                      | Lista (formato de lista ou itens)                         |
| ListOrderedIcon (1)                               | Lista numerada                                            |
| Columns2Icon, Columns3Icon, Columns4Icon (1 cada) | Visualização em 2, 3 ou 4 colunas                         |
| Rows2Icon, Rows3Icon (1 cada)                     | Visualização em 2 ou 3 linhas                             |
| Grid3X3Icon (1), Grid3x3Icon (2)                  | Grade 3×3 (alias do mesmo glifo) — visualização em grade  |
| KanbanIcon (3)                                    | Visualização Kanban / alterar fase                        |
| BlocksIcon (2)                                    | Visualização em blocos                                    |
| CalendarDaysIcon (5)                              | Calendário (dias)                                         |
| CalendarIcon (10)                                 | Calendário / data; planejamento (`Icons` slug `planning`) |
| CalendarRangeIcon (3)                             | Período; calendário da equipe                             |
| SlidersHorizontalIcon (2)                         | Ajustes de conteúdo / reordenar mídia                     |
| SettingsIcon (5)                                  | Configurações                                             |
| FilterIcon (4)                                    | Filtro (também `Icons` slug `filter`)                     |
| ArrowDownAZIcon (1), ArrowUpAZIcon (1)            | Ordenar A→Z / Z→A                                         |
| SearchIcon (10)                                   | Buscar                                                    |
| SearchCheckIcon (1)                               | Revisão (`Icons` fase `review`)                           |
| BellIcon (3)                                      | Notificações                                              |
| LogOutIcon (4)                                    | Sair                                                      |
| LogInIcon (2)                                     | Entrar                                                    |

### 4. Entidades (pessoas, parceiros, contas)

| Nome                                                       | Significado no app                                |
| ---------------------------------------------------------- | ------------------------------------------------- |
| UserIcon (6)                                               | Perfil / pessoa                                   |
| User2Icon (1)                                              | Responsáveis                                      |
| UserCheckIcon (1)                                          | Cliente (`Icons` estação `client`)                |
| UserPlusIcon (4)                                           | Novo usuário                                      |
| UsersIcon (4)                                              | Equipe / pessoas                                  |
| BriefcaseIcon (2)                                          | Parceiro (do parceiro / contexto)                 |
| Building2Icon (1)                                          | Empresa                                           |
| HandshakeIcon (2)                                          | Parceria                                          |
| HeartHandshakeIcon (3)                                     | Parceiro (seletor de parceiros em filtros e Hoje) |
| MegaphoneIcon (1)                                          | Campanhas / divulgação                            |
| MailCheckIcon (1)                                          | E-mail confirmado / enviado                       |
| MailOpenIcon (1)                                           | E-mail aberto / recuperação de senha              |
| AtSignIcon (3)                                             | E-mail (campo de login)                           |
| PhoneIcon (1)                                              | Telefone (lead)                                   |
| GlobeIcon (1)                                              | Público / site (comentário público)               |
| KeyIcon (1)                                                | Senha (redefinição)                               |
| KeyboardIcon (1)                                           | Atalhos de teclado                                |
| ImageIcon (4)                                              | Imagem / post (`Icons` slug `post`)               |
| FlagIcon (2)                                               | Prioridade                                        |
| TagIcon (2)                                                | Categoria                                         |
| MessageSquareIcon (1)                                      | Comentários                                       |
| BarChart3Icon (1)                                          | Métricas (painel da Home)                         |
| SmartphoneIcon (1)                                         | Prévia no celular                                 |
| LaptopIcon (3), MonitorIcon (2), SunIcon (6), MoonIcon (6) | Tema: sistema/computador, claro, escuro           |
| PaletteIcon (4)                                            | Cores / tema (`Icons` estação `creation`)         |
| PipetteIcon (2)                                            | Conta-gotas: cor personalizada                    |
| HelpCircleIcon (3)                                         | Ajuda                                             |

### 5. Texto (barra do editor, `RichTextEditor.tsx`)

Importados sem o sufixo `Icon`: `Bold`, `Italic`, `Strikethrough`, `Heading1`, `Heading2`, `Heading3`, `List`, `ListOrdered`, `Quote`, `Link`, `Highlighter`, `Minus`, `Table`, `Columns`, `Rows`, `Trash2`, `ChevronDown`, `ChevronRight`, `Ellipsis`, `Undo2`, `Redo2`, `RemoveFormatting`. Mostrar cada um com o significado do comando: negrito, itálico, tachado, títulos 1–3, lista, lista numerada, citação, link, marca-texto, linha horizontal, tabela, colunas, linhas, excluir tabela, submenu, reticências (mais formatação), desfazer, refazer, limpar formatação. Para Heading/Columns etc., usar o nome exato do import.

Nota ao executor: ler `RichTextEditor.tsx` (linhas de import) e usar exatamente os nomes importados. Se algum nome não existir no pacote instalado, omita-o e reporte.

## Customizados (`app/components/uzzina/UIcons.tsx`, função `Icons`)

Mostrar com `<Icons slug="..." className="size-4 opacity-60" />`. Agrupar por tipo.

- Categorias: `ads` (Volume2Icon), `capture` (CameraIcon), `carousel` (GalleryHorizontalIcon), `design` (PenToolIcon), `dev` (BinaryIcon), `finance` (CoinsIcon), `meeting` (PresentationIcon), `post` (ImageIcon), `print` (PrinterIcon), `reels` (PlayIcon), `sm` (BadgeCheckIcon), `stories` (CircleFadingPlusIcon), `todo` (ClipboardCheckIcon), `sprint` (ZapIcon), `categories` (LayoutGridIcon), `filter` (FilterIcon), `instagram` (SVG próprio: quadrado arredondado, círculo e ponto).
- Fases: `idea` (LightbulbIcon), `do` (CirclePlayIcon), `doing` (PenLineIcon), `review` (SearchCheckIcon), `done` (CircleCheckIcon), `finished` (BadgeCheckIcon).
- Estações: `flow` (BrainIcon), `planning` (CalendarIcon), `creation` (PaletteIcon), `client` (UserCheckIcon).
- Padrão (sem slug reconhecido): HelpCircleIcon.

Significados das fases e estações: são as fases do Kanban e as estações do fluxo da agência (ver GLOSSARY.md). Consulte o glossário antes de escrever os rótulos.

## Ordem da seção

1. Título e descrição.
2. "Ações e edição".
3. "Estados e feedback".
4. "Navegação e layout".
5. "Entidades".
6. "Texto (editor)".
7. "Customizados".

Cada subgrupo: título em `text-sm font-medium`, itens em grade `grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4` (ou equivalente com Tailwind), sem caixas.

## Critérios de aceite

1. Os 3 arquivos (criado + 2 editados) e nenhum outro. `git diff --stat` mostra só esses.
2. Todo nome da tabela acima aparece uma vez, com o significado correto; aliases citados no texto, não duplicados como item.
3. Três tamanhos por ícone (size-4 e size-5); cor só `currentColor` com 60% de opacidade.
4. Sem cartão, borda ou fundo em cada item; títulos pt-BR, nomes técnicos como estão.
5. Entrada na barra lateral "Ícones" dentro do grupo Tokens, logo após "Foco", e rolagem por âncora para `tokens-icons`.
6. `bunx prettier --write` nos 3 arquivos alterados (plugin Tailwind) e `bun run typecheck` (ou `tsc --noEmit`) sem erros novos.
7. Sem teste novo. Roteiro curto de validação visual para o proprietário: abrir `/ui` > Tokens > "Ícones" e conferir glifos, nomes e significados.

## Fora do escopo

- Trocar ícones de componentes ou padronizar nomes no app.
- Criar ícones novos, SVG novos ou mudar `UIcons.tsx`.
- Tooltips, busca de ícones ou copiar nomes.

---

<a id="visual-controls-issues-15-essentials-rows"></a>

## visual-controls · 15-essentials-rows

Origem: `.scratch/visual-controls/issues/15-essentials-rows.md`. Classificação: Encerrado/aprovado no registro da série.

# 15 — Linhas de metadados da aba Essencial: tamanho único e padrão de recolher/expandir

**Resumo:** Uniformiza as linhas de metadados da aba Essencial e seu recolhimento.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Aprovado pelo proprietário em 03/11/2026, 100%. Aceite dos componentes não citados na revisão por capturas.
Escopo: as 3 linhas entre o título e a descrição em `app/components/features/action-drawer/EssentialsTab.tsx` (linhas 238–405), mais a barra compacta (<640px, `useCompactPanel`) que as recolhe.

## Objetivo

1. Usar o comportamento de recolher/expandir do modo compacto como padrão do bloco de metadados.
2. Igualar altura e botões das linhas: hoje há controles de 20 a 32px, ícones de 14 a 16px e três paddings verticais diferentes.

## Inventário (estado atual)

Linhas do arquivo `EssentialsTab.tsx`. Padrão: xs 24 / sm 32 / default 40 / lg 48; conteúdo xs `size-3`, sm `size-4`, default/lg `size-5`; texto xs `text-xs`, sm/default `text-sm`.

| Linha                                 | Controle (arquivo:linha)                                                | Componente / variante / tamanho                                                                                             | Altura                                   | Ícone / conteúdo                                                              | Texto                                      | Classificação                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Compacta (só <640px) — contêiner :240 | `py-1 pr-2 pl-4`, `gap-2`, `border-b`                                   | div                                                                                                                         | 8 + 32 + 1 = 41px                        |                                                                               |                                            | custom (padding próprio)                                                                               |
| Compacta                              | Ícone de data :184                                                      | `CalendarDaysIcon size-4` solto, `opacity-50`                                                                               | ícone 16px                               | 16px                                                                          |                                            | custom (fora de botão, opacidade manual)                                                               |
| Compacta e linha 2                    | Data (`ActionDatePicker` :190, `ActionDatePicker.tsx:50-61`)            | `div role=button` + `Pressable`, sublinhado no hover; sem `buttonVariants`; `className` com `opacity-50`/`text-destructive` | ~20px (altura de linha)                  | sem ícone próprio (o `size="sm"` com ícone 14px nem é usado aqui)             | `text-sm` herdado                          | inconsistente (não é botão do sistema; alvo de toque 20px)                                             |
| Compacta                              | Ícone de arquivos :248                                                  | `FileIcon size-4` em `span` `opacity-50`                                                                                    | 16px                                     | 16px                                                                          |                                            | custom                                                                                                 |
| Compacta                              | Expandir :251                                                           | `PrismButton ghost icon-sm`                                                                                                 | 32px                                     | `ChevronDownIcon size-4`                                                      |                                            | OK (único já no padrão)                                                                                |
| 1 — contêiner :271                    | `px-4 py-2`, `gap-2 sm:gap-4`, `flex-wrap`                              | div                                                                                                                         | 16 + conteúdo + 1 (hoje 49px)            |                                                                               |                                            | inconsistente (py-2)                                                                                   |
| 1                                     | Tempo (`ActionTimeDisplay` :273)                                        | div de texto, `opacity-50`                                                                                                  | ~20px                                    |                                                                               | `text-sm` herdado                          | custom (texto, não botão)                                                                              |
| 1                                     | Responsáveis (`ResponsiblesCombobox` :275, `ComboboxTrigger form-link`) | `buttonVariants link sm` + `overflow-hidden`                                                                                | 32px                                     | avatares `SIZE.sm` (24px?) em botão sm (16px); sem avatar: `User2Icon size-4` | `text-xs text-muted-foreground` (conteúdo) | inconsistente (avatar 24 > 16; `text-xs` em botão sm; muted manual). Vai a ghost/link `sm` (ticket 13) |
| 1                                     | ID :290                                                                 | `PrismButton ghost` (default 40px) sobrescrito por `h-6 px-2 font-mono text-[10px]`                                         | 24px                                     |                                                                               | 10px                                       | custom (3 sobrescritas; `text-[10px]` fora da escala)                                                  |
| 2 — contêiner :303                    | `px-4 py-1.5`, `gap-2`, `justify-between`                               | div                                                                                                                         | 12 + 24 + 1 = 37px (33px sem estratégia) |                                                                               |                                            | inconsistente (py-1.5)                                                                                 |
| 2                                     | Data no desktop (`dateControl` :306)                                    | ver acima                                                                                                                   | ~20px                                    | ícone 16px `opacity-50`                                                       | `text-sm`                                  | inconsistente                                                                                          |
| 2                                     | Ver estratégias :326                                                    | `PrismButton secondary xs` dentro de `PrismButtonGroup`                                                                     | 24px                                     | `ListIcon` 12px                                                               | `text-xs`                                  | OK                                                                                                     |
| 2                                     | Criar/Recriar estratégia :342                                           | `PrismButton secondary xs`, `truncate`                                                                                      | 24px                                     | `SparkleIcon`/`LoaderIcon` 12px                                               | `text-xs` maiúsculas                       | OK (tamanho); `min-w-0 shrink` aceitável                                                               |
| 3 — contêiner :365                    | `px-4 py-1`, `gap-2`, `overflow-hidden`                                 | div                                                                                                                         | 8 + 32 + 1 = 41px                        |                                                                               |                                            | inconsistente (py-1)                                                                                   |
| 3                                     | Miniaturas (`WorkFileThumbnail.tsx:20`)                                 | `size-8` próprio, `rounded-2xl`/`rounded-lg` misturados; remover `size-4`                                                   | 32px                                     | extensão `text-[8px]`; botão X `size-4` / ícone `size-2.5`                    | 8px                                        | custom (tamanho = sm por acaso; X de 16px é alvo mínimo; `text-[8px]`)                                 |
| 3                                     | Adicionar arquivo, vazio :384                                           | `CloudinaryUpload unstyled sm` + `h-8 gap-1 p-0 text-muted-foreground underline`                                            | 32px                                     | `FilePlus size-4`                                                             | `text-sm`                                  | custom (unstyled + 6 classes)                                                                          |
| 3                                     | Adicionar arquivo, com arquivos :384                                    | `CloudinaryUpload secondary icon-xs`                                                                                        | 24px                                     | `FilePlus size-4` (>12px do xs; `icon-xs` força 16px)                         |                                            | inconsistente (24px entre miniaturas de 32px)                                                          |

Resumo: alturas de controle 20 (data/tempo), 24 (ID, estratégia, upload com arquivos), 32 (responsáveis, expandir, miniaturas, upload vazio); três paddings verticais (8, 6, 4 por lado); três tamanhos de texto fora da escala (`10px`, `8px`, `text-xs` em sm); ícones 12/14/16; opacidade manual em 4 lugares.

## Proposta

### Tamanho único: `sm` (32px)

Motivo: já é o tamanho do botão de expandir, das miniaturas, do gatilho de responsáveis e do upload vazio; mantém o bloco baixo (a descrição precisa da altura); ícone `size-4`, texto `text-sm`. Os botões de estratégia (hoje `xs`) também passam a `sm`, com texto `text-sm`, para a linha ter um único tamanho. Se o rótulo longo ("RECRIANDO ESTRATÉGIAS...") não couber a 375px, trunca (já trunca).

Altura de linha: todas as linhas `py-1` + controles de 32px = 40px + 1px de borda (a linha 1 cai de 49px para 41px; a 2 sobe de 37px para 41px). Gap horizontal único `gap-2` (hoje `gap-2 sm:gap-4` na 1).

### Mudanças por controle

| #   | Controle                                      | Mudança                                                                                                                                                                                                                                                                                                                                             |
| --- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Contêineres das linhas :240, :271, :303, :365 | mesmo `px-4 py-1` e `gap-2`; mesma borda                                                                                                                                                                                                                                                                                                            |
| 2   | Data (`ActionDatePicker`)                     | virar botão do sistema: `PrismButton variant="ghost" size="sm"` (ou `link`) como gatilho do popover, com `CalendarDaysIcon` interno (herda `size-4`, 60%); remover o ícone solto :184, `opacity-50` e o ramo `size="sm"` com ícone 14px; atrasada: `text-destructive` no botão. Conferir `TokensFocusSection.tsx:511,536` (réplica do foco da data) |
| 3   | Tempo (`ActionTimeDisplay`)                   | continua texto, mas em `h-8 flex items-center text-sm text-muted-foreground`; sem `opacity-50`                                                                                                                                                                                                                                                      |
| 4   | Responsáveis                                  | ticket 13 (ghost `sm`, avatares `size-4`, sem texto muted); aqui só garantir 32px                                                                                                                                                                                                                                                                   |
| 5   | ID                                            | `PrismButton ghost size="sm"` com `font-mono`; remover `h-6 px-2 text-[10px]`                                                                                                                                                                                                                                                                       |
| 6   | Estratégia (2 botões)                         | `size="sm"`; ícones herdam `size-4`                                                                                                                                                                                                                                                                                                                 |
| 7   | Miniaturas                                    | manter `size-8`; `rounded-2xl squircle` em ambos os ramos (remover `rounded-lg`); extensão `text-[8px]` → `text-[10px]` ou ícone `FileIcon size-4` com extensão em `text-xs`                                                                                                                                                                        |
| 8   | Upload                                        | vazio: `variant="ghost" size="sm"` com `FilePlus` + "Adicionar arquivo" (remover `unstyled`, sublinhado e `text-muted-foreground`); com arquivos: `icon-sm` (32px) em vez de `icon-xs`                                                                                                                                                              |
| 9   | Ícone de arquivos compacto :248               | `FileIcon` dentro de `span h-8 w-8 flex items-center justify-center` (alinha a 32px); sem `opacity-50` manual (usa a opacidade de ícones do botão ou `text-muted-foreground`)                                                                                                                                                                       |

### Padrão de recolher/expandir

Decisões a tomar (recomendação em negrito):

- Componente reutilizável: **sim — extrair `EssentialsDetails` (ou `CollapsibleMetaRows`) dentro de `EssentialsTab.tsx`** com a barra-resumo (data + indicadores + chevron), o contêiner `hidden` com `id`/`aria-controls`/`aria-expanded` e as linhas como filhas. Evita três contêineres independentes com paddings próprios. Não vale um primitivo Prism ainda; um só consumidor.
- Sempre recolhível: **sim, no desktop também, como opção** — barra-resumo visível sempre; estado padrão aberto no desktop e fechado no compacto. Estado em `ActionFormDrawer.tsx:790` (`detailsExpanded`), hoje descartado ao fechar; no desktop o padrão aberto preserva o fluxo atual.
- Persistência: **por sessão do navegador, não por conta** (sem `people.preferences`); aberto/fechado por painel é efêmero, como as demais escolhas de altura.
- Resumo recolhido: data + ícone de arquivos (regra atual). Opcional: avatares de responsáveis (16px) na barra, decisão do proprietário.
- Barra-resumo no desktop ocupa 41px extras quando aberta (data dentro dela, saindo da linha 2). Alternativa mais barata: **manter o desktop como está (sempre aberto, sem barra)** e só unificar tamanhos. Precisa de decisão do proprietário.
- Linha 2 (estratégia): hoje `hidden={compact && !isSocial}`; no padrão unificado, a barra-resumo absorve a data e a linha 2 fica só com estratégia (somente social).

## Perguntas ao proprietário

1. Tamanho único `sm` (32px) para todos os controles das linhas, inclusive botões de estratégia e ID? (alternativa: `default` 40px, deixaria o bloco com ~123px + bordas)
2. Recolher/expandir também no desktop, com padrão aberto, ou manter só o compacto?
3. Data como botão ghost `sm` (com ícone interno) ou continua texto com sublinhado ao passar o mouse? (ticket 13 pergunta o mesmo para `form-link`)
4. Barra-resumo recolhida mostra avatares dos responsáveis?
5. Extensão de arquivo sem imagem: `text-[10px]` ou ícone + extensão?

## Critérios de aceite

1. Linhas 1, 2 e 3 e a barra compacta têm 41px (32 + `py-1` + borda) com controles `sm`; nenhuma classe `h-6`, `text-[10px]`/`text-[8px]` sobrando nos botões (exceção: extensão da miniatura conforme resposta 5).
2. Nenhum `opacity-50` manual nos controles; ícones herdam `currentColor` a 60%.
3. Teclado preservado: percurso Título → Descrição → Parceiros → … do FocusScope inalterado; conteúdo recolhido segue `hidden` (fora do Tab e montado, para uploads); expandir/recolher mantém foco no chevron; `aria-expanded`/`aria-controls` corretos.
4. Compacto (<640px): resumo mostra só data, arquivos e chevron; sem scroll horizontal a 375px; lógica de `useCompactPanel`/`useShortWritingPanel` e medição de altura (`onNeededHeightChange`, filhos title/metadata/description) intactas.
5. Desktop sem regressão (descrição mantém `min-h-50`); estratégia, ID e upload funcionam como antes.
6. Roteiro curto de validação visual para o proprietário; sem testes novos por rotina.

## Execução

Simples, delegável a executor externo (Gemini), sem tocar foco nem compacto:

- #1 paddings/gaps dos contêineres (apenas classes);
- #5 ID; #6 botões de estratégia para `sm`; #7 miniaturas (`rounded`, texto); #8 upload (variantes/tamanhos);
- #3 `ActionTimeDisplay` (classes).

Exigem cuidado (Claude):

- #2 data como botão: `Pressable`/`PrismPopoverTrigger`, foco por teclado, `TokensFocusSection` e o fluxo de salvar ao fechar o popover;
- #9 e o item "padrão de recolher/expandir": estado em `ActionFormDrawer`, `hidden`/`id`, ordem de foco do FocusScope, medição de `ResizeObserver` (as 3 filhas diretas do scroller), modo compacto e `useShortWritingPanel`;
- #4 depende do ticket 13.

## Arquivos

- `app/components/features/action-drawer/EssentialsTab.tsx`
- `app/components/features/action-drawer/ActionDatePicker.tsx`, `ActionTimeDisplay.tsx`
- `app/components/features/action-drawer/ActionFormDrawer.tsx` (estado `detailsExpanded`, só se o padrão for ao desktop)
- `app/components/features/ResponsiblesCombobox.tsx`, `ComboboxTrigger.tsx` (ticket 13)
- `app/components/features/media/WorkFileThumbnail.tsx`, `CloudinaryUpload.tsx` (uso)
- `app/components/ui-sections/TokensFocusSection.tsx` (réplica da data)
- AGENTS.md (parágrafo "Abaixo de 640px… Essencial") se o recolher chegar ao desktop

## Fora do escopo

- Título, descrição e rodapé (ticket 05); popovers dos comboboxes (ticket 03).
- Dados, atalhos e lógica de upload/estratégia.

---

<a id="visual-controls-issues-16-ui-partners-combobox-matrix"></a>

## visual-controls · 16-ui-partners-combobox-matrix

Origem: `.scratch/visual-controls/issues/16-ui-partners-combobox-matrix.md`. Classificação: Encerrado/aprovado no registro da série.

# 16 — `/ui`: matriz de `PartnersCombobox` (tamanho do avatar por tamanho de botão)

**Resumo:** Demonstra tamanhos de avatares do PartnersCombobox para cada tamanho de botão.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Concluído (03/11)
Escopo: criar UMA seção de vitrine nova na aba "Componentes Uzzina" do `/ui`, com o `PartnersCombobox` real em uma matriz de variantes × tamanhos × seleção, para o proprietário decidir o tamanho do avatar por tamanho de botão (decisão 1 do [ticket 13](resolved-tickets.md#visual-controls-issues-13-combobox-variants)). **Não altere nenhum componente do app** (nem `PartnersCombobox`, `ComboboxTrigger`, `UAvatar`, Prism). Somente arquivos de galeria.

## Contexto (já verificado no código; confirme antes de escrever)

- `app/components/features/PartnersCombobox.tsx` exporta `PartnersCombobox` com as props: `selectedPartners?: string[]` (slugs), `onSelect?: (slugs: string[]) => void`, `tabIndex?`, `showText?: boolean`, `variant?` e `size?` (tipos de `ComboboxTriggerProps`, padrão `ghost` + `sm`), `disabled?: boolean`, `allowAll?: boolean`.
- Obtém os parceiros com `useAppContext()` (`app/contexts/AppContext.tsx`), que **lança erro fora de `AppContext.Provider`**. A rota `/ui` (`app/routes/ui.tsx`) não está dentro de `/app`; portanto a seção precisa fornecer o contexto (ver "Dados").
- Tamanho do avatar hoje (código de `PartnersCombobox`):
  - `size` = `default`, `lg`, `icon` ou `icon-lg` → `UAvatar`/`UAvatarGroup` com `size="md"` = `size-8` = **32px**.
  - qualquer outro (`xs`, `sm`, `icon-xs`, `icon-sm`, ou `size` omitido) → `size="sm"` = `size-6` = **24px**.
  - Sem seleção: `<UAvatar fallback="P">` no mesmo tamanho. Com seleção: `UAvatarGroup` com `clampAt={2}` (3 parceiros mostram 2 avatares + "+1").
  - Esses `size-6`/`size-8` vêm de `app/components/uzzina/UAvatar.tsx` (`xs` 16px, `sm` 24px, `md` 32px).
- Ícone do botão Prism (`app/components/prism/button.tsx`): `xs` `size-3` (12px); `sm`, `icon-xs`, `icon-sm` `size-4` (16px); `default`, `lg`, `icon`, `icon-lg` `size-5` (20px). É a referência de comparação do ticket 13.
- Variantes de `buttonVariants`: `default`, `outline`, `secondary`, `ghost`, `destructive`, `success`, `link`, `unstyled`. Tamanhos: `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`, `unstyled`.
- Padrão de seção: `app/components/ui-sections/ViewOptionsSection.tsx` e `UzzinaComponentsSection.tsx` (usam `GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem` de `GalleryHelperComponents.tsx`, estado local com `useState`). Dados fictícios nessas seções são locais ao arquivo; nenhuma lê o banco.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaPartnersComboboxSection.tsx`, exportando `export function UzzinaPartnersComboboxSection()`.
2. EDITAR `app/components/ui-sections/index.ts`: `export * from "./UzzinaPartnersComboboxSection";` junto aos demais exports Uzzina (após `ViewOptionsSection`).
3. EDITAR `app/routes/ui.tsx`:
   - Import: incluir `UzzinaPartnersComboboxSection` no bloco de imports de `~/components/ui-sections`.
   - `SIDEBAR_ITEMS`: logo após o item `uzzina-view-options`, adicionar `{ id: "uzzina-partners-combobox", label: "PartnersCombobox", section: "uzzina", keywords: ["parceiros", "partners", "combobox", "avatar", "tamanho", "matriz"] }`.
   - Render: no bloco `activeSection === "uzzina"`, depois de `<ViewOptionsSection />`, adicionar `<UzzinaPartnersComboboxSection />`.
   - A raiz da seção é `<div id="uzzina-partners-combobox">` contendo `<GallerySection>`.
4. Este ticket (preencher o relatório).

Antes de editar: `git status --short app/components/ui-sections/ app/routes/ui.tsx` (há alterações do proprietário não commitadas: preserve-as). Não criar outros arquivos nem testes.

## Dados

Não há dados reais em `/ui`. Padrão a seguir: dados fictícios locais ao arquivo, como nas outras seções.

1. Declare no arquivo 4 parceiros fictícios do tipo `Partner` (`~/types`, = `Tables<"partners">`). Leia a definição de `partners` em `types/database.ts` (`Row`) e preencha **todos** os campos obrigatórios com valores neutros (strings fixas, `null` onde permitido, datas ISO fixas). Campos usados pelo componente: `id` (único), `slug`, `title`, `short` (2–3 letras), `image: null`, `colors: [fundo, texto]` (cores hex distintas por parceiro, ex.: `["#2563eb", "#ffffff"]`). Nomes sugeridos: "Alfa Odontologia" (`alfa`, "AO"), "Beta Studio" (`beta`, "BS"), "Gama Clínica" (`gama`, "GC"), "Delta Foods" (`delta`, "DF").
2. Envolva a seção em `<AppContext.Provider value={mockContext}>` (import de `~/contexts/AppContext`). `AppContextType` exige `person: Person`, `partners`, `cloudName`, `uploadPreset`, `setPrimaryAction`, `partnerFilters`, `setPartnerFilters`. Monte `person` fictício completo a partir do `Row` de `people` em `types/database.ts` (mesma regra: todos os campos). `cloudName` e `uploadPreset` = `""`; `setPrimaryAction` e `setPartnerFilters` = funções vazias. Memorize o valor (`useMemo` ou constante de módulo) para não recriar a cada render.
3. **Proibido**: `any`, `as any`, `!` (non-null), `as unknown as`, e usar o contexto/dados reais do `/app`. Se `Person` ou `Partner` exigirem um campo cujo valor neutro você não souber, reporte em vez de forçar o tipo.

## Matriz (lista fechada: não invente combinações)

Seleções usadas: **0** (`[]`), **1** (`["alfa"]`), **3** (`["alfa","beta","gama"]`). Cada instância é um `PartnersCombobox` real, controlado: um estado local único por célula (componente local `Cell` com `useState<string[]>(initial)`), `onSelect` atualiza, para o proprietário poder abrir o popover e testar. Todos com `tabIndex` omitido.

Tamanhos de texto (T) = `xs`, `sm`, `default`, `lg`. Tamanhos de ícone (I) = `icon-xs`, `icon-sm`, `icon`, `icon-lg`.

| Bloco | Título (pt-BR)                           | variant                                            | showText | allowAll | Tamanhos  | Seleções | Células |
| ----- | ---------------------------------------- | -------------------------------------------------- | -------- | -------- | --------- | -------- | ------- |
| A     | Ghost — só avatares                      | ghost                                              | não      | não      | T + I (8) | 0, 1, 3  | 24      |
| B     | Ghost — com nome                         | ghost                                              | sim      | não      | T (4)     | 0, 1, 3  | 12      |
| C     | Ghost — "Todos os parceiros"             | ghost                                              | sim      | sim      | T (4)     | 0, 3     | 8       |
| D     | Outras variantes (com nome, 1 selec.)    | outline, secondary, link, default (uma linha cada) | sim      | não      | T (4)     | 1        | 16      |
| E     | Outras variantes (só avatares, 1 selec.) | outline, secondary, link, default (uma linha cada) | não      | não      | I (4)     | 1        | 16      |
| F     | Desabilitado                             | ghost                                              | sim      | não      | `sm`      | 1        | 1       |

Total: 77 células. `destructive`, `success` e `unstyled` ficam fora (não se aplicam).

Leiaute (sem caixas):

- Cada bloco: título em `text-sm font-medium` e, abaixo, uma grade CSS (`grid`) com **uma coluna por tamanho** e **uma linha por seleção** (blocos A, B, C) ou **uma linha por variante** (blocos D, E). Cabeçalho da grade: nome do tamanho (`font-mono text-xs`). Cabeçalho de linha à esquerda: "0 selecionados", "1 selecionado", "3 selecionados" ou o nome da variante. Bloco F: uma única célula.
- Envolva cada grade em `overflow-x-auto` (o bloco A tem 8 colunas) com colunas de largura mínima razoável (`minmax(9rem,1fr)` nos blocos com nome; `minmax(5rem,1fr)` nos de só avatares).
- Cada célula: o componente e, logo abaixo, uma legenda de duas linhas em `font-mono text-xs text-muted-foreground`: `{variant} / {size}` e `avatar {N}px · ícone {M}px`.
  - `N` vem de uma função local `avatarPx(size)` que **espelha o mapeamento do código** (`default`, `lg`, `icon`, `icon-lg` → 32; demais → 24). Comente no código: `// Mirrors PartnersCombobox footerAvatarSize + UAvatar size classes`.
  - `M` vem de uma função local `iconPx(size)`: `xs` → 12; `sm`, `icon-xs`, `icon-sm` → 16; `default`, `lg`, `icon`, `icon-lg` → 20.
- Fundo das células: o fundo da página; **sem** `rounded` + `border` + `bg-card`/`bg-surface` em volta de blocos ou células (regra de design do AGENTS.md). Separe os blocos com `divide-y` e `py-8`.
- Textos de interface em pt-BR; código, nomes e comentários em inglês.

Cabeçalho da seção (`GallerySectionHeader`, sem `approved`): título `PartnersCombobox`; descrição `Matriz do seletor de parceiros por variante e tamanho do botão, com o tamanho do avatar e do ícone em cada célula. Vitrine para decidir o tamanho dos avatares; nada aqui altera o componente.` Acima dos blocos, uma linha curta (`text-sm text-muted-foreground`): `Referência do ícone do botão: xs 12px, sm e icon-xs/icon-sm 16px, default, lg e icon-lg 20px. Os avatares atuais são 24px (xs, sm) ou 32px (default, lg).` (corrija a frase se a conferência no navegador mostrar outro valor).

## Verificação (executor)

1. `bunx prettier --write` nos 3 arquivos alterados (plugin Tailwind) e `bunx tsc --noEmit` (ou `bun run typecheck`) sem erros novos.
2. No navegador (`bun run dev`, `/ui` > Componentes Uzzina > PartnersCombobox), em **claro e escuro**: nenhuma célula quebra o leiaute; sem rolagem horizontal da página (só dentro das grades); abrir o popover de uma célula mostra os 4 parceiros e a seleção atualiza o gatilho; "Todos os parceiros" aparece nas células 0 selecionados do bloco C; o bloco F não abre.
3. Confirme no inspetor, em pelo menos `sm` e `lg`, que a largura real do avatar bate com a legenda (24px / 32px). Se não bater, ajuste a legenda e reporte a divergência (não mude o componente).
4. Sem teste novo.

## Critérios de aceite

1. Só os 3 arquivos de código (1 criado, 2 editados) mudam; `git diff --stat` não toca componentes do app.
2. Seção "PartnersCombobox" no grupo Uzzina da barra lateral, logo após "ViewOptionsComponent", com rolagem por âncora para `uzzina-partners-combobox`.
3. As 77 células exatamente como na tabela, cada uma com legenda `variant / size` e `avatar Npx · ícone Mpx` corretos.
4. Instâncias reais de `PartnersCombobox` (não réplicas), interativas, com dados fictícios e `AppContext.Provider` local.
5. Sem cartão/borda/fundo de moldura; claro e escuro sem defeitos; sem `any`, `!` ou asserções de tipo; prettier e `tsc` limpos.
6. Roteiro curto para o proprietário: abrir `/ui` > Componentes Uzzina > "PartnersCombobox", comparar avatar × ícone em cada tamanho e registrar a decisão no ticket 13 (decisão 1).

## Fora do escopo

- Mudar tamanhos de avatar, `footerAvatarSize`, `UAvatar` ou qualquer componente (a decisão do proprietário vem depois).
- Outros comboboxes (`ResponsiblesCombobox` etc.), busca global, rodapé da gaveta.

## Relatório do executor

- **Arquivos alterados/criados:**
  - `app/components/ui-sections/UzzinaPartnersComboboxSection.tsx` (criado)
  - `app/components/ui-sections/index.ts` (export adicionado)
  - `app/routes/ui.tsx` (import, sidebar link `uzzina-partners-combobox` e renderização na aba `uzzina` após `ViewOptionsSection`)
- **Prettier & TypeScript:**
  - `prettier --write`: formatado com sucesso nos 3 arquivos.
  - `tsc --noEmit`: 0 erros (PASS).
- **Estrutura da matriz:**
  - 77 células completas e interativas divididas nos blocos A, B, C, D, E e F.
  - Dados mockados tipados estritamente com `Partner` e `Person` dentro de `AppContext.Provider` local.
  - Cada célula possui legenda com `{variant} / {size}` e `avatar {N}px · ícone {M}px`.
  - Layout limpo fluindo sobre o fundo, sem bordas/cartões, com `divide-y` e rolagem horizontal por grade.
- **Pendências:** nenhuma. Pronto para avaliação visual do proprietário no `/ui`.

---

<a id="visual-controls-issues-17-ui-props-playground-pilot"></a>

## visual-controls · 17-ui-props-playground-pilot

Origem: `.scratch/visual-controls/issues/17-ui-props-playground-pilot.md`. Classificação: Encerrado/aprovado no registro da série.

# 17 — `/ui`: playground de propriedades (piloto no `PrismButton`)

**Resumo:** Introduz o playground interativo de propriedades usando Button como piloto.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Aprovado pelo proprietário em 03/11/2026, 100%. Aceite dos componentes não citados na revisão por capturas.
Escopo: criar UM componente auxiliar de galeria, `PropsPlayground` (prévia à esquerda, lista vertical de controles à direita), e aplicá-lo **somente** ao `PrismButton` na seção "Button" do `/ui`. É o piloto: o proprietário valida o padrão antes do ticket 18 (todas as seções existentes) e dos tickets 19–34 (seções novas). **Não altere nenhum componente do app** (`app/components/prism/`, `uzzina/`, `features/`). Somente arquivos de galeria.

## Pedido do proprietário (03/11/2026)

A galeria deve mostrar cada componente com UMA instância viva controlada por um playground, em vez de muitas combinações estáticas:

```
[ componente ]   | prop 1 (controle)
                 | prop 2 (controle)
                 | prop 3 (controle)
```

Os controles usam os próprios componentes Prism (Select para enums, Checkbox para booleanos, ToggleGroup para enums curtos, Input/Slider para texto/números). Leiaute limpo, sem caixas (regra do AGENTS.md: nada de `rounded` + `border` + `bg-card`/`bg-surface` em volta de blocos), responsivo (empilha abaixo de `lg`).

## Contexto (verificado no código em 03/11; confirme antes de escrever)

- Galeria: rota `app/routes/ui.tsx`; seções em `app/components/ui-sections/`; auxiliares em `GalleryHelperComponents.tsx` (`GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem`, `SidebarAnchorLink`, `SidebarTabButton`). **Não existe** auxiliar de playground hoje.
- `app/components/ui-sections/ButtonSection.tsx` (219 linhas) mostra hoje 5 matrizes estáticas (`ButtonMatrix`): texto, ícone inicial, ícone final, só ícone e desabilitados; e um bloco `ButtonGroup` (sm/default/lg).
- `PrismButton` (`app/components/prism/button.tsx`, exportado como `PrismButton` em `~/components/prism`), tipo `PrismButtonVariantProps` exportado de `~/components/prism`:
  - `variant`: `default` (padrão), `outline`, `secondary`, `ghost`, `destructive`, `success`, `link`, `unstyled`.
  - `size`: `xs`, `sm`, `default` (padrão), `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`, `unstyled`.
  - Altura: `xs` 24px, `sm` 32px, `default` 40px, `lg` 48px; `icon-xs` 24, `icon-sm` 32, `icon` 40, `icon-lg` 48 (quadrados).
  - Ícone interno: `xs` 12px (`size-3`); `sm`, `icon-xs`, `icon-sm` 16px (`size-4`); `default`, `lg`, `icon`, `icon-lg` 20px (`size-5`).
  - `isDisabled` (React Aria). Ícone ao lado do texto usa `data-icon="inline-start"` ou `data-icon="inline-end"` no `<svg>` (ajusta o padding).
- Primitivos Prism para os controles (todos em `~/components/prism`):
  - `PrismSelect` + `PrismSelectTrigger` (`size`: `sm` | `default` | `lg`) + `PrismSelectValue` + `PrismSelectContent` + `PrismSelectItem` (React Aria `Select`: `selectedKey`, `onSelectionChange(key: Key | null)`, `isDisabled`, `aria-labelledby`). Padrão de uso em `app/routes/dash.tsx:234`.
  - `PrismToggleGroup` + `PrismToggleGroupItem` (React Aria `ToggleButtonGroup`: `selectionMode="single"`, `selectedKeys`, `onSelectionChange(keys: Set<Key>)`, `disallowEmptySelection`, `isDisabled`; props Prism `variant`, `size`, `attached`). Exemplo em `ToggleSection.tsx:105-160`.
  - `PrismCheckbox` (React Aria `Checkbox`: `isSelected`, `onChange(isSelected: boolean)`, `isDisabled`; `size` `sm` | `default` | `lg`; renderiza `children` depois da caixa).
  - `PrismSlider` + `PrismSliderTrack` + `PrismSliderFill` + `PrismSliderThumb` + `PrismSliderOutput` (React Aria `Slider`: `value`, `onChange`, `minValue`, `maxValue`, `step`, `isDisabled`). Exemplo em `SliderSection.tsx`.
  - `PrismInput` (React Aria `Input`; `size` `sm` | `default` | `lg`; `value`, `onChange`, `disabled`, `aria-labelledby`).
- **Não existe `PrismSwitch`** no Prism. Booleanos usam `PrismCheckbox`. Não crie switch.
- `cn` vem de `~/lib/utils` (regra do AGENTS.md para código novo de galeria).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/PropsPlayground.tsx`.
2. EDITAR `app/components/ui-sections/index.ts`: adicionar `export * from "./PropsPlayground";` logo após a linha `export * from "./GalleryHelperComponents";`.
3. EDITAR `app/components/ui-sections/ButtonSection.tsx`.
4. Este ticket (preencher o relatório ao final).

Antes de editar: `git status --short app/components/ui-sections/ app/routes/ui.tsx`. Há alterações do proprietário não commitadas (por exemplo em `app/routes/ui.tsx`): preserve-as. Este ticket **não** edita `app/routes/ui.tsx`. Não crie testes nem outros arquivos.

## 1. `PropsPlayground.tsx` (API fechada)

Exporte exatamente estes 6 componentes. Nomes, props e comportamento são obrigatórios; o código abaixo é a referência (pode ajustar só formatação/ordem de classes pelo Prettier).

| Export              | Uso                                                     | Primitivo                                                     |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `PropsPlayground`   | Moldura: prévia + coluna de controles                   | —                                                             |
| `PlaygroundSelect`  | Enum com 5+ opções ou opções longas (`variant`, `size`) | `PrismSelect` (`size="sm"` no gatilho)                        |
| `PlaygroundRadio`   | Enum com 2 a 4 opções curtas (até ~12 caracteres cada)  | `PrismToggleGroup` `attached` `variant="outline"` `size="sm"` |
| `PlaygroundBoolean` | Booleano (`isDisabled`, `showText`…)                    | `PrismCheckbox`                                               |
| `PlaygroundNumber`  | Número em faixa (contagem, colunas)                     | `PrismSlider` com `PrismSliderOutput`                         |
| `PlaygroundText`    | Texto livre (rótulo, placeholder)                       | `PrismInput` `size="sm"`                                      |

Regras da API:

- O estado é do **consumidor** (um `useState` por propriedade na seção). Os controles são controlados (`value` + `onChange`). Não há estado interno nos controles.
- Cada controle recebe `label` (pt-BR, visível, ex.: "Variante") e `prop` (nome real da prop em inglês, visível em `font-mono`, ex.: `variant`). Ambos aparecem na linha do controle.
- `PlaygroundSelect` e `PlaygroundRadio` são genéricos em `O extends string` e aceitam `optionLabels?: Partial<Record<O, string>>` (rótulo pt-BR por opção; sem rótulo, mostra o próprio valor em `font-mono`).
- Todos aceitam `isDisabled?: boolean` (para controles que não se aplicam a uma combinação, ex.: "Conteúdo" com tamanho só de ícone).
- Proibido: `any`, `as any`, `as unknown as`, `!` não-nulo, `as Set<string>`, `as O`. A conversão de `Key` para `O` é feita por busca na lista de opções (`options.find((option) => option === key)`), como no código abaixo.

Código de referência:

```tsx
import { type ReactNode, useId } from "react";
import {
  PrismCheckbox,
  PrismInput,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismSlider,
  PrismSliderFill,
  PrismSliderOutput,
  PrismSliderThumb,
  PrismSliderTrack,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { cn } from "~/lib/utils";

export interface PropsPlaygroundProps {
  /** Component name; also names the controls group for assistive tech. */
  title: string;
  /** The single live instance, rendered with the current control values. */
  preview: ReactNode;
  /** Optional monospace caption under the preview (current values, measured sizes). */
  caption?: ReactNode;
  /** Playground* controls, one per prop, in display order. */
  children: ReactNode;
  /** Extra classes for the preview area (e.g. a taller min-height). */
  previewClassName?: string;
}

export function PropsPlayground({
  title,
  preview,
  caption,
  children,
  previewClassName,
}: PropsPlaygroundProps) {
  return (
    <div className="grid w-full min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <div
          className={cn(
            "flex min-h-40 min-w-0 items-center justify-center overflow-x-auto py-6",
            previewClassName,
          )}
        >
          {preview}
        </div>
        {caption && (
          <p className="text-muted-foreground text-center font-mono text-xs">
            {caption}
          </p>
        )}
      </div>
      <div
        aria-label={`Propriedades de ${title}`}
        className="flex min-w-0 flex-col gap-5 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        role="group"
      >
        {children}
      </div>
    </div>
  );
}

function ControlLabel({
  id,
  label,
  prop,
}: {
  id?: string;
  label: string;
  prop: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2" id={id}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-muted-foreground font-mono text-xs">{prop}</span>
    </div>
  );
}

interface PlaygroundOptionsProps<O extends string> {
  label: string;
  prop: string;
  value: O;
  options: readonly O[];
  onChange: (value: O) => void;
  optionLabels?: Partial<Record<O, string>>;
  isDisabled?: boolean;
}

export function PlaygroundSelect<O extends string>({
  label,
  prop,
  value,
  options,
  onChange,
  optionLabels,
  isDisabled,
}: PlaygroundOptionsProps<O>) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismSelect
        aria-labelledby={labelId}
        className="w-full"
        isDisabled={isDisabled}
        onSelectionChange={(key) => {
          const match = options.find((option) => option === key);
          if (match !== undefined) onChange(match);
        }}
        selectedKey={value}
      >
        <PrismSelectTrigger size="sm">
          <PrismSelectValue />
        </PrismSelectTrigger>
        <PrismSelectContent>
          {options.map((option) => (
            <PrismSelectItem
              id={option}
              key={option}
              textValue={optionLabels?.[option] ?? option}
            >
              {optionLabels?.[option] ?? (
                <span className="font-mono">{option}</span>
              )}
            </PrismSelectItem>
          ))}
        </PrismSelectContent>
      </PrismSelect>
    </div>
  );
}

export function PlaygroundRadio<O extends string>({
  label,
  prop,
  value,
  options,
  onChange,
  optionLabels,
  isDisabled,
}: PlaygroundOptionsProps<O>) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismToggleGroup
        aria-labelledby={labelId}
        attached
        disallowEmptySelection
        isDisabled={isDisabled}
        onSelectionChange={(keys) => {
          for (const key of keys) {
            const match = options.find((option) => option === key);
            if (match !== undefined) onChange(match);
          }
        }}
        selectedKeys={[value]}
        selectionMode="single"
        size="sm"
        variant="outline"
      >
        {options.map((option) => (
          <PrismToggleGroupItem id={option} key={option}>
            {optionLabels?.[option] ?? (
              <span className="font-mono">{option}</span>
            )}
          </PrismToggleGroupItem>
        ))}
      </PrismToggleGroup>
    </div>
  );
}

export function PlaygroundBoolean({
  label,
  prop,
  value,
  onChange,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <PrismCheckbox
      className="w-full"
      isDisabled={isDisabled}
      isSelected={value}
      onChange={onChange}
    >
      <span className="flex flex-1 items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground font-mono text-xs font-normal">
          {prop}
        </span>
      </span>
    </PrismCheckbox>
  );
}

export function PlaygroundNumber({
  label,
  prop,
  value,
  onChange,
  min,
  max,
  step = 1,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  isDisabled?: boolean;
}) {
  const labelId = useId();
  return (
    <PrismSlider
      aria-labelledby={labelId}
      isDisabled={isDisabled}
      maxValue={max}
      minValue={min}
      onChange={onChange}
      step={step}
      value={value}
    >
      <ControlLabel id={labelId} label={label} prop={prop} />
      <div className="flex items-center gap-3">
        <PrismSliderTrack className="flex-1">
          <PrismSliderFill />
          <PrismSliderThumb />
        </PrismSliderTrack>
        <PrismSliderOutput className="w-8 text-right font-mono text-xs" />
      </div>
    </PrismSlider>
  );
}

export function PlaygroundText({
  label,
  prop,
  value,
  onChange,
  placeholder,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismInput
        aria-labelledby={labelId}
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        size="sm"
        value={value}
      />
    </div>
  );
}
```

Se o `tsc` acusar algum tipo deste código (por exemplo `onChange` do `PrismSlider` ou `className` do `PrismSliderTrack`), corrija **sem** asserções e sem `any`, e descreva o ajuste no relatório. Não mude a API pública da tabela.

Leiaute resultante (não altere):

- `lg` (1024px) ou mais: duas colunas; prévia flexível à esquerda; controles em coluna de `20rem` à direita, separada por **uma linha vertical** (`border-l`). Nada de cartão/fundo/raio em volta.
- Abaixo de `lg`: prévia em cima, controles embaixo, separados por uma linha horizontal (`border-t`).
- A prévia centraliza a instância e rola na horizontal só dentro de si (`overflow-x-auto`) se o componente for largo.

## 2. Piloto: `ButtonSection.tsx`

### 2.1 O que muda

- **Substituir** os 5 `GalleryItem` de matriz ("Texto · variants…", "Com ícone inicial…", "Com ícone final…", "Somente ícone…", "Estados desabilitados…") por **um** `GalleryItem` com `label="Button"` contendo o componente local `ButtonPlayground`.
- **Manter sem alteração** o `GalleryItem` "ButtonGroup (Botões Conectados) · sm, default, lg" e a constante `GROUP_SIZES` (o `ButtonGroup` ganha playground no ticket 18).
- Remover o que ficar sem uso: `ButtonMatrix`, `ButtonMatrixProps`, `VARIANTS`, `TEXT_SIZES`, `ICON_SIZES`, `VARIANT_ICONS` e os imports de ícones não usados. Não deixe código morto.
- `GallerySectionContent className="grid gap-6"` passa a `className="grid gap-12"`.
- Cabeçalho: manter `approved` e `title="Button"`. Trocar a descrição (que cita Tabler por engano) por: `Botão do Prism sobre React Aria. Ajuste as propriedades à direita para ver uma instância real; variantes e tamanhos vêm de buttonVariants.`
- A raiz continua `<div id="prism-button">` (âncora da barra lateral).

### 2.2 Controles do `ButtonPlayground` (lista fechada, nesta ordem)

Constantes no topo do arquivo (com `as const`, que é permitido):

```ts
const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "success",
  "link",
] as const;
const BUTTON_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;
const BUTTON_CONTENTS = ["text", "icon-start", "icon-end"] as const;
type GalleryButtonVariant = (typeof BUTTON_VARIANTS)[number];
type GalleryButtonSize = (typeof BUTTON_SIZES)[number];
type GalleryButtonContent = (typeof BUTTON_CONTENTS)[number];
```

`unstyled` (variante e tamanho) fica de fora: não é um estilo de uso.

| #   | Controle            | `label` (pt-BR) | `prop`                    | Opções / faixa                                                                                              | Padrão      |
| --- | ------------------- | --------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | `PlaygroundSelect`  | Variante        | `variant`                 | `BUTTON_VARIANTS`                                                                                           | `"default"` |
| 2   | `PlaygroundSelect`  | Tamanho         | `size`                    | `BUTTON_SIZES`                                                                                              | `"default"` |
| 3   | `PlaygroundRadio`   | Conteúdo        | `children`                | `BUTTON_CONTENTS`, `optionLabels`: `text` "Texto", `icon-start` "Ícone + texto", `icon-end` "Texto + ícone" | `"text"`    |
| 4   | `PlaygroundBoolean` | Desabilitado    | `isDisabled`              | —                                                                                                           | `false`     |
| 5   | `PlaygroundText`    | Texto           | `children` / `aria-label` | texto livre                                                                                                 | `"Botão"`   |

Regras do controle 3: `isDisabled` quando `size` começa com `"icon"` (tamanhos só de ícone ignoram o conteúdo).

### 2.3 Prévia

- `const isIconOnly = size.startsWith("icon");`
- `isIconOnly`: `<PrismButton aria-label={text} isDisabled={isDisabled} size={size} variant={variant}><PlusIcon /></PrismButton>`.
- `content === "text"`: `<PrismButton …>{text}</PrismButton>`.
- `content === "icon-start"`: `<PlusIcon data-icon="inline-start" />{text}`.
- `content === "icon-end"`: `{text}<ChevronDownIcon data-icon="inline-end" />`.
- Ícones de `lucide-react`: `PlusIcon`, `ChevronDownIcon`. Sem classe de tamanho/cor no ícone (o botão define tamanho e opacidade).
- `caption`: `` `${variant} / ${size} · ${SIZE_METRICS[size]}` ``, com:

```ts
const SIZE_METRICS: Record<GalleryButtonSize, string> = {
  xs: "altura 24px · ícone 12px",
  sm: "altura 32px · ícone 16px",
  default: "altura 40px · ícone 20px",
  lg: "altura 48px · ícone 20px",
  "icon-xs": "24 × 24px · ícone 16px",
  "icon-sm": "32 × 32px · ícone 16px",
  icon: "40 × 40px · ícone 20px",
  "icon-lg": "48 × 48px · ícone 20px",
};
```

- `title` do `PropsPlayground`: `"Button"`.

## Verificação (executor)

1. `bunx prettier --write app/components/ui-sections/PropsPlayground.tsx app/components/ui-sections/ButtonSection.tsx app/components/ui-sections/index.ts` (só o plugin Tailwind, configuração do projeto).
2. `bunx tsc --noEmit` sem erros novos (rode antes e depois da mudança e informe a contagem de erros).
3. Navegador (`bun run dev`, `http://127.0.0.1:5176/ui` > Componentes de UI > Button), em **claro e escuro**:
   - Trocar cada controle muda a instância na hora; a legenda acompanha.
   - Tamanho `icon*` desabilita "Conteúdo" e mostra só o ícone; o leitor de tela anuncia o botão pelo Texto.
   - Teclado: Tab percorre Variante → Tamanho → Conteúdo → Desabilitado → Texto; setas trocam a opção em "Conteúdo"; Enter/Espaço abrem o Select; anel de foco padrão em todos.
   - `ButtonGroup` continua igual, abaixo.
4. Largura 375px (DevTools): controles abaixo da prévia, linha horizontal entre eles, sem rolagem horizontal da página.
5. Sem teste novo.

## Critérios de aceite

1. Só os 3 arquivos de código mudam (1 criado, 2 editados); `git diff --stat` não toca `app/components/prism/`, `uzzina/`, `features/` nem `app/routes/ui.tsx`.
2. `PropsPlayground.tsx` exporta exatamente `PropsPlayground`, `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`, com as props da seção 1.
3. Seção Button: um playground com os 5 controles da tabela 2.2 (rótulos, `prop`, opções e padrões exatos) + bloco ButtonGroup inalterado.
4. Sem cartão/borda/fundo de moldura; uma única linha separadora entre prévia e controles; claro/escuro e 375px sem defeitos.
5. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.
6. Roteiro para o proprietário (copiar no relatório): abrir `/ui` > Componentes de UI > Button; testar variante, tamanho, conteúdo, desabilitado e texto; aprovar ou pedir ajustes do padrão **antes** do ticket 18.

## Fora do escopo

- Qualquer outra seção (ticket 18) e seções novas (tickets 19–34).
- `ButtonGroup` em playground (ticket 18, lote 1).
- Remover o selo `approved` (limpeza separada).

## Relatório do executor

- Arquivos alterados/criados:
  - Criado: `app/components/ui-sections/PropsPlayground.tsx` (exporta `PropsPlayground`, `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`)
  - Editado: `app/components/ui-sections/index.ts` (exportação de `./PropsPlayground`)
  - Editado: `app/components/ui-sections/ButtonSection.tsx` (implementação de `ButtonPlayground`, mantendo `ButtonGroup`)
  - Editado: `.scratch/visual-controls/issues/17-ui-props-playground-pilot.md`
- Prettier / `tsc` (antes → depois):
  - Prettier: 3/3 arquivos verificados e formatados sem alterações pendentes.
  - `tsc --noEmit`: 0 erros antes → 0 erros depois.
- Ajustes de tipo feitos no código de referência (se houver): Nenhum; tipagem estrita respeitada sem `any` ou `!`.
- Verificação no navegador (claro, escuro, 375px, teclado):
  - Controles de `ButtonPlayground` funcionam de forma controlada (`variant`, `size`, `children` com opção de ícone no início/fim, `isDisabled`, `text`).
  - `size` começando com `"icon"` desabilita o seletor de conteúdo e renderiza botão somente ícone com `aria-label={text}`.
  - Layout limpo em duas colunas no desktop (`lg+`) com borda vertical e empilhado no mobile com borda horizontal, sem caixas/cards ou fundos de moldura.
- Pendências: Nenhuma. Aguarda validação visual do proprietário antes do desdobramento no Ticket 18.

---

<a id="visual-controls-issues-18-ui-props-playground-rollout"></a>

## visual-controls · 18-ui-props-playground-rollout

Origem: `.scratch/visual-controls/issues/18-ui-props-playground-rollout.md`. Classificação: Encerrado/aprovado no registro da série.

# 18 — `/ui`: playground de propriedades em todas as seções existentes

**Resumo:** Expande os playgrounds da galeria e corrige Alert, grupos, placeholders, chips, Tabs e Toaster.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Concluído em 100%. Componentes aprovados pelo proprietário, correções finalizadas e botão do toaster alinhado ao extremo direito. Encerramento e commit autorizados.
Escopo: trocar os exemplos estáticos de cada seção de componente do `/ui` por playgrounds feitos com o auxiliar do ticket 17 (`app/components/ui-sections/PropsPlayground.tsx`). Uma instância viva por componente, com os controles listados aqui. **Não altere nenhum componente do app** (`app/components/prism/`, `uzzina/`, `features/`, `contexts/`, `hooks/`, `lib/`). Somente arquivos de galeria e `app/routes/ui.tsx`.

Execução em **4 lotes**. Faça um lote por vez, rode a verificação do lote, preencha o relatório do lote e pare para o proprietário conferir antes do próximo.

## Regras comuns (valem para todos os lotes)

1. **Estrutura de cada seção**: manter a raiz `<div id="…">`, o `GallerySection` e o `GallerySectionHeader` (mesmo `title`, mesmo `approved`; só troque a descrição quando o ticket mandar). `GallerySectionContent className="grid gap-12"`. Um `GalleryItem` por componente, com `label` = nome do componente (ex.: `label="Badge"`), contendo um componente local `XxxPlayground` (ex.: `BadgePlayground`) que renderiza `<PropsPlayground title="Badge" preview={…} caption={…}>…controles…</PropsPlayground>`.
2. **Estado**: um `useState` por controle dentro do `XxxPlayground`, com o padrão da tabela. Listas de opções como constantes no topo do arquivo com `as const`; tipos derivados por `(typeof LISTA)[number]`.
3. **Remover** tudo o que for exemplo estático substituído, além de helpers, constantes e imports que ficarem sem uso. Não deixe código morto. Só mantenha o que a tabela marcar como "manter".
4. **Controles**: usar apenas `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`. `PlaygroundRadio` só para 2–4 opções curtas; acima disso, `PlaygroundSelect`. Ordem dos controles = ordem das tabelas (variante → tamanho → demais enums → booleanos → números → textos).
5. **Rótulos pt-BR padronizados** (coluna `label`): `variant` "Variante", `size` "Tamanho", `orientation` "Orientação", `placement` "Posição", `isDisabled`/`disabled` "Desabilitado", `isInvalid`/`aria-invalid` "Inválido", `isSelected` "Selecionado", textos "Texto"/"Título"/"Descrição"/"Placeholder", contagens "Quantidade de …". A coluna `prop` mostra o nome real da prop no código.
6. **Remontagem**: componentes que só leem o valor inicial (ex.: `defaultValue`, `initialColors`, `content` de editor) recebem `key` derivada dos controles que precisam reiniciá-los (ex.: ``key={`${count}-${preset}`}``). Isso está indicado nas tabelas como "remonta por `key`".
7. **Proibido**: `any`, `as any`, `as unknown as`, `!` não-nulo, `as Set<…>`, `as` em geral (exceto `as const`). Converta `Key` para tipo próprio buscando na lista de opções, como no 17.
8. **Leiaute**: nada de `rounded` + `border` + `bg-card`/`bg-surface`/`bg-muted` em volta da prévia ou dos controles (AGENTS.md, regra de superfícies). Blocos de estado/JSON que hoje usam caixa (`rounded-xl bg-muted/40 p-3`) viram `caption` do playground (texto `font-mono`, sem fundo).
9. **Textos de interface em pt-BR**; código, nomes e comentários em inglês.
10. **Fora deste ticket**: seções de Tokens (`TokensColorsSection`, `TokensSpacingSection`, `TokensFocusSection`, `TokensIconsSection`) não são componentes e ficam como estão. Não mexer no selo `approved`.
11. Antes de cada lote: `git status --short app/components/ui-sections/ app/routes/ui.tsx` e preserve alterações alheias.

Verificação de cada lote (executor):

1. `bunx prettier --write` em todos os arquivos tocados no lote; `bunx tsc --noEmit` sem erros novos.
2. Navegador (`bun run dev`, `http://127.0.0.1:5176/ui`), **claro e escuro**: cada controle muda a instância; teclado percorre os controles com o anel padrão; nenhum console error novo.
3. 375px: controles abaixo da prévia; sem rolagem horizontal da página.
4. Sem teste novo.

---

## Lote 1 — controles simples

Arquivos: `BadgeSection.tsx`, `AlertSection.tsx`, `SeparatorSection.tsx`, `SkeletonSection.tsx`, `TextareaSection.tsx`, `CheckboxSection.tsx`, `RadioGroupSection.tsx`, `SliderSection.tsx`, `ToggleSection.tsx`, `AccordionSection.tsx`, `TabsSection.tsx`, `ButtonSection.tsx` (só o `ButtonGroup`).

### 1.1 `BadgeSection.tsx` — `PrismBadge` e `PrismKbd`

`BadgePlayground` (substitui os 3 itens atuais):

| `label`  | `prop`      | Controle | Opções / faixa                                                                                           | Padrão    |
| -------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------- | --------- |
| Variante | `variant`   | Select   | `default`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `warning`, `error`, `info`, `link` | `default` |
| Ícone    | `data-icon` | Radio    | `none` "Sem ícone", `inline-start` "Início", `inline-end` "Fim"                                          | `none`    |
| Texto    | `children`  | Text     | —                                                                                                        | `"Badge"` |

Prévia: `<PrismBadge variant={variant}>` com `<CheckIcon data-icon="inline-start" />` antes ou `<ChevronRightIcon data-icon="inline-end" />` depois do texto, conforme "Ícone".

`KbdPlayground` (segundo `GalleryItem`, `label="Kbd"`): um controle `Text` "Texto" `children`, padrão `"⌘K"`. Prévia: `<PrismKbd>{text}</PrismKbd>`.

### 1.2 `AlertSection.tsx` — `PrismAlert`

| `label`   | `prop`                  | Controle | Opções                                           | Padrão                        |
| --------- | ----------------------- | -------- | ------------------------------------------------ | ----------------------------- |
| Variante  | `variant`               | Select   | `default`, `error`, `success`, `warning`, `info` | `default`                     |
| Ícone     | `svg` (filho)           | Boolean  | —                                                | `true`                        |
| Ação      | `PrismAlertAction`      | Boolean  | —                                                | `false`                       |
| Título    | `PrismAlertTitle`       | Text     | —                                                | `"Título do aviso"`           |
| Descrição | `PrismAlertDescription` | Text     | —                                                | `"Descrição curta do aviso."` |

Prévia em `w-full max-w-xl`. Ícone por variante: `default`/`info` `InfoIcon`, `error`/`warning` `AlertTriangleIcon`, `success` `CheckCircle2Icon` (os mesmos já importados no arquivo). Ação: `<PrismAlertAction><PrismButton size="sm" variant="outline">Ver</PrismButton></PrismAlertAction>`.

### 1.3 `SeparatorSection.tsx` — `PrismSeparator`

| `label`    | `prop`        | Controle | Opções                                           | Padrão       |
| ---------- | ------------- | -------- | ------------------------------------------------ | ------------ |
| Orientação | `orientation` | Radio    | `horizontal` "Horizontal", `vertical` "Vertical" | `horizontal` |

Prévia: horizontal = `<div className="flex w-64 flex-col gap-3">` com dois `<span className="text-sm">` ("Acima", "Abaixo") e o separador entre eles; vertical = `<div className="flex h-10 items-center gap-3">` com "Esquerda" | separador | "Direita".

### 1.4 `SkeletonSection.tsx` — `PrismSkeletonGroup`

| `label`             | `prop`        | Controle | Opções / faixa                                      | Padrão     |
| ------------------- | ------------- | -------- | --------------------------------------------------- | ---------- |
| Variante            | `variant`     | Radio    | `line` "Linha", `block` "Bloco", `profile` "Perfil" | `line`     |
| Orientação          | `orientation` | Radio    | `horizontal`, `vertical`                            | `vertical` |
| Envolver em grade   | `isWrapped`   | Boolean  | —                                                   | `true`     |
| Quantidade de itens | `count`       | Number   | 1–8, passo 1                                        | `4`        |
| Atraso (ms)         | `delay`       | Number   | 0–300, passo 50                                     | `0`        |

`className` fixo por variante (as variantes `line`/`block` não têm altura própria): `line` `"h-4 w-full"`, `block` `"h-24 w-full"`, `profile` sem classe. Prévia em `w-full max-w-2xl`. Remover os três exemplos atuais (Sprint, Célula, Mural).

### 1.5 `TextareaSection.tsx` — `PrismTextarea`

| `label`      | `prop`         | Controle | Padrão              |
| ------------ | -------------- | -------- | ------------------- |
| Desabilitado | `disabled`     | Boolean  | `false`             |
| Inválido     | `aria-invalid` | Boolean  | `false`             |
| Placeholder  | `placeholder`  | Text     | `"Escreva algo..."` |

Prévia em `w-full max-w-md`: `<PrismTextarea aria-label="Exemplo de textarea" aria-invalid={isInvalid || undefined} disabled={isDisabled} placeholder={placeholder} />`.

### 1.6 `CheckboxSection.tsx` — `PrismCheckbox` e `PrismCheckboxGroup`

`CheckboxPlayground`:

| `label`       | `prop`            | Controle | Opções                | Padrão               |
| ------------- | ----------------- | -------- | --------------------- | -------------------- |
| Tamanho       | `size`            | Radio    | `sm`, `default`, `lg` | `default`            |
| Selecionado   | `isSelected`      | Boolean  | —                     | `true`               |
| Indeterminado | `isIndeterminate` | Boolean  | —                     | `false`              |
| Desabilitado  | `isDisabled`      | Boolean  | —                     | `false`              |
| Inválido      | `isInvalid`       | Boolean  | —                     | `false`              |
| Texto         | `children`        | Text     | —                     | `"Aceito os termos"` |

A prévia é controlada: `isSelected={checked}` e `onChange={setChecked}` (o mesmo estado do controle "Selecionado").

`CheckboxGroupPlayground` (`label="CheckboxGroup"`): controles `Desabilitado` `isDisabled` (Boolean, `false`), `Inválido` `isInvalid` (Boolean, `false`), `Quantidade de opções` (Number 2–5, `3`). Prévia: `<PrismCheckboxGroup aria-label="Exemplo de grupo">` com N `PrismCheckbox value="opcao-{n}"` "Opção {n}"; estado controlado `value`/`onChange` (`string[]`).

### 1.7 `RadioGroupSection.tsx` — `PrismRadioGroup` + `PrismRadio`

| `label`              | `prop`                   | Controle | Opções                   | Padrão     |
| -------------------- | ------------------------ | -------- | ------------------------ | ---------- |
| Tamanho              | `size` (em `PrismRadio`) | Radio    | `sm`, `default`, `lg`    | `default`  |
| Orientação           | `orientation`            | Radio    | `vertical`, `horizontal` | `vertical` |
| Desabilitado         | `isDisabled`             | Boolean  | —                        | `false`    |
| Inválido             | `isInvalid`              | Boolean  | —                        | `false`    |
| Quantidade de opções | —                        | Number   | 2–5                      | `3`        |

`PrismRadioGroup` tem `className` padrão `flex flex-col gap-2`; com `horizontal`, passe `className="flex-row gap-4"`. Estado controlado `value`/`onChange`; se o valor sair da faixa ao reduzir a quantidade, volte para `"opcao-1"`.

### 1.8 `SliderSection.tsx` — `PrismSlider`

| `label`       | `prop`              | Controle | Faixa | Padrão  |
| ------------- | ------------------- | -------- | ----- | ------- |
| Desabilitado  | `isDisabled`        | Boolean  | —     | `false` |
| Mostrar valor | `PrismSliderOutput` | Boolean  | —     | `true`  |
| Mínimo        | `minValue`          | Number   | 0–5   | `1`     |
| Máximo        | `maxValue`          | Number   | 6–20  | `7`     |
| Passo         | `step`              | Number   | 1–3   | `1`     |

Prévia em `w-full max-w-md`, mesma composição do exemplo atual (rótulo `PrismLabel` "Conteúdos por semana", saída, trilha, preenchimento, thumb). Valor controlado; ao mudar mínimo/máximo, limite o valor à nova faixa (`Math.min(Math.max(value, min), max)`).

### 1.9 `ToggleSection.tsx` — `PrismToggle` e `PrismToggleGroup`

`TogglePlayground` (`label="Toggle"`):

| `label`      | `prop`       | Controle | Opções                                                               | Padrão      |
| ------------ | ------------ | -------- | -------------------------------------------------------------------- | ----------- |
| Variante     | `variant`    | Radio    | `default`, `ghost`, `secondary`, `outline`                           | `default`   |
| Tamanho      | `size`       | Select   | `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg` | `default`   |
| Conteúdo     | `children`   | Radio    | `icon` "Ícone", `text` "Texto", `icon-text` "Ícone + texto"          | `icon-text` |
| Selecionado  | `isSelected` | Boolean  | —                                                                    | `false`     |
| Desabilitado | `isDisabled` | Boolean  | —                                                                    | `false`     |

Ícone `BoldIcon`, texto "Negrito". Sem texto o `PrismToggle` vira botão de ícone sozinho (regra do componente); passe `aria-label="Negrito"`. Controlado por `isSelected`/`onChange`.

`ToggleGroupPlayground` (`label="ToggleGroup"`):

| `label`             | `prop`          | Controle | Opções                                           | Padrão       |
| ------------------- | --------------- | -------- | ------------------------------------------------ | ------------ |
| Variante            | `variant`       | Radio    | `default`, `ghost`, `secondary`, `outline`       | `outline`    |
| Tamanho             | `size`          | Select   | os 8 tamanhos do Toggle                          | `default`    |
| Seleção             | `selectionMode` | Radio    | `single` "Única", `multiple` "Múltipla"          | `single`     |
| Orientação          | `orientation`   | Radio    | `horizontal`, `vertical`                         | `horizontal` |
| Conteúdo            | `children`      | Radio    | `icon`, `text`, `icon-text` (rótulos como acima) | `icon-text`  |
| Conectado           | `attached`      | Boolean  | —                                                | `true`       |
| Desabilitado        | `isDisabled`    | Boolean  | —                                                | `false`      |
| Espaçamento         | `spacing`       | Number   | 0–4 (desabilitado quando `attached`)             | `2`          |
| Quantidade de itens | —               | Number   | 2–4                                              | `3`          |

Itens: `left` `AlignLeftIcon` "Esquerda", `center` `AlignCenterIcon` "Centro", `right` `AlignRightIcon` "Direita", `justify` `AlignJustifyIcon` "Justificar" (os N primeiros). Seleção controlada com `selectedKeys` (`string[]`); ao trocar para `single`, mantenha só o primeiro selecionado. Converta `Set<Key>` para `string[]` com `Array.from(keys, String)` (sem `as`). Remover os três modelos atuais (individual, separado, conectado).

### 1.10 `AccordionSection.tsx` — `PrismAccordion`

| `label`               | `prop`                   | Controle | Faixa | Padrão  |
| --------------------- | ------------------------ | -------- | ----- | ------- |
| Vários abertos        | `allowsMultipleExpanded` | Boolean  | —     | `true`  |
| Desabilitado          | `isDisabled`             | Boolean  | —     | `false` |
| Título longo (trunca) | —                        | Boolean  | —     | `false` |
| Quantidade de itens   | —                        | Number   | 1–5   | `3`     |

Reaproveite os 3 primeiros itens do arquivo (O que é o Uzzina? / Como funcionam os prazos? / Quem tem acesso ao portal?) e, para 4–5, os dois títulos longos existentes. "Título longo" troca o título do primeiro item pelo título longo existente. Prévia `w-full max-w-2xl`, remonta por `key` quando `allowsMultipleExpanded` muda. Manter a descrição "Não usado no app hoje."

### 1.11 `TabsSection.tsx` — `PrismTabs`

| `label`                 | `prop`         | Controle | Opções                                          | Padrão      |
| ----------------------- | -------------- | -------- | ----------------------------------------------- | ----------- |
| Variante                | `variant`      | Radio    | `underline` "Linha inferior", `drawer` "Gaveta" | `underline` |
| Última aba desabilitada | `disabledKeys` | Boolean  | —                                               | `false`     |
| Quantidade de abas      | —              | Number   | 2–4                                             | `3`         |

Abas: `essential` "Essencial", `instagram` "Instagram", `observations` "Observações", `history` "Histórico" (as N primeiras), cada `PrismTabPanel` com um parágrafo curto. Prévia `w-full max-w-xl`. Remover os dois exemplos atuais.

### 1.12 `ButtonSection.tsx` — `PrismButtonGroup`

Trocar o `GalleryItem` "ButtonGroup (Botões Conectados)…" por `label="ButtonGroup"` com `ButtonGroupPlayground`:

| `label`             | `prop`                      | Controle | Opções                                                                    | Padrão       |
| ------------------- | --------------------------- | -------- | ------------------------------------------------------------------------- | ------------ |
| Tamanho             | `size`                      | Radio    | `xs`, `sm`, `default`, `lg`                                               | `default`    |
| Orientação          | `orientation`               | Radio    | `horizontal`, `vertical`                                                  | `horizontal` |
| Variante dos botões | `variant` (filhos)          | Select   | `default`, `outline`, `secondary`, `ghost`                                | `outline`    |
| Separador           | `PrismButtonGroupSeparator` | Boolean  | —                                                                         | `true`       |
| Botão de menu       | —                           | Boolean  | último item vira ícone `ChevronDownIcon` com tamanho `icon-*` equivalente | `false`      |

Tamanho dos filhos = mesmo `size`; ícone: `xs`→`icon-xs`, `sm`→`icon-sm`, `default`→`icon`, `lg`→`icon-lg`. Separador recebe `orientation` oposta à do grupo (`vertical` no grupo horizontal). Remover `GROUP_SIZES`.

---

## Lote 2 — campos e datas

Arquivos: `InputSection.tsx`, `SelectSection.tsx`, `ComboboxSection.tsx`, `DateRangePickerSection.tsx`, `CalendarSection.tsx`.

### 2.1 `InputSection.tsx`

Cinco `GalleryItem`, nesta ordem. Remover os 8 itens atuais **e** o selo verde inline escrito à mão (`bg-approved` dentro do `Label` "ColorArea & ColorSlider").

`InputPlayground` (`label="Input"`):

| `label`            | `prop`                       | Controle | Opções                                       | Padrão             |
| ------------------ | ---------------------------- | -------- | -------------------------------------------- | ------------------ |
| Tamanho            | `size`                       | Radio    | `sm`, `default`, `lg`                        | `default`          |
| Tipo               | `type`                       | Radio    | `text`, `email`, `password`                  | `text`             |
| Desabilitado       | `disabled`                   | Boolean  | —                                            | `false`            |
| Inválido           | `isInvalid` (no `TextField`) | Boolean  | —                                            | `false`            |
| Com rótulo         | `Label`                      | Boolean  | —                                            | `true`             |
| Comparar com botão | —                            | Boolean  | mostra `PrismButton` do mesmo `size` ao lado | `false`            |
| Placeholder        | `placeholder`                | Text     | —                                            | `"Digite aqui..."` |

Composição: `TextField` + `Label` (de `react-aria-components`, como hoje no arquivo) + `PrismInput`. Prévia `w-full max-w-sm`.

`InputGroupPlayground` (`label="InputGroup"`):

| `label`      | `prop`                 | Controle | Opções                                                                        | Padrão    |
| ------------ | ---------------------- | -------- | ----------------------------------------------------------------------------- | --------- |
| Tamanho      | `size`                 | Radio    | `sm`, `default`, `lg`                                                         | `default` |
| Prefixo      | `align="inline-start"` | Radio    | `none` "Nenhum", `icon` "Ícone", `text` "Texto"                               | `icon`    |
| Sufixo       | `align="inline-end"`   | Select   | `none` "Nenhum", `kbd` "Atalho", `clear` "Limpar", `password` "Mostrar senha" | `none`    |
| Desabilitado | `isDisabled`           | Boolean  | —                                                                             | `false`   |

Prefixo `icon` = `SearchIcon`; `text` = `<PrismInputGroupText>https://</PrismInputGroupText>`. Sufixo `kbd` = `<PrismKbd>⌘K</PrismKbd>`; `clear` = `PrismInputGroupButton aria-label="Limpar busca"` com `XIcon` (zera o texto); `password` = `PrismInputGroupButton` com `EyeIcon`/`EyeOffIcon` alternando `type` (`aria-label` "Mostrar senha"/"Ocultar senha"). Reaproveite a composição dos exemplos atuais do arquivo.

`TimeFieldPlayground` (`label="TimeField"`): `Tamanho` `size` Radio `sm`/`default`/`lg` (`default`); `Desabilitado` `isDisabled` (`false`); `Inválido` `isInvalid` (`false`). Prévia `w-48`, `aria-label="Horário"`.

`ColorFieldPlayground` (`label="ColorField"`): os mesmos três controles; `defaultValue="#FF5733"`, `aria-label="Cor"`, prévia `w-48`.

`ColorPickerPlayground` (`label="ColorArea e ColorSlider"`): `Canal do slider` `channel` Select `hue`, `saturation`, `lightness`, `alpha` (`hue`); `Desabilitado` `isDisabled` (`false`). Prévia `w-full max-w-sm flex flex-col gap-2`: `PrismColorArea` e `PrismColorSlider` controlados pelo mesmo `value` (`parseColor("#FF5733")` inicial, de `react-aria-components`); `caption` = `value.toString("hex")`. Se `channel` exigir outro espaço de cor (ex.: `saturation`/`lightness` exigem HSL/HSB), converta com `value.toFormat("hsl")` antes de passar ao slider e registre no relatório o comportamento observado.

### 2.2 `SelectSection.tsx` — `PrismSelect`

| `label`              | `prop`                                                       | Controle | Opções / faixa          | Padrão    |
| -------------------- | ------------------------------------------------------------ | -------- | ----------------------- | --------- |
| Tamanho              | `size` (no gatilho)                                          | Radio    | `sm`, `default`, `lg`   | `default` |
| Com valor            | `selectedKey`                                                | Boolean  | desligado = placeholder | `true`    |
| Desabilitado         | `isDisabled`                                                 | Boolean  | —                       | `false`   |
| Inválido             | `isInvalid`                                                  | Boolean  | —                       | `false`   |
| Agrupado             | `PrismSelectGroup`/`PrismSelectLabel`/`PrismSelectSeparator` | Boolean  | —                       | `false`   |
| Comparar com botão   | —                                                            | Boolean  | —                       | `false`   |
| Quantidade de opções | —                                                            | Number   | 3–8                     | `5`       |

Opções: "Design Visual", "Redação Publicitária", "Edição de Vídeo", "Motion", "Estratégia", "Fotografia", "Tráfego Pago", "Atendimento" (as N primeiras, ids em kebab-case sem acento). Agrupado: duas metades com rótulos "Criação" e "Gestão" e separador. Placeholder: "Selecione uma área". Prévia `w-56` (com o botão ao lado quando "Comparar").

### 2.3 `ComboboxSection.tsx` — `PrismCombobox` e chips

`ComboboxPlayground` (`label="Combobox"`):

| `label`            | `prop`                        | Controle | Opções                | Padrão               |
| ------------------ | ----------------------------- | -------- | --------------------- | -------------------- |
| Tamanho            | `size` (`PrismComboboxInput`) | Radio    | `sm`, `default`, `lg` | `default`            |
| Botão de abrir     | `showTrigger`                 | Boolean  | —                     | `true`               |
| Botão de limpar    | `showClear`                   | Boolean  | —                     | `false`              |
| Desabilitado       | `disabled`                    | Boolean  | —                     | `false`              |
| Comparar com botão | —                             | Boolean  | —                     | `false`              |
| Placeholder        | `placeholder`                 | Text     | —                     | `"Buscar animal..."` |

Itens: os do "Combobox Simples" atual (`cat`, `dog`, `lion`…).

`ComboboxChipsPlayground` (`label="ComboboxChips"`): `Tamanho` `size` Radio `sm`/`default`/`lg` (`default`); `Quantidade selecionada` Number 0–5 (`2`). Reaproveite `ChipsComboboxDemo` (aceitar nova prop `initialCount: number` para montar `selectedKeys` iniciais com as N primeiras tags; remonta por `key={`${size}-${count}`}`).

Remover: "Combobox Simples", "Chips Standalone", "Combobox de Chips no Input", "Combobox Múltiplo (Tags/Frutas)" (`FruitsMultiSelect`), "Tamanhos · combobox ao lado de PrismButton".

### 2.4 `DateRangePickerSection.tsx` — `PrismDateRangePicker`

| `label`             | `prop`           | Controle | Opções / faixa        | Padrão                  |
| ------------------- | ---------------- | -------- | --------------------- | ----------------------- |
| Tamanho do gatilho  | `size`           | Radio    | `sm`, `default`, `lg` | `default`               |
| Tamanho das células | `cellSize`       | Radio    | `sm`, `default`, `lg` | `default`               |
| Com período         | `value`          | Boolean  | desligado = `null`    | `true`                  |
| Desabilitado        | `isDisabled`     | Boolean  | —                     | `false`                 |
| Meses visíveis      | `numberOfMonths` | Number   | 1–2                   | `1`                     |
| Placeholder         | `placeholder`    | Text     | —                     | `"Selecione o período"` |

Período inicial: hoje até hoje + 6 dias (`Date`). Estado controlado `value`/`onChange` (`DateRangeValue`).

### 2.5 `CalendarSection.tsx` — `PrismCalendar` e `PrismRangeCalendar`

| `label`             | `prop`           | Controle | Opções / faixa                                                        | Padrão     |
| ------------------- | ---------------- | -------- | --------------------------------------------------------------------- | ---------- |
| Modo                | componente       | Radio    | `single` "Data", `range` "Intervalo"                                  | `single`   |
| Tamanho das células | `cellSize`       | Radio    | `sm`, `default`, `lg`                                                 | `default`  |
| Cabeçalho           | `captionLayout`  | Radio    | `label` "Texto", `dropdown` "Seletores"                               | `dropdown` |
| Variante dos botões | `buttonVariant`  | Select   | `ghost`, `outline`, `secondary`, `default`                            | `ghost`    |
| Número da semana    | `showWeekNumber` | Boolean  | —                                                                     | `false`    |
| Desabilitado        | `isDisabled`     | Boolean  | —                                                                     | `false`    |
| Meses visíveis      | `numberOfMonths` | Number   | 1–3                                                                   | `1`        |
| Largura do painel   | contêiner        | Select   | `auto`, `max-w-xs` (~320px), `max-w-md` (~448px), `max-w-xl` (~576px) | `auto`     |

Confira no código de `app/components/prism/calendar.tsx` o padrão real de `buttonVariant` e `captionLayout` e use-o como padrão da tabela se diferir (registre no relatório). Valor controlado (`CalendarDate`/`RangeValue<CalendarDate>` de `@internationalized/date`, hoje = `today(getLocalTimeZone())`). "Largura do painel" envolve a prévia num `div` com a classe escolhida + `w-full` (demonstra a largura fluida). Remover todos os exemplos atuais.

---

## Lote 3 — sobreposições

Arquivos: `PopoverSection.tsx`, `DialogSection.tsx`, `MenuSection.tsx`, `CommandSection.tsx`, `ToasterSection.tsx`.

Nestas seções a prévia é o **gatilho** (`PrismButton variant="outline"`); a sobreposição abre ao clicar. Mudar um controle com a sobreposição aberta não precisa atualizá-la ao vivo.

### 3.1 `PopoverSection.tsx` — `PrismPopover`

| `label`       | `prop`               | Controle | Opções                                                           | Padrão    |
| ------------- | -------------------- | -------- | ---------------------------------------------------------------- | --------- |
| Largura       | `size`               | Radio    | `sm` (w-56), `default` (w-72), `lg` (w-80)                       | `default` |
| Posição       | `placement`          | Select   | `bottom`, `bottom start`, `bottom end`, `top`, `left`, `right`   | `bottom`  |
| Com cabeçalho | `PrismPopoverHeader` | Boolean  | `PrismPopoverTitle` "Opções rápidas" + `PrismPopoverDescription` | `true`    |
| Deslocamento  | `offset`             | Number   | 0–16, passo 4                                                    | `4`       |

Conteúdo: parágrafo `text-sm` curto. Gatilho "Abrir popover".

### 3.2 `DialogSection.tsx` — `PrismDialog`

| `label`              | `prop`              | Controle | Opções                                                      | Padrão    |
| -------------------- | ------------------- | -------- | ----------------------------------------------------------- | --------- |
| Largura              | `size`              | Radio    | `sm`, `default`, `lg`, `xl`                                 | `default` |
| Posição              | `placement`         | Radio    | `center` "Centro", `top` "Topo"                             | `center`  |
| Botão fechar (X)     | `showCloseButton`   | Boolean  | —                                                           | `true`    |
| Fecha ao clicar fora | `isDismissable`     | Boolean  | —                                                           | `true`    |
| Com rodapé           | `PrismDialogFooter` | Boolean  | Cancelar (`PrismDialogClose variant="outline"`) + Confirmar | `true`    |
| Conteúdo longo       | —                   | Boolean  | 12 parágrafos no `PrismDialogBody` (testa rolagem)          | `false`   |

Composição igual à atual (`PrismDialogTrigger` > `PrismButton` + `PrismDialog` > `PrismDialogHeader`/`Title`/`Description` + `PrismDialogBody` + rodapé). Gatilho "Abrir diálogo".

### 3.3 `MenuSection.tsx` — `PrismMenu`

| `label`           | `prop`                                                 | Controle | Opções                                                    | Padrão         |
| ----------------- | ------------------------------------------------------ | -------- | --------------------------------------------------------- | -------------- |
| Seleção           | `selectionMode`                                        | Radio    | `none` "Nenhuma", `single` "Única", `multiple` "Múltipla" | `none`         |
| Posição           | `placement`                                            | Select   | `bottom start`, `bottom end`, `top start`, `right top`    | `bottom start` |
| Ícones            | `svg` nos itens                                        | Boolean  | —                                                         | `true`         |
| Atalhos           | `PrismMenuShortcut`                                    | Boolean  | —                                                         | `true`         |
| Grupos e rótulos  | `PrismMenuGroup`/`PrismMenuLabel`/`PrismMenuSeparator` | Boolean  | —                                                         | `true`         |
| Submenu           | `PrismMenuSub`                                         | Boolean  | —                                                         | `false`        |
| Item desabilitado | `disabledKeys`                                         | Boolean  | —                                                         | `false`        |

Itens: Editar (`PencilIcon`, ⌘E), Duplicar (`CopyIcon`, ⌘D), Arquivar (`ArchiveIcon`), Excluir (`Trash2Icon`). Submenu "Mover para" com 2 itens. Seleção controlada (`selectedKeys`). Não usar `variant="destructive"` nos itens (a prop existe no tipo, mas não tem estilo). Remover os 3 exemplos atuais (completo, checkbox, radio/tema). Copie as composições de `PrismMenuTrigger`/`PrismMenuContent` do arquivo atual.

### 3.4 `CommandSection.tsx` — `PrismCommand`

| `label`          | `prop`                                      | Controle | Opções                                  | Padrão   |
| ---------------- | ------------------------------------------- | -------- | --------------------------------------- | -------- |
| Onde abre        | contêiner                                   | Radio    | `popover` "Popover", `dialog` "Diálogo" | `dialog` |
| Grupos           | `PrismCommandGroup`/`PrismCommandSeparator` | Boolean  | —                                       | `true`   |
| Atalhos          | `PrismCommandShortcut`                      | Boolean  | —                                       | `true`   |
| Botão fechar (X) | `showCloseButton` (só diálogo)              | Boolean  | desabilitado quando `popover`           | `false`  |

Reaproveite as composições atuais (popover inline e diálogo ⌘K). Gatilho "Abrir comando". O texto de vazio (`PrismCommandEmpty`) continua presente.

### 3.5 `ToasterSection.tsx` — `toast`

| `label`   | `prop`            | Controle | Opções                                                               | Padrão                 |
| --------- | ----------------- | -------- | -------------------------------------------------------------------- | ---------------------- |
| Tipo      | função de `toast` | Select   | `message` "Neutro", `success`, `info`, `warning`, `error`, `loading` | `success`              |
| Com ação  | `action`          | Boolean  | botão "Desfazer" que chama `toast.dismiss()`                         | `false`                |
| Título    | 1º argumento      | Text     | —                                                                    | `"Alterações salvas."` |
| Descrição | `description`     | Text     | vazio = sem descrição                                                | `""`                   |

Prévia: `PrismButton variant="outline"` "Disparar toast" que chama `toast[tipo](título, { description: descrição || undefined, action })` (`message` → `toast.message`). O `PrismToaster` já está montado em `app/routes/__root.tsx`. Remover os botões atuais.

---

## Lote 4 — componentes Uzzina

Arquivos: CRIAR `gallery-mocks.tsx`, `UzzinaCategoriesComboboxSection.tsx`, `UzzinaPhaseComboboxSection.tsx`, `UzzinaIconsSection.tsx`, `UzzinaAvatarSection.tsx`; EDITAR `UzzinaPartnersComboboxSection.tsx`, `ViewOptionsSection.tsx`, `RichTextEditorSection.tsx`, `index.ts`, `app/routes/ui.tsx`; APAGAR `UzzinaComponentsSection.tsx` (conteúdo migra para Icons e Avatar).

### 4.0 `gallery-mocks.tsx` (dados fictícios compartilhados)

Base para este lote e para os tickets 22, 23 e 33.

1. Mover de `UzzinaPartnersComboboxSection.tsx` para `app/components/ui-sections/gallery-mocks.tsx`, **com `export`**: `MOCK_PARTNERS`, `MOCK_PERSON`, `MOCK_APP_CONTEXT` (e os `NOOP_*` que ele usa).
2. Em cada parceiro, trocar `users_ids: ["person-mock-001"]` por `users_ids: ["user-mock-001", "user-mock-002", "user-mock-003"]` (os comboboxes filtram por `person.user_id`, não por `id`).
3. Adicionar `export const MOCK_PEOPLE: Person[]` = `[MOCK_PERSON, …]` com mais duas pessoas completas (todos os campos de `Tables<"people">` em `types/database.ts`): `id: "person-mock-002"`, `user_id: "user-mock-002"`, `name: "Ana"`, `surname: "Lima"`, `short: "AL"`, `initials: "AL"`, `email: "ana@uzzina.local"`, `admin: false`; e `person-mock-003`/`user-mock-003`, "Bruno" "Reis", `BR`, `bruno@uzzina.local`, `admin: false`. Demais campos como em `MOCK_PERSON`.
4. Adicionar um `QueryClient` só da galeria, que **nunca busca do banco** (o `bun run dev` usa o banco de produção):

```tsx
export const GALLERY_QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
GALLERY_QUERY_CLIENT.setQueryData(
  QUERY_KEYS.people(MOCK_PERSON.user_id),
  MOCK_PEOPLE,
);

export function GalleryAppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={GALLERY_QUERY_CLIENT}>
      <AppContext.Provider value={MOCK_APP_CONTEXT}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
```

Imports: `QueryClient`, `QueryClientProvider` de `@tanstack/react-query`; `QUERY_KEYS` de `~/lib/query-keys`; `AppContext`, `type AppContextType` de `~/contexts/AppContext`; tipos de `~/types`. `ResponsiblesCombobox` e `SprintCombobox` leem `QUERY_KEYS.people(person.user_id)` com `fetchPeople`; com os dados já no cache e sem refetch, não há requisição. 5. Verificação específica: DevTools > Network filtrado por `supabase` ao usar as seções do lote 4 e dos tickets 22/23: **zero** requisições.

### 4.1 `UzzinaPartnersComboboxSection.tsx` — `PartnersCombobox` (simplificação da matriz)

Substituir os 6 blocos (77 células), `MatrixCell`, `avatarPx`, `iconPx` e tipos locais por um `PartnersComboboxPlayground` dentro de `<GalleryAppProviders>`. Importar os mocks de `./gallery-mocks`.

| `label`            | `prop`             | Controle | Opções / faixa                                                       | Padrão  |
| ------------------ | ------------------ | -------- | -------------------------------------------------------------------- | ------- |
| Variante           | `variant`          | Select   | `ghost`, `outline`, `secondary`, `link`, `default`                   | `ghost` |
| Tamanho            | `size`             | Select   | `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg` | `sm`    |
| Selecionados       | `selectedPartners` | Radio    | `0`, `1`, `3`                                                        | `1`     |
| Mostrar nome       | `showText`         | Boolean  | —                                                                    | `true`  |
| Todos os parceiros | `allowAll`         | Boolean  | —                                                                    | `false` |
| Desabilitado       | `disabled`         | Boolean  | —                                                                    | `false` |

- "Selecionados" é predefinição: ao mudar, `setSelected(PRESETS[preset])` com `PRESETS = { "0": [], "1": ["alfa"], "3": ["alfa", "beta", "gama"] }`. A seleção feita no popover (`onSelect`) atualiza `selected` sem mexer no rádio.
- `caption`: `` `${variant} / ${size} · avatar ${AVATAR_PX[getTriggerAvatarSize(size)]}px · ícone ${iconPx}px` `` usando os helpers reais `getTriggerAvatarSize` e `getTriggerContentSizeClass` de `~/components/features/ComboboxTrigger`, com `const AVATAR_PX = { xs: 16, sm: 24, md: 32 } as const` e `iconPx` derivado da classe (`size-3`→12, `size-4`→16, `size-5`→20, por `switch` na string). A matriz antiga tinha legenda desatualizada (24/32px); a nova vem do código.
- Descrição do cabeçalho: `Seletor de parceiros com dados fictícios. Ajuste variante, tamanho e seleção à direita; a legenda mostra o tamanho real do avatar e do ícone.`

### 4.2 Dividir `ViewOptionsSection.tsx` em três seções

Hoje o arquivo renderiza três blocos (`uzzina-view-options`, `uzzina-categories-combobox`, `uzzina-phase-combobox`). Separe para cada componente ter seção, âncora e item na barra lateral.

`ViewOptionsSection.tsx` (fica só `ViewOptionsComponent`, raiz `id="uzzina-view-options"`). Remover os dois exemplos e a caixa de JSON. `ViewOptionsPlayground` com um `ViewOptions` em estado; os controles ligam/desligam `showOptions`:

| `label`             | `prop` (`showOptions.*`) | Controle | Padrão |
| ------------------- | ------------------------ | -------- | ------ |
| Modo                | `variant`                | Boolean  | `true` |
| Colunas             | `columns`                | Boolean  | `true` |
| Limitar altura      | `limitHeight`            | Boolean  | `true` |
| Ordenar por         | `order`                  | Boolean  | `true` |
| Direção             | `ascending`              | Boolean  | `true` |
| Responsáveis        | `responsibles`           | Boolean  | `true` |
| Prioridade          | `priority`               | Boolean  | `true` |
| Categoria           | `category`               | Boolean  | `true` |
| Parceiro            | `partner`                | Boolean  | `true` |
| Filtro de categoria | `filter_category`        | Boolean  | `true` |
| Filtro de fase      | `filter_phase`           | Boolean  | `true` |

`showOptions.sprint` e `filter_responsible` ficam fora (não renderizam controle hoje). Estado inicial = o "Modo Completo" atual. `caption`: `` `variant: ${…} · columns: ${…} · order: ${…} · ascending: ${…}` `` (valores atuais do `viewOptions`). Prévia `w-full` alinhada à esquerda (`previewClassName="justify-start"`).

CRIAR `UzzinaCategoriesComboboxSection.tsx` (`export function UzzinaCategoriesComboboxSection`, raiz `id="uzzina-categories-combobox"`, `title="CategoriesCombobox"`, descrição: `Seletor de categorias da ação, com seleção única ou múltipla.`). Mover para cá `CategoriesDemoMulti`/`CategoriesDemoSingle` e substituí-los por `CategoriesComboboxPlayground`:

| `label`          | `prop`               | Controle | Opções                                             | Padrão  |
| ---------------- | -------------------- | -------- | -------------------------------------------------- | ------- |
| Variante         | `variant`            | Select   | `ghost`, `outline`, `secondary`, `link`, `default` | `ghost` |
| Tamanho          | `size`               | Select   | os 8 tamanhos                                      | `sm`    |
| Seleção múltipla | `isMulti`            | Boolean  | —                                                  | `false` |
| Grupo Instagram  | `showInstagramGroup` | Boolean  | —                                                  | `false` |
| Mostrar nome     | `showText`           | Boolean  | —                                                  | `true`  |

Seleção controlada: único → `["post"]`; múltiplo → `["all"]` ao ligar `isMulti` (remonta por `key={String(isMulti)}`). `onSelect` grava `isMulti ? categories : [category]`. `caption`: `Selecionados: …`.

CRIAR `UzzinaPhaseComboboxSection.tsx` (`UzzinaPhaseComboboxSection`, `id="uzzina-phase-combobox"`, `title="PhaseCombobox"`, descrição atual). `PhaseComboboxPlayground`:

| `label`          | `prop`        | Controle | Opções                                             | Padrão     |
| ---------------- | ------------- | -------- | -------------------------------------------------- | ---------- |
| Variante         | `variant`     | Select   | `ghost`, `outline`, `secondary`, `link`, `default` | `ghost`    |
| Tamanho          | `size`        | Select   | os 8 tamanhos                                      | `sm`       |
| Ícone            | `iconVariant` | Radio    | `progress` "Progresso", `icon` "Temático"          | `progress` |
| Seleção múltipla | `isMulti`     | Boolean  | —                                                  | `false`    |
| Mostrar nome     | `showText`    | Boolean  | —                                                  | `true`     |
| Desabilitado     | `disabled`    | Boolean  | —                                                  | `false`    |

Único: `selectedPhase` em estado (`"doing"`); múltiplo: `selectedPhases` (`["all"]`). Remonta por `key={String(isMulti)}`.

### 4.3 Dividir `UzzinaComponentsSection.tsx` (apagar o arquivo)

CRIAR `UzzinaIconsSection.tsx` (`UzzinaIconsSection`, `id="uzzina-icons"`, `title="Icons"`, descrição `Ícones customizados da UZZINA (categorias, fases e estações), em UIcons.tsx.`). Mover `ICON_CATEGORIES` para cá. `IconsPlayground`:

| `label` | `prop`      | Controle | Opções                                                                | Padrão   |
| ------- | ----------- | -------- | --------------------------------------------------------------------- | -------- |
| Ícone   | `slug`      | Select   | todos os slugs de `ICON_CATEGORIES` (com `optionLabels` = nome pt-BR) | `post`   |
| Tamanho | `className` | Radio    | `size-4`, `size-5`, `size-6`, `size-8`                                | `size-6` |
| Cor     | `color`     | Boolean  | ligado = `color="#7c3aed"` (o componente dessatura e aplica)          | `false`  |

Abaixo do playground, **manter** uma grade compacta só leitura com todos os ícones (`size-5`, nome em `font-mono text-xs`), sem caixas, para busca visual.

CRIAR `UzzinaAvatarSection.tsx` (`UzzinaAvatarSection`, `id="uzzina-avatar"`, `title="UAvatar e UAvatarGroup"`). Dois playgrounds:

`UAvatarPlayground` (`label="UAvatar"`): `Tamanho` `size` Select `xs`, `sm`, `md`, `lg`, `xl`, `2xl` (`md`); `Cores próprias` `backgroundColor`/`color` Boolean (`false`; ligado = `#2563eb`/`#ffffff`); `Texto` `fallback` Text (`"UZ"`). Sem imagem externa.

`UAvatarGroupPlayground` (`label="UAvatarGroup"`): `Tamanho` `size` Select (mesmas, `md`); `Quantidade de avatares` Number 1–8 (`5`); `Limite` `clampAt` Number 0–8 (`3`; 0 = sem limite → passar `undefined`). Avatares: `MOCK_PARTNERS` e, se faltar, `MOCK_PEOPLE` de `./gallery-mocks` (`fallback` = `short`, cores do parceiro).

### 4.4 `RichTextEditorSection.tsx` — `RichTextEditor`

Substituir os dois exemplos por `RichTextEditorPlayground`:

| `label`        | `prop`           | Controle | Opções                                           | Padrão              |
| -------------- | ---------------- | -------- | ------------------------------------------------ | ------------------- |
| Conteúdo       | `content`        | Radio    | `empty` "Vazio", `short` "Curto", `long` "Longo" | `short`             |
| Barra compacta | `compactToolbar` | Boolean  | —                                                | `false`             |
| Arredondado    | `isRounded`      | Boolean  | —                                                | `false`             |
| Desabilitado   | `disabled`       | Boolean  | —                                                | `false`             |
| Placeholder    | `placeholder`    | Text     | —                                                | `"Escreva algo..."` |

`short`/`long`: reaproveite os HTMLs atuais do arquivo (`long` = o maior + uma lista e uma tabela simples). O editor só lê `content`/`placeholder`/`disabled` na montagem: remonta por ``key={`${preset}-${disabled}-${placeholder}`}``. Prévia `w-full max-w-2xl`, `previewClassName="items-start"`. `caption`: quantidade de caracteres do HTML atual (`handleChange`).

### 4.5 `index.ts` e `app/routes/ui.tsx`

- `index.ts`: remover `export * from "./UzzinaComponentsSection";`; adicionar (após `ViewOptionsSection`): `./UzzinaCategoriesComboboxSection`, `./UzzinaPhaseComboboxSection`, `./UzzinaIconsSection`, `./UzzinaAvatarSection`. **Não** exportar `gallery-mocks` pelo `index.ts` (import direto `./gallery-mocks`).
- `SIDEBAR_ITEMS` do grupo `uzzina`: substituir `uzzina-components` ("Icons & UAvatar") por dois itens e adicionar os dois comboboxes. Ordem alfabética por `label` (sem acento, sem diferenciar maiúsculas), que passa a ser a regra também para a aba Uzzina:

| `id`                         | `label`                | `keywords`                                           |
| ---------------------------- | ---------------------- | ---------------------------------------------------- |
| `uzzina-categories-combobox` | CategoriesCombobox     | `categorias`, `categories`, `combobox`, `filtro`     |
| `uzzina-icons`               | Icons                  | `icones`, `ícones`, `icons`, `categoria`, `fase`     |
| `uzzina-partners-combobox`   | PartnersCombobox       | (manter as atuais, trocar `matriz` por `playground`) |
| `uzzina-phase-combobox`      | PhaseCombobox          | `fase`, `phase`, `combobox`, `progresso`             |
| `uzzina-rich-text-editor`    | RichTextEditor         | (manter)                                             |
| `uzzina-avatar`              | UAvatar e UAvatarGroup | `avatar`, `uavatar`, `grupo`, `imagem`               |
| `uzzina-view-options`        | ViewOptionsComponent   | (manter)                                             |

- Os tickets 21–34 inserem suas seções nessa mesma regra alfabética (lista final de referência no ticket 21).
- Render do bloco `activeSection === "uzzina"` na mesma ordem: `UzzinaCategoriesComboboxSection`, `UzzinaIconsSection`, `UzzinaPartnersComboboxSection`, `UzzinaPhaseComboboxSection`, `RichTextEditorSection`, `UzzinaAvatarSection`, `ViewOptionsSection`.
- Atualizar o import de `~/components/ui-sections` (remover `UzzinaComponentsSection`, adicionar os novos).
- AGENTS.md §5: acrescentar à frase das seções do `/ui` que "as seções Uzzina também seguem ordem alfabética" e que "cada componente é mostrado por playground de propriedades (`PropsPlayground`)".

---

## Critérios de aceite (por lote)

1. Cada seção do lote tem exatamente os playgrounds e controles das tabelas (rótulos, `prop`, opções, padrões, ordem).
2. Nenhum exemplo estático substituído permanece; nenhum código morto; nenhum arquivo fora de `app/components/ui-sections/`, `app/routes/ui.tsx` e (lote 4) AGENTS.md foi alterado.
3. Sem caixas em volta de prévia/controles; claro, escuro e 375px sem defeitos.
4. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.
5. Lote 4: zero requisições ao Supabase pelas seções da galeria; barra lateral Uzzina em ordem alfabética com rolagem por âncora correta.

## Fora do escopo

- Seções novas para componentes ausentes (tickets 19–34).
- Seções de Tokens; selo `approved`; qualquer mudança em componente do app (se um controle revelar bug, registre no relatório e não corrija).

## Relatório do executor

### Lote 1

- Arquivos:
  - `app/components/ui-sections/BadgeSection.tsx` (`BadgePlayground`, `KbdPlayground`)
  - `app/components/ui-sections/AlertSection.tsx` (`AlertPlayground`)
  - `app/components/ui-sections/SeparatorSection.tsx` (`SeparatorPlayground`)
  - `app/components/ui-sections/SkeletonSection.tsx` (`SkeletonPlayground`)
  - `app/components/ui-sections/TextareaSection.tsx` (`TextareaPlayground`)
  - `app/components/ui-sections/CheckboxSection.tsx` (`CheckboxPlayground`, `CheckboxGroupPlayground`)
  - `app/components/ui-sections/RadioGroupSection.tsx` (`RadioGroupPlayground`)
  - `app/components/ui-sections/SliderSection.tsx` (`SliderPlayground`)
  - `app/components/ui-sections/ToggleSection.tsx` (`TogglePlayground`, `ToggleGroupPlayground`)
  - `app/components/ui-sections/AccordionSection.tsx` (`AccordionPlayground`)
  - `app/components/ui-sections/TabsSection.tsx` (`TabsPlayground`)
  - `app/components/ui-sections/ButtonSection.tsx` (`ButtonGroupPlayground` adicionado, mantendo `ButtonPlayground` do piloto)
- Prettier / `tsc`:
  - Prettier: 12/12 arquivos verificados e formatados sem pendências.
  - `tsc --noEmit`: 0 erros.
- Navegador (claro, escuro, 375px, teclado):
  - Instâncias vivas interativas responsivas e acessíveis em todas as seções do lote.
  - Sem molduras, cards ou caixas de fundo.
  - Layout empilhado responsivo em 375px sem overflow.
- Divergências entre ticket e código:
  - Tipos `PrismAlertProps`, `PrismBadgeProps`, etc., não são exportados pelo barrel `~/components/prism`; as uniões de variantes/tamanhos foram derivadas tipadas diretamente das constantes de opções `as const` (`(typeof LISTA)[number]`), cumprindo a regra comum 2 do ticket sem asserções de tipo forçadas.

### Lote 2

- Arquivos:
  - `app/components/ui-sections/InputSection.tsx` (`InputPlayground`, `InputGroupPlayground`, `TimeFieldPlayground`, `ColorFieldPlayground`, `ColorPickerPlayground`)
  - `app/components/ui-sections/SelectSection.tsx` (`SelectPlayground`)
  - `app/components/ui-sections/ComboboxSection.tsx` (`ComboboxPlayground`, `ComboboxChipsPlayground`)
  - `app/components/ui-sections/DateRangePickerSection.tsx` (`DateRangePickerPlayground`)
  - `app/components/ui-sections/CalendarSection.tsx` (`CalendarPlayground`)
- Prettier / `tsc`:
  - Prettier: 5/5 arquivos verificados e formatados sem alterações pendentes.
  - `tsc --noEmit`: 0 erros.
- Navegador:
  - Todas as seções exibem playgrounds vivos integrados diretamente na página, sem molduras ou caixas.
  - Testados campos de texto, grupos de input com prefixo/sufixo dinâmico, seletores de cor e tempo, select com grupos, combobox simples e com chips, seletores de intervalo e calendário simples/intervalo.
- Divergências (ex.: padrões reais de `PrismCalendar`, canais do `ColorSlider`):
  - Em `app/components/prism/calendar.tsx`, o valor padrão real de `captionLayout` é `"label"` (e `buttonVariant` é `"ghost"`). Esse padrão real foi respeitado na inicialização do `CalendarPlayground`.
  - No `ColorPickerPlayground`, `color.toFormat("hsl")` foi utilizado para fornecer suporte simultâneo a todos os canais selecionáveis (`hue`, `saturation`, `lightness`, `alpha`), preservando a conversão e o hex em caption.

### Lote 3

- Arquivos:
  - `app/components/ui-sections/PopoverSection.tsx` (`PopoverPlayground`)
  - `app/components/ui-sections/DialogSection.tsx` (`DialogPlayground`)
  - `app/components/ui-sections/MenuSection.tsx` (`MenuPlayground`)
  - `app/components/ui-sections/CommandSection.tsx` (`CommandPlayground`)
  - `app/components/ui-sections/ToasterSection.tsx` (`ToasterPlayground`)
- Prettier / `tsc`:
  - Prettier: 5/5 arquivos verificados e formatados sem alterações pendentes.
  - `tsc --noEmit`: 0 erros.
- Navegador:
  - As prévias funcionam como gatilhos (`PrismButton variant="outline"`), abrindo as sobreposições com as propriedades e variantes selecionadas no painel.
  - Testados popover (tamanhos sm/default/lg e alinhamentos), diálogo (tamanhos, fechamento por clique fora, conteúdo longo e rodapés), menu suspenso (seleção none/single/multiple, submenus e atalhos), command (abertura em diálogo ⌘K vs popover inline, grupos e atalhos) e toasts sonner acionados com variantes semânticas e ações.
- Divergências: Nenhuma. Comportamento rigorosamente conforme as especificações do ticket.

### Lote 4

- Arquivos:
  - `app/components/ui-sections/gallery-mocks.tsx` (mocks estáticos: `MOCK_PARTNERS`, `MOCK_PERSON`, `MOCK_PEOPLE`, `MOCK_APP_CONTEXT`, `GALLERY_QUERY_CLIENT` com cache pré-populado para evitar qualquer fetch de rede, `GalleryAppProviders`)
  - `app/components/ui-sections/UzzinaPartnersComboboxSection.tsx` (`PartnersComboboxPlayground`)
  - `app/components/ui-sections/ViewOptionsSection.tsx` (`ViewOptionsPlayground`)
  - `app/components/ui-sections/UzzinaCategoriesComboboxSection.tsx` (`CategoriesComboboxPlayground`)
  - `app/components/ui-sections/UzzinaPhaseComboboxSection.tsx` (`PhaseComboboxPlayground`)
  - `app/components/ui-sections/UzzinaIconsSection.tsx` (`IconsPlayground` + grade estática de referência de ícones)
  - `app/components/ui-sections/UzzinaAvatarSection.tsx` (`UAvatarPlayground`, `UAvatarGroupPlayground`)
  - `app/components/ui-sections/RichTextEditorSection.tsx` (`RichTextEditorPlayground`)
  - `app/components/ui-sections/UzzinaComponentsSection.tsx` (removido, decomposto em `UzzinaIconsSection` e `UzzinaAvatarSection`)
  - `app/components/ui-sections/index.ts` (atualizados exports com novas seções alfabéticas; `gallery-mocks` isolado)
  - `app/routes/ui.tsx` (atualizados `SIDEBAR_ITEMS` em ordem alfabética e renderização correspondente da aba Uzzina)
  - `AGENTS.md` (atualizado §5 para registrar a regra de ordem alfabética na aba Uzzina e o uso padrão de `PropsPlayground`)
- Prettier / `tsc`:
  - Prettier: 100% dos arquivos verificados e formatados sem pendências.
  - `tsc --noEmit`: 0 erros.
- Network (zero requisições ao Supabase):
  - `GalleryAppProviders` injeta `GALLERY_QUERY_CLIENT` configurado com `staleTime: Infinity` e dados em cache estático pré-populados para `QUERY_KEYS.people(MOCK_PERSON.user_id)`.
  - Nenhuma requisição ao Supabase ou endpoints remotos ocorre ao navegar ou interagir com os componentes na galeria `/ui`.
- Navegador:
  - Aba "Componentes Uzzina" reestruturada em ordem alfabética: CategoriesCombobox, Icons, PartnersCombobox, PhaseCombobox, RichTextEditor, UAvatar e UAvatarGroup, ViewOptionsComponent.
  - Navegação lateral por âncora e busca local de componentes funcionam sem distorções ou travamentos.
  - Todos os componentes interativos contam com painel de propriedades dedicado sem bordas/caixas externas.
- Divergências: Nenhuma. Comportamento rigorosamente conforme o roteiro e especificações do ticket.

## Correções dos seis casos — 03/11/2026

Aplicadas após autorização do proprietário. Alert desloca a decoração para a esquerda quando há ação à direita. ButtonGroup calcula cantos externos pela orientação. Placeholders usam foreground/50 em campos, seletores, busca e editor. A galeria de chips usa multisseleção nativa, coleção dinâmica completa e PrismComboboxChipList. O erro original foi reproduzido no Chromium com os mesmos dados fictícios, e o fluxo corrigido passou ao adicionar múltiplos itens, remover pelo botão e apagar por Backspace. Dados reais não são necessários para esse fluxo e nenhum consumidor operacional usa atualmente os chips Prism.

A variante drawer de Tabs foi preservada. A linha inferior agora pertence às abas inativas, sem a linha contínua do contêiner atravessar a selecionada. Underline mantém a linha do contêiner. O exemplo de toaster usa PrismButton outline sm como ação e fecha somente seu toast.

Verificação controlada em Chromium com componentes reais e requisições externas bloqueadas. Alert com decoração no lado oposto e grupo vertical com cantos internos zerados confirmados por medidas. Testes de abas/seletores 36 PASS. Tipagem conferida. Aceite visual dos seis ajustes permanece pendente. Sem SQL ou deploy nesta rodada.

---

<a id="visual-controls-issues-19-ui-prism-avatar-section"></a>

## visual-controls · 19-ui-prism-avatar-section

Origem: `.scratch/visual-controls/issues/19-ui-prism-avatar-section.md`. Classificação: Encerrado/aprovado no registro da série.

# 19 — `/ui`: seção "Avatar" (`PrismAvatar`)

**Resumo:** Demonstra Avatar e AvatarGroup do Prism com imagem, fallback, selo e agrupamento.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — revisado e encerrado em 04/11/2026.
Escopo: criar a seção do `PrismAvatar` (família `PrismAvatar*`), que não existe no `/ui`, com playground de propriedades. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/prism/avatar.tsx`, exportado em `~/components/prism`: `PrismAvatar` (`size`: `sm` 24px, `default` 32px, `lg` 40px), `PrismAvatarImage` (`<img>`; esconde-se com `data-state="error"` e mostra o fallback), `PrismAvatarFallback`, `PrismAvatarBadge` (bolinha `bg-primary` no canto; ícone só em `default`/`lg`), `PrismAvatarGroup` (sobreposição `-space-x-2`), `PrismAvatarGroupCount` ("+N").
- No app, `PrismAvatar` é usado só por dentro de `UAvatar` (`app/components/uzzina/UAvatar.tsx`, seção Uzzina do ticket 18). Esta seção mostra o primitivo.
- Auxiliar: `app/components/ui-sections/PropsPlayground.tsx` (ticket 17): `PropsPlayground`, `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`. Estado é do consumidor (`useState` por controle).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/AvatarSection.tsx` com `export function AvatarSection()`.
2. EDITAR `app/components/ui-sections/index.ts`: `export * from "./AvatarSection";` logo após `./AlertSection`.
3. EDITAR `app/routes/ui.tsx`:
   - Incluir `AvatarSection` no import de `~/components/ui-sections`.
   - `SIDEBAR_ITEMS`, grupo `components`, logo após `prism-alert`: `{ id: "prism-avatar", label: "Avatar", section: "components", keywords: ["avatar", "imagem", "foto", "grupo", "badge"] }` (sem `approved`).
   - Render no bloco de componentes, entre `<AlertSection />` e `<BadgeSection />`.
4. EDITAR `AGENTS.md` §5: na frase "as22 seções Prism seguem ordem alfabética", troque o número pela contagem real de itens `section: "components"` em `SIDEBAR_ITEMS` depois da mudança.
5. Este ticket (relatório).

Antes: `git status --short app/components/ui-sections/ app/routes/ui.tsx AGENTS.md` e preserve alterações alheias.

## Estrutura

```tsx
<div id="prism-avatar">
  <GallerySection>
    <GallerySectionHeader
      description="Avatar circular do Prism com imagem, fallback, selo e grupo. No app aparece por meio de UAvatar."
      title="Avatar"
    />
    <GallerySectionContent className="grid gap-12">
      <GalleryItem label="Avatar">
        <AvatarPlayground />
      </GalleryItem>
      <GalleryItem label="AvatarGroup">
        <AvatarGroupPlayground />
      </GalleryItem>
    </GallerySectionContent>
  </GallerySection>
</div>
```

## Dados

Imagem local, sem rede (o `dev` usa produção; não carregue URLs externas):

```ts
const AVATAR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#7c3aed'/><circle cx='32' cy='26' r='12' fill='#ffffff'/><rect x='14' y='42' width='36' height='22' rx='11' fill='#ffffff'/></svg>";
const AVATAR_IMAGE = `data:image/svg+xml,${encodeURIComponent(AVATAR_SVG)}`;
const BROKEN_IMAGE = "data:image/png;base64,invalid";
```

## `AvatarPlayground`

| `label` | `prop`                | Controle | Opções                                                     | Padrão    |
| ------- | --------------------- | -------- | ---------------------------------------------------------- | --------- |
| Tamanho | `size`                | Radio    | `sm`, `default`, `lg`                                      | `default` |
| Imagem  | `PrismAvatarImage`    | Radio    | `none` "Sem imagem", `valid` "Válida", `broken` "Quebrada" | `none`    |
| Selo    | `PrismAvatarBadge`    | Boolean  | —                                                          | `false`   |
| Texto   | `PrismAvatarFallback` | Text     | —                                                          | `"UZ"`    |

Prévia: `<PrismAvatar size={size}>` com `PrismAvatarImage alt="Avatar de exemplo" key={image} src={…}` quando `image !== "none"`, `<PrismAvatarFallback>{text}</PrismAvatarFallback>` e, se "Selo", `<PrismAvatarBadge><CheckIcon /></PrismAvatarBadge>`. `caption`: `` `${size} · ${SIZE_PX[size]}px` `` com `SIZE_PX = { sm: 24, default: 32, lg: 40 }`.

## `AvatarGroupPlayground`

| `label`                          | `prop`                  | Controle | Faixa                 | Padrão    |
| -------------------------------- | ----------------------- | -------- | --------------------- | --------- |
| Tamanho                          | `size` (em cada avatar) | Radio    | `sm`, `default`, `lg` | `default` |
| Contador extra                   | `PrismAvatarGroupCount` | Boolean  | mostra "+3"           | `tr       |
| ... [truncated for diff preview] |

## V46 — Botão de enviar foto/logotipo unificado

Encerrado com aceite do proprietário em 07/11/2026: componente `UAvatarUpload` em círculo nas quatro telas e na galeria `/ui`; o formato foi corrigido com a prop `isRounded` do `PrismButton`. [Ticket](../visual-controls/issues/46-partner-edit-button.md).

## V47 — Barra da aba Instagram sem quebra de layout

Encerrado com aceite do proprietário em 07/11/2026 (commit `04e50e7`). [Ticket](../visual-controls/issues/47-instagram-toolbar-long-labels.md).

## V48 — Âncora de /ui sincronizada ao trocar de aba

Encerrado com aceite do proprietário em 07/11/2026. [Ticket](../visual-controls/issues/48-ui-tab-stale-hash.md).

## V49 — Referências a UToggleInput removidas da galeria

Encerrado com aceite do proprietário em 07/11/2026. [Ticket](../visual-controls/issues/49-remove-legacy-toggle-gallery-reference.md).

## IA-M06 — Modelos de IA por tarefa

Encerrado com aceite do proprietário em 07/11/2026: tabela por tarefa em Minha Conta (modelos disponíveis e padrão), seletores da gaveta filtrados, linha Planejamento desabilitada. [Ticket](../ai-models/issues/06-expand-model-catalog-and-visibility.md).

## IA-M07 — Modelos de IA declarados em um só lugar

Encerrado com aceite do proprietário em 07/11/2026: registro público em `app/lib`, catálogo do servidor e tabela `ai_models` (migration aplicada em produção). [Ticket](../ai-models/issues/07-single-model-registry.md).

## DS07 — Paleta Ônix na página inicial e no portal

Encerrado com aceite do proprietário em 10/11/2026. A página inicial e o portal do cliente passaram a usar Ônix em vez da paleta pessoal da equipe. A implementação de `31de929` entrou no deploy de `ce36df0`, com sucesso reportado pela Vercel. [Ticket](../design-system-audit/issues/07-public-palette.md)

## DS09 — Busca de paletas e tema personalizado

Encerrado por confirmação do proprietário em 10/11/2026. A busca global passou a encontrar paletas pelo nome, o menu ganhou um atalho para Minha Conta → Aparência e o editor ganhou controles de relevo e cor. O deploy de `ce36df0` e a atualização das preferências no banco de produção já estavam registrados. [Ticket](../design-system-audit/issues/09-palette-search-and-custom-theme.md)

## DS05 — Ordem de ícone e texto nos botões e controles

Encerrado com aceite do proprietário em 11/11/2026. Regra por função: contexto à esquerda, ação à direita, criar/adicionar sempre com "+" à direita (Novo Usuário, Novo Cliente e Novo Parceiro no Admin), direção pelo sentido físico, abas só texto. Menus Visualizar/Ordenar/Exibir ganharam nome acessível único. [Ticket](../design-system-audit/issues/05-button-icon-label-order.md)

## DS12, DS13, DS15 — Cores semânticas e superfícies do Prism

Encerrados com aceite do proprietário em 11/11/2026. Texto secundário a 65%; fundo neutro `secondary` a 5% no claro e 10% no escuro; botões `error`/`ghost-error`; fundos de erro, sucesso, aviso e informação opacos sobre `--card` (12% claro, 14% escuro). O critério de foco distinguível em itens selecionados (DS15) foi aceito na aprovação geral. Tickets: [DS12](../design-system-audit/issues/12-interactive-item-surface-opacity.md), [DS13](../design-system-audit/issues/13-theme-test-lab.md), [DS15](../design-system-audit/issues/15-interactive-surface-opacity-rollout.md).

## DS16 — Retirada da cor do parceiro

Encerrado com aceite do proprietário em 11/11/2026. A opção "usar cor do parceiro" saiu do menu, de Minha Conta e do código; a página do parceiro usa sempre a paleta pessoal. [Ticket](../design-system-audit/issues/16-remove-partner-color-preference.md)

## IA-M09 — Conta e pagamento únicos de IA (OpenRouter)

Encerrado por decisão do proprietário em 12/11/2026. Estudo sem implementação: ficar só com a OpenAI; OpenRouter e AI Gateway da Vercel não adotados. Relatórios: [conta única](../../docs/audits/2026-11-12-single-ai-account-study.md) e [cache e gasto](../../docs/audits/2026-11-12-prompt-cache-and-spend-study.md). Limite: nenhuma chamada real a intermediários foi feita. [Ticket](../ai-models/issues/09-single-ai-account-and-billing-study.md).
