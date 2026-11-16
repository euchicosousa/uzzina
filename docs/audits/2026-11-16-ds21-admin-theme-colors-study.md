# Estudo DS21 — Página exclusiva do Admin para edição completa e visualização lado a lado de todas as cores dos temas

**Data:** 16/11/2026  
**Ticket:** [21-admin-theme-colors-editor.md](../../.scratch/design-system-audit/issues/21-admin-theme-colors-editor.md)  
**Protótipo interativo (HTML autocontido):** [prototipo-ds21-editor-cores-admin.html](../../.scratch/design-system-audit/prototipo-ds21-editor-cores-admin.html)  
**Escopo desta entrega:** Levantamento técnico completo das cores editáveis vs. cores calculadas em tempo real, arquitetura do painel de laboratório de cores do Admin (`/app/admin/themes`) e protótipo funcional navegável. Nenhum arquivo de código da aplicação foi alterado.

---

## 1. Resumo executivo (O que é o DS21)

Hoje, o controle das cores da UZZINA está espalhado em três lugares desconectados:

1. **Minha Conta → Aparência → Personalizado (`CustomThemePanel.tsx`):** edita apenas 4 cores Hex por modo (`primary`, `primaryFg`, `bg`, `fg`), cor/opacidade da sombra, relevo booleano e cor da borda superior. Não edita as 11 paletas oficiais nem expõe os deltas de luma (`card`, `popover`, `input`, `border`, `action`, `action-hover`), as porcentagens de mistura (`secondary`, `secondary-foreground`, `overlay`, fundos semânticos), os feedbacks ou as fases.
2. **Galeria `/ui` → Cores Semânticas (`TokensColorsSection.tsx`):** somente leitura; além disso, nos componentes reais, o estado de **hover** só aparece ao passar o mouse em um item por vez.
3. **Código-fonte (`app/lib/palettes.ts`, `app/tailwind.css` e `app/components/prism/button.tsx`):** concentra dezenas de valores OKLCH, deltas de luminosidade (`ΔL`) e misturas (`color-mix`) que hoje exigem editar código para qualquer ajuste fino.

O **DS21** propõe uma **página exclusiva do Administrador (`/app/admin/themes`)** dividida em duas áreas:

- **Esquerda (Mostruário vivo de componentes reais):** exibe cartões de ação (`ActionItem` em linha e bloco, com relevo e planos, atrasados e nas 6 fases em versão Suave e Viva), botões `PrismButton` em todas as variantes, `PrismToggleGroup`/`PrismButtonGroup`, campos `PrismInput` (repouso, foco e erro), menus/popovers flutuantes (`bg-popover`), alertas, badges e colunas de prioridade — **sempre com o estado Original (Repouso) e os estados Hover / Foco / Ativo exibidos lado a lado permanentemente, sem precisar passar o mouse**.
- **Direita (Barra lateral de edição completa):** lista todas as famílias de cor com controles de **Matiz (`H`), Croma (`C`), Luminosidade (`L`), Delta de Luma (`ΔL`), Transparência/Mistura (`%`) e Seletor Hex**, separando visualmente e lado a lado as **Cores Originais Editáveis** das **Cores Calculadas em Tempo Real (`⚡ Auto / Calculada`)**.

---

## 2. Inventário completo: (A) Cores Diretamente Editáveis vs. (B) Cores Calculadas em Tempo Real

A distinção central pedida para a página do Admin é deixar explícito **o que é uma cor de entrada (mãe/original)** e **o que nasce automaticamente de uma fórmula em tempo real**, mostrando ambas lado a lado com um selo visual claro (`⚡ Calculada em tempo real`) e a fórmula curta.

### Família 1 — Superfícies, Estrutura, Texto Neutro e Sombras

#### (A) Cores e parâmetros diretamente editáveis na barra lateral

