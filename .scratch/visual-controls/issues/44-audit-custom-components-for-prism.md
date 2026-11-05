# 44 — Investigar componentes personalizados substituíveis por Prism

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para conferir os equivalentes Prism e as decisões pendentes do estudo.
- **Anthropic** — Claude Haiku 5.5, para conferir os equivalentes Prism e as decisões pendentes do estudo.
- **Google** — Gemini 3.8 Flash, para conferir os equivalentes Prism e as decisões pendentes do estudo.

**Resumo:** Mapear controles e estilos próprios que repetem recursos Prism e propor sua padronização para dar consistência à interface.

**What to build:** um parecer executável, por componente e consumidor real, indicando onde substituir implementação/estilo personalizado por PrismButton, PrismBadge, PrismInput, PrismTabs e demais primitivos existentes. A entrega é investigação com propostas priorizadas; não iniciar uma migração geral nesta rodada.

**Blocked by:** nenhum. Ler o estado atual e coordenar um escritor por checkout.

**Status:** encerrado como estudo em 05/11/2026, com aceite do proprietário. A execução continua no DS01 e a conferência visual no DS02.

- [x] Inventariar controles HTML manuais, wrappers, componentes próprios, cópias e overrides visuais que reproduzem primitivos Prism. Localizar usos operacionais, não apenas exemplos.
- [x] Produzir matriz com componente atual, usos, personalização observada, equivalente Prism disponível, diferença funcional/acessível, risco e proposta concreta. Distinguir substituição direta de adaptação necessária.
- [x] Priorizar tamanhos, variantes, cores semânticas, tipografia, foco, disabled/loading, layout de popovers e controles criados sem necessidade. Favorecer props/tokens padrão; não recriar o desenho do Prism com classes locais.
- [x] Separar apresentação arbitrária de regras de negócio, dados, FormData, teclado e contratos dos consumidores. Padronizar não significa apagar comportamento exigido. Aproveitar o estudo V36: UAvatar já compõe Prism e possui adaptações reais; não presumir que todo prefixo U deve desaparecer.
- [x] Comparar estados normal/hover/foco/desabilitado/carregando e tamanhos nos temas e larguras pertinentes. Registrar o que foi observado no navegador e o que é somente análise de código; não certificar visual por typecheck.
- [x] Propor lotes pequenos com benefício claro, dependências reais, critérios de aceite e componentes legados removíveis. Evitar novos arquivos que só reexportam o nome antigo ou wrappers vazios.
- [x] Registrar exceções justificadas e decisões visuais que precisam do proprietário; não introduzir variantes/tamanhos extras sem necessidade concreta. Não alterar APIs, fluxos, banco ou regras de negócio para forçar uma substituição.
- [x] Entregar recomendação priorizada e roteiro curto de validação por lote. Atualizar ticket e lista geral. Nenhuma refatoração, teste amplo por rotina ou publicação nesta entrega de estudo.

## Resultado do estudo e execução dos lotes (05/11/2026)

- **Relatório completo atualizado:** [docs/audits/2026-11-05-v44-custom-components-prism-audit.md](../../../docs/audits/2026-11-05-v44-custom-components-prism-audit.md).
- **Lotes A, B e C executados localmente:**
  - **Lote A (Notificações, gaveta, portal e calendário):** `Header.tsx` e `NotificationsPage.tsx` padronizados com `PrismButton link xs` e `variant="unstyled"`; `EssentialsTab.tsx` com `size={isIDVisible ? "xs" : "icon-sm"}` e `PrismSkeleton`; `admin/partner/$slug.tsx` com `PrismSkeleton`; `dash/action/$id.tsx` com `PrismBadge variant="secondary"` e `CloudinaryUpload` com `variant`/`size` explícitos; `CalendarDayCell.tsx` botão `+` com `PrismButton default icon-xs rounded-full`; `UColorPickerDropdown.tsx` formato em `size="sm"`; comentários limpos em `ContentReorderDialog.tsx`.
  - **Lote B (Ajuda, cartões e calendário do cliente):** `HelpPage.tsx` com `PrismKbd` e `PrismSelect` mobile; `ClientCalendar.tsx` com navegação `size="icon-sm"` e cartões com `PrismButton unstyled`; foco por teclado adicionado a `UAdminItemCard.tsx`, `UAvatarSelector.tsx` (e `border-border` semântico) e `LeadCard.tsx`.
  - **Lote C (Formulários Admin, Auth e Minha Conta):** `AdminUserForm.tsx` com `PrismLabel`, `PrismInputGroup` e estado `selectedAreas` sincronizado com os hidden inputs; botões "Remover imagem/foto" em `admin/client/$userId.tsx`, `admin/partner/$slug.tsx` e `profile.tsx` com `PrismButton link xs`; telas de autenticação (`login.tsx`, `reset-password.tsx`, `forgot-password.tsx`, `dash/login.tsx`) com `PrismLabel` e `PrismInputGroupButton`; desempacotadas as molduras de cartão em `UPreferenceSwitch.tsx` e `CustomThemePanel.tsx` para seguir a regra de superfície contínua de Minha Conta.
- **Resta da lista:**
  - **Lote D:** Barra de ferramentas e `BubbleMenu` de `RichTextEditor.tsx` (`PrismSeparator` e `PrismToggle`/`PrismButton size="icon-sm"`, com verificação dedicada de teclado).
- **Encaminhados a tickets próprios:** marcadores de feriados no calendário → `CAL01`; interações de `ActionItem` → `DS03`; elevação e microinterações → `DS04`; controles do Planejamento → `T01–T11`.

Solicitado pelo proprietário em 05/11/2026 após ajustes no gerenciador de conteúdo e identificação de botões personalizados desnecessários.

## Revisão da execução A–C

A revisão independente e os ajustes pedidos estão no [DS01](../../design-system-audit/issues/01-audit-visual-deviations.md#revisão-dos-lotes-ac-antes-do-lote-d--0511). O lote D é independente; os lotes A–C seguem com retorno de revisão e aceite visual.
