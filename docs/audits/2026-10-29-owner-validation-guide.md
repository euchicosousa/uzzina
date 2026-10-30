# Roteiros de avaliação pelo proprietário — 29/10/2026

Guia solicitado para decidir os próximos trabalhos. Não é relatório de testes executados: nenhuma verificação abaixo foi certificada por sua inclusão nesta lista. As entregas Hoje, Ajuda e Notificações permanecem aprovadas e encerradas.

## Como registrar

Usar ações e contas próprias de teste ao salvar, arrastar, comentar ou enviar anexos. Localhost e site publicado usam o mesmo banco de produção. Para cada cenário, registrar aprovado, falhou ou não testado; em falha, página, aparelho/Safari, passos e resultado esperado/observado. Não é necessário repetir tudo para aceitar um ajuste pontual.

## Item 5 — Safari no Mac e telefone

| Cenário | O que fazer | Resultado esperado |
|---|---|---|
| Entrada e sessão | Entrar, atualizar a página e navegar entre Início, Hoje e parceiro; sair ao terminar. | Sessão permanece durante uso; Sair retorna à entrada sem conteúdo privado anterior. |
| Home e Hoje | Trocar data/visualização; abrir um dia pelo calendário da Home; usar Voltar. | Data exibida corresponde à navegação, título/controles de Hoje permanecem visíveis; Home mantém seu tamanho natural. |
| Parceiro e calendário | Trocar Semana/Mês e modos disponíveis; ligar/desligar limite dos dias; rolar dia cheio e última semana. | Todas as ações/comemorações acessíveis, cabeçalho fora da rolagem do dia e feed independente. |
| Gaveta e editor | Criar uma ação de teste, preencher descrição com formatação, selecionar parceiros/responsáveis/data, salvar, fechar e reabrir. | Texto, formato, data e seleções preservados; editor não fica recortado. |
| Duas ações | Abrir segunda pela busca com Shift; editar campos distintos; alternar e fechar cada uma. No Mac, redimensionar ao redor de1600px, se a tela permitir. | Abas em largura menor e lado a lado em largura suficiente, sem perder edição; salvamento/fechamento afeta a ação correta. |
| Busca e seletores | Abrir busca, digitar, filtrar parceiros, usar Shift e arquivadas; fechar/reabrir. | Filtro/seleções funcionam; nova abertura reinicia consulta/seleção como definido pela rota, com arquivadas desligadas. |
| Minha Conta | Rolar ambas as áreas, testar claro/escuro/sistema, mudar a visualização inicial de Hoje, salvar e recarregar. No celular, alternar seções. | Botão de salvar acessível, campos não se perdem, preferências persistem e listas chegam ao fim sob a AppBar. |
| Datas comemorativas, admin | Abrir modal, digitar título, trocar mês/ano, testar Enter, Escape e Cancelar; criar somente uma data de teste se desejar conferir gravação. | Enter no título não avança mês, título vazio mostra erro no campo; Escape fecha primeiro o seletor interno; sem recorte em janela baixa. |
| Ajuda, Notificações e Leads | Usar índice/seletor de Ajuda, rolar listas, abrir detalhe de lead e uma notificação de teste existente, se disponível. | Navegação/rolagem e aviso de ação indisponível legíveis. Abrir notificação não lida pode marcá-la como lida. Não fabricar registros para este roteiro. |
| Upload | Enviar dois arquivos próprios de teste, aguardar ambos, trocar a ordem quando disponível e salvar/reabrir. | Uploads completos, miniaturas e ordem corretas; seletor de arquivos abre/fecha sem travar o fluxo. |
| Portal e revisão pública | Com conta/link de teste, entrar no portal e abrir uma revisão pública válida em aba privada; conferir mídia, comentário/anexo quando disponíveis. | Conteúdo autorizado legível; revisão não depende da sessão da equipe; erro de acesso aparece sem conteúdo indevido. Não revogar links reais para testar. |
| Celular: teclado/zoom/rotação | Focar título, descrição e busca com teclado virtual; esconder teclado, girar aparelho e testar zoom permitido pelo navegador. No Mac, conferir200% de zoom. | Campo e ação principal continuam alcançáveis; sem página presa, salto que esconda controles ou rolagem horizontal imprevista. |

Se Safari no telefone não estiver disponível, registrar essa linha como não testada; uma janela estreita no Mac não substitui teclado virtual físico. Repetir claro/escuro principalmente nos seletores, diálogos e editor; não é preciso refazer todas as gravações em ambos os temas.

## Item 3 — cobertura adicional de teclado, se desejada

O proprietário já aprovou os fluxos exercitados; gaveta e toolbar concluídas não são pendência. O ticket03 original era uma varredura das demais telas, não um defeito específico. A decisão agora é manter ou dispensar essa revisão adicional.

Regra comum: Tab avança, Shift+Tab volta; foco é visível e corresponde à ordem da tela; Enter/Espaço ativam controles apropriados; setas navegam componentes que as utilizam; Escape fecha primeiro o overlay interno; fechar devolve foco a um controle útil. Digitar não deve disparar atalhos da página. Conferir que o foco não vai para conteúdo escondido atrás de diálogos.

