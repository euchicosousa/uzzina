# DS24: cor pai e neutros derivados por fórmula

Data: 16/11/2026. Tipo: estudo (somente relatório). Nenhum arquivo do app foi alterado.

## O que é o ticket, em palavras simples

O ticket DS24 trata das cores de fundo e dos cinzas do app: o fundo da página, o fundo dos cartões, dos menus flutuantes (popover), dos campos de texto, das bordas e dos botões secundários. Hoje cada tema (Ônix, Carbono, Rubi e outros) guarda uma lista de cores e deltas. A proposta do proprietário é guardar só a cor do fundo de cada tema e calcular todos os cinzas por uma fórmula, escrita uma vez, que vale para todos os temas.

Onde ver a proposta: o laboratório `.scratch/design-system-audit/ds24-cor-pai-neutros.html` (arquivo local, não o app). Os valores exportados pelo proprietário estão em `.scratch/design-system-audit/ds24-valores-do-proprietario.css`.

Método: os cálculos foram feitos em script (conversão OKLCH para sRGB, contraste WCAG 2.x). A conta bate exatamente com a tabela de resultado do próprio laboratório para os quatro fundos de pai (Ônix claro e escuro, Carbono claro e escuro). Limite: não testei as fórmulas CSS no navegador. Assumi que o navegador limita a luminosidade entre 0 e 1, como o laboratório faz.

## 1. Como as paletas guardam as cores hoje

Arquivos: `app/lib/palettes.ts` (valores por tema), `app/lib/palette-vars.ts` (escreve os valores como variáveis no elemento raiz), `app/tailwind.css` (blocos `:root` e `.dark`).

**O que cada um dos 11 temas define hoje, em claro e escuro:**

- `bg`: a cor de fundo (única cor neutra "de verdade").
- `fg`: a cor do texto principal. Ela é definida à mão em todos os temas (quase sempre preto no claro e branco no escuro; o Coral escuro tem texto levemente verde).
- Seis deltas de luminosidade: `cardLDelta`, `borderLDelta`, `inputLDelta`, `actionLDelta`, `actionHoverLDelta`, `popoverLDelta`. Cada tema tem o seu, e eles variam bastante entre temas.
- Primária (`primary`, `primaryFg`), anel de foco (`ring`), cor e opacidade da sombra, cor da borda superior e o relevo (`relief`). Essas não são neutros e não entram na proposta.

**O que o CSS calcula a partir disso hoje:**

- Derivados por delta: cartão (`card`), popover, borda, campo (`input`), ação (`action`) e ação em hover (`action-hover`).
- Derivados por transparência do texto: secundário (`secondary`, 5% no claro e 10% no escuro) e texto secundário (65%).
- Não existem como token hoje: `text-soft` e `secondary-hover`. O texto suave é feito com `text-foreground/40`, usado em 12 arquivos (placeholders e menus). A borda de container é feita com `border-foreground/5` (claro) e `/10` (escuro), em popover, menu, combobox, tooltip, diálogo e painel lateral.

**Problemas que já aparecem no código atual:**

- Laranja (Coral) claro tem `actionHoverLDelta = 1`. Na prática o hover vira branco puro. Não é intencional: parece um valor de teste.
- Cada tema tem deltas diferentes (por exemplo, a borda do Violeta claro é -0,10, a do Carbono claro é -0,04 e a dos outros temas claros fica entre -0,05 e -0,07). A proposta acaba com essa variação, o que muda a aparência de quase todos os temas.

## 2. Os 12 tokens do laboratório, nos quatro fundos de pai

Legenda: L é a luminosidade OKLCH. Hex é a cor que o navegador mostra. "(clamp)" indica que o valor calculado saiu de 0 a 1 e foi limitado.

### Claro

