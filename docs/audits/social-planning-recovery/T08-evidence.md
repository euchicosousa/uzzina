# Planejamento por período — composição e recuperação

Base `a0a64834`, alterações na main local em 19/11/2026. A Mesa usa o mesmo seletor de modelo, normalização de vagas e proposta canônica de Por tema. A geração por período guarda lotes intermediários, valida data, formato e ordem recebidos e só confirma após validar todas as sugestões. A [migração local](../../../supabase/migrations/20261119223435_planning_period_batches.sql) altera a tabela de solicitações e a RPC sem mudar as propostas existentes.

## Verificações

`bun /private/tmp/check-uzzina-planning-period.mjs` executou handler, SDK e migrações reais. PGlite executou o armazenamento e a RPC. Auth, quota, ledger, transporte PostgREST e respostas OpenAI foram controlados pelo ensaio. As fixtures usaram dois administradores, um membro e parceiros fictícios. `node verify-period-ai.mjs` em `/private/tmp/uzzina-planning-debug` verificou a interface real com HTTP simulado.

| Caso | Resultado observado |
| --- | --- |
| B01 | 12 vagas regulares e uma ocorrência fora delas produziram 13 sugestões com datas e formatos iguais à prévia. |
| B02 | No intervalo curto, um Reel regular e o carrossel extra foram preservados exatamente. |
| B03 | Duas comemorações na mesma segunda-feira entraram em uma vaga regular. Virada de ano preservou as datas civis. Data impossível e prévia divergente foram recusadas antes da quota. |
| B04 | Data alterada, slot duplicado, formato trocado e item faltante retornaram erro sem nova proposta canônica. |
| B05 | No Chromium, editar o Direcionamento após iniciar o pedido preservou o texto capturado no resultado. A tela continuou o segundo lote com o mesmo ID. |
| B06 | Uma ação em cada data e nove sugestões aprovadas em proposta anterior não alteraram a quantidade. Não houve consulta a ações no handler nem gravação na tabela de ações do ensaio. |
| B07 | Uma proposta de 29 sugestões progrediu por 14, 28 e 29. Negar quota após o primeiro lote preservou as 14. Um pedido concorrente durante o segundo devolveu 202 em vez de chamar o provedor novamente. Após falha da escrita final, a retomada gravou uma proposta, com os mesmos contadores de provedor, reserva e uso do último resultado. A regressão de Por tema também passou. |
| B08 | Após recarga, a proposta voltou pelo histórico sem nova geração. No PostgreSQL isolado, outro administrador ativo leu a entrada e as sugestões idênticas às gravadas. |

Passaram `tsc --noEmit`, lint focado, 23 testes de `tests/social-planning-slots.test.ts` e `bun run test:serverless` com dez handlers, incluindo a fronteira usada no navegador. A migração de Por período ainda não foi aplicada ao Supabase. Sessão real e qualidade editorial do provedor seguem para aceite do proprietário.
