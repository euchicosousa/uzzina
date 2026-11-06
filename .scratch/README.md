# Tickets abertos da UZZINA

Atualizado em 06/11/2026. **17 tickets mantidos para execução, conferência ou aceite.** Esta é a entrada principal do tracker local. O inventário segue os registros atuais: implementação local não equivale a aceite, banco aplicado ou deploy. Não foram encerradas pendências somente pela limpeza documental.

[Histórico consolidado](archive/resolved-tickets.md): 87 documentos encerrados/aprovados e 11 da antiga série C do Planejamento, substituída pela recuperação. Os antigos arquivos individuais foram retirados e seus links redirecionados.

Ao criar um ticket ou mudar seu escopo, inclua as três opções da seção `Modelos sugeridos` conforme o [guia de agentes](../AGENTS.md#recomendações-de-agentes-nos-tickets).

| Série                       | Ticket                                                                                                                            | O que falta                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Recuperação do Planejamento | [T01: Rastrear decisões e fechar o contrato de aceite](social-planning-recovery/issues/01-confirm-decisions.md)                   | Rastrear e confirmar decisões D1–D6 antes de liberar dependências.                  |
| Recuperação do Planejamento | [T02: Salvar e editar propostas no banco com autorização e versão](social-planning-recovery/issues/02-canonical-storage.md)       | Validar banco/RLS/CAS e reabertura; código local existe, aplicação remota pendente. |
| Recuperação do Planejamento | [T03: Unificar datas, frequência, formatos e extras sem divergências](social-planning-recovery/issues/03-normalized-input.md)     | Conferir datas, frequência, formatos e extras após T01/D2–D4.                       |
| Recuperação do Planejamento | [T04: Separar configuração nova da proposta aberta e proteger transições](social-planning-recovery/issues/04-workspace-state.md)  | Validar troca de marca/proposta e proteção do estado após T02.                      |
| Recuperação do Planejamento | [T05: Conservar edição até confirmação e garantir teclado do diálogo](social-planning-recovery/issues/05-editor-confirmation.md)  | Conferir salvamento, falha/retry, foco e guardas após T02/T04.                      |
| Recuperação do Planejamento | [T06: Substituir grade paralela pelo calendário real com movimento seguro](social-planning-recovery/issues/06-shared-calendar.md) | Conferir calendário real e movimento sem criar ações após T02/T04/T05.              |
| Recuperação do Planejamento | [T07: Gerar proposta por tema com IA real e recuperação durável](social-planning-recovery/issues/07-real-theme-ai.md)             | Validar IA real, quota e recuperação durável após T02/D6.                           |
| Recuperação do Planejamento | [T08: Gerar período por IA respeitando slots e formatos confirmados](social-planning-recovery/issues/08-real-period-ai.md)        | Validar geração por período respeitando slots/formatos após T03/T07.                |
| Recuperação do Planejamento | [T09: Converter aprovadas em uma transação idempotente real](social-planning-recovery/issues/09-transactional-finalization.md)    | Provar transação e idempotência reais após T02/D5.                                  |
| Recuperação do Planejamento | [T10: Confirmar, reconciliar e atualizar a Mesa após finalização](social-planning-recovery/issues/10-finalization-ui.md)          | Conferir confirmação/reconciliação e atualização da Mesa após T04/T09/T05.          |
| Recuperação do Planejamento | [T11: Auditar a série por evidências e impedir conclusão falsa](social-planning-recovery/issues/11-independent-acceptance.md)     | Revisão independente final com evidências, depois de T02–T10.                       |
| Minha Conta                 | [IA-M02 — Planejar organização em abas](ai-models/issues/02-profile-preferences-tabs.md)                                          | Proposta entregue: 4 abas e salvamento por patch parcial. Decidir as perguntas abertas antes de implementar. |
| Design system               | [DS01 — Corrigir desvios visuais já inventariados](design-system-audit/issues/01-audit-visual-deviations.md)                      | Lote de usos diretos nas rotas feito (5 corrigidos, 8 já estavam). Seguem os lotes de componentes do V44 e o aceite renderizado de A–C. |
| Modelos de IA               | [IA-M05 — Investigar demora na geração](ai-models/issues/05-ai-generation-latency.md) | Logs `ai_timing` e `strategy_worker_timing` prontos (sem deploy). Publicar, gerar com Luna e Astra e ler os tempos nos logs da Vercel. |
| Design system               | [DS03 — Interações dos itens de ação](design-system-audit/issues/03-action-item-interactions.md)                                  | A, B, D e F corrigidos: conferir no app. Restam C (área de arraste, decisão de design) e E (toque, teste em dispositivo). |
| Design system               | [DS04 — Microinterações](design-system-audit/issues/04-microinteractions.md)                                                      | Tokens, Nova Hora e overlays animados aplicados (conferidos em /ui). Falta conferir no app e decidir os próximos recortes. |
| Design system               | [DS05 — Ordem de ícone e texto nos botões](design-system-audit/issues/05-button-icon-label-order.md)                              | Convenção aplicada em 11 usos: conferir no app. Pendentes: Salvar da gaveta e nome do UCalendarToolbar. |

## Referências fora da fila de execução

- [Planejamento original](social-planning/README.md): nove tickets antigos com registros divergentes; a recuperação T01–T11 é a fila vigente. Mantidos para referência, sem declarar os antigos pendentes como resolvidos.
- [Consistência visual](visual-consistency/README.md): onze tickets de série suspensa pelo proprietário. Não executar nem considerar concluídos somente por seus campos completed.

Novos tickets entram na série correspondente. Ao encerrar, manter somente pendências na lista ativa e consolidar finalidade, aceite, commit e limites no histórico.
