# Tickets abertos da UZZINA

Atualizado em 06/11/2026. **23 tickets mantidos para execução, conferência ou aceite.** Esta é a entrada principal do tracker local. O inventário segue os registros atuais: implementação local não equivale a aceite, banco aplicado ou deploy. Não foram encerradas pendências somente pela limpeza documental.

[Histórico consolidado](archive/resolved-tickets.md): 87 documentos encerrados/aprovados e 11 da antiga série C do Planejamento, substituída pela recuperação. Os antigos arquivos individuais foram retirados e seus links redirecionados.

Ao criar um ticket ou mudar seu escopo, inclua as três opções da seção `Modelos sugeridos` conforme o [guia de agentes](../AGENTS.md#recomendações-de-agentes-nos-tickets).

| Série                       | Ticket                                                                                                                            | O que falta                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Consumo de IA               | [01: Mostrar o uso de IA em Minha Conta](ai-usage/issues/01-ai-usage-visibility.md)                                               | Validar medição, cota e troca de modelo em IA-M01, IA-M03 e IA-M04.                 |
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
| Modelos de IA               | [IA-M01 — Catálogo e medição com tokens reais](ai-models/issues/01-model-catalog-selection-and-metering.md)                       | Validar uso reportado pelo provedor e custo por chamada.                            |
| Minha Conta                 | [IA-M02 — Planejar organização em abas](ai-models/issues/02-profile-preferences-tabs.md)                                          | Elaborar proposta de navegação e salvamento.                                        |
| Datas comemorativas         | [CAL01 — Investigar a apresentação no calendário](calendar-celebrations/issues/01-calendar-celebration-markers.md)                | Comparar marcadores independentes para feriado e vínculo com parceiro.              |
| Design system               | [DS01 — Corrigir desvios visuais já inventariados](design-system-audit/issues/01-audit-visual-deviations.md)                      | Executar correções verificadas usando o V44.                                        |
| Consumo de IA               | [IA-M03 — Cota mensal de IA](ai-models/issues/03-monthly-ai-allowance.md)                                                         | Aplicar cota e mostrar percentual e chamadas após IA-M01.                           |
| Modelos de IA               | [IA-M04 — Seleção e padrões por comando](ai-models/issues/04-model-selection-by-command.md)                                       | Integrar após IA-M01 e liberar após IA-M03.                                         |
| Modelos de IA               | [IA-M05 — Investigar demora na geração](ai-models/issues/05-ai-generation-latency.md) | Medir a espera por etapa e avaliar opções antes de decidir sobre streaming. |
| Design system               | [DS03 — Interações dos itens de ação](design-system-audit/issues/03-action-item-interactions.md)                                  | Investigar seleção, edição, foco e arraste em todas as variantes.                   |
| Design system               | [DS04 — Microinterações](design-system-audit/issues/04-microinteractions.md)                                                      | Inventariar movimento e propor padrões graduais.                                    |
| Design system               | [DS05 — Ordem de ícone e texto nos botões](design-system-audit/issues/05-button-icon-label-order.md)                              | Pesquisa, inventário e proposta para aceite.                                        |
| Estratégias na gaveta       | [EST-01 — Progresso e resultado no diálogo](action-strategy/issues/01-strategy-dialog-progress.md)                                | Unificar rolagem, alinhar loader e remover botões manuais.                          |
| Estratégias na gaveta       | [EST-02 — Troca de estratégia após salvar](action-strategy/issues/02-strategy-selection-switch.md)                                | Destravar controles após salvar e indicar progresso da escolha.                     |
| Estratégias na gaveta | [EST-01 — Progresso e resultado no diálogo](action-strategy/issues/01-strategy-dialog-progress.md) | Unificar rolagem, alinhar loader e remover botões manuais. |
| Estratégias na gaveta | [EST-02 — Troca de estratégia após salvar](action-strategy/issues/02-strategy-selection-switch.md) | Destravar controles após salvar e indicar progresso da escolha. |

## Referências fora da fila de execução

- [Planejamento original](social-planning/README.md): nove tickets antigos com registros divergentes; a recuperação T01–T11 é a fila vigente. Mantidos para referência, sem declarar os antigos pendentes como resolvidos.
- [Consistência visual](visual-consistency/README.md): onze tickets de série suspensa pelo proprietário. Não executar nem considerar concluídos somente por seus campos completed.

Novos tickets entram na série correspondente. Ao encerrar, manter somente pendências na lista ativa e consolidar finalidade, aceite, commit e limites no histórico.
