# 02: Login e retomada só com sessão válida

**What to build:** O cliente entra com senha, retoma sessão válida e sai com revogação; ID local nunca autentica.

**Blocked by:** Nenhum

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: api/dash-auth.ts; app/models/clients.ts; app/routes/dash/login.tsx; app/routes/dash.tsx. Criar server/dash-session.ts (helper fora de api/, não endpoint público), supabase/migrations/<timestamp>_dash_sessions.sql.
1. Decisão: substituir token HMAC próprio por sessão opaca. Login gera randomBytes(32) em base64url; somente SHA-256 desse token fica em dash_sessions. Colunas: id uuid PK, client_id FK clients(id), token_hash text UNIQUE NOT NULL, created_at timestamptz, expires_at timestamptz, revoked_at timestamptz nullable. Expiração: sete dias. RLS habilitada e nenhum acesso anon/authenticated à tabela.
2. Cookie uzzina_dash_session: HttpOnly, SameSite=Lax, Path=/api, Secure em produção, Max-Age=604800. Login/verificação/logout same-origin; cookies nunca são devolvidos no JSON/localStorage. Respostas Cache-Control: no-store. Evitar que helper de login importe código browser.
3. verify resolve cookie→hash→sessão não revogada/não expirada→cliente ativo. Sem sessão:401. Retornar perfil seguro, sem password_hash. Falha de configuração/banco: erro controlado, sem fallback. Logout revoga linha e expira cookie.
4. Login verifica SHA-256 legado somente no servidor; a migração para bcrypt é do 06. Nunca aceitar ID enviado como identidade. Remover caminho getClientById de retomada e uso de uzzina_dash_token como credencial.
5. Bootstrap do portal chama verify com credentials same-origin, trata 401 como saída e 503 como indisponibilidade recuperável. ID pode ser preferência, nunca acesso. Limpar cache do portal no logout; aprofundamento no 13.
6. Para métodos que mudam dados usando cookie, validar Origin contra origem configurada da aplicação; rejeitar origin externo/ausente. Não usar Host arbitrário como allowlist. Variável APP_ORIGIN configurada em produção.
7. Incluir tipos/configuração das APIs na checagem TypeScript do projeto, sem excluir o código servidor. Configuração de sessão não depende de segredo HMAC público.

## Testes e alcance
Interface: handler real de dash-auth e fluxo real de bootstrap; SDK externo e relógio falsos. Casos: login válido, senha errada, ID sozinho, token inventado, expirado, revogado, cliente inativo, banco indisponível, logout. Asserções de status, Set-Cookie e ausência de hash/token no corpo.
BANCO PENDENTE: aplicar migration e testar persistência/revogação.
NAVEGADOR PENDENTE: N02 do 17, cookie/login/logout real.

## Acceptance criteria
- [x] 401 nunca inicia consulta de perfil por ID de fallback.
- [x] Cookie tem atributos definidos; logout invalida sessão antes de responder sucesso.
- [x] Sem service-role/configuração obrigatória, endpoint falha controladamente.
- [x] Integração no banco é registrada separadamente.

## Resultado do executor
Código: implementado.
Teste de código: executado e passou (`bun test tests/entrega2.test.ts`, 35 testes no arquivo e 78 testes no suite global com zero falhas).
Banco: migration preparada em `supabase/migrations/20261006000000_dash_sessions.sql` (tabela `dash_sessions` com RLS e privilégios anon/authenticated revogados); aplicação pendente da etapa 07.
Navegador: pendente conforme N02 do 17 (fluxo de cookie/login/logout em navegador real).
Produção: não implantado (aguardando conclusão de 02–07 e aplicação coordenada de migrations).

Arquivos criados/alterados:
- `supabase/migrations/20261006000000_dash_sessions.sql`: migration da tabela `dash_sessions` com RLS ativado e sem grants públicos.
- `server/dash-session.ts`: helper isolado no servidor para tokens opacos (randomBytes de 32 bytes em base64url), hash SHA-256 de busca, extração e serialização de cookies HttpOnly, e validação estrita de Origin CSRF.
- `types/database.ts`: tipagem declarativa de `dash_sessions` adicionada ao schema de banco do Supabase, eliminando necessidade de `any`.
- `api/dash-auth.ts`: refatorado para gerenciar sessões opacas em `dash_sessions`, emitir cookies `HttpOnly`, `SameSite=Lax`, `Path=/api`, `Max-Age=604800` (e `Secure` em produção), revogar sessões no logout, validar Origin contra requisições forjadas e omitir estritamente qualquer dado sensível do corpo JSON (`password_hash`, tokens ou hashes internos).
- `app/models/clients.ts`: atualizado para realizar chamadas com `credentials: "same-origin"` para `/api/dash-auth` (`login`, `verify`, `logout`) e sem persistir tokens em localStorage.
- `app/routes/dash.tsx`: remoção definitiva do fallback vulnerável `getClientById(supabase, storedId)`; bootstrap valida exclusivamente a sessão com o servidor e limpa credenciais/redireciona para login em caso de 401. Logout revoga a sessão no servidor antes de navegar.
- `app/routes/dash/login.tsx`: removido o armazenamento de `uzzina_dash_token` no localStorage.
- `tsconfig.json`: remoção de `api/**/*` do exclude, garantindo verificação estrita de TypeScript para o backend.
- `tests/entrega2.test.ts`: suíte completa de testes reais para `dash-session` e `dash-auth` (tokens, cookies, validação de Origin, erros de configuração, rejeição de ID avulso, expiração, revogação, cliente inativo e logout).

