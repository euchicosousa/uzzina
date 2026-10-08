# Passo 2 — integração externa de leads, 07/10/2026

## Resultado
Correção implementada nos dois repositórios e homologada no staging `zacrrtilppvekiyoybzn`. Produção, formulário publicado e .env original preservados. Nenhum deploy/commit executado. O risco de acesso anônimo do banco atual continua aberto **até a publicação coordenada**; código/migration preparados não significam produção corrigida.

## Diagnóstico confirmado
- `/Users/euchicosousa/vercel/lead/src/lib/leads.ts` usava SDK público para INSERT/SELECT(id)/UPDATE por ID. Não havia autorização secreta para editar cada lead.
- `useFormFlow` avançava mesmo se a criação falhasse; updates seguintes não eram aguardados. A tela podia declarar conclusão sem confirmação no banco.
- Retomada após reload não existe no aplicativo atual: ID/respostas vivem em React state, sem GET de retomada. “Voltar” apenas revisita perguntas na mesma sessão. Isso foi preservado, sem implementar outra funcionalidade.

## Alterações mínimas
1. `lead/api/lead.mjs`: POST cria contato com respostas iniciais numa gravação; PATCH exige cookie HttpOnly assinado HMAC-SHA256, válido por24h, cujo ID corresponde ao lead. Cookie SameSite=Strict, Path=/api/lead e Secure para origem HTTPS. Sem GET/listagem pública. Secret/chave administrativa somente no servidor.
2. API exige Origin exato configurado, JSON e campos permitidos; limita corpo32KiB, nome200, telefone40/dígitos10–15, necessidade100, até50 respostas com pergunta500/resposta5.000. Campos desconhecidos, ID de outro lead, token adulterado/expirado e nenhuma linha atualizada falham explicitamente. Erros internos não são retornados ao visitante.
3. `lead/src/lib/leads.ts`: chama a API de mesma origem, sem acesso direto ao Supabase. `useFormFlow` aguarda saves, trava envio/voltar durante gravação, conserva resposta em falha, mostra erro recuperável e só conclui após confirmação. Reenvio do bloco inicial durante a mesma sessão usa PATCH do lead existente. Necessidade e respostas iniciais são criadas juntas, evitando INSERT seguido de UPDATE.
4. `lead/server/dev-api.ts` e `vite.config.ts`: Vite executa o mesmo handler usado na Vercel. Configuração separada `.env.staging.local`, ignorada e privada, criada com credenciais já fornecidas para o staging; original intacto.
5. Migration `20261007232335_external_leads_authorization.sql`: substitui policies/grants antigos de leads, retira acesso anônimo e DML direto do navegador (incluindo grants de coluna). Preserva SELECT para membros ativos, como a tela atual da UZZINA; gravação ocorre pelo servidor. Exige `is_active_member()` da migration03 compatível, falhando antes de alterar policies se ausente. Nenhuma tabela/coluna/RPC nova.

Migration aplicada SOMENTE ao staging via MCP, versão remota20261007232622, registrada no manifest. Não executar db push/repair indiscriminadamente: versões locais/remotas diferem.

## Evidência de testes
| Tipo | Verificação | Resultado |
| --- | --- | --- |
| Código/API HTTP |5 testes Node do handler real; somente banco externo controlado |Passaram: cookie/lead próprio e alheio, falsificação, ausência, expiração, HTTPS Secure, Origin, schema, tamanho, configuração ausente, registro removido e método |
| API/banco reais |POST/PATCH reais no Vite3000 e Supabase; cookie correto/incorreto, ID alheio e Origin |Passaram; dados atualizados somente quando autorizados |
| PostgREST/Auth reais |SELECT com JWT admin e colaborador; anon tenta ler/inserir/alterar; colaborador tenta write direto |Leitura da equipe preservada; anon/DML direto recusados |
| Navegador real |Nome acima do limite, tentativa de avançar, correção e reenvio |Falha não avançou; campos preservados; sucesso só após salvar |
| Navegador real |Percurso completo de redes sociais→estratégia/gestão→contato final |Tela “Recebemos suas informações.”; banco confirmou completed=true e10 respostas |
| UZZINA real |Abrir /app/leads com admin no staging |Lead concluído, contato e10 respostas exibidos |
| Compilação |Lead: typecheck/build; UZZINA: lint/typecheck; ambos diff --check |Passaram |
| Advisor staging |Após migration |Oito avisos anteriores de definer e proteção de senha vazada desativada; não surgiu aviso novo de leads |

