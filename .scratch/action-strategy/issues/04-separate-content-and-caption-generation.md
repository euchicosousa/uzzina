# EST-04 — Separar a geração de conteúdo da geração de legenda

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para rastrear o prompt e a aplicação da resposta nos editores.
- **Anthropic** — Claude Sonnet 5.5, para conferir os contratos de geração e preservar rascunhos.
- **Google** — Gemini 3.8 Flash, para investigar a origem do bloco e corrigir o fluxo delimitado.

**Entrega.** Investigar por que **Gerar conteúdo**, após escolher uma estratégia, inclui uma seção “Legenda” no editor. Corrigir a origem para que o conteúdo siga editável e a legenda seja gerada depois, por comando explícito no campo próprio.

**Bloqueado por.** Nenhum ticket. Coordenar alterações compartilhadas com EST-03 se os dois avançarem juntos.

## Aceite

- [ ] Reproduzir o caso da captura e identificar se a seção vem do prompt, da resposta do provedor ou da montagem no editor.
- [ ] Gerar conteúdo a partir de uma estratégia e conferir que elementos editoriais como frase na arte e direção visual continuam disponíveis, sem bloco de legenda pronta ou disparo automático de **Gerar legenda**.
- [ ] Preservar legendas e rascunhos existentes. Após editar o conteúdo, disparar **Gerar legenda** explicitamente e conferir que o comando usa o conteúdo atualizado e preenche o campo próprio.
- [ ] Conferir persistência ao reabrir a ação. Preservar a seleção e a geração de estratégias.
