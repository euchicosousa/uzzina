# UZZINA — próximos ajustes (tarefas prontas para execução)

Data: 08/10/2026. Origem: [diagnóstico geral](2026-10-08-diagnostico-geral.md) e revisão da Fase 3. Substitui as seções 3–6 do diagnóstico como lista de trabalho.

## Como usar este documento

- **Uma tarefa por vez**, na ordem da tabela. Cada tarefa precisa da autorização do proprietário para começar; este documento não autoriza nada sozinho.
- Cada tarefa traz: objetivo, arquivos, passos, **o que NÃO fazer**, critério de aceite e verificação. Se algo necessário não estiver descrito, **pare e pergunte**. Não invente escopo: melhorias percebidas no caminho vão para o relatório final da tarefa, não para o código.
- Antes de começar: `git status` limpo (exceto `.claude/`), leia o [AGENTS.md](../../AGENTS.md) e somente os arquivos citados na tarefa.
- Ao terminar cada tarefa: `bun run format`, `bun run lint`, `bun run typecheck`, `bun test` e `bun run build` (se tocar runtime). Depois, registre uma linha em [CURRENT](../audits/CURRENT.md) e entregue um resumo: o que mudou, o que foi verificado e o que ficou de fora. **Não fazer commit/push/deploy/SQL** sem pedido explícito.
- A coluna "Modelo" sugere quem executa (Opus planeja e revisa; Sonnet implementa; Haiku só para tarefas mecânicas).

## Já concluído (não refazer)

| Item | Commit |
|---|---|
| Imports `.js` das APIs, migration de leitura de ações (produção confirmada pelo proprietário) | `2cc7c45` |
| Fase 3: constantes, rascunho único de ação, models, utils, helpers de servidor, `useActionAI`, perfil | `35976e6` |
| Bug "Criada há cerca de 3 horas" (`toDbTimestamp` em `app/utils/uzzina-utils.ts`) | `f5639ef` |
| Prettier como formatador do projeto, só com `prettier-plugin-tailwindcss`; código todo formatado | `f92d9f5`, `cc91dab` |

Decisões do proprietário já tomadas: manter `app/data/hooks-library.ts` (uso futuro); manter o Prettier para ordenar as classes Tailwind (o Biome segue só como lint). O plugin `prettier-plugin-jsx-attr-sort` foi removido porque anulava o plugin do Tailwind. **Não reintroduzir.**

## Ordem das tarefas

| # | Tarefa | Modelo | Tipo |
|---|---|---|---|
| T1 | Tipagem das APIs com resolução do Node (`typecheck:api`) | Sonnet | Prevenção |
| T2 | CI no GitHub | Sonnet | Prevenção |
| T3 | Smoke test do site publicado | Haiku/Sonnet | Prevenção |
| T4 | Desenvolvimento local somente no staging (decidido) | Sonnet | Prevenção |
| T5 | Escala tipográfica em tokens + títulos em 2 linhas | Sonnet | Visual |
| T6 | Dia do calendário sem conteúdo escondido | Sonnet | Visual |
| T7 | Calendário em lista no celular | Sonnet (revisão Opus) | Visual |
| T8 | Barras de ferramentas com rótulos | Sonnet | Visual |
| T9 | Forma: raios e filetes | Haiku/Sonnet | Visual |
| T10 | Duplicações residuais de consultas | Sonnet | Código |
| — | Vercel com projeto único; detecção de divergência de schema | Proprietário + Opus | Operação (não delegar) |

---

## T1 — `typecheck:api`

**Objetivo:** fazer o `tsc` acusar import relativo sem `.js` nas funções da Vercel. Foi esse defeito que derrubou a IA em produção.

**Por quê:** o `tsconfig.json` usa `moduleResolution: "bundler"`, que aceita `../app/lib/ai-contract` sem extensão; o Node publicado recusa. Já validado: com `NodeNext`, o `tsc` dá `TS2835` exatamente nesse caso.

**Arquivos:** novo `tsconfig.api.json`; `package.json`; imports em `api/*.ts` e `server/*.ts`.

**Passos:**
1. Criar `tsconfig.api.json`:
   ```json
   {
     "compilerOptions": {
       "lib": ["ES2022"], "types": ["node"], "target": "ES2022",
       "module": "NodeNext", "moduleResolution": "NodeNext",
       "strict": true, "noEmit": true, "skipLibCheck": true,
       "esModuleInterop": true, "verbatimModuleSyntax": true, "resolveJsonModule": true
     },
     "include": ["api/**/*.ts", "server/**/*.ts"]
   }
   ```
