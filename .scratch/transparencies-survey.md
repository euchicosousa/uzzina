# Levantamento A: transparências escritas à mão (opacidade em tokens de cor)

Escopo: `app/**/*.tsx|ts`, excluindo `app/components/ui-sections/` (galeria), `app/components/features/admin/themes/` e testes. `app/tailwind.css` não entra (é onde os tokens são definidos). Somente leitura; nenhum arquivo do app foi alterado.

Método: `grep -E` por `(bg|text|border|ring|shadow|divide|outline|from|to|via|fill|stroke|decoration|caret|accent|placeholder)-<token>/<NN|[..]>` (ignorando `/0` e `/100`), mais `color-mix(`, `oklch(from`, `rgba(` em `className`/`style`. Cada `file:line` abaixo foi conferido com a linha de código.

Observação de método: onde uma linha tem duas classes do mesmo grupo (ex.: `border-foreground/5 dark:border-foreground/10`), a contagem por classe conta as duas, e a contagem "por linha" conta uma vez. Cada tabela diz qual é.

## Resumo de contagens

Total: **117 usos de classe com opacidade** (116 com token nomeado + 1 com variável `border-(--category-color)/50`), em cerca de 46 padrões distintos, mais **7 usos de função de cor inline** (`color-mix`, `oklch(from ...)`, `rgba`) em 4 arquivos.

| Padrão | Usos | Decisão proposta |
|---|---|---|
| `border-ring/60` (foco com borda) | 15 | (2) já coberto: `ring-ring-halo` cobre o anel; a borda a 60% é a metade do anel padrão; manter e documentar |
| `border-foreground/10` + `border-foreground/5` (borda de flutuante) | 14 + 10 | (3) novo item de editor: `border-popover` (borda do flutuante) |
| `text-foreground/40` (placeholder) | 9 | (3) novo item `placeholder` (ou reutilizar texto secundário, ver grupo) |
| `text-foreground/80` | 6 | (2) trocar por `text-foreground` ou `text-secondary-foreground` |
| `border-border/40` | 6 | (2) trocar por `border-border` |
| `border-primary/60` | 4 | (1) exceção aprovada: miniaturas esquemáticas da prévia de Minha Conta |
| `text-foreground/70` | 2 | (2) trocar por `text-secondary-foreground` |
| `border-primary/40`, `border-primary/50`, `border-primary/80` | 2, 1, 1 | (1) prévia de Minha Conta; `CommentInput` (3) |
| `bg-primary/20`, `bg-primary/10`, `bg-primary/5` | 2, 2, 1 | (1) prévia; (3) estado ativo do botão de comentário; (3) destaque de soltar arquivo |
| `bg-foreground/50` | 2 | (1) alça de arraste da barra da Linha do tempo |
| `bg-foreground/15`, `bg-foreground/10`, `border-foreground/20` | 2, 1, 1 | (3) Chip do combobox: `chip` |
| `bg-black/*` (20, 50, 60, 70, 80) e `bg-white/40`, `border-white/10`, `border-black/10` | 2+2+2+2+1+1+1+1 | (1) sobre imagem/overlay; sem token |
| `bg-background/80`, `bg-background/95` | 2, 1 | (2) cobertura de carregamento: ver grupo |
| `bg-popover/80`, `/90`, `/95` | 1, 1, 1 | (3) novo item `vidro` (flutuante translúcido) ou (2) `bg-popover` |
| `bg-input/30`, `bg-input/40` | 1, 1 | (2) trocar por `bg-input` (o escuro já tem camada própria) |
| `bg-foreground/5` (skeleton) | 1 | (3) novo item `skeleton` |
| `bg-foreground/8`, `bg-foreground/40` | 1, 1 | (2) `bg-secondary`; (1) véu sobre foto |
| `bg-border/80`, `bg-border/60`, `divide-border/50`, `border-border/30`, `border-border/50` | 1,1,1,1,1 | (2) trocar por `bg-border`/`border-border` |
| `border-current/15`, `border-current/20` | 1, 1 | (1) borda que acompanha a cor do texto no editor de tema |
| `bg-primary-foreground/30`, `text-primary-foreground/70` | 1, 1 | (3) separador e texto dentro de botão primário: tokens por variante |
| `ring-success-strong/30` | 1 | (3) `ring-success-halo` (halo do botão de sucesso) |
| `border-input/30` | 1 | (2) remover (dentro de `border-foreground/5` no combobox) |
| `border-(--category-color)/50` | 1 | (1) cor da Categoria na prévia de Planejamento |
| `text-secondary-foreground/50` | 1 | (2) trocar por `text-secondary-foreground` |
| `text-foreground/60` | 1 | (2) trocar por `text-secondary-foreground` |
| Funções inline (`color-mix`, `oklch(from)`, `rgba`) | 7 | ver seção 6 |

