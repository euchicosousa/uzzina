# Cache de prompts e acompanhamento de gasto (estudo)

Estudo de 12/11/2026 a pedido do proprietário, desdobrado do IA-M09. Entrega relatório; **nenhum código, chave ou configuração foi alterado**. Os números vêm de uma consulta só de leitura à tabela `ai_generation_logs` do banco.

## 1. O que é cache de prompt, em linguagem simples

Todo comando de IA envia um texto longo (as regras de redação e o contexto da marca) e, no fim, o pedido específico. O provedor consegue "lembrar" o começo do texto se ele for idêntico ao de uma chamada recente, e cobra essa parte bem mais barato (na OpenAI, a leitura do cache custa uma fração do preço normal; veja a coluna de cache em `server/ai-model-catalog.ts`). Só vale se: (a) o começo for **exatamente** igual, (b) a chamada seguinte vier **poucos minutos depois** e (c) o texto tiver tamanho mínimo.

## 2. Como cada empresa funciona

|                | OpenAI                                                     | Anthropic (Claude)                                                                                       |
| -------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Ativação       | Automática; nada a marcar                                  | Só funciona se a chamada **marcar** o trecho a guardar (`cache_control`)                                 |
| Tamanho mínimo | 1.024 tokens (documentação OpenAI)                         | Entre 1.024 e 4.096 conforme o modelo (valores de fontes de terceiros; conferir na documentação oficial) |
| Duração        | Poucos minutos em memória; retenção estendida configurável | 5 minutos, ou 1 hora marcada (a gravação custa mais)                                                     |
| Hoje na UZZINA | Ligado, com `promptCacheOptions: { ttl: "30m" }`           | **Não marcado**: nunca usa cache                                                                         |

A conferência do parâmetro de 30 minutos contra a documentação oficial da OpenAI **não foi feita** (a pesquisa não trouxe a página completa).

## 3. O que os dados reais mostram

Período registrado: 05/11 a 11/11/2026 (o registro de uso começou em 05/11; chamadas anteriores não aparecem). 75 chamadas. Custo total registrado: **cerca de US$ 0,56**, dos quais cerca de US$ 0,27 em modelos da OpenAI.

| Comando / modelo            | Chamadas | Média de entrada (tokens) | Parte lida do cache          |
| --------------------------- | -------- | ------------------------- | ---------------------------- |
| Estratégia, GPT-6 Luna      | 7        | 1.675                     | 20,9%                        |
| Estratégia, GPT-6.1 Terra   | 7        | 1.434                     | 25,8%                        |
| Estratégia, GPT-6.1 Sol     | 3        | 1.557                     | 32,3%                        |
| Conteúdo, Luna e Terra      | 16       | 1.420 a 1.730             | 0%                           |
| Legenda, Luna e Terra       | 14       | 757 a 1.088               | 0%                           |
| Qualquer comando com Claude | 39       | 1.919 a 5.230             | 0% (esperado: nunca marcado) |

Leitura:

- A **legenda** tem entrada menor que 1.024 tokens em parte das chamadas; abaixo disso não existe cache.
- O **conteúdo** passa de 1.024, mas dá 0%. No código ([api/ai.ts](../../api/ai.ts), comando de conteúdo) a identidade do publicador entra logo no início do texto de regras, antes de quase todo o texto fixo. Como ela muda por marca, o "começo igual" só se repete para a mesma marca em chamadas seguidas e rápidas. Com uso raro, isso quase nunca acontece.
- A **estratégia** acerta 21% a 32%: provavelmente as regras fixas do começo do texto (a conferir em `server/strategy-generation.ts`, não lido nesta rodada).
- **Claude: 0% porque o cache nunca é pedido.** Marcar o trecho exigiria mudança no servidor.

## 4. Vale a pena?

Em dinheiro, **não, hoje**. O uso total de uma semana de testes foi de poucos centavos; mesmo acertando 100% do cache, a economia seria de frações de centavo. Cache compensa quando há dezenas de chamadas seguidas sobre o mesmo contexto, o que não é o uso atual ("usamos raramente").

Se algum dia o volume crescer, em ordem de custo-benefício:

1. **OpenAI:** reorganizar os textos para que tudo que é fixo venha primeiro e o que muda (marca, título, briefing) venha por último. Sem custo extra.
2. **Claude:** marcar o bloco fixo com `cache_control`. A gravação é mais cara que a leitura normal, então só compensa se houver pelo menos duas chamadas dentro de 5 minutos.
3. O registro de uso (`cached_tokens`, `cache_write_tokens`) e o cálculo de custo já tratam leitura e gravação de cache, então não precisam mudar.

Registro de que **não** é recomendado agora: nenhuma alteração.

## 5. Como ver o que foi gasto na OpenAI

O que provavelmente acontece com o saldo "parado": o gasto real da UZZINA é de centavos (seção 3), então o saldo de uma compra feita há três meses mal se mexe. Além disso, a documentação e o fórum da OpenAI mostram quatro armadilhas comuns:

1. **Projeto versus organização.** Em `platform.openai.com` → Settings → Usage, existe a visão por projeto e a de organização. Escolha a **organização**, senão o gasto de outro projeto pode não aparecer.
2. **Saldo e compras.** Em Settings → Billing, veja o saldo de créditos; e em Billing → Credit grants (créditos concedidos), cada compra com o valor restante. Créditos de promoção também aparecem aí e são gastos primeiro.
3. **Atraso.** O saldo pode demorar a refletir compras e gastos recentes, e um gasto processado depois do fim do saldo pode aparecer como saldo negativo, descontado da próxima compra (help.openai.com).
4. **Confirmar a chave.** Em Usage, filtre por chave de API para ver se a chave da UZZINA é a que está sendo usada.

A fonte mais confiável dentro da UZZINA é o próprio banco: `ai_generation_logs` guarda tokens, cache e `provider_cost_usd` por chamada. A consulta usada neste estudo agrupa por mês, modelo e comando. **Hoje não há tela** para o proprietário ver isso; uma tela de gasto de IA em Minha Conta ou no Admin seria uma ideia de produto separada e não está autorizada.

Limites deste estudo: o custo do banco é o calculado pela UZZINA com as tarifas do catálogo, não a fatura da OpenAI nem da Anthropic. Não comparei com os painéis das duas empresas (não tenho acesso). Se o painel da OpenAI mostrar um gasto muito acima de US$ 0,30 para esse período, há consumo fora da UZZINA (outra chave, outro projeto).

## Fontes

- [Prompt caching, OpenAI](https://developers.openai.com/api/docs/guides/prompt-caching) (limiar de 1.024 tokens, retenção); [prompt caching, Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching); mínimos por modelo vieram de [LiteLLM](https://docs.litellm.ai/docs/completion/prompt_caching), terceiro, a conferir.
- Saldo e uso: central de ajuda da OpenAI sobre créditos pré-pagos e relatos no [fórum da OpenAI](https://community.openai.com/t/my-credit-balance-appears-stuck-even-with-usage/1378834) (relatos de usuários, não correções confirmadas).
