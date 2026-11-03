# 01 — Anéis de foco consistentes (ring-ring/30)

Status: Aplicado local (03/11) — aguarda validação visual do proprietário
Escopo: somente estilos de foco em `app/` (sem mudar comportamento de teclado/foco).

## Contexto

O proprietário quer todos os anéis de foco do app iguais ao do botão Prism: mesma largura, mesma opacidade (/30) e mesmo estilo. Hoje há três famílias divergentes: `ring-ring/50`, `ring-ring` pleno e `outline-*`, além de `ring-primary` e variações inset. A regra base em `app/tailwind.css:379` aplica `outline-ring/50` a todo elemento.

## Padrão (fonte: `app/components/prism/button.tsx:11`)

`outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30`

- Variantes de estado mantêm a própria cor, mas com a mesma largura (ring-3): destructive `ring-destructive/20` (button:24, badge:13), success `ring-success-accent/30` (button:26).
- Contêineres de campo usam `focus-within:` ou `has-[...:focus-visible]:` com as mesmas classes (combobox:259, time-field:12, input-group:24).
- Equivalência: `ring-[3px]` = `ring-3` (mesma largura; só padronizar a escrita).

## Levantamento (arquivo:linha | classe atual | difere em quê | proposta)

### A. Já no padrão (10 + 2 equivalentes) — sem ação
button:11, badge:4, color-field:10, combobox:259, date-range-picker:119, input-group:24, input:9, select:84, textarea:15, time-field:12 | `border-ring ring-3 ring-ring/30` | nada | manter
prism/slider.tsx:79 | `ring-3 ring-ring/30` (sem border) | sem border-ring (thumb) | manter
prism/toggle.tsx:9 | `ring-[3px] ring-ring/30` | só a grafia | trocar para `ring-3` (opcional)

### B. Prism primitivos fora do padrão (7)
| arquivo:linha | classe atual | difere em quê | proposta |
|---|---|---|---|
| prism/calendar.tsx:292 | `group-data-[focused=true]/day:border-ring ring-[3px] ring-ring/50` | /50 | `ring-3 ring-ring/30` |
| prism/checkbox.tsx:26 | `group-data-[focus-visible]:border-ring ring-[3px] ring-ring/50` | /50 | `ring-3 ring-ring/30` |
| prism/radio-group.tsx:25 | `group-data-[focus-visible]/radio:border-ring ring-[3px] ring-ring/50` | /50 | `ring-3 ring-ring/30` |
| prism/color-area.tsx:38 | `focus-visible:ring-2 ring-primary ring-offset-1` | largura 2, cor primary, offset | `ring-3 ring-ring/30` (+ border-ring se couber), sem offset |
| prism/color-slider.tsx:50 | `focus-visible:ring-2 ring-primary ring-offset-1` | idem | idem |
| prism/button.tsx:29 | `unstyled: focus-visible:ring-0` | sem anel | exceção: consumidores `unstyled` definem o foco próprio (conferir) |
| prism/input-group.tsx:258,278 | `focus-visible:ring-0` | anel desligado no controle interno | manter: o anel está no grupo (input-group:24) |

### C. Componentes do app com ring fora do padrão (11)
| arquivo:linha | classe atual | difere em quê | proposta |
|---|---|---|---|
| features/CalendarDayCell.tsx:97 | `ring-2 ring-ring/50 ring-inset` | ring-2, /50, inset | `ring-3 ring-ring/30` (confirmar inset, ver D) |
| features/action-drawer/ActionFormDrawer.tsx:974 | `bg-input ring-2 ring-ring ring-inset` | ring-2, pleno, inset | `ring-3 ring-ring/30` (+ bg-input?) |
| features/action-drawer/conflict-comparison.tsx:233 | `ring-2 ring-ring/50 ring-inset` | ring-2, /50, inset | padrão |
| layout/KanbanPhasesBoard.tsx:177 | `ring-2 ring-ring/50 ring-inset` | ring-2, /50, inset | padrão |
| routes/app/profile.tsx:316 | `ring-2 ring-ring/50 ring-inset` | ring-2, /50, inset | padrão |
| routes/app/profile.tsx:432 | `ring-2 ring-ring/50 ring-inset` | idem | padrão |
| routes/app/admin/partner/$slug.tsx:499 | `focus-within:border-ring ring-[3px] ring-ring/50` | /50 | `ring-3 ring-ring/30` |
| routes/app/admin/partner/$slug.tsx:535 | idem | /50 | idem |
| features/media/ContentReorderDialog.tsx:73 | `ring-2 ring-ring` | ring-2, pleno | padrão |
| features/media/ContentReorderDialog.tsx:89 | `ring-2 ring-ring` | idem | padrão |
| features/media/InstagramPreview.tsx:140 | `ring-2 ring-ring ring-inset` | ring-2, pleno, inset | padrão |
| features/media/WorkFileThumbnail.tsx:55 | `ring-2 ring-ring` | ring-2, pleno | padrão |

