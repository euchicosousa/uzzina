# 09: Criar e editar sem perder o rascunho

**What to build:** Criar pelo blur continua rápido; botão, atalhos e saída compartilham salvamento e preservam trabalho em falha.

**Blocked by:** 08

**Status revisado em06/10/2026:** não aprovado — regressões na gaveta e cobertura incompleta.

## Execução prescrita
Arquivos: app/components/features/action-drawer/ActionFormDrawer.tsx; EssentialsTab.tsx; InstagramTab.tsx; ObservationsTab.tsx; ActionFormFooter.tsx.
1. Criar coordenador de gravação usado pelo componente, com chave de rascunho/ação e estado explicitamente tipado: draft, creating, saved, saving, error, conflict. Mover a lógica necessária do componente para módulo de produção, mantendo o componente como caller; não duplicar callbacks para testar.
2. Criação captura payload e revisão local. blur válido, Criar e Cmd+Enter compartilham uma promessa. Enquanto creating, novas edições entram em pendingPatch da mesma chave. Após create: persistir patch restante com versão retornada, só então confirmação de salvo.
3. Fila por ação, uma atualização em voo; mudanças posteriores são acumuladas por campo com último valor escolhido. Resposta aplica somente a campos cuja revisão local não mudou. Título salvo referencia payload confirmado, não o texto atual por acaso.
4. handleSave resolve true apenas quando o snapshot solicitado foi confirmado. Em erro/conflict, preservar patches e refs de editores, status visível e botão Tentar novamente; não tentar conflito sem recarregar versão e preservar comparação.
5. Unificar Escape, X, dismiss/clique externo, Cmd+Enter e troca de ação. Se há conteúdo válido pendente, tentar salvar antes de fechar. Falha mantém gaveta; rascunho incompleto solicita descarte somente se seria perdido. Troca de ação pendente aguarda confirmação ou mantém chave separada recuperável. Resposta antiga nunca escreve na gaveta de outra ação.
6. Preservar responsáveis escolhidos ao trocar parceiro e defaults do criador já existentes; não redistribuir usuários silenciosamente. Preservar Feito/Concluído e criação por título.
7. Instalar infraestrutura React Testing Library/user-event/jsdom se ainda ausente. Testar componente real com providers reais e HTTP/SDK falso. Capturar writes na fronteira; não mockar handleSave/updateAction do app.

## Testes e alcance
Interface: ActionFormDrawer real, eventos de input/blur/clique/teclado. Promessas externas controladas: blur+Criar →1INSERT; editar durante INSERT →UPDATE adicional após ID; falha+Escape mantém título/editor; mesma edição A→B com respostas atrasadas terminaB; trocar ação durante write não contamina próxima; descrição sem blur é salva/recuperável. Testar dentro act e timers controlados.
NAVEGADOR: N07/N08 do17, foco real e clique externo.

## Acceptance criteria
- [ ] Teste importa e monta gaveta real; nenhuma cópia de handleTitleBlur.
- [ ] Edição feita durante criação sobrevive à recarga confirmada.
- [ ] Falha não fecha nem perde conteúdo.
- [ ] Botão/blur/atalho mantêm interação rápida sem duplicação.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.


## Revisão independente após execução

Leia `docs/audits/2026-10-06-revisao-tickets-05-09.md` a partir da raiz do repositório. A entrega do executor não encerrou todos os critérios deste ticket. Suíte195 passou; typecheck falhouTS7053; banco real/produção não foram homologados. Corrigir os Rxx relacionados ao ticket e registrar teste real por comportamento, distinguindo módulo isolado de integração da gaveta. Esta revisão prevalece sobre alegações gerais de conclusão do retorno.
