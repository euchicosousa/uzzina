# 01: Gerar e reabrir proposta por tema

**What to build:** A pessoa escolhe um parceiro e um tema, solicita uma proposta de conteúdo, consulta o resultado salvo e consegue voltar à mesma proposta sem perder seus dados.

**Blocked by:** 00 — Alinhar a interface ao mockup aprovado. As definições de produto abaixo também precisam ser resolvidas para fechar o contrato de geração.

**Status:** needs-product-decision — definir o mínimo de entrada e os campos da sugestão antes de fechar o contrato de geração (P1).

## Base existente a preservar

- A rota, o layout herdado, os acessos de busca/menu/parceiro, a seleção de parceiro pela URL e a composição aprovada da Mesa já estão preparados. Esta entrega completa geração e persistência; não recria a página, o cabeçalho, a AppBar ou os acessos.
- O ticket00 corrige a configuração visual para o modelo escolhido: Por período/Por tema, slider, dias da semana e direcionamento. Preservar os controles aprovados nessa entrega; não voltar a substituí-los por inputs genéricos ao conectar o fluxo real.
- O escopo disponível no cliente vem dos parceiros operacionais existentes. A autorização final e o contexto editorial continuam sendo verificados no servidor.
- O app já tem quota persistente para IA e estratégias09 como fluxo durável de estratégia. Planejamento deve integrar-se aos contratos atuais sem alterar os fluxos de estratégia já existentes.

## Definições pendentes

- P1: confirmar campos mínimos de entrada e sugestão. Título, formato, objetivo e briefing são a proposta visível para discussão, não um esquema aprovado.
- Definir se e como uma proposta pertence ao autor ou é compartilhada com outras pessoas autorizadas ao parceiro. Preservar as permissões existentes até essa decisão; não criar acesso ampliado.

## Acceptance criteria

- [ ] A página limpa permanece dentro do layout atual, com configuração à esquerda e visualização à direita, divisórias estruturais, padding interno e rolagens independentes; sem cartões, fundos de painel ou gutters externos. Sem layout mobile ou empilhamento; abaixo do limite permanece o aviso aprovado.
- [ ] Os acessos existentes continuam sob as guardas vigentes e o parceiro é obtido da URL; sem parceiro válido, não selecionar outro automaticamente. A busca global não fornece filtro de atribuição.
- [ ] Antes de gerar, a interface apresenta somente campos aprovados após resolver P1. Valores e nomes de campos não viram decisões por estarem no mockup ou na proposta antiga.
- [ ] O servidor confirma a sessão, a associação ativa do ator ao parceiro e os dados editoriais atuais; não confia em identidade, autorização ou Contexto/Tom enviados pelo navegador.
- [ ] A entrada respeita o contrato atual de `partner_name` (parceiro publicador, validado antes da quota) e as regras de quota persistente e falhas já vigentes. Revise a implementação durável atual de IA/estratégias antes de integrar; não reimplemente nem altere os fluxos permanentes de estratégias09.
- [ ] Pedido inválido ou resposta fora do contrato não gera proposta utilizável nem consome IA quando a validação ocorre antes da geração. Reserva de quota, indisponibilidade e limite seguem os erros atuais; nenhum contador local ou fallback é criado.
- [ ] Resultado validado e proposta são persistidos de forma canônica, com identidade estável para cada sugestão. Repetição técnica da mesma operação não publica duplicatas; uma nova solicitação explícita cria uma proposta nova e integral, mesmo para tema/período repetidos, sem consultar ou descontar ações existentes.
- [ ] A lista/detalhe permite reabrir a proposta salva com parceiro, entrada, resultado e versão corretos; carregando, vazio, erro e nova tentativa não se confundem. Falha não apaga proposta anterior nem se apresenta como lista vazia.
- [ ] Troca de identidade, parceiro ou proposta descarta respostas antigas e respeita a guarda de edição. Leitura, escrita e cache não atravessam sessão ou parceiro.
- [ ] Verificação cobre contrato, autorização, quota, geração integral repetida, persistência/reabertura, resposta inválida, falha/retry e mudança de sessão, usando provedor/HTTP/banco controlados proporcionais ao risco. Não usar produção para fixtures de escrita nem inferir qualidade de IA real de um mock.
- [ ] Roteiro visual curto para o proprietário confere a Mesa em largura suportada, rolagens e retorno à proposta; aparência não é certificada por suite automatizada.

**Fronteira:** núcleo inicial de geração por tema e persistência/reabertura. Não implementa revisão completa (#02), frequência (#03), distribuição (#04), extras (#05), calendário (#06) ou conversão (#07). Antes de liberar os paralelos, documentar o contrato canônico e as decisões necessárias sem alterar a página e os acessos existentes.
