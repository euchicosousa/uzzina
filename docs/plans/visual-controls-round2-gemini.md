# Rodada 2: ajustes de controles Prism (instruções para executor)

Siga este documento na ordem. Faça só o que está escrito. Não invente melhorias. Quando houver dúvida, pare e anote em "Dúvidas do executor" no fim, sem resolver por conta própria.

## 0. Regras

- Repositório: `/Users/euchicosousa/vercel/uzzina`.
- **Não commitar.**
- Não alterar as classes de tamanho de `app/components/prism/button.tsx`. Elas são a referência.
- Não alterar cores, a não ser onde pedido.
- Código e comentários em inglês; textos visíveis em português.
- Existem mudanças locais não commitadas de outra pessoa. Preserve tudo que já está nos arquivos.
- Ao terminar cada tarefa, marque `[x]` na lista do §6.
- No fim, rode:
  - `bunx prettier --write <arquivos alterados>`
  - `bunx tsc --noEmit` (deve sair sem erro)

## 1. Referência: o botão

| Tamanho | Altura | Classe |
| :------ | :----- | :----- |
| xs      | 24px   | `h-6`  |
| sm      | 32px   | `h-8`  |
| default | 40px   | `h-10` |
| lg      | 48px   | `h-12` |

Ícone sozinho: `size-6` / `size-8` / `size-10` / `size-12`.

**Formato padrão: `rounded-2xl squircle`.** O `squircle` é obrigatório junto com `rounded-2xl`. Sem ele, o canto fica visivelmente mais redondo. Esse é o motivo de vários componentes parecerem "mais arredondados".

**Itens dentro de um container arredondado** (itens de menu, de lista ou de command) usam `rounded-xl squircle`.

## 2. Marcador "OK" no /ui (fazer primeiro)

Arquivo: `app/components/ui-sections/GalleryHelperComponents.tsx`.

1. Em `GallerySectionHeader`, adicionar a prop opcional `approved?: boolean`.
2. Quando `approved` for true, mostrar depois do título, na mesma linha:
   `<span className="ml-2 text-sm font-semibold text-success">OK</span>`
3. Marcar `approved` nestas seções:
   - `RadioGroupSection.tsx`;
   - `SliderSection.tsx`;
   - o bloco de ColorSlider/ColorArea dentro de `InputSection.tsx`. Se esse bloco não usar `GallerySectionHeader`, coloque o mesmo `<span>` ao lado do rótulo dele.

Não marcar nenhuma outra seção. O proprietário vai pedir as próximas.

## 3. Correções já decididas

Faça cada item exatamente como descrito.

### 3.1 `squircle` faltando

Em todos os arquivos de `app/components/prism/`, todo elemento com `rounded-2xl` ou `rounded-xl` precisa ter também `squircle`.

- Rode `grep -n "rounded-2xl\|rounded-xl" app/components/prism/*.tsx`.
- Adicione `squircle` onde faltar. Casos conhecidos:
  - `input-group.tsx` (grupo do campo);
  - `select.tsx` (gatilho);
  - `date-range-picker.tsx` (gatilho);
  - `combobox.tsx` (campo de chips e chip);
  - `time-field.tsx` (segmento);
  - `checkbox.tsx` (já tem; conferir).
- Não adicionar `squircle` em `rounded-full`.

### 3.2 Containers flutuantes com raio padrão

Trocar o raio por `rounded-2xl squircle` em:

- `popover.tsx`: `rounded-3xl` → `rounded-2xl`.
- `dropdown-menu.tsx` (linhas ~46 e ~189): `rounded-3xl` → `rounded-2xl`.
- `command.tsx` (linha ~52): `rounded-3xl` → `rounded-2xl`.
- `dialog.tsx` (linha ~114): `rounded-[min(var(--radius-4xl),24px)]` → `rounded-2xl`.
- `combobox.tsx` e `select.tsx`: conteúdo do popover, para `rounded-2xl squircle`, se estiver diferente.
- `ui-sections/CommandSection.tsx` (linha ~62): remover `rounded-4xl` do `PrismPopover`.

Itens dentro desses containers devem ficar com `rounded-xl squircle`:

- `command.tsx`, item (linha ~240): `rounded-2xl` e `in-data-[slot=dialog-content]:rounded-2xl` → `rounded-xl`.
- `dropdown-menu.tsx`, itens e submenu: `rounded-lg` → `rounded-xl squircle`.
- `select.tsx` e `combobox.tsx`, item: já são `rounded-xl`; adicionar `squircle` se faltar.

### 3.3 Textarea

Arquivo `textarea.tsx`: `min-h-16` → `min-h-30` (120px, 3× a altura do input padrão de 40px).

### 3.4 Badge

