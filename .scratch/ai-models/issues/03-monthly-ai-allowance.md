# IA-M03 — Aplicar cota mensal e mostrar consumo em Minha Conta

## Modelos sugeridos

- **OpenAI** — GPT-6 Astra, para validar reserva concorrente, teto mensal e reconciliação.
- **Anthropic** — Claude Opus 5.5, para validar reserva concorrente, teto mensal e reconciliação.
- **Google** — Gemini 4 Argon, para validar reserva concorrente, teto mensal e reconciliação. Disponibilidade depende do plano do Antigravity.

**Entrega.** Cota inicial configurável de US$ 5 por pessoa por mês para os comandos atuais. Minha Conta mostra percentual consumido e total de chamadas de geração no período. A referência é interna e vale para o produto atual.

**Bloqueado por.** [IA-M01](01-model-catalog-selection-and-metering.md).

- Calcular o percentual pelo custo acumulado no período dividido pela cota em USD. Exemplo: US$ 1,25 de US$ 5 equivale a 25%. A estimativa de preço da assinatura em reais fica como hipótese comercial.
- Propor ciclo de mês-calendário UTC para a primeira versão. Mostrar o período na interface e validar a virada de mês. Preservar a autorização e a separação por pessoa. Tratar explicitamente a transição de weighted_tokens_v1 e evitar combinar escalas antigas com USD.
- Para sustentar um teto efetivo, reservar no servidor um limite superior com base no contexto enviado, no teto de saída do comando e nas tarifas aplicáveis. Fazer a reserva de modo atômico para chamadas simultâneas e conciliar com o uso reportado ao terminar. Quando a API não devolver o uso, preservar o estado pendente para revisão. Testar idempotência e vínculo ao mês de aceitação, inclusive para estratégia em fila.
- Calibrar limites por comando a partir de saídas representativas, com folga para entregar conteúdo completo. Se a reserva não couber no saldo, explicar a situação e permitir outra escolha compatível quando o seletor estiver disponível. Evitar reduzir silenciosamente a qualidade ou trocar o modelo.
- Validar com geração real autorizada e cenários controlados de saldo insuficiente, concorrência, falha e nova competência. O percentual reflete custo conciliado e o total de chamadas segue a regra definida no IA-M01.
