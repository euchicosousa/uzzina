# 14: IA rejeita entrada inválida e consumo excessivo

**What to build:** Membro ativo gera conteúdo com entradas válidas e recebe erro claro quando perde acesso ou atinge limite.

**Blocked by:** Nenhum

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: api/ai.ts; app/services/ai-client.ts. Criar migration/rpc ai_usage para limite transacional.
1. Handler inteiro com try/catch incluindo configuração, createClient e autenticação. Métodos nãoPOST→405; sem/invalidtoken→401; pessoa nãoativa→403; configuraçãoausente→503; upstream falho→502. Nunca expor chave/stack.
2. Zod strict para body. intent enum dos4 existentes; category string1–100; title string0–500; description/partner_context string0–10000; racional/headline/direcionamento string0–2000. Limite body64KB medido em bytes UTF-8. Objetos/arrays/números nos campos de texto→400. Unknownfields→400; preservar campos legítimos consumidos, listados acima.
3. Decisão operacional inicial: limite configurável por membro/24h, padrão100 chamadas, env AI_DAILY_LIMIT inteiro1–10000; contabiliza tentativa autorizada antes do upstream. Registro UTC por user_id e dia. RPC transacional incrementa somente abaixo do limite; duas instâncias não ultrapassam cota. Service-role no servidor; corpo não envia dono/dia.
4. Limite atingido→429 e Retry-After até próxima janela. Falha da store de consumo→503; contador em memória não substitui persistência.
5. Validar formato da saída conforme cada intent usado hoje; JSON ilegível/schema inválido→502. Conteúdo HTML chega à política01 no render. Falsificar OpenAI, nenhum gasto real nos testes.
6. UI mostra401/403/429/502/503 com mensagem específica e preserva insumo. Não marcar gerado quando upstream falhou.

## Testes e alcance
Interface: api/ai handler real e ai-client real; Auth/SDK/OpenAI/clock externos falsos. Semtoken, membro inativo, intent inválido, title como objeto,64KB,quota atingida,JSON inválido,configuração ausente/upstream falho. Verificar zero chamadas OpenAI em rejeições.
BANCO: duas chamadas simultâneas para última cota na RPC real; NAVEGADOR: N13 do17.

## Acceptance criteria
- [ ] Body completo é validado antes de geração.
- [ ] Quota é transacional e não depende de memória local.
- [ ] Sem acesso ao banco, limite fica pendente explicitamente.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

