# 03: Cliente lê somente ações dos seus parceiros

**What to build:** Calendário e detalhe mostram dados autorizados do cliente da sessão, sem consultas diretas anônimas.

**Blocked by:** 02

**Status:** implementado e validado localmente; integração/produção pendentes conforme abaixo

## Execução prescrita
Arquivos: app/routes/dash.tsx; app/routes/dash/index.tsx; app/routes/dash/action/$id.tsx; app/contexts/DashContext.tsx. Criar api/dash-data.ts e app/services/dash-client.ts.
1. Endpoint GET autenticado pelo helper 02. Operações discriminadas: partners, actions (partner/from/to), action (id). Query inválida:400; sessão inválida:401; ação/partner fora do escopo:404 uniforme.
2. partners deriva slugs da conta autenticada no servidor; retorna projeção necessária (slug,title,short,image,colors). actions valida parceiro na conta antes de consultar. from/to são datas válidas, início<=fim, máximo 62 dias; páginas de até 500, paginar até completar, sem truncamento silencioso. Preservar semanas completas domingo–sábado, ações não arquivadas e exclusão de idea no calendário.
3. action por ID primeiro verifica interseção action.partners com os parceiros da conta. Só depois retorna campos públicos: id,title,date,category,phase,description,content_description,instagram_caption,content_files,work_files,color,updated_at. description já é publicada na tela atual: preservar nesta rodada; não incluir campos de IA/estratégia/responsáveis/sprints/preferências sem consumo público comprovado. Tipar DTO dedicado, sem cast para Action completo.
4. Front usa dash-client para todas as leituras e context partners. O endpoint usa service-role exclusivamente no servidor e exige autorização explícita. Nunca aceitar clientId do browser para obter escopo.
5. Nenhuma resposta proibida vai ao browser para depois ser filtrada. O detail arbitrário não dispara query de comentários antes de autorização.

## Testes e alcance
Interface: dash-data handler real e calendário/detalhe reais com HTTP falso. Fixtures de cliente A ligado a smartmed e cliente B ligado a toro; consultar ação B como A retorna404 sem DTO. Capturar consulta com período e paginação reais. SQL/RLS é 07.
NAVEGADOR PENDENTE: N03/N04 do 17.

## Acceptance criteria
- [x] Portal não chama SDK browser para ler actions/partners.
- [x] Tentar ID ou parceiro alheio não retorna conteúdo.
- [x] Datas inválidas e períodos excessivos retornam400.
- [x] Calendário mantém conteúdo e paginação completa.

## Resultado do fechamento — Codex, 06/10/2026
Código: implementado. Leitura autorizada por sessão/partner, datas estritas e paginação ordenada por date/id. UI distingue erro, vazio e sessão expirada; cache de leituras do portal usa identidade. Recuperação de calendário e bootstrap comprovada no navegador com HTTP controlado.
Teste local: suíte global com **116 aprovados, zero falhas** em seis arquivos; tipagem, lint e build passaram. Há testes legados de outros tickets nesta contagem; 116 não significa cobertura de todo o app.
Navegador: app real em Chromium headless com HTTP controlado, 390×844 e 1440×844; login sem recarga, política HTML, falha/sucesso de logout, recuperação de bootstrap/calendário. Smoke HTTP dos handlers locais reais: JSON, método rejeitado e JSON inválido. Nenhum dado privado consultado.
Banco: migration de dash_sessions preparada; aplicação e matriz de autorização reais continuam pendentes. Banco não é N/A.
Produção: não implantado. Ticket não autoriza deploy isolado do portal; manter implantação coordenada de02–07.
Evidência e comandos: docs/audits/2026-10-06-fechamento-tickets-01-03.md. Script de navegador: scripts/check-portal-browser.cjs (requer Playwright/Chromium disponíveis).
