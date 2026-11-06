# DS04 — Investigar microinterações da interface

**Vínculo** — Investigação de padrões do [DS01](01-audit-visual-deviations.md).

**Bloqueios** — Nenhum.

**Status** — inventário e proposta entregues para decisão do proprietário

## Modelos sugeridos

Disponibilidade conforme conta e ferramenta.

- **OpenAI** — GPT-6.1 Sol, para comparar transições e propor critérios de adoção.
- **Anthropic** — Claude Haiku 5.5, para inventariar padrões e exceções.
- **Google** — Gemini 3.8 Flash, para comparar exemplos visuais e estados.

## Entrega

- [ ] Inventariar as microinterações atuais, começando pela expansão de Nova Hora em Alterar Data e Hora.
- [ ] Identificar onde movimento curto esclarece expansão, feedback ou mudança de estado. Propor duração, curva e comportamento com movimento reduzido, considerando teclado e estabilidade do layout.
- [ ] Recomendar quais padrões compartilhar e onde aplicar gradualmente, com exemplos e critérios de aceite. Escopo de investigação.

## Execução — 06/11/2026

Relatório: [docs/audits/2026-11-06-ds04-microinteractions.md](../../../docs/audits/2026-11-06-ds04-microinteractions.md).

- Inventário estático: cerca de 139 ocorrências de classes de movimento em 69 arquivos, sem tokens de duração/curva e sem nenhum `motion-reduce`/`prefers-reduced-motion` em `app/`.
- Nova Hora (`BulkDateTimeDialog.tsx`) anima `max-height`, padding e opacidade em 200 ms; proposta de `grid-template-rows` com 200 ms para abrir e 150 ms para fechar, `inert` e foco preservados, e `motion-reduce:transition-none`.
- Overlays do Prism usam classes `animate-in`/`zoom-in-95` etc. sem definição no repositório nem no `dist` de 05/11; proposta de substituir pelo padrão funcional de `sheet.tsx`.
- Tokens propostos em `@theme` (`--duration-motion-fast/base/slow`, `--ease-motion-standard/exit`); reduzir `transition-all` e durações de 500 ms; `motion-reduce` para skeletons, pulsos e gradientes.
- Limite: análise estática, sem verificação no navegador; remoções dependem de confirmar no DOM.

## Primeiro recorte aplicado — 06/11/2026

- `app/tailwind.css`: tokens adicionados ao bloco `@theme inline` existente. Tailwind 4.3.2 lê durações em `--transition-duration-*`; `--duration-*` não gera utilitários. Curvas usam `--ease-*`.
- Utilitários gerados: `duration-motion-fast` (150ms), `duration-motion-base` (200ms), `duration-motion-slow` (300ms), `ease-motion-standard` e `ease-motion-exit`.
- `app/components/features/bulk/BulkDateTimeDialog.tsx`: os blocos `Mudar Data` e `Nova hora` deixam de animar `max-height`/padding. O contêiner externo usa `grid` com `grid-rows-[1fr]` (aberto) ou `grid-rows-[0fr]` (fechado) e transiciona `grid-template-rows,opacity`; o interno tem `min-h-0 overflow-hidden`; o padding fica no elemento mais interno. Abrir 200ms com `ease-motion-standard`, fechar 150ms com `ease-motion-exit`, `motion-reduce:transition-none`. `inert`, `pointer-events` e foco mantidos.
- Verificação: Prettier OK nos dois arquivos; `npx tsc --noEmit` sem erros; compilação do Tailwind confirmou os utilitários. Não verificado no navegador nem no Safari.

Roteiro manual para o proprietário:

1. Abra o diálogo Alterar Data e Hora a partir da seleção em lote.
2. Marque e desmarque Mudar Data e depois Mudar Hora. Cada bloco deve abrir um pouco mais devagar que fechar, sem cortar conteúdo nem pular. Com o bloco fechado, Tab não deve entrar nele.
3. No macOS, ative Ajustes > Acessibilidade > Monitor > Reduzir movimento e repita o passo 2. A troca deve ser imediata, sem animação, e terminar no mesmo estado.

## Overlays animados — 06/11/2026

As classes `animate-in`, `zoom-in-95` e `fade-*` do Prism não faziam nada, porque o plugin nunca existiu. Foram trocadas por animações CSS próprias, sem dependência nova, ligadas a `data-entering`/`data-exiting` do React Aria: `animate-overlay-pop-in/out` (fade e escala a partir de 0,96) no popover, select, combobox, menu e conteúdo do diálogo, e `animate-overlay-fade-in/out` no fundo do diálogo. A entrada leva 200 ms com a curva padrão e a saída 150 ms com a curva de saída; em todos os casos vale `motion-reduce:animate-none`. Saíram as regras `[data-state]` de `tailwind.css` (1000/500 ms), que o React Aria nunca ativa. O deslize conforme a posição também saiu: agora é só fade e escala.

Verificação: 105 pass e 0 fail em 8 arquivos de overlays. No navegador local, em `/ui`, o popover abriu com `overlay-pop-in` 0,2 s e fechou com `overlay-pop-out` 0,15 s. O diálogo animou o fundo e o conteúdo e desmontou depois da saída, sem erros de console.

Roteiro: abrir e fechar o seletor de parceiros, o menu do perfil, a busca e um diálogo; depois ativar "Reduzir movimento" no sistema e conferir que nada anima.