| Superfície | Verificação opcional |
|---|---|
| Entrada e recuperação de senha | Campos, mostrar senha quando disponível, envio, mensagens de validação e links de recuperação/retorno. |
| Navegação e menu do perfil | AppBar, links, abertura do menu, comandos, Escape e retorno ao botão que abriu. |
| Busca global | Digitação de espaços, setas entre resultados/comandos, Enter/Espaço após navegar, Shift para segunda ação, filtro e seleção exclusiva. |
| Home, Hoje e parceiro | Datas, visualizações, botões de criação, ações nas listas/calendário, seletores de opções e independência entre regiões roláveis. Arraste é conferido no roteiro Safari; não presumir alternativa por teclado implementada para todo gesto. |
| Minha Conta | Campos pessoais, seções mobile, temas, controles de personalização, upload de foto, validação que revela campo inválido e Salvar. |
| Datas comemorativas | Lista/edição, modal, título, anterior → mês → ano → próximo, grade de dias, Enter, erro vazio e retorno ao fechar. |
| Notificações e Ajuda | Lista/ações, leitura individual/todas, carregar anteriores, índice/seletor, links e manutenção da região de rolagem. |
| Leads | Busca/filtros existentes, seleção da lista, detalhe e retorno sem perda da posição/foco. |
| Administração | Listas e criação/edição de parceiros, pessoas e contas externas; formulários, responsáveis/permissões existentes, salvar/cancelar, modais e mensagens. Só para administrador. |
| Editores e anexos fora do percurso principal já aprovado | Texto longo, barra de formatação, links, seleção/tabela, menções, seletor/upload externo, remoção e reordenação de anexos quando disponíveis. |
| Portal do cliente e revisão pública | Entrada do portal, calendário/abas, conteúdo, comentário/anexo quando disponíveis e diálogos; executar sem depender de controles privados da equipe. |

Este inventário cobre as famílias de telas atuais. Não exige testar a galeria técnica `/ui` para aceitar os fluxos de negócio. Nenhuma falha dessas superfícies foi constatada nesta rodada; se a decisão for encerrar pelo uso já realizado, problemas futuros podem receber tickets individuais.

## Item 4 — avaliação editorial das estratégias

O prompt de estratégia já foi ajustado e publicado; o trabalho pendente era avaliar o resultado, não implementar uma nova etapa de hooks. Em20/10, a motivação foi a geração de headlines cautelosas e parecidas, que entregavam a conclusão e não funcionavam bem como abertura. O prompt passou a separar tese de headline, pedir mecanismos/ideias diferentes, aberturas curtas e orientar a entrega do conteúdo.

1. Escolher três briefings reais representativos: educativo/explicativo sem oferta, produto/vitrine ou bastidor e oferta explícita. Acrescentar um pedido com pouca informação se quiser avaliar tratamento de lacunas. Não precisa gerar para todos os parceiros.
2. Em ação própria de teste, conferir Contexto/Tom da marca, escolher o formato e descrever objetivo, público, fatos disponíveis e restrições. Gerar uma rodada por briefing, sem ficar regenerando até aparecer algo bom.
3. Ler as cinco alternativas completas: headline, ângulo, racional e direcionamento. Conferir se variam a ideia/mecanismo, não só as palavras; se atendem ao pedido; se a voz faz sentido; se a abertura é compreensível, específica e curta (orientação atual: até14 palavras); e se o corpo proposto realmente consegue cumprir a promessa.
4. Rejeitar fatos, números, benefícios, estudos e características inventados. Nos briefings sem oferta, observar se não acrescentou venda desnecessária. Ser afirmativo não justifica uma alegação absoluta sem sustentação.
5. Selecionar uma opção e, se quiser testar continuidade, gerar o conteúdo no formato escolhido. A headline selecionada vira o título da ação; verificar se o conteúdo continua a estratégia e resolve a abertura sem mudar a ideia.
6. Guardar apenas tema/formato, alternativa boa/ruim e uma frase explicando por quê. Classificar como usável, precisa de ajuste ou rejeitada. Uma geração ruim isolada não identifica sozinha a causa; comparar o padrão entre os briefings.

Critério prático de aceite: há opções úteis e diferentes, a direção corresponde à marca/pedido e não depende de inventar fatos. Se gostar do resultado atual, pode encerrar esta avaliação e abrir um novo ticket quando quiser mudar o estilo. A avaliação não promete desempenho de publicação nem exige testar um fluxo separado de hooks, que não foi entregue. Gerações reais consomem a quota existente; este roteiro não executou chamadas.

## Item 6 — origem e motivação

Registro de17/10/2026, motivado pela ação “Segurando o burger”, do Toro. Havia original e cópia real no banco. Às13:00:04 houve salvamento aceito pelo servidor; às13:00:10 outra atualização chegou com a mesma versão antiga e recebeu conflito; às13:00:14 houve leitura do original e criação de outra ação pelo fluxo de duplicação. O histórico não mostra o gesto físico que acionou o comando.

O diagnóstico demonstrou com teste controlado que perder a confirmação de uma gravação pode fazer a tentativa seguinte conflitar com a própria escrita. Não demonstrou que isso foi a causa única daquela ocorrência. Não houve evidência de Atualizar virar Duplicar automaticamente. Melhorias possíveis: reconciliar a versão sem perder edição, mensagem menos categórica sobre outra sessão, impedir/clarificar duplicação durante erro/conflito e mostrar o resultado. Nenhuma dessas melhorias foi autorizada para implementação; nenhuma consulta atual ao registro real foi feita nesta revisão.

Fonte: [diagnóstico original](2026-10-17-action-update-duplicate-diagnosis.md).

## Decisões posteriores do proprietário em29/10

- Estratégias validadas: avaliação editorial encerrada. O roteiro permanece como referência histórica para eventual mudança futura, sem exigir novos testes agora.
- Safari: execução/resultados serão trazidos pelo proprietário em outro chat.
- Teclado: solicitada preparação do ticket03 de revisão das demais telas; ticket existente refinado, sem reabrir gaveta/toolbar ou executar correções.
- Salvamento/duplicação: solicitado ticket detalhado de melhorias decorrentes do diagnóstico; ticket criado no tracker local e apresentado para revisão, sem implementação.
