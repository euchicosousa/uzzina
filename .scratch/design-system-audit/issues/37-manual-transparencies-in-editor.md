# DS37 — Transparências escritas à mão passam para o editor de cores

**Status.** Encerrado em 22/11/2026 (commit `b5bf3b2c`): as transparências escritas à mão passaram para o editor de temas. Continua o [DS33](33-manual-transparencies-and-secondary.md) e o [DS36](36-total-color-editor.md).

## O que é

Em vários componentes, a cor de um detalhe é escrita à mão com uma porcentagem de transparência, por exemplo `border-foreground/10` (a borda dos menus), `text-foreground/40` (o texto de placeholder dos campos) ou `border-ring/60` (a borda de foco). Esses números não aparecem na página **Cores dos temas** (`/app/admin/themes`), então não dá para ajustar claro e escuro em um só lugar, e algumas porcentagens estão repetidas em dezenas de arquivos.

O levantamento achou **117 usos de classe com opacidade em cerca de 46 padrões**, mais 7 cores escritas inline (`oklch(from …)`, `rgba`, `color-mix`). A lista completa, com `arquivo:linha`, o papel de cada uso e a proposta, está em [transparencies-survey.md](../../transparencies-survey.md).

## Componentes afetados

Os maiores grupos, com onde aparecem na tela:

| Padrão | Usos | Onde se vê |
|---|---|---|
| `border-ring/60` | 15 | Borda de foco em 13 componentes do Prism |
| `border-foreground/10` (e `/5` no claro) | 14 | Borda de flutuantes: Popover, Menu, Select, Combobox, Dialog, Sheet, Tooltip, BubbleMenu |
| `text-foreground/40` | 9 | Placeholder dos campos |
| `text-foreground/80`, `/70`, `/60` | 10 | Texto de apoio escrito à mão |
| `border-border/NN`, `bg-border/NN`, `divide-border/50` | 11 | Divisórias e bordas suaves |
| `bg-primary/NN`, `border-primary/NN` | 13 | Estado ativo com a cor principal |
| `bg-foreground/NN` | 8 | Realces cinza escritos à mão, esqueleto de carregamento |
| `bg-popover/80–95`, `bg-background/80–95` | 5 | Fundo de flutuante translúcido |
| `bg-black/*`, `bg-white/*` | 5 | Gaveta e amostra de cinza em Minha Conta |

## Proposta do levantamento (para decidir em cada item)

1. **Trocar por token que já existe (cerca de 36 usos):** `text-foreground/80|70|60` por `text-foreground` ou `text-secondary-foreground`; `border-border/NN` por `border-border`; `bg-input/30|40` por `bg-input`; `bg-foreground/8` e `border-input/30` por tokens atuais.
2. **Criar itens no editor (7), com valor claro e escuro:**

| Item | Papel | Claro | Escuro | Substitui |
|---|---|---|---|---|
| `border-popover` | Borda de flutuante | 5% do texto | 10% do texto | `border-foreground/5 dark:border-foreground/10` |
| `placeholder` | Texto de placeholder | cinza com contraste ≥ 3:1 sobre `input` (≈ L 0,60) | idem | `text-foreground/40` |
| `vidro-flutuante` | Flutuante translúcido | 90% de `popover` | 90% de `popover` | `bg-popover/80`, `/90`, `/95` |
| `primary-soft` | Estado ativo com a principal | 10% (borda 40%) | 15% (borda 50%) | `bg-primary/10 border-primary/40` |
| `chip` | Chip do combobox | 10% fundo, 20% borda, 15% hover | idem | `bg-foreground/10 border-foreground/20 hover:bg-foreground/15` |
| `skeleton` | Esqueleto de carregamento | 5% do texto | 5% do texto | `bg-foreground/5` |
| `success-strong-halo` | Halo de foco do botão de sucesso forte | 30% de `success-strong` | 30% | `ring-success-strong/30` |

3. **Manter como exceção (cerca de 38 usos):** miniatura de layout e prévia do tema em Minha Conta, alças da Linha do tempo, cores de Categoria e o padrão de foco `border-ring/60`.

## O que mudou desde o levantamento (22/11)

- A sombra do aviso (`sonner.tsx`) deixou de ter transparência à mão: agora segue a mesma derivação da sombra de Fase, com os valores compartilhados de claro e escuro (utility `toast-state-shadow`). **O item `toast-shadow-alpha` não é mais necessário.**
- O `InstagramPreview.tsx` perdeu os fundos pretos (`bg-black/50` e `/60`): usa `image-icon` e `image-text`, sombra no lugar de fundo. Sai do grupo de exceções.
- O tema Personalizado foi removido, então as exceções do `CustomThemePanel.tsx` deixaram de existir.
- Refazer a contagem antes de começar.

## Cuidados

- Cada troca precisa ser conferida em claro e escuro; o levantamento foi feito só pelo texto das classes, sem renderizar.
- Pontos que pedem olho na tela: `bg-input/30` no escuro e a linha vertical do dia na Linha do tempo.
- O foco (`border-ring/60`) é um padrão de acessibilidade do Prism; só mexer com decisão explícita.
- Nada muda o hover e o foco de item que já é `bg-secondary`.

## Decisões em aberto

- Aprovar a divisão: 36 trocas por token, 7 itens novos, o resto como exceção.
- Decidir se o foco `border-ring/60` vira item do editor ou continua exceção.
- Decidir se haverá uma checagem automática (script) que recuse novas transparências escritas à mão.

## O que olhar antes de aprovar

Abrir [transparencies-survey.md](../../transparencies-survey.md), ler a tabela final de itens novos e dizer quais entram.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Troca em muitos componentes e criação de itens no editor com dados claro/escuro; exige conferir que a aparência final não muda.
- **Claude Code — Haiku 5.5.** Só para as trocas diretas por token existente, que são mecânicas depois que o proprietário aprovar a lista.
- **Gemini — Gemini 4 Pro.** Alternativa para o levantamento de contraste do placeholder e do vidro do flutuante, com revisão antes de aplicar.
