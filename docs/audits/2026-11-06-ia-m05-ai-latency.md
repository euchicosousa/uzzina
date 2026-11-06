# IA-M05 — Investigação da demora na geração com IA (código)

Data: 06/11/2026. Ticket: [IA-M05](../../.scratch/ai-models/issues/05-ai-generation-latency.md).

**Escopo e limite.** Análise somente de arquivos locais. Nenhuma geração, nenhuma consulta ao banco, nenhuma chamada de rede e nenhuma alteração de código. **Nenhuma medição real foi feita nesta rodada**: tudo o que aparece como "estimado" é inferência, não dado.

## 1. O que é relato, o que o código prova e o que é inferência

| Tipo               | Conteúdo                                                                                                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relato do usuário  | Espera perceptível com Luna e bem maior com Astra. Sem comando, tamanho de entrada ou tempo informados.                                                                                                                                                                                  |
| Provado pelo código | Sequência de etapas, configuração do provedor (nenhum esforço de raciocínio definido), intervalo do agendador (30 s), polling de 2 s, ausência de streaming, limites de saída e quais carimbos de tempo existem no banco (seção 4).                                                       |
| Inferido           | Que o provedor (raciocínio + saída) domina a diferença Luna x Astra; que a fila domina a espera de estratégias com Luna; durações de cada etapa; efeito do cache de prompt. Nada disso foi medido.                                                                                         |

## 2. Caminho de cada fluxo

### 2.1 Legenda e conteúdo (síncronos)

`useActionAI.triggerAIAction` → `callAI` (`app/services/ai-client.ts`) → `POST /api/ai` → `generateAI` → resposta → `setRawAction` / `updateAction`.

Etapas sequenciais que somam espera:

1. Cliente: `supabase.auth.getSession()` (normalmente local) e um `fetch` único; **sem streaming**, a pessoa vê só o indicador até a resposta inteira chegar.
2. API (`api/ai.ts`), tudo em série antes do provedor:
   1. validação do corpo e do modelo (local, desprezível);
   2. `supabase.auth.getUser(token)` (ida à rede do Auth);
   3. `people` select (`visible`);
   4. RPC `consume_ai_usage` (limite diário);
   5. RPC `reserve_ai_monthly` (franquia mensal, com `p_output_limit` = 2048 na legenda e 8192 no conteúdo).
   São quatro idas ao Supabase antes de começar a gerar. Não são paralelizadas. A região do Supabase em relação à da função Vercel não está registrada no repositório; cada ida custa de dezenas a poucas centenas de ms (estimado).
3. Provedor (`server/ai-generation.ts`): `generateText` não-streaming, `maxRetries: 0`, **sem `timeout`** nas chamadas síncronas. OpenAI: `chat` com `maxCompletionTokens` = 2048 (legenda) / 8192 (conteúdo e estratégias), `serviceTier: "default"`, `promptCacheOptions ttl 30m`; legenda usa modo JSON. **Não há `reasoningEffort`** em lugar algum (`grep` no repositório: nenhuma ocorrência de configuração de raciocínio, só a leitura de `reasoning_tokens` em `server/ai-usage.ts`). Cada modelo roda no esforço padrão do provedor, que o repositório não conhece. O catálogo (`server/ai-model-catalog.ts`) não tem campo de esforço; Luna, Terra, Sol e Astra diferem só em id e tarifas (Astra: 100x o preço de entrada e 100x o de saída de Luna). Em modelos de raciocínio, `maxCompletionTokens` inclui os tokens de raciocínio, então o teto de 8192 também limita o pensamento.
4. Anthropic (só legenda hoje): `generateText` sem pensamento estendido; sem `reasoning`, mais previsível em latência.
5. Registro de uso: `await logUsage` → `recordAIUsage` → RPC `record_ai_generation`, **antes de responder**, com até 2 tentativas. Falha não bloqueia o resultado, mas o sucesso soma uma ida ao banco depois que o texto já existe.
6. Cliente, conteúdo: aplica no estado (`setRawAction`, `setContentVersion`), depois `await updateAction(...)` pelo coordenador de salvamento. O texto já aparece antes da gravação; a gravação não atrasa o primeiro uso. Cliente, legenda: `updateAction` sem `await`.
7. `finally`: invalida `["ai-usage"]` e libera o botão.

