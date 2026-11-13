# DS10 — Investigar o anel de foco, os sinais de Sprint e a estrutura do ActionItem

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para reproduzir a transição e rastrear a interação entre foco, atraso e Sprint.
- **Anthropic** — Claude Sonnet 5.5, para avaliar a organização do componente e a precedência dos indicadores de Sprint.
- **Google** — Gemini 4 Argon, para comparar a renderização nos consumidores reais. Disponibilidade depende do plano.

**Status.** Encerrado com aceite do proprietário em 12/11/2026, absorvido pelo DS11: a conferência visual do DS11 passou pelo mesmo cartão (foco, Sprint, atraso, sombra no hover e arraste), construído sobre as mudanças deste ticket (`9e08ac0`, já no GitHub).

**Entrega.** Relatório com reprodução, causa, inventário estrutural e proposta de correção. Escopo de investigação. Nenhuma alteração no código do app nesta etapa.

**Bloqueado por.** Nenhum ticket para começar. Registrar o estado do DS06 usado na reprodução, pois seus tokens de relevo podem afetar a aparência.

## O que investigar

1. **Começar pela variante Linha.** Ao clicar na ação, o anel parece passar de duas ou três linhas ou pixels para uma. Registrar o estado antes, durante e depois do foco. Confirmar se há transição de espessura, sobreposição de ring, outline, borda e sombra ou outra causa. Comparar clique no cartão, clique no título, navegação por Tab e perda de foco. Usar estilos computados e evidência visual para distinguir hipóteses de achados.
2. **Conferir as demais variantes e usos reais.** Mapear variantes e consumidores, incluindo calendário, Kanban, Feed, Sprint e galeria quando aplicáveis. Comparar foco do cartão e dos controles internos com hover, edição, seleção e arraste. Conferir paletas com e sem relevo, temas claro/escuro e foco visível por teclado.
3. **Revisar a estrutura.** Mapear o que é compartilhado e o que muda por variante, onde estilos e eventos são compostos e se há regras duplicadas, dependências implícitas ou conflitos de precedência. Indicar o que vale manter e o que merece simplificação, separando ajustes estruturais da correção do anel.
4. **Investigar os sinais de Sprint.** O proprietário observou a ausência do indicador na paleta Carbono (`carbon`). Comparar a mesma ação na mesma variante em Carbono e em outra paleta, mantendo o estado de atraso e de foco. Verificar separadamente raio e anel, e distinguir se a paleta afeta a renderização ou apenas a visibilidade do indicador, incluindo os tokens de relevo do DS06. Reproduzir a ação atrasada em Sprint que aparece vermelha e com raio, mas sem anel de Sprint, e as demais ações em Sprint que não mostram nem raio nem anel. Rastrear separadamente os dados da ação, o Sprint ativo da pessoa, as condições de exibição do ícone e do anel e os pontos que montam cada variante. Conferir se o atraso, o foco ou a seleção suprimem o anel e se alguma variante ou configuração omite os dois indicadores. Comparar ações em Sprint atrasadas e no prazo, com e sem foco, com uma ação fora do Sprint como controle. Registrar quando cada indicador deveria aparecer e propor como manter a associação visível junto ao estado de atraso.
5. **Investigar o recorte lateral das sombras em Hoje.** Reproduzir o corte visto nas capturas, começando por Hoje → Parceiros. Comparar com a Sprint usando a mesma paleta e, quando possível, o mesmo cartão e variante. Ambos renderizam `ActionItem`, mas Hoje → Parceiros usa `ActionContainer` e a Sprint usa seu próprio grid com `SortableItem`. Identificar qual ancestral recorta a sombra, inspecionando padding, overflow e máscaras de rolagem. Testar a hipótese de aumentar apenas o padding horizontal de 1 para 2 na escala do projeto (`px-2`) e comparar com um espaçamento interno compartilhado entre as listas. Propor como unificar o tratamento da sombra, conferindo largura útil, alinhamento, rolagem, foco e arraste. Incluir os demais consumidores de `ActionContainer` na avaliação se o ajuste for compartilhado.
6. **Propor a correção.** Recomendar o menor ajuste que produza um contorno estável e legível e elimine o recorte indevido das sombras. Explicar os impactos e registrar um roteiro de aceite que cubra foco, abertura da ação, edição do título, seleção e arraste.

---

## Relatório de Investigação e Implementação (08/11/2026)

**Estado base encontrado antes desta rodada:**

