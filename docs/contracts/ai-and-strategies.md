# Contratos: IA, estratégias e modelos

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer em `app/lib/ai-contract.ts`, nas APIs de IA, no catálogo de modelos, em quota de IA ou no fluxo de estratégias.

## Contrato de entrada e estratégias

- `app/lib/ai-contract.ts` valida os contratos. Segredos OpenAI/Supabase ficam no servidor. A entrada exige `partner_name` (1–500 caracteres após trim): primeiro parceiro atual da ação, enviado explicitamente aos quatro comandos como marca publicadora. Nome inválido bloqueia o envio e a reserva de quota; nome e rodapé são capturados juntos no disparo. A identidade editorial não concede autorização nem proíbe menções legítimas a outras marcas.

- Estratégias07 distinguem geração, salvamento, confirmação e falha; retentar a escrita usa o coordenador sem nova geração. Fechar/reabrir o diálogo não cancela nem reabre ao terminar. A guarda de saída permanece até aceitação durável e para salvamentos/edições locais pendentes.

- Estratégias09 são o fluxo permanente, sem flags de ativação nem geração/salvamento de estratégias pelo navegador. [Manifest e critérios](../../supabase/rollouts/strategy-operations-manifest.json). `strategy_operations`/`strategy_runtime` são privadas; APIs vinculam Auth ao ator e RPCs service-only validam ação/parceiro atuais. Aceitar exige salvar/criar pelo coordenador e versão canônica; worker reserva quota uma vez, retém resultado antes da escrita e não regenera conclusão incerta. Conflito/resultado antigo exigem revisão; finalizar altera só estratégias. Produção Ready/agendamento verificados em01/11 conforme manifest. Wakeup usa HMAC-SHA256 de timestamp/UUID/método/caminho com validade60s; segredo bruto não vai à fila HTTP, e leases controlam duplicação do trabalho. Segredo independente, banco e heartbeat continuam obrigatórios; falha bloqueia a operação sem fallback. Encerramento após aceitação preserva trabalho no servidor e guardas de edições locais; status é limitado à ação ativa/visível e à sessão. Conclusão não adota snapshot nem abre modal. `UZZINA_STRATEGY_ACCEPTING=false` é pausa opcional de manutenção para drenar operações, não ativação normal. O diálogo de sugestões tem o botão "Recriar estratégias" (mesmo gatilho e modelo do botão do Essencial; desativado durante geração, salvamento, conflito ou resultado pendente): as sugestões anteriores ficam visíveis na espera e em falha, e o novo conjunto substitui o anterior inclusive a seleção. Aplicação de SQL, configuração, Ready e agendamento real são verificados separadamente no manifest.

## Modelos e catálogo

- Modelos (IA-M07, migration preparada e ainda não aplicada): id, nome, provedor, nível e modelo padrão são declarados uma vez em `app/lib/ai-model-registry.ts`, sem tarifas, e o app (`app/lib/action-ai-models.ts`) usa só ele. `server/ai-model-catalog.ts` reutiliza esse registro e acrescenta tarefas permitidas, tarifas e taxas de reserva, que ficam apenas no servidor; o app nunca importa de `server/`. No banco, `public.ai_models` (migration `20261107160000_single_ai_model_registry.sql`; leitura só pela service role) guarda id, nome, provedor, nível, taxas e padrão; `strategy_operations.model_id` vira chave estrangeira, e `accept_strategy_operation_with_model`, `reserve_ai_monthly` e `update_my_preferences` consultam a tabela. Para incluir um modelo são dois lugares: o registro público + o catálogo (TypeScript) e uma migration com o INSERT em `ai_models`; `tests/ai-models-catalog-alignment.test.ts` falha se divergirem. `findAIModel` resolve o modelo; `aiInputSchema.model` é opcional; a API valida contra o catálogo e o comando antes de reservar quota (400 `AI_MODEL_UNAVAILABLE`; 503 se faltar `ANTHROPIC_API_KEY` num modelo Claude) e nunca troca de modelo em silêncio. `generateAI` normaliza o uso da Anthropic para o formato de prompt total, e `recordAIUsage` precifica pelo modelo que respondeu; campo ausente deixa o custo pendente. A API só envia `p_model` a `reserve_ai_monthly` quando o modelo não é o padrão. Até a migration ser aplicada, as taxas das funções de produção continuam sendo listas fixas que repetem as do catálogo.