2. Adicionar `"typecheck:api": "tsc -p tsconfig.api.json"` em `package.json`.
3. Rodar e corrigir **só** o que ele acusar: trocar `from "../types/database"` por `"../types/database.js"` (inclusive `import type`) em `api/*` e `server/supabase-admin.ts`; tipar o parâmetro implícito `any` se ainda aparecer em `api/dash-action.ts` (~linha 47).
4. Provar o efeito: num arquivo temporário, remova o `.js` de um import, veja o `TS2835` e apague o arquivo.

**Não fazer:** mudar o `tsconfig.json` principal; mudar a lógica dos handlers; mexer em `server/dev-api.ts` além de imports, se acusado.

**Aceite:** `bun run typecheck:api` passa; `bun run test:serverless` continua com 7 PASS.

---

## T2 — CI no GitHub

**Objetivo:** nenhum push chega em `main` sem passar pelas verificações.

**Arquivos:** novo `.github/workflows/ci.yml`; README (uma seção curta).

**Passos:**
1. Workflow em `push` e `pull_request` para `main`, `ubuntu-latest`:
   - `actions/checkout@v4`, `oven-sh/setup-bun@v2` (versão do Bun igual à local: `bun --version`), `actions/setup-node@v4` com Node 22;
   - `bun install --frozen-lockfile`;
   - `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run typecheck:api` (T1), `bun test`, `bun run build`, `bun run test:serverless`.
2. Se algum teste ou o build exigir variáveis `VITE_*`, use **valores fictícios** no `env:` do job (ex.: `VITE_SUPABASE_URL: http://127.0.0.1:54321`, `VITE_SUPABASE_ANON_KEY: ci-placeholder`). Nunca segredos reais, nunca GitHub Secrets nesta tarefa.
3. Não fazer push para testar. Rode localmente, na mesma ordem e **sem `.env`** (renomeie temporariamente, se a T4 ainda não estiver feita), cada comando do workflow. O primeiro push autorizado pelo proprietário serve de prova do CI no GitHub.

**Não fazer:** deploy pelo CI; usar credenciais; ligar a proteção de branch (decisão do proprietário: informe como fazer no resumo).

**Aceite:** todos os comandos do workflow passam localmente sem `.env`; após o próximo push autorizado, o workflow fica verde no GitHub. Um commit com import sem `.js` ou com classes fora de ordem deixa o CI vermelho.

---

## T3 — Smoke test do site publicado

**Objetivo:** em 5 segundos, dizer se o deploy subiu com as funções carregando.

**Arquivos:** novo `scripts/smoke-production.mjs`; script `"smoke": "node scripts/smoke-production.mjs"`; README.

**Passos:** sem credenciais, contra `process.argv[2] ?? "https://uzzina.cnvt.com.br"`. Esperado, medido em 08/10:

| Requisição | Esperado |
|---|---|
| `GET /` | 200 |
| `GET /api/ai` | 405 |
| `POST /api/ai` (sem Authorization, corpo `{}`) | 401 |
| `POST /api/dash-auth` (corpo `{}`) | 403 |
| `GET /api/dash-data` | 401 |
| `GET /api/dash-action` | 401 |
| `POST /api/review` | 405 |

Reprova se o status divergir **ou** se houver o header `x-vercel-error`. A saída é uma linha por requisição e o código de saída é diferente de 0 se houver falha.

**Não fazer:** enviar tokens, logins ou dados; testar rotas autenticadas.

**Aceite:** `bun run smoke` passa contra produção agora.

---

## T4 — Desenvolvimento local somente no staging (decidido)

**Decisão do proprietário (08/10):** o desenvolvimento local passa a usar **apenas o banco de staging** (Supabase `zacrrtilppvekiyoybzn`), separado da produção (`dfepmjcozszswocwvdpq`). Não haverá um modo local apontando para produção. Antes não havia banco de testes, por isso o dev usava produção.

