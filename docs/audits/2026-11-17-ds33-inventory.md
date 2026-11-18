# DS33: inventário das transparências escritas à mão e do secundário opaco

**Data:** 17/11/2026. **Tipo:** ticket de estudo, só relatório. Nenhum arquivo de código foi alterado, não houve commit nem branch. Os arquivos que o agente anterior deixou sem commit em `.scratch/` e `docs/audits/CURRENT.md`, e o HTML `ds33-icones-comparacao.html` (opacidade de ícones, fora deste ticket), não foram tocados nem usados como fonte.

**Limite principal:** isto é inventário por busca no código. Eu não vi o app na tela. Tudo que diz "antes" e "agora" vem da leitura do CSS (`app/tailwind.css`) e das classes, não de captura de tela. Nada aqui foi conferido visualmente nos dois modos.

## 1. Resumo em linguagem simples

O que você vê na tela hoje, depois do DS28:

1. **Botões e itens cinzas que "não reagem" ao mouse.** O cinza dos botões secundários agora é um tom sólido. Quando o item já é cinza em repouso e o hover também pede `bg-secondary`, a cor não muda. Achei 14 lugares assim (grupo A): o botão de fechar do painel lateral (Sheet), os botões fantasma/contorno ligados como alternador (toggle), os dias do meio de uma faixa de datas e o dia de hoje no seletor de datas, o item ativo do índice da página Ajuda (e da galeria /ui), as linhas de seção abertas do editor de temas (Admin), o selo secundário usado como link e o botão Secundário quando está com o menu aberto. A correção é trocar esses hovers por `bg-secondary-hover`, que já existe.
2. **Cinza sólido onde antes era uma película.** Em 9 lugares (grupo B) o cinza agora vem do fundo da página, não do que está por baixo: avatares sem foto dentro dos cartões de ação coloridos pela fase (círculo cinza opaco em vez de uma película sobre a cor da fase), o quadro atrás de imagens (pré-visualização do Instagram, miniaturas de conteúdo e de arquivo) e o grupo Admin do menu do avatar. O visual muda pouco nas imagens; nos avatares sobre a fase é onde a diferença aparece mais.
3. **Transparências soltas.** Das 82 ocorrências de `foreground/NN`, 61 são intencionais e ficam: bordas de container aprovadas no DS24 (11 pares claro `/5` + escuro `/10`), texto suave `/40` de placeholder (16), película da barra de rolagem, alças sobre cartões coloridos, amostras de cor e overlays. Só 9 viram token neutro (grupo D) e 12 precisam da sua decisão (grupo E).
4. **`opacity-NN`**: dos 196 usos, 190 não são "cor": animações de mostrar/ocultar, desativado, ícones, estados (arrastando, arquivado, fora do mês) e texto que herda a cor do cartão (fase, balão, bloco do tema Personalizado). Só 5 textos em fundo neutro podem virar `text-secondary-foreground`.
5. **Fora da lista do ticket**, mas no mesmo assunto: o hover do botão Secundário está escrito à mão com `color-mix` (D, 4) e o editor de temas ainda descreve o secundário como "texto a 5%/10%" (E, 4).

Nenhuma classe nova (`text-soft`, `border-container`) é proposta, conforme a decisão de 17/11.

## 2. Totais

Fonte: os comandos do Apêndice. Cada linha é um token de classe (uma classe Tailwind), não uma linha de arquivo.

### 2.1 Por padrão buscado

| Padrão | Tokens | Arquivos/linhas |
|---|---|---|
| `foreground/NN` (inclui `secondary-foreground/NN` e `primary-foreground/NN`) | 82 | 69 linhas |
| `border-foreground/10` (7 soltas + 11 `dark:`) | 18 | |
| `text-foreground/40` (7 `[&_svg]:` + 6 `placeholder:` + 3 `data-placeholder:`) | 16 | |
| `border-foreground/5` | 11 | |
| `border-foreground/15` | 7 | |
| `text-foreground/80` | 6 | |
| `bg-foreground/50` | 4 | |
| demais `foreground/NN` (`/20`, `/70`, `/60`, `/90`, `/30` etc.) | 20 | |
| `bg-secondary` e variantes (`hover:`, `focus:`, `data-*:`, `/NN`) | 133 | 119 classes aplicadas + 14 em textos da galeria /ui |
| `bg-secondary/NN` | 5 | Header:717, DnD:12, CalendarDayCell:69 (2), badge:10 |
| `hover:bg-secondary` + `data-[hovered]:bg-secondary` | 19 tokens | 13 arquivos (14 com o `hover:bg-secondary/50` do CalendarDayCell, que bate com os "14 arquivos" do ticket) |
| `opacity-NN` | 196 | 190 não são cor |
| `bg-black/NN`, `bg-white/NN`, `border-black/10`, `border-white/NN` | 14 | |
| hover do Secundário em `color-mix` | 4 | button.tsx:28, ThemePreviewPane:78 |
| fórmulas antigas do secundário no editor de temas | 4 | ThemeColorInspector:702, 703, 712, 713 |

Os números 18, 16, 11, 7, 6 e 4 batem com os do ticket. O "~15 outras" do ticket são 20 aqui (inclui `tailwind.css`, `secondary-foreground/NN` e `/20`).

### 2.2 Por grupo (433 tokens no total)

| Grupo | `foreground/NN` | `bg-secondary` | `opacity-NN` | preto/branco | `color-mix` | **Total** |
|---|---|---|---|---|---|---|
| **A** vira `bg-secondary-hover` | 0 | 14 | 0 | 0 | 0 | **14** |
| **B** secundário sobre cor/imagem | 0 | 9 | 0 | 0 | 0 | **9** |
| **C** manter | 61 | 88 | 190 | 7 | 0 | **346** |
| **D** vira token neutro existente | 9 | 0 | 5 | 0 | 4 | **18** |
| **E** dúvida | 12 | 8 | 1 | 7 | 4 | **32** |
| texto de documentação da galeria (não é classe aplicada) | 0 | 14 | 0 | 0 | 0 | 14 |
| **Total** | 82 | 133 | 196 | 14 | 8 | **433** |

Além disso, a busca por outras transparências sobre tokens (`ring-ring/30`, `border-border/40`, `bg-card/60`...) achou 151 tokens (Apêndice B). Eles não entram nos totais acima; a classificação é por grupo, não por linha.

## 3. Como ler as tabelas

"Local" é `arquivo:linha`. "Classe" é a classe exata encontrada. Onde há mais de uma classe na mesma linha, elas aparecem juntas. As descrições de "onde aparece" foram deduzidas do nome do componente e do contexto de código; algumas rotas e componentes secundários eu descrevi só pelo código, sem abrir a tela.

## 4. Grupo A: vira `bg-secondary-hover` (14)

Itens que já são cinza em repouso (ou estão selecionados/abertos com o mesmo cinza) e cujo hover/foco/pressionado pede o mesmo `bg-secondary`. Ficam sem reação visível.

**Secundário (`bg-secondary`)** (14)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/HelpPage.tsx:337` | `hover:bg-secondary`, `focus-visible:bg-secondary` | Ajuda: item do índice lateral (hover e foco). O item ativo já é bg-secondary | no item ativo, hover e foco não mudam nada |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:330` | `hover:bg-secondary` | Admin, editor de tema: linha de seção recolhível (hover). Aberta, a linha já é bg-secondary | aberta + hover = mesma cor |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:423` | `hover:bg-secondary` | Admin, editor de tema: linha de seção recolhível (hover) | idem |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:895` | `hover:bg-secondary` | Admin, editor de tema: linha de seção recolhível (hover) | idem |
| `app/components/prism/badge.tsx:10` | `[a]:hover:bg-secondary/80` | selo (Badge) variante secundária usado como link: hover | o selo já é bg-secondary; o hover usa bg-secondary/80 (transparência), vira bg-secondary-hover |
| `app/components/prism/button.tsx:28` | `aria-expanded:bg-secondary` | botão Secundário (cinza): aberto (aria-expanded); repouso já é bg-secondary | aberto = mesma cor do repouso; deve ir para bg-secondary-hover (o hover escrito à mão em color-mix fica no item D da seção 'Outros') |
| `app/components/prism/button.tsx:44` | `data-selected:bg-secondary` | botão Fantasma/Contorno como alternador (toggle) selecionado | selecionado já é bg-secondary e o hover também; precisa de data-selected:hover:bg-secondary-hover |
| `app/components/prism/button.tsx:45` | `data-selected:bg-secondary` | botão Contorno como alternador (toggle) selecionado | idem |
| `app/components/prism/calendar.tsx:309` | `data-[range-middle=true]:bg-secondary`, `data-[today=true]:bg-secondary` | seletor de datas: dias do meio da faixa e o dia de hoje; a célula é um botão ghost que no hover usa o mesmo bg-secondary | hover sem mudança nesses dias |
| `app/components/prism/sheet.tsx:89` | `bg-secondary` | painel lateral (Sheet): botão de fechar no canto; é ghost com bg-secondary fixo | hover do ghost é bg-secondary: o botão não muda ao passar o mouse; precisa de hover:bg-secondary-hover |
| `app/components/ui-sections/GalleryHelperComponents.tsx:175` | `hover:bg-secondary`, `focus-visible:bg-secondary` | galeria /ui: subitens do índice lateral (hover e foco). O item ativo já é bg-secondary | no ativo, hover e foco não mudam |

