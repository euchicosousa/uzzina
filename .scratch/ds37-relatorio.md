# DS37 — Transparências escritas à mão (v2, com onde ver cada uma)

Contagem refeita em 22/11/2026: 102 usos de classe com transparência e 11 cores inline. Nada no app foi alterado.

**Tipos de proposta:** **NOVO** = cria item no editor de cores (claro e escuro ajustáveis). **TROCA** = passa a usar token que já existe. **EXCEÇÃO** = fica como está.

## Mapa rápido: onde abrir cada coisa

| Para ver… | Abra |
|---|---|
| Qualquer componente do Prism isolado (Popover, Menu, Select, Input, Combobox, Dialog, Sheet, Tooltip, Skeleton…) | Galeria **`/ui`**, menu lateral → Prism → nome do componente |
| Barra de navegação flutuante (AppBar) | Rodapé de qualquer tela de `/app`, com nenhuma Ação aberta |
| Gaveta de Ação (abas ESSENCIAL, INSTAGRAM, OBSERVAÇÕES) | Clique em qualquer Ação (Hoje, Calendário, Kanban) |
| Hoje / Linha do tempo / Parceiros | **`/app`** (Home) ou **`/app/today`**; a visão troca no seletor de visualização do topo |
| Notificações | Sino no cabeçalho (menu) e página **`/app/notifications`** |
| Minha Conta | **`/app/profile`**, abas Informações pessoais / Aparência / Funcionamento / Uso de IA |
| Admin do Parceiro | **`/app/admin/partners`** → clicar num parceiro (`/app/admin/partner/<slug>`) |
| Cores dos temas | **`/app/admin/themes`** |
| Portal e revisão pública | **`/dash/review/<slug>`** e **`/dash/action/<id>`** (portal do cliente) |
| Busca global | `Ctrl/Cmd+K` em qualquer tela de `/app` |

---

## Sessão A — Borda dos flutuantes (1–13) → NOVO `border-popover`

Hoje: `border-foreground/5 dark:border-foreground/10` (5% do texto no claro, 10% no escuro). A aparência não muda, exceto no item 11.

| # | Componente | Onde ver no app | Proposta | Muda? | Arquivo |
|---|---|---|---|---|---|
| 1 | **Popover** | `/ui` → Popover. No app: popovers de filtro do cabeçalho | NOVO | Não | `prism/popover.tsx:76` |
| 2 | **Menu suspenso** (Dropdown Menu) | `/ui` → Dropdown Menu. No app: menu de três pontinhos de uma Ação | NOVO | Não | `prism/dropdown-menu.tsx:46` |
| 3 | **Submenu** do menu suspenso | `/ui` → Dropdown Menu (item com seta) | NOVO | Não | `prism/dropdown-menu.tsx:191` |
| 4 | **Lista do Select** | `/ui` → Select. No app: escolher qualquer opção em formulário | NOVO | Não | `prism/select.tsx:139` |
| 5 | **Lista do Combobox** | `/ui` → Combobox. No app: seletor de Parceiro/Pessoa | NOVO; remover o `border-input/30` redundante | Não | `prism/combobox.tsx:141` |
| 6 | **Diálogo** (janela modal) | `/ui` → Dialog. No app: qualquer confirmação | NOVO | Não | `prism/dialog.tsx:126` |
| 7 | **Sheet** (gaveta lateral) | `/ui` → Sheet | NOVO | Não | `prism/sheet.tsx:76` |
| 8 | **Tooltip** (dica ao passar o mouse) | `/ui` → Tooltip. No app: passar o mouse num ícone | NOVO | Não | `prism/tooltip.tsx:33` |
| 9 | **Barra de formatação do editor** (BubbleMenu do Tiptap) | Gaveta de Ação → aba INSTAGRAM → selecionar texto na legenda. Também `/ui` → Rich Text Editor | NOVO | Não | `features/RichTextEditor.tsx:651` |
| 10 | **Balão de comentário** | Gaveta de Ação → aba OBSERVAÇÕES, em qualquer comentário | NOVO | Não | `features/ActionComments/CommentItem.tsx:73` |
| 11 | **Barra de navegação flutuante** (AppBar) | Rodapé de qualquer tela de `/app` | NOVO | **Sim, leve:** no claro a borda cai de 10% para 5% | `layout/AppBar.tsx:85` |
| 12 | **Quadradinho de cor** do resultado na busca global | `Ctrl/Cmd+K`, buscar uma paleta/tema | TROCA `border-border` | Quase nada | `features/GlobalSearchCommand.tsx:683` |
| 13 | **Bloco de prévia claro/escuro** | `/app/profile` → Aparência, prévia do modo vívido | EXCEÇÃO (imita tema fixo) | Não | `routes/app/profile.tsx:136` |

