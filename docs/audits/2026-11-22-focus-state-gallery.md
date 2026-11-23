# Comparação visual dos estados de foco

**Ticket:** KEYBOARD-FOCUS-04  
**Status:** proposta de foco visível implementada no commit `b5d25a25`, presente em `main` e `origin/main`; galeria revisada em 22/11. Publicação/aceite visual do app ainda não confirmados.

## Reauditoria solicitada em 22/11/2026

O proprietário esclareceu que a proposta é padronizar o indicador de **foco de teclado**. Fundo de hover, seleção e outros estados não devem ser tratados como foco. A implementação no app separa parte desses estados, mas a galeria não os distingue com clareza: os exemplos são estáticos, a coluna Proposta aplica ring por classes de amostra (`.focused-bg`, `.danger-focused` etc.), e faltam pares explícitos de mouse/hover e teclado/Tab. Por isso ela não permite concluir, sozinha, que cada amostra representa foco de teclado real.

O que o código atual mostra:

- O CSS global em `app/tailwind.css` aplica o contorno em `:focus-visible` e em alvos React Aria com `[data-focus-visible]`; portanto o ring está condicionado ao foco visível por teclado, não a qualquer estado selecionado ou hovered.
- Itens Prism de menu, Select e Combobox passaram a usar `data-hovered:bg-secondary`. O commit removeu `focus:bg-secondary`/`data-focused:bg-secondary` e deixa a regra global de ring tratar `[data-focus-visible]`. Hover e foco de teclado têm tratamentos separados no código atual.
- A `PrismTab` conserva `hover:bg-secondary` e o estado selecionado (linha/borda ou painel), mas o commit removeu explicitamente `data-[focus-visible]:bg-secondary` e o fundo especial da aba selecionada focada. Tab por teclado agora deve mostrar o ring, sem acrescentar o fundo de hover.
- No menu do Header, o item “Sair” perdeu o fundo vermelho ligado a `focus`; o texto de erro permanece. Os itens usam o hover genérico do menu. Notificações do Header também mantêm hover e perderam o fundo exclusivo de `focus-visible`.
- Segmentos de hora tiveram removido o fundo primário de foco e estão cobertos pela regra global `[data-focus-visible]`.

Conclusão do estudo: o código atual não aplica ring só por hover/seleção; o ring é ligado a `:focus-visible`/`data-focus-visible`. A divergência principal está na **classificação e demonstração**: o ticket e a HTML juntaram todos os exemplos antes descritos como “foco” numa regra única, sem separar foco de teclado, hover, estado selecionado, foco de gerenciamento React Aria e estado aberto. A matriz e as réplicas foram revisadas para marcar as origens e mostrar repouso, hover de ponteiro, foco por Tab e seleção quando aplicável, com exemplos próprios para o menu do Header e PrismTab. Nenhuma correção no app foi feita nesta reauditoria.

Verificação desta reauditoria: leitura estática do CSS global, do diff do commit `b5d25a25` e dos componentes Header, DropdownMenu, Tabs, TimeField, Select, Combobox e Command. Não houve teste de navegador; as réplicas HTML não executam React Aria e a sessão anterior registrou bloqueio a `file://`.

## Implementação aprovada

O proprietário conferiu a galeria e escolheu espessura 3 px e offset zero. O app local recebe um contorno único no foco visível, com seletores globais que encaminham o indicador ao alvo visual composto. A conferência visual do app e a publicação continuam pendentes.

## Escopo do levantamento

Revisei os seis grupos da galeria `/ui` (`TokensFocusSection`), o contrato Prism, o fallback em `app/tailwind.css` e ocorrências de classes de foco no app. A matriz e as amostras da [galeria](focus-state-gallery.html) mostram o tratamento atual e a proposta lado a lado, em cada paleta e nos modos claro e escuro. Os toggles permanecem disponíveis para comparação e iniciam em espessura 3 e offset zero.

Na proposta, todo indicador de foco — inclusive fundo, sublinhado, ring interno, halo semântico e fallback — passa para ring primário de 3 px com offset zero. Fundo, borda ou sublinhado que existiam apenas para mostrar foco são removidos. Aparência semântica permanente (por exemplo campo inválido ou item destrutivo), seleção, drag/drop e hover ficam iguais. Nos grupos compostos, o ring continua no contêiner que recebe o foco, sem duplicar no filho.

