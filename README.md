# UZZINA

Aplicação da agência CNVT para ações, parceiros, calendário, Kanban e foco pessoal. A equipe usa `/app`; contas externas usam `/dash`; links de revisão permitem acesso público limitado por token.

## Tecnologias e organização

React com TanStack Router em SPA e TanStack Query; Supabase para banco/Auth; Tailwind CSS v4 e Prism sobre React Aria; Tiptap para edição; Cloudinary para upload; OpenAI nas APIs de servidor. Publicação na Vercel.

| Pasta | Conteúdo |
|---|---|
| app/routes | Rotas; árvore gerada em app/routeTree.gen.ts |
| app/components/prism, uzzina, features, layout | Design system e fluxos de interface |
| app/components/ui-sections | Galeria de componentes em `/ui` |
| app/hooks, lib, models, services | Estado, cache, contratos e acesso a dados/API |
| api, server | Funções Vercel e adaptação local dos mesmos handlers |
| supabase | Migrations incrementais e arquivos específicos de implantação/staging |
| tests, scripts | Testes automatizados, percursos de navegador e verificações do banco |

## Desenvolvimento

Instale as dependências com Bun, usando o lockfile versionado:

```sh
bun install --frozen-lockfile
bun run dev
```

Vite inicia em http://127.0.0.1:5176, com porta fixa. O adaptador local executa as APIs da pasta api; um preview do build estático não substitui esse servidor de desenvolvimento nem as funções da Vercel.

Por decisão do proprietário em27/10/2026, `bun run dev` usa **o banco de produção** (projeto Supabase `dfepmjcozszswocwvdpq`) e as contas reais. Edições no localhost afetam os mesmos dados do aplicativo publicado. O comando inicia Vite via Node no modo `production`, carregando `.env.production.local`; esse modo de configuração mantém o servidor de desenvolvimento e desativa o bypass local de quota. A IA usa `consume_ai_usage` de produção e OpenAI reais. Staging foi retirado do fluxo habitual.

## Arquivos de ambiente

| Arquivo privado | Finalidade |
|---|---|
| .env.production.local | Configuração ativa de desenvolvimento/build local, com banco/chaves de produção e APP_ORIGIN=http://127.0.0.1:5176 |
| .env.vercel-production.local | Cópia das variáveis de publicação na Vercel UZZINA/Production; preserva APP_ORIGIN=https://uzzina.cnvt.com.br |
| .env.staging.local | Configuração histórica de staging, preservada para scripts explicitamente destinados a esse projeto; não carregada pelo dev padrão |
| .env.staging-users.local | Contas fictícias históricas dos scripts de staging; não usadas para login no localhost nem importadas na Vercel |
| .env.backup.local | Conexão privada para backup/operações PostgreSQL; não importar na Vercel |

O build local (`bun run build`) também carrega `.env.production.local`. A Vercel usa suas próprias variáveis. Todos esses arquivos ficam fora do Git. O arquivo de produção da pasta lead pertence a outro projeto Vercel. Mantenha os envs específicos por modo: um `.env` genérico pode ser pré-carregado pelo Bun e sobrepor valores antes do Vite.

As dez variáveis do arquivo de publicação são:

| Variável | Uso |
|---|---|
| VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY | Cliente público do navegador |
| VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET | Widget de upload |
| SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY | APIs; mesmos valores das correspondentes públicas, exigidos diretamente por create-user |
| SUPABASE_SERVICE_ROLE_KEY | Acesso privilegiado somente no servidor; aceita a secret key moderna configurada |
| OPENAI_API_KEY | Geração de IA somente no servidor |
| APP_ORIGIN | Origem exata autorizada do portal; em produção https://uzzina.cnvt.com.br |
| AI_DAILY_LIMIT | Limite técnico opcional, padrão100 tentativas por usuário/dia UTC |

As variáveis de banco/servidor do arquivo local vêm da cópia de produção, sem credenciais de staging. APP_ORIGIN é a única substituição para o endereço local; o arquivo destinado à Vercel mantém sua origem publicada. Cloudinary e OpenAI também são os serviços reais.

Variáveis VITE_ são públicas quando usadas no build. VITE_SESSION_SECRET, VITE_CLOUDINARY_API_KEY e VITE_CLOUDINARY_API_SECRET não são usadas pelo código atual e foram retiradas dos arquivos locais. Preserve cloud name/upload preset.

