# DS28 — Neutros derivados da cor pai: aceite no app

**Status.** Aberto em 17/11/2026. Implementado em `app/tailwind.css` no mesmo dia, a pedido do proprietário, depois de ele conferir os 11 temas no laboratório [ds28-conferencia-neutros.html](../ds28-conferencia-neutros.html). **Aceito pelo proprietário em 17/11/2026.** Sem commit e sem push.

## O que é

Todas as cores neutras do app (fundo de cartão, menu, campo, borda, cartão de ação, botões cinzas e o texto secundário) passam a sair da cor de fundo do tema, com a mesma regra para todas as paletas. Antes, cada paleta tinha os próprios ajustes, e o "secundário" (fundo cinza de botões, hover e foco) era uma película transparente.

## O que já mudou

| Cor | Claro (luz do fundo) | Escuro (luz do fundo) |
|---|---|---|
| Cartão | −0,02 | +0,05 |
| Menu e diálogo | +0,02 | −0,03 |
| Campo | −0,04 | +0,02 |
| Borda | −0,07 | +0,10 |
| Cartão de ação | +0,02 | +0,10 |
| Cartão de ação, hover | +0,10 | +0,20 |
| Secundário (agora opaco) | −0,036 | +0,098 |
| Secundário, hover (novo: `bg-secondary-hover`) | −0,083 | +0,133 |
| Texto secundário | −0,512 | +0,549 |

- O texto principal continua com a cor da paleta ou do tema Personalizado. A regra derivada (claro −0,96, escuro +0,8) só vale quando não há cor própria. A troca definitiva está no [DS30](30-palette-cleanup-parent-color.md).
- Os ajustes por paleta (`*-l-delta` escritos por `palette-vars.ts`) deixaram de ser lidos pelo CSS.
- A galeria `/ui` (seção Cores) e a tabela de tokens do AGENTS foram atualizadas.

## O que olhar antes de aprovar

Nos dois modos, em pelo menos três temas (Ônix, Carbono e Fúcsia):

1. A tela Hoje e o Kanban: cartões, colunas e cartões de ação com hover.
2. A gaveta de uma ação: campos, abas e botões cinzas.
3. Um menu aberto (o menu do cabeçalho com a área de Admin) e um diálogo.
4. Minha Conta, incluindo o tema Personalizado. O tema Personalizado será refeito no [DS31](31-custom-theme-parent-color.md); aqui só confirme que não quebrou.
5. Botões cinzas em repouso e com o mouse em cima: o secundário ficou sólido. Onde ele aparece sobre uma cor (cartão de fase, imagem), anotar para o [DS33](33-manual-transparencies-and-secondary.md).

## Critérios de conclusão

- [x] Valores aplicados em `app/tailwind.css`.
- [x] Conferência técnica da tela Hoje (valores calculados batem com as fórmulas, sem erro de console).
- [x] Aceite visual do proprietário (17/11).
- [ ] Commit (pedido do proprietário).

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Basta para corrigir um ou outro valor que o proprietário pedir depois do aceite: troca de número no CSS.
- **Claude Code — Sonnet 5.5.** Se o aceite revelar um componente quebrado que exija mudar classes em vários arquivos.
- **Gemini — Gemini 4 Argon (Medium).** Alternativa para os mesmos ajustes pontuais, sem tocar nos arquivos do DS21 em andamento.