## 5. Grupo B: secundário sobre superfície colorida ou imagem (9)

O cinza agora é calculado do fundo da página. Onde o item fica sobre uma cor (cartão de fase) ou uma imagem, ele não acompanha essa cor. Antes do DS28 era uma película translúcida, que deixava a cor de baixo aparecer.

**Secundário (`bg-secondary`)** (9)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/Content.tsx:77` | `bg-secondary` | miniatura/imagem do conteúdo (Instagram, gaveta): fundo atrás da imagem enquanto carrega | antes: película sobre o fundo; agora: cinza sólido do fundo da página |
| `app/components/features/media/ContentReorderDialog.tsx:122` | `bg-secondary` | janela 'Reordenar conteúdo': miniatura de cada imagem (fundo atrás da imagem) | antes: película; agora: cinza sólido do fundo da página |
| `app/components/features/media/InstagramPreview.tsx:55` | `bg-secondary` | aba Instagram > pré-visualização: quadro atrás da imagem do post (modo compacto) | antes: película; agora: cinza sólido |
| `app/components/features/media/InstagramPreview.tsx:56` | `bg-secondary` | aba Instagram > pré-visualização: quadro atrás da imagem do post | idem |
| `app/components/features/media/WorkFileThumbnail.tsx:48` | `bg-secondary` | arquivos de trabalho da ação: miniatura de arquivo sem imagem (ex. PDF) | antes: película; agora: cinza sólido |
| `app/components/layout/Header.tsx:717` | `bg-secondary/50` | menu do avatar (canto superior direito): grupo Admin (Parceiros, Usuários...), exclusivo de administradores | antes: película de 50% sobre o menu; agora: cinza opaco do fundo da página a 50% sobre o menu |
| `app/components/prism/avatar.tsx:46` | `bg-secondary` | avatar sem foto (fallback), inclusive nos cartões de ação coloridos pela fase | antes: película sobre a cor da fase; agora: círculo cinza opaco do fundo da página |
| `app/components/prism/avatar.tsx:88` | `bg-secondary` | avatar de grupo '+N' (contador), inclusive nos cartões de ação coloridos pela fase | idem |
| `app/components/uzzina/UAvatar.tsx:142` | `bg-secondary` | avatar com iniciais (sem foto), inclusive nos cartões de ação coloridos pela fase | antes: película sobre a cor da fase; agora: círculo cinza opaco (se a pessoa não tiver cor própria) |

## 6. Grupo D: vira token neutro que já existe (18)

**Transparência sobre o texto principal (`foreground/NN`)** (9)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/layout/Header.tsx:506` | `text-foreground/60` | menu de notificações (sino do topo): trecho do comentário, em cinza | text-secondary-foreground: é o texto de apoio do app e já está derivado do fundo |
| `app/components/prism/badge.tsx:9` | `border-foreground/20` | selo (Badge) padrão, em toda a interface: a borda do selo | border-border: borda neutra derivada do fundo; o selo tem bg-card |
| `app/components/prism/combobox.tsx:318` | `border-foreground/20`, `bg-foreground/10`, `hover:bg-foreground/15` | etiqueta de item escolhido em seletores múltiplos (chip): borda, fundo e hover | border-border |
| `app/components/prism/combobox.tsx:329` | `hover:bg-foreground/15` | botão 'x' que remove a etiqueta (chip) em seletores múltiplos: hover | hover:bg-secondary-hover; hoje usa película 15%, e o chip por baixo passaria a ser bg-secondary |
| `app/components/ui-sections/TokensColorsSection.tsx:130` | `text-secondary-foreground/80` | galeria /ui, Cores: nota abaixo do nome de cada cor | text-secondary-foreground sem '/80' |
| `app/routes/dash/action/$id.tsx:411` | `text-secondary-foreground/50` | portal do cliente /dash, ação: aviso 'Sem legenda criada' (itálico) | text-secondary-foreground italic, sem '/50' |
| `app/routes/dash/review.$slug.tsx:202` | `bg-foreground/8` | revisão pública: bolinha com o número de cada ação | bg-secondary (já usado ao lado: text-secondary-foreground) |

**`opacity-NN` como cor** (5)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/bulk/BulkArchiveDialog.tsx:36` | `opacity-50` | janela de arquivar em lote: texto de lista vazia/aviso | text-secondary-foreground: texto sobre fundo neutro de diálogo |
| `app/components/features/leads/LeadDetail.tsx:49` | `opacity-50` | Leads, painel de detalhe: data do lead | text-secondary-foreground: texto sobre fundo neutro |
| `app/components/features/media/ContentReorderDialog.tsx:99` | `opacity-60` | janela 'Reordenar conteúdo': rótulo da miniatura sem imagem (texto pequeno em caixa alta) | text-secondary-foreground |
| `app/components/features/media/WorkFileThumbnail.tsx:48` | `opacity-70` | arquivos de trabalho: tipo do arquivo (ex. PDF) na miniatura | text-secondary-foreground |
| `app/components/uzzina/UAdminItemCard.tsx:50` | `opacity-50` | Admin (Parceiros, Usuários): subtítulo do cartão de cada item | text-secondary-foreground; o cartão é neutro |

**Hover do botão Secundário escrito à mão com `color-mix`** (4)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/prism/button.tsx:28` | `hover:border-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]`, `hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]` | todos os botões cinzas (variante Secundário: Filtrar, Cancelar, etc.) em hover | `hover:bg-secondary-hover` e `hover:border-secondary-hover`. A mistura de 5% do texto sobre o cinza dá uma diferença parecida (cerca de 0,05 de luminosidade), mas muda com a cor do texto da paleta; o token novo depende só do fundo |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:78` | `border-[color-mix(...)]`, `bg-[color-mix(...)]` (mesma fórmula) | Admin > Temas, pré-visualização: botão "Filtrar" em hover | acompanhar o `button.tsx`; é a cópia da fórmula do botão real |

## 7. Grupo E: dúvida (32)

**Secundário (`bg-secondary`)** (8)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/CalendarDayCell.tsx:69` | `hover:bg-secondary/50`, `dark:hover:bg-secondary/20` | calendário de ações (mês/semana): realce do dia ao passar o mouse, /50 no claro e /20 no escuro | opaco a 50%/20%: mistura com o fundo; ver D4 |
| `app/components/features/DnD.tsx:12` | `bg-secondary/50` | Kanban (fases e prioridades): realce da coluna quando um cartão é arrastado sobre ela | bg-secondary/50; ver D4 |
| `app/components/prism/command.tsx:276` | `data-focused:bg-secondary`, `data-[checked=true]:bg-secondary`, `data-[selected=true]:bg-secondary` | busca global (Ctrl+K): item com foco, marcado (checked) ou selecionado | foco e item marcado têm o mesmo cinza; um item marcado e focado não muda ao receber o foco |
| `app/components/ui-sections/TokensFocusSection.tsx:548` | `bg-secondary`, `focus:bg-secondary` | galeria /ui, Foco: demonstração do título editável (repouso e foco são bg-secondary) | a demonstração não mostra mudança ao focar; confirmar contra o campo real ActionItemTitleInput |

