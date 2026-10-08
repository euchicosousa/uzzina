# Supabase de teste — estrutura preparada

Atualização após o proprietário preencher a chave privada: ambiente local iniciado em5180; três contas oficiais de Auth e dados fictícios provisionados. Login/JWT/PostgREST e isolamento funcional passaram. Menções iniciais a chaves vazias/zero dados são históricas; veja a seção de integração ao final.

07/10/2026. Projeto autorizado pelo proprietário: `zacrrtilppvekiyoybzn`, organização `agenciacnvt`, nome `uzzina`, região São Paulo. PostgreSQL17.11. HEAD preservado: `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`. Produção e formulário externo não foram acessados ou alterados.

## Resultado observado

O MCP do Supabase está conectado. O projeto tinha zero tabelas em public; recebeu um bootstrap de staging e as nove migrations existentes, sequencialmente e sem erros. Agora tem11 tabelas, todas com RLS. A matriz de permissões passou no PostgreSQL real da plataforma, usando a função auth.uid() oficial. As fixtures foram desfeitas por ROLLBACK; auth.users, people, actions e ai_usage terminaram com zero registros.

`supabase/staging/bootstrap.sql` contém somente o catálogo do aplicativo reconstruído do inventário enviado em07/10: colunas, enum, defaults, constraints, índices e trigger de updated_at de leads. Não aplica o baseline de auth mínimo de scripts/build-db-test-baseline.py: auth.users, auth.uid(), roles e serviços oficiais foram preservados. Os antigos triggers profiles/moddatetime e RPCs sem autorização não foram recriados. Esse arquivo exige public vazio e Supabase Auth presente. É exclusivo deste staging, não entra na fila automática de migrations de produção.

O catálogo não exportava limites de varchar: initials/short foram reconstruídos como varchar sem limite. Portanto não é um clone integral ou dump certificado do banco antigo. Os contratos funcionais usados nesta matriz são compatíveis; limites exatos precisam de dump antes de uma reprodução integral.

`supabase/staging/applied-manifest.json` relaciona cada SQL local, SHA256 e versão registrada pelo MCP. O MCP atribuiu timestamps remotos: não são iguais aos nomes dos arquivos locais. Não executar db push/link/repair cegamente para tentar conciliar histórias; planejar esse alinhamento antes de usar a CLI no staging. Arquivos históricos existentes não foram renomeados.

## Verificações

- Matriz de scripts/test-database-matrix.sql executada em transação com ROLLBACK: anon negado; colaborador isolado por responsabilidade/parceiro; identidade forjada, auto-promoção, usuário inativo e notas alheias negados; admin autorizado; versão/CAS monotônica; quota por membro; merge/validação de preferências; notificações por menção e destinatário; datas administrativas protegidas.
- Adaptação única da matriz no MCP: o bloco que cria audit_default_probe foi omitido, mantendo a consulta sem DDL persistente. Defaults foram inspecionados pelo catálogo, separadamente. Nenhum teste fictício foi apresentado como login real.
- Verificação de catálogo: zero grants de anon nas11 tabelas; zero TRUNCATE/REFERENCES/TRIGGER/MAINTAIN de authenticated; zero funções SECURITY DEFINER executáveis por anon; zero grants de navegador nos defaults de postgres/public. MAINTAIN é também relevante no PostgreSQL17.
- Nenhum trigger de aplicação instalado em auth.users. As APIs de Auth oficiais permanecem intactas.
- Quatro chamadas HTTP reais pelo PostgREST com chave publicável e sem sessão: leitura de actions, clients e leads e chamada de consume_ai_usage. Todas retornaram401/code42501 (permission denied). Nenhuma geração ou gravação de quota ocorreu.
- Matrizes de concorrência com duas conexões foram verificadas no PostgreSQL15.1 local na entrega anterior; não foram repetidas no cloud nesta preparação. Não confundir isso com concorrência cloud homologada.
- Changelog oficial consultado, incluindo breaking changes de PostgreSQL17.11: bootstrap não usa ltree, btree_gist, operadores customizados ou cifras PGP legadas.

