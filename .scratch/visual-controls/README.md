# Controles visuais — tickets

Atualizado em 04/11/2026, base local `57a7be3`. Cada linha resume a finalidade, o estado de conclusão e o commit de referência. Commitado significa registrado no Git local; não confirma push ou deploy. Nas pendências V12/V36, o commit contém o ticket, sem comprovar a entrega.

Regras oficiais em [visual-controls-final-status.md](../../docs/plans/visual-controls-final-status.md); inventário em [visual-controls-where.md](../../docs/plans/visual-controls-where.md). Os relatórios antigos dentro dos tickets preservam o estado da época; os campos iniciais e este índice representam a situação consolidada.

V35: o índice anterior indicava aprovação, mas a última devolutiva desta conversa ainda aguarda aceite final. V41 aprovado pelo proprietário e encerrado; migração em `57a7be3`, correções finais no commit de encerramento que inclui este índice. V36 continua somente estudo e agora aparece neste índice.

| # | Ticket | Sobre o que é | Status | Commit de referência |
|---|---|---|---|---|
| 01 | [Anéis de foco: todos em `/30`](issues/01-focus-rings.md) | Uniformiza os anéis de foco dos controles com opacidade /30. | Aprovado (03/11) | b5b5f33 |
| 02 | [Tamanho de texto por tamanho de controle](issues/02-text-sizes.md) | Alinha fonte e altura de linha à escala de tamanho de cada controle. | Aprovado (03/11) | b5b5f33 |
| 03 | [Popovers e containers](issues/03-popovers-and-containers.md) | Padroniza superfícies, espaçamento e dimensões dos popovers e containers. | Aprovado (03/11) | b5b5f33 |
| 04 | [Calendário da barra de ferramentas](issues/04-calendar-toolbar-date-picker.md) | Ajusta o seletor de data do calendário usado pela barra de ferramentas. | Aprovado (03/11) | b5b5f33 |
| 05 | [Rodapé da gaveta (gatilhos)](issues/05-drawer-footer-triggers.md) | Padroniza gatilhos, avatares, ícones e comandos do rodapé da gaveta. | Aprovado pelo proprietário (03/11), 100% | ce1230b |
| 06 | Calendário com largura fluida (colunas mín. `--cell-size`, máx. flexível) | Distribui as colunas do calendário com largura fluida e mínimo pela célula. | Aprovado (03/11) | b5b5f33 |
| 07 | `/ui`: rolagem única e altura acompanhando a janela | Adapta a galeria à altura da janela com rolagem independente do conteúdo. | Aprovado (03/11) | b5b5f33 |
| 08 | Seção temporária "Teste — tamanhos de texto" no `/ui` | Remove a seção temporária usada para comparar tamanhos de texto. | Removida (03/11) | b5b5f33 |
| 09 | [`/ui`: seção "Foco" (todas as formas de foco lado a lado)](issues/09-ui-focus-section.md) | Reúne e ajusta exemplos de foco, incluindo o foco dos cartões de ação. | Aprovado (03/11); cartão de ação resolvido — ver [09-focus-adjustments.md](issues/09-focus-adjustments.md) | b5b5f33 |
| 10 | Squircle em todo elemento arredondado (exceto `rounded-full`/`none`) | Aplica a geometria squircle aos elementos arredondados elegíveis. | Aprovado (03/11) | b5b5f33 |
| 11 | Toggle alinhado ao Button + inset dos chips | Alinha Toggle ao Button e ajusta o espaçamento interno dos chips. | Aprovado (03/11) | b5b5f33 |
| 12 | [Busca global: filtros como sufixo do campo](issues/12-global-search-filters.md) | Prevê filtros de parceiros e ações arquivadas integrados ao campo da busca global. | A fazer — executor: Claude | b5b5f33 (ticket; entrega pendente) |
| 13 | [Variantes de `ComboboxTrigger` e conteúdo dos comboboxes fora do rodapé](issues/13-combobox-variants.md) | Unifica variantes e tamanhos dos comboboxes com o botão Prism. | Concluído (03/11) | b5b5f33 |
| 14 | [`/ui`: seção "Ícones" (ícones usados no app, com significado)](issues/14-ui-icons-section.md) | Documenta os ícones usados pelo aplicativo, seus significados e tamanhos. | Aprovado pelo proprietário (03/11), 100% | ce1230b |
| 15 | [Linhas de metadados da aba Essencial: tamanho único e recolher/expandir](issues/15-essentials-rows.md) | Uniformiza as linhas de metadados da aba Essencial e seu recolhimento. | Aprovado pelo proprietário (03/11), 100% | ce1230b |
| 16 | [`/ui`: matriz de `PartnersCombobox` (avatar por tamanho de botão)](issues/16-ui-partners-combobox-matrix.md) | Demonstra tamanhos de avatares do PartnersCombobox para cada tamanho de botão. | Concluído (03/11) | b5b5f33 |
| 17 | [`/ui`: playground de propriedades — piloto no `PrismButton`](issues/17-ui-props-playground-pilot.md) | Introduz o playground interativo de propriedades usando Button como piloto. | Aprovado pelo proprietário (03/11), 100% | ce1230b |
| 18 | [`/ui`: playground em todas as seções existentes (4 lotes)](issues/18-ui-props-playground-rollout.md) | Expande os playgrounds da galeria e corrige Alert, grupos, placeholders, chips, Tabs e Toaster. | Concluído (100%), encerramento autorizado | ce1230b |
| 19 | [`/ui`: seção Avatar (`PrismAvatar`)](issues/19-ui-prism-avatar-section.md) | Demonstra Avatar e AvatarGroup do Prism com imagem, fallback, selo e agrupamento. | Concluído (100%), revisado em 04/11 | d7efe5f |
| 20 | [`/ui`: seção Sheet (`PrismSheet`)](issues/20-ui-prism-sheet-section.md) | Demonstra Sheet com quatro direções, fechamento, foco e conteúdo longo. | Concluído (100%), revisado em 04/11 | ce1230b + 8d80249 + d7efe5f |
| 21 | [`/ui`: seção `ComboboxTrigger`](issues/21-ui-combobox-trigger-section.md) | Demonstra variantes, tamanhos e tipos de conteúdo do ComboboxTrigger. | Aprovado visualmente (04/11), 100% | d7efe5f |
| 22 | [`/ui`: seção `ResponsiblesCombobox`](issues/22-ui-responsibles-combobox-section.md) | Demonstra seleção de responsáveis; o componente foi consolidado no UPeopleCombobox pelo V40. | Concluído (100%), revisado em 04/11 | d7efe5f |
| 23 | [`/ui`: seção `SprintCombobox`](issues/23-ui-sprint-combobox-section.md) | Demonstra seleção de Sprint; o componente foi consolidado no UPeopleCombobox pelo V40. | Concluído (100%), revisado em 04/11 | d7efe5f |
| 24 | [`/ui`: seção `PhaseIcon`](issues/24-ui-phase-icon-section.md) | Demonstra fases, tamanhos e variantes do PhaseIcon, preservado por decisão do proprietário. | Aprovado visualmente (04/11), 100% | d7efe5f |
| 25 | [`/ui`: seção `ULoader`](issues/25-ui-uloader-section.md) | Demonstra a escala e as cores do ULoader, com padronização operacional no V42. | Aprovado (04/11), 100% — padronizado com ULoader (Ticket 42) | d7efe5f |
| 26 | [`/ui`: seção `UToggleInput`](issues/26-ui-utoggle-input-section.md) | Demonstra o controle de formulário antes UToggleInput, migrado para PrismToggle no V43. | Aprovado (04/11), 100% — migrado para PrismToggle (Ticket 43) | d7efe5f |
| 27 | [`/ui`: seção `UPreferenceSwitch`](issues/27-ui-upreference-switch-section.md) | Demonstra preferências com rótulo, descrição e alternância de estado. | Aprovado visualmente, 100% (04/11) | d7efe5f |
| 28 | [`/ui`: seção `UAvatarSelector`](issues/28-ui-uavatar-selector-section.md) | Demonstra seleção por avatares, presets, subtítulo e limite mínimo de seleção. | Aprovado visualmente, 100% (04/11) | d7efe5f |
| 29 | [`/ui`: seção `UAdminItemCard`](issues/29-ui-uadmin-item-card-section.md) | Demonstra o item administrativo com avatar, título, subtítulo e selo. | Aprovado visualmente, 100% (04/11) | d7efe5f |
| 30 | [`/ui`: seção `CalendarToolbar`](issues/30-ui-calendar-toolbar-section.md) | Demonstra navegação anterior/próxima, calendário e formatos do CalendarToolbar. | Aprovado visualmente (04/11), 100% | d7efe5f |
| 31 | [`/ui`: seção `ColorListEditor`](issues/31-ui-color-list-editor-section.md) | Demonstra edição e reordenação de paletas, agora com UPaletteEditor do V38. | Aprovado (04/11), 100% — substituído por UPaletteEditor (Ticket 38) | d7efe5f |
| 32 | [`/ui`: seção `ActionDatePicker`](issues/32-ui-action-date-picker-section.md) | Demonstra escolha de data e hora da ação, formatos, tamanho e estado de atraso. | Aprovado visualmente (04/11), 100% | d7efe5f |
| 33 | [`/ui`: seção `ActionColorDropdown`](issues/33-ui-action-color-dropdown-section.md) | Demonstra o seletor de cor da ação, substituído pelo UColorPickerDropdown do V37. | Aprovado (04/11), 100% — substituído por UColorPickerDropdown (Ticket 37) | d7efe5f |
| 34 | [`/ui`: seção `PartnerCelebrationsSelector`](issues/34-ui-partner-celebrations-selector-section.md) | Demonstra a seleção de datas comemorativas da marca, revisada visualmente no V39. | Aprovado pelo proprietário (04/11), 100% | d7efe5f |
| 35 | [`/ui`: microseções na navegação lateral](issues/35-ui-sidebar-subsections.md) | Revela microseções do item selecionado e navega no primeiro clique, sem disputa entre roteador e rolagem. | Implementado e verificado; aceite final pendente; 90% | d7efe5f |
| 36 | [Estudo dos wrappers de avatar](issues/36-avatar-wrapper-comparison-study.md) | Estuda sobreposição entre Avatar/AvatarGroup do Prism e UAvatar/UAvatarGroup, sem autorizar refatoração. | Pendente — somente estudo; 0% | d7efe5f (ticket; entrega pendente) |
| 37 | [Seletor de cor por parceiro e formatos](issues/37-partner-color-picker-formats.md) | Unifica seleção de cor, paletas por parceiro, formatos HEX/RGB/HSL/HSB e validação no UColorPickerDropdown. | Aprovado pelo proprietário (04/11), 100% | d7efe5f |
| 38 | [UPaletteEditor e seletor compartilhado](issues/38-palette-editor-shared-color-picker.md) | Substitui ColorListEditor por UPaletteEditor com seletor compartilhado, reordenação e exclusão discreta. | Aprovado pelo proprietário (04/11), 100% | d7efe5f |
| 39 | [Seletor de datas alinhado ao Prism](issues/39-celebrations-selector-prism-alignment.md) | Alinha o seletor de datas ao Prism com Tabs, badges, cabeçalhos mensais e títulos truncados. | Aprovado pelo proprietário, 100% (04/11) | d7efe5f |
| 40 | [Unificar Sprint e Responsáveis](issues/40-unify-people-combobox.md) | Consolida responsáveis e Sprint em UPeopleCombobox preservando suas regras de seleção. | Aprovado pelo proprietário (04/11), 100% — duplicatas eliminadas em favor de UPeopleCombobox | d7efe5f |
| 41 | [Padronizar nomes com prefixo U](issues/41-standardize-uzzina-component-names.md) | Padroniza nomes, arquivos, exports e imports dos componentes próprios com prefixo U. | Aprovado e encerrado, 100% (04/11) | 57a7be3 + commit de encerramento deste registro |
| 42 | [Padronizar loaders](issues/42-standardize-loading-indicators.md) | Substitui indicadores arbitrários pelo ULoader com escala, cor contextual e acessibilidade. | Aprovado (04/11), 100% | d7efe5f |
| 43 | [UToggleInput para PrismToggle](issues/43-replace-native-toggle-wrapper.md) | Remove UToggleInput e usa PrismToggle preservando Arquivado e o contrato de FormData. | Aprovado (04/11), 100% | d7efe5f |
