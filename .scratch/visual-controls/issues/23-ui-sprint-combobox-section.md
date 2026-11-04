# 23 — `/ui`: seção "SprintCombobox"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** e do **lote 4 do 18** (`app/components/ui-sections/gallery-mocks.tsx`: `GalleryAppProviders`, `MOCK_PARTNERS`, `MOCK_PEOPLE`).
Escopo: criar na aba Componentes Uzzina a seção do `SprintCombobox` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

`app/components/features/SprintCombobox.tsx`:

- Props (`SprintComboboxProps`): `selectedSprints: string[]` (ids `user_id` de quem tem a ação na sprint), `responsibles: string[]`, `currentPartners: Partner[]`, `onSelect: (newSprints: string[], newResponsibles: string[]) => void`, `tabIndex?`, `disabled?` (padrão `false`), `variant?`, `size?`.
- Usa `useAppContext()` e `useQuery(QUERY_KEYS.people(person.user_id), fetchPeople)`; agrupa pessoas em responsáveis e não responsáveis. Gatilho com `aria-label="Sprints"` e `UAvatarGroup`.
- `GalleryAppProviders` (18, lote 4) fornece contexto fictício e cache de pessoas sem refetch.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaSprintComboboxSection.tsx` com `export function UzzinaSprintComboboxSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-sprint-combobox", label: "SprintCombobox", section: "uzzina", keywords: ["sprint", "semana", "pessoas", "combobox", "avatar"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<GalleryAppProviders>` > `<div id="uzzina-sprint-combobox">` > `GallerySection` > header `title="SprintCombobox"`, `description="Seletor de quem está com a ação na sprint, separando responsáveis e demais pessoas dos parceiros."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="SprintCombobox"><SprintComboboxPlayground /></GalleryItem>`.

## `SprintComboboxPlayground`

| `label`      | `prop`            | Controle | Opções                                                               | Padrão  |
| ------------ | ----------------- | -------- | -------------------------------------------------------------------- | ------- |
| Variante     | `variant`         | Select   | `ghost`, `outline`, `secondary`, `link`, `default`                   | `ghost` |
| Tamanho      | `size`            | Select   | `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg` | `sm`    |
| Na sprint    | `selectedSprints` | Radio    | `0`, `1`, `2`                                                        | `1`     |
| Responsáveis | `responsibles`    | Radio    | `none` "Nenhum", `one` "Um", `all` "Todos"                           | `one`   |
| Desabilitado | `disabled`        | Boolean  | —                                                                    | `false` |

- Predefinições: na sprint `{ "0": [], "1": ["user-mock-001"], "2": ["user-mock-001", "user-mock-002"] }`; responsáveis `{ none: [], one: ["user-mock-001"], all: ["user-mock-001", "user-mock-002", "user-mock-003"] }`.
- `onSelect={(sprints, nextResponsibles) => { setSprints(sprints); setResponsibles(nextResponsibles); }}` (sem mexer nos rádios).
- `currentPartners={MOCK_PARTNERS}`.
- `caption`: `` `sprint: ${sprints.length} · responsáveis: ${responsibles.length}` ``.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > SprintCombobox, claro e escuro: grupos de responsáveis e demais aparecem; selecionar alguém fora dos responsáveis atualiza as duas listas pelo `onSelect`; Shift+clique seleção exclusiva.
3. Network filtrado por `supabase`: zero requisições. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; mocks de `./gallery-mocks`.
2. Controles exatamente como na tabela; sem caixas.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Network:
- Navegador:
- Pendências:
