# DS31 — Refazer o tema Personalizado de Minha Conta no modelo cor pai

**Status.** Aberto em 17/11/2026 a pedido do proprietário ("a aba de personalizado precisa ser inteiramente revista"). Estudo e proposta antes de qualquer código. Depende do DS29 e do DS30 estarem definidos.

## O que é

Em **Minha Conta → Aparência → Personalizado**, a pessoa escolhe hoje, para claro e escuro: cor principal, texto sobre a principal, **fundo** e **texto**, além de relevo, cor e força da sombra e borda superior (`CustomThemePanel.tsx`, `app/lib/custom-theme.ts`, `app/lib/preferences.ts`, gravado nas preferências da pessoa no banco). Com o modelo novo, o texto, as superfícies e a sombra saem do fundo; escolher texto e sombra à mão contradiz a regra e pode gerar combinações ilegíveis.

## Proposta a estudar

- A pessoa escolhe só o que um tema da lista também define (ver DS30): fundo claro e escuro, principal e texto sobre a principal; talvez só o fundo claro e a principal, com o escuro derivado (`deriveDarkBg`, `deriveDarkPrimary` em `app/utils/color.ts` já existem).
- A prévia mostra os neutros calculados (cartão, campo, botões cinzas, texto secundário) e avisa contraste baixo do texto sobre a principal.
- Os dois blocos com o fundo de cada modo continuam (exceção registrada no AGENTS em 12/11).
- O que acontece com quem já salvou um tema Personalizado (2 pessoas em 17/11): campos antigos ignorados na leitura, sem migração de banco, ou migração. Nenhuma mudança de banco sem aprovação.

## O que o estudo entrega

Protótipo HTML em `.scratch/design-system-audit/` com os campos propostos e a prévia nos dois modos, e um relatório curto com as decisões abaixo.

## Decisões em aberto

- [ ] Quais campos a pessoa escolhe (só fundo e principal? escuro derivado ou escolhido?).
- [ ] Relevo continua como opção?
- [ ] Temas Personalizados já salvos: ignorar campos antigos ou migrar.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Estudo e protótipo, e depois a implementação no painel, nas preferências e na leitura do tema salvo.
- **Claude Code — Haiku 5.5.** Só o protótipo HTML, a partir dos laboratórios DS24/DS28.
- **Gemini — Gemini 4 Argon (Medium).** Alternativa para o protótipo; exigir as regras do Prism e o texto em português.
