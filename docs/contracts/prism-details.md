# Contratos: detalhes do design system Prism e da galeria /ui

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer em foco, movimento, abas, containers flutuantes, nomes acessíveis de controles ou na galeria `/ui`. A escala de controles, os tokens e as regras gerais ficam no `AGENTS.md`.

## Galeria /ui

- Galeria `/ui`: use `UzzinaLoaderSection` como referência para exemplos UZZINA. O componente fica em `app/components/uzzina/` e começa com `U`; use seu nome exato no menu e no título. Monte exemplos interativos com `GallerySection`, `GalleryItem` e `PropsPlayground`: o componente vai em `preview` e os controles de props vão no painel lateral.

`/ui` reúne tokens, componentes Prism e componentes Uzzina em três abas; as seções de componentes Prism (24) e componentes Uzzina seguem ordem alfabética, sem prefixo "Prism" nos títulos; cada componente é exposto com playground interativo de propriedades (`PropsPlayground`). Novas seções ficam em app/components/ui-sections e são integradas à rota.

## Movimento

Movimento: tokens em `@theme` de `app/tailwind.css` — `duration-motion-fast/base/slow` (150/200/300ms; namespace `--transition-duration-*` no Tailwind 4.3) e `ease-motion-standard`/`ease-motion-exit`. Overlays Prism (popover, select, combobox, menu, diálogo) animam com `data-entering:animate-overlay-pop-in` / `data-exiting:animate-overlay-pop-out` (fundo do diálogo: `overlay-fade-*`), 200ms entrada e 150ms saída, sempre com `motion-reduce:animate-none`; são CSS animations para o React Aria aguardar a saída. Não há plugin `tw-animate-css`: classes `animate-in`/`zoom-in-*` não funcionam. Expansões usam `grid-rows-[0fr]`→`[1fr]` em vez de `max-height`.

## Estados, ícones e verificação

Use estados React Aria data-[hovered], data-[pressed], data-[focused] e data-[disabled]. Ícones Lucide novos seguem sufixo Icon; botões definem tamanho padrão e focus ring. PrismInput aplica foco/erro ao Group que inclui prefixo/sufixo. PrismAlert reúne ícone, título e descrição por variante. Componente composto precisa de verificação própria de foco/teclado, além das garantias dos primitivos.

Padrão oficial de campos de entrada (`PrismInput`, `Textarea`, `PrismColorField`, `PrismTimeField`, `Select`, `Combobox`, `InputGroup`):

- **Placeholder:** padronizado em `placeholder:text-foreground/40` (e `data-placeholder:text-foreground/40`), único em claro e escuro, sem duplicidade de regras dark.
- **Estado de Erro (`aria-invalid`):** padronizado em `aria-invalid:bg-error-background aria-invalid:text-error-foreground aria-invalid:border-error aria-invalid:ring-error-background`. Em botões e alternadores sem fundo de erro, aplica `aria-invalid:border-error aria-invalid:ring-error-background`. Substitui todas as opacidades manuais antigas (`ring-error/20`, `/30` ou `/40`) pelo token semântico nativo `ring-error-background`.
- **Fundos semânticos 100% opacos:** tokens `--color-*-background` (error, warning, success, info) são gerados por `color-mix` sobre a superfície sólida `var(--card)` (7% no modo claro e 14% no modo escuro), garantindo superfícies sólidas e opacas que impedem o vazamento visual de elementos subjacentes em toasts (`sonner`), alertas (`PrismAlert`) e badges.

## Ordem de ícone e texto

Regra do proprietário (DS05, decisão final de 11/11/2026): a posição do ícone segue a função do controle.

