# Plano de tokens visuais da UZZINA (02/11/2026)

**Status:** proposta para decisão do proprietário. Nada implementado. Substitui o [design-system suspenso](../design-system.md) quando aprovado.

## 1. Diagnóstico do código atual (`ad0c0ed`)

Contagem nos `.tsx` de `app/`:

| Área | O que existe hoje | Problema |
| :--- | :--- | :--- |
| Alturas de controle | Botão: 32 / 40 / 48 / 56px (`xs`/`sm`/`default`/`lg`). Input/select: 40 / 48. Badge 20, chip 21, item de menu 28. Mais 17 arquivos de negócio com `h-8/10/12` próprios | Seis alturas diferentes, sem relação entre botão, campo e item. O "padrão" (48px) é grande demais para uso comum, por isso `size="sm"` aparece 69 vezes |
| Texto | 25 tamanhos: `text-sm` 183, `text-xs` 162, `text-base` 35, e ainda `[8px]`, `[9px]`, `[10px]` (20×), `[11px]`, `[12px]`…`[38px]`, `text-5xl` | Escala sem regra; tamanhos de 8–10px ilegíveis; título de página varia entre `2xl`, `3xl` e `5xl` |
| Peso | `medium` 166, `semibold` 95, `bold` 36, `normal` 11, `black` 1 | Cinco pesos; `bold`/`black` disputam com `semibold` |
| Raio | `full` 66, `2xl` 61, `xl` 36, `lg` 34, `rounded` 27, `md` 15, `3xl` 12… sobre um `--radius` de 0.65rem com multiplicadores e `squircle` | Doze raios; o mesmo tipo de elemento usa raios diferentes |
| Espaço | `gap` em 21 valores; padding em 25+ valores (`p-8` 43, `px-16` 10); 76 valores arbitrários `[Npx]` | Mistura de 2/4/6px com 32/64px sem papel definido: dá a sensação de aglomerado e afastado ao mesmo tempo |
| Cor neutra | `card`, `surface`, `secondary`, `muted`, `accent`, `sidebar-accent`, `input`, `action` | Oito cinzas quase iguais, cada um com seu delta; `sidebar-*` e `chart-*` herdados do shadcn sem uso real |
| Texto secundário | `muted-foreground` e mais `foreground/40`, `/50`, `/60`, `/70`, `/80`, `/90` | Sete tons de texto |

**Conclusão:** o problema não é o shadcn em si, é que não existe uma escala fechada. Cada tela escolheu valores livres.

## 2. Princípios (das suas palavras)

1. **Liso, sem caixas.** Conteúdo flui sobre o fundo; separação por espaço e linha fina, não por moldura (regra já no AGENTS).
2. **Pílulas.** Botões, chips, filtros e toggles totalmente arredondados. Calmo.
3. **Poucos valores.** Toda medida sai de uma lista curta. Valor fora da lista é erro.
4. **Hierarquia por tamanho e peso, não por cor ou caixa.**
5. **A paleta e os temas OKLCH da UZZINA continuam.** Só a estrutura muda.

## 3. Arquitetura dos tokens

Três camadas, todas em `app/tailwind.css`:

1. **Primitivos:** a escala crua (cinzas por luminosidade, escala de espaço, de tipo, de raio). Ninguém usa direto nos componentes.
2. **Semânticos:** o papel (`bg`, `text-secondary`, `line`, `primary`, `control-md`). É isso que componentes usam.
3. **Componente:** só quando um primitivo Prism precisa de um valor próprio (ex.: largura da gaveta). Fica no componente, não no CSS global.

**Nomes:** recomendo **manter** os nomes semânticos do shadcn que já funcionam (`background`, `foreground`, `primary`, `border`, `ring`, `popover`) porque estão em centenas de arquivos e trocar o nome não muda nada visualmente. **Remover ou fundir** os que duplicam (abaixo). Tokens novos (alturas, tipo, espaço) recebem nomes próprios da UZZINA.

## 4. Tokens propostos

### 4.1 Cor: neutros (claro e escuro calculados do fundo da paleta)

Hoje são oito cinzas. Proposta: **cinco degraus de superfície + três de texto + duas linhas.**

