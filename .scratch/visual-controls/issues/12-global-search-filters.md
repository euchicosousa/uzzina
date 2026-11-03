# 12 — Busca global: filtros como sufixo do campo

Status: Pronto para executar (respostas do proprietário em 03/11/2026, registradas abaixo; perguntas abertas removidas).
Escopo: refazer a posição e a anatomia dos dois filtros da busca global (parceiros e arquivadas), usando **somente** componentes e variantes padrão do Prism, sem customização.

## Objetivo

- O filtro de parceiros deixa de ficar no rodapé da busca e passa a ser **sufixo do campo de busca** (dentro do campo, no fim).
- "Incluir arquivadas" deixa de ser checkbox com texto e vira **toggle só com ícone** (`PrismToggle`, variante padrão, sem texto = botão de ícone quadrado).
- Regra do proprietário: eliminar o customizado; usar o padrão do sistema. Foco = anel padrão.

## Contexto (estado atual)

- `app/components/features/GlobalSearchCommand.tsx`
  - Estado: `includeArchived` (:131), `selectedPartners` (:132, inicia com `initialPartnerSlug` se existir entre `partners`).
  - Consulta com debounce: efeito em :140–179 (usa `selectedPartners`, `includeArchived`, descarta resposta antiga).
  - Campo: `<PrismCommandInput placeholder="Faça sua busca..." />` (:484), dentro de `PrismCommand` controlado por `query` (:478).
  - Rodapé: `div role="group" aria-label="Filtros da busca"` com `border-t px-3 py-2` (:~640): `PartnersCombobox allowAll showText variant="filter"` (:647) e `PrismCheckbox size="sm"` com classes próprias (`rounded-lg px-2 py-2 font-normal text-muted-foreground squircle data-[selected]:text-foreground`) "Incluir arquivadas" (:661). Ambos zeram `navigatingResultsRef.current` ao mudar.
  - `onKeyDownCapture` no contêiner (:417): setas marcam `navigatingResultsRef`; Espaço só age em itens com `data-action-search-result`, `data-action-create-command`, `data-search-command` (ou no `aria-activedescendant` quando o alvo está no input e se navegava).
- `app/components/prism/command.tsx` `CommandInput` (:129–158): `SearchField` com `className="flex w-full items-center border-b border-border px-3.5"`, ícone de lupa, `Input` com `h-11` (`h-9` em `size="sm"`). **Não há** prop de sufixo/addon. Props: `size?: "sm" | "default"`.
- `app/components/prism/input-group.tsx`: `InputGroup` + addons (`data-align="inline-end"`) existem, mas o `CommandInput` não os usa (é uma barra com borda inferior, não um campo com fundo).
- `app/components/prism/toggle.tsx`: `PrismToggle` (RAC `ToggleButton`); sem texto vira `icon-*` automaticamente (`ICON_SIZE`); `aria-pressed:bg-secondary`; foco `ring-3 ring-ring/30`.
- `app/components/features/PartnersCombobox.tsx`: `allowAll`, `showText`, `variant` (`filter` | `form-footer`), `size`; `iconOnly={!showText}`. Seleção múltipla com popover aberto; Shift = exclusiva (fecha o popover) (:44–55). O popover tem seu próprio `PrismCommandInput` (:~100): **a prop nova de `CommandInput` precisa ser opcional** para não afetar esse uso e `CommandSection`/`TokensFocusSection`.
- Atenção: `PartnersCombobox.tsx` está sendo editado por outro agente (rodapé da gaveta). Este ticket só deve começar depois que essa mudança for concluída/commitada.

## Comportamento a preservar (AGENTS.md, "Busca global")