## Sessão B — Texto de dica dos campos (14–22) → NOVO `placeholder`

Hoje: `text-foreground/40`. Alternativa mais barata: TROCA por `text-secondary-foreground` (fica mais forte). Todos mudam levemente (contraste calculado).

| # | Componente | Onde ver no app | Arquivo |
|---|---|---|---|
| 14 | **Input** (campo de texto) | `/ui` → Input. No app: campo Nome em `/app/profile` → Informações pessoais (limpe o campo) | `prism/input.tsx:9` |
| 15 | **Textarea** | `/ui` → Textarea. No app: caixa de comentário da Ação, vazia | `prism/textarea.tsx:15` |
| 16 | **Campo de cor** (hex) | `/ui` → Input → ColorField | `prism/color-field.tsx:10` |
| 17 | **Campo de hora**, texto de dica | `/ui` → Input → TimeField | `prism/time-field.tsx:14` |
| 18 | **Campo de hora**, segmento vazio (`--:--`) | `/ui` → TimeField, sem valor | `prism/time-field.tsx:64` |
| 19 | **Select**, valor não escolhido | `/ui` → Select | `prism/select.tsx:59` |
| 20 | **Select**, gatilho vazio | `/ui` → Select | `prism/select.tsx:84` |
| 21 | **Combobox com chips**, busca | `/ui` → Combobox → ComboboxChips (só existe na galeria) | `prism/combobox.tsx:357` |
| 22 | **Command** (barra de busca) | `Ctrl/Cmd+K` (campo vazio); `/ui` → Command | `prism/command.tsx:157` |

## Sessão C — Texto de apoio escrito à mão (23–32) → TROCA

`/80` → `text-foreground`; `/70` e `/60` → `text-secondary-foreground`. Todos mudam levemente.

| # | Componente | Onde ver no app | Hoje → Proposta | Arquivo |
|---|---|---|---|---|
| 23 | **Menu de notificações**, frase "X mencionou você na ação Y" | Sino do cabeçalho (precisa de notificação) | `/80` → `text-foreground` | `layout/Header.tsx:494` |
| 24 | **Menu de notificações**, trecho do comentário | Sino do cabeçalho | `/60` → `text-secondary-foreground` | `layout/Header.tsx:507` |
| 25 | **Página de Notificações**, texto da já lida | `/app/notifications` | `/70` → `text-secondary-foreground` | `features/NotificationsPage.tsx:153` |
| 26 | **Página de Notificações**, "Você foi mencionado sem texto." | `/app/notifications` | `/70` → `text-secondary-foreground` | `features/NotificationsPage.tsx:159` |
| 27 | **Página de Notificações**, nome de quem mencionou | `/app/notifications` | `/80` → `text-foreground` | `features/NotificationsPage.tsx:164` |
| 28 | **Página de Notificações**, título da Ação | `/app/notifications` | `/80` → `text-foreground` | `features/NotificationsPage.tsx:169` |
| 29 | **Métricas**, valor à direita da barra de progresso | Cabeçalho → ícone "Ver métricas" (popover) | `/80` → `text-foreground` | `features/home/DashboardMetrics.tsx:267` |
| 30 | **E-mail da conta** | `/app/profile` → Informações pessoais | `/80` → `text-foreground` | `routes/app/profile.tsx:907` |
| 31 | **Legenda da Ação** na revisão pública | `/dash/review/<slug>` | `/80` → `text-foreground` | `routes/dash/review.$slug.tsx:275` |
| 32 | **"Sem legenda criada"** (itálico) | `/dash/action/<id>` de uma Ação sem legenda | `secondary/50` → `text-secondary-foreground` | `routes/dash/action/$id.tsx:411` |

## Sessão D — Divisórias e bordas suaves (33–41) → TROCA `border-border`

