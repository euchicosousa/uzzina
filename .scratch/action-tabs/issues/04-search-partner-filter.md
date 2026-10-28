# 04: Filtrar ações por parceiros dentro da busca

**Blocked by:** nenhum. Pode ser entregue com uma ação aberta; executar depois de 03 é organização do trabalho, não bloqueio técnico.

**What to build:** buscar ações de todos, um ou vários parceiros sem sair da página atual, com filtro reiniciado em cada abertura.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Filtro existe somente dentro da busca. Na abertura em página de parceiro, inicia com ele; nas demais páginas, sem seleção específica, buscando em todos os disponíveis.
- [ ] Fechar/reabrir reinicia o filtro pelo contexto atual, sem memória.
- [ ] Reutilizar o seletor de parceiros existente com suporte opcional a Todos os parceiros; seleção vazia representa todos, selecionar Todos limpa restrição e remover último selecionado volta a todos.
- [ ] Um/vários parceiros filtram ações de qualquer um dos selecionados, mantendo os limites de autorização existentes.
- [ ] Shift no seletor continua seleção exclusiva; Shift nos resultados de ações mantém a intenção secundária quando 02 estiver presente.
- [ ] Alterar filtro atualiza a consulta sem manter uma restrição escondida pelo parceiro da rota e sem alterar calendário, rota ou atribuição de parceiros.
- [ ] Consumidores atuais do seletor mantêm seus comportamentos. Regra de arquivadas, busca por título e demais limites atuais permanecem.
- [ ] Testes do seletor, busca e model reais com fronteira externa controlada verificam todos/um/vários, reset, ausência de vazamento para outros filtros e proteção contra resposta antiga após mudança de seleção.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.