Tests Node controlam a fronteira do banco e não são apresentados como banco real. Integração/browse acima são evidências separadas. A ausência inicial do endpoint foi constatada antes da implementação; não rotular erro de import como teste funcional TDD. A suíte267 da UZZINA já havia passado no passo1; nesta entrega, o seu runtime não mudou.

Dois leads da API e dois do navegador foram removidos após conferir resultados. Conferência final: zero leads descartáveis desta rodada. Não foram usados contatos reais nem enviado WhatsApp. Sem chamadas OpenAI nesta etapa.

## Publicação coordenada — ainda pendente
1. Endereço confirmado pelo proprietário: `https://lead.cnvt.com.br`. Configurar exatamente `LEADS_ORIGIN=https://lead.cnvt.com.br`, sem caminho/barra final. Nada secreto deve ser enviado no chat.
2. Configurar no servidor Vercel do projeto **lead**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LEAD_SESSION_SECRET (aleatório, pelo menos32 caracteres, independente da chave do banco) e LEADS_ORIGIN. Nenhuma variável privada com prefixo VITE_. Modelo sem valores em `.env.server.example`. Para dev habitual, configurar equivalente em .env.local; não trocar o banco atual para staging.
3. Publicar e verificar primeiro a API/formulário novo. Conferir Secure real em HTTPS, criação, respostas, conclusão e leitura na UZZINA no banco correto. **Não fechar a tabela enquanto o formulário publicado ainda usa o SDK antigo.**
4. Revisar pacote de migrations/autorização contra catálogo atual: helper is_active_member não está no inventário antigo. Aplicar pacote compatível autorizado junto com esta migration; não aplicar a migration isolada em produção. Programar janela curta para evitar sessões antigas ainda em preenchimento. Não restaurar acesso anônimo como fallback permanente.
5. Repetir negativas no ambiente publicado e provar que visitantes não leem/alteram por ID via PostgREST, mantendo captação/consulta da equipe. Somente então declarar a exposição de leads fechada em produção.

