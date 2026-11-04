# 25 — `/ui`: seção "ULoader"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `ULoader` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/uzzina/ULoader.tsx`: `ULoader({ className, size = "sm" })`, `size` = chave de `SIZE` (`~/lib/CONSTANTS`): `xs` 12px, `sm` 16, `md` 20, `lg` 24, `xl` 32, `2xl` 48. Ícone `Loader2` girando, `text-muted-foreground` (spinner é exceção aprovada à regra de ícones sem cinza).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaLoaderSection.tsx` com `export function UzzinaLoaderSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-loader", label: "ULoader", section: "uzzina", keywords: ["loader", "carregando", "spinner", "loading"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-loader">` > `GallerySection` > header `title="ULoader"`, `description="Indicador de carregamento giratório nos tamanhos da escala Uzzina."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="ULoader"><LoaderPlayground /></GalleryItem>`.

## `LoaderPlayground`

| `label` | `prop` | Controle | Opções                              | Padrão |
| ------- | ------ | -------- | ----------------------------------- | ------ |
| Tamanho | `size` | Select   | `xs`, `sm`, `md`, `lg`, `xl`, `2xl` | `md`   |

Prévia: `<ULoader size={size} />`. `caption`: `` `${size} · ${SIZE_PX[size]}px` `` com `SIZE_PX = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32, "2xl": 48 } as const`.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > ULoader, claro e escuro: gira em todos os tamanhos; legenda bate com o inspetor.
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controle como na tabela; sem caixas.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador:
