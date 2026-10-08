# 12: Arraste antigo não limpa o novo

**What to build:** Arrastes sucessivos mantêm o feedback correto, inclusive quando uma gravação falha.

**Blocked by:** 08, 10

**Status:** implementado e verificado localmente em 07/10/2026; banco real/produção pendentes

## Execução prescrita
Arquivos: app/hooks/useKanbanDnd.ts; app/components/features/CalendarWithDnd.tsx; app/components/layout/KanbanPhasesBoard.tsx.
1. Cada drag start tem dragSessionId; cada write tem operationId. finally limpa activeAction somente se ainda representa aquela sessão.
2. Overrides guardam {operationId,value}. Sucesso/erro retira somente override de sua operação; não apagar override posterior pelo mesmo ID. Preferir cache canônico10 como base e fila por ação; se enfileirar, garantir que todos os callers recebam a promessa da sua própria confirmação.
3. Passar expectedUpdatedAt08; after success atualiza versão para próxima operação da mesma ação. Parse de alvo inválido e cancelamento não gravam.
4. Falha faz rollback de sua operação pelo10 e mensagem específica; cancelar gesto não cancela arbitrariamente gravação anterior já enviada.
5. Cobrir calendário e Kanban: ambos registram onDragCancel. Manter configuração visual/sensores atual nesta correção.

## Testes e alcance
Interface: useKanbanDnd real via renderHook; handlers retornados recebem objetos de evento tipados e onDrop externo controlado. Iniciar A/drop1 pendente, iniciar/drop2; resolver/rejeitar1 não limpa2. Cancel sem drop→zero calls. Calendário real testa tratamento de erro.
NAVEGADOR: N11 do17, PointerSensor e toque reais; renderHook não prova gesto.

## Acceptance criteria
- [x] finally é condicionado à operação/sessão.
- [x] Falha antiga preserva feedback novo.
- [x] Teste real não recria handleDragEnd.

## Resultado do executor — 07/10/2026

Base inicial/final: `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`. Alterações01–11 e limpeza já presentes foram preservadas. Sem commit, deploy ou alteração no banco real.

### Correção implementada
- `useKanbanDnd.ts`: sessão incrementada por gesto; o finally de um salvamento só limpa o gesto correspondente. Eventos de ação diferente não reutilizam a ação ativa. Preview local tem operationId, e resposta/erro antigo não remove preview mais recente. Cancelar gesto não cancela write já enviado.
- Escritas da mesma ação são ordenadas por promessa própria. Cada movimento aguarda a confirmação anterior e usa sua versão exata, preservando microsegundos; uma ação diferente pode salvar independentemente. Conflito anterior interrompe movimentos já enfileirados, sem tentar sobrescrever com versão recarregada. Erro comum não reaplica o movimento anterior: o movimento posterior explicitamente solicitado continua com CAS e pode falhar por conflito se o estado real mudou.
- `CalendarWithDnd.tsx`: removidos controle de gesto, overrides e limpeza duplicados; usa o hook existente também para data. Só aceita destinos presentes em calendarDays, preserva horário original e envia PATCH somente de data/ID/versão.
- `KanbanPhasesBoard.tsx`: destino validado nas fases existentes; PATCH somente de fase/ID/versão, exigindo confirmação. Regras de concluir/arquivar continuam no updateActionClient08 e no cache10.
- `utils/date.ts`: comparador de revisões existente no10 movido para utilitário compartilhado, preservando microsegundos. `useActionMutations.tsx` reutiliza esse mesmo comparador.
- `DnD.tsx`: draggable usa touch-action:none para impedir que rolagem nativa cancele o gesto. Sobre o card o gesto arrasta; rolagem permanece nas áreas ao redor. Sensores, distância de ativação, layout e animação não foram trocados.

Não foi criado framework novo, coordenador global, dependência ou migration. Falha retira somente o preview local correspondente; cache continua recebendo apenas confirmações10. Mensagem de erro/conflito vem da mutação individual existente.

### Testes e alcance
Interfaces previstas no ticket: hook real com eventos tipados e callback de gravação controlado; calendário/Kanban reais no navegador com SDK real e somente HTTP externo interceptado.
- `tests/drag-concurrency.test.tsx`: seis testes do hook — resposta antiga preserva novo gesto; falha antiga preserva novo preview da mesma ação; movimentos sucessivos usam confirmação anterior; cancelar novo gesto preserva write já enviado; destino inválido/cancelamento não gravam; conflito impede envio de movimento enfileirado.
- RED observado antes das respectivas correções: activeAction novo apagado pelo finally antigo; preview novo removido por falha anterior; duas escritas simultâneas usando a mesma versão antiga. GREEN após correções. Teste de toque também falhou antes de touch-action:none, com zero gravações porque o navegador cancelava o gesto.
- `bun test`:228 passam/0 falham,706 asserções,17 arquivos. `bun run typecheck`, `bun run lint`, `bun run build` passam; lint sem avisos. Build mantém aviso já existente de chunks maiores que500kB.
- `scripts/check-drag-concurrency-browser.cjs`: PointerSensor real em Chromium desktop1440. Calendário: falha de A durante gesto de B preserva B, rollback de A e confirmação de B; dois movimentos pendentes de A ficam ordenados e segundo PATCH usa a versão confirmada do primeiro; Escape não grava. Kanban: sucesso antigo preserva gesto novo; falha nova retorna somente sua ação à fase anterior. PATCHs contêm apenas campo alterado/regra de Sprint e versão exata. Sem erros de runtime.
- Mesmo roteiro de calendário em viewport390, `hasTouch/isMobile`, eventos de toque e touchCancel enviados pelo Chromium: passou. É toque emulado no navegador, não teste em aparelho físico. Kanban já desabilita arraste abaixo de1024px; essa decisão de produto foi preservada.
- Reprodução: iniciar app local e configurar `PORTAL_TEST_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`; modo móvel com `TOUCH_TEST=1 DRAWER_TEST_WIDTH=390`. Nesta execução: servidor5177 e Chromium headless shell instalado. Dados fictícios, HTTP externo controlado; nenhuma gravação em produção. Não apontar o roteiro à produção.

### Situação e continuidade
Código: implementado. Testes de código: passaram. Navegador N11: calendário/Kanban com mouse e calendário com toque emulado passaram; aparelho físico pendente. Banco: integração real com CAS/trigger/RLS07–08 continua pendente, migrations não aplicadas. Produção: não implantado.

Próximo ticket proposto:13 — identidade/cache, somente quando autorizado. Não restaurar cópia de lógica DND no calendário, timestamps criados no cliente nem rollback de snapshots de listas.
