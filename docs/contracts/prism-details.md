# Contratos: detalhes do design system Prism e da galeria /ui

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer em foco, movimento, abas, containers flutuantes, nomes acessíveis de controles ou na galeria `/ui`. A escala de controles, os tokens e as regras gerais ficam no `AGENTS.md`.

## Galeria /ui

- Galeria `/ui`: use `UzzinaLoaderSection` como referência para exemplos UZZINA. O componente fica em `app/components/uzzina/` e começa com `U`; use seu nome exato no menu e no título. Monte exemplos interativos com `GallerySection`, `GalleryItem` e `PropsPlayground`: o componente vai em `preview` e os controles de props vão no painel lateral.

`/ui` reúne tokens, componentes Prism e componentes Uzzina em três abas; as seções de componentes Prism (24) e componentes Uzzina seguem ordem alfabética, sem prefixo "Prism" nos títulos; cada componente é exposto com playground interativo de propriedades (`PropsPlayground`). Novas seções ficam em app/components/ui-sections e são integradas à rota. O selo verde de aprovado (`approved`) é marcador temporário de validação, a remover depois.

## Movimento

Movimento: tokens em `@theme` de `app/tailwind.css` — `duration-motion-fast/base/slow` (150/200/300ms; namespace `--transition-duration-*` no Tailwind 4.3) e `ease-motion-standard`/`ease-motion-exit`. Overlays Prism (popover, select, combobox, menu, diálogo) animam com `data-entering:animate-overlay-pop-in` / `data-exiting:animate-overlay-pop-out` (fundo do diálogo: `overlay-fade-*`), 200ms entrada e 150ms saída, sempre com `motion-reduce:animate-none`; são CSS animations para o React Aria aguardar a saída. Não há plugin `tw-animate-css`: classes `animate-in`/`zoom-in-*` não funcionam. Expansões usam `grid-rows-[0fr]`→`[1fr]` em vez de `max-height`.

## Estados, ícones e verificação

Use estados React Aria data-[hovered], data-[pressed], data-[focused] e data-[disabled]. Ícones Lucide novos seguem sufixo Icon; botões definem tamanho padrão e focus ring. PrismInput aplica foco/erro ao Group que inclui prefixo/sufixo. PrismAlert reúne ícone, título e descrição por variante. Componente composto precisa de verificação própria de foco/teclado, além das garantias dos primitivos.

## Anel de foco e exceções

Anel de foco padrão (`border-ring/60 ring-3 ring-ring/30`, como `PrismButton`): todo foco por anel usa essa largura e opacidade, com borda a 60% quando o elemento tem borda (inset onde um contêiner com overflow cortaria o anel externo; hoje só a coluna de campos de `conflict-comparison`, que mantém `tabIndex` por não ter filhos focáveis e por exigência do Safari); destrutivo repete tudo em vermelho (`border-destructive/60 ring-destructive/30`); thumbs de slider/color só com o anel. Links e gatilhos de texto (link do dia, accordion, data da gaveta) usam sublinhado `focus-visible:underline`. Fallback global `:focus-visible`: outline sólido de 3px, offset 0, `outline-ring/30`. Exceções aprovadas: foco por fundo — itens de lista/menu/seleção/comando e linhas de Ajuda/notificações `bg-secondary/50`; abas, barra do `RichTextEditor` e botão Fechar da gaveta `bg-input`; campos sem anel de propósito (título inline, comentário). Gatilhos `form-footer` e busca de parceiros usam o anel padrão. Estados de seleção (`ring-primary`) não são foco. Ícones: herdam `currentColor` a 60% em repouso (os componentes Prism aplicam `opacity-60`), indicadores de seleção (checks) a 100%, spinners e desabilitados são exceções; sem ícones cinza (`text-muted-foreground`).

## Acessibilidade de controles de ícone e RichTextEditor

Controles de ícone recebem nomes em português nos consumidores, conforme ação/estado. `RichTextEditor` encaminha `id`/`aria-labelledby` opcionais ao contenteditable real; rótulos de Contexto/Tom focam esse editor, sem IDs duplicados nos inputs ocultos. Contato de Lead usa um único link estilizado por `buttonVariants`, sem botão interativo aninhado.

## Abas

`PrismTabs`/`PrismTabList`/`PrismTab`/`PrismTabPanel` unificam navegação entre painéis: abas `h-10`, `px-4`, sem raio. Variante `underline` (padrão): linha inferior de 1px em cada aba (cor de borda; `primary` quando selecionada), sem borda na lista, hover só no texto, foco por teclado com fundo `bg-input`. Variante `drawer` (hoje só no `/ui`): aba selecionada conectada ao painel por borda superior de2px primary, bordas laterais e `bg-popover`; foco por teclado acrescenta `bg-input`. Preferências de valor continuam em ToggleGroup. Perfil mobile mantém ambos os painéis montados; desktop os expõe como regiões simultâneas. Gaveta, texto do Instagram e abas mobile do portal reutilizam o mesmo padrão. `shouldForceMount` preserva conteúdo oculto/inert; `isAlwaysVisible` mantém regiões lado a lado interativas. Contextos de abas são isolados dentro do painel para permitir abas aninhadas. A navegação Essencial/Instagram/Observações preserva todos os Tab stops do percurso local da gaveta, além das setas; menus do rodapé ficam fora da coleção de abas. Exemplo em `/ui`.