Já cobertos por token existente (não aparecem como transparência escrita à mão): `border-border`, `bg-secondary`/`-hover`, `text-secondary-foreground`, `ring-ring-halo` (tailwind.css:77, `color-mix` do halo de foco), `bg-late`/`--late-bg` (tailwind.css:72), sombra compartilhada (`--shadow-color`, `--shadow-alpha`), `--action-ring`, `--color-error-background` etc.

Papéis, em termos do app. "Flutuante" = Popover, Menu, Select, Combobox, Dialog, Sheet, Tooltip, BubbleMenu (contêineres que ficam sobre a página). Ver em `AGENTS.md` seção 5 a regra: flutuante usa `border border-foreground/5 dark:border-foreground/10`.

---

## 1. `border-ring/60`: borda no foco (15 usos)

Papel: quando o campo ou botão recebe foco por teclado (`focus-visible`), a borda vira 60% da cor de foco e aparece o anel `ring-3 ring-ring-halo` ao redor. É o anel de foco padrão do contrato de Prism (`prism-details.md`: "Anel de foco padrão `border-ring/60 ring-3 ring-ring/30`", hoje `ring-ring-halo`).

| file:line | Elemento |
|---|---|
| `app/components/prism/input.tsx:9` | PrismInput |
| `app/components/prism/textarea.tsx:15` | PrismTextarea |
| `app/components/prism/select.tsx:84` | Gatilho do PrismSelect |
| `app/components/prism/combobox.tsx:265` | Campo do combobox com chips (`focus-within`) |
| `app/components/prism/input-group.tsx:22` | Grupo de campo com prefixo/sufixo |
| `app/components/prism/color-field.tsx:10` | Campo de cor (hex) |
| `app/components/prism/time-field.tsx:14` | Campo de hora |
| `app/components/prism/date-range-picker.tsx:121` | Gatilho do seletor de período |
| `app/components/prism/checkbox.tsx:26` | Caixa do checkbox (foco no grupo) |
| `app/components/prism/radio-group.tsx:25` | Bolinha do rádio |
| `app/components/prism/button.tsx:51` | Botão estilizado base |
| `app/components/prism/toggle.tsx:44` | Toggle |
| `app/components/prism/badge.tsx:6` | Badge focável |
| `app/routes/app/admin/partner/$slug.tsx:525` | Caixa do editor "Contexto" (parceiro) |
| `app/routes/app/admin/partner/$slug.tsx:556` | Caixa do editor "Voz" (parceiro) |

Já coberto: `ring-ring-halo` (tailwind.css:77) é um item do editor/token compartilhado; a borda `border-ring/60` é a parte sólida do mesmo conjunto.
Luz/escuro: `--ring` vem de `--accent` (tailwind.css:60-64), por tema; 60% de alfa funciona nos dois modos porque a cor vem do tema, não do fundo.
Proposta: **(1) manter como exceção aprovada** (é o padrão do contrato e já repetido em todos os controles). Se quiser editável: criar item `ring-border-alpha` com 60% claro e 60% escuro. Hoje não há motivo para separar claro/escuro.

