# DS30 — Limpar as paletas: cada tema guarda só a cor pai e a principal

**Status.** Aberto em 17/11/2026. Nada aplicado. Depende de o trabalho do Gemini no DS21 (`palettes.ts`, `palette-vars.ts`, `color.ts`, sem commit) ser commitado ou descartado pelo proprietário.

## O que é

Com os neutros (DS28) e a sombra (DS29) saindo do fundo, a maior parte do que cada paleta guarda virou peso morto. Cada tema passa a definir apenas:

- **fundo** claro e escuro (a cor pai);
- **principal**, texto sobre a principal e anel de foco, claro e escuro;
- **relevo** (cartões com ou sem borda superior e sombra; hoje Carbono e Cobalto são planos) — a confirmar.

Saem de `app/lib/palettes.ts` e de `app/lib/palette-vars.ts`:

- `cardLDelta`, `popoverLDelta`, `inputLDelta`, `borderLDelta`, `actionLDelta`, `actionHoverLDelta` (já não são lidos pelo CSS desde o DS28);
- `shadowColor`, `shadowOpacity` (DS29);
- `fg` (texto principal). Com isso o CSS deixa de aceitar `--foreground-override` vindo das paletas e o texto passa a sair do fundo (claro −0,96, escuro +0,8), como no laboratório. Diferença visível: nos temas com fundo escuro L 0,141 o texto fica com 94% de luz em vez de branco puro.
- `topBorderColor`, se o relevo passar a ter um valor só.

## O que olhar no app depois

Trocar de tema pela busca e por Minha Conta → Aparência; conferir texto principal nos 11 temas, nos dois modos; página inicial e portal do cliente (usam Ônix fixo, DS07).

## Decisões em aberto

- [ ] O texto principal sai mesmo do fundo em todos os temas (aceitar o branco a 94% no escuro)?
- [ ] Relevo continua por tema?
- [ ] O fundo de cada tema também é revisto agora (seis temas usam o mesmo fundo escuro L 0,141, só a principal muda)?

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Remoção de campos em tipos, paletas, `palette-vars.ts`, busca global e Minha Conta, com `tsc` e conferência nos 11 temas.
- **Claude Code — Haiku 5.5.** Suficiente se for só apagar campos depois que DS29 e DS31 já tiverem tirado os usos.
- **Gemini — Gemini 4 Argon (Medium).** Alternativa, coordenando com o próprio trabalho dele no DS21.
