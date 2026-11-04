# Correções do Planejamento — instruções para execução

Série criada a pedido do proprietário para corrigir os achados da revisão do commit `ad0c0ed`. Não é uma nova implementação dos tickets originais nem uma auditoria de todo o app. **Nesta rodada foram criados somente documentos; executar código, aplicar SQL e publicar continuam sendo etapas distintas.**

## Como usar com um agente de contexto limitado

1. Entregar ao agente este README e **um ticket por vez**, com seus bloqueios já resolvidos. Não entregar apenas o título.
2. Antes de editar, ler CURRENT e AGENTS, conferir Git e verificar se outro agente já corrigiu o ponto. Preservar mudanças externas. Um escritor por checkout; paralelismo somente em checkouts isolados e integração coordenada.
3. Ler os arquivos indicados no ticket e suas dependências diretas. Caminhos são pontos de entrada verificados nesta revisão; se mudaram, localizar o símbolo e registrar o novo caminho. Não refazer um módulo por não encontrar a linha antiga.
4. Produzir lista curta do que será alterado, cumprir passos e critérios e parar na fronteira do ticket. Dependência funcional não resolvida significa **não iniciar a integração dependente**.
5. Se regra de produto estiver pendente, não inferir a resposta do código quebrado. Registrar a pendência D1–D6 de C00 e continuar somente os passos independentes.
6. Ao terminar: informar arquivos alterados, comportamento corrigido, verificações feitas e pendências. Não declarar pronto se algum critério obrigatório não foi cumprido.

## Contratos que todos preservam

- Somente Planejamento, rota interna `/app/planejamento`; Header e AppBar originais, duas colunas/rolagens independentes, desktop/telas amplas, Prism e tokens vigentes. Sem mobile ou novo shell.
- Não alterar estética global, portal, Home/Hoje, autenticação, estratégias09 ou cadastros sem necessidade concreta do ticket. Mudanças compartilhadas estritamente necessárias devem preservar consumidores existentes.
- Busca global, menu e atalho do parceiro permanecem acessíveis a membros, com parceiro na URL e seleção explícita quando ausente/inválido.
- Gerar novamente é pedido novo integral, mesmo no mesmo período; não consultar/descontar ações existentes.
- Repetir finalização do mesmo plano é retry técnico: nunca duplica ações.
- Sugestão não é ação. Aprovar, editar ou mover não chama mutações de ações.
- Identidade/parceiro/autorização vêm dos contratos reais; localStorage, IDs e payload não autorizam acesso.
- Falha não significa salvo/finalizado. Sem fallback de IA para templates, quota local ou default de horário inventado.
- Verificações proporcionais ao risco; aparência é aceite do proprietário. Nenhuma fixture em produção, chamada paga por rotina, SQL cego ou deploy implícito.
- Trabalhos de design em paralelo não são parte destes tickets. Coordenar o arquivo compartilhado da rota antes de integrar.

## Referências

- [Revisão e evidências](../../docs/audits/2026-11-01-social-planning-review.md).
- [Decisões de design](../../docs/plans/social-planning-design-decisions.md).
- [Tickets originais](../social-planning/README.md), preservados sem alteração de status.
- CURRENT e AGENTS são a fonte de ambiente/autorização vigente.

## Tickets e dependências

