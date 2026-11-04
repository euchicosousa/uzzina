# 02 — Tamanhos de texto por tamanho de controle

**Resumo:** Alinha fonte e altura de linha à escala de tamanho de cada controle.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Aprovado (proprietário, 03/11/2026). Chips do ComboboxChips com 11/12/14px são intencionais; a regra de fonte do Calendar vale só para as células de dia (títulos ajustados pelo proprietário).

## Decisão (proprietário, 03/11/2026)

| Tamanho | Texto              | Observação                                         |
| ------- | ------------------ | -------------------------------------------------- |
| xs      | `text-xs` (12px)   | único tamanho com `text-xs`                        |
| sm      | `text-sm` (14px)   | `text-xs` em sm foi testado e ficou difícil de ler |
| default | `text-sm` (14px)   | sem mudança                                        |
| lg      | `text-base` (16px) | decidido em 03/11/2026 e aplicado localmente       |

Aplicado localmente (sem commit), alturas/padding/raios inalterados:

- `prism/input.tsx`, `color-field.tsx`, `time-field.tsx`: sm `text-xs placeholder:text-xs` → `text-sm placeholder:text-sm`.
- `prism/input-group.tsx`: contêiner sm, `InputGroupText` sm e `InputGroupInput`/textarea sm → `text-sm`.
- `prism/combobox.tsx`: contêiner de chips sm → `text-sm`. Chips mantidos (sm `text-[11px]`, default `text-xs`, lg `text-sm`), decisão separada.
- `prism/command.tsx`: `CommandInput` sm → `text-sm` (altura `h-9` mantida).
- `prism/calendar.tsx` sm: contêiner e dia `text-xs` → `text-sm`; span interno `text-[10px]` → `text-xs`; cabeçalho semanal `text-[0.7rem]` → `text-xs`.
- `features/ComboboxTrigger.tsx`: `form-inline` sm → `text-sm`.
- `features/ActionComments/CommentInput.tsx`: botões Cancelar/Enviar (`h-8`) → `text-sm`. Botão de audiência (`size="xs"`, `h-7`) e itens/vazio do Command de menção (`text-xs`) mantidos.
- lg → `text-base`: `toggle.tsx` (`lg` e `icon-lg`; `ToggleGroup` repassa o tamanho), `button-group.tsx` (`ButtonGroupText` via `group-data-[size=lg]/button-group:text-base`, pois `ButtonGroup` já expõe `data-size`), `select.tsx` (gatilho `data-[size=lg]:text-base`), `date-range-picker.tsx` (gatilho `lg`; o span interno agora herda), `combobox.tsx` (input interno do `ComboboxChips` herda o tamanho do contêiner).
- Limpeza de redundâncias (texto declarado uma vez na base; só xs/lg sobrescrevem): `input.tsx`, `color-field.tsx`, `time-field.tsx` (`text-sm placeholder:text-sm` movido para a base), `input-group.tsx` (addon `text-sm` na base; removidos os três `text-*` repetidos de `InputGroupInput`, pois `PrismInput` já recebe `size`; `InputGroupText` sem `text-sm` repetido), `command.tsx` (`CommandInput`: `text-sm` na base, só `h-9` em sm), `combobox.tsx` (contêiner de chips `text-sm` na base; removidos `text-sm` do input e `md:text-sm`), `checkbox.tsx`/`radio-group.tsx` (variante default sem `text-sm` repetido), `calendar.tsx` (classes comuns de célula/cabeçalho/contêiner em constantes; só lg sobrescreve), `date-range-picker.tsx` (span sem `text-sm`).
- Button/Toggle/ToggleGroup sm já herdavam `text-sm`; Select e DateRangePicker trigger sm já eram `text-sm`.

Medição em `/ui#test-text-sizes` (03/11/2026): coluna sm em 14px em todos os controles; xs em 12px. Avisos restantes:

- lg: corrigido (Toggle, ToggleGroup, ButtonGroupText, Select trigger, DateRangePicker trigger, input do ComboboxChips agora 16px).
- ComboboxChips · chip: 11px / 12px / 14px (decisão separada); contêiner lg mede 50px, acima de 48px.
- Calendar · título do mês: +1 degrau (default 16px, lg 18px), escala própria (aviso restante na seção de testes). Nota: o `h2` do título precisa de classe `text-*` explícita em sm (sem ela cai em 36px).
- Calendar · dia: o teste media o `td` (40/48/56px). O `td` inclui o `mt-2` do wrapper da célula (8px de espaço entre semanas); o botão do dia mede 32/40/48px. Corrigido o seletor do teste, sem bug de layout.
- CheckBox/RadioGroup sm usam `text-xs` no rótulo (não alterado; rótulos estão fora da regra).

## Contexto

Escala de altura dos controles: xs `h-6`, sm `h-8`, default `h-10`, lg `h-12`. Texto pretendido (a decidir): sm `text-xs`, default `text-sm`, lg `text-base`. Hoje cada primitivo decide por conta própria, e há desvios: `Button` sm e default não declaram tamanho (herdam `text-sm` da base), enquanto `Input`/`InputGroup`/`ColorField`/`TimeField` usam `text-xs` em sm. Resultado: um Button sm e um Input sm lado a lado têm fontes diferentes.

Validação visual: seção temporária `/ui#test-text-sizes` ("Teste — tamanhos de texto", `app/components/ui-sections/TextSizeTestSection.tsx`, em construção), com todos os controles lado a lado por tamanho. Remover a seção ao fechar o ticket.

Observação: `calendar.tsx` e outros arquivos de `prism/` estão com alterações locais não commitadas; as linhas abaixo refletem a árvore de trabalho em 03/11/2026 e podem se deslocar.

## Levantamento — primitivos Prism (`app/components/prism/`)

"—" = não tem esse tamanho. "(herda)" = sem classe própria; vale o `text-sm` da base.

