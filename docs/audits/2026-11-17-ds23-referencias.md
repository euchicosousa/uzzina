# Resumo em 8 linhas

1. A pergunta é como os grandes sistemas de design resolvem o cinza "secundário" e o fundo de hover quando o mesmo botão ou item aparece sobre página, cartão, menu, gaveta, cor de fase e imagem.
2. Os sistemas consultados usam, em geral, camadas ou superfícies opacas com nome próprio (Carbon, Atlassian, shadcn, e Primer em parte) para as superfícies normais. Polaris não foi verificado. Alguns também usam overlays translúcidos, mas quase sempre para estados sobre cores ou imagens (Material 3, Radix, Apple).
3. Nenhum sistema que consultei sustenta um único cinza opaco para todas as superfícies. Cada um dá ao hover um token da própria camada, ou usa transparência só onde o fundo é desconhecido.
4. O token "secundário" não é um padrão universal. Carbon usa camadas (layer-01, 02, 03) com hover próprio; Atlassian usa superfícies (default, raised, overlay, sunken) com hovered e pressed próprios; Radix usa degraus de componente (3, 4, 5). Shadcn é o caso mais parecido com o UZZINA, com `--secondary` e `--accent` opacos.
5. Transparência empilhada escurece e suja a cor, e fica invisível sobre imagem. Os próprios documentos da Apple alertam contra empilhar preenchimentos translúcidos.
6. Backdrop-filter (desfoque atrás do item) resolve imagem e texto atrás, mas não resolve o tom: a cor continua se misturando e mudando o matiz. Tem custo de desempenho e cria camada própria; não encontrei sistema que o use para hover comum.
7. Recomendação para a UZZINA: manter o modelo opaco por superfície (opção 1 ou 3), formalizado como camadas nomeadas com hover próprio (modelo tipo Carbon). Usar alpha só em superfícies de cor viva e sobre imagem, com limite de empilhamento. Não manter o "secundário" como cinza único para todos os lugares.
8. Não consegui verificar os valores exatos de Material 3, Spectrum, Primer, Atlassian (cores de hover), Apple (fills) nem Polaris, porque as páginas voltaram só com o título ou com erro. Os fatos marcados como "não verificado" abaixo precisam de conferência antes de decidir por números.

---

# Contexto do problema

O "secundário" da UZZINA serve a botões secundários, hover e foco de itens de lista e menu, placeholder de avatar e contadores. Ele precisa funcionar em:

- fundo da página;
- cartão;
- menu flutuante (popover);
- folha ou diálogo;
- cartão colorido (cor da fase);
- imagem;
- área administrativa com tom próprio.

As três abordagens em estudo:

- **Opção 1:** um cinza opaco calculado só a partir do fundo da página. Contraste fraco sobre cartão (diferença de cerca de 0,016 em L no claro).
- **Opção 2:** overlay translúcido da cor de texto a 5% e 10%. Adapta a qualquer superfície, mas empilha, suja sobre cores e some sobre imagens.
- **Opção 3:** cinza opaco recalculado por superfície, com uma variável (`--surface`) redeclarada em cada contêiner.

Hoje o app já tem `secondary` e `secondary-hover` opacos, com delta fixo de L a partir do fundo (`CURRENT.md`, linhas de DS28 e DS33). Isso é a opção 1 com a correção de delta; o estudo serve para decidir se ele deve virar camadas.

---

# Tabela comparativa

Legenda: "verificado" = li a página oficial; "parcial" = li só título, trecho ou resultado de busca; "não verificado" = não consegui ler.

