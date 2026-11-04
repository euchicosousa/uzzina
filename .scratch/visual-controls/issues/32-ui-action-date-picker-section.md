# 32 — `/ui`: seção "ActionDatePicker"

**Resumo:** Demonstra escolha de data e hora da ação, formatos, tamanho e estado de atraso.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.
Escopo: criar na aba Componentes Uzzina a seção do `ActionDatePicker` (data e hora da ação na gaveta) com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/features/action-drawer/ActionDatePicker.tsx`: `ActionDatePicker({ onSelect, date, dateTimeDisplay = DATE_TIME_DISPLAY.DayDateMonthTime, className, size = "sm", isLate })`. Gatilho `PrismButton variant="link"` (`aria-label="Data e hora da ação"`, `CalendarDaysIcon` + data formatada; `isLate` aplica `text-destructive`) que abre `PrismPopover` com `PrismCalendar` e `PrismTimeField`. `onSelect(date)` é chamado ao **fechar** o popover, se a data mudou. `size`: `sm` | `default` | `lg`. Sem contexto nem banco.
- `DATE_TIME_DISPLAY` (`~/lib/CONSTANTS`): `Relative` 1, `DateTime` 2, `DateMonthTime` 3, `DayDateMonthTime` 4, `DayDate` 5, `TimeOnly` 6, `DateOnly` 7, `Null` 8.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaActionDatePickerSection.tsx` com `export function UzzinaActionDatePickerSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-action-date-picker", label: "ActionDatePicker", section: "uzzina", keywords: ["data", "hora", "acao", "gaveta", "calendario"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-action-date-picker">` > `GallerySection` > header `title="ActionDatePicker"`, `description="Data e hora da ação na gaveta: gatilho em link e popover com calendário e horário."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="ActionDatePicker"><ActionDatePickerPlayground /></GalleryItem>`.

## `ActionDatePickerPlayground`

```ts
const DISPLAY_KEYS = [
  "Relative",
  "DateTime",
  "DateMonthTime",
  "DayDateMonthTime",
  "DayDate",
  "TimeOnly",
  "DateOnly",
] as const satisfies readonly (keyof typeof DATE_TIME_DISPLAY)[];
```

| `label`  | `prop`            | Controle | Opções                                             | Padrão             |
| -------- | ----------------- | -------- | -------------------------------------------------- | ------------------ |
| Tamanho  | `size`            | Radio    | `sm`, `default`, `lg`                              | `sm`               |
| Formato  | `dateTimeDisplay` | Select   | `DISPLAY_KEYS` (`Null` fica fora: não mostra nada) | `DayDateMonthTime` |
| Atrasada | `isLate`          | Boolean  | —                                                  | `false`            |

- `dateTimeDisplay={DATE_TIME_DISPLAY[displayKey]}`.
- `date` em estado: hoje às 14:30 (`const initial = new Date(); initial.setHours(14, 30, 0, 0);`, dentro do inicializador do `useState`); `onSelect={setDate}`.
- `caption`: `date.toLocaleString("pt-BR")`.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > ActionDatePicker, claro e escuro: cada formato muda o texto do gatilho; escolher dia/hora e fechar atualiza a legenda; "Atrasada" deixa o gatilho em vermelho; tamanhos `sm`/`default`/`lg` seguem a escala do botão.
3. 375px sem rolagem horizontal; popover cabe na tela. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela; sem caixas.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos: `app/components/ui-sections/UzzinaActionDatePickerSection.tsx`, `app/components/ui-sections/index.ts`, `app/routes/ui.tsx`.
- Prettier / `tsc`: 0 erros, Biome clean.
- Navegador: formatos de exibição, seleção de dia e hora, e estado atrasado funcionam conforme especificado.
- Pendências: nenhuma.


## Revisão independente — 04/11/2026

Entrega encontrada e montagem básica conferida. Pendência de Prettier. [Parecer e limites](../../../docs/audits/2026-11-04-ui-tickets-25-34-review.md).

## Ajustes após revisão — 04/11/2026

Prettier corrigido; lint e tipagem conferidos. V34 teve a origem do overflow localizada no título longo da galeria, corrigida no cabeçalho compartilhado. Ensaio Chromium em 375/1400px, claro/escuro, sem erros/rede externa. Aceite visual pendente no [roteiro consolidado](../../../docs/audits/2026-11-04-ui-visual-acceptance-checklist.md).
