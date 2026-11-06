# EST-03 — Recriar estratégias no diálogo de sugestões

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para preservar a operação durável e validar a sincronização da ação.
- **Anthropic** — Claude Sonnet 5.5, para conferir seleção, persistência e conflitos.
- **Google** — Gemini 4 Argon, para implementar e conferir o fluxo completo. Disponibilidade depende do plano.

**Entrega.** Adicionar o botão Recriar estratégias ao diálogo “5 Estratégias Sugeridas”, junto ao estado das estratégias salvas. Reutilizar a geração durável atual. Sem streaming.

**Bloqueado por.** Nenhum ticket. EST-01 e EST-02 já foram aceitos.

## Aceite

- [ ] Conferir o comportamento atual antes de editar. Propor recriar o conjunto de cinco, com substituição individual sujeita a decisão explícita.
- [ ] Conservar as sugestões anteriores durante a espera e em caso de falha. Evitar disparos duplicados e preservar as guardas de versão e autorização.
- [ ] Após confirmação do salvamento, conferir os campos de estratégia no diálogo, na ação e ao reabrir. Verificar seleção anterior, campos da estratégia expandida e contexto usado em Gerar conteúdo. Preservar título, descrição, legenda, mídia e demais edições da ação.
- [ ] Cobrir ação sem seleção, com seleção e com geração em voo. Em caso de conflito, aplicar a revisão prevista pelo fluxo existente.
