# 04: Distribuir sugestões por formato

**What to build:** A pessoa pode pedir uma composição de formatos para uma proposta, ou deixar a escolha automática, e conferir que o resultado respeita o pedido confirmado.

**Blocked by:** 01 — Gerar e reabrir proposta por tema.

**Status:** needs-product-decision — confirmar as regras de distribuição e o comportamento quando o total muda (P3).

## Base existente a preservar

- Estende os controles da Mesa existente sem alterar seu layout limpo, o cabeçalho/AppBar global, as duas rolagens independentes ou a restrição desktop-only.
- Usa os slots e o contrato de geração persistente de #01; quando #03 for integrado, recebe o total calculado por ele sem duplicar cálculo de frequência.
- Edição individual de sugestão pertence a #02; essa extensão não cria revisão ou conversão.

## Definições pendentes

- P3: confirmar se a composição precisa somar exatamente o total regular e o que ocorre quando o total ou período muda depois de informada.
- Os formatos tratados são os três já citados: estático, carrossel e reels. Não ampliar este ticket para um catálogo novo.

## Acceptance criteria

- [ ] Composição opcional é clara e acessível; sem pedido explícito, o sistema aplica apenas o comportamento automático aprovado.
- [ ] Validação de inteiros, limites e relação com o total usa somente as regras aprovadas em P3. Valores inválidos são explicados antes de chamar o provedor.
- [ ] O pedido e o resultado distinguem quantidade regular por formato; resposta incompatível não é anunciada como válida nem corrigida silenciosamente.
- [ ] Valores confirmados persistem e são mostrados ao reabrir a proposta, incluindo o modo automático quando escolhido.
- [ ] Se a base de quantidade mudar por integração de #03 ou edição permitida, a distribuição desatualizada é sinalizada e pede uma decisão explícita; não reequilibra formatos em silêncio.
- [ ] Extras de comemorações de #05 mantêm contabilidade própria, depois das regras aprovadas, e não consomem silenciosamente a quantidade regular.
- [ ] Falhas/retry preservam o pedido e não geram duplicatas da mesma operação. Sessão e parceiro seguem as guardas server-side de #01.
- [ ] Verificação cobre modo automático, composição válida/inválida e divergência de saída sob as regras finais de P3; integração com #03 usa o total canônico.

**Fronteira:** distribuição opcional de formatos e validação do resultado. Não redefine o núcleo de geração, frequência, revisão, calendário ou conversão. Pode andar com #02/#03 após #01, em checkout isolado.