Prompt: o de conteúdo tem cerca de 5 mil caracteres fixos mais `partner_context` e descrição (limite do corpo 64 KB; contexto e descrição até 10 mil caracteres cada, segundo o SQL de estratégias). Tamanho em tokens: estimado em 1,5 a 3 mil; não medido.

### 2.2 Estratégias (duráveis, fluxo permanente)

Navegador → `useDurableStrategies.start`:

1. `strategyCapability()` (GET `/api/strategy-operations?capability=true`: `getUser` + `people` + RPC `strategy_ready`).
2. `prepareAction()` (salva a ação pelo coordenador, uma gravação).
3. `readStrategyOperation(saved.id)` (GET: `getUser` + `people` + RPC `read_strategy_operation`).
4. `acceptStrategyOperation` (POST: `getUser` + `people` + RPC `accept_strategy_operation[_with_model]`, que valida escopo, bloqueia a ação, monta `strategy_source` e insere a operação em `queued`).
   São quatro requisições HTTP sequenciais, cada uma com autenticação própria, antes de a operação existir. Só então o cliente muda para observação.
5. Observação: `read` imediato e novo `read` a cada **2 s** enquanto `queued/generating/generated` (até 150 leituras = 5 min; pausa com a aba oculta). Soma até 2 s ao instante em que o resultado fica visível.

Servidor, fora do navegador:

6. **Fila.** Nenhum código acorda o worker na aceitação. Quem acorda é o job `pg_cron` `uzzina-strategy-worker` a **cada 30 s** (`supabase/rollouts/strategy-operations-scheduler.sql`, manifest confirma `schedule: "30 seconds"`), via `wake_strategy_worker()` e `pg_net` com HMAC. Espera média de aceitação até claim: cerca de 15 s, máxima cerca de 30 s, mais a entrega do `pg_net`, a partida (possivelmente fria) da função Vercel e a verificação HMAC. Isso é **independente do modelo**. Este é o único ponto do código que impõe uma espera fixa e grande por construção.
7. `runStrategyWorker`: RPC `claim_strategy_operation_with_model` (atualiza heartbeat, marca expirados como incertos, reserva a quota diária, define lease de 150 s; estado `generating`).
8. `generateStrategies`: o mesmo caminho `generateAI`, com `timeout` 90 s, modo JSON, 5 estratégias (cada campo até 1800 caracteres, teto de saída 8192 tokens). O prompt de sistema é o maior do app (cerca de 7 mil caracteres, estimado em 2 mil tokens). A saída é a maior entre os comandos, e Astra mais raciocínio podem se aproximar do teto de 90 s. `vercel.json` define `maxDuration` 180 só para o worker.
9. `recordAIUsage` (RPC, 2 tentativas) antes do resultado ser retido.
10. `store_strategy_result` (estado `generated`), depois `finish_strategy_operation` (aplica as estratégias à ação; estado `succeeded`). O resultado fica visível ao polling a partir de `generated`/`succeeded`.
11. `onComplete` no cliente (atualização da ação) quando observa `succeeded`.

Observação: a diferença entre "resposta pronta" e "usável" em estratégias é fila + até 2 s de polling + atualização da ação pelo cliente; em legenda/conteúdo é o fim do `fetch`, sem fila.

## 3. Luna x Astra: o que o código permite concluir

- A espera de **fila, preflight e polling é igual** para os dois modelos. Portanto, se Astra espera "bem mais", a diferença vem de **tempo no provedor** (tokens de raciocínio mais tokens de saída mais velocidade do modelo). Isso é inferência (o código não prova qual é maior), mas a lógica é direta: nada fora do provedor depende do modelo.
- Como não há `reasoningEffort`, o esforço depende do padrão de cada modelo. É a variável mais provável e a mais barata de controlar. **Não foi possível confirmar nesta rodada** se a API aceita a opção por modelo nem qual é o padrão de cada um.
- Para Luna, a espera "perceptível" em estratégias inclui a fila de 0 a 30 s; em legenda e conteúdo não tem fila, então lá é provedor + 4 idas ao banco + registro.
- Dados de entrada equivalentes (critério de aceite 1) só serão comparáveis com as colunas da seção 5.