## 2. Borda de flutuantes: `border-foreground/5 dark:border-foreground/10` (14 usos de `/10`, 10 de `/5`)

Papel: o contorno fino que separa um flutuante da página (5% do texto no claro, 10% no escuro). Contratado em `AGENTS.md` ("Containers flutuantes ... `border border-foreground/5 dark:border-foreground/10`").

Mesma linha de código, as duas classes (10 linhas):

| file:line | Elemento |
|---|---|
| `app/components/prism/popover.tsx:76` | PrismPopover |
| `app/components/prism/dialog.tsx:126` | Diálogo |
| `app/components/prism/dropdown-menu.tsx:46` | Menu (conteúdo principal) |
| `app/components/prism/dropdown-menu.tsx:191` | Submenu |
| `app/components/prism/select.tsx:139` | Lista do Select |
| `app/components/prism/combobox.tsx:141` | Lista do Combobox (também `border-input/30`) |
| `app/components/prism/tooltip.tsx:33` | Tooltip |
| `app/components/prism/sheet.tsx:76` | Sheet (gaveta lateral; só uma borda lateral visível) |
| `app/components/features/RichTextEditor.tsx:651` | Barra flutuante (BubbleMenu) do editor Tiptap |
| `app/components/features/ActionComments/CommentItem.tsx:73` | Balão de comentário (não é flutuante, copia o padrão) |

Somente `border-foreground/10` (4 linhas, sem o par `/5`):

| file:line | Elemento |
|---|---|
| `app/components/layout/AppBar.tsx:85` | Barra de navegação flutuante inferior |
| `app/components/features/GlobalSearchCommand.tsx:683` | Amostra de cor ao lado do resultado de busca |
| `app/components/features/profile/CustomThemePanel.tsx:143` | Bloco de cada modo (claro/escuro) no tema Personalizado (exceção aprovada 12/11/2026) |
| `app/routes/app/profile.tsx:157` | Bloco de pré-visualização do tema em Minha Conta |

Já coberto: não há item no editor. `border-border` existe mas é mais forte; o flutuante usa transparência para ficar sutil sobre qualquer fundo.
Proposta: **(3) criar item `border-popover`** (borda de flutuante). Valores: claro = texto a 5%, escuro = texto a 10% (os que o app já usa; podem ser L-delta do fundo como as demais bordas, ex.: `--border-l-delta`). Isso troca 10 linhas por `border-popover-border` e tira o `dark:` de cada flutuante. Os 4 usos só com `/10` seguem o mesmo item ou `border-border`.

## 3. `text-foreground/40`: texto de placeholder (9 usos)

Papel: placeholder ("Digite aqui...") de campos e texto "vazio" de select/hora.

| file:line | Elemento |
|---|---|
| `app/components/prism/input.tsx:9` | placeholder do PrismInput |
| `app/components/prism/textarea.tsx:15` | placeholder do PrismTextarea |
| `app/components/prism/color-field.tsx:10` | placeholder do campo de cor |
| `app/components/prism/time-field.tsx:14` | placeholder do campo de hora |
| `app/components/prism/time-field.tsx:64` | segmento vazio de hora (data-placeholder) |
| `app/components/prism/select.tsx:59` | valor vazio do Select |
| `app/components/prism/select.tsx:84` | placeholder do gatilho do Select |
| `app/components/prism/combobox.tsx:357` | placeholder da busca do chip combobox |
| `app/components/prism/command.tsx:157` | placeholder da barra de busca (Command) |

