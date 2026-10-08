# Correção da regressão de IA — execução pelo Gemini

Data: 07/10/2026. Projeto: `/Users/euchicosousa/vercel/uzzina`.
Execute somente esta correção. Não redesenhe a solução nem prossiga para outros tickets.

## Resultado exigido e direção definida

Restaurar a geração no Vite local habitual com o `.env` que já funcionava. Conservar validação de entrada/saída, autenticação, usuário ativo e mensagens seguras. Manter quota persistente obrigatória no staging e na Vercel.

A única exceção à quota é **compatibilidade local explícita**, ativada pelo adaptador de desenvolvimento somente no modo Vite `development`. Não é fallback por falha de banco: em modo estrito, falha da quota continua bloqueando a geração. Não criar contador em memória. Não alterar banco, migrations, chaves existentes, modelo ou prompts.

Essa é uma mudança proposta de comportamento local, ainda NÃO implementada. Ela substitui, somente para esse modo local, a exigência geral de quota do AGENTS.md. Atualize essa regra ao executar para não deixar instruções contraditórias. Nenhuma exceção está autorizada em produção.

## 1. Leia somente o contexto necessário

1. Leia `docs/audits/CURRENT.md` e este documento.
2. Leia `api/ai.ts`, `vite.config.ts`, `server/dev-api.ts`, `app/services/ai-client.ts`, `app/lib/ai-contract.ts`, `tests/ai.test.ts`, `tests/ai-client.test.ts`.
3. Consulte a versão anterior com `git show HEAD:api/ai.ts`. Ela autenticava com chave pública + Bearer e verificava `people.visible`; não exigia service_role/quota.
4. Leia a migration `supabase/migrations/20261007010000_ai_usage.sql` apenas para entender o contrato estrito; não a execute.
5. Não varra node_modules, dist ou todos os relatórios. Não restaure arquivos inteiros de HEAD: há correções posteriores que precisam sobreviver.

## 2. Registre a situação inicial

1. Registre HEAD e `git status --short` no relatório final. O checkout contém alterações anteriores de outros tickets; preserve-as.
2. Nunca imprima valores de `.env`, senhas, JWTs ou chaves. Verifique somente presença de variáveis quando necessário.
3. Causa já comprovada: a API nova retorna503/AI_CONFIGURATION_MISSING no ambiente original antes de autenticar/chamar OpenAI, porque passou a exigir service_role. Mesmo acrescentando essa chave, a quota nova exigiria uma RPC compatível.
4. A chave OpenAI e a chave pública originais existem. Não atribua a regressão a um `.env` incorreto. Staging já tem quota/chave privada e gerou legenda real com200. Vercel usa código anterior e funciona, segundo o proprietário.

## 3. Escreva testes antes de mudar a API

Use o handler real `api/ai.ts` nos testes existentes; controle apenas Supabase/OpenAI externos. Não copie o algoritmo para dentro do teste.

Adicione os casos abaixo e execute-os antes da correção. Os casos locais devem falhar no código atual pelo503 indevido:

1. `NODE_ENV=development`, `UZZINA_LOCAL_AI_COMPAT=true`, sem `VERCEL`, sem service_role, com chave pública/OpenAI e usuário ativo: legenda retorna200; cliente Supabase recebe chave pública e Bearer; quota NÃO é chamada; OpenAI é chamada uma vez.
2. Mesmo cenário com token inválido:401; nem quota nem OpenAI chamados.
3. Mesmo cenário com usuário inativo:403; nem quota nem OpenAI chamados.
4. Sem chave pública no modo compatível:503/AI_CONFIGURATION_MISSING, sem chamada OpenAI.
5. `NODE_ENV=production` e flag compatível=true, mas sem service_role:503 e zero chamadas OpenAI. Flag não pode desligar proteção na produção.
6. `VERCEL=1`, inclusive com NODE_ENV=development e flag=true, sem service_role:503 e zero chamadas OpenAI.
7. Flag=false em development: modo estrito; sem service_role retorna503.
8. Modo estrito com quota disponível: reserva é realizada ANTES de chamar OpenAI; retorno válido200.
9. Modo estrito com quota indisponível/RPC ausente:503/AI_QUOTA_UNAVAILABLE; OpenAI não é chamada; NÃO entra no modo compatível.
10. Modo estrito com quota esgotada:429 e Retry-After; OpenAI não é chamada.

