# V48 — Sincronizar a âncora ao trocar de aba em /ui

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para reproduzir o caso e verificar a solução.
- **Anthropic** — Claude Haiku 5.5, para conferir os contratos e os cenários de aceite.
- **Google** — Gemini 3.8 Flash, para executar o recorte e conferir o resultado.

**Bloqueado por.** Nenhum.

## Entrega e aceite

Ao trocar de aba, limpar a âncora da aba anterior ou trocar por uma válida no destino. Recarregar deve preservar a aba atual. Conferir links diretos, troca entre abas e navegação Voltar/Avançar.

## Status: Concluído

- Em `app/routes/ui.tsx`, `handleSectionChange` agora atualiza a âncora do destino via `navigate({ hash: targetId, replace: false })`, eliminando a âncora defasada da aba anterior da barra de endereço.
- O recarregamento (F5 / Cmd+R) preserva a aba ativa com base na âncora canônica da URL.
- Adicionado listener de `hashchange` no `useEffect` para suportar navegação nativa do navegador (Voltar e Avançar).
- Cliques na barra lateral e troca de abas utilizam `replace: false` para manter histórico de navegação navegável.
- Typecheck limpo.