(Linhas = 12 ocorrências; contadas abaixo.)

### D. Foco por `outline-*` (3 + global)
| arquivo:linha | classe atual | difere em quê | proposta |
|---|---|---|---|
| features/home/HomeCalendarView.tsx:115 | `outline-2 outline-offset-2 outline-ring` | outline, pleno, offset | trocar por ring padrão |
| features/home/HomeTodayView.tsx:53 | `outline-2 outline-offset-4 outline-ring` | idem | idem |
| features/media/WorkFileThumbnail.tsx:36 | `outline-2 -outline-offset-2 outline-ring` | outline interno | idem (ring padrão) |
| tailwind.css:379 | `* { @apply border-border outline-ring/50 }` | outline global /50 | alterar para `outline-ring/30` (só afeta elementos sem `outline-none`) |

### E. Anel de estado "editando" (não é foco de teclado)
| arquivo:linha | classe atual | proposta |
|---|---|---|
| features/ActionItem.tsx:174 | `ring-primary focus-within:ring-2` (cartão em edição) | confirmar com o proprietário; provável exceção (indica edição/seleção, como linhas 169 e 190) |

### F. Foco por fundo/borda, não por anel (exceções aprovadas ou a confirmar)
| arquivo:linha | classe atual | situação |
|---|---|---|
| prism/tabs.tsx:34,36 | `data-[focus-visible]:bg-input` + `border-t-primary` | exceção aprovada (AGENTS: abas) |
| features/ComboboxTrigger.tsx:33 | `data-[focus-visible]:bg-input` (variante form-footer) | exceção aprovada (rodapé) |
| features/RichTextEditor.tsx:66 | `data-[focus-visible]:bg-input` | exceção aprovada (barra do editor) |
| prism/dropdown-menu.tsx:94,96,98,163; select.tsx:207; combobox.tsx:176; command.tsx:249 | `focus:/data-focused:bg-secondary/50` | itens de lista: realce, não anel; exceção proposta |
| features/ComboboxTrigger.tsx:47; layout/Header.tsx:725 | `focus:bg-secondary/50`, `focus:bg-destructive/10` | realce; exceção proposta |
| features/HelpPage.tsx:293,322; routes/app/notifications.tsx:149; action-drawer/EssentialsTab.tsx:210,416 | `bg-foreground/5` | realce de linha/área; exceção proposta |
| prism/time-field.tsx:57 | `focus:bg-primary` | segmento selecionado; exceção proposta |
| features/ActionItemTitleInput.tsx:41 | `focus:bg-muted ring-0` | edição inline: sem anel de propósito |
| features/ActionComments/CommentInput.tsx:71 | `focus:border-0 ring-0 outline-none` | campo sem moldura, foco sem anel |
| features/PartnersCombobox.tsx:65 | `focus-visible:border-transparent ring-0` | decisão da busca (AGENTS: sem ring sobre borda) |
| features/action-drawer/PartnerColorPicker.tsx:145 | `border-destructive ring-destructive/20` | estado de erro; alinhar para ring-3 se hoje for ring menor |

## Contagens

