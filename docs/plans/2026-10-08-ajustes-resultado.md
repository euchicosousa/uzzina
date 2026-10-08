# UZZINA — resultado dos ajustes (T4, T8, T10) e decisões do proprietário

Data: 08/10/2026. Origem: [ajustes-proximos](2026-10-08-ajustes-proximos.md). Estado: **tudo no checkout, sem commit, push, deploy ou SQL.** Nenhum dado foi gravado em banco.

## Decisões do proprietário (para o Opus incorporar ao documento de tarefas)

| Tarefa | Decisão |
|---|---|
| T1 | Não foi mencionada pelo proprietário nesta rodada; **não executada**. Aguarda decisão. |
| T2 | **Não fazer.** Prefere que tudo seja verificado localmente, sem CI no GitHub. |
| T3 | **Descartada** pelo proprietário ("esquece"). Remover do documento de tarefas. |
| T4 | **Autorizada e concluída**, exceto a verificação de login (ver abaixo). O proprietário mandou **remover a faixa de ambiente** (quebrava o layout e deixou de ser necessária) e **simplificar os arquivos de env**. |
| T5 | **Não fazer.** |
| T6 | **Não fazer por ora.** Premissa do documento está errada (ver "T6: premissa incorreta"). |
| T7 | Não executada; o proprietário vai avaliar na prática. |
| T8 | **Autorizada** e executada. Se não gostar, o proprietário desfaz. |
| T9 | **Não fazer.** Quer ver exemplos reais para aprovar antes; provavelmente reduzir, **sem mudar o estilo**: quer os arredondamentos e gosta do `squircle`. O que pode ser feito é **estudar a unificação de alguns tamanhos** de raio. |
| T10 | **Autorizada** e executada (com ajuste de escopo, ver abaixo). |
| Operação | Projeto Vercel único e divergência staging × produção: o proprietário pediu explicação (respondida em chat); sem ação ainda. |
| Bug legado de horário | **Fica como está**: ações antigas com horário local gravado não serão corrigidas (já não faz sentido mudar). Remover do backlog. |

## Verificação final

`bun run format:check`, `bun run lint`, `bun run typecheck` passam; `bun test`: **300 testes, 0 falhas** (base: 290; os 4 testes da faixa foram removidos junto com ela); `bun run build` passa; `bun --no-env-file test` também passa (testes não dependem do `.env`). Navegador local (somente leitura, com o servidor antigo ainda em produção): os menus novos abrem e marcam a opção.

## T4 — dev somente no staging (concluído)

Estado final:
- `package.json`: `"dev": "vite --mode staging"`. Verificado pelo caminho do Bun (`bun run dev` em porta temporária): o host servido é `zacrrtilppvekiyoybzn.supabase.co` e as variáveis do Cloudinary estão presentes.
- **Faixa de ambiente removida** por pedido do proprietário (quebrava o app; sem `.env` de produção na pasta deixa de ser necessária). Apagados `DevEnvironmentBanner.tsx`, `app/lib/dev-environment.ts`, `tests/dev-environment.test.ts` e o uso em `app/routes/app.tsx`. A proteção contra regressão passou a ser só a regra documentada: não ter `.env` com produção na pasta (o Bun o pré-carregaria sobre o modo).
- O proprietário executou o comando que renomeava `.env` e acrescentava as variáveis do Cloudinary (o sistema de permissões bloqueou que eu o fizesse). As variáveis do Cloudinary já existiam em `.env.staging.local`, então o comando as duplicou; removi as duas linhas repetidas.
- **Conferência de env (somente nomes, domínios e hashes; nenhum valor impresso):** `.env.staging.local` aponta para o staging e tem chaves próprias, **diferentes** das de produção (URL, anon, publishable e service role). Não há mistura de bancos. Valores **idênticos entre staging e produção**: `OPENAI_API_KEY` (mesma conta OpenAI: o consumo de IA do dev é cobrado na mesma conta) e as duas variáveis públicas do Cloudinary (uploads feitos no dev vão para o Cloudinary real, que não tem ambiente de teste).
- **Simplificação:** `.env.production.local` foi **apagado**: seus 5 valores eram idênticos aos de `.env.vercel-production.local` (conferido por hash antes de apagar) e o `bun run build` passa sem ele. Restam 4 arquivos de env na pasta: `.env.staging.local` (tudo do dev), `.env.staging-users.local` (contas fictícias), `.env.vercel-production.local` (cópia das variáveis de produção para importar na Vercel) e `.env.backup.local` (conexão de backup). README e AGENTS reescritos de acordo (tabela de 4 linhas).
- Sugestão não executada (decisão do proprietário): mover `.env.backup.local` e `.env.vercel-production.local`, que contêm credenciais de produção, para fora da pasta do projeto (por exemplo junto de `Documents/UZZINA-backups`). Os scripts de staging só leem `.env.staging.local` e `.env.staging-users.local`.
- Não verificado: login com conta de `.env.staging-users.local` e criação de uma ação de teste no staging (exigiria digitar senhas fictícias). O servidor de dev que o proprietário já tinha aberto (porta 5173) precisa ser reiniciado.
- `.claude/launch.json` (não versionado) inicia o dev em modo staging.