| Token / Controle                                     | Variável / Origem atual                                              | Tipo de controle na barra direita  | Padrão Claro (ex.: Ônix)   | Padrão Escuro (ex.: Ônix)   |
| ---------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------- | -------------------------- | --------------------------- |
| **Fundo da Página (`Background`)**                   | `--background-override` (`palettes.ts` `bg`)                         | Cor OKLCH (`L`, `C`, `H`) + Hex    | `oklch(0.96 0.002 200)`    | `oklch(0.20 0.01 250)`      |
| **Texto Principal (`Foreground`)**                   | `--foreground-override` (`palettes.ts` `fg`)                         | Cor OKLCH (`L`, `C`, `H`) + Hex    | `oklch(0 0 0)`             | `oklch(1 0 0)`              |
| **Delta de Luma — Card (`ΔL Card`)**                 | `--card-l-delta` / `--dark-card-l-delta`                             | Slider `ΔL` (`-0.25` a `+0.25`)    | `-0.02`                    | `+0.05`                     |
| **Delta de Luma — Popover (`ΔL Popover`)**           | `--popover-l-delta` / `--dark-popover-l-delta`                       | Slider `ΔL` (`-0.25` a `+0.25`)    | `+0.02` (CSS base `0`)     | `-0.03`                     |
| **Delta de Luma — Input (`ΔL Input`)**               | `--input-l-delta` / `--dark-input-l-delta`                           | Slider `ΔL` (`-0.25` a `+0.25`)    | `-0.04` (CSS base `-0.05`) | `+0.02` (CSS base `+0.05`)  |
| **Delta de Luma — Border (`ΔL Border`)**             | `--border-l-delta` / `--dark-border-l-delta`                         | Slider `ΔL` (`-0.25` a `+0.30`)    | `-0.07` (CSS base `-0.05`) | `+0.10` (CSS base `+0.20`)  |
| **Delta de Luma — Action (`ΔL Action`)**             | `--action-l-delta` / `--dark-action-l-delta`                         | Slider `ΔL` (`-0.15` a `+0.25`)    | `+0.02`                    | `+0.10`                     |
| **Delta de Luma — Action Hover (`ΔL Action Hover`)** | `--action-hover-l-delta` / `--dark-action-hover-l-delta`             | Slider `ΔL` (`-0.15` a `+1.00`)    | `+0.10` (CSS base `+0.04`) | `+0.20`                     |
| **Cor da Sombra (`Shadow Tint`)**                    | `--shadow-color-override` / `--dark-shadow-color-override`           | Cor OKLCH (`L`, `C`, `H`) + Hex    | `oklch(0.25 0.01 200)`     | `oklch(0.10 0.01 200)`      |
| **Opacidade Base da Sombra (`Shadow Alpha`)**        | `--shadow-opacity-override` / `--dark-shadow-opacity-override`       | Slider `%` (`1%` a `100%`)         | `10%`                      | `50%` (CSS base `25%`)      |
| **Relevo dos Cartões (`Action Relief`)**             | `palette.relief` → `--action-relief`                                 | Switch (`Ativo = 1` / `Plano = 0`) | `true` (`1`)               | `true` (`1`)                |
| **Borda de Topo da Ação (`Action Top Border`)**      | `--action-top-border-override` / `--dark-action-top-border-override` | Cor Hex/RGBA + Opacidade           | `#ffffff`                  | `rgba(255, 255, 255, 0.10)` |

#### (B) Cores calculadas em tempo real (exibidas ao lado da cor mãe com selo `⚡ Auto`)

