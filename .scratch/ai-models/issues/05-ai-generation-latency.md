# IA-M05 — Investigar a demora na geração com IA

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para rastrear a espera entre interface, API e worker.
- **Anthropic** — Claude Sonnet 5.5, para comparar gargalos e alternativas com base nas medições.
- **Google** — Gemini 4 Argon, para analisar os tempos por etapa e estimar o esforço das opções. Disponibilidade depende do plano.

**Entrega.** Um diagnóstico com tempos por etapa e uma recomendação para reduzir a espera real ou melhorar a experiência enquanto o resultado fica pronto. O proprietário relatou espera perceptível com Luna e bem maior com Astra. Já existem indicadores de carregamento nos comandos.

**Bloqueado por.** Nenhum ticket. Usar as chamadas e registros disponíveis no IA-M04. Novas chamadas reais, se necessárias, devem ter escopo autorizado.

**Status.** Investigação de código entregue; medição real pendente da instrumentação proposta.

## Critérios de aceite

- [ ] Comparar Luna e Astra com entradas equivalentes. Registrar comando, modelo, tamanho da entrada e saída, estado do cache e configuração de raciocínio quando observáveis. Identificar o que é relato do usuário e o que foi medido.
- [ ] Separar tempo até o primeiro sinal na tela, processamento da API e reserva, espera na fila quando houver, tempo do provedor, gravação e atualização visível. Conferir legenda e conteúdo síncronos e estratégias duráveis. Distinguir a resposta pronta do momento em que a pessoa consegue usá-la.
- [ ] Avaliar alternativas ao streaming completo. Considerar ajustes no prompt, esforço de raciocínio e volume de saída, latência de fila ou atualização da interface e acompanhamento em segundo plano. Comparar com streaming parcial ou completo como referência, incluindo se ele reduziria a espera até ver algo e o que aconteceria com o tempo total.
- [ ] Recomendar o menor ajuste que ataque o gargalo medido. Explicitar impacto em qualidade, custo, complexidade, salvamento, controle de versão e proteção contra chamadas duplicadas. Registrar qual hipótese testar primeiro e como medir o resultado.

O escopo desta entrega é diagnóstico e decisão. Mudanças no fluxo de geração ficam para uma execução posterior.

## Investigação — 06/11/2026

Relatório: [2026-11-06-ia-m05-ai-latency.md](../../../docs/audits/2026-11-06-ia-m05-ai-latency.md). Análise somente de código; nenhuma medição real.

- Nenhum `reasoningEffort` é definido; a diferença Luna x Astra é provavelmente tempo de provedor (inferido). Fila, preflight e polling não dependem do modelo.
- Estratégias têm espera fixa por construção: cron de 30 s (média 15 s) mais quatro requisições de preflight e polling de 2 s.
- Menor ajuste proposto: esforço de raciocínio por modelo/comando no catálogo; depois acordar o worker na aceitação. Streaming só para conteúdo, se ainda necessário.
- Medição: consulta somente leitura (`ai_generation_logs` x `strategy_operations`) e logs por etapa propostos no relatório; nada aplicado.