**Contexto técnico (ler antes de mexer):**
- Arquivos: `.env` = produção (VITE_SUPABASE_URL/ANON_KEY, OPENAI_API_KEY e Cloudinary); `.env.staging.local` = staging completo (VITE_*, chaves de servidor, OPENAI_API_KEY, AI_DAILY_LIMIT, APP_ORIGIN; **sem Cloudinary**); `.env.staging-users.local` = e-mails/senhas das **contas fictícias de teste** (admin e dois colaboradores) para entrar no app local. Também existem, **com valores de produção**: `.env.backup.local` (conexão direta ao banco para backup) e `.env.vercel-production.local` (cópia das variáveis da Vercel). O Vite não carrega nenhum dos dois; não renomear, não editar e não usar nesta tarefa. Todos ignorados pelo Git.
- **Armadilha:** o Bun carrega o `.env` automaticamente em todo `bun run` e `bun test`, e as variáveis que já estão no processo **vencem** os arquivos que o Vite lê. Por isso, enquanto existir um `.env` com produção, `--mode staging` sozinho não garante staging quando iniciado pelo Bun (o README já avisa). A solução precisa remover essa pré-carga, não só trocar o modo.
- No modo `staging`, o `vite.config.ts` desliga `UZZINA_LOCAL_AI_COMPAT`, e a IA local passa a usar a reserva persistente `consume_ai_usage` do staging (caminho igual ao publicado, já validado com a chave de servidor do staging). Isso é desejado.

**Passos:**
1. Renomear `.env` para `.env.production.local`. Ele deixa de ser carregado automaticamente pelo Bun e pelo `vite dev`, e o Vite só o lê em `--mode production` (build local). A Vercel não usa esse arquivo; ela tem as próprias variáveis. **Ponto de atenção:** o Bun também carrega `.env.production.local` quando `NODE_ENV=production`. Hoje nenhum script faz isso (o `test:serverless` usa ambiente controlado); não crie scripts que definam `NODE_ENV=production` sob o Bun.
2. Acrescentar ao `.env.staging.local` as duas variáveis públicas do widget `VITE_CLOUDINARY_CLOUD_NAME` e `VITE_CLOUDINARY_UPLOAD_PRESET`, copiando os nomes e valores do arquivo de produção **sem imprimi-los** (use um script que lê de um arquivo e grava no outro). Não copie nenhuma outra chave de produção para o staging.
3. `package.json`: `"dev": "vite --mode staging"`. Confirme que `bun run dev` serve o staging: no navegador, `import.meta.env.VITE_SUPABASE_URL` precisa conter `zacrrtilppvekiyoybzn`.
4. Faixa fina no topo do layout `/app`, **somente** com `import.meta.env.DEV`: "Desenvolvimento local · staging". Se a URL do Supabase contiver `dfepmjcozszswocwvdpq`, mostre em vermelho (`bg-error-background`/`text-error`) "ATENÇÃO: desenvolvimento local conectado à PRODUÇÃO", como proteção contra regressão. Nunca aparece no build publicado.
5. Rodar `bun test` **sem** `.env` presente. Se algum teste depender de variável que vinha do `.env`, defina o valor fictício dentro do próprio teste; nunca aponte o teste para um banco real.
6. README: atualizar a seção de ambientes (o dev usa staging; entrar com as contas de `.env.staging-users.local`; o `.env.production.local` só serve para o build local) e remover a instrução antiga de que o `.env` habitual aponta para produção. AGENTS §IA e ambientes: uma linha com o mesmo contrato.

**Não fazer:** imprimir, logar ou commitar valores de env; copiar chaves de servidor ou OpenAI de produção para staging; alterar envs da Vercel; criar ou alterar usuários no staging; mudar a lógica de IA (`api/ai.ts`, `UZZINA_LOCAL_AI_COMPAT`); criar o script `dev:prod`.

**Aceite:** `bun run dev` abre o app ligado ao staging, a faixa mostra "staging" e o login funciona com uma conta de `.env.staging-users.local`; criar uma ação de teste no staging funciona (apague-a depois); `bun test`, `bun run build` e `bun run test:serverless` passam sem `.env`; o build publicado não mostra a faixa.

---

## T5 — Escala tipográfica + títulos em 2 linhas

**Objetivo:** manter o contraste suíço (títulos grandes) e acabar com o texto minúsculo e com os títulos cortados.

**Contexto medido:** 85% dos tamanhos são `text-xs`/`text-sm`; há 28 usos de 8–11px; mais de 13 tamanhos avulsos `text-[Npx]`. Títulos de ação ficam com 4–6 letras no calendário porque o `ActionItem` usa `lines = 1` por padrão (`app/components/features/ActionItem.tsx:99`) e nenhum chamador muda isso. O `ActionItemTitleInput` já suporta `lines={2}`, que aplica `line-clamp-2` (`ActionItemTitleInput.tsx:70-72`). Atenção: `ActionItem.tsx:265` é o **nome do parceiro**, não o título; não mexer.

**Passos:**
1. Em `app/tailwind.css` (`@theme`), criar tokens de texto (nomes fixos; valores iniciais):

   | Token | Valor | Uso |
   |---|---|---|
   | `text-display` | 3rem / leading 1 / bold / tracking-tighter | Títulos de seção (h1 atual) |
   | `text-title` | 1.875rem / leading 1.1 / bold | Título da gaveta, h2/h3 |
   | `text-heading` | 1.25rem / leading 1.2 / medium | Subtítulos |
   | `text-body` | 0.875rem / leading 1.4 / medium | Texto padrão |
   | `text-meta` | 0.75rem / leading 1.3 / medium | Datas, contadores, rótulos de card |
   | `text-label` | 0.75rem / tracking-wide / medium + caixa alta | Rótulos em caixa alta (único tracking permitido) |

   Implementação no Tailwind 4.3.2: tamanho, `--line-height`, `--letter-spacing` e `--font-weight` entram nas variáveis `--text-*` do `@theme`. **`uppercase` não cabe em token de tema**: crie `@utility text-label { ... text-transform: uppercase; }` no `tailwind.css` (ou use `text-label uppercase` nos pontos de uso; escolha uma das formas e use só ela).
2. Substituir todos os `text-[8px]`, `text-[9px]`, `text-[10px]` e `text-[11px]` por `text-meta` (ou `text-label` se estiver em caixa alta). Para os outros `text-[Npx]`, usar o token mais próximo; se não houver um equivalente razoável, **listar no resumo em vez de criar um token novo**.
3. Títulos de ação: **não trocar classes**. O caminho é o prop `lines`: `ActionItem` (prop `lines`, padrão 1) → `ActionBlockVariant` (já repassa ao `ActionItemTitleInput`) e `ActionLineVariant` (**não** recebe nem repassa `lines`: acrescentar). Depois, passar `lines={2}` nos usos do Sprint (`HomeSprintView`), do Hoje (`HomeTodayView`) e do calendário (`CalendarDayCell`/`ActionContainer`, conforme quem renderiza o `ActionItem`). Mantenha a edição do título funcionando nos dois modos.
4. Atualizar a galeria `/ui` (`app/components/ui-sections/`) com uma seção de tipografia mostrando os 6 tokens.

**Não fazer:** trocar a fonte (PP Object Sans), as paletas OKLCH ou os temas; alterar `text-xs`/`text-sm` em massa nesta tarefa (fica para depois, quando os tokens estiverem aprovados); mudar espaçamento ou layout.

**Aceite:** nenhum `text-[` abaixo de 12px no `app/` (`grep -rn "text-\[\(8\|9\|10\|11\)px\]" app` vazio); títulos de ação aparecem em até 2 linhas no Sprint, Hoje e calendário, e o nome do parceiro (`ActionItem.tsx:265`) continua em 1 linha; `/ui` mostra a escala. Prints antes/depois em 1440px e 375px no resumo.

---

## T6 — Dia do calendário sem conteúdo escondido

**Contexto:** `CalendarDayCell.tsx:55-56` fixa a altura do dia (`h-72`/`h-96`) e `ActionContainer.tsx:137` cria uma rolagem interna com máscara de esmaecimento. Isso gera rolagem dentro da rolagem e ações cortadas ("Em cas…").

**Decisão do proprietário antes de começar (recomendação: A):**
- **A.** Mantém a altura fixa e mostra no máximo N ações; o resto vira um botão "+N" que abre o dia (popover com a lista completa usando os primitivos Prism).
- **B.** Altura livre: o dia cresce com o conteúdo, sem rolagem interna.

**Passos (A):** em `CalendarDayCell`, calcular quantas cabem (constante por variante: linha/bloco), renderizar só essas, e depois o "+N" com `PrismPopover`; remover a rolagem interna e a máscara só no contexto de calendário (`isCompact`/prop nova). Arrastar e soltar (dnd-kit) deve continuar funcionando para as ações visíveis.

**Não fazer:** mexer em `Calendar.tsx` (grade/semana), na lógica de datas ou no DnD além do necessário para a lista visível.

**Aceite:** nenhum dia com rolagem interna; "+N" abre a lista completa; arrastar uma ação visível entre dias continua funcionando (teste existente `tests/drag-concurrency.test.tsx` passa).

---

## T7 — Calendário em lista no celular

