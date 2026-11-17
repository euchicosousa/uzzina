# Próximos passos do modelo cor pai (17/11/2026)

O proprietário entrega cada etapa a um agente e o Claude Code confere o resultado. Um agente escreve no checkout por vez, exceto as etapas marcadas como "só estudo", que não tocam em `app/`.

Estado de partida: `main` local em `e49214e` (6 commits à frente de `origin/main`, sem push). DS28 aceito. Trabalho do Gemini no DS21 commitado em `46a92ce`.

## Ordem

| # | Etapa | Pode rodar junto com | Precisa de decisão antes? |
|---|---|---|---|
| 1 | DS33 — inventário das transparências (só estudo) | 2 | Não |
| 2 | DS31 — estudo e protótipo do tema Personalizado (só estudo) | 1 | Não |
| 3 | DS29 + DS30 — sombra única e limpeza das paletas (código, um agente só) | nada | Sim: D1 a D5 abaixo |
| 4 | DS32 — editor de temas do Admin no modelo novo (código) | nada | Depois da etapa 3 |
| 5 | DS31 — implementação do Personalizado (código) | nada | Decisões do estudo da etapa 2 |
| 6 | DS33 — troca nos componentes (código) | nada | Decisões do inventário da etapa 1 |
| 7 | DS34 — widget do Cloudinary | — | Esperar ou não o UP01 |

DS29 e DS30 vão juntos porque mexem nos mesmos dois arquivos (`palettes.ts` e `palette-vars.ts`).

## Decisões para a etapa 3

- **D1.** Gaveta de ação: a película escura atrás dela passa a usar a cor da sombra (como os diálogos) ou continua preto fixo?
- **D2.** Avisos (toast): mantêm a sombra colorida por tipo (verde, vermelho…) ou usam a sombra única?
- **D3.** Texto principal sai do fundo em todos os temas? (No escuro dos temas com fundo L 0,141 o texto fica 94% branco, não branco puro.)
- **D4.** Relevo (cartão com borda superior e sombra × plano) continua escolhido por tema?
- **D5.** Temas Personalizados já salvos (2 pessoas): os campos de sombra e texto são só ignorados, sem mexer no banco?

## Textos para entregar aos agentes

Cada texto é completo; basta colar.

### Etapa 1 — DS33 inventário (Haiku 5.5 ou Gemini Argon Medium)

> Projeto UZZINA em /Users/euchicosousa/vercel/uzzina. Leia `AGENTS.md`, `docs/audits/CURRENT.md` (seção DS28) e o ticket `.scratch/design-system-audit/issues/33-manual-transparencies-and-secondary.md`. Tarefa só de estudo: não altere nada em `app/`, não faça commit. Entregue o inventário pedido no ticket em `docs/audits/2026-11-17-ds33-transparencies-inventory.md`, em português simples: cada uso de `(bg|border|text|ring|divide)-foreground/NN`, `bg-secondary/NN`, `hover:bg-secondary` e `data-[hovered]:bg-secondary`, com arquivo e linha, em que superfície está (fundo, cartão, menu, cartão de fase, imagem) e a classificação proposta (vira texto suave, vira borda de container, vira `bg-secondary-hover`, continua transparente de propósito, ou caso a decidir). Termine com as decisões que o proprietário precisa tomar. Atualize o status do ticket, `.scratch/README.md` e `docs/audits/CURRENT.md`.

### Etapa 2 — DS31 estudo (Sonnet 5.5 ou Haiku 5.5 só para o protótipo)

> Projeto UZZINA em /Users/euchicosousa/vercel/uzzina. Leia `AGENTS.md`, `docs/audits/CURRENT.md` (DS28 e levantamento pós-cor pai), o ticket `.scratch/design-system-audit/issues/31-custom-theme-parent-color.md`, `app/components/features/profile/CustomThemePanel.tsx`, `app/lib/custom-theme.ts`, `app/lib/preferences.ts`, `app/utils/color.ts` e o rascunho `.scratch/design-system-audit/novo/tailwind-novo.css`. Tarefa só de estudo: não altere `app/` nem o banco, não faça commit. Entregue (1) protótipo HTML autocontido `.scratch/design-system-audit/ds31-personalizado.html` com os campos propostos (fundo e cor principal; escuro derivado ou escolhido, as duas opções lado a lado) e a prévia dos neutros calculados pelas fórmulas do rascunho, claro e escuro, com aviso de contraste do texto sobre a principal; (2) relatório `docs/audits/2026-11-17-ds31-custom-theme-study.md` com as decisões do ticket e uma recomendação para cada, incluindo o que fazer com temas já salvos sem mexer no banco. Siga as regras do Prism (sem caixas em volta de seções; exceção dos dois blocos com o fundo de cada modo). Atualize o ticket, `.scratch/README.md` e `docs/audits/CURRENT.md`.

### Etapa 3 — DS29 + DS30 (Sonnet 5.5; Opus 5.5 se preferir uma passada só com DS32)

> Projeto UZZINA em /Users/euchicosousa/vercel/uzzina. Leia `AGENTS.md`, `docs/audits/CURRENT.md`, os tickets `.scratch/design-system-audit/issues/29-single-shadow-formula.md` e `30-palette-cleanup-parent-color.md`, a seção "Decisão do proprietário: sombra" em `docs/audits/2026-11-16-ds26-inventario-cores.md` e as decisões D1–D5 registradas em `.scratch/design-system-audit/proximos-passos-cor-pai.md`. Implemente: (a) sombra única por fórmula em `app/tailwind.css` (elevação, película `bg-overlay`, base do cartão de ação; atrasado usa a cor de erro e "Cor da fase" usa a cor da fase), conforme D1 e D2; (b) retire de `app/lib/palettes.ts`, `app/lib/palette-vars.ts` e de quem os usa os campos `cardLDelta`, `popoverLDelta`, `inputLDelta`, `borderLDelta`, `actionLDelta`, `actionHoverLDelta`, `shadowColor`, `shadowOpacity` e, conforme D3, `fg` (o CSS deixa de usar `--foreground-override`/`--dark-foreground-override` para paletas e o texto sai do fundo: claro `calc(l - 0.96)` ΔC −0,002, escuro `calc(l + 0.8)` ΔC −0,01); (c) relevo conforme D4; (d) temas Personalizados salvos conforme D5, sem alterar o banco. O editor do Admin (`app/components/features/admin/themes/`) vai ser refeito no DS32: só mantenha-o compilando. Atualize a galeria `/ui` (cores e sombras) e `docs/contracts/pages-today-profile-planning.md` se citar paletas. Rode Prettier nos arquivos tocados e `npx tsc --noEmit`. `bun run dev` usa produção: no navegador só leitura. Não faça commit. Ao terminar, atualize os dois tickets e `docs/audits/CURRENT.md` com o que foi verificado e o que não foi, e liste os arquivos alterados.

### Etapa 4 — DS32 (Gemini Argon High, autor do DS21; ou Sonnet 5.5)

> Projeto UZZINA em /Users/euchicosousa/vercel/uzzina. Leia `AGENTS.md`, `docs/audits/CURRENT.md`, o ticket `.scratch/design-system-audit/issues/32-admin-theme-editor-parent-color.md`, o DS21 (`21-admin-theme-colors-editor.md`) e o protótipo `prototipo-ds21-v2.html`. Depois das etapas DS29/DS30, a paleta guarda só fundo, principal, texto sobre a principal, anel e (se mantido) relevo. Ajuste `/app/admin/themes` (`app/routes/app/admin/themes.tsx` e `app/components/features/admin/themes/`): edição só desses campos; neutros, semânticas, fases, prioridades e sombra como fórmulas travadas com o valor calculado; Salvar `.md` só com campos que existem. Prettier e `npx tsc --noEmit`. Sem commit. Atualize os tickets DS32 e DS21, `.scratch/README.md` e `docs/audits/CURRENT.md`.

As etapas 5, 6 e 7 recebem texto depois das decisões dos estudos.

## Conferência pelo Claude Code depois de cada etapa

Diff contra o pedido do ticket, `tsc`, conferência no navegador (claro e escuro, Ônix, Carbono, Fúcsia, Turquesa), sem gravar nada em produção; relato ao proprietário antes do commit.