| Token | Uso | Substitui |
| :--- | :--- | :--- |
| `background` | Fundo da página | — |
| `surface-hover` | Hover de linha, item, botão ghost | `secondary/50`, `accent`, `sidebar-accent`, `action-hover` |
| `surface-selected` | Selecionado, pressionado, aba ativa, toggle ligado neutro | `secondary`, `muted` |
| `surface-field` | Fundo de campo (input, select, combobox) | `input/50`, `input` |
| `popover` | Menus, popovers, diálogos, gaveta (único elemento elevado) | `card`, `surface`, `popover` |
| `foreground` | Texto principal | — |
| `text-secondary` | Rótulos, metadados, ajuda | `muted-foreground`, `foreground/70–80` |
| `text-tertiary` | Placeholder, desativado, contadores | `foreground/40–60` |
| `line` | Divisórias e bordas comuns | `border`, `sidebar-border` |
| `line-strong` | Borda de controle `outline` e foco sem cor | `input` como borda |

Removidos: `card`, `surface`, `secondary`, `muted`, `accent` (o cinza), `sidebar-*`, `chart-*`, `action`/`action-hover` (viram `surface-hover`). Os deltas ficam num único bloco por tema.

### 4.2 Cor: acento e estados

| Token | Uso |
| :--- | :--- |
| `primary` / `primary-foreground` | Botão principal, toggle ligado, link, seleção forte. Continua vindo da paleta |
| `ring` | Foco. Igual ao `primary` |
| `error`, `success`, `warning`, `info` + `-background` | Mensagens e status. Mesma fórmula OKLCH de hoje, com `--error-hue` 27 |
| `late`, `late-foreground`, `late-accent` | Atraso. **Reaproveitar a calibração aprovada** do branch `backup/visual-2026-11-02` |
| `destructive` | Fundir com `error` (hoje são duas fórmulas para o mesmo vermelho) |

### 4.3 Tipografia

Base 14px (o `text-sm`, já o mais usado). **Seis tamanhos, três pesos.**

| Token | Tamanho / entrelinha | Uso | Substitui |
| :--- | :--- | :--- | :--- |
| `text-micro` | 11 / 14 | Contadores, rótulos de calendário, badges | `[8px]`–`[11px]` |
| `text-caption` | 12 / 16 | Metadados, ajuda, datas | `text-xs` |
| `text-body` | 14 / 20 | Texto padrão da interface, botões, campos | `text-sm` |
| `text-reading` | 16 / 24 | Descrições longas, editor | `text-base` |
| `text-title` | 20 / 28 | Título de seção, título da gaveta | `text-lg`, `text-xl` |
| `text-display` | 32 / 40 | Título de página (Home, Hoje, Minha Conta) | `text-2xl`…`text-5xl` |

Pesos: `400` texto, `500` interface e rótulos, `600` títulos. **Sem `bold` e `black`.** Celular: `display` cai para 24/32; o resto não muda.

### 4.4 Alturas de controle

**Três alturas**, usadas por botão, toggle, input, select, combobox e trigger, para que tudo numa mesma linha alinhe.

| Token | Altura | Ícone | Padding lateral | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `control-sm` | 28px | 14px | 10px | Barras de filtro, chips, ações dentro de cartão, toolbar do editor |
| `control-md` | 36px | 16px | 14px | **Padrão.** Botões e campos de formulário e cabeçalho |
| `control-lg` | 44px | 20px | 18px | Botão principal de página, rodapé da gaveta, alvos de toque no celular |

Botão de ícone = quadrado da mesma altura. Itens de menu/lista em popover: 32px. Badge/pílula de propriedade: 20px. `xs` e `lg` atuais (32 e 56) deixam de existir.

> O rodapé da gaveta hoje é 48px (contrato no AGENTS). Proposta: passa a `control-lg` 44px. Decisão sua (§6).

### 4.5 Raio

**Três raios + pílula.** Sem multiplicadores.

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `radius-pill` | 9999px | Botões, toggles, chips, filtros, badges, avatares, **campos** |
| `radius-sm` | 8px | Itens de menu, linhas selecionáveis, miniaturas |
| `radius-md` | 12px | Cartões de ação, imagens de mídia |
| `radius-lg` | 20px | Popovers, diálogos, gaveta |