## Avisos do Advisor

O Advisor retorna8 avisos sobre funções SECURITY DEFINER acessíveis por authenticated. São endpoints/helpers intencionais: admin_update_person, can_access_action, can_notify_mention, get_app_bootstrap, get_home_actions, is_active_admin, is_active_member e update_my_preferences. Identidade, atividade, escopo e gates administrativos estão no SQL; a matriz verificou parte desses limites. Não remover esses privilégios indiscriminadamente: quebra o fluxo e pode gerar recursão de RLS. Revisão e testes autenticados via JWT/API continuam necessários, sem afirmar Advisor limpo.

Referência: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

Cinco avisos informativos RLS sem policy: clients, dash_sessions, review_links e ai_usage são de backend; leads está deliberadamente fechado neste staging. O backend service_role tem acesso; anon/authenticated não receberam policies para essas tabelas.

Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Defaults de supabase_admin permanecem como fornecidos pela plataforma. Todos os objetos de aplicação desta rodada têm owner postgres; os defaults desse owner foram ajustados. Não alterar ownership/defaults da plataforma como atalho, nem considerar essa pendência resolvida.

## Leads: diferença explícita

Neste staging vazio, leads não permite DML do navegador. Não foi copiada a policy anônima insegura do banco antigo. Isso não corrige nem certifica a integração externa em /Users/euchicosousa/vercel/lead, que continua usando INSERT/SELECT(id)/UPDATE por ID no ambiente atual. A tela de leads da equipe também não está homologada neste staging; precisa do contrato de autorização da entrega dedicada. Não apontar o formulário atual para o banco de teste.

## Configuração local separada

Criado `.env.staging.local`, ignorado pelo Git, com URL e chave publicável somente do projeto de teste. VITE_SUPABASE_ANON_KEY aceita essa chave publicável no cliente atual. SUPABASE_PUBLISHABLE_KEY também foi preenchida para a API create-user. SUPABASE_SERVICE_ROLE_KEY e OPENAI_API_KEY permanecem vazias, impedindo herança das chaves atuais pelo Vite neste modo. APP_ORIGIN aponta para http://127.0.0.1:5180. Nenhum servidor foi iniciado e nenhum .env atual foi sobrescrito.

Inicialização prevista:

```sh
node node_modules/vite/bin/vite.js --mode staging --host 127.0.0.1 --port 5180 --strictPort
```

Não substituir por bun run dev nesta instalação: Bun1.2.19 pré-carrega .env em process.env, que tem prioridade sobre o arquivo de modo do Vite. O teste de resolução detectou esse problema. A resolução pelo Node passou: URLs de teste corretas, service/OpenAI vazias. Se houver variáveis exportadas manualmente no shell, verificar a resolução antes de iniciar; nunca assumir isolamento pelo nome do arquivo.

## Próximo passo: integrar o aplicativo

1. Preencher localmente SUPABASE_SERVICE_ROLE_KEY com a chave privada exclusiva deste projeto de teste, sem colar no chat ou usar prefixo VITE_. MCP não expõe essa chave pelo get_publishable_keys. OpenAI permanece desabilitada até uma rodada autorizada de IA real.
2. Criar identidades de teste pelo serviço oficial de Auth (admin e dois colaboradores), cadastrar people completos e montar parceiros/ações fictícios. Não copiar senhas, sessões, hashes ou dados reais de clientes. Admin inicial exige provisionamento de backend, pois RLS impede auto-promoção.
3. Conferir o adaptador local: /api/create-user ainda não consta em server/dev-api.ts. Essa é uma pendência observada para validar gestão de usuários localmente, não uma correção executada nesta preparação.
4. Testar login e APIs via GoTrue/PostgREST e o app em5180: admin/colaborador, parceiros arquivados, gravação de data na gaveta/calendário, conflitos, portal e revisão por link. Chaves vazias não permitem homologar APIs privilegiadas.
5. Foco completo, Safari/aparelho físico, integração de leads e deploy continuam separados. Banco de produção não recebeu nenhuma migration.