Já coberto: `text-secondary-foreground` existe (texto de apoio, derivado do fundo) mas é mais forte que 40%. O estudo DS23 mediu que `foreground/NN` falha em contraste em cartões escuros (ver `docs/audits/2026-11-16-ds23-surfaces-study.md`).
Proposta: **(3) criar item `placeholder`**: claro ~ L 0,60 sobre o campo; escuro ~ L 0,60; valor calculado do fundo do campo (`input`) para garantir ≥ 3:1 (placeholder não exige 4,5:1 se houver rótulo). Alternativa mínima **(2)**: usar `text-secondary-foreground`.

## 4. `text-foreground/80`, `/70`, `/60` e `text-secondary-foreground/50` (10 usos)

Papel: texto levemente mais fraco que o principal.

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/layout/Header.tsx:494` | `/80` | Título de cada notificação no menu de notificações do cabeçalho |
| `app/components/layout/Header.tsx:507` | `/60` | Trecho do comentário na notificação, com borda esquerda |
| `app/components/features/NotificationsPage.tsx:153` | `/70` | Texto da notificação já lida |
| `app/components/features/NotificationsPage.tsx:159` | `/70` | Texto "sem conteúdo" em itálico |
| `app/components/features/NotificationsPage.tsx:164` | `/80` | Nome de quem mencionou |
| `app/components/features/NotificationsPage.tsx:169` | `/80` | Nome de quem mencionou (segundo caso) |
| `app/components/features/home/DashboardMetrics.tsx:267` | `/80` | Texto à direita da barra de progresso nas métricas |
| `app/routes/app/profile.tsx:1037` | `/80` | Texto do e-mail da conta em Minha Conta |
| `app/routes/dash/review.$slug.tsx:275` | `/80` | Texto da descrição na revisão pública |
| `app/routes/dash/action/$id.tsx:411` | `secondary/50` | Legenda do Instagram vazia, em itálico, no portal `/dash/action/$id` |

Já coberto: `text-foreground` (texto) e `text-secondary-foreground` (apoio) cobrem os dois degraus. Os `/80`, `/70`, `/60` são degraus extras sem item.
Proposta: **(2) trocar**: `/80` por `text-foreground`; `/70` e `/60` por `text-secondary-foreground`; `secondary/50` por `text-secondary-foreground`. Não criar item novo: o app já tem a regra de dois níveis de texto.
Atenção: o portal (`dash/action/$id.tsx`, `review.$slug.tsx`) usa os mesmos tokens do tema.

## 5. Bordas e divisórias com `border/NN` (10 usos)

Papel: linhas finas de separação.

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/layout/TimelineBoard.tsx:936` | `border-border/40` | Rótulo do dia na linha do tempo |
| `app/components/layout/TimelineBoard.tsx:1005` | `border-border/30` | Linha vertical de cada dia |
| `app/components/layout/TimelineBoard.tsx:1026` | `divide-border/50` | Divisão entre raias |
| `app/components/layout/PartnersBoard.tsx:36` | `border-border/50` | Caixa tracejada de "nenhum parceiro" |
| `app/components/features/profile/CustomThemePanel.tsx:126` | `border-border/40` | Separador de seção |
| `app/components/features/profile/CustomThemePanel.tsx:239` | `border-border/40` | Separador de seção (Relevo) |
| `app/components/features/profile/CustomThemePanel.tsx:297` | `border-border/40` | Separador da prévia |
| `app/components/uzzina/UColorPickerDropdown.tsx:300` | `border-border/40` | Separador de formato/canais |
| `app/components/uzzina/UColorPickerDropdown.tsx:257` | `bg-border/60` | Separador vertical |
| `app/routes/app/profile.tsx:1465` | `border-border/40` | Caixa de aviso em Minha Conta |
| `app/components/prism/button-group.tsx:121` | `bg-border/80` | Separador do ButtonGroup |

Já coberto: `border-border` (item "Borda" do editor, `--border-l-delta`).
Proposta: **(2) trocar por `border-border`** (e `bg-border`, `divide-border`). `border-border` já é mais sutil que o foreground a 40%. Para a linha vertical do dia na Linha do tempo (`1005`) pode ficar mais forte que o desejado; validar visualmente. Nenhum item novo.

