# Carregamento local dos formulários — ticket01

## Causa reproduzida

Autorizado em28/10/2026, após capturas de falha de import dinâmico em RichTextEditor e ActionFormDrawer. Na reprodução com navegador isolado contra o Vite habitual, tiny-invariant retornou HTTP504 e interrompeu a navegação. Os módulos TSX diretamente respondiam200; o erro estava na dependência otimizada transitiva, não em uma falha de sintaxe demonstrada nesses formulários.

O servidor ativo (porta5176, checkout habitual) mantinha metadados de dependências cujos arquivos já não existiam em node_modules/.vite. A tentativa anterior de iniciar outro Vite registrou reotimização por configuração alterada antes de falhar pela porta ocupada. No Vite instalado, loadCachedDepOptimizationMetadata remove o cache quando há reotimização, antes da verificação final de porta. Uma inicialização rejeitada pode portanto afetar o servidor anterior. Checkouts de teste também compartilhavam node_modules, incluindo o cache padrão.

Reprodutor mínimo em scripts/check-dev-module-loading.cjs inicia o Vite real com porta/cache temporários, solicita a dependência real de PartnerCalendarBoard e tenta outra inicialização com --force na mesma porta. Antes da correção: dependência inicialmente200, segunda inicialização rejeitada, nova requisição504 Outdated Optimize Dep. Query adicional força novo processamento no servidor, evitando mascarar arquivos ausentes com a resposta já mantida em memória. Force representa explicitamente a reotimização por mudança de configuração/lockfile observada; não é necessário que o usuário tenha usado --force.

## Correção

bun run dev passa pelo launcher Node scripts/dev-server.cjs, que verifica host/porta antes de carregar o Vite. Se já ocupada, termina sem executar o otimizador. Preserva modo production, origem habitual, envs e encaminhamento de sinais/argumentos. O Vite usa .cache/vite por checkout, já ignorado pelo Git, para não compartilhar artefatos via node_modules. Não há alteração de lazy imports, atalhos, fábrica de rascunhos, identidade, guardas ou persistência dos formulários; não foi acrescentado retry com recarga automática que descarte edição.

A configuração foi recarregada pelo servidor local existente. Uma página que já guardou uma Promise rejeitada de import pode precisar ser recarregada uma vez após o servidor se recuperar; nenhum dado real foi editado pelo teste.

## Verificação e limites

Regressão antes: HTTP504, assertion200 falhou. Depois: tentativa duplicada termina antes do Vite e nova requisição retorna200; ambos os módulos dos formulários continuam200. Comando: bun run test:dev-imports.

Chromium no Vite real, não somente no preview:1440px no servidor habitual e390px em servidor/cache novos isolados, abrindo parceiro primeiro. Jornadas reais com busca, principal/secundária e atalho, reabertura na mesma sessão e após page.reload passaram, sem resposta de módulo com erro, erro de página ou escrita ao abrir. Backend externo totalmente controlado. Browser flag DRAWER_TEST_LAZY_ONLY reutiliza os componentes/SDK reais da jornada existente. Não demonstra todas as possíveis causas futuras de falha de rede/import, nem certifica banco, provedor ou navegação em Safari.

Referência primária: [Vite — dependency pre-bundling](https://vite.dev/guide/dep-pre-bundling) e [opções de otimização](https://vite.dev/config/dep-optimization-options); mecanismo de remoção/erro504 conferido também no código da versão instalada.

Sem SQL, alteração de credenciais/envs, consulta/escrita real, commit, push ou deploy. Alterações paralelas de Hoje/Kanban e entregas anteriores foram preservadas. Tickets de modal de data comemorativa, Ajuda e Notificações continuam sem implementação nesta rodada.

Verificação final:491 testes em43 arquivos,1725 assertions, sem falhas. Format/format:check/lint/typecheck/build e7 verificações serverless passaram; aviso conhecido de chunks acima de500kB permanece. Regressão real de inicialização e navegador dev1440px/390px passaram. Validação pelo proprietário em sua sessão original pendente.