| Sistema | Abordagem (opaco / alpha) | Como o hover é resolvido em item sobre camadas diferentes | Superfícies tintadas e imagens | Fonte |
|---|---|---|---|---|
| Material Design 3 | Superfícies por tonalidade (surface-container-lowest a highest, surface-variant). Estados por "state layer" translúcido. Parcial: os valores de opacidade vêm de fontes de terceiros | Overlay da cor de conteúdo sobre a própria superfície, com opacidade por estado (hover, foco, pressionado, arrastado) | Overlay acompanha a cor base do componente; sobre imagem, não verificado | https://m3.material.io/styles/color/roles (só título carregado); https://m3.material.io/foundations/interaction/states/overview (só título); https://github.com/material-components/material-web/blob/main/tokens/md-sys-color.md (404) |
| Radix Colors / Radix Themes | Escalas sólidas de 12 degraus e escalas alpha equivalentes (uma por cor, mais preto e branco) | Degraus 3 (normal), 4 (hover), 5 (pressionado/selecionado) do componente; alpha quando o componente precisa se misturar ao fundo | Alpha foi desenhado para se misturar a fundos coloridos; Radix Themes usa alpha automaticamente | https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale (verificado); https://www.radix-ui.com/colors/docs/palette-composition/scales (verificado); https://www.radix-ui.com/themes/docs/theme/color (verificado) |
| shadcn/ui | Tudo opaco no tema padrão (`--background`, `--card`, `--popover`, `--secondary`, `--muted`, `--accent`), cada um com par `-foreground` | `--accent` é o estado de hover, foco e ativo de menus e itens; `--secondary` é ação de menos destaque; `--muted` é fundo discreto | Não há regra de imagem na documentação; a superfície flutuante tem variável própria (`--popover`) | https://ui.shadcn.com/docs/theming (verificado) |
| GitHub Primer | Tokens de fundo nomeados (`bgColor-default`, `bgColor-muted`, `bgColor-inset`, `bgColor-subtle`, `overlay-bgColor`); o modo escuro troca o valor do token, não a regra de uso | Controles usam a escala neutra para repouso, hover e ativo; texto secundário só sobre fundos claros | Overlay tem token próprio; regra sobre imagem não verificada | https://primer.style/foundations/color/overview (parcial: página truncada, sem trecho de hover); https://primer.style/product/getting-started/foundations/color-system/ (404) |
| Atlassian | Superfícies opacas com níveis (sunken, default, raised, overlay), cada uma com hovered e pressed próprios. Neutro transparente (`color.background.neutral`) é separado | Default usa `elevation.surface.hovered`; raised e overlay têm variantes próprias. Não se combinam token e troca de nível | Não verificado para imagem. Pela página, sunken é opaco e escurece nos dois modos, e neutral é transparente e se adapta ao fundo | https://atlassian.design/foundations/elevation (verificado); https://atlassian.design/foundations/color-new/ (sem conteúdo) |
| Adobe Spectrum | Camadas de fundo (gray-75, gray-100, gray-200 em exemplo) opacas; tokens de estado com sufixo `-background-color-hover`; overlay translúcido por token | Token de hover com nome próprio para cada variante | Não verificado | https://spectrum.adobe.com/page/color-system (não lido); busca: https://opensource.adobe.com/spectrum-design-data/spec/taxonomy/ |
| IBM Carbon | Camadas opacas: layer-01 sobre a página, layer-02 sobre a 01, layer-03 sobre a 02. Cada camada tem base, hover, active, selected e selected-hover | Hover usa o token da própria camada onde o item está. Valores de exemplo do tema: layer-01 #f4f4f4, layer-02 #ffffff, hover #e8e8e8 | Não tratado na página. Alpha só nos tokens de `$background` | https://carbondesignsystem.com/elements/color/tokens/ (verificado); https://carbondesignsystem.com/elements/color/usage/ (verificado, sem regra de hover) |
| Apple HIG (fills) | Preenchimentos translúcidos: systemFill, secondarySystemFill, tertiarySystemFill, quaternarySystemFill. Escolha por tamanho da forma | Fills se misturam ao fundo; a própria Apple pede tamanho coerente (fino/pequeno para systemFill, grande para tertiary) | Vibrancy e materiais para controles flutuantes; sobre imagem não verificado | https://developer.apple.com/documentation/uikit/uicolor/systemfill (só título); https://developer.apple.com/documentation/uikit/uicolor/tertiarysystemfill (trecho de busca); https://developer.apple.com/design/human-interface-guidelines/materials (só título) |
| Fluent 2 (Microsoft) | Neutros de fundo (background 1 a 4), com estados que escurecem o controle em hover e mais ainda em selecionado | Hover escurece a partir do repouso; foco muda a espessura do contorno, não a cor | Não verificado (página não tinha os tokens) | https://fluent2.microsoft.design/color (parcial: sem nomes de tokens) |
| Polaris (Shopify) | Não verificado | Não verificado | Não verificado | https://polaris.shopify.com/foundations/color (redireciona para shopify.dev; a página seguinte não foi lida) |
| Chakra / Park UI | Não verificado | Não verificado | Não verificado | Não consultado nesta rodada |

