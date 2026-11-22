# Levantamento da palavra "cartão" (Survey B)

Regra do proprietário: usar o termo exato do app. Hierarquia usada nas propostas:

- **Ação**: a unidade de trabalho. **Item da Ação**: o objeto visual da Ação em Kanban/listas (`ActionItem`, superfície `--action`).
- **Card**: superfície/caixa `bg-card` (token `--card`). **Ação atrasada**: Ação com prazo vencido (token `--late-bg`).
- **Fase** e **Categoria** não aparecem como sinônimo de "cartão" nos achados.

Método: `grep -i` por `cartão|cartao|cartões|cartoes|cartinha|tile|card de ação` em app/, docs/, AGENTS.md, CLAUDE.md, README.md, tests/, scripts/, supabase/ (sem node_modules, sem .scratch). Resultado: **0 ocorrências** em tests/, scripts/, supabase/, CLAUDE.md, README.md; **0** de "cartinha", "tile" e "card de ação".

**Confiabilidade das propostas:** linhas de `app/` e `AGENTS.md` foram lidas no código e a proposta é verificada. Linhas de `docs/` foram classificadas por palavras vizinhas (ex.: "fase", "ActionItem", "atrasado", "menu", "campo") e devem ser conferidas antes de qualquer troca em lote; as marcadas `dúvida` não tiveram contexto suficiente na própria linha.

## Contagem

| Categoria | Ocorrências |
|---|---|
| comentário | 6 |
| docs | 271 |
| docs (contrato) | 21 |
| identificador | 1 |
| texto de UI | 18 |
| **Total** | **317** |

Obs.: "docs (contrato)" = AGENTS.md e docs/contracts/ (normativos); "docs" = auditorias e planos históricos em docs/audits e docs/plans. Texto de UI = rótulos/descrições visíveis (inclui a galeria `/ui` e o editor de tema Personalizado de Minha Conta). Comentário = comentário de código. Identificador = palavra-chave de busca em `ui.tsx:248`; nenhum nome de variável/função/classe usa "cartão".

## texto de UI (18)

