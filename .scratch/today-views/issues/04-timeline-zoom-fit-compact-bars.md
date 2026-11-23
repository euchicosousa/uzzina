# HOJE-04 — Enquadrar o dia e compactar as ações na Linha do tempo

**Onde abrir.** Hoje → Linha do tempo. A Home também usa o mesmo quadro.

**Status.** Concluído, conferido no app publicado e aprovado pelo proprietário em 22/11/2026. Zoom, enquadramento, régua, Agora, alças, abertura e movimentação das ações foram conferidos em Hoje e Home. A ressalva anterior sobre publicação foi superada pela confirmação direta do proprietário de que fez a conferência no app publicado. A correção descoberta durante o aceite de teclado está registrada separadamente em [HOJE-06](06-timeline-keyboard-focus.md).

**Bloqueado por.** Nenhum ticket para estudar.

## Aplicação no componente principal

Hoje e Home usam o slider, o enquadramento e as barras compactas validados na galeria. A régua atualiza as divisões com o zoom e a linha Agora permanece alinhada aos horários. Alças de desktop aparecem a partir de 16 px. O título fica na barra e abre a gaveta ao clicar. O redimensionamento amplia a régua somente para ocupar espaço vazio, após estabilizar a largura.

## Como funcionava antes do estudo

A régua cobre meia-noite a meia-noite. Cada minuto ocupa 6 px, cada hora 360 px e o dia inteiro 8.640 px. Ao abrir o dia atual, o quadro rola até perto de Agora. Régua, barras, indicador Agora e deslocamento do ponteiro usam a mesma escala fixa.

O cartão já tem uma variante própria para a Linha do tempo. O que ela ainda compartilha com as outras variantes é o título editável. A barra tem altura mínima de 36 px e pode crescer. A largura segue a duração, com piso visual de 16 px. Uma ação de 10 minutos ocupa 60 px na escala atual. O texto quebra conforme a largura disponível e corta depois da segunda linha.

## Proposta inicial do estudo (histórico)

1. **Zoom manual.** Usar a escala atual como 100%, com controles de diminuir e aumentar em pequenos passos, sem marcas obrigatórias. Experimentar passos multiplicativos de 1,25× e seu inverso (80%, 100%, 125%). Comparar como limite inferior a escala em que as 24 horas cabem na largura útil e, como superior, 200% e 400%. Ao mudar o zoom, manter o horário central visível. Aplicar a mesma escala à régua, às barras, ao Agora, ao arraste e às alças. A precisão de edição continua em 5 minutos.
2. **Botão “Ajustar às ações”.** Considerar as ações do dia que aparecem nas linhas de responsáveis selecionadas. Medir do início mais cedo ao **término mais tarde**, inclusive quando uma ação longa termina depois da última que começou. Dividir a largura útil da área de horários (descontando a coluna fixa e as margens laterais) por esse intervalo em minutos. Aplicar a escala calculada e rolar até o início do intervalo com margem. O ajuste pode cair entre dois passos do zoom manual. Em dia vazio, deixar o botão indisponível. Com uma única ação curta, respeitar o zoom máximo e centralizar o intervalo dentro dos limites do dia. O comando deve prevalecer sobre a rolagem inicial até Agora.
3. **Barra compacta.** Ajustar a variante existente. Comparar uma linha com 24 ou 28 px de altura e duas linhas com altura suficiente para ler o texto inteiro até o corte. Reduzir primeiro o espaço vertical interno. Manter a largura proporcional ao tempo e avaliar o piso de 16 px no menor zoom, onde ele pode exagerar a duração visual e as duas alças podem ocupar todo o alvo. Comparar o título curto, o longo e o de uma ação de 10 minutos. Preservar o acesso ao título completo, as cores de fase e o destaque de atraso.
4. **Clique e arraste.** Usar texto de leitura também na área do título. Clicar abre a gaveta, arrastar pelo corpo move a ação e arrastar pelas extremidades ajusta início ou fim. Soltar depois de arrastar deve encerrar o gesto sem abrir a gaveta. Preservar a duração mínima de 10 minutos, a abertura por teclado e os atalhos atuais para mover e redimensionar. A edição do título continua disponível na gaveta.

## Resultado inicial do estudo (histórico)

**Escala.** Recomenda-se multiplicar ou dividir por 1,25 a partir de 100%. O mínimo mostra o dia inteiro e depende da largura disponível. A 200%, dez minutos já medem 120 px. A 400%, medem 240 px e restam apenas 13 minutos visíveis no quadro estreito. A prévia permite comparar os dois tetos.

