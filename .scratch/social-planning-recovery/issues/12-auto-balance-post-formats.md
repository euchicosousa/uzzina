# T12 — Ajustar o equilíbrio entre formatos e atualizar a prévia

## Modelos sugeridos

- **Codex — GPT-6.1 Terra, raciocínio baixo.** Comparar três sliders de quantidades interligados com os controles Prism.
- **Codex — GPT-6.2 Sol, raciocínio médio.** Implementar redistribuição inteira após aceite e exercitar totais pequenos e desempates.
- **Codex — GPT-6.2 Astra, raciocínio baixo.** Conferir a ligação entre composição, calendário, lista e entrada da geração.

**Status:** ready-for-agent. Atualizado em 19/11: a prévia com os sliders foi aprovada pelo proprietário e está na main local. Permanecem abertas as regras de arredondamento da semana parcial, sobras, durações dos atalhos e extras (D2/D3).

**Bloqueado por.** A bancada pode ser estudada primeiro. A implementação usa o total normalizado de T03 e depende da regra de D3; extras dependem de D3/D4. Série em espera.

## Entrega e aceite

Na Mesa, a distribuição automática inicia equilibrada. Em Definir quantidades, o admin move três sliders para Estático, Carrossel e Reels. Um ajuste redistribui a diferença nos outros dois, na ordem de prioridade indicada. Na bancada, a redução de 8 para 4 Reels soma 3 Estáticos e 1 Carrossel. O total regular é preservado e os placeholders atualizam no calendário e na lista.

- [ ] Aprovar na bancada a interação, o arredondamento, os empates, a possibilidade de zerar um formato e a resposta à mudança de total. A prioridade segue Estático, Carrossel e Reels, com proporção de dois para um entre os formatos restantes. Conferir como cede espaço ao aumentar uma quantidade e como tratar sobras.
- [ ] Demonstrar composição inicialmente equilibrada, mudanças a favor de cada formato, totais menores que o número de formatos e redução de total. O resultado é inteiro e soma exatamente ao total regular.
- [ ] Prévia, resumo e entrada de geração usam a mesma composição. Extras têm contagem própria e seguem a regra aprovada em D3/D4.
- [ ] Controles reaproveitam o Prism e permitem operação por teclado. A validação visual ocorre nos modos claro e escuro.
