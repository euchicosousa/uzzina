# Comparação visual dos estados de foco

**Ticket:** KEYBOARD-FOCUS-04  
**Status:** implementado localmente na main, aguardando conferência visual no app. A galeria guarda o antes e a decisão de anel primário de 3 px e offset zero.

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