- Filtro de parceiros pertence somente à abertura da busca; inicia com o parceiro da rota `/app/partner/$slug`, se disponível; nas outras páginas, vazio = todos os parceiros operacionais disponíveis. Fechar/reabrir reinicia consulta e seleção.
- `PartnersCombobox.allowAll`: "Todos os parceiros" e seleção múltipla com popover aberto; Shift mantém seleção exclusiva. Consumidores sem `allowAll` não mudam.
- `searchActionsByTitle` (`app/models/actions.ts`) intersecta `selectedPartnerSlugs` com os parceiros disponíveis e usa overlaps; escopo efetivo vazio não consulta.
- "Incluir arquivadas" inicia **desligado em cada abertura**; sem ele, `archived=false`; com ele, omite a restrição, sempre dentro dos parceiros disponíveis/selecionados.
- Respostas de consulta/abertura anterior são descartadas. O filtro não altera rota, calendário nem atribuição de parceiros a rascunhos.
- Espaço digitado no campo continua texto antes de navegar pelos resultados (`navigatingResultsRef`); Shift+clique/Enter/Espaço em resultado abre a secundária.
- Filtro e popover deste uso não acrescentam ring sobre borda; foco por teclado usa fundo (exceção hoje documentada). **Muda** com este ticket: ver "Foco" abaixo.

## Proposta

### 1. `CommandInput` ganha `suffix` (API mínima)

Em `app/components/prism/command.tsx`:

- Nova prop opcional `suffix?: React.ReactNode`, renderizada dentro do `SearchField`, **depois** do `Input`, em um `div` com `data-slot="command-input-suffix"` e `className="-mr-2 flex shrink-0 items-center gap-1"`. Sem `suffix`, a marcação atual permanece idêntica (os usos em `PartnersCombobox`, `CommandSection`, `TokensFocusSection` não mudam).
- O `Input` continua `w-full`, então encolhe (`min-w-0` é adicionado se necessário para não estourar em telas estreitas).
- Os botões do sufixo ficam **fora** do `Input` mas dentro do `SearchField` do RAC. Verificar que o botão de limpar do `SearchField` não é afetado (hoje o cancel nativo está oculto e não há botão de limpar) e que o RAC não captura cliques/foco dos botões (usar `Button`/`ToggleButton` RAC, que já são do Prism).
- Altura: botões `size="icon-sm"` (32px) com `CommandInput` padrão (`h-11` = 44px) cabem sem alterar a altura do campo. Não aumentar a altura do campo.
- **Respondido (03/11):** ambos os botões em `size="sm"`/`icon-sm` (32px).
- **Espaçamento (respondido):** a distância da borda direita do campo até o botão mais à direita deve ser harmônica, igual ao inset vertical do botão dentro do campo: (44px − 32px) / 2 = **6px**. O padding horizontal do `SearchField` é `px-3.5` (14px); o wrapper do sufixo recebe margem negativa `-mr-2` (8px), resultando em 14px − 8px = 6px. Aplicar com classe utilitária de margem no próprio wrapper; não criar variante nova. Se `CommandInput` usar `size="sm"` (`h-9`), o inset vertical passa a 2px e a margem deve ser recalculada (`-mr-3.5` para 0px ou o valor equivalente que dê 2px).

### 2. Filtro de parceiros no sufixo

- `PartnersCombobox allowAll variant="filter" size="icon-sm"`? **Pergunta de implementação:** hoje `variant="filter"` com `showText` mostra avatares + nome (largo). Dentro do campo só cabe o modo ícone. Proposta: `showText={false}` (só `UAvatar`/`UAvatarGroup size="sm"`, que já existe e já alimenta o `title`/`aria-label` com os nomes selecionados ou "Todos os parceiros"), com `variant="filter"` (= ghost/sm do `buttonVariants`, sem variante nova). Se o gatilho `filter` sem texto não resultar quadrado/32px com a escala padrão, ajustar `ComboboxTrigger`/`PartnersCombobox` para compor `ghost` + `icon-sm` (padrão), nunca com classes avulsas.
- O nome acessível continua sendo o texto dos parceiros selecionados ("Todos os parceiros" quando vazio); acrescentar ao rótulo o contexto "Filtrar por parceiros" (ex.: `aria-label="Filtrar por parceiros: <seleção>"`) é desejável, mas só se isso não mudar os outros consumidores — decidir na implementação com o outro ticket (05) concluído.
- Remover o `div role="group" aria-label="Filtrar ações por parceiros"` do rodapé; os dois controles do sufixo ficam num `div role="group" aria-label="Filtros da busca"`.

