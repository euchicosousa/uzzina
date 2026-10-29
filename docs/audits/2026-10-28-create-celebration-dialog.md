# Criar data comemorativa pela busca

Em28/10/2026, o proprietário pediu iniciar o primeiro item da fila revisada: [diferenciar criar e gerenciar datas comemorativas](../../.scratch/search-review/issues/02-create-celebration-dialog.md). Somente este ticket foi implementado.

## Comportamento

Criar data comemorativa abre `CreateCelebrationDialog` com título, calendário em português brasileiro e botões Cancelar/Criar data. Gerenciar datas comemorativas continua navegando para a página administrativa existente. Ambos os comandos permanecem exclusivos para administradores; model e policy administrativa do banco preservados, sem SQL novo.

Abrir não grava, não navega e não chama a guarda que fecha ações. A busca fecha/restaura foco antes da abertura do novo modal no frame seguinte. Foco inicial no título; ao fechar, retorna ao controle anterior. Escape do seletor de mês fecha primeiro esse seletor. Shift mantém o mesmo comando, sem criar ação secundária.

Título é obrigatório e aparado antes do envio; data inicia no dia local e é enviada como data civil ISO por `CalendarDate.toString()`, sem conversão UTC. Envio pendente bloqueia duplicação, edição e fechamento; erro fica no modal, preservando título e data para nova tentativa. Sucesso usa a resposta canônica de `createCelebration`, atualiza lista já existente em cache e invalida a chave de datas da identidade atual. Sem cache prévio, não cria lista incompleta. Confirmação após reset de sessão/unmount não altera a próxima sessão; escrita já enviada não é cancelada por esse reset.

Modal respeita margens e altura útil; conteúdo pode rolar em janela baixa, com botões visíveis. Não houve mudança nos primitivos, na página de gerenciamento, no schema ou no model.

## Verificação

- Teste do comando antigo falhou antes: em vez do modal, navegava para administração. Primeiro ajuste também revelou retorno de foco incorreto entre duas modais; foi corrigido pelo fechamento/restauração da busca antes de abrir a segunda.
- Cinco testes nos componentes reais e SDK com HTTP controlado cobrem distinção de destino, foco/retorno, não fechar ações, data selecionada com teclado, título aparado, dois submits no mesmo ciclo gerando uma só requisição, botão pendente/Escape, cache canônico/invalidação somente do usuário atual, título vazio, erro/retry, cancelar/reabrir e confirmação antiga depois de reset. Teste existente verifica ausência de comandos administrativos para membro comum.
- Suíte geral:509 testes/1812 assertions em44 arquivos, zero falhas. Após locale/altura finais, os cinco testes do modal passaram novamente com30 assertions. Demais testes já aprovados não foram repetidos sem nova mudança em suas áreas.
- `bun run format`, `bun run lint`, `bun run typecheck`, `bun run build` e `git diff --check` passaram. Aviso conhecido de chunks maiores que500kB permanece.
- `scripts/check-celebration-dialog-browser.cjs` executa a aplicação real, SDK e componentes com sessão fictícia e HTTP interceptado; WebSockets fechados, requisições externas não previstas abortadas. Cenários1440×900 claro e390×700/480 escuro: título focado, calendário/meses, Escape de popup e modal, zero escrita ao abrir/cancelar, submit visível, estado pendente, falha/retry, uma inserção canônica simulada, criação exibida em Gerenciar, draft de ação aberto preservado, Shift sem secundária, comando ausente para membro comum, zero erros de página e zero escritas fora da fixture.
- Capturas inspecionadas: desktop, mobile, janela baixa.

## Estado e limites

Implementado localmente, aguardando avaliação do proprietário. Sem consulta/escrita no banco real, criação de registro real, SQL, commit, push ou deploy. Autorização do banco foi preservada por reutilizar o model/policy existentes; HTTP controlado não certifica RLS remota. Sem teste físico de teclado virtual/Safari. Alterações prévias em CURRENT preservadas. Próximos itens da fila não iniciados.

Capturas temporárias dessa verificação removidas em29/10/2026 a pedido do proprietário; o resultado e os limites acima permanecem registrados. Roteiros de navegador agora salvam novas capturas no diretório temporário do sistema, fora do checkout.
