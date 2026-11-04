# 31 — `/ui`: seção "ColorListEditor"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `ColorListEditor` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/features/ColorListEditor.tsx`: `ColorListEditor({ initialColors, onChange })`. Lista reordenável (dnd-kit, alça `GripVerticalIcon`) de cores hex com `PrismInput`, remover (`Trash2Icon`) e adicionar (`PlusIcon`). Estado interno: lê `initialColors` só na montagem (gera ids com `crypto.randomUUID()`, disponível em `127.0.0.1`).
- Usado em 1 arquivo (cadastro de parceiro). A seção Foco tem só uma réplica do item arrastado.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaColorListEditorSection.tsx` com `export function UzzinaColorListEditorSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-color-list-editor", label: "ColorListEditor", section: "uzzina", keywords: ["cores", "paleta", "lista", "reordenar", "parceiro"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-color-list-editor">` > `GallerySection` > header `title="ColorListEditor"`, `description="Editor das cores do parceiro: editar, reordenar por arraste, remover e adicionar."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="ColorListEditor"><ColorListEditorPlayground /></GalleryItem>`.

## `ColorListEditorPlayground`

| `label`                     | `prop`          | Controle | Faixa | Padrão |
| --------------------------- | --------------- | -------- | ----- | ------ |
| Quantidade inicial de cores | `initialColors` | Number   | 1–6   | `3`    |

- `const PALETTE = ["#2563eb", "#7c3aed", "#059669", "#ea580c", "#db2777", "#0f172a"] as const;` → `initialColors={PALETTE.slice(0, count)}`.
- Remonta por `key={count}`; ao remontar, a legenda volta para as cores iniciais.
- `onChange` grava as cores em estado local; `caption`: `colors.join(", ")`.
- Prévia `w-full max-w-sm`, `previewClassName="items-start"`.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > ColorListEditor, claro e escuro: editar um hex atualiza a legenda; arrastar pela alça reordena (mouse e teclado: Espaço na alça + setas, conforme o componente); remover e adicionar funcionam.
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controle como na tabela; sem caixas da galeria.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador (incluindo arraste por teclado):
- Pendências:
