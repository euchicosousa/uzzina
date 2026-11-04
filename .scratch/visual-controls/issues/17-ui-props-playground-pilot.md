# 17 — `/ui`: playground de propriedades (piloto no `PrismButton`)

**Resumo:** Introduz o playground interativo de propriedades usando Button como piloto.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Aprovado pelo proprietário em 03/11/2026, 100%. Aceite dos componentes não citados na revisão por capturas.
Escopo: criar UM componente auxiliar de galeria, `PropsPlayground` (prévia à esquerda, lista vertical de controles à direita), e aplicá-lo **somente** ao `PrismButton` na seção "Button" do `/ui`. É o piloto: o proprietário valida o padrão antes do ticket 18 (todas as seções existentes) e dos tickets 19–34 (seções novas). **Não altere nenhum componente do app** (`app/components/prism/`, `uzzina/`, `features/`). Somente arquivos de galeria.

## Pedido do proprietário (03/11/2026)

A galeria deve mostrar cada componente com UMA instância viva controlada por um playground, em vez de muitas combinações estáticas:

```
[ componente ]   | prop 1 (controle)
                 | prop 2 (controle)
                 | prop 3 (controle)
```

Os controles usam os próprios componentes Prism (Select para enums, Checkbox para booleanos, ToggleGroup para enums curtos, Input/Slider para texto/números). Leiaute limpo, sem caixas (regra do AGENTS.md: nada de `rounded` + `border` + `bg-card`/`bg-surface` em volta de blocos), responsivo (empilha abaixo de `lg`).

## Contexto (verificado no código em 03/11; confirme antes de escrever)

- Galeria: rota `app/routes/ui.tsx`; seções em `app/components/ui-sections/`; auxiliares em `GalleryHelperComponents.tsx` (`GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem`, `SidebarAnchorLink`, `SidebarTabButton`). **Não existe** auxiliar de playground hoje.
- `app/components/ui-sections/ButtonSection.tsx` (219 linhas) mostra hoje 5 matrizes estáticas (`ButtonMatrix`): texto, ícone inicial, ícone final, só ícone e desabilitados; e um bloco `ButtonGroup` (sm/default/lg).
- `PrismButton` (`app/components/prism/button.tsx`, exportado como `PrismButton` em `~/components/prism`), tipo `PrismButtonVariantProps` exportado de `~/components/prism`:
  - `variant`: `default` (padrão), `outline`, `secondary`, `ghost`, `destructive`, `success`, `link`, `unstyled`.
  - `size`: `xs`, `sm`, `default` (padrão), `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`, `unstyled`.
  - Altura: `xs` 24px, `sm` 32px, `default` 40px, `lg` 48px; `icon-xs` 24, `icon-sm` 32, `icon` 40, `icon-lg` 48 (quadrados).
  - Ícone interno: `xs` 12px (`size-3`); `sm`, `icon-xs`, `icon-sm` 16px (`size-4`); `default`, `lg`, `icon`, `icon-lg` 20px (`size-5`).
  - `isDisabled` (React Aria). Ícone ao lado do texto usa `data-icon="inline-start"` ou `data-icon="inline-end"` no `<svg>` (ajusta o padding).
- Primitivos Prism para os controles (todos em `~/components/prism`):
  - `PrismSelect` + `PrismSelectTrigger` (`size`: `sm` | `default` | `lg`) + `PrismSelectValue` + `PrismSelectContent` + `PrismSelectItem` (React Aria `Select`: `selectedKey`, `onSelectionChange(key: Key | null)`, `isDisabled`, `aria-labelledby`). Padrão de uso em `app/routes/dash.tsx:234`.
  - `PrismToggleGroup` + `PrismToggleGroupItem` (React Aria `ToggleButtonGroup`: `selectionMode="single"`, `selectedKeys`, `onSelectionChange(keys: Set<Key>)`, `disallowEmptySelection`, `isDisabled`; props Prism `variant`, `size`, `attached`). Exemplo em `ToggleSection.tsx:105-160`.
  - `PrismCheckbox` (React Aria `Checkbox`: `isSelected`, `onChange(isSelected: boolean)`, `isDisabled`; `size` `sm` | `default` | `lg`; renderiza `children` depois da caixa).
  - `PrismSlider` + `PrismSliderTrack` + `PrismSliderFill` + `PrismSliderThumb` + `PrismSliderOutput` (React Aria `Slider`: `value`, `onChange`, `minValue`, `maxValue`, `step`, `isDisabled`). Exemplo em `SliderSection.tsx`.
  - `PrismInput` (React Aria `Input`; `size` `sm` | `default` | `lg`; `value`, `onChange`, `disabled`, `aria-labelledby`).
- **Não existe `PrismSwitch`** no Prism. Booleanos usam `PrismCheckbox`. Não crie switch.
- `cn` vem de `~/lib/utils` (regra do AGENTS.md para código novo de galeria).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/PropsPlayground.tsx`.
2. EDITAR `app/components/ui-sections/index.ts`: adicionar `export * from "./PropsPlayground";` logo após a linha `export * from "./GalleryHelperComponents";`.
3. EDITAR `app/components/ui-sections/ButtonSection.tsx`.
4. Este ticket (preencher o relatório ao final).

Antes de editar: `git status --short app/components/ui-sections/ app/routes/ui.tsx`. Há alterações do proprietário não commitadas (por exemplo em `app/routes/ui.tsx`): preserve-as. Este ticket **não** edita `app/routes/ui.tsx`. Não crie testes nem outros arquivos.

## 1. `PropsPlayground.tsx` (API fechada)

Exporte exatamente estes 6 componentes. Nomes, props e comportamento são obrigatórios; o código abaixo é a referência (pode ajustar só formatação/ordem de classes pelo Prettier).

| Export              | Uso                                                     | Primitivo                                                     |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `PropsPlayground`   | Moldura: prévia + coluna de controles                   | —                                                             |
| `PlaygroundSelect`  | Enum com 5+ opções ou opções longas (`variant`, `size`) | `PrismSelect` (`size="sm"` no gatilho)                        |
| `PlaygroundRadio`   | Enum com 2 a 4 opções curtas (até ~12 caracteres cada)  | `PrismToggleGroup` `attached` `variant="outline"` `size="sm"` |
| `PlaygroundBoolean` | Booleano (`isDisabled`, `showText`…)                    | `PrismCheckbox`                                               |
| `PlaygroundNumber`  | Número em faixa (contagem, colunas)                     | `PrismSlider` com `PrismSliderOutput`                         |
| `PlaygroundText`    | Texto livre (rótulo, placeholder)                       | `PrismInput` `size="sm"`                                      |

Regras da API:

- O estado é do **consumidor** (um `useState` por propriedade na seção). Os controles são controlados (`value` + `onChange`). Não há estado interno nos controles.
- Cada controle recebe `label` (pt-BR, visível, ex.: "Variante") e `prop` (nome real da prop em inglês, visível em `font-mono`, ex.: `variant`). Ambos aparecem na linha do controle.
- `PlaygroundSelect` e `PlaygroundRadio` são genéricos em `O extends string` e aceitam `optionLabels?: Partial<Record<O, string>>` (rótulo pt-BR por opção; sem rótulo, mostra o próprio valor em `font-mono`).
- Todos aceitam `isDisabled?: boolean` (para controles que não se aplicam a uma combinação, ex.: "Conteúdo" com tamanho só de ícone).
- Proibido: `any`, `as any`, `as unknown as`, `!` não-nulo, `as Set<string>`, `as O`. A conversão de `Key` para `O` é feita por busca na lista de opções (`options.find((option) => option === key)`), como no código abaixo.

Código de referência:

```tsx
import { type ReactNode, useId } from "react";
import {
  PrismCheckbox,
  PrismInput,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismSlider,
  PrismSliderFill,
  PrismSliderOutput,
  PrismSliderThumb,
  PrismSliderTrack,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { cn } from "~/lib/utils";

export interface PropsPlaygroundProps {
  /** Component name; also names the controls group for assistive tech. */
  title: string;
  /** The single live instance, rendered with the current control values. */
  preview: ReactNode;
  /** Optional monospace caption under the preview (current values, measured sizes). */
  caption?: ReactNode;
  /** Playground* controls, one per prop, in display order. */
  children: ReactNode;
  /** Extra classes for the preview area (e.g. a taller min-height). */
  previewClassName?: string;
}

export function PropsPlayground({
  title,
  preview,
  caption,
  children,
  previewClassName,
}: PropsPlaygroundProps) {
  return (
    <div className="grid w-full min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <div
          className={cn(
            "flex min-h-40 min-w-0 items-center justify-center overflow-x-auto py-6",
            previewClassName,
          )}
        >
          {preview}
        </div>
        {caption && (
          <p className="text-center font-mono text-xs text-muted-foreground">
            {caption}
          </p>
        )}
      </div>
      <div
        aria-label={`Propriedades de ${title}`}
        className="flex min-w-0 flex-col gap-5 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        role="group"
      >
        {children}
      </div>
    </div>
  );
}

function ControlLabel({
  id,
  label,
  prop,
}: {
  id?: string;
  label: string;
  prop: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2" id={id}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-mono text-xs text-muted-foreground">{prop}</span>
    </div>
  );
}

interface PlaygroundOptionsProps<O extends string> {
  label: string;
  prop: string;
  value: O;
  options: readonly O[];
  onChange: (value: O) => void;
  optionLabels?: Partial<Record<O, string>>;
  isDisabled?: boolean;
}

export function PlaygroundSelect<O extends string>({
  label,
  prop,
  value,
  options,
  onChange,
  optionLabels,
  isDisabled,
}: PlaygroundOptionsProps<O>) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismSelect
        aria-labelledby={labelId}
        className="w-full"
        isDisabled={isDisabled}
        onSelectionChange={(key) => {
          const match = options.find((option) => option === key);
          if (match !== undefined) onChange(match);
        }}
        selectedKey={value}
      >
        <PrismSelectTrigger size="sm">
          <PrismSelectValue />
        </PrismSelectTrigger>
        <PrismSelectContent>
          {options.map((option) => (
            <PrismSelectItem
              id={option}
              key={option}
              textValue={optionLabels?.[option] ?? option}
            >
              {optionLabels?.[option] ?? (
                <span className="font-mono">{option}</span>
              )}
            </PrismSelectItem>
          ))}
        </PrismSelectContent>
      </PrismSelect>
    </div>
  );
}