### 3. "Incluir arquivadas" como toggle de ícone

- Substitui o `PrismCheckbox` por `<PrismToggle variant="ghost" size="icon-sm" isSelected={includeArchived} onChange={...} aria-label="Incluir arquivadas">` com o ícone Lucide `ArchiveIcon` (**confirmado**: é o ícone de arquivamento já usado no app em `ActionFormFooter.tsx` (ação arquivada/arquivar), `ActionFormDrawer.tsx:839` (banner "Esta ação está arquivada"), `BulkActionMenu.tsx:499` (Arquivar), `GlobalSearchCommand.tsx:567` (marca de resultado arquivado) e `routes/app/admin/partner/$slug.tsx:691`). Sem texto, o `PrismToggle` já resolve o tamanho de ícone; a variante `ghost` herda `aria-pressed:bg-secondary` (estado "ligado" visível sem cor customizada).
- Sem tooltip (decisão do proprietário: nome acessível "Incluir arquivadas" via `aria-label`; `title` nativo opcional se o padrão do app usar, a confirmar).
- Mantém `navigatingResultsRef.current = false` ao mudar.

### 4. Posição do toggle (escolha do proprietário)

- **Opção A (escolhida pelo proprietário em 03/11):** os dois no sufixo, ordem: `[parceiros] [arquivadas]` (parceiros primeiro porque é o filtro de escopo; arquivadas modifica o resultado dentro dele). O rodapé de filtros some por inteiro (menos altura, sem `border-t`).

### 5. Teclado e foco

- Ordem do Tab: Input de busca → parceiros → arquivadas → (lista de resultados continua navegável por setas a partir do input, como hoje; a lista não entra no Tab comum). Shift+Tab inverso. Verificar se a ordem do DOM (sufixo depois do input, antes da lista) já produz isso, sem `tabIndex` manual.
- Setas ↑/↓ e Enter continuam valendo no Input (combobox/command do RAC); o `onKeyDownCapture` do contêiner não deve tratar Espaço/Enter vindos dos botões do sufixo como resultado (hoje só reage se `closest([data-...])` ou `aria-activedescendant`; o botão não tem `aria-activedescendant`, mas há o ramo `navigatingResultsRef.current ? activeItem` — testar: com `navigatingResultsRef` verdadeiro e foco no botão do sufixo, Espaço deve alternar o toggle, não abrir resultado). Se houver conflito, restringir o ramo ao `target` ser o `Input`.
- Escape: no popover de parceiros aberto, fecha só o popover; no campo/toggle fecha a busca (diálogo), sem regressão.
- Foco: **anel padrão** `ring-3 ring-ring/30` do `PrismToggle`/`buttonVariants` (já embutido). Como o botão está dentro do campo com `border-b`, não cortar o anel (o `SearchField` não tem `overflow-hidden`; confirmar no `CommandDialog` que o contêiner não recorta). Esta decisão substitui a exceção "foco por fundo" do gatilho `filter` neste uso: atualizar AGENTS (Busca global e §5 exceções, se citada).

### 6. Largura / celular

- Em ≤ 375px o campo com lupa + input + dois botões de 32px + gaps mantém o placeholder legível (input encolhe, `min-w-0`; placeholder pode truncar). Sem quebra de linha e sem scroll horizontal. Verificar com o teclado virtual aberto (o contêiner já encolhe: `flex min-h-0 flex-col`).
- Alvos de toque: 32px é a escala padrão `icon-sm`; se o proprietário quiser 40px no celular, usar `icon` (40px) com `CommandInput` `size="default"` (44px) — apenas escolher entre escalas existentes, sem customização.