---

# Seção por sistema

## Material Design 3

- **O que é relevante:** superfícies em tons (surface-container-lowest, low, container, high, highest) são uma escala de níveis, e o hover é uma camada de overlay de opacidade fixa por estado.
- **Para a UZZINA:** o modelo de níveis de superfície é parecido com a proposta de camadas. O overlay de estado é o ponto de atenção: em tese ele também sobe sobre a superfície, então é o mesmo problema de empilhar transparência, resolvido aqui por escolher a camada certa, não por misturar.
- **Verificação:** os valores de opacidade (hover 8%, foco e pressionado 12%, arraste 16%) vieram de resultados de busca e de documentação de terceiros, não da página oficial, que só carregou o título. Não usar esses números como fato sem conferir em m3.material.io.

## Radix Colors e Radix Themes

- **O que é relevante:** a regra de uso é a mais clara do conjunto. Degraus 1 e 2 para fundo, 3 a 5 para o componente (repouso, hover, pressionado), 6 a 8 para borda, 9 e 10 para sólido, 11 e 12 para texto. Cada cor tem uma versão alpha de mesma numeração.
- **Hover:** o estado de hover é um degrau a mais na mesma escala; o componente transparente pode usar o degrau 3 no hover. Isso é uma escala por cor, então o cinza muda de tom junto com a família.
- **Alpha:** foi desenhado para se misturar a fundos coloridos (página oficial). Radix Themes usa alpha automaticamente nos componentes. A página não diz se alpha é preferível em superfícies tintadas, nem qual é o cinza recomendado para secundário.
- **Para a UZZINA:** o padrão de degraus numerados com versão alpha é o caminho mais próximo da proposta de "alpha com limites". O ganho é a regra de degrau; a perda é que ele não resolve a superfície desconhecida sozinho.

## shadcn/ui

- **O que é relevante:** o tema padrão é todo opaco. `--accent` é o estado de hover e foco de menus e itens; `--muted` é fundo discreto; `--secondary` é ação de menos destaque. Nenhuma variável usa alpha no tema padrão claro (documentação oficial).
- **Como resolve o problema de superfície:** cada superfície flutuante tem seu par (`--card`, `--popover`), então o hover de um menu usa `--accent` do próprio contexto. Não há um cinza único global para todas as superfícies.
- **Para a UZZINA:** é o exemplo mais próximo do que o app já faz. A diferença é que o shadcn não tenta fazer um cinza servir a todas as superfícies; cada superfície tem a sua variável.
- **Limite:** a documentação não trata de imagem nem de cor de fase.

## GitHub Primer

- **O que é relevante:** tokens de fundo com nomes de função (default, muted, inset, subtle, overlay). Os valores mudam por modo, não a regra de uso.
- **Hover:** os controles usam a escala neutra para repouso, hover e ativo, e a regra de uso proíbe texto secundário sobre fundo de ênfase (fonte não oficial de prévia; ver limites).
- **Para a UZZINA:** a separação "fundo de página, fundo de bloco, fundo recuado" é o mesmo princípio de camadas, sem alpha no uso comum.
- **Limite:** não consegui ler os valores nem a regra sobre transparência de overlay; a página foi truncada.

## Atlassian

- **O que é relevante:** é o sistema mais útil para a discussão. Há níveis de superfície (sunken, default, raised, overlay), e cada nível tem hovered e pressed próprios. A página diz que o nível default usa `elevation.surface.hovered`, e que raised e overlay têm variantes próprias.
- **Ponto importante:** a página alerta que "sunken" e o neutro transparente parecem iguais no claro e se comportam diferente no escuro. Sunken é opaco e escurece nos dois modos; o neutro é transparente e se adapta ao fundo sobre o qual está. Ou seja, Atlassian separa explicitamente o token opaco do transparente, em vez de usar um só.
- **Para a UZZINA:** é o argumento mais forte contra o "secundário" único. Eles mantêm um token transparente para quando o fundo deve se adaptar, e um opaco por nível para o resto.
- **Limite:** não li os valores de hovered; a página de tokens não carregou.

## Adobe Spectrum

- **O que é relevante (parcial):** camadas de fundo opacas (gray-200, gray-100, gray-75 em exemplo), com estados nomeados (`-background-color-hover`). Os tokens de overlay existem (`overlay-opacity`, branco e preto transparentes), mas não encontrei a regra de quando usar.
- **Limite:** o mapeamento de camada para hover não foi lido nas páginas oficiais. Não usar os valores de cinza de terceiros.

## IBM Carbon

- **O que é relevante:** é o modelo mais estruturado do conjunto. Há quatro níveis (base, layer-01, layer-02, layer-03), cada um com seu próprio conjunto de tokens: base, hover, active, selected e selected-hover. Um item usa o hover da camada em que está.
- **Como resolve o problema:** o "layer" substitui o "secundário". O botão ou item não pergunta qual é o fundo; ele pergunta em qual camada está, e a camada tem o hover certo. O componente com envoltório `Layer` aplica os valores automaticamente até três níveis.
- **Alpha:** só aparece nos tokens de fundo transparente (`$background`), não nas camadas.
- **Para a UZZINA:** é a sugestão mais direta da opção 3, com nome e regra. A cada superfície se declara a camada (01, 02, 03), e o hover vem junto. A diferença para o `--surface` atual: o Carbon tem um conjunto fechado de camadas, não uma variável livre redeclarada por qualquer contêiner.
- **Limite da página:** não diz explicitamente que o hover de item é o da camada; isso é inferência minha a partir de "interaction colors are not counted as layer steps" e "layer sets include interactive state tokens".

## Apple HIG (preenchimentos e materiais)

- **O que é relevante:** os fills (systemFill, secondary, tertiary, quaternary) são translúcidos e escolhidos pelo tamanho da forma: fino ou pequeno, médio, grande. Não é uma escala por superfície; o próprio fill se adapta ao fundo.
- **Alerta sobre empilhamento:** um site de orientação (não é fonte da Apple) recomenda não empilhar dois preenchimentos alpha, porque a opacidade se compõe e escurece. Essa é a mesma crítica da opção 2.
- **Materiais e vibrancy:** são para elementos que flutuam sobre o conteúdo (barras, folhas), com desfoque; a página oficial de materiais não carregou.
- **Para a UZZINA:** o padrão "cor escolhida pelo tamanho da forma" é útil para chips e contadores. Não resolve o problema de cartão colorido.

## Fluent 2 (Microsoft)

- **O que é relevante (parcial):** o hover escurece o controle a partir do repouso, e o estado selecionado é mais escuro ainda. O foco é indicado pela espessura do contorno, não pela cor de fundo. Isso separa o estado do teclado do estado do mouse.
- **Limite:** os nomes de token (background 1 a 4, subtle, stroke) não estavam na página lida.

## Polaris e Chakra/Park UI

- Polaris: a página de cores redireciona para a documentação geral e não foi lida. Não há resultado verificado.
- Chakra/Park UI: não consultados nesta rodada.

