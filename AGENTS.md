# UZZINA — guia para agentes

## Continuidade e escopo

Comece por [CURRENT.md](docs/audits/CURRENT.md), depois leia somente os arquivos e dependências da tarefa autorizada. Consulte relatórios anteriores apenas para resolver uma divergência específica. Ao terminar, atualize CURRENT com resultado, verificação e pendências reais; detalhes de operação ficam no documento correspondente. Ideias de produto registradas não autorizam implementação.

Antes de editar, confira o estado do Git e preserve mudanças externas. Um executor escreve no checkout por vez. Diferencie código preparado, SQL aplicado, teste local, staging e produção; um push não confirma deploy Ready.

## 1. Stack e estrutura

UZZINA é a aplicação existente de gestão de ações da agência CNVT: React, TanStack Router em SPA, TanStack Query, Supabase, Tailwind CSS v4, Prism/React Aria, Tiptap, Cloudinary e OpenAI. Vercel executa o frontend e as APIs.

| Caminho | Responsabilidade |
|---|---|
| `app/routes/` | Rotas; `app/routeTree.gen.ts` é gerado |
| `app/components/prism/` | Primitivos do design system |
| `app/components/uzzina/` | Componentes reutilizáveis de alto nível |
| `app/components/features/` | Fluxos de negócio, incluindo gaveta e upload |
| `app/components/layout/`, `ui-sections/` | Layout e galeria `/ui` |
| `app/hooks/`, `app/lib/` | Estado, cache, preferências e contratos compartilhados; paletas em `lib/palettes.ts`, variáveis CSS em `lib/palette-vars.ts`, rascunho de tema personalizado em `lib/custom-theme.ts` |
| `app/utils/` | Utilitários puros (barrel `~/utils`, `uzzina-utils`, `factory`); `cn` permanece em `~/lib/utils` |
| `app/data/` | Dados preservados sem uso pelo app (`hooks-library.ts`) |
| `app/models/`, `app/services/` | Consultas por entidade e clientes de API |
| `api/`, `server/` | Handlers Vercel, sessão e adaptador local; `server/supabase-admin.ts` (config/cliente service-role) e `server/auth.ts` (token Bearer) são compartilhados pelos handlers de portal/revisão/contas |
| `supabase/`, `tests/`, `scripts/` | Contratos do banco e verificações |

## 2. Convenções e verificação

- Código, arquivos e comentários técnicos novos em inglês; interface em português brasileiro.
- TypeScript estrito: use `unknown` com validação para dados dinâmicos; não introduza `any` nem assertions de não-nulo.
- Use a estrutura existente para corrigir o comportamento; arquitetura adicional exige uma necessidade concreta.
- Correções funcionais precisam de teste que falhe pelo defeito no código real. Controle a fronteira externa necessária; funções copiadas para o teste não comprovam a implementação.
- Execute testes pertinentes, `bun run format`, `bun run lint` e `bun run typecheck`; build quando a mudança afetar execução/publicação. Formatação/ordem de classes Tailwind: Prettier com apenas `prettier-plugin-tailwindcss` (único plugin de parser; outro plugin anula a ordenação). Biome só faz lint (formatter desligado). Não há CI: antes de qualquer push que toque `api/`, `server/`, `app/lib/ai-contract.ts`, arquivos importados pelas APIs ou `package.json`/`bun.lock`, rode `bun run test:serverless` (esperado: 7 PASS). Para documentação isolada, confira referências e diff, sem criar testes que apenas repetem texto.
- HTTP controlado no navegador verifica a interface, mas não certifica o banco/provedor. Inspeção textual de SQL não comprova autorização real. Registre esses limites.

## 3. Contratos de funcionamento

### Equipe, clientes e revisão pública

