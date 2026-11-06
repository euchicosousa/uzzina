# IA-M05 — Dar feedback visual durante a geração

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para especificar os estados visuais do indicador.
- **Anthropic** — Claude Haiku 5.5, para detalhar a barra simulada e seu aceite.
- **Google** — Gemini 3.8 Flash, para propor o indicador sobre o fluxo existente.

**Escopo decidido em 06/11.** Estudo de uma barra com avanço visual simulado durante a geração. Todos os fluxos seguem sem streaming. O preenchimento avança com desaceleração até cerca de 97%, aguarda o retorno e só conclui com sucesso real. A posição da barra é visual. Exibir “Gerando…” em vez de publicar uma porcentagem de progresso como medida real. Proposta pendente de implementação autorizada.

## Aceite proposto

- Resposta rápida conclui assim que chegar. Resposta longa mantém o estado de espera no teto, com um sinal discreto de atividade como opção.
- Falha apresenta o erro do fluxo e permite nova tentativa conforme as guardas existentes. Nova tentativa reinicia o indicador.
- Associar a barra à operação atual e respeitar Reduzir movimento com estado estático de espera. Conferir legenda, conteúdo e estratégias nos estados de sucesso rápido, espera longa e falha. Na estratégia, respeitar a distinção já existente entre geração e salvamento.
- O reestudo anterior fica como [histórico](../../../docs/audits/2026-11-06-ia-m05-contornar-espera.md). O escopo atual é feedback de espera.

## Reversão dos logs — 06/11/2026

A pedido do proprietário, `8a9f035` foi revertido: saíram `server/ai-timing.ts` e as linhas `ai_timing`/`strategy_worker_timing` de `api/ai.ts` e `server/strategy-operations.ts`, além do item no `check-serverless-runtime.cjs`. A seção "Instrumentação" acima é histórica. Verificação: typecheck limpo, `ai` + `strategy-operations` com 103/0 e `test:serverless` com 9 PASS.