| Ticket                                                                                                      | Entrega                                      | Bloqueios                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [C00 — Fechar somente as decisões necessárias às correções](issues/00-confirm-product-contract.md)          | Decisões pendentes sem invenção de políticas | `completed` (decisões D1–D6 registradas)                                              |
| [C01 — Persistir propostas com autorização e erros recuperáveis](issues/01-authorized-persistence.md)       | Dados autorizados e persistência canônica    | `completed` (isolamento de storage, versionamento e migration RLS)                    |
| [C02 — Bloquear períodos inválidos e eliminar conteúdos sem slot](issues/02-validate-period-slots.md)       | Slots válidos sem fallback                   | `completed` (entregue em 02/11)                                                       |
| [C03 — Restringir comemorações ao período e separar extras](issues/03-commemorative-date-bounds.md)         | Datas completas e extras                     | `completed` (entregue em 02/11)                                                       |
| [C04 — Respeitar quantidades manuais de formatos sem ajustes ocultos](issues/04-respect-format-counts.md)   | Composição respeitada                        | `completed` (entregue em 02/11)                                                       |
| [C05 — Gerar propostas reais por IA com contexto e tom corretos](issues/05-real-ai-generation.md)           | IA real com contexto/voz                     | `completed` (integração de voice/context do parceiro e tratamento de erros)           |
| [C06 — Reabrir proposta com configuração e parceiro coerentes](issues/06-reopen-plan-state.md)              | Entrada e visualização coerentes             | `completed` (restauração de inputs/período e fechamento ao trocar parceiro)          |
| [C07 — Reutilizar calendário do app e mover somente sugestões](issues/07-existing-calendar.md)              | Calendário real e movimento                  | `completed` (grade no padrão do app, dois eixos, drag-and-drop e 0 mutações de ações)|
| [C08 — Corrigir teclado, foco e salvamento do editor de sugestões](issues/08-suggestion-editor.md)          | Diálogo e salvamento acessíveis              | `completed` (entregue em 02/11)                                                       |
| [C09 — Finalizar aprovadas atomicamente sem duplicação e para membros](issues/09-atomic-finalization.md)    | Conversão atômica e idempotente              | `completed` (idempotência, responsibles de membros e validação de data)               |
| [C10 — Verificar integração e registrar aceite real do Planejamento](issues/10-verify-correction-series.md) | Verificação integrada                        | `completed` (verificação completa: tsc, serverless, slots e storage unit tests)     |

## Cobertura dos achados

| Achado                                                           | Correção     |
| ---------------------------------------------------------------- | ------------ |
| Finalização parcial, falso sucesso, repetição/concorrência       | C09          |
| Dados entre contas/parceiros, localStorage exclusivo             | C01          |
| Erros de salvamento ocultados                                    | C01 e C08    |
| Templates no lugar de IA, campo de voz errado e direção truncada | C05          |
| Responsáveis ausentes, membro comum, continuidade de sessão      | C09          |
| Calendário paralelo, sem controles/arraste/rolagens aprovados    | C07          |
| Reabrir plano com datas de outro formulário                      | C06 e C07    |
| Plano de A continua visível no contexto B                        | C01 e C06    |
| Zero slots vira seis conteúdos sem data                          | C02 e C05    |
| Comemorações fora do intervalo/ano                               | C03          |
| Quantidade manual alterada e extras consumindo regulares         | C04 e C03    |
| Modal sem foco/Escape/nome e fechamento antes de salvar          | C08          |
| Hoje/10h implícitos, pendentes e mapeamento não aprovados        | C00/D5 e C09 |
| Limites de evidência e aceite incorreto de 01–07                 | C10          |

## Ordem de execução e paralelismo

- **Pode iniciar sem decisões novas:** C02 (validações), C08 (diálogo/foco). C01 pode inventariar consumidores e preparar bloqueio da exposição legada; sua política canônica espera D1.
- C00 resolve somente as decisões afetadas; uma resposta não precisa esperar todas as outras.
- Depois dos contratos: C01 → C06 → C07/C09; C02 → C03 → C04; C01/C02/C03/C04 → C05; tudo → C10.
- C07 e C09 não precisam esperar IA real: usar proposta controlada na fronteira canônica C01.
- C02/C03/C04 tocam o mesmo calculador: executar serialmente. C05/C06/C07/C08/C09 tocam a rota: preparar lógica em arquivos próprios quando adequado, mas integrar um por vez. Não indicar dois agentes no mesmo checkout.
- C00 é `needs-product-decision`. Os demais têm status e bloqueios explícitos; `ready-for-agent` **não** dispensa suas dependências e não autoriza execução nesta rodada.
