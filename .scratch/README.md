# Tickets abertos da UZZINA

Atualizado em 12/11/2026. **18 tickets mantidos para execução, conferência, aceite ou publicação.** Esta é a entrada principal do tracker local. O inventário segue os registros atuais: implementação local não equivale a aceite, banco aplicado ou deploy. Não foram encerradas pendências somente pela limpeza documental.

[Histórico consolidado](archive/resolved-tickets.md): 89 documentos encerrados/aprovados e 11 da antiga série C do Planejamento, substituída pela recuperação. Os antigos arquivos individuais foram retirados e seus links redirecionados.

Ao criar um ticket ou mudar seu escopo, inclua as três opções da seção `Modelos sugeridos` conforme o [guia de agentes](../AGENTS.md#recomendações-de-agentes-nos-tickets).

**Design system fechado em 11/11/2026.** O proprietário aprovou DS05 (ordem do ícone), DS12, DS13, DS15 (cores e superfícies) e DS16 (retirada da cor do parceiro); em 12/11, o DS14 (sombra colorida da paleta). Estão no [histórico](archive/resolved-tickets.md); falta apenas publicar (push).

**IA-M02 encerrado.** Abas de Minha Conta publicadas conforme confirmação do proprietário e integradas à main local em 06/11.

| Série                       | Ticket                                                                                                                            | O que falta                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Recuperação do Planejamento | [T01: Rastrear decisões e fechar o contrato de aceite](social-planning-recovery/issues/01-confirm-decisions.md)                   | Rastreamento feito: D1–D6 sem confirmação com fonte; perguntas mínimas em `T01-evidence.md`. Responder para liberar T02–T10.          |
| Recuperação do Planejamento | [T02: Salvar e editar propostas no banco com autorização e versão](social-planning-recovery/issues/02-canonical-storage.md)       | Código local. Aguarda D1 e execução isolada dos cenários P01–P10 de autorização e concorrência. SQL remoto pendente.                  |
| Recuperação do Planejamento | [T03: Unificar datas, frequência, formatos e extras sem divergências](social-planning-recovery/issues/03-normalized-input.md)     | Conferir datas, frequência, formatos e extras após T01/D2–D4.                                                                         |
| Recuperação do Planejamento | [T04: Separar configuração nova da proposta aberta e proteger transições](social-planning-recovery/issues/04-workspace-state.md)  | Validar troca de marca/proposta e proteção do estado após T02.                                                                        |
| Recuperação do Planejamento | [T05: Conservar edição até confirmação e garantir teclado do diálogo](social-planning-recovery/issues/05-editor-confirmation.md)  | Conferir salvamento, falha/retry, foco e guardas após T02/T04.                                                                        |
| Recuperação do Planejamento | [T06: Substituir grade paralela pelo calendário real com movimento seguro](social-planning-recovery/issues/06-shared-calendar.md) | Conferir calendário real e movimento sem criar ações após T02/T04/T05.                                                                |
| Recuperação do Planejamento | [T07: Gerar proposta por tema com IA real e recuperação durável](social-planning-recovery/issues/07-real-theme-ai.md)             | Validar IA real, quota e recuperação durável após T02/D6.                                                                             |
| Recuperação do Planejamento | [T08: Gerar período por IA respeitando slots e formatos confirmados](social-planning-recovery/issues/08-real-period-ai.md)        | Validar geração por período respeitando slots/formatos após T03/T07.                                                                  |
| Recuperação do Planejamento | [T09: Converter aprovadas em uma transação idempotente real](social-planning-recovery/issues/09-transactional-finalization.md)    | Provar transação e idempotência reais após T02/D5.                                                                                    |
| Recuperação do Planejamento | [T10: Confirmar, reconciliar e atualizar a Mesa após finalização](social-planning-recovery/issues/10-finalization-ui.md)          | Conferir confirmação/reconciliação e atualização da Mesa após T04/T09/T05.                                                            |
| Recuperação do Planejamento | [T11: Auditar a série por evidências e impedir conclusão falsa](social-planning-recovery/issues/11-independent-acceptance.md)     | Revisão independente final com evidências, depois de T02–T10.                                                                         |
| Planejamento                | [T12 — Redistribuir formatos de posts automaticamente](social-planning-recovery/issues/12-auto-balance-post-formats.md)           | Em espera com o Planejamento.                                                                                                         |
| Design system               | [DS08 — Página inicial institucional da UZZINA](design-system-audit/issues/08-uzzina-landing-page.md)                             | Apresentar UZZINA, serviço de links e agência. Aplicar a paleta pública Ônix já aprovada e revisar a página.                          |
| Design system               | [DS10 — Investigar foco, Sprint e estrutura do ActionItem](design-system-audit/issues/10-action-item-focus-and-structure.md)      | Investigar foco, sinais de Sprint e recorte lateral de sombras em Hoje.                                                               |
| Design system               | [DS11 — Estudar a cor de fundo das ações por fase](design-system-audit/issues/11-action-background-by-phase.md)                   | Comparar fundo, hover e sinais dos cartões em Hoje e nas telas do parceiro, com a mesma preferência em Minha Conta e na busca global. |
| Arquitetura                 | [ARQ-01 — Auditar a estrutura da UZZINA e propor simplificações](structural-audit/issues/01-app-structure-and-simplification.md)  | Mapear o app inteiro, verificar candidatos sem uso e priorizar simplificações em relatório para decisão do proprietário.              |

## Referências fora da fila de execução

- [Planejamento original](social-planning/README.md): nove tickets antigos com registros divergentes; a recuperação T01–T11 é a fila vigente. Mantidos para referência, sem declarar os antigos pendentes como resolvidos.
- [Consistência visual](visual-consistency/README.md): onze tickets de série suspensa pelo proprietário. Não executar nem considerar concluídos somente por seus campos completed.

Novos tickets entram na série correspondente. Ao encerrar, manter somente pendências na lista ativa e consolidar finalidade, aceite, commit e limites no histórico.