Esta entrega prepara estrutura e configuração. Não declara login, chamadas autenticadas, APIs Vercel, IA/OpenAI, uploads, UI ou produção homologados.

Lint e typecheck passaram; verificações de código anteriores permanecem no relatório local. Código runtime do aplicativo não foi alterado nesta entrega.


## Integração real — chave configurada e usuários prontos

O proprietário preencheu SUPABASE_SERVICE_ROLE_KEY em .env.staging.local. Verificada localmente sem imprimir segredo: role service_role e ref zacrrtilppvekiyoybzn. .env atual continua no projeto dfepmjcozszswocwvdpq. OpenAI de staging permanece vazia.

Provisionadas três contas confirmadas pela API oficial auth.admin.createUser (ADMIN, COLLAB_A, COLLAB_B), people completos, dois parceiros ativos exclusivos de cada colaborador e um parceiro arquivado. Quatro ações fictícias: duas de hoje, uma pendência de ontem e uma ação de parceiro arquivado. Esses dados permanecem exclusivamente no banco de teste para a validação visual; não são resíduos esquecidos da matriz SQL.

Credenciais aleatórias em .env.staging-users.local, ignorado pelo Git, permissão0600: campos STAGING_ADMIN_EMAIL/PASSWORD/UID e equivalentes COLLAB_A/COLLAB_B. Senhas não impressas no chat. Script instrumental temporário /tmp/uzzina-prepare-staging.cjs usa SDK instalado, só aceita URL de staging e não integra runtime. Sua repetição restaura os people fictícios/preferências conhecidos, não usar como rotina.

Verificações reais via GoTrue/JWT/PostgREST:

- Login por senha e identidade retornada corretos para as três contas; JWTs emitidos e usados nas consultas.
- Bootstrap e get_home_actions excluem parceiro arquivado e respeitam escopo: administrador3 ações operacionais, A2, B1 no período ontem–hoje.
- SELECT direto de actions: administrador4 (inclui administração de arquivados), A2, B1. Não confundir esse acesso administrativo com listas operacionais.
- Bootstrap com identidade forjada recusado; A não altera ação de B (zero registros); auto-promoção via UPDATE admin recusada.
- Preferências salvas por patch preservam campo existente; valor fictício restaurado.
- Alteração de data com versão exata confirma e avança updated_at; versão antiga afeta zero registros; data fictícia restaurada com versão confirmada.
- Sessões dos clientes SDK encerradas ao final; nenhum JWT/chave privada no relatório.

Aplicativo iniciado via Node/Vite em modo staging: http://127.0.0.1:5180/login. Servidor permanece disponível para o proprietário. Configuração original preservada.

Esses resultados certificam os cenários de API autenticada acima, não o login/gaveta renderizados no navegador. UI/API do aplicativo, portal/revisão/contas, gestão de usuários, concorrência cloud, leads, upload, IA e Safari/telefone continuam pendentes. /api/create-user ainda não consta no adaptador local; não foi corrigida neste provisionamento. Código runtime não alterado.

## Ajustes visuais e validação pelo proprietário

Em07/10, proprietário confirmou bloqueio de gravação concorrente entre sessões; arraste no calendário/Kanban, persistência após recarga e teste no celular. Não inferir aprovação de toda a interface móvel, Safari ou dos roteiros de troca de identidade, múltiplos campos e falha de rede.

- Header.tsx: grupo comum ganhou pb-2, preservando espaço após Sair e antes da seção administrativa. Navegador confirmou padding computado de8px; sessão administrativa usada, usuário comum não relogado pelo agente.
- ActionFormDrawer.tsx: apenas window.confirm do conflito substituído por PrismDialog. Valores atuais/pendentes, Cancelar e Salvar minhas alterações. Cancelamento conserva pendências; confirmação usa versão carregada e mesmo PATCH protegido. Novo conflito continua bloqueado. Sem mudança de banco ou política de merge.
- drawer-component.test.tsx: gaveta real com fronteira Supabase controlada cobre comparação, cancelamento sem write, conflito adicional antes de confirmar e recuperação. TDD: teste falhou pela ausência do diálogo antes da correção. dom-setup.ts expõe eventos/construtores JSDOM necessários ao foco do React Aria; não substitui componentes.

Navegador real do app5180 com Supabase staging: duas abas da mesma ação fictícia; uma gravou título remoto, outra recebeu conflito. Diálogo exibiu ambos; Cancelar manteve edição, reabertura e confirmação salvaram e retiraram aviso. Título original `Testar aqui — Preparar arte de teste` restaurado e conferido. Só staging, produção intacta. Layout estreito observado com campos empilhados; não equivale a teste físico adicional.

Final:250 testes/0 falhas/754 asserções; tipagem/lint/build passam, com aviso conhecido de chunks maiores que500kB. HEAD mantido em `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`; alterações anteriores preservadas. Sem commit/deploy.

## Comparação por versão e diagnóstico da IA — 07/10

Pedido: duas colunas por versão com campos repetidos na mesma ordem, valores legíveis e textos longos; investigar aviso503 da IA separadamente.

Código da comparação extraído para o componente local `app/components/features/action-drawer/conflict-comparison.tsx`, usado somente na gaveta. Data de execução usa parseU e formato dd/MM/yyyy às HHhmm, sem deslocar strings sem fuso; estados, tipos e prioridades usam rótulos do domínio; parceiros/pessoas usam nomes do cache privado já existente, foco identifica pessoas, tempo/arquivamento têm unidades/rótulos. Anexos mostram nome do arquivo e estratégias mostram seus campos/seleção. Valores desconhecidos mantêm identificação em vez de ocultar diferenças. Descrição/conteúdo HTML passam pelo sanitizador central; legenda permanece texto literal, como seu editor. Duas colunas inclusive no mobile; cabeçalhos fixos fora de áreas com scroll próprio. Diálogo maior no desktop. PATCH/coordenador/merge não mudaram.

TDD e código: testes inicialmente falharam para datas/rótulos e códigos de erro da IA; após correção256 testes/0 falhas/780 asserções em21 arquivos. Teste renderizado valida ambas as regiões, vários campos, legenda longa sem truncar, texto literal e remoção de script/atributos perigosos. Uma execução intermediária da gaveta excedeu o timeout na primeira montagem e contaminou casos seguintes; repetição isolada e suíte completa passaram sem aumentar timeout. Tipagem/lint/build passam; aviso conhecido de chunk grande permanece.

Navegador real/staging: criada ação descartável final099, sem modificar fixtures do proprietário; edição remota provocou conflito. Título e legendas longas comparados em1440x1000 e390x844. Desktop: colunas de484px, áreas de480px com conteúdo maior. Mobile: colunas de155px sem overflow horizontal; scroll da coluna atual avançou enquanto a outra ficou em0. Cabeçalhos e botões visíveis. A alteração final manteve legenda como texto literal e ajustou foco visual; não registrar geração pela UI como aprovada. Fixture temporária removida ao terminar. É viewport emulado, não aparelho/Safari.

IA: API local5180 reproduziu503 antes do provedor; .env.staging.local não tinha chave OpenAI. RPC consume_ai_usage existe no staging; acesso ao modelo configurado gpt-6-luna retornou200. Copiada a chave já existente em .env para o arquivo privado de staging, sem imprimir/chamar frontend; processo Node reiniciado para recarregar env. Geração curta pela API real do app, Auth/people/quota/Supabase/OpenAI reais:200 com ai-caption e legenda não vazia. Não se usou mock nesse teste; consumiu uma geração real. Model/prompt mantidos.

API passa códigos públicos limitados AI_CONFIGURATION_MISSING e AI_QUOTA_UNAVAILABLE; cliente traduz apenas esses códigos conhecidos, nunca exibe erro livre/stack/credenciais. Demais503 mantêm aviso genérico. Mensagem de configuração orienta administrador em vez de prometer que esperar resolve.