- `/app` usa Supabase Auth. `app/routes/app.tsx` acompanha getSession/onAuthStateChange e carrega `get_app_bootstrap`. Preserve o singleton em `app/lib/supabase.client.ts` para o refresh de sessão.
- `/dash` usa `/api/dash-auth`, sessão opaca em `dash_sessions` e cookie HttpOnly, separado do Auth da equipe. `/api/dash-data` autoriza leitura; `/api/dash-action` autoriza comentários públicos/anexos. Autor e audiência vêm do servidor; mutações exigem Origin válido. `app/services/dash-client.ts` não acessa diretamente o SDK do banco.
- `/dash/review/$slug?r=token` é público por token. `/api/review` verifica parceiro, expiração e revogação; IDs da URL não autorizam acesso. O layout limpa sessão/cache anterior antes de montar a revisão sem cancelar sua consulta inicial.
- `Content` é compartilhado com portal/revisão: renderize sem providers privados; monte consultas da equipe somente quando o campo e a identidade precisarem delas.
- PATCH administrativo de contas usa `admin_update_client_account`; edição administrativa de pessoas usa `admin_update_person`. Preserve autorização no servidor/banco, além da interface.
- Partners são os clientes comerciais da agência; clients são suas contas externas. O formulário de Leads está no repositório separado `/Users/euchicosousa/vercel/lead`: POST/PATCH por `/api/lead`, cookie HttpOnly/HMAC por lead, Origin exato, schema/limites e DML no servidor. Não reintroduzir acesso anônimo direto à tabela.

### Ações, identidade e cache

- Ações pertencem a parceiros. Preserve a data de execução, responsáveis múltiplos e os estados distintos Feito (`done`) e Concluído (`finished`). Conclusão pertence à ação inteira. Sprint e agrupamentos atuais não são removidos por uma limpeza técnica.
- A policy SELECT de ações deve autorizar pelos campos da própria linha; não consultar a ação por ID em uma função STABLE durante INSERT RETURNING. Criação/duplicação precisam devolver a versão canônica sem ampliar escopo de membros.
- Contexto operacional: `getOperationalPartners` e `QUERY_KEYS.operationalPartners(userId,isAdmin)` excluem arquivados. Administração: `getAllPartners`/`QUERY_KEYS.adminPartners()` preservam arquivados. Invalidar `["partners"]` alcança ambos; não apagar suas ações.
- Home/Hoje/cabeçalho consultam parceiros do escopo e descartam ações exclusivamente de parceiros ocultos. Endpoints do portal aceitam parceiros ativos vinculados à conta.
- Rascunho de "Nova ação": todos os pontos usam `createActionDraft` e `resolveDraftPartners` (`app/utils/factory.ts`); a gaveta identifica rascunho pela ausência de `id`. Componentes e rotas não chamam `.from()` diretamente: use `app/models/` (`actions`, `partners`, `people`).
- Editor da equipe: `useActionPanels` controla até duas entradas independentes, `primaryAction` e `secondaryAction`; `ActionDrawerPanel` mantém ambos os formulários montados: com duas ações e janela de pelo menos1600px (2×768px+64px de overlay), exibe principal à esquerda e secundária à direita, grupo à direita; abaixo disso usa abas. Cada painel conserva largura672px/768px por aba, sem alterar o limiar ao alternar. Resize preserva identidade/edição; foco ou ponteiro no painel define a ação ativa. Instagram usa container queries do painel para compor imagem/texto. Abertura comum usa `setPrimaryAction`; somente resultados de ações e o comando Criar ação da busca oferecem secundária por Shift+clique/Enter/Espaço. Sem nenhuma aberta, Shift usa principal; ação já aberta apenas recebe foco. Fechar principal não promove secundária. X fecha sua ação; somente overlay/Escape fecham todas após validar ambas as guardas; não há botão de fechamento conjunto. Escape consumido pelo ProseMirror/Tiptap ou por overlays internos é respeitado. Formulário recebe `initialAction`, conserva identidade ao ganhar ID do banco, e salvar atua só no formulário ativo. Espaço digitado na busca continua texto antes de navegar pelos resultados. Reset de sessão limpa ambas e invalida operações antigas. Comando Criar ação aparece com busca vazia ou pelo nome e usa createActionDraft/resolveDraftPartners com identidade e contexto da rota/filtros operacionais, sem usar a seleção exclusiva da busca nem gravar ao abrir. Atalho de criação existente permanece na principal; terminologia em [GLOSSARY](GLOSSARY.md).
- Busca global: controles ficam no rodapé, sem rótulo visual adicional. Filtro de parceiros pertence somente à abertura da busca. Inicia com o parceiro da rota `/app/partner/$slug`, se disponível; nas outras páginas, vazio representa todos os parceiros operacionais disponíveis. Fechar/reabrir reinicia consulta e seleção. `PartnersCombobox.allowAll` habilita Todos os parceiros e seleção múltipla com popover aberto; Shift mantém seleção exclusiva. Consumidores sem allowAll preservam comportamento anterior. `searchActionsByTitle` em `app/models/actions.ts` intersecta selectedPartnerSlugs com partnerSlugs disponíveis e usa overlaps (qualquer selecionado), sem contains adicional da rota; escopo efetivo vazio não consulta. Incluir arquivadas inicia desligado em cada abertura: searchActionsByTitle aplica archived=false por padrão e omite essa restrição somente com includeArchived=true, sempre dentro dos parceiros disponíveis/selecionados. Filtro e popover deste uso não acrescentam ring sobre borda; foco por teclado usa fundo. Respostas de consulta anterior/abertura anterior são descartadas. Esse filtro não altera rota, calendário nem atribuição de parceiros a rascunhos.
- Listas usam `QUERY_KEYS.actions.list` com identidade, papel, parceiros e período/regra de atraso. Criação/duplicação/edição entram após confirmação; rascunhos ficam na gaveta. Preview de arraste pertence à operação. Não restaurar snapshots completos após uma falha antiga.
- Atualização de lista exige escopo conhecido e versão canônica; escopo desconhecido é invalidado. Comparação de conflitos preserva o controle de versão no coordenador; data/rótulos/nomes são formatados, HTML sanitizado e legenda literal.
- Gaveta de ação, aba Essencial: React Aria FocusScope/useFocusManager gerencia o percurso Título → Descrição → Parceiros → Fase → Categoria → Cor, quando disponível → Criar/Atualizar. Tab/Shift+Tab são capturados localmente antes dos atalhos de lista/tabela do editor; portais, calendários, seletores e diálogos mantêm seu teclado próprio. Alt+F10 alterna para todos os controles; o aviso inferior está oculto a pedido do proprietário. Preserve o autofocus do título sem refocar a cada salvamento, retorno de foco ao fechar por restauração local no unmount; não reativar restoreFocus no FocusScope da gaveta, pois seu handler no document desvia o último Tab para a página quando há um botão de abertura. Após Criar/Atualizar, Tab segue para Essencial → Instagram, quando disponível → Observações → Fechar → Título; Shift+Tab da primeira aba volta ao botão principal. Abas indicam foco com borda superior de2px na cor primary, transparente fora do foco. Não adicionar contenção global aos overlays. RichTextEditor usa Toolbar/Button do React Aria: setas entre comandos e Tab da barra para o texto; Alt+Shift+F10 acessa a barra principal e Alt+Shift+F9 a barra contextual quando visível. A barra contextual fica fora do Tab comum. Não capturar esses eventos como navegação principal da gaveta.
- Notificações: `/app/notifications` e o sino compartilham `useNotifications(limit)`; a chave é `QUERY_KEYS.notifications(userId)` + limite (invalidar o prefixo alcança ambos). Página cheia oferece "Carregar anteriores"; ação inacessível mostra aviso na página.
- Chaves privadas incluem identidade/audiência. Prefixos gerais servem para invalidação. `resetQuerySession` limpa queries/mutations e avança a geração; callbacks antigos ignoram resultados. Providers remontam por identidade; bootstrap verifica geração e ID retornado.
- Lote/duplicação conferem continuidade da sessão antes da próxima escrita. Limpar cache não desfaz uma escrita já enviada. Sessão do portal e token de revisão têm chaves separadas.

