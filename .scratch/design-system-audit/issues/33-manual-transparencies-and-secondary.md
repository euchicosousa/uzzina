# DS33 — Transparências escritas à mão e o novo secundário

> **Absorvido pelo [DS35](35-unified-surfaces-and-neutrals.md) em 17/11/2026 como fases 2 e 4 (inventário por papel e reescrita por área). A dependência do DS23 abaixo não vale mais; as correções seguem o contrato da fase 1.** Este arquivo continua como detalhe; o status e a ordem valem pelo DS35.

**Status.** Aberto em 17/11/2026. **Depende do [DS23](23-opaque-surface-aware-colors.md)** (modelo de camadas): este ticket é a parte de troca nos componentes, que só faz sentido depois que as camadas existirem (passo 4 do DS23). Inventário pronto; nenhuma alteração no código do app.

Inventário: [docs/audits/2026-11-17-ds33-inventory.md](../../../docs/audits/2026-11-17-ds33-inventory.md). Página de grupos: [ds33-grupos.html](../ds33-grupos.html).

## O que é

Com o secundário opaco (DS28), três situações ficam fora da regra:

1. **Botões cinzas que não reagem ao mouse.** O item já é cinza em repouso e o hover também usa o cinza, então nada muda. São 14 casos (grupo A). A correção é trocar o hover por `bg-secondary-hover`.
2. **Cinza sólido onde antes era uma película.** Em 9 casos (grupo B), o cinza agora vem do fundo da página: avatares sem foto sobre cartões coloridos pela fase, quadros atrás de imagens e a área de Admin do menu do avatar. Serão resolvidos pela película de 20% do DS23 (passo 3).
3. **Transparências escritas à mão** (`foreground/NN`). Dos 82 usos, a maioria é intencional e fica (bordas de container aprovadas no DS24, texto suave de placeholder, alças sobre cartões coloridos). Os grupos D e E são limpeza opcional, para depois.

## Prioridade

1. **Grupo A (14 hovers):** depois do passo 1 do DS23. Principais: botão de fechar da folha lateral, botões de alternância, calendário (dias de faixa e hoje), item ativo da Ajuda, seções do editor de temas do Admin.
2. **Grupo B (9 casos sobre cor ou imagem):** no passo 3 do DS23, com a película de 20%.
3. **Grupos D e E:** limpeza opcional, depois dos grupos A e B.

## Relação com o DS23

O DS23 foi reaberto em 17/11 com o modelo de camadas, no lugar de ser encerrado como substituído por DS28 + DS33. Este ticket executa a migração (passo 4 do DS23): ligar os hovers e substituir as transparências escritas à mão depois que as camadas existirem.

## Fora deste ticket

- **Classes `text-soft` e `border-container`:** o modelo de camadas não cria essas classes. O proprietário ainda não confirmou essa decisão por escrito.

## Decisões em aberto

- [ ] D1 a D10 do inventário (seção 9), com recomendação para cada uma. Mais importante: D1 (hover de itens transparentes) e D5 (cinza sobre cor, a ser visto com a película de 20%).

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Lotes de troca do grupo A e D, com regra fixa (hover vira `bg-secondary-hover`). Barato e rápido para trocas repetitivas.
- **Claude Code — Sonnet 5.5.** Componentes Prism de maior alcance (`button`, `sheet`, `badge`, `calendar`), que afetam o app inteiro e exigem conferência nos dois modos.
- **Gemini — alternativa com as regras do Prism.** Para as telas pontuais do grupo A, seguindo as regras do Prism. Depende do plano e da disponibilidade.
