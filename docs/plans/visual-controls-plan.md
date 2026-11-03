# Etapa 1: altura e aparência dos controles (02/11/2026)

**Status:** aguardando decisões C1–C6 do proprietário. Depois de decidido, este documento é o ticket: um executor por vez, pode ser um agente mais barato. Faz parte do [plano de tokens](visual-tokens-plan.md) (§4.4).

**Objetivo:** botão, campo, select, combobox, toggle, seletor de data e gatilhos de filtro passam a ter **uma aparência só**: mesma escala de altura, mesmo formato, mesmo recuo, mesmo tamanho de texto e ícone, mesmo foco. Itens de menu também viram um padrão único. Quem olhar uma linha com botão + campo + select vê uma família, não peças de origens diferentes.

**Fora desta etapa:** cores, tipografia geral, espaçamento das páginas e reformas de tela. Só alturas e aparência dos controles.

## 1. Os controles, em cinco famílias

Medido no código de `ad0c0ed` (com as mudanças locais atuais).

### Família A: controles de linha (ação e campo)

São os que aparecem lado a lado numa barra ou formulário. **Devem compartilhar exatamente a mesma escala.**

| Controle | Arquivo | Tamanhos hoje | Formato hoje | Superfície hoje |
| :--- | :--- | :--- | :--- | :--- |
| Botão (`default`, `outline`, `secondary`, `ghost`, `destructive`, `success`) | `prism/button.tsx` | xs 32 · sm 40 · **default 48** · lg 56 | `rounded-2xl` + squircle | por variante |
| Botão de ícone | `prism/button.tsx` | icon-xs 32 · icon-sm 40 · **icon 48** · icon-lg 56 | idem | idem |
| LinkButton | `prism/button.tsx` | igual ao botão | idem | idem |
| Toggle | `prism/toggle.tsx` | xs 32 · sm 40 · **default 48** · lg 56 | `rounded-2xl` | transparente → `secondary` |
| Item de ToggleGroup | `prism/toggle-group.tsx` | herda do Toggle | idem; sem espaço vira grupo colado | idem |
| ButtonGroup (botões colados) | `prism/button-group.tsx` | herda do botão | `rounded-xl` nas pontas | idem |
| Input | `prism/input.tsx` | sm 40 · **default 48** | `rounded-2xl` | `bg-input/50`, sem borda |
| InputGroup (campo com ícone/prefixo) | `prism/input-group.tsx` | sm 40 · **default 48** | `rounded-2xl` | `bg-input/50` |
| Select (gatilho) | `prism/select.tsx` | sm 40 · **default 48** | `rounded-2xl` | `bg-input/50` |
| Combobox (campo) | `prism/combobox.tsx` | usa InputGroup; botões internos 32/40 | `rounded-2xl` | `bg-input/50` |
| Combobox de chips (múltiplo) | `prism/combobox.tsx` | **min 32**, cresce | `rounded-2xl` | `bg-input/50` |
| DateRangePicker (gatilho) | `prism/date-range-picker.tsx` | **48** fixo | `rounded-2xl` | `bg-input/50` |
| TimeField | `prism/time-field.tsx` | sm 40 · **default 48** | `rounded-2xl` | `bg-input/50` |
| ColorField | `prism/color-field.tsx` | sm 40 · **default 48** | `rounded-2xl` | `bg-input/50` |
| Busca do Command | `prism/command.tsx` | **40** fixo | `rounded-2xl` | `bg-input` (sem /50) |
| Seletores de mês/ano do calendário | `prism/calendar.tsx` | 28 (`--cell-size`) | squircle | transparente |
| ComboboxTrigger `filter` | `features/ComboboxTrigger.tsx` | 40 (ghost sm) | botão | ghost |
| ComboboxTrigger `form-inline` sm | idem | **32** | `rounded-md` | hover `secondary` |
| ComboboxTrigger `form-inline` lg | idem | sem altura, `p-6` | nenhum | hover `secondary` |
| ComboboxTrigger `form-footer` | idem | **48**, min 48 (contrato do AGENTS) | botão | ghost |
| Botão da barra do editor | `features/RichTextEditor.tsx` | **32** | `rounded-lg` | próprio |