| Cor Calculada                            | Cor Mãe (Origem)                        | Fórmula exata no Claro                                                             | Fórmula exata no Escuro                                                             | Onde aparece nos componentes reais                                                                                                                  |
| ---------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`bg-card` (`--card`)**                 | `Background` + `--card-l-delta`         | `oklch(from var(--background) calc(l + var(--card-l-delta)) c h)`                  | `oklch(from var(--background) calc(l + var(--dark-card-l-delta)) c h)`              | Alertas neutros (`PrismAlert default`), `PrismBadge default`, base dos fundos semânticos                                                            |
| **`bg-popover` (`--popover`)**           | `Background` + `--popover-l-delta`      | `oklch(from var(--background) calc(l + var(--popover-l-delta)) c h)`               | `oklch(from var(--background) calc(l + var(--dark-popover-l-delta)) c h)`           | `PrismPopover`, `PrismDropdownMenu`, `PrismSelect`, `PrismCommand`, `PrismDialog`, `AppBar`                                                         |
| **`bg-input` (`--input`)**               | `Background` + `--input-l-delta`        | `oklch(from var(--background) calc(l + var(--input-l-delta)) c h)`                 | `oklch(from var(--background) calc(l + var(--dark-input-l-delta)) c h)`             | `PrismInput`, `PrismTextarea`, `PrismSelectTrigger`, `PrismCombobox`                                                                                |
| **`border-border` (`--border`)**         | `Background` + `--border-l-delta`       | `oklch(from var(--background) calc(l + var(--border-l-delta)) c h)`                | `oklch(from var(--background) calc(l + var(--dark-border-l-delta)) c h)`            | Divisórias, bordas de botões `outline`, tabelas, células do calendário                                                                              |
| **`bg-action` (`--action`)**             | `Background` + `--action-l-delta`       | `oklch(from var(--background) calc(l + var(--action-l-delta)) c h)`                | `oklch(from var(--background) calc(l + var(--dark-action-l-delta)) c h)`            | Cartão de ação (`ActionItem`) em repouso                                                                                                            |
| **`bg-action-hover` (`--action-hover`)** | `Background` + `--action-hover-l-delta` | `oklch(from var(--background) calc(l + var(--action-hover-l-delta)) c h)`          | `oklch(from var(--background) calc(l + var(--dark-action-hover-l-delta)) c h)`      | Cartão de ação (`ActionItem`) em estado hover                                                                                                       |
| **`bg-secondary` (`--secondary`)**       | `Foreground`                            | `color-mix(in srgb, var(--foreground) 5%, transparent)`                            | `color-mix(in oklch, var(--foreground) 10%, transparent)`                           | Botão `secondary` em repouso, hover de botões `outline` e `ghost`, hover de abas e itens de menu, estado selecionado de `PrismToggle` ghost/outline |
| **`text-secondary-foreground`**          | `Foreground`                            | `color-mix(in srgb, var(--foreground) 65%, transparent)`                           | `color-mix(in srgb, var(--foreground) 65%, transparent)`                            | Subtítulos, metadados de parceiro/data nos cartões, descrições e rótulos auxiliares                                                                 |
| **`bg-overlay` (`--color-overlay`)**     | `Shadow Tint`                           | `color-mix(in srgb, var(--shadow-tint) 30%, transparent)`                          | `color-mix(in srgb, var(--shadow-tint) 30%, transparent)`                           | Backdrop escurecido atrás de `PrismDialog` e da gaveta `Sheet`                                                                                      |
| **`ring-action-ring` (`--action-ring`)** | `Shadow Tint` (`--action-shadow-color`) | `color-mix(in srgb, var(--action-shadow-color) 5%, transparent)` (ou `0` se plano) | `color-mix(in srgb, var(--action-shadow-color) 20%, transparent)` (ou `0` se plano) | Contorno externo de 1px do cartão de ação com relevo                                                                                                |
| **`shadow-action` (`--action-shadow`)**  | `Shadow Tint`                           | `0 1px 2px 0 color-mix(in srgb, var(--action-shadow-color) 14%, transparent)`      | `0 1px 2px 0 color-mix(in srgb, var(--action-shadow-color) 35%, transparent)`       | Sombra de repouso do `ActionItem`                                                                                                                   |
| **`shadow-action-hover`**                | `Shadow Tint`                           | `10px/15px` + `4px/6px` com `18%` de `--action-shadow-color`                       | `10px/15px` + `4px/6px` com `50%` de `--action-shadow-color`                        | Sombra de elevação no hover do `ActionItem`                                                                                                         |
| **`shadow-2xs` até `shadow-2xl`**        | `Shadow Tint` + `Shadow Alpha`          | Multiplicadores `0.5x`, `0.6x`, `0.8x`, `1.0x` e `2.5x` sobre `--shadow-alpha`     | Mesma escala sobre `--shadow-alpha` do modo escuro                                  | Elevação de popovers (`shadow-lg`), toasts (`shadow-toast`), diálogos                                                                               |

---

### Família 2 — Marca, Destaque, Foco e Estados dos Botões (`PrismButton` / `PrismToggle`)

#### (A) Cores diretamente editáveis

| Token / Controle                               | Variável / Origem atual                     | Tipo de controle na barra direita                    | Padrão Claro (Ônix / Rubi)                         | Padrão Escuro (Ônix / Rubi)                        |
| ---------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| **Cor Principal (`Primary`)**                  | `--primary-l`, `--primary-c`, `--primary-h` | Cor OKLCH (`L`, `C`, `H`) + Hex                      | Ônix: `oklch(0 0 0)` / Rubi: `oklch(0.62 0.25 20)` | Ônix: `oklch(1 0 0)` / Rubi: `oklch(0.68 0.25 20)` |
| **Texto sobre Primary (`Primary Foreground`)** | `--primary-foreground-override`             | Cor OKLCH (`L`, `C`, `H`) + Hex + Auto-contraste     | `oklch(1 0 0)` (`#FFFFFF`)                         | Ônix: `oklch(0 0 0)` / Rubi: `oklch(1 0 0)`        |
| **Cor Base do Anel de Foco (`Ring`)**          | `--ring-override` / `--dark-ring-override`  | Toggle "Seguir Primary" ou Cor OKLCH (`L`, `C`, `H`) | Segue `Primary`                                    | Segue `Primary`                                    |