- Padrão (border-ring + ring-3 + /30): 10 (+ slider e toggle equivalentes) = 12
- `ring-ring/50`: 11 (calendar, checkbox, radio, CalendarDayCell, conflict-comparison, Kanban, profile x2, partner admin x2) + tailwind.css:379 (outline /50)
- `ring-ring` pleno com ring-2: 5 (ActionFormDrawer, ContentReorderDialog x2, InstagramPreview, WorkFileThumbnail:55)
- `ring-primary ring-2 offset-1`: 2 (color-area, color-slider) + 1 estado de edição (ActionItem:174)
- `outline-*` como foco: 3 + 1 global
- Foco só por fundo/borda ou sem anel: ~20 linhas, a maioria exceções (seção F)
- Por camada: Prism 7 divergentes; app/components 15 (11 ring + 3 outline + 1 estado); routes 4 (profile x2, partner admin x2); css 1.

Total a alterar (sem exceções): 27 ocorrências em 17 arquivos aprox.

## Decisões a confirmar com o proprietário

1. Anéis `ring-inset` (CalendarDayCell, Kanban, profile, conflict-comparison, ActionFormDrawer, InstagramPreview): manter inset por causa de contêineres com overflow oculto, só trocando para `ring-3 ring-ring/30`? Ou usar o anel externo padrão? Inset com 3px pode cortar conteúdo.
2. Abas (bg-input + borda superior primary) e rodapé da gaveta (bg-input): confirmados como exceção.
3. Itens de lista/menu (realce `bg-secondary/50`): manter como exceção (não são controles focados isolados).
4. Checkbox/radio/calendário: passar de /50 para /30 (sem exceção)?
5. Inputs com `border-ring` + ring: hoje geram aparência de borda dupla (item em aberto). Remover `border-ring` do padrão ou manter a borda trocando só a cor? Decidir antes de aplicar, pois afeta Input, Select, Textarea, Combobox, TimeField, ColorField, DateRange, InputGroup, Button e Badge.
6. Estado de edição de ActionItem:174 e color-area/slider (primary): exceção ou padrão?
7. `outline-ring/50` global (tailwind.css:379): mudar para /30 ou remover?
8. Campos sem anel de propósito (título inline, comentário, busca de parceiros): manter.

## Critérios de aceite

- Nenhum `ring-ring/50`, `ring-ring` pleno, `ring-2` de foco ou `outline-*` de foco fora das exceções aprovadas.
- Todos os anéis: `ring-3` (3px) e `/30`; variantes de erro/sucesso mantêm sua cor com a mesma largura.
- Exceções documentadas (seção F) inalteradas.
- Sem mudança de ordem de Tab, foco programático ou comportamento descrito no AGENTS.
- Arquivos alterados formatados (Prettier); sem criar testes.

## Roteiro de validação (proprietário)

1. `/ui`: com Tab, percorrer Botão, Input, Select, Textarea, Checkbox, Radio, Toggle, Slider, Calendário, Cores, Combobox: todos com o mesmo anel suave de 3px.
2. App: Tab no calendário do parceiro (dia), Kanban (coluna), Minha Conta (seções), gaveta de ação (rodapé), Reordenar conteúdo, miniaturas de arquivos, Home Hoje/Calendário, admin do parceiro (campos de cor).
3. Conferir tema claro e escuro, e que nada fica cortado em áreas com rolagem.
4. Conferir que abas, itens de menu e título inline seguem como antes.

## Aplicação (03/11)

Decisões do proprietário aplicadas: todo anel de foco usa `ring-3 ring-ring/30`; `ring-inset` mantido onde o contêiner tem overflow/rolagem (CalendarDayCell, Kanban, Minha Conta x2, conflict-comparison, ActionFormDrawer (fechar), InstagramPreview, WorkFileThumbnail miniatura) com `ring-3` inset; `outline-ring/50` global agora `/30`.
Exceções mantidas: abas, itens de lista/menu/select/combobox/command, gatilhos `form-footer`, barra do RichTextEditor, campos sem anel (título inline, comentário, busca de parceiros), estados de seleção `ring-primary` (ActionItem sprint/seleção, swatches de cor, ColorListEditor arraste, Planejamento) e erro `ring-destructive/20`.
Em aberto: borda dupla (`border-ring` + anel) nos inputs, sem decisão. Ticket 09 (seção "Foco" no `/ui`) segue a executar e mostrará quase tudo como F1.