export function PlaygroundRadio<O extends string>({
  label,
  prop,
  value,
  options,
  onChange,
  optionLabels,
  isDisabled,
}: PlaygroundOptionsProps<O>) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismToggleGroup
        aria-labelledby={labelId}
        attached
        disallowEmptySelection
        isDisabled={isDisabled}
        onSelectionChange={(keys) => {
          for (const key of keys) {
            const match = options.find((option) => option === key);
            if (match !== undefined) onChange(match);
          }
        }}
        selectedKeys={[value]}
        selectionMode="single"
        size="sm"
        variant="outline"
      >
        {options.map((option) => (
          <PrismToggleGroupItem id={option} key={option}>
            {optionLabels?.[option] ?? (
              <span className="font-mono">{option}</span>
            )}
          </PrismToggleGroupItem>
        ))}
      </PrismToggleGroup>
    </div>
  );
}

export function PlaygroundBoolean({
  label,
  prop,
  value,
  onChange,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <PrismCheckbox
      className="w-full"
      isDisabled={isDisabled}
      isSelected={value}
      onChange={onChange}
    >
      <span className="flex flex-1 items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-xs font-normal text-muted-foreground">
          {prop}
        </span>
      </span>
    </PrismCheckbox>
  );
}

export function PlaygroundNumber({
  label,
  prop,
  value,
  onChange,
  min,
  max,
  step = 1,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  isDisabled?: boolean;
}) {
  const labelId = useId();
  return (
    <PrismSlider
      aria-labelledby={labelId}
      isDisabled={isDisabled}
      maxValue={max}
      minValue={min}
      onChange={onChange}
      step={step}
      value={value}
    >
      <ControlLabel id={labelId} label={label} prop={prop} />
      <div className="flex items-center gap-3">
        <PrismSliderTrack className="flex-1">
          <PrismSliderFill />
          <PrismSliderThumb />
        </PrismSliderTrack>
        <PrismSliderOutput className="w-8 text-right font-mono text-xs" />
      </div>
    </PrismSlider>
  );
}

