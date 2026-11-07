# Contratos: IA, estratégias e modelos

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer em `app/lib/ai-contract.ts`, nas APIs de IA, no catálogo de modelos, em quota de IA ou no fluxo de estratégias.

## Contrato de entrada e estratégias

- `app/lib/ai-contract.ts` valida os contratos. Segredos OpenAI/Supabase ficam no servidor. A entrada exige `partner_name` (1–500 caracteres após trim): primeiro parceiro atual da ação, enviado explicitamente aos quatro comandos como marca publicadora. Nome inválido bloqueia o envio e a reserva de quota; nome e rodapé são capturados juntos no disparo. A identidade editorial não concede autorização nem proíbe menções legítimas a outras marcas.

- Estratégias07 distinguem geração, salvamento, confirmação e falha; retentar a escrita usa o coordenador sem nova geração. Fechar/reabrir o diálogo não cancela nem reabre ao terminar. A guarda de saída permanece até aceitação durável e para salvamentos/edições locais pendentes.

- Estratégias09 são o fluxo permanente, sem flags de ativação nem geração/salvamento de estratégias pelo navegador. [Manifest e critérios](../../supabase/rollouts/strategy-operations-manifest.json). `strategy_operations`/`strategy_runtime` são privadas; APIs vinculam Auth ao ator e RPCs service-only validam ação/parceiro atuais. Aceitar exige salvar/criar pelo coordenador e versão canônica; worker reserva quota uma vez, retém resultado antes da escrita e não regenera conclusão incerta. Conflito/resultado antigo exigem revisão; finalizar altera só estratégias. Produção Ready/agendamento verificados em01/11 conforme manifest. Wakeup usa HMAC-SHA256 de timestamp/UUID/método/caminho com validade60s; segredo bruto não vai à fila HTTP, e leases controlam duplicação do trabalho. Segredo independente, banco e heartbeat continuam obrigatórios; falha bloqueia a operação sem fallback. Encerramento após aceitação preserva trabalho no servidor e guardas de edições locais; status é limitado à ação ativa/visível e à sessão. Conclusão não adota snapshot nem abre modal. `UZZINA_STRATEGY_ACCEPTING=false` é pausa opcional de manutenção para drenar operações, não ativação normal. O diálogo de sugestões tem o botão "Recriar estratégias" (mesmo gatilho e modelo do botão do Essencial; desativado durante geração, salvamento, conflito ou resultado pendente): as sugestões anteriores ficam visíveis na espera e em falha, e o novo conjunto substitui o anterior inclusive a seleção. Aplicação de SQL, configuração, Ready e agendamento real são verificados separadamente no manifest.

## Modelos e catálogo

- Modelos (IA-M04, em integração): `server/ai-model-catalog.ts` é o catálogo (provedor, ID, comandos permitidos, tarifas em nano-USD/token por faixa) e `findAIModel` resolve o modelo. `aiInputSchema.model` é opcional; a API valida contra o catálogo e o comando antes de reservar quota (400 `AI_MODEL_UNAVAILABLE`; 503 se faltar `ANTHROPIC_API_KEY` num modelo Claude) e nunca troca de modelo em silêncio. `generateAI` normaliza o uso da Anthropic (entrada sem cache + gravação + leitura de cache) para o formato de prompt total, e `recordAIUsage` precifica pelo modelo que respondeu; campo ausente deixa o custo pendente. A API só envia `p_model` a `reserve_ai_monthly` quando o modelo não é o padrão, para o deploy não depender da migration `20261106120000_ai_model_aware_reservation` (aplicada em produção como `20261106031549`, conferida em 06/11 por consulta somente leitura: `reserve_ai_monthly` já aceita `p_model` e conhece Astra e Opus). As taxas dessa função repetem as do catálogo.

## Quota e uso

- Staging/Vercel/produção usam reserva persistente via `consume_ai_usage` antes da geração. Falha da RPC retorna503/AI_QUOTA_UNAVAILABLE; limite esgotado retorna429. Sem contador em memória ou fallback por erro.

- `ai_usage` registra usuário/dia UTC/tentativas; AI_DAILY_LIMIT padrão100, intervalo1–10000. Isso é limite técnico, distinto da proposta futura de medição por agência/modelo/token.

## Compatibilidade local de IA

- Compatibilidade local só ocorre com NODE_ENV development, `UZZINA_LOCAL_AI_COMPAT=true` e sem VERCEL. O adaptador ativa a flag apenas no modo development; usa chave pública/Bearer e membro ativo, sem `consume_ai_usage`.
