# V47 — Corrigir quebra de layout na aba Instagram

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para reproduzir o caso e verificar a solução.
- **Anthropic** — Claude Haiku 5.5, para conferir os contratos e os cenários de aceite.
- **Google** — Gemini 3.8 Flash, para executar o recorte e conferir o resultado.

**Bloqueado por.** Nenhum.

## Entrega e aceite

Reproduzir com nomes longos e múltiplos parceiros em larguras estreitas. Avaliar truncamento tanto no seletor de Parceiros quanto em Gerar legenda, mantendo nomes acessíveis completos e sem empurrar ou ocultar controles. Conferir os dois layouts da aba.

## Status: Concluído

- Na barra da sub-aba **Legenda** (`caption`), corrigido o `flex-wrap gap-2` para `flex min-w-0 shrink-0 items-center justify-between gap-3 border-b px-4 py-4 @[47rem]/action:pl-0`, mantendo altura consistente de uma linha sem quebrar para a segunda linha em painéis estreitos.
- No bloco de parceiros de ambas as sub-abas (**Conteúdo** e **Legenda**), adicionado `min-w-0 shrink` no contêiner, `truncate text-sm font-medium` no texto e `title={getFormattedPartnersName(currentPartners)}` para acessibilidade e leitura por tooltip no hover.
- No grupo de botões de **Gerar legenda**, ajustado para `min-w-0 shrink` e adicionado `min-w-0 shrink truncate` no botão com `span` interno truncado e `title="Gerar legenda"`, preservando a visibilidade e operação do seletor de modelos de IA em painéis curtos ou estreitos (`writingLayout`).
- Typecheck limpo (`tsc --noEmit` código 0).
