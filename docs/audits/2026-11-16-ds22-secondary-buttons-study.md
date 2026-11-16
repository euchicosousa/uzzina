# Estudo DS22 — Unificar os botões secundários de adicionar dentro das seções

**Data:** 16/11/2026
**Ticket:** [22-secondary-buttons-unification.md](../../.scratch/design-system-audit/issues/22-secondary-buttons-unification.md)
**Escopo desta entrega:** levantamento somente leitura dos botões de baixa ênfase ("Adicionar", "Novo", "Criar", "Gerar", "Recriar", "Remover", "Limpar", "Cancelar") dentro de seções, formulários e listas em `app/routes/` e `app/components/`, com proposta de um padrão único. Nenhum arquivo do app foi alterado, nada foi commitado e não houve execução de servidor ou navegador.

---

## 1. Base: `PrismButton` (`app/components/prism/button.tsx`)

`Button` e `LinkButton` usam o mesmo `styledButtonVariants` (CVA). Os controles são `rounded-2xl squircle`, com `border`, `text-sm font-medium` e `[&_svg]:size-5` como padrão de ícone.

### 1.1 Variantes (`variant`)

| Variante | Classes principais | Aparência |
| --- | --- | --- |
| `default` | `bg-primary border-primary text-primary-foreground`; hover mistura primária com fundo a 20% (`oklab`) | Ação principal, cheia na cor da marca |
| `outline` | `bg-transparent`; hover e `aria-expanded` com `bg-secondary`; borda cinza opaca (da classe base `border`) | Contorno sem preenchimento; baixa ênfase, com moldura |
| `secondary` | `bg-secondary text-foreground border-secondary`; hover com `foreground` a 5% | Preenchimento cinza neutro; baixa ênfase, sem moldura |
| `ghost` | `bg-clip-border border-transparent`; hover `bg-secondary` | Só texto/ícone; mais discreta |
| `ghost-error` | fundo e borda transparentes; hover com `error-background` e `text-error-foreground` | Remoção discreta, só aparece em vermelho no hover |
| `error` | `bg-error-background text-error-foreground border-error` | Ação destrutiva com preenchimento |
| `success` | `bg-success-strong border-success-strong text-success-strong-foreground` | Confirmação positiva |
| `link` | `text-foreground underline-offset-4 hover:underline border-transparent` | Texto sublinhado no hover |
| `unstyled` | sem classes (só comportamento React Aria) | Uso técnico |

### 1.2 Tamanhos (`size`)

| Tamanho | Altura | Padding horizontal | Texto | Ícone padrão |
| --- | --- | --- | --- | --- |
| `xs` | 24px (`h-6`) | `px-3` | `text-xs` | 12px (`size-3`) |
| `sm` | 32px (`h-8`) | `px-4` | `text-sm` | 16px (`size-4`) |
| `default` | 40px (`h-10`) | `px-5` | `text-sm` | 20px (`size-5`) |
| `lg` | 48px (`h-12`) | `px-5` | `text-base`, `rounded-3xl` | 20px |
| `icon` / `icon-sm` / `icon-xs` / `icon-lg` | 40 / 32 / 24 / 48px quadrado | — | — | 20 / 16 / 16 / 20px |

Em `xs` e `sm` o ícone sem classe `size-` ganha tamanho pelo próprio tamanho do botão. Em `default` ele fica em 20px.

### 1.3 `isRounded`

`isRounded` troca o squircle por `rounded-full` (circular). Os botões `icon-*` com `rounded-full` aparecem no calendário.

---

## 2. Inventário: botões de baixa ênfase em seções

Convenção de leitura: **arquivo:linha** do rótulo ou do `aria-label`. Telas descritas do jeito que o proprietário as vê. "Gaveta" é a gaveta de ação (aba **ESSENCIAL** ou **INSTAGRAM** da ação, conforme `ActionFormDrawer.tsx`).

### 2.1 Grupo A — "Adicionar / Novo" com texto dentro de seção ou formulário (7)

