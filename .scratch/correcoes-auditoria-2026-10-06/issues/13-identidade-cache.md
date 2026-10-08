# 13: Troca de conta não reutiliza dados privados

**What to build:** Sair ou trocar identidade reinicia contexto e dados; parceiros editados reaparecem sem recarregar tudo.

**Blocked by:** 03, 04, 10

**Status:** concluído localmente em 07/10/2026; banco e produção não homologados.

## Execução prescrita
Arquivos: app/routes/app.tsx; app/routes/dash.tsx; app/lib/query-keys.ts; app/lib/query-client.ts; contexts; consumidores de comentários/detalhe/parceiros.
1. Keys de dados privados incluem identidade estável e audiência: team/userId ou dash/clientId. Comentários mantêm all/public separados. Partners/people/notifications e detalhe não usam key global sem dono.
2. Evento de logout/troca cancela queries, limpa cache privado, reinicializa person/partners/baseAction/seleção e navega. Bootstrap só aplica resposta se generationId e identidade esperada continuam atuais.
3. Token/sessão verificada do portal fornece identidade; não confiar em ID local para compor bootstrap autenticado. Revisão05 fica em escopo review/token sem compartilhar cache do portal/time.
4. initialData só deriva cache de origem com identidade e cobertura de datas compatíveis; manter updatedAt real da origem. Período não consultado exige fetch, não lista vazia inventada.
5. Parceiros usam query identidade atual e invalidation da mutação admin; query reativa atual permanece. Atualizar contador/calendário/contexto quando parceiro é alterado.
6. Auditar consumidores das keys migradas no10; impedir request antigo repovoar nova sessão.

## Testes e alcance
Interface: layouts/providers reais com QueryClient real + rede/Auth externa falsa. A→logout→B sem cards/notaA; bootstrapA atrasado apósB é ignorado; editar parceiro atualiza contexto; initialData fora de cobertura dispara rede.
BANCO: isolamento de policies07 é separado. NAVEGADOR: N12 do17.

## Acceptance criteria
- [x] Nenhuma key privada sem identidade/audiência.
- [x] Respostas da identidade anterior não entram na nova.
- [x] Fonte de parceiros é invalidável e observada pelo contexto.

## Resultado do executor — 07/10/2026

Base: HEAD `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`, com mudanças locais01–12 preservadas. Uma entrega, sem migração de framework e sem instalação de dependências.

### Defeitos reproduzidos e correção
- O navegador real mantinha a contaA ao receber sessãoB: não existia bootstrap de troca. O layout agora limpa dados/estado, carregaB e aceita o bootstrap apenas na geração/identidade esperada; resultado antigo ou de layout desmontado é ignorado. A resposta precisa conter `person.user_id` igual ao usuário autenticado. Refresh da mesma identidade não dispara um bootstrap novo.
- Uma edição pendente deA inseria sua confirmação no cacheB, mesmo após limpar o cache. Respostas/erros/invalidações dessa geração são ignorados. Gerações são fixas por montagem; os providers têm key da identidade, reiniciando seleção, busca e gaveta.
- Lote e duplicação poderiam iniciar a próxima escrita com a nova sessão. Reutilizaram-se as funções existentes com um callback de validação antes de cada escrita/próximo passo; solicitações já enviadas não são desfeitas. Nenhum rollback de snapshot ou novo motor de cache.
- Keys privadas e seus consumidores agora identificam equipe/usuário: ações, parceiros operacionais/admin, pessoas/seletor/admin, notificações, leads, contas/detalhes, comentários internos/públicos e datas comemorativas. Prefixos gerais continuam servindo para invalidação; prefixo não é uma consulta privada. Portal conserva keys `dash…/clientId`, obtido do servidor, e revisão usa `review/token/slug`.
- Parceiros operacionais permanecem na query reativa, invalidada pelo prefixo `partners`; arquivados continuam fora da operação. Removido o `initialData` redundante do layout: o bootstrap validado semeia sua própria key. Não há reaproveitamento de listas de ações entre períodos via `initialData`, nem timestamp inventado; recorte novo faz consulta própria.
- Portal reinicia cache/contexto ao bootstrap, login, logout confirmado e erro401. Bootstrap possui geração/cancelamento; anexos/comentários ignoram callbacks de uma sessão encerrada. Falha de logout mantém a sessão/tela, com erro visível.
- Retornos administrativos e de notificações/comentários deixam de navegar, notificar ou iniciar etapas secundárias depois da troca de sessão.

