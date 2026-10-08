# UZZINA — diagnóstico geral e plano de melhoria

Data: 08/10/2026. Autor: análise feita com o app rodando localmente (logado, dados de produção, somente leitura) e leitura do código.
Público: o próximo agente que vai executar o trabalho. Leia [AGENTS.md](../../AGENTS.md) antes; este documento **não** autoriza mudanças sozinho. Cada fase abaixo deve ser aprovada pelo proprietário antes de começar.

---

## 0. Resumo em uma página

O app **não está inchado de forma grave**. São cerca de 33 mil linhas de TS/TSX em `app/` + `api/`. Os testes (267), o lint e a tipagem passam. Os problemas reais não estão na quantidade de código, e sim em três lugares:

1. **Não existe barreira entre o código e a produção.** Não há CI, o push em `main` publica direto e o `.env` local aponta para o banco de **produção**. Os dois erros de hoje (RLS ao criar ação e IA fora do ar) passaram por esses buracos; o da IA já foi corrigido em produção.
2. **As mesmas regras de negócio estão espalhadas em vários pontos.** Há 6 lugares que criam um rascunho de ação, 3 camadas de acesso a dados, 16 casts `as unknown as` e cerca de 2.000 linhas de dados mortos em `CONSTANTS.ts`.
3. **O visual suíço é forte nos títulos e na grade de parceiros, mas se perde nas telas densas.** 85% do texto usa `text-xs`/`text-sm`, há textos de 8–10px, mais de 13 tamanhos avulsos, 6 tipos de arredondamento e calendários que cortam os títulos em 4–6 letras.

Ordem recomendada: **Fase 1 (desbloqueio)** → **Fase 2 (barreiras contra erro)** → **Fase 3 (enxugar código)** → **Fase 4 (visual)**. As fases 1 e 2 são as que mais evitam dor de cabeça.

---

## 1. Estado verificado nesta análise

| Item | Resultado |
|---|---|
| `bun test` | 267 pass, 0 fail |
| `bun run lint` / `typecheck` | Passam |
| APIs publicadas (`/api/ai`, `/api/dash-*`, `/api/review`) | Rechecadas após o commit `2cc7c45`: `/api/ai` GET 405 / POST sem Bearer 401; portal 401/403/405; nenhum `FUNCTION_INVOCATION_FAILED`. A correção de imports está no ar e o proprietário confirmou o uso da IA |
| Handler local `/api/ai` (Vite) | Carrega; responde 401/400 corretamente |
| Console do navegador (home, parceiro, gaveta) | Sem erros |
| Checkout | A correção e a migration `20261008164615_action_row_read_authorization.sql` foram commitadas em `2cc7c45`. A aplicação da migration em produção não foi verificada nesta análise |
| `.env` local | Aponta para Supabase **produção** (`dfepmjcozszswocwvdpq`) |
| CI (`.github/workflows`) | **Não existe** |
| Vercel | Os logs indicam o projeto `prj_8PN3…`; o vínculo local é `prj_sFbk…` (sem Git). Há dois projetos |
| `.claude/launch.json` | Criado nesta análise (dev server na 5173); não é código de runtime |

---

## 2. Fase 1 — Desbloqueio (precisa de aprovação explícita do proprietário)

Objetivo: voltar a criar ações (a IA já foi resolvida).

1. ~~Commit e push da correção de imports~~: feito em `2cc7c45`, e a IA publicada voltou a funcionar.
2. Se ainda não foi feito, aplicar **somente** `supabase/migrations/20261008164615_action_row_read_authorization.sql` em produção, pelo SQL Editor ou com acesso autorizado. Não usar `db push`/`repair`/`reset`.
3. Verificar:
   - `POST /api/ai` sem Bearer → 401 (não 500);
   - criar e duplicar uma ação no site publicado e localmente;
   - gerar uma legenda.
4. Registrar o resultado em `docs/audits/CURRENT.md` e no manifest `supabase/rollouts/action-read-fix-manifest.json`.

Critério de aceite: criação, duplicação e IA funcionando no site publicado.

---

## 3. Fase 2 — Barreiras para evitar erros (maior retorno)

Cada item abaixo teria impedido pelo menos um dos incidentes de 08/10.

### 2.1 CI no GitHub (obrigatório)
Criar `.github/workflows/ci.yml` em push/PR com `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`, `bun run typecheck:api` (item 2.2), `bun test`, `bun run build` e `bun run test:serverless`. Depois, ativar a proteção de branch em `main` (decisão do proprietário).

