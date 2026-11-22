# DS37 — Lista v3 (decisões do proprietário aplicadas)

Legenda: ✅ decidido · ❓ dúvida (explicada no fim) · 🗑 sai junto com o Combobox com chips · ➖ não é transparência, sai do DS37

Nada no código foi alterado.

## Resposta sobre `border-popover`

Sim, é só um derivado em claro e escuro, e **vai para a página de edição do tema** (`/app/admin/themes`). Em vez de "texto a 5%/10%" (transparência), vira uma cor opaca derivada do fundo do flutuante, igual à Borda comum (`--border` = fundo + delta de luminosidade). O editor ganha uma linha "Borda do flutuante" com dois números (claro e escuro) em cada paleta. Os valores serão calibrados para o visual atual não mudar.

## Itens novos no editor (lista final)

| Item | Claro / Escuro | Status |
|---|---|---|
| `border-popover` (borda do flutuante) | delta de luminosidade, um por modo | ✅ |
| `skeleton` | 5% do texto | ✅ |
| `success-strong-halo` | 30% | ✅ |
| `overlay` (cortina) | já existe em 30%; só muda se você pedir | ❓ (item 63) |

Saem da lista: `placeholder`, `vidro-flutuante`, `chip`, `primary-soft`.

## Sessão A — Borda dos flutuantes → `border-popover`

| # | Componente | Decisão |
|---|---|---|
| 1 | Popover | ✅ `border-popover` |
| 2 | Menu suspenso | ✅ |
| 3 | Submenu | ✅ |
| 4 | Lista do Select | ✅ |
| 5 | Lista do Combobox | ✅ e remove o `border-input/30` |
| 6 | Diálogo | ✅ |
| 7 | Sheet | ✅ |
| 8 | Tooltip | ✅ |
| 9 | Barra de formatação do editor | ✅ |
| 10 | Balão de comentário | ✅ |
| 11 | AppBar | ✅ (a borda no claro passa de 10% para o valor do item; conferir) |
| 12 | Quadradinho de cor na busca | ✅ `border` (sem objeção) |
| 13 | Bloco de prévia claro/escuro (Minha Conta → Aparência) | ✅ `border` |

## Sessão B — Texto de dica dos campos

Decidido: **`placeholder:text-secondary-foreground`**, sem item novo. Fica mais forte que os 40% de hoje; conferir na tela.

| # | Componente | Decisão |
|---|---|---|
| 14 | Input | ✅ |
| 15 | Textarea | ✅ |
| 16 | Campo de cor | ✅ |
| 17 | Campo de hora (dica) | ✅ |
| 18 | Campo de hora (segmento vazio) | ✅ |
| 19 | Select (valor vazio) | ✅ |
| 20 | Select (gatilho) | ✅ |
| 21 | Combobox com chips | 🗑 |
| 22 | Barra de busca do Command | ✅ |

## Sessão C — Texto de apoio

Regra: nível de apoio → `text-secondary-foreground`; texto principal → **remove a classe** e herda `foreground` do `body`. Exceção: dentro de um pai que já é secundário, o texto principal precisa de `text-foreground` explícito.

| # | Componente | Decisão |
|---|---|---|
| 23 | Menu de notificações, frase | ✅ remove `/80` (herda) |
| 24 | Menu de notificações, trecho do comentário | ✅ `text-secondary-foreground` |
| 25 | Página de Notificações, lida | ✅ `text-secondary-foreground` |
| 26 | "Você foi mencionado sem texto." | ✅ `text-secondary-foreground` |
| 27 | Nome de quem mencionou | ✅ `text-foreground` explícito (o pai é secundário) |
| 28 | Título da Ação | ✅ `text-foreground` explícito (idem) |
| 29 | Valor da barra de métricas | ✅ remove `/80` (herda) |
| 30 | E-mail em Minha Conta | ✅ remove `/80` (herda) |
| 31 | Legenda na revisão pública | ✅ remove `/80` (herda) |
| 32 | "Sem legenda criada" | ✅ `text-secondary-foreground` |

## Sessão D — Divisórias

A cor da borda já vem de uma regra global (`* { border-color: var(--border) }`). Então **só remove o `/NN`**, sem escrever cor nova. Onde a linha é um fundo (`bg-border`), a cor continua.

| # | Componente | Decisão |
|---|---|---|
| 33 | Linha do tempo, rótulo de horário | ✅ remove `border-border/40` (fica `border-l`). Conferir na tela |
| 34 | Linha do tempo, linha de 5 minutos | ✅ remove `/30`. Conferir: pode ficar forte |
| 35 | Linha do tempo, divisão entre raias | ✅ `divide-y` sem cor |
| 36 | Caixa tracejada "Nenhuma ação" | ✅ `border border-dashed` sem cor |
| 37 | Seletor de cor, separador vertical | ✅ `bg-border` (precisa da cor por ser fundo) |
| 38 | Seletor de cor, linha acima | ✅ `border-t` sem cor |
| 39 | Caixa "Consumo de IA…" | ✅ `border` sem cor |
| 40 | ButtonGroup, separador | ✅ `bg-border` |
| 41 | ButtonGroup do botão principal | ✅ exceção (deriva do botão) |

