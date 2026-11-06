# IA-M05 — Contornar a espera da geração com IA

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para desenhar fluxos de interface que liberem a pessoa durante a geração sem violar o controle de versão.
- **Anthropic** — Claude Sonnet 5.5, para especificar a guarda de saída, o aviso de conclusão e a expectativa no seletor.
- **Google** — Gemini 4 Argon, para revisar a experiência proposta e estimar o esforço de cada recorte. Disponibilidade depende do plano.

**Escopo corrigido pelo proprietário em 06/11/2026.** A demora é normal: modelos baratos são mais rápidos e os caros demoram. Não é para reduzir a latência, é para contornar a espera. Sem streaming. **Entrega:** opções de experiência para que a espera atrapalhe menos, com uma recomendação. O proprietário relatou espera perceptível com Luna e bem maior com Astra. Já existem indicadores de carregamento nos comandos.

**Bloqueado por.** Nenhum ticket. Usar as chamadas e registros disponíveis no IA-M04. Novas chamadas reais, se necessárias, devem ter escopo autorizado.

**Status.** Reestudo entregue em 06/11/2026 ([contornar a espera](../../../docs/audits/2026-11-06-ia-m05-contornar-espera.md)), aguardando a escolha dos recortes pelo proprietário. Estudo apenas: nada implementado. Os logs de tempo de `8a9f035` foram revertidos a pedido do proprietário em 06/11/2026.

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

## Instrumentação — 06/11/2026

Código preparado (sem mudança de comportamento; não publicado, nenhuma geração executada). Uma linha JSON por requisição, sem texto, tokens, chaves, e-mails nem ID de usuário.

**Síncrono (`api/ai.ts`)**, evento `ai_timing`, emitido ao terminar a resposta (inclui erros):

```json
{
  "event": "ai_timing",
  "command": "ai-caption",
  "model": "...",
  "ms": { "auth": 0, "quota": 0, "provider": 0, "usage": 0, "total": 0 },
  "status": 200,
  "ok": true
}
```

- `auth`: `getUser` + `people`; `quota`: `consume_ai_usage` + `reserve_ai_monthly`; `provider`: chamada ao modelo (em falha, até o fim da resposta); `usage`: registro do uso (`null` em falha do provedor e no modo local); `total`: requisição inteira.
- Estratégias pelo caminho síncrono também usam `ai_timing` (`command: "ai-strategy"`).

**Worker (`server/strategy-operations.ts`)**, evento `strategy_worker_timing`, uma linha por operação processada:

```json
{
  "event": "strategy_worker_timing",
  "operationId": "...",
  "model": "...",
  "ms": {
    "claim": 0,
    "claim_to_provider": 0,
    "provider": 0,
    "usage": 0,
    "store": 0,
    "finish": 0,
    "total": 0,
    "queue_wait": null
  },
  "outcome": "succeeded",
  "resumed": false
}
```

- `queue_wait` fica `null`: o claim não devolve `created_at` e não foi adicionada leitura extra. A fila continua medida pela consulta SQL da seção 7.1 do relatório (aceitação até registro).

**Onde ler:** Vercel > projeto > Logs (funções `/api/ai` e `/api/strategy-worker`), filtrando por `ai_timing` ou `strategy_worker_timing`.

**O que coletar nas próximas gerações do proprietário (Luna e Astra):** mesma ação, mesmo texto e mesmo comando, 3 execuções por modelo, em horários próximos. Para cada uma, anotar a linha do log (`ms.provider`, `ms.auth`, `ms.quota`, `ms.total`) e, na tabela `ai_generation_logs`, `prompt_tokens`, `completion_tokens`, `provider_meter.reasoning_tokens` e `cached_tokens`. Em estratégias, anotar também o horário em que clicou e o horário em que o resultado apareceu, para separar fila e polling do provedor. Comparar as medianas de `provider` entre Luna e Astra.


## Reversão dos logs — 06/11/2026

A pedido do proprietário, `8a9f035` foi revertido: saíram `server/ai-timing.ts` e as linhas `ai_timing`/`strategy_worker_timing` de `api/ai.ts` e `server/strategy-operations.ts`, além do item no `check-serverless-runtime.cjs`. A seção "Instrumentação" acima é histórica. Verificação: typecheck limpo, `ai` + `strategy-operations` com 103/0 e `test:serverless` com 9 PASS.
