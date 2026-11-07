# EST-04 — Separar a geração de conteúdo da geração de legenda

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para rastrear o prompt e a aplicação da resposta nos editores.
- **Anthropic** — Claude Sonnet 5.5, para conferir os contratos de geração e preservar rascunhos.
- **Google** — Gemini 3.8 Flash, para investigar a origem do bloco e corrigir o fluxo delimitado.

**Status.** EST-04 encerrado com aceite do proprietário em 06/11/2026: o conteúdo gerado não traz mais a legenda pronta (a instrução à IA proíbe e o servidor corta um bloco "Legenda"). "Gerar legenda" continua sendo um comando separado.

**Entrega.** Investigar por que **Gerar conteúdo**, após escolher uma estratégia, inclui uma seção “Legenda” no editor. Corrigir a origem para que o conteúdo siga editável e a legenda seja gerada depois, por comando explícito no campo próprio.

**Bloqueado por.** Nenhum ticket. Coordenar alterações compartilhadas com EST-03 se os dois avançarem juntos.

## Aceite

- [x] Origem identificada por leitura do código: o prompt de conteúdo (frase "Quando a legenda fizer parte do pedido…" no post, sem proibição geral). A montagem no editor não grava legenda.
- [x] (código; sem chamada real à IA) Gerar conteúdo a partir de uma estratégia e conferir que elementos editoriais como frase na arte e direção visual continuam disponíveis, sem bloco de legenda pronta ou disparo automático de **Gerar legenda**.
- [x] (fluxo lido; teste existente em action-ai) Preservar legendas e rascunhos existentes. Após editar o conteúdo, disparar **Gerar legenda** explicitamente e conferir que o comando usa o conteúdo atualizado e preenche o campo próprio.
- [ ] Conferir persistência ao reabrir a ação. Preservar a seleção e a geração de estratégias.
