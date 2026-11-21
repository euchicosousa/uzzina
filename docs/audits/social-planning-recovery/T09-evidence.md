# T09 — Evidência: finalização em uma transação idempotente

**Status:** implemented-unverified (F04 sem duas conexões reais; SQL não aplicado; sem teste no navegador)
**Executor:** Claude Code (Opus 5.5), 20/11/2026, worktree a partir de `17165ff7`.

## 1. O que mudou

| Arquivo                                                              | Mudança                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20261120120000_social_plan_finalization.sql`    | Tabela `social_plan_action_links` (PK `plan_id, suggestion_id`; `action_id` único, sem FK; RLS herdada de `social_plans`; `authenticated` só SELECT/INSERT) e RPC `finalize_social_plan(p_plan_id uuid, p_expected_version integer) RETURNS jsonb`, SECURITY INVOKER, `search_path = ''`, EXECUTE para `authenticated` e `service_role` (sem `anon`). |
| `app/models/social_plans.ts`                                         | `finalizeSocialPlanClient`: chama a RPC, valida a resposta (`unknown`) e devolve `success` (proposta canônica, criados, vínculos), `conflict` ou `error` (com `certain` = se houve rollback confirmado).                                                                                                                                              |
| `app/routes/app/planejamento.tsx`                                    | Só `handleFinalize` e imports (`useQueryClient`, model). Atualiza a proposta aberta com a versão do banco, invalida `QUERY_KEYS.actions.all()`, recarrega Propostas salvas; mensagens em português.                                                                                                                                                   |
| `app/lib/social-planning/finalizer.ts`                               | Removido (loop `createActionClient` do navegador). Nenhum outro caminho de finalização existe.                                                                                                                                                                                                                                                        |
| `types/database.ts`                                                  | Tipos da tabela de vínculos e da RPC.                                                                                                                                                                                                                                                                                                                 |
| `tests/social-planning-recovery/09-finalization.integration.test.ts` | 12 casos em banco isolado.                                                                                                                                                                                                                                                                                                                            |

### Comportamento da RPC

1. `auth.uid()` precisa ser admin ativo (`is_active_admin()`), senão `PLANNING_ADMIN_REQUIRED` (42501).
2. `SELECT … FOR UPDATE` na proposta (RLS esconde parceiro arquivado → `PLANNING_PROPOSAL_UNAVAILABLE`); parceiro não arquivado conferido.
3. Valida todas as aprovadas sem vínculo antes de escrever: id, título, formato (`static|carousel|reels`), `scheduled_date` `YYYY-MM-DD` válida. Sem data válida → `PLANNING_SUGGESTION_UNDATED` e nada é criado. Nenhuma aprovada → `PLANNING_NOTHING_APPROVED`.
4. Se não há nada a converter: não escreve, devolve proposta e vínculos (retry, resposta perdida, aba antiga, segundo pedido concorrente).
5. Se há algo a converter e a versão difere → `VERSION_CONFLICT` (P0001, HINT = versão atual).
6. Para cada aprovada: INSERT em `actions` (título; descrição = briefing + `\n\nObjetivo: …`; `content_description` = briefing; categoria post/carousel/reels; duração 30/50/40; prioridade `medium`; fase `idea`; `partners` = parceiro da proposta; `responsibles` e `user_id` = ator; cor `#999999`; `topic_id` nulo; data 11:00 em America/Sao_Paulo, ou agora+10 min truncado ao segundo se a data é hoje lá e já são 11h ou mais), depois INSERT do vínculo.
7. Grava `created_action_id` de todos os vinculados nas sugestões, `status = 'finalized'`, `version + 1`.

D4: a RPC não lê ações existentes. "finalized" = já finalizada e sem aprovada pendente de conversão; pendentes ficam pendentes e uma nova aprovação + nova finalização converte só a nova.

## 2. Ambiente de teste

- PGlite 0.5.17 (PostgreSQL 17 em WASM), em `/private/tmp/uzzina-pglite-check` (o mesmo usado em T02/T07/T08; não é dependência do projeto). Nenhum banco remoto, nenhum `.env*` lido.
- Migrações reais executadas: `20261006040000_action_concurrency`, `20261116140000_partner_topics`, `20261102120000_social_plans`, `20261119215026_planning_theme_requests`, `20261119223435_planning_period_batches`, `20261120120000_social_plan_finalization`.
- Tabelas `people`, `partners`, `actions` (colunas do `bootstrap.sql`) e as policies/funções de ações, parceiros e pessoas copiadas de `20261006030000` + `20261008164615` (a migração inteira toca tabelas que não existem aqui).
- Cada chamada roda como o Data API: uma transação, `SET LOCAL ROLE authenticated|anon` e `request.jwt.claim.sub`. Fixtures: dois admins ativos, um membro do parceiro, um admin inativo, parceiro `alpha` e parceiro arquivado.
- Falhas injetadas por gatilhos de teste no banco isolado (ação com título escolhido; segundo vínculo), ativados por `set_config` na própria transação.

Comando:

```
T09_PGLITE_MODULE=/private/tmp/uzzina-pglite-check/node_modules/@electric-sql/pglite/dist/index.js \
  bun test tests/social-planning-recovery/09-finalization.integration.test.ts
```

Resultado: `12 pass, 0 fail, 69 expect() calls`. Sem a variável, os 12 falham com "T09 needs an isolated PostgreSQL…" (não pulam).

## 3. Casos

