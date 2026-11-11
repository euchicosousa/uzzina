# DS13 — Laboratório interativo de testes visuais: todos os temas, superfícies e componentes em tempo real

**Status.** Concluído e aprovado pelo proprietário em 11/11/2026. O inventário de cores e superfícies ficou em [`estudo-cores-superficies.html`](../estudo-cores-superficies.html); a bancada completa de estados sobre todas as superfícies não foi construída e deixou de ser necessária depois da aprovação geral das cores.

**Bloqueado por.** Nenhum ticket. Dependência direta para a aprovação das migrações do DS14 e DS15.

## O que a pessoa vê

Uma página ou bancada de testes visual onde é possível alternar instantaneamente entre **todas as 11 paletas da UZZINA** (Ônix, Carbono, Rubi, Coral, Damasco, Elétrico, Folha, Turquesa, Cobalto, Violeta e Fúcsia), alternar entre **Light Mode** e **Dark Mode**, e testar os componentes sobre qualquer fundo (`bg-background`, `bg-popover`, `bg-card`, `bg-muted/50`, `bg-muted`, `bg-input`, `bg-action`). Todos os estados interativos (repouso, hover, foco com teclado, selecionado, aberto e desabilitado) podem ser inspecionados em tempo real com dados reais e fiéis ao design system.

## Qual componente

O laboratório de testes visuais cobre todos os componentes interativos do Prism e UZZINA:

- **Containers e listas flutuantes:** `DropdownMenuItem`, `SelectItem`, `ComboboxItem`, `CommandItem`.
- **Botões e alternâncias:** `PrismButton` (`ghost`, `outline`, `secondary`), `PrismToggle`, `PrismToggleGroupItem`.
- **Navegação e abas:** `PrismTab` (linhas e gaveta), `PrismAccordion`.
- **Linhas e calendários:** Linhas de Notificações, Ajuda, células de `PrismCalendar` e calendários de ação.

## O que foi analisado, o que já mudou e o que será mudado

- **O que foi analisado:** O proprietário identificou que os testes visuais não podem depender de suposições nem de um único tema ou fundo; precisam ser reais, visíveis e testados em todos os temas disponíveis na UZZINA, comparando lado a lado o comportamento antigo (`bg-secondary/50`, etc.) com o padrão vigente (`bg-secondary`, 5% no claro e 10% no escuro).
- **O que já mudou:** O piloto de menu foi aprovado. A fórmula vigente no app é `bg-secondary`, derivado do texto principal a 5% no claro e 10% no escuro. A sombra do tema segue em estudo separado.
- **O que será mudado:** Criação da página HTML interativa de testes (`.scratch/design-system-audit/comparativo-ds12.html`) equipada com:
  1. Seletor de paletas com todas as 11 opções cadastradas em `palettes.ts` (com suas respectivas cores de sombra `shadowColor`, como a magenta no Fúcsia e preto no Ônix).
  2. Alternador instantâneo Light Mode / Dark Mode.
  3. Alternador de superfície de fundo (Página, Popover, Card, Muted 50%, Muted 100%, Input e Ação).
  4. Amostras interativas em repouso, hover, foco simulado e teclado real, com medição visual de contraste.

## Onde está

O [laboratório de cores e inventário](../estudo-cores-superficies.html) já está no checkout local e cobre as 11 paletas com amostras de tokens. A bancada de estados reais sobre todas as superfícies ainda está pendente.

## O que o proprietário precisa decidir e o que olhar antes de aprovar

- Inspecionar a página de testes no navegador.
- Alternar entre paletas cromáticas (ex.: Fúcsia) e neutras (Ônix) para certificar que o fundo do hover/foco harmoniza perfeitamente em todas as 11 paletas.
- Confirmar se a legibilidade e contraste estão 100% aprovados sobre fundos claros, escuros e cinzas intermediários (`bg-muted/50`).

## Critérios de conclusão

- [ ] Página HTML autocontida criada em `.scratch/design-system-audit/comparativo-ds12.html` com suporte nativo a todas as 11 paletas da UZZINA e modo claro/escuro.
- [ ] Apresenta todos os componentes interativos inventariados sobre todas as 7 superfícies de fundo.
- [ ] Roteiro curto de validação entregue ao proprietário.

## Modelos sugeridos

- **Google — Gemini 3.8 Flash.** Rápido e preciso para gerar a página HTML autocontida com toda a matriz de paletas OKLCH e estados interativos CSS.
- **OpenAI — GPT-6.1 Sol.** Recomendado para estruturar a lógica interativa da página de testes em JavaScript leve sem dependências externas.
- **Anthropic — Claude Sonnet 5.5.** Alternativa para refinar a fidelidade visual dos componentes Prism na maquete HTML. Disponibilidade depende do plano.