## 6. Fundos translúcidos de flutuante e de cobertura

Papel: fundo semi-transparente com `backdrop-blur`.

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/layout/AppBar.tsx:85` | `bg-popover/90` | Barra de navegação flutuante (ícones do app) |
| `app/components/features/RichTextEditor.tsx:651` | `bg-popover/95` | Barra de formatação do editor Tiptap (BubbleMenu) |
| `app/components/features/home/DashboardMetrics.tsx:152` | `bg-popover/80` | Popover do botão "Ver métricas" (blur 2xl) |
| `app/components/features/action-drawer/ActionFormDrawer.tsx:1642` | `bg-background/80` | Camada sobre um bloco da gaveta de Ação (`aria-hidden`, centraliza um indicador) |
| `app/routes/ui.tsx:951` | `bg-background/80` | Cabeçalho fixo da galeria `/ui` |
| `app/routes/app/profile.tsx:351` | `bg-background/95` | Barra "+ Nova Ação" da miniatura de preview em Minha Conta |

Já coberto: `bg-popover` existe e é sólido; os outros flutuantes (Dialog, Menu, Select) são sólidos.
Luz/escuro: `bg-popover/90` sobre fundo claro clareia pouco; sobre escuro funciona, mas o `backdrop-blur` altera o contraste dependendo do que está atrás.
Proposta: **(3) criar item `vidro-flutuante`** com um alfa único para os flutuantes translúcidos (`AppBar`, `BubbleMenu`, popover de métricas): hoje usam 90%, 95% e 80% sem razão registrada; um valor só (sugestão 90% claro, 90% escuro; ou `alfa` + `desfoque` no editor). Alternativa (2): `bg-popover` sólido, o que elimina a transparência. `background/80` (cobertura, cabeçalho `/ui`) fica como **(1) exceção** (não é token de superfície).

## 7. Fundos de realce com `foreground/NN` (cinzas escritos à mão)

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/prism/skeleton.tsx:21` | `bg-foreground/5` | PrismSkeleton (placeholder animado) |
| `app/routes/dash/review.$slug.tsx:204` | `bg-foreground/8` | Número do item na lista de revisão pública |
| `app/components/prism/combobox.tsx:318` | `bg-foreground/10` + `border-foreground/20` + hover `bg-foreground/15` | Chip do combobox múltiplo |
| `app/components/prism/combobox.tsx:329` | `hover:bg-foreground/15` | Botão de remover do chip |
| `app/components/layout/TimelineBoard.tsx:482` | `bg-foreground/50` | Alça esquerda da barra de Ação na Linha do tempo |
| `app/components/layout/TimelineBoard.tsx:513` | `bg-foreground/50` | Alça direita da barra de Ação |
| `app/components/uzzina/UAvatarUpload.tsx:55` | `bg-foreground/40` | Véu sobre o avatar ao passar o mouse |

Já coberto: `bg-secondary` (cinza do clicável) e `bg-input`.
Proposta:
- `skeleton` (`bg-foreground/5`): **(3) criar item `skeleton`**: claro L fundo −0,04; escuro L fundo +0,06 (similar a `input`); o DS33 já marcou como "película de 5% adapta-se a qualquer fundo, inclusive item de fase" (`docs/audits/2026-11-17-ds33-inventario.md:305`), então é decisão intencional: **(1) manter** é aceitável.
- `review.$slug.tsx:204`: **(2) `bg-secondary`**.
- Chip do combobox (`318`, `329`): **(3) item `chip`** com fundo, borda e hover (claro: texto 10%/20%/15%; escuro: mesma coisa) ou **(2)** `bg-secondary` + `border-border` + `hover:bg-secondary-hover`.
- Alças da Linha do tempo (`482`, `513`): **(1)** exceção (traço sobre a cor da fase).
- Véu do avatar (`UAvatarUpload.tsx:55`): **(1)** exceção (véu sobre foto, texto `text-background`).

