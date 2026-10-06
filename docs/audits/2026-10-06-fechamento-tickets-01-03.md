# Fechamento de código dos tickets 01–03

Atualização posterior: corrigida a regressão de parceiros arquivados e a omissão de archived nos endpoints. Ver [correção de visibilidade](2026-10-06-correcao-parceiros-arquivados.md).
Data: 06/10/2026. Trabalho executado sobre `dedaf8b` e a entrega local do ticket03, preservando as mudanças do agente. **01–03 implementados e validados localmente; banco real e produção permanecem pendentes.** Atualização posterior: ticket04 também implementado localmente; ver [fechamento do04](2026-10-06-fechamento-ticket-04.md). Próximo ticket de código:05.

## Mudanças concluídas

**01 — HTML:** removida a configuração DOMPurify que anulava a allowlist. URLs limitadas a HTTP/HTTPS em imagens e HTTP/HTTPS/mailto/tel ou relativos em links. FTP/data/blob recusados. Tags fora da lista removidas. Sem DOM, a função retorna vazio em vez de devolver texto reinterpretável como HTML. Preservados testes de tabela/listas/links legítimos.

**02 — sessão:** erro de revogação não retorna sucesso nem limpa o cookie como se a sessão tivesse sido revogada. Falhas de infraestrutura/configuração retornam503; ausência/invalidade da sessão continua401. Handlers têm limite de tratamento de exceções, validam tipo de credenciais e não expõem erros internos. Fetchers preservam essa distinção. Login não precisa instanciar SDK Supabase no navegador. O layout usa as rotas efetivamente montadas, evitando filho fora de contexto durante a transição; reinicializa após login, ignora bootstrap antigo, publica perfil somente depois de carregar parceiros e limpa dados/cache do portal na saída. Falha de logout aparece com possibilidade de tentar novamente.

**03 — leitura:** mantida autorização no servidor por sessão e parceiro, DTO público e paginação de500. Ordenação date/id evita empate de paginação por data. Datas inexistentes/formatos inválidos são rejeitados antes de consultar ações. Falha de leitura não vira lista vazia. Calendário oferece erro e nova tentativa; conta sem parceiro tem estado vazio, não spinner permanente. Sessão expirada leva ao login. Chaves de leituras/detalhes/comentários do portal incluem identidade.

**Ambiente local:** `server/dev-api.ts` adapta os handlers reais `/api/ai`, `/api/dash-auth` e `/api/dash-data` ao Vite, preservando headers/cookie, query, body, status e JSON. JSON inválido retorna400; caminhos não pertencentes à allowlist seguem para o app. O adaptador não altera o deploy Vercel.

## Evidências

| Verificação | Resultado |
|---|---|
| Suíte Bun | 116 testes, zero falhas; 344 assertions, seis arquivos |
| TypeScript | Passou, incluindo APIs |
| Biome | 234 arquivos, sem erros/avisos |
| Build | Passou; permanece o alerta anterior de chunks grandes |
| App real em Chromium headless | Passou em390×844 e1440×844, com respostas HTTP de teste |
| Handlers locais reais por HTTP | JSON confirmado; sem sessão/configuração recusado; método inválido405; JSON malformado400 |

O script de navegador executa o app real e bloqueia requests externos. Verifica login→portal sem recarga, os payloads de HTML no parser do navegador, falha de logout sem saída falsa, logout válido, falha/recuperação de bootstrap e falha/recuperação de calendário, sem erros não tratados nas transições. O uso de viewport mobile não comprova toque/aparelho físico.

### Testes criados a partir de falhas observadas

- Sanitização/fetchers: primeira execução teve cinco falhas; após correção, o grupo passou.
- Revogação e banco indisponível: três testes de handler real falharam antes da correção e passaram depois.
- Dia inexistente: `2026-02-31` foi aceito antes; o teste falhou, a validação foi corrigida e o teste passou.
- Login real: o script de navegador não encontrou o perfil após login antes da correção; passou após reinicializar o layout.
- API local: smoke HTTP retornou200/text/javascript antes do adaptador; passou a retornar status/corpo de API JSON.

Essas evidências correspondem a esta rodada. Não afirmam que todo teste antigo tenha sido escrito em TDD. Permanecem testes legados de outros tickets que não comprovam o app; a contagem116 não significa cobertura integral.

## Reproduzir

Código: `bun test`, `bun run typecheck`, `bun run lint`, `bun run build`.

Navegador: iniciar `bun run dev --host 127.0.0.1 --port 5176 --strictPort`; executar `node scripts/check-portal-browser.cjs` com Playwright e Chromium disponíveis. Variáveis opcionais: `PLAYWRIGHT_MODULE` aponta para a instalação existente, `PLAYWRIGHT_EXECUTABLE` para Chromium instalado, `PORTAL_TEST_URL` para a origem local e `PORTAL_TEST_WIDTH` para390 ou1440. Nenhuma geração de IA ou gravação no banco é necessária.

As respostas de login/dados no teste de jornada são controladas. O smoke HTTP usa handlers reais sem cookie ou credenciais de usuário; não comprova login/RLS com banco.

## Limites e próximos passos

- Migration `dash_sessions` preparada, não aplicada nesta rodada. Persistência/revogação real e grants/RLS precisam de banco de teste.
- Cookie real entre navegador, Vercel e banco não foi homologado. Produção precisa de `APP_ORIGIN`, configuração de servidor e implantação coordenada de02–07.
- Arquivos/comentários ainda seguem para o ticket04; links de revisão para05; contas/senhas para06; autorização reproduzível para07. Não declarar o portal completamente seguro antes desse conjunto.
- Os casos restantes do ticket17, aparelhos reais e outros engines continuam pendentes. Esta rodada confirma somente os fluxos acima.
- Nenhum deploy ou commit foi realizado. Dados de produção não foram alterados.

Os registros dos tickets01–03 e o README foram atualizados. O checkpoint anterior está preservado como diagnóstico histórico, com ponte para este fechamento.
