# Calendários: proposta de tickets

Data: 16/10/2026. Estado: divisão e padrões aprovados pelo proprietário ao autorizar o início. Origem: [estudo](../../audits/2026-10-16-calendar-height-study.md). Tickets publicados no rastreador local em `.scratch/calendar-height/issues/`; implementação e evidências registradas no estudo de origem.

## Regra simples proposta

O calendário compartilhado cresce conforme o conteúdo. Cada tela pode passar uma opção explícita para iniciar com limite máximo. A apresentação Linha/Bloco/Conteúdo não decide altura. Não há modo fixo, campo de pixels, persistência adicional ou SQL neste escopo.

O controle visível será “Limitar altura dos dias”: desligado significa automático; ligado significa crescimento até um teto com rolagem na lista de ações. Isso substitui a opção inversa “Altura automática”, sem acrescentar outro menu ou terceiro modo. A sugestão inicial de teto é 384 px por célula, reduzido ao espaço útil quando necessário em janela baixa; o valor precisa ser validado visualmente, não tratado como requisito já aprovado. Cabeçalho e comemorações contam no espaço da célula.

| Contexto | Padrão recomendado | Onde rolar | Motivo |
| --- | --- | --- | --- |
| Parceiro, com ou sem feed | Automático; limite opcional | Painel do calendário entre semanas; lista do dia apenas se limite ativado | É a área principal de planejamento; deve mostrar o conteúdo disponível. |
| Home, mês | Automático; limite opcional | Página entre semanas; lista do dia apenas se limite ativado | Evita multiplicar espaço vazio por todas as semanas. |
| Home, semana | Limite ativado; usuário pode desligar | Lista de ações de cada dia, quando cheia | É um resumo que divide a Home com outras seções. A semana vazia continua baixa. |
| Portal, semana/mês | Painel limitado à janela; dias pelo conteúdo | Grade para navegar pelo calendário, sem criar rolagem adicional por dia | O portal já divide a janela com o feed. Limitar o painel não exige impor piso ou teto a cada dia. |
| Popover de atrasadas | Preservar limite existente | Uma lista dentro do popover | Sobreposição temporária precisa caber na janela; não é calendário. |

Os padrões da Home semanal e do portal foram aprovados junto da divisão. Não estender a revisão a Sprint, Atrasadas ou todos os overlays; apenas verificar ausência de regressões nos consumidores compartilhados.

## Sequência

1. [Calendário do parceiro dinâmico e limite opcional](01-partner-calendar.md). Sem bloqueadores. Entrega a regra compartilhada em uma tela completa; testes e revisão visual fazem parte do ticket.
2. [Home com padrões por contexto](02-home-calendar.md). Bloqueado por 01, pois reutiliza a regra e o controle entregues nele.
3. [Revisar altura e rolagem do portal](03-client-calendar-review.md). Sem bloqueadores técnicos: implementação própria. É uma revisão delimitada, não compromisso de reescrever o portal. Pode terminar sem alteração de código, com evidência.

Não criar ticket separado de refatoração ou QA: a separação mínima entre altura e truncamento entra no ticket 01, e cada entrega inclui sua própria verificação. Ordem operacional sugerida: 01 → 02 → 03, com um executor escrevendo no checkout por vez. O ticket 03 não depende tecnicamente dos demais.

## Aprovação e publicação

A divisão foi aprovada pelo proprietário com “pode começar”. Foram publicados [01](../../../.scratch/calendar-height/issues/01-partner-calendar.md), [02](../../../.scratch/calendar-height/issues/02-home-calendar.md) e [03](../../../.scratch/calendar-height/issues/03-client-calendar-review.md), com suas dependências. Os arquivos numerados nesta pasta preservam o escopo aprovado; o rastreador local e CURRENT registram execução/verificação.

O teto implementado é o menor entre 384 px e 60% da altura dinâmica da janela. No modo limitado, cabeçalho do dia permanece fora da rolagem; comemorações acompanham as ações na mesma área rolável para que quantidades grandes não recortem a célula. A galeria existente mostra o novo controle.