## 8. Campo com fundo translúcido

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/features/ActionComments/CommentInput.tsx:68` | `dark:bg-input/30` | Área de escrever comentário (escuro: campo a 30%) |
| `app/components/prism/combobox.tsx:265` | `bg-input/40` | Campo com chips do combobox |

Já coberto: `bg-input` (item "Campo" do editor).
Luz/escuro: `bg-input/30` no escuro fica quase igual ao fundo; é divergente dos outros campos (todos `bg-input` sólido).
Proposta: **(2) trocar por `bg-input`**. Valida visualmente a área de comentário no escuro.

## 9. Realces com a cor principal (`primary/NN`) (19 usos)

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/features/ActionComments/CommentInput.tsx:90` | `border-primary/40 bg-primary/10` | Botão do comentário no estado não interno (seletor "interno / para o cliente") |
| `app/components/features/media/FileManagerDialog.tsx:725` | `bg-primary/5` | Área do gerenciador quando se arrasta arquivo sobre ela (`dropActive`) |
| `app/components/features/profile/CustomThemePanel.tsx:307` | `bg-primary/10` | Selo na prévia do item da Ação (tema Personalizado) |
| `app/routes/app/profile.tsx:290` | `bg-primary/20` | Caixinha "barra lateral" da miniatura de layout em Minha Conta (ativa) |
| `app/routes/app/profile.tsx:327` | `bg-primary/20` | Barra lateral esquemática da miniatura de layout |
| `app/routes/app/profile.tsx:334` | `border-primary/40` | Cabeçalho da barra lateral esquemática |
| `app/routes/app/profile.tsx:335` | `border-primary/60` | Bolinha da miniatura |
| `app/routes/app/profile.tsx:336` | `border-primary/60` | Bolinha/linha da miniatura |
| `app/routes/app/profile.tsx:344` | `border-primary/50` | Quadradinhos da grade da miniatura |
| `app/routes/app/profile.tsx:351` | `border-primary/60` | Barra inferior da miniatura (com `bg-background/95`) |
| `app/routes/app/profile.tsx:352` | `border-primary/60` | Bolinha da barra inferior |
| `app/routes/app/profile.tsx:353` | `border-primary/80` | Linha da barra inferior |

Já coberto: `bg-primary`/`text-primary`; não há "realce primário" no editor.
Proposta:
- `profile.tsx:290-353` (miniatura de layout em Minha Conta): **(1) exceção** (desenho esquemático, não é UI interativa).
- `CustomThemePanel.tsx:307`: **(1) exceção** (prévia do tema).
- `CommentInput.tsx:90` (estado ativo): **(3) criar item `primary-soft`** (fundo suave da cor principal): claro 10%, escuro 15%; borda `primary-soft-border` 40%. Alternativa (2): `bg-secondary` + `text-primary`.
- `FileManagerDialog.tsx:725` (soltar arquivo): **(2) `bg-secondary`** ou **(3) mesmo `primary-soft`**.

