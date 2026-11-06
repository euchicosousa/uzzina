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

## Implementação local — 05/11/2026

- Minha Conta consulta a franquia individual da sessão em mês UTC. A resposta contém período, percentual conciliado, chamadas e estado de pendência. A referência inicial de US$ 5 está na configuração privada do banco. Registros IA-M01 com medição de provedor entram no mês registrado. O histórico exclusivamente ponderado é preservado e fica fora da escala USD.
- O servidor reserva antes de chamar o provedor. A aceitação de estratégia reserva na mesma transação que cria o trabalho. A trava por pessoa serializa reservas; o saldo considera gastos e reservas abertas. A conciliação usa o ID da reserva na geração direta e o da operação na fila, preservando o mês original. Falha de uso ou resposta incerta mantém a reserva para revisão; estratégia interrompida antes do envio libera a reserva.
- Limites iniciais de saída, incluindo raciocínio: 2.048 para legenda, 4.096 para hooks e 8.192 para conteúdo e estratégias. Uma resposta truncada continua contabilizada e é recusada como resultado. A reserva considera bytes dos insumos, margem de instruções e as maiores tarifas Luna Standard. A única amostra tarifada de produção consultada tinha 204 tokens de saída e era de legenda; os outros limites ainda precisam de amostras representativas.
- Verificação: 113 testes focados, nove endpoints serverless e typecheck. PostgreSQL isolado executou as migrations e confirmou saldo insuficiente, isolamento entre usuários, idempotência, conciliação, custo pendente, permissões, liberação antes do envio e atribuição à competência anterior após remoção da operação. O ensaio isolado foi sequencial; falta teste concorrente com sessões independentes.
- Publicação pendente. Drenar estratégias em andamento antes da migration e coordenar publicação da API/worker com a ativação da reserva. Validar geração real, qualidade das saídas nos quatro comandos, teste concorrente e a interface de Minha Conta. Nenhuma escrita remota ou geração paga nesta rodada.

## Publicação em produção — 05/11/2026

Aplicada com autorização explícita e fila sem trabalho em aceitação ou geração. A migration remota é `20261105231859_ai_monthly_allowance`. Consulta sob papel autenticado retornou novembro de 2026, 0,01% e uma chamada para o membro da legenda do IA-M01. A leitura exige autenticação e a reserva é restrita ao servidor.

Build isolado de `d65e912` mais o delta IA-M01/IA-M03 e seu medidor. Typecheck, build e nove verificações serverless passaram. Deploy `dpl_DxUDfqvXePspjJxFCx6NEjoYHEYU` Ready e confirmado no domínio de produção. Perfil HTTP 200, API e worker 405 em GET e operações 401 sem sessão. Falta verificar a tela autenticada e conciliar geração nova com a reserva mensal. Concorrência com sessões independentes e amostras para validar os tetos dos demais comandos continuam pendentes.

### Conciliação do ensaio real — 05/11/2026

Para o mesmo membro do IA-M01, o banco registrou quatro chamadas após a promoção, todas com reserva mensal e custo conciliado: uma legenda, um conteúdo e duas estratégias. As duas operações de estratégias terminaram em succeeded. Total US$ 0,002966545. Máximos observados de saída: legenda 377, conteúdo 421 e estratégia 2.156. Não apareceu registro de hooks nesse recorte. Falta observar hooks e executar o cenário concorrente com sessões independentes. A [triagem do diálogo](../../../docs/audits/2026-11-05-strategy-dialog-triage.md) segue separada.