### Preferências e visual

- Minha Conta (`/app/profile`) limita sua altura ao contêiner rolável por `useFillScrollViewport`, também reutilizado pela página Hoje. As duas colunas vão até o fim da janela, com rolagem independente e `AppBarSpacer` somente no final de cada região; Preferências não tem borda, arredondamento ou fundo de cartão. No desktop, as regiões começam diretamente na divisória do cabeçalho, sem gap externo: ela é o corte visível durante a rolagem; não reservar faixa externa ou padding inferior na página. AppBar flutua sobre o conteúdo. Salvar Alterações fica no cabeçalho ao lado de Minha Conta, ligado pelo atributo `form` ao formulário único; não há texto auxiliar no cabeçalho nem rodapé de salvar na coluna direita. Abaixo de `lg`, seletor de seção alterna áreas montadas sem perder valores. Validação nativa revela a seção pessoal antes de focar um campo inválido. O salvamento da conta continua manual; tema pode ser aplicado/gravado localmente antes de confirmar, enquanto menu do perfil e comandos de tema da busca persistem automaticamente na conta pelo controlador existente.

- AppBar fica sempre visível em `/app`, oculta apenas com ação aberta na gaveta; não reintroduzir ocultação por hover/timer nem faixa fixa abaixo dela. O conteúdo passa sob a barra e cada área rolável termina com `AppBarSpacer` (`app/components/layout/AppBarSpacer.tsx`), altura `--app-bar-space` de98px em `app/tailwind.css` (barra de66px com16px abaixo e acima). Páginas que rolam inteiras colocam o espaço como último elemento; páginas `page-height` o colocam no fim de cada coluna com rolagem própria (feed do parceiro, lista/detalhe de leads, datas comemorativas). Calendário só reserva com `layoutOptions.reserveAppBarSpace`, ligado apenas no parceiro, como linha após a última semana; Home usa o rodapé e Hoje standalone reserva dentro da altura medida. Novas páginas/colunas roláveis da equipe seguem a mesma regra; portal `/dash` não tem AppBar.

