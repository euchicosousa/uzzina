# 20 — `/ui`: seção "Sheet" (`PrismSheet`)

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar a seção do `PrismSheet`, que não existe no `/ui`, com playground de propriedades. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/prism/sheet.tsx`, exportado em `~/components/prism`: `PrismSheetTrigger` (React Aria `DialogTrigger`), `PrismSheet` (`side`: `top` | `right` (padrão) | `bottom` | `left`; `showCloseButton` (padrão `true`); `isDismissable` (padrão `true`)), `PrismSheetContent` (alias com as mesmas props), `PrismSheetHeader` (`p-6`), `PrismSheetTitle`, `PrismSheetDescription`, `PrismSheetFooter` (`mt-auto p-6`), `PrismSheetClose` (`PrismButton` com `slot="close"`, padrão `outline` `default`).
- Não usado no app hoje (a gaveta de ações tem implementação própria).
- Observação para o relatório (não corrigir): o botão X interno tem texto `sr-only` em inglês ("Close").
- Auxiliar: `PropsPlayground.tsx` (ticket 17).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/SheetSection.tsx` com `export function SheetSection()`.
2. EDITAR `index.ts`: `export * from "./SheetSection";` logo após `./SeparatorSection`.
3. EDITAR `app/routes/ui.tsx`: import; `SIDEBAR_ITEMS` logo após `prism-separator`: `{ id: "prism-sheet", label: "Sheet", section: "components", keywords: ["sheet", "painel", "lateral", "drawer", "gaveta"] }`; render entre `<SeparatorSection />` e `<SkeletonSection />`.
4. EDITAR `AGENTS.md` §5: atualizar o número de seções Prism para a contagem real de `section: "components"`.
5. Este ticket (relatório).

Antes: `git status --short` nesses caminhos e preserve alterações alheias.

## Estrutura

`<div id="prism-sheet">` > `GallerySection` > `GallerySectionHeader title="Sheet" description="Painel modal preso a uma borda da janela. Não usado no app hoje."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="Sheet"><SheetPlayground /></GalleryItem>`.

## `SheetPlayground`

| `label`              | `prop`             | Controle | Opções                                                                                   | Padrão  |
| -------------------- | ------------------ | -------- | ---------------------------------------------------------------------------------------- | ------- |
| Lado                 | `side`             | Radio    | `top` "Topo", `right` "Direita", `bottom` "Base", `left` "Esquerda"                      | `right` |
| Botão fechar (X)     | `showCloseButton`  | Boolean  | —                                                                                        | `true`  |
| Fecha ao clicar fora | `isDismissable`    | Boolean  | —                                                                                        | `true`  |
| Cabeçalho            | `PrismSheetHeader` | Boolean  | `PrismSheetTitle` "Editar parceiro" + `PrismSheetDescription` "Altere os dados e salve." | `true`  |
| Rodapé               | `PrismSheetFooter` | Boolean  | `PrismSheetClose` "Cancelar" + `PrismSheetClose variant="default"` "Salvar"              | `true`  |
| Conteúdo longo       | —                  | Boolean  | 15 parágrafos curtos (testa rolagem)                                                     | `false` |

Prévia (o gatilho):

```tsx
<PrismSheetTrigger>
  <PrismButton variant="outline">Abrir painel</PrismButton>
  <PrismSheet
    isDismissable={isDismissable}
    showCloseButton={showCloseButton}
    side={side}
  >
    {header}
    <div className="flex-1 overflow-y-auto px-6 text-sm">{body}</div>
    {footer}
  </PrismSheet>
</PrismSheetTrigger>
```

Corpo curto: um parágrafo. Com cabeçalho desligado, mantenha um `PrismSheetTitle className="sr-only"` "Painel de exemplo" (o diálogo precisa de nome acessível). `caption`: `` `side=${side}` ``.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes de UI > Sheet (entre Separator e Skeleton), claro e escuro: abre no lado escolhido; X, Cancelar, Salvar e Escape fecham; clicar fora fecha só com "Fecha ao clicar fora"; conteúdo longo rola dentro do painel com cabeçalho/rodapé fixos; foco volta ao gatilho ao fechar.
3. 375px: painel lateral ocupa 3/4 da largura; sem rolagem horizontal da página. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam.
2. Controles exatamente como na tabela; sem caixas em volta da prévia.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos; AGENTS.md com a contagem atualizada.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador:
- Observações (ex.: "Close" em inglês):
