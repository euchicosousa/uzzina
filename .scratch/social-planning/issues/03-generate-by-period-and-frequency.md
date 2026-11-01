# 03: Gerar proposta por período e frequência

**What to build:** A pessoa escolhe um período e uma frequência aprovada, vê a quantidade resultante e gera uma proposta com sugestões distribuídas nas datas correspondentes.

**Blocked by:** 01 — Gerar e reabrir proposta por tema.

**Status:** needs-product-decision — frequência semanal, distribuição de dias e contagem de semanas incompletas ainda não foram aprovadas (P2).

## Base existente a preservar

- Completa a configuração na coluna esquerda da Mesa existente; preserva página limpa, layout interno/AppBar, divisória, padding interno, rolagens independentes e desktop-only.
- Usa geração, armazenamento, autorização, quota e identidade de proposta definidos em #01. Uma nova geração é integral e independente de ações/propostas anteriores.
- #05 depende desta definição de período para localizar datas comemorativas.

## Definições pendentes

- P2: definir frequência permitida, seleção/sugestão de dias e como semanas parciais entram na contagem. A proposta anterior de 1–7 por semana e contagem de ocorrências reais não é decisão.
- Definir se a pessoa ajusta os dias antes de gerar e quais contagens precisam ser mostradas.

## Acceptance criteria

- [ ] Início e fim usam datas civis, intervalo inclusivo, validado antes de qualquer chamada de IA ou escrita.
- [ ] A interface aplica somente a regra de frequência e contagem aprovada em P2. Mostra ao usuário o total exato que será solicitado antes de gerar.
- [ ] Cálculo de slots é determinístico e independente de fuso UTC; meses, anos bissextos e semanas parciais seguem o comportamento decidido, sem aproximação silenciosa de quatro semanas por mês.
- [ ] A IA preenche os slots fornecidos; não cria, remove, desloca ou renumera datas. Saída incompatível é recusada e não publicada como válida.
- [ ] Configuração do período, regra aprovada, total e datas geradas persistem com a proposta e reaparecem ao reabrir.
- [ ] Repetir uma nova geração no mesmo período cria a quantidade integral de novos slots; não consulta ações, não desconta ações existentes nem usa proposta anterior para completar o pedido.
- [ ] Sem configuração válida não há chamada ao provedor nem persistência parcial. Falhas de provedor/quota/salvamento são distintas de lista vazia e permitem recuperação sem duplicar a mesma solicitação.
- [ ] Sessão e autorização do parceiro são revalidadas pelo servidor segundo #01; troca de parceiro não mostra resultados antigos.
- [ ] Verificação cobre cálculo aprovado, limites de datas, erro/saída incompatível, nova geração integral, persistência e reabertura. Não fixar exemplos de semanas parciais antes de P2.

**Fronteira:** geração temporal e cálculo de slots. Não implementa distribuição de formatos (#04), extras comemorativos (#05), revisão (#02), calendário (#06) ou finalização (#07). Pode trabalhar em paralelo com #02/#04 após #01, em checkout isolado.