**Transparência sobre o texto principal (`foreground/NN`)** (12)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/NotificationsPage.tsx:153` | `text-foreground/70` | página de Notificações: texto do comentário quando a notificação já foi lida | texto a 70% |
| `app/components/features/NotificationsPage.tsx:159` | `text-foreground/70` | página de Notificações: aviso 'Você foi mencionado sem texto' (itálico) | texto a 70% |
| `app/components/features/NotificationsPage.tsx:164` | `text-foreground/80` | página de Notificações: nome do autor (negrito) | texto a 80% |
| `app/components/features/NotificationsPage.tsx:169` | `text-foreground/80` | página de Notificações: título da ação (negrito) | texto a 80% |
| `app/components/features/home/DashboardMetrics.tsx:267` | `text-foreground/80` | Hoje, quadro de métricas: texto do percentual ao lado da barra | texto a 80% |
| `app/components/features/profile/CustomThemePanel.tsx:109` | `border-foreground/10` | Minha Conta > Aparência > tema Personalizado: bloco do modo claro e do escuro | a borda usa o texto principal da PÁGINA, não o texto escolhido para o bloco; num bloco escuro sobre página clara a borda fica quase invisível |
| `app/components/layout/AppBar.tsx:85` | `border-foreground/10` | barra flutuante de atalhos no rodapé da tela (AppBar) | borda /10 nos dois modos; o padrão do DS24 é /5 no claro e /10 no escuro |
| `app/components/layout/Header.tsx:493` | `text-foreground/80` | menu de notificações (sino do topo): linha 'Fulano mencionou você na ação...' | texto a 80% |
| `app/components/planning/PlanningSuggestionsList.tsx:226` | `text-foreground/90` | Planejamento, lista de sugestões: texto do briefing | texto a 90%; praticamente igual ao texto principal |
| `app/routes/app/profile.tsx:152` | `border-foreground/10` | Minha Conta > Aparência: bloco 'Modo claro/Modo escuro' da cor vívida das fases | borda usa o texto da página, mas o bloco tem fundo fixo próprio (claro ou escuro) |
| `app/routes/app/profile.tsx:989` | `text-foreground/80` | Minha Conta > Conta: e-mail da conta | texto a 80% |
| `app/routes/dash/review.$slug.tsx:273` | `text-foreground/80` | revisão pública: texto da legenda | texto a 80% |

**`opacity-NN` como cor** (1)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/prism/calendar.tsx:309` | `[&>span]:opacity-70` | seletor de datas: textos pequenos dentro do dia (ex. número da semana/ponto) a 70% | não verificado o que é o span; ver nota |

