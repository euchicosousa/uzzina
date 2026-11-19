# HOJE-05 — Arrastar para horários fora da tela e ler os minutos na Linha do tempo

**Onde conferir** — Hoje ou Home → menu Visualizar → Linha do tempo.

**Antes** — O gesto calcula o movimento pela distância do ponteiro na tela e não rola o quadro nas bordas. O print com a ação cortada exemplifica a limitação. A régua já mostra linhas intermediárias conforme o zoom, mas no print entre 16h e 17h só as horas têm rótulo.

**Depois** — Ao aproximar a ação das bordas horizontais, o quadro desliza na direção correspondente e a prévia acompanha o horário sob o ponteiro. A régua mostra minutos intermediários quando houver espaço.

**Bloqueado por** — Nenhum outro ticket.

**Status** — Aberto na main local. Aguardando implementação e revisão visual antes de publicar.

- [ ] Em Hoje e Home, mover uma ação para um horário inicialmente fora da tela, nos dois sentidos, em um só arraste. A prévia considera a distância rolada e o horário salvo coincide com a prévia. A rolagem para ao sair da faixa da borda, ao soltar ou cancelar e no limite do dia.
- [ ] Conferir que clique para abrir, gestos das alças, teclado e deslize por toque mantêm o comportamento atual. Cancelar o arraste preserva o horário original.
- [ ] Preservar as horas como referência principal. Mostrar primeiro a meia hora, depois 15, 30 e 45 quando couber e considerar intervalos de dez minutos em escalas mais abertas. Usar uma cadência por faixa, sem sobrepor horas, minutos ou o marcador Agora.
- [ ] Conferir janela estreita e larga, ajuste às ações e zoom de 100%. Comparar a legibilidade em tema claro e escuro com texto secundário da paleta ou foreground a 50% como ponto de partida. Validar com o proprietário a densidade e a cor antes do aceite.

## Modelos sugeridos

- Codex · GPT-6.2 Sol · Primeira opção para ajustar o arraste e a régua e verificar o comportamento no navegador.
- Codex · GPT-6.1 Terra · Alternativa com foco na leitura da régua em vários tamanhos e níveis de zoom.
- Codex · GPT-6.2 Astra · Alternativa se gesto, rolagem e persistência exigirem diagnóstico conjunto.