## 4. Carimbos de tempo existentes (migrations)

| Tabela                              | Colunas úteis                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strategy_operations`               | `created_at` (aceitação, `clock_timestamp()`), `updated_at` (última transição), `lease_until` (claim + 150 s enquanto `generating`; **zerado** em `finish`/`succeeded`), `lease_id`, `state`, `error_code`. Só a última transição fica gravada: claim e `generated` se perdem.            |
| `ai_generation_logs`                | `created_at` (momento do registro, logo após o fim da chamada ao provedor), `user_id`, `strategy_operation_id` (único), `intent`, `model`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `cached_tokens`, `provider_meter` (JSON com `reasoning_tokens`, `service_tier`, `cost_nanos`), `allowance_reservation_id`. |
| `ai_monthly_reservations`           | Sem timestamp (`id`, `period`, `reserved_usd`, `released`).                                                                                                                                                                                                                       |
| `ai_usage`                          | Contador diário por usuário/dia UTC, sem hora.                                                                                                                                                                                                                                      |

Consequência: **não existe, hoje, início da chamada ao provedor nem claim persistido.** Dá para derivar:

- Estratégias: `ai_generation_logs.created_at − strategy_operations.created_at` = fila + preflight do worker + provedor (juntos); `strategy_operations.updated_at − ai_generation_logs.created_at` (em `succeeded`) = armazenar + finalizar (pequeno).
- Síncronos: `ai_generation_logs.created_at` marca o fim do provedor, mas não há início para subtrair.
- Comparando Luna x Astra no mesmo comando, a fila (modelo-independente) se cancela na diferença das medianas; sobra a diferença de provedor.

## 5. Alternativas ao streaming completo

| Alternativa                                              | O que ataca                                                              | Qualidade / custo                                                                                        | Complexidade e risco                                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Definir `reasoningEffort` por modelo/comando             | Tempo de provedor (principal suspeito em Astra)                          | Pode reduzir qualidade em estratégias; reduz custo (menos tokens de saída). Validar legenda primeiro.    | Baixa: campo no catálogo mais `providerOptions` em `generateAI`. Não muda salvamento, versão nem proteção contra duplicidade. |
| Reduzir volume de saída (limites por campo, menos texto)  | Tempo de geração (proporcional aos tokens)                               | Menos conteúdo; custo menor. O contrato exige 5 estratégias com 4 campos.                                | Baixa, mas altera produto; `aiOutputLimits` também dimensiona a reserva mensal.                                       |
| Encurtar prompt / aproveitar cache                       | Tempo até o primeiro token e custo de entrada                            | Neutra se só reorganizar (parte estática primeiro, `partner_context` depois). Ganho provavelmente pequeno frente à saída. | Baixa. Efeito só medível com `cached_tokens`.                                                                         |
| Acordar o worker na aceitação (ou cron mais curto)       | Fila de 0 a 30 s das estratégias, igual para qualquer modelo             | Nenhum impacto na qualidade; custo de invocações extras.                                                 | Média. Chamar o worker (HMAC já existente) ao fim de `accept` com `waitUntil`; leases e `FOR UPDATE SKIP LOCKED` mantêm a proteção contra execução duplicada. Mantém o agendador como recuperação. Alternativa mínima: reduzir o cron para 10 s. |
| Paralelizar preflight de `/api/ai` (`people` + RPCs)     | 4 idas ao banco antes do provedor                                        | Nenhum.                                                                                                  | Baixa a média: `consume_ai_usage` e `reserve_ai_monthly` têm efeitos; cuidado para não reservar em acesso negado.    |
| Aceitação em um único pedido (fundir capability/leitura) | 3 das 4 requisições antes de `queued`                                    | Nenhum.                                                                                                  | Média; mexe nos contratos de aceitação e reconciliação já verificados.                                                |
| Reduzir polling de 2 s para 1 s nos primeiros segundos   | Até 2 s no visível                                                       | Nenhum.                                                                                                  | Baixa, mais leituras ao banco.                                                                                       |
| Acompanhamento em segundo plano / aviso ao concluir      | Percepção, não tempo                                                     | Nenhum.                                                                                                  | Estratégias já têm. Para legenda/conteúdo, depende de tornar a geração durável, o que muda arquitetura.              |

### Streaming como referência

- **Tempo até ver algo**: cai só se o gargalo for a geração de texto visível. Em modelos de raciocínio, o primeiro token chega depois do raciocínio; se o suspeito é o raciocínio, o streaming do conteúdo **não** mostra nada antes. Se a saída é longa, mostra desde o início dela.
- **Tempo total**: não diminui (pode subir um pouco por overhead). Só a percepção melhora.
- **Legenda**: saída curta e em JSON (`{"caption": ...}`); streaming de JSON parcial tem pouco valor.
- **Conteúdo**: viável. Para salvar sem conflitar, o texto parcial só poderia ir ao editor e a gravação no coordenador ocorreria apenas uma vez no fim. Isso exige um modo de editor em geração (bloqueado a edição), cancelamento ao fechar, e cuidado com `RichTextEditor`/`textDraftsRef` (digitação concorrente). Custo e quota continuariam registrados só ao final (`onFinish`), e uma desconexão do cliente no meio ainda consome tokens e franquia sem resultado aproveitado, o que precisa de regra explícita.
- **Estratégias**: o fluxo permanente é durável por desenho (a navegador não gera). Streaming parcial exigiria gravar parciais no banco, com polling ou Realtime, contra o contrato de que o resultado só é aceito pela versão canônica (`store_strategy_result` sem resultado parcial). Seria a mudança mais cara e a de maior risco para controle de versão e para a proteção contra duplicidade, que hoje dependem de lease, de `result` único e de aceitação por `updated_at`.
- **Proteção contra chamadas duplicadas**: nos síncronos já vale `aiProcessingRef` (cliente) e uma reserva por chamada com `reservationId` (servidor). O streaming não altera isso se o registro final continuar usando o mesmo id; reconexão ou retry automático de stream abriria brecha para segunda cobrança.

## 6. Recomendação

**Gargalo provável (inferido, a confirmar):**

1. Para a diferença Luna x Astra, em todos os comandos: **tempo de provedor**, pela soma de raciocínio (esforço não configurado) e saída.
2. Para estratégias em geral (inclusive com Luna): **fila do agendador** (até 30 s, média 15 s) mais 4 requisições de preflight e polling de 2 s. É a única espera fixa e grande por construção no código.

**Primeira hipótese a testar:** em Astra, os tokens de raciocínio (`provider_meter.reasoning_tokens`) representam a maior parte de `completion_tokens` e explicam a maior parte da diferença de tempo para Luna. Se for confirmada, o menor ajuste é **definir o esforço de raciocínio por modelo e comando no catálogo** (começando por legenda e conteúdo, onde Astra/Sol raramente precisam do esforço padrão) e repassar a `providerOptions.openai.reasoningEffort`. Antes, confirmar na documentação do provedor se cada modelo aceita a opção e quais valores.

**Segunda hipótese:** a mediana (aceitação até registro) de estratégias com Luna é dominada pela fila; se confirmada, acordar o worker na aceitação (ou reduzir o cron) é o menor ajuste e não depende de modelo.

Streaming completo fica como alternativa só para conteúdo e só se, após esses testes, a espera visível continuar longa com raciocínio já reduzido; ele não ataca a fila e custa mudança no salvamento do editor.

## 7. Plano de medição

### 7.1 Consulta somente leitura (o proprietário pode rodar agora, sem instrumentação)

Estratégias e síncronos por modelo, usando o que já existe. Não altera dados.

```sql
-- Estratégias: aceitação -> fim do provedor (fila + preflight + provedor), por modelo.
SELECT
  l.model,
  count(*) AS runs,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (l.created_at - o.created_at))) AS p50_accept_to_provider_end_s,
  percentile_cont(0.9) WITHIN GROUP (ORDER BY extract(epoch FROM (l.created_at - o.created_at))) AS p90_accept_to_provider_end_s,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (o.updated_at - l.created_at))) AS p50_store_finish_s,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY l.prompt_tokens) AS p50_prompt_tokens,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY l.completion_tokens) AS p50_completion_tokens,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY (l.provider_meter->>'reasoning_tokens')::int) AS p50_reasoning_tokens,
  avg(l.cached_tokens::numeric / nullif(l.prompt_tokens, 0)) AS avg_cached_share