**Preto/branco com transparência** (7)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/media/InstagramPreview.tsx:92` | `bg-black/60` | aba Instagram > pré-visualização: etiqueta 'vídeo' no canto da imagem | controle com fundo sobre imagem; a regra de 12/11 (image-icon) pede sem fundo |
| `app/components/features/media/InstagramPreview.tsx:159` | `bg-black/50 + hover:bg-black/70` | aba Instagram > pré-visualização: seta voltar do carrossel, sobre a imagem | idem |
| `app/components/features/media/InstagramPreview.tsx:170` | `bg-black/50 + hover:bg-black/70` | aba Instagram > pré-visualização: seta avançar do carrossel, sobre a imagem | idem |
| `app/components/features/media/InstagramPreview.tsx:186` | `bg-white/40` | aba Instagram > pré-visualização: bolinhas do carrossel (não ativas) | indicador sobre imagem |
| `app/components/features/media/InstagramPreview.tsx:193` | `bg-black/60` | aba Instagram > pré-visualização: contador 'n/N' no canto da imagem | idem ao item 92 |

**Fórmulas antigas do secundário mostradas no editor de temas** (4)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/admin/themes/ThemeColorInspector.tsx:702` e `:703` | `color-mix(... fg 5% / 10% ...)` | Admin > Temas > editor de cores: linha "Fundo neutro" (amostra e legenda "Texto em transparência 5% / 10%") | descreve o secundário como película do texto, o que deixou de ser verdade no DS28 (agora é o fundo mais ou menos 0,036 / 0,098 de luminosidade). O DS21 (editor de cores) está em andamento; decidir se esta linha é ajustada aqui ou no DS21 |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:712` e `:713` | `color-mix(... fg 65% ...)` | mesma tela: linha "Texto secundário" ("Texto a 65%") | idem; no DS28 o texto secundário é o fundo menos 0,512 / mais 0,549 |

## 8. Grupo C: manter (346)

Transparência intencional ou item que já está correto. Fica fora dos "para trocar", mas listado para auditoria.

**Secundário** (88)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/client/ClientCalendar.tsx:132` | `bg-secondary` | calendário do portal do cliente: faixa com os dias da semana | faixa neutra sem botões; sobre fundo da página |
| `app/components/client/ClientCalendar.tsx:199` | `hover:bg-secondary` | calendário do portal do cliente: botão de cada ação dentro do dia (hover) | transparente em repouso; o cinza só aparece no hover |
| `app/components/features/HelpPage.tsx:339` | `bg-secondary` | Ajuda: item ativo do índice lateral (fundo) | repouso do item ativo |
| `app/components/features/NotificationsPage.tsx:144` | `focus-visible:bg-secondary` | página de Notificações: foco do teclado em cada notificação | transparente em repouso; foco mostra o cinza |
| `app/components/features/action-drawer/ObservationsTab.tsx:192` | `bg-secondary` | gaveta da ação, aba Observações: fundo da área de comentários | superfície neutra opaca; balões ficam em bg-card por cima |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:331` | `bg-secondary` | Admin, editor de tema: linha de seção aberta (fundo) | repouso |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:424` | `bg-secondary` | Admin, editor de tema: linha de seção aberta (fundo) | repouso |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:896` | `bg-secondary` | Admin, editor de tema: linha de seção aberta (fundo) | repouso |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:86` | `bg-secondary` | Admin, pré-visualização: classe de hover do botão Contorno (espelha o botão real) | transparente em repouso |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:94` | `bg-secondary` | Admin, pré-visualização: classe de hover do botão Fantasma (espelha o botão real) | transparente em repouso |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:350` | `bg-secondary` | Admin, pré-visualização: linha de exemplo do menu | neutra, sobre o menu de exemplo |
| `app/components/features/home/DashboardMetrics.tsx:204` | `bg-secondary` | Hoje, métricas: trilho vazio da barra de progresso | trilho neutro, as barras coloridas ficam por cima |
| `app/components/features/home/DashboardMetrics.tsx:221` | `bg-secondary` | Hoje, métricas: trilho da barra de progresso por fase | idem |
| `app/components/features/leads/LeadCard.tsx:22` | `hover:bg-secondary` | Leads: cartão de lead na lista (hover). Selecionado é primário | transparente em repouso |
| `app/components/features/media/ContentReorderDialog.tsx:514` | `bg-secondary` | janela 'Reordenar conteúdo': caixa de aviso em texto | superfície neutra |
| `app/components/features/media/ContentReorderDialog.tsx:522` | `bg-secondary` | janela 'Reordenar conteúdo': estado vazio tracejado | superfície neutra |
| `app/components/layout/Header.tsx:458` | `bg-secondary` | menu de notificações (sino): faixa do título 'Notificações' | faixa neutra no popover |
| `app/components/layout/Header.tsx:486` | `focus-visible:bg-secondary` | menu de notificações (sino): foco do teclado numa notificação | transparente em repouso |
| `app/components/layout/Header.tsx:514` | `bg-secondary` | menu de notificações (sino): faixa do rodapé 'Ver todas as notificações' | faixa neutra |
| `app/components/layout/Header.tsx:660` | `bg-secondary` | menu do avatar: bolinha da opção de tema Personalizado (não selecionada) | amostra neutra |
| `app/components/layout/PartnersBoard.tsx:36` | `bg-secondary` | lista de Parceiros: caixa tracejada 'nenhum parceiro' | superfície neutra |
| `app/components/planning/PlanningCalendarView.tsx:81` | `bg-secondary` | Planejamento, calendário: faixa dos dias da semana | faixa neutra |
| `app/components/planning/PlanningCalendarView.tsx:109` | `bg-secondary` | Planejamento, calendário: dias de outro mês (com opacity-60) | estado 'fora do mês' |
| `app/components/planning/PlanningCalendarView.tsx:189` | `hover:bg-secondary` | Planejamento, calendário: botão 'Aprovar' de uma sugestão (hover) | botão sobre bg-card; transparente em repouso |
| `app/components/planning/PlanningCalendarView.tsx:207` | `hover:bg-secondary` | Planejamento, calendário: botão 'Descartar' de uma sugestão (hover) | idem |
| `app/components/planning/PlanningSuggestionsList.tsx:110` | `bg-secondary` | Planejamento, lista: filtro rápido 'Todas' (não ativo) | chip cinza; só o texto muda no hover |
| `app/components/planning/PlanningSuggestionsList.tsx:121` | `bg-secondary` | Planejamento, lista: filtro rápido 'Pendentes' | idem |
| `app/components/planning/PlanningSuggestionsList.tsx:132` | `bg-secondary` | Planejamento, lista: filtro rápido 'Aprovadas' | idem |
| `app/components/planning/PlanningSuggestionsList.tsx:143` | `bg-secondary` | Planejamento, lista: filtro rápido 'Rejeitadas' | idem |
| `app/components/prism/accordion.tsx:35` | `data-open:bg-secondary` | acordeão (Accordion): item aberto | fundo do item aberto; o título só sublinha no hover |
| `app/components/prism/badge.tsx:10` | `bg-secondary` | selo (Badge) variante secundária usado como link: hover | repouso do selo secundário |
| `app/components/prism/badge.tsx:19` | `[a]:hover:bg-secondary` | selo (Badge) contorno usado como link: hover | transparente em repouso |
| `app/components/prism/badge.tsx:20` | `hover:bg-secondary` | selo (Badge) fantasma: hover | transparente em repouso |
| `app/components/prism/button-group.tsx:89` | `bg-secondary` | grupo de botões: rótulo/adereço de texto dentro do grupo | superfície neutra |
| `app/components/prism/button.tsx:26` | `hover:bg-secondary`, `aria-expanded:bg-secondary` | botão Contorno (outline): hover e aberto (aria-expanded) | transparente em repouso |
| `app/components/prism/button.tsx:28` | `bg-secondary` | botão Secundário (cinza): aberto (aria-expanded); repouso já é bg-secondary | repouso do botão Secundário (fundo) |
| `app/components/prism/button.tsx:30` | `hover:bg-secondary`, `aria-expanded:bg-secondary` | botão Fantasma (ghost): hover e aberto | transparente em repouso |
| `app/components/prism/calendar.tsx:82` | `bg-secondary`, `after:bg-secondary` | seletor de datas: começo da faixa selecionada (fundo do bloco) | faixa de seleção |
| `app/components/prism/calendar.tsx:85` | `bg-secondary`, `after:bg-secondary` | seletor de datas: fim da faixa selecionada (fundo do bloco) | faixa de seleção |
| `app/components/prism/calendar.tsx:349` | `data-[hovered]:bg-secondary` | seletor de datas: mês/ano no cabeçalho (hover) | transparente em repouso |
| `app/components/prism/combobox.tsx:176` | `data-focused:bg-secondary`, `data-highlighted:bg-secondary` | seletor com busca: item destacado pelo teclado ou mouse | realce de item; transparente em repouso |
| `app/components/prism/dropdown-menu.tsx:94` | `focus:bg-secondary` | menus suspensos: item com foco | realce; transparente em repouso |
| `app/components/prism/dropdown-menu.tsx:96` | `focus:bg-secondary` | menus suspensos: item com marca (checkbox) com foco | idem |
| `app/components/prism/dropdown-menu.tsx:98` | `focus:bg-secondary` | menus suspensos: item de rádio com foco | idem |
| `app/components/prism/dropdown-menu.tsx:163` | `focus:bg-secondary`, `data-open:bg-secondary` | menus suspensos: gatilho de submenu (foco e aberto) | realce |
| `app/components/prism/input-group.tsx:70` | `**:data-[slot=kbd]:bg-secondary` | grupo de campo: etiqueta de atalho (kbd) dentro do campo | superfície neutra |
| `app/components/prism/kbd.tsx:10` | `bg-secondary` | atalhos de teclado (Kbd), ex. no Ctrl+K e menus | superfície neutra |
| `app/components/prism/select.tsx:207` | `focus:bg-secondary`, `data-focused:bg-secondary` | seletor: item destacado | realce |
| `app/components/prism/slider.tsx:43` | `bg-secondary` | controle deslizante (Slider): trilho | trilho neutro |
| `app/components/prism/tabs.tsx:29` | `data-[focus-visible]:bg-secondary`, `hover:bg-secondary` | abas: hover e foco de qualquer aba | transparente em repouso |
| `app/components/prism/tabs.tsx:36` | `data-[selected]:data-[focus-visible]:bg-secondary` | abas (variante gaveta): aba selecionada com foco do teclado | realce |
| `app/components/ui-sections/GalleryHelperComponents.tsx:117` | `hover:bg-secondary`, `focus-visible:bg-secondary` | galeria /ui: itens do índice lateral (hover e foco) | transparente em repouso |
| `app/components/ui-sections/GalleryHelperComponents.tsx:177` | `bg-secondary` | galeria /ui: subitem ativo do índice (fundo) | repouso |
| `app/components/ui-sections/GalleryHelperComponents.tsx:226` | `bg-secondary` | galeria /ui: aba ativa do menu superior | repouso |
| `app/components/ui-sections/TokensColorsSection.tsx:287` | `bg-secondary` | galeria /ui, Cores: quadrado de exemplo do secundário | amostra do token |
| `app/components/ui-sections/TokensColorsSection.tsx:295` | `bg-secondary` | galeria /ui, Cores: quadrado de exemplo do secundário com texto | amostra do token |
| `app/components/ui-sections/TokensFocusSection.tsx:287` | `bg-secondary` | galeria /ui, Foco: quadrado de exemplo | amostra |
| `app/components/ui-sections/TokensFocusSection.tsx:508` | `focus-visible:bg-secondary` | galeria /ui, Foco: demonstração do botão Fechar da gaveta | transparente em repouso |
| `app/components/ui-sections/TokensFocusSection.tsx:520` | `hover:bg-secondary`, `focus-visible:bg-secondary` | galeria /ui, Foco: demonstração de item de lista | transparente em repouso |
| `app/components/ui-sections/TokensFocusSection.tsx:630` | `bg-secondary` | galeria /ui, Foco: caixa de exemplo | superfície neutra |
| `app/components/ui-sections/TokensSpacingSection.tsx:40` | `bg-secondary` | galeria /ui, Espaçamento: fundo da régua | superfície neutra |
| `app/components/ui-sections/UzzinaAIProgressBarSection.tsx:28` | `bg-secondary` | galeria /ui, Barra de IA: caixa de demonstração | superfície neutra |
| `app/components/uzzina/UAIAllowanceMeter.tsx:26` | `bg-secondary` | medidor de cota de IA (barra): trilho | trilho neutro |
| `app/components/uzzina/UAIProgressBar.tsx:169` | `bg-secondary` | barra de progresso da IA (topo da gaveta): trilho | trilho neutro |
| `app/components/uzzina/UAvatarSelector.tsx:59` | `hover:bg-secondary` | seletor de avatares (Minha Conta): hover do cartão não selecionado | transparente em repouso |
| `app/components/uzzina/UPhaseCombobox.tsx:262` | `bg-secondary` | seletor de fase: bolinha da opção sem fase | amostra neutra |
| `app/routes/app/leads.tsx:246` | `bg-secondary` | Leads: contador ao lado do título 'Leads' | selo neutro |
| `app/routes/app/partner/$slug.tsx:160` | `bg-secondary` | página do parceiro: mensagem de erro 'Parceiro não encontrado' | tela inteira neutra |
| `app/routes/app/planejamento.tsx:922` | `bg-secondary` | Planejamento: caixa do alternador Lista/Calendário | superfície neutra |
| `app/routes/app/planejamento.tsx:1010` | `hover:bg-secondary` | Planejamento: cartão de sugestão, hover | sobre bg-card; transparente em repouso |
| `app/routes/app/profile.tsx:272` | `bg-secondary` | Minha Conta > Aparência: faixa do mini-desenho da página do parceiro | superfície neutra do exemplo |
| `app/routes/app/profile.tsx:1369` | `bg-secondary` | Minha Conta > IA: bloco pulsante de carregamento | superfície neutra |
| `app/routes/app/profile.tsx:1414` | `bg-secondary` | Minha Conta > IA: caixa de aviso | superfície neutra |
| `app/routes/app/profile.tsx:1497` | `bg-secondary` | Minha Conta > IA: seletor de modelo (gatilho) | superfície neutra; ver D1 sobre hover |
| `app/routes/app/profile.tsx:1510` | `bg-secondary` | Minha Conta > IA: círculo atrás do ícone do modelo | superfície neutra |
| `app/routes/app/profile.tsx:1580` | `bg-secondary` | Minha Conta > IA: seletor de modelo (gatilho) | idem |
| `app/routes/dash/review.$slug.tsx:254` | `[&_th]:bg-secondary` | revisão pública: cabeçalho de tabela da legenda | superfície neutra |
| `app/tailwind.css:611` | `bg-secondary` | editor de texto (Tiptap): linha de cabeçalho de tabela | superfície neutra |