## Sessão E — Fundos translúcidos: removidos

Decidido: nada de fundo translúcido. Usa `bg-popover` (flutuantes) ou `bg-background`. Junto some o `backdrop-blur`, que não faz sentido com fundo sólido. O item `vidro-flutuante` não será criado.

| # | Componente | Decisão |
|---|---|---|
| 42 | AppBar | ✅ `bg-popover` sólido |
| 43 | Barra de formatação do editor | ✅ `bg-popover` |
| 44 | Popover "Ver métricas" | ✅ remove `bg-popover/80` e o blur (o popover já é `bg-popover`) |
| 45 | Camada de carregamento sobre a estratégia | ❓ ver dúvida 1 |
| 46 | Cabeçalho fixo da galeria `/ui` | ✅ `bg-background` |
| 47 | Barra "+ Nova Ação" da miniatura | ✅ `bg-background` |

(Sim, a maioria é popover: 42, 43 e 44. Só 46 e 47 são background.)

## Sessão F — Campos e cinzas

| # | Componente | Decisão |
|---|---|---|
| 48 | Área de escrever comentário | ✅ `bg-input` |
| 49 | Combobox com chips, caixa | 🗑 |
| 50 | Skeleton | ✅ item `skeleton` |
| 51 | Número do item na revisão | ✅ `bg-card` |
| 52 | Chip do Combobox | 🗑 |
| 53 | "x" do chip | 🗑 |
| 54 | Alça esquerda da Linha do tempo | ✅ usa a sombra do app. Falta olhar na tela (dúvida 2) |
| 55 | Alça direita | ✅ idem |
| 56 | Avatar editável, véu no hover | ✅ sem véu: ícone com `image-icon` (branco com sombra do desenho), regra de 12/11 |

## Sessão G — Cor principal e halo

| # | Componente | Decisão |
|---|---|---|
| 57 | Botão "Mensagem ao parceiro" do comentário | ❓ ver dúvida 3 |
| 58 | Área do gerenciador de arquivos ao arrastar | ✅ `bg-card` |
| 59 | Subtítulo do avatar selecionado | ❓ ver dúvida 4 |
| 60 | Halo do botão de sucesso forte | ✅ item `success-strong-halo` |
| 61 | Miniatura: caixinha da lateral | ✅ exceção |
| 62 | Miniatura: lateral | ✅ exceção |

## Sessão H — Cortina e imagem

| # | Componente | Decisão |
|---|---|---|
| 63 | Fundo atrás da gaveta de Ação | ❓ ver dúvida 5 |
| 64 | Pontinho do carrossel | ✅ exceção |
| 65 | Sombra do texto sobre miniatura | ✅ exceção |

## Sessão I — Foco `border-ring/60` ❓ (dúvida 6)

| # | Componente | Decisão |
|---|---|---|
| 66–78 | Input, Textarea, Select, Combobox, InputGroup, Campo de cor, Hora, Seletor de período, Checkbox, Radio, Botão, Toggle, Badge | ❓ (item 69 é do Combobox com chips: 🗑) |
| 79 | Editor "Contexto" do parceiro | ❓ dúvida 7 |
| 80 | Editor "Tom de Voz" do parceiro | ❓ dúvida 7 |

## Sessão J — Miniaturas e cores do banco

| # | Componente | Decisão |
|---|---|---|
| 81–87 | Miniatura da página de parceiro | ✅ exceção |
| 88 | Tile de Categoria na prévia de Planejamento (borda e fundo) | ❓ dúvida 8 |
| 89 | Texto do tile | ❓ dúvida 8 |
| 90 | Ícone de Categoria | ✅ exceção (já usa itens do editor) |
| 91 | Amostra de Fase na prévia vívida | ➖ não tem transparência (dúvida 9) |
| 92 | Borda da amostra de cor da paleta | ❓ dúvida 9 |
| 93 | Selo da Fase no portal | ✅ sem transparência: `PrismBadge` normal |
| 94 | Selo da Categoria na revisão | ✅ idem |
| 95 | Bolinha do ColorArea | ➖ dúvida 10 |
| 96 | Bolinha do ColorSlider | ➖ dúvida 10 |

## Combobox com chips: remoção

Decidido remover. Hoje **nenhuma tela do app o usa**; existe só em `prism/combobox.tsx` (`ComboboxChips`, `ComboboxChipsInput` e o chip), no índice `prism/index.ts`, na seção da galeria `/ui` (`ComboboxSection.tsx`, `ui.tsx`) e citado em `docs/plans/visual-controls-final-status.md` e `docs/audits/CURRENT.md`. Ainda **não removi**. Saem junto os itens 21, 49, 52, 53 e 69.