#### (B) Cores calculadas em tempo real (Estados de Hover, Destaque e Foco)

| Cor Calculada                                      | Cor Mãe (Origem)           | Fórmula exata no Claro                                                           | Fórmula exata no Escuro                                                                         | Onde aparece nos componentes reais                                                                   |
| -------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Hover do Botão `default` (`Primary Hover`)**     | `Primary` + `Background`   | `color-mix(in oklab, var(--primary), var(--background) 20%)` (`button.tsx`)      | `color-mix(in oklab, var(--primary), var(--background) 20%)`                                    | Estado `hover` do `PrismButton variant="default"` e do `PrismToggle variant="secondary"` selecionado |
| **Hover do Botão `secondary` (`Secondary Hover`)** | `Secondary` + `Foreground` | `color-mix(in oklch, var(--secondary), var(--foreground) 5%)` (`button.tsx`)     | `color-mix(in oklch, var(--secondary), var(--foreground) 5%)`                                   | Estado `hover` do `PrismButton variant="secondary"`                                                  |
| **Hover dos Botões `outline` e `ghost`**           | `Foreground` (`Secondary`) | `var(--secondary)` (`5%` de `Foreground`)                                        | `var(--secondary)` (`10%` de `Foreground`)                                                      | Estado `hover` e `aria-expanded` de `outline` e `ghost`, e selecionado de `PrismToggle`              |
| **`bg-accent` (`--accent`)**                       | `Primary`                  | `oklch(max(0, calc(var(--primary-l) - 0.15)) var(--primary-c) var(--primary-h))` | `oklch(min(1, calc(var(--dark-primary-l) + 0.10)) var(--dark-primary-c) var(--dark-primary-h))` | Destaques secundários da marca guiados pela paleta                                                   |
| **Halo Externo de Foco (`ring-ring/30`)**          | `Ring`                     | `color-mix(in oklab, var(--ring) 30%, transparent)` (`ring-3`)                   | `color-mix(in oklab, var(--ring) 30%, transparent)` (`ring-3`)                                  | Anel de `3px` em `focus-visible` de todos os botões, inputs, selects e toggles                       |
| **Borda Interna de Foco (`border-ring/60`)**       | `Ring`                     | `color-mix(in oklab, var(--ring) 60%, transparent)`                              | `color-mix(in oklab, var(--ring) 60%, transparent)`                                             | Borda de `1px` em `focus-visible` de controles Prism                                                 |

---

### Família 3 — Estágios / Fases da Ação (`PHASES` + `phase-surface` + `phase-vivid`)

Cada uma das 6 fases possui **1 cor mãe editável** (`--phase-color` em `CONSTANTS.ts`) e **11 variações calculadas em tempo real** pelo CSS (`@utility phase-surface` e `@utility phase-vivid` em `app/tailwind.css`).

#### (A) Cores originais diretamente editáveis das 6 fases

| Fase (`PHASES`)  | Slug       | Hex atual (`CONSTANTS.ts`) | Equivalente OKLCH aproximado |
| ---------------- | ---------- | -------------------------- | ---------------------------- |
| **1. Ideia**     | `idea`     | `#fbbf24`                  | `oklch(0.828 0.165 84.4)`    |
| **2. Fazer**     | `do`       | `#f97316`                  | `oklch(0.705 0.191 47.6)`    |
| **3. Fazendo**   | `doing`    | `#ec4899`                  | `oklch(0.656 0.216 354.3)`   |
| **4. Análise**   | `review`   | `#a855f7`                  | `oklch(0.627 0.233 303.9)`   |
| **5. Feito**     | `done`     | `#38bdf8`                  | `oklch(0.746 0.143 232.7)`   |
| **6. Concluído** | `finished` | `#4ade80`                  | `oklch(0.800 0.182 151.7)`   |

_(Além das 6 cores, o painel oferece os parâmetros de preferência da Fase Viva: `data-vivid-text="dark" | "light"` e `data-vivid-dark="full" | "dim"`)._

#### (B) Cores de Fase calculadas em tempo real (exibidas lado a lado com a Cor Original da Fase)

1. **Modo Fase Suave (`@utility phase-surface` — DS11):**
   - **Fundo Suave em Repouso (`--action`):** `color-mix(in oklch, var(--phase-color) 7%, var(--action-base))` no Claro | `color-mix(in oklch, var(--phase-color) 14%, var(--action-base))` no Escuro.
   - **Fundo Suave em Hover (`--action-hover`):** `color-mix(in oklch, var(--phase-color) 12%, var(--action-hover-base))` no Claro | `color-mix(in oklch, var(--phase-color) 22%, var(--action-hover-base))` no Escuro.
   - **Texto da Fase Suave (`--phase-fg`):** `oklch(from var(--phase-color) 0.35 0.07 h)` no Claro | `oklch(from var(--phase-color) 0.92 0.06 h)` no Escuro.
   - **Contorno/Anel Suave (`--action-ring`):** `color-mix(in srgb, var(--phase-color) 30%, transparent)` no Claro | `color-mix(in srgb, var(--phase-color) 55%, transparent)` no Escuro (multiplicado por `--action-relief`).
   - **Sombra de Hover Suave (`--phase-shadow`):** `oklch(from var(--phase-color) 0.60 0.15 h)` a `25%` no Claro | `oklch(from var(--phase-color) 0.33 0.10 h)` a `20%` + halo difuso `oklch(from var(--phase-color) 0.20 0.15 h)` a `63%` no Escuro.

2. **Modo Fase Viva (`@utility phase-vivid` — DS17):**
   - **Fundo Vivo em Repouso (`--vivid-fill`):** `var(--phase-color)` puro (ou `oklch(from var(--phase-color) 0.72 calc(c * 0.8) h)` no Escuro quando `data-vivid-dark="dim"`).
   - **Fundo Vivo em Hover (`--action-hover`):** `oklch(from var(--vivid-fill) calc(l + 0.04) c h)` com tinta escura | `oklch(from var(--vivid-fill) calc(l - 0.04) c h)` com tinta clara (`data-vivid-text="light"`).
   - **Texto e Ícones da Fase Viva (`--vivid-ink`):** `oklch(from var(--phase-color) 0.35 0.07 h)` (tinta escura padrão) | `oklch(from var(--phase-color) 0.98 0.025 h)` (tinta clara).
   - **Contorno/Anel Vivo (`--action-ring`):** `oklch(from var(--vivid-fill) calc(l - 0.06) c h)` no Claro | `oklch(from var(--vivid-fill) calc(l - 0.14) c h)` no Escuro.
   - **Filete de Brilho Superior (`--action-top-border`):** `color-mix(in oklch, white 45%, var(--action))` no Claro | `color-mix(in oklch, white 25%, var(--action))` no Escuro (acompanha `--action-hover` no hover e zera se sem relevo).
   - **Sombra de Hover Viva (`--vivid-shadow`):** `oklch(from var(--phase-color) 0.55 0.16 h)` a `40%` de opacidade.

---

### Família 4 — Feedbacks Semânticos (Erro, Aviso, Sucesso, Sucesso Firme, Informação) e Cartão Atrasado (`late-surface`)

#### (A) Cores base diretamente editáveis

| Família Semântica                      | Variáveis atuais (`app/tailwind.css`)       | Valor Claro                              | Valor Escuro                             |
| -------------------------------------- | ------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| **Erro (`--color-error`)**             | `--error-hue: 16.339`, `--chroma: 0.2`      | `oklch(0.80 0.22 16.339)`                | `oklch(0.861 0.20 16.339)`               |
| **Aviso (`--color-warning`)**          | `--warning-hue: 70` (claro) / `90` (escuro) | `oklch(1.00 0.20 70)`                    | `oklch(1.00 0.20 90)`                    |
| **Sucesso (`--color-success`)**        | Família Emerald unificada                   | `oklch(0.508 0.14 163)`                  | `oklch(0.65 0.16 163)`                   |
| **Informação (`--color-info`)**        | `--info-hue: 250`, `--luminosity: 0.7`      | `oklch(0.84 0.20 250)`                   | `oklch(0.84 0.20 250)`                   |
| **Sucesso Firme (`--success-strong`)** | `--color-emerald-600` (fixo nos 2 modos)    | `oklch(0.596 0.145 163.225)` (`#059669`) | `oklch(0.596 0.145 163.225)` (`#059669`) |

