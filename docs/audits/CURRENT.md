# UZZINA — estado atual

Piloto documental aplicado no checkout em 24/11/2026. O estado abaixo vem dos registros datados. [Plano do piloto](../plans/2026-11-24-estado-e-continuidade.md)

| Entrega | Ambiente | Última evidência | Pendência e responsável |
| --- | --- | --- | --- |
| Programar Stories em Gaveta da ação → Instagram → Publicação | Produção (Vercel e Supabase) | **23/11/2026.** O agendador roda a cada minuto. Três Stories foram publicados automaticamente, com links registrados. A proteção de dois minutos (`41f97811`) entrou na revisão publicada com o calendário. [Execução do agendador](2026-11-23-instagram-scheduler-smoke.md#resultado) · [Registro do deploy do calendário](2026-11-24-current-history.md#uzzina--estado-atual) | **Planta** encaminha a validação da margem no app e a triagem dos formatos restantes, duplicação e cenários de falha. O teste do agendador conferiu os registros no banco. A inspeção visual no Instagram e novos envios de teste ficam pendentes. [Ficha de programação](../../.scratch/instagram-composio/issues/04-programar-stories.md) |
| Consultar o calendário na tela Publicações (`/app/instagram`) | Produção (Vercel) | **23/11/2026.** O status de deploy retornou sucesso para a revisão `05b7e5a4`. A tela reúne publicações e agendamentos registrados pela UZZINA. [Registro do deploy](2026-11-24-current-history.md#uzzina--estado-atual) | **Prova** prepara a conferência de leitura e **o proprietário** dá o aceite visual. Selecionar um parceiro conectado, escolher um dia com evento e abrir a ação correspondente. [Contrato da tela](../contracts/pages-today-profile-planning.md#calendários) |

Comece pela [fila de tickets](../../.scratch/README.md) para saber qual ação pode ser assumida. Ideias e verificações gerais estão no [TODO](../../TODO.md).

## Demais áreas e histórico

Consulte o [registro integral anterior ao piloto](2026-11-24-current-history.md), incluindo as [pendências registradas](2026-11-24-current-history.md#pendências-reais), o [registro recente](2026-11-24-current-history.md#registro-recente) e o [histórico mais antigo](2026-11-24-current-history.md#referências-e-histórico). O histórico conserva os títulos, as âncoras e a numeração de linhas do arquivo antes do piloto. Cada entrada descreve a situação da sua rodada. Os [contratos por área](../contracts/) descrevem o funcionamento.