| # | Componente | Onde ver no app | Proposta | Muda? | Arquivo |
|---|---|---|---|---|---|
| 33 | **Linha do tempo**, rótulo de horário | `/app` visão Linha do tempo | TROCA `border-border` | **Sim, conferir** | `layout/TimelineBoard.tsx:936` |
| 34 | **Linha do tempo**, linha vertical a cada 5 minutos | idem | TROCA `border-border` | **Sim, conferir:** pode ficar forte | `layout/TimelineBoard.tsx:1005` |
| 35 | **Linha do tempo**, divisão entre raias | idem | TROCA `divide-border` | Sim, leve | `layout/TimelineBoard.tsx:1026` |
| 36 | **Caixa tracejada** "Nenhuma ação para hoje." | `/app` visão Parceiros, em dia sem Ações | TROCA `border-border` | Sim, leve | `layout/PartnersBoard.tsx:36` |
| 37 | **Seletor de cor**, separador vertical | Admin do Parceiro → Tópicos (cor do tópico); `/ui` → ColorPickerDropdown | TROCA `bg-border` | Sim, leve | `uzzina/UColorPickerDropdown.tsx:257` |
| 38 | **Seletor de cor**, linha acima de formato/canais | idem | TROCA `border-border` | Sim, leve | `uzzina/UColorPickerDropdown.tsx:300` |
| 39 | **Caixa "Consumo de IA ainda não medido neste mês."** | `/app/profile` → Uso de IA | TROCA `border-border` | Sim, leve | `routes/app/profile.tsx:1318` |
| 40 | **ButtonGroup**, separador entre botões | `/ui` → Button → ButtonGroup | TROCA `bg-border` | Sim, leve | `prism/button-group.tsx:121` |
| 41 | **ButtonGroup do botão principal**, separador | `/ui` → ButtonGroup variante principal | EXCEÇÃO (deriva do botão) | Não | `prism/button-group.tsx:121` |

## Sessão E — Fundo translúcido de flutuante e cobertura (42–47) → NOVO `vidro-flutuante` (90%)

| # | Componente | Onde ver no app | Proposta | Muda? | Arquivo |
|---|---|---|---|---|---|
| 42 | **Barra de navegação flutuante** (AppBar) | Rodapé de qualquer tela de `/app` | NOVO | Não (já 90%) | `layout/AppBar.tsx:85` |
| 43 | **Barra de formatação do editor** | Gaveta de Ação → INSTAGRAM → selecionar texto | NOVO | Sim, leve (95% → 90%) | `features/RichTextEditor.tsx:651` |
| 44 | **Popover "Ver métricas"** | Cabeçalho → ícone "Ver métricas" | NOVO | Sim, leve (80% → 90%) | `features/home/DashboardMetrics.tsx:152` |
| 45 | **Camada com carregamento** sobre a estratégia | Gaveta de Ação → INSTAGRAM → estratégias, ao marcar uma estratégia (aparece por instantes) | EXCEÇÃO (cobertura temporária) | Não | `features/action-drawer/ActionFormDrawer.tsx:1642` |
| 46 | **Cabeçalho fixo da galeria** | `/ui`, topo | EXCEÇÃO (tela de desenvolvimento) | Não | `routes/ui.tsx:951` |
| 47 | **Barra "+ Nova Ação" da miniatura** | `/app/profile` → Funcionamento, miniatura da página de parceiro | EXCEÇÃO (desenho esquemático) | Não | `routes/app/profile.tsx:319` |

## Sessão F — Fundos de campo e cinzas de realce (48–56)

| # | Componente | Onde ver no app | Hoje → Proposta | Muda? | Arquivo |
|---|---|---|---|---|---|
| 48 | **Área de escrever comentário** | Gaveta de Ação → OBSERVAÇÕES, rodapé | `dark:bg-input/30` → TROCA `bg-input` | **Sim, no escuro:** fica mais claro | `features/ActionComments/CommentInput.tsx:68` |
| 49 | **Combobox com chips**, caixa do campo | `/ui` → Combobox → ComboboxChips | `bg-input/40` → TROCA `bg-input` | **Sim:** deixa de ser translúcido | `prism/combobox.tsx:265` |
| 50 | **Esqueleto de carregamento** (Skeleton) | `/ui` → Skeleton; no app, ao recarregar uma lista | `bg-foreground/5` → NOVO `skeleton` (ou EXCEÇÃO, aprovado no DS33) | Não | `prism/skeleton.tsx:21` |
| 51 | **Número do item** na revisão pública | `/dash/review/<slug>`, círculo com o número | `bg-foreground/8` → TROCA `bg-secondary` | Sim, leve | `routes/dash/review.$slug.tsx:204` |
| 52 | **Chip selecionado** do Combobox | `/ui` → Combobox → ComboboxChips (só na galeria) | `bg-foreground/10 border-foreground/20 hover:/15` → NOVO `chip` (ou TROCA `bg-secondary`) | Só com a TROCA | `prism/combobox.tsx:318` |
| 53 | **"x" de remover** do chip | idem | `hover:bg-foreground/15` → NOVO `chip` | Não | `prism/combobox.tsx:329` |
| 54 | **Alça esquerda** da barra da Ação | `/app` visão Linha do tempo, esticar uma barra | EXCEÇÃO (traço sobre a cor da Fase) | Não | `layout/TimelineBoard.tsx:482` |
| 55 | **Alça direita** da barra da Ação | idem | EXCEÇÃO | Não | `layout/TimelineBoard.tsx:513` |
| 56 | **Avatar editável**, véu ao passar o mouse | `/app/profile` → Informações pessoais (foto); `/ui` → UAvatarUpload | EXCEÇÃO (véu sobre foto) | Não | `uzzina/UAvatarUpload.tsx:55` |

