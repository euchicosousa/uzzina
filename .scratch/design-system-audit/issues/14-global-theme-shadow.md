# DS14 — Aplicar a sombra da paleta às superfícies elevadas

**Status.** Proposta na `main` local, aberta para inventário e comparação visual. A implementação e as verificações de entrega estão pendentes. A diretriz aprovada em 10/11/2026 é que `shadowColor` pertence à paleta inteira. A lista de componentes, o comportamento do tema Personalizado e a intensidade da sombra precisam de aceite antes da implementação.

**Dependência.** O inventário pode começar. Para decidir e autorizar a implementação, apresentar a comparação visual na [bancada de temas](13-theme-test-lab.md) ou em uma demonstração isolada equivalente com os componentes e estilos reais do app.

## O que a pessoa vê

Abra o menu do usuário no cabeçalho, a busca global (`Cmd+K`) ou um diálogo. Hoje, essas superfícies usam sombras neutras mesmo quando a paleta tem uma cor de sombra própria, como o magenta do Fúcsia. A proposta é que essas sombras usem a cor da paleta ativa. Ônix e as demais paletas sem uma cor de sombra definida usariam preto neutro como padrão, sujeito a aceite na comparação.

## Escopo proposto

| Onde conferir | O que entra na comparação |
| --- | --- |
| Menu do cabeçalho, submenu, popover e seletores | `DropdownMenuContent`, `DropdownMenuSubContent`, `PrismPopover`, Select e Combobox. |
| Busca global, caixas de diálogo e painéis laterais | A superfície elevada de `PrismDialog` e `Sheet`. A busca já reutiliza o diálogo. |
| Barra flutuante de navegação, editor e avisos | `AppBar`, menu que aparece ao selecionar texto no editor e aviso padrão do Sonner. |
| Cartões de Hoje e da Administração, botões e seletor de avatar | Inventariar sombras de elevação em repouso e ao passar o mouse. Cartões já usam a cor da paleta. Preservar suas intensidades, o estilo plano e os estados existentes. No seletor de avatar, conferir repouso e hover. |
| Demais ocorrências de sombra | Classificar amostras de cor, controles deslizantes e outras ocorrências encontradas como elevação ou efeito funcional. Registrar o que entra e o motivo das exceções. |

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