## 10. Outros com tokens de "sobre cor"

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/prism/button-group.tsx:121` | `group-has-data-[variant=default]/button-group:bg-primary-foreground/30` | Separador interno do ButtonGroup primário |
| `app/components/uzzina/UAvatarSelector.tsx:132` | `group-data-selected/toggle:text-primary-foreground/70` | Texto secundário dentro do avatar selecionado (variante secondary) |
| `app/components/prism/button.tsx:37` | `focus-visible:ring-success-strong/30` | Halo de foco do botão "sucesso forte" |

Já coberto: `ring-ring-halo` (para o botão normal); botão sucesso tem halo próprio hardcoded.
Proposta: **(3) criar item `success-strong-halo`** (halo de foco do botão de sucesso forte): claro 30% da cor `--success-strong`, escuro 30% (valor igual ao `ring-halo`). Para os outros dois: **(1)** manter (derivam do botão).

## 11. Cores literais `black`/`white` (11 usos)

| file:line | Classe | Elemento |
|---|---|---|
| `app/components/features/action-drawer/ActionDrawerPanel.tsx:85` | `bg-black/20 dark:bg-black/80` | Fundo escuro atrás da gaveta (clique para fechar) |
| `app/components/features/media/InstagramPreview.tsx:92` | `bg-black/60` | Selo "vídeo" sobre a prévia |
| `app/components/features/media/InstagramPreview.tsx:193` | `bg-black/60` | Contador "1/3" do carrossel |
| `app/components/features/media/InstagramPreview.tsx:159` | `bg-black/50 hover:bg-black/70` | Seta anterior do carrossel |
| `app/components/features/media/InstagramPreview.tsx:170` | `bg-black/50 hover:bg-black/70` | Seta próximo do carrossel |
| `app/components/features/media/InstagramPreview.tsx:186` | `bg-white/40` | Pontinho inativo do carrossel |
| `app/routes/app/profile.tsx:201` | `border-black/10 dark:border-white/10` | Amostra do cinza do tema (zinc fixo) |

Já coberto: `--color-overlay` (tailwind.css:521, `color-mix(shadow-color 30%, transparent)`) é o token de cortina de overlay; não é usado em `ActionDrawerPanel`.
Proposta:
- `ActionDrawerPanel.tsx:85`: **(2) trocar por `bg-overlay`** (token existente) ou **(3) novo item `overlay`** com claro 20% e escuro 80% se o proprietário quiser editar. Atenção: hoje são dois valores diferentes (20% claro, 80% escuro), diferente do token (30%).
- `InstagramPreview.tsx`: **(1) exceção** (controles sobre imagem; AGENTS.md já aprova controles sobre imagem sem fundo, mas aqui há fundo preto: dívida de regra, decisão do proprietário).
- `profile.tsx:201`: **(1) exceção** (amostra).

## 12. Funções de cor escritas inline (7 usos)

| file:line | Código | Papel |
|---|---|---|
| `app/components/prism/sonner.tsx:55` | `shadow-[0_12px_24px_-6px_oklch(from_var(--color-success)_l_c_h_/_30%)]` | Sombra do aviso de sucesso (toast) |
| `app/components/prism/sonner.tsx:56` | idem com `--color-error` | Sombra do aviso de erro |
| `app/components/prism/sonner.tsx:57` | idem com `--color-warning` | Sombra do aviso de atenção |
| `app/components/prism/sonner.tsx:58` | idem com `--color-info` | Sombra do aviso de informação |
| `app/components/planning/PlanningPreview.tsx:85` | `border-(--category-color)/50 bg-[color-mix(in_srgb,var(--category-color)_10%,transparent)]` e `--category-ink: color-mix(... 80%, black/white)` | Chip de Categoria na prévia de Planejamento |
| `app/components/planning/PlanningPreview.tsx:100` | `text-[color-mix(in_srgb,var(--category-ink)_75%,var(--foreground))]` | Texto do chip de Categoria |
| `app/components/uzzina/UIcons.tsx:45` | `oklch(from ${color} l calc(c * var(--category-icon-chroma)) h / var(${alphaVar}))` | Tinta do ícone de Categoria (usa itens já existentes `--category-icon-*` do editor) |
| `app/components/features/media/FileManagerDialog.tsx:205` | `drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]` | Sombra do texto em cima da miniatura |

Já coberto: `UIcons.tsx` (usa alfa e chroma de categoria do editor); sombra compartilhada (`--shadow-color`/`--shadow-alpha`) existe para elevação.
Proposta:
- `sonner.tsx:55-58`: **(3) criar item `toast-shadow-alpha`** ou **(2)** reaproveitar `--shadow-alpha`. Hoje é 30% fixo nos dois modos; no escuro uma sombra colorida a 30% é pouco visível; sugerir claro 30%, escuro 40%. Esta sombra é colorida pelo estado, não pela paleta (diferente da regra DS14 "toda sombra usa a cor de sombra da paleta"): decisão do proprietário.
- `PlanningPreview.tsx:85,100`: **(1) exceção** (cor da Categoria vem do banco; mistura com preto/branco por modo é um cálculo de contraste).
- `UIcons.tsx:45`: já coberto pelos itens `category-icon-fill-alpha`/`category-icon-chroma` (tailwind.css:68-70).
- `FileManagerDialog.tsx:205`: **(1) exceção** (sombra do texto sobre imagem, segue a regra `image-icon`, tailwind.css:770).

---

## Quais papéis já têm item

| Papel | Token/item existente | Local |
|---|---|---|
| Borda comum | `border-border` | tailwind.css:56 |
| Campo | `bg-input` | tailwind.css:57 |
| Cinza do clicável | `bg-secondary` / `bg-secondary-hover` | tailwind.css:45-51 |
| Texto de apoio | `text-secondary-foreground` | tailwind.css:51 |
| Halo de foco | `ring-ring-halo` | tailwind.css:77 |
| Fundo da Ação atrasada | `--late-bg` | tailwind.css:72 |
| Sombra e anel do item da Ação | `--shadow-color`, `--shadow-alpha`, `--action-ring` | tailwind.css:91-101 |
| Fundo de estado (erro, atenção, sucesso, informação) | `--color-*-background` | tailwind.css:148-172 |
| Cortina | `--color-overlay` | tailwind.css:521 |

## Itens novos propostos (resumo de valores)

| Item | Papel | Claro | Escuro | Substitui |
|---|---|---|---|---|
| `border-popover` | Borda de flutuante | 5% do texto | 10% do texto | `border-foreground/5 dark:border-foreground/10` (11 flutuantes) |
| `placeholder` | Placeholder de campo | cinza com ≥ 3:1 sobre `input` (≈ L 0,60) | idem (≈ L 0,60) | `text-foreground/40` (9 usos) |
| `vidro-flutuante` | Flutuante translúcido | 90% de `popover` | 90% de `popover` | `bg-popover/80`, `/90`, `/95` |
| `primary-soft` | Estado ativo com a cor principal | 10% (borda 40%) | 15% (borda 50%) | `bg-primary/10 border-primary/40` |
| `chip` | Chip do combobox | 10% fundo, 20% borda, 15% hover | idem | `bg-foreground/10 border-foreground/20 hover:bg-foreground/15` |
| `skeleton` | Esqueleto de carregamento | 5% do texto | 5% do texto | `bg-foreground/5` (aprovado no DS33; decidir) |
| `success-strong-halo` | Halo de foco do botão sucesso forte | 30% de `success-strong` | 30% | `ring-success-strong/30` |
| `toast-shadow-alpha` | Intensidade da sombra do aviso | 30% | 40% | `oklch(from ... / 30%)` em `sonner.tsx` |

Trocas diretas sem item novo (cerca de 36 usos): `text-foreground/80|70|60` e `secondary/50` (10), `border-border/NN` e `bg-border/NN` (11), `bg-input/30|40` (2), `bg-foreground/8` (1), `border-input/30` (1), `bg-black/20+80` da gaveta por `bg-overlay` (1).

Exceções a manter (cerca de 38 usos): miniatura de layout em Minha Conta (`profile.tsx:290-353`, 10), prévia do tema (`CustomThemePanel.tsx:97,143,204,307`, `profile.tsx:157,201`), `InstagramPreview.tsx` (6), alças da Linha do tempo (2), véu de avatar (1), cores de Categoria (3), sombra de texto sobre imagem (1), `border-ring/60` (15, padrão de foco).
