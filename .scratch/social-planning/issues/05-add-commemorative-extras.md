# 05: Considerar datas comemorativas como extras

**What to build:** Para um planejamento com período, a pessoa pode incluir oportunidades pertinentes baseadas nas datas comemorativas cadastradas, preservando os itens regulares solicitados.

**Blocked by:** 03 — Gerar proposta por período e frequência.

**Status:** needs-product-decision — aprovar regras dos extras, limite e relação com os formatos regulares antes de habilitar geração (P3).

## Base existente a preservar

- Usa o intervalo e a contagem canônica de #03 e estende o núcleo de geração de #01; não muda CRUD administrativo de datas comemorativas.
- A Mesa continua limpa, dentro do layout atual, com AppBar, duas colunas roláveis independentes, padding interno e desktop-only.
- Planejamentos repetidos são novas solicitações integrais; não usam ações já existentes para remover ou descontar uma data.

## Definições pendentes

- P3: confirmar o critério de pertinência, limite de extras, explicação exigida, fontes/datas elegíveis e se a distribuição de formatos de #04 inclui ou exclui extras.
- Não assumir máximo de 10 extras, inclusão padrão ou recorrência anual.

## Acceptance criteria

- [ ] O controle de inclusão usa o padrão aprovado em P3 e não consulta comemorações quando desligado ou sem período válido.
- [ ] A consulta usa somente as fontes e regras de data aprovadas em P3; não acrescenta fontes ou recorrências por inferência.
- [ ] Apenas candidatos autorizados são enviados ao fluxo de IA; resposta deve referenciar candidatos válidos sem duplicar a mesma comemoração na mesma proposta.
- [ ] Resultado distingue itens regulares de extras e preserva data/origem do registro utilizado; resposta inválida ou externa ao conjunto autorizado não é publicada.
- [ ] A contagem regular permanece integral; extras não reduzem frequência nem distribuição regular. Totais e comportamento respeitam os limites aprovados em P3.
- [ ] Sem candidatos ou extras pertinentes, a geração segue o comportamento definido em P3, com explicação clara; falha na consulta não é representada como catálogo vazio.
- [ ] Falha, retry, nova geração, troca de parceiro e sessão preservam separação e não duplicam ou carregam resultados antigos.
- [ ] Verificação cobre opção ligada/desligada, bordas de período, datas inválidas, pertinência, consulta indisponível, contagem e combinação com #04 depois de definidas as regras.

**Fronteira:** extensão de geração que lê datas comemorativas existentes. Não altera CRUD, cálculo temporal de #03, editor de #02, calendário de #06 ou finalização de #07. Pode ser implementado depois de #03; coordenação serial de alterações compartilhadas do contrato de geração.
