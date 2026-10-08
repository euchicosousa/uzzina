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

Vite inicia normalmente em localhost:5173. O adaptador local executa as APIs da pasta api; um preview do build estático não substitui esse servidor de desenvolvimento nem as funções da Vercel.

O `.env` habitual aponta para o banco de produção: operações reais podem alterar dados reais. Use staging para validações com fixtures. Para carregar o arquivo de staging sem a pré-carga de env do Bun:

```sh
node node_modules/vite/bin/vite.js --mode staging --host 127.0.0.1 --port 5180 --strictPort
```

## Arquivos de ambiente

| Arquivo privado | Finalidade |
|---|---|
| .env | Desenvolvimento habitual; compatibilidade local de IA |
| .env.staging.local | Projeto Supabase separado de testes, carregado com --mode staging |
| .env.vercel-production.local | Valores para importar na Vercel UZZINA/Production; não é carregado pelo dev habitual |
| .env.staging-users.local | Contas fictícias de teste; não importar na Vercel |
| .env.backup.local | Conexão privada para backup/operações PostgreSQL; não importar na Vercel |

Todos ficam fora do Git. O arquivo de produção da pasta lead pertence a outro projeto Vercel.

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

O `.env` habitual não contém necessariamente todas as configurações de servidor da publicação. APIs administrativas/portal requerem suas variáveis também no ambiente local quando forem testadas. O staging tem configuração própria; Cloudinary é herdado do .env base e não representa storage de testes separado.

Variáveis VITE_ são públicas quando usadas no build. VITE_SESSION_SECRET, VITE_CLOUDINARY_API_KEY e VITE_CLOUDINARY_API_SECRET não são usadas pelo código atual e foram retiradas dos arquivos locais. Preserve cloud name/upload preset.

## Contratos de funcionamento

O cliente Supabase do navegador é singleton. Equipe autentica por Supabase Auth; clientes externos usam cookie HttpOnly e sessão verificada pelas APIs. Revisão pública usa token com escopo/expiração/revogação. O formulário externo de Leads grava pela API do seu próprio projeto, com cookie de edição, sem acesso anônimo direto à tabela.

Listas de ações recebem criações e alterações após confirmação do servidor, com cache separado por identidade/escopo. Preview de arraste e rascunho da gaveta têm tratamento próprio. Edição usa controle de versão e comparação de conflito para evitar sobrescrever outra alteração. Parceiros arquivados permanecem na administração, fora da operação.

Preferências são salvas por patches e merge transacional; o perfil oferece preview. Tema inicial é aplicado por script em index.html antes do React. O design system vivo está em `/ui`.

IA no Vite development habitual tem compatibilidade local explícita; staging/Vercel/produção exigem reserva persistente via consume_ai_usage. O contador técnico não mede tokens/custos por agência; essa evolução é apenas [plano futuro](docs/plans/2026-10-07-consumo-ia-por-agencia.md).

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

Produção: projeto Supabase dfepmjcozszswocwvdpq; app em https://uzzina.cnvt.com.br. Staging: zacrrtilppvekiyoybzn, com Auth oficial e usuários fictícios em .env.staging-users.local. As chaves de servidor dos dois projetos são distintas; não copiar credenciais de produção para staging. O bootstrap específico foi aplicado no staging vazio; versões remotas estão em supabase/staging/applied-manifest.json. Não usar esse bootstrap para reconstruir produção.

Leads vive em /Users/euchicosousa/vercel/lead e https://lead.cnvt.com.br. Suas quatro variáveis de servidor são SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LEADS_ORIGIN e LEAD_SESSION_SECRET. Origin deve ser a URL exata; segredo de sessão aleatório independente da chave do banco. API POST/PATCH usa cookie HttpOnly/HMAC de24h para autorizar edição do lead correspondente, valida schema/limites e preserva respostas em falha. Chave moderna sb_secret é usada no header apikey; não enviá-la como Bearer do visitante. Origin/cookie não são proteção completa contra bots. UZZINA lê Leads apenas para membro ativo; servidor realiza gravações.

Scripts check-*-browser usam Playwright/Chromium externos ao lockfile do app: PLAYWRIGHT_MODULE pode indicar instalação existente e PLAYWRIGHT_EXECUTABLE o navegador instalado. PORTAL_TEST_URL indica o Vite local. Confira variáveis adicionais no script escolhido. Eles controlam HTTP e bloqueiam requisições externas não previstas; não usar a aprovação deles como comprovação de produção.

Após uma publicação, o proprietário pode conferir login/home, ações/data, preferências, IA, administração, portal/revisão, upload e Leads. Em edição simultânea, alterar a mesma ação em duas sessões e verificar conflito/preservação do rascunho; atualizar para confirmar persistência. Fazer essas verificações com registros próprios de teste e relatar passos/erro/navegador, sem segredos. O resultado vigente fica em CURRENT.
