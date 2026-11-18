# DS23 — Trocar as transparências de destaque por cores opacas calculadas pela superfície

**Status.** Reaberto em 17/11/2026 a pedido do proprietário, com novo escopo: modelo de camadas. Proposta aprovada pelo proprietário em 17/11 (gostou de tudo); nenhuma alteração no código do app sem a ordem de cada passo.

Documentos: [opções de superfície](../ds23-opcoes-superficie.html) · [camadas (proposta)](../ds23-camadas.html) · [grupos do DS33](../ds33-grupos.html) · [referências](../../../docs/audits/2026-11-17-ds23-referencias.md) · [inventário do DS33](../../../docs/audits/2026-11-17-ds33-inventory.md) · [estudo de 16/11](../../../docs/audits/2026-11-16-ds23-surfaces-study.md)

## O que a pessoa vê hoje

Os botões e itens cinzas (secundário) usam uma cor calculada só a partir do fundo da página. Por isso, a cor do botão não depende do lugar onde ele está. Um botão cinza dentro de um cartão claro quase some: a diferença de claridade entre ele e o cartão é de 0,016 hoje, contra 0,034 com a proposta.

## O que será mudado

Modelo de camadas: cada superfície declara uma única cor, `--layer`, e as cores do cinza são calculadas a partir dela.

- **Quatro tipos de camada:** página, cartão, flutuante (menu, seletor, diálogo, folha lateral) e tingida (cartão de fase, cabeçalho da área de Admin).
- **Tons por camada (decidido em 17/11: sem renomear, sem apelidos):** `secondary` (cinza do botão secundário, hover de itens, bolinha), `secondary-hover` (ao passar o mouse), `secondary-active` (ao pressionar, novo), `border` (borda) e o texto correspondente. Os nomes `fill`, `fill-hover`, `fill-active` e `line` das páginas de demonstração eram só ilustração. O único nome novo é `--layer`.
- **Uma regra só** (`.layer`) para todas as camadas, no claro e no escuro. Nada de ajuste por paleta.
- **Superfícies tingidas e imagens** usam uma única película translúcida de 20%, nunca empilhada. Limites de 12% a 24%.
- **No máximo 3 camadas aninhadas.**
- **Sem `backdrop-blur` no hover.**
- **Componentes param de escrever `foreground/NN` à mão** para preencher fundos.

O que muda para a pessoa: o cinza dos botões secundários passa a aparecer em qualquer lugar, com contraste correto, e as cores de fase e de imagem deixam de ficar sujas.

## Decisões já tomadas (17/11)

- Modelo de camadas aceito.
- Nomes: ficam `secondary`, `secondary-hover` e `border`; entra só `secondary-active` (pressionado) e a variável `--layer`. Sem renomear e sem apelidos (proprietário, 17/11: renomear obrigaria a mexer também nas variantes dos botões e não faz sentido).
- Estado pressionado incluído.
- Película de 20% para superfícies tingidas e imagens.
- Máximo de 3 camadas aninhadas.

## Decisões em aberto

- **(a) Nomes antigos no passo 1: decidido pelo proprietário em 17/11, opção A.** Mantém `secondary` e `secondary-hover`, mudando só a fórmula para ler `--layer`; sem nomes novos além de `secondary-active`, sem apelidos e sem renomear. A opção B (renomear para `fill*` em massa) foi descartada.
  - O proprietário não gosta de aliases; por isso a A não cria nenhum.
- **(b) Hover sobre a película:** ainda não tem valor próprio (hoje é igual ao repouso). Definir ao ver a tela.
- **(c) Teste com foto real** da película de 20%. A demonstração usou um gradiente.

## Plano de execução

- **Passo 0 — Documentação:** este ticket, o inventário e os documentos de referência (feito com esta reabertura).
- **Passo 1 — CSS:** só em `app/tailwind.css`. Sem mudança visível, porque a camada padrão é o fundo da página.
- **Passo 2 — Declarar a camada em uma superfície por vez:** cartão primeiro, depois popover, folha lateral e diálogo. O proprietário confere claro e escuro no tema Ônix, no Carbono e em mais um tema.
- **Passo 3 — Superfícies tingidas e imagens** com a película de 20%.
- **Passo 4 — Migrar os componentes em lotes pequenos:** primeiro os primitivos do Prism; depois os 14 casos de hover e os cerca de 111 casos de transparência escrita à mão, em 47 arquivos. Detalhe no [DS33](33-manual-transparencies-and-secondary.md).
- **Passo 5 — Atualizar a galeria `/ui`, o `AGENTS.md` e o documento [prism-details](../../../docs/contracts/prism-details.md).**

## Dependências

- **DS30** (limpar as paletas: remover os 132 valores de ajuste de luz por paleta que não são usados): só depois do passo 1, para não haver duas pessoas editando `palettes.ts` ao mesmo tempo.
- **DS31, DS32 e DS34:** esperam os nomes novos.
- **DS29** (sombra única): independente.
- **Código do DS21 que o Gemini deixou sem commit** (editor de cores do Admin): não bloqueia os passos 1 a 3, mas bloqueia DS30 e DS32.

## Limites desta análise