## Mapa completo de antes e depois

| Padrão atual | Onde aparece | Proposta visual |
|---|---|---|
| Ring normal, normalmente 3 px e halo `ring-ring-halo`; alguns também mudam a borda | Botões, inputs, textarea, select, toggle, checkbox, radio, calendário, color field, time field, date range picker, combobox, badge e Prism controls | `ring-3 ring-primary ring-offset-0`; sem halo translúcido nem borda destacada apenas pelo foco |
| Variação semântica de foco em erro/destrutivo/sucesso | Botões e badges de erro/sucesso, campos inválidos, item Sair | Ring primário único. Cor/fundo/borda semânticos permanentes são preservados; realce de fundo exclusivo do foco sai |
| Ring em thumb | Slider, color area e color slider | Ring primário com offset zero |
| Ring em grupo / `focus-within` | InputGroup, busca, campo de hora e editores de parceiro | O anel aparece no grupo/contêiner, não duplicado no campo interno |
| Ring interno para evitar recorte | Coluna de campos do comparador de conflito | Ring externo com offset zero; a amostra mostra o risco de corte pelo `overflow` |
| Foco por fundo `secondary` | Itens de dropdown, select, combobox, command, abas, linhas de Ajuda/notificações e botão Fechar da gaveta | O fundo de foco é removido e substituído pelo ring primário com offset zero |
| Foco por fundo semântico/primário | Ação destrutiva no menu e segmento de hora | O fundo usado somente pelo foco sai; texto/valor semântico e seleção da aba permanecem |
| Foco por sublinhado | Links do dia na Home/Hoje, breadcrumb de parceiro e gatilho de Accordion | Sublinhado de foco vira ring primário com offset zero; hover continua independente |
| Sem indicador local ou com foco local removido | Comentário, título inline, botão unstyled e componentes delegados ao contêiner | Ring primário no alvo focado ou no contêiner composto |
| Ring especial para imagem e miniatura | Controles brancos sobre mídia; foco interno em miniaturas no FileManager | Ring primário com offset zero, exibido sobre fundos claros e escuros |
| Fallback global | Elementos sem estilo próprio, `:focus-visible` | Outline global de 3 px a 30%, offset 0, substituído pelo ring primário com offset zero |
| Seleção, arraste, alvo de drop e hover (não são foco) | Item da Ação, editor de cores e calendário do Planejamento | Sem mudança; não recebem ring apenas por estarem selecionados/arrastados |

## Referências para conferência

- Catálogo visual das famílias: `app/components/ui-sections/TokensFocusSection.tsx`.
- Fallback global: `app/tailwind.css`.
- Primários Prism: `app/components/prism/` (button, input, select, dropdown-menu, combobox, command, tabs, time-field, calendar, slider, color-area e color-slider, entre outros).
- Usos de produto: `app/components/features/ActionItem.tsx`, `ActionItemTitleInput.tsx`, `ActionComments/CommentInput.tsx`, `HelpPage.tsx`, `NotificationsPage.tsx`, `home/HomeCalendarView.tsx`, `home/HomeTodayView.tsx`, `layout/PartnersBoard.tsx`, `layout/TimelineBoard.tsx`, `media/FileManagerDialog.tsx` e `action-drawer/conflict-comparison.tsx`.
- Contratos lidos: `docs/contracts/prism-details.md` e `docs/contracts/surfaces-and-neutrals.md`.

## Limites e verificação

As amostras são réplicas HTML/CSS para revisão visual, não instâncias React Aria. A lista das dez paletas segue `app/lib/palettes.ts`; a proposta usa a primária da paleta ativa e o fundo do painel como cor do offset. Esta visualização não certifica contraste, leitor de tela, comportamento de teclado, clipping em todos os contêineres nem o resultado final após implementar no app.

- HTML e JavaScript local; sem dependências externas.
- Script embutido validado com `node --check` e `git diff --check`.
- Navegador desta sessão bloqueou a abertura direta de arquivos `file://`; não foi possível conferir o sticky nem a aparência por captura automatizada.
- TypeScript e build Vite verificados no workspace.
- A implementação está na main local. Sem commit ou deploy nesta rodada.
