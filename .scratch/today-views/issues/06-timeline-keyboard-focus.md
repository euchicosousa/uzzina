# HOJE-06 — Simplificar o foco de teclado nas ações da Linha do tempo

**Onde abrir.** Hoje → Visualizar → Linha do tempo; o mesmo quadro aparece no bloco Hoje da Home.

**Status.** Encerrado com aprovação do proprietário em 22/11/2026. A navegação percorre a ação inteira, alça esquerda e alça direita nessa ordem, inclusive em barras estreitas e ponteiro coarse; as alças não interceptam ponteiro quando não estão sendo usadas. O foco redundante e o redimensionamento com `Shift` + setas foram removidos. Código aprovado localmente, sem push/publicação.

**Verificação local (22/11/2026).** `bun run typecheck` e `bun run build` passaram; build gerou os utilitários `pointer-fine:group-hover` e `focus-visible:pointer-events-auto` usados pelas alças. Revisei a ordem DOM (ação, alça esquerda, alça direita) e confirmei que as alças permanecem montadas mesmo abaixo de 16 px; não rodei navegador com teclado/coarse pointer nem testes automatizados. `bunx biome check app/components/layout/TimelineBoard.tsx` não encontrou erros, mas reportou um aviso `noConfusingVoidType` em `writes` (linha 531), preexistente e fora do trecho alterado. Build manteve o aviso preexistente de chunks acima de 500 kB. Não publiquei o código. Prints da conversa usados como descrição; não foram encontrados como arquivos locais.

**Problema.** Ao navegar por teclado numa barra da Linha do tempo, o foco para no corpo da ação e em elementos internos que oferecem comandos repetidos. Os dois estados de foco do corpo movem a ação em passos de cinco minutos; `Shift` + setas também ajusta o término, embora esse ajuste já esteja disponível pelas alças. Isso cria quatro paradas por barra e torna a navegação confusa.

**Resultado desejado.** Cada ação deve ter exatamente três paradas de Tab, nesta ordem:

1. **Ação inteira:** setas esquerda/direita movem a ação em passos de cinco minutos.
2. **Alça esquerda:** ajusta o início, mantendo o término.
3. **Alça direita:** ajusta o término, mantendo o início.

Depois da alça direita, Tab segue para a próxima ação conforme a ordem normal da página. As três paradas permanecem disponíveis mesmo em zoom estreito e em dispositivos com ponteiro principal de toque: nesses casos, as alças ficam invisíveis e sem capturar toque/mouse até receberem foco pelo teclado, quando o foco precisa ficar visível. Remover a parada de foco duplicada do corpo e não usar `Shift` + setas para redimensionar; o redimensionamento fica nos dois handles.

Os três pontos devem seguir o padrão visual de foco do app e do componente da Linha do tempo. Usar os prints anexados à solicitação de 22/11 como referência do problema: anel roxo no corpo e foco de contorno retangular/lilás aparecem como dois tratamentos simultâneos ou sucessivos para a mesma ação.

**Critérios de aceite.**

- [x] Em Hoje e na Home, Tab percorre cada ação em três paradas, sempre na ordem corpo → alça esquerda → alça direita, inclusive em zoom estreito e em dispositivos pointer-coarse com teclado.
- [x] Com o foco no corpo, setas movem a ação para frente/para trás em passos de cinco minutos; início e término se deslocam juntos.
- [x] Com foco na alça esquerda, as teclas de ajuste alteram só o início; com foco na alça direita, alteram só o término.
- [x] `Shift` + setas no corpo não redimensiona a ação. O redimensionamento é acionado pelas alças.
- [x] Depois da alça direita, Tab vai ao próximo controle/ação; Shift+Tab percorre a ordem inversa sem parada oculta ou duplicada.
- [x] As alças ficam inertes para ponteiro quando não são usadas para mouse/toque; ao receberem foco pelo teclado, ficam visíveis com o foco padrão Prism, sem anel e contorno concorrentes como nos prints.
- [x] Enter/Espaço no corpo ainda abre a ação; Escape, limites do dia, duração mínima, mouse e toque mantêm o comportamento esperado.

**Escopo relacionado.** HOJE-04 foi conferido pelo proprietário no app publicado em 22/11; este ticket é uma correção nova, identificada durante essa conferência. HOJE-05 trata da rolagem automática ao arrastar a ação para as bordas e permanece separado.

## Modelos sugeridos

- Codex — GPT-6.2 Sol. Para ajustar a ordem de foco e os comandos de teclado no componente existente.
- Codex — GPT-6.1 Terra. Para revisar a hierarquia visual dos estados de foco a partir dos prints e conferir uso com teclado.
- Codex — GPT-6.2 Astra. Para revisar os riscos de interação entre foco, arraste, handles, acessibilidade e persistência.
