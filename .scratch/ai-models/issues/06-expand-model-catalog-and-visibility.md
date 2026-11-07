# IA-M06 — Modelos de IA por tarefa e catálogo em um só lugar

**Tipo:** investigação/estudo, já com as decisões do proprietário de 07/11/2026. Entrega relatório e proposta; nenhuma alteração de código, SQL ou branch de implementação sem aprovação explícita para cada item. O catálogo em um só lugar virou o ticket [IA-M07](07-single-model-registry.md); a seleção por tarefa será um ticket depois dele.
**Estado:** estudo feito e conferido; IA-M07 aberto para o catálogo. Aguarda a seção 7 para abrir a seleção por tarefa.

## 1. O que é, em linguagem simples

Hoje o app oferece 7 modelos de IA (4 da OpenAI e 3 da Anthropic) para três tarefas: criar estratégia, gerar conteúdo e gerar legenda. Em todos os seletores aparecem os sete, em qualquer tarefa. O proprietário quer:

1. **Escolher, para cada tarefa, quais modelos ficam disponíveis.** Em Minha Conta, uma seleção múltipla por tarefa (ou um único modelo). Quando for escolher o modelo padrão da tarefa, e nos seletores da gaveta da ação, só aparecem os selecionados.
2. **O Luna sempre como modelo base.** Fica como está hoje. Quando o Luna for trocado por uma versão nova, o ajuste é feito num único lugar, sem mexer em escolhas das pessoas.
3. **A lista de modelos num lugar só**, para que incluir ou trocar um modelo no futuro não exija mexer em vários arquivos e no banco.

Não é ocultar modelos: é definir quais servem a cada tarefa.

## 2. Onde ver hoje

- **Minha Conta → "Modelos padrão de IA"** (`/app/profile`): três linhas (estratégia, conteúdo, legenda), cada uma com um seletor com os 7 modelos e um botão para voltar ao padrão.
- **Gaveta da ação:** seletor ao lado do botão de estratégias (aba Essencial) e ao lado dos botões de conteúdo e legenda (aba Instagram).
- **Planejamento:** sem IA hoje, em espera. Não há "tarefa de planejamento" no sistema.

## 3. O que foi analisado (código e banco de produção, só leitura, 07/11/2026)

**3.1 O modelo é declarado em cinco lugares que precisam andar juntos:**

1. `server/ai-model-catalog.ts`: catálogo oficial (empresa, tarefas permitidas, tarifas).
2. `app/lib/action-ai-models.ts`: lista dos seletores. Também valida as preferências no app (`app/lib/preferences.ts`).
3. Banco, `update_my_preferences`: lista fixa de IDs aceitos como modelo padrão da pessoa.
4. Banco, `reserve_ai_monthly`: taxa em dólar de cada ID para reservar a franquia mensal; ID desconhecido dá "Unknown AI model".
5. Banco, estratégias: `accept_strategy_operation_with_model`, `claim_strategy_operation_with_model` e a regra `strategy_operations_model_id_check` repetem a lista de IDs.

As tarifas do catálogo e as taxas do banco são cópias uma da outra. O Luna é repetido como valor fixo no catálogo, na lista dos seletores e como padrão do banco (`DEFAULT 'gpt-6-luna'`). Em produção, esses itens do banco já conhecem os 7 modelos.

**3.2 Escolha por pessoa já existe, escolha por tarefa não.** `defaultStrategyModel`, `defaultContentModel` e `defaultCaptionModel` ficam em `people.preferences`. Em produção, 1 pessoa gravou essas escolhas; as demais usam o Luna. O catálogo libera os 7 nas 3 tarefas (`intents`), sem nenhuma restrição.

**3.3 A API valida o modelo contra o catálogo e a tarefa antes de reservar saldo e nunca troca de modelo em silêncio.** ID salvo que deixa de existir cai no Luna na tela, sem aviso.

**3.4 Uso real:** 50 gerações registradas em `ai_generation_logs`; todos os 7 modelos já foram usados, nas três tarefas (Luna 18, Terra 15, Haiku 9, Sol 3, Sonnet 3, Opus 1, Astra 1 segundo o levantamento do chat de teste; a contagem total de 50 e a pessoa com preferência salva foram reconferidas).

**3.5 Custo:** o preço por token varia cerca de 100 vezes entre Luna e Astra, dentro da mesma franquia de US$ 5 por pessoa por mês. Limitar por tarefa também controla gasto.

**3.6 Divergência de documentação:** o AGENTS.md diz que "os Claude só atendem legenda", mas o catálogo libera os três e há gerações Claude de estratégia e conteúdo em produção. Corrigir junto com a implementação.

## 4. Decisões do proprietário (07/11/2026)

- **Sem novos provedores agora.** Fora Gemini, DeepSeek, Kimi e qualquer outro. Os sete modelos atuais bastam. Pesquisa feita só como informação: Gemini 4 Argon e 3.8 Flash são descritos pela Google como modelos de raciocínio e código, sem vantagem comprovada para texto de marca, e o Argon sobe para o preço do Opus em 01/12; DeepSeek e Kimi têm servidores na China e exigiriam teste de qualidade que o proprietário descartou.
- **Luna é o modelo base de tudo.** Continua padrão em todas as tarefas.
- **Seleção por tarefa em Minha Conta**, múltipla, com no mínimo uma opção; o padrão de cada tarefa e os seletores da gaveta mostram só os selecionados.
- **Catálogo num único lugar.**

## 5. Proposta para o ticket de implementação (não executada)

1. **Fonte única.** O catálogo do servidor é a lista oficial; o app e o banco deixam de ter listas próprias de IDs (o banco valida contra uma tabela de modelos). A tela não muda.
2. **Seleção por tarefa.** Nova preferência da pessoa com os modelos permitidos de cada tarefa, na seção de modelos de Minha Conta. Os seletores filtram por ela.
3. **Troca do Luna.** O modelo base é uma constante única; trocar de versão é mudar um valor, mantendo as preferências existentes válidas.
4. **Aviso ao cair no Luna.** Se o padrão salvo deixar de estar entre os selecionados, o app usa o Luna e mostra uma mensagem na tela.

## 6. Impacto e riscos

- Toca banco (preferências, reserva de saldo, estratégias): exige migration, verificação no projeto `bussola`, e o deploy da API não pode depender de migration ainda não aplicada (mesmo cuidado já usado com `p_model`).
- Toca `api/` e `server/`: antes de qualquer push, `bun run test:serverless` (esperado: 9 PASS).
- `update_my_preferences` faz merge: a nova preferência não pode apagar campos de quem já salvou.
- A seleção por tarefa é só das telas; a API deve continuar recusando o que o catálogo não permite, mas não precisa consultar a seleção da pessoa (operações já aceitas não podem quebrar).

## 7. O que o proprietário precisa decidir

1. O Luna pode ser desmarcado numa tarefa (por exemplo, legenda só com o Sonnet), ou ele fica sempre selecionado como base? Proposta: pode ser desmarcado, mas é o fallback se a tarefa ficar sem seleção.
2. A seleção vale por pessoa (cada um configura a sua em Minha Conta) ou é da agência toda?
3. Abrir o ticket de seleção por tarefa depois do IA-M07?

**Antes de aprovar, olhe:** a seção "Modelos padrão de IA" em Minha Conta e os seletores da gaveta, para confirmar que é ali que a lista deve diminuir.

## 8. Onde está

Só este arquivo, em `.scratch/ai-models/issues/`. Nada no banco, nada na `main`, nada em produção alterado.

## Modelos sugeridos

- **Codex (OpenAI):** GPT-6.1 Terra, para a mudança coordenada entre catálogo, API e migration.
- **Claude Code (Anthropic):** Claude Sonnet 5.5, para ler código e SQL juntos e escrever o relatório e a tela de seleção.
- **Antigravity (Google):** Gemini 3.8 Flash, para a leitura ampla do código; confirmar disponibilidade no plano.
