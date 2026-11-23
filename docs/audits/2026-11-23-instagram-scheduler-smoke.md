# Validação do agendador de Stories do Instagram — 23/11/2026

## Resultado

O Supabase Cron está ativo no projeto de produção `uzzina` (`dfepmjcozszswocwvdpq`). O job `uzzina-instagram-publish-worker` (ID 2) roda a cada minuto (`* * * * *`) e chama `https://uzzina.cnvt.com.br/api/instagram-publish` com o bearer obtido do Vault. O segredo não foi lido.

Três agendamentos vencidos de Stories foram publicados pelo worker via Composio. O primeiro ciclo retornou HTTP 503. O log do Postgres apontou que `claim_instagram_scheduled_publications` chamava `pg_catalog.greatest`/`pg_catalog.least`; `GREATEST` e `LEAST` são expressões especiais do PostgreSQL e não podem ser qualificadas como funções nesse contexto. A correção removeu o prefixo `pg_catalog.` e foi aplicada em produção e registrada como migration `20261123195548` (`instagram_scheduled_claim_limit`). Depois disso, as chamadas do worker retornaram `claimed: 1, completed: 1` e os três registros ficaram `published`, cada um com ID e permalink do Instagram.

A causa das tentativas que ficaram sem publicar foi SQL do worker, não lentidão de processamento do Composio. Cron está ativo e as chamadas funcionais foram observadas; o app pode fechar sem impedir o processamento.

## Margem mínima de agendamento

Após o teste, a entrada do agendamento foi ajustada para sugerir a hora arredondada ao próximo minuto, pelo menos dois minutos à frente. O cliente e o servidor rejeitam datas dentro dessa margem. O servidor repete a validação imediatamente antes de gravar, depois de consultar a conexão Composio, para evitar aceitar um horário que ficou próximo demais durante a confirmação.

Essa proteção de dois minutos está no código local, ainda não publicado nesta verificação. Typecheck, `bun run test:serverless` (9 handlers), build e `git diff --check` passaram para a alteração; build conserva aviso existente de bundle acima de 500 kB.

## Limites

A consulta confirmou estados publicados e links registrados no banco, após o worker retornar sucesso. Não foi feita inspeção visual adicional no Instagram nem verificada a experiência da margem de horário em navegador. Ainda é necessário publicar o ajuste de dois minutos e acompanhar novos agendamentos com horários escolhidos pelo usuário.