| file:line | trecho | proposta |
|---|---|---|
| `app/components/features/profile/CustomThemePanel.tsx:34` | { key: "cardLDelta", label: "Cartão" }, | Card (é a camada `--card`, `bg-card`) |
| `app/components/features/profile/CustomThemePanel.tsx:39` | { key: "actionLDelta", label: "Cartão de ação" }, | Item da Ação (é a camada `--action`, superfície do ActionItem) |
| `app/components/features/profile/CustomThemePanel.tsx:40` | { key: "actionHoverLDelta", label: "Cartão de ação · mouse" }, | Item da Ação · mouse (camada `--action-hover`) |
| `app/components/features/profile/CustomThemePanel.tsx:248` | ption="Mantém profundidade com sombra e realce superior nos cartões de ação. Quando desativado, adota estilo plano moderno com borda transparente." | "...nos itens da Ação." (toggle de relevo do ActionItem) |
| `app/components/features/profile/CustomThemePanel.tsx:250` | label="Relevo dos cartões de ação" | "Relevo dos itens da Ação" |
| `app/components/features/profile/CustomThemePanel.tsx:277` | Cor do fio de luz superior dos cartões (padrão branco). | "...superior dos itens da Ação (padrão branco)" |
| `app/components/features/profile/CustomThemePanel.tsx:306` | <span className="text-sm font-semibold">Cartão de ação</span> | "Item da Ação" (texto dentro da prévia do ActionItem) |
| `app/components/features/profile/CustomThemePanel.tsx:327` | <span className="text-sm font-semibold">Cartão e menu</span> | "Card e menu" (a caixa usa `bg-card`) |
| `app/components/ui-sections/TokensFocusSection.tsx:198` | "features/ActionItem.tsx (cartão: focus-within:outline-2 outline-primary, exceção aprovada)", | item da Ação (ActionItem.tsx: focus-within...) |
| `app/components/ui-sections/TokensFocusSection.tsx:354` | label="Cartão de ação (focus-within)" | "Item da Ação (focus-within)" |
| `app/components/ui-sections/TokensFocusSection.tsx:359` | aria-label="Réplica do cartão de ação" | "Réplica do item da Ação" (aria-label) |
| `app/components/ui-sections/TokensFocusSection.tsx:647` | label="Cartão selecionado" | "Item da Ação selecionado" (réplica do ActionItem com `ring-2 ring-primary`) |
| `app/components/ui-sections/TokensColorsSection.tsx:312` | description="Superfície do cartão de ação, relevo de borda superior, contorno e versões de repouso e hover. Em paletas planas (--ac | "Superfície do item da Ação, ..." (description) |
| `app/components/ui-sections/TokensColorsSection.tsx:313` | title="Cartão de Ação e Versões (Action)" | title "Item da Ação e Versões (Action)" |
| `app/components/ui-sections/TokensColorsSection.tsx:318` | note="Superfície base do cartão (background L +0,02 claro, +0,10 escuro, pelo ajuste da paleta)" | "Superfície base do item da Ação (...)" (token `--action`) |
| `app/components/ui-sections/TokensColorsSection.tsx:334` | note="Contorno do cartão (--shadow-color a 5% no claro e 20% no escuro; desligado em paletas planas)" | "Contorno do item da Ação (...)" (token `--action-ring`) |
| `app/components/ui-sections/TokensColorsSection.tsx:589` | 1. Cartões de Ação do Workflow (Relevo, Status e Cores de | "1. Itens da Ação do Workflow (Relevo, Status e Cores de Fase)" |
| `app/routes/app/profile.tsx:1141` | description="Pinta cada cartão de ação com a cor da fase em que ele está, em todas as telas. Suave usa um tom leve; Viva usa a | "Pinta cada item da Ação com a cor da fase em que ele está..." |

## comentário (6)

| file:line | trecho | proposta |
|---|---|---|
| `app/components/features/profile/CustomThemePanel.tsx:238` | {/* Controles de Relevo e Acabamento dos Cartões (DS06) */} | Controles de Relevo e Acabamento dos itens da Ação (DS06) |
| `app/components/features/profile/CustomThemePanel.tsx:296` | {/* Pré-visualização com cartão de ação e elementos derivados */} | Pré-visualização com item da Ação e elementos derivados |
| `app/components/features/profile/CustomThemePanel.tsx:303` | {/* Cartão de ação simulando ActionItem */} | Item da Ação simulando ActionItem |
| `app/components/ui-sections/TokensColorsSection.tsx:310` | {/* Categoria 2 — Cartão de Ação e Versões (action) */} | Categoria 2: Item da Ação e Versões (action) |
| `app/components/ui-sections/TokensColorsSection.tsx:585` | {/* SHOWCASE 1: Cartões Reais de Ação do Workflow */} | SHOWCASE 1: Itens da Ação reais do Workflow |
| `app/lib/palette-vars.ts:135` | // 5. Relevo de ações e cartões (border-t, ring e sombras) | Relevo dos itens da Ação (border-t, ring e sombras). Observação: a linha 137 do mesmo arquivo diz "Flat cards" e trata de `--action`/fase, ou seja, do item da Ação; propor "Flat Action items" (comentário em inglês) |

## identificador (1)

| file:line | trecho | proposta |
|---|---|---|
| `app/routes/ui.tsx:248` | keywords: ["admin", "cartao", "lista", "item", "parceiro"], | manter "cartao" como palavra-chave de busca e acrescentar "card" (UAdminItemCard é um Card da lista admin) |

## docs (contrato) (21)

| file:line | trecho | proposta |
|---|---|---|
| `docs/contracts/prism-details.md:27` | - **Sombra colorida da paleta (DS14, 12/11/2026):** toda sombra de elevação (`shadow-xs/sm | dúvida |
| `docs/contracts/prism-details.md:50` | Anel de foco padrão (`border-ring/60 ring-3 ring-ring/30`, como `PrismButton`): todo foco  | dúvida |
| `docs/contracts/action-drawer.md:31` | e altura de linha em todos os breakpoints, preservando a geometria do cartão. | item da Ação |
| `docs/contracts/action-drawer.md:33` | <span>`), porque o `usePress` do `PrismButton` engoliria o clique e o cartão não alternaria a seleção; fora do modo seleção o título usa um | item da Ação |
| `docs/contracts/pages-today-profile-planning.md:16` | - Nos dois modos, Gerar planejamento chama a IA no servidor com o Direcionamento da propos | dúvida |
| `docs/contracts/pages-today-profile-planning.md:63` | - Cor da fase nos cartões de ação (DS11, 12/11/2026; **os controles por tela foram removidos no DS19**, ver  | item da Ação |
| `docs/contracts/pages-today-profile-planning.md:64` | - Cor da fase em três modos (DS17, 13/11/2026): `phaseColor` deixou de ser booleano e pass | item da Ação |
| `docs/contracts/pages-today-profile-planning.md:66` | - Cor da fase como preferência da conta (DS19, 16/11/2026): `phaseColor` (`"off"` padrão \| | item da Ação |
| `docs/contracts/pages-today-profile-planning.md:67` | - Visualização Prioridade do Hoje (HOJE-01, 16/11/2026): modo `priority` (rótulo "Priorida | dúvida |
| `docs/contracts/pages-today-profile-planning.md:69` | - **Ações na Linha do tempo.** Barras proporcionais à duração, altura compacta de 28 px co | item da Ação |
| `docs/contracts/surfaces-and-neutrals.md:18` | Para mudar um cinza de uma paleta, mude o número dela em `palettes.ts`; não escreva valor  | dúvida |
| `docs/contracts/surfaces-and-neutrals.md:27` | \| `popover`                 \| +0,02 / −0,03                 \| Tudo que flutua: menu, diálo | Card (superfície bg-card) |
| `docs/contracts/surfaces-and-neutrals.md:29` | \| `input`                   \| −0,04 / −0,06                 \| Campo de texto, caixa de sel | Card (superfície bg-card) |
| `docs/contracts/surfaces-and-neutrals.md:30` | \| `secondary`               \| −0,06 / +0,12                 \| Cinza de **tudo que é clicáv | dúvida |
| `docs/contracts/surfaces-and-neutrals.md:33` | \| `action` e `action-hover` \| +0,02 / +0,10 e +0,10 / +0,20 \| Cartão de ação e o hover dele. Têm cor própria; não há cinza dentro do cartão. Avatar vazi | item da Ação |
| `docs/contracts/surfaces-and-neutrals.md:41` | botão cinza (`secondary`) fica na página ou no flutuante. Nunca sobre cartão de ação, cor de fase ou imagem. | item da Ação |
| `docs/contracts/surfaces-and-neutrals.md:43` |  (fica o `ring-border` ou `border`), avatar sem foto como contorno no cartão de ação. | item da Ação |
| `docs/contracts/surfaces-and-neutrals.md:61` | Cores e números que valem para todas as paletas moram em `SHARED_COLORS` (`app/lib/palette | dúvida |
| `docs/contracts/surfaces-and-neutrals.md:68` | - Brilho da borda do cartão: branco com a porcentagem indicada; no escuro 10%. Cor customizada do Personalizado | Card (superfície bg-card) |
| `AGENTS.md:130` | ara ler (briefing, objetivo, descrição, explicação de modal, corpo de cartão, mensagem de erro) usa `text-base` (16px). `text-sm` (14px) fica para botões, campo | "corpo de Card" (superfície de conteúdo bg-card) |
| `AGENTS.md:134` | eções de formulários, seletores, listas ou blocos de campos em caixas/cartões externos com borda arredondada e fundo (padrão card/caixa com `rounded`, `border`, | "caixas/Cards externos" (o padrão `rounded border bg-card`) |

## docs (271)

| file:line | trecho | proposta |
|---|---|---|
| `docs/plans/visual-controls-final-status.md:22` | \| Cartão `ActionItem`   \| Foco: `focus-within:outline-2 focus-within:outline-primary`. O top | item da Ação |
| `docs/plans/visual-controls-plan.md:94` | \| 28px \| 12px \| 14px \| 10px \| 4px \| Barras de filtro, ações dentro de cartões e listas, toolbar do editor, seletores do calendário \| | dúvida |
| `docs/plans/social-planning-ticket-breakdown.md:4` | Avanço limitado em01/11: casca visual e acessos de navegação/seleção preparados em `/app/p | dúvida |
| `docs/plans/visual-controls-where.md:115` | ### 3.3 Cartões e listas de ação (Home, Hoje, Parceiro) | dúvida |
| `docs/plans/visual-controls-where.md:119` | Item           \| `features/ActionItem.tsx`                          \| Cartão/linha da ação                    \| `/app`, `/app/today`, `/app/partner/$slug` \| Che | item da Ação |
| `docs/plans/visual-controls-where.md:120` | Input.tsx`                \| Edição inline do título                 \| Cartões de ação nas mesmas telas           \| —            \| `<input>` próprio `rounded-md  | item da Ação |
| `docs/plans/visual-controls-where.md:121` | ActionLineVariant.tsx`    \| Variante Linha                          \| Cartões de ação                            \| —            \| `w-22` :88 (largura de coluna) | item da Ação |
| `docs/plans/visual-controls-where.md:122` | ActionBlockVariant.tsx`   \| Variante Bloco                          \| Cartões de ação                            \| —            \| Nenhum | item da Ação |
| `docs/plans/visual-controls-where.md:123` | ActionContentVariant.tsx` \| Variante Conteúdo                       \| Cartões de ação                            \| —            \| Nenhum | item da Ação |
| `docs/plans/visual-controls-where.md:125` |                           \| Renderização do conteúdo (imagem/vídeo) \| Cartões, feed, `/dash`                     \| —            \| hex `#00000050` :104 | dúvida |
| `docs/plans/visual-controls-where.md:126` |                           \| Ícone de fase                           \| Cartões, combobox de fase, busca, `/dash`  \| —            \| `text-white` :61; `rounded-ful | item da Ação |
| `docs/plans/visual-controls-where.md:128` |           \| Arrastar e soltar                       \| Kanban, Sprint, cartões                    \| —            \| Sem visual | item da Ação |
| `docs/plans/visual-controls-where.md:164` | \| PlanningSuggestionsList  \| `planning/PlanningSuggestionsList.tsx`  \| Lista de sugestões  | dúvida |
| `docs/plans/visual-controls-where.md:183` | nItemCard              \| `uzzina/UAdminItemCard.tsx`                \| Cartão das listas admin      \| `/app/admin/partners`, `/users`, `/clients`             \| — | Card da lista admin (UAdminItemCard) |
| `docs/plans/visual-controls-where.md:194` | \| LeadCard          \| `features/leads/LeadCard.tsx`           \| Cartão de lead                  \| `/app/leads`   \| Badge                 \| `<button>` próp | Card do lead (LeadCard) |
| `docs/plans/visual-controls-where.md:203` | zzina/UIcons.tsx`               \| Ícones próprios           \| Gaveta, cartões, busca, `/dash` \| —                      \| Nenhum | dúvida |
| `docs/plans/visual-controls-where.md:213` | \| 3.3 Cartões e listas de ação       \| 11                      \| | dúvida |
| `docs/plans/visual-controls-where.md:233` | \| `/app/planejamento`         \| `app/routes/app/planejamento.tsx:985`, `:986`              | dúvida |
| `docs/plans/visual-controls-where.md:240` |    \| Detalhe da ação no portal     \| Pílula `rounded-full px-3 py-1`; cartão `r | dúvida |
| `docs/plans/visual-controls-where.md:255` | 9. **ActionItem + ActionItemTitleInput**: cartões de ação (Home, Hoje, Parceiro). | item da Ação |
| `docs/plans/visual-tokens-plan.md:91` | l-sm` \| 28px \| 14px \| 10px \| Barras de filtro, chips, ações dentro de cartão, toolbar do editor \| | dúvida |
| `docs/plans/visual-tokens-plan.md:107` | \| `radius-md` \| 12px \| Cartões de ação, imagens de mídia \| | item da Ação |
| `docs/plans/visual-tokens-plan.md:147` | elas**, por área, um executor por vez: cabeçalho/AppBar → Home/Hoje → cartões de ação/calendário → gaveta → Minha Conta → Planejamento → administração → portal/ | item da Ação |
| `docs/plans/visual-tokens-plan.md:162` | \| D8 \| Cartões de ação \| Fundo `surface-hover` sem borda (liso) ou só linha inferior \| | item da Ação |
| `docs/plans/social-planning-design-decisions.md:31` |  por meio de um interruptor "Substituir o post do dia" (a definir). O cartão | dúvida |
| `docs/plans/social-planning-design-decisions.md:51` | em trechos específicos: botões nativos de propostas salvas, filtros e cartões próprios de sugestões, superfícies `bg-card` montadas à mão e grade i | Card (superfície bg-card) |
| `docs/plans/social-planning-design-decisions.md:66` | - Página limpa, sem cartões, fundos de painel ou gutters externos entre colunas; somente divisórias estruturai | Card (superfície bg-card) |
| `docs/plans/social-planning-design-decisions.md:139` |  limpar a apresentação e implementar os três acessos. A página remove cartões, fundos decorativos, gutters entre colunas, títulos repetidos e vazio ilustrado; m | item da Ação |
| `docs/audits/2026-11-05-ds01-visual-deviations.md:20` |  \| `UPreferenceSwitch` e `CustomThemePanel`: contorno, raio, fundo de cartão e espaçamento externo em Preferências. \| Adequação à regra existente de superfície  | dúvida |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:7` | smo destaque virar uma cor diferente em cada lugar, e em cores como o cartão de ação colo | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:11` | edido na demonstração: o fundo de hover é o mesmo valor na página, no cartão, no menu, na seção do admin e no cartão de ação. Ele não se adapta à cor onde es | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:12` | - **O pior caso é o cartão de ação na fase viva.** O texto secundário tem contraste 2,9:1 no claro e 2,8:1 no  | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:13` | - **Texto secundário no escuro já está abaixo do mínimo em cartões.** Com 65% de texto, o cartão escuro mede 3,96:1. Com 75%, 4,73:1. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:22` | rk`). Por isso o valor é resolvido ali e herdado pronto. Dentro de um cartão de ação com `phase-surface` ou `phase-vivid`, `--foreground` muda, mas `-- | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:31` | \| `bg-card` \| 31 \| Não há primitivo Prism de cartão; cada tela escreve a classe \| | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:54` | \| Cartão \| `bg-card` em 31 pontos, ex.: `app/routes/app/planejamento.tsx:917` \| `--card` \| S | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:58` | \| Cartão de ação, fase suave \| `app/tailwind.css` (`phase-surface`), `app/components/feature | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:59` | \| Cartão de ação, fase viva \| `app/tailwind.css` (`phase-vivid`), mesmo ponto \| `--vivid-fil | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:79` | 3. Uma superfície aninhada (menu dentro de cartão) redeclara as variáveis dela; os itens dentro herdam o valor certo. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:91` | \| Cartão \| 6,2:1 \| 7,5:1 \| 4,1:1 \| 4,0:1 \| | dúvida |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:94` | \| Cartão de ação, fase suave \| 6,3:1 \| 4,2:1 \| 3,1:1 \| 2,6:1 \| | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:95` | \| Cartão de ação, fase viva \| 2,9:1 \| 1,8:1 \| 2,8:1 \| 1,8:1 \| | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:99` | - Cartão escuro, texto a 70%, 75%, 80%: 4,31, 4,73, 5,12 (hoje 3,96). | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:107` | 1. **Cartões coloridos não resolvem só com a mistura.** A fase suave escura e a fase viva ficam | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:108` | o padrão de 65%, a fase suave clara cai de 6,3 para 4,2:1. Por isso o cartão precisa de percentual próprio, não o padrão. | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:113` | utido, em uma demonstração. Não são auditoria certificada do app, e o cartão de ação real pode ter tinta diferente conforme a preferência | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:121` | erfície?** Recomendação: sim, em duas etapas. Primeiro menus, página, cartão e seção do admin (ganho claro, sem risco). Depois os cartões de ação, que dependem  | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:122` | ) ou 75%?** Recomendação: 75% no escuro e manter 65% no claro. Hoje o cartão escuro fica em 3,96:1; com 75% vai a 4,73:1. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:123` | - **D3. Cartões de ação coloridos.** Recomendação: a tinta do cartão (não a do texto da página) e  | item da Ação |
| `docs/audits/2026-11-16-ds23-surfaces-study.md:125` | ois de aceite visual do DS21 e do DS17, para não misturar mudanças em cartões de ação que ainda estão em revisão. | item da Ação |
| `docs/audits/2026-11-12-single-ai-account-study.md:25` | \| Taxa ao colocar saldo \| 5,5% com mínimo de US$ 0,80 (Business 8%, cripto 5%), segundo re | manter: refere-se a cartão de crédito, não é termo do app |
| `docs/audits/2026-11-12-single-ai-account-study.md:26` |     \| Pagamento internacional: IOF de 3,5% e a política do emissor do cartão                             \| Cobrança dentro da fatura Vercel: depende de como a c | manter: refere-se a cartão de crédito, não é termo do app |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:16` | \| Cartão (`content`) \| `ActionItem.tsx:187-238` \| `role="button"`, `tabIndex=0`, `onClick`,  | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:23` | **Abrir a ação com ponteiro.** O `onClick` do cartão (`ActionItem.tsx:197-211`) chama `onClick(action)` (override do consumidor, ex. pop | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:25` | **Editar o título com ponteiro.** O clique no botão do título chama `preventDefault`, `sto | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:27` | **Teclado.** O cartão é tab stop (`tabIndex=0`, `ActionItem.tsx:237`). Enter/Space focados no cartão: `on | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:29` | **Edição.** Enter confirma e Escape cancela (`ActionItemTitleInput.tsx:53-64`); blur confi | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:33` | **Seleção em lote.** Em `isSelectionMode`, `onClick` do cartão faz `preventDefault`, `stopPropagation` e `toggleSelection` (`ActionItem.tsx:198-20 | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:40` | \| Resto do cartão (ícone de fase, ícones à direita, padding) \| Abre (ou alterna seleção) \| Abre (ou a | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:51` | \| `block` \| Cartão com título grande (`text-2xl`), linha de metadados e data (`ActionBlockVariant.tsx: | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:70` | - Semântica: o cartão usa `role="button"` + `aria-pressed` (padrão de botão de alternância). Não há `aria | dúvida |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:80` | nItemTitleInput.tsx:76-80`) e entra em edição; o `toggleSelection` do cartão (`ActionItem.tsx:198-2 | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:86` | O `KeyboardSensor` do Sprint (`HomeSprintView.tsx:58-60`) usa as teclas padrão Space/Enter | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:88` | Reprodução (Sprint): clicar no título para editar, digitar um espaço, ou apertar Enter par | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:92` | `usePress` interrompe `pointerdown` do botão (`usePress.mjs:371`), então o `onPointerDown` | dúvida |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:96` |  3.4 Arrastar para selecionar texto dentro do input inicia arraste do cartão (M) | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:98` | Em edição o wrapper continua com `listeners`. O `input` não interrompe `pointerdown`; um g | dúvida |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:106` | Wrapper (`role="button"`, `tabIndex=0`, vindo de `attributes`) → cartão (`role="button"`, `tabIndex=0`) → botão do título. Em calendário e Kanban o wrapper | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:114` |  um item selecionado move apenas aquele item (o DragOverlay mostra um cartão com checkbox). Não há contrato documentado; decidir se o arra | dúvida |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:127` | Contratos a preservar: clique/Enter/Space no cartão abre a ação; clique no título edita (em qualquer variante com título editável); Ent | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:129` | perfície interativa por item.** Remover `role="button"`/`tabIndex` do cartão ou do wrapper dnd-kit (por exemplo `setActivatorNodeRef` + alça dedicada, ou `attri | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:130` | FromTabOrder` quando não for o alvo desejado; ou devolver o clique ao cartão com `con | dúvida |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:155` | clicar no título, digitar um espaço, apertar Enter. O espaço entra? O cartão começa a arrastar? (3.2) | item da Ação |
| `docs/audits/2026-11-06-ds03-action-item-interactions.md:156` | 4. Editar um título e arrastar o mouse para selecionar texto. O cartão se move? (3.4) | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:12` | do da página, não do que está por baixo: avatares sem foto dentro dos cartões de ação coloridos pela fase (círc | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:13` | 3. **Transparências soltas.** Das 82 ocorrências de `foreground/NN`, 61 são intencionais e | dúvida |
| `docs/audits/2026-11-17-ds33-inventory.md:14` | tados (arrastando, arquivado, fora do mês) e texto que herda a cor do cartão (fase, balão, bloco do te | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:85` | agora é calculado do fundo da página. Onde o item fica sobre uma cor (cartão de fase) ou uma imagem, ele não acompanha essa cor. Antes do DS28 era uma película  | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:97` | .tsx:46` \| `bg-secondary` \| avatar sem foto (fallback), inclusive nos cartões de ação coloridos pela fase \| antes: película sobre a cor da fase; agora: círculo  | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:98` | 88` \| `bg-secondary` \| avatar de grupo '+N' (contador), inclusive nos cartões de ação coloridos pela fase \| idem \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:99` | 142` \| `bg-secondary` \| avatar com iniciais (sem foto), inclusive nos cartões de ação coloridos pela fase \| antes: película sobre a cor da fase; agora: círculo  | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:123` | rd.tsx:50` \| `opacity-50` \| Admin (Parceiros, Usuários): subtítulo do cartão de cada item \| text-secondary-foreground; o cartão é neutro \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:139` | ondary/50` \| Kanban (fases e prioridades): realce da coluna quando um cartão é arrastado sobre ela \| bg-secondary/50; ver D4 \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:204` | nents/features/leads/LeadCard.tsx:22` \| `hover:bg-secondary` \| Leads: cartão de lead na lista (hover). Selecionado é primário \| transparente em repouso \| | Card do lead (LeadCard) |
| `docs/audits/2026-11-17-ds33-inventory.md:255` |  \| `hover:bg-secondary` \| seletor de avatares (Minha Conta): hover do cartão não selecionado \| transparente em repouso \| | dúvida |
| `docs/audits/2026-11-17-ds33-inventory.md:260` | tes/app/planejamento.tsx:1010` \| `hover:bg-secondary` \| Planejamento: cartão de sugestão, hover \| sobre bg-card; transparente em repouso \| | Card (superfície bg-card) |
| `docs/audits/2026-11-17-ds33-inventory.md:282` | \| `border-foreground/15` \| Admin, editor de cores de tema: amostra do cartão (claro) \| idem \| | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-17-ds33-inventory.md:283` | \| `border-foreground/15` \| Admin, editor de cores de tema: amostra do cartão (escuro) \| idem \| | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-17-ds33-inventory.md:288` | o tempo: alça de arrastar o início de uma barra de ação \| traço sobre cartão colorido pela fase \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:289` | a do tempo: alça de arrastar o fim de uma barra de ação \| traço sobre cartão colorido pela fase \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:290` | ejamento, calendário: ícone de alça (aparece só ao passar o mouse) no cartão da sugestão \| ícone (decisão de í | dúvida |
| `docs/audits/2026-11-17-ds33-inventory.md:305` | nto (Skeleton) \| película de 5% adapta-se a qualquer fundo, inclusive cartão de fase; bg-secondary também serviria ( | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:332` | \| `app/components/features/ActionItem.tsx:340` \| `opacity-50` \| cartão de ação (Kanban, calendário, Hoje): data da ação \| herda a cor do texto da fase; te | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:333` | s/features/ActionVariants/ActionBlockVariant.tsx:74` \| `opacity-50` \| cartão de ação em bloco: data da ação \| idem \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:337` | :opacity-80` \| imagens de conteúdo: escurece 20% ao passar o mouse no cartão \| efeito de hover sobre imagem \| | dúvida |
| `docs/audits/2026-11-17-ds33-inventory.md:338` | \| `app/components/features/DnD.tsx:68` \| `opacity-20` \| cartão que está sendo arrastado \| estado de arrasto \| | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:354` | /leads/LeadCard.tsx:31` \| `opacity-60` \| Leads: ícone de concluído no cartão \| ícone \| | Card do lead (LeadCard) |
| `docs/audits/2026-11-17-ds33-inventory.md:355` | es/leads/LeadCard.tsx:33` \| `opacity-50` \| Leads: ícone de relógio no cartão \| ícone \| | Card do lead (LeadCard) |
| `docs/audits/2026-11-17-ds33-inventory.md:356` | tures/leads/LeadCard.tsx:37` \| `opacity-50` \| Leads: linha de data do cartão \| herda a cor; no cartão selecionado o fundo é primário e text-secondary-foreground | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:391` | outes/app/admin/partners.tsx:127` \| `opacity-70` \| Admin > Parceiros: cartões de parceiros arquivados \| estado 'arquivado' \| | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-17-ds33-inventory.md:495` | **D4. Realces a 50% e 20% do secundário** (arrastar cartão sobre a coluna do Kanban e fases/prioridades, hover do dia no calendário de ações,  | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:497` | sólido sobre cor (grupo B).** Avatares sem foto e contadores `+N` nos cartões de ação coloridos pela fase, e quadros atrás de imagens. Opções: (a) aceitar o cin | item da Ação |
| `docs/audits/2026-11-17-ds33-inventory.md:516` | ouso e com o mouse em cima, gaveta, menu do avatar com área Admin, um cartão de fase com avatar, nos modos claro e escuro, em Ônix, Carbono e Fúcsia. | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:11` | dowOpacity` (de 10% a 70%). Afeta menus, selects, diálogos, tooltips, cartões e avisos | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:12` | 2. **Sombra e anel do cartão de ação.** Repouso e hover, em modo claro e escuro. Hoje derivam da cor de sombra d | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:13` | 3. **Borda superior de relevo do cartão.** Branco no claro, branco a 10% no escuro, transparente nas paletas lisas. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:15` | . **Sombra das fases e do atraso.** O ds25 cobre a cor e a mistura do cartão, mas não a sombra do cartão suave, do cartão vivo e do atraso. | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:52` | \| `phase-surface` (cartão suave) \| Mistura da fase no cartão: 7% / 12% (claro), 14% / 22% (escuro) \| b \| | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:53` | \| `phase-vivid` (cartão vivo) \| Fundo = cor da fase inteira; texto escuro ou claro \| b \| | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:69` |  `#ec4899`, Análise `#a855f7`, Feito `#38bdf8`, Concluído `#4ade80` \| Cartão de ação, bolinha da fase, calendários, | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:71` | Tópicos (`partner_topics.color`) \| Vem do banco \| Etiqueta do tópico, cartão \| | dúvida |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:72` |  \| Vem do banco; inválida cai em `#666666` (`DEFAULT_ACTION_COLOR`) \| Cartão, listas, portal \| | dúvida |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:73` | rceiro (`partner.colors[0]`) \| Vem do banco \| Barra superior, Início, cartão de ação \| | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:101` | \| Sombra do cartão de ação \| `--action-shadow`, `--action-hover-shadow` \| 14% (claro) / 35% (escuro) e | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:102` | \| Anel do cartão \| `--action-ring` \| 5% (claro) / 20% (escuro) da cor de sombra \| Sim \| Foreground a | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:106` | \| Sombra do cartão suave (fase) \| `--phase-shadow` em `phase-surface` \| Claro: cor da fase L 0.6 C 0.1 | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:107` | \| Halo difuso do cartão suave \| `--phase-diffuse` \| Escuro: fase L 0.2 C 0.15 a 63%; claro: transparente \|  | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:108` | \| Sombra do cartão vivo (fase) \| `--vivid-shadow` em `phase-vivid` \| Cor da fase L 0.55 C 0.16, alfa 4 | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:194` | - Em aberto na aplicação: a sombra do cartão de ação (`--action-shadow-color`, hoje separada) e o tema Personalizado de Minha Co | item da Ação |
| `docs/audits/2026-11-16-ds26-inventario-cores.md:195` | - Sombra do cartão de ação (decisão 17/11): a sombra padrão acima é a **base** do cartão de ação. Os e | item da Ação |
| `docs/audits/2026-10-14-drawer-keyboard-focus.md:109` | 4. Não ligar contain/wrap automaticamente: contenção e ciclo são decisões separadas do fil | dúvida |
| `docs/audits/2026-11-16-ds21-review.md:4` |  de cada paleta (Ônix, Rubi, Coral etc.) e vê, na hora, como ficam os cartões de ação, botões, menus, campos e aviso | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:23` | Os botões têm 3 alturas que não existem na escala (24/32/40/48 px). O cartão de ação não tem o filete de brilho no topo nem o contorno de 1 px do cartão rea | item da Ação |
| `docs/audits/2026-11-16-ds21-review.md:29` | , "⚡ SUAVE · REPOUSO (14%)"). Esses selos ficam maiores que o próprio cartão que deveriam explicar (captura | dúvida |
| `docs/audits/2026-11-16-ds21-review.md:31` | A barra lateral é uma pilha de caixas.** Cada cor derivada fica em um cartão com borda, fundo, selo "⚡ CALCULADA" e fórmula em fonte de código (captura `v1-barr | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:32` | - **Cartões de exemplo com texto explicativo dentro.** "Campanha Dia dos Pais — Reels 01 (Em H | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:53` | anel de foco, cor e força da sombra, relevo, e os 6 "ajustes de luz" (cartão, menus, campos, bordas, cartão de | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:62` | 1. **Coral, modo claro:** o ajuste de luz do "cartão de ação com o mouse" está em **+1,00**, enquanto as outras paletas usam entre −0,02 | item da Ação |
| `docs/audits/2026-11-16-ds21-review.md:77` | - **Superfícies:** texto principal e secundário, um cartão, um menu aberto com um item "com o mouse" e campos normal, em foco e com erro. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:78` | - **Cartão de ação:** colunas "Repouso" e "Com o mouse" fixas, nas versões bloco, linha e atrasa | item da Ação |
| `docs/audits/2026-11-16-ds21-review.md:86` | artir dela aparecem **logo abaixo, com recuo e um traço de ligação** (Cartão, Menus e diálogos, Campos, Bordas, Cartão de açã | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:99` | Dois separadores, **Prévia** e **Cores**, um modo por vez, sem rolagem lateral. No teste a | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds21-review.md:105` |  HTML. Na página de verdade devem ser os próprios componentes do app (cartão de ação, botões e campos Prism) dentro dos quadros. | item da Ação |
| `docs/audits/2026-11-16-ds21-review.md:125` | a o protótipo novo e confira:** troque para Coral e veja o "+1,00" do cartão com o mouse; passe o mouse em "Cartão" na lista e veja o tracejado na prévia; abra  | dúvida |
| `docs/audits/2026-11-06-ia-m02-profile-tabs-proposal.md:84` | - Rolagem: `useFillScrollViewport` continua limitando a altura ao contêiner rolável. Cada  | dúvida |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:7` | Há dois efeitos simultâneos no cartão em variante Linha: | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:12` | No componente real, Chromium com viewport1193×700, cartão de264px e fonte do projeto carregada: título14px, altura do texto19,25→21px; cartão | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:18` | terar somente line-height do input para inherit no navegador devolveu cartão36,25px e título19,25px, mantendo o ring2. O controle de remoção de box-shadow não f | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:28` | Após o diagnóstico, o proprietário solicitou o ajuste. `ActionItemTitleInput` agora usa `l | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:30` | Regressão permanente: `scripts/check-action-title-height-browser.cjs` monta o componente r | dúvida |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:40` |  script ampliados para32 cenários em Chromium, com264px de largura do cartão, telas390/768/1193/1440px e títulos curtos/longos. Bloco inclui configuração `lines | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:42` | - Linha e Hair:16 cenários passaram; geometria do título/cartão/elemento seguinte, autofocus e cancelamento por Escape preservados. | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:43` | :6 cenários desktop passaram. Em390px, tanto título curto como longo: cartão95→85px e texto30→20px (2 falhas). Input usa fonte16px abaixo de md; título usa24px. | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:44` | - Bloco de duas linhas:4 falhas; cartão125→95px no desktop e125→85px em390px. O botão ocupa duas linhas; input continua de  | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:63` | e ActionItem em767px reproduziu fonte24→16px, altura de linha30→20px, cartão95→85px; em768px manteve24px/30px/95px. O breakpoint é da janela (`md:`), não da lar | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:71` | Em390px, cartões tinham138px de largura. Em Atrasadas com apenas um cartão:95→85px; com vizinho na  | Ação atrasada (item da Ação atrasada) |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:79` | Controle temporário de `font-size: inherit` no input passou nos28 cenários da matriz atual | dúvida |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:91` | cenários passaram e2 falharam, ambos Bloco em390px (curto/longo), com cartão | item da Ação |
| `docs/audits/2026-10-30-inline-title-height-diagnosis.md:93` | O mesmo comando real `scripts/check-action-title-height-browser.cjs` passou nos28 cenários | dúvida |
| `docs/audits/2026-10-17-action-update-duplicate-diagnosis.md:7` | á dois registros persistidos de `toroburgerandbeer`, e não somente um cartão repetido no cache: | dúvida |
| `docs/audits/2026-10-16-calendar-height-study.md:13` | \| [Célula da equipe](../../app/components/features/CalendarDayCell.tsx) \| Linha/Bloco usam | item da Ação |
| `docs/audits/2026-10-16-calendar-height-study.md:32` | 6. Separar política de altura, apresentação dos cartões e compactação. `isCompact` não deve continuar decidindo simultaneamente tamanho da | dúvida |
| `docs/audits/2026-10-29-current-history.md:27` |  inicial de Hoje). Versão final: botão no cabeçalho, duas colunas sem cartão/gap ext | Card (superfície bg-card) |
| `docs/audits/2026-10-29-current-history.md:29` |  direito e o afastamento do cabeçalho. Colunas agora sem decoração de cartão; gap externo de16px re | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:20` | - **Esquerda (Mostruário vivo de componentes reais):** exibe cartões de ação (`ActionItem` em linha e bloco, com relevo e planos, atrasados e nas 6 fas | Ação atrasada (item da Ação atrasada) |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:45` | \| **Relevo dos Cartões (`Action Relief`)**             \| `palette.relief` → `--action-relief`             | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:56` | \| **`bg-action` (`--action`)**             \| `Background` + `--action-l-delta`       \| `ok | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:57` | \| **`bg-action-hover` (`--action-hover`)** \| `Background` + `--action-hover-l-delta` \| `ok | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:59` | \| **`text-secondary-foreground`**          \| `Foreground`                            \| `co | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:61` | \| **`ring-action-ring` (`--action-ring`)** \| `Shadow Tint` (`--action-shadow-color`) \| `co | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:127` | dbacks Semânticos (Erro, Aviso, Sucesso, Sucesso Firme, Informação) e Cartão Atrasado (`late-surface`) | Ação atrasada (item da Ação atrasada) |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:143` | \| **`text-error-foreground`**                    \| `--color-error`                         | dúvida |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:145` | \| **Fundo de Cartão Atrasado (Repouso)**         \| `bg-error-background`                  \| `color-mix( | Ação atrasada (item da Ação atrasada) |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:146` | \| **Sombra de Cartão Atrasado (`late-surface`)** \| `--error-foreground` / `--color-error` \| Repouso: `25 | Ação atrasada (item da Ação atrasada) |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:181` | - **Cartões de Ação (`ActionItem`):** cada variante (Padrão com Relevo, Atrasado `late-surface`,  | Ação atrasada (item da Ação atrasada) |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:189` | - Para cada fase, uma linha mostra **6 cartões/amostras lado a lado**: | item da Ação |
| `docs/audits/2026-11-16-ds21-admin-theme-colors-study.md:231` | / Clara` e `Escuro Cheio / Atenuado`), além do switch de **Relevo dos Cartões**; | Card (superfície bg-card) |
| `docs/audits/2026-11-06-ds04-microinteractions.md:67` | onItem.tsx` \| 146-147, 192-193, 245 \| `transition-all duration-500` \| Cartão de ação anima tudo por 500 ms. Estreitar. \| | item da Ação |
| `docs/audits/2026-11-06-ds04-microinteractions.md:176` | - Duração de 500 ms em cartões e barras (`ActionItem.tsx:147`, `UAIAllowanceMeter.tsx:29`, `UPhaseIcon.tsx`): red | item da Ação |
| `docs/audits/2026-11-06-ds04-microinteractions.md:212` | - `transition-all` removido de botões, checkboxes, radios e cartões de ação, substituído por lista explícita de propriedades. | item da Ação |
| `docs/audits/2026-11-05-ds02-route-review.md:9` | `, `/app/today`, `/app/partner/$slug` \| Cabeçalho/AppBar, calendário, cartões, busca, gaveta e overlays. Marcadores CAL01 aceitos localmente. Editor D aceito \|  | dúvida |
| `docs/audits/2026-11-05-ds02-route-review.md:12` | in/partners`, `/app/admin/partner/$slug`, `/app/admin/celebrations` \| Cartões, formulário e upload, fo | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-17-ds23-referencias.md:3` | e o fundo de hover quando o mesmo botão ou item aparece sobre página, cartão, menu, gaveta, cor de fase e imagem. | Card (superfície bg-card) |
| `docs/audits/2026-11-17-ds23-referencias.md:19` | - cartão; | dúvida |
| `docs/audits/2026-11-17-ds23-referencias.md:22` | - cartão colorido (cor da fase); | item da Ação |
| `docs/audits/2026-11-17-ds23-referencias.md:28` | opaco calculado só a partir do fundo da página. Contraste fraco sobre cartão (diferença de cerca de 0,016 em L no claro). | Card (superfície bg-card) |
| `docs/audits/2026-11-17-ds23-referencias.md:110` | o da forma" é útil para chips e contadores. Não resolve o problema de cartão colorido. | dúvida |
| `docs/audits/2026-11-17-ds23-referencias.md:134` | * o fundo translúcido continua somando sua cor ao que está atrás. Num cartão colorido de fase, o tom muda, e não há correção de contraste. | item da Ação |
| `docs/audits/2026-11-17-ds23-referencias.md:162` | as** (modelo tipo Carbon): cada contêiner declara sua camada (página, cartão, flutuante, sobre cor), e cada camada tem s | Card (superfície bg-card) |
| `docs/audits/CURRENT.md:5` | **Fila vigente em 19/11.** O [tracker local](../../.scratch/README.md) mantém 12 tickets a | dúvida |
| `docs/audits/CURRENT.md:15` | - **Planejamento, 21/11: regra das comemorações implementada (T12), na `main` local, sem p | dúvida |
| `docs/audits/CURRENT.md:18` | comemoração substitui o post do dia por um interruptor (a definir); o cartão mostra o nome; | dúvida |
| `docs/audits/CURRENT.md:50` | - **Mesa de Planejamento, revisão de produto em 19/11:** acesso exclusivo a administradore | dúvida |
| `docs/audits/CURRENT.md:54` | - **Cartões Linha e Bloco (ARQ-02), encerrado em 19/11:** detalhes compartilhados (data, parce | item da Ação |
| `docs/audits/CURRENT.md:55` | - **Revisão documental e testes, 19/11:** corrigidos os contratos de Tópicos, IA, Planejam | dúvida |
| `docs/audits/CURRENT.md:56` | - **Estudo da arquitetura da UZZINA (ARQ-01), encerrado em 19/11:** relatório entregue em  | dúvida |
| `docs/audits/CURRENT.md:62` | - **DS24 (cor pai e neutros por fórmula, estudo em 16/11):** relatório entregue com a anál | dúvida |
| `docs/audits/CURRENT.md:64` | - **DS36, etapas 1 a 7 aplicadas (21/11, só código local, sem commit, sem push, sem public | dúvida |
| `docs/audits/CURRENT.md:66` | - **DS35 (aberto em 17/11): sistema único e simples para os fundos e os cinzas.** Ticket p | dúvida |
| `docs/audits/CURRENT.md:71` | O proprietário aprovou os 22 valores (11 paletas, claro e escuro). `shadowColor` e `shadow | Card (superfície bg-card) |
| `docs/audits/CURRENT.md:73` | ### Cor da fase nos cartões de ação (DS11) — encerrado em 12/11 | item da Ação |
| `docs/audits/CURRENT.md:81` | O [ticket de sombra do tema](../../.scratch/design-system-audit/issues/14-global-theme-sha | dúvida |
| `docs/audits/CURRENT.md:89` | ses (Ideia, Fazer, Fazendo, Análise, Feito, Concluído), com hover nos cartões suave e vivo e no cartão atrasado. Seletor de tema (Ônix, Carbono, Violeta) com cl | Ação atrasada (item da Ação atrasada) |
| `docs/audits/CURRENT.md:90` | ystem-audit` (porta 5190), sem erro de console; seletor e contagem de cartões conferidos. Não há alteração no app nem commi | dúvida |
| `docs/audits/CURRENT.md:99` | ### DS25: hover das fases vivas e cartão atrasado como no app — 17/11 | Ação atrasada (item da Ação atrasada) |
| `docs/audits/CURRENT.md:101` | hover recebe campos de ΔL e ΔC ("Fases: viva, hover"), sem mistura. O cartão atrasado foi refeito com o desenho de `ActionItem` (fundo de erro a 70%, anel de | Ação atrasada (item da Ação atrasada) |
| `docs/audits/CURRENT.md:126` | eriu os 11 temas no laboratório e mandou aplicar. `app/tailwind.css`: cartão, menu, campo, borda, ação, hover da ação, secundário (agora opaco), hover do secund | Card (superfície bg-card) |
| `docs/audits/CURRENT.md:134` | - `.scratch/design-system-audit/ds28-conferencia-neutros.html` (feito por subagente Haiku) | dúvida |
| `docs/audits/CURRENT.md:172` | Aberto, implementado e aceito pelo proprietário em 16/11 o [DS20](../../.scratch/design-sy | dúvida |
| `docs/audits/CURRENT.md:192` | "Cor da fase" virou preferência da conta (`phaseColor`, padrão Desligada) em Minha Conta → | item da Ação |
| `docs/audits/CURRENT.md:208` | "Cor da fase" agora tem Desligada / Suave / Viva (menu Visualizar e menu do Hoje, estado d | item da Ação |
| `docs/audits/CURRENT.md:220` | O proprietário encerrou o DS08 (página inicial institucional) sem implementação: não é uma | dúvida |
| `docs/audits/CURRENT.md:277` | Os dois índices coincidem em 23 tickets e todos os arquivos existem. Fora do Planejamento, | dúvida |
| `docs/audits/CURRENT.md:281` | provou os ajustes de 11/11 para menus, gaveta, calendários, alertas e cartões atrasados. Na `main` local, o texto secundário agora deriva do texto principal a 6 | Ação atrasada (item da Ação atrasada) |
| `docs/audits/CURRENT.md:318` | Na aba Essencial, o botão “Adicionar arquivo” usa o estilo link e a linha de anexos tem 4  | item da Ação |
| `docs/audits/CURRENT.md:324` | ultos que estendiam a página e ganhou margem interna para a sombra do cartão de prévia. Verificado em Chromium a 1440×760 e 390×700, com sessão e resp | Card (superfície bg-card) |
| `docs/audits/CURRENT.md:334` | O [tracker](../../.scratch/README.md) e a [central](2026-11-03-ticket-dispatch.md) listam  | dúvida |
| `docs/audits/CURRENT.md:336` | s coincidem em seis tickets. Paleta pública, personalização de tema e cartões aguardam validação no app. Os três ajustes estão no commit com deploy bem-sucedido | dúvida |
| `docs/audits/CURRENT.md:364` | ### Correção de animação dos cartões — 08/11 | dúvida |
| `docs/audits/CURRENT.md:370` | Implementado no checkout local ([DS10](../../.scratch/design-system-audit/issues/10-action | dúvida |
| `docs/audits/CURRENT.md:374` | Enviado ao GitHub em `ce36df0` ([DS09](../../.scratch/design-system-audit/issues/09-palett | dúvida |
| `docs/audits/CURRENT.md:382` | Encerrado com aceite do proprietário em 08/11. Adicionada a propriedade `relief?: boolean` | dúvida |
| `docs/audits/CURRENT.md:767` | - **Lote B (Ajuda, cartões e calendário do cliente):** `HelpPage.tsx` com `PrismKbd` e `PrismSelect` mobile;  | dúvida |
| `docs/audits/CURRENT.md:768` | - **Lote C (Formulários Admin, Auth e Minha Conta):** `AdminUserForm.tsx` com `PrismLabel` | Card da lista admin (UAdminItemCard) |
| `docs/audits/CURRENT.md:785` | Reavaliado o [parecer V44](2026-11-05-v44-custom-components-prism-audit.md) e o [ticket 44 | dúvida |
| `docs/audits/CURRENT.md:1016` | - V29 `UAdminItemCard`: cartão de lista com cores, subtítulo e badge com truncamento. | item da Ação |
| `docs/audits/CURRENT.md:1061` | Causa: cada tecla no título, no Tiptap ou na legenda passava por `setRawAction`/`recordLoc | item da Ação |
| `docs/audits/CURRENT.md:1158` | fluindo diretamente sobre o fundo da página (sem moldura externa de cartão, borda ou fundo isolado, conforme regra de design em AGENTS.md), com selet | Card (superfície bg-card) |
| `docs/audits/CURRENT.md:1230` | ou a segunda etapa local: página `/app/planejamento` simplificada sem cartões/gutters externos ou placeholder ilustrado; busca/menu comum e botão ao lado do par | Card (superfície bg-card) |
| `docs/audits/CURRENT.md:1258` | Proprietário aceitou C1 (cabeçalho do portal em celular estreito) e C2 (login da equipe e  | dúvida |
| `docs/audits/CURRENT.md:1324` | Proprietário pediu análise completa, conformidade com os padrões de design e um site para  | dúvida |
| `docs/audits/CURRENT.md:1600` | itos: ring externo passa de1px para2px durante edição; altura real do cartão Linha cresce1,75px (36,25→38px no Chromium1193px), pois o i | item da Ação |
| `docs/audits/2026-11-05-v44-custom-components-prism-audit.md:44` | `: possui `outline-none` sem classe explícita de `focus-visible` no cartão clicável (`role="button" tabIndex={0}`). | dúvida |
| `docs/audits/2026-11-05-v44-custom-components-prism-audit.md:46` | - `UPreferenceSwitch.tsx:21-25`: usa moldura de cartão (`rounded-2xl border bg-card/25 p-4`) que precisa ser desempacotada para atender à re | Card (superfície bg-card) |
| `docs/audits/2026-11-05-v44-custom-components-prism-audit.md:69` | ### Novo Lote B — Ajuda (`/app/help`), cartões e calendário do cliente (`/dash`) | dúvida |
| `docs/audits/2026-11-05-v44-custom-components-prism-audit.md:74` | \| `app/components/client/ClientCalendar.tsx:89-105, 191-216` \| Botões anterior/próximo usa | dúvida |
| `docs/audits/2026-11-05-v44-custom-components-prism-audit.md:75` | \| `app/components/uzzina/UAdminItemCard.tsx:26-37`           \| Cartão com `role="button" tabIndex={0}` aplica `outline-none` sem classe `focus-visible`,  | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-05-v44-custom-components-prism-audit.md:87` | :26, 43-57` e `app/routes/app/profile.tsx:661, 702`     \| Molduras de cartão (`rounded-2 | Card (superfície bg-card) |
| `docs/audits/2026-11-04-v36-avatar-comparison.md:75` | \| [Admin/clients](../../app/routes/app/admin/clients.tsx), 57–65 | Card da lista admin (UAdminItemCard) |
| `docs/audits/2026-11-04-v36-avatar-comparison.md:76` | \| [UAvatarSelector](../../app/components/uzzina/UAvatarSelector.tsx), 55–88; [UAdminItemCa | dúvida |
| `docs/audits/2026-11-04-v36-avatar-comparison.md:127` |  em consumidores reais: 16/24/32px dos gatilhos/rodapé; 48/72/96px de cartões/perfil/cadastros; fundo e texto de marcas nos dois temas; imagem válida/ausente | Card (superfície bg-card) |
| `docs/audits/2026-11-04-phase-icon-usage.md:8` | \| sm 16px \| Cartão Bloco, cabeçalho do cartão Conteúdo, busca, menus de fase, calendário e detalhe do  | item da Ação |
| `docs/audits/2026-11-04-phase-icon-usage.md:13` | \| dot 8px \| Cartão Linha sem atraso. \| | item da Ação |
| `docs/audits/2026-11-04-phase-icon-usage.md:15` | progress tem uso nos cartões, busca e rodapé. icon tem uso nos menus, calendário e detalhe do portal. Ambas dev | Card (superfície bg-card) |
| `docs/audits/2026-11-03-ticket-dispatch.md:21` | \| Design system               \| [DS17 — Testar a cor viva da fase nos cartões de ação](../../.scratch/design-system-audit/issues/17-vivid-phase-color-cards.md)  | item da Ação |
| `docs/audits/2026-11-16-ds22-secondary-buttons-study.md:159` | m moldura. Combina com as áreas de formulário e de seção que não usam cartão (regra de superfícies do `AG | Card (superfície bg-card) |
| `docs/audits/2026-11-18-arq01-estrutura.md:5` | A primeira mudança recomendada é retirar consultas antigas de Leads, revisão pública e lis | Card do lead (LeadCard) |
| `docs/audits/2026-11-18-arq01-estrutura.md:18` | t \| Páginas consultam listas de ações com chaves escopadas. Quadros e cartões usam os mesmos dados e mutações, com recortes por tela. Hoje e Home dividem par | dúvida |
| `docs/audits/2026-11-18-arq01-estrutura.md:51` | 2. **Desfazer o ciclo dos cartões de ação.** Hoje o cartão chama as variantes Linha e Bloco, que voltam ao cartão pa | item da Ação |
| `docs/audits/2026-11-18-arq01-estrutura.md:67` | **Cartões de ação.** O cartão carrega Linha e Bloco, e as duas variantes importam os detalhe | item da Ação |
| `docs/audits/2026-11-18-arq01-estrutura.md:73` | ssa rodada de leitura, Arquivos tinha a lacuna concreta de cobertura, Cartões era uma intervenção pequena de manutenção e Portal tinha o maior alcance. O propri | dúvida |
| `docs/audits/2026-11-18-arq01-estrutura.md:85` | ## Cartões de ação | item da Ação |
| `docs/audits/2026-11-18-arq01-estrutura.md:87` |  o comportamento intencional quando o título recebe foco. A altura do cartão durante edição é o critério e foi preservada no | item da Ação |
| `docs/audits/2026-11-18-arq01-estrutura.md:89` | ma análise de 308 módulos TypeScript confirmou que o ciclo passa pelo cartão e pelos formatos Linha e Bloco. A simulação em memória da extração dos cinco elemen | item da Ação |
| `docs/audits/2026-11-18-arq01-estrutura.md:95` | \| Home, Sprint                                     \| Selo Sprint, cartão durante o arraste e reordenação por teclado.                                        | item da Ação |
| `docs/audits/2026-11-18-arq01-estrutura.md:98` | ões em Chromium isolado observaram abertura da ação tanto com foco no cartão quant | dúvida |
| `docs/audits/2026-11-18-arq01-estrutura.md:114` | O roteiro de cartões agora verifica o contorno de foco vigente. A execução em Chromium isolado passou p | dúvida |
| `docs/audits/social-planning-recovery/T11-evidence.md:92` |  dia, interruptor "Substituir o post do dia", extra Estático, nome no cartão) e o diálogo Finalizar. | dúvida |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:7` | as cores de fundo e dos cinzas do app: o fundo da página, o fundo dos cartões, dos menus flutuantes (popover), dos campos de texto, das bordas e dos botões secu | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:26` | - Derivados por delta: cartão (`card`), popover, borda, campo (`input`), ação (`action`) e ação em hover (`action | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:46` | \| Cartão \| -0,02 \| L 0,940, #eaebec \| L 0,980, #f8f8f8 \| | dúvida |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:63` | \| Cartão \| +0,05 \| L 0,250, #1e2226 \| L 0,300, #272f35 \| | dúvida |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:77` | \| Par \| Sobre fundo \| Sobre cartão \| Sobre popover \| Sobre secundário \| Sobre campo \| | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:92` | os principais e secundários passam. O texto suave escuro falha 3:1 em cartão e secundário (2,3 a 2,8). O texto suave claro passa, no limite (3,5 a 4,4). | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:97` | fff, igual ao fundo. Como o tema é plano (sem sombra e sem relevo), o cartão de ação **some sobre a página branca** e o hover não | item da Ação |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:98` |  em hover e secundário em hover também são iguais (0,400 e 0,450). Um cartão | dúvida |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:109` | O delta de croma é zero, mas o croma do fundo continua valendo. Por isso o texto escuro fi | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:114` | - **Popover mais escuro que a página (-0,03), com cartão em +0,05:** inverte a hierarquia usual de escuro (camadas flutuantes costumam ser m | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:125` | ono (#ffffff) \| Popover, ação e ação em hover iguais ao fundo branco. Cartão de ação some (tema plano, sem sombra). Hover invisível. Ação de hoje (-0,02) muda p | item da Ação |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:132` | ao Carbono: popover, ação e hover iguais ao fundo branco. Tema plano, cartão de ação some. \| | item da Ação |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:133` | ffffff) \| Popover, ação e hover iguais (#ffffff). Tem sombra, então o cartão ainda se separa pela sombra, mas sem preenchimento. \| | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:152` | **Padrão geral:** o problema do escuro vem do fundo `#09090b` (L 0,141) usado por seis tem | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:248` | - **Carbono e Cobalto (temas planos, claro):** sem exceção, o cartão de ação fica branco sobre branco. Com a exceção de -0,02 (Carbono) e -0,03 (Cobalto | item da Ação |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:251` | - Nenhum tema precisa de fórmula própria para texto, cartão, popover, campo, borda ou secundário. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:260` | **D1. Cartão de ação nos temas planos claros (Carbono e Cobalto).** | item da Ação |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:261` | - Sem exceção: o cartão fica igual à página branca, e o hover não aparece. | dúvida |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:263` | comendação:** exceção pequena (uma variável, dois temas). Sem ela, os cartões desses temas somem. | dúvida |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:282` | - Mudar para algo mais claro que o fundo (por exemplo +0,05, igual ao cartão): mais coerente com a hierarquia de elevação, mas é uma mudança visual ampla. | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:296` | rio aprovado tem três pontos que mudam a aparência de temas inteiros (cartão de Carbono e Cobalto, texto suave no escuro e borda igual ao secundário). Recomendo | Card (superfície bg-card) |
| `docs/audits/2026-11-16-ds24-cor-pai-analise.md:304` | o cálculo; os valores de cada tema são escolha dele. Se um tema tiver cartão, popover ou cartão de ação totalmente brancos como o fundo, � | item da Ação |
| `docs/audits/2026-10-28-profile-preferences-scroll.md:66` | ## Colunas sem cartão e corte no cabeçalho | Card (superfície bg-card) |