Resultado hoje: **sete alturas** (28, 32, 40, 48, 56 e duas sem altura) e **quatro raios** dentro da mesma família. Busca do Command e DateRangePicker não aceitam tamanho.

### Família B: itens dentro de menus e listas

| Item | Arquivo | Altura hoje | Raio | Recuo |
| :--- | :--- | :--- | :--- | :--- |
| Item do Select | `prism/select.tsx` | min 28 | `rounded-xl` | 8 / 48px (check à direita) |
| Item do Combobox | `prism/combobox.tsx` | min 28 | `rounded-xl` | 8 / 32px |
| Item do DropdownMenu (+ checkbox/radio) | `prism/dropdown-menu.tsx` | min 28 | `rounded-lg` | 12 / 32px |
| Submenu do DropdownMenu | `prism/dropdown-menu.tsx` | min 28 | `rounded-lg` | 12px |
| Item do Command (busca global) | `prism/command.tsx` | **32** | `rounded-2xl` | 16px |
| Rótulos de grupo | select / combobox / dropdown / command | sem altura; `text-xs`, um deles em CAIXA ALTA | — | 8px |

Resultado: três raios e três recuos para a mesma coisa; o dropdown usa rótulo em maiúsculas e os outros não.

### Família C: marcadores pequenos

| Item | Arquivo | Altura hoje | Raio |
| :--- | :--- | :--- | :--- |
| Badge | `prism/badge.tsx` | 20 | `rounded-2xl` + squircle |
| Chip do Combobox | `prism/combobox.tsx` | 21 (`spacing(5.25)`) | `rounded-2xl` |
| Kbd (atalho) dentro de InputGroup | `prism/input-group.tsx` | sem altura | `rounded-2xl` |
| Avatar | `prism/avatar.tsx` | sm 24 · default 32 · lg 40 | círculo |

### Família D: marcação (checkbox, radio, slider)

| Item | Arquivo | Tamanhos hoje | Raio |
| :--- | :--- | :--- | :--- |
| Checkbox | `prism/checkbox.tsx` | sm 16 · **default 20** · lg 24 | `rounded-sm/md/lg` + squircle |
| Radio | `prism/radio-group.tsx` | sm 16 · **default 20** · lg 24 | círculo |
| Slider: trilho / alça | `prism/slider.tsx` | 8 / 20 | pílula / círculo |
| ColorSlider / ColorArea: alça | `prism/color-slider.tsx`, `color-area.tsx` | 16 | círculo |

### Família E: navegação

| Item | Arquivo | Altura hoje |
| :--- | :--- | :--- |
| Aba (PrismTab) | `prism/tabs.tsx` | min 44 |
| Dia do calendário | `prism/calendar.tsx` | 28 (`--cell-size: spacing(7)`); no diálogo de datas comemorativas, 36 (contrato do AGENTS) |
| Acordeão (gatilho) | `prism/accordion.tsx` | sem altura, `p-4` |

### Fora do Prism, com altura própria

Arquivos que fixam `h-`/`size-` de controle por conta própria (contagem): `GlobalSearchCommand` 5, `routes/app/leads` 4, `routes/app/admin/partner/$slug` 4, `Header` 3, `CommentInput` 3, `routes/dash/action/$id` 3, `routes/dash` 2, `login`/`forgot-password`/`reset-password` 1–2 cada, e mais 15 arquivos com 1. Eles entram na **etapa 1b** (§5), depois dos primitivos.

## 2. Proposta: a aparência única

### 2.1 Escala de altura (família A)

Três tamanhos com o mesmo nome em todos os controles: `sm`, `md`, `lg`. **`md` é o padrão** quando não se passa tamanho.