| Token | Delta | Ônix claro (fundo L 0,960, #f0f2f2) | Carbono claro (fundo L 1,000, #ffffff) |
|---|---|---|---|
| Texto principal | -0,96 | L 0,000, #000000 | L 0,040, #000000 |
| Texto secundário | -0,60 | L 0,360, #3c3d3d | L 0,400, #484848 |
| Texto suave | -0,40 | L 0,560, #737575 | L 0,600, #808080 |
| Cartão | -0,02 | L 0,940, #eaebec | L 0,980, #f8f8f8 |
| Popover | +0,02 | L 0,980, #f7f9f9 | L 1,020 (clamp 1,000), #ffffff |
| Campo | -0,04 | L 0,920, #e3e5e5 | L 0,960, #f2f2f2 |
| Borda | -0,07 | L 0,890, #d9dbdb | L 0,930, #e8e8e8 |
| Borda de container | -0,036 | L 0,924, #e4e6e6 | L 0,964, #f3f3f3 |
| Ação | +0,02 | L 0,980, #f7f9f9 | L 1,020 (clamp 1,000), #ffffff |
| Ação (hover) | +0,10 | L 1,060 (clamp 1,000), #feffff | L 1,100 (clamp 1,000), #ffffff |
| Secundário | -0,036 | L 0,924, #e4e6e6 | L 0,964, #f3f3f3 |
| Secundário (hover) | -0,083 | L 0,877, #d5d7d7 | L 0,917, #e3e3e3 |

### Escuro

| Token | Delta | Ônix escuro (fundo L 0,200, #13161a) | Carbono escuro (fundo L 0,250, #1b2328) |
|---|---|---|---|
| Texto principal | +0,80 | L 1,000, #faffff | L 1,050 (clamp 1,000), #f7ffff |
| Texto secundário | +0,50 | L 0,700, #9a9fa5 | L 0,750, #a6afb7 |
| Texto suave | +0,30 | L 0,500, #5f6469 | L 0,550, #6a737a |
| Cartão | +0,05 | L 0,250, #1e2226 | L 0,300, #272f35 |
| Popover | -0,03 | L 0,170, #0c1014 | L 0,220, #141c21 |
| Campo | -0,08 | L 0,120, #040609 | L 0,170, #091015 |
| Borda | +0,10 | L 0,300, #2a2e33 | L 0,350, #343c42 |
| Borda de container | +0,10 | L 0,300, #2a2e33 | L 0,350, #343c42 |
| Ação | +0,10 | L 0,300, #2a2e33 | L 0,350, #343c42 |
| Ação (hover) | +0,20 | L 0,400, #44484d | L 0,450, #4e575d |
| Secundário | +0,10 | L 0,300, #2a2e33 | L 0,350, #343c42 |
| Secundário (hover) | +0,20 | L 0,400, #44484d | L 0,450, #4e575d |

### Contraste (WCAG) dos textos

Texto principal e texto secundário precisam de 4,5:1 (texto normal). Texto suave é usado como placeholder e ícone apagado; uso 3:1 como referência.

| Par | Sobre fundo | Sobre cartão | Sobre popover | Sobre secundário | Sobre campo |
|---|---|---|---|---|---|
| Ônix claro: principal | 18,7 | 17,6 | 19,8 | 16,8 | |
| Ônix claro: secundário | 9,7 | 9,1 | 10,3 | 8,7 | |
| Ônix claro: suave | 4,1 | 3,9 | 4,4 | 3,7 | 3,7 |
| Carbono claro: principal | 21,0 | 19,8 | 21,0 | 18,9 | |
| Carbono claro: secundário | 9,2 | 8,7 | 9,2 | 8,3 | |
| Carbono claro: suave | 4,0 | 3,7 | 4,0 | 3,6 | 3,5 |
| Ônix escuro: principal | 17,9 | 15,9 | 19,0 | 13,5 | |
| Ônix escuro: secundário | 6,8 | 6,0 | 7,2 | 5,1 | |
| Ônix escuro: suave | 3,0 | 2,7 | 3,2 | **2,3** | 3,4 |
| Carbono escuro: principal | 15,7 | 13,4 | 17,0 | 11,1 | |
| Carbono escuro: secundário | 7,2 | 6,1 | 7,8 | 5,1 | |
| Carbono escuro: suave | 3,3 | **2,8** | 3,6 | **2,3** | 4,0 |

Leitura: todos os textos principais e secundários passam. O texto suave escuro falha 3:1 em cartão e secundário (2,3 a 2,8). O texto suave claro passa, no limite (3,5 a 4,4).

### O que está idêntico ou no limite

- **Ônix claro:** popover e ação têm a mesma cor (#f7f9f9). Borda de container e secundário têm a mesma cor (#e4e6e6).
- **Carbono claro:** popover, ação e ação em hover ficam todos em #ffffff, igual ao fundo. Como o tema é plano (sem sombra e sem relevo), o cartão de ação **some sobre a página branca** e o hover não aparece. Hoje o Carbono usa ação em -0,02 (#f8f8f8) e hover em -0,005; a mudança é real e visível.
- **Ônix escuro e Carbono escuro:** borda, borda de container, ação e secundário são **a mesma cor** (0,300 e 0,350). Ação em hover e secundário em hover também são iguais (0,400 e 0,450). Um cartão com borda e fundo da mesma cor não mostra a borda. Como o secundário e a ação ficam iguais, botões secundários e cartões de ação viram a mesma superfície.

### Clamp (valor fora de 0 a 1)

- Ônix claro: ação em hover (1,06).
- Carbono claro: popover (1,02), ação (1,02) e ação em hover (1,10).
- Ônix claro e Carbono claro: texto principal fica preto puro (L 0 ou 0,04 sem diferença visível).
- Carbono escuro: texto principal passa de 1,05 e vira branco com um toque de azul.

### Texto principal com croma do fundo

O delta de croma é zero, mas o croma do fundo continua valendo. Por isso o texto escuro fica levemente azulado: #faffff (Ônix) e #f7ffff (Carbono). É um tom discreto, mas visível ao lado de um branco puro, e vai aparecer em todo texto escuro. Recomendação: o texto (principal, secundário e suave) deve ter croma zero na fórmula. Os cartões e superfícies podem manter o tom do fundo.

### Escuro: campo -0,08 e popover -0,03

- **Campo mais escuro que a página (-0,08):** coerente com a ideia de campo afundado. Hoje quase todos os temas escuros usam +0,02 no campo, então é uma mudança visível.
- **Popover mais escuro que a página (-0,03), com cartão em +0,05:** inverte a hierarquia usual de escuro (camadas flutuantes costumam ser mais claras). É herança do que já existe hoje (quase todos os temas escuros têm popover -0,03). Não é um erro da proposta, mas vale decidir de propósito.

## 3. Os 11 temas reais

Apliquei as mesmas fórmulas ao fundo real de cada tema em `palettes.ts`. Só listo os problemas.

**Claro**

| Tema (fundo) | Problemas |
|---|---|
| Ônix (#f0f2f2) | Ação em hover estoura (clamp). Popover e ação iguais (#f7f9f9). Borda de container igual ao secundário. |
| Carbono (#ffffff) | Popover, ação e ação em hover iguais ao fundo branco. Cartão de ação some (tema plano, sem sombra). Hover invisível. Ação de hoje (-0,02) muda para branco. |
| Rubi (#f8f8f8) | Ação em hover estoura. Popover, ação e hover iguais (#ffffff). |
| Coral (#ecf0e9) | Texto principal com L -0,01 (clamp, fica preto). Ação em hover estoura. Popover igual à ação. Borda de container igual ao secundário. |
| Damasco (#f8f8f8) | Ação em hover estoura. Popover, ação e hover iguais (#ffffff). |
| Elétrico (#eff2f4) | Ação em hover estoura. Popover igual à ação. |
| Folha (#f8f8f8) | Igual ao Damasco. |
| Turquesa (#f2f2f2) | Ação em hover estoura. Popover igual à ação. |
| Cobalto (#ffffff) | Igual ao Carbono: popover, ação e hover iguais ao fundo branco. Tema plano, cartão de ação some. |
| Violeta (#ffffff) | Popover, ação e hover iguais (#ffffff). Tem sombra, então o cartão ainda se separa pela sombra, mas sem preenchimento. |
| Fúcsia (#fff4ff) | Ação em hover estoura. Popover, ação e hover iguais. Fundo com croma 0,02: os cinzas ficam levemente rosados. |

**Escuro**

| Tema (fundo) | Problemas |
|---|---|
| Ônix (#13161a) | Texto suave 2,3 sobre secundário (abaixo de 3). Borda, borda de container, ação e secundário iguais. |
| Carbono (#1b2328) | Texto principal estoura (clamp, azulado). Texto suave 2,3 sobre secundário. Borda, ação e secundário iguais. |
| Rubi (#09090b) | Texto suave 2,1 sobre secundário. Borda, ação e secundário iguais. |
| Coral (#1c2323) | Texto principal estoura (clamp). Texto suave 2,3. Borda, ação e secundário iguais. |
| Damasco (#09090b) | Igual ao Rubi. |
| Elétrico (#13161a) | Igual ao Ônix. |
| Folha (#09090b) | Igual ao Rubi. |
| Turquesa (#09090b) | Igual ao Rubi. |
| Cobalto (#09090b) | Igual ao Rubi. |
| Violeta (#09090b) | Igual ao Rubi. |
| Fúcsia (#4c133d) | Texto principal estoura (1,10). Texto suave 2,3. Fundo com croma 0,10: todos os cinzas ficam fortemente roxos. É o caso mais forte de tinta. |

**Padrão geral:** o problema do escuro vem do fundo `#09090b` (L 0,141) usado por seis temas. Com +0,30 o texto suave cai para 2,1. O problema do claro é o clamp: em quase todo tema claro a ação em hover é branco puro. Carbono e Cobalto são os mais afetados, porque são temas planos e ficam sem separação entre cartão e página.

## 4. Texto suave e borda de container: transparência ou delta opaco?

### Texto suave

Medi o texto suave nos dois jeitos, sobre o campo (placeholder), que é onde ele mais aparece:

| Abordagem | Claro (menor contraste, 11 temas) | Escuro (menor contraste, 11 temas) |
|---|---|---|
| Transparência 40% (hoje) | 2,75 a 2,81 (falha 3:1 em todos) | 2,91 a 3,67 (falha só no Fúcsia) |
| Delta opaco do laboratório (-0,40 / +0,30) | 3,51 a 3,71 (passa) | 2,12 a 2,34 (falha em todos os temas de fundo 0,141) |
| **Transparência 50%** | **3,76** (passa) | **3,69** (passa) |

Conclusão: nenhum dos dois funciona bem nos dois modos. A transparência é ruim no claro; o delta opaco é ruim no escuro. Uma transparência de 50% passa nos dois modos, em todos os 11 temas, com um único valor. Como o texto suave é uma cor de texto (que fica mais clara ou mais escura conforme a superfície), a transparência também se ajusta sozinha quando muda o campo, o fundo ou o tema.

**Recomendação:** manter texto suave como transparência de 50% do texto principal (`oklch(from var(--foreground) l c h / 0.5)`). Continua sendo uma fórmula, só que sobre o texto principal, e vale para os dois modos.

### Borda de container

- Hoje: 5% do texto principal no claro e 10% no escuro.
- O laboratório: delta opaco (-0,036 no claro, +0,10 no escuro).
- Correção de premissa: nos menus flutuantes (popover, dropdown, select, tooltip, diálogo), a cor de fundo pinta também por baixo da borda. Então a borda translúcida cai sobre a cor do próprio popover, não sobre a página. Só o painel lateral (Sheet) usa `bg-clip-padding` e deixa a borda sobre a página.
- Resultado: a transparência de 5% dá #ebecec sobre o popover do Ônix claro, contra #e4e6e6 do delta. Os dois são bordas de 1 a 2 tons, quase invisíveis pelo contraste (1,1 a 1,3). Ou seja, em termos visuais dão quase o mesmo resultado.
- O delta opaco tem um problema claro: no escuro fica igual ao secundário em todos os temas. A transparência não tem esse problema, porque sempre fica um tom acima ou abaixo da superfície onde está.

**Recomendação:** manter borda de container como transparência (`oklch(from var(--foreground) l c h / 0.05)` no claro e `/ 0.10` no escuro). É uma fórmula, se ajusta a qualquer superfície (inclusive o Sheet, sobre a página) e evita a igualdade com o secundário.

## 5. Como ficaria

### O que vai para `palettes.ts`

Por modo (claro e escuro), só:

- `bg`: a cor de fundo (única cor neutra).
- Mantém: `primary`, `primaryFg`, `ring`, `shadowColor`, `shadowOpacity`, `topBorderColor`, `relief`. Primária e anel não são derivados do fundo e continuam por tema.
- Sai: `fg` e os seis deltas (`cardLDelta`, `borderLDelta`, `inputLDelta`, `actionLDelta`, `actionHoverLDelta`, `popoverLDelta`).
- Exceção possível (decisão D1): um `actionLDelta` só para temas sem relevo (Carbono e Cobalto). Ver seção 6.

Em `palette-vars.ts`, saem as linhas que escrevem `--foreground-override`, `--dark-foreground-override` e os `--*-l-delta`. Ficam `--background-override` e `--dark-background-override`.

### Bloco de fórmulas em `app/tailwind.css` (uma vez, para todos os temas)

```css
:root,
[data-theme-preview="light"] {
  --background: var(--background-override, oklch(1 0 0));

  /* Textos: croma zero, para não tingir o branco ou o preto */
  --foreground: oklch(from var(--background) clamp(0, calc(l - 0.96), 1) 0 h);
  --secondary-foreground: oklch(from var(--background) clamp(0, calc(l - 0.60), 1) 0 h);
  --text-soft: oklch(from var(--foreground) l c h / 0.5);

  /* Superfícies: delta de luminosidade, com o croma do fundo */
  --card: oklch(from var(--background) clamp(0, calc(l - 0.02), 1) c h);
  --popover: oklch(from var(--background) clamp(0, calc(l + 0.02), 1) c h);
  --input: oklch(from var(--background) clamp(0, calc(l - 0.04), 1) c h);
  --border: oklch(from var(--background) clamp(0, calc(l - 0.07), 1) c h);
  --action: oklch(from var(--background) clamp(0, calc(l + var(--action-l-delta, 0.02)), 1) c h);
  --action-hover: oklch(from var(--background) clamp(0, calc(l + 0.10), 1) c h);
  --secondary: oklch(from var(--background) clamp(0, calc(l - 0.036), 1) c h);
  --secondary-hover: oklch(from var(--background) clamp(0, calc(l - 0.083), 1) c h);

  /* Borda de container: transparência do texto, para se ajustar à superfície */
  --border-container: oklch(from var(--foreground) l c h / 0.05);
}

.dark,
:root[class~="dark"] {
  --background: var(--dark-background-override, oklch(0.4 0.01 285.823));

  --foreground: oklch(from var(--background) clamp(0, calc(l + 0.80), 1) 0 h);
  --secondary-foreground: oklch(from var(--background) clamp(0, calc(l + 0.50), 1) 0 h);
  --text-soft: oklch(from var(--foreground) l c h / 0.5);

  --card: oklch(from var(--background) clamp(0, calc(l + 0.05), 1) c h);
  --popover: oklch(from var(--background) clamp(0, calc(l - 0.03), 1) c h);
  --input: oklch(from var(--background) clamp(0, calc(l - 0.08), 1) c h);
  --border: oklch(from var(--background) clamp(0, calc(l + 0.10), 1) c h);
  --action: oklch(from var(--background) clamp(0, calc(l + 0.10), 1) c h);
  --action-hover: oklch(from var(--background) clamp(0, calc(l + 0.20), 1) c h);
  --secondary: oklch(from var(--background) clamp(0, calc(l + 0.10), 1) c h);
  --secondary-hover: oklch(from var(--background) clamp(0, calc(l + 0.20), 1) c h);

  --border-container: oklch(from var(--foreground) l c h / 0.10);
}
```

Notas:

- `clamp(0, ..., 1)` é explícito, para não depender do navegador limitar a luminosidade.
- Os `--*-l-delta` deixam de existir. Os 12 arquivos com `text-foreground/40` passam a usar o token de texto suave (novo, a ser exposto como cor de Tailwind).
- O `--action-l-delta` com valor padrão 0,02 só é escrito por `palettes.ts` nos temas planos, se a decisão D1 for a exceção.

### Exceções por tema

- **Carbono e Cobalto (temas planos, claro):** sem exceção, o cartão de ação fica branco sobre branco. Com a exceção de -0,02 (Carbono) e -0,03 (Cobalto), que é o que eles têm hoje, a separação continua.
- **Seis temas com fundo #09090b no escuro:** não precisam de exceção se o texto suave for transparência de 50%. Se for mantido o delta opaco, precisariam de +0,39 (mínimo que passa 3:1 em todos).
- **Fúcsia:** fundo com croma alto (0,10 no escuro). Os cinzas herdam esse croma e ficam roxos. Precisa de decisão separada (D6).
- Nenhum tema precisa de fórmula própria para texto, cartão, popover, campo, borda ou secundário.

### Pontos fora do escopo a verificar antes de mexer

- A área de cores de tema em Admin (`app/routes/app/admin/themes.tsx` e `app/components/features/admin/`, ambos sem commit, DS21) edita deltas por tema. Se os deltas viram fórmula fixa, esse editor perde sentido e precisa ser revisto.
- O tema Personalizado (`app/lib/custom-theme.ts`) não foi verificado nesta análise.

## 6. Decisões do proprietário

**D1. Cartão de ação nos temas planos claros (Carbono e Cobalto).**
- Sem exceção: o cartão fica igual à página branca, e o hover não aparece.
- Com exceção: uma variável `--action-l-delta` só para esses dois temas, com os valores de hoje.
- **Recomendação:** exceção pequena (uma variável, dois temas). Sem ela, os cartões desses temas somem.

**D2. Texto suave.**
- Transparência 50% (passa 3:1 nos 11 temas, nos dois modos).
- Delta opaco do laboratório (falha no escuro).
- **Recomendação:** transparência 50%. Um valor só, funciona nos dois modos.

**D3. Borda de container.**
- Transparência 5% (claro) e 10% (escuro), como hoje.
- Delta opaco do laboratório (fica igual ao secundário no escuro).
- **Recomendação:** manter transparência. É fórmula sobre o texto, se adapta à superfície e não se confunde com o secundário.

**D4. Croma dos textos.**
- Manter o croma do fundo: texto escuro #faffff e #f7ffff (levemente azulado).
- Croma zero nos textos: branco e preto neutros.
- **Recomendação:** croma zero para textos. Superfícies continuam com o tom do fundo.

**D5. Popover mais escuro que a página no escuro (-0,03).**
- Manter: é o que quase todos os temas escuros já têm.
- Mudar para algo mais claro que o fundo (por exemplo +0,05, igual ao cartão): mais coerente com a hierarquia de elevação, mas é uma mudança visual ampla.
- **Recomendação:** manter por enquanto e tratar em separado, depois de ver a proposta no app.

**D6. Fúcsia e fundos com croma alto.**
- Deixar os cinzas herdarem o croma do fundo (ficam fortemente rosados ou roxos).
- Reduzir o croma dos cinzas (por exemplo, multiplicar `c` por 0,3 nas superfícies) para todos os temas.
- **Recomendação:** reduzir o croma das superfícies do Fúcsia, ou do próprio fundo do Fúcsia. Decisão de paleta, não da fórmula.

**D7. Campo mais escuro que a página no escuro (-0,08).**
- É uma mudança visível: hoje quase todos os temas escuros usam +0,02 no campo.
- **Recomendação:** aceitar se o laboratório já foi aprovado visualmente, porque é o que o proprietário escolheu no teste.

## Resumo para decisão

Antes de aplicar: o laboratório aprovado tem três pontos que mudam a aparência de temas inteiros (cartão de Carbono e Cobalto, texto suave no escuro e borda igual ao secundário). Recomendo aplicar a proposta com D1 a D4 decididas como acima, e tratar D5 a D7 depois de ver no app.

Nada foi alterado no app. Não rodei o dev server nem testei as fórmulas no navegador. A verificação visual fica com o proprietário, conforme a regra do projeto.

## Decisões do proprietário (16/11/2026)

O proprietário validou os neutros **exatamente como exportados do laboratório** (`.scratch/design-system-audit/ds24-valores-do-proprietario.css`), e as recomendações D1 a D7 acima ficam **recusadas**:

- **Sem exceções por tema.** A fórmula serve para simplificar o cálculo; os valores de cada tema são escolha dele. Se um tema tiver cartão, popover ou cartão de ação totalmente brancos como o fundo, é intencional (no Cobalto, por exemplo, o relevo e a sombra separam o cartão de ação). Quando quiser separar, ele usa um delta negativo.
- **Cada tema tem seu caráter.** Fundos mais claros, mais escuros ou todo brancos; popover mais claro ou mais escuro que a página, decidido pela cor do tema. Paleta guarda o fundo (cor pai) e os deltas.
- **Croma herdado do fundo fica.** No Fúcsia os cinzas ficam roxos de propósito. O texto levemente tingido também fica.
- **Texto suave e borda de container:** ficam como **transparência derivada do texto principal** (`--foreground`, que já é derivado do pai), e não como delta. Decisão do proprietário em 16/11; a porcentagem de cada um segue os valores de hoje até ele ajustar (texto suave 40%; borda 5% no claro e 10% no escuro).
- Próximo passo: cores não neutras (semânticas e demais), começando por um laboratório em HTML. A primária não muda.
