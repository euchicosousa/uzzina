# DS23 — Trocar as transparências de destaque por cores opacas calculadas pela superfície

**Status.** Aberto em 16/11/2026 a pedido do proprietário. Estudo entregue em 16/11 (relatório e demonstração); aguarda decisões D1 a D5. Nenhuma alteração no código do app sem aprovação explícita.

Relatório: [docs/audits/2026-11-16-ds23-surfaces-study.md](../../../docs/audits/2026-11-16-ds23-surfaces-study.md). Demonstração: [ds23-superficies.html](ds23-superficies.html).

## O que a pessoa vê hoje

O app usa transparência para destacar itens: o fundo "secundário" (hover de itens de menu e dropdown, botão secundário, alternâncias) é o texto a 5% no claro e 10% no escuro, transparente; o texto secundário é o texto a 65%, transparente; e há transparências escritas direto no código (`foreground/10`, `border-foreground/5` etc.). A intenção era o item se destacar em qualquer fundo. Na prática:

1. **Empilhamento:** item transparente dentro de superfície transparente soma camadas; o mesmo hover fica mais forte num lugar e mais fraco em outro.
2. **Fundos coloridos:** "texto a 5%" sobre uma cor vira um cinza sujo, não um tom daquela cor; o texto secundário perde contraste.
3. **Vazamento:** em áreas que rolam por baixo, cabeçalhos fixos e sobreposições, o que está atrás aparece.

Exemplo citado pelo proprietário: a seção só de administrador no menu do cabeçalho (`Header.tsx`, `HeaderMenu`), que tem fundo próprio.

Uso medido em 16/11: ~132 `bg-secondary`, ~341 `text-secondary-foreground`, ~77 `(bg|border|text)-foreground/NN`.

## Proposta a estudar

Cores **opacas** calculadas contra a **superfície onde o item está**:

- cada superfície (fundo da página, cartão, popover/menu, dropdown, select/combobox, gaveta/sheet, diálogo, cartão de ação, seção de admin do menu) declara sua cor numa variável, por exemplo `--surface`;
- secundário, hover de itens e texto secundário passam a ser `color-mix(in oklab, var(--foreground) N%, var(--surface))` (opaco);
- as classes existentes (`bg-secondary`, `text-secondary-foreground`) continuam; muda só a definição, e os containers do Prism declaram a superfície.

Transparência continua onde ver o que está atrás é a intenção: película dos diálogos, sombras, ícones sobre imagem (`image-icon`).

## O que o estudo precisa entregar

1. **Inventário:** onde cada token transparente é usado, agrupado por superfície (qual container está por trás), com os casos de empilhamento e de fundo colorido identificados. Separar o que deve ficar transparente.
2. **Lista de superfícies** que precisariam declarar `--surface`, com o arquivo de cada uma (primitivos em `app/components/prism/`, `ActionItem`, `Header.tsx`, gaveta) e se o cartão de ação nas fases suave/viva precisa de tratamento próprio.
3. **Desenho da regra:** fórmula do secundário, do hover e do texto secundário no claro e no escuro (porcentagens atuais como ponto de partida), como herda dentro de superfícies aninhadas, e o que fazer com `foreground/NN` escrito à mão (trocar por token ou manter).
4. **Riscos:** elementos sem superfície declarada (o que herdam), desempenho/complexidade de CSS, impacto nos 11 temas e nas fases suave/viva, a inconsistência atual do secundário (`srgb` no claro, `oklch` no escuro).
5. **Demonstração** em HTML autocontido em `.scratch/design-system-audit/ds23-superficies.html`: as mesmas peças (item de menu em repouso e hover, botão secundário, texto secundário) sobre fundo da página, cartão, popover, seção colorida tipo admin e cartão de ação com fase, lado a lado **hoje (transparente) x proposta (opaca)**, claro e escuro, com o CSS real do app quando servido por `http://127.0.0.1:5176/` (como em `ds21-mapa-de-formulas.html`).
6. **Relatório** em `docs/audits/2026-11-16-ds23-surfaces-study.md`, em português simples, com as decisões que o proprietário precisa tomar e uma recomendação para cada.

## Decisões do proprietário (a preencher)

- [ ] Adotar a regra opaca por superfície?
- [ ] O que continua transparente.
- [ ] O que fazer com as transparências escritas à mão.

## Critérios de conclusão do estudo

- [x] Inventário e lista de superfícies.
- [x] Regra proposta com fórmulas claro/escuro.
- [x] Demonstração HTML funcionando no servidor local, sem erros de console.
- [x] Relatório com decisões e recomendações.
- [x] Ticket, `.scratch/README.md` e `docs/audits/CURRENT.md` atualizados.

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Escolhido pelo proprietário para o estudo: inventário por busca no código e demonstração HTML a partir do padrão já existente no mapa de fórmulas.
- **Claude Code — Sonnet 5.5.** Indicado para a implementação após as decisões: mudar a definição dos tokens no `tailwind.css` e declarar a superfície nos containers do Prism, com conferência nos 11 temas.
- **Gemini — Gemini 4 Argon (Medium).** Alternativa para o inventário; exigir as regras do Prism (sem caixas, tokens, squircle) na demonstração.
