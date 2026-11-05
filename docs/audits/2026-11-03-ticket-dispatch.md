# Central de tickets da UZZINA

Atualizado em 05/11/2026. **13 tickets ativos.** Badge de feriado e foco de Hoje aprovados e retirados da fila; seleção por marca e mídia confirmadas novamente. Consumo de IA com código corrigido e banco instalado; falta publicar o backend e conferir uma geração real. V45 investigado/limpo tecnicamente, registrado no histórico; V44 permanece somente estudo.

| Nº | Série | Ticket | Próximo passo |
|---|---|---|---|
| 1 | Consumo de IA | [01: Mostrar o uso de IA em Minha Conta](../../.scratch/ai-usage/issues/01-ai-usage-visibility.md) | Código corrigido e banco aplicado; falta publicar API/worker e confirmar incremento em nova geração real. |
| 2 | Recuperação do Planejamento | [T01: Rastrear decisões e fechar o contrato de aceite](../../.scratch/social-planning-recovery/issues/01-confirm-decisions.md) | Rastrear e confirmar decisões D1–D6 antes de liberar dependências. |
| 3 | Recuperação do Planejamento | [T02: Salvar e editar propostas no banco com autorização e versão](../../.scratch/social-planning-recovery/issues/02-canonical-storage.md) | Validar banco/RLS/CAS e reabertura; código local existe, aplicação remota pendente. |
| 4 | Recuperação do Planejamento | [T03: Unificar datas, frequência, formatos e extras sem divergências](../../.scratch/social-planning-recovery/issues/03-normalized-input.md) | Conferir datas, frequência, formatos e extras após T01/D2–D4. |
| 5 | Recuperação do Planejamento | [T04: Separar configuração nova da proposta aberta e proteger transições](../../.scratch/social-planning-recovery/issues/04-workspace-state.md) | Validar troca de marca/proposta e proteção do estado após T02. |
| 6 | Recuperação do Planejamento | [T05: Conservar edição até confirmação e garantir teclado do diálogo](../../.scratch/social-planning-recovery/issues/05-editor-confirmation.md) | Conferir salvamento, falha/retry, foco e guardas após T02/T04. |
| 7 | Recuperação do Planejamento | [T06: Substituir grade paralela pelo calendário real com movimento seguro](../../.scratch/social-planning-recovery/issues/06-shared-calendar.md) | Conferir calendário real e movimento sem criar ações após T02/T04/T05. |
| 8 | Recuperação do Planejamento | [T07: Gerar proposta por tema com IA real e recuperação durável](../../.scratch/social-planning-recovery/issues/07-real-theme-ai.md) | Validar IA real, quota e recuperação durável após T02/D6. |
| 9 | Recuperação do Planejamento | [T08: Gerar período por IA respeitando slots e formatos confirmados](../../.scratch/social-planning-recovery/issues/08-real-period-ai.md) | Validar geração por período respeitando slots/formatos após T03/T07. |
| 10 | Recuperação do Planejamento | [T09: Converter aprovadas em uma transação idempotente real](../../.scratch/social-planning-recovery/issues/09-transactional-finalization.md) | Provar transação e idempotência reais após T02/D5. |
| 11 | Recuperação do Planejamento | [T10: Confirmar, reconciliar e atualizar a Mesa após finalização](../../.scratch/social-planning-recovery/issues/10-finalization-ui.md) | Conferir confirmação/reconciliação e atualização da Mesa após T04/T09/T05. |
| 12 | Recuperação do Planejamento | [T11: Auditar a série por evidências e impedir conclusão falsa](../../.scratch/social-planning-recovery/issues/11-independent-acceptance.md) | Revisão independente final com evidências, depois de T02–T10. |
| 13 | Controles visuais | [44 — Investigar personalizações substituíveis por Prism](../../.scratch/visual-controls/issues/44-audit-custom-components-for-prism.md) | Estudo de equivalentes Prism e propostas de padronização; sem migração autorizada. |

[Tracker principal](../../.scratch/README.md) · [Histórico consolidado](../../.scratch/archive/resolved-tickets.md). A numeração é posicional; usar o ID da série ao disparar agentes. Registros originais/suspensos permanecem fora da fila. Sem novo commit/push/deploy nesta atualização.