- O commit `314c2a9` já havia corrigido o problema das paletas planas (`relief: false`, como **Carbono** e **Cobalto**) em `app/lib/palette-vars.ts`: trocou `--action-shadow-override: none` por `0 0 #0000`, pois `none` ao final da lista `box-shadow` do Tailwind v4 invalidava toda a declaração CSS e apagava os anéis (`ring`, `ring-2`, `focus-within:ring-4`).
- O proprietário também realizou ajuste pessoal de luminosidade em `app/lib/palettes.ts` (`carbon.dark.primary.l` para `0.4`), preservado integralmente.

### 1. O anel de foco na variante Linha (e demais variantes): por que passava de 3px para 1px ao clicar

#### Reprodução dos estados computados (antes, durante e depois do clique)

Em [`ActionItem.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionItem.tsx#L128-L190), o elemento raiz `<div role="button" tabIndex={0}>` combinava:

- **Em repouso (sem foco):**
  - `border-t border-action-top-border` (`1px solid #fff` no claro com relevo, ou `transparent` sem relevo);
  - `ring ring-action-ring` → `--tw-ring-shadow: 0 0 0 1px var(--action-ring)` (`1px` externo via `box-shadow`);
  - `shadow-action` → `--tw-shadow: var(--shadow-action)`.
  - **Ponto crítico do CSS (`outline-width`):** em `@layer base` (`app/tailwind.css:482`), `* { @apply border-border outline-ring/30; }` define a cor do `outline`, mas em repouso não havia `outline-width` explícito no `ActionItem`. Pela especificação CSS, o valor inicial (_initial value_) de `outline-width` em qualquer elemento é **`medium` (`3px`)**, enquanto `outline-style` é `none`.
- **Durante `:focus-within` (`focus-within:outline-1 focus-within:outline-ring/45 focus-within:ring-4 focus-within:ring-ring/30`):**
  - No instante em que `:focus-within` ativava (`t = 0ms`), `.focus-within\:outline-1:focus-within` aplicava `outline-style: var(--tw-outline-style)` (`solid`, que muda instantaneamente em `0ms` por ser discreto) e `outline-width: 1px`.
  - Como `bgClasses` continha **`transition-all duration-500`** (que sobrescrevia o `transition-colors` da variante Linha), o navegador interpolava `outline-width` do seu valor inicial **`3px` (`medium`) até `1px` ao longo de 500ms**!
  - Simultaneamente, `--tw-ring-shadow` (`box-shadow`) interpolava sua espessura durante `500ms` (de `1px` para `4px` ao focar para editar o título, ou de `4px` de volta para `1px` quando o clique no corpo do cartão abria a gaveta e tirava o foco do cartão).
  - Além disso, enquanto o botão do título (`ActionItemTitleInput.tsx:101–108`) já descartava o foco vindo de clique de mouse (`if (!event.currentTarget.matches(":focus-visible")) event.currentTarget.blur()`), o `<div role="button" tabIndex={0}>` do cartão não tinha essa guarda: clicar ou arrastar pelo corpo do cartão ativava `:focus-within` pelo mouse antes de abrir a gaveta.

#### Correção aplicada no `ActionItem.tsx`

1. Substituído `transition-all duration-500` em `bgClasses` por `transition-colors duration-200` (e removidos o `transition-colors` redundante e o segundo `squircle` duplicado de `variantClasses` na variante Linha). Com isso, `outline-width` e `box-shadow` nunca sofrem transição de espessura: o contorno aprovado (`focus-within:outline-1 focus-within:outline-ring/45 focus-within:ring-4 focus-within:ring-ring/30`) entra e sai de forma imediata e estável, sem começar em `3px` e encolher para `1px`.
2. Adicionada no `<div role="button" tabIndex={0}>` a mesma guarda `onFocus` de `ActionItemTitleInput.tsx` (quando `event.target === event.currentTarget` e `!matches(":focus-visible")`, executa `blur()`), preservando o foco por teclado (`Tab`) e o foco de edição do título (`<input>`), sem piscar anel de foco em cliques ou arrastes de mouse no corpo do cartão.

---

### 2. Mapeamento das variantes e consumidores reais

| Consumidor                            | Arquivo                                                     | Wrapper de lista                                                                                      | Variante(s) usada(s)                                                 | `displayFlags` passadas                                                                                        |
| :------------------------------------ | :---------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Hoje → Parceiros**                  | `app/components/layout/PartnersBoard.tsx:115`               | `PartnerColumn` (`overflow-hidden`) → `ActionContainer` (`p-1 pb-6 overflow-y-auto`)                  | `viewOptions.variant` (`line` padrão, `block`, `content`)            | `showCategory`, `showResponsibles`, `showPriority`, `showLate: true` (`showSprint` usa default `true`)         |
| **Hoje → Categorias**                 | `app/components/layout/CategoriesBoard.tsx:98`              | `CategoryColumn` (`overflow-hidden`) → `ActionContainer` (`p-1 pb-6 overflow-y-auto`)                 | `viewOptions.variant` (`line` padrão, `block`, `content`)            | `showPartner`, `showResponsibles`, `showPriority`, `showLate: true` (`showSprint` default `true`)              |
| **Hoje → Tarefas de Hoje / Próximas** | `app/components/features/home/TodayViewParts.tsx:137`       | `ActionContainer` (`p-1 pb-6 overflow-y-auto`)                                                        | `viewOptions.variant` (`line` padrão, `block`, `content`)            | `showCategory`, `showLate`, `showPartner`, `showPriority`, `showResponsibles` (`showSprint` default `true`)    |
| **Hoje → Sprint**                     | `app/components/features/home/HomeSprintView.tsx:131,148`   | `<div className="px-8">` → `<div className="... gap-2 p-1">` (sem `ActionContainer` e sem `overflow`) | `viewOptions.variant` (`block` padrão, `line`, `content`)            | `showCategory: true`, `showLate: true`, `showPartner: true`, **`showSprint: false`**, `showResponsibles: true` |
| **Hoje → Atrasadas**                  | `app/components/features/home/HomeLateView.tsx:34`          | `<div className="px-8">` → `ActionContainer` (`p-1 pb-6 overflow-y-auto`)                             | `viewOptions.variant` (`block` padrão, `line`, `content`)            | `showCategory`, `showLate`, `showPartner`, `showPriority`, `showResponsibles` (`showSprint` default `true`)    |
| **Kanban (Fases)**                    | `app/components/layout/KanbanPhasesBoard.tsx:107,181`       | `KanbanColumn` (`overflow-hidden`) → `<div className="h-full overflow-y-auto p-1 pb-6">`              | `viewOptions.variant` (`block` padrão, `line`, `content`)            | `showCategory`, `showPartner`, `showResponsibles`, `showPriority`, `showLate` (`showSprint` default `true`)    |
| **Calendário (Célula do dia)**        | `app/components/features/CalendarDayCell.tsx:125,143,162`   | `<div className="min-h-0 overflow-y-auto">` → `ActionContainer` (`scrollable={false}`, `p-1 pb-6`)    | `line`, `block`, `content` (e `line` complementar no modo `content`) | `showCategory`, `showPartner`, `showResponsibles`, `showLate`, `showPriority` (`showSprint` default `true`)    |
| **Popover de Atrasadas do Parceiro**  | `app/routes/app/partner/$slug.tsx:214`                      | `PrismPopover` (`overflow-y-auto`) → `ActionContainer` (`p-1 pb-6 overflow-y-auto`)                   | `line`                                                               | Default (`showSprint: true`, `showLate: true`)                                                                 |
| **Galeria `/ui`**                     | `app/components/ui-sections/TokensFocusSection.tsx:281,576` | Réplica estática (`div`)                                                                              | Simulação de `line`                                                  | N/A (réplica manual de classes)                                                                                |

---

### 3. Revisão estrutural do `ActionItem` e conflitos de precedência

Em `app/components/features/ActionItem.tsx`:

1. **Colisão de raio e duplicação de `squircle` (linhas 136 vs 179):**
   - A raiz declara `rounded-2xl squircle` (linha 179).
   - Para `VARIANT.line`, `variantClasses` (linha 136) declara `"rounded-xl px-3 py-1 transition-colors @xs:p-1 squircle"`.
   - O `cnfast` resolve `rounded-2xl` + `rounded-xl` mantendo `rounded-xl`, mas não deduplica `squircle`, gerando `"squircle ... squircle"` no DOM. Nas variantes `block` e `content`, prevalece `rounded-2xl squircle`.
2. **Colisão de `transition-*` (linhas 136 vs 144):**
   - `variantClasses` (`line`) pede `transition-colors`, mas `bgClasses` (`baseStyles`, linha 144) impõe `transition-all duration-500` para todas as variantes.
   - `transition-all duration-500` anima propriedades de geometria e sombra (`box-shadow`, `outline`, `padding`, `width`, `height`), causando o encolhimento lento do anel de foco e atrasando a resposta visual de seleção/hover.
3. **Colisão de anéis (`ring`) entre Repouso, Atraso, Sprint, Seleção e Foco (linhas 149, 160–168, 182, 188):**
   Todos os 5 estados disputam a mesma propriedade CSS `--tw-ring-shadow` (e `--tw-ring-color`):
   - **Base (`baseStyles`, linha 149):** `ring ring-action-ring` (`1px`).
   - **Atraso (`showLate && isLate`, linha 163):** `cn(baseStyles, "... ring ring-late-foreground")` → substitui a cor do anel por `ring-late-foreground` (`1px` vermelho).
   - **Sprint (`showSprint && person && isSprint(action, person)`, linha 167):** `cn(baseStyles, "ring-2 ring-primary")` → **sobrescreve o anel de atraso** (`ring` vira `ring-2` e `ring-late-foreground` vira `ring-primary`).
   - **Seleção em lote (`isSelectionMode && isSelected`, linha 188):** `"ring-2 ring-primary"` → usa exatamente as mesmas classes do Sprint (`ring-2 ring-primary`), tornando impossível diferenciar visualmente um cartão selecionado de um cartão em Sprint!
   - **Foco (`:focus-within`, linha 182):** `focus-within:ring-4 focus-within:ring-ring/30` → como as regras `.focus-within\:ring-4:focus-within` e `.focus-within\:ring-ring\/30:focus-within` aparecem depois de `.ring`, `.ring-2`, `.ring-late-foreground` e `.ring-primary` na folha de estilo compilada do Tailwind, **enquanto o cartão está focado o anel de Sprint e o anel de atraso desaparecem por completo**, sendo trocados pelo halo translúcido de foco.

---

### 4. Investigação dos sinais de Sprint (Raio e Anel)

O relato do proprietário descreve três fenômenos observados:

- _(a)_ Ausência do indicador na paleta Carbono (`carbon`);
- _(b)_ Uma ação atrasada em Sprint que aparece vermelha e com o ícone de raio, mas **sem o anel de Sprint**;
- _(c)_ As demais ações em Sprint (no prazo) que **não mostram nem o raio nem o anel**.

O rastreamento completo do código revelou **quatro causas exatas** (uma já corrigida no commit `314c2a9` do DS06 e três estruturais no `ActionItem` e suas variantes):

#### Causa 4.1 — Por que a seção "Sprint" (`HomeSprintView.tsx`) nunca exibe o anel de Sprint (nem nas atrasadas, nem nas no prazo)

Em [`HomeSprintView.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/home/HomeSprintView.tsx#L82-L88):

```ts
const displayFlags = {
  showCategory: true,
  showLate: true,
  showPartner: true,
  showSprint: false, // <-- Desativa o anel de Sprint em toda a visão de Sprint!
  showResponsibles: true,
};
```

Como `showSprint` é passado como `false` para todos os `ActionItem` dentro de `HomeSprintView`, a condição `if (showSprint && person && isSprint(action, person))` em [`ActionItem.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionItem.tsx#L166-L168) **nunca é executada** nessa tela:

- Se a ação em Sprint está **atrasada**, ela entra no `if (showLate && isLate)` (linha 160) e fica vermelha (`bg-late`) com `ring ring-late-foreground` (1px vermelho), **sem anel de Sprint (`ring-2 ring-primary`)**.
- Se a ação em Sprint está **no prazo**, ela fica apenas com o contorno padrão `ring ring-action-ring`, **sem anel de Sprint**.

#### Causa 4.2 — Por que na variante Linha (`ActionLineVariant.tsx`) o ícone de raio só aparece quando a ação está atrasada

Em [`ActionLineVariant.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionVariants/ActionLineVariant.tsx#L41):

```tsx
{
  isLateAction(action) && <ActionItemSprint action={action} />;
}
```

O componente `<ActionItemSprint action={action} />` (que já verifica internamente `if (!person || !isSprint(action, person)) return null` em `ActionItem.tsx:314`) foi colocado **dentro da condição `isLateAction(action)`**!

- Resultado: na variante Linha (`line`), **uma ação em Sprint que esteja no prazo (`isLateAction(action) === false`) é impedida de renderizar o ícone de raio!**
- Apenas quando a ação está simultaneamente **atrasada E em Sprint** é que `isLateAction(action)` retorna `true` e deixa `<ActionItemSprint>` aparecer ao lado do ícone de atraso.
- Combinando a **Causa 4.1** (`showSprint: false` em `HomeSprintView`) com a **Causa 4.2** (`isLateAction(action) && <ActionItemSprint>`): na visão de Sprint em modo Linha, **a ação atrasada fica vermelha, com raio e sem anel; e todas as ações no prazo ficam sem raio e sem anel!**

#### Causa 4.3 — Por que na variante Bloco (`ActionBlockVariant.tsx`) o ícone de raio nunca aparece

Em [`ActionBlockVariant.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionVariants/ActionBlockVariant.tsx#L1-L78):

- O componente `ActionBlockVariant` **não importa nem renderiza `<ActionItemSprint>` em nenhum ponto** (ao contrário de `ActionLineVariant.tsx:41` e de `Content.tsx:78` usado por `ActionContentVariant`).
- Como a visão de Sprint (`HomeSprintView.tsx:49`) abre por padrão em `VARIANT.block` com `showSprint: false`, os cartões em Bloco na Sprint não exibem **nem o anel nem o ícone de raio** em nenhum estado!

#### Causa 4.4 — Efeito da paleta Carbono (`carbon`) e do modo escuro sobre a visibilidade do anel de Sprint

1. **Invalidação de `box-shadow` por `none` (corrigida em `314c2a9`):** Na primeira versão do DS06 (`852928e`/`ce3e70f`), paletas com `relief: false` (`carbon` e `blue`) definiam `--action-shadow-override: none`. Como o Tailwind v4 compõe anéis e sombras na mesma propriedade `box-shadow: ..., var(--tw-ring-shadow), var(--tw-shadow)`, o keyword `none` ao final de uma lista separada por vírgulas invalidava toda a declaração CSS `box-shadow`, apagando todos os `ring` em Carbono e Cobalto. O commit `314c2a9` trocou `none` por `0 0 #0000`, restaurando a validade da lista CSS.
2. **Baixo contraste de `--primary` em `carbon.dark` (`app/lib/palettes.ts:101–130`):**
   Mesmo com o `box-shadow` válido após `314c2a9`, na paleta Carbono no **tema escuro (`carbon.dark`)**:
   - O fundo da página (`bg`) tem luminosidade `l: 0.20`;
   - O fundo do cartão (`--action`, com `actionLDelta: 0.1`) tem luminosidade **`l: 0.30`** (`oklch(0.30 0.01 240)`);
   - A cor `--primary` em `carbon.dark` tem luminosidade **`l: 0.30`** (`oklch(0.30 0.01 240)`) — **exatamente a mesma cor e luminosidade do fundo do cartão (`--action`)!**
   - No hover do cartão (`actionHoverLDelta: 0.2`, `l: 0.40`), `--primary` (`l: 0.30`) fica até mais escuro que o cartão. Assim, em `carbon.dark`, um anel `ring-2 ring-primary` tem contraste zero contra o próprio cartão e quase nulo contra o fundo!
3. **Conflito Atraso + Sprint quando `showSprint: true` (ex.: Hoje → Parceiros, Calendário, Kanban):**
   Onde `showSprint` é `true`, se a ação está atrasada (`bg-late`) e em Sprint, a linha 167 aplica `ring-2 ring-primary` por cima de `ring ring-late-foreground`. Em paletas onde `--primary` é escuro/neutro (como Carbono) ou avermelhado (como Rubi/Coral), ou quando o cartão recebe foco (`focus-within:ring-4`), a distinção entre atraso e Sprint se perde se depender apenas da cor do anel.

#### Matriz de comportamento atual vs. esperado dos sinais de Sprint

| Estado da ação em Sprint | Onde                                                | Variante         | Hoje: Raio (`ActionItemSprint`)                                 | Hoje: Anel (`ring-2 ring-primary`)                                                   | Esperado                                                                             |
| :----------------------- | :-------------------------------------------------- | :--------------- | :-------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **No prazo**             | Seção Sprint (`HomeSprintView`)                     | `block` (padrão) | ❌ Ausente (`ActionBlockVariant` não tem raio)                  | ❌ Ausente (`showSprint: false`)                                                     | ✅ Raio visível (anel opcional na aba exclusiva de Sprint ou consistente se ativado) |
| **No prazo**             | Seção Sprint (`HomeSprintView`)                     | `line`           | ❌ Ausente (bloqueado por `isLateAction(action)`)               | ❌ Ausente (`showSprint: false`)                                                     | ✅ Raio visível                                                                      |
| **Atrasada**             | Seção Sprint (`HomeSprintView`)                     | `line`           | ✅ Visível (`isLateAction` é `true`)                            | ❌ Ausente (`showSprint: false`)                                                     | ✅ Raio visível + estado atrasado preservado                                         |
| **No prazo**             | Parceiros / Categorias / Hoje / Kanban / Calendário | `line`           | ❌ Ausente (bloqueado por `isLateAction(action)`)               | ✅ Visível (mas invisível em `carbon.dark` porque `primary.l === action.l === 0.30`) | ✅ Raio visível + Anel visível                                                       |
| **No prazo**             | Parceiros / Categorias / Hoje / Kanban / Calendário | `block`          | ❌ Ausente (`ActionBlockVariant` não tem raio)                  | ✅ Visível (exceto contraste em `carbon.dark`)                                       | ✅ Raio visível + Anel visível                                                       |
| **No prazo / Atrasada**  | Qualquer visão                                      | `content`        | ✅ Visível (`Content.tsx:78` sempre chama `<ActionItemSprint>`) | ✅ Visível quando `showSprint: true`                                                 | ✅ Raio + Anel visíveis                                                              |

---

### 5. Investigação do recorte lateral das sombras em Hoje (Hoje → Parceiros vs. Sprint)

#### Comparação da cadeia DOM entre Hoje → Parceiros e Sprint

1. **Em Hoje → Parceiros (`PartnersBoard.tsx` → `ActionContainer.tsx`):**
   - `PartnerColumn` (`PartnersBoard.tsx:70`): `<div className="group/column flex flex-col overflow-hidden">`
   - `ActionContainer` (`ActionContainer.tsx:120–125`):
     ```tsx
     <div
       ref={containerRef}
       className={cn(
         "relative transition-all duration-300",
         scrollable ? "h-full overflow-y-auto" : "",
         "p-1 pb-6",
       )}
     >
     ```
   - **Quem recorta a sombra e o anel:**
     O próprio `ActionContainer` (quando `scrollable = true`, que é o padrão em `PartnersBoard`, `CategoriesBoard`, `TodayViewParts`, `HomeLateView` e `$slug.tsx`) aplica `overflow-y-auto` (que pela especificação CSS força `overflow-x: auto`, criando um _scroll container_ que recorta qualquer pintura fora da sua _padding box_) e tem apenas **`p-1` (`4px` de padding horizontal)**. Além disso, `PartnerColumn`, `CategoryColumn` e `KanbanColumn` têm `overflow-hidden`.
   - **Geometria da sombra e do anel vs. `p-1` (`4px`):**
     - Sombra em repouso (`--shadow-action`): `0 1px 2px 0` + `1px` de `ring-action-ring` (~3px laterais). No limite de 4px, o anti-aliasing do squircle e da sombra já encosta na borda.
     - Sombra em hover (`--shadow-action-hover`): `0 10px 15px -3px ..., 0 4px 6px -4px ...`. O raio de blur de `15px` (com spread `-3px`) projeta cerca de **12px** para os lados e **22px** para baixo! Com apenas `4px` (`p-1`) de espaço lateral, a sombra de hover é cortada em linha reta vertical a 4px do cartão.
     - Anel de foco (`focus-within:ring-4` = `4px` + `outline-1` = `5px`): ultrapassa os `4px` de `p-1` e sofre recorte lateral nas duas bordas.
2. **Em Hoje → Sprint (`HomeSprintView.tsx:107, 128`):**
   - Wrapper externo: `<div className="px-8">` (sem `overflow-hidden` e sem `overflow-y-auto`).
   - Grid interno: `<div className="${gridClasses} gap-2 p-1">` (também sem `overflow`).
   - Como nenhum ancestral imediato do grid na Sprint tem `overflow-hidden` ou `overflow-y-auto`, a sombra e o anel dos cartões em `HomeSprintView` se espalham livremente dentro dos `32px` (`px-8`) laterais da seção, sem sofrer recorte!

#### Avaliação da hipótese `px-2` (`8px`) vs. alinhamento nos consumidores de `ActionContainer`

Se alterarmos o padding horizontal de `ActionContainer` (e do container equivalente em `KanbanPhasesBoard.tsx:176`) de `p-1 pb-6` (`4px` nas laterais) para `px-2 pt-1 pb-6` (`8px` nas laterais):

- **Folga para anéis e sombras:** `8px` (`px-2`) acomoda com folga total qualquer anel (`ring` 1px, `ring-2` 2px, `focus-within:ring-4` 4px) e a parte mais densa da sombra em repouso e hover, eliminando a linha seca de corte colada ao cartão.
- **Impacto nos consumidores de `ActionContainer`:**
  1. `PartnersBoard.tsx` (Hoje → Parceiros) e `CategoriesBoard.tsx` (Hoje → Categorias): o cabeçalho da coluna tem `px-2` (`CategoriesBoard.tsx:66`) ou botão com `px-2` (`PartnersBoard.tsx:76`). Passar `ActionContainer` de `p-1` para `px-2 pt-1 pb-6` **alinha exatamente** a margem esquerda/direita dos cartões com o cabeçalho da coluna (`8px` = `0.5rem`), reduzindo a largura útil do cartão em apenas `8px` no total (`4px` de cada lado).
  2. `KanbanPhasesBoard.tsx:176`: o cabeçalho da coluna usa `px-3 py-2` (linha 145) e a lista usa `p-1 pb-6` (linha 176). Mudar para `px-2 pt-1 pb-6` melhora o alinhamento com o cabeçalho e evita o mesmo corte no Kanban.
  3. `TodayViewParts.tsx`, `HomeLateView.tsx` e `app/routes/app/partner/$slug.tsx`: ganham os mesmos `4px` extras por lado sem quebrar layout.
  4. `CalendarDayCell.tsx`: passa `scrollable={false}` para `ActionContainer` dentro da célula do calendário (que já é estreita, especialmente em telas de 7 colunas). Em `CalendarDayCell`, reduzir 8px por coluna do calendário pode apertar títulos em telas menores; portanto, `px-2` pode ser aplicado quando `scrollable` for `true` (ou `px-2 pt-1 pb-6` em listas roláveis e manter `p-1` quando `scrollable={false}`, ou `px-1.5`/`px-2` conforme decisão do proprietário).

---

### 6. Alterações Aplicadas e Roteiro de Aceite

Com base no que já havia sido corrigido (`314c2a9` preservando a lista de `box-shadow` em paletas planas com `0 0 #0000` e o ajuste de luminosidade do proprietário em `app/lib/palettes.ts` para `carbon.dark.primary.l = 0.4`), foram aplicadas apenas as mudanças que continuavam necessárias no código:

#### Ajuste A — Estabilização do anel de foco e limpeza de classes no [`ActionItem.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionItem.tsx)

1. **Substituição de `transition-all duration-500` por `transition-colors duration-200` em `bgClasses` (`ActionItem.tsx:143–144`)**, removendo também o `transition-colors` redundante e o segundo `squircle` duplicado de `variantClasses` (linha 136).
   - **Resultado:** Impede que `outline-width` (cujo valor inicial CSS é `medium` = `3px`) e `box-shadow` (`ring`) sofram transição de espessura de `500ms` ao ativar ou desativar `:focus-within`, eliminando o efeito de "passar de 2–3 linhas para 1" ao clicar.
2. **Guarda `onFocus` no `<div role="button" tabIndex={0}>` (`ActionItem.tsx:191–200`):**
   - Descarta o foco quando originado por clique/arraste de mouse no próprio cartão (`event.target === event.currentTarget` e `!matches(":focus-visible")`), alinhando o cartão ao comportamento que o botão do título (`ActionItemTitleInput.tsx:101–108`) já possuía. O foco por teclado (`Tab`) e o foco de edição do título (`<input>`) permanecem intactos.

#### Ajuste B — Exibição consistente do ícone de raio (`ActionItemSprint`) nas variantes Linha e Bloco

1. **Em [`ActionLineVariant.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionVariants/ActionLineVariant.tsx#L41):** removida a condição restritiva `isLateAction(action) &&` antes de `<ActionItemSprint action={action} />`. Agora toda ação em Sprint na variante Linha exibe o ícone de raio (esteja no prazo ou atrasada).
2. **Em [`ActionBlockVariant.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionVariants/ActionBlockVariant.tsx#L46):** importado e incluído `<ActionItemSprint action={action} />` na barra de metadados do cartão em Bloco (onde havia sido omitido na extração das variantes em `06d59a53`), alinhando Bloco com Linha e Conteúdo.

#### Ajuste C — Espaçamento lateral unificado (`px-2 pt-1 pb-6`) contra o corte de sombras e anéis

1. **Em [`ActionContainer.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionContainer.tsx#L122):** alterado o padding de listas roláveis (`scrollable = true`) para `"h-full overflow-y-auto px-2 pt-1 pb-6"`, mantendo `"p-1 pb-6"` quando `scrollable={false}` (células compactas do Calendário).
2. **Em [`KanbanPhasesBoard.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/layout/KanbanPhasesBoard.tsx#L176) e [`HomeSprintView.tsx`](file:///Users/euchicosousa/vercel/uzzina/app/components/features/home/HomeSprintView.tsx#L128):** unificado o padding interno das listas/grids para `px-2 pt-1 pb-6`, garantindo `8px` de folga lateral para sombras e anéis de foco e alinhamento com os cabeçalhos das colunas.

---

### Roteiro de Aceite

1. **Anel ao clicar na variante Linha (`line`):**
   - Em Hoje → Parceiros, clicar sobre uma ação em Linha (fora do título) para abrir a gaveta: o contorno não deve pulsar nem encolher lentamente de 2–3px para 1px.
   - Clicar sobre o título para editar inline e depois pressionar `Esc` ou clicar fora: o contorno de foco deve entrar e sair de forma imediata e estável.
   - Navegar com `Tab` pelos cartões: o anel de foco deve aparecer inteiro, sem corte nas laterais esquerda/direita.
2. **Sinais de Sprint (Raio e Anel):**
   - Na seção Sprint (Hoje → Sprint) e em Hoje → Parceiros, conferir uma ação em Sprint **no prazo** e uma **atrasada**, nas variantes **Linha**, **Bloco** e **Conteúdo**: ambas devem exibir o ícone de raio (`ActionItemSprint`), e nas listas com `showSprint: true` exibir também o anel `ring-2 ring-primary`.
   - Alternar entre as paletas **Ônix** e **Carbono** (nos modos claro e escuro): conferir que o anel de Sprint/seleção/foco é visível em ambas.
3. **Sombras laterais sem recorte:**
   - Em Hoje → Parceiros (paleta com relevo, ex.: Ônix ou Fúcsia), passar o mouse (hover) e focar um cartão na coluna: a sombra lateral e o anel não devem apresentar corte reto seco a 4px da borda.
4. **Seleção e Arraste:**
   - Entrar no modo de seleção (`S` ou menu) e selecionar ações; arrastar uma ação pelo título e pelo corpo no Calendário, Kanban e Sprint: verificar opacidade de origem, overlay de arraste e preservação do layout.

### Ajustes pedidos na revisão — 08/11

A implementação local precisa de revisão antes do aceite. Preservar as decisões visuais do proprietário e separar alterações paralelas dos ajustes deste ticket.

- [ ] Manter a animação da sombra decorativa no hover e a transição de cor do cartão. Fazer o anel de foco mudar de imediato e sem interpolar sua espessura. Separar visualmente o anel da sombra quando compartilham a mesma propriedade CSS. Conferir também o modo seleção, que ainda aplica `transition-all`.
- [ ] Remover o `blur()` introduzido no foco do corpo do cartão. Tratar a aparência pelo estilo, preservando foco, abertura por clique/teclado e retorno de foco ao fechar a gaveta.
- [ ] Preservar a correção do raio em Linha e Bloco. Conferir raio e anel separadamente, com ações no prazo e atrasadas, em Carbono e Ônix. Respeitar as regras de exibição já definidas por tela.
- [ ] Conferir os 8 px de padding lateral em Hoje → Parceiros com a sombra mais forte do hover, além de alinhamento, rolagem e arraste. Ajustar se ainda houver recorte.
- [ ] Separar as mudanças paralelas de Carbono, botões Link, barra de calendário e controles da página do parceiro. Preservar as edições do proprietário ao preparar o diff do DS10.

A revisão conferiu o diff e executou 27 testes focados de foco, seleção e arraste, todos passando. A validação de animação e sombra no navegador segue pendente.

### Correção das transições — 08/11

O cartão volta a animar a sombra no hover em 500 ms, com transição explícita de cor, sombra e padding. A seleção usa a mesma transição. O foco usa um contorno imediato de 3 px separado do anel de estado, e o clique mantém o foco do cartão. A réplica em /ui acompanha o comportamento. Reduzir movimento desativa essas transições.

Typecheck, build e 31 testes focados passaram. O CSS compilado inclui a transição de box-shadow e o contorno separado. Aceite visual pendente. Em Hoje → Parceiros, com a paleta Ônix, passar o mouse sobre uma ação e retirá-lo para ver a sombra nos dois sentidos. Depois focar com Tab, abrir a ação e fechar a gaveta para conferir o contorno imediato e o retorno do foco. Repetir em modo seleção e com Reduzir movimento.
