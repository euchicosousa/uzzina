# 34 — `/ui`: seção "PartnerCelebrationsSelector"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `PartnerCelebrationsSelector` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/features/PartnerCelebrationsSelector.tsx`: props `celebrations: Celebration[]`, `selectedIds: string[]`, `isLoading: boolean`, `onToggle: (id: string, isChecked: boolean) => void`, `onClear: () => void`, `saving?: boolean` (padrão `false`). Filtro por mês (estado interno, "Todos" + 12 meses) e busca por texto; lê o mês com `date.slice(5, 7)` e o dia com `date.slice(8, 10)` (formato `YYYY-MM-DD`). Sem contexto nem banco (os dados vêm do chamador).
- `Celebration` (`~/types`) = `Tables<"celebrations">`: `created_at`, `date`, `id`, `is_holiday`, `title`.
- Usado em 1 arquivo (cadastro do parceiro).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaPartnerCelebrationsSelectorSection.tsx` com `export function UzzinaPartnerCelebrationsSelectorSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-partner-celebrations-selector", label: "PartnerCelebrationsSelector", section: "uzzina", keywords: ["datas", "comemorativas", "feriados", "parceiro", "selecao"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Dados

`MOCK_CELEBRATIONS: Celebration[]` local, `created_at: "2026-01-01T00:00:00.000Z"`, ids `celebration-mock-01`…`08`:

| id  | `date`       | `title`                     | `is_holiday` |
| --- | ------------ | --------------------------- | ------------ |
| 01  | `2026-01-01` | Confraternização Universal  | `true`       |
| 02  | `2026-03-08` | Dia Internacional da Mulher | `false`      |
| 03  | `2026-04-21` | Tiradentes                  | `true`       |
| 04  | `2026-05-10` | Dia das Mães                | `false`      |
| 05  | `2026-06-12` | Dia dos Namorados           | `false`      |
| 06  | `2026-08-09` | Dia dos Pais                | `false`      |
| 07  | `2026-10-12` | Dia das Crianças            | `false`      |
| 08  | `2026-12-25` | Natal                       | `true`       |

## Estrutura

`<div id="uzzina-partner-celebrations-selector">` > `GallerySection` > header `title="PartnerCelebrationsSelector"`, `description="Seleção das datas comemorativas da marca, com filtro por mês e busca."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="PartnerCelebrationsSelector"><PartnerCelebrationsSelectorPlayground /></GalleryItem>`.

## `PartnerCelebrationsSelectorPlayground`

| `label`             | `prop`         | Controle | Opções / faixa                                 | Padrão  |
| ------------------- | -------------- | -------- | ---------------------------------------------- | ------- |
| Selecionadas        | `selectedIds`  | Radio    | `none` "Nenhuma", `some` "Duas", `all` "Todas" | `some`  |
| Carregando          | `isLoading`    | Boolean  | —                                              | `false` |
| Salvando            | `saving`       | Boolean  | —                                              | `false` |
| Quantidade de datas | `celebrations` | Number   | 0–8 (0 = estado vazio)                         | `8`     |

- `celebrations={MOCK_CELEBRATIONS.slice(0, count)}`.
- Predefinições: `none` `[]`; `some` `["celebration-mock-02", "celebration-mock-04"]`; `all` todos os ids. Rádio troca a seleção; `onToggle(id, checked)` adiciona/remove; `onClear` zera (sem mexer no rádio).
- `caption`: `` `${selected.length} selecionada(s)` ``.
- Prévia `w-full max-w-2xl`, `previewClassName="items-start"`.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > PartnerCelebrationsSelector, claro e escuro: filtro por mês e busca funcionam; marcar/desmarcar e limpar atualizam a legenda; "Carregando" e "Salvando" mostram os estados do componente; quantidade 0 mostra o vazio.
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela; nenhuma caixa da galeria.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador:
- Pendências:
