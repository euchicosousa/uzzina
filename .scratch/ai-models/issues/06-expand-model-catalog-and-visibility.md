# IA-M06 — Modelos de IA por tarefa e catálogo em um só lugar

**Tipo:** implementação concluída no checkout, com as decisões do proprietário de 07/11/2026. Alinhado com o ticket [IA-M07](07-single-model-registry.md).
**Estado:** encerrado com aceite do proprietário em 07/11/2026. Migration aplicada em produção e código publicado.

## 1. O que é, em linguagem simples

Hoje o app oferece 7 modelos de IA (4 da OpenAI e 3 da Anthropic) para três tarefas: criar estratégia, gerar conteúdo e gerar legenda. Em todos os seletores apareciam os sete, em qualquer tarefa. O proprietário definiu:

1. **Escolher, para cada tarefa, quais modelos ficam disponíveis.** Em Minha Conta (`/app/profile`), uma seleção múltipla com checkboxes por tarefa. Quando for escolher o modelo padrão da tarefa, e nos seletores da gaveta da ação, só aparecem os modelos selecionados para aquela tarefa.
2. **O Luna (`gpt-6-luna`) sempre como modelo base e fallback seguro.** Se desmarcar todos os modelos de uma tarefa, o Luna é mantido automaticamente. Se o modelo padrão salvo deixar de estar entre os permitidos, o sistema ajusta com segurança para o Luna.
3. **Catálogo mantido nos 7 modelos existentes.** Sem novos provedores (Gemini, DeepSeek, Kimi descartados).

## 2. Onde ver no app

- **Minha Conta → "Modelos de IA por tarefa"** (`/app/profile` na aba "Uso de IA"): uma tabela com cabeçalho (Função, Modelos disponíveis, Modelo padrão) e uma linha por tarefa: seletor múltiplo dos modelos disponíveis e seletor do modelo padrão (só com os modelos marcados). A linha Planejamento aparece desabilitada ("Em breve"), sem lógica por trás.
- **Gaveta da ação:**
  - Aba **Essencial**: o seletor ao lado de "Estratégias" exibe apenas os modelos ativos para estratégia (`strategyModels`).
  - Aba **Instagram → Conteúdo**: o seletor exibe apenas os modelos ativos para conteúdo (`contentModels`).
  - Aba **Instagram → Legenda**: o seletor exibe apenas os modelos ativos para legenda (`captionModels`).
  - Diálogo **"5 Estratégias Sugeridas"**: o botão e seletor para usar a estratégia no conteúdo também respeita `contentModels`.

## 3. O que foi analisado e o que mudou

### Antes

- Todos os 7 modelos apareciam em todos os seletores da gaveta e de Minha Conta, sem distinção de tarefa.
- `people.preferences` só guardava o modelo padrão (`defaultStrategyModel`, `defaultContentModel`, `defaultCaptionModel`).
- `update_my_preferences` só validava essas três chaves escalares no banco.

### Depois

1. **Preferências (`app/lib/preferences.ts`):**
   - Adicionados `strategyModels`, `contentModels`, `captionModels` (`ActionAIModelId[]`) em `UserPreferences` e `SerializedPreferences`.
   - `parseTaskModels`: valida array contra os modelos registrados; se ausente na preferência da pessoa, inicializa com todos os 7; se vazio ou sem IDs válidos, cai no Luna `[lunaModelId]`.
   - `resolveDefaultModel`: se o modelo padrão atual não estiver nos permitidos da tarefa, cai no Luna (se permitido) ou na primeira opção válida da lista.
2. **Catálogo de Ação (`app/lib/action-ai-models.ts`):**
   - Exportada a função `getAvailableAIModels(allowedIds)` que filtra a lista de opções respeitando metadados e provedor, garantindo fallback para Luna.
   - Tipagem estrita `ActionAIModelOption` garantindo alinhamento de tipos entre app e registro público.
3. **Ícone de Modelo (`app/components/uzzina/UAIModelSelect.tsx`):**
   - Exportado `AIModelIcon` para reutilização nas marcações de Minha Conta com o símbolo do provedor e anel colorido por nível.
4. **Minha Conta (`app/routes/app/profile.tsx`):**
   - Seção redesenhada "Modelos de IA por tarefa" fluindo diretamente sobre o fundo (sem caixas/cards com borda externa).
   - Checkboxes interativos com sincronização imediata do seletor de padrão da tarefa. Desmarcar o último modelo preserva o Luna como fallback.
5. **Gaveta de Ação (`ActionFormDrawer.tsx`, `EssentialsTab.tsx`, `InstagramTab.tsx`):**
   - Cada aba e diálogo recebe estritamente as opções ativas da respectiva tarefa.
6. **Banco de Dados (`supabase/migrations/20261107160000_single_ai_model_registry.sql`):**
   - Função `update_my_preferences` atualizada para validar `strategyModels`, `contentModels` e `captionModels` como arrays contendo exclusivamente IDs válidos presentes e habilitados em `public.ai_models`.

## 4. Onde está

- **Código:** no checkout local da branch `main` (arquivos modificados em `app/` e `tests/`).
- **Banco de Dados:** migration preparada em `supabase/migrations/20261107160000_single_ai_model_registry.sql` (não aplicada em produção ainda, aguardando aprovação).
- **Produção:** inalterada.

## 5. Como verificar

1. `bun test tests/ai-task-models-preferences.test.ts` (9 testes cobrindo parsing, fallbacks e filtros).
2. `bun test tests/ai-models-catalog-alignment.test.ts` (7 testes cobrindo catálogo, migration e autorização do banco).
3. `bun test tests/drawer-component.test.tsx` (109 testes da gaveta passando).
4. `npx tsc --noEmit` (0 erros).
5. `node scripts/check-serverless-runtime.cjs` (9 PASS).
6. **No app:**
   - Abrir `/app/profile` e clicar na aba "Uso de IA".
   - Na seção "Modelos de IA por tarefa", desmarcar modelos para Estratégia, Conteúdo e Legenda (ex.: deixar Legenda apenas com Claude Sonnet 5.5).
   - Observar que o seletor do modelo padrão atualiza imediatamente para oferecer apenas as opções marcadas.
   - Clicar em "Salvar Alterações".
   - Abrir uma ação na gaveta: conferir que o seletor de IA na aba Essencial só exibe os modelos de estratégia, e na aba Instagram só exibe os modelos configurados para conteúdo e legenda.

## Modelos sugeridos

- **Codex (OpenAI):** GPT-6.1 Terra, para coordenar os tipos TypeScript com a migration do banco.
- **Claude Code (Anthropic):** Claude Sonnet 5.5, para implementar o fluxo de interface em Minha Conta e os testes da gaveta.
- **Antigravity (Google):** Gemini 3.8 Flash, para validação rápida de regressões e execução de suites; confirmar disponibilidade no plano.
