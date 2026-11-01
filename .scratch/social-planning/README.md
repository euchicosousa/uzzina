# Planejamento — tickets locais

Os tickets00–07 foram preparados após a revisão da divisão pelo proprietário. O08 foi adicionado depois para instruções reutilizáveis da marca, com somente Supabase concluído. São arquivos do tracker local; publicação documental não autoriza execução. A casca visual, os três acessos e a seleção de parceiro pela URL já foram preparados no app. O ticket00 corrige a configuração visual para o mockup escolhido; depois, o01 completa geração e persistência sem recriar página, Header/AppBar, acessos, seleção ou cabeçalho do portal. O00 foi solicitado somente para registro e execução posterior por outro agente.

## Tickets

| Ticket                                                                                             | Entrega                                                                                | Bloqueio                 | Status                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ | ---------------------- |
| [00 — Alinhar a interface ao mockup aprovado](issues/00-align-page-with-approved-mockup.md)        | Por período/Por tema, slider semanal, dias e direcionamento, usando componentes do app | Nenhum                   | `approved-by-owner`    |
| [01 — Gerar e reabrir proposta por tema](issues/01-generate-and-reopen-theme-plan.md)              | Geração contextual, proposta persistida durável e reabertura na mesa                   | Concluído com subagentes | `ready-for-validation` |
| [02 — Revisar sugestões e salvar decisões](issues/02-review-and-save-decisions.md)                 | Edição inline/modal, aprovação/descarte e decisões persistidas                         | Concluído com subagentes | `ready-for-validation` |
| [03 — Gerar proposta por período e frequência](issues/03-generate-by-period-and-frequency.md)      | Cálculo determinístico de slots e frequência por semana civil                          | Concluído com subagentes | `ready-for-validation` |
| [04 — Distribuir sugestões por formato](issues/04-distribute-formats.md)                           | Distribuição automática balanceada e manual por formato                                | Concluído com subagentes | `ready-for-validation` |
| [05 — Considerar datas comemorativas como extras](issues/05-add-commemorative-extras.md)           | Extras de datas comemorativas selecionadas no período                                  | Concluído com subagentes | `ready-for-validation` |
| [06 — Revisar e mover sugestões no calendário existente](issues/06-review-in-existing-calendar.md) | Calendário em grade com alternância Lista/Calendário e ações rápidas                   | Concluído com subagentes | `ready-for-validation` |
| [07 — Finalizar sugestões aprovadas como ações](issues/07-finalize-approved-suggestions.md)        | Conversão atômica das aprovadas em ações reais do UZZINA                               | Concluído com subagentes | `ready-for-validation` |
| [08 — Reutilizar instruções de planejamento por marca](issues/08-brand-planning-instructions.md)   | Campo por parceiro já aplicado; integração do aplicativo por outro agente              | Nenhum; banco concluído  | `partial — UI adiada`  |

Sequência inicial: `00 → 01`. Depois: `01 → 02 → 06/07`, `01 → 03 → 05` e `01 → 04`. Depois de #01, #02/#03/#04 podem ser trabalhados em worktrees separados. #05 depende de #03; #06/#07 dependem de #02. Migrações, contratos compartilhados, tipos e documentos integram serialmente com um escritor por checkout.

## Base e limites comuns

- Todos os tickets preservam a página limpa já preparada, sem cartões/fundos de painel ou gutters externos, com divisórias estruturais e padding interno; a composição fica dentro do layout atual do app, com Header/AppBar e duas rolagens independentes.
- A feature é desktop/telas amplas; sem layout mobile, empilhamento ou troca de colunas por abas. A largura final segue pendente de decisão/validação.
- Usar Prism e componentes existentes. Não recriar acessos, URL de parceiro, shell global ou cabeçalho do portal.
- O calendário de #06 é o calendário existente, com controles, ajustes laterais e rolagem nos dois eixos. Adaptar sugestões sem acionar mutações de ações e sem criar calendário paralelo.
- Nova geração solicitada é integral e ignora ações existentes. Repetir a finalização da mesma proposta não duplica itens.
- Definições de produto seguem pendentes nos tickets indicados: campos/compartilhamento, semanas incompletas e frequência, distribuição, extras, tratamento de pendentes na finalização e horário/fuso. Valores propostos anteriormente (50/10/90, 11h e regras semelhantes) não são decisões aprovadas.
- IA segue os contratos atuais de `partner_name`, quota e estratégias09 duráveis. Antes de integrar, reler o estado vigente; Planejamento não altera os fluxos permanentes de estratégias.
- A verificação automatizada é proporcional ao risco de cada recorte. Aparência é validada pelo proprietário por roteiro curto. Não usar produção para fixtures de escrita.

Veja a [proposta e o histórico da divisão](../../docs/plans/social-planning-ticket-breakdown.md) e as [decisões vigentes](../../docs/plans/social-planning-design-decisions.md).
