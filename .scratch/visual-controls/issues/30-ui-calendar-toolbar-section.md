# 30 — `/ui`: seção "CalendarToolbar"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `CalendarToolbar` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/features/CalendarToolbar.tsx`: `CalendarToolbar({ currentDay, setCurrentDay, days = 1, showDate })`. Botões anterior/próximo (`PrismButton ghost icon`, ocultos abaixo de `md`), gatilho de calendário (`PrismButton ghost` com `CalendarDaysIcon` e, com `showDate`, o mês/ano) que abre um `PrismPopover` com calendário. Avança/volta `days` dias. Sem contexto nem consulta ao banco.
- Usado em 2 arquivos (Home e Hoje).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaCalendarToolbarSection.tsx` com `export function UzzinaCalendarToolbarSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-calendar-toolbar", label: "CalendarToolbar", section: "uzzina", keywords: ["calendario", "data", "dia", "navegacao", "toolbar"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-calendar-toolbar">` > `GallerySection` > header `title="CalendarToolbar"`, `description="Navegação de datas da Home e de Hoje: anterior, próximo e calendário em popover."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="CalendarToolbar"><CalendarToolbarPlayground /></GalleryItem>`.

## `CalendarToolbarPlayground`

| `label`      | `prop`     | Controle | Opções        | Padrão  |
| ------------ | ---------- | -------- | ------------- | ------- |
| Passo (dias) | `days`     | Radio    | `1`, `3`, `7` | `1`     |
| Mostrar mês  | `showDate` | Boolean  | —             | `false` |

- `days={Number(daysOption)}`; `currentDay` em estado (`new Date()` inicial), `setCurrentDay={setCurrentDay}`.
- `caption`: `format(currentDay, "EEEE, dd/MM/yyyy", { locale: ptBR })` (`date-fns` e `date-fns/locale/pt-BR`, já dependências do app).

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > CalendarToolbar, claro e escuro: setas andam `days` dias (legenda acompanha); calendário abre, escolher um dia atualiza a legenda; `showDate` mostra o mês/ano.
3. 375px: setas ficam ocultas (regra do componente, `hidden md:flex`); só o calendário aparece; sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela; sem caixas.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador:
- Pendências:
