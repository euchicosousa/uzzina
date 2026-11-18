# DS32 — Ajustar o editor de temas do Admin ao modelo cor pai

> **Absorvido pelo [DS35](35-unified-surfaces-and-neutrals.md) em 17/11/2026 como fase 5 (ferramentas que dependem do contrato).** Este arquivo continua como detalhe; o status e a ordem valem pelo DS35.

**Status.** Aberto em 17/11/2026 a pedido do proprietário. Complementa o [DS21](21-admin-theme-colors-editor.md) (página `/app/admin/themes`, feita pelo Gemini, sem commit). Não edita o ticket nem os arquivos do DS21 sem o proprietário decidir o destino deles.

## O que é

O editor de temas do Admin (menu de Administração → "Cores dos temas") foi desenhado quando cada paleta tinha os próprios ajustes. Hoje ele oferece controles que não fazem mais efeito ou que contradizem as decisões de 17/11:

- "Cartão / Menus e diálogos / Campos / Bordas / Cartão de ação / Cartão de ação · mouse (ajuste de luz)" — os `*-l-delta`; sem efeito desde o DS28 (`theme-editor-model.ts`, `DELTA_META`).
- "Cor da sombra" e "Força da sombra" — saem com o DS29.
- "Texto" (`fg`) — sai com o DS30.
- Prioridades: já derivam das semânticas (DS25).

## O que será mudado

1. O editor passa a editar só o que a paleta guarda depois do DS30 (fundo, principal, texto sobre a principal, anel, relevo).
2. Os neutros, semânticas, fases e sombra aparecem como **fórmulas travadas** (só leitura), com o valor calculado, como no protótipo v2 já aprovado.
3. O botão Salvar (arquivo `.md` de instruções) passa a listar só os campos que existem.
4. A prévia lado a lado continua usando componentes reais.

Arquivos: `app/routes/app/admin/themes.tsx`, `app/components/features/admin/themes/` (`theme-editor-model.ts`, `ThemeColorInspector.tsx`, `ThemePreviewPane.tsx`).

## Decisões em aberto

- [ ] Commitar o trabalho atual do Gemini (DS21 fase 1) antes dos ajustes, ou refazer a partir do v2?
- [ ] Quem executa: o Gemini, que fez o DS21, ou outro agente.

## O que olhar antes de aprovar

Abrir "Cores dos temas" como Admin, trocar de paleta, alterar fundo e principal e ver a prévia mudar nos dois modos; conferir que nenhum controle aparece sem efeito.

## Modelos sugeridos

- **Gemini — Gemini 4 Argon (High).** Autor do DS21; menor custo para adaptar o próprio código.
- **Claude Code — Sonnet 5.5.** Alternativa se o proprietário preferir outro executor; precisa ler os três arquivos do editor (~2.200 linhas).
- **Claude Code — Opus 5.5.** Se for refeito do zero a partir do protótipo v2, junto com DS30.