## Sessão G — Estado ativo com a cor principal e halo de botão (57–62)

| # | Componente | Onde ver no app | Hoje → Proposta | Muda? | Arquivo |
|---|---|---|---|---|---|
| 57 | **Botão "Para o cliente"** do comentário | Gaveta de Ação → OBSERVAÇÕES, botão "Nota interna", alterne | `border-primary/40 bg-primary/10` → NOVO `primary-soft` (ou TROCA `bg-secondary text-primary`) | Sim, leve no escuro | `features/ActionComments/CommentInput.tsx:90` |
| 58 | **Área do gerenciador de arquivos** ao arrastar arquivo | Gaveta de Ação → INSTAGRAM → gerenciar arquivos, arrastar arquivo de fora | `bg-primary/5` → NOVO `primary-soft` (ou TROCA `bg-secondary`) | Sim, leve | `features/media/FileManagerDialog.tsx:725` |
| 59 | **Texto pequeno** do avatar selecionado | `/ui` → UAvatarSelector, variante secondary | EXCEÇÃO (deriva do botão) | Não | `uzzina/UAvatarSelector.tsx:132` |
| 60 | **Botão de sucesso forte**, halo de foco | `/ui` → Button, variante sucesso, foco por teclado | `ring-success-strong/30` → NOVO `success-strong-halo` | Não | `prism/button.tsx:37` |
| 61 | **Miniatura**: caixinha da barra lateral | `/app/profile` → Funcionamento | EXCEÇÃO (desenho esquemático) | Não | `routes/app/profile.tsx:258` |
| 62 | **Miniatura**: barra lateral | idem | EXCEÇÃO | Não | `routes/app/profile.tsx:295` |

## Sessão H — Cortina e controles sobre imagem (63–65)

| # | Componente | Onde ver no app | Hoje → Proposta | Muda? | Arquivo |
|---|---|---|---|---|---|
| 63 | **Fundo escuro atrás da gaveta** de Ação (clicar fecha) | Abra qualquer Ação; o fundo atrás é a cortina | `bg-black/20 dark:bg-black/80` → TROCA `bg-overlay` (30% nos dois modos) ou NOVO `overlay` para manter 20/80 | **Sim. Decisão sua.** | `features/action-drawer/ActionDrawerPanel.tsx:85` |
| 64 | **Pontinho inativo** do carrossel | Gaveta de Ação → INSTAGRAM → prévia do carrossel | `bg-white/50` → EXCEÇÃO (controle sobre imagem) | Não | `features/media/InstagramPreview.tsx:186` |
| 65 | **Sombra do texto** sobre miniatura | Gerenciador de arquivos (INSTAGRAM → gerenciar arquivos) | `drop-shadow … rgba` → EXCEÇÃO | Não | `features/media/FileManagerDialog.tsx:205` |

## Sessão I — Foco `border-ring/60` (66–80) → EXCEÇÃO (decisão sua)

Anel de foco por teclado (use **Tab** para ver). Não muda a aparência.

| # | Componente | Onde ver no app | Arquivo |
|---|---|---|---|
| 66 | **Input** | `/ui` → Input | `prism/input.tsx:9` |
| 67 | **Textarea** | `/ui` → Textarea | `prism/textarea.tsx:15` |
| 68 | **Select**, gatilho | `/ui` → Select | `prism/select.tsx:84` |
| 69 | **Combobox com chips** | `/ui` → ComboboxChips | `prism/combobox.tsx:265` |
| 70 | **InputGroup** (campo com prefixo/sufixo) | `/ui` → Input → InputGroup | `prism/input-group.tsx:22` |
| 71 | **Campo de cor** | `/ui` → ColorField | `prism/color-field.tsx:10` |
| 72 | **Campo de hora** | `/ui` → TimeField | `prism/time-field.tsx:14` |
| 73 | **Seletor de período** | `/ui` → DateRangePicker | `prism/date-range-picker.tsx:121` |
| 74 | **Checkbox** | `/ui` → Checkbox | `prism/checkbox.tsx:26` |
| 75 | **Radio** | `/ui` → Radio Group | `prism/radio-group.tsx:25` |
| 76 | **Botão** | `/ui` → Button | `prism/button.tsx:51` |
| 77 | **Toggle** | `/ui` → Toggle | `prism/toggle.tsx:44` |
| 78 | **Badge focável** | `/ui` → Badge | `prism/badge.tsx:7` |
| 79 | **Editor "Contexto"** do parceiro | `/app/admin/partner/<slug>`, campo Contexto | `routes/app/admin/partner/$slug.tsx:525` |
| 80 | **Editor "Tom de Voz"** do parceiro | idem, campo Tom de Voz | `routes/app/admin/partner/$slug.tsx:556` |