**`foreground/NN`** (61)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/ActionComments/CommentItem.tsx:73` | `border-foreground/5`, `dark:border-foreground/10` | gaveta da ação, Observações: balão de comentário | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/features/GlobalSearchCommand.tsx:672` | `border-foreground/10` | busca global (Ctrl+K): bolinha de cor ao lado dos comandos de 'cor primária' | borda de amostra sobre cor escolhida |
| `app/components/features/RichTextEditor.tsx:651` | `border-foreground/5`, `dark:border-foreground/10` | editor de texto: barra de bolha de formatação que aparece sobre a seleção | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:138` | `border-foreground/10` | Admin, editor de cores de tema: barra do controle de luminosidade | borda sobre degradê colorido |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:162` | `border-foreground/10` | Admin, editor de cores de tema: barra do controle de croma | borda sobre degradê colorido |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:186` | `border-foreground/10` | Admin, editor de cores de tema: barra do controle de matiz | borda sobre degradê colorido |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:231` | `border-foreground/15` | Admin, editor de cores de tema: amostra de cor no modo claro | borda sobre cor escolhida (/15, enquanto as barras usam /10; ver D3) |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:240` | `border-foreground/15` | Admin, editor de cores de tema: amostra de cor no modo escuro | idem |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:443` | `border-foreground/15` | Admin, editor de cores de tema: amostra do cartão (claro) | idem |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:458` | `border-foreground/15` | Admin, editor de cores de tema: amostra do cartão (escuro) | idem |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:578` | `border-foreground/15` | Admin, editor de cores de tema: amostra (claro) | idem |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:587` | `border-foreground/15` | Admin, editor de cores de tema: amostra (escuro) | idem |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:919` | `border-foreground/15` | Admin, editor de cores de tema: amostra de cor de paleta | idem |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:340` | `border-foreground/5`, `dark:border-foreground/10` | Admin, pré-visualização do tema: menu de exemplo | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/layout/TimelineBoard.tsx:305` | `bg-foreground/50` | Linha do tempo: alça de arrastar o início de uma barra de ação | traço sobre cartão colorido pela fase |
| `app/components/layout/TimelineBoard.tsx:332` | `bg-foreground/50` | Linha do tempo: alça de arrastar o fim de uma barra de ação | traço sobre cartão colorido pela fase |
| `app/components/planning/PlanningCalendarView.tsx:178` | `text-secondary-foreground/60` | Planejamento, calendário: ícone de alça (aparece só ao passar o mouse) no cartão da sugestão | ícone (decisão de ícones fica fora deste ticket) |
| `app/components/prism/button-group.tsx:121` | `group-has-data-[variant=default]/button-group:bg-primary-foreground/30` | separador entre botões de um grupo, quando o botão é o principal | branco do texto do botão principal a 30%, sobre a cor primária |
| `app/components/prism/color-field.tsx:10` | `placeholder:text-foreground/40` | campo de cor (hexadecimal): texto-guia | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/combobox.tsx:141` | `border-foreground/5`, `dark:border-foreground/10` | lista aberta de seletores com busca (Combobox) | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/combobox.tsx:357` | `placeholder:text-foreground/40` | seletor com busca (chips): campo de digitar | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/command.tsx:157` | `placeholder:text-foreground/40` | busca global (Ctrl+K) e paleta de comandos: campo de busca | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/dialog.tsx:125` | `border-foreground/5`, `dark:border-foreground/10` | janela de diálogo (Dialog) | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/dropdown-menu.tsx:46` | `border-foreground/5`, `dark:border-foreground/10` | menus suspensos (Dropdown), ex. menu do avatar no topo | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/dropdown-menu.tsx:189` | `border-foreground/5`, `dark:border-foreground/10` | submenus dos menus suspensos | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/input.tsx:9` | `placeholder:text-foreground/40` | campos de texto (PrismInput): texto-guia | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/popover.tsx:76` | `border-foreground/5`, `dark:border-foreground/10` | caixa flutuante (Popover) em todo o app | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/select.tsx:59` | `data-placeholder:text-foreground/40` | seletor: texto 'Selecione...' enquanto nada está escolhido | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/select.tsx:84` | `data-placeholder:text-foreground/40` | seletor (gatilho): texto-guia | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/select.tsx:139` | `border-foreground/5`, `dark:border-foreground/10` | lista aberta dos seletores (Select) | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/sheet.tsx:76` | `border-foreground/5`, `dark:border-foreground/10` | painel lateral/inferior (Sheet) | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/prism/skeleton.tsx:21` | `bg-foreground/5` | bloco cinza pulsante de carregamento (Skeleton) | película de 5% adapta-se a qualquer fundo, inclusive cartão de fase; bg-secondary também serviria (ver D5) |
| `app/components/prism/textarea.tsx:15` | `placeholder:text-foreground/40` | campos de texto longo: texto-guia | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/time-field.tsx:14` | `placeholder:text-foreground/40` | campo de hora: texto-guia | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/time-field.tsx:64` | `data-placeholder:text-foreground/40` | campo de hora: segmentos ainda vazios (hh:mm) | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/components/prism/tooltip.tsx:33` | `border-foreground/5`, `dark:border-foreground/10` | dica ao passar o mouse (Tooltip) | borda de container /5 claro e /10 escuro (DS24) |
| `app/components/ui-sections/UzzinaTimelinePreviewSection.tsx:363` | `bg-foreground/50` | galeria /ui, Linha do tempo: alça do início (cópia da real) | acompanha TimelineBoard |
| `app/components/ui-sections/UzzinaTimelinePreviewSection.tsx:374` | `bg-foreground/50` | galeria /ui, Linha do tempo: alça do fim (cópia da real) | acompanha TimelineBoard |
| `app/components/uzzina/UAvatarSelector.tsx:59` | `ring-foreground/5` | seletor de avatares: anel do avatar selecionado | anel suave /5 (sem par escuro; ver D3) |
| `app/components/uzzina/UAvatarUpload.tsx:55` | `bg-foreground/40` | Minha Conta e formulários: camada escura sobre a foto do avatar ao passar o mouse (ícone de upload) | overlay sobre imagem |
| `app/routes/dash/login.tsx:97` | `[&_svg]:text-foreground/40` | login do portal /dash: ícone do campo de e-mail | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/routes/dash/login.tsx:124` | `[&_svg]:text-foreground/40` | login do portal /dash: ícone do campo de senha | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/routes/forgot-password.tsx:120` | `[&_svg]:text-foreground/40` | tela de esqueci a senha: ícone do campo de e-mail | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/routes/login.tsx:89` | `[&_svg]:text-foreground/40` | tela de login: ícone dentro do campo de e-mail | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/routes/login.tsx:120` | `[&_svg]:text-foreground/40` | tela de login: ícone dentro do campo de senha | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/routes/reset-password.tsx:190` | `[&_svg]:text-foreground/40` | tela de redefinir senha: ícone do campo | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/routes/reset-password.tsx:233` | `[&_svg]:text-foreground/40` | tela de redefinir senha: ícone do campo (confirmação) | texto suave a 40%, aprovado (placeholder e ícone de campo) |
| `app/tailwind.css:497` | `bg-foreground/10;` | barra de rolagem de todo o app (polegar da barra) | película de 10%, sobre qualquer fundo |
| `app/tailwind.css:508` | `bg-foreground/20;` | barra de rolagem, ao passar o mouse | película de 20% |
| `app/tailwind.css:615` | `text-foreground/50;` | editor de texto (Tiptap): texto-guia 'Escreva...' quando o campo está vazio | texto suave de placeholder |

