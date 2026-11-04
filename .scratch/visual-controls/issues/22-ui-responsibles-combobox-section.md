# 22 — `/ui`: seção "ResponsiblesCombobox"

**Resumo:** Demonstra seleção de responsáveis; o componente foi consolidado no UPeopleCombobox pelo V40.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — revisado e encerrado em 04/11/2026.
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
  - `app/components/ui-sections/UzzinaResponsiblesComboboxSection.tsx` (criado com `ResponsiblesComboboxPlayground` envolto em `GalleryAppProviders`)
  - `app/components/ui-sections/index.ts` (export adicionado ao final)
  - `app/routes/ui.tsx` (import adicionado, `uzzina-responsibles-combobox` inserido em ordem alfabética entre `PhaseCombobox` e `RichTextEditor` em `SIDEBAR_ITEMS` e na renderização)
- Prettier / `tsc`:
  - Prettier: 100% formatado sem pendências.
  - `tsc --noEmit`: 0 erros.
- Network:
  - Dados de `MOCK_PEOPLE` resolvidos diretamente do cache local pré-populado de `GALLERY_QUERY_CLIENT` com `staleTime: Infinity`.
  - Zero requisições disparadas ao Supabase.
- Navegador:
  - Popover lista as 3 pessoas fictícias dos parceiros Alfa/Beta/Gama.
  - Seleção por clique alterna os responsáveis e atualiza a contagem no caption.
  - Estado desabilitado impede a abertura do popover.
  - Responsivo e sem rolagem horizontal em 375px.
- Pendências: Nenhuma.

## Encerramento após revisão independente — 04/11/2026

Pendências corrigidas por subagente e conferidas pelo coordenador. Prettier, Biome (zero erros/avisos) e typecheck aprovados. Ensaio controlado das seis seções no Chromium sem erros de página nem solicitações externas, em 375/1400px e temas claro/escuro. Evidências e limites em [revisão V19–V34](../../../docs/audits/2026-11-04-ui-tickets-19-34-review.md). Conclusão local, sem publicação.
