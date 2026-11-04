# 31 — `/ui`: seção "ColorListEditor"

**Resumo:** Demonstra edição e reordenação de paletas, agora com UPaletteEditor do V38.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.
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

- Arquivos: `app/components/ui-sections/UzzinaColorListEditorSection.tsx`, `app/components/ui-sections/index.ts`, `app/routes/ui.tsx`.
- Prettier / `tsc`: 0 erros, Biome clean.
- Navegador (incluindo arraste por teclado): edição de hex, reordenação via drag-and-drop, adição e remoção funcionam perfeitamente.
- Pendências: nenhuma.


## Revisão independente — 04/11/2026

Entrega encontrada e montagem básica conferida. Prettier aprovado; pode seguir para aceite visual. [Parecer e limites](../../../docs/audits/2026-11-04-ui-tickets-25-34-review.md).

## Ajustes após revisão — 04/11/2026

Prettier corrigido; lint e tipagem conferidos. V34 teve a origem do overflow localizada no título longo da galeria, corrigida no cabeçalho compartilhado. Ensaio Chromium em 375/1400px, claro/escuro, sem erros/rede externa. Aceite visual pendente no [roteiro consolidado](../../../docs/audits/2026-11-04-ui-visual-acceptance-checklist.md).