Preserve os testes atuais de limites, JSON, entrada/saída inválida, sessão, acesso e erros seguros. Capture parâmetros de createClient e contagem/ordem de RPC/provedor nos mocks existentes. Restaure TODAS as variáveis alteradas no afterEach: NODE_ENV, VERCEL, UZZINA_LOCAL_AI_COMPAT, chave pública e demais variáveis usadas. Não deixe o .env real decidir o modo dos testes.

## 4. Ative a exceção somente no adaptador local

Em `vite.config.ts`, dentro de `localApiPlugin.configureServer`, após carregar o env:

1. Defina `process.env.UZZINA_LOCAL_AI_COMPAT` como `"true"` apenas quando `server.config.mode === "development"`; nos demais modos, defina explicitamente `"false"`.
2. Esse valor é configuração interna do processo. Não use prefixo VITE_, não exponha ao frontend, não aceite flag no body/header/query do pedido.
3. Quando ativado, escreva um único aviso no início do servidor: compatibilidade de IA local ativa; quota persistente não aplicada nesse modo. Não registre segredos nem avise a cada pedido.
4. `--mode staging` precisa continuar estrito, mesmo após alternar modos/reiniciar o servidor.
5. Não modifique outros handlers ou o roteamento do adaptador.

## 5. Corrija a API com o menor desvio possível

Em `api/ai.ts`:

1. Calcule `localCompatibility` pela expressão exata:
   `process.env.NODE_ENV === "development" && process.env.UZZINA_LOCAL_AI_COMPAT === "true" && !process.env.VERCEL`.
2. Chave pública: `SUPABASE_PUBLISHABLE_KEY || VITE_SUPABASE_ANON_KEY`, preservando os nomes do fluxo anterior.
3. Continue exigindo chave OpenAI e URL em ambos os modos. No modo compatível exija chave pública; no modo estrito exija service_role e limite diário válido.
4. Selecione a chave do cliente Supabase existente: pública no compatível, service_role no estrito. Use `persistSession:false` e `autoRefreshToken:false`. No compatível, acrescente `global.headers.Authorization = Bearer token` para que a consulta de people tenha a identidade/RLS do usuário.
5. Continue usando `auth.getUser(token)` e a consulta de `people` pelo ID autenticado. Preserve401/403 e erros de infraestrutura. Nunca confie em user_id recebido do navegador.
6. Execute o bloco atual de consume_ai_usage/429 SOMENTE quando `!localCompatibility`. Preserve p_user_id derivado de getUser, limite de servidor, UTC e falha fechada503 no modo estrito.
7. Não envolva a RPC em catch que libere geração. A escolha do modo ocorre antes do pedido ao banco e independe de sucesso/falha da RPC.
8. Preserve todos os contratos Zod, 64KB, validação da saída e mensagens seguras. Modelo gpt-6-luna/prompts e fluxo do drawer ficam intactos.
9. Reutilize o handler atual. Não crie segunda API de IA, cópia dos prompts, framework de quotas ou nova biblioteca.

## 6. Preserve os erros legíveis

1. Preserve AI_CONFIGURATION_MISSING e AI_QUOTA_UNAVAILABLE e a tradução por allowlist em ai-client.ts.
2. Nunca mostre corpo livre de erro do provedor/Supabase na UI.
3. Não transforme sessão expirada em erro de configuração.
4. Não altere a comparação de conflitos, datas, menu ou outros recursos desta rodada.

## 7. Execute a verificação de código

Nesta ordem:

1. Testes específicos de IA: `bun test tests/ai.test.ts tests/ai-client.test.ts`.
2. Suíte completa: `bun test`.
3. `bun run typecheck`.
4. `bun run lint` — sem erros/avisos novos.
5. `bun run build`.
6. `git diff --check` e revisão do diff SOMENTE dos arquivos tocados nesta entrega.

Baseline anterior:256 testes/0 falhas/780 asserções,21 arquivos. Não use isso como contagem esperada depois de adicionar testes. Aviso de chunks maiores que500KB já existia. Não aumente timeouts para esconder falha. Não marque geração real como verificada por mocks.

## 8. Separe os testes reais para o proprietário/Codex

Se não tem navegador ou credenciais do banco original, marque estes casos como PENDENTES; não simule resultados:

1. Local habitual/default development: entrar com conta ativa, abrir ação, Instagram → Legenda → Gerar legenda. Deve preencher texto, sem503. Conferir também geração de estratégia e conteúdo. Guardar texto anterior e verificar salvamento/reabertura.
2. Sessão expirada: sair/entrar novamente; geração sem sessão deve ser recusada. Não encerrar sessões globalmente por SDK de diagnóstico; isso derrubou a conta de teste na rodada anterior.
3. Entrada inválida/excessiva: API deve recusar antes do provedor; texto do editor permanece. Usar chamadas negativas controladas, sem JWT/segredos no relatório.
4. Staging5180 (`--mode staging`): conferir que a flag interna é false e a quota continua sendo chamada. Limite/falha de RPC não podem liberar geração sem quota. Não alterar/remover a RPC real para provocar falha; esse cenário negativo fica coberto no código.
5. Vercel: somente revisão do código que força modo estrito. Não publicar para provar o teste; registrar produção não implantada.

O servidor de staging atual usa Node/Vite. Não iniciar staging por Bun: Bun pode pré-carregar .env e misturar projetos. Não altere `.env` nem acrescente chave de staging ao ambiente original. Teste real de geração usa créditos OpenAI; não rode loops de geração.

## 9. Atualize a continuidade

1. Atualize AGENTS.md: explicite a única exceção local acima e mantenha quota obrigatória no staging/Vercel, sem fallback por erro. Não deixe a regra antiga afirmar quota em todos os modos.
2. Atualize docs/audits/CURRENT.md e `.scratch/correcoes-auditoria-2026-10-06/issues/14-ia-validada.md`: código corrigido, casos reais pendentes e limites de implantação.
3. Não reescreva relatórios antigos; acrescente correção do estado onde houver referência necessária.
4. Não aplique migrations, não copie chaves, não crie contas, não altere produção, não faça commit/push/deploy.

## 10. Entregue o retorno exato para revisão

Crie `docs/audits/2026-10-07-retorno-gemini-correcao-ia.md` com:

1. HEAD inicial/final e lista dos arquivos que VOCÊ mudou nesta tarefa.
2. Causa em duas frases: requisito novo introduzido antes da implantação coordenada; .env antigo atendia ao contrato anterior.
3. Descrição do guard local e como staging/Vercel permanecem estritos.
4. Tabela dos dez casos do passo3: resultado e nome/local do teste. Distinguir mock de integração real.
5. Comandos executados, contagens e códigos de saída; falhas e correções realizadas. Não inventar aprovação.
6. Tabela dos testes do passo8: executado/aprovado/falhou/pendente, ambiente e evidência. Sem navegador = pendente.
7. Variáveis/arquivos de env alterados: deve ser NENHUM. Banco/produção modificados: deve ser NÃO.
8. Riscos/pendências: quota não existe no modo compatível local por decisão explícita; staging/Vercel continuam obrigatórios; geração real habitual precisa de conferência.
9. Resultado final: “Código verificado; testes reais [listar] pendentes” quando aplicável. Não escrever “tudo concluído” se só os testes controlados passaram.

Se um requisito não puder ser implementado exatamente, não invente outro caminho. Registre o bloqueio concreto nesse retorno, preserve o que passou e pare. Esse arquivo será a entrada da revisão posterior pelo Codex.
