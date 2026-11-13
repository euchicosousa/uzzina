# DS14 — Aplicar a sombra da paleta às superfícies elevadas

**Status.** ENCERRADO com aceite do proprietário em 12/11/2026. Valores por paleta aprovados, implementados na `main` local e aplicados no banco de produção (migração `20261112120000`). Falta apenas a publicação (push). Histórico anterior abaixo.

**Dependência.** O inventário pode começar. Para decidir e autorizar a implementação, apresentar a comparação visual na [bancada de temas](13-theme-test-lab.md) ou em uma demonstração isolada equivalente com os componentes e estilos reais do app.

## O que a pessoa vê

Abra o menu do usuário no cabeçalho, a busca global (`Cmd+K`) ou um diálogo. Hoje, essas superfícies usam sombras neutras mesmo quando a paleta tem uma cor de sombra própria, como o magenta do Fúcsia. A proposta é que essas sombras usem a cor da paleta ativa. Ônix e as demais paletas sem uma cor de sombra definida usariam preto neutro como padrão, sujeito a aceite na comparação.

## Escopo proposto

| Onde conferir                                                  | O que entra na comparação                                                                                                                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu do cabeçalho, submenu, popover e seletores                | `DropdownMenuContent`, `DropdownMenuSubContent`, `PrismPopover`, Select e Combobox.                                                                                                                                   |
| Busca global, caixas de diálogo e painéis laterais             | A superfície elevada de `PrismDialog` e `Sheet`. A busca já reutiliza o diálogo.                                                                                                                                      |
| Barra flutuante de navegação, editor e avisos                  | `AppBar`, menu que aparece ao selecionar texto no editor e aviso padrão do Sonner.                                                                                                                                    |
| Cartões de Hoje e da Administração, botões e seletor de avatar | Inventariar sombras de elevação em repouso e ao passar o mouse. Cartões já usam a cor da paleta. Preservar suas intensidades, o estilo plano e os estados existentes. No seletor de avatar, conferir repouso e hover. |
| Demais ocorrências de sombra                                   | Classificar amostras de cor, controles deslizantes e outras ocorrências encontradas como elevação ou efeito funcional. Registrar o que entra e o motivo das exceções.                                                 |

A proposta preserva os anéis de foco e seleção, o fundo escurecido atrás de diálogos e painéis e as sombras usadas para dar legibilidade a texto sobre mídia. Preservar também a geometria de cada elevação, como deslocamento, desfoque, número de camadas e tamanho da sombra. Os avisos de sucesso, erro, atenção e informação hoje têm sombras próprias. Confirmar se preservam esse tratamento antes de alterar o Sonner.

## Cor da paleta, relevo e tema Personalizado

- A fonte da cor continua sendo `shadowColor`, com a precedência atual da cor específica de claro ou escuro quando existir. A proposta é resolver a ausência de valor com preto neutro (`oklch(0 0 0)`), inclusive no escuro. `foreground` é a cor de texto do modo ativo e pode ser clara no escuro. Manter compatibilidade com paletas e temas salvos que omitem `shadowColor`.
- A cor de sombra global precisa existir independentemente de **Relevo dos cartões de ação**. Hoje, desligar o relevo também remove as variáveis de cor dos cartões em `applyPaletteVars`. Na proposta, o estilo plano continua controlando apenas o acabamento dos cartões e os menus e diálogos mantêm a elevação. Conferir que ligar ou desligar o relevo preserva foco e seleção dos cartões.
- Em **Minha Conta → Aparência → Personalizado**, decidir se **Sombra e contorno base** passa a ajustar a cor de sombra do tema inteiro, com rótulo e prévia condizentes, ou se mantém o alcance atual nos cartões. Demonstrar a opção recomendada com relevo ligado e desligado. Se o controle passar a ser global, conferir prévia, salvar, recarregar e restaurar a cor padrão, incluindo tema salvo antes da mudança.
- Comparar **15% no claro e 80% no escuro** como ponto de partida para as superfícies flutuantes. A aprovação deve considerar a sombra renderizada em cada modo e confirmar os valores a aplicar. O piloto de fundo de itens do menu é uma validação separada.

## Primeira entrega para revisão