### 2.2 Tipagem das funções serverless com resolução do Node
Causa do erro da IA: `tsconfig.json` usa `moduleResolution: "bundler"`, que aceita import relativo sem `.js`, mas o Node publicado não aceita.
**Validado nesta análise:** um `tsconfig.api.json` com `module/moduleResolution: "NodeNext"` incluindo `api/**` e `server/**` acusa `TS2835` exatamente no import antigo `../app/lib/ai-contract`.
- Criar `tsconfig.api.json` (lib ES2022, types node, strict, noEmit, NodeNext).
- Adicionar o script `"typecheck:api": "tsc -p tsconfig.api.json"`.
- Ajustar também os `import type … from "../types/database"` para `../types/database.js` (o NodeNext exige) e corrigir o `any` implícito que aparece em `api/dash-action.ts:47`.

### 2.3 Ambiente local não pode usar produção por padrão
Hoje `bun run dev` lê o `.env` com o Supabase de produção: qualquer teste local escreve dados reais, e uma policy quebrada em produção quebra também o ambiente local, o que dificulta isolar o erro.
- Fazer o modo `development` carregar o staging (`.env.staging.local`) por padrão.
- Criar um script explícito, por exemplo `dev:prod`, que exige uma flag para apontar para produção e mostra um aviso visível na interface (faixa "PRODUÇÃO").
- Atualizar o README. A decisão de qual é o padrão é do proprietário.

### 2.4 Detecção de divergência de schema entre staging e produção
A produção não tem histórico de migrations, e por isso uma migration "aplicada em staging" pode nunca chegar à produção sem ninguém perceber.
- Criar o script `scripts/check-schema-drift` que roda uma consulta **somente leitura** (`pg_policies`, `pg_proc` com hash da definição, grants) nos dois bancos e compara.
- Rodar antes e depois de cada publicação; o resultado vai no manifest do rollout.
- Médio prazo: estabelecer uma linha de base do histórico de migrations em produção (decisão a planejar com cuidado; ver AGENTS §Banco).

### 2.5 Smoke test pós-deploy
Criar o script `scripts/smoke-production` sem credenciais:
- `GET /api/ai` → 405;
- `POST /api/ai` sem Bearer → 401;
- guardas de `/api/dash-*` → 401/403;
- `/` → 200.

Qualquer `FUNCTION_INVOCATION_FAILED` reprova. Ele pode rodar no CI contra o deploy de preview da Vercel.

### 2.6 Um único projeto Vercel
Confirmar qual projeto serve `uzzina.cnvt.com.br`, revincular o `.vercel/project.json` a ele e arquivar o outro. Fonte de confusão já registrada no CURRENT.

### 2.7 Organizar testes e scripts
- Renomear `tests/entrega1..4.test.ts` pelo comportamento que testam; hoje não dá para saber o que quebrou pelo nome.
- `scripts/` tem 15 `check-*-browser.cjs` avulsos: avaliar consolidá-los num runner único (Playwright) ou removê-los se foram de uso pontual.

---

## 4. Fase 3 — Enxugar o código (sem mudar comportamento)

Ordem por retorno/risco. Cada item: refatoração com os testes existentes passando, mais um teste novo quando tocar em regra.

| # | Problema | Onde | Proposta |
|---|---|---|---|
| 3.1 | ~2.000 linhas de `HOOKS` sem nenhum uso (o tree-shaking já tira do bundle, mas atrapalha a leitura) | `app/lib/CONSTANTS.ts:1033` em diante | Remover ou mover para `data/` se o proprietário quiser preservar para uso futuro (biblioteca de ganchos) |
| 3.2 | `PALLETE` com ~770 linhas misturadas às constantes de domínio | `app/lib/CONSTANTS.ts:263` | Mover para `app/lib/palettes.ts` |
| 3.3 | **6 pontos** montam o rascunho de "Nova ação" com regras diferentes de parceiro e responsáveis, cada um com `as unknown as Action` | `AppBar.tsx:107`, `app.tsx:174` (atalho ⌘⌥A), `PartnersBoard.tsx:94`, `CategoriesBoard.tsx:88`, `PartnerCalendarBoard.tsx:62`, `HomeCalendarView.tsx:110` | Criar uma única `openNewActionDraft({partners?, date?, responsibles?})` (hook ou função em `factory.ts`) que retorna `Action` tipado. A regra "parceiro da rota ou filtro único" deve existir uma vez só. Tipar `getCleanAction` para eliminar os casts |
| 3.4 | Rascunho marcado como existente por `created_at` preenchido no cliente; cor padrão comparada por literais `"#666666"`/`"#666"` | `ActionFormDrawer.tsx:68-95` | Campo explícito `isDraft`/ausência de `id`; usar a constante `DEFAULT_ACTION_COLOR` |
| 3.5 | Acesso a dados em 3 camadas: `app/models/`, `app/lib/supabase.queries.ts`/`supabase.mutations.ts` e chamadas `.from()` dentro de componentes | `Header.tsx`, `GlobalSearchCommand.tsx`, `ObservationsTab.tsx`, `profile.tsx`, `admin/*` | Consolidar em `app/models/` por entidade; componentes só usam hooks/queries |
| 3.6 | Utilitários espalhados | `app/lib/utils.ts` (1 linha), `uzzina-utils.ts`, `helpers.tsx`, `app/utils/*` (não citado no AGENTS) | Uma pasta só (`app/utils/`), com `cn` mantido onde o AGENTS exige; atualizar o AGENTS |
| 3.7 | Arquivos grandes demais | `profile.tsx` (973 linhas, 16 `useState`), `ActionFormDrawer.tsx` (892), `admin/partner/$slug.tsx` (612), `useAppTheme.ts` (509) | Dividir por seção (perfil: dados, tema, preferências); na gaveta, extrair a lógica de IA (`~linha 300-420`) para um hook `useActionAI` |
| 3.8 | 8 handlers em `api/` repetem a criação do client Supabase, a leitura do Bearer e a verificação de pessoa ativa | `api/*.ts` | Criar `server/supabase-admin.ts` + `server/auth.ts` (com imports `.js`), cobertos pelo `typecheck:api` |
| 3.9 | Dependências sem uso | `prettier-plugin-jsx-attr-sort`, `prettier-plugin-tailwindcss` (o projeto usa Biome) | Remover. As extensões do Tiptap marcadas como sem import direto (`extension-link`, `extension-bubble-menu`) devem ser verificadas antes, porque podem vir pelo starter-kit |
| 3.10 | Bundle principal de 970 kB, RichTextEditor com 514 kB | `dist/assets` | Analisar com um visualizer; carregar o editor só quando a gaveta abrir (provavelmente já é lazy; confirmar o que mantém o `index` grande) |

Não remover: Sprint, agrupamentos, estados `done`/`finished`, coordenador de salvamento e conflitos, `resetQuerySession`. São contratos do AGENTS.

---

## 5. Fase 4 — Visual: o estilo suíço possível num sistema denso

### O que já funciona (preservar)
- **Títulos de seção grandes** ("Sprint", "Hoje", "Essa Semana", "Parceiros") e o **título enorme na gaveta**: hierarquia clara, bem suíça.
- **Grade de parceiros** com blocos de cor sólida e siglas empilhadas: o melhor momento visual do app.
- O fundo de **grade em linhas finas** no login e o calendário de conteúdo do parceiro (cards de capa) com cara editorial.

### Onde o estilo quebra (observado nas telas)
1. **Escala tipográfica sem meio-termo.** Títulos de ~5xl convivem com 85% do texto em `xs`/`sm` (281 de ~330 usos) e há 28 usos de 8–11px (`PhaseStationBadges`, `UAvatar`, `profile`, `media/*`). O estilo suíço usa contraste de tamanho, mas com **poucos degraus bem definidos**. Hoje temos o "gigante" e o "minúsculo".
2. **Títulos truncados.** Na Sprint ("Coisas qu…", "Pedra, pa…") e principalmente no calendário semanal da home, onde os títulos ficam com 4–6 letras ("Sabe o…", "Pe…"). Um título truncado não comunica. No estilo suíço, **o texto quebra em linha**, ele não some.
3. **Rolagem dentro de rolagem:** cada dia do calendário semanal tem altura fixa e rola por dentro (o conteúdo aparece cortado, "Em cas…").
4. **Espaço vazio sem função no mobile:** cerca de 200px entre "Sprint" e o conteúdo; a barra de ferramentas da seção "Hoje" fica escondida atrás da navegação inferior.
5. **Calendário do parceiro no mobile** tem largura mínima de 1500px (`min-w-375` em `Calendar.tsx`/`ClientCalendar.tsx`): são 4 telas de rolagem horizontal, mostrando 2 dias por vez.
6. **Barras de ícones sem rótulo:** 13 botões de ícone na barra do parceiro (3 linhas no mobile) e 8 no rodapé da gaveta. Isso prejudica a descoberta e a acessibilidade.
7. **Excesso de formas:** 6 arredondamentos diferentes (`full`, `2xl`, `xl`, `lg`, `3xl`, padrão), cards com sombra e cápsulas. O estilo suíço pede retângulos, filetes (linhas) e alinhamento. O app hoje mistura isso com a estética de "app arredondado".
8. **Uppercase com 6 trackings diferentes** (`wide`, `wider`, `widest`, `[1px]`, `[2px]`…).

### Propostas (em ordem de impacto)
- **Escala tipográfica fechada em 5–6 degraus** como tokens (`--text-display`, `--text-title`, `--text-heading`, `--text-body`, `--text-meta`, `--text-label`), com mínimo de **12px** e o resto proibido no lint (ver abaixo). Peso: só `medium` para texto e `bold` para display; eliminar `semibold` e `black`, que são variações demais para um sistema suíço.
- **Título de ação em até 2 linhas** (`line-clamp-2`) em vez de `truncate`, nos cards de Sprint, Hoje e calendário.
- **Calendário semanal da home:** dias com altura livre (sem rolagem interna) ou no máximo 2 linhas por item; com muitas ações, mostrar "+N" que abre o dia.
- **Mobile:** substituir a grade de 7 colunas por uma **lista de agenda** (dia como cabeçalho, ações abaixo) quando a largura for menor que `md`; reduzir o espaço antes dos títulos de seção; dar `padding-bottom` às seções igual à altura da navegação inferior.
- **Barras de ferramentas:** agrupar visualização, ordenação e filtros em 3 menus rotulados ("Visualizar", "Ordenar", "Filtrar"), mantendo os ícones nos menus. No desktop, os grupos mais usados podem continuar visíveis com tooltip.
- **Forma:** padronizar em 2 raios (`rounded-md` para controles, `rounded-full` só para avatares e o botão principal) e usar **filetes de 1px** (`border-border`) para separar regiões no lugar de sombra. Isso já aparece nas seções da home e só falta aplicar ao resto.
- **Uppercase:** um token só (`label`: 11–12px, `tracking-wide`, `medium`).
- **Grade:** a grade de 12 colunas que aparece no login pode virar a base explícita das páginas (container com colunas e margens fixas), alinhando títulos, barras e conteúdo à mesma linha esquerda.

Ferramenta para manter o padrão: depois de definir os tokens, uma verificação simples (script no CI ou regra de lint) que falhe com `text-[Npx]`, `tracking-[…]` e raios fora da lista.

Tudo isso deve ser feito pelos primitivos Prism e documentado em `/ui` (AGENTS §5). Não mudar as paletas OKLCH nem os temas.

---

## 6. Sequência sugerida de tarefas para o próximo agente

Uma tarefa por vez, com aprovação do proprietário antes de cada uma:

1. Fase 1 completa (desbloqueio em produção).
2. 2.2 `typecheck:api` + 2.1 CI (juntos; pequeno e alto retorno).
3. 2.3 Ambiente local em staging por padrão.
4. 2.5 Smoke test + 2.6 projeto Vercel único.
5. 2.4 Detecção de divergência de schema.
6. 3.1–3.4 (constantes e criação de rascunho unificada).
7. Tokens tipográficos + `line-clamp` nos títulos (primeira entrega visual, baixo risco).
8. Agenda mobile do calendário.
9. 3.5–3.8 (camada de dados, arquivos grandes, helpers das APIs).
10. Barras de ferramentas rotuladas e padronização de forma.

Para cada tarefa, seguir a definição de pronto do AGENTS: teste que falha pelo defeito, lint, typecheck e build quando afetar o runtime, e CURRENT atualizado.

## 7. Limites desta análise

- Telas observadas: home (Sprint, Hoje, Semana, Parceiros), calendário do parceiro e gaveta de uma ação existente, em desktop 1440px e mobile 375px (emulado no Chromium). Não foram vistos: admin, perfil, portal `/dash`, revisão pública e Leads.
- Nenhum dado foi criado ou alterado. A gaveta foi aberta e fechada sem edição.
- A policy de produção não foi consultada diretamente (acesso ao banco de produção negado nesta sessão). O estado "não aplicada" vem do manifest e do erro reproduzido pelo proprietário.
- Safari e iPhone físico não foram testados.