| Componente                                     | xs           | sm                          | default                 | lg             | Arquivo:linha                       | Desvio                                                              |
| ---------------------------------------------- | ------------ | --------------------------- | ----------------------- | -------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Button                                         | text-xs      | (herda sm)                  | (herda sm)              | text-base      | button.tsx:11,32-36                 | sm = default = text-sm; só xs/lg declaram                           |
| Toggle                                         | text-xs      | (herda sm)                  | (herda sm)              | (herda sm)     | toggle.tsx:9,21-25                  | lg continua text-sm (Button lg é text-base)                         |
| ToggleGroup                                    | herda Toggle | herda                       | herda                   | herda          | toggle-group.tsx:18,57              | só repassa `size`                                                   |
| ButtonGroupText                                | —            | text-sm fixo                | text-sm fixo            | text-sm fixo   | button-group.tsx:62,72              | sem variação por tamanho                                            |
| Input                                          | —            | text-xs (+placeholder)      | text-sm                 | text-base      | input.tsx:13-15                     | sm diverge de Button sm                                             |
| InputGroup (contêiner)                         | —            | text-xs                     | text-sm                 | text-base      | input-group.tsx:76-79               | idem                                                                |
| InputGroupAddon                                | —            | text-xs                     | text-sm                 | text-base      | input-group.tsx:228-230             | ok internamente                                                     |
| InputGroupInput/textarea                       | —            | text-xs                     | text-sm                 | text-base      | input-group.tsx:259-261             | ok internamente                                                     |
| Textarea                                       | —            | —                           | text-base, `md:text-sm` | —              | textarea.tsx:15                     | sem prop de tamanho; muda por breakpoint                            |
| Select trigger                                 | —            | text-sm                     | text-sm                 | text-sm        | select.tsx:84                       | só altura varia (`data-[size]`); sm deveria ser xs                  |
| Select label / item / vazio                    | —            | xs / sm / sm                | idem                    | idem           | select.tsx:193,207,243              | itens não acompanham o tamanho                                      |
| Combobox input (campo)                         | —            | text-xs                     | text-sm                 | text-base      | combobox.tsx:237-239                | ok                                                                  |
| Combobox chips                                 | —            | text-[11px]                 | text-xs                 | text-sm        | combobox.tsx:243-245                | único uso de 11px no Prism; chip é um degrau abaixo                 |
| Combobox input interno / itens / label / vazio | —            | text-sm / sm / xs / sm      | idem                    | idem           | combobox.tsx:351,176,209,219        | `md:text-sm` redundante; input interno não segue o tamanho do campo |
| DateRangePicker trigger                        | —            | text-sm                     | text-sm                 | text-sm        | date-range-picker.tsx:119,130,44-48 | `triggerSizeClasses` só define altura/padding                       |
| TimeField                                      | —            | text-xs                     | text-sm                 | text-base      | time-field.tsx:16-18                | ok                                                                  |
| ColorField                                     | —            | text-xs                     | text-sm                 | text-base      | color-field.tsx:14-16               | ok                                                                  |
| Calendar — célula                              | —            | text-xs (dia) / 10px (span) | text-sm / xs            | text-base / sm | calendar.tsx:37-54                  | span `text-[10px]` arbitrário                                       |
| Calendar — cabeçalho semanal                   | —            | text-[0.7rem]               | text-xs                 | text-sm        | calendar.tsx:39,46,53               | `0.7rem` arbitrário (≈11,2px)                                       |
| Calendar — título do mês                       | —            | text-sm                     | text-base               | text-lg        | calendar.tsx:40,47,54               | escala própria (+1 degrau)                                          |
| Command input                                  | —            | text-xs (`h-9`)             | text-sm (`h-11`)        | —              | command.tsx:153                     | alturas fora da escala (h-9, h-11)                                  |
| Command item / empty / heading / shortcut      | —            | text-sm / sm / xs / xs      | idem                    | idem           | command.tsx:176,194,275             | sem variação por tamanho                                            |
| Dropdown item                                  | —            | text-sm                     | text-sm                 | text-sm        | dropdown-menu.tsx:94-98,163         | fixo                                                                |
| Dropdown label / shortcut                      | —            | text-xs                     | text-xs                 | text-xs        | dropdown-menu.tsx:80,219            | fixo                                                                |
| Tabs                                           | —            | herda                       | herda (`h-10`)          | —              | tabs.tsx:29                         | sem classe de texto; herda do contexto                              |
| Badge                                          | —            | text-xs (`h-5`)             | —                       | —              | badge.tsx:4                         | tamanho único                                                       |
| Kbd                                            | —            | text-xs (`h-5`)             | —                       | —              | kbd.tsx:10                          | tamanho único                                                       |
| Accordion trigger / painel                     | —            | text-sm                     | text-sm                 | text-sm        | accordion.tsx:54,86                 | fixo                                                                |
| Dialog título / descrição                      | —            | text-xl / text-sm           | idem                    | idem           | dialog.tsx:206,220                  | fixo; título não é de controle                                      |
| Alert título / descrição                       | —            | text-xl / text-sm           | idem                    | idem           | alert.tsx:49,64                     | fixo                                                                |
| Toast (sonner)                                 | —            | sem tamanho próprio         | —                       | —              | sonner.tsx                          | não há classe `text-*` (fonte do Sonner)                            |
| Popover (corpo / título)                       | —            | text-sm / text-base         | idem                    | idem           | popover.tsx:82,94                   | fixo                                                                |

## Levantamento — componentes da aplicação com tamanho fixo

| Componente                 | Onde                                                                                                                                         | Desvio                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ComboboxTrigger            | features/ComboboxTrigger.tsx:32 (base `text-sm`), :46 (`form-inline` sm: `h-8 ... text-xs`)                                                  | sm usa text-xs; base ignora o tamanho; `filter` usa `buttonVariants` sm (herda sm) |
| GlobalSearchCommand        | features/GlobalSearchCommand.tsx:486,491 (text-sm), :526,569 (text-xs)                                                                       | texto de apoio xs, fixo; campo vem do Command                                      |
| RichTextEditor (barra)     | features/RichTextEditor.tsx                                                                                                                  | sem `text-*` direto na barra (usa Button/Toggle); conferir ao validar              |
| CommentInput               | features/ActionComments/CommentInput.tsx:71 (text-sm), :87,192,201 (`h-7`/`h-8 ... text-xs`), :158 (text-xs), :187 (`text-[10px]` uppercase) | alturas h-7/h-8 e text-xs forçados sobre Button; contorna a escala                 |
| ActionFormFooter           | features/action-drawer/ActionFormFooter.tsx                                                                                                  | sem `text-*` direto; depende de ComboboxTrigger `form-footer` e Button             |
| Header (menu/notificações) | layout/Header.tsx:453-509                                                                                                                    | text-sm/text-xs fixos; sem relação com controles                                   |