#### (B) Cores semânticas calculadas em tempo real

| Cor Calculada                                  | Cor Mãe (Origem)                       | Fórmula exata no Claro                                                                           | Fórmula exata no Escuro                                                                            | Onde aparece nos componentes reais                                                                             |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`text-error-foreground`**                    | `--color-error`                        | `oklch(0.60 0.22 16.339)` (L reduzido p/ leitura)                                                | `var(--color-error)` (`L = 0.861`)                                                                 | Texto de `PrismAlert error`, `PrismBadge error`, botão `error`/`ghost-error`, input inválido e cartão atrasado |
| **`bg-error-background`**                      | `--color-error` + `--card`             | `color-mix(in oklch, var(--color-error) 13%, var(--card))`                                       | `color-mix(in oklch, var(--color-error) 14%, var(--card))`                                         | Fundo 100% opaco de alerta, badge, botão `error`, hover de `ghost-error` e input `aria-invalid`                |
| **Fundo de Cartão Atrasado (Repouso)**         | `bg-error-background`                  | `color-mix(in oklab, var(--color-error-background) 80%, transparent)` (`bg-error-background/80`) | `bg-error-background/80`                                                                           | `ActionItem` atrasado em repouso (no hover vai a `100%` `bg-error-background`)                                 |
| **Sombra de Cartão Atrasado (`late-surface`)** | `--error-foreground` / `--color-error` | Repouso: `25%` de `--error-foreground`; Hover: `30%` de `--error-foreground`                     | Base `--late-shadow: oklch(from var(--color-error) 0.45 0.18 h)` a `50%` (repouso) e `60%` (hover) | Sombra avermelhada de `ActionItem` atrasado                                                                    |
| **`text-warning-foreground`**                  | `--color-warning`                      | `oklch(0.50 0.20 70)`                                                                            | `var(--color-warning)`                                                                             | Texto e ícone de `PrismAlert warning` e `PrismBadge warning`                                                   |
| **`bg-warning-background`**                    | `--color-warning` + `--card`           | `color-mix(in oklch, var(--color-warning) 7%, var(--card))`                                      | `color-mix(in oklch, var(--color-warning) 14%, var(--card))`                                       | Fundo opaco de `PrismAlert warning` e `PrismBadge warning`                                                     |
| **`text-success-foreground`**                  | `--color-success`                      | `oklch(0.42 0.14 163)`                                                                           | `var(--color-success)`                                                                             | Texto de feedback suave de sucesso                                                                             |
| **`bg-success-background`**                    | `--color-success` + `--card`           | `color-mix(in oklch, var(--color-success) 7%, var(--card))`                                      | `color-mix(in oklch, var(--color-success) 14%, var(--card))`                                       | Fundo opaco de `PrismAlert success` e `PrismBadge success`                                                     |
| **`bg-success-strong-hover`**                  | `--success-strong`                     | `--color-emerald-700` (`oklch(0.508 0.118 165.612)` / `L - 0.088`)                               | `--color-emerald-700`                                                                              | Estado `hover` do `PrismButton variant="success"`                                                              |
| **`text-info-foreground`**                     | `--color-info`                         | `oklch(0.50 0.20 250)`                                                                           | `var(--color-info)`                                                                                | Texto e ícone de `PrismAlert info` e `PrismBadge info`                                                         |
| **`bg-info-background`**                       | `--color-info` + `--card`              | `color-mix(in oklch, var(--color-info) 7%, var(--card))`                                         | `color-mix(in oklch, var(--color-info) 14%, var(--card))`                                          | Fundo opaco de `PrismAlert info` e `PrismBadge info`                                                           |

---

### Família 5 — Prioridades do Quadro Hoje (`PRIORITIES`)

| Token                | Variável CSS        | Valor Claro (`:root`)  | Valor Escuro (`.dark`) | Uso nos componentes                                         |
| -------------------- | ------------------- | ---------------------- | ---------------------- | ----------------------------------------------------------- |
| **Prioridade Baixa** | `--priority-low`    | `oklch(0.70 0.17 150)` | `oklch(0.75 0.16 150)` | Ícone/indicador e coluna de prioridade Baixa no quadro Hoje |
| **Prioridade Média** | `--priority-medium` | `oklch(0.82 0.16 90)`  | `oklch(0.85 0.15 95)`  | Ícone/indicador e coluna de prioridade Média no quadro Hoje |
| **Prioridade Alta**  | `--priority-high`   | `oklch(0.65 0.22 25)`  | `oklch(0.70 0.20 25)`  | Ícone/indicador e coluna de prioridade Alta no quadro Hoje  |

---

## 3. Como representar o indicativo visual de "Calculada em tempo real" e os estados lado a lado

Para atender exatamente ao pedido do proprietário:

1. **Na barra lateral direita (Painel de Edição):**
   - Cada **Cor Mãe (Original Editável)** tem controles ativos de **Matiz (`H`), Croma (`C`), Luminosidade (`L`) e Hex** (ou controles de `ΔL` / `%` quando o próprio parâmetro da derivada for editável).
   - Logo abaixo ou ao lado de cada Cor Mãe aparece o bloco **"Derivadas em tempo real (`⚡ Auto`)"**, conectado por uma linha-guia vertical (`├─`, `└─`).
   - Cada cor calculada exibe:
     - **Amostra ao vivo (swatch)** que muda no mesmo instante em que a cor mãe é arrastada;
     - **Selo `⚡ Calculada`** (ou `⚡ Auto`) com a **fórmula curta legível** (ex.: `Primary + 20% Background`, `Background + ΔL -0.02`, `7% Fase sobre Action`, `13% Erro sobre Card`);
     - **Código Hex e OKLCH resolvidos em tempo real** para conferência imediata;
     - Quando a cor calculada possui um parâmetro de calibragem (como o `ΔL` de `Card`, `Popover`, `Input`, `Border`, `Action`, `Action Hover` ou a `%` de mistura da `Fase Suave`), o slider desse parâmetro fica integrado ali mesmo, mas o matiz e o croma mostram claramente que vêm da cor mãe.

2. **Na área principal à esquerda (Mostruário de Componentes Reais sem esperar hover):**
   - **Cartões de Ação (`ActionItem`):** cada variante (Padrão com Relevo, Atrasado `late-surface`, Fase Suave nas 6 fases e Fase Viva nas 6 fases) é renderizada em uma **grade de pares fixos lado a lado**:
     - Coluna 1: **Estado Original (Repouso)** (`bg-action`, `shadow-action`, `border-action-top-border`);
     - Coluna 2: **Estado Hover permanente** (`bg-action-hover`, `shadow-action-hover`, selo `⚡ Hover Calculado`), sem precisar passar o mouse.
   - **Botões (`PrismButton`):** todas as 7 variantes (`default`, `secondary`, `outline`, `ghost`, `error`, `ghost-error`, `success`) são exibidas em uma matriz com **3 colunas permanentes lado a lado**:
     - Coluna 1: **Repouso (Original)**;
     - Coluna 2: **Hover (`⚡ Calculado` — ex.: `80% Primary + 20% Bg`, `Secondary + 5% Fg`, `bg-secondary`, `bg-success-strong-hover`)**;
     - Coluna 3: **Foco (`⚡ Calculado` — `ring-3 ring-ring/30 + border-ring/60`)**.
   - **Tira completa das 6 Fases (`Ideia`, `Fazer`, `Fazendo`, `Análise`, `Feito`, `Concluído`):**
     - Para cada fase, uma linha mostra **6 cartões/amostras lado a lado**:
       1. **Cor Original da Fase** (editável);
       2. **Fase Suave — Repouso** (`⚡ 7% / 14%`);
       3. **Fase Suave — Hover** (`⚡ 12% / 22%`);
       4. **Fase Viva — Repouso** (`⚡ Puro / Dim`);
       5. **Fase Viva — Hover** (`⚡ L ± 0.04`);
       6. **Texto & Anel calculados** (`--phase-fg`, `--vivid-ink`, `--action-ring`).

---

## 4. O que precisará virar variável CSS quando a página for implementada

Hoje `applyPaletteVars()` em `app/lib/palette-vars.ts` já injeta dinamicamente `--primary-h/c/l`, `--background-override`, `--foreground-override`, `--ring-override`, os 6 `--*-l-delta`, `--shadow-color-override`, `--shadow-opacity-override`, `--action-relief` e `--action-top-border-override`.

Caso o proprietário queira que os demais parâmetros fixos em `app/tailwind.css` também sejam editáveis pelo Admin em tempo real na futura implementação, basta expor as seguintes variáveis CSS com fallback para os valores atuais (zero quebra de compatibilidade):

