# Como retomar o trabalho na UZZINA

Proposta de 24/11/2026. Um agente que chega ao projeto deve conseguir responder a três perguntas a partir do guia inicial. O que está em uso? Qual é o próximo trabalho autorizado? Onde está a prova do que já foi feito?

## Onde procurar e onde escrever

| Pergunta | Fonte proposta | O que atualizar |
| --- | --- | --- |
| Como trabalhar nesta área? | [Guia de agentes](../../AGENTS.md) e [contratos por área](../contracts/) | Regras duráveis do produto, mapa do código e verificação adequada a cada área. O guia aponta para o estado vigente quando uma regra depende de implantação. |
| O que está em uso e onde há dúvida? | [CURRENT](../audits/CURRENT.md) | Uma linha por entrega em andamento, divergência ou validação pendente. Atualizar a linha quando surgir evidência. Abrir com o que exige atenção. |
| O que posso pegar agora? | [Fila](../../.scratch/README.md) | Indicar responsável, próximo passo e se está autorizado, aguardando decisão ou suspenso. O ticket vinculado contém escopo, critérios e resultados por critério. |
| Onde está a prova? | [Relatórios datados](../audits/) e [histórico de encerramentos](../../.scratch/archive/resolved-tickets.md) | Guardar o registro original, com data, ambiente e resultado. O encerramento aponta para os critérios aceitos e a decisão correspondente. |
| Onde registrar uma ideia? | [TODO](../../TODO.md) e [planos](./) | Registrar a proposta. Ao entrar na fila, apontar para o ticket. |

## Como registrar uma mudança de estado

Cada linha de CURRENT informa **entrega visível, ambiente, última observação com data e fonte, pendência e quem age agora**. Detalhes ficam no relatório ou no ticket. A pessoa que assume a próxima ação precisa conseguir executá-la a partir desse registro.

Usar a evidência adequada à pergunta. Código e teste local confirmam implementação no checkout. Um deploy concluído confirma a versão publicada quando ligado ao ambiente e à revisão. Banco e tarefas automáticas têm implantação própria. Uma execução registrada confirma aquele percurso na data observada. O aceite de uso indica quem conferiu, onde e quais critérios foram atendidos. Para um estudo, a entrega verificável pode ser o próprio relatório. Quando as fontes divergem, registrar o ponto exato como **a conferir**, referenciar ambas e identificar a menor verificação capaz de resolver a dúvida.

## Piloto com o Instagram

Exemplo de preenchimento a partir dos registros do repositório. A data em cada linha é a da evidência disponível.

| Entrega | Última evidência | Próxima ação proposta |
| --- | --- | --- |
| Programar Stories na gaveta da ação | Em 23/11, o relatório de produção registrou o agendador ativo e três Stories publicados. O guia ainda orienta ativá-lo. [Relatório](../audits/2026-11-23-instagram-scheduler-smoke.md) · [Guia](../../AGENTS.md) | Planta reconcilia a orientação com o registro. A triagem posterior trata os outros formatos e os critérios ainda abertos na [ficha de programação](../../.scratch/instagram-composio/issues/04-programar-stories.md). |
| Consultar o calendário na tela Publicações | Em 23/11, há registro de deploy bem-sucedido da revisão `05b7e5a4`. A ficha ainda descreve publicação pendente. O aceite visual está em aberto. [Registro da entrega](../audits/CURRENT.md) · [Ficha](../../.scratch/instagram-composio/issues/04-programar-stories.md) | Prova prepara a conferência visual: selecionar um parceiro conectado, escolher um dia com evento e abrir a ação correspondente. O proprietário avalia a tela. Se precisar de acesso assistido, o percurso é de leitura. |

## Ordem de implantação proposta

1. **Preservar o ponto de partida.** Planta identifica os links e âncoras que apontam para CURRENT e guarda a versão integral em um relatório datado. Marca os itens cuja situação continua desconhecida. **Pronto quando** todo o texto histórico puder ser recuperado e cada referência antiga levar ao trecho correspondente, inclusive após mover o histórico.
2. **Aplicar o modelo às duas entregas do piloto.** Oficina prepara a edição documental de CURRENT, do guia e das referências divergentes. O histórico das demais áreas continua acessível durante a transição. Prova começa no guia, sem o chat, e tenta responder se ainda é preciso ativar o agendador, o que foi publicado e qual tela aguarda aceite. **Pronto quando** as três respostas apontarem para evidências e nenhum caminho ativo indicar uma ação já executada.
3. **Estabelecer uma entrada para a fila e migrar por área.** O TODO e as listas datadas passam a apontar para o índice de tickets. Planta reconcilia cada área com o histórico, preserva decisões do proprietário e marca duplicidades ou divergências para triagem. Itens suspensos ficam identificados. **Pronto quando** cada entrega levantada tiver um destino rastreável e um agente conseguir distinguir trabalho autorizado, proposta e aceite pendente. Fechar um ticket exige conferir seu escopo completo.
4. **Testar a manutenção na próxima entrega real.** Oficina registra versão, ambiente e resultado da verificação pertinente. Prova confere a evidência e limitações. Planta atualiza o próximo passo na fila e a linha correspondente em CURRENT. Um responsável edita o checkout por vez e relê os arquivos antes de gravar. **Pronto quando** o agente seguinte recuperar o estado sem recorrer ao chat. Se houver regressão ou reversão, a observação mais recente passa a constar em CURRENT e a anterior continua no histórico.

## Como organizar o código nesse percurso

No piloto, documentar o caminho da tela à regra de negócio no contrato da área. Para o calendário, a entrada é a [rota Publicações](../../app/routes/app/instagram.tsx), que chama a [consulta do calendário](../../app/models/instagram-publish.ts) e chega à [API compartilhada com publicação e agendamento](../../api/instagram-publish.ts). Um agente deve localizar qual trecho consultar e qual verificação exercita o comportamento pedido.

A primeira rodada cabe em documentação e revisão de referências. Se o piloto revelar que uma alteração de calendário continua exigindo mudanças no publicador, registrar o caso concreto para uma proposta técnica separada. A validação documental consiste em seguir links e reproduzir as respostas acima. Alterações de produto pedem verificações próprias, e o comando de desenvolvimento habitual usa dados de produção, conforme o [guia de ambientes](../../README.md).
