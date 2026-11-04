# Controles Prism: regras e pendências

Fonte de verdade: o código em `app/components/prism/`, `app/tailwind.css` e `app/components/features/`. Tickets em [`.scratch/visual-controls/`](../../.scratch/visual-controls/README.md). Regra geral do proprietário: **eliminar personalizações; usar `variant`/`size` do botão Prism.**

## 1. Regras vigentes

| Tema                  | Regra                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escala                | `xs` 24px, `sm` 32px, `default` 40px, `lg` 48px. Só ícone: `icon-xs` 24, `icon-sm` 32, `icon` 40, `icon-lg` 48. Fonte única: `buttonSizeClasses` em `button.tsx` (Toggle reutiliza).                                                                                                                                                                                 |
| Texto                 | `xs` `text-xs`; `sm` e `default` `text-sm`; `lg` `text-base`. Só `xs` usa 12px.                                                                                                                                                                                                                                                                                      |
| Conteúdo em botões    | `xs` `size-3`; `sm` `size-4`; `default` e `lg` `size-5`. Vale para ícones, avatares, `PhaseIcon`, ícones de categoria e amostras de cor.                                                                                                                                                                                                                             |
| Campos                | `Input`/`InputGroup`: ícone interno 16/20/24px (sm/default/lg). `Textarea` `min-h-30`.                                                                                                                                                                                                                                                                               |
| Raios                 | Controles até `default`: `rounded-2xl squircle`; `lg`: `rounded-3xl squircle`. ButtonGroup/ToggleGroup seguem o raio dos itens. Itens internos (select, combobox, menu, command): `rounded-xl squircle`. Badge e `PrismKbd`: `rounded-full`.                                                                                                                         |
| Squircle              | Todo elemento arredondado usa `squircle`, exceto `rounded-full` e `rounded-none`.                                                                                                                                                                                                                                                                                    |
| Containers flutuantes | Popover, Menu, Select, Combobox, Command, Dialog, AppBar, BubbleMenu: `rounded-2xl squircle`, `border border-foreground/5 dark:border-foreground/10`, lista `p-1`, `shadow-lg`. Sheet sem raio. Alert e Toaster mantêm borda semântica de 1px.                                                                                                                       |
| Larguras              | Popover `sm` `w-56`, `default` `w-72`, `lg` `w-80`. Dialog `sm` `max-w-sm`, `default` `max-w-lg`, `lg` `max-w-xl`, `xl` `max-w-2xl`; corpo em `PrismDialogBody` (`px-5 py-2`).                                                                                                                                                                                       |
| Anel de foco          | `outline-none focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30`. Destrutivo: `border-destructive/60 ring-destructive/30`. Thumbs de slider/color: só `ring-3 ring-ring/30`. `ring-inset` apenas em contêiner com overflow (`conflict-comparison`).                                                                                       |
| Foco sem anel         | Links, accordion e data da gaveta: `focus-visible:underline`. Por fundo: itens de menu/lista/command e linhas de Ajuda/notificações `bg-secondary/50`; abas, barra do editor e Fechar da gaveta `bg-input`. Sem anel: título inline, comentário.                                                                                                                     |
| Fallback global       | `:focus-visible` com outline sólido 3px, offset 0, `outline-ring/30` (`app/tailwind.css`).                                                                                                                                                                                                                                                                           |
| Cartão `ActionItem`   | Foco: `focus-within:outline-1 outline-ring/45 ring-4 ring-ring/30`, sem borda de foco; realce `border-t` branco mantido; sprint/selecionado `ring-2 ring-primary`.                                                                                                                                                                                                   |
| Ícones                | Herdam `currentColor` a 60% (`opacity-60` nos botões); checks a 100%; spinners e desabilitados são exceção. Sem ícone cinza (`text-muted-foreground`).                                                                                                                                                                                                               |
| Abas                  | `PrismTabs` `h-10 px-4`, sem raio. `underline` (padrão): linha inferior 2px `primary`, foco `bg-input`. `drawer` só no `/ui`.                                                                                                                                                                                                                                        |
| Calendário            | `cellSize` `sm` 32px, `default` 40px, `lg` 48px (independente do `size` do gatilho). Largura fluida: colunas mínimas `--cell-size`. `CelebrationDialog` usa o padrão de 40px.                                                                                                                                                                                        |
| Toggle                | `PrismToggle` = mesmos tamanhos e raios do `PrismButton`; sem texto vira botão de ícone. Seletores de cor usam `PrismToggleGroup`.                                                                                                                                                                                                                                   |
| Combobox              | `ComboboxTrigger` e comboboxes recebem `variant`/`size` do botão (padrão `ghost` + `sm`); sem variantes próprias. Avatares: `xs`/`sm` botões 16px, `default` 24px, `lg` 32px; amostras, marcadores e `PhaseIcon` seguem o ícone do botão (helpers `getTriggerAvatarSize` e `getTriggerContentSizeClass`). `ComboboxChips` `min-h-8/10/12`; chips com inset uniforme. |
| Rodapé da gaveta      | Gatilhos `ghost` `icon-lg` (só ícone) ou `lg` (texto/avatares); salvar `lg`/`icon-lg`; ícones/amostras `size-5`, avatares 32px e largura automática com mínimo 48px; altura 64px (48 + `p-2`). Foco com o anel padrão do botão.                                                                                                                                      |
| Sem alteração         | Itens de menu (`min-h-7`), Checkbox/Radio (`size-4/5/6`), Slider, Avatar (`UAvatar`) e toolbar do `RichTextEditor` (32px) ficam fora da escala de botões.                                                                                                                                                                                                            |