`squircle` sai: com pílula ele não faz diferença e cria um segundo formato.

### 4.6 Espaçamento

Base 4px. **Oito degraus**: 4, 8, 12, 16, 24, 32, 48, 64. Proibidos fora de primitivos: 2, 6, 10, 20, 40px e valores `[Npx]`.

Tokens de papel (é o que corrige o "aglomerado e afastado"):

| Token | Celular → desktop | Uso |
| :--- | :--- | :--- |
| `gutter` | 16 → 32px | Margem lateral de toda página, cabeçalho e AppBar. Um valor só |
| `section` | 32 → 48px | Entre blocos de uma página (Home, Minha Conta) |
| `stack` | 16px | Entre campos de um formulário, entre grupos de uma coluna |
| `stack-tight` | 8px | Rótulo → campo, título → metadado, itens de lista |
| `inline` | 8px | Entre controles lado a lado |
| `inline-tight` | 4px | Ícone → texto dentro de controle |

### 4.7 Linha, elevação, foco, movimento

| Token | Valor | Regra |
| :--- | :--- | :--- |
| Espessura de linha | 1px | Única. Abas: indicador de 2px continua |
| `shadow-float` | uma sombra suave | Só popover, diálogo, gaveta. Nada mais tem sombra |
| Foco | anel 2px `ring` com 2px de afastamento | Igual em todos os controles (hoje: `ring-3`/30%, `ring-[3px]`/50%) |
| `duration-fast` / `duration-base` | 120ms / 200ms | Hover/foco / abrir e fechar |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Único |

### 4.8 Layout (já existentes, mantidos)

`--app-bar-space` 98px, gaveta 672/768px, limiar de 1600px e 640px do painel compacto continuam como estão no AGENTS. Proposta só de nomear também a coluna de leitura (`content-narrow` 640px) para Minha Conta e Ajuda.

## 5. Ordem de implementação

Cada fase termina com você validando em `/ui` e em uma tela real.

1. **Fundação.** Escrever todos os tokens em `app/tailwind.css` (`@theme`), com os nomes antigos apontando para os novos, para nada quebrar. Galeria `/ui` ganha a página de tokens. Reaplica a calibração de atraso.
2. **Primitivos Prism.** Botão, toggle, toggle-group, input, textarea, select, combobox, command, badge, tabs, popover, dialog, sheet passam a usar só tokens (três alturas, pílula, foco único).
3. **Componentes UZZINA e telas**, por área, um executor por vez: cabeçalho/AppBar → Home/Hoje → cartões de ação/calendário → gaveta → Minha Conta → Planejamento → administração → portal/login.
4. **Limpeza.** Remover os aliases antigos (`card`, `secondary`, `muted`, `sidebar-*`, `squircle`…) quando ninguém mais usar.
5. **Trava.** Script curto que acusa `text-[Npx]`, `h-[Npx]`, `rounded-2xl`/`3xl`, `font-bold` e espaços fora da escala nos arquivos alterados.

## 6. Decisões que preciso de você

| # | Decisão | Minha recomendação |
| :--- | :--- | :--- |
| D1 | Altura padrão dos controles | **36px** (`control-md`). 32 fica apertado no toque; 40 ainda pesa |
| D2 | Campos (input/select) também em pílula? | **Sim**, para tudo numa linha ter o mesmo formato. Textarea e editor ficam com `radius-md` |
| D3 | Rodapé da gaveta: manter 48px ou passar para 44 | **44px** (`control-lg`) |
| D4 | Tamanho base do texto | **14px**. 13 (Linear) fica pequeno para o uso em notebook e celular da equipe |
| D5 | Título de página | **32px**/600, igual em todas as páginas |
| D6 | Fonte | Manter a do sistema, ou ativar a "PP Object Sans" comentada no CSS |
| D7 | Nomes | Manter nomes shadcn que funcionam e só fundir/remover duplicados, em vez de renomear tudo |
| D8 | Cartões de ação | Fundo `surface-hover` sem borda (liso) ou só linha inferior |
