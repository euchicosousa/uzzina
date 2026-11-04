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
