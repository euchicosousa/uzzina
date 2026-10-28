# Ticket 01 — componente pai do painel de ação

Implementação local em 27/10/2026. Fonte: [levantamento](../plans/action-tabs-and-search-scope.md) e [tickets](../plans/action-tabs-ticket-breakdown.md). Somente ticket 01 autorizado; ticket 02 ainda não iniciado.

## Resultado

`ActionDrawerPanel` coordena posição fixa à direita, overlay, aba selecionada e largura externa do formulário. O mesmo `ActionFormDrawer` mantém conteúdo, arquivos, IA e coordenador de salvamento, agora sem posicionamento próprio. O formulário continua carregado sob demanda, com a fronteira Suspense existente na rota.

Overlay, X, Escape e fechamento após salvar solicitam a mesma operação no pai, que consulta a guarda real do formulário. Comandos repetidos enquanto uma saída está pendente não duplicam fechamento nem escrita. Uma saída que termina depois do unmount não aciona o callback de um painel antigo. A guarda continua disponível à rota para abertura/substituição de ação, com seu controle de identidade e geração preservado.

Atalhos continuam no formulário nesta etapa, delegando fechamento ao pai e respeitando eventos já consumidos por overlays internos. Conflitos conservam o bloqueio de atalhos existente. O direcionamento entre duas instâncias pertence ao ticket 02.

Não houve abertura secundária, filtro da busca, alteração de schema/model, nova rota, fluxo de produto ou primitivo Prism/Uzzina. Este componente é um contêiner interno da gaveta existente; não exige item novo na galeria.

## Verificação

- Antes da refatoração: 35 testes da gaveta/coordenador passaram.
- Depois: os mesmos testes renderizam o pai e o formulário reais; dez casos adicionais cobrem overlay/Escape/X, erro de salvamento, fechamento concorrente, resposta após desmontagem, encaminhamento/limpeza da guarda, mudança de largura sem perda do estado do formulário e comando de salvar sem duplicação. 45 testes pertinentes passaram.
- Suíte geral: 401 testes passaram, sem falhas.
- `bun run format`, `bun run lint`, `bun run typecheck` e `bun run build` passaram. Aviso conhecido de chunks grandes permanece. Diff conferido.
- Chromium isolado, HTTP controlado: caso original de abrir/fechar sem escrita, data no calendário, atualização redundante sem escrita, falha ao fechar preservando texto e retry confirmado passaram. Geometria do pai conferida: à direita, topo de 64px, 672px normal em desktop e 390px no viewport de 390px.
- Cenário social no mesmo navegador: largura Instagram de 896px em viewport de 1440px; 390px no mobile; Conteúdo/Legenda, claro/escuro e retorno a Essencial conferidos. Capturas de desktop claro e mobile escuro inspecionadas visualmente; preview sem mídia na fixture.
- Teste de navegador reproduzível pelo script existente, ampliado com opções `DRAWER_TEST_SOCIAL=true`, `DRAWER_TEST_WIDTH=390` e capturas opcionais por `DRAWER_TEST_SCREENSHOT_DIR`. Há suporte opcional à sessão fictícia em preview compilado; isso não autentica contas reais.

## Diagnóstico do ambiente de navegador

O Comet instalado, lançado em modo headless pela automação, efetuava recarregamentos completos de documento durante o ensaio e perdia a ação aberta. Comparação com os componentes anteriores também variou conforme o cenário. O mesmo código passou no Chromium Headless Shell isolado, com as mesmas chamadas externas controladas. Não foi feita correção de aplicativo para contornar esse comportamento do navegador. Instrumentação temporária de montagem/sessão foi removida; arquivos de comparação ficaram somente em /tmp e foram removidos ao encerrar.

## Limites e próxima etapa

Dados e respostas de Auth/banco foram controlados. Não houve escrita em banco real, upload efetivo, geração real de IA, teste de conflito contra o provedor, validação física de teclado virtual ou publicação. A conferência visual nos dados reais do proprietário continua sendo revisão da entrega local, não uma verificação já realizada. Não houve push/deploy. Próximo ticket: segunda ação pela busca e alternância por abas, somente após a revisão do ticket 01.
