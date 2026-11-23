# 01: Investigar o limite de funções da Vercel e possíveis unificações

**O que investigar:** confirmar o limite vigente do plano da Vercel e quantas funções o projeto envia hoje. Mapear as rotas e responsabilidades e recomendar quais podem compartilhar uma função sem mudar o comportamento visível nem enfraquecer autenticação, autorização, limites de execução ou tratamento de erros. A integração do Instagram acrescenta uma rota ao conjunto atual; verificar se isso ultrapassa o limite observado pelo proprietário. Entregar um relatório com contagem comprovada, opções, riscos, estimativa e roteiro de validação. Este ticket é somente de investigação: não unir arquivos, alterar rotas/configuração, modificar código, publicar ou mudar o plano.

**Bloqueado por:** Nenhum (estudo concluído; implementação aguarda aprovação do proprietário).

**Status:** done (aguardando decisão do proprietário)

- [x] Confirmar em fonte oficial o limite aplicável ao plano e em qual etapa a Vercel o aplica.
- [x] Comparar a contagem local de handlers com a última implantação e explicar diferenças por ambiente/roteamento.
- [x] Inventariar cada função: finalidade, métodos, autenticação, duração, segredos, dependências e consumidores.
- [x] Identificar agrupamentos possíveis e estimar impacto em segurança, manutenção, observabilidade, limites de execução e compatibilidade das URLs.
- [x] Recomendar a menor mudança que deixe margem para as rotas já previstas, com passos de execução, verificação e reversão.
- [x] Registrar conclusão e fatos não verificáveis sem acesso ao painel ou a uma implantação.

---

## 1. Limite oficial da Vercel e onde ele é aplicado

- **Limite do plano Hobby (Vercel):** em projetos que não empacotam rotas automaticamente via framework full-stack — caso da UZZINA (Vite/React SPA com handlers soltos na pasta `api/`) —, cada arquivo de endpoint em `api/*.ts` vira 1 função separada, com teto rígido de **12 Vercel Serverless Functions por deployment** (documentação oficial Vercel Functions Limits).
- **Planos Pro / Enterprise:** não há limite de quantidade de funções por deployment.
- **Etapa em que o bloqueio acontece:** na fase de **build/empacotamento do deployment** na Vercel. Ao detectar 13 ou mais funções no plano Hobby, a plataforma falha o deployment antes de promovê-lo, mantendo a versão anterior no ar.
- **Rewrites e duração (`Fluid Compute`):**
  - Regras em `vercel.json` → `rewrites` **não** contam como funções extras; apenas redirecionam URLs externas para o arquivo de função de destino.
  - Sob o **Fluid Compute** vigente no Hobby, a duração máxima (`maxDuration`) suportada vai até **300 segundos** (o arquivo `vercel.json` atual configura `"maxDuration": 180` para as quatro rotas mais longas).

## 2. Comparação de contagens por ambiente

| Referência                                   | Quantidade em `api/` | Situação no teto Hobby (12) | Observação                                                                                      |
| -------------------------------------------- | -------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `origin/main` (`ba46cf0a`, publicado)        | **12 arquivos**      | **No limite exato (12/12)** | Incluiu a fusão de limpeza em `api/admin-cleanup.ts` (`partner-delete` + `cloudinary-audit`).   |
| `HEAD` local (`1311e7f2`, com Instagram)     | **13 arquivos**      | **Ultrapassa (+1)**         | Acrescenta `api/partner-instagram-connection.ts`; falha ao publicar se o plano for Hobby.       |
| Dev local (`bun run dev`, `server/dev-api.ts`) | 13 entradas em `HANDLERS` | Sem teto                    | O middleware local mapeia rotas em memória para arquivos em `api/` e não reproduz o teto Hobby. |

> [!NOTE]
> `api/create-user.ts` entra na contagem real de 12/13 da Vercel e no `HANDLERS` de `server/dev-api.ts`, mas hoje está ausente da lista `sources` de `scripts/check-serverless-runtime.cjs` (que empacota 12 entrypoints em `1311e7f2`, omitindo `create-user.ts`).

## 3. Inventário completo das 13 funções em `api/`

