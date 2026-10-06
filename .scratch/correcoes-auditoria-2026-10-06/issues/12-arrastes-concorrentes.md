# 12: Arraste antigo não limpa o novo

**What to build:** Arrastes sucessivos mantêm o feedback correto, inclusive quando uma gravação falha.

**Blocked by:** 08, 10

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

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
- [ ] finally é condicionado à operação/sessão.
- [ ] Falha antiga preserva feedback novo.
- [ ] Teste real não recria handleDragEnd.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