## T8 — barra de ferramentas com rótulos

`app/components/features/ViewOptions.tsx` reescrito mantendo tipos, `useViewOptions` e o formato das preferências:
- Três menus (`PrismMenu*`): **Visualizar** (modo Linha/Bloco/Conteúdo; "Altura automática" fora do modo Conteúdo; colunas 4/6/7 só no modo Conteúdo), **Ordenar** (Data/Fase; Crescente/Decrescente), **Exibir** (Responsáveis/Prioridade/Categoria/Parceiro). Cada opção com ícone e texto; seleção marcada com ✓.
- Filtros (Categoria, Fases) inalterados. O ramo `filter_responsible` continua sem componente (já era assim).
- Celular: botões com `px-2` e sem chevron abaixo de `sm`; a 375px os três ficam em 1 linha (medido: 261px de 269px disponíveis, mesma coordenada vertical).
- `tests/view-options.test.tsx` (5 testes, com `user-event`; polyfill de `CSS.escape` apenas no teste).
- A seção `/ui` (`ViewOptionsSection`) usa o próprio componente e acompanha a mudança; **não há texto novo** explicando os menus (pendência menor).
- Não feito: exposição do grupo "Visualizar" com tooltip em `lg` (era opcional); foco por teclado verificado só via testes de teclado do React Aria nos menus (não percorri manualmente).

## T10 — duplicações de consultas (escopo ajustado)

O documento afirmava que `fetchPartnerBySlug`/`fetchPeople` duplicavam funções de `models/`. Na leitura do código:
- `fetchPartnerBySlug` (campos reduzidos, página pública) **não tinha nenhum uso** → removido.
- `fetchPeople`/`fetchAllPeople` não duplicavam `getPersonByUserId` (consultas diferentes). Mantive as duas exportações (usadas em 12 arquivos e em `scripts/check-operations-browser.cjs`), mas agora delegam a `getVisiblePeople`/`getAllPeople` em `app/models/people.ts`.
- `update_my_preferences` virou `updateMyPreferences` em `app/models/people.ts`, usada por `profile.tsx` **e** por `usePreferencePersistence.ts` (as duas chamadas repetiam a mesma validação).
- `tests/people-model.test.ts` (4 testes).
- Observação: `fetchReviewActions` e `fetchFlowActions` em `supabase.queries.ts` também têm 0 usos; **não removi** (fora do escopo). `QUERY_KEYS` e `supabase.mutations.ts` intocados.

## T6: premissa incorreta (para o Opus corrigir)

O proprietário apontou que o documento leu errado. Confirmado no código:
- A altura fixa (`h-72` no mês/compacto, `h-96` na semana) com rolagem interna é só o **padrão**; `CalendarDayCell.tsx` usa `isAutoHeight = viewOptions.autoHeight || viewOptions.variant === VARIANT.content` e, quando verdadeiro, remove a altura fixa. A opção "Altura automática" já existe na barra (agora no menu Visualizar).
- No modo compacto (mês), `ActionContainer` já limita a `MAX_ACTIONS = 5` e oferece um botão de expandir/recolher.
Logo, "dia sem conteúdo escondido" não é um defeito de falta de opção; qualquer mudança deve partir desse comportamento existente e de uma decisão do proprietário (ex.: mudar o padrão da semana para altura automática). Nada foi alterado.

## Itens não autorizados ou pendentes, para análise do Opus

1. **T1** (`typecheck:api`): decisão pendente (sem CI, a checagem local continua sendo a única barreira contra o erro de `.js`; `bun run test:serverless` já cobre os 7 handlers).
2. **T3**: descartada pelo proprietário.
3. **T5, T6, T7, T9**: não executadas (decisões acima). Para T9: estudar unificação de raios mantendo `squircle` e arredondamentos; apresentar exemplos reais antes de qualquer mudança.
4. **Operação**: Vercel (projeto único) e divergência de schema staging × produção seguem como ações do proprietário/Opus.
5. **T4**: falta só a verificação de login/criação de ação no staging (proprietário, após reiniciar o dev). Avaliar a sugestão de mover os dois arquivos de env com credenciais de produção para fora da pasta.
6. `docs/plans/2026-10-08-ajustes-proximos.md` ainda lista T2/T5/T6/T9 e o bug de horário como tarefas; atualizar conforme as decisões acima.
