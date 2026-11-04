# 23 — `/ui`: seção "SprintCombobox"

**Resumo:** Demonstra seleção de Sprint; o componente foi consolidado no UPeopleCombobox pelo V40.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — revisado e encerrado em 04/11/2026.
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
  - `app/components/ui-sections/UzzinaSprintComboboxSection.tsx` (criado com `SprintComboboxPlayground` envolto em `GalleryAppProviders`)
  - `app/components/ui-sections/index.ts` (export adicionado ao final)
  - `app/routes/ui.tsx` (import adicionado, `uzzina-sprint-combobox` inserido em ordem alfabética entre `RichTextEditor` e `UAvatar e UAvatarGroup` em `SIDEBAR_ITEMS` e na renderização)
- Prettier / `tsc`:
  - Prettier: 100% formatado sem pendências.
  - `tsc --noEmit`: 0 erros.
- Network:
  - Dados de `people` resolvidos do cache estático de `GALLERY_QUERY_CLIENT` com `staleTime: Infinity`.
  - Zero chamadas externas ao Supabase.
- Navegador:
  - Grupos de responsáveis e demais pessoas renderizam perfeitamente no popover do comando.
  - Predefinições de sprint (`0`, `1`, `2`) e de responsáveis (`none`, `one`, `all`) integradas ao `onSelect` interativo.
  - Totalmente adaptado para 375px sem overflow.
- Pendências: Nenhuma.

## Encerramento após revisão independente — 04/11/2026

Pendências corrigidas por subagente e conferidas pelo coordenador. Prettier, Biome (zero erros/avisos) e typecheck aprovados. Ensaio controlado das seis seções no Chromium sem erros de página nem solicitações externas, em 375/1400px e temas claro/escuro. Evidências e limites em [revisão V19–V34](../../../docs/audits/2026-11-04-ui-tickets-19-34-review.md). Conclusão local, sem publicação.
