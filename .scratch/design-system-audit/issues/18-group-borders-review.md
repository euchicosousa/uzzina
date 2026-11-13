# DS18 — Revisar e limpar os grupos do Prism (botões, toggles e campos)

**Status.** Aberto em 13/11/2026 a pedido do proprietário. Estudo entregue em 13/11: [relatório](../../../docs/audits/2026-11-13-ds18-groups-study.md) e [prévia antes/depois](../comparativo-ds18-grupos.html). Grupo de botões aprovado (v4): `attached` padrão, puxão só no default e no outline, respiro de 1px só no default e no secondary. Ajuste do botão commitado em `a00ef0e`. Toggles e campo aprovados. Implementado em 13/11 (sem commit): variantes do toggle herdadas do botão, puxão só nas bordas opacas, ghost de toggle sempre separado por 4px, limpeza do InputGroup. Falta aceite visual e commit. Aguarda as decisões da seção 5 do relatório; nenhuma alteração no app.

## O que a pessoa vê

Os componentes que juntam vários controles numa peça só mostram uma borda que o proprietário não quer:

- **Grupo de botões (`PrismButtonGroup`)**: botões colados, com bordas sobrepostas (`-ml-px`) e cantos arredondados só nas pontas. Aparece, por exemplo, nos botões de IA da gaveta de ação (aba Essencial e aba Instagram → Conteúdo), na janela "Ver estratégias" da gaveta (o estudo confirmou que não há grupo no rodapé) e na barra do calendário (`UCalendarToolbar`: anterior / hoje / próximo).
- **Grupo de toggles (`PrismToggleGroup`)**: tem a prop `attached` (itens colados, com bordas sobrepostas) e, sem ela, `spacing` (itens separados por um espaço). O proprietário acha a versão com espaço mais interessante e quer o mesmo comportamento disponível nos outros grupos. Aparece em Minha Conta, no Hoje e no calendário da Home, nos diálogos de ações em lote (cor, Sprint, responsáveis), no calendário do portal, no seletor de cor e no admin de usuário e de parceiro.
- **Grupo de campo (`PrismInputGroup`)**: campo com prefixo/sufixo (ícone, botão, atalho) numa caixa só, com borda transparente que ganha cor no foco e no erro. Usado no login da equipe e do portal, em recuperar e redefinir senha, em Leads, na página do parceiro, no admin de cliente e de usuário e no seletor de datas comemorativas.

Onde ver todos juntos: galeria `/ui`, seções de Button, ButtonGroup, Toggle & ToggleGroup e Input.

## O que fazer

1. **Leitura completa dos três componentes** (`app/components/prism/button-group.tsx`, `toggle-group.tsx`, `input-group.tsx`) e dos primitivos que eles agrupam (`button.tsx`, `toggle.tsx`, `input.tsx`): de onde vem cada borda, contorno, separador (`PrismButtonGroupSeparator`, `ButtonGroupText`) e sobreposição de pixel, em cada variante (default, outline, secondary, ghost) e tamanho (xs, sm, default, lg).
2. **Inventário de uso:** listar cada lugar do app que usa um dos três grupos, com o caminho para abrir na tela e como ele está configurado (colado ou com espaço, variante, tamanho, classes extras passadas por fora, como o `bg-background` dos separadores na gaveta).
3. **Proposta de padrão único:** os três grupos com a mesma API para "colado" e "com espaço" (hoje só o ToggleGroup tem `attached`/`spacing`; o ButtonGroup é sempre colado), sem a borda indesejada, mantendo foco por teclado visível, hover e estados de erro (no campo) e o raio por tamanho definido no AGENTS (ButtonGroup/ToggleGroup seguem o raio dos itens).
4. **Limpeza:** apontar classes repetidas, sobras e exceções locais que deixam de ser necessárias com o padrão novo (por exemplo, as longas listas de raio por tamanho no ToggleGroup e os `!` do ButtonGroup).
5. **Antes e depois visível:** prévia em HTML ou na `/ui` com cada grupo como está e como ficaria, claro e escuro, em todas as variantes e tamanhos, com foco por teclado.

## Critérios de conclusão

- [x] Relatório com a origem de cada borda e o inventário de uso, em linguagem simples.
- [x] Proposta de API comum (nomes das props, valor padrão) e do visual sem a borda, com o que muda em cada tela do inventário.
- [x] Prévia de antes e depois para o proprietário conferir, com um roteiro curto.
- [x] Implementação só depois da aprovação; ao implementar, atualizar `/ui`, `docs/contracts/prism-details.md` e a regra de grupos no AGENTS.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Leitura dos três componentes, inventário de uso e prévia; escopo de design system bem delimitado.
- **Codex — GPT-6 Luna.** Alternativa leve para o inventário e a limpeza mecânica de classes, seguindo a proposta aprovada.
- **Claude Code — Opus 5.5.** Se unificar a API exigir mudar muitos pontos de uso ou o comportamento de foco e teclado dos grupos.