Arquivo `badge.tsx`: `rounded-2xl squircle` → `rounded-full`, sem `squircle`. Não criar tamanhos.

### 3.5 Kbd (novo)

- Criar `app/components/prism/kbd.tsx` com `PrismKbd`.
- Elemento `<kbd data-slot="kbd">`.
- Classes: as mesmas do badge base (altura `h-5`, `px-1.5`, `text-xs`, `font-medium`, `rounded-full`), mais `font-mono`, `bg-secondary` e `text-muted-foreground`.
- Exportar em `prism/index.ts`.
- Usar em `ui-sections/CommandSection.tsx` no lugar do texto do atalho (⌘S), se o atalho for texto solto.

### 3.6 Toast e Alert: borda de 1px

- `sonner.tsx` (linha ~48): `border-2!` → `border!`.
- `alert.tsx` (linha ~7): `border-2` → `border`.

### 3.7 Tabs

Arquivo `tabs.tsx`, `tabVariants`.

Alterar:

- `min-h-11` → `h-10`;
- `px-3 py-2` → `px-5`;
- hover: `data-[hovered]:bg-input/50` → `data-[hovered]:bg-secondary/50` (igual ao botão ghost);
- pressionado: `data-[pressed]:bg-input` → `data-[pressed]:bg-secondary`;
- adicionar `rounded-t-xl squircle`, para o hover ter a forma do botão sem curvar a linha inferior.

Manter sem mudança: a linha inferior de seleção (`after:`), a borda superior de foco de 2px (`border-t-2`, `data-[focus-visible]:border-t-primary`) e `data-[focus-visible]:bg-input`. Esses três são contrato do AGENTS.

Não criar tamanhos.

### 3.8 Slider (espaço entre rótulo e valor)

O valor encosta no rótulo ("semana3") porque a demonstração é estreita.

- `ui-sections/SliderSection.tsx`: na `div` com `flex items-center justify-between`, adicionar `gap-4`.
- No container do slider da demonstração, adicionar `w-full max-w-md`.
- `app/routes/app/planejamento.tsx` (linha ~429): na mesma `div` do slider, adicionar `gap-4`.

### 3.9 Dialog

Arquivo `dialog.tsx`:

1. **Largura máxima:** no `ModalPrimitive` (linha ~114), adicionar `sm:max-w-lg` (512px). Antes, rode `grep -rn "PrismDialogContent\|DialogContent" app --include=*.tsx` e confira se quem já passa `max-w-*` em `className` continua funcionando (o `cn` resolve o conflito). Liste esses arquivos no relatório.
2. **Corpo com recuo:** criar e exportar `PrismDialogBody`:
   - uma `div data-slot="dialog-body"`;
   - classes `flex flex-col gap-2 px-5 py-2` (o mesmo recuo lateral de header e footer, que usam `px-5 py-4`).
3. Em `ui-sections/DialogSection.tsx`, trocar `<div className="flex flex-col gap-2 py-4">` por `<PrismDialogBody>`.

### 3.10 Command dentro de popover (imagem com "Parceiro...")

Arquivo `ui-sections/CommandSection.tsx`, demonstração com popover (linhas ~55–95). Há duas linhas separando o campo dos itens: o `border-b` da `div` em volta do campo e o `border-t` do `CommandList`.

- Remover `border-b` da `div` (linha ~64).
- Manter o `border-t` do `CommandList`.
- O recuo do topo e o da lateral do campo devem ser iguais. Deixe o `PrismPopover` com `p-0` e a `div` do campo com `p-2`, sem `px-1`.
- O botão de filtro ao lado do campo: `size="icon-sm"`, para ficar com a mesma altura do campo `sm`.

### 3.11 `CommandInput` com tamanho

Arquivo `command.tsx`, `CommandInput` (linha ~126):

- Adicionar a prop `size?: "sm" | "default"`, com padrão `"default"`.
- Trocar `InputGroup className="h-10 rounded-2xl bg-input squircle"` por `InputGroup size={size} className="bg-input"`. O `InputGroup` já define altura, raio e `squircle`.
- Em `ui-sections/CommandSection.tsx`, o campo dentro do popover usa `size="sm"`. O command grande (diálogo) fica com o padrão.

### 3.12 Alinhamento do command grande

Objetivo: o ícone de busca, os títulos de grupo e os ícones dos itens começam na mesma coluna (20px da borda do container).

Arquivo `command.tsx`:

| Parte                                           | Valor                                                                 |
| :---------------------------------------------- | :-------------------------------------------------------------------- |
| Container do campo (`SearchField`, linha ~131)  | `p-2` (manter)                                                        |
| Ícone do campo (`InputGroupAddon` inline-start) | passar `className="pl-3"` no `CommandInput`                           |
| `CommandList`                                   | adicionar `p-2`                                                       |
| `CommandGroup` (linha ~185)                     | trocar `p-2` por `p-0`; título do grupo com `px-3` no lugar de `px-2` |
| `CommandItem` (linha ~240)                      | `px-4` → `px-3`                                                       |