**`opacity-NN` como estado, ícone ou texto que herda a cor** (67)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/ActionComments/CommentInput.tsx:97` | `opacity-60` | gaveta, Observações: ícone de cadeado ao lado do campo | ícone |
| `app/components/features/ActionComments/CommentItem.tsx:97` | `opacity-75` | gaveta, Observações: linha do autor dentro do balão de comentário | herda a cor do balão (primário ou card); text-secondary-foreground não funcionaria sobre o primário |
| `app/components/features/ActionComments/CommentItem.tsx:131` | `opacity-70` | gaveta, Observações: hora do comentário dentro do balão | idem |
| `app/components/features/ActionItem.tsx:340` | `opacity-50` | cartão de ação (Kanban, calendário, Hoje): data da ação | herda a cor do texto da fase; text-secondary-foreground perderia o tom da fase |
| `app/components/features/ActionVariants/ActionBlockVariant.tsx:74` | `opacity-50` | cartão de ação em bloco: data da ação | idem |
| `app/components/features/CalendarDayCell.tsx:80` | `opacity-25` | calendário de ações: dias de outro mês | estado 'fora do mês' |
| `app/components/features/CalendarDayCell.tsx:87` | `opacity-30` | calendário de ações: número de ações do dia, ao lado do dia | texto suave a 30%, herda a cor |
| `app/components/features/CalendarDayCell.tsx:212` | `opacity-50` | calendário de ações: ação sem vínculo | estado |
| `app/components/features/Content.tsx:77` | `group-hover/action:opacity-80` | imagens de conteúdo: escurece 20% ao passar o mouse no cartão | efeito de hover sobre imagem |
| `app/components/features/DnD.tsx:68` | `opacity-20` | cartão que está sendo arrastado | estado de arrasto |
| `app/components/features/DnD.tsx:120` | `opacity-20` | item que está sendo arrastado | estado de arrasto |
| `app/components/features/GlobalSearchCommand.tsx:589` | `opacity-40` | busca global (Ctrl+K): dica alinhada à direita | texto suave 40%, igual ao placeholder aprovado |
| `app/components/features/GlobalSearchCommand.tsx:630` | `opacity-60` | busca global: ícone de arquivo/arquivado | ícone |
| `app/components/features/GlobalSearchCommand.tsx:632` | `opacity-40` | busca global: linha de detalhe de cada resultado | texto suave 40% |
| `app/components/features/InstagramFeedSection.tsx:49` | `hover:opacity-60` | feed do Instagram: miniatura ao passar o mouse | hover sobre imagem |
| `app/components/features/action-drawer/ActionFormDrawer.tsx:1604` | `opacity-75` | gaveta da ação: durante 'recriar' | estado de carregamento |
| `app/components/features/action-drawer/EssentialsTab.tsx:441` | `opacity-40` | gaveta, aba Essencial: campos enquanto a IA gera | estado de carregamento |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:343` | `opacity-60` | Admin, editor de tema: seta de recolher da seção | ícone |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:568` | `opacity-60` | Admin, editor de tema: cadeado | ícone |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:908` | `opacity-60` | Admin, editor de tema: seta de recolher | ícone |
| `app/components/features/admin/themes/ThemeColorInspector.tsx:993` | `opacity-60` | Admin, editor de tema: cadeado | ícone |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:345` | `opacity-60` | Admin, pré-visualização: ícone Copiar | ícone |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:354` | `opacity-60` | Admin, pré-visualização: ícone Calendário | ícone |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:358` | `opacity-60` | Admin, pré-visualização: ícone Mais | ícone |
| `app/components/features/admin/themes/ThemePreviewPane.tsx:367` | `opacity-60` | Admin, pré-visualização: ícone Lixeira | ícone |
| `app/components/features/leads/LeadCard.tsx:31` | `opacity-60` | Leads: ícone de concluído no cartão | ícone |
| `app/components/features/leads/LeadCard.tsx:33` | `opacity-50` | Leads: ícone de relógio no cartão | ícone |
| `app/components/features/leads/LeadCard.tsx:37` | `opacity-50` | Leads: linha de data do cartão | herda a cor; no cartão selecionado o fundo é primário e text-secondary-foreground ficaria ilegível |
| `app/components/features/media/InstagramPreview.tsx:62` | `opacity-30` | aba Instagram: ícone de 'sem imagem' no quadro | ícone/marca-d'água |
| `app/components/features/profile/CustomThemePanel.tsx:121` | `opacity-70` | Minha Conta > tema Personalizado: rótulo dentro do bloco de cor | herda o texto escolhido para o bloco |
| `app/components/features/profile/CustomThemePanel.tsx:144` | `opacity-70` | Minha Conta > tema Personalizado: botão de texto dentro do bloco | herda o texto escolhido para o bloco |
| `app/components/features/profile/CustomThemePanel.tsx:158` | `opacity-70` | Minha Conta > tema Personalizado: rótulo 'Cor da sombra' | idem |
| `app/components/features/profile/CustomThemePanel.tsx:174` | `opacity-70` | Minha Conta > tema Personalizado: rótulo 'Opacidade da sombra' | idem |
| `app/components/features/profile/CustomThemePanel.tsx:278` | `opacity-80` | Minha Conta > tema Personalizado: texto de apoio | idem |
| `app/components/planning/PlanningCalendarView.tsx:109` | `opacity-60` | Planejamento, calendário: dias de outro mês | estado |
| `app/components/planning/PlanningCalendarView.tsx:163` | `opacity-50` | Planejamento, calendário: sugestão rejeitada | estado |
| `app/components/planning/PlanningCalendarView.tsx:262` | `opacity-60` | Planejamento: ícone de calendário | ícone |
| `app/components/planning/PlanningSuggestionsList.tsx:166` | `opacity-60` | Planejamento, lista: sugestão rejeitada | estado |
| `app/components/prism/accordion.tsx:67` | `opacity-60` | acordeão: seta | ícone |
| `app/components/prism/accordion.tsx:71` | `opacity-60` | acordeão: seta (aberto) | ícone |
| `app/components/prism/alert.tsx:7` | `[&>svg]:opacity-10` | alerta (Alert): ícone grande de fundo | ícone decorativo |
| `app/components/prism/alert.tsx:67` | `opacity-60` | alerta (Alert): descrição abaixo do título | herda a cor do alerta (erro, aviso etc.); token neutro não serviria |
| `app/components/prism/calendar.tsx:88` | `opacity-50` | seletor de datas: dia indisponível (início da faixa) | estado |
| `app/components/prism/calendar.tsx:91` | `opacity-50` | seletor de datas: dia indisponível | estado |
| `app/components/prism/combobox.tsx:58` | `opacity-60` | seletor com busca: seta | ícone |
| `app/components/prism/command.tsx:150` | `opacity-60` | busca global: ícone de lupa | ícone |
| `app/components/prism/date-range-picker.tsx:127` | `opacity-60` | seletor de período: ícone de calendário | ícone |
| `app/components/prism/date-range-picker.tsx:139` | `opacity-60` | seletor de período: seta | ícone |
| `app/components/prism/dropdown-menu.tsx:163` | `[&_svg]:opacity-50` | menus suspensos: ícones dos itens | ícone |
| `app/components/prism/select.tsx:92` | `opacity-60` | seletor: seta | ícone |
| `app/components/prism/select.tsx:181` | `opacity-60` | seletor: lupa da busca | ícone |
| `app/components/ui-sections/TokensColorsSection.tsx:677` | `opacity-90` | galeria /ui, Cores: demonstração sobre cor de fase | herda a cor da fase |
| `app/components/ui-sections/TokensColorsSection.tsx:698` | `opacity-90` | galeria /ui, Cores: demonstração sobre cor de fase | herda a cor da fase |
| `app/components/ui-sections/TokensIconsSection.tsx:826` | `opacity-60` | galeria /ui, Ícones: exemplo | ícone |
| `app/components/ui-sections/TokensIconsSection.tsx:827` | `opacity-60` | galeria /ui, Ícones: exemplo | ícone |
| `app/components/ui-sections/TokensIconsSection.tsx:839` | `opacity-60` | galeria /ui, Ícones: exemplo | ícone |
| `app/components/ui-sections/TokensIconsSection.tsx:840` | `opacity-60` | galeria /ui, Ícones: exemplo | ícone |
| `app/components/uzzina/UColorPickerDropdown.tsx:309` | `opacity-60` | seletor de cor: seta | ícone |
| `app/components/uzzina/UPaletteEditor.tsx:275` | `opacity-60` | editor de paleta: alça de arrastar | ícone |
| `app/components/uzzina/UPaletteEditor.tsx:276` | `opacity-30` | editor de paleta: estado desativado | estado |
| `app/components/uzzina/UPhaseIcon.tsx:76` | `opacity-10` | ícone da fase: traço decorativo de fundo | ícone |
| `app/routes/app.tsx:264` | `opacity-20` | tela de carregamento do app: logotipo apagado | marca-d'água |
| `app/routes/app/admin/partners.tsx:127` | `opacity-70` | Admin > Parceiros: cartões de parceiros arquivados | estado 'arquivado' |
| `app/routes/app/leads.tsx:196` | `opacity-30` | Leads: ícone de estado vazio | ícone |
| `app/routes/app/leads.tsx:206` | `opacity-30` | Leads: ícone de erro | ícone |
| `app/routes/app/leads.tsx:217` | `opacity-30` | Leads: ícone de estado vazio | ícone |
| `app/routes/app/leads.tsx:225` | `opacity-30` | Leads: ícone de estado vazio | ícone |

**`opacity-0/100` de mostrar/ocultar, animação e hover** (113), mesma regra, não são cor. Por arquivo (file:linhas):

- `app/components/features/ActionComments/CommentInput.tsx`: linhas 177
- `app/components/features/ActionComments/CommentItem.tsx`: linhas 107
- `app/components/features/ActionVariants/ActionLineVariant.tsx`: linhas 62, 88
- `app/components/features/CalendarDayCell.tsx`: linhas 91
- `app/components/features/bulk/BulkDateTimeDialog.tsx`: linhas 106, 107, 149, 150
- `app/components/features/media/ContentReorderDialog.tsx`: linhas 111, 112, 114, 115
- `app/components/features/media/InstagramPreview.tsx`: linhas 162, 173
- `app/components/features/profile/CustomThemePanel.tsx`: linhas 144
- `app/components/layout/CategoriesBoard.tsx`: linhas 81
- `app/components/layout/PartnersBoard.tsx`: linhas 95
- `app/components/layout/TimelineBoard.tsx`: linhas 297, 298, 324, 325
- `app/components/planning/PlanningCalendarView.tsx`: linhas 178
- `app/components/prism/alert.tsx`: linhas 21
- `app/components/prism/combobox.tsx`: linhas 188
- `app/components/prism/command.tsx`: linhas 289
- `app/components/prism/dropdown-menu.tsx`: linhas 139
- `app/components/prism/select.tsx`: linhas 221
- `app/components/prism/sheet.tsx`: linhas 48, 76
- `app/components/ui-sections/UzzinaTimelinePreviewSection.tsx`: linhas 358, 369
- `app/components/uzzina/UAIModelSelect.tsx`: linhas 54, 80
- `app/components/uzzina/UAIProgressBar.tsx`: linhas 124, 170
- `app/components/uzzina/UAvatarUpload.tsx`: linhas 55, 56
- `app/components/uzzina/UCategoriesCombobox.tsx`: linhas 247
- `app/components/uzzina/UPaletteEditor.tsx`: linhas 275
- `app/routes/app/admin/celebrations.tsx`: linhas 289
- `app/routes/app/profile.tsx`: linhas 324, 325

**`disabled` / `data-disabled` / `aria-disabled`: `opacity-50`** (26), estado desativado. Por arquivo:

- `app/components/features/action-drawer/InstagramTab.tsx`: linhas 402
- `app/components/prism/accordion.tsx`: linhas 54
- `app/components/prism/button.tsx`: linhas 50
- `app/components/prism/calendar.tsx`: linhas 219, 254
- `app/components/prism/checkbox.tsx`: linhas 11
- `app/components/prism/color-field.tsx`: linhas 10
- `app/components/prism/combobox.tsx`: linhas 176, 318
- `app/components/prism/command.tsx`: linhas 157, 276
- `app/components/prism/date-range-picker.tsx`: linhas 119
- `app/components/prism/dropdown-menu.tsx`: linhas 90
- `app/components/prism/input-group.tsx`: linhas 70
- `app/components/prism/input.tsx`: linhas 9
- `app/components/prism/label.tsx`: linhas 11
- `app/components/prism/radio-group.tsx`: linhas 10
- `app/components/prism/select.tsx`: linhas 84, 207
- `app/components/prism/slider.tsx`: linhas 43
- `app/components/prism/tabs.tsx`: linhas 29
- `app/components/prism/textarea.tsx`: linhas 15
- `app/components/prism/time-field.tsx`: linhas 14
- `app/components/prism/toggle.tsx`: linhas 44

**Regra de ícone `[&_svg:not([class*='opacity-'])]:opacity-60`** (10), ícones em botões, campos e itens (fora do escopo, decisão de ícones separada). Por arquivo:

- `app/components/prism/badge.tsx`: linhas 4
- `app/components/prism/button-group.tsx`: linhas 89
- `app/components/prism/button.tsx`: linhas 50
- `app/components/prism/combobox.tsx`: linhas 176
- `app/components/prism/command.tsx`: linhas 276
- `app/components/prism/dropdown-menu.tsx`: linhas 90
- `app/components/prism/input-group.tsx`: linhas 70, 223
- `app/components/prism/select.tsx`: linhas 207
- `app/components/prism/toggle.tsx`: linhas 44

**Preto/branco com transparência** (7)

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/features/action-drawer/ActionDrawerPanel.tsx:85` | `bg-black/20 + dark:bg-black/80` | gaveta da ação aberta: véu escuro sobre o resto da tela (clicar fora fecha) | overlay de modal |
| `app/components/ui-sections/TokensColorsSection.tsx:195` | `border-black/10 + dark:border-white/20` | galeria /ui, Cores: borda de amostra | amostra |
| `app/components/ui-sections/TokensColorsSection.tsx:344` | `white/10` | galeria /ui, Cores: texto/amostra da película | amostra |
| `app/routes/app/profile.tsx:196` | `border-black/10 + dark:border-white/10` | Minha Conta > Aparência: borda da bolinha de amostra da paleta Personalizada | borda de amostra |

