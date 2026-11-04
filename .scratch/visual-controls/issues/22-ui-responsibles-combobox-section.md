# 22 — `/ui`: seção "ResponsiblesCombobox"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** e do **lote 4 do 18** (arquivo `app/components/ui-sections/gallery-mocks.tsx` com `GalleryAppProviders`, `MOCK_PARTNERS`, `MOCK_PEOPLE`).
Escopo: criar na aba Componentes Uzzina a seção do `ResponsiblesCombobox` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

`app/components/features/ResponsiblesCombobox.tsx`:

- Props: `selectedResponsibles: string[]` (ids `user_id`), `currentPartners: Partner[]`, `onSelect?: (responsibles: string[]) => void`, `disabled?: boolean` (padrão `false`), `variant?`, `size?` (tipos de `ComboboxTriggerProps`; padrão do gatilho `ghost` + `sm`).
- Usa `useAppContext()` (lança erro fora do provider) e `useQuery({ queryKey: QUERY_KEYS.people(person.user_id), queryFn: fetchPeople })`. Lista só pessoas cujo `user_id` está em `partner.users_ids` de algum parceiro atual.
- `GalleryAppProviders` (18, lote 4) fornece `AppContext` fictício e um `QueryClient` com `MOCK_PEOPLE` já no cache e sem refetch: **nenhuma** chamada ao banco (o `bun run dev` usa produção).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaResponsiblesComboboxSection.tsx` com `export function UzzinaResponsiblesComboboxSection()`.
2. EDITAR `index.ts`: acrescentar o export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-responsibles-combobox", label: "ResponsiblesCombobox", section: "uzzina", keywords: ["responsaveis", "pessoas", "equipe", "combobox", "avatar"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; ordem final de referência no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<GalleryAppProviders>` envolve `<div id="uzzina-responsibles-combobox">` > `GallerySection` > header `title="ResponsiblesCombobox"`, `description="Seletor de responsáveis da ação, com pessoas fictícias vinculadas aos parceiros da galeria."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="ResponsiblesCombobox"><ResponsiblesComboboxPlayground /></GalleryItem>`.

## `ResponsiblesComboboxPlayground`

| `label`      | `prop`                 | Controle | Opções                                                               | Padrão  |
| ------------ | ---------------------- | -------- | -------------------------------------------------------------------- | ------- |
| Variante     | `variant`              | Select   | `ghost`, `outline`, `secondary`, `link`, `default`                   | `ghost` |
| Tamanho      | `size`                 | Select   | `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg` | `sm`    |
| Selecionados | `selectedResponsibles` | Radio    | `0`, `1`, `3`                                                        | `1`     |
| Desabilitado | `disabled`             | Boolean  | —                                                                    | `false` |

- Predefinições: `{ "0": [], "1": ["user-mock-001"], "3": ["user-mock-001", "user-mock-002", "user-mock-003"] }`; mudar o rádio troca a seleção; `onSelect` do popover atualiza a seleção sem mexer no rádio.
- `currentPartners={MOCK_PARTNERS}`.
- `caption`: `` `${variant} / ${size} · avatar ${AVATAR_PX[getTriggerAvatarSize(size)]}px · ${selected.length} selecionado(s)` `` (helper de `~/components/features/ComboboxTrigger`, `AVATAR_PX = { xs: 16, sm: 24, md: 32 } as const`).

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > ResponsiblesCombobox, claro e escuro: popover lista as 3 pessoas; Shift+clique seleciona só uma; desabilitado não abre.
3. DevTools > Network filtrado por `supabase`: **zero** requisições.
4. 375px sem rolagem horizontal da página. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; mocks importados de `./gallery-mocks` (não duplicar).
2. Controles exatamente como na tabela; sem caixas; zero requisições ao banco.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Network:
- Navegador:
- Pendências:
