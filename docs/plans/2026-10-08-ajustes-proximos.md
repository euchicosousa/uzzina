# UZZINA — próximos ajustes (tarefas prontas para execução)

Data: 08/10/2026, revisado após a rodada T4/T8/T10. Origem: [diagnóstico geral](2026-10-08-diagnostico-geral.md), [resultado da rodada anterior](2026-10-08-ajustes-resultado.md) e decisões do proprietário.

## Como usar este documento

- **Uma tarefa por vez**, na ordem da tabela. Cada tarefa precisa da autorização do proprietário para começar; este documento não autoriza nada sozinho.
- Cada tarefa traz: objetivo, arquivos, passos, **o que NÃO fazer**, critério de aceite e verificação. Se algo necessário não estiver descrito, **pare e pergunte**. Não invente escopo: melhorias percebidas no caminho vão para o relatório final, não para o código.
- Antes de começar: leia o [AGENTS.md](../../AGENTS.md) e somente os arquivos citados na tarefa. O checkout pode ter trabalho ainda não commitado da rodada anterior (T4/T8/T10): **preserve-o**, não reverta.
- Ao terminar cada tarefa: `bun run format`, `bun run lint`, `bun run typecheck`, `bun test`, `bun run build` e, se tocar `api/`, `server/` ou dependências, `bun run test:serverless`. Depois, registre uma linha em [CURRENT](../audits/CURRENT.md) e entregue um resumo: o que mudou, o que foi verificado e o que ficou de fora. **Não fazer commit/push/deploy/SQL**: o proprietário commita depois de revisar.
- Não existe CI no GitHub (decisão do proprietário). Toda verificação é local.

## Estado

| Item | Situação |
|---|---|
| Imports `.js` das APIs; migration de leitura de ações | Commit `2cc7c45`, publicado |
| Fase 3 (constantes, rascunho único, models, utils, helpers de servidor) | Commit `35976e6`, publicado |
| Bug "Criada há cerca de 3 horas" em rascunhos | Commit `f5639ef`, publicado |
| Prettier só com `prettier-plugin-tailwindcss`; código formatado | Commits `f92d9f5`, `cc91dab`, publicados |
| T4 (dev só no staging), T8 (menus Visualizar/Ordenar/Exibir), T10 (consultas de pessoas/preferências em `models/people.ts`) | **No checkout, sem commit.** Revisados pelo Opus; login e criação de ação no staging confirmados pelo proprietário |
| T11 (menu Visualizar sem seletor indevido nem menu vazio) | **Feito pelo Opus, no checkout, sem commit.** Ver seção T11 |

## Decisões do proprietário (não reabrir)

- Manter `app/data/hooks-library.ts` (uso futuro).
- Prettier formata e ordena as classes Tailwind; o Biome só faz lint. **Não reintroduzir** `prettier-plugin-jsx-attr-sort`: ele anula o plugin do Tailwind.
- O dev local usa somente o staging. **OpenAI e Cloudinary são os mesmos da produção, por escolha**: não "corrigir" isso.
- **Descartadas:** T1 (`typecheck:api`: o `test:serverless` já detecta o erro de `.js`), T2 (CI no GitHub), T3 (smoke test), T5 (escala tipográfica) e a correção de horário de ações antigas (dados legados ficam como estão).
- Faixa de ambiente no topo do app: removida e não volta.

## Ordem das tarefas

| # | Tarefa | Modelo | Situação |
|---|---|---|---|
| T11 | Menu "Visualizar": cada grupo só aparece quando a tela permite | Opus | **Concluída** (não refazer) |
| T12 | `test:serverless` obrigatório antes de push | Opus | **Concluída** (regra no AGENTS §2 e README; frase dos menus em `/ui`) |
| T6 | Altura padrão do dia na visão de semana | — | Aguarda decisão do proprietário |
| T7 | Calendário em lista no celular | Sonnet (revisão Opus) | Aguarda avaliação do proprietário |
| T9 | Estudo de unificação de raios (com exemplos) | Sonnet | Aguarda autorização; só estudo |
| — | Vercel com projeto único; divergência de schema | Proprietário + Opus | Operação (não delegar) |

Nenhuma tarefa pronta para execução no momento: as restantes aguardam decisão do proprietário.

---

## T11 — Menu "Visualizar" (concluída pelo Opus; não refazer)

**Problema:** o menu mostrava sempre o seletor Linha/Bloco/Conteúdo, mesmo em tela que não o permitia, e podia abrir vazio (só o nome do botão) numa tela com apenas "Altura automática" no modo Conteúdo.

**Solução aplicada:** uma única função, `getVisualizeGroups(viewOptions)` em `app/components/features/ViewOptions.tsx`, decide quais grupos estão visíveis (modo de exibição; altura automática fora do Conteúdo; colunas no Conteúdo). O mesmo resultado controla o conteúdo do menu **e** a existência do botão: se nenhum grupo estiver visível, o botão "Visualizar" não é renderizado. Os separadores só aparecem entre grupos visíveis. Regra para quem mexer depois: **não decidir a visibilidade de um grupo fora dessa função.**

**Verificação:** em `tests/view-options.test.tsx`, dois testes falharam antes da correção (seletor indevido; botão sem opções) e passam depois; outro teste fixa o resultado das 4 telas que usam o menu (Sprint, Atrasadas, Calendário da home e Parceiro), com o `showOptions` copiado de cada uma, e confirma que nada muda de aparência. Na galeria `/ui`, os dois exemplos abriram como esperado. Suíte: 305 testes, lint, tipagem, formatação e build. Login no staging não foi feito pelo Opus (as telas foram cobertas pelos testes com a configuração real de cada uma).

---

## T12 — `test:serverless` obrigatório antes de push

**Contexto:** sem CI e sem a T1, a única barreira contra o erro que derrubou a IA (import relativo sem `.js` nas funções da Vercel) é `bun run test:serverless`, que monta as funções com o builder da Vercel e as carrega no Node.

**Passos:**
1. `AGENTS.md`, seção 2 ("Convenções e verificação"): acrescentar uma linha dizendo que, **antes de qualquer push**, rodar `bun run test:serverless` sempre que a mudança tocar `api/`, `server/`, `app/lib/ai-contract.ts`, qualquer arquivo importado pelas APIs ou `package.json`/`bun.lock`. Resultado esperado: 7 PASS.
2. `README.md`, seção de verificações: a mesma regra, em uma frase.
3. Galeria `/ui` (`app/components/ui-sections/ViewOptionsSection.tsx`): acrescentar no texto de descrição do `ViewOptionsComponent` uma frase explicando os três menus (Visualizar, Ordenar, Exibir) e que cada grupo e cada menu só aparecem quando a tela permite. Só texto; não mudar os exemplos.

**Não fazer:** criar scripts novos, hooks de Git ou CI; mudar `scripts/check-serverless-runtime.cjs`; mexer em `ViewOptions.tsx` ou nos testes da T11.

**Aceite:** a regra aparece no AGENTS e no README; a frase aparece em `/ui`; `bun run test:serverless` com 7 PASS registrado no relatório.

---

## T6 — Altura padrão do dia na visão de semana (aguarda decisão)

**Correção da premissa anterior:** não há defeito. O `CalendarDayCell` já usa altura automática quando `viewOptions.autoHeight` está ligado ou no modo Conteúdo; caso contrário, usa altura fixa (`h-72` no mês, `h-96` na semana) com rolagem interna. No mês, o `ActionContainer` já limita a 5 ações com expandir/recolher. A opção "Altura automática" está no menu Visualizar.

**Decisão pendente:** a semana (home e parceiro) deve abrir com "Altura automática" ligada por padrão? Se sim, a tarefa é só mudar o valor inicial nessas telas, respeitando a preferência salva do usuário. Não executar sem a decisão.

---

## T7 — Calendário em lista no celular (aguarda avaliação)

**Contexto:** `Calendar.tsx:38` e `ClientCalendar.tsx:114` usam `min-w-375` (1500px) e mostram 2 dias por tela no celular. O proprietário vai avaliar na prática antes de decidir.

**Se autorizada:** abaixo de `md`, renderizar uma agenda vertical: cabeçalho do dia (dia da semana + número, destaque para hoje), ações do dia abaixo, datas comemorativas em texto pequeno. Dias sem ação aparecem só como cabeçalho, compactos. Reutilizar `ActionContainer`/`ActionItem`. Desktop sem alteração.

**Não fazer:** mudar a grade do desktop, as consultas e os períodos, ou o DnD do desktop (no celular, a agenda pode não ter DnD; informe no relatório).

**Aceite:** a 375px não há rolagem horizontal; prints do parceiro e do portal `/dash` no celular.

---

## T9 — Estudo de unificação de raios (só estudo, aguarda autorização)

**Decisão do proprietário:** o estilo arredondado e o `squircle` **ficam**. O objetivo é só reduzir a variedade de tamanhos de raio sem mudar a cara do app.

**Contexto medido:** `rounded-full` (62 usos), `rounded-2xl` (58), `rounded-lg` (34), `rounded-xl` (31), `rounded` (22), `rounded-3xl` (12), além de `rounded-4xl` em popovers.

**Entrega (sem alterar código do app):** um documento `docs/plans/<data>-estudo-raios.md` com:
1. uma tabela "papel do elemento → raio atual(is) → raio proposto" (ex.: botões, campos, cards de ação, popovers/menus, gaveta, avatares, pílulas de status);
2. no máximo 3–4 raios propostos no total, sem mexer em `rounded-full` de avatares/pílulas nem no `squircle`;
3. prints **antes e depois** de 3 telas (home, parceiro, gaveta), produzidos com uma alteração **temporária e descartada** depois da captura, para o proprietário aprovar visualmente.

**Não fazer:** aplicar a mudança de verdade; tirar arredondamentos; mexer em cores, sombras ou espaçamentos.

---

## Operação (não delegar a um agente implementador)

- **Projeto Vercel único:** confirmar qual projeto serve `uzzina.cnvt.com.br` (os logs indicam `prj_8PN3…`; o vínculo local é `prj_sFbk…`), revincular `.vercel/project.json` e arquivar o outro. É uma ação do proprietário no painel da Vercel.
- **Divergência de schema staging × produção:** um script **somente leitura** que compara `pg_policies`, o hash de `pg_get_functiondef` e os grants nos dois bancos. Precisa de credenciais de leitura e de autorização explícita; planejar com o Opus antes.
- **Arquivos com credenciais de produção na pasta** (`.env.backup.local`, `.env.vercel-production.local`): a sugestão de movê-los para fora do projeto fica a critério do proprietário.
