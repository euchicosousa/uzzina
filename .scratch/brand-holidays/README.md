# Feriados — tickets locais

Em01/11/2026, o proprietário autorizou somente a etapa Supabase dos dois tickets, com subagentes. Restante do aplicativo fica adiado, sem execução automática.

| Ticket                                                                | Banco                                                                    | Restante                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| [01 — Classificar datas como feriado](issues/01-classify-holidays.md) | Aplicado/verificado em produção                                          | Tipos/models/cache e criação/edição/lista/calendário |
| [02 — Associar feriados à marca](issues/02-partner-holidays.md)       | SQL validado localmente; aplicação pendente de confirmação da ferramenta | Gestão do parceiro, integração e validação visual    |

Dependência: #02 exige o campo do #01, já disponível no banco. Não exige concluir a interface do #01. A confirmação da segunda migration expirou duas vezes; não houve aplicação remota dessa etapa. [Relatório de execução](../../docs/audits/2026-11-01-holiday-schema.md).