| # | Rótulo visível | Componente | Variante | Tamanho | Ícone | Onde aparece (tela) | Arquivo:linha |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | Adicionar Cor | `PrismButton` | outline | sm | `PlusIcon` à direita (`size-4`) | Admin → Parceiro → **Cores da Marca** | `app/components/uzzina/UPaletteEditor.tsx:208-216` (rótulo na 214) |
| A2 | Novo tópico | `PrismButton` | secondary | sm | `PlusIcon` à direita (sem classe de tamanho; herda 16px do `sm`) | Admin → Parceiro → **Tópicos** (logo abaixo de Cores da Marca) | `app/components/features/PartnerTopicsEditor.tsx:162-170` (rótulo na 168) |
| A3 | Novo / Trocar proposta | `PrismButton` | outline | sm | `RotateCcwIcon` à direita (`size-4`) | Planejamento → cabeçalho da coluna de configuração (ao lado de Gerar planejamento) | `app/routes/app/planejamento.tsx:509-516` (rótulo na 513) |
| A4 | Adicionar arquivo | `CloudinaryUpload` (aplica `PrismButton`) | **link** | sm | `PlusIcon` à direita (`size-3.5`) | Gaveta → aba ESSENCIAL → bloco de arquivos | `app/components/features/action-drawer/EssentialsTab.tsx:404-412` (rótulo na 410) |
| A5 | Adicionar conteúdo | `CloudinaryUpload` | secondary (padrão) | **xs** (padrão) | `PlusIcon` à direita (`size-3.5`) | Gaveta → aba INSTAGRAM → lista de conteúdo | `app/components/features/media/InstagramContent.tsx:98` |
| A6 | Adicionar | `CloudinaryUpload` | secondary (padrão) | **xs** (padrão) | `PlusIcon` à direita | Diálogo de reordenar conteúdo (aberto da aba INSTAGRAM e da aba ESSENCIAL) | `app/components/features/media/ContentReorderDialog.tsx:646` |
| A7 | Adicionar arquivos | `CloudinaryUpload` | secondary | xs | `PlusIcon` à direita (`size-3.5`) | Portal `/dash` → ação → arquivos de trabalho | `app/routes/dash/action/$id.tsx:434` |

Observação: `CloudinaryUpload` (`app/components/features/media/CloudinaryUpload.tsx`) tem como padrão `variant="secondary"` e `size="xs"` (linhas 82-83). Por isso A5, A6 e A7 usam os padrões, sem prop explícita.

### 2.2 Grupo B — "Adicionar / Criar" só com ícone (4)

| # | Rótulo (aria) | Componente | Variante | Tamanho | Ícone | Onde aparece | Arquivo:linha |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | Adicionar data | `PrismButton` (submit) | default (primária) | icon (40px) | `PlusIcon` | Admin → **Datas Comemorativas** → formulário da coluna esquerda, ao lado do campo de nome | `app/routes/app/admin/celebrations.tsx:144-152` |
| B2 | Criar ação em [dia] | `PrismButton` | default | icon-xs, `rounded-full` | `PlusIcon` `size-3.5` | Calendário de ações: aparece ao passar o mouse sobre a coluna do dia | `app/components/features/CalendarDayCell.tsx:93-101` |
| B3 | Criar ação para [parceiro] | `PrismButton` | secondary | icon-xs | `PlusIcon` | Quadro por parceiro: aparece ao passar o mouse sobre a coluna | `app/components/layout/PartnersBoard.tsx:94-109` |
| B4 | Criar ação em [categoria] | `PrismButton` | secondary | icon-xs | `PlusIcon` `size-4` | Quadro por categoria: aparece ao passar o mouse sobre a coluna | `app/components/layout/CategoriesBoard.tsx:80-93` |

B2 a B4 são controles escondidos até o hover (`opacity-0`, `group-hover/column:opacity-100`). Não são botões de seção no sentido visual, mas seguem a mesma função.

### 2.3 Grupo C — "Gerar / Recriar" secundários (3)

| # | Rótulo visível | Componente | Variante | Tamanho | Ícone | Onde aparece | Arquivo:linha |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Criar estratégia / Recriar estratégias | `PrismButton` | secondary | sm | **nenhum** (só spinner `ULoader` durante a geração) | Gaveta → aba ESSENCIAL → estratégias | `app/components/features/action-drawer/EssentialsTab.tsx:343-344` (texto) e `:371` (botão) |
| C2 | Recriar estratégias | `PrismButton` | secondary | sm | **nenhum** (só spinner) | Gaveta → estratégias (painel de conflito/geração) | `app/components/features/action-drawer/ActionFormDrawer.tsx:1593` |
| C3 | Gerar legenda | `PrismButton` | secondary | sm | **nenhum** | Gaveta → aba INSTAGRAM → legenda | `app/components/features/action-drawer/InstagramTab.tsx:368-372` |

