# 26 — `/ui`: seção "UToggleInput"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `UToggleInput` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/uzzina/UToggle.tsx` exporta `UToggleInput`: `input` nativo oculto (`sr-only peer`) + `label` estilizado. Props: `id` (obrigatório), `type`: `checkbox` (padrão) | `radio`, `variant`: `default` | `destructive`, `className`, `onCheckedChange?: (checked: boolean) => void`, `children` e demais atributos de `<input>` (`checked`, `defaultChecked`, `disabled`, `name`…).
- Uso real: `app/routes/app/admin/partner/$slug.tsx:676` ("Arquivado", `variant="destructive"`, `defaultChecked`).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaToggleInputSection.tsx` com `export function UzzinaToggleInputSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-toggle-input", label: "UToggleInput", section: "uzzina", keywords: ["toggle", "checkbox", "arquivado", "formulario", "input"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-toggle-input">` > `GallerySection` > header `title="UToggleInput"`, `description="Alternador ligado a formulário (input nativo oculto + rótulo estilizado), usado em Arquivado no cadastro de parceiro."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="UToggleInput"><ToggleInputPlayground /></GalleryItem>`.

## `ToggleInputPlayground`

| `label`      | `prop`     | Controle | Opções                                              | Padrão        |
| ------------ | ---------- | -------- | --------------------------------------------------- | ------------- |
| Tipo         | `type`     | Radio    | `checkbox`, `radio`                                 | `checkbox`    |
| Variante     | `variant`  | Radio    | `default`, `destructive`                            | `destructive` |
| Marcado      | `checked`  | Boolean  | —                                                   | `false`       |
| Desabilitado | `disabled` | Boolean  | —                                                   | `false`       |
| Ícone        | `children` | Boolean  | `<ArchiveIcon className="size-4" />` antes do texto | `true`        |
| Texto        | `children` | Text     | —                                                   | `"Arquivado"` |

Prévia: `<UToggleInput checked={checked} disabled={disabled} id={id} name="gallery-toggle-input" onCheckedChange={setChecked} type={type} variant={variant}>` com `id = useId()`. Controlado pelo mesmo estado do controle "Marcado". Observação para o relatório: com `type="radio"`, clicar de novo não desmarca (comportamento nativo do rádio); desmarque pelo controle.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > UToggleInput, claro e escuro: clique alterna e o controle "Marcado" acompanha; destrutivo marcado usa o vermelho de `destructive`; desabilitado não alterna; Tab chega ao input oculto (registre se o foco tem indicação visível; não corrigir).
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela; sem caixas em volta.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador (incluindo foco por teclado):
- Pendências:
