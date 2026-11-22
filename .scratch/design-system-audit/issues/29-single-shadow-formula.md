# DS29 — Sombra única por fórmula (fim da sombra por paleta)

**Status.** Encerrado em 22/11/2026: a sombra única (`--shadow-color`) foi aplicada na etapa 4 do [DS36](36-total-color-editor.md), aprovada pelo proprietário.

**Registro anterior.** Aberto em 17/11/2026. Decisão de valores já tomada pelo proprietário em 17/11 no laboratório [ds27-sombras.html](../ds27-sombras.html) (registrada em [DS26, seção "Decisão do proprietário: sombra"](../../../docs/audits/2026-11-16-ds26-inventario-cores.md)). Nada aplicado no app.

## O que é

Hoje cada paleta escolhe a cor e a força da sombra de menus, diálogos, avisos e cartões (`shadowColor` e `shadowOpacity` em `app/lib/palettes.ts`). A decisão é uma regra só para todos os temas: a sombra é uma mistura do fundo com a cor principal, escurecida, com uma força no claro e outra no escuro.

```css
:root { --shadow-mix: 30%; --shadow-l: 0.15; --shadow-alpha: 10%;
  --shadow-color: oklch(from color-mix(in oklab, var(--background), var(--primary) var(--shadow-mix)) var(--shadow-l) c h); }
.dark { --shadow-mix: 20%; --shadow-l: 0.15; --shadow-alpha: 70%; }
```

## Componentes afetados (onde ver)

- Menus, selects, combobox, popover, dicas, diálogos e avisos (toast): qualquer menu aberto no app.
- Película de fundo dos diálogos (`bg-overlay`, hoje a cor da sombra a 30%) — decisão A3: "película da sombra".
- Cartão de ação (Hoje, Kanban, Sprint): a sombra padrão vira a base. Estados trocam a cor: atrasado usa a cor de erro; com "Cor da fase" ligada, usa a cor da fase. O anel e a borda superior de relevo (`--action-top-border`) continuam como hoje até decisão contrária.
- Painel da gaveta de ação: usa preto fixo (`bg-black/20` claro, `bg-black/80` escuro, em `ActionDrawerPanel.tsx`). Decidir se passa a usar a película da sombra.

## O que será mudado

1. `app/tailwind.css`: trocar `--shadow-tint`/`--shadow-alpha` e `--action-shadow-color` pela fórmula acima; atrasado e fase sobrescrevem a cor.
2. Retirar de `palettes.ts` e de `palette-vars.ts` os campos `shadowColor`, `shadowOpacity` e o código que só existia para eles. A primeira versão do editor foi preservada no commit 46a92ce. Pode ser feito junto com o [DS30](30-palette-cleanup-parent-color.md).
3. O tema Personalizado deixa de oferecer cor e força da sombra (fica no [DS31](31-custom-theme-parent-color.md)).
4. Atualizar a galeria `/ui` (sombras e overlay) e o contrato de temas.

## Decisões em aberto

- [ ] Gaveta de ação: película da sombra ou manter preto fixo?
- [ ] Sombra colorida dos avisos por tipo (sucesso, erro…) continua?
- [ ] Banco: as preferências salvas de sombra (pessoas com tema Personalizado) podem ser ignoradas sem migração? Em 17/11 nenhuma pessoa tinha sombra própria salva; 2 têm tema Personalizado.

## O que olhar antes de aprovar

Menu aberto, diálogo, aviso, cartão de ação em repouso e hover, atrasado e com cor de fase, nos dois modos, em Ônix, Carbono (plano) e Fúcsia.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Mexe em CSS, em dois arquivos de paleta compartilhados com o DS21 e nos estados do cartão de ação; precisa conferir 11 temas.
- **Claude Code — Opus 5.5.** Se for executado junto com DS30 e DS31 numa só passada, pela quantidade de dependências cruzadas.
- **Gemini — Gemini 4 Argon (High).** Alternativa, já que conhece `palette-vars.ts` pelo DS21; exigir que não reintroduza valores por paleta.