- Página Hoje e bloco Hoje da Home são componentes separados: `TodayPageView` (`/app/today`) e `HomeTodayView`, que compartilham somente as partes de `TodayViewParts` (filtro do dia, título, seletor de visualização e quadros). A Home mantém altura natural e Kanban de30vh, sem opções da página dedicada. A página mede a altura útil do contêiner rolável e acompanha resize; título, data e seletor ficam fixos, acima de uma divisória; no desktop o nome da visualização fica entre título e controles e não se repete no conteúdo. Parceiros/Categorias/Feed rolam numa única região "Ações do dia" que termina com `AppBarSpacer` e volta ao topo ao trocar dia/visualização; Kanban mantém cabeçalhos de fase fixos e rolagem por coluna, com a reserva da AppBar dentro da altura. Novidades da página Hoje não precisam ser espelhadas na Home.

- Calendários da equipe usam altura natural por semana; `ViewOptions.limitHeight` ativa teto de `min(24rem,60dvh)` por dia com uma área de rolagem que inclui ações e comemorações, mantendo cabeçalho fora dela. Linha/Bloco/Conteúdo não decidem altura nem truncam em cinco itens. Parceiro e Home mensal iniciam automáticos; Home semanal inicia limitada e preserva a escolha por período durante a montagem. `ActionContainer.scrollable=false` delega a rolagem à célula; demais consumidores preservam seu comportamento. Painel do parceiro rola entre semanas e feed rola separadamente. Portal mantém painel limitado à janela e dias naturais na grade rolável, sem menu de altura por dia. Essas escolhas de altura não são persistidas.

- Visualização inicial de Hoje: `defaultTodayView` em `UserPreferences` aceita `partners`/`kanban`/`categories`/`feed`, com fallback Parceiros. Minha Conta oferece rascunho salvo pelo botão; `HomeTodayView` e `TodayPageView` inicializam uma vez por montagem/identidade e mantêm trocas manuais temporárias durante datas/dados/resize. Não reutilizar `defaultViewVariant` dos clientes. A migration `20261028201902_today_view_preference.sql` ampliou a RPC em produção em28/10/2026 (remota `20261028205047`), com catálogo/validação/permissões verificados no manifest de Hoje. Aplicação de SQL não comprova publicação do frontend; histórico de migrations continua parcial.

- HeaderMenu usa `usePreferencePersistence`/`createPreferencePersistence`: debounce250ms, uma escrita em voo, último patch por campo, falha preservada e retry explícito. Atualização local aplica somente campos alterados pelo próprio controlador, preservando campos salvos por outro fluxo mesmo com resposta antiga. Perfil também usa `update_my_preferences(p_patch)`; preserve o merge autorizado por auth.uid() e campos desconhecidos existentes.
- Temas usam localStorage e `people.preferences`; perfil oferece preview antes de salvar. Preferência `light`/`dark`/`system` (`themePreference` em `useAppTheme`); `system` acompanha `prefers-color-scheme` em tempo real e `theme` é sempre o tema resolvido (claro/escuro). Perfil e menu do cabeçalho oferecem as três opções. O script síncrono de `index.html` aplica tema antes do React.
- Cloudinary usa cloud name/upload preset no widget. Mantenha o widget montado durante uploads múltiplos; close pode preceder os últimos eventos success. API secret não pertence a variáveis VITE_.

### IA e ambientes

- `app/lib/ai-contract.ts` valida os contratos. Segredos OpenAI/Supabase ficam no servidor.
- Imports relativos de valores nas APIs usam o caminho `.js` emitido pelo build de funções ESM. Confira o pacote com `bun run test:serverless`: Bun/Vite e testes com mocks não certificam a resolução pelo Node publicado.
- Por decisão do proprietário em27/10/2026, `bun run dev` inicia Vite via Node no modo `production`, em `http://127.0.0.1:5176`, e usa banco/contas reais de produção com `.env.production.local`. APP_ORIGIN local corresponde a esse endereço; a cópia de publicação `.env.vercel-production.local` preserva a origem publicada. Staging fica fora do fluxo habitual, com projeto/arquivos históricos preservados. Launcher local verifica porta antes de iniciar o Vite, evitando que uma inicialização rejeitada invalide dependências do servidor ativo. Cache `.cache/vite` pertence ao checkout, sem compartilhamento pelo node_modules. `bun run test:dev-imports` verifica a regressão com Vite/HTTP e cache/porta temporários. Scripts explícitos de staging continuam destinados apenas a ele; verificações automáticas do app usam HTTP controlado, sem redirecionar fixtures de escrita para produção.
- Compatibilidade local só ocorre com NODE_ENV development, `UZZINA_LOCAL_AI_COMPAT=true` e sem VERCEL. O adaptador ativa a flag apenas no modo development; usa chave pública/Bearer e membro ativo, sem `consume_ai_usage`.
- Staging/Vercel/produção usam reserva persistente via `consume_ai_usage` antes da geração. Falha da RPC retorna503/AI_QUOTA_UNAVAILABLE; limite esgotado retorna429. Sem contador em memória ou fallback por erro.
- `ai_usage` registra usuário/dia UTC/tentativas; AI_DAILY_LIMIT padrão100, intervalo1–10000. Isso é limite técnico, distinto da proposta futura de medição por agência/modelo/token.
- Fontes e finalidade dos envs estão no README. Não imprimir/versionar segredos nem pedir credenciais já disponíveis. O comando dev usa Node e env específico por modo; preservar ausência de `.env` genérico, que o Bun poderia pré-carregar sobre a configuração do Vite.

### Banco e implantação

- `get_app_bootstrap(UUID)` retorna JSONB. A migration de compatibilidade remove somente o trigger legado conhecido que escrevia em profiles ausente; administração cria Auth antes de preencher people.
- Controle de concorrência usa um único trigger/versão UTC em updated_at timestamp sem timezone; preserve a data de execução e a compatibilidade com moddatetime legado.
- Funções de trigger `handle_actions_updated_at`, `handle_new_user` e `update_updated_at` têm `search_path` vazio e não permitem EXECUTE direto por PUBLIC/anon/authenticated. Preserve os triggers existentes; não reabra essas funções como RPCs. Defaults de aplicação pertencem a `postgres`; defaults de `supabase_admin` são gerenciados pela plataforma e não devem ser alterados por contorno de permissões.
- Contratos de autorização: datas comemorativas com escrita administrativa; notificações pelo destinatário ativo autorizado à ação, UPDATE apenas de read_at e menção/autoria/escopo verificados pelo servidor/banco.
- As migrations incrementam o catálogo existente; não constituem sozinhas um schema inicial completo. SQL versionado não confirma aplicação. Consulte CURRENT e o manifest do rollout antes de publicar ou alterar permissões.
- Produção usa PostgreSQL15; staging cloud usa17. `supabase/config.toml` major15 configura o ambiente local, não os serviços cloud. Bootstrap/manifest em supabase/staging são exclusivos do staging; versões remotas diferem dos nomes locais.
- Não executar db push/repair/reset cegamente: produção foi atualizada por bundles parciais, sem histórico de migrations. Publicação exige verificar nova versão Ready antes de restringir os acessos legados.

## 4. Manutenção de documentação

Documente contratos vigentes aqui, operação no README e status/pendências em CURRENT. Ideias futuras permanecem separadas em docs/plans, sem implementação automática.

Ao adicionar/modificar tabelas ou models, atualize este guia e `~/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`. Novas rotas/portais/fluxos exigem atualização do guia e do KI correspondente, incluindo `uzzina-architecture/artifacts/architecture.md`. Novos componentes Prism/Uzzina também entram na galeria `/ui`.