| ID             | Resultado real                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01            | A (hoje SP, static), B (carousel, sem objetivo), C (reels) → 3 ações, 3 vínculos, versão 1→2, `finalized`. Conferidos por SELECT: post/30, carousel/50, reels/40; medium, idea, `#999999`, topic nulo, partners `[alpha]`, responsibles/user_id = admin; B `2031-03-10 11:00:00`, C `2031-12-31 11:00:00`, A = 11:00 ou agora+10 min conforme a hora de SP; `created_action_id` igual ao vínculo em todas. |
| F02            | Falha na 2ª ação e, separadamente, no 2º vínculo: erro devolvido; contagem de ações/vínculos, versão 1, status `draft` e sugestões idênticos ao estado anterior. Sem a falha, a mesma chamada cria 3.                                                                                                                                                                                                      |
| F03            | Aba antiga (versão 1) chamando depois do commit, por outro admin: `created = []`, mesmos vínculos, 3/3, versão 2.                                                                                                                                                                                                                                                                                          |
| F03b           | Outra aba aprovou mais uma (versão 2); chamada com versão 1 → `VERSION_CONFLICT: current version is 2`, 0 ações, versão 2.                                                                                                                                                                                                                                                                                 |
| F04            | 10 pedidos de dois admins, versões 1 e 2 misturadas: exatamente 1 com 3 criadas e 9 sem escrita; 3 ações, 3 vínculos, versão 2. INSERT direto de vínculo duplicado → `duplicate key`. **Limite:** PGlite tem uma conexão; os pedidos rodaram em série. A espera pelo `FOR UPDATE` entre duas conexões reais não foi exercitada.                                                                            |
| F05            | Resposta da primeira chamada descartada; repetição com o mesmo pedido → mesmos vínculos, sem 4ª ação.                                                                                                                                                                                                                                                                                                      |
| F06            | Membro e admin inativo → `PLANNING_ADMIN_REQUIRED`; anon → `permission denied for function finalize_social_plan`; proposta de parceiro arquivado → `PLANNING_PROPOSAL_UNAVAILABLE`; 0 linhas novas. Membro lê 0 vínculos. Outro admin ativo finaliza proposta alheia; ações com user_id e responsável = ele.                                                                                               |
| F07            | UPDATE de `partner_slug`/`user_id` pelo admin → `permission denied`. A RPC só recebe id e versão. Sugestões regravadas sem `created_action_id` (versão 3) e nova finalização → nada criado; a resposta repõe os ids a partir dos vínculos.                                                                                                                                                                 |
| F08            | Pendente/rejeitada/aprovada → só a aprovada vira ação; pendente e rejeitada ficam sem `created_action_id`. Aprovar a pendente depois e finalizar → só ela é criada (2/2, versão 4). Aprovada sem data, `""`, `2031-02-30` ou `10/03/2031` junto com uma datada → `PLANNING_SUGGESTION_UNDATED`, 0 ações, versão 1, `draft`. Nenhuma aprovada → `PLANNING_NOTHING_APPROVED`.                                |
| F09            | Ação resultante apagada e nova finalização → nada recriado; resposta só com os ids dos vínculos (sem dados da ação).                                                                                                                                                                                                                                                                                       |
| F10            | Segunda proposta com os mesmos títulos e datas → 2 ações próprias (total 4).                                                                                                                                                                                                                                                                                                                               |
| F11            | RPC executada e transação abortada antes do commit → 0/0, versão 1; a chamada seguinte cria uma vez.                                                                                                                                                                                                                                                                                                       |
| R1 (regressão) | Reprodução do loop antigo (um INSERT por pedido, falha no 2º) deixa 2 de 3 ações; F02 reprova esse estado.                                                                                                                                                                                                                                                                                                 |

Teste de mutação: trocando o `CONTINUE` dos já vinculados por `NULL`, F03/F04/F07/F08/F09 falham; desligando a checagem de versão, F03b falha. Arquivo restaurado e conferido com `cmp`.

## 4. Outras verificações

- `bunx tsc --noEmit`: sem erro.
- Prettier nos arquivos TS tocados; `bunx biome lint` nos 4 arquivos: sem achados.
- `bun test tests/social-planning-recovery/02-persistence.test.ts`: 5 pass.
- `bun run test:serverless`: 10 PASS (inclui `api/planning-theme.ts`).

## 5. Não verificado / pendências

- Duas conexões PostgreSQL simultâneas (F04 completo): falta um PostgreSQL real isolado.
- RLS completa de produção: as policies de ações foram copiadas, não lidas do banco.
- SQL não aplicado em staging nem produção; o frontend depende da RPC, então a migração precisa ser aplicada antes de publicar.
- Fluxo no navegador (botão, mensagens, atualização da lista e das listas de ações) não testado.
- O contador "Finalizar N ações" ainda conta aprovadas já convertidas, e `update_social_plan_versioned` permite reescrever `created_action_id` no JSON (o vínculo na tabela continua sendo a autoridade): tela de confirmação e reconciliação ficam para o T10.
- KI externo `~/.gemini/.../database.md` não atualizado (fora do worktree).

> **Nota de 21/11:** a fase inicial das ações foi trocada de Ideia (`idea`) para Fazer (`do`) por decisão do proprietário em 20/11 (a ação já nasce com data). Código, teste e produção usam `do`; onde este relatório diz `idea`, vale `do`. As duas migrações (`finalize_social_plan` e `release_social_plan_suggestion`) foram aplicadas em produção em 20/11.