| Tamanho | Altura | Texto | Ícone | Recuo lateral (com texto) | Espaço ícone↔texto | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sm` | 28px | 12px | 14px | 10px | 4px | Barras de filtro, ações dentro de cartões e listas, toolbar do editor, seletores do calendário |
| `md` | 36px | 14px | 16px | 14px | 6px | **Padrão.** Formulários, cabeçalho, diálogos, busca |
| `lg` | 44px | 14px | 20px | 18px | 8px | Botão principal de página, rodapé da gaveta, login, toque no celular |

- Botão de ícone: quadrado com a mesma altura (`icon-sm` 28, `icon-md` 36, `icon-lg` 44).
- Campo com ícone à esquerda: o ícone ocupa o recuo; texto começa em recuo + ícone + espaço.
- Combobox de chips: altura mínima = altura do tamanho; cresce em linhas.
- `xs` e o atual `lg` 56 deixam de existir.
- Campos usam texto 16px no celular (abaixo de `md`) para o iOS não dar zoom; isso já existe (`text-base md:text-sm`) e continua.

### 2.2 Formato e superfície (família A)

Uma "pele" para controles de campo e outra para botões, com formato igual:

| Parte | Campos (input, select, combobox, data, hora, cor, busca) | Botões e toggles |
| :--- | :--- | :--- |
| Raio | igual para os dois (decisão C2) | igual |
| Fundo | `bg-input/50` (o de hoje), sem borda | por variante (primário, secundário, ghost…) |
| Hover | fundo um passo mais forte | por variante |
| Foco por teclado | **um estilo único**: anel 2px `ring` (hoje há `ring-3/30`, `ring-[3px]/50`, `ring-2`) | igual |
| Inválido | borda e anel `destructive` (como hoje) | igual |
| Desativado | opacidade 50% (como hoje) | igual |
| `squircle` | sai | sai |

### 2.3 Itens de menu (família B)

Uma definição única, usada por Select, Combobox, DropdownMenu (todas as variantes, incluindo submenu) e Command:

- altura 32px, texto 14px, ícone 16px;
- recuo 8px à esquerda; 32px à direita quando há marca de seleção;
- raio 8px;
- realce `bg-secondary/50` (o de hoje) para foco e hover;
- rótulo de grupo: 12px, `text-muted-foreground`, sem caixa alta, recuo 8px.

### 2.4 Marcadores e marcação (famílias C e D)

- Badge e chip do Combobox: **20px**, pílula, texto 12px, ícone 12px.
- Kbd: 20px, raio 4px.
- Avatar: 24 / 32 / 40, sem mudança.
- Checkbox e radio: **um tamanho, 16px** (alinha com o texto de 14px); `sm`/`lg` saem. Checkbox com raio 4px.
- Slider: sem mudança.

### 2.5 Navegação (família E)

- Aba: 44px = `lg`, sem mudança.
- Dias do calendário: sem mudança nesta etapa.

## 3. Decisões do proprietário

| # | Pergunta | Opções | Recomendação |
| :--- | :--- | :--- | :--- |
| C1 | Escala de altura | **A** 28/36/44 · **B** 32/40/48 · **C** 24/32/40 | **A**. Padrão de 36px fica leve sem ficar apertado; 44 cobre toque |
| C2 | Formato dos controles de linha | **Pílula** (totalmente redondo) · **Raio 12px** | **Pílula**, nos botões e também nos campos. Textarea e editor ficam com 12px |
| C3 | Superfície dos campos | **Preenchido sem borda** (hoje) · **Contorno 1px** | **Preenchido**: mais liso |
| C4 | Rodapé da gaveta (`form-footer`, hoje 48px no AGENTS) | 44 (`lg`) · manter 48 | **44**; atualizar o AGENTS |
| C5 | Itens de menu | 32px · 28px | **32px**: confortável sem pesar |
| C6 | Checkbox/radio | só 16px · manter 16/20/24 | **Só 16px** |

## 4. Execução (etapa 1a: primitivos)

Pré-requisito: nenhum outro executor com alterações abertas em `app/components/prism/`. Em 02/11 havia mudanças locais em `button.tsx`, `calendar.tsx`, `date-range-picker.tsx`, `Header.tsx`, `ActionItemTitleInput.tsx` e `PlanningSuggestionsList.tsx`; preservá-las.

### Passo 1: tokens em `app/tailwind.css`

Adicionar no bloco `@theme inline` (namespace `--spacing-*`, que gera `h-`, `w-`, `size-`, `min-h-`, `px-`):

```css
--spacing-control-sm: 1.75rem;  /* 28px */
--spacing-control-md: 2.25rem;  /* 36px */
--spacing-control-lg: 2.75rem;  /* 44px */
--spacing-menu-item: 2rem;      /* 32px */
--spacing-marker: 1.25rem;      /* 20px */
```

Valores conforme C1/C5. Classes resultantes: `h-control-md`, `size-control-sm`, `min-h-menu-item`, `h-marker`.

### Passo 2: módulo compartilhado `app/components/prism/control.ts`

Novo arquivo (só CVA e strings, sem componente):

- `controlSize`: CVA com `size: sm | md | lg`, aplicando altura, texto, ícone (`[&_svg:not([class*='size-'])]:size-*`), recuo lateral e espaço da §2.1. Default `md`.
- `iconControlSize`: CVA `size: sm | md | lg` com `size-control-*` e ícone.
- `controlShape`: raio da C2 (`rounded-full` para pílula).
- `focusRing`: o estilo único de foco (`focus-visible:` e `data-[focus-visible]:`).
- `fieldSurface`: fundo/hover/inválido/desativado dos campos (§2.2).
- `menuItem`: classes da §2.3.
- `menuLabel`: rótulo de grupo da §2.3.

Exportar também por `prism/index.ts`.

### Passo 3: aplicar nos primitivos

| Arquivo | O que muda |
| :--- | :--- |
| `button.tsx` | `size`: `sm`/`md`/`lg`/`icon-sm`/`icon-md`/`icon-lg` (+ `unstyled`), default `md`; base usa `controlShape` + `focusRing`; tirar `squircle` e `rounded-2xl`. Manter variantes de cor e a variante `success` adicionada localmente |
| `toggle.tsx` | mesmos tamanhos, default `md`; `min-w` = altura; `controlShape` + `focusRing` |
| `toggle-group.tsx` | repassa `sm`/`md`/`lg`; grupo colado arredonda só as pontas com o mesmo formato |
| `button-group.tsx` | pontas com `controlShape`; texto/separador na altura do tamanho |
| `input.tsx`, `input-group.tsx`, `time-field.tsx`, `color-field.tsx` | `size`: `sm`/`md`/`lg`, default `md`; `fieldSurface` + `controlShape` + `focusRing`; manter `text-base md:text-sm` |
| `textarea.tsx` | `fieldSurface` + `focusRing`, raio 12px, recuo lateral do `md` |
| `select.tsx` | gatilho com `size` `sm`/`md`/`lg`; itens com `menuItem`; rótulo com `menuLabel` |
| `combobox.tsx` | campo e chips com `size`; botões internos (`icon-xs`/`icon-sm`) viram `icon-sm` no `sm` e `md`; chip com `h-marker`; itens com `menuItem`; rótulo com `menuLabel` |
| `date-range-picker.tsx` | ganhar prop `size` (`sm`/`md`/`lg`, default `md`) com `fieldSurface` |
| `command.tsx` | busca usa `InputGroup` `md`; itens com `menuItem` (sai o `rounded-2xl` e o recuo 16px) |
| `dropdown-menu.tsx` | todas as variantes de item e submenu com `menuItem`; rótulo com `menuLabel` (sem caixa alta) |
| `calendar.tsx` | seletores mês/ano com `controlSize sm` (sem fundo, como hoje) |
| `badge.tsx` | `h-marker`, `rounded-full`, sem `squircle` |
| `checkbox.tsx`, `radio-group.tsx` | um tamanho só, 16px (C6); manter a prop `size` só para o texto do rótulo |
| `dialog.tsx`, `sheet.tsx` | botão de fechar: `icon-sm` |

### Passo 4: renomear os usos de tamanho

Troca mecânica em todo `app/` (Button, LinkButton, Toggle, ToggleGroup, `buttonVariants`, Input, Select, InputGroup):

| Hoje | Novo |
| :--- | :--- |
| `size="xs"` | `size="sm"` |
| `size="sm"` | `size="md"` |
| `size="default"` ou sem `size` | `md` (padrão) |
| `size="lg"` | `size="lg"` |
| `size="icon-xs"` | `size="icon-sm"` |
| `size="icon-sm"` / `size="icon"` | `size="icon-md"` |
| `size="icon-lg"` | `size="icon-lg"` |

Também em chamadas `buttonVariants({ size: … })` (ex.: `ComboboxTrigger`, `calendar.tsx`). Conferir com `tsc --noEmit`: tamanho antigo deve dar erro de tipo.

### Passo 5: `ComboboxTrigger`

- `filter`: `buttonVariants({ variant: "ghost", size: "sm" })`.
- `form-inline` sm: `controlSize sm` + `controlShape`, sem `rounded-md`.
- `form-inline` lg: mantém o comportamento de linha da gaveta (sem altura fixa) nesta etapa; anotar para a etapa de telas.
- `form-footer`: `size: "icon-lg"`, `min-w-control-lg` (C4). Atualizar a frase do AGENTS (§3, "Gatilhos do rodapé") para a nova altura.

### Passo 6: galeria `/ui`

Acrescentar no topo da página uma seção **"Linha de controles"** (`app/components/ui-sections/ControlRowSection.tsx`, registrada em `ui-sections/index.ts` e em `routes/ui.tsx`) com três linhas, uma por tamanho. Cada linha tem, lado a lado e alinhados pelo centro: botão primário, botão secundário, ghost, botão de ícone, toggle, input, input com ícone, select, combobox, seletor de período, campo de hora e um ComboboxTrigger `filter`. Abaixo, um menu aberto estático com itens de Select, Dropdown e Command, para comparar itens.

Atualizar as seções existentes (Button, Input, Toggle, Combobox, Menu, Command, Badge, Checkbox, RadioGroup, DateRangePicker) para mostrar só os tamanhos novos.

### Passo 7: verificação do executor

- `bunx prettier --write` nos arquivos alterados.
- `bunx tsc --noEmit` sem erros.
- `grep -rnE 'size="(xs|default|icon|icon-xs)"' app` retorna vazio.
- `grep -n squircle app/components/prism` retorna só a definição de utilitário, se ela for mantida.
- Atualizar `docs/audits/CURRENT.md` com resultado e o que falta validar.

## 5. Etapa 1b: telas que fixam altura própria

Depois da validação da 1a, um arquivo por vez da lista da §1 ("Fora do Prism"): trocar `h-8/10/12`, `size-8/10/12` e botões montados à mão pelos tamanhos `sm`/`md`/`lg` ou pelo primitivo. Começar por `Header`, `GlobalSearchCommand`, `RichTextEditor` (barra `sm`), `CommentInput`, depois rotas de login e admin.

## 6. Roteiro de conferência do proprietário

Abrir `/ui` nos temas claro e escuro.

**Na "Linha de controles":**
1. Em cada linha, todos os controles têm a mesma altura e o mesmo formato. Nenhum fica mais alto, mais baixo ou mais quadrado.
2. O texto dos botões e o texto dos campos ficam na mesma linha de base.
3. Ícones têm o mesmo tamanho em botões e campos da mesma linha.
4. Tab percorre a linha: o anel de foco é idêntico em todos.
5. O menu estático: itens de Select, Dropdown e Command com a mesma altura, raio e recuo.

**Nas seções:**
6. Botão: três tamanhos e três de ícone, nada além.
7. Badge e chips com a mesma altura.
8. Checkbox e radio do mesmo tamanho, alinhados ao texto.

**No sistema (as telas ainda não foram ajustadas; olhar se algo quebrou):**
9. Cabeçalho: busca, notificações e perfil.
10. Barra de filtros do parceiro e da Home.
11. Gaveta de ação: rodapé (parceiros, responsáveis, salvar) e campos da aba Essencial.
12. Minha Conta: campos e seletores.
13. Busca global (Cmd+K): campo e itens.
14. Login da equipe e do portal.

Anotar cada ponto estranho com a tela e o controle; isso vira a lista da etapa 1b.
