# 05 — Gatilhos do rodapé da gaveta: anatomia única

Status: Aprovado pelo proprietário em 03/11/2026. Conclusão 100%.

## Aceite e regra vigente — 03/11/2026

O proprietário confirmou que o V05 está correto e que verificou e ajustou todos os tamanhos de avatares. Encerrado por esse aceite.

Gatilhos de ícone mantêm altura e largura mínima da escala Prism, com largura automática para acomodar grupos. No rodapé usam `ghost` e `icon-lg` (mínimo 48px). Avatares seguem V13, com 16/24/32px conforme o tamanho do botão, e 32px nos gatilhos grandes. Ícones e amostras grandes usam 20px. O espaçamento interno da faixa é `gap-px` com `p-2`. Os registros anteriores de largura fixa e avatares de 20px abaixo são históricos.

Verificação desta rodada e limites no [relatório central](../../../docs/audits/2026-11-03-ticket-dispatch.md). Ajustes do proprietário permanecem no diff local sobre `b5b5f33`.

## Aplicado (03/11/2026)

- `ComboboxTrigger` agora só compõe `buttonVariants`: `filter` = ghost/sm; `form-inline` = ghost/sm (size sm) ou ghost/default; `form-link` = link/sm; `form-footer` = ghost/`icon` (padrão) ou ghost/`default` com `iconOnly={false}` (quando há texto). Removidos `min-w-10`, `px-2`, `gap-2`, `overflow-hidden`, `p-6`, `h-8`, `rounded-md`, `text-sm` próprio, hover/focus `bg-secondary`/`bg-input` próprios e `flex` base.
- Cores: `#666`/`#666666` (Categoria vazia, Cor) -> `text-muted-foreground`/sem cor; `border-black/5` -> `border-border`; `text-amber-*` -> `text-warning`. Sprint vazio `ZapIcon` -> `text-muted-foreground`.
- Avatares do rodapé: `UAvatarGroup size="sm"` (24px) em Parceiros e Sprint.
- Salvar: removidos `w-32`, `overflow-hidden`, `rounded-2xl squircle` (largura por conteúdo). Fase: removido `opacity-40 pointer-events-none` manual (usa `isDisabled`).
- Atualização 03/11: todos os botões do rodapé são `lg` (48px): `ComboboxTrigger` `form-footer` = ghost `icon-lg` (só ícone) / `lg` (com texto); salvar `lg`/`icon-lg`. Conteúdo interno de 20px (`size-5`): avatares (novo `UAvatarGroup avatarClassName` opcional), `PhaseIcon` md, ícones de categoria, amostra de cor. Rodapé com 64px (48 + `p-2`). Substitui o `UAvatarGroup size="sm"` (24px) acima.
- Pendente: unificar `variant`/`triggerVariant`, popovers (outro agente). Demais variantes: [ticket 13](13-combobox-variants.md).

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