1. Entregar um inventário por componente ou família com tela, sombra atual, finalidade, proposta e exceções. Começar por [`app/components/prism/`](../../../app/components/prism/), [`AppBar`](../../../app/components/layout/AppBar.tsx), [`RichTextEditor`](../../../app/components/features/RichTextEditor.tsx), [`UAvatarSelector`](../../../app/components/uzzina/UAvatarSelector.tsx), [`palettes.ts`](../../../app/lib/palettes.ts), [`palette-vars.ts`](../../../app/lib/palette-vars.ts) e [`tailwind.css`](../../../app/tailwind.css).
2. Mostrar lado a lado a sombra atual e a proposta no menu do cabeçalho, na busca global e em um diálogo. Conferir claro e escuro em Fúcsia, Ônix, uma paleta plana como Carbono e um tema Personalizado com cor própria e relevo desligado. A [bancada atual](../estudo-cores-superficies.html) mostra 11 opções, mas tem seis configurações próprias e usa sombras neutras nas amostras. Se reaproveitada, usar os valores reais das 11 paletas e renderizar a sombra proposta. A comparação também pode ser feita em um ambiente isolado com os componentes reais.
3. Apresentar para decisão do proprietário a lista de superfícies e exceções, a intensidade de cada modo e o alcance do controle de cor do tema Personalizado. A autorização para alterar o código do app vem após essa revisão. Registrar as decisões e a evidência antes de marcar a etapa como aceita.

## Critérios de conclusão

- [ ] Inventário e comparação visual entregues e revisados pelo proprietário. Escopo, exceções, intensidade e comportamento do tema Personalizado aprovados.
- [ ] Após autorização, os componentes aprovados usam a cor de sombra resolvida da paleta. Sombras com tamanhos diferentes conservam suas geometrias. Avisos padrão, submenu, AppBar e menu flutuante do editor foram conferidos onde se aplicam.
- [ ] Em claro e escuro, trocar de paleta ou restaurar a cor padrão atualiza a sombra dos componentes. Em tema plano, os cartões continuam planos e menus e diálogos mantêm elevação. Conferir o estilo computado de pelo menos um componente Prism e do aviso padrão para confirmar a cor e as camadas renderizadas.
- [ ] Conferir bordas, foco por teclado, abertura e fechamento, sombras cortadas em áreas com rolagem e contraste visual em desktop e celular. No portal do cliente, conferir os componentes compartilhados com a sombra da paleta pública Ônix.
- [ ] Registrar as verificações executadas e o aceite no app. Atualizar o [contrato Prism](../../../docs/contracts/prism-details.md) e o índice de contratos no [AGENTS](../../../AGENTS.md) conforme a regra aprovada. Registrar separadamente a situação do código local e de eventual publicação.

## Modelos sugeridos

- **Gemini — Gemini 3.8 Flash.** Inventariar as sombras e montar a comparação visual inicial com os componentes existentes. Disponibilidade conforme o plano.
- **Codex — GPT-6.1 Sol.** Rastrear a cor entre paletas, tema Personalizado e componentes e verificar a independência entre cor e relevo.
- **Claude Code — Claude Sonnet 5.5.** Revisar as exceções do Prism e conferir a composição das sombras e dos anéis nos estados interativos. Disponibilidade conforme o plano.

## Decisões do proprietário — 12/11/2026

1. **Alcance:** toda sombra de elevação (`shadow-*`, inclusive avisos do Sonner, bolinhas e controles deslizantes) usa a cor de sombra da paleta. Anéis e contornos não entram.
2. **Intensidade:** o ponto de partida de 15% no claro e 80% no escuro foi **substituído** pelos valores por paleta aprovados em 12/11 (10% no claro; 25% a 70% no escuro), listados na seção Implementação.
3. **Todas as paletas têm `shadowColor`:** a propriedade passa a ser obrigatória no tipo. A cor das paletas que não têm sai do **fundo mais escuro** da paleta (matiz e croma do fundo do modo escuro, luminosidade reduzida). Cor única, com opacidades diferentes por tamanho de sombra e por modo no CSS. O Fúcsia mantém a cor atual.
   - **Refinamento de 12/11:** a cor tem uma versão clara e outra escura. A clara do Fúcsia (`oklch(0.25 0.15 350)`) é o molde das demais (mesma luminosidade e croma, matiz da cor primária). A escura (`oklch(0.10 0.10 340)`, menos luminosidade e croma) é o molde do escuro. Ônix e Carbono, neutras, ficam quase sem tom. A decidir: matiz do escuro vir da primária ou do fundo escuro.
   - **Itens semânticos:** os avisos de sucesso, erro, aviso e informação do Sonner mantêm a sombra colorida atual (único lugar com sombra semântica). Só o aviso padrão segue a paleta.