**Contexto:** `Calendar.tsx:38` e `ClientCalendar.tsx:114` usam `min-w-375` (1500px) e mostram 2 dias por tela no celular.

**Passos:** abaixo de `md`, renderizar uma **agenda vertical**: cabeçalho do dia (dia da semana + número, destaque para hoje), ações do dia abaixo e datas comemorativas em texto `meta`. Dias sem ação aparecem só como cabeçalho, compactos. Reutilizar `ActionContainer`/`ActionItem`. Desktop sem alteração.

**Não fazer:** mudar a grade desktop; mudar as consultas/períodos; remover o DnD do desktop (no mobile, a agenda pode não ter DnD; informe no resumo).

**Aceite:** em 375px não há rolagem horizontal (`document.documentElement.scrollWidth === innerWidth` e nenhum container interno maior que a tela); prints do parceiro e do portal `/dash` no celular.

---

## T8 — Barras de ferramentas com rótulos

**Contexto:** a barra do parceiro tem 13 botões só com ícone (3 linhas no celular); o rodapé da gaveta tem 8. Componente: `app/components/features/ViewOptions.tsx` (`ViewOptionsComponent`, `useViewOptions`).

**Passos:** agrupar em 3 menus rotulados, "Visualizar" (variante/colunas), "Ordenar" (campo/direção) e "Exibir" (metadados visíveis), usando `PrismMenu`/`PrismPopover`. Cada opção dentro do menu tem ícone + texto. No desktop ≥ `lg`, o grupo "Visualizar" pode continuar exposto com tooltip. O filtro "Fases" fica como está. Atualizar a seção `ViewOptionsSection` em `/ui`.

**Não fazer:** mudar o formato das preferências salvas (`usePreferencePersistence`) nem os nomes dos campos; mudar o rodapé da gaveta nesta tarefa (tarefa separada, se aprovada).

**Aceite:** a barra cabe em 1 linha a 375px; todas as opções continuam funcionando e persistindo; foco por teclado percorre os menus (AGENTS §5).

---

## T9 — Forma: raios e filetes

**Contexto:** 6 raios diferentes (`rounded-full` 62, `2xl` 58, `lg` 34, `xl` 31, padrão 22, `3xl` 12) e sombras em cards.

**Passos:** padronizar em 2 raios: `rounded-md` para controles/cards e `rounded-full` só para avatares, pílulas de status e o botão principal da navegação inferior. Trocar sombras de separação por `border border-border`. Começar pelos primitivos Prism (`app/components/prism/`) e depois `ActionItem`.

**Não fazer:** mudar as cores, o `squircle` do `ActionItem` sem conversar (é uma escolha visual: pergunte), o login e a grade de parceiros (que já estão no estilo).

**Aceite:** no máximo os 2 raios no `app/` (exceções listadas no resumo); prints antes/depois.

---

## T10 — Duplicações residuais de consultas

**Contexto:** `fetchPartnerBySlug`/`fetchPeople` (`app/lib/supabase.queries.ts`) duplicam `getPartnerBySlug`/`getPersonByUserId` (`app/models/`). O `profile.tsx` chama `supabase.rpc("update_my_preferences")` diretamente.

**Passos:** fazer os importadores usarem as funções de `app/models/` e remover a duplicata; mover a chamada RPC para `app/models/people.ts` (`updateMyPreferences`).

**Não fazer:** mover `supabase.mutations.ts` (coordenador de salvamento, conflitos, lote: é contrato do AGENTS); mudar chaves de cache (`QUERY_KEYS`).

**Aceite:** nenhuma função de leitura duplicada entre `lib/supabase.queries.ts` e `models/`; os testes de cache (`tests/action-cache.test.tsx`) passam.

---

## Operação (não delegar a um agente implementador)

- **Projeto Vercel único:** confirmar qual projeto serve `uzzina.cnvt.com.br` (os logs indicam `prj_8PN3…`; o vínculo local é `prj_sFbk…`), revincular `.vercel/project.json` e arquivar o outro. É uma ação do proprietário no painel da Vercel.
- **Divergência de schema staging × produção:** um script **somente leitura** que compara `pg_policies`, hash de `pg_get_functiondef` e grants nos dois bancos. Precisa de credenciais de leitura e de autorização explícita; planejar com o Opus antes de implementar.
- **Bug legado de horário:** ações antigas criadas por versões anteriores podem ter `created_at` gravado em hora local. Só afeta o texto "Criada há…" de ações nunca editadas. Não corrigir dados sem planejamento e autorização.