| Medida calculada                                       | Quadro de 1.200 px | Quadro de 360 px |
| ------------------------------------------------------ | -----------------: | ---------------: |
| Espaço para horários, descontando 56 px do responsável |           1.144 px |           304 px |
| Zoom para ver o dia inteiro                            |              13,2% |             3,5% |
| Minutos visíveis a 80% / 100% / 125%                   |    238 / 191 / 153 |     63 / 51 / 41 |
| Zoom para enquadrar das 9h às 13h                      |              76,1% |            18,9% |
| Largura de uma ação de 10 min nesse enquadramento      |              46 px |            11 px |

Para o ajuste automático, medir a área de horários e reservar 4% dela de cada lado, com mínimo de 16 px e máximo de 24 px por lado. Dividir o espaço restante pelo intervalo das ações visíveis, limitar a escala e centralizar o intervalo. Nas extremidades, a margem pode diminuir para respeitar 0h e 24h. Para ações que passam da meia-noite, enquadrar a parcela do dia exibido. A régua espaça seus rótulos conforme o zoom; o teclado continua ajustando de cinco em cinco minutos.

**Barra.** Recomenda-se mínimo de 28 px para uma linha, altura automática de cerca de 42 px para duas e corte a partir da terceira. A prévia compara também o mínimo de 24 px e os 36 px atuais usando os mesmos títulos. Reduzir junto o espaço mínimo da faixa que contém o cartão (hoje, 48 px) para que as linhas ocupem menos altura de fato. A largura deve seguir a duração inclusive abaixo do piso atual de 16 px. Isso mantém a divisa entre duas ações consecutivas.

### Consulta e organização — revisão com Sol, Terra e Astra

A largura real da barra depois do zoom define quanto espaço existe para controles. O gesto também importa: em um notebook com tela sensível ao toque, usar o dedo deve permitir percorrer o dia mesmo quando há mouse conectado.

| Entrada                                                     | Proposta                                                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Dedo, qualquer largura                                      | Toque abre a ação, deslizar percorre o quadro. Sem alças ou alteração de horário pelo gesto de rolagem.                                    |
| Mouse, barra abaixo de 24 px ou escala abaixo de 1,5 px/min | Clique abre a ação. Aumentar o zoom permite edição mais precisa.                                                                           |
| Mouse, de 24 até menos de 72 px, em escala suficiente       | Clique abre e arraste pelo corpo move a ação.                                                                                              |
| Mouse, a partir de 72 px, em escala suficiente              | Duas extremidades de 24 px para ajustar o intervalo e pelo menos 24 px centrais para abrir ou mover.                                       |
| Teclado, qualquer largura                                   | Foco na ação, Enter/Espaço abre, setas movem cinco minutos, Shift + setas ajusta o fim. Alças recolhidas não devem receber foco invisível. |

A condição de escala evita permitir um arraste impreciso até em barras longas: a 1,5 px/min, cada passo de cinco minutos ocupa 7,5 px diante do limiar atual de 5 px para iniciar arraste. Tanto a escala quanto as larguras são hipóteses para ensaio. Preservar o comprimento temporal e a divisa entre ações adjacentes, inclusive com 1–2 px de largura.

**Se organizar pelo celular fizer parte da entrega**, preferir um comando explícito “Organizar horários”. Ele oferece escolha da ação pelo título entre os responsáveis visíveis e ajuste de início e duração fora da barra. Isso também fornece acesso quando ações consecutivas são minúsculas e permite ajustar o início mantendo o fim quando a alça está recolhida. A gaveta já edita a hora de início em Essencial, mas não oferece edição livre de duração. Pressionar e segurar exigiria descobrir o gesto e distinguir espera de rolagem, sem resolver a seleção de vizinhas estreitas. Recomendação inicial: validar primeiro a consulta com toque e o zoom; o comando é uma decisão de escopo em aberto.

### Roteiro de aceite para uma futura implementação