4. **Relevo dos cartões:** a sombra segue como está; o relevo afeta só o acabamento dos cartões, nada mais.
5. **Tema Personalizado:** tem os mesmos campos de uma paleta (cor e opacidade em cada modo). O `shadowColor` antigo, que valia só para os cartões, agora vale para todas as sombras e, sem cor própria no escuro, o escuro usa a cor do claro; a opacidade do escuro nunca herda a do claro.

**Comparação visual:** [comparativo-ds14-sombra.html](../comparativo-ds14-sombra.html) mostra hoje × proposta em todas as 11 paletas, claro e escuro, com controles de intensidade e de escurecimento da cor. Falta o aceite visual antes de implementar. Nenhum código do app foi alterado.

**Atualização de 12/11 (tarde):** a comparação virou uma página de aprovação por paleta, com claro e escuro separados e controles de matiz, luminosidade, croma e opacidade em cada um. Começa com opacidade de 10% no claro e 25% no escuro, croma baixo e matiz da cor primária (Ônix e Carbono neutras; Fúcsia com os valores definidos pelo proprietário). Seis paletas de fundo igual podem ter sombra igual. A página gera o texto final com os valores aprovados.

## Implementação — 12/11/2026

Valores aprovados (22 de 22): Ônix claro `0.25 0.01 200` 10%, escuro `0.10 0.01 200` 50%; Carbono `0.25 0 0` 10%, escuro `0.10 0 0` 40%; Rubi `0.25 0.04 20` 10%, escuro `0.03 0 0` 70%; Coral `0.25 0.05 140` 10%, escuro `0.10 0.03 140` 25%; Damasco `0.25 0.04 100` 10%, escuro `0.03 0 100` 70%; Elétrico `0.25 0.04 120` 10%, escuro `0.10 0.03 120` 60%; Folha `…130` 10%, escuro 50%; Turquesa `…200` 10%, escuro 50%; Cobalto `…264` 10%, escuro 50%; Violeta `…290` 10%, escuro 50%; Fúcsia `0.25 0.15 350` 10%, escuro `0.10 0.10 340` 25%.

O que mudou: `shadowColor` e `shadowOpacity` obrigatórios em `light` e `dark` de cada paleta; variáveis globais de sombra gravadas sempre; tamanhos de sombra do Tailwind e aviso padrão do Sonner derivam delas. Verificação: `tsc`, build de produção e testes de paleta, tema e tema Personalizado passaram. Não conferido no app aberto.

**Tema Personalizado (12/11):** novo bloco "Sombras do app" em Minha Conta → Aparência → Personalizado, com cor e opacidade para o claro e para o escuro, sempre visível (não depende do relevo) e com "Restaurar". Os campos novos exigem a migração `20261112120000_custom_theme_shadow_preferences.sql`, **aplicada em produção em 12/11/2026**. Comparativo da bolinha do seletor de cor: [comparativo-ds14-bolinha.html](../comparativo-ds14-bolinha.html).

**Overlay (12/11):** o fundo atrás de diálogos, busca e painéis laterais passa a usar a cor de sombra da paleta a 30% (`bg-overlay`), em vez de preto a 30%. Preserva o desfoque.

**Painel Personalizado (12/11, ajuste):** cada modo aparece como um lado com o fundo e o texto escolhidos. Os nomes são simples (Cor principal, Texto sobre a cor principal, Fundo, Texto), as cores abrem o seletor próprio da UZZINA e os textos usam o tamanho das demais seções. A sombra de cada modo fica dentro do lado correspondente.