- **Contexto ou entidade (substantivo): ícone à esquerda.** Exemplos: tipo de visualização, ordenação, pessoas.
- **Ação ou disparo (verbo): ícone à direita.** Exemplos: Salvar, Publicar, Concluir, Gerar proposta com IA, WhatsApp.
- **Criar, adicionar ou novo: sempre o "+" (`PlusIcon`) à direita do texto.** Vale para Nova Ação e para Novo Usuário, Novo Cliente e Novo Parceiro no Admin, que são botões padrão (não ghost).
- **Menus com abertura:** contexto à esquerda e seta à direita (`[⊞ Visualizar ⌄]`).
- **Navegação direcional:** pelo sentido físico. Voltar ← à esquerda; Avançar → e links externos ↗ à direita.
- **Abas:** texto puro; se houver um ícone especial, fica à esquerda.
- **Itens de menu e de comando** (Header, busca global) mantêm o ícone à esquerda: são itens de lista, não botões. Itens de menu de criação também usam "+".
- **Selo de data comemorativa no calendário:** só o ponto colorido; o ícone de corrente foi retirado de propósito (pequeno demais). A vinculação ao parceiro aparece pelo fundo azul do selo (as não vinculadas ficam apagadas) e por texto oculto para leitor de tela.
- **Texto escondido em tela pequena** (ex.: Visualizar, Ordenar, Exibir em `UViewOptions`): o botão precisa de `aria-label` que contenha o texto visível ("Visualizar ações", "Ordenar ações", "Exibir campos"). A prop opcional `context` acrescenta " (contexto)" se houver dois no mesmo ecrã.
- O espaçamento vem do `gap` do botão, sem margens manuais no ícone.

## Anel de foco e exceções

Anel de foco padrão (`border-ring/60 ring-3 ring-ring/30`, como `PrismButton`): todo foco por anel usa essa largura e opacidade, com borda a 60% quando o elemento tem borda (inset onde um contêiner com overflow cortaria o anel externo; hoje só a coluna de campos de `conflict-comparison`, que mantém `tabIndex` por não ter filhos focáveis e por exigência do Safari); anel de erro usa `ring-error-background` sobre `border-error`; thumbs de slider/color só com o anel. Links e gatilhos de texto (link do dia, accordion, data da gaveta) usam sublinhado `focus-visible:underline`. Fallback global `:focus-visible`: outline sólido de 3px, offset 0, `outline-ring/30`. Exceções aprovadas: foco por fundo — itens de lista/menu/seleção/comando, linhas de Ajuda/notificações, abas e botão Fechar da gaveta usam `bg-secondary`; campos sem anel de propósito (título inline, comentário). Gatilhos `form-footer` e busca de parceiros usam o anel padrão. Os cartões de ação têm contorno de 2 px na cor primária quando recebem foco interno. Os botões e alternadores da barra do editor usam o anel padrão. Estados de seleção (`ring-primary`) não são foco. Ícones: herdam `currentColor` a 60% em repouso (os componentes Prism aplicam `opacity-60`), indicadores de seleção (checks) a 100%, spinners e desabilitados são exceções; ícones acompanham a cor do controle.

## Acessibilidade de controles de ícone e RichTextEditor

Controles de ícone recebem nomes em português nos consumidores, conforme ação/estado. `RichTextEditor` encaminha `id`/`aria-labelledby` opcionais ao contenteditable real; rótulos de Contexto/Tom focam esse editor, sem IDs duplicados nos inputs ocultos. Contato de Lead usa um único link estilizado por `buttonVariants`, sem botão interativo aninhado.

A barra do `RichTextEditor` mostra todos os comandos em uma linha com rolagem horizontal invisível. As setas levam aos comandos fora da área visível, e Tab volta ao texto.

## Abas

`PrismTabs`/`PrismTabList`/`PrismTab`/`PrismTabPanel` unificam navegação entre painéis: abas `h-10`, `px-4`, sem raio. Variante `underline` (padrão): linha inferior de 1px em cada aba (cor de borda; `primary` quando selecionada), sem borda na lista, hover e foco por teclado com fundo `bg-secondary`. Variante `drawer` (hoje só no `/ui`): aba selecionada conectada ao painel por borda superior de2px primary, bordas laterais e `bg-popover`; foco por teclado acrescenta `bg-secondary`. Preferências de valor continuam em ToggleGroup. Perfil mobile mantém ambos os painéis montados; desktop os expõe como regiões simultâneas. Gaveta, texto do Instagram e abas mobile do portal reutilizam o mesmo padrão. `shouldForceMount` preserva conteúdo oculto/inert; `isAlwaysVisible` mantém regiões lado a lado interativas. Contextos de abas são isolados dentro do painel para permitir abas aninhadas. A navegação Essencial/Instagram/Observações preserva todos os Tab stops do percurso local da gaveta, além das setas; menus do rodapé ficam fora da coleção de abas. Exemplo em `/ui`.