## Critérios de aceite

1. Rodapé de filtros removido; campo de busca mostra, no fim, o seletor de parceiros (ícone/avatar) e o toggle de arquivadas (ícone).
2. Nenhuma classe própria nos dois controles além das props de variante/tamanho (sem `rounded-*`, `px-*`, cores avulsas); `PrismToggle` e `PartnersCombobox` nas variantes padrão.
3. Todo o comportamento listado em "Comportamento a preservar" continua (parceiro da rota ao abrir, vazio = todos, Shift exclusivo, arquivadas desligado a cada abertura, respostas antigas descartadas, escopo vazio não consulta).
4. Teclado: Tab percorre input → parceiros → arquivadas; setas/Enter/Espaço dos resultados e a secundária por Shift continuam; Espaço no botão do sufixo alterna o filtro; Escape fecha popover/busca sem regressão.
5. Foco visível com o anel padrão e não cortado; sem foco por fundo nesses dois controles.
6. `aria-label` "Incluir arquivadas" (pt-BR) no toggle, `aria-pressed` correto; nome acessível do seletor de parceiros reflete a seleção.
7. Sem scroll horizontal e sem sobreposição a 375px; altura do campo inalterada.
8. `CommandInput` sem `suffix` renderiza idêntico a hoje (popover de parceiros, `/ui`).
9. Roteiro curto para o proprietário validar (conforme preferência de agilidade); sem testes novos por rotina.

## Fora do escopo

- Alterar a regra de dados de `searchActionsByTitle`, as chaves de cache ou a seleção inicial.
- Mudar `PartnersCombobox` além de aceitar o modo ícone no sufixo (e nunca sem coordenar com o ticket 05/outro agente).
- Redesenhar os comandos/itens da lista, o `CommandDialog` ou os popovers (ticket 03).
- Tooltip, contador de filtros ativos ou persistência dos filtros.
- Outros consumidores de `CommandInput` (sem `suffix`, ficam iguais).

## Arquivos a alterar

- `app/components/prism/command.tsx` (prop `suffix` em `CommandInput`).
- `app/components/features/GlobalSearchCommand.tsx` (remover rodapé; passar sufixo; trocar checkbox por `PrismToggle`; ajustar import de `PrismCheckbox` se ficar sem uso).
- `app/components/features/PartnersCombobox.tsx` / `ComboboxTrigger.tsx` somente se o modo ícone `filter` não ficar no padrão `ghost`/`icon-sm` (depois do outro agente).
- `app/components/ui-sections/CommandSection.tsx` (exemplo com `suffix`).

## Documentação a atualizar

- AGENTS.md, parágrafo "Busca global": controles agora no sufixo do campo (não no rodapé), arquivadas como toggle de ícone, foco por anel padrão (remover "Filtro e popover deste uso não acrescentam ring... foco por teclado usa fundo").
- `/ui` (`CommandSection`): exemplo de `PrismCommandInput` com `suffix`.
- `docs/plans/visual-controls-where.md` (linha GlobalSearchCommand: remover checkbox `rounded-lg`) e `.scratch/visual-controls/README.md` (status).
- `docs/audits/CURRENT.md` com resultado e pendências ao concluir.

## Respostas do proprietário (03/11/2026)

1. Arquivadas e parceiros ficam ambos no sufixo do campo, nesta ordem: `[parceiros] [arquivadas]`. O rodapé de filtros é removido. (Opção A.)
2. Seletor de parceiros no campo só com avatar/ícone, sem nome visível. O nome segue no `aria-label`/`title`.
3. Tamanho dos botões: 32px (`size="sm"`/`icon-sm`), com o espaçamento harmônico descrito na seção 1.
4. Ícone de arquivadas: `ArchiveIcon`, o mesmo usado para ações arquivadas no app.
