# 07: Finalizar sugestões aprovadas como ações

**What to build:** A pessoa confere o resumo de uma proposta e confirma a conversão das sugestões aprovadas em ações; repetir a finalização da mesma proposta retorna o resultado já associado sem duplicar ações.

**Blocked by:** 02 — Revisar sugestões e salvar decisões.

**Status:** needs-product-decision — definir pendentes ao finalizar e data/horário/fuso antes de fixar o resumo e a conversão (P4/P5).

## Base existente a preservar

- A mesma página limpa da Mesa já existe, herdando layout atual e AppBar, com duas áreas de rolagem independentes, padding interno e desktop-only.
- Revisão e decisões canônicas vêm de #02; sugestões mantêm IDs próprios até uma conversão confirmada.
- A criação de ações existentes usa seus contratos/autorização normais. Nenhuma ação nasce ao abrir, aprovar individualmente ou mover uma sugestão.

## Definições pendentes

- P4: decidir se pendentes impedem finalizar ou permanecem fora da conversão; rejeitadas não se convertem. Não fechar ou remover pendentes por inferência.
- P5: decidir data obrigatória, horário e fuso/valor inicial. Não usar 11h, hoje ou “agora + 10 minutos” como padrão implícito.
- Definir quais campos aprovados da sugestão mapeiam para ação. Título/formato/objetivo/briefing são candidatos visíveis, não um mapeamento aprovado.

## Acceptance criteria

- [ ] O resumo apresenta contagens de aprovadas, pendentes e rejeitadas antes de confirmar; o bloqueio e tratamento de pendentes seguem P4.
- [ ] Somente sugestões aprovadas e elegíveis após revalidação do servidor podem resultar em ações. Rejeitadas nunca se convertem; pendentes seguem a decisão P4.
- [ ] Antes de criar, exigir os dados de data/hora/fuso definidos em P5 e informar claramente o destino e a quantidade de ações.
- [ ] Associação proposta–sugestão–ação e criação são atômicas sob versão esperada. Autorização, parceiro, decisões e valores são revalidados no servidor/banco; payload do navegador não determina a seleção.
- [ ] Uma sugestão pode criar no máximo uma ação, mesmo com duplo clique, chamadas concorrentes, abas diferentes, resposta perdida e repetição da finalização da mesma proposta. A repetição retorna os vínculos/resultados existentes sem duplicar.
- [ ] Falha antes da confirmação não deixa conjunto parcial de ações. Resultado ambíguo é consultado/reconciliado antes de declarar falha ou repetir a escrita.
- [ ] Mapeamento de campos usa exclusivamente o contrato aprovado; estados de ação, responsáveis, defaults e autorização seguem os contratos correntes de criação. Não gerar legenda/roteiro que a proposta não contém.
- [ ] Finalização não altera sugestões/ações por sincronização bidirecional posterior. A exclusão ou perda de acesso à ação não faz retry recriar a mesma ação nem revelar conteúdo fora do escopo.
- [ ] Ação resultante entra no cache somente após resposta canônica e escopo conhecido; sessão antiga não recebe o resultado. Falha, conflito e nova tentativa conservam a proposta até resolução.
- [ ] Testes em ambiente controlado cobrem autorização negativa, atomicidade, concorrência, repetição da mesma proposta, confirmação perdida, bloqueios P4/P5 e efeitos no cache; nenhuma fixture de escrita em produção.

**Fronteira:** única entrega que converte propostas em ações. Não define geração, revisão, calendário ou horário por conta própria. Após #02; integra serialmente com outros tickets que alterem o contrato de ações.