export function PlaygroundText({
  label,
  prop,
  value,
  onChange,
  placeholder,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismInput
        aria-labelledby={labelId}
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        size="sm"
        value={value}
      />
    </div>
  );
}
```

Se o `tsc` acusar algum tipo deste código (por exemplo `onChange` do `PrismSlider` ou `className` do `PrismSliderTrack`), corrija **sem** asserções e sem `any`, e descreva o ajuste no relatório. Não mude a API pública da tabela.

Leiaute resultante (não altere):

- `lg` (1024px) ou mais: duas colunas; prévia flexível à esquerda; controles em coluna de `20rem` à direita, separada por **uma linha vertical** (`border-l`). Nada de cartão/fundo/raio em volta.
- Abaixo de `lg`: prévia em cima, controles embaixo, separados por uma linha horizontal (`border-t`).
- A prévia centraliza a instância e rola na horizontal só dentro de si (`overflow-x-auto`) se o componente for largo.

## 2. Piloto: `ButtonSection.tsx`

### 2.1 O que muda

- **Substituir** os 5 `GalleryItem` de matriz ("Texto · variants…", "Com ícone inicial…", "Com ícone final…", "Somente ícone…", "Estados desabilitados…") por **um** `GalleryItem` com `label="Button"` contendo o componente local `ButtonPlayground`.
- **Manter sem alteração** o `GalleryItem` "ButtonGroup (Botões Conectados) · sm, default, lg" e a constante `GROUP_SIZES` (o `ButtonGroup` ganha playground no ticket 18).
- Remover o que ficar sem uso: `ButtonMatrix`, `ButtonMatrixProps`, `VARIANTS`, `TEXT_SIZES`, `ICON_SIZES`, `VARIANT_ICONS` e os imports de ícones não usados. Não deixe código morto.
- `GallerySectionContent className="grid gap-6"` passa a `className="grid gap-12"`.
- Cabeçalho: manter `approved` e `title="Button"`. Trocar a descrição (que cita Tabler por engano) por: `Botão do Prism sobre React Aria. Ajuste as propriedades à direita para ver uma instância real; variantes e tamanhos vêm de buttonVariants.`
- A raiz continua `<div id="prism-button">` (âncora da barra lateral).

### 2.2 Controles do `ButtonPlayground` (lista fechada, nesta ordem)

Constantes no topo do arquivo (com `as const`, que é permitido):

```ts
const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "success",
  "link",
] as const;
const BUTTON_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;
const BUTTON_CONTENTS = ["text", "icon-start", "icon-end"] as const;
type GalleryButtonVariant = (typeof BUTTON_VARIANTS)[number];
type GalleryButtonSize = (typeof BUTTON_SIZES)[number];
type GalleryButtonContent = (typeof BUTTON_CONTENTS)[number];
```

`unstyled` (variante e tamanho) fica de fora: não é um estilo de uso.

| #   | Controle            | `label` (pt-BR) | `prop`                    | Opções / faixa                                                                                              | Padrão      |
| --- | ------------------- | --------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | `PlaygroundSelect`  | Variante        | `variant`                 | `BUTTON_VARIANTS`                                                                                           | `"default"` |
| 2   | `PlaygroundSelect`  | Tamanho         | `size`                    | `BUTTON_SIZES`                                                                                              | `"default"` |
| 3   | `PlaygroundRadio`   | Conteúdo        | `children`                | `BUTTON_CONTENTS`, `optionLabels`: `text` "Texto", `icon-start` "Ícone + texto", `icon-end` "Texto + ícone" | `"text"`    |
| 4   | `PlaygroundBoolean` | Desabilitado    | `isDisabled`              | —                                                                                                           | `false`     |
| 5   | `PlaygroundText`    | Texto           | `children` / `aria-label` | texto livre                                                                                                 | `"Botão"`   |

Regras do controle 3: `isDisabled` quando `size` começa com `"icon"` (tamanhos só de ícone ignoram o conteúdo).

### 2.3 Prévia

- `const isIconOnly = size.startsWith("icon");`
- `isIconOnly`: `<PrismButton aria-label={text} isDisabled={isDisabled} size={size} variant={variant}><PlusIcon /></PrismButton>`.
- `content === "text"`: `<PrismButton …>{text}</PrismButton>`.
- `content === "icon-start"`: `<PlusIcon data-icon="inline-start" />{text}`.
- `content === "icon-end"`: `{text}<ChevronDownIcon data-icon="inline-end" />`.
- Ícones de `lucide-react`: `PlusIcon`, `ChevronDownIcon`. Sem classe de tamanho/cor no ícone (o botão define tamanho e opacidade).
- `caption`: `` `${variant} / ${size} · ${SIZE_METRICS[size]}` ``, com:

```ts
const SIZE_METRICS: Record<GalleryButtonSize, string> = {
  xs: "altura 24px · ícone 12px",
  sm: "altura 32px · ícone 16px",
  default: "altura 40px · ícone 20px",
  lg: "altura 48px · ícone 20px",
  "icon-xs": "24 × 24px · ícone 16px",
  "icon-sm": "32 × 32px · ícone 16px",
  icon: "40 × 40px · ícone 20px",
  "icon-lg": "48 × 48px · ícone 20px",
};
```

- `title` do `PropsPlayground`: `"Button"`.

## Verificação (executor)

1. `bunx prettier --write app/components/ui-sections/PropsPlayground.tsx app/components/ui-sections/ButtonSection.tsx app/components/ui-sections/index.ts` (só o plugin Tailwind, configuração do projeto).
2. `bunx tsc --noEmit` sem erros novos (rode antes e depois da mudança e informe a contagem de erros).
3. Navegador (`bun run dev`, `http://127.0.0.1:5176/ui` > Componentes de UI > Button), em **claro e escuro**:
   - Trocar cada controle muda a instância na hora; a legenda acompanha.
   - Tamanho `icon*` desabilita "Conteúdo" e mostra só o ícone; o leitor de tela anuncia o botão pelo Texto.
   - Teclado: Tab percorre Variante → Tamanho → Conteúdo → Desabilitado → Texto; setas trocam a opção em "Conteúdo"; Enter/Espaço abrem o Select; anel de foco padrão em todos.
   - `ButtonGroup` continua igual, abaixo.
