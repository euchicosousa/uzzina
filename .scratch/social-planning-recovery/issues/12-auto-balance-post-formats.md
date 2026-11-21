# T12 — Ajustar o equilíbrio entre formatos e atualizar a prévia

## Modelos sugeridos

- **Codex — GPT-6.1 Terra, raciocínio baixo.** Comparar três sliders de quantidades interligados com os controles Prism.
- **Codex — GPT-6.2 Sol, raciocínio médio.** Implementar redistribuição inteira após aceite e exercitar totais pequenos e desempates.
- **Codex — GPT-6.2 Astra, raciocínio baixo.** Conferir a ligação entre composição, calendário, lista e entrada da geração.

**Status:** ready-for-agent. Em 21/11 o proprietário testou os sliders de formatos (ok) e definiu a regra das comemorações abaixo, implementada em 21/11 na `main` local (sem verificação visual do proprietário). Arredondamento, sobras e durações dos atalhos ficam como estão (aceitos junto com o T03).

**Bloqueado por.** A bancada pode ser estudada primeiro. A implementação usa o total normalizado de T03 e depende da regra de D3; extras dependem de D3/D4. Série em espera.

## Entrega e aceite

Na Mesa, a distribuição automática inicia equilibrada. Em Definir quantidades, o admin move três sliders para Estático, Carrossel e Reels. Um ajuste redistribui a diferença nos outros dois, na ordem de prioridade indicada. Na bancada, a redução de 8 para 4 Reels soma 3 Estáticos e 1 Carrossel. O total regular é preservado e os placeholders atualizam no calendário e na lista.

- [ ] Aprovar na bancada a interação, o arredondamento, os empates, a possibilidade de zerar um formato e a resposta à mudança de total. A prioridade segue Estático, Carrossel e Reels, com proporção de dois para um entre os formatos restantes. Conferir como cede espaço ao aumentar uma quantidade e como tratar sobras.
- [ ] Demonstrar composição inicialmente equilibrada, mudanças a favor de cada formato, totais menores que o número de formatos e redução de total. O resultado é inteiro e soma exatamente ao total regular.
- [ ] Prévia, resumo e entrada de geração usam a mesma composição. Extras têm contagem própria e seguem a regra aprovada em D3/D4.
- [ ] Controles reaproveitam o Prism e permitem operação por teclado. A validação visual ocorre nos modos claro e escuro.

## Regra das comemorações (decisão do proprietário, 21/11/2026)

- Todas as datas comemorativas marcadas entram, inclusive duas, três ou mais no mesmo dia: cada uma é uma sugestão própria (a regra atual de juntar as do mesmo dia em um único extra "A / B" está incompleta e deve ser substituída).
- Dia que já tem publicação regular: a comemoração **substitui** a regular. Em vez de regra fixa, o proprietário quer um interruptor "Substituir o post do dia" (a definir: padrão ligado ou desligado e onde fica na tela).
- O cartão da prévia mostra o **nome da comemoração**.
- O formato do extra deve ser **Estático (post)**, e não carrossel como hoje, a menos que a ideia gerada peça outro formato; esse detalhe fica para depois.
- Implementado em 21/11 (não visto no navegador): datas do mesmo dia não são mais juntadas; interruptor "Substituir o post do dia" ligado por padrão, gravado na proposta e validado no servidor (ausente = ligado); extras Estático; a prévia mostra o nome da comemoração. Falta a conferência visual do proprietário.
