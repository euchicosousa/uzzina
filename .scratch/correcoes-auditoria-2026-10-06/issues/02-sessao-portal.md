# 02: Login e retomada só com sessão válida

**What to build:** O cliente entra com senha, retoma sessão válida e sai com revogação; ID local nunca autentica.

**Blocked by:** Nenhum

**Status:** implementado e validado localmente; integração/produção pendentes conforme abaixo

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

## Resultado do fechamento — Codex, 06/10/2026
Código: implementado. Revogação falha retorna503 sem confirmar logout; banco/configuração indisponíveis não se tornam401. Frontend diferencia erros, reinicializa bootstrap após login e protege resposta antiga. APIs locais atendidas pelo adaptador Vite.
Teste local: suíte global com **116 aprovados, zero falhas** em seis arquivos; tipagem, lint e build passaram. Há testes legados de outros tickets nesta contagem; 116 não significa cobertura de todo o app.
Navegador: app real em Chromium headless com HTTP controlado, 390×844 e 1440×844; login sem recarga, política HTML, falha/sucesso de logout, recuperação de bootstrap/calendário. Smoke HTTP dos handlers locais reais: JSON, método rejeitado e JSON inválido. Nenhum dado privado consultado.
Banco: migration de dash_sessions preparada; aplicação e matriz de autorização reais continuam pendentes. Banco não é N/A.
Produção: não implantado. Ticket não autoriza deploy isolado do portal; manter implantação coordenada de02–07.
Evidência e comandos: docs/audits/2026-10-06-fechamento-tickets-01-03.md. Script de navegador: scripts/check-portal-browser.cjs (requer Playwright/Chromium disponíveis).