| Função (`api/`)                  | Linhas | Métodos            | Autenticação e autorização                                             | `maxDuration` (`vercel.json`) | Segredos / env principais                                                                | Dependências internas (`server/` e `app/lib/`)                                                                                      | Consumidores em `app/`                       |
| -------------------------------- | ------ | ------------------ | ---------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `admin-cleanup.ts`               | 26     | `GET`, `POST`      | Bearer Supabase + `people.visible && people.admin`                     | Padrão                        | `SUPABASE_*`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`     | `server/cloudinary-audit-handler.ts`, `server/partner-delete-handler.ts`, `server/cloudinary-admin.ts`, `app/lib/cloudinary-*`      | `app/models/partners.ts`, `cloudinary.ts`    |
| `ai.ts`                          | 550    | `POST`             | Bearer Supabase + `people.visible` (qualquer membro ativo)             | `180`                         | `SUPABASE_*`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_DAILY_LIMIT`, `CLOUDINARY_*`    | `server/ai-generation.ts`, `server/strategy-generation.ts`, `server/ai-usage.ts`, `server/ai-model-catalog.ts`, `server/file-read.ts` | `app/services/ai-request.ts`                 |
| `client-accounts.ts`             | 330    | `GET/POST/PATCH/DELETE` | Bearer Supabase + `people.visible && people.admin`                | Padrão                        | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`                                              | `bcryptjs`, `zod`, `server/supabase-admin.ts`, `server/auth.ts`                                                                     | `app/models/clients.ts`                      |
| `create-user.ts`                 | 81     | `POST`             | Bearer Supabase + `people.admin` *(ver achado abaixo)*                 | Padrão                        | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`                  | `@supabase/supabase-js` direto (sem `server/supabase-admin.ts`)                                                                     | `app/routes/app/admin/user/$userId.tsx`      |
| `dash-action.ts`                 | 309    | `GET/POST/PATCH/DELETE` | Cookie HttpOnly de sessão `/dash` (`clients.active`)              | Padrão                        | `SUPABASE_*`, `NODE_ENV`                                                                 | `server/dash-session.ts`, `server/supabase-admin.ts`, `types/database.ts`                                                           | `app/services/dash-client.ts`                |
| `dash-auth.ts`                   | 256    | `POST`             | Credenciais de cliente (`clients`, `bcryptjs`) / cookie de sessão      | Padrão                        | `SUPABASE_*`, `NODE_ENV`                                                                 | `bcryptjs`, `server/dash-session.ts`, `server/supabase-admin.ts`                                                                    | `app/models/clients.ts`                      |
| `dash-data.ts`                   | 316    | `GET`              | Cookie HttpOnly de sessão `/dash` (`clients.active`)                   | Padrão                        | `SUPABASE_*`, `NODE_ENV`                                                                 | `date-fns`, `server/dash-session.ts`, `server/supabase-admin.ts`, `app/lib/action-color.ts`                                         | `app/services/dash-client.ts`                |
| `partner-instagram-connection.ts`| 879    | `GET`, `POST`, `DELETE` | Bearer Supabase + `people.visible && people.admin`                | Padrão                        | `SUPABASE_*`, `COMPOSIO_API_KEY`, `COMPOSIO_INSTAGRAM_AUTH_CONFIG_ID`, `VERCEL_URL`      | `server/auth.ts`, `server/composio-config.ts`, `server/composio-instagram.ts`, `app/lib/partner-instagram-contract.ts`              | `app/models/partner-instagram.ts`            |
| `planning-theme.ts`              | 435    | `POST`             | Bearer Supabase + `people.visible && people.admin`                     | `180`                         | `SUPABASE_*`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_DAILY_LIMIT`                    | `server/ai-generation.ts`, `server/planning-period.ts`, `server/ai-usage.ts`, `server/auth.ts`, `app/models/social_plans.ts`        | `app/hooks/usePlanningGeneration.ts`         |
| `review-links.ts`                | 321    | `POST`, `DELETE`   | Bearer Supabase + `people.visible` (+ `admin` ou parceiro atribuído)   | Padrão                        | `SUPABASE_*`                                                                             | `zod`, `node:crypto`, `server/supabase-admin.ts`, `server/auth.ts`                                                                  | `app/components/features/BulkActionMenu.tsx` |
| `review.ts`                      | 186    | `GET`              | Público anônimo por token opaco `?slug=...&r=...` (`sha256` em banco)  | Padrão                        | `SUPABASE_*`                                                                             | `node:crypto`, `server/supabase-admin.ts` (exporta tipos usados por `app/routes/dash/review.$slug.tsx`)                            | `app/routes/dash/review.$slug.tsx`           |
| `strategy-operations.ts`         | 196    | `GET`, `POST`      | Bearer Supabase + `people.visible`                                     | `180` (`HEAD` local)          | `SUPABASE_*`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_DAILY_LIMIT`, `UZZINA_STRATEGY_*` | `server/strategy-operations.ts`, `server/ai-model-catalog.ts`, `server/auth.ts`                                                     | `app/services/strategy-operations-client.ts` |
| `strategy-worker.ts`             | 63     | `POST`             | Assinatura HMAC máquina-a-máquina (`x-strategy-signature` + nonce)     | `180`                         | `STRATEGY_WORKER_SECRET`, `SUPABASE_*`, `OPENAI_API_KEY`, `AI_DAILY_LIMIT`               | `node:crypto`, `server/strategy-operations.ts`, `server/supabase-admin.ts`                                                          | Chamador externo / agendador (sem cliente UI)|