## 5. Design system: Prism

Preserve o estilo próprio, temas e paletas OKLCH da UZZINA. Novos primitivos ficam em `app/components/prism/`, exportados por index.ts, com React Aria Components, CVA e `cn()` de `~/lib/utils`. Componentes de negócio reutilizam esses primitivos. Consulte implementação e `/ui` para props e variantes atuais.

| Token | Uso |
|---|---|
| bg-background / bg-card / bg-input | Página, painéis e campos |
| text-foreground / text-muted-foreground | Texto principal e secundário |
| border-border / border-input | Bordas |
| bg-primary / text-primary-foreground | Ação principal |
| border-ring / ring-ring/50 | Foco |
| text-error / bg-error-background | Erro |
| text-success / bg-success-background | Sucesso |
| text-warning / bg-warning-background | Aviso |
| text-info / bg-info-background | Informação |

Use estados React Aria data-[hovered], data-[pressed], data-[focused] e data-[disabled]. Ícones Lucide novos seguem sufixo Icon; botões definem tamanho padrão e focus ring. PrismInput aplica foco/erro ao Group que inclui prefixo/sufixo. PrismAlert reúne ícone, título e descrição por variante. Componente composto precisa de verificação própria de foco/teclado, além das garantias dos primitivos.

`/ui` reúne tokens, componentes Prism e componentes Uzzina; novas seções ficam em app/components/ui-sections e são integradas à rota.

`PrismCommandItem` fornece `{ shiftKey }` ao `onAction`, capturado pelo `PrismCommand` antes da ativação React Aria. Parceiros, responsáveis, sprint e filtros múltiplos de fase/categoria usam esse modificador para seleção exclusiva com Shift+clique/Shift+Enter; não usar `window.event` para essa decisão.

Comandos da busca: conta, light/dark/system, início/Hoje/notificações/leads/ajuda e Sair ficam abaixo dos resultados. Administração somente para person.admin, usando cadastros/listas existentes. Navegação por comando e Sair validam closeAllActions; bloqueio mantém busca/ações. Persistência de tema pertence ao wrapper montado e usa usePreferencePersistence com retry, sem alterar paleta.

Criar data comemorativa na busca abre `CelebrationDialog` (também usado para editar na página de administração), exclusivo para `person.admin`, com título e calendário Prism em pt-BR, sem navegar/fechar ações nem usar Shift para secundária. Gerenciar datas comemorativas mantém `/app/admin/celebrations`. A busca fecha e restaura foco antes de montar o modal no próximo frame; Cancelar/Escape retornam ao controle anterior. Envio pendente bloqueia duplicação/dismissal; falha preserva campos; sucesso usa `createCelebration`, atualiza o cache canônico existente e invalida somente `QUERY_KEYS.celebrations(userId)`. Identidade/geração/montagem validam antes de enviar e antes de aplicar confirmação; chamadas já enviadas não são desfeitas pelo reset. Preservar a autorização administrativa existente no banco. Não adicionar regras de criação à rota nem acessar `.from()` pelo componente. O form envolve só o título e o botão de envio se liga pelo atributo `form`: o calendário React Aria renderiza um botão oculto sem type que viraria o botão padrão e mudaria o mês ao apertar Enter; não colocar o calendário dentro do form. Título vazio mostra erro no campo (`noValidate`), sem balão do navegador; sem descrição no cabeçalho. Layout aprovado: rótulo Data sem repetir a data escrita, dias de outros meses ocultos, calendário sem borda na largura do modal com dias fixos de36px e ponto em hoje; seletores de mês/ano do `PrismCalendar` sem fundo, só texto e seta, na altura das setas; anterior/próximo ficam na linha do título do mês para o Tab seguir a ordem visual.

Ajuda (`/app/help`, `HelpPage`): página de orientação sem consulta ao banco, com índice lateral (desktop) ou seletor (celular) e região de rolagem própria terminada em `AppBarSpacer`. Seção Administração só para `person.admin`. Rolagem por âncora move apenas essa região (não `scrollIntoView`, que também move o contêiner recortado); a região é `relative` para que elementos `sr-only` absolutos não ampliem o contêiner externo. Textos descrevem somente recursos existentes; atualize-os ao mudar atalhos ou fluxos.
