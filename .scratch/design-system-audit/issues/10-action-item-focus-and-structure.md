# DS10 — Investigar o anel de foco, os sinais de Sprint e a estrutura do ActionItem

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para reproduzir a transição e rastrear a interação entre foco, atraso e Sprint.
- **Anthropic** — Claude Sonnet 5.5, para avaliar a organização do componente e a precedência dos indicadores de Sprint.
- **Google** — Gemini 4 Argon, para comparar a renderização nos consumidores reais. Disponibilidade depende do plano.

**Entrega.** Relatório com reprodução, causa, inventário estrutural e proposta de correção. Escopo de investigação. Nenhuma alteração no código do app nesta etapa.

**Bloqueado por.** Nenhum ticket para começar. Registrar o estado do DS06 usado na reprodução, pois seus tokens de relevo podem afetar a aparência.

## O que investigar

1. **Começar pela variante Linha.** Ao clicar na ação, o anel parece passar de duas ou três linhas ou pixels para uma. Registrar o estado antes, durante e depois do foco. Confirmar se há transição de espessura, sobreposição de ring, outline, borda e sombra ou outra causa. Comparar clique no cartão, clique no título, navegação por Tab e perda de foco. Usar estilos computados e evidência visual para distinguir hipóteses de achados.
2. **Conferir as demais variantes e usos reais.** Mapear variantes e consumidores, incluindo calendário, Kanban, Feed, Sprint e galeria quando aplicáveis. Comparar foco do cartão e dos controles internos com hover, edição, seleção e arraste. Conferir paletas com e sem relevo, temas claro/escuro e foco visível por teclado.
3. **Revisar a estrutura.** Mapear o que é compartilhado e o que muda por variante, onde estilos e eventos são compostos e se há regras duplicadas, dependências implícitas ou conflitos de precedência. Indicar o que vale manter e o que merece simplificação, separando ajustes estruturais da correção do anel.
4. **Investigar os sinais de Sprint.** Reproduzir a ação atrasada em Sprint que aparece vermelha e com raio, mas sem anel de Sprint, e as demais ações em Sprint que não mostram nem raio nem anel. Rastrear separadamente os dados da ação, o Sprint ativo da pessoa, as condições de exibição do ícone e do anel e os pontos que montam cada variante. Conferir se o atraso, o foco ou a seleção suprimem o anel e se alguma variante ou configuração omite os dois indicadores. Comparar ações em Sprint atrasadas e no prazo, com e sem foco, com uma ação fora do Sprint como controle. Registrar quando cada indicador deveria aparecer e propor como manter a associação visível junto ao estado de atraso.
5. **Investigar o recorte lateral das sombras em Hoje.** Reproduzir o corte visto nas capturas, começando por Hoje → Parceiros. Comparar com a Sprint usando a mesma paleta e, quando possível, o mesmo cartão e variante. Ambos renderizam `ActionItem`, mas Hoje → Parceiros usa `ActionContainer` e a Sprint usa seu próprio grid com `SortableItem`. Identificar qual ancestral recorta a sombra, inspecionando padding, overflow e máscaras de rolagem. Testar a hipótese de aumentar apenas o padding horizontal de 1 para 2 na escala do projeto (`px-2`) e comparar com um espaçamento interno compartilhado entre as listas. Propor como unificar o tratamento da sombra, conferindo largura útil, alinhamento, rolagem, foco e arraste. Incluir os demais consumidores de `ActionContainer` na avaliação se o ajuste for compartilhado.
6. **Propor a correção.** Recomendar o menor ajuste que produza um contorno estável e legível e elimine o recorte indevido das sombras. Explicar os impactos e registrar um roteiro de aceite que cubra foco, abertura da ação, edição do título, seleção e arraste.