---

# Backdrop-filter (desfoque atrás do item translúcido)

## O que resolve

- **Imagem atrás:** o desfoque suaviza a textura da imagem, então o texto do item deixa de disputar com detalhes. Esse é o principal ganho.
- **Texto atrás:** o texto de outra camada fica borrado, o que reduz o ruído visual.
- Fonte: a documentação do MDN descreve o efeito como aplicado à área atrás do elemento, e o artigo do web.dev descreve o uso em translucidez de cabeçalho e menu (ver fontes abaixo).

## O que não resolve

- **Mistura de cor:** o fundo translúcido continua somando sua cor ao que está atrás. Num cartão colorido de fase, o tom muda, e não há correção de contraste.
- **Mudança de matiz:** em cor semântica (erro, sucesso), a mistura desloca o matiz. O desfoque não corrige isso.
- **Empilhamento:** dois itens translúcidos um sobre o outro continuam se somando; o desfoque só age sobre o que está atrás do item de cima.
- **Contraste:** nenhum ganho garantido de contraste; é preciso medir.

## Custo

- **Desempenho:** o web.dev alerta que a propriedade pode prejudicar o desempenho e pede teste antes de publicar. Num menu que abre e fecha muito, o custo se repete.
- **Camada própria:** qualquer valor diferente de `none` cria um novo contexto de empilhamento (web.dev). Isso pode mudar a ordem de sobreposição de popovers e de elementos com `z-index`.
- **Ancestral que vira raiz de fundo:** o MDN indica que um ancestral com `opacity` abaixo de 1, `filter`, `mask`, `clip-path`, `mix-blend-mode` ou outro `backdrop-filter` faz o desfoque olhar só o conteúdo entre ele e o filho. Quando o pai já tem opacidade, o desfoque do item pode parecer não fazer nada. Isso é um risco concreto para a gaveta e para contêineres com transparência.
- **Rolagem e itens inline:** nem o MDN nem o web.dev dão regra sobre listas com rolagem. Por lógica, um item dentro de contêiner rolável é repintado a cada quadro, o que custa mais. Não verificado como medição.
- **Compatibilidade:** o web.dev lista Chrome 76, Edge 79, Firefox 103 e Safari 18. O MDN diz "Baseline 2024". Não verifiquei se Safari anterior exige prefixo `-webkit-`; deve haver fallback com `@supports (backdrop-filter: none)`, como o web.dev recomenda, e imagem pré-desfocada no lugar.

## Quem usa para hover

- Não encontrei, nas páginas dos sistemas consultados, uso de backdrop-filter em hover de item comum. O uso documentado é em cabeçalhos, painéis flutuantes e folhas (padrão de material da Apple e de translucidez em geral). Não é afirmação verificada de que ninguém usa; é que não apareceu nas fontes lidas.

## Avaliação para a UZZINA

- Pode ajudar em um caso pontual: item de hover sobre imagem (miniatura, carrossel). Mesmo aí, o ganho é só sobre a imagem; a cor de fase não muda.
- Não recomendo como base do hover de menus e listas: custo, camada extra, risco com a gaveta (que tem fundo transparente) e falta de exemplo em sistema grande.

---

# Recomendação para a UZZINA

Entre as quatro opções pedidas:

1. **Manter o cinza opaco por superfície (opção 3), mas formalizado como camadas nomeadas** (modelo tipo Carbon): cada contêiner declara sua camada (página, cartão, flutuante, sobre cor), e cada camada tem seu próprio `secondary`, `secondary-hover` e `pressed`, todos opacos. É a abordagem que mais sistemas grandes usam para a superfície normal, e evita o problema de contraste da opção 1.
2. **Alpha só com limites:** usar overlay translúcido apenas em superfícies de cor viva (cor de fase) e sobre imagem, onde não se sabe a cor de fundo. Vetar empilhamento (sem alpha dentro de alpha). Isso segue o padrão de Radix e da Apple.
3. **Descartar o "secundário" único:** não manter um cinza para tudo. Trocar por nomes de função: fundo de ação secundária, fundo de hover de item, fundo discreto. Atlassian e Carbon mostram que o nome muda com o nível.
4. **Não usar backdrop-filter em hover comum.** Usar só em miniatura ou imagem, se o problema aparecer no teste.