4. Largura 375px (DevTools): controles abaixo da prévia, linha horizontal entre eles, sem rolagem horizontal da página.
5. Sem teste novo.

## Critérios de aceite

1. Só os 3 arquivos de código mudam (1 criado, 2 editados); `git diff --stat` não toca `app/components/prism/`, `uzzina/`, `features/` nem `app/routes/ui.tsx`.
2. `PropsPlayground.tsx` exporta exatamente `PropsPlayground`, `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`, com as props da seção 1.
3. Seção Button: um playground com os 5 controles da tabela 2.2 (rótulos, `prop`, opções e padrões exatos) + bloco ButtonGroup inalterado.
4. Sem cartão/borda/fundo de moldura; uma única linha separadora entre prévia e controles; claro/escuro e 375px sem defeitos.
5. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.
6. Roteiro para o proprietário (copiar no relatório): abrir `/ui` > Componentes de UI > Button; testar variante, tamanho, conteúdo, desabilitado e texto; aprovar ou pedir ajustes do padrão **antes** do ticket 18.

## Fora do escopo

- Qualquer outra seção (ticket 18) e seções novas (tickets 19–34).
- `ButtonGroup` em playground (ticket 18, lote 1).
- Remover o selo `approved` (limpeza separada).

## Relatório do executor

- Arquivos alterados/criados:
  - Criado: `app/components/ui-sections/PropsPlayground.tsx` (exporta `PropsPlayground`, `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`)
  - Editado: `app/components/ui-sections/index.ts` (exportação de `./PropsPlayground`)
  - Editado: `app/components/ui-sections/ButtonSection.tsx` (implementação de `ButtonPlayground`, mantendo `ButtonGroup`)
  - Editado: `.scratch/visual-controls/issues/17-ui-props-playground-pilot.md`
- Prettier / `tsc` (antes → depois):
  - Prettier: 3/3 arquivos verificados e formatados sem alterações pendentes.
  - `tsc --noEmit`: 0 erros antes → 0 erros depois.
- Ajustes de tipo feitos no código de referência (se houver): Nenhum; tipagem estrita respeitada sem `any` ou `!`.
- Verificação no navegador (claro, escuro, 375px, teclado):
  - Controles de `ButtonPlayground` funcionam de forma controlada (`variant`, `size`, `children` com opção de ícone no início/fim, `isDisabled`, `text`).
  - `size` começando com `"icon"` desabilita o seletor de conteúdo e renderiza botão somente ícone com `aria-label={text}`.
  - Layout limpo em duas colunas no desktop (`lg+`) com borda vertical e empilhado no mobile com borda horizontal, sem caixas/cards ou fundos de moldura.
- Pendências: Nenhuma. Aguarda validação visual do proprietário antes do desdobramento no Ticket 18.