## Limites deliberados
- Cookie suporta um preenchimento ativo por navegador; iniciar outro formulário substitui a autorização anterior. Expiração24h exige reiniciar. Retomada entre dispositivos/reload e revogação individual não foram adicionadas; rotação do secret invalida cookies existentes.
- Origin/SameSite protegem o uso pelo navegador; **não impedem bots de simular Origin**. Criação continua pública por necessidade da captação. Revisar proteção de abuso/rate limit/WAF no ambiente publicado; não há contador em memória fingindo proteção distribuída.
- Perda da resposta de criação na rede pode gerar um contato incompleto e novo contato no retry. Não foi adicionado protocolo de idempotência/recovery nesta correção. Writes seguintes são substituições das respostas no mesmo lead, aguardadas pelo app.
- Nenhuma alteração de design/perguntas, nenhuma nova tela/login para visitantes. Safari/mobile/upload ficam na etapa seguinte.
- Fontes oficiais consultadas: [RLS/grants Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [runtime Node Vercel](https://vercel.com/docs/functions/configuring-functions/runtime). Changelog Supabase inspecionado; nenhuma extensão/RPC/adapter novo adotado.


## Publicação informada e conferida — 07/10, após20h50
Proprietário publicou o projeto lead. Conferência HTTPS sem criar dados: GET /api/lead retornou405/METHOD_NOT_ALLOWED; PATCH com Origin correto, ID fictício e sem cookie retornou401/SESSION_REQUIRED. Isso comprova handler disponível e recusa sem sessão, não o percurso completo de captação publicado. Permissões de produção não alteradas nesta conferência.

Arquivo privado preenchido encontrado em /Users/euchicosousa/vercel/lead/.env.local, ignorado pelo Git. O arquivo privado .env.vercel-production.local desse projeto continua com service_role vazia; não confundir versões. Problema confirmado: .env.server.example, versionado no HEAD9c92f64, continha a mesma chave privada e o mesmo segredo de cookie do .env.local. Valores não exibidos em logs/chat. Arquivo de exemplo sanitizado localmente; arquivos privados preservados e chmod600. A limpeza ainda precisa ser publicada e não elimina os valores do histórico. Coordenar substituição/revogação da chave exposta e rotação do segredo antes de declarar encerramento; service_role pode ser compartilhada com outras aplicações, então não rotacionar JWT global às cegas. Nenhuma rotação automática nem reescrita de histórico executada. Próxima ação prioritária passa a ser sanar esta exposição, depois repetir o fluxo real publicado e coordenar RLS.


## Limpeza Git autorizada e concluída —07/10
Proprietário autorizou reset/remoção do necessário em leads. Varredura de todos os blobs alcançáveis confirmou segredos conhecidos somente no .env.server.example introduzido pelo último commit9c92f64. Branch remota única main, sem tags/stashes/refs adicionais anunciadas. Último commit substituído preservando código e quatro commits anteriores; .env.server.example removido inteiramente e .gitignore bloqueia todos os .env*. Remoto atualizado com force-with-lease; HEAD final7c80f7fef126f4d5645fd8e7c7cf18e33a470443. Sem novos env versionados.

Reflogs locais expirados e objetos órfãos podados; commit antigo9c92f64 não existe mais no armazenamento Git local. Varredura final em todas as refs: zero blobs contendo os dois segredos conhecidos; checkout limpo; env privados preservados/ignorados. Atualização intermediária a2c0fe2 também substituída pelo HEAD final. Isso limpa histórico ativo/local e branch remota; não garante purga de caches GitHub, cópias externas ou deploys antigos. Rotacionar/revogar credenciais continua necessário; GitHub orienta que force-push não remove necessariamente views por SHA e cópias externas. Nenhuma rotação/RLS/deploy manual realizado nesta limpeza; push pode acionar a integração existente da Vercel.


## Conferência das pendências de produção —07/10
Leads permanece em HEAD7c80f7f, checkout limpo. API HTTPS confirma GET405 e PATCH sem cookie401; nenhuma criação real em produção foi feita. `.env.local` contém chave/segredo iguais à cópia anterior da UZZINA. Teste de credencial somente com SELECT id LIMIT0 no projeto atual:401 com mensagem “Legacy API keys are disabled”. Payload da chave confirma service_role/projeto correto; não é a chave de staging. Portanto não afirmar que essa chave está ativa: é legado desativado, e precisa ser substituído pela chave secreta moderna do projeto. Não reativar legacy keys para contornar. A configuração efetiva da Vercel não foi lida; env local não prova qual valor está publicado.

Consulta com chave pública LIMIT0 foi aceita200: grant/endpoint anônimo ainda acessível; sem ler dados pessoais nesta rodada, a extensão de acesso por linha continua baseada no inventário anterior de policies amplas. Fechamento não aplicado a produção. MCP conectado lista somente o staging, não o projeto atual; aplicação de SQL no banco atual depende de acesso apropriado/execução do proprietário.

Pendências concretas:1 obter/configurar chave secreta moderna e verificar API;2 renovar LEAD_SESSION_SECRET exposto e publicar;3 testar criação/respostas/conclusão reais e leitura pela UZZINA;4 aplicar autorização de leads compatível ao catálogo atual, sem exigir rollout cego do pacote inteiro;5 repetir negativas após fechamento. A migration atual depende de is_active_member, ausente no inventário original: adaptar/validar pré-requisito antes de executá-la. Origem/cookie não substituem permissões da tabela.


## Compatibilidade moderna preparada —07/10
API do projeto lead atualizada para aceitar `sb_secret_` no header apikey sem apresentá-la como JWT no header Authorization. Nome da variável SUPABASE_SERVICE_ROLE_KEY preservado; chaves legadas continuam usando o caminho anterior. Mudança restrita a api/lead.mjs, tests/lead-api.test.mjs e docs/SECURITY-LEADS.md.

TDD: teste do endpoint real POST com fronteira externa controlada reproduziu503 antes da correção (esperado201); depois,6 testes passaram. Typecheck, build e git diff --check passaram. Isso verifica o contrato HTTP do handler, não certifica a chave moderna no Supabase real nem produção.

Novo segredo de cookie gerado uma vez, armazenado em /Users/euchicosousa/vercel/lead/.env.vercel-production.local, ignorado pelo Git e protegido com modo0600. URL e origem de produção preenchidas; chave moderna ainda vazia. .env.local não modificado nesta etapa, pois o proprietário foi orientado a inserir nele a nova chave. Segredo preparado ainda não importado na Vercel; cookies publicados ainda não foram invalidados. Nenhum valor secreto exibido.

MCP confirmou somente staging disponível; não permite criar a Secret key do projeto atual. Solicitação ao proprietário: Settings → API Keys do Supabase atual, criar Secret key, substituir somente SUPABASE_SERVICE_ROLE_KEY em lead/.env.local e avisar, sem colar segredo no chat. Após isso: conferir credencial sem ler dados pessoais, preencher arquivo privado preservando segredo gerado, coordenar importação/redeploy, testar captação publicada e fechar permissões. Código desta correção ainda sem commit/push; produção e migration permanecem intactas.


## Nova chave validada —07/10, após21h18
Proprietário salvou Secret key moderna em lead/.env.local. Consulta ao projeto atual com apikey somente, SELECT id LIMIT0: HTTP200; nenhum contato lido e nenhum valor privado exibido. Arquivo ignorado lead/.env.vercel-production.local preenchido com a chave validada e o novo segredo previamente gerado. Segredo novo sincronizado no .env.local; ambos modo0600 e git check-ignore confirmado.

Isso valida autenticação da chave no banco atual; não comprova configuração efetiva da Vercel ou captação publicada. Próxima ação do proprietário: importar as quatro variáveis de .env.vercel-production.local no projeto Vercel de leads, ambiente Production. Código da compatibilidade moderna ainda local, sem push; publicar depois da importação. RLS de produção não alterado.


## Publicação e integração HTTPS homologadas —07/10, após21h21
Proprietário confirmou importação das quatro variáveis privadas na Vercel Production. Correção de headers enviada ao remoto main com commit3b25f03 (push normal). Nenhum arquivo env versionado; checkout lead limpo após commit.6 testes Node passaram, tipagem e diff passaram; primeira execução restrita não abriu porta (EPERM), não contabilizada como falha funcional, repetição autorizada passou. Build havia passado na preparação desta mesma mudança.

API publicada real: POST201, cookie HttpOnly/Secure/SameSite=Strict/Path=/api/lead; PATCH sem cookie401, Origin diferente403, ID alheio403, cookie adulterado401; PATCH correto200 e leitura privada confirmou completed=true/resposta exata. Registro fictício removido com204. Sem ler contatos existentes.

Navegador real em https://lead.cnvt.com.br: contato fictício e caminho “Não sei ainda” concluídos; interface mostrou “Recebemos suas informações.”. Banco confirmou um lead completed=true com7 respostas. Registro fictício removido com204. Evidência temporária /tmp/leads-publicado-concluido.jpg. Não enviou WhatsApp nem abriu automação de contato. Este percurso não representa todas as ramificações/mobile/Safari.

Próxima pendência: fechamento de grants/policies de leads em produção com SQL compatível ao catálogo atual. Migration do staging exige is_active_member, ausente no inventário de produção; não aplicar pacote inteiro sem revisão. MCP continua sem acesso administrativo ao projeto atual. Permissões não alteradas; leitura da equipe/UZZINA após fechamento e negativas anônimas de PostgREST ainda pendentes. Não declarar item2 totalmente encerrado.


## Fechamento isolado preparado para aprovação —07/10
Arquivo: supabase/rollouts/close-production-leads.sql. Rollout manual transacional, não modifica a migration já aplicada no staging e não executa o pacote inteiro. Retira grants de tabela/coluna e policies anteriores de leads; mantém SELECT da equipe ativa e DML service_role. Identidade ativa é verificada por EXISTS em people(user_id,visible), respeitando SELECT/RLS existentes de people. Sem criar/redefinir helpers ou modificar people. Prechecks exigem tabelas, tipos UUID/boolean e SELECT de authenticated em people. Dados não são removidos.

Teste real SQL no staging PostgreSQL17.11, com BEGIN/ROLLBACK: anônimo SELECT/INSERT recusados por insufficient_privilege; membro ativo leu lead fictício, UPDATE direto recusado; UUID sem membro não viu o lead; service_role alterou o registro. Tudo, incluindo políticas/grants/fixture, desfeito. Retorno PASS. Verifica o novo SQL sob contrato de people do staging; não certifica catálogo vivo de produção PostgreSQL15.1.

Próximo passo concreto para o proprietário aprovar: executar o arquivo completo no SQL Editor do projeto atual dfepmjcozszswocwvdpq. MCP conectado não tem acesso administrativo a esse projeto. Não usar staging nem substituir variáveis do formulário. Após sucesso, agente repete captação pública/negações PostgREST; proprietário confirma listagem/detalhe na UZZINA publicada com sua sessão atual (não enviar senha). Se o precheck ou SQL falhar, devolver erro sem tentar aplicar outras migrations. Nenhuma aplicação em produção feita nesta preparação.

Regra de produto preservada: visitante não precisa de login, pois POST/PATCH públicos autorizados continuam pela API do servidor; retirada de grants anon bloqueia somente acesso direto à tabela. Fonte: https://supabase.com/docs/guides/database/postgres/row-level-security .


## Aplicação autorizada pelo proprietário —07/10
Proprietário autorizou concluir fechamento de leads (referiu-se a “links” no contexto de leads). Nova listagem MCP confirmou somente zacrrtilppvekiyoybzn; não há acesso administrativo ao banco atual dfepmjcozszswocwvdpq. SQL isolado já testado e disponível em supabase/rollouts/close-production-leads.sql. Execução deve ser feita pelo proprietário no SQL Editor do projeto atual; devolver sucesso/erro. Não usar chave secreta da Data API como credencial de SQL nem criar endpoint de execução SQL. Após confirmação, repetir testes reais e atualizar estado final. Produção ainda não modificada nesta solicitação.


## Backup manual antes da aplicação —07/10
Proprietário solicitou backup do Supabase antes de aplicar o fechamento. .env.backup.local privado/ignorado modo0600 preparado para host de Session pooler5432 e senha PostgreSQL (não Secret key API). Binários PostgreSQL15.1 pg_dump/pg_dumpall/pg_restore disponíveis em /private/tmp/uzzina-pg15-runtime/install/bin. Nenhum backup ou mudança em produção executado; aguarda configuração privada de conexão. Exportação de banco não inclui arquivos binários de Storage/Cloudinary nem configurações externas Vercel; não declarar backup integral do serviço.


## Backup manual concluído —07/10,22h19
Conexão privada preenchida pelo proprietário; DB_HOST vinha como URI completa e foi normalizado ao hostname após confirmar usuário do projeto atual/porta Session pooler5432. Senha mantida separadamente, sem logs. Ferramentas temporárias PostgreSQL15.1 não suportavam SSL; tentativa abortou antes de exportar. Ferramentas Homebrew libpq18.6 com SSL instaladas; libpq/krb5/readline e icu4c@78, sem alterar PATH dos shells. Primeira instalação encontrou conflito de ca-certificates; conclusão usou bibliotecas OpenSSL existentes. Conexão final exigiu SSL require. PostgreSQL de origem major15 confirmado.

Pasta privada fora do Git: /Users/euchicosousa/Documents/UZZINA-backups/2026-10-07_22-19-44. Arquivos: database.dump (custom,4.918.094 bytes), schema.sql (333.121 bytes, gerado do mesmo archive), roles.sql (4.994 bytes, roles-only sem senhas das roles), archive-index.txt (52.183 bytes), manifest.json (escopo/limites/tamanhos/SHA256). Diretório0700/arquivos0600. pg_restore leu o índice e decodificou archive inteiro sem restaurar; hashes conferidos. Índice inclui dados de public.leads, auth.users e policies. Nenhum conteúdo pessoal exibido; não versionar/anexar backup ao chat.

Backup lógico do banco, não backup integral do serviço: arquivos Storage/Cloudinary, configurações de painel/Auth e segredos Vercel não incluídos. Senhas globais de roles deliberadamente excluídas; dados Auth do banco presentes e privados. Restore em banco descartável ainda não executado, portanto não certificado como restauração homologada. Pasta anterior22-18-36 foi tentativa vazia abortada por ausência de SSL, não é backup válido. Permissões de leads não modificadas. Agora há conexão SQL local autorizada ao projeto atual, além do MCP que continua staging; aplicação futura pode ser executada pelo agente sem pedir a senha novamente, após conferência final do catálogo/backup.


## Fechamento aplicado pelo proprietário e verificado —08/10/2026
Proprietário informou execução do SQL. Conferência administrativa do catálogo no projeto atual dfepmjcozszswocwvdpq confirmou public.leads com RLS, uma policy SELECT TO authenticated baseada em people(user_id,visible), anon sem SELECT/INSERT/UPDATE/DELETE e sem grants de coluna/PUBLIC, authenticated somente SELECT, service_role INSERT/UPDATE preservados. Nenhuma aplicação DDL adicional feita pelo agente nesta validação.

Testes reais após fechamento:
- API HTTPS pública: POST201, cookie HttpOnly/Secure/SameSite=Strict/Path correto; PATCH200 completou registro fictício e banco confirmou resposta exata/completed=true. Sem cookie401, cookie adulterado401, ID alheio403 e origem diferente403. Registro removido204.
- PostgREST com chave pública sem sessão: GET LIMIT0, POST, PATCH e DELETE recusados401 com código PostgreSQL42501 (permissão negada, não chave inválida). IDs inexistentes usados em alteração/exclusão; nenhum contato real lido.
- SQL no PostgreSQL atual, BEGIN/ROLLBACK, fixture exclusiva: membro ativo existente com request.jwt.claim.sub/role authenticated leu o lead; UPDATE direto recusado; UUID sem membro não viu o lead. Rollback removeu fixture. Isso verifica autorização física com contexto SQL, não login GoTrue/JWT/browser dessa pessoa.

Conclusão: acesso anônimo direto a leads fechado em produção; captação pública via servidor continua funcionando. Conferência de interface UZZINA publicada com sessão real ainda pendente: proprietário abrir Leads e um cadastro existente, confirmar ausência de erro e dados visíveis. Não certificar outras tabelas, migrations, WAF/bots, Safari ou todas as ramificações do formulário por estes testes. Backup privado anterior preservado. Scripts usados nesta sessão: /tmp/check-leads-permissions.py, /tmp/check-leads-team.py e /tmp/check-leads-published.py; nenhum contém valores secretos, carregam configuração privada ignorada.


## Distinção entre publicação Leads e UZZINA —08/10
Proprietário perguntou sobre commit/push das mudanças ainda locais. Catálogo atual confirmado em leitura administrativa: consume_ai_usage, update_my_preferences, admin_update_client_account, admin_update_person e is_active_member não existem; tabelas ai_usage, dash_sessions e review_links não existem. get_app_bootstrap existe, sem compatibilidade completa reavaliada nesta consulta. Portanto fechamento de leads não autoriza declarar o pacote completo UZZINA pronto para produção. Commit local pode preservar trabalho; push que acione deploy deve aguardar rollout compatível do restante do banco/configuração e testes. Nenhum commit/push UZZINA realizado nesta conferência. Projeto lead separado já publicado.