1. Em Hoje e na Home, conferir duas ações do mesmo responsável sobrepostas e duas consecutivas. Em consulta por toque, deslizar a partir do título, do meio e das extremidades deve percorrer o dia sem gravar horário nem abrir a gaveta. Um toque simples deve abrir uma única vez.
2. Com mouse, comparar 23/24 e 71/72 px, nos dois lados do limite de 1,5 px/min. Confirmar que controles recolhidos não interceptam o clique. Arrastar pelo título e soltar não abre a gaveta, mesmo quando o arredondamento mantém o horário. Cancelar o gesto descarta a prévia.
3. Em barras largas, mover e ajustar cada ponta mantendo a outra fixa. Conferir duração mínima de dez minutos e limites 0h/24h. Alternar mouse e toque no mesmo dispositivo sem perder o foco nem alterar horário acidentalmente.
4. Usar o teclado em todas as escalas. Se o comando de organização for aprovado, escolher pelo título duas ações vizinhas com menos de 12 px, ajustar início e duração e confirmar a alternativa ao uso das alças.
5. Na [comparação visual](../timeline-study.html#gesture-study), alternar toque e mouse e os quatro enquadramentos. As oito combinações de largura e entrada foram verificadas em DOM simulado. A amostra ilustra alças e regras; os gestos no aparelho e os limiares físicos aguardam validação.

**Verificação.** Leitura do código da main local e cálculos com duas larguras. A lógica da prévia HTML foi executada em DOM com larguras simuladas: quatro cenários, enquadramento, zoom manual e teto de 200%. O navegador sem janela não retornou medidas da renderização. Alturas são estimativas de CSS. O aceite visual e os gestos reais continuam pendentes. A prévia usa dados fictícios e permite comparar escala e títulos.

## Entregas para decisão

- [x] Comparativo visual em tela larga e estreita da escala atual, de um passo abaixo/acima e do enquadramento automático. Mostrar um dia esparso, ações sobrepostas, uma ação curta e o estado vazio.
- [x] Proposta justificada do passo, mínimo e máximo do zoom, margem do enquadramento e comportamento das alças em barras estreitas.
- [x] Comparação lado a lado de uma e duas linhas com a barra atual, incluindo título cortado e alvo de clique ou toque.
- [x] Roteiro de aceite que distinga clicar no título, arrastar pelo título e ajustar duração pelas alças em mais de uma escala. Registrar quais comportamentos foram observados e quais ainda são proposta.

O proprietário decide os limites de zoom, a altura, os limites para mostrar alças e se deseja o comando de organização no celular antes de autorizar mudanças no app.

## Comparação com a grade real na galeria

Abra **/ui → Componentes Uzzina → Linha do tempo**. A galeria agora usa a grade, a barra e os gestos da tela Hoje com ações fictícias. Mover ou redimensionar altera apenas a grade da galeria. Clicar no título abre o formulário da prévia, onde a edição do título também é local. O título da barra é texto de leitura na galeria. A tela Hoje continua com a edição de título vigente.

1. Abra **Revisar pauta diária**, às **09h30**. Seus 10 minutos ocupam 60 px a 100%. No slider **Zoom da linha do tempo**, compare 40% (24 px), 30% (18 px) e 25% (15 px). A partir de 16 px, cada alça ocupa até 10 px e até um quarto da largura, deixando pelo menos metade do centro livre. A opção **Ocultar títulos abaixo de 24 px** começa ativa. Desligue para comparar o texto em barras estreitas. Em ambos os casos, a barra mantém o nome acessível, o tooltip Prism e a abertura pelo centro.
2. Compare **Altura atual** com **Compacta**. A compacta mede 28 px em uma linha e cerca de 39 px em duas, com corte a partir da terceira. Mude o zoom para que um título quebre e volte a caber em uma linha.
3. Use **Ajustar às ações** com todos os responsáveis selecionados. O intervalo de exemplo vai de 07h00 a 22h00 e inclui a ação de 10 minutos. Role e pressione novamente para reenquadrar. Mude o início ou fim de uma ação extrema e repita. Com enquadramento ativo, redimensione a janela e aguarde a pausa de 180 ms. O enquadramento usa então a nova largura. Depois de mover o slider manualmente, redimensione outra vez e confira que a câmera mantém a escala e o horário central dentro dos limites do dia. Sem ações nas linhas selecionadas, o botão fica indisponível.
4. Clique na barra e confira o horário. Feche, arraste pelo corpo e confirme que a ação mudou de horário sem abrir o formulário. Ajuste o início e a duração pelas alças. Confira Enter e setas na barra. Em tela de toque, confira a abertura por toque e a rolagem da grade.

O slider aplica o zoom de imediato e permite ajustar da visão do dia inteiro a 200%. A referência de 100% equivale a 6 px/min. A grade reduz a densidade de rótulos em escalas menores. A largura da barra continua proporcional à duração.

No navegador desktop, o slider respondeu por teclado. As alças apareceram com 16,19 px e ficaram ausentes abaixo de 16 px. O controle ocultou e revelou o título abaixo de 24 px, com tooltip Prism como única dica visual. Ao redimensionar com o enquadramento ativo, a escala permaneceu aos 40 ms e foi recalculada após a pausa observada de 320 ms. Toque físico segue pendente.

Alterações na main local. O proprietário decide se leva esse comportamento à tela Hoje depois de comparar na galeria.

## Modelos sugeridos

- **Codex — GPT-6.2 Sol.** Para medir a escala e preparar o comparativo de zoom e enquadramento.
- **Codex — GPT-6.1 Terra.** Para comparar a legibilidade e os alvos das barras em telas de larguras diferentes.
- **Codex — GPT-6.2 Astra.** Para avaliar em conjunto os casos de sobreposição, limites do dia, gestos e teclado.
