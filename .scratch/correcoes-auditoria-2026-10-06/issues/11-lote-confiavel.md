# 11: Lote atua no recorte e informa resultado real

**What to build:** O usuário sabe quais ações foram alteradas e pode repetir somente as que falharam.

**Blocked by:** 08, 10

**Status:** implementado e verificado localmente em 07/10/2026; banco real/produção pendentes

## Execução prescrita
Arquivos: app/components/features/BulkActionMenu.tsx; app/hooks/useMultiSelection.tsx; app/hooks/useActionMutations.tsx; app/lib/supabase.mutations.ts; views que fornecem recorte.
1. Views fornecem eligibleActionIds a partir da lista já filtrada de dados, com versões por ID. Provider/menu recebem recorte explícito. QuerySelector global não decide permissão nem escopo. Interseção vazia retorna[] e desabilita ações.
2. Atualizar chave de contexto de seleção com rota, parceiro, período e filtros relevantes. Mudança limpa ou intersecta seleção; política escolhida: limpar ao mudar contexto. Cmd+A usa eligible IDs, preserva seleção de texto quando foco é input/textarea/contenteditable.
3. Resultado único: {succeededIds, failed:[{id,reason}], conflicts:[{id,currentVersion?}]}. Mutations retornam confirmações, nunca apenas void. Operações de data/hora preservam parte original de cada ação; zero rows é falha/conflito.
4. CAS por item com versão08; fase/categoria/data/hora/responsáveis/cor/Sprint/arquivamento seguem mesmo contrato. Concluir/arquivar limpa Sprint no servidor e no cache.
5. Toast conta succeededIds; remove da seleção só confirmadas, conserva restantes. Falha parcial não trata tudo como rollback completo. Nunca nova tentativa automática de conflito sem decisão de recarga.
6. Gere revisão somente de eligible IDs e chame endpoint05; não gerar URL por IDs.

## Testes e alcance
Interface: provider/menu/hooks reais montados, QueryClient real, SDK externo falso. 5 solicitadas,2 confirmadas,1 conflito,2 erros →toast2 e3 selecionadas; zero elegíveis→zero writes; zero linhas→zero sucesso; filtro muda→seleção vazia; Cmd+A em input mantém texto. Geometria CSS não faz parte deste teste.
NAVEGADOR: N10 do17.

## Acceptance criteria
- [x] Conjunto vazio nunca vira seleção anterior.
- [x] Todos os handlers contam IDs retornados.
- [x] Falhas/conflitos continuam recuperáveis por item.

## Resultado do executor — 07/10/2026

Base inicial/final: `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`. Checkout já continha alterações01–10 e a limpeza autorizada; foram preservadas. Nenhum commit, deploy ou alteração no banco real nesta entrega.

### Implementação
- `useMultiSelection.tsx`: containers publicam ações elegíveis com dados/versões. Atalhos e seleção usam a união desses recortes; sem busca global no DOM. Recorte vazio elimina seleção anterior. Contexto alterado limpa seleção; atualização dos dados intersecta a seleção sem apagar falhas ainda elegíveis.
- `ActionContainer.tsx`, `KanbanPhasesBoard.tsx`, `HomeSprintView.tsx`: registram somente os cards renderizados, incluindo limite de cinco nos containers compactos. Overlays de arraste não registram cópias.
- `app.tsx`, `HomeTodayView.tsx`, `HomeCalendarView.tsx`, `partner/$slug.tsx`: contexto contempla rota/busca/parceiros e controles locais de dia/período/filtros/visualização. No parceiro, calendário oculto no mobile não fica montado para seleção; `useIsDesktop.ts` aceita o breakpoint768 dessa tela, mantendo1024 como padrão.
- `supabase.mutations.ts`: retiradas as três implementações próprias de escrita de lote. Cada item reutiliza `updateActionClient`, validação e versão exata; concluir/arquivar limpa Sprint. Data e hora preservam a outra parte original de cada ação. IDs repetidos são deduplicados; conjunto vazio retorna resultado vazio, sem writes. Cada item é confirmado individualmente, em sequência; sem promessa de transação do lote inteiro.
- `useActionMutations.tsx`: resultado `{succeededIds, failed, conflicts}` para todos os modos. Confirmações individuais e de lote compartilham atualização de cache do10; nenhuma simulação de cards nem rollback de lista inteira.
- `BulkActionMenu.tsx`: sucesso conta somente confirmadas e remove somente essas da seleção. Falhas exibem título/motivo. Conflito bloqueia nova gravação até recarga explícita bem-sucedida; opção de recarga reaparece na tentativa bloqueada. Avisos do lote ficam no topo para não cobrir a barra móvel. Revisão usa apenas os IDs elegíveis e o endpoint existente05.

Sem dependências, migrations ou frameworks novos.

### Testes e evidências
Interfaces autorizadas pelo ticket: provider/hooks/menu reais e QueryClient real; apenas SDK/HTTP externo controlado. Nenhum teste recria a regra de negócio para se certificar sozinho.
- `tests/multi-selection.test.tsx`: cinco casos reais — seleção fora do recorte, Ctrl/Cmd+A em input, troca de filtro mantendo IDs iguais, recorte vazio e montagem com dados em StrictMode.
- `tests/action-cache.test.tsx`: três casos novos — duas confirmações/um conflito/dois erros com cache atualizado só para confirmadas; lote vazio sem writes; data/hora preservadas por ação. Verifica versão exata no SDK e ausência de timestamp inventado no PATCH.
- RED observado: seleção indevida sem recorte; confirmações de lote não atualizando cache; registro perdido em remontagem StrictMode. GREEN após respectivas correções. Os testes de teclado/data/hora e o roteiro completo ampliam a cobertura; não são alegados como novos RED históricos.
- Suíte completa: `bun test` →222 passam/0 falham,694 asserções,16 arquivos. Tipagem, lint e build passam, sem avisos de lint. Build mantém aviso já existente de chunks maiores que500kB.
- `scripts/check-bulk-actions-browser.cjs`: Chromium real em desktop1440 e viewport móvel390, servidor local5176. Cinco solicitadas →duas confirmadas, uma em conflito, duas com erro; três continuam selecionadas. Nova tentativa de conflito não grava; filtro vazio desabilita lote; atalho em input preserva seleção de texto. Depois, seleção manual somente dos dois erros e repetição grava apenas esses IDs. Verificadas versão exata, Sprint limpo e ausência de erros de runtime.
- Reprodução: configurar `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`, opcional `PORTAL_TEST_URL` e `DRAWER_TEST_WIDTH=390`. Usado o Chromium headless shell instalado; o executável Chrome completo não concluiu a inicialização neste ambiente. Não usar produção como URL do roteiro.

### Limites e próximo passo
Código: implementado. Testes de código: passaram. Navegador N10: passou com dados fictícios e HTTP externo controlado; viewport390 não certifica dispositivo físico/toque. Banco: CAS/trigger/RLS reais continuam dependentes das migrations08/07 preparadas, não aplicadas nesta sessão. Produção: não implantado.

Próxima entrega proposta:12 — arrastes concorrentes, somente quando autorizada. Preservar cache por confirmação do10 e a seleção por recorte do11; não restaurar as escritas antigas de lote.