### Arquivos
- `app/routes/app.tsx`, `app/routes/dash.tsx`, `app/routes/dash/action/$id.tsx`, `app/routes/dash/review.$slug.tsx`.
- `app/lib/query-client.ts`, `query-keys.ts`, `supabase.mutations.ts`; hooks `useActionMutations`, `useActionData`, `useNotifications`, `usePortalSessionError`.
- Consumidores em `ResponsiblesCombobox`, `SprintCombobox`, `BulkActionMenu`, `Content`, `ObservationsTab`, calendários; rotas leads e admin de parceiros/pessoas/contas/datas.
- Testes: `tests/action-cache.test.tsx` (quatro cenários novos no hook real), fixtures de keys em `drawer-component`, `partner-visibility`, `entrega2`; scripts `check-identity-cache-browser.cjs` e `check-portal-browser.cjs`.
- Continuidade: `AGENTS.md`, `docs/audits/CURRENT.md`, README do pacote e nota datada na matriz52. Nenhum novo relatório separado.

### Evidência de código
TDD: teste de UI real falhou ao trocarA→B; teste do hook real falhou ao receber confirmaçãoA no cacheB; testes de lote/duplicação falharam porque iniciavam segunda escrita após reset. Após correção, `bun test`: **232 passam,0 falham,721 asserções,17 arquivos**. Tipagem, lint sem avisos e build passam. Build conserva aviso existente de chunks acima de500kB.

### Evidência de navegador
Chromium real, app local `http://127.0.0.1:5177`, respostas HTTP externas controladas e dados fictícios. Nenhuma escrita real.
- `check-identity-cache-browser.cjs`: desktop1440 e viewport390; contaA→B sem reload; notaA e gavetaA somem; trabalhoB aparece; parceiro invalidado atualiza contexto/busca; logout limpa cache. Em390 o feed inicial é desligado para exibir a categoria design, como na UI existente.
- Mesmo script, `IDENTITY_BOOTSTRAP_RACE=true`: bootstrapA bloqueado, sessãoB carregada, respostaA liberada depois;B permanece. Desktop também confirma request de novembro ao avançar o calendário para um período não consultado.
- `check-portal-browser.cjs`: clienteA sai e clienteB entra sem reload; ID antigo no localStorage é ignorado; queries usam `client-b` verificado e não conservam `test-client`; logout falho/confirmado e recuperação permanecem funcionais, viewport390.
- `check-portal-actions-browser.cjs`: regressão de comentários/anexos passou em390.

Reexecutar com `PORTAL_TEST_URL`, `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE` apontando ao ambiente local instalado. `IDENTITY_TEST_WIDTH=390` seleciona viewport móvel; `IDENTITY_BOOTSTRAP_RACE=true` ativa resposta atrasada. Viewport não certifica aparelho físico ou todo o mobile.

### Limites
Banco/RLS do07 segue pendente em PostgreSQL real. Este ticket não aplica migrations nem cria isolamento multiagência no banco. Produção não foi publicada/validada. Reset impede atualização local e etapas ainda não iniciadas, mas não revoga uma escrita já recebida pelo servidor. Preferências do perfil permanecem no escopo do15; não alegar fechamento de todos os52 achados.

Próxima entrega proposta:14/IA, mediante autorização.