> [!WARNING]
> **Achado colateral em `api/create-user.ts`:** ao contrário de `client-accounts.ts` e dos demais endpoints administrativos, `create-user.ts` checa apenas `caller.admin` sem exigir `visible = true`, instancia o cliente Supabase diretamente com `SUPABASE_PUBLISHABLE_KEY` em vez de reutilizar `server/supabase-admin.ts` + `server/auth.ts`, e está fora de `scripts/check-serverless-runtime.cjs`.

## 4. Agrupamentos possíveis, riscos e o que não fundir

### Candidatos seguros para fusão

| Opção                              | Rotas reunidas                                                       | Novo entrypoint     | Economia | Avaliação técnica e de risco                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Candidato 1 (Prioridade alta)**  | `api/dash-auth.ts` + `api/dash-data.ts` + `api/dash-action.ts`       | `api/dash.ts`       | **3 → 1 (`-2`)** | **Melhor opção.** Todas atendem apenas o portal `/dash` com cookie HttpOnly de `clients`, usam os mesmos segredos (`SUPABASE_*`) e duração curta padrão. Sem risco de misturar equipe, IA ou Composio. |
| **Candidato 2 (Prioridade média)** | `api/client-accounts.ts` + `api/create-user.ts`                      | `api/admin-accounts.ts` | **2 → 1 (`-1`)** | Ambas tratam gestão administrativa de acessos, autenticação Bearer admin, duração curta e segredos `SUPABASE_*`. Aproveita para padronizar `visible && admin` em `create-user` e incluí-lo em `check-serverless-runtime.cjs`. |
| **Redução natural futura**         | Remover `api/strategy-worker.ts` após desativar cron/fila legada     | —                   | **`-1` (sem fusão)** | Prevista na transição das estratégias síncronas ([EST-06](../../.scratch/action-strategy/issues/06-investigate-strategy-worker-cron.md)); libera +1 vaga naturalmente no futuro. |

### Compatibilidade de URLs, observabilidade e execução

- **URLs preservadas:** o mesmo padrão já validado em `api/admin-cleanup.ts` funciona sem quebrar nenhum link: dispatch por query param `?op=`/`?scope=` no entrypoint e regras de `rewrites` em `vercel.json` redirecionando os caminhos antigos (`/api/dash-auth`, `/api/dash-data`, `/api/dash-action`, `/api/client-accounts`, `/api/create-user`) para a função unificada.
- **Limites de execução:** nenhum dos dois candidatos usa `maxDuration: 180` nem bibliotecas pesadas de IA; `bcryptjs` já é compartilhado entre `dash-auth` e `client-accounts`, e `date-fns` só entra no pacote `/dash` do Candidato 1.
- **Observabilidade:** logs no painel da Vercel passam a agrupar as chamadas pelo nome do arquivo único (`api/dash.ts` / `api/admin-accounts.ts`), distinguíveis pelos parâmetros de rota/operação na URL de requisição.

### O que NÃO fundir

