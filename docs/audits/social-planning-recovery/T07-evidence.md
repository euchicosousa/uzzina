# Planejamento por tema — geração e recuperação em 19/11/2026

Base `e43b389`, alterações na main local. A rota e a infraestrutura de IA existentes continuam responsáveis pela sessão, pelos limites e pelo registro de uso. `/api/planning-theme` usa o SDK do provedor, o modelo selecionado no catálogo e a proposta canônica de `social_plans`. A nova migração `20261119215026_planning_theme_requests.sql` mantém o resultado antes da gravação. O navegador conserva somente o ID pendente por usuário e parceiro.

## Verificação

O ensaio `bun /private/tmp/check-uzzina-planning-theme.mjs` chamou o handler e o SDK reais. As requisições Auth, quota, ledger e OpenAI foram interceptadas. O adaptador local para a Data API encaminhou leituras, inserções, retenção e confirmação para o PostgreSQL isolado via PGlite, onde as migrações reais foram executadas. Foram usados dois administradores fictícios, um membro, um parceiro operacional, um arquivado e um com nome inválido. Nenhuma credencial ou requisição real foi usada.

| Caso | Resultado observado |
| --- | --- |
| A01 | Cinco sugestões foram gravadas com os formatos na ordem solicitada. Recuperar a proposta já salva devolveu o mesmo ID com uma chamada ao provedor. |
| A02 | A marca, o contexto e o tom vieram do cadastro fictício no PostgreSQL. O texto editado no direcionamento chegou completo ao SDK. Valores de nome e contexto enviados a mais no corpo não entraram no prompt. |
| A03 | Sem sessão, membro, parceiro arquivado, nome inválido, entrada vazia e retomada por outro administrador foram recusados. Nenhum desses pedidos chamou a IA ou reservou quota. Usuários do navegador não têm acesso à tabela de solicitações nem execução da RPC. |
| A04 | Limite diário e mensal retornaram 429. Falha da franquia retornou 503. Nenhum dos três chamou o provedor nem criou proposta. |
| A05 | Uma resposta com menos itens do que o pedido retornou 502 e preservou as propostas anteriores. A validação de esquema também exige formato conhecido, título, objetivo e briefing. |
| A06 | Falha simulada na confirmação deixou o resultado retido. Retomar confirmou uma proposta e manteve uma chamada de IA, uma reserva e um registro de uso para a solicitação. |
| A07 | Consultar novamente após a confirmação devolveu a mesma proposta. O fluxo no navegador recuperou o mesmo ID após recarga depois de falha de gravação. |
| A08 | Envio concorrente com o mesmo ID e retomada durante a geração retornaram 202. Uma solicitação explícita com outro ID gerou outro resultado. O ensaio terminou com três propostas, quatro chamadas ao provedor, quatro registros de uso e zero duplicatas. A quarta chamada teve saída rejeitada. |
| A09 | Chromium isolado executou a Mesa em `node verify-theme-ai.mjs` na cópia em `/private/tmp/uzzina-planning-debug` com HTTP simulado. A proposta aberta continuou disponível após falha, o mesmo pedido foi retomado após recarga e a resposta atrasada de Alpha não apareceu depois da troca para Beta. A sessão da fixture permaneceu a mesma nesse ensaio. |
| A10 | `bun run test:serverless` empacotou dez handlers, incluindo a nova API, e importou o ESM em Node. A API de Planejamento recusou POST sem sessão. |

O ensaio adicional `bun /private/tmp/check-uzzina-planning-model.mjs` confirmou que Terra chega ao comando do SDK, à reserva mensal, ao registro de uso e ao campo `generationModel` da proposta. Modelo desconhecido e provedor sem configuração pararam antes de consumir quota. `node verify-theme-model.mjs` na cópia isolada confirmou o seletor junto ao botão, Luna como padrão da fixture, Terra no pedido e retomada com o mesmo ID. Sete testes de alinhamento do catálogo, typecheck e lint passaram.

O teste não usa um Supabase hospedado nem confirma texto de um provedor real. O teste editorial e a conferência de sessão real continuam pendentes. A migração Por tema foi exercitada em banco isolado e aplicada ao Supabase de produção após autorização do proprietário, com versão remota `20261119220639`. Antes da aplicação, tabela e RPC ainda não existiam. Tabelas de referência, permissões do papel de serviço e RPCs de quota estavam disponíveis. Depois, o catálogo confirmou zero solicitações, RLS ativa e acesso exclusivo da service role à tabela e à RPC entre os papéis da API. A rota do localhost respondeu HTTP 401 a POST sem sessão. A verificação não gerou uma proposta nem chamou o provedor. A geração Por período continua usando o fluxo anterior.