---

## Dúvidas explicadas

**1. Item 45 (camada de carregamento sobre a estratégia).** Na gaveta de Ação, ao marcar uma estratégia, aparece por instantes uma camada em cima da caixa de seleção com o indicador de carregamento. Sem fundo translúcido, a camada precisaria de fundo sólido. *Proposta:* nem ter camada: troca a caixa de seleção pelo indicador de carregamento enquanto salva. Mexe um pouco na lógica do componente. Pode ser?

**2. Itens 54 e 55 (alças da Linha do tempo).** São barrinhas de 2px × 16px que aparecem ao passar o mouse nas pontas da barra da Ação, sobre a cor da Fase. Hoje `foreground` a 50%. *Proposta:* `bg-foreground` sólido com a sombra do app. Só dá para aprovar vendo na tela com Fases de cores diferentes.

**3. Item 57 (botão "Mensagem ao parceiro" / "Nota interna").** É um botão que alterna o destino do comentário. Quando é para o parceiro ele ganha tinta da cor principal (borda 40%, fundo 10%). Alternativa sem cor nova: nota interna continua `ghost`; mensagem ao parceiro usa a variante `secondary` do botão (fundo cinza padrão) mantendo `text-primary`. Se achar apagado, a variante `default` (principal cheio) é a outra opção.

**4. Item 59 (subtítulo do avatar selecionado).** Hoje é `text-secondary-foreground` normalmente e, quando o item está selecionado, `primary-foreground` a 70%. Um item selecionado tem **fundo da cor principal**, então o texto precisa ser `primary-foreground` (o que o título já usa). `foreground` ficaria ilegível sobre a cor principal. *Proposta:* trocar `/70` por `primary-foreground` cheio, igual ao título.

**5. Item 63 (cortina atrás da gaveta).** Cortina precisa de transparência para mostrar a página atrás. `bg-overlay` já existe e **já é derivada da cor de sombra do tema** (30%); Diálogo e Sheet já usam. A gaveta usa preto a 20% no claro e 80% no escuro. *Proposta:* usar `bg-overlay` igual a Diálogo e Sheet, ficando consistente. Risco: no escuro, 30% é bem mais fraco que os 80% de hoje. Se quiser manter o contraste do escuro, o `overlay` ganha um valor próprio por modo no editor.

**6. Itens 66–78 (foco). Não é o mesmo que o `ring-halo`.** São duas camadas do mesmo foco: o `ring-ring-halo` é o **anel externo** (a coroa) e o `border-ring/60` é a **borda de 1px do próprio campo**, que passa a 60% da cor de foco. Hoje os dois aparecem juntos. Opções: (a) manter como exceção; (b) trocar a borda por `border-ring` sólido (sem 60%), o que dá um foco um pouco mais forte e acaba com a última transparência dos controles; (c) item editável. Recomendo (b), mas muda o visual do foco em 13 componentes.

**7. Itens 79–80 (editores Contexto e Tom de Voz).** São as duas caixas de texto formatado na página do parceiro (`/app/admin/partner/<slug>`). Não usam Input nem Textarea: são um editor Tiptap embrulhado numa `div` que **copia à mão** as classes do campo (fundo, foco). Seguem o que você decidir no item 6. Opcional: extrair as classes de campo para uma só definição compartilhada com o Input.

**8. Itens 88 e 89 (tile de Categoria na prévia de Planejamento).** No calendário da prévia, cada sugestão aparece como um quadradinho com o ícone e o nome do formato, com a cor da Categoria misturada no fundo (10%), na borda (50%) e no texto. Você disse que deve usar o elemento padrão. *Proposta:* o tile vira `bg-card` com borda padrão, o ícone usa `UIcons` com a cor da Categoria (que já respeita os itens do editor) e o rótulo `text-secondary-foreground`. Remove os três cálculos. Muda o visual da prévia; vale conferir.

**9. Itens 91 e 92.** O 91 (`oklch(from phase.color …)`) **não tem transparência**: só ajusta luminosidade e croma pelos valores do editor. Sai do DS37. O 92 é uma borda de 10% de preto (claro) ou 10% de branco (escuro) em volta da bolinha de cor da paleta, para ela não sumir no fundo. *Proposta:* `border` padrão (sem cor escrita).

**10. Itens 95 e 96 (bolinha do seletor de cor).** A borda é `border-white` **opaca**: não há transparência, então não entra no DS37. Sobre por que é diferente: o Slider padrão usa `border-primary bg-background`, mas a bolinha do seletor de cor fica sobre qualquer cor (inclusive primária), e a borda branca com sombra é o que garante contraste. Se quiser unificar com o Slider, é outro assunto (fora do DS37).