### 2.4 Fora do escopo do "adicionar", mas de baixa ênfase (para referência)

Esses não são "adicionar". Ficam listados para o proprietário ver o quadro completo e para a decisão sobre cancelar, remover e limpar.

| Grupo | Rótulo | Variante / tamanho | Quantidade | Onde | Arquivo:linha |
| --- | --- | --- | --- | --- | --- |
| Remover imagem / foto | Remover imagem (×3), Remover foto (×1) | link xs | 4 | Admin → Cliente, Admin → Parceiro, Minha Conta (foto), Admin → Usuário | `app/routes/app/admin/client/$userId.tsx:195`, `app/routes/app/admin/partner/$slug.tsx:420`, `app/routes/app/profile.tsx:928`, `app/components/features/AdminUserForm.tsx:73` |
| Limpar / selecionar | Limpar seleção / Selecionar todos | link xs | 1 | Diálogo de reordenar conteúdo | `app/components/features/media/ContentReorderDialog.tsx:498` |
| Limpar | Limpar todas | link default | 1 | Seletor de datas comemorativas do parceiro | `app/components/uzzina/UPartnerCelebrationsSelector.tsx:144` |
| Remover item | Remover cor N (ícone) | ghost-error icon-sm | 1 | Cores da Marca (cada linha de cor) | `app/components/uzzina/UPaletteEditor.tsx:318-327` |
| Excluir item | Excluir tópico (ícone) | ghost icon | 1 | Tópicos (cada linha) | `app/components/features/PartnerTopicsEditor.tsx:314` |
| Cancelar | Cancelar | ghost sm | 5 | Diálogo de excluir tópico; comentário de ação; Remover das Sprints; arquivar em massa; responsáveis em massa | `PartnerTopicsEditor.tsx:211`, `ActionComments/CommentInput.tsx:201`, `bulk/BulkSprintDialog.tsx:95`, `bulk/BulkArchiveDialog.tsx:45`, `bulk/BulkResponsiblesDialog.tsx:83` |
| Cancelar | Cancelar | ghost default | 2 | Diálogo de data comemorativa; ajuste de hora em massa | `app/components/features/CelebrationDialog.tsx:234`, `bulk/BulkDateTimeDialog.tsx:177` |
| Cancelar | Cancelar | outline default | 2 | Editor de sugestão de planejamento; conflito da gaveta | `app/components/planning/PlanningSuggestionEditor.tsx:189`, `app/components/features/action-drawer/ActionFormDrawer.tsx:1392` |
| Cancelar | Cancelar | link xs | 1 | Diálogo de reordenar conteúdo | `ContentReorderDialog.tsx:503` |

Destrutivos (não entram na unificação, ficam com `error`): **Remover das Sprints** (`bulk/BulkSprintDialog.tsx:87`, error sm) e **Excluir tópico** do diálogo (`PartnerTopicsEditor.tsx:219`, error sm).

### 2.5 Páginas de criação fora do escopo (primárias)

Não entram na contagem, conforme o pedido: **Nova Ação** (`AppBar.tsx:127`, `Header.tsx`), **Novo Parceiro** (`app/routes/app/admin/partners.tsx:88`), **Novo Usuário** (`users.tsx:54`), **Novo Cliente** (`clients.tsx:42`), e **Gerar planejamento** (`planejamento.tsx:521`, primária com `SparklesIcon`).

---

## 3. Contagem por variante e tamanho (botões de adicionar/criar/gerar dentro das seções)

### 3.1 Só os textos de adicionar (grupo A, 7 botões) somados aos de gerar (grupo C, 3)

| Variante | Tamanho | Quantidade | Quais |
| --- | --- | --- | --- | --- |
| secondary | sm | **4** | Novo tópico (A2); Criar/Recriar estratégias (C1); Recriar estratégias (C2); Gerar legenda (C3) |
| outline | sm | **2** | Adicionar Cor (A1); Novo / Trocar proposta (A3) |
| secondary | xs | **3** | Adicionar conteúdo (A5); Adicionar (A6); Adicionar arquivos (A7) |
| link | sm | **1** | Adicionar arquivo (A4) |
| **Total de textos** | | **10** | |