Resultado esperado: campo 8 + 12 = 20px; item 8 + 12 = 20px; título 8 + 12 = 20px.

### 3.13 Botões internos do Combobox seguem o tamanho do campo

Arquivo `combobox.tsx`, `ComboboxInput` (linhas ~94–115). Os botões dentro do campo (limpar e abrir) devem ter a altura do campo menos 8px:

| Campo          | Botão interno    |
| :------------- | :--------------- |
| sm (32px)      | `icon-xs` (24px) |
| default (40px) | `icon-sm` (32px) |
| lg (48px)      | `icon` (40px)    |

Hoje um deles é fixo em `icon-sm` e o outro em `icon-xs`. Faça os dois seguirem a prop `size` com essa tabela.

### 3.14 Nome da seção de menu

Arquivo `ui-sections/MenuSection.tsx`: título `"PrismMenu"` → `"PrismMenu (Dropdown)"`. O proprietário não encontrou o dropdown no /ui porque o nome não dizia isso.

## 4. Seções novas no /ui

Para cada item:

- criar o arquivo em `app/components/ui-sections/`;
- exportar em `ui-sections/index.ts`;
- renderizar em `app/routes/ui.tsx`, junto das outras seções Prism;
- usar `GallerySection`, `GallerySectionHeader` e `GalleryItem`;
- mostrar cada tamanho ao lado de um `PrismButton` do mesmo tamanho.

1. **`SelectSection.tsx` (`id="prism-select"`):** Select nos tamanhos sm, default e lg, cada um com um botão ao lado. Um select com valor escolhido e um desativado. Opções em português.
2. **`CalendarSection.tsx` (`id="prism-calendar"`):** `PrismCalendar` simples e com intervalo, se `calendar.tsx` exportar os dois. Não alterar `calendar.tsx`.
3. **`AccordionSection.tsx` (`id="prism-accordion"`):** três itens. Na descrição, escreva: "Não usado no app hoje." O componente não é importado em nenhum lugar fora de `prism/`.
4. **`SkeletonSection.tsx` (`id="prism-skeleton"`):** os usos reais do componente. Ele aparece em `layout/PartnersBoard.tsx`, `features/CalendarDayCell.tsx` e `features/home/HomeSprintView.tsx`; copie a forma usada ali.
5. **`RichTextEditorSection.tsx` (`id="uzzina-rich-text-editor"`):** renderizar `features/RichTextEditor.tsx` com um texto de exemplo, mostrando a barra completa. Se ele aceitar `compactToolbar`, mostrar também a versão compacta. Leia as props em `RichTextEditor.tsx` (linhas ~73 e ~442). Se ele exigir dados do app (consulta, contexto), pare e anote em "Dúvidas do executor".
6. **Combobox de chips:** dentro de `ComboboxSection.tsx`, um exemplo de seleção múltipla com chips, usando os componentes de chips de `combobox.tsx`. Não alterar as medidas.
7. **Kbd:** dentro de `BadgeSection.tsx`, um exemplo de `PrismKbd` ao lado de um badge.

## 5. Não fechado: não alterar

Itens que dependem de decisão do proprietário. **Não mexa neles.**

| Item               | Situação atual                                                                                                                                                                                                                      |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkbox           | sm 16, default 20, lg 24, com `rounded-sm/md/lg squircle`. O `squircle` já existe, mas em raio pequeno quase não aparece                                                                                                            |
| Radio              | `rounded-full`, sem `squircle`                                                                                                                                                                                                      |
| Dias do calendário | `--cell-size: spacing(7)` = 28px fixo. O botão do dia usa `buttonVariants` com `size: "icon"`, sobrescrito pelo tamanho da célula. Não há prop para mudar o tamanho. O diálogo de datas comemorativas usa 36px (contrato do AGENTS) |
| Combobox de chips  | Campo `min-h-8` (= botão sm); chip com 21px. Falta conferir se o popover tem a mesma largura do campo                                                                                                                               |
| Foco do input      | borda `ring` mais anel de 3px a 30%; parece borda dupla                                                                                                                                                                             |
| Títulos de grupo   | Command e Dropdown usam CAIXA ALTA; Select e Combobox não                                                                                                                                                                           |
| Avatar             | padrão próprio; manter                                                                                                                                                                                                              |

## 6. Lista de progresso

