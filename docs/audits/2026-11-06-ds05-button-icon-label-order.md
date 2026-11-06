# DS05 — Ordem de ícone e texto nos botões

Data: 06/11/2026. Ticket: [DS05](../../.scratch/design-system-audit/issues/05-button-icon-label-order.md). Escopo: investigação e proposta. Nenhum código foi alterado; a decisão é do proprietário.

## 1. Resumo

- A UZZINA não tem convenção escrita. O padrão de fato é **ícone antes do texto** (cerca de 30 dos 38 botões com texto e ícone). Os desvios (texto antes do ícone) são 9 sítios, quase todos sem justificativa semântica: `Nova Ação +`, `Novo Usuário/Cliente/Parceiro +`, `Salvar` no rodapé da gaveta, `Redefinir Senha e Entrar` com chave e `Fazer Login` com ícone de entrada.
- Nenhuma fonte de acessibilidade (WCAG, WAI-ARIA) prescreve a ordem. Elas exigem nome acessível, nome contendo o rótulo visível, ordem de DOM coerente com a visual e ícone decorativo oculto. A ordem é convenção e escolha de produto.
- Os design systems consultados divergem: Carbon manda o ícone à direita; Atlassian e Polaris tratam "antes" como padrão ou típico; os demais não puderam ser lidos (ver seção 2).
- Proposta: **ícone à esquerda por padrão; à direita apenas para avanço/direção, disclosure e link externo**; mesma ordem no DOM e na tela; espaçamento por `gap`, nunca por margem manual.
- Encontrados **12 sítios** a ajustar (11 de ordem, margem ou nome acessível, mais 1 de decisão) e **1 ajuste de sistema** (regras de padding `data-icon` que nunca são acionadas no app).

## 2. Documentação primária

### 2.1 Requisitos de acessibilidade (normativos)

