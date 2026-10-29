# 02: Diferenciar criar e gerenciar datas comemorativas

**What to build:** Criar data comemorativa na busca abre um modal simples com título e calendário para cadastrar. Gerenciar datas comemorativas continua abrindo a página administrativa existente. Evitar dois comandos diferentes com exatamente o mesmo destino/comportamento.

**Blocked by:** None (can start immediately).

**Status:** completed — approved by owner on 2026-10-28 after three visual passes; local commit, not pushed

## Resultado em28/10/2026

Proprietário autorizou iniciar o primeiro item da fila revisada, correspondente a este ticket. Criar data comemorativa agora abre modal com título e calendário em português, sem navegar nem fechar ações; Gerenciar mantém a página existente. Envio único, validação, erro/retry, cache canônico e guardas de sessão implementados.509 testes/1812 assertions, verificações de código/build e navegador controlado desktop/mobile passaram; cinco testes do modal repetidos após os ajustes finais de locale/altura. Relatório: [modal de data comemorativa](../../../docs/audits/2026-10-28-create-celebration-dialog.md). Sem SQL, escrita real, commit ou publicação.

## Evidence

O proprietário observou em28/10/2026 que Criar data comemorativa e Gerenciar datas comemorativas abrem a mesma página. O código confirma os dois destinos iguais. A proposta registrada é tornar Criar um cadastro rápido por modal; nenhuma alteração foi iniciada.

## Acceptance criteria

- [x] Criar abre modal com campo de título, seleção de data por calendário e ações de cadastrar/cancelar, reutilizando componentes e operação de criação existentes.
- [x] Gerenciar mantém a página atual com listagem e administração. Não criar outra página ou outro sistema de datas comemorativas.
- [x] Ambos os comandos continuam exclusivos para administradores; preservar autorização no servidor/banco. Abrir/cancelar não grava dados.
- [x] Validar título/data, impedir envios duplicados e manter os dados preenchidos se houver falha. Sucesso atualiza o cache/lista existente sem recarregar a aplicação.
- [x] Preservar edição das ações abertas, guardas necessárias e teclado do calendário/modal, com foco inicial, Escape e retorno de foco adequados. Shift não ganha semântica de ação secundária para esse comando.
- [x] Testes nos componentes reais verificam distinção entre comandos, permissões, criação única, cancelamento, erro/retry e sincronização; conferir desktop/mobile e temas com HTTP controlado.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e atualizar CURRENT/contratos/KI aplicáveis. Não criar registros de teste no banco real. Sem implementação, commit ou publicação autorizados por este registro.

## Owner visual review (2026-10-28)

Owner found the modal cluttered (calendar stretched across the dialog, unlabeled date). Layout reworked in `CelebrationDialog` only, without changing the shared `PrismCalendar`: a "Data" label with the chosen date written out beside it, fixed 36px day cells inside a bordered block, outside-month days dimmed, and a dot marking today so it stays distinct from the selected day. Search suite (49 tests), format, lint and typecheck passed. Built-in browser with an injected test session and controlled fetch (only blocked calls were fake token refreshes; no writes) checked desktop and 390×700, title entry and day selection updating the written date. Still uncommitted, awaiting owner review.

Second owner pass (same day): border around the calendar removed; the grid now spans the dialog width while each day keeps a fixed 36px square (no oversized rows). Month/year pickers in `PrismCalendar` lost their field background and now read as plain caption text with only the chevron (hover and keyboard focus still show feedback); this applies to every calendar with dropdown captions, as the owner asked. Full suite (525 tests), format, lint and typecheck passed; checked in the built-in browser with the controlled session, no writes.

Third owner pass: month/year pickers now share the 36px height of the previous/next buttons (the trigger's default 48px height was overriding the caption style) with tighter horizontal padding; the written-out date next to "Data" was removed because the calendar already shows the selection. Search suite (49 tests), lint and typecheck passed; heights measured in the built-in browser (all four header controls 36px), no writes.

## Design review follow-up (2026-10-28)

Owner asked for a review with the design skills (design-critique, frontend-design, accessibility-review; read from their public repos because the newly enabled plugins only load in new sessions) and approved the three priorities:

- Empty title now shows the error under the field (aria-invalid, aria-describedby, focus back on the title) instead of the browser bubble; the form uses `noValidate`.
- `PrismCalendar` renders previous/next inside the caption row, so Tab follows the visual order (previous, month, year, next) in every calendar.
- Days from other months are hidden (space kept) and the redundant dialog description was removed.

While checking in the browser, a pre-existing defect showed up: React Aria's calendar renders a visually hidden "next" button without a type, so Enter in the title made it the form's default button and moved the calendar to the next month. The form now wraps only the title and the submit button joins it through the `form` attribute. Tests for the inline error, tab order and default button failed before and pass after; 528 tests, format, lint and typecheck passed. Built-in browser with the controlled session: inline error, month kept on Enter, one mocked POST with the selected date, no real writes. Approved by owner and committed locally, not pushed.
