# 04: Filtrar ações por parceiros dentro da busca

**Blocked by:** nenhum. Pode ser entregue com uma ação aberta; executar depois de 03 é organização do trabalho, não bloqueio técnico.

**What to build:** buscar ações de todos, um ou vários parceiros sem sair da página atual, com filtro reiniciado em cada abertura.

**Status:** completed — approved by owner on 2026-10-28

## Acceptance criteria

- [x] Filtro existe somente dentro da busca. Na abertura em página de parceiro, inicia com ele; nas demais páginas, sem seleção específica, buscando em todos os disponíveis.
- [x] Fechar/reabrir reinicia o filtro pelo contexto atual, sem memória.
- [x] Reutilizar o seletor de parceiros existente com suporte opcional a Todos os parceiros; seleção vazia representa todos, selecionar Todos limpa restrição e remover último selecionado volta a todos.
- [x] Um/vários parceiros filtram ações de qualquer um dos selecionados, mantendo os limites de autorização existentes.
- [x] Shift no seletor continua seleção exclusiva; Shift nos resultados de ações mantém a intenção secundária quando 02 estiver presente.
- [x] Alterar filtro atualiza a consulta sem manter uma restrição escondida pelo parceiro da rota e sem alterar calendário, rota ou atribuição de parceiros.
- [x] Consumidores atuais do seletor mantêm seus comportamentos. Busca por título e demais limites permanecem; por solicitação posterior, Incluir arquivadas agora é opcional e desligado em cada abertura.
- [x] Testes do seletor, busca e model reais com fronteira externa controlada verificam todos/um/vários, reset, ausência de vazamento para outros filtros e proteção contra resposta antiga após mudança de seleção.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

453 tests in43 files passed, including10 new tests with real components/model and SDK/controlled HTTP. Format/format:check/lint/typecheck/build passed; known chunk warning remains. Controlled Chromium checked1440px/390px and the two-action flow with cross-partner Shift opening. Evidence and limits are recorded in docs/audits/2026-10-28-global-search-partners.md. No SQL, real database writes, commit or publication. Ticket05 remains future.

Owner-requested follow-up: controls moved below results without the “Ações de” label; added opt-in Incluir arquivadas, reset off on each opening. Model defaults to archived=false and includes archived records only when enabled. Extra trigger/popover rings removed locally for the search selector, preserving keyboard focus background.455 tests and format/lint/typecheck/build passed; browser evidence in the audit. No commit or deployment.

Owner approved the final filter, archive scope and regular control weights on 2026-10-28. Ticket04 closed locally; no commit or publication requested.