- **`api/review.ts` com `api/review-links.ts`:** superfícies de confiança opostas (leitura anônima via token público vs escrita autenticada da equipe). `api/review.ts` também exporta tipos importados pelo frontend em `app/routes/dash/review.$slug.tsx`.
- **`api/strategy-worker.ts` com rotas de usuário:** autenticação HMAC máquina-a-máquina sem token Bearer; melhor manter isolada até sua remoção planejada.
- **`api/partner-instagram-connection.ts` com `/dash` ou revisão:** carrega `COMPOSIO_API_KEY` e regras OAuth/Callback específicas de admin ativo. Deve permanecer dedicada como ponto de entrada natural de futuras operações do Instagram.
- **`api/ai.ts` com `api/planning-theme.ts`:** juntas somam ~985 linhas, têm públicos de autorização diferentes (qualquer membro ativo vs somente admin ativo) e lógicas densas; só considerar em última instância caso falte vaga futuramente.

## 5. Recomendação objetiva, passos e reversão

- **Menor mudança recomendada:** executar **apenas o Candidato 1** (`api/dash-auth.ts` + `api/dash-data.ts` + `api/dash-action.ts` → `api/dash.ts`).
  - Reduz de **13 para 11 funções**, já acomodando `api/partner-instagram-connection.ts` dentro do plano Hobby com **1 vaga de margem** livre (chegando a **2 vagas** quando `strategy-worker.ts` for removido futuramente).
- **Complemento opcional:** somar o **Candidato 2** (`api/client-accounts.ts` + `api/create-user.ts` → `api/admin-accounts.ts`), baixando para **10 funções** (2 vagas livres agora) e corrigindo a validação de administrador ativo em `create-user.ts`.
- **Alternativa sem alterar código:** migrar a conta Vercel para o plano **Pro** (remove o limite de 12 funções).

### Roteiro de execução (quando autorizado) e reversão

1. Mover a lógica de `dash-auth`, `dash-data` e `dash-action` para handlers em `server/` (`export default` recebendo `req, res`), mantendo intactas as checagens de método, cookie e DTOs.
2. Criar `api/dash.ts` validando métodos primeiro (antes do dispatch, compatível com a sonda de `check-serverless-runtime.cjs`), encaminhando via `scope`/`endpoint`.
3. Atualizar consumidores (`app/services/dash-client.ts`, `app/models/clients.ts`), adicionar `rewrites` em `vercel.json`, atualizar `server/dev-api.ts` e `scripts/check-serverless-runtime.cjs`, e remover os 3 arquivos antigos em `api/`.
4. **Verificação antes do push:** Prettier, Biome, `tsc --noEmit`, `bun test tests/dash-*.test.ts` (e `client-accounts` se aplicar Candidato 2), `node scripts/check-serverless-runtime.cjs`, `vite build` e teste manual no portal `/dash` (login, listagem, comentário e anexo).
5. **Reversão:** como a mudança não toca esquema de banco nem dados, reverter é um único `git revert` do commit de fusão (e eventual volta dos rewrites no `vercel.json`).

## 6. Fatos não verificáveis sem acesso ao painel Vercel ou implantação real

- Qual plano está efetivamente faturado hoje na conta Vercel (Hobby gratuito vs Pro).
- Se o deploy do commit `ba46cf0a` (`origin/main`, com 12 funções) concluiu como **Ready** no painel da Vercel.
- Eventuais cron jobs ou variáveis configurados manualmente apenas no painel da Vercel fora do repositório Git.
- Tempos reais de cold start e execução sob carga concorrente em produção após eventual agrupamento.

## Modelos sugeridos

- Codex — gpt-6.2-sol. Adequado para inventariar handlers e comparar candidatos de baixo risco.
- Codex — gpt-6.2-astra. Alternativa para avaliar interações de autenticação, duração e segurança entre APIs.
- Codex — gpt-6.1-terra. Alternativa para conferir o comportamento das rotas e explicar opções de forma clara.

## Decisão do proprietário e entrega — 23/11/2026

O proprietário aprovou executar a Opção 1, unificando o portal `/dash` em `api/dash.ts` com os caminhos antigos preservados por rewrites. Nesta rodada, o checkout foi preparado para commit e publicação: typecheck, build Vite e oito entrypoints em `bun run test:serverless` passaram; a contagem de handlers em `api/` é oito. A validação manual do portal no deploy fica pendente.