- **Transparências de Foreground e Sombra:** `--secondary-mix` (`5%` claro / `10%` escuro), `--secondary-fg-mix` (`65%`), `--overlay-alpha` (`30%`), `--action-ring-alpha` (`5%` claro / `20%` escuro).
- **Destaque e Hover de Botões:** `--accent-l-delta` (`-0.15` claro / `+0.10` escuro), `--btn-primary-hover-bg-mix` (`20%` em `button.tsx`), `--btn-secondary-hover-fg-mix` (`5%` em `button.tsx`).
- **Fases (`CONSTANTS.ts` / `tailwind.css`):** `--phase-idea-color` até `--phase-finished-color`, além dos mixes `--phase-mix` (`7%`/`14%`) e `--phase-mix-hover` (`12%`/`22%`).
- **Feedbacks e Prioridades:** `--error-bg-mix` (`13%`/`14%`), `--feedback-bg-mix` (`7%`/`14%`), e overrides opcionais para `--color-error`, `--color-warning`, `--color-success`, `--color-info`, `--success-strong` e `--priority-low/medium/high`.

---

## 5. Opções de persistência para decisão do proprietário

| Opção                                                                 | Como funciona                                                                                                                                                                                                                           | Vantagens                                                                              | Limites                                                                                      |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Opção A — Exportar código pronto (`palettes.ts` / `tailwind.css`)** | O Admin ajusta tudo ao vivo na página `/app/admin/themes` (com rascunho salvo no `localStorage` para não perder nada ao recarregar) e clica em **"Copiar código da paleta / CSS"** para atualizar o repositório.                        | Zero consulta extra no banco, zero latência no boot (`index.html`), versionado no Git. | Exige commit/deploy para valer para os demais usuários.                                      |
| **Opção B — Salvar no banco (efeito imediato global)**                | Tabela/configuração global no Supabase lida no `get_app_bootstrap` e cacheada no `localStorage`, sobrescrevendo `PALLETE` em tempo de execução.                                                                                         | O Admin clica em "Publicar tema" e toda a agência recebe na hora sem deploy.           | Exige migration + RPC administrativa e sincronização com o script anti-FOUC do `index.html`. |
| **Opção C — Híbrido (Recomendado)**                                   | Começar na Fase 1 com o laboratório vivo + rascunho persistido localmente + botão **"Exportar JSON / TypeScript (`palettes.ts`)"**, podendo ligar a gravação no banco na Fase 2 se o proprietário quiser edição em produção sem deploy. | Entrega imediata, segura e sem tocar em banco/bootstrap agora.                         | —                                                                                            |

---

## 6. Como abrir e testar o protótipo interativo agora

O protótipo completo, autocontido e fiel ao Prism/UZZINA foi gerado em:

- **Arquivo:** [`.scratch/design-system-audit/prototipo-ds21-editor-cores-admin.html`](../../.scratch/design-system-audit/prototipo-ds21-editor-cores-admin.html)

Ele inclui:

- As **11 paletas reais da UZZINA** (`Ônix`, `Carbono`, `Rubi`, `Coral`, `Damasco`, `Elétrico`, `Folha`, `Turquesa`, `Cobalto`, `Violeta`, `Fúcsia`) com todos os valores exatos de `app/lib/palettes.ts`;
- Alternância instantânea entre **Modo Claro**, **Modo Escuro** e **Opções da Fase Viva** (`Tinta Escura / Clara` e `Escuro Cheio / Atenuado`), além do switch de **Relevo dos Cartões**;
- **Mostruário completo à esquerda** com os estados **Repouso | Hover | Foco** lado a lado (sem precisar passar o mouse) e tira completa das **6 Fases (Original + Suave Repouso + Suave Hover + Viva Repouso + Viva Hover + Texto/Anel)**;
- **Barra lateral direita interativa** dividida em 5 abas/seções (_1. Superfícies & Sombras_, _2. Marca & Botões_, _3. Fases (6)_, _4. Feedbacks & Atraso_, _5. Prioridades_), com sliders de `L`, `C`, `H`, `ΔL`, `%` e seletor Hex que recalculam ao vivo todas as cores derivadas (`⚡ Auto`) e atualizam todos os componentes da esquerda em tempo real;
- Botão **"Exportar JSON / TS"** para inspecionar os valores editados.
