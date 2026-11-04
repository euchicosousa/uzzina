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
        <p className="text-sm text-muted-foreground">{rule}</p>
        <code className="block text-xs break-words text-muted-foreground">
          {classes}
        </code>
        <ul className="list-disc pl-5 text-xs text-muted-foreground">
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
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        {label} · {source}
      </span>
      {children}
      <span className="text-xs text-muted-foreground">{hint}</span>
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
<PrismSelect aria-label="Exemplo de select" className="w-56" defaultSelectedKey="a">
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
<PrismSlider aria-label="Exemplo de slider" className="w-56" defaultValue={3} maxValue={7} minValue={1}>
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

**Réplicas** (copie a string de classe do arquivo-fonte; abaixo, o valor atual em 03/11/2026):
14. `Link do dia (Home)` — `Réplica de features/home/HomeCalendarView.tsx`:
```tsx
<a className="block rounded-sm underline-offset-4 squircle hover:underline focus-visible:ring-3 focus-visible:ring-ring/30" href="#tokens-focus">Link do dia</a>
```
15. `Alça de reordenar` — `Réplica de features/media/ContentReorderDialog.tsx`:
```tsx
<button aria-label="Réplica da alça" className="flex size-8 cursor-grab touch-none items-center justify-center rounded bg-black/70 text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30 active:cursor-grabbing" type="button">⠿</button>
```
16. `Remover anexo` — `Réplica de features/media/ContentReorderDialog.tsx` (botão remover):
```tsx
<button aria-label="Réplica remover" className="flex size-8 items-center justify-center rounded bg-destructive text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30" type="button">×</button>
```
17. `Editor de texto (focus-within)` — `Réplica de routes/app/admin/partner/$slug.tsx`:
```tsx
<div className="min-h-25 w-72 overflow-hidden rounded-2xl bg-input/50 text-base shadow-sm transition-[color,box-shadow] squircle focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 md:text-sm">
  <textarea aria-label="Réplica do editor admin" className="h-full min-h-25 w-full resize-none bg-transparent p-3 outline-none" placeholder="Clique ou Tab aqui" />
</div>
```
18. `Cartão em edição (focus-within)` — `Réplica de features/ActionItem.tsx` (estado `isEditing`; o foco é `ring-3 ring-ring/30`, NÃO o `ring-primary`):
```tsx
<div className="w-72 rounded-2xl border bg-card p-3 text-sm focus-within:ring-3 focus-within:ring-ring/30">
  <input aria-label="Réplica do cartão em edição" className="w-full bg-transparent outline-none" placeholder="Clique ou Tab aqui" />
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
<div className="flex h-24 w-72 flex-col overflow-y-auto p-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset" tabIndex={0}>Região rolável (coluna, célula, painel)</div>
```
2. `Botão Fechar da gaveta` — `Réplica de features/action-drawer/ActionFormDrawer.tsx` (anel inset + fundo):
```tsx
<button aria-label="Réplica fechar" className="flex cursor-pointer items-center justify-center border-b px-3 py-3 text-sm font-medium outline-none focus-visible:bg-input focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset sm:p-5" type="button">Fechar</button>
```
3. `Miniatura de anexo` — `Réplica de features/media/WorkFileThumbnail.tsx`:
```tsx
<a className="block size-20 rounded-2xl bg-secondary outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset" href="#tokens-focus">Arquivo</a>
```
4. `Carrossel` — `Réplica de features/media/InstagramPreview.tsx`:
```tsx
<div className="flex h-24 w-72 touch-pan-x touch-pan-y snap-x snap-mandatory [scrollbar-width:none] items-center justify-center overflow-x-auto overscroll-x-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset [&::-webkit-scrollbar]:hidden" tabIndex={0}>Carrossel</div>
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
<button aria-label="Réplica botão da barra" className="flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all outline-none hover:bg-secondary hover:text-foreground data-[focus-visible]:bg-input data-[focus-visible]:text-foreground squircle" type="button">B</button>
```
(`Réplica de features/RichTextEditor.tsx`; atenção: `data-[focus-visible]` só dispara em componente React Aria; numa réplica use `focus-visible:bg-input focus-visible:text-foreground` e anote isso no `source`.)

**Réplicas** (só quando não há componente simples):
10. `Linha de ajuda / notificação (foreground/5)` — `Réplica de features/HelpPage.tsx`:
```tsx
<button className="w-56 rounded-md px-2 py-1.5 text-left text-sm outline-none squircle focus-visible:bg-foreground/5" type="button">Linha de lista</button>
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
<input aria-label="Réplica do título inline" className="w-56 rounded-md border-0 bg-muted/80 px-1.5 py-0.5 text-sm text-foreground ring-0 transition-colors outline-none squircle focus:bg-muted focus:ring-0 focus:outline-none" defaultValue="Título da ação" />
```
2. `Comentário` (Prism com override, igual ao uso real em `ActionComments/CommentInput.tsx`):
```tsx
<PrismTextarea aria-label="Exemplo de comentário" className="min-h-20 w-56 rounded-none border-0 p-0 text-sm shadow-none focus:border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none" placeholder="Escreva um comentário" />
```
3. `Data da gaveta (sublinhado)` — `Réplica de features/action-drawer/ActionDatePicker.tsx`:
```tsx
<div className="w-fit cursor-pointer text-sm underline-offset-2 outline-none hover:underline focus-visible:underline" tabIndex={0}>12 de novembro</div>
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
