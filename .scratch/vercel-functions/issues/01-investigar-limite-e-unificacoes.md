# 01: Investigar o limite de funções da Vercel e possíveis unificações

**Estado atualizado em 26/11/2026:** o proprietário confirmou o plano Hobby e autorizou publicar uma função para toda a administração. A segunda fusão reúne `admin-accounts` e `admin-cleanup` em `admin`, reduzindo de 10 para 9 funções. O [HTML de resultado](../estudo-unificacao.html) mostra o que cada função faz.

**Escopo atual:** manter o inventário das funções no Hobby e reunir em `/api/admin` a gestão de contas de clientes, a criação de credenciais da equipe, a exclusão definitiva de parceiros arquivados e a auditoria e limpeza do Cloudinary. A geração geral e as propostas de Planejamento compartilham uma função, com suas rotinas e permissões próprias. Preservar URLs anteriores e os contratos de cada operação.

As seções 1–5 e a decisão de 23/11 abaixo documentam os estudos anteriores. Para estado vigente após a decisão de 26/11, use “Unificação administrativa completa”.

**Bloqueado por:** Nenhum.

**Status:** fusão administrativa pronta e verificada localmente; commit/push e confirmação do deploy Ready em andamento.

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

- Codex — GPT-6.2 Sol, para fundir os dois endpoints administrativos e preservar os contratos e URLs existentes.
- Codex — GPT-6.2 Astra, para revisar a fronteira de autorização e os riscos de uma função compartilhada.
- Codex — GPT-6.1 Terra, para inventariar as demais funções e apresentar opções em linguagem direta.

## Atualização da investigação — 26/11/2026

O limite precisa ser lido com a condição de empacotamento documentada atualmente pela Vercel: para Hobby, Vite/React SPA com handlers soltos em `api/` conta um arquivo por função, até 12 por deployment. A Vercel agrupa funções automaticamente em alguns frameworks; em outros frameworks e em funções diretas, cada arquivo mapeia a uma função. Fontes oficiais: [limites gerais](https://vercel.com/docs/limits), [runtimes e contagem de funções](https://vercel.com/docs/functions/runtimes) e [duração máxima com Fluid Compute](https://vercel.com/docs/functions/limitations#max-duration).

Snapshot anterior à nova decisão: em `26/11` o checkout tinha 11 funções e a fusão `/dash` já estava em `main`. Os dados atuais, após a fusão administrativa, aparecem na seção seguinte.

O proprietário confirmou plano Hobby, sem previsão de upgrade, e autorizou a Opção 2 em 26/11. A implementação local está registrada abaixo; não foi publicada.

## Decisão do proprietário e entrega — 23/11/2026

O proprietário aprovou executar a Opção 1, unificando o portal `/dash` em `api/dash.ts` com os caminhos antigos preservados por rewrites. Nesta rodada, o checkout foi preparado para commit e publicação: typecheck, build Vite e oito entrypoints em `bun run test:serverless` passaram; a contagem de handlers em `api/` é oito. A validação manual do portal no deploy fica pendente.

## Primeira unificação administrativa — 26/11/2026

O proprietário confirmou plano Hobby, sem previsão de upgrade, e autorizou reunir a criação de usuários da equipe (`/api/create-user`) com a gestão de contas de clientes (`/api/client-accounts`). A rota unificada é `api/admin-accounts.ts`, com escopos `create-user` e `clients`; os caminhos antigos continuam encaminhados por rewrites, e o app usa o endpoint unificado diretamente. A contagem local cai de 11 para **10 funções (10/12)**, com duas vagas livres.

O handler de criar usuário agora usa o cliente compartilhado de serviço e exige `people.visible = true` e `people.admin = true`. Antes ele só verificava `admin`, sem exigir membro ativo, e usava uma inicialização Supabase separada. Não houve mudança de schema nem de dados.

O [HTML de resultado](../estudo-unificacao.html) lista as 10 funções, descreve o que cada uma faz e compara outras possibilidades de agrupamento. Nenhuma outra função foi fundida. O `strategy-worker` continua no código, embora o cron esteja pausado e a fila drenada: o ticket EST-06 registra que o endpoint foi mantido para reversão e que a remoção definitiva ficou separada. As APIs do Instagram podem ser roteadas em conjunto; o HTML recomenda avaliar só publicação + importação, mantendo a conexão OAuth separada. A primeira fusão foi publicada no commit `fea5e9c6`, com deployment de produção Ready.

**Evidência local:** `bun run typecheck`; `bun test tests/client-accounts.test.ts` (13 PASS); `bun run test:serverless` (10 entrypoints PASS, com build de Vercel e importação nativa do Node). Ainda falta conferir visualmente o HTML e, após autorização de publicação, verificar o deploy Ready no painel da Vercel. A configuração Fluid Compute da conta não foi consultada.

## Unificação administrativa completa — 26/11/2026

O proprietário autorizou reunir `/api/admin-accounts` e `/api/admin-cleanup` em
`/api/admin` e publicar diretamente. A função encaminha contas de clientes,
criação de usuário, exclusão definitiva de parceiros arquivados e auditoria e
limpeza do Cloudinary para os handlers existentes. As seis URLs anteriores
continuam disponíveis por rewrites e pelo adaptador local.

A contagem passa de **10 para 9 funções**, com três vagas no limite de 12
adotado no estudo. O [inventário](../estudo-unificacao.html) lista as nove.

## Unificação de IA e Planejamento — 26/11/2026

O proprietário aprovou compartilhar uma função da Vercel. `/api/ai` atende a
geração da equipe e recebe, por rewrite, as chamadas a `/api/planning-theme`.
O fluxo da equipe exige membro ativo. A geração de propostas exige
administrador ativo e mantém quota, lotes e retomada. A duração configurada
é de 180 segundos. Contagem após esta fusão: **8 funções**.

## Remoção do worker antigo de estratégias — 26/11/2026

O proprietário autorizou remover `/api/strategy-worker` e publicar. A fila
antiga tinha sido drenada e o cron pausado em 25/11. Gerar e Recriar
continuam em `/api/strategy-operations`. A remoção deixa **7 funções**.

## Nome da importação por link — 26/11/2026

Em Gaveta da ação → Essencial → Arquivos, a importação por link usa
`/api/import-from-link`. O Instagram é a origem aceita hoje. A URL
`/api/instagram-reference` encaminha para a nova, com o mesmo formato de
requisição. A troca de nome mantém o total em **7 funções**.
