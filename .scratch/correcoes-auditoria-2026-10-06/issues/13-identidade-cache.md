# 13: Troca de conta não reutiliza dados privados

**What to build:** Sair ou trocar identidade reinicia contexto e dados; parceiros editados reaparecem sem recarregar tudo.

**Blocked by:** 03, 04, 10

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

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
- [ ] Nenhuma key privada sem identidade/audiência.
- [ ] Respostas da identidade anterior não entram na nova.
- [ ] Fonte de parceiros é invalidável e observada pelo contexto.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