## Escala tipográfica usada no app (`app/**/*.tsx`, ocorrências)

| Classe                                    | App total | Dentro de prism/ |
| ----------------------------------------- | --------- | ---------------- |
| text-[8px] / [9px]                        | 3 / 6     | 0                |
| text-[10px]                               | 21        | 1                |
| text-[11px]                               | 6         | 1                |
| text-[0.7rem]                             | 1         | 1                |
| outros px arbitrários (20–38px, 8vh etc.) | ~9        | 0                |
| text-xs                                   | 223       | 30               |
| text-sm                                   | 215       | 56               |
| text-base                                 | 42        | 20               |
| text-lg                                   | 18        | 1                |
| text-xl                                   | 11        | 2                |
| text-2xl a 4xl                            | 30        | 0                |

Total de `text-[...]` arbitrários: 50. Leitura: xs e sm dominam (~438 usos); abaixo de 12px há ~37 usos, que a regra "sm = xs" não resolve e pedem decisão separada.

## Opções

**A — sm = text-xs em tudo, inclusive Button.**
Mudanças: `button.tsx` (sm: `text-xs`; default fica `text-sm`), `toggle.tsx` (sm `text-xs`, lg `text-base`), `select.tsx` (trigger e itens por tamanho), `date-range-picker.tsx` (`triggerSizeClasses`), `combobox.tsx` (input interno e itens), `command.tsx` (sm), `calendar.tsx` (remover 10px/0.7rem), `ComboboxTrigger.tsx` (base por tamanho), `CommentInput.tsx` (remover `h-7/h-8 text-xs` forçados). Input/InputGroup/TimeField/ColorField já estão assim. Efeito visual: Button sm e Toggle sm ficam menores do que hoje; usos de `size="sm"` pela aplicação encolhem (conferir lista com grep de `size="sm"`).

**B — sm = text-sm em tudo.**
Mudanças: `input.tsx`, `input-group.tsx` (contêiner, addon, input), `time-field.tsx`, `color-field.tsx`, `combobox.tsx` (campo e chips), `command.tsx` input sm, `calendar.tsx` sm, `ComboboxTrigger.tsx`. Button, Select e DateRangePicker permanecem. Efeito: menos arquivos em Button/Toggle, mas Input sm cresce e a diferença entre sm e default fica só na altura; xs passa a ser o único texto menor.

**C — outra regra** (ex.: texto fixo `text-sm` em todos exceto xs e lg; ou sm = xs só em campos de entrada). Definir tabela alvo e anotar aqui.

Decisões complementares (valem para qualquer opção): destino dos 11px/10px/0.7rem (Combobox chips, Calendar, CommentInput); se Select/DateRangePicker/Dropdown/Command items acompanham o tamanho; se Textarea ganha prop `size` e perde `md:text-sm`; se título do mês do Calendar mantém +1 degrau.

## Critérios de aceite

- Tabela alvo (componente x tamanho) registrada neste ticket após a decisão.
- Todo controle size-capable usa a mesma classe de texto por tamanho, sem herança implícita (Button/Toggle declaram sm e default explicitamente).
- Placeholder acompanha o texto do campo.
- Sem `text-[Npx]`/`text-[0.7rem]` em primitivos de controle, salvo exceção documentada.
- Wrappers da aplicação (ComboboxTrigger, CommentInput) não reimpõem tamanho de texto/altura que contrarie a escala.
- Nenhuma quebra de altura da escala h-6/8/10/12.

## Validação

1. Abrir `/ui#test-text-sizes` e comparar, por tamanho, Button, Toggle, ToggleGroup, Input, InputGroup, Select, Combobox, DateRangePicker, TimeField, ColorField, Command e Calendar lado a lado: texto e altura alinhados.
2. Conferir tema claro/escuro e uma paleta, no desktop e a 375px.
3. Percorrer telas com `size="sm"` (gaveta de ação, CommentInput, filtros) e confirmar que nada corta ou quebra linha.
4. Prettier nos arquivos alterados; typecheck só se tocar tipos de props.
5. Remover `TextSizeTestSection.tsx` e sua entrada em `app/routes/ui.tsx` ao concluir (ou registrar por que fica).