FROM public.ai_generation_logs l
JOIN public.strategy_operations o ON o.id = l.strategy_operation_id
WHERE o.state = 'succeeded'
  AND l.created_at >= now() - interval '7 days'
GROUP BY l.model
ORDER BY l.model;
```

Colunas esperadas: `model`, `runs`, `p50_accept_to_provider_end_s`, `p90_...`, `p50_store_finish_s`, `p50_prompt_tokens`, `p50_completion_tokens`, `p50_reasoning_tokens`, `avg_cached_share`.

Leitura: `p50` de Astra menos `p50` de Luna estima a diferença de provedor (a fila se cancela). `reasoning_tokens / completion_tokens` testa a hipótese 1. Um `p50` de Luna perto de 15 s mais o tempo de geração esperado sugere a fila (hipótese 2). `p50_store_finish_s` deve ser pequeno.

Para síncronos, `ai_generation_logs` só tem o fim da chamada; usar apenas tokens por modelo e intent:

```sql
SELECT intent, model, count(*) AS runs,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY completion_tokens) AS p50_completion_tokens,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY (provider_meter->>'reasoning_tokens')::int) AS p50_reasoning_tokens
FROM public.ai_generation_logs
WHERE strategy_operation_id IS NULL AND created_at >= now() - interval '7 days'
GROUP BY intent, model ORDER BY intent, model;
```

Limite: esta consulta não prova tempo de legenda/conteúdo; só o volume de saída e raciocínio. Ela depende de que as colunas existam em produção; não foi confirmado aqui, e a consulta não foi executada.

### 7.2 Instrumentação mínima (proposta, não aplicada)

Log estruturado de uma linha (`console.info(JSON.stringify({...}))`, sem texto do prompt nem segredos) em cada etapa, com `performance.now()`/`Date.now()`:

- `api/ai.ts`: `t_auth_ms` (getUser + people), `t_quota_ms` (as duas RPCs), `t_provider_ms`, `t_record_ms`, `t_total_ms`; campos `intent`, `model`, `prompt_tokens`, `completion_tokens`, `reasoning_tokens`, `cached_tokens`, `finishReason`, `reservationId`. Ponto único: logo antes de `res.status(200)`.
- `api/strategy-worker.ts` / `runStrategyWorker`: `operationId`, `queue_wait_ms` (`Date.now()` menos o `created_at` da operação; exige devolver `createdAt` no retorno de `claim` ou consultar uma vez), `t_claim_ms`, `t_provider_ms`, `t_record_ms`, `t_store_ms`, `t_finish_ms`.
- Cliente (apenas em desenvolvimento ou atrás de `localStorage`): `performance.mark` em `triggerAIAction` início, resposta do `callAI`, fim do `updateAction`, e em estratégias início de `start`, operação `queued` visível, `generated`/`succeeded` visível. Mede o primeiro sinal na tela e o "pronto" versus "usável".

Opcional, mais forte: persistir `claimed_at` e `provider_started_at` em `strategy_operations` (coluna ou `meter`), o que exige migration e deve ser decidido à parte.

### 7.3 Ensaio controlado (precisa de autorização do proprietário)

Mesma ação, mesmo texto, mesmo comando, 3 execuções por modelo (Luna, Astra, e um Claude para legenda), em horários próximos. Registrar tamanho de entrada, tokens, tempo por etapa. Não executado.

## 8. Pendências

- Nenhuma medição real; as hipóteses acima seguem abertas.
- Confirmar na documentação do provedor a opção de esforço de raciocínio e seus padrões por modelo.
- Confirmar `maxDuration` efetivo de `api/ai.ts` no plano da Vercel (`vercel.json` só define o do worker); chamadas síncronas de Astra com saída longa podem se aproximar de limites de função.
- Confirmar a região do Supabase frente à da Vercel para dimensionar as quatro idas do preflight.
