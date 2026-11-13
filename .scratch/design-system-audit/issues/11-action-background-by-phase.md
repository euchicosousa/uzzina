# DS11 — Estudar a cor de fundo das ações por fase

**Status.** Encerrado com aceite do proprietário em 12/11/2026. Implementado conforme a [seção 7](#7-plano-de-implementação-12112026) e os ajustes da seção 7.8. Falta só publicar (push).

**Bloqueado por.** Nada. As confirmações de 7.6 foram aprovadas em 12/11 e o repouso usa a sombra do app. O DS14 foi commitado em `8892b0d` e encerrado em `e1605e9`; o impacto dele no plano está em 7.7.

## O que a pessoa vê

Em Hoje e nas telas de ações do parceiro, os cartões usam o fundo padrão da paleta, com exceções como o destaque de atraso. A cor da fase já aparece nos indicadores de fluxo e no cabeçalho do Kanban. A ideia é oferecer um modo opcional em que o próprio fundo do cartão mostre a cor da fase atual: Ideia, Fazer, Fazendo, Análise, Feito ou Concluído. A preferência deve estar disponível em **Minha Conta → Aparência** e nos **comandos da busca global**. Os nomes **Padrão** e **Por fase** são provisórios.

O pedido mantém o `relief` como está. A configuração de relevo da paleta, as sombras e suas transições, o anel base e a borda superior existentes são a referência da comparação. O hover do novo modo deve ser perceptível pela mudança de superfície também em paletas planas.

## O que investigar

1. **Onde o fundo muda.** Inventariar os cartões reais em Hoje (Parceiros, Categorias, Feed e Kanban), na Home (incluindo Sprint e Atrasadas) e nos calendários e listas do parceiro. Confirmar o alcance em Linha, Bloco e Conteúdo, inclusive cartões compactos, prévia durante arraste e ações exibidas em popovers. Na variante Conteúdo, distinguir o fundo do cartão da capa ou mídia, que tem cor própria da ação. Avaliar separadamente se os resultados da busca entram no alcance. A busca é, de saída, um lugar para alternar a preferência.
2. **Como aplicar a cor.** Usar as cores existentes das fases como referência única. Comparar fundo com a cor direta da fase e fundo tonal derivado da mesma cor, em claro e escuro. Mostrar todas as seis fases lado a lado, em especial Feito e Concluído. Verificar fase ausente ou desconhecida em dados legados, mudança de fase por edição e por arraste, atualização confirmada e reversão em caso de falha. Indicar o fallback proposto e como manter a fase identificável por nome ou ícone, além da cor.
3. **Como o hover responde.** Comparar ao menos duas abordagens, como um tom de hover com luminosidade ajustada e uma sobreposição neutra leve sobre a superfície. Medir a diferença de cor em repouso e hover e o contraste dos textos, ícones e controles nos dois estados, incluindo metadados e edição de título. Mostrar claro, escuro, uma paleta plana e uma com relevo. Conferir movimento reduzido e toque, além de hover e foco por teclado. Propor a resposta mais legível sem alterar sombra, anel base, borda superior, geometria ou comportamento do relevo.
4. **Como os sinais convivem.** O atraso hoje pode ocupar o fundo inteiro. Comparar em exemplos reais qual sinal ganha o fundo e como o outro continua reconhecível. Mostrar pelo menos uma ação atrasada em Sprint e selecionada, com e sem foco. Conferir texto, ícone de fase, atraso, Sprint, seleção, foco e edição inline. Documentar a precedência recomendada e as exceções por variante.
5. **Como a preferência funciona.** Estudar um único valor pessoal compartilhado entre Minha Conta e a busca. Confirmar o comportamento ao alternar na busca, salvar em Minha Conta, reabrir, recarregar e trocar de sessão, inclusive falha, tentativa novamente e alternâncias rápidas nos dois pontos. O padrão proposto para contas existentes é preservar a aparência atual. A escolha é de cor e deve coexistir com Linha, Bloco e Conteúdo, com filtros e agrupamentos. Verificar o contrato de persistência existente e se o validador no banco exigiria uma mudança para aceitar a nova chave. Indicar o alcance e a sequência de publicação se essa mudança for necessária.

## Critérios de conclusão

- [x] O relatório separa o que já existe, o que foi observado em comparação visual e o que é proposta. Identifica as superfícies que adotariam o modo e os pontos que exigem decisão. Gaveta, portal e revisão pública ficam fora da proposta inicial.
- [x] As prévias comparáveis mostram **Padrão** e **Por fase**, as seis cores e os estados de repouso, hover e foco. Incluem exemplos de Linha, Bloco e Conteúdo, tema claro e escuro, paleta plana e com relevo, e mostram como ficam atraso, Sprint e seleção. Usar dados fictícios e registrar qualquer cenário que tenha ficado sem verificação.
- [x] A proposta define onde a opção aparece em Minha Conta e na busca, o que se vê após alternar, quando a escolha é gravada e como voltar à aparência atual. Registra a alternativa recomendada para fundo, hover e atraso, seus custos e um roteiro curto para o proprietário comparar as prévias.
- [x] O relatório informa se a solução pede apenas mudanças de interface e preferência ou também validação no banco, com dependências e estimativa de esforço. A entrega do estudo se encerra com o relatório e a proposta para revisão.

## Modelos sugeridos

Para a implementação da seção 7 (atualizado em 12/11/2026):

- **Claude Code — Sonnet 5.5.** Escopo bem delimitado (uma classe CSS, uma nova opção no menu e repasse da opção em seis telas). É o mais leve que cobre o trabalho.
- **Codex — GPT-6 Luna.** Alternativa leve para o mesmo repasse mecânico, desde que siga a lista de arquivos da seção 7.3 à risca.
- **Claude Code — Opus 5.5.** Se a conferência visual mostrar conflito entre sombra da fase, atraso, Sprint e seleção que exija redesenhar a precedência no `ActionItem`.

Plano anterior do estudo (histórico): Codex GPT-6 Luna para rastrear cartões, GPT-6.1 Sol para o estudo completo, GPT-6 Astra para conflitos entre estados.

---

# Relatório de Estudo e Proposta (08/11/2026)

> **Arquivo de prévias interativas:** [`comparativo-ds11.html`](../comparativo-ds11.html) (abrir no navegador para alternar tema claro/escuro, paleta Ônix com relevo vs Carbono plana, modo Padrão vs Tonal vs Cor Direta, fórmulas de hover H1/H2 e precedência de atraso com dados fictícios).

---

## 1. Onde o fundo muda (Inventário de Superfícies)

### 1.1. O que já existe no código

Todos os cartões de ação da área interna (`/app`) passam por um único componente central: [`ActionItem`](../../../app/components/features/ActionItem.tsx#L84-L292), que aplica `bg-action` e `hover:bg-action-hover` em `bgClasses` (linhas 142 e 155) e renderiza uma das três variantes (`ActionLineVariant`, `ActionBlockVariant`, `ActionContentVariant`).

| Superfície / Tela                                                      | Componente / Arquivo                                                                                                                                                        | Variante(s)                                                       | Como renderiza hoje                                                                                                        | Proposta para o modo "Por fase"                                                                                                                                                                |
| :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hoje → Parceiros** (`/app/today` e bloco Hoje na Home)               | [`PartnersBoard.tsx`](../../../app/components/layout/PartnersBoard.tsx#L115) → `ActionContainer`                                                                            | `line`                                                            | `ActionItem` (`showLate: true`, `showCategory: true`)                                                                      | **Entra no alcance** (via `ActionItem`)                                                                                                                                                        |
| **Hoje → Categorias**                                                  | [`CategoriesBoard.tsx`](../../../app/components/layout/CategoriesBoard.tsx#L98) → `ActionContainer`                                                                         | `line`                                                            | `ActionItem` (`showLate: true`, `showPartner: true`)                                                                       | **Entra no alcance** (via `ActionItem`)                                                                                                                                                        |
| **Hoje → Feed do Instagram**                                           | [`TodayViewParts.tsx`](../../../app/components/features/home/TodayViewParts.tsx#L137) → `ActionContainer`                                                                   | `content`                                                         | `ActionItem` (`variant="content"`, `columns={6}`)                                                                          | **Entra no alcance** na moldura/cabeçalho do `ActionItem`; a capa 4:5 interna ([`Content.tsx`](../../../app/components/features/Content.tsx#L61-L70)) preserva `action.color` ou mídia da ação |
| **Hoje → Kanban (Status das ações)**                                   | [`KanbanPhasesBoard.tsx`](../../../app/components/layout/KanbanPhasesBoard.tsx#L107-L189)                                                                                   | `line`                                                            | `ActionItem` nas colunas e no `<DragOverlay isDragging>`                                                                   | **Entra no alcance** (reforça a coluna e já atualiza a cor ao soltar em nova fase)                                                                                                             |
| **Home → Sprint** (`/app`)                                             | [`HomeSprintView.tsx`](../../../app/components/features/home/HomeSprintView.tsx#L131-L153)                                                                                  | `block` (padrão), `line`, `content`                               | `ActionItem` na grade e no `<DragOverlay isDragging>`                                                                      | **Entra no alcance** (via `ActionItem`)                                                                                                                                                        |
| **Home → Atrasadas** (`/app`)                                          | [`HomeLateView.tsx`](../../../app/components/features/home/HomeLateView.tsx#L34) → `ActionContainer`                                                                        | `block` (padrão), `line`, `content`                               | `ActionItem` com `showLate: viewOptions.late` (padrão `false` no hook `useUViewOptions`, ativável pelo usuário)            | **Entra no alcance** (quando `showLate` está desligado, mostra a fase em que a ação atrasada parou; quando `showLate` está ativo, segue a regra de precedência da Seção 4)                     |
| **Parceiro → Calendário mensal/semanal** (`/app/partner/$slug`)        | [`CalendarWithDnd.tsx`](../../../app/components/features/CalendarWithDnd.tsx#L97) e [`CalendarDayCell.tsx`](../../../app/components/features/CalendarDayCell.tsx#L125-L177) | `line` (compacto em célula), `block`, `content` + `<DragOverlay>` | `ActionItem` (no modo `content`, ações fora do feed usam `line` complementar)                                              | **Entra no alcance** (incluindo cartões compactos `@xs:p-1` e `<DragOverlay>`)                                                                                                                 |
| **Parceiro → Popover de Ações Atrasadas** (`/app/partner/$slug`)       | [`$slug.tsx`](../../../app/routes/app/partner/$slug.tsx#L215-L219) → `ActionContainer`                                                                                      | `line`                                                            | `ActionItem` dentro de `PrismPopover` (`showLate` omitido = `false`)                                                       | **Entra no alcance** (mostra a cor da fase atual de cada item atrasado listado no popover)                                                                                                     |
| **Parceiro → Coluna lateral Feed do Instagram** (`/app/partner/$slug`) | [`InstagramFeedSection.tsx`](../../../app/components/features/InstagramFeedSection.tsx#L43-L58)                                                                             | Grade 3×3 (`Content` direto, sem `ActionItem`)                    | Renderiza `<Content isSquared>` direto em `<button>`, simulando a grade do perfil do Instagram (compartilhado com `/dash`) | **Fica fora do alcance** (não é `ActionItem`; simula o mosaico real do Instagram onde a cor da peça `action.color` ou foto domina 100% do quadrado)                                            |
| **Busca Global — Resultados de ações** (`Cmd+K`)                       | [`GlobalSearchCommand.tsx`](../../../app/components/features/GlobalSearchCommand.tsx#L611-L657)                                                                             | `PrismCommandItem`                                                | Item de menu em lista com avatar do parceiro, título, data e `<UPhaseIcon phase={phase} />` à direita                      | **Recomendado manter fora do alcance de fundo** (ver justificativa em 1.2)                                                                                                                     |
| **Gaveta de ação, Portal `/dash` e Revisão pública**                   | `ActionDrawer`, `routes/dash/`, `routes/review`                                                                                                                             | Próprios                                                          | Fora do escopo por definição do ticket                                                                                     | **Fora do alcance**                                                                                                                                                                            |

### 1.2. Avaliação separada: Resultados da Busca Global (`Cmd+K`)

- **O que existe:** Em [`GlobalSearchCommand.tsx`](../../../app/components/features/GlobalSearchCommand.tsx#L622-L655), cada ação encontrada é um `<PrismCommandItem>` dentro de uma lista de comando que usa `data-[focused]:bg-accent` / `data-[selected]:bg-accent` para indicar o item ativo na navegação por setas do teclado (`↑`/`↓`), além de já exibir `<UPhaseIcon phase={phase} />` à direita.
- **Observação visual e técnica:** Colorir o fundo de cada `PrismCommandItem` pela fase dentro do modal de busca compete diretamente com o destaque de seleção/foco por teclado da lista de comandos e quebra a unidade visual com os grupos vizinhos ("Parceiros", "Comandos", "Administração").
- **Proposta (Ponto de decisão 1):** Manter os resultados da busca global com fundo neutro de `PrismCommandItem` (identificados pelo `UPhaseIcon` já presente) e usar a busca global apenas para **alternar a preferência** por comando. Caso o proprietário deseje estender aos resultados da busca, pode-se aplicar um tint mais sutil (`50%` da opacidade tonal) preservando `data-[focused]:bg-accent`.

---

## 2. Como aplicar a cor (Direta vs. Tonal Derivada em OKLCH)

### 2.1. Referência única das seis fases (`app/lib/CONSTANTS.ts`)

As seis fases definidas em [`CONSTANTS.ts`](../../../app/lib/CONSTANTS.ts#L1-L50) possuem as seguintes cores hexadecimais e coordenadas OKLCH exatas:

| Ordem | Slug       | Nome          | Hex (`phase.color`) | OKLCH da cor direta (`L`, `C`, `h`) | Contraste Cor Direta × Texto Preto (`#000`) | Contraste Cor Direta × Texto Branco (`#fff`) |
| :---: | :--------- | :------------ | :-----------------: | :---------------------------------: | :-----------------------------------------: | :------------------------------------------: |
|   1   | `idea`     | **Ideia**     |      `#fbbf24`      |      `oklch(0.837 0.164 84.4)`      |               12,58 : 1 (AAA)               |            **1,67 : 1 (Reprova)**            |
|   2   | `do`       | **Fazer**     |      `#f97316`      |      `oklch(0.705 0.187 47.6)`      |               7,49 : 1 (AAA)                |            **2,80 : 1 (Reprova)**            |
|   3   | `doing`    | **Fazendo**   |      `#ec4899`      |     `oklch(0.656 0.212 354.3)`      |                5,95 : 1 (AA)                |            **3,53 : 1 (Reprova)**            |
|   4   | `review`   | **Análise**   |      `#a855f7`      |     `oklch(0.627 0.233 303.9)`      |                5,31 : 1 (AA)                |            **3,96 : 1 (Reprova)**            |
|   5   | `done`     | **Feito**     |      `#38bdf8`      |     `oklch(0.754 0.139 232.7)`      |               9,80 : 1 (AAA)                |            **2,14 : 1 (Reprova)**            |
|   6   | `finished` | **Concluído** |      `#4ade80`      |     `oklch(0.800 0.182 151.7)`      |               12,05 : 1 (AAA)               |            **1,74 : 1 (Reprova)**            |

### 2.2. Comparação: Cor Direta vs. Fundo Tonal Derivado

1. **Problemas observados na Cor Direta (`background: phase.color`):**
   - **Desaparecimento do ícone de fase (`UPhaseIcon`):** Em [`UPhaseIcon.tsx`](../../../app/components/uzzina/UPhaseIcon.tsx#L40-L98), tanto o ponto (`size="dot"` na variante Linha), quanto o arco de progresso (`size="sm"` nas variantes Bloco e Conteúdo) e o selo preenchido de Concluído usam `phase.color` puro. Sobre um fundo que também é `phase.color`, o contraste do ícone cai para **1,00 : 1 (invisível)**.
   - **Quebra de contraste no Modo Escuro e em metadados:** Nenhuma das seis cores diretas atinge 4,5:1 contra texto branco (`#fff`, padrão do modo escuro). Mesmo forçando texto preto fixo no modo escuro, os metadados de data/hora (`opacity-50` em `ActionItemDateTimeDisplay` e `ActionBlockVariant`) caem para **2,6 : 1 a 3,1 : 1** sobre `review` (`#a855f7`) e `doing` (`#ec4899`), reprovando no WCAG AA.
   - **Ofuscamento no Modo Escuro:** Seis blocos saturados de alta luminosidade (`L = 0.63` a `0.84`) sobre o fundo escuro da página (`L = 0.20`) destroem o conforto visual do tema escuro.

2. **Comportamento observado no Fundo Tonal Derivado em OKLCH (mesma arquitetura de `--late` em `app/tailwind.css`):**
   - Mantém o **matiz exato (`h`)** de `phase.color` de cada fase, ajustando apenas Luminosidade (`L`) e Croma (`C`) para superfície de cartão:
     - **Modo Claro:** `L = 0.95` (`0.955` em `idea`), `C = 0.036` → gera tons pastéis nítidos e distintos (`#faedd5`, `#ffe8db`, `#ffe5f0`, `#f3e9ff`, `#d8f3ff`, `#def6e3`) com contraste **17,7 : 1 a 18,4 : 1** contra `--foreground` (`#000`) e **> 4,6 : 1** nos metadados `opacity-50`.
     - **Modo Escuro:** `L = 0.27`, `C = 0.055` → gera superfícies escuras ricas (`#332400`, `#3c1d0c`, `#3b1a28`, `#2c1f3c`, `#012a3d`, `#0e2e18`) com contraste **14,7 : 1 a 15,4 : 1** contra `--foreground` (`#fff`) e **> 4,5 : 1** nos metadados `opacity-50`.
   - **Distinção entre Feito (`done`) e Concluído (`finished`):**
     - `done` (**Feito**) tem matiz azul-celeste (`h = 232.7°`, claro `#d8f3ff` / escuro `#012a3d`) e ícone de arco aberto (5/6).
     - `finished` (**Concluído**) tem matiz verde-esmeralda (`h = 151.7°`, claro `#def6e3` / escuro `#0e2e18`) e ícone circular sólido com check branco (`✓`). A separação cromática de `81°` no círculo OKLCH combinada ao ícone fechado elimina qualquer ambiguidade.
   - **Visibilidade de `UPhaseIcon`:** Como o fundo é tonal (`L = 0.95` no claro / `L = 0.27` no escuro) e o `UPhaseIcon` mantém `phase.color` vibrante (`L = 0.63..0.84`), o ícone de fase permanece 100% legível em ambos os temas sem precisar alterar `UPhaseIcon`.

### 2.3. Fase ausente/desconhecida, edição, arraste e falha

- **Achado em dados legados (`useActionData.ts`):**
  - Hoje, [`useActionData.ts`](../../../app/hooks/useActionData.ts#L23-L26) faz `PHASES[(action.phase as PHASE) || "idea"]`. Se `action.phase` for `null` ou `""`, cai em `PHASES.idea`. Porém, se `action.phase` contiver uma string legada desconhecida (ex.: `"archived"` ou `"pending"`), `PHASES[...]` retorna `undefined`, o que quebraria `phase.slug` em `UPhaseIcon`.
  - **Fallback proposto:** Normalizar em `useActionData` com `PHASES[action.phase as PHASE] ?? PHASES.idea` para o ícone/fluxo e, para o fundo do cartão, usar `bg-action` (`--action`, superfície padrão da paleta) sempre que `!(action.phase in PHASES)`. Assim, fases desconhecidas nunca quebram a renderização e exibem superfície neutra segura.
- **Mudança de fase por edição, atalho ou arraste (Kanban) e reversão em falha:**
  - Na edição pela gaveta ou atalhos de teclado (`i`, `f`, `z`, `a`, `t`, `c`), `useActionMutations` atualiza `action.phase` no cache do TanStack Query após confirmação e reverte em caso de erro.
  - No Kanban ([`useKanbanDnd.ts`](../../../app/hooks/useKanbanDnd.ts#L63-L118)), ao soltar o cartão em outra coluna, `overrides[action.id]` atualiza `action.phase` otimisticamente em `actionsWithOverrides`: o cartão muda de coluna e de cor de fundo no mesmo frame. Se `onDrop` confirmar, o cache persiste a nova fase; se `onDrop` falhar (`catch`/`finally` nas linhas 94–103), o override é removido e o cartão volta à coluna e à cor da fase original automaticamente. Durante o arraste (`<DragOverlay>`), `activeAction` mantém a cor da fase de origem até o drop.

---

## 3. Como o hover responde (Comparação de Abordagens e Medições)

### 3.1. As duas abordagens comparadas sobre o fundo tonal

| Abordagem                                                      | Fórmula no Modo Claro (Repouso: `L = 0.95, C = 0.036`)          | Fórmula no Modo Escuro (Repouso: `L = 0.27, C = 0.055`)         | Diferença perceptiva ($\Delta L$ / $\Delta C$)                           | Comportamento em Paletas Planas (`relief: false`, ex. Carbono/Cobalto)                                                                                      |
| :------------------------------------------------------------- | :-------------------------------------------------------------- | :-------------------------------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — Ajuste de Luminosidade e Croma em OKLCH (Recomendada)** | `L = 0.91, C = 0.050` ($\Delta L = -0.04$, $\Delta C = +0.014$) | `L = 0.33, C = 0.068` ($\Delta L = +0.06$, $\Delta C = +0.013$) | $\Delta L = 4\%$ no claro e $6\%$ no escuro com reforço de pureza da cor | **Muito nítido:** mesmo sem sombra de hover (`--action-hover-shadow: 0 0 #0000`), a superfície ganha presença cromática imediata ao passar o mouse          |
| **H2 — Sobreposição neutra (`color-mix` com `--foreground`)**  | `color-mix(in oklab, var(--phase-bg), var(--foreground) 6%)`    | `color-mix(in oklab, var(--phase-bg), var(--foreground) 8%)`    | $\Delta L \approx 3,5\%$, porém **reduz o croma ($\Delta C < 0$)**       | **Perceptível, mas acinzenta tons quentes:** em `idea` (`#fbbf24`) e `do` (`#f97316`), misturar preto no modo claro deixa o amarelo/laranja levemente turvo |

### 3.2. Medição de contraste em Repouso e Hover (Abordagem H1)

- **Modo Claro (Repouso `L = 0.95` → Hover H1 `L = 0.91`):**
  - Texto principal (`--foreground` `#000000`): **17,7 : 1 a 18,4 : 1** em repouso; **15,6 : 1 a 16,4 : 1** no hover (AAA em todas as 6 fases).
  - Metadados de horário/data (`opacity-50`): **4,6 : 1 a 5,1 : 1** em repouso e hover (AA em todas as 6 fases).
- **Modo Escuro (Repouso `L = 0.27` → Hover H1 `L = 0.33`):**
  - Texto principal (`--foreground` `#ffffff`): **14,7 : 1 a 15,4 : 1** em repouso; **11,6 : 1 a 12,3 : 1** no hover (AAA em todas as 6 fases).
  - Metadados (`opacity-50`): **4,5 : 1 a 4,8 : 1** em repouso e hover (AA).
- **Preservação do relevo (`relief`), sombras, borda superior e movimento reduzido:**
  - Nenhuma regra de `--action-shadow`, `--action-hover-shadow`, `--action-top-border` ou `--action-ring` é alterada: o modo "Por fase" troca apenas as variáveis de superfície (`bg-action` / `hover:bg-action-hover`) do cartão.
  - Em `motion-reduce` (`prefers-reduced-motion: reduce`), `motion-reduce:transition-none` já existente na linha 145 de `ActionItem.tsx` garante troca instantânea sem animação. Em dispositivos de toque, o toque aciona a abertura ou seleção sem prender estado de hover fantasma.

---

## 4. Como os sinais convivem (Atraso, Sprint, Seleção, Foco e Edição Inline)

### 4.1. O conflito entre Atraso (`showLate && isLate`) e Cor da Fase

Hoje, quando `showLate && isLate` é verdadeiro ([`ActionItem.tsx`](../../../app/components/features/ActionItem.tsx#L159-L164)), o cartão aplica:
`bg-late text-late-foreground hover:bg-late-hover border-t-late-top-border ring ring-late-foreground`
E na variante Linha ([`ActionLineVariant.tsx`](../../../app/components/features/ActionVariants/ActionLineVariant.tsx#L35-L39)), o ponto colorido da fase (`<UPhaseIcon size="dot" />`) é substituído pelo `<AlertCircleIcon className="size-4 text-late-foreground" />`.

Se o usuário ativar o fundo **Por fase**, existem dois caminhos para uma ação atrasada:

| Critério                                     | Caminho A (Recomendado): **Atraso ganha o fundo (`bg-late`) + Fase permanece visível no ícone**                                                                                                                                                               | Caminho B: **Fase ganha o fundo + Atraso fica no anel vermelho e ícone `AlertCircleIcon`**                                                                                                                                       |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fundo do cartão atrasado**                 | Mantém `bg-late` e `text-late-foreground` (vermelho de alerta urgente, idêntico ao comportamento atual)                                                                                                                                                       | Usa o fundo tonal da fase (`idea`, `do`, `doing`, `review`, `done`)                                                                                                                                                              |
| **Como o outro sinal continua reconhecível** | Na variante Linha, exibir `<UPhaseIcon phase={currentPhase} size="dot" />` **ao lado** do `<AlertCircleIcon />` quando atrasada (hoje o `AlertCircleIcon` esconde o `UPhaseIcon` na variante Linha; nas variantes Bloco e Conteúdo o `UPhaseIcon` já aparece) | O atraso depende apenas do `AlertCircleIcon` e de um `ring-late-foreground` (que é **sobrescrito** por `ring-2 ring-primary` se a ação estiver em Sprint ou Selecionada!)                                                        |
| **Segurança operacional**                    | **Alta:** Uma ação atrasada em Sprint e selecionada continua imediatamente reconhecível como atrasada pelo fundo `bg-late`, mesmo quando `ring-2 ring-primary` ocupa o anel                                                                                   | **Baixa:** Em uma ação atrasada + em Sprint (ou selecionada), `ring-2 ring-primary` sobrescreve o anel de atraso; nas variantes Bloco e Conteúdo (que não têm `AlertCircleIcon`), o sinal de atraso **desaparece por completo**! |

### 4.2. Tabela completa de precedência recomendada (Todos os sinais simultâneos)

Exemplo crítico verificado na maquete ([`comparativo-ds11.html`](../comparativo-ds11.html), Seção 2, Cartões B e C): **Ação atrasada + em Sprint + Selecionada, com e sem foco por teclado**:

1. **Superfície (`background`):**
   - **1º lugar:** Atraso (`bg-late` / `hover:bg-late-hover`), quando `showLate && isLate`.
   - **2º lugar:** Fase (`var(--phase-<slug>-bg)` / `hover:var(--phase-<slug>-hover)`), quando a preferência **Por fase** estiver ativa e `action.phase` for válida.
   - **3º lugar (Fallback):** Superfície padrão da paleta (`bg-action` / `hover:bg-action-hover`).
2. **Ícones internos (Fase + Atraso + Sprint):**
   - **Fase:** `<UPhaseIcon phase={currentPhase} />` sempre visível nas três variantes (em `ActionLineVariant`, manter o dot da fase junto ao `AlertCircleIcon` quando atrasada, para que a fase nunca se perca quando o atraso ocupar o fundo).
   - **Atraso:** `<AlertCircleIcon />` em Linha + cor `text-late-foreground`.
   - **Sprint:** Ícone de raio `<ActionItemSprint />` (`UIcons slug="sprint"`).
3. **Anel (`ring` via `box-shadow`):**
   - Em Sprint (`showSprint && isSprint`) ou Selecionada (`isSelectionMode && isSelected`): `ring-2 ring-primary`.
   - Em Atraso sem Sprint/Seleção: `ring ring-late-foreground`.
   - Em Repouso normal: `ring ring-action-ring`.
4. **Seleção em lote (`isSelectionMode`):**
   - Recuo lateral (`pl-8` em Linha/Bloco) + `<PrismCheckbox isSelected={isSelected} />` visível à esquerda + `ring-2 ring-primary`.
5. **Foco por teclado (`:focus-within`):**
   - `focus-within:outline-3 focus-within:outline-ring/30` (separado do `box-shadow` após o DS10, portanto **convive simultaneamente** com `ring-2 ring-primary` do Sprint/Seleção e com `shadow-action`!).
6. **Edição inline do título (`isEditing` em `ActionItemTitleInput.tsx`):**
   - **Achado importante:** Na linha 43 de [`ActionItemTitleInput.tsx`](../../../app/components/features/ActionItemTitleInput.tsx#L43), o `<input>` aplica `text-foreground` fixo. Em uma ação atrasada (`text-late-foreground`), editar o título hoje troca a cor do texto de vermelho para preto/branco. Com o fundo tonal por fase, `text-foreground` tem contraste AAA (> 14,7:1), e trocar `text-foreground` por `text-inherit` no `<input>` preserva também `text-late-foreground` durante a edição de ações atrasadas.

---

## 5. Como a preferência funciona (Minha Conta, Busca Global e Banco de Dados)

### 5.1. Contrato da chave de preferência

- **Chave proposta em `UserPreferences` (`app/lib/preferences.ts`):**
  - Nome da propriedade: `actionCardColorByPhase: boolean` (ou enum `actionBackgroundMode: "default" | "phase"`; como há exatamente dois estados — **Padrão da paleta** e **Por fase** —, um booleano `actionCardColorByPhase?: boolean` com default `false` ou string `"default" | "phase"` segue o padrão exato de `followPartnerColor: boolean` e `showInstagramSidebar: boolean`).
  - **Valor padrão para contas existentes e novas:** `false` (**Padrão**), preservando 100% da aparência atual quando a chave está ausente em `person.preferences`.
  - **Escopo:** Aplicado exclusivamente na área autenticada (`/app`). Rotas públicas (`/`, `/dash`, `/review`) ignoram a preferência.
  - **Cache instantâneo no cliente (`localStorage`):** Espelhado em `"uzzina-action-bg-by-phase"` via `useAppTheme` (assim como `"uzzina-follow-partner-color"`), evitando flash visual ao recarregar a página.

### 5.2. Onde aparece e como funciona nos dois pontos

1. **Em Minha Conta → Aparência (`app/routes/app/profile.tsx`):**
   - Posicionado logo abaixo de **"Usar Cores dos Clientes"** (`followPartnerColor`), usando o mesmo componente [`UPreferenceSwitch`](../../../app/components/uzzina/UPreferenceSwitch.tsx) (ou `PrismToggleGroup` com as duas opções **"Padrão da paleta"** e **"Por fase"**):
     - **Título:** `Colorir Ações por Fase` (ou `Fundo das Ações: Padrão / Por fase`)
     - **Descrição:** `Aplica um tom suave da fase atual (Ideia, Fazer, Fazendo, Análise, Feito ou Concluído) ao fundo dos cartões de ação.`
   - **Comportamento ao alternar em Minha Conta:**
     - Segue o contrato de [`docs/contracts/pages-today-profile-planning.md`](../../../docs/contracts/pages-today-profile-planning.md): alterar em Minha Conta **aplica prévia imediata na sessão** e marca a aba **Aparência** com o indicador de alterações não salvas (`data-dirty="true"`), gravando no banco somente quando o usuário clica em **Salvar alterações**.
2. **Na Busca Global (`Cmd+K` — `app/components/features/GlobalSearchCommand.tsx`):**
   - Dois comandos explícitos (ou comando com estado selecionado `isSelected`, seguindo o padrão de `Tema claro` / `Tema escuro` nas linhas 280–295 de `GlobalSearchCommand.tsx`):
     - `Fundo das ações: Padrão da paleta` (`selected: !actionCardColorByPhase`)
     - `Fundo das ações: Cor da fase` (`selected: actionCardColorByPhase`)
   - **Comportamento ao acionar na busca:**
     - Aplica imediatamente na interface + grava em `localStorage` + enfileira no controlador único [`usePreferencePersistence`](../../../app/hooks/usePreferencePersistence.ts) (`queuePreference({ actionCardColorByPhase: true/false })`) e fecha a busca.
   - **Falha, nova tentativa e alternâncias rápidas:**
     - `createPreferencePersistence` ([`app/lib/preference-persistence.ts`](../../../app/lib/preference-persistence.ts#L13-L78)) já faz debounce de `250ms`, serializa uma requisição por vez, mescla alternâncias rápidas em `pending` e, em caso de erro de rede/banco, exibe o toast `"Não foi possível salvar suas preferências."` com botão **"Tentar novamente"** e expõe o comando `"Tentar salvar preferências"` ao reabrir a busca (`Cmd+K`). Ao trocar de sessão (`user_id` ou geração do `QueryClient`), o controlador descarta respostas atrasadas da sessão anterior.

### 5.3. Verificação do banco de dados (`update_my_preferences`) e sequência de publicação

- **Achado crítico no banco (`supabase/migrations/20261109001014_custom_theme_relief_preferences.sql`):**
  - A função RPC `public.update_my_preferences(p_patch jsonb)` valida estritamente cada chave de primeiro nível de `p_patch` em um bloco `CASE v_key ... ELSE RAISE EXCEPTION 'Unknown preference key' USING ERRCODE = '22023'; END CASE;` (linhas 21–93).
  - Na linha 31, as flags booleanas aceitas hoje são apenas:
    ```sql
    WHEN 'followPartnerColor', 'showInstagramSidebar' THEN
      IF jsonb_typeof(v_value) <> 'boolean' THEN RAISE EXCEPTION 'Invalid preference flag' USING ERRCODE = '22023'; END IF;
    ```
  - **Conclusão sobre o banco:** A solução **exige uma migration SQL simples** para incluir `'actionCardColorByPhase'` na cláusula `WHEN 'followPartnerColor', 'showInstagramSidebar', 'actionCardColorByPhase' THEN` (ou cláusula própria se for string `'default' | 'phase'`).
- **Sequência segura de publicação (Zero Downtime):**
  1. **Passo 1 (Banco primeiro):** Aplicar a migration que adiciona `'actionCardColorByPhase'` à lista de chaves aceitas em `public.update_my_preferences(jsonb)`. Isso é 100% retrocompatível com o frontend atual em produção.
  2. **Passo 2 (Frontend depois):** Publicar o código React com os tokens CSS tonais, leitura em `ActionItem`, controle em `Minha Conta → Aparência` e comandos na `Busca Global`.

### 5.4. Estimativa de esforço e arquivos impactados na futura implementação

- **Esforço estimado:** Baixo/Médio (~1 a 2 horas de implementação + testes focados).
- **Arquivos que serão tocados quando autorizado:**
  1. `supabase/migrations/<timestamp>_action_phase_bg_preference.sql` (1 linha adicionada ao `WHEN` de booleanos em `update_my_preferences`).
  2. `app/tailwind.css` (variáveis tonais `--phase-<slug>-bg` e `--phase-<slug>-hover` para claro e escuro).
  3. `app/lib/preferences.ts` e `app/hooks/useAppTheme.ts` (leitura, default `false` e sincronização com `localStorage`).
  4. `app/hooks/useActionData.ts` e `app/components/features/ActionItem.tsx` (+ `ActionLineVariant.tsx` para manter o dot da fase visível ao lado do ícone de atraso).
  5. `app/routes/app/profile.tsx` e `app/components/features/GlobalSearchCommand.tsx` (controles de preferência).

---

## 6. Roteiro curto de validação e decisões para o proprietário

1. **Abrir a maquete comparativa:**
   - Abra [`comparativo-ds11.html`](../comparativo-ds11.html) no navegador.
   - Use os botões do topo para alternar entre **Claro / Escuro**, **Ônix (Com relevo) / Carbono (Plana)** e compare **Padrão**, **Por fase · Tonal (Proposto)** e **Por fase · Cor direta**.
   - Passe o mouse sobre os cartões da primeira linha e compare **H1 ($\Delta L + \Delta C$ OKLCH)** vs **H2 (Mix neutro 6%)**.
   - Na Seção 2 da maquete, alterne o botão **Atraso** entre _"Atraso ganha fundo (bg-late)"_ e _"Fase ganha fundo (anel de atraso)"_.
2. **Decisões necessárias para aprovar ou ajustar antes de qualquer implementação:**
   - **D1 — Aplicação da cor:** Confirmar o **Fundo Tonal OKLCH** (em vez da cor sólida direta da fase).
   - **D2 — Resposta de hover:** Confirmar a **Abordagem H1 ($\Delta L + \Delta C$ em OKLCH)** para garantir percepção clara mesmo em paletas planas (`relief: false`).
   - **D3 — Precedência com atraso:** Confirmar se **Atraso continua ganhando o fundo (`bg-late`)** quando `showLate` está ativo, mantendo o ponto colorido da fase visível ao lado do ícone de alerta na variante Linha (ou se prefere que a fase ganhe o fundo mesmo nas atrasadas).
   - **D4 — Alcance:** Confirmar que todos os `ActionItem` (Hoje, Home, Kanban, Calendário e Popover de atrasadas) entram no modo, enquanto a grade 3×3 de perfil do Instagram (`InstagramFeedSection`) e os itens de lista da Busca Global mantêm seu fundo atual.
   - **D5 — Nomes na interface:** Confirmar os rótulos **"Padrão da paleta"** e **"Por fase"** (sob o título **"Cor de fundo das ações"** em Minha Conta → Aparência e na Busca Global).

---

## 7. Plano de implementação (12/11/2026)

### 7.1. O que foi decidido

- **Versão escolhida:** C da [maquete v2](../comparativo-ds11-v2.html). O fundo do cartão recebe a cor da fase misturada sobre a superfície da ação, com a mesma regra dos fundos semânticos do app (erro, aviso, sucesso, info), e a sombra e o anel ganham o matiz da fase. Isso substitui o fundo tonal calculado à parte e o hover H1 do estudo (D1 e D2).
- **Onde se liga:** um toggle nas opções de visualização de cada tela, e não mais em Minha Conta nem na busca global. A seção 5 do estudo (preferência gravada no banco, `update_my_preferences`) fica sem efeito: não há mudança de banco.
- **Telas:** página do parceiro (`/app/partner/$slug`) e três blocos da Home: **Sprint**, **Hoje** (visões Parceiros e Categorias) e **Semana/Mês**.
- **Valores aprovados pelo proprietário na maquete v2:**

| Camada | Claro | Escuro |
| --- | --- | --- |
| Fundo em repouso | cor da fase a 7% sobre `--action` | 14% sobre `--action` |
| Fundo no hover | 12% sobre `--action-hover` | 22% sobre `--action-hover` |
| Sombra em repouso | **a mesma do app** (`shadow-action`, com a cor de sombra da paleta do DS14), sem cor da fase (decisão de 12/11) | igual: `shadow-action` do app |
| Sombra de contato no hover (cor) | `oklch(from fase 0.60 0.15 h)` | `oklch(from fase 0.33 0.10 h)` |
| Sombra de contato no hover (opacidade e geometria) | 25%, `0 10px 15px -3px` e `0 4px 6px -4px` (geometria do hover atual) | 20%, mesma geometria |
| Anel do cartão | cor de contato a 8% | cor de contato a 6% |
| Sombra difusa | desligada | só no hover: `oklch(from fase 0.20 0.15 h)` a 63%, `0 14px 30px -4px` |

Em repouso, só o fundo e o anel mostram a fase; a sombra é a do app. A cor da fase na sombra aparece no hover. Paletas planas (Carbono, Cobalto) seguem sem sombra também no hover: só o fundo e o anel mudam de cor.

### 7.2. Como fica para a pessoa

- No menu **Visualizar** aparece uma opção marcável, **"Cor da fase"** (nome a confirmar, 7.6). Desligada por padrão: a aparência atual não muda para ninguém.
- Ligada, os cartões daquela tela passam a ter o fundo e a sombra da fase. Desligar volta ao padrão na hora.
- A escolha vale para a tela e some ao recarregar, como as demais opções de visualização hoje (variante, ordem, colunas). Gravar a escolha é a pergunta 7.6-b.
- No **Hoje** da Home não existe o menu Visualizar (só a escolha Kanban/Categorias/Feed/Parceiros). Nele, a opção é um botão liga/desliga com ícone de paleta ao lado dos ícones de visão (decisão de 12/11: única opção, então sem menu), e só aparece nas visões Parceiros e Categorias. Kanban já separa por fase em colunas, e Feed mostra capas.

### 7.3. Arquivos e passos

1. **`app/tailwind.css`** — classe `phase-surface`, que lê `--phase-color` do próprio cartão e aplica fundo, anel e a sombra de hover da tabela 7.1, em claro e escuro. Em repouso, a classe não troca a sombra: o cartão mantém `shadow-action`. Para as paletas planas, a sombra de hover da fase entra como valor reserva de `var(--action-hover-shadow-override, …)`: o `palette-vars.ts` já grava `0 0 #0000` nessa variável quando `relief: false` e a remove nas paletas com relevo. Assim a sombra some sozinha nas planas, sem mexer em `palette-vars.ts` e mantendo a lista de `box-shadow` válida (nunca `none`).
2. **`app/components/features/ActionItem.tsx`** — nova flag `showPhaseColor` em `ActionDisplayFlags`. Ligada e com fase conhecida, o cartão recebe `phase-surface` e `style={{ "--phase-color": currentPhase.color }}`. Fase desconhecida mantém o padrão.
3. **`app/components/uzzina/UViewOptions.tsx`** — novo campo `phaseColor` (valor e `showOptions`), padrão `false`, e o item no menu Visualizar, no mesmo formato de "Limitar altura dos dias". `getVisualizeGroups` passa a contar esse grupo, para o menu aparecer quando for a única opção.
4. **Sprint** (`app/components/features/home/HomeSprintView.tsx`) — ligar `showOptions.phaseColor` e repassar a flag aos cartões e à prévia de arraste (`DragOverlay`).
5. **Semana/Mês da Home e página do parceiro** — as duas usam o mesmo calendário (`CalendarWithDnd` → `Calendar` → `CalendarDayCell`). Repassar `viewOptions.phaseColor` nas três chamadas de `ActionContainer` de `CalendarDayCell.tsx` e na prévia de arraste de `CalendarWithDnd.tsx`. Ligar `showOptions.phaseColor` em `HomeCalendarView.tsx` e em `app/routes/app/partner/$slug.tsx`.
6. **Hoje da Home** (`HomeTodayView.tsx`, `TodayViewParts.tsx`, `PartnersBoard.tsx`, `CategoriesBoard.tsx`) — estado da opção em `HomeTodayView`, `UViewOptions` só com essa opção ao lado da escolha de visão (visível em Parceiros e Categorias), `TodayBoard` repassa a flag para `PartnersBoard` e `CategoriesBoard`, que hoje fixam as flags. A página Hoje dedicada (`/app/today`) usa o mesmo `TodayBoard`: pergunta 7.6-c.
7. **Galeria `/ui`** (`app/components/ui-sections/UzzinaViewOptionsSection.tsx`) — mostrar a nova opção.
8. **Documentação** — contrato da área em `docs/contracts/pages-today-profile-planning.md` (nova opção de visualização e onde existe) e status em CURRENT.

Fica fora: Kanban e Feed do Hoje, Atrasadas e Parceiros da Home, popover de atrasadas do parceiro, grade do Instagram, busca global, gaveta, portal e revisão pública.

### 7.4. Como os sinais convivem

- **Atraso ganha o fundo** (hoje `bg-error-background` + `ring-error`, quando `showLate`). Nessa ação, a classe da fase não entra. Era o que a maquete mostrava na seção 3; confirmar em 7.6-a.
- **Sprint e seleção** mantêm o `ring-2 ring-primary` por cima do anel da fase.
- **Foco por teclado** continua no `outline` (separado do `box-shadow` desde o DS10).
- Mudança de fase (menu, atalho, arraste no calendário) troca a cor na hora, porque `currentPhase` já vem da versão atual da ação.

### 7.5. Roteiro curto para o proprietário validar

1. Home → **Sprint** → Visualizar → marcar "Cor da fase". Ver fundo e sombra em Bloco e Linha, passar o mouse, arrastar um cartão.
2. Home → **Semana** e **Mês** → mesma opção. Arrastar uma ação de dia.
3. Home → **Hoje** → visões Parceiros e Categorias → ligar a opção. Em Kanban e Feed ela não aparece.
4. Abrir um **parceiro** → Visualizar → ligar. Conferir uma ação atrasada e uma em Sprint.
5. Repetir 1 e 4 no **escuro** e numa paleta **plana** (Carbono). Desligar a opção e ver tudo voltar ao padrão.

Não há mudança de banco nem de API: publicar é build + push, e conferir o deploy Ready.

### 7.6. Confirmações do proprietário (aprovadas em 12/11: todas as recomendadas)

- **a) Atraso:** a ação atrasada mantém o fundo vermelho de atraso, e a cor da fase não entra nela (recomendado). Ou a fase ganha o fundo e o atraso fica só no anel e no ícone.
- **b) Lembrar a escolha:** como as outras opções de visualização, a escolha some ao recarregar (recomendado, sem banco). Ou fica gravada por pessoa, o que volta a exigir mudança em `update_my_preferences` antes de publicar.
- **c) Página Hoje dedicada** (`/app/today`, aberta pelo título "Hoje" da Home): recebe a mesma opção, já que usa os mesmos quadros (recomendado), ou fica fora.
- **d) Nome no menu:** "Cor da fase".

### 7.7. O que o DS14 mudou e o efeito aqui (conferido em 12/11, `8892b0d` e `e1605e9`)

- **Sombras de elevação** (`shadow-xs` a `shadow-2xl`, aviso, fundo atrás de diálogos) passaram a usar a cor e a opacidade de sombra de cada paleta (`--shadow-tint`, `--shadow-alpha`). Os cartões de ação usam `shadow-action`, que já lê a mesma cor de sombra da paleta (`shadowColor`). Por decisão de 12/11, o repouso do cartão com a cor da fase usa essa sombra do app sem mudança.
- **Relevo dos cartões** continua separado da sombra global: `palette-vars.ts` ainda zera `--action-shadow-override` nas paletas planas. O passo 1 de 7.3 aproveita isso para desligar a sombra da fase nas planas.
- **`app/tailwind.css` livre:** o DS14 está commitado, e o checkout só tem as mudanças deste ticket e a maquete v2. O bloqueio de executor acabou.
- **Ponto de atenção, sem decisão pendente:** a sombra de hover da fase usa valores fixos aprovados na maquete e não acompanha a opacidade de sombra de cada paleta (`shadowOpacity`) nem o tema Personalizado. Na conferência visual, passar o mouse em paletas com sombra forte (Rubi escuro).
- **Nada do DS14 toca** `ActionItem.tsx`, `UViewOptions.tsx`, os blocos da Home ou a página do parceiro. A lista de arquivos de 7.3 continua a mesma.

### 7.8. Ajustes pedidos depois da primeira conferência (12/11/2026)

- **Hoje:** como a "Cor da fase" era a única opção do menu ali, virou um botão liga/desliga com ícone de paleta (`PrismToggle`) ao lado dos ícones de visão. Nas outras telas a opção segue no menu Visualizar, que tem outras escolhas.
- **Dicas ao passar o mouse:** novo primitivo `PrismTooltip` (`app/components/prism/tooltip.tsx`, React Aria). Aplicado nos menus Visualizar/Ordenar/Exibir (`UViewOptions`), nos quatro ícones de visão e no botão Cor da fase do Hoje, e no botão de Feed da página do parceiro. Exemplo na `/ui` (Toggle & ToggleGroup → Tooltip).
- **Atraso em Sprint:** antes, o anel preto da Sprint cobria o anel vermelho do atraso, e o cartão atrasado não tinha sombra própria. Agora a ação atrasada tem sombra vermelha (`late-surface`) e, em Sprint, anel de 2px vermelho. Paletas planas seguem sem sombra.
- **Borda e texto da fase (decisão de 12/11, escolhida na maquete v2 refeita com a marcação e o CSS reais):** o anel do cartão usa a própria cor da fase a 30% no claro e 55% no escuro; o texto do cartão deriva da fase (claro `oklch(from fase 0.35 0.07 h)`, escuro `oklch(from fase 0.92 0.06 h)`). Nas paletas planas o anel some, como no cartão comum: `palette-vars.ts` grava `--action-relief: 0` quando `relief: false` e o anel da fase é multiplicado por esse valor. A classe `phase-surface` foi reorganizada: cada tema define só os parâmetros, e as fórmulas ficam num lugar só.
