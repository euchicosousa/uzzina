# 30 — `/ui`: seção "CalendarToolbar"

**Resumo:** Demonstra navegação anterior/próxima, calendário e formatos do CalendarToolbar.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.
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

- Arquivos: `app/components/ui-sections/UzzinaCalendarToolbarSection.tsx`, `app/components/ui-sections/index.ts`, `app/routes/ui.tsx`.
- Prettier / `tsc`: 0 erros, Biome clean.
- Navegador: navegação de dias, popover com calendário e toggle de exibição de mês testados com sucesso.
- Pendências: nenhuma.


## Revisão independente — 04/11/2026

Entrega encontrada e montagem básica conferida. Pendência de Prettier. [Parecer e limites](../../../docs/audits/2026-11-04-ui-tickets-25-34-review.md).

## Ajustes após revisão — 04/11/2026

Prettier corrigido; lint e tipagem conferidos. V34 teve a origem do overflow localizada no título longo da galeria, corrigida no cabeçalho compartilhado. Ensaio Chromium em 375/1400px, claro/escuro, sem erros/rede externa. Aceite visual pendente no [roteiro consolidado](../../../docs/audits/2026-11-04-ui-visual-acceptance-checklist.md).