## 2. Concluído

| Ticket | Assunto                                                             | Status                             |
| ------ | ------------------------------------------------------------------- | ---------------------------------- |
| 01     | Anéis de foco                                                       | Aprovado                           |
| 02     | Texto por tamanho de controle                                       | Aprovado                           |
| 03     | Popovers e containers                                               | Aprovado                           |
| 04     | Calendário da barra de ferramentas                                  | Aprovado                           |
| 05     | Rodapé da gaveta (botões `lg`)                                      | Aprovado pelo proprietário (03/11) |
| 06     | Calendário de largura fluida                                        | Aprovado                           |
| 07     | `/ui`: rolagem única e altura da janela                             | Aprovado                           |
| 08     | Seção temporária de tamanhos de texto                               | Removida                           |
| 09     | `/ui`: seção Foco e ajustes (incl. `ActionItem`)                    | Aprovado                           |
| 10     | Squircle universal                                                  | Aprovado                           |
| 11     | Toggle = Button e inset dos chips                                   | Aprovado                           |
| 13     | Variantes de `ComboboxTrigger` e tamanho do conteúdo dos comboboxes | Concluído (03/11)                  |
| 14     | `/ui`: seção Ícones                                                 | Aplicado, aguarda conferência      |
| 15     | Linhas de metadados da aba Essencial                                | Aplicado, aguarda conferência      |
| 16     | `/ui`: matriz de `PartnersCombobox`                                 | Concluído (03/11)                  |
| —      | Seções Prism da galeria `/ui` (commit `e22925a`)                    | Aprovado                           |

## 3. O que falta

1. **Ticket 05 encerrado:** aceite visual registrado pelo proprietário em 03/11. [05](../../.scratch/visual-controls/issues/05-drawer-footer-triggers.md)
2. **Tickets 14 e 15:** conferir visualmente a seção Ícones do `/ui` e as linhas da aba Essencial (proprietário). [14](../../.scratch/visual-controls/issues/14-ui-icons-section.md), [15](../../.scratch/visual-controls/issues/15-essentials-rows.md)
3. **Ticket 12:** executar a busca global: filtro de parceiros como sufixo do `CommandInput` e "Incluir arquivadas" como `PrismToggle` só de ícone; hoje continuam no rodapé (executor: Claude). [12](../../.scratch/visual-controls/issues/12-global-search-filters.md)
4. **Lista de componentes:** atualizar `visual-controls-where.md` e conferir visualmente os itens "Em ajuste" (proprietário). [where](visual-controls-where.md)
5. **Limpeza:** remover o selo verde de aprovado (`approved`) do `/ui`.
6. **Commit:** base local `b5b5f33`; ajustes posteriores permanecem no diff.
7. **`/ui` com playground de propriedades:** V17 e V18 implementados localmente por Gemini, aguardando aceite do proprietário. V19–V34 continuam a fazer, com as dependências descritas nos tickets.

## 4. Onde ver

- Galeria: `/ui` (abas Tokens, Prism, Uzzina; seções em `app/components/ui-sections/`). Foco: `#tokens-focus`; ícones: `#tokens-icons`.
- Tickets e status: [`.scratch/visual-controls/README.md`](../../.scratch/visual-controls/README.md) e `issues/`.
- Lista de trabalho por componente: [visual-controls-where.md](visual-controls-where.md).
- Regras de projeto: AGENTS.md, seção 5 (Prism).

## Encerramento da rodada

V05/V14/V15/V17/V18 encerrados em 100%, com autorização do proprietário para commit. Seis correções finalizadas, incluindo ação do toaster no extremo direito. V19–V34 permanecem a fazer.