## Sessão J — Miniaturas, prévias e cores que vêm do banco (81–96) → EXCEÇÃO

| # | Componente | Onde ver no app | Arquivo |
|---|---|---|---|
| 81 | **Miniatura da página de parceiro**, cabeçalho da lateral | `/app/profile` → Funcionamento | `routes/app/profile.tsx:302` |
| 82 | idem, bolinha | idem | `routes/app/profile.tsx:303` |
| 83 | idem, linha | idem | `routes/app/profile.tsx:304` |
| 84 | idem, quadradinhos da grade | idem | `routes/app/profile.tsx:312` |
| 85 | idem, borda da barra inferior | idem | `routes/app/profile.tsx:319` |
| 86 | idem, bolinha da barra inferior | idem | `routes/app/profile.tsx:320` |
| 87 | idem, linha da barra inferior | idem | `routes/app/profile.tsx:321` |
| 88 | **Chip de Categoria** na prévia de Planejamento | `/app/planejamento` → prévia de uma proposta | `planning/PlanningPreview.tsx:85` |
| 89 | **Texto do chip de Categoria** | idem | `planning/PlanningPreview.tsx:100` |
| 90 | **Ícone de Categoria** | Qualquer Ação com categoria; `/ui` → UIcons | `uzzina/UIcons.tsx:45` |
| 91 | **Amostra de Fase** na prévia vívida | `/app/profile` → Aparência | `routes/app/profile.tsx:153` |
| 92 | **Amostra de cor da paleta** (borda `rgba`) | `/app/profile` → Aparência, bolinhas de paleta | `routes/app/profile.tsx:184` |
| 93 | **Selo da Fase** no portal | `/dash/action/<id>` | `routes/dash/action/$id.tsx:376` |
| 94 | **Selo da Categoria** na revisão pública | `/dash/review/<slug>` | `routes/dash/review.$slug.tsx:215` |
| 95 | **Bolinha do ColorArea** (borda branca opaca) | `/ui` → ColorArea e ColorSlider | `prism/color-area.tsx:38` |
| 96 | **Bolinha do ColorSlider** | idem | `prism/color-slider.tsx:50` |

---

## Itens novos propostos no editor

| Item | Claro | Escuro | Resolve |
|---|---|---|---|
| `border-popover` | 5% do texto | 10% do texto | 1–11 |
| `placeholder` | cinza ≥ 3:1 sobre `input` (≈ L 0,60) | idem | 14–22 |
| `vidro-flutuante` | 90% de `popover` | 90% | 42–44 |
| `skeleton` | 5% do texto | 5% | 50 |
| `chip` | fundo 10%, borda 20%, hover 15% | idem | 52–53 |
| `primary-soft` | fundo 10%, borda 40% | fundo 15%, borda 50% | 57–58 |
| `success-strong-halo` | 30% | 30% | 60 |
| `overlay` (só se quiser 20/80) | 20% | 80% | 63 |

## Decisões que dependem de você

1. **Item 63** (cortina da gaveta): 30% nos dois modos ou manter 20% claro / 80% escuro.
2. **Sessão I** (foco): manter exceção ou virar item.
3. **Itens 50, 52–53, 57–58**: criar `skeleton`, `chip`, `primary-soft` ou trocar por `bg-secondary`.
4. **Checagem automática** contra novas transparências à mão: sim ou não.

## Para olhar na tela antes de liberar

- 33 e 34 (Linha do tempo): linhas ficam mais fortes.
- 48 e 49 (no escuro): campos deixam de ser translúcidos.
- 11 (AppBar no claro): borda cai de 10% para 5%.
- 63 (gaveta): a cortina muda de intensidade.

## Observações

- O Combobox com chips (itens 21, 49, 52, 53, 69) **só existe na galeria `/ui`**: o app não o usa em nenhuma tela. Se ele nunca for usado, é candidato a sair da lista de trabalho.
- Cores de Categoria e Fase vêm do banco, por isso ficam fora do editor.
- Nenhum arquivo do app foi alterado; nada em branch, banco ou produção.