- A simplificação tem custo: os nomes de cor neutra passam de 9 para 11, ou para 15 durante a transição com aliases. O ganho real é não ter ajustes por paleta e ter uma regra só.
- As 111 transparências escritas à mão só desaparecem no passo 4.
- A demonstração usou um gradiente, não uma foto real.
- Testado só no Chrome.
- O app não foi executado para esta reabertura.

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Lotes de migração do passo 4, com regra fixa (hover vira `bg-secondary-hover`, transparência vira camada). Barato e rápido para trocas repetitivas.
- **Claude Code — Sonnet 5.5.** Passos 1 a 3: mudança central no CSS e declaração de camadas nas superfícies, com conferência nos temas. Mais cuidado porque o efeito aparece no app inteiro.
- **Gemini — alternativa com as regras do Prism.** Para o passo 4 em telas isoladas, desde que siga as regras do Prism (sem caixas sobre blocos de formulário, tokens, squircle). Depende do plano e da disponibilidade.

## Estudo de 16/11 (referência)

Relatório: [docs/audits/2026-11-16-ds23-surfaces-study.md](../../../docs/audits/2026-11-16-ds23-surfaces-study.md). Demonstração: [ds23-superficies.html](../ds23-superficies.html).

### O que a pessoa vê hoje

O app usa transparência para destacar itens: o fundo "secundário" (hover de itens de menu e dropdown, botão secundário, alternâncias) é o texto a 5% no claro e 10% no escuro, transparente; o texto secundário é o texto a 65%, transparente; e há transparências escritas direto no código (`foreground/10`, `border-foreground/5` etc.). A intenção era o item se destacar em qualquer fundo. Na prática:

1. **Empilhamento:** item transparente dentro de superfície transparente soma camadas; o mesmo hover fica mais forte num lugar e mais fraco em outro.
2. **Fundos coloridos:** "texto a 5%" sobre uma cor vira um cinza sujo, não um tom daquela cor; o texto secundário perde contraste.
3. **Vazamento:** em áreas que rolam por baixo, cabeçalhos fixos e sobreposições, o que está atrás aparece.

Exemplo citado pelo proprietário: a seção só de administrador no menu do cabeçalho (`Header.tsx`, `HeaderMenu`), que tem fundo próprio.

Uso medido em 16/11: ~132 `bg-secondary`, ~341 `text-secondary-foreground`, ~77 `(bg|border|text)-foreground/NN`.

### Proposta a estudar

Cores **opacas** calculadas contra a **superfície onde o item está**:

- cada superfície (fundo da página, cartão, popover/menu, dropdown, select/combobox, gaveta/sheet, diálogo, cartão de ação, seção de admin do menu) declara sua cor numa variável, por exemplo `--surface`;
- secundário, hover de itens e texto secundário passam a ser `color-mix(in oklab, var(--foreground) N%, var(--surface))` (opaco);
- as classes existentes (`bg-secondary`, `text-secondary-foreground`) continuam; muda só a definição, e os containers do Prism declaram a superfície.

Transparência continua onde ver o que está atrás é a intenção: película dos diálogos, sombras, ícones sobre imagem (`image-icon`).

### O que o estudo precisa entregar

1. **Inventário:** onde cada token transparente é usado, agrupado por superfície (qual container está por trás), com os casos de empilhamento e de fundo colorido identificados. Separar o que deve ficar transparente.
2. **Lista de superfícies** que precisariam declarar `--surface`, com o arquivo de cada uma (primitivos em `app/components/prism/`, `ActionItem`, `Header.tsx`, gaveta) e se o cartão de ação nas fases suave/viva precisa de tratamento próprio.
3. **Desenho da regra:** fórmula do secundário, do hover e do texto secundário no claro e no escuro (porcentagens atuais como ponto de partida), como herda dentro de superfícies aninhadas, e o que fazer com `foreground/NN` escrito à mão (trocar por token ou manter).
4. **Riscos:** elementos sem superfície declarada (o que herdam), desempenho/complexidade de CSS, impacto nos 11 temas e nas fases suave/viva, a inconsistência atual do secundário (`srgb` no claro, `oklch` no escuro).
5. **Demonstração** em HTML autocontido em `.scratch/design-system-audit/ds23-superficies.html`: as mesmas peças (item de menu em repouso e hover, botão secundário, texto secundário) sobre fundo da página, cartão, popover, seção colorida tipo admin e cartão de ação com fase, lado a lado **hoje (transparente) x proposta (opaca)**, claro e escuro, com o CSS real do app quando servido por `http://127.0.0.1:5176/` (como em `ds21-mapa-de-formulas.html`).
6. **Relatório** em `docs/audits/2026-11-16-ds23-surfaces-study.md`, em português simples, com as decisões que o proprietário precisa tomar e uma recomendação para cada.

### Decisões do proprietário (a preencher)

- [ ] Adotar a regra opaca por superfície?
- [ ] O que continua transparente.
- [ ] O que fazer com as transparências escritas à mão.

### Critérios de conclusão do estudo

- [x] Inventário e lista de superfícies.
- [x] Regra proposta com fórmulas claro/escuro.
- [x] Demonstração HTML funcionando no servidor local, sem erros de console.
- [x] Relatório com decisões e recomendações.
- [x] Ticket, `.scratch/README.md` e `docs/audits/CURRENT.md` atualizados.