Se contarmos só o que é "adicionar" de fato (A1 a A7, 7 botões): outline sm 2, secondary sm 1, secondary xs 3, link sm 1.

### 3.2 Só ícone (grupo B, 4 botões)

| Variante | Tamanho | Quantidade |
| --- | --- | --- |
| default | icon (40px) | 1 (Adicionar data) |
| default | icon-xs | 1 (Criar ação em dia, `rounded-full`) |
| secondary | icon-xs | 2 (Criar ação para parceiro; Criar ação em categoria) |

---

## 4. Inconsistências encontradas

1. **Mesmo papel, variantes diferentes.** "Adicionar Cor" (outline) e "Novo tópico" (secondary) estão um logo acima do outro, com o mesmo tamanho (sm) e o mesmo ícone à direita. A única diferença é a variante. É o contraste que o proprietário percebeu.
2. **Mesmo papel, tamanhos diferentes.** Os três uploads de adicionar (A5, A6, A7) usam **xs** por herança do padrão de `CloudinaryUpload`. Todos os outros textos de adicionar em seção usam **sm**. Em `xs` o texto fica em 12px, enquanto o restante da seção usa 14px.
3. **Upload com link.** "Adicionar arquivo" (A4) é a única ação de adicionar com variante `link`. Ela fica no mesmo tipo de bloco da aba ESSENCIAL que os outros arquivos.
4. **Cabeçalho "Novo / Trocar proposta" (A3)** é outline sm com ícone de reset (`RotateCcwIcon`), não de adicionar. Mesmo assim, o rótulo começa com "Novo".
5. **Gerar sem ícone.** Os três botões de IA da gaveta (C1 a C3) são secondary sm sem nenhum ícone. O `DS05` pede que verbos de disparo (gerar proposta com IA) fiquem com o ícone à direita. O "Gerar planejamento" da página de planejamento já segue isso (`SparklesIcon` à direita), mas a gaveta não. Esse ponto é separado da unificação de "adicionar".
6. **Ícone do "Novo tópico" sem tamanho explícito e com espaço literal.** O texto está escrito como `Novo tópico <PlusIcon />`, com espaço no JSX, enquanto os demais usam `gap` do botão (regra do `AGENTS.md`, seção 5). Visualmente é igual, mas não segue a regra.
7. **Capitalização.** "Adicionar Cor" tem C maiúsculo; "Novo tópico" e "Adicionar arquivo" não. Os botões de página ("Novo Usuário", "Novo Cliente", "Novo Parceiro") usam maiúscula em cada palavra.
8. **Ícone só nos "Criar ação".** B2 a B4 usam `PlusIcon` com tamanhos diferentes (`size-3.5` e `size-4`) e variantes diferentes (default e secondary). São escondidos até o hover, então o toque em tela de celular não os mostra.
9. **Cancelar.** Na mesma família de diálogos, cinco "Cancelar" são ghost sm, dois são ghost default e dois são outline default. Isso não é do grupo "adicionar", mas aparece no mesmo quadro.

---

## 5. O que a galeria `/ui` documenta

- `app/components/ui-sections/ButtonSection.tsx` mostra as variantes e as regras de **grupo** (DS18: respiro de 1px só em default e secondary). Não documenta uma regra de "botão de adicionar dentro de seção".
- `app/components/prism/button.tsx` e `docs/contracts/prism-details.md` (linha 39) registram a regra de ícone: "Criar, adicionar ou novo: sempre o `+` (`PlusIcon`) à direita do texto". A linha cita Nova Ação e os três botões de Admin, que são primários. A regra vale para os botões de adicionar em seção por extensão, e é o que o `AGENTS.md` (seção 5) diz.
- Nenhum documento fixa uma variante padrão para "adicionar dentro de seção". Essa é a lacuna que a DS22 fecha.

---

## 6. Recomendação

### 6.1 Opção principal: `secondary` + `sm` + `PlusIcon` à direita

**Por quê:**

- É a combinação mais usada entre os textos de baixa ênfase: 4 dos 10 botões de texto (Novo tópico e os três de gerar/recriar) já estão em `secondary sm`.
- `secondary` é o preenchimento neutro do `PrismButton` para ação de baixa ênfase, sem moldura. Combina com as áreas de formulário e de seção que não usam cartão (regra de superfícies do `AGENTS.md`). `outline` ganha moldura, o que pesa mais em lista com várias linhas.
- O tamanho `sm` (32px, `text-sm`) é o padrão dos controles de seção no Admin e na gaveta. `xs` é um tamanho de denso (chips e miniaturas) e não deve ser o padrão de um botão de seção.
- O `CloudinaryUpload` já usa `secondary` por padrão, então a mudança nos uploads é só de tamanho.