| Fonte | O que exige | Ordem do ícone |
| --- | --- | --- |
| [WCAG 2.2 — 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) (A) | O nome acessível de um componente com rótulo visível deve conter o texto visível. Recomenda iniciar o nome pelo rótulo. | Não trata. |
| [WCAG 2.2 — 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Todo botão precisa de nome determinável por programa. Botão só com ícone precisa de nome explícito. | Não trata. |
| [WCAG 2.2 — 1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) (A) | Quando a ordem altera o sentido, a sequência de leitura programática deve ser correta. A técnica C27 sugere que o DOM siga a ordem visual; CSS que muda o sentido é a falha F1. | Indireta: ícone com sentido (seta de "próximo") não deve ser reordenado só por CSS. |
| [WCAG 2.2 — 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | O foco não precisa seguir o layout, mas deve preservar sentido e operação. O melhor é alinhar DOM e visual. | Indireta; ícone dentro de botão não cria parada de foco própria. |

Conclusão: **a ordem ícone/texto não é requisito de acessibilidade.** Os requisitos reais para essa decisão são (a) nome contém o texto visível, (b) ícone decorativo fora do nome acessível, (c) DOM igual à ordem visual.

### 2.2 Convenções de design systems

| Fonte | Posição | Observação |
| --- | --- | --- |
| [Carbon — Button usage](https://carbondesignsystem.com/components/button/usage/) | Ícone **sempre à direita** do rótulo, "nunca à esquerda". | A regra mais firme. Só ícone exige tooltip. |
| [Atlassian — Button examples](https://atlassian.design/components/button/examples) | `iconBefore` e `iconAfter` existem; o exemplo principal é "antes". | Não diz quando usar cada um. |
| [Atlassian — Iconography](https://atlassian.design/foundations/iconography/) | Texto apoia o ícone; chevron sempre 12px em botões. | Não prescreve posição. |
| [Shopify Polaris — s-button](https://shopify.dev/docs/api/app-home/polaris-web-components/actions/button) | Ícone "tipicamente antes" do texto. | Não descreve ícone depois. A URL antiga `polaris.shopify.com/components/actions/button` redireciona. |
| [Fluent 2 — Button usage](https://fluent2.microsoft.design/components/web/react/core/button/usage) | Não trata posição. | A prop `iconPosition` existe no React, mas a página de uso não foi suficiente. |
| [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) e [Material 3 — Buttons](https://m3.material.io/components/buttons/guidelines) | **Não verificado.** | As duas páginas são renderizadas por JavaScript e o extrator devolveu só o título. Não afirmo o conteúdo. Conhecimento geral, a confirmar: Material tem "leading icon" por padrão, e o HIG espelha em RTL. |

Divergência: Carbon (direita) contra Polaris/Atlassian (esquerda, típico). Não há consenso; é escolha de produto. Direção de leitura: em RTL o "antes" vira a direita visualmente, por isso o termo correto é `inline-start`/`inline-end`, que o Prism já usa (`data-icon`).

## 3. Mecanismo atual no Prism

`app/components/prism/button.tsx` (linhas 12 a 19, `buttonSizeClasses`) define padding assimétrico apenas quando o filho tem `data-icon="inline-start"` ou `"inline-end"` (`has-data-[icon=...]:pl-*`/`pr-*`). O botão é `inline-flex` com `gap-1`/`gap-1.5`. **Nada impõe ordem**: a ordem é a do JSX.

Achado de sistema: `data-icon` só aparece em `app/components/ui-sections/ButtonSection.tsx:116,124` e `BadgeSection.tsx` (galeria `/ui`). **Nenhum botão real usa `data-icon`**, então o padding assimétrico nunca é aplicado no app e todos os botões com ícone têm `px` simétrico. Os 12 sítios abaixo são sobre ordem; esse ajuste de sistema é à parte (seção 6, item S1).

## 4. Inventário em rotas reais

Ordem: **I-T** = ícone, texto; **T-I** = texto, ícone. Em todos os casos abaixo a ordem de DOM é igual à ordem visual (nenhum usa `order-*`/`flex-row-reverse` em botão). Os números de linha apontam a abertura do botão.

### 4.1 Ação (verbo + objeto)

| Rota / componente | Local | Ordem | Ícone | Responsável pela ordem |
| --- | --- | --- | --- | --- |
| `/app/planejamento` | `routes/app/planejamento.tsx:508` | I-T | Rotate (reiniciar) | JSX; `size-4` explícito |
| idem | `:517` | I-T | Sparkles (gerar) | JSX |
| `/app/planejamento` (lista) | `components/planning/PlanningSuggestionsList.tsx:78,89` | I-T | Check, CheckCircle | JSX |
| idem | `:233,243,260` | I-T | Pencil, X, Check | JSX **mais** `mr-1` manual (gap duplicado) |
| Gaveta, comentários | `features/ActionComments/CommentInput.tsx:204` | I-T | Send | JSX mais `mr-1.5` manual |
| Gaveta, rodapé de comentário | `:83` (alterna Nota interna/Mensagem) | I-T | Lock/Globe (estado) | JSX |
| Admin, formulário de usuário | `features/AdminUserForm.tsx:236` | I-T | Save | JSX mais `mr-2` manual |
| Admin, parceiro | `routes/app/admin/partner/$slug.tsx:688` | I-T | Cloud (salvar) | JSX |
| `/app/profile` | `routes/app/profile.tsx:293` | I-T | Cloud (salvar) | JSX |
| Home, sprint | `features/home/HomeSprintView.tsx:88` | I-T | RotateCcw | JSX |
| Paleta | `uzzina/UPaletteEditor.tsx:208` | I-T | Plus | JSX |
| Gaveta, Essencial | `action-drawer/EssentialsTab.tsx:395` (arquivos) | I-T | Sliders | JSX |
| Instagram | `media/InstagramContent.tsx:105` | I-T | Sliders | JSX |
| Portal `/dash/action/$id` | `routes/dash/action/$id.tsx:439` (arquivos) | I-T | Sliders | JSX |
| **Upload (wrapper)** | `media/CloudinaryUpload.tsx:246-255` repassa `children` ao `PrismButton`; usos em `EssentialsTab.tsx:378` e `ContentReorderDialog.tsx:340` | I-T | Plus (adicionar arquivo) | Quem chama decide; hoje I-T |
| **Nova Ação** | `layout/AppBar.tsx:113` | **T-I** | Plus | JSX: `<span>Nova Ação</span><PlusIcon />` |
| **Novo Usuário / Cliente / Parceiro** | `routes/app/admin/users.tsx:48`, `clients.tsx:36`, `partners.tsx:82` (`Link` com `buttonVariants`) | **T-I** | UserPlus, UserPlus, FolderPlus | JSX |
| **Salvar / Atualizar (gaveta)** | `action-drawer/ActionFormFooter.tsx:220` | **T-I** (compacto: só ícone) | CloudUpload / Plus | JSX: `{!compact && saveLabel}` antes do ícone |
| **Redefinir Senha e Entrar** | `routes/reset-password.tsx:247` | **T-I** | Key | JSX mais `ml-2` manual |
| WhatsApp do lead | `features/leads/LeadDetail.tsx:74` (`<a>` com `buttonVariants`) | I-T | Phone (contato) | JSX |

### 4.2 Direção e navegação

| Rota / componente | Local | Ordem | Ícone | Observação |
| --- | --- | --- | --- | --- |
| `/app/leads` | `routes/app/leads.tsx:316` | I-T | ChevronLeft (voltar) | Voltar à esquerda: correto |
| Portal `/dash/action/$id` | `routes/dash/action/$id.tsx:325-332` | I-T | ArrowLeft | `Link` próprio, não `buttonVariants`; ícone `size-4` |
| `/forgot-password` | `routes/forgot-password.tsx:67-71` | I-T | ArrowLeft `size-3` | Link próprio, fora do Prism |
| `/login` e `/dash/login` | `routes/login.tsx:146`, `routes/dash/login.tsx:151` | **T-I** | LogIn (entrar) | Ação de submit com sentido de avanço; `Fazer Login` |
| Calendário (setas) | `uzzina/UCalendarToolbar.tsx:54,110`; `client/ClientCalendar.tsx:89,98` | só ícone | Chevron | Nome acessível "Dia anterior", "Próximo mês": correto |

### 4.3 Menu e disclosure

| Local | Ordem | Ícone | Observação |
| --- | --- | --- | --- |
| `uzzina/UViewOptions.tsx:118` (Visualizar/Ordenar/Exibir) | I-T-I | Ícone da função + chevron | Chevron some em `max-sm` (`max-sm:hidden`): vira só ícone + texto. Padrão correto: ícone do assunto à esquerda, chevron à direita |
| `uzzina/UColorPickerDropdown.tsx:303` | T-I | Chevron | Correto |
| `uzzina/UActionDatePicker.tsx:51` e `UCalendarToolbar.tsx:67` | I-T | Calendar | Ícone do assunto à esquerda |
| Comboboxes (`UPhaseCombobox`, `UPartnersCombobox`, `UCategoriesCombobox`, `UPeopleCombobox`) via `UComboboxTrigger.tsx:70-95` | I-T | Filtro / avatares / ícones de categoria | O "conteúdo" é seleção, não rótulo fixo; ícone ou amostra antes do texto |
| Itens de menu (`layout/Header.tsx:~720-735`) | I-T | Help, LogOut | Mesmo padrão em `PrismMenuItem` |

### 4.4 Estado

| Local | Comportamento |
| --- | --- |
| `ActionFormFooter.tsx:220` | O ícone troca (CloudUpload/Plus/Loader) sem mudar de posição; o rótulo vira só ícone com `aria-label={saveLabel}` no modo compacto. Correto no nome acessível. |
| `CommentInput.tsx:83` | Lock/Globe + texto muda com o estado; I-T estável. |
| `celebrations.tsx:143` | Troca Plus por Loader mantendo a posição; só ícone, nome muda ("Adicionando..."). |
| `PlanningSuggestionsList.tsx:243,260` | Rótulo visível muda ("Desfazer descarte", "Aprovada") mas `aria-label` fixo: ver 5.3. |

### 4.5 Fora do inventário (listados para separar)

- **Galeria `/ui`**: `ui-sections/ButtonSection.tsx:116,124` (`data-icon`), `BadgeSection.tsx`. São os únicos que acionam o padding assimétrico. Não contam como uso real.
- **Só ícone por largura**: `dash.tsx:258` (`Sair`: texto em `sr-only sm:not-sr-only`, ícone antes; correto), `AppBar.tsx:113` (`Nova Ação`/`Ação`), `ActionFormFooter` compacto, `UViewOptions` (chevron oculto), `UCalendarToolbar.tsx:67` (`showDate`).
- **Só ícone permanente**: AppBar (busca, seleção, início), Header (sino), rodapé da gaveta (duplicar, arquivar), `ContentReorderDialog` (alça, remover), exclusões em admin. Todos com `aria-label` em português.

## 5. Comparação

### 5.1 Ordem visual, DOM e nome acessível

- **Ordem visual = DOM** em todos os casos reais. Nenhum botão do app usa `order-*` ou `flex-row-reverse`; só `input-group.tsx` usa `order-first/last` em adendos de campo, que não são botões. Portanto 1.3.2 e 2.4.3 não são afetados.
- **Nome acessível**: o ícone de lucide-react é `aria-hidden` por padrão no pacote, então não entra no nome. Isso é o desejado. O texto visível é o nome (sem `aria-label`) na maioria. Onde há `aria-label` sobre texto visível, é preciso conferir 2.5.3.
- **Ordem não altera nome**: `Nova Ação +` e `+ Nova Ação` têm o mesmo nome acessível.

### 5.2 Por caso

| Caso | Ordem hoje | Observação |
| --- | --- | --- |
| Ação (criar, salvar, adicionar, editar) | Predominante I-T; 9 desvios T-I | O ícone ilustra o verbo ou o objeto. Não há movimento a indicar. |
| Direção (voltar, próximo, entrar) | Voltar I-T (3 de 3); entrar T-I (2 de 2) | Coerente com a metáfora: seta de volta à esquerda, avanço à direita. |
| Menu (disclosure) | Chevron à direita (2 de 2) | Coerente com todas as fontes que citam chevron. |
| Estado (alterna, carrega) | Ícone troca no mesmo lugar | Boa prática: a posição não pula entre estados. |

### 5.3 Nomes acessíveis a corrigir (2.5.3)

- `PlanningSuggestionsList.tsx:243`: `aria-label="Descartar sugestão"`; texto visível "Desfazer descarte" quando rejeitada. O nome não contém o visível: falha 2.5.3 quando o estado é "rejeitada".
- `PlanningSuggestionsList.tsx:260`: `aria-label="Aprovar sugestão"`; visível "Aprovada" quando aprovada. Idem.
- `UCalendarToolbar.tsx:67`: visível `MM/yy` abaixo de `md`, nome `MMMM/yy`. Em móvel a fala "11/26" não aciona. Menor.
- Remover o `aria-label` (usa o texto visível), ou prefixá-lo com o visível ("Aprovada, desfazer aprovação").

## 6. Proposta de convenção

**Regra geral: ícone antes (`inline-start`) em botões e links com texto.** Justificativa: 30 dos 38 usos já seguem; coincide com Atlassian e Polaris; o ícone funciona como marcador de escaneamento antes da leitura; mantém o rótulo alinhado à borda do contêiner quando o botão fica à direita; adapta-se a RTL por usar início/fim lógicos.

**Ícone depois (`inline-end`) somente em três exceções, todas com significado:**

1. **Disclosure** (chevron de menu, select, combobox, accordion): `UViewOptions`, `UColorPickerDropdown`. Já correto.
2. **Avanço/continuação** (seta "próximo", "continuar", "entrar" com seta de saída): `Fazer Login` com `LogIn` é aceitável aqui porque a ação é um avanço. Se o ícone for apenas decorativo (chave, nuvem), vai antes.
3. **Link externo ou abertura em outra janela** (`ExternalLink`). Hoje inexistente; registrado para quando surgir.

Voltar/anterior: ícone **antes** (seta aponta para a esquerda).

**Regras complementares**

- DOM igual à ordem visual; não usar `order-*` nem `flex-row-reverse` em botões. Em RTL usar `data-icon="inline-start|inline-end"`, não `left/right`.
- Ícone decorativo: `aria-hidden` (lucide já faz). O nome acessível é o texto visível; `aria-label` só em botão só-ícone, ou contendo o texto visível no início (2.5.3).
- Espaço entre ícone e texto vem do `gap` do botão. Proibido `mr-*`/`ml-*` no ícone.
- Quando o botão trocar de estado, o ícone não muda de lado.
- Botão que fica só com ícone por largura (`Nova Ação`/`Ação`, `Sair`): manter o texto no DOM (`sr-only` ou `aria-label` igual ao rótulo completo), e a ordem já estabelecida.
- Padding assimétrico: ou marcar os ícones com `data-icon` nos botões reais, ou remover as regras mortas de `buttonSizeClasses` (decisão do proprietário).
- Rodapé da gaveta (regra do proprietário de 03/11): ver "decisão" abaixo.

### Exemplos reais da convenção

- Ação: `Adicionar Cor` (Plus antes), `Gerar planejamento` (Sparkles antes), `Salvar Alterações` (Cloud antes).
- Direção: `Voltar para leads` (Chevron antes); `Fazer Login` (LogIn depois, exceção 2).
- Disclosure: `Visualizar` (ícone antes, chevron depois), formato de cor (texto, chevron depois).

## 7. Usos que valeria ajustar

| # | Sítio | Problema | Ajuste sugerido |
| --- | --- | --- | --- |
| 1 | `layout/AppBar.tsx:113` Nova Ação | T-I com ícone de adicionar; é a ação mais visível do app | Plus antes. Atenção ao truque `Nova Ação`/`Ação` por breakpoint |
| 2 | `routes/app/admin/users.tsx:48` | T-I (UserPlus) | Ícone antes |
| 3 | `routes/app/admin/clients.tsx:36` | idem | idem |
| 4 | `routes/app/admin/partners.tsx:82` | T-I (FolderPlus) | idem |
| 5 | `routes/reset-password.tsx:247` | T-I, Key decorativa, `ml-2` manual | Ícone antes ou remover; sem margem manual |
| 6 | `features/ActionComments/CommentInput.tsx:204` | `mr-1.5` manual sobre gap | Remover margem |
| 7 | `features/AdminUserForm.tsx:236` | `mr-2` manual | Remover margem |
| 8 | `planning/PlanningSuggestionsList.tsx:233` | `mr-1` manual | Remover margem |
| 9 | `planning/PlanningSuggestionsList.tsx:243` | `mr-1` e `aria-label` sem o texto visível | Remover margem; corrigir nome (5.3) |
| 10 | `planning/PlanningSuggestionsList.tsx:260` | idem | idem |
| 11 | `uzzina/UCalendarToolbar.tsx:67` | Nome acessível com formato diferente do visível em móvel | Alinhar (baixa prioridade) |
| 12 | `action-drawer/ActionFormFooter.tsx:220` | Salvar/Atualizar: T-I. Tem regra própria de rodapé (03/11/2026) | **Decisão do proprietário**: manter como "ação de confirmação à direita" (exceção 2 estendida) ou mover o ícone antes. No modo compacto o botão só mostra o ícone, então a ordem só vale em painéis largos |
| S1 | `prism/button.tsx:12-19` | Regras `has-data-[icon=...]` não acionadas por nenhum uso real | Adotar `data-icon` nos usos ou remover as regras |

Não mexer: `Fazer Login` (login e portal), chevrons de disclosure, setas de calendário, controles só-ícone.

## 8. Limites

- Inventário feito por busca estática do código (varredura de `PrismButton`, `PrismToggle`, `buttonVariants`, `ComboboxTrigger` com ícone no JSX e wrappers de upload), não por render. Botões montados dinamicamente (por exemplo `renderProps`) ou ícones passados por prop (`icon` em `ViewMenuTrigger`) foram lidos individualmente.
- Amostras renderizadas e versões compactas não foram abertas no navegador (o ticket pede a conferência; o servidor não foi iniciado por restrição desta tarefa). A ordem compacta foi deduzida do JSX e das classes. Recomendo conferir `Nova Ação`/`Ação`, o rodapé da gaveta e `UViewOptions` em tela estreita antes de implementar.
- Apple HIG, Material 3 e Fluent 2 não foram extraídos; marcados como não verificados na seção 2.2.
- Nenhuma implementação foi feita; a lista da seção 7 é a proposta para decisão.
