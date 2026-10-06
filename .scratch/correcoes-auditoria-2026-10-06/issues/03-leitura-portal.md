# 03: Cliente lê somente ações dos seus parceiros

**What to build:** Calendário e detalhe mostram dados autorizados do cliente da sessão, sem consultas diretas anônimas.

**Blocked by:** 02

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

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
- [ ] Portal não chama SDK browser para ler actions/partners.
- [ ] Tentar ID ou parceiro alheio não retorna conteúdo.
- [ ] Datas inválidas e períodos excessivos retornam400.
- [ ] Calendário mantém conteúdo e paginação completa.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