Na tentativa posterior pelo botão, conta de teste retornou401 e sessão foi encerrada; a sonda autenticada havia encerrado sessões dessa conta. Necessário entrar novamente para validar a geração pela interface. Não é o503 original e não certifica geração renderizada. .env principal local contém OpenAI mas não SUPABASE_SERVICE_ROLE_KEY; ambiente publicado na Vercel ainda não inspecionado. Banco/produção não alterados; não copiar chave do staging para produção. Configuração privada e migration de quota compatíveis continuam requisitos do ambiente principal.

### Esclarecimento do proprietário sobre ambiente habitual
Proprietário confirmou: erro nos dois locais; Vercel continua funcionando com código anterior porque últimas mudanças não foram publicadas. Nova API exige chave privada e consume_ai_usage; o .env local principal não fornece essa chave. Preparado .env.local ignorado/0600 com URL do projeto ORIGINAL dfepmjcozszswocwvdpq e campo privado vazio para o proprietário preencher. Não usar chave do staging nesse arquivo. Depois de preencher, reiniciar o processo local e conferir quota/migration compatível antes de testar. Consulta de catálogo somente-leitura pelo MCP no projeto original recusada por falta de permissão; estado atual da quota original não confirmado nesta rodada. Não aplicar SQL em produção para contornar esse bloqueio. Staging tem ambos os requisitos e geração real aprovada viaAPI; nenhum segredo copiado ao navegador/relatório.

## Revisão causal da regressão de IA no ambiente original

A interpretação anterior estava incompleta: o .env original é compatível com a API anterior. Em HEAD, api/ai.ts usa chave pública + Bearer para getUser/people e não exige service_role/consume_ai_usage. Ticket14 local passou a exigir ambas as dependências antes de chamar o provedor. Essa mudança é a causa da incompatibilidade; não é evidência de que o proprietário configurou incorretamente o ambiente existente.

Reprodução em07/10: servidor Vite temporário Node, modo development, porta5181, configuração original. Presença de OpenAI/public key/URL original confirmada, sem imprimir segredos. POST com token diagnóstico inválido retornou503/AI_CONFIGURATION_MISSING antes da autenticação e sem consultar/gravar o banco ou gastar OpenAI. Servidor encerrado. Comparação por git show HEAD:api/ai.ts confirma ausência desses requisitos no fluxo anterior. Banco original/estado atual da quota não inspecionados: MCP sem permissão.

Testes de api/ai.ts forneciam fake-service e RPC simulada, por isso aprovavam o novo contrato e não sua compatibilidade de implantação. Geração real no staging já preparado também não demonstra compatibilidade com o banco original. Template .env.local vazio criado na rodada anterior removido somente após verificar conteúdo exato sem alterações do proprietário. .env original preservado; produção e código runtime não alterados nesta revisão.

Ainda NÃO resolvido no ambiente original. Corrigir o rollout do ticket14: quota persistente/chave privada são requisitos preparados e precisam de implantação coordenada, ou a adoção dessa quota precisa ser explicitamente adiada com restauração do fluxo anterior. Não inserir fallback silencioso/in-memory nem declarar sucesso apenas porque staging passou. Orientação anterior para simplesmente acrescentar chave no .env.local está superada: isso sozinho não garante a RPC no banco original.


## Integração real concluída — passo 1,07/10/2026

Resultado em `docs/audits/2026-10-07-passo-1-homologacao-staging.md`. IA/API estrita comprovou incremento persistido de quota e geração200; interface gerou, salvou e reabriu legenda real. Portal/revisão/contas/pessoas/Auth/lote/CAS passaram na matriz descrita, após correção do handler local create-user e Content que exigia contexto privado no portal. Opção de revisão sem parceiro desabilitada. Dados descartáveis removidos e fixtures restauradas.267 testes/0 falhas; tipagem/lint/build passam. Substitui pendências históricas desses fluxos no staging; produção, leads, Safari/telefone/upload e demais limites continuam pendentes. Não declara ticket17 integralmente homologado.
