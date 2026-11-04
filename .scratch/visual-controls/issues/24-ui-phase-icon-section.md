# 24 — `/ui`: seção "PhaseIcon"

**Resumo:** Demonstra fases, tamanhos e variantes do PhaseIcon, preservado por decisão do proprietário.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.
Escopo: criar na aba Componentes Uzzina a seção do `PhaseIcon` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/features/PhaseIcon.tsx`: `PhaseIcon({ phase, size = "sm", variant = "progress" })`; `phase: PHASE_TYPE` (objeto, não slug); `size`: `xs` 12px, `sm` 16, `md` 20, `lg` 24, `xl` 32, `2xl` 48, `dot` 8 (`size-2`); `variant`: `progress` (anel de progresso; `finished` vira círculo com check) ou `icon` (ícone temático de `Icons`, colorido).
- `PHASES` e `PHASE_TYPE` em `~/lib/CONSTANTS` (`PHASE_TYPE = (typeof PHASES)[PHASE]`). Slugs: `idea` "Ideia", `do` "Fazer", `doing` "Fazendo", `review` "Análise", `done` "Feito", `finished` "Concluído" (títulos em `PHASES[slug].title`).
- Usado em 8 arquivos (cartões de ação, comboboxes, kanban).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaPhaseIconSection.tsx` com `export function UzzinaPhaseIconSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-phase-icon", label: "PhaseIcon", section: "uzzina", keywords: ["fase", "phase", "icone", "progresso", "status"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-phase-icon">` > `GallerySection` > header `title="PhaseIcon"`, `description="Indicador de fase da ação: progresso ou ícone temático, nos tamanhos da escala Uzzina."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="PhaseIcon"><PhaseIconPlayground /></GalleryItem>`.

## `PhaseIconPlayground`

```ts
const PHASE_SLUGS = [
  "idea",
  "do",
  "doing",
  "review",
  "done",
  "finished",
] as const satisfies readonly (keyof typeof PHASES)[];
const PHASE_ICON_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl", "dot"] as const;
```

| `label`  | `prop`    | Controle | Opções                                               | Padrão     |
| -------- | --------- | -------- | ---------------------------------------------------- | ---------- |
| Fase     | `phase`   | Select   | `PHASE_SLUGS`, `optionLabels` = `PHASES[slug].title` | `doing`    |
| Tamanho  | `size`    | Select   | `PHASE_ICON_SIZES`                                   | `lg`       |
| Variante | `variant` | Radio    | `progress` "Progresso", `icon` "Temático"            | `progress` |

Prévia: `<PhaseIcon phase={PHASES[phase]} size={size} variant={variant} />`. Se `tsc` rejeitar `PHASES[phase]` como `PHASE_TYPE`, confira o tipo `PHASE` em `CONSTANTS.ts` e ajuste o `satisfies` (sem `as`); registre no relatório. `caption`: `` `${PHASES[phase].title} · ${size} · ${SIZE_PX[size]}px` `` com `SIZE_PX = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32, "2xl": 48, dot: 8 } as const`.

Abaixo do playground, **sem caixa**, uma linha com as 6 fases em `size="md"` (`progress`) e o título de cada uma em `text-xs`, para comparação rápida.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > PhaseIcon, claro e escuro: cada fase/tamanho/variante renderiza; `finished` mostra o check; `dot` vira ponto colorido.
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam.
2. Controles exatamente como na tabela; sem caixas.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
  - `app/components/ui-sections/UzzinaPhaseIconSection.tsx` (criado com `PhaseIconPlayground` e linha de comparação de todas as fases)
  - `app/components/ui-sections/index.ts` (export adicionado ao final)
  - `app/routes/ui.tsx` (import adicionado, `uzzina-phase-icon` inserido em ordem alfabética entre `PhaseCombobox` e `ResponsiblesCombobox` em `SIDEBAR_ITEMS` e na renderização)
- Prettier / `tsc`:
  - Prettier: 100% formatado sem pendências.
  - `tsc --noEmit`: 0 erros.
- Navegador:
  - Todas as 6 fases (`idea`, `do`, `doing`, `review`, `done`, `finished`) renderizam nas duas variantes (`progress` e `icon`).
  - Escala completa de tamanhos (`xs` 12px a `2xl` 48px e `dot` 8px).
  - Linha horizontal de comparação rápida das 6 fases em `size="md"` renderiza abaixo do playground sem caixas/cards.
  - Totalmente responsivo em 375px.
- Pendências: Nenhuma.

## Encerramento após revisão independente — 04/11/2026

Pendências corrigidas por subagente e conferidas pelo coordenador. Prettier, Biome (zero erros/avisos) e typecheck aprovados. Ensaio controlado das seis seções no Chromium sem erros de página nem solicitações externas, em 375/1400px e temas claro/escuro. Evidências e limites em [revisão V19–V34](../../../docs/audits/2026-11-04-ui-tickets-19-34-review.md). Conclusão local, sem publicação.
