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
| T4 | Ambiente local seguro (staging explícito + aviso de produção) | Sonnet | Prevenção |
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
3. Abrir um PR de teste (ou rodar com `act`) e confirmar que o workflow fica verde.

**Não fazer:** deploy pelo CI; usar credenciais; ligar a proteção de branch (decisão do proprietário: informe como fazer no resumo).

**Aceite:** workflow verde no GitHub. Um commit com import sem `.js` ou com classes fora de ordem deixa o CI vermelho.

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

## T4 — Ambiente local seguro

**Contexto:** o `.env` aponta para o Supabase de **produção**. O staging já funciona com `node node_modules/vite/bin/vite.js --mode staging` (README).

**Decisão do proprietário antes de começar:** o `bun run dev` padrão deve ser staging ou produção? Staging tem poucos dados (4 ações); produção tem dados reais. Recomendação: o padrão continua produção (uso diário), mas com aviso visível; staging ganha um atalho.

**Passos:**
1. Scripts: `"dev:staging": "node node_modules/vite/bin/vite.js --mode staging --port 5180 --strictPort"` (Node, não Bun, para evitar a pré-carga do `.env`, como o README já explica).
2. Aviso visual somente em desenvolvimento (`import.meta.env.DEV`): uma faixa fina no topo do layout `/app` dizendo "Dev local · PRODUÇÃO" quando `VITE_SUPABASE_URL` contém `dfepmjcozszswocwvdpq`, e "Dev local · staging" caso contrário. Use tokens existentes (`bg-warning-background`/`text-warning`). Nunca aparece no build publicado.
3. README: uma linha explicando os dois modos.

**Não fazer:** renomear ou editar arquivos `.env*`; imprimir valores de env; mudar a lógica de IA local (`UZZINA_LOCAL_AI_COMPAT`); mostrar a faixa em produção.

**Aceite:** a faixa aparece no `bun run dev` e no `dev:staging` com o texto certo; `bun run build` + `preview` não mostra a faixa.

---

## T5 — Escala tipográfica + títulos em 2 linhas

**Objetivo:** manter o contraste suíço (títulos grandes) e acabar com o texto minúsculo e com os títulos cortados.

**Contexto medido:** 85% dos tamanhos são `text-xs`/`text-sm`; há 28 usos de 8–11px; mais de 13 tamanhos avulsos `text-[Npx]`. Títulos de ação usam `whitespace-nowrap` + `text-ellipsis` (`app/components/features/ActionItem.tsx:265`) e ficam com 4–6 letras no calendário.

**Passos:**
1. Em `app/tailwind.css` (`@theme`), criar tokens de texto (nomes fixos; valores iniciais):

   | Token | Valor | Uso |
   |---|---|---|
   | `text-display` | 3rem / leading 1 / bold / tracking-tighter | Títulos de seção (h1 atual) |
   | `text-title` | 1.875rem / leading 1.1 / bold | Título da gaveta, h2/h3 |
   | `text-heading` | 1.25rem / leading 1.2 / medium | Subtítulos |
   | `text-body` | 0.875rem / leading 1.4 / medium | Texto padrão |
   | `text-meta` | 0.75rem / leading 1.3 / medium | Datas, contadores, rótulos de card |
   | `text-label` | 0.75rem / uppercase / tracking-wide / medium | Rótulos em caixa alta (único tracking permitido) |

2. Substituir todos os `text-[8px]`, `text-[9px]`, `text-[10px]` e `text-[11px]` por `text-meta` (ou `text-label` se estiver em caixa alta). Para os outros `text-[Npx]`, usar o token mais próximo; se não houver um equivalente razoável, **listar no resumo em vez de criar um token novo**.
3. Títulos de ação: trocar `whitespace-nowrap`/`text-ellipsis` por `line-clamp-2` em `ActionItem.tsx:265` e no título editável (`ActionItemTitleInput.tsx`), mantendo a edição funcionando.
4. Atualizar a galeria `/ui` (`app/components/ui-sections/`) com uma seção de tipografia mostrando os 6 tokens.

**Não fazer:** trocar a fonte (PP Object Sans), as paletas OKLCH ou os temas; alterar `text-xs`/`text-sm` em massa nesta tarefa (fica para depois, quando os tokens estiverem aprovados); mudar espaçamento ou layout.

**Aceite:** nenhum `text-[` abaixo de 12px no `app/` (`grep -rn "text-\[\(8\|9\|10\|11\)px\]" app` vazio); títulos de ação aparecem em até 2 linhas no Sprint, Hoje e calendário; `/ui` mostra a escala. Prints antes/depois em 1440px e 375px no resumo.

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