## Contratos de funcionamento

O cliente Supabase do navegador é singleton. Equipe autentica por Supabase Auth; clientes externos usam cookie HttpOnly e sessão verificada pelas APIs. Revisão pública usa token com escopo/expiração/revogação. O formulário externo de Leads grava pela API do seu próprio projeto, com cookie de edição, sem acesso anônimo direto à tabela.

Listas de ações recebem criações e alterações após confirmação do servidor, com cache separado por identidade/escopo. Preview de arraste e rascunho da gaveta têm tratamento próprio. Edição usa controle de versão e comparação de conflito para evitar sobrescrever outra alteração. Parceiros arquivados permanecem na administração, fora da operação.

O editor da equipe permite duas ações abertas. A busca global (Cmd/Ctrl+K) abre normalmente na principal; Shift+clique/Enter/Espaço abre na secundária. Sem nenhuma aberta, Shift abre a principal. Depois de navegar pelos resultados com as setas, Espaço ativa o resultado; durante a digitação normal, continua inserindo espaço no texto. Com duas ações, janelas de pelo menos1856px exibem principal à esquerda e secundária à direita, num grupo ancorado à direita; abaixo disso, as ações alternam por abas. O limite reserva duas larguras máximas de896px mais64px de overlay e não muda ao alternar abas internas. Uma ação sozinha continua à direita. Cada X fecha sua ação; Escape fora do editor e clique no overlay fecham ambas com as proteções de salvamento. Não há botão para fechar todas. Escape dentro do Tiptap é consumido pelo ProseMirror e mantém a edição. O atalho atual de Nova ação cria na principal e preserva a secundária; o comando de criação na busca fica para a próxima entrega.

Preferências são salvas por patches e merge transacional; o perfil oferece preview. Tema inicial é aplicado por script em index.html antes do React. O design system vivo está em `/ui`.

O comando habitual usa o modo `production` e exige reserva persistente via consume_ai_usage, assim como a Vercel. A compatibilidade de desenvolvimento existente só pode ser ativada no modo `development` explícito; não é ativada por `bun run dev`. O contador técnico não mede tokens/custos por agência; essa evolução é apenas [plano futuro](docs/plans/2026-10-07-consumo-ia-por-agencia.md).

## Verificação e banco

```sh
bun run test
bun run typecheck
bun run lint
bun run build
```

Testes de código e percursos de navegador com HTTP controlado têm escopo distinto de validação do banco/provedor/site publicados. Os scripts em scripts documentam seus requisitos de execução; fixtures de banco usam ambiente descartável e transações com rollback.

As dez migrations em supabase/migrations atualizam uma estrutura existente; não são um schema inicial completo. supabase/config.toml usa PostgreSQL15 para o ambiente local. O projeto cloud de staging usa17; seu bootstrap e manifest em supabase/staging não são arquivos de instalação de produção.

Produção foi preparada em etapas, sem histórico Supabase de migrations. Consulte [CURRENT](docs/audits/CURRENT.md) e o manifest de rollout antes de aplicar SQL. Não executar db push/repair/reset indiscriminadamente. Backup lógico não inclui arquivos físicos Cloudinary/Storage ou configuração de Vercel.

Para trabalhar no código, consulte [AGENTS.md](AGENTS.md). Verificações pendentes ficam em CURRENT e ideias no TODO. Relatórios intermediários foram removidos; seu histórico versionado permanece no Git.

## Operação dos ambientes e integrações

Produção: projeto Supabase dfepmjcozszswocwvdpq; usado pelo app em https://uzzina.cnvt.com.br e pelo localhost. Staging zacrrtilppvekiyoybzn foi retirado do desenvolvimento habitual; seu projeto remoto, dados, credenciais históricas e manifests foram preservados. Os scripts específicos de staging continuam destinados exclusivamente àquele projeto e não devem ser redirecionados para produção. O bootstrap de supabase/staging não serve para reconstruir produção.

Leads vive em /Users/euchicosousa/vercel/lead e https://lead.cnvt.com.br. Suas quatro variáveis de servidor são SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LEADS_ORIGIN e LEAD_SESSION_SECRET. Origin deve ser a URL exata; segredo de sessão aleatório independente da chave do banco. API POST/PATCH usa cookie HttpOnly/HMAC de24h para autorizar edição do lead correspondente, valida schema/limites e preserva respostas em falha. Chave moderna sb_secret é usada no header apikey; não enviá-la como Bearer do visitante. Origin/cookie não são proteção completa contra bots. UZZINA lê Leads apenas para membro ativo; servidor realiza gravações.

Scripts check-*-browser usam Playwright/Chromium externos ao lockfile do app: PLAYWRIGHT_MODULE pode indicar instalação existente e PLAYWRIGHT_EXECUTABLE o navegador instalado. PORTAL_TEST_URL indica o Vite local. Confira variáveis adicionais no script escolhido. Eles controlam HTTP e bloqueiam requisições externas não previstas; não usar a aprovação deles como comprovação de produção.

`node scripts/check-action-panels-browser.cjs` confere as duas ações no app real, com Auth, consultas, mutações, preferências e logout simulados por HTTP. Inclui Shift+clique/Enter/Espaço, rascunho pelo atalho atual, estado independente, fechamento com falha/retry e limpeza de sessão. `DRAWER_TEST_WIDTH=390` executa o cenário estreito; `DRAWER_TEST_SCREENSHOT_DIR` habilita capturas com animações concluídas. O script não grava fixtures em produção.

`node scripts/check-calendar-height-browser.cjs` verifica os componentes reais e CSS dos calendários da equipe, Home e portal com fixtures locais, sem criar rota no produto. Usa `CALENDAR_TEST_URL` (padrão `http://127.0.0.1:5180`) e as mesmas variáveis Playwright acima. O script controla a página de teste e bloqueia requisições externas; não depende do banco de staging.

`bun run test:serverless` empacota as APIs de IA/portal com o builder `@vercel/node` instalado e importa os arquivos emitidos no Node nativo, em diretório descartável. Não carrega segredos nem faz chamadas externas. `node scripts/check-serverless-runtime.cjs --staging-caption` acrescenta uma geração fictícia com Auth real, cota persistente de staging e OpenAI; usa os envs de staging e consome uma tentativa de teste nesse ambiente. Os pacotes externos vêm do node_modules instalado; isso não equivale a um deploy Vercel. Sem CI, ele é obrigatório antes de qualquer push que toque APIs, `server/`, arquivos importados por elas ou dependências.

`bun scripts/check-action-create-staging.ts` verifica as funções reais de criação/duplicação por Supabase Auth/PostgREST no projeto de staging, incluindo negativas de escopo/responsabilidade/parceiro arquivado. Usa somente contas fictícias dos envs de staging e remove os IDs de ações retornados pelo próprio teste. A matriz SQL em `scripts/test-database-matrix.sql` também cobre INSERT RETURNING com administrador/membro e recusa de membro inativo no PostgreSQL descartável.

A correção incremental de leitura de ações é `supabase/migrations/20261008164615_action_row_read_authorization.sql`; ela altera somente a expressão da policy SELECT existente. Aplicação e verificações por ambiente estão em `supabase/rollouts/action-read-fix-manifest.json`. Não reaplicar os bundles anteriores para instalar essa correção.

Após uma publicação, o proprietário pode conferir login/home, ações/data, preferências, IA, administração, portal/revisão, upload e Leads. Em edição simultânea, alterar a mesma ação em duas sessões e verificar conflito/preservação do rascunho; atualizar para confirmar persistência. Fazer essas verificações com registros próprios de teste e relatar passos/erro/navegador, sem segredos. O resultado vigente fica em CURRENT.

## Teclado na edição de ações

Na aba Essencial, Tab percorre Título → Descrição → Parceiros → Fase → Categoria → Cor, quando disponível → Criar/Atualizar. Após Criar/Atualizar, segue para Essencial → Instagram, quando disponível → Observações → Fechar → Título. As abas mostram uma borda superior na cor principal ao receber foco. Shift+Tab faz o caminho inverso. Alt+F10 alterna para navegar por todos os controles; o aviso inferior desse atalho está oculto.

No editor, Alt+Shift+F10 acessa a formatação principal. Quando a barra de seleção/tabela estiver visível, Alt+Shift+F9 acessa seus comandos. Use setas para navegar, Enter/Espaço para aplicar e Tab para voltar ao texto. Calendário, seletores e diálogos mantêm seus próprios comandos. No Mac, Alt corresponde a Option; Fn pode ser necessário para enviar F9/F10 conforme a configuração das teclas de função.