## Leitura de arquivos de trabalho (IA-M08, fase 1: imagem e PDF)

- Dois comandos próprios em `POST /api/ai`, com contrato `fileReadInputSchema` em `app/lib/ai-contract.ts`: `ai-transcribe` (um arquivo por chamada, texto literal) e `ai-interpret` (o conjunto, na ordem da grade, uma chamada; `careful` opcional). O navegador envia o id da ação, as posições na lista `work_files` e o final de cada endereço (`checks`, só para detectar lista alterada, nunca usado como endereço); nunca envia endereço de arquivo nem id de modelo.
- O servidor lê `actions.work_files` com a sessão do próprio usuário (RLS decide o acesso; `SUPABASE_PUBLISHABLE_KEY`/`VITE_SUPABASE_ANON_KEY` necessária), aceita só endereços HTTPS de `res.cloudinary.com/<cloud da UZZINA>/` (`CLOUDINARY_CLOUD_NAME` ou `VITE_CLOUDINARY_CLOUD_NAME`), ignora formatos sem suporte e devolve 409 se a lista mudou. Imagem entra por endereço (HEIC/HEIF pedem JPG ao Cloudinary pela extensão); PDF é baixado pelo servidor (sem redirecionamento, 10 MB, 20 s) e embutido em base64. Lógica em `server/file-read.ts`.
- Modelo por comando em um único ponto, `fileReadModels` em `server/ai-model-catalog.ts`: transcrição sempre GPT-6 Luna; interpretação GPT-6 Luna e, com `careful`, GPT-6.1 Terra (o Terra aceita só `ai-interpret`). Reserva de franquia antes da chamada (`p_model` só quando não é o Luna), com acréscimo estimado por arquivo (imagem 1.500 e PDF 8.000 bytes-equivalentes), limites de saída `ai-transcribe` 8192 e `ai-interpret` 4096, no máximo 12 arquivos por leitura, `maxDuration` de 120 s em `vercel.json`. Uso registrado pelo modelo que respondeu.
- O conteúdo dos arquivos é dado, nunca instrução (regra nos dois prompts). Resultados são temporários na interface; entram na descrição só pelo editor Tiptap aberto da gaveta (`EssentialsTab`), no fim do texto. A descrição aceita 10.000 caracteres nos comandos de IA: o bloco mostra o tamanho do HTML a inserir e avisa quando passaria do limite, sem impedir.
- Fase 2 (áudio e vídeo, `gpt-transcribe`, cobrança por minuto) não foi implementada.

## Quota e uso

- Staging/Vercel/produção usam reserva persistente via `consume_ai_usage` antes da geração. Falha da RPC retorna503/AI_QUOTA_UNAVAILABLE; limite esgotado retorna429. Sem contador em memória ou fallback por erro.

- `ai_usage` registra usuário/dia UTC/tentativas; AI_DAILY_LIMIT padrão100, intervalo1–10000. Isso é limite técnico, distinto da proposta futura de medição por agência/modelo/token.

## Compatibilidade local de IA

- Compatibilidade local só ocorre com NODE_ENV development, `UZZINA_LOCAL_AI_COMPAT=true` e sem VERCEL. O adaptador ativa a flag apenas no modo development; usa chave pública/Bearer e membro ativo, sem `consume_ai_usage`.

- Leitura de áudio/vídeo (IA-M08 fase 2): `server/file-read.ts` pede ao Cloudinary um MP3 de 64 kbps (limite de 20 minutos, medido pelo tamanho) e chama `gpt-transcribe` direto na OpenAI, fora do catálogo de modelos; o custo por segundo entra no registro de uso como `cost_nanos` extra.