- [x] 2. Marcador OK
- [x] 3.1 squircle
- [x] 3.2 raio dos containers e itens
- [x] 3.3 textarea
- [x] 3.4 badge
- [x] 3.5 kbd
- [x] 3.6 toast e alert
- [x] 3.7 tabs
- [x] 3.8 slider
- [x] 3.9 dialog
- [x] 3.10 command no popover
- [x] 3.11 CommandInput size
- [x] 3.12 alinhamento do command
- [x] 3.13 botões internos do combobox
- [x] 3.14 nome da seção de menu
- [x] 4.1 Select
- [x] 4.2 Calendar
- [x] 4.3 Accordion
- [x] 4.4 Skeleton
- [x] 4.5 RichTextEditor
- [x] 4.6 Combobox de chips
- [x] 4.7 Kbd
- [x] prettier + `tsc --noEmit` sem erro

## 7. Relatório do executor

Preencha ao terminar:

- **Arquivos alterados:**
  - `app/components/prism/accordion.tsx`
  - `app/components/prism/alert.tsx`
  - `app/components/prism/badge.tsx`
  - `app/components/prism/combobox.tsx`
  - `app/components/prism/command.tsx`
  - `app/components/prism/date-range-picker.tsx`
  - `app/components/prism/dialog.tsx`
  - `app/components/prism/dropdown-menu.tsx`
  - `app/components/prism/index.ts`
  - `app/components/prism/input-group.tsx`
  - `app/components/prism/kbd.tsx` (criado)
  - `app/components/prism/popover.tsx`
  - `app/components/prism/select.tsx`
  - `app/components/prism/sonner.tsx`
  - `app/components/prism/tabs.tsx`
  - `app/components/prism/textarea.tsx`
  - `app/components/prism/toggle.tsx`
  - `app/components/prism/toggle-group.tsx`
  - `app/components/ui-sections/AccordionSection.tsx` (criado)
  - `app/components/ui-sections/BadgeSection.tsx`
  - `app/components/ui-sections/CalendarSection.tsx`
  - `app/components/ui-sections/CommandSection.tsx`
  - `app/components/ui-sections/DialogSection.tsx`
  - `app/components/ui-sections/GalleryHelperComponents.tsx`
  - `app/components/ui-sections/InputSection.tsx`
  - `app/components/ui-sections/MenuSection.tsx`
  - `app/components/ui-sections/RadioGroupSection.tsx`
  - `app/components/ui-sections/RichTextEditorSection.tsx` (criado)
  - `app/components/ui-sections/SelectSection.tsx` (criado)
  - `app/components/ui-sections/SkeletonSection.tsx` (criado)
  - `app/components/ui-sections/SliderSection.tsx`
  - `app/components/ui-sections/index.ts`
  - `app/routes/app/planejamento.tsx`
  - `app/routes/ui.tsx`
  - `docs/plans/visual-controls-round2-gemini.md`
- **Resultado do `tsc --noEmit`:** 0 erros (passou com sucesso).
- **Consumidores de dialog com `max-w` próprio (3.9):**
  - `app/components/features/CelebrationDialog.tsx` (`sm:max-w-sm`)
  - `app/components/features/action-drawer/ActionFormDrawer.tsx` (`sm:max-w-3xl lg:max-w-5xl` e `sm:max-w-2xl`)
  - `app/components/features/bulk/BulkArchiveDialog.tsx` (`max-w-md p-0`)
  - `app/components/features/bulk/BulkResponsiblesDialog.tsx` (`max-w-md`)
  - `app/components/features/bulk/BulkSprintDialog.tsx` (`max-w-md`)
  - `app/components/prism/command.tsx` (`sm:max-w-xl`)
- **Dúvidas do executor:** Nenhuma. Para acomodar `size="icon-sm"` no toggle de filtro de `CommandSection.tsx` mantendo tipagem estrita no `PrismToggle`, adicionamos variantes `icon-*` (`icon-xs`, `icon-sm`, `icon`, `icon-lg`) em `toggle.tsx`, espelhando a referência de `button.tsx`.

## 8. O que o proprietário confere no /ui

1. Input, select, seletor de data e campo de senha com o mesmo canto do botão.
2. Popover, menu, command e dialog com o mesmo canto dos botões.
3. Textarea com altura mínima de 3 inputs.
4. Badge em pílula; Kbd igual ao badge.
5. Toast e alert com borda fina.
6. Abas com 40px; hover igual ao botão ghost.
7. Slider com espaço entre rótulo e valor.
8. Dialog com largura máxima no desktop e texto do corpo alinhado ao título.
9. Command no popover: topo e lateral iguais, uma linha só entre campo e itens.
10. Command grande: ícone de busca, títulos e ícones dos itens na mesma coluna.
11. Seções novas: Select, Calendar, Accordion, Skeleton, RichTextEditor, chips e Kbd.