**Textos da galeria /ui que citam `bg-secondary` (não são classes aplicadas, 14)**: atualizar junto com o grupo A.

| Local | Classe | Onde aparece | Nota |
|---|---|---|---|
| `app/components/ui-sections/TokensColorsSection.tsx:283` | `bg-secondary` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensColorsSection.tsx:285` | `bg-secondary-hover` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensColorsSection.tsx:940` | `>bg-secondary</code>` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensColorsSection.tsx:962` | `>bg-secondary</code>` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:395` | `(bg-secondary),` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:396` | `focus-visible:bg-secondary`, `data-focused:bg-secondary`, `data-[focus-visible]:bg-secondary` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:399` | `bg-secondary)` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:401` | `bg-secondary)` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:403` | `bg-secondary)` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:503` | `(bg-secondary)` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/TokensFocusSection.tsx:535` | `bg-secondary)` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |
| `app/components/ui-sections/UzzinaAIProgressBarSection.tsx:120` | `bg-secondary` | texto da galeria /ui (não é classe aplicada) | atualizar a redação junto com os itens A |

## 9. Decisões que o proprietário precisa tomar

**D1. Hover e foco de itens que são transparentes em repouso: ficam em `bg-secondary`?** Menus, listas, abas, botão fantasma e contorno, seletores, itens de busca e calendários (cerca de 45 classes no grupo C) usam `bg-secondary` como realce quando o item é transparente. Não é o caso do "já é cinza". Minha recomendação: manter `bg-secondary` nesses, e reservar `bg-secondary-hover` para quando o item já é `bg-secondary` (grupo A). Alternativa: tudo que é hover ou foco usar `bg-secondary-hover` (realce mais forte, cerca de 0,05 mais escuro/claro), o que exige conferir cada menu.

**D2. Textos com 70%, 80% e 90% de opacidade (10 classes, grupo E).** Notificações (4), a linha do sino no Header, o percentual em Hoje (métricas), o e-mail em Minha Conta, a legenda na revisão pública e o briefing no Planejamento. Opções: (a) `text-foreground` sem transparência (quase igual ao que se vê hoje, a 80%/90%); (b) `text-secondary-foreground` (mais apagado, muda a hierarquia da página de Notificações); (c) manter. Recomendo (a) para 80% e 90% e (b) para os 70% de "lida" da página de Notificações.

**D3. Bordas sobre amostras e blocos coloridos.** (i) Nas amostras do editor de temas as bordas misturam `/10` e `/15`; unificar em um valor? (ii) Nos blocos com fundo e texto próprios (Minha Conta > Aparência: `CustomThemePanel.tsx:109` e `profile.tsx:152`) a borda usa o texto da página, não o do bloco; num bloco escuro sobre página clara ela some. O Tailwind já traz `border-current/10`, que usa o texto do bloco e não é classe nova. Trocar nesses dois? (iii) `AppBar.tsx:85` (barra de atalhos no rodapé) tem borda `/10` nos dois modos; alinhar ao par `/5` claro e `/10` escuro do DS24?

**D4. Realces a 50% e 20% do secundário** (arrastar cartão sobre a coluna do Kanban e fases/prioridades, hover do dia no calendário de ações, grupo Admin do menu). Com o secundário opaco, `/50` vira "metade do cinza". Manter assim, ou usar `bg-secondary` pleno nesses três casos (realce mais forte)? No Admin do menu (`Header.tsx:717`), o secundário é calculado do fundo da página, e o menu tem o fundo de popover (um pouco mais claro): o resultado muda pouco, mas só olhando na tela dá para dizer.

**D5. Cinza sólido sobre cor (grupo B).** Avatares sem foto e contadores `+N` nos cartões de ação coloridos pela fase, e quadros atrás de imagens. Opções: (a) aceitar o cinza sólido do fundo da página; (b) nos avatares do cartão de fase, usar uma película do próprio texto da fase (`bg-foreground/10`, o cartão de fase já redefine `--foreground`), que é o comportamento de antes e mantém o tom da fase. A (b) não cria classe nova. Para os quadros de imagem, recomendo (a): é só o que aparece enquanto a imagem carrega ou quando não há imagem.

**D6. Botão Secundário e seu espelho no editor de temas.** Trocar o hover feito com `color-mix` (5% do texto) por `bg-secondary-hover` e `border-secondary-hover` (grupo D), e o mesmo no `ThemePreviewPane.tsx:78`? O resultado visual é parecido, mas passa a depender só do fundo. Junto: o botão "aberto" (`aria-expanded`) deixa de ficar igual ao repouso.

**D7. O editor de temas ainda explica o secundário pela fórmula antiga** ("texto em transparência 5%/10%", "texto a 65%", `ThemeColorInspector.tsx:702-713`). Ajustar agora ou deixar com o DS21, que está em andamento?

**D8. Controles com fundo sobre a imagem do Instagram** (`InstagramPreview.tsx`: setas do carrossel `bg-black/50`, etiqueta "vídeo", contador e bolinhas). A regra de 12/11 (`image-icon`, sem fundo, branco com sombra) cobre ícones sobre imagem e foi aplicada só em `ContentReorderDialog`. Estender a estas, ou deixar como estão por serem botões e etiquetas?

**D9. Selos e etiquetas com película do texto** (grupo D): o selo padrão (`badge.tsx:9`, borda `/20`) e a etiqueta de item escolhido do seletor múltiplo (`combobox.tsx:318`, 329: borda `/20`, fundo `/10`, hover `/15`) viram `border-border`, `bg-secondary` e `bg-secondary-hover`. Posso trocar sem olhar, ou quer ver antes?

**D10. Borda de `border-border/NN` (25 usos, Apêndice B).** Hoje há bordas pontilhadas e sutis a 30–80% do `border-border`. Mantê-las? (Recomendo manter, são intencionais.)

## 10. Ordem sugerida de troca

1. **Componentes Prism de maior alcance (grupo A):** `button.tsx` (aberto do Secundário e toggles selecionados, mais o hover com `color-mix` do D6), `sheet.tsx` (botão de fechar), `badge.tsx` (link `/80`), `calendar.tsx` (dias do meio da faixa e hoje). Cada um afeta o app inteiro, então conferir em Hoje, gaveta, Planejamento e um seletor de datas, nos dois modos.
2. **Telas pontuais do grupo A:** `HelpPage.tsx`, `ThemeColorInspector.tsx` (3 linhas), galeria `GalleryHelperComponents.tsx`.
3. **Grupo D** (borda e fundo do selo e do chip, textos apagados, `review.$slug`, `$id` do portal, `Header.tsx:506`, `BulkArchiveDialog`, `LeadDetail`, `UAdminItemCard`, `ContentReorderDialog:99`, `WorkFileThumbnail`, nota da galeria).
4. **Depois das respostas:** D1 a D5 e D8 (grupos B e E), nessa ordem: primeiro o que a decisão deixa de graça (D2, D3), por último os B (D5), porque dependem de ver a tela.
5. **Galeria `/ui` e AGENTS.md:** atualizar a redação em `TokensColorsSection.tsx` e `TokensFocusSection.tsx` (14 textos listados na seção 8) e a tabela de tokens do AGENTS.md, para citar `bg-secondary-hover` onde o item já é cinza.
6. **Conferência final** (você): botões cinzas em repouso e com o mouse em cima, gaveta, menu do avatar com área Admin, um cartão de fase com avatar, nos modos claro e escuro, em Ônix, Carbono e Fúcsia.

## 11. O que não consegui verificar

- Nada foi visto na tela. A única checagem visual possível é a sua.
- Containers `bg-secondary` que guardam botão fantasma: no código só encontrei os casos do grupo A. Não abri `ObservationsTab.tsx:192` (área de comentários), `Header.tsx:458/514` (faixas do sino) e `profile.tsx:272` para ver se há botão fantasma dentro com hover igual ao fundo. Provavelmente não, mas é verificação de tela.
- Classes montadas dinamicamente (template strings, `cn()` com variáveis) só aparecem se a classe estiver escrita por inteiro no texto. Classes geradas por concatenação não são vistas pela busca.
- `sonner.tsx` (avisos) e o diálogo de comandos: não vi `border-foreground` neles; pelo AGENTS deveriam seguir o par de container. Não confirmei se herdam do Dialog.
- O formato do "antes" (película) vem do enunciado do DS28/DS33. Não comparei com um commit anterior.
- A tabela do grupo C é ampla (346) e as justificativas são curtas; amostrei o contexto de todas as linhas do grupo A, B, D e E, e dos grupos C de `foreground/NN` e `bg-secondary`; as de `opacity-NN` de ícone, mostrar/ocultar e desativado foram agrupadas pela forma da classe, sem abrir uma a uma.

## Apêndice A: comandos usados

O `rg` deste ambiente é uma função de shell que não resolve fora do shell interativo, então usei `grep -rnE` (BSD, `/usr/bin/grep`) dentro de scripts bash, com o mesmo escopo: arquivos `.ts`, `.tsx` e `.css` em `app/`, excluindo `app/routeTree.gen.ts` e `app/data/`. Equivalente em `rg`: `rg -n --glob '!app/routeTree.gen.ts' --glob '!app/data/**' '<padrão>' app`.

```bash
# linhas com foreground/NN (69)
grep -rnE --include='*.ts' --include='*.tsx' --include='*.css' --exclude=routeTree.gen.ts --exclude-dir=data 'foreground/[0-9]+' app
# cada token (82), para contar por classe
grep -rnoE ... "[^ \"'`{}]*foreground/[0-9]+[^ \"'`{}]*" app
# opacity-NN (196 tokens)
grep -rnoE ... "[^ \"'`{}]*opacity-[0-9]+[^ \"'`{}]*" app
# bg-secondary e variantes (133 tokens; 'secondary-foreground' excluído com grep -v)
grep -rnoE ... "[^ \"'`{}]*bg-secondary[^ \"'`{}]*" app
# secundário com /NN
grep -rnE ... 'secondary/[0-9]+' app
# preto/branco
grep -rnoE ... "[^ \"'`{}]*(black|white)/[0-9]+[^ \"'`{}]*" app
# outras transparências sobre tokens (151)
grep -rnoE ... "[^ \"'`{}]*(background|card|popover|border|input|muted|primary|accent|ring|error|success|warning|info)/[0-9]+[^ \"'`{}]*" app
# color-mix
grep -rnE ... 'color-mix' app
```

Contagem por classe dos `foreground/NN` (resultado do `sort | uniq -c`): `dark:border-foreground/10` 11; `border-foreground/5` 11; `border-foreground/15` 7; `border-foreground/10` 7; `[&_svg]:text-foreground/40` 7; `text-foreground/80` 6; `placeholder:text-foreground/40` 6; `bg-foreground/50` 4; `data-placeholder:text-foreground/40` 3; `text-foreground/70` 2; `hover:bg-foreground/15` 2; `border-foreground/20` 2; e 1 cada: `text-secondary-foreground/80`, `/60`, `/50`, `text-foreground/90`, `/60`, `/50` (`tailwind.css`), `ring-foreground/5`, `bg-primary-foreground/30`, `bg-foreground/8`, `/5`, `/40`, `/20` (`tailwind.css`), `/10` (`tailwind.css`), `bg-foreground/10` (combobox).

A classificação por linha foi feita à mão (lendo o contexto de cada ocorrência) e depois totalizada por script a partir da lista de tokens, com checagem de que nenhum token ficou sem classe.

## Apêndice B: outras transparências sobre tokens (fora da lista literal do ticket)

151 tokens, classificados por grupo. Não entram nos totais da seção 2.2.

| Grupo | Tokens | Sugestão | Observação |
|---|---|---|---|
| G1: anel e borda de foco (`ring-ring/30`, `border-ring/60`, `ring-error/30`...) | 79 (25 na galeria) | C, manter | é a regra de foco do Prism |
| G2: `border-border/NN`, `divide-border/NN`, `bg-border/NN` | 25 (13 na galeria) | E, ver D10 | bordas sutis ou tracejadas; fora da galeria: `PartnersBoard:36`, `TimelineBoard:623, 644`, `button-group:121`, `CustomThemePanel:83, 194, 253`, `PlanningSuggestionsList:165, 232`, `UColorPickerDropdown:257, 300`, `profile:1414` |
| G3: `bg-card/NN`, `bg-popover/NN`, `bg-background/NN`, `bg-input/NN`, `border-input/30` | 17 | 12 C (películas com desfoque, véus e demos da galeria), 5 E | E: `combobox.tsx:141, 265`, `badge.tsx:9` (`hover:bg-card/80`, junto do D9), `CommentInput.tsx:68` (`dark:bg-input/30`), `planejamento.tsx:917` (`bg-card/60`) |
| G4: tons do primário (`bg-primary/10`, `border-primary/50`...) | 16 | C | tom da cor de marca, não neutro |
| G5: tons semânticos e `bg-ring/40` (error, success, warning, info) | 14 (13 na galeria) | C | estados |

Lista completa dos tokens em G2 e G3 está no output do comando (último da lista do Apêndice A).