Ordem sugerida: manter o opaco por camada (1), com alpha limitado a cor viva e imagem (2). O nome "secundário" pode continuar como alias, mas não como cinza único.

Decisão que cabe ao proprietário: aceitar o modelo de camadas (muda nomes e exige declarar a camada em cada contêiner), ou manter o `--surface` redeclarado (mais simples, mas sem regra fixa para novos contêineres).

Não propus `text-soft` nem `border-container`, conforme a orientação.

---

# Limites e incertezas

- **Material Design 3:** as páginas oficiais de roles e de states voltaram só com o título. Os valores de opacidade (8%, 12%, 16%) vieram de resultados de busca e de documentação de terceiros. Não verificados na fonte oficial.
- **Radix:** as páginas de escalas e de composição foram lidas. A página de alpha específica não carregou. A afirmação sobre "degrau 3 no hover de transparente" vem da página de composição (verificada).
- **shadcn/ui:** verificado para o tema padrão. Não li a documentação de componentes; a afirmação sobre `--accent` no hover vem da página de tema, que a descreve como estado de hover e foco.
- **GitHub Primer:** a página de cores foi truncada; os valores exatos de canvas, inset, subtle, overlay não foram lidos. Uma prévia de documentação (não oficial) traz a regra de texto secundário; não usei como base.
- **Atlassian:** a página de elevação foi lida e é a fonte mais útil do conjunto. Os valores de hovered não foram lidos.
- **Adobe Spectrum:** só resultado de busca e uma tabela de terceiros; os valores de cinza não foram usados.
- **IBM Carbon:** a página de tokens foi lida e traz valores de exemplo. A regra de que o hover do item é o da própria camada é inferência, não texto da página.
- **Apple HIG:** a página de cores carregou só o título. A descrição dos fills vem de resultado de busca e do conhecimento geral; a página de materiais também não carregou. A regra de empilhamento vem de site de terceiros, não da Apple.
- **Fluent 2:** a página carregou parcialmente, sem nomes de token.
- **Polaris:** redirecionamento e erro 403; não lido.
- **Chakra / Park UI:** não consultados.
- **Backdrop-filter:** MDN e web.dev lidos. Não há medição de desempenho nesta rodada, e o comportamento com rolagem não tem fonte oficial.
- **Páginas com falha:** m3.material.io (roles, states), radix-ui docs de alpha (404 em uma variante), primer.style/product (404), github material-web (404), polaris (redirecionado), developer.apple.com/materials (título), atlassian color-new (vazia), fluent2 (parcial).

Nenhum arquivo do app foi alterado. Este documento é o único arquivo criado nesta tarefa, sem commit.

---

# Fontes lidas

- https://ui.shadcn.com/docs/theming
- https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- https://www.radix-ui.com/colors/docs/palette-composition/scales
- https://www.radix-ui.com/colors/docs/palette-composition/composing-a-ui (404)
- https://www.radix-ui.com/themes/docs/theme/color
- https://carbondesignsystem.com/elements/color/tokens/
- https://carbondesignsystem.com/elements/color/usage/
- https://atlassian.design/foundations/elevation
- https://fluent2.microsoft.design/color
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- https://web.dev/articles/backdrop-filter
- https://primer.style/foundations/color/overview (truncada)
- https://www.designsystemscollective.com/from-color-shades-to-state-layers-cefe2f28bf97 (403)
- Resultados de busca (não lidos integralmente): Material 3 states, Radix alpha, Spectrum tokens, Atlassian hovered, Apple fills, Primer primitives