**Mudança prevista (6 botões, 6 arquivos):**

| # | Botão | Antes | Depois | Arquivo |
| --- | --- | --- | --- | --- |
| 1 | Adicionar Cor | outline sm | secondary sm | `app/components/uzzina/UPaletteEditor.tsx:208-216` |
| 2 | Novo / Trocar proposta | outline sm | secondary sm | `app/routes/app/planejamento.tsx:509-516` |
| 3 | Adicionar arquivo | link sm | secondary sm | `app/components/features/action-drawer/EssentialsTab.tsx:404-412` |
| 4 | Adicionar conteúdo | secondary xs | secondary sm | `app/components/features/media/InstagramContent.tsx:98` |
| 5 | Adicionar | secondary xs | secondary sm | `app/components/features/media/ContentReorderDialog.tsx:646` |
| 6 | Adicionar arquivos | secondary xs | secondary sm | `app/routes/dash/action/$id.tsx:434` |

Sem mudança: **Novo tópico** (já é `secondary sm` com `PlusIcon` à direita), **Adicionar data** (botão de envio do formulário, ícone, primário), **Criar ação em [dia/parceiro/categoria]** (controles de hover, outro padrão), **C1 a C3** (gerar/recriar, outra família, ver item 5 da seção 4).

### 6.2 Segunda opção (evidência próxima): `outline` + `sm` + `PlusIcon` à direita

Entre os textos de adicionar puros (A1 a A7), `outline sm` tem 2 casos e `secondary sm` tem 1. Se o proprietário valorizar o contorno como sinal de "adicionar", a alternativa fica praticamente empatada.

**Mudança prevista (5 botões, 5 arquivos):**

| Botão | Antes | Depois | Arquivo |
| --- | --- | --- | --- |
| Novo tópico | secondary sm | outline sm | `app/components/features/PartnerTopicsEditor.tsx:162-170` |
| Adicionar conteúdo | secondary xs | outline sm | `app/components/features/media/InstagramContent.tsx:98` |
| Adicionar | secondary xs | outline sm | `app/components/features/media/ContentReorderDialog.tsx:646` |
| Adicionar arquivos | secondary xs | outline sm | `app/routes/dash/action/$id.tsx:434` |
| Adicionar arquivo | link sm | outline sm | `app/components/features/action-drawer/EssentialsTab.tsx:404-412` |

Por que é alternativa e não principal: exige mudar Novo tópico, que já está bem, e tira o preenchimento dos uploads. Em compensação, exige 5 mudanças contra 6 da opção principal, e "Adicionar Cor" e "Novo / Trocar proposta" já estão certos. Combina também com o contorno que o proprietário já usa em "Adicionar Cor".

### 6.3 Fora da recomendação (decisões separadas)

- Tamanho `xs` nos uploads, se o proprietário quiser manter o botão denso em listas de arquivo.
- Ícone nos três botões de gerar/recriar (C1 a C3), seguindo o `DS05`, com `SparklesIcon` à direita. Não é o `PlusIcon`.
- Padronizar os cinco "Cancelar" ghost sm e os dois outline default (seção 4, item 9).
- Pode ser um ticket à parte. A DS22 cobre só os botões de adicionar dentro de seção.

---

## 7. Limites desta verificação

- Levantamento feito por leitura do código, sem executar o app. Os tamanhos e a aparência são os das classes do `button.tsx`; não houve conferência visual.
- As telas foram descritas pela estrutura do código (rótulos e nomes de componentes). Confirmar no app antes de aprovar.
- `CloudinaryUpload` foi lido só nos valores padrão; cada uso foi conferido pela prop passada no local.
- A contagem vale para o estado do repositório em 16/11/2026. `PartnerTopicsEditor.tsx` é arquivo novo, ainda não versionado; `UPaletteEditor.tsx` e `planejamento.tsx` estão sem alteração pendente. Há mudanças de outras tarefas no `git status` (por exemplo, `app/routes/app/admin/partner/$slug.tsx`), que não foram tocadas aqui.
