# IA-M07 — Modelos de IA declarados em um só lugar

## Modelos sugeridos

- **Codex (OpenAI):** GPT-6.1 Terra, para a mudança coordenada entre catálogo, API e migration, com conferência do SQL.
- **Claude Code (Anthropic):** Claude Sonnet 5.5, para ler código e SQL juntos e manter o comportamento das telas idêntico.
- **Antigravity (Google):** Gemini 3.8 Flash, para a leitura ampla do código e a conferência das listas; confirmar disponibilidade no plano.

**Bloqueado por.** Nenhum. Decisões em [IA-M06](06-expand-model-catalog-and-visibility.md).

## O problema, em linguagem simples

Hoje, para incluir, trocar ou aposentar um modelo de IA, é preciso mexer em cinco lugares, e esquecer um deles quebra uma parte do app (a geração, a franquia mensal ou as preferências). O proprietário quer **mudar o modelo em um local só**, para poder pedir a troca a um agente sem risco de ficar pela metade. Nada muda na tela.

## Onde isso aparece

Não há tela nova. O efeito é sentido em: Minha Conta → "Modelos padrão de IA"; seletores da gaveta (aba Essencial e aba Instagram); e nas gerações de estratégia, conteúdo e legenda.

## Os cinco lugares hoje

1. `server/ai-model-catalog.ts`: catálogo oficial (empresa, tarefas permitidas, tarifas).
2. `app/lib/action-ai-models.ts`: lista dos seletores; também valida as preferências no app (`app/lib/preferences.ts`).
3. Banco, `update_my_preferences`: lista fixa de IDs aceitos como modelo padrão.
4. Banco, `reserve_ai_monthly`: taxa em dólar por modelo para a franquia mensal.
5. Banco, estratégias: `accept_strategy_operation_with_model`, `claim_strategy_operation_with_model` e `strategy_operations_model_id_check` repetem a lista de IDs.

Além disso, o Luna é um valor fixo repetido nesses lugares e em padrões do banco (`DEFAULT 'gpt-6-luna'`). As tarifas do catálogo e as taxas do banco são cópias uma da outra.

## O que entregar

- Uma única fonte de verdade para a lista de modelos, suas tarefas permitidas e tarifas. O app e o banco leem dela; nenhum arquivo ou função de banco mantém lista própria de IDs.
- O Luna continua sendo o modelo base de todas as tarefas, definido em um só ponto. Trocar de versão do Luna deve ser mudar um valor nesse ponto.
- Corrigir a divergência de documentação do AGENTS.md sobre os Claude (a frase já foi removida em 07/11); manter o AGENTS coerente com a nova estrutura.
- O comportamento visível não muda: mesmos 7 modelos, mesmos seletores, mesmas escolhas salvas.

## Fora do escopo

Seleção de modelos por tarefa em Minha Conta (será outro ticket, depois deste), novos provedores (Gemini, DeepSeek, Kimi etc.), Planejamento, e qualquer mudança de preço ou prompt.

## Cuidados

- Mexe em banco: precisa de migration, verificação de leitura no projeto `bussola` e o cuidado já usado com `p_model`: o deploy da API não pode depender de migration ainda não aplicada.
- Mexe em `api/` e `server/`: antes de qualquer push, `bun run test:serverless` (esperado: 9 PASS).
- `update_my_preferences` faz merge: preferências já salvas não podem ser apagadas nem rejeitadas.
- Operações de estratégia já aceitas e preferências que citam um modelo existente devem continuar válidas.
- Sugestão de proteção barata: um teste que falhe se a lista do app, a do servidor e os IDs aceitos no banco divergirem.

## Como o proprietário confere

Em Minha Conta, abrir "Modelos padrão de IA" e ver que continuam os 7 modelos e a escolha atual de cada tarefa. Na gaveta, gerar uma legenda com o Luna e com um Claude e ver que ambas funcionam e aparecem no uso. Pedir a troca de um modelo de teste e ver que a mudança acontece em um único lugar.

## Onde está

Implementado só no checkout local, sem commit. A migration `supabase/migrations/20261107160000_single_ai_model_registry.sql` está **preparada e NÃO aplicada** no banco; nada em produção mudou.

## Status: encerrado com aceite do proprietário em 07/11/2026

- `app/lib/ai-model-registry.ts` (novo) declara uma única vez id, nome, provedor, nível e modelo padrão. Não tem tarifas nem taxas, então pode ir ao navegador. `app/lib/action-ai-models.ts` (seletores e preferências) deriva dele e não importa nada de `server/`.
- `server/ai-model-catalog.ts` reutiliza esse registro e acrescenta só o que é do servidor: tarefas permitidas, tarifas e taxas de reserva. Um erro é lançado ao carregar se as duas listas divergirem. Conferido com `bun run build`: as tarifas e taxas não estão mais no pacote do navegador.
- Migration: cria `public.ai_models` (leitura só pela service role, RLS ligada, sem acesso de `anon`/`authenticated`), troca o CHECK de `strategy_operations` por chave estrangeira e troca a lista fixa de IDs por consulta a `ai_models` em `accept_strategy_operation_with_model`, `reserve_ai_monthly` (taxas) e `update_my_preferences` (só o ramo dos modelos; o resto idêntico à produção, conferido em 07/11 por consulta somente leitura). `claim_strategy_operation_with_model` não tinha lista em produção e foi reposta idêntica.
- Teste `tests/ai-models-catalog-alignment.test.ts`: compara, por modelo, o INSERT da migration com o catálogo (id, nome, provedor, nível, taxas, padrão e conjunto de IDs), garante que o registro público não tem tarifas e que `update_my_preferences` mantém `visible = true` e "Active member required".
- Limite: incluir um modelo exige **dois lugares** (registro público + catálogo do servidor, em TypeScript; e uma migration nova com INSERT em `ai_models`). O teste avisa se esquecerem um. O banco continua sem leitura automática do TypeScript.
- Falta: o proprietário validar e autorizar a aplicação do SQL; depois conferir Minha Conta → "Modelos padrão de IA", salvar uma preferência e gerar uma estratégia.
