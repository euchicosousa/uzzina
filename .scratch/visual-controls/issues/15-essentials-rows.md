# 15 — Linhas de metadados da aba Essencial: tamanho único e padrão de recolher/expandir

Status: Aprovado pelo proprietário em 03/11/2026, 100%. Aceite dos componentes não citados na revisão por capturas.
Escopo: as 3 linhas entre o título e a descrição em `app/components/features/action-drawer/EssentialsTab.tsx` (linhas 238–405), mais a barra compacta (<640px, `useCompactPanel`) que as recolhe.

## Objetivo

1. Usar o comportamento de recolher/expandir do modo compacto como padrão do bloco de metadados.
2. Igualar altura e botões das linhas: hoje há controles de 20 a 32px, ícones de 14 a 16px e três paddings verticais diferentes.

## Inventário (estado atual)

Linhas do arquivo `EssentialsTab.tsx`. Padrão: xs 24 / sm 32 / default 40 / lg 48; conteúdo xs `size-3`, sm `size-4`, default/lg `size-5`; texto xs `text-xs`, sm/default `text-sm`.

| Linha | Controle (arquivo:linha) | Componente / variante / tamanho | Altura | Ícone / conteúdo | Texto | Classificação |
| --- | --- | --- | --- | --- | --- | --- |
| Compacta (só <640px) — contêiner :240 | `py-1 pr-2 pl-4`, `gap-2`, `border-b` | div | 8 + 32 + 1 = 41px | | | custom (padding próprio) |
| Compacta | Ícone de data :184 | `CalendarDaysIcon size-4` solto, `opacity-50` | ícone 16px | 16px | | custom (fora de botão, opacidade manual) |
| Compacta e linha 2 | Data (`ActionDatePicker` :190, `ActionDatePicker.tsx:50-61`) | `div role=button` + `Pressable`, sublinhado no hover; sem `buttonVariants`; `className` com `opacity-50`/`text-destructive` | ~20px (altura de linha) | sem ícone próprio (o `size="sm"` com ícone 14px nem é usado aqui) | `text-sm` herdado | inconsistente (não é botão do sistema; alvo de toque 20px) |
| Compacta | Ícone de arquivos :248 | `FileIcon size-4` em `span` `opacity-50` | 16px | 16px | | custom |
| Compacta | Expandir :251 | `PrismButton ghost icon-sm` | 32px | `ChevronDownIcon size-4` | | OK (único já no padrão) |
| 1 — contêiner :271 | `px-4 py-2`, `gap-2 sm:gap-4`, `flex-wrap` | div | 16 + conteúdo + 1 (hoje 49px) | | | inconsistente (py-2) |
| 1 | Tempo (`ActionTimeDisplay` :273) | div de texto, `opacity-50` | ~20px | | `text-sm` herdado | custom (texto, não botão) |
| 1 | Responsáveis (`ResponsiblesCombobox` :275, `ComboboxTrigger form-link`) | `buttonVariants link sm` + `overflow-hidden` | 32px | avatares `SIZE.sm` (24px?) em botão sm (16px); sem avatar: `User2Icon size-4` | `text-xs text-muted-foreground` (conteúdo) | inconsistente (avatar 24 > 16; `text-xs` em botão sm; muted manual). Vai a ghost/link `sm` (ticket 13) |
| 1 | ID :290 | `PrismButton ghost` (default 40px) sobrescrito por `h-6 px-2 font-mono text-[10px]` | 24px | | 10px | custom (3 sobrescritas; `text-[10px]` fora da escala) |
| 2 — contêiner :303 | `px-4 py-1.5`, `gap-2`, `justify-between` | div | 12 + 24 + 1 = 37px (33px sem estratégia) | | | inconsistente (py-1.5) |
| 2 | Data no desktop (`dateControl` :306) | ver acima | ~20px | ícone 16px `opacity-50` | `text-sm` | inconsistente |
| 2 | Ver estratégias :326 | `PrismButton secondary xs` dentro de `PrismButtonGroup` | 24px | `ListIcon` 12px | `text-xs` | OK |
| 2 | Criar/Recriar estratégia :342 | `PrismButton secondary xs`, `truncate` | 24px | `SparkleIcon`/`LoaderIcon` 12px | `text-xs` maiúsculas | OK (tamanho); `min-w-0 shrink` aceitável |
| 3 — contêiner :365 | `px-4 py-1`, `gap-2`, `overflow-hidden` | div | 8 + 32 + 1 = 41px | | | inconsistente (py-1) |
| 3 | Miniaturas (`WorkFileThumbnail.tsx:20`) | `size-8` próprio, `rounded-2xl`/`rounded-lg` misturados; remover `size-4` | 32px | extensão `text-[8px]`; botão X `size-4` / ícone `size-2.5` | 8px | custom (tamanho = sm por acaso; X de 16px é alvo mínimo; `text-[8px]`) |
| 3 | Adicionar arquivo, vazio :384 | `CloudinaryUpload unstyled sm` + `h-8 gap-1 p-0 text-muted-foreground underline` | 32px | `FilePlus size-4` | `text-sm` | custom (unstyled + 6 classes) |
| 3 | Adicionar arquivo, com arquivos :384 | `CloudinaryUpload secondary icon-xs` | 24px | `FilePlus size-4` (>12px do xs; `icon-xs` força 16px) | | inconsistente (24px entre miniaturas de 32px) |

Resumo: alturas de controle 20 (data/tempo), 24 (ID, estratégia, upload com arquivos), 32 (responsáveis, expandir, miniaturas, upload vazio); três paddings verticais (8, 6, 4 por lado); três tamanhos de texto fora da escala (`10px`, `8px`, `text-xs` em sm); ícones 12/14/16; opacidade manual em 4 lugares.

## Proposta

### Tamanho único: `sm` (32px)

Motivo: já é o tamanho do botão de expandir, das miniaturas, do gatilho de responsáveis e do upload vazio; mantém o bloco baixo (a descrição precisa da altura); ícone `size-4`, texto `text-sm`. Os botões de estratégia (hoje `xs`) também passam a `sm`, com texto `text-sm`, para a linha ter um único tamanho. Se o rótulo longo ("RECRIANDO ESTRATÉGIAS...") não couber a 375px, trunca (já trunca).

Altura de linha: todas as linhas `py-1` + controles de 32px = 40px + 1px de borda (a linha 1 cai de 49px para 41px; a 2 sobe de 37px para 41px). Gap horizontal único `gap-2` (hoje `gap-2 sm:gap-4` na 1).

### Mudanças por controle

| # | Controle | Mudança |
| --- | --- | --- |
| 1 | Contêineres das linhas :240, :271, :303, :365 | mesmo `px-4 py-1` e `gap-2`; mesma borda |
| 2 | Data (`ActionDatePicker`) | virar botão do sistema: `PrismButton variant="ghost" size="sm"` (ou `link`) como gatilho do popover, com `CalendarDaysIcon` interno (herda `size-4`, 60%); remover o ícone solto :184, `opacity-50` e o ramo `size="sm"` com ícone 14px; atrasada: `text-destructive` no botão. Conferir `TokensFocusSection.tsx:511,536` (réplica do foco da data) |
| 3 | Tempo (`ActionTimeDisplay`) | continua texto, mas em `h-8 flex items-center text-sm text-muted-foreground`; sem `opacity-50` |
| 4 | Responsáveis | ticket 13 (ghost `sm`, avatares `size-4`, sem texto muted); aqui só garantir 32px |
| 5 | ID | `PrismButton ghost size="sm"` com `font-mono`; remover `h-6 px-2 text-[10px]` |
| 6 | Estratégia (2 botões) | `size="sm"`; ícones herdam `size-4` |
| 7 | Miniaturas | manter `size-8`; `rounded-2xl squircle` em ambos os ramos (remover `rounded-lg`); extensão `text-[8px]` → `text-[10px]` ou ícone `FileIcon size-4` com extensão em `text-xs` |
| 8 | Upload | vazio: `variant="ghost" size="sm"` com `FilePlus` + "Adicionar arquivo" (remover `unstyled`, sublinhado e `text-muted-foreground`); com arquivos: `icon-sm` (32px) em vez de `icon-xs` |
| 9 | Ícone de arquivos compacto :248 | `FileIcon` dentro de `span h-8 w-8 flex items-center justify-center` (alinha a 32px); sem `opacity-50` manual (usa a opacidade de ícones do botão ou `text-muted-foreground`) |

### Padrão de recolher/expandir

Decisões a tomar (recomendação em negrito):

- Componente reutilizável: **sim — extrair `EssentialsDetails` (ou `CollapsibleMetaRows`) dentro de `EssentialsTab.tsx`** com a barra-resumo (data + indicadores + chevron), o contêiner `hidden` com `id`/`aria-controls`/`aria-expanded` e as linhas como filhas. Evita três contêineres independentes com paddings próprios. Não vale um primitivo Prism ainda; um só consumidor.
- Sempre recolhível: **sim, no desktop também, como opção** — barra-resumo visível sempre; estado padrão aberto no desktop e fechado no compacto. Estado em `ActionFormDrawer.tsx:790` (`detailsExpanded`), hoje descartado ao fechar; no desktop o padrão aberto preserva o fluxo atual.
- Persistência: **por sessão do navegador, não por conta** (sem `people.preferences`); aberto/fechado por painel é efêmero, como as demais escolhas de altura.
- Resumo recolhido: data + ícone de arquivos (regra atual). Opcional: avatares de responsáveis (16px) na barra, decisão do proprietário.
- Barra-resumo no desktop ocupa 41px extras quando aberta (data dentro dela, saindo da linha 2). Alternativa mais barata: **manter o desktop como está (sempre aberto, sem barra)** e só unificar tamanhos. Precisa de decisão do proprietário.
- Linha 2 (estratégia): hoje `hidden={compact && !isSocial}`; no padrão unificado, a barra-resumo absorve a data e a linha 2 fica só com estratégia (somente social).

## Perguntas ao proprietário

1. Tamanho único `sm` (32px) para todos os controles das linhas, inclusive botões de estratégia e ID? (alternativa: `default` 40px, deixaria o bloco com ~123px + bordas)
2. Recolher/expandir também no desktop, com padrão aberto, ou manter só o compacto?
3. Data como botão ghost `sm` (com ícone interno) ou continua texto com sublinhado ao passar o mouse? (ticket 13 pergunta o mesmo para `form-link`)
4. Barra-resumo recolhida mostra avatares dos responsáveis?
5. Extensão de arquivo sem imagem: `text-[10px]` ou ícone + extensão?

## Critérios de aceite

1. Linhas 1, 2 e 3 e a barra compacta têm 41px (32 + `py-1` + borda) com controles `sm`; nenhuma classe `h-6`, `text-[10px]`/`text-[8px]` sobrando nos botões (exceção: extensão da miniatura conforme resposta 5).
2. Nenhum `opacity-50` manual nos controles; ícones herdam `currentColor` a 60%.
3. Teclado preservado: percurso Título → Descrição → Parceiros → … do FocusScope inalterado; conteúdo recolhido segue `hidden` (fora do Tab e montado, para uploads); expandir/recolher mantém foco no chevron; `aria-expanded`/`aria-controls` corretos.
4. Compacto (<640px): resumo mostra só data, arquivos e chevron; sem scroll horizontal a 375px; lógica de `useCompactPanel`/`useShortWritingPanel` e medição de altura (`onNeededHeightChange`, filhos title/metadata/description) intactas.
5. Desktop sem regressão (descrição mantém `min-h-50`); estratégia, ID e upload funcionam como antes.
6. Roteiro curto de validação visual para o proprietário; sem testes novos por rotina.

## Execução

Simples, delegável a executor externo (Gemini), sem tocar foco nem compacto:
- #1 paddings/gaps dos contêineres (apenas classes);
- #5 ID; #6 botões de estratégia para `sm`; #7 miniaturas (`rounded`, texto); #8 upload (variantes/tamanhos);
- #3 `ActionTimeDisplay` (classes).

Exigem cuidado (Claude):
- #2 data como botão: `Pressable`/`PrismPopoverTrigger`, foco por teclado, `TokensFocusSection` e o fluxo de salvar ao fechar o popover;
- #9 e o item "padrão de recolher/expandir": estado em `ActionFormDrawer`, `hidden`/`id`, ordem de foco do FocusScope, medição de `ResizeObserver` (as 3 filhas diretas do scroller), modo compacto e `useShortWritingPanel`;
- #4 depende do ticket 13.

## Arquivos

- `app/components/features/action-drawer/EssentialsTab.tsx`
- `app/components/features/action-drawer/ActionDatePicker.tsx`, `ActionTimeDisplay.tsx`
- `app/components/features/action-drawer/ActionFormDrawer.tsx` (estado `detailsExpanded`, só se o padrão for ao desktop)
- `app/components/features/ResponsiblesCombobox.tsx`, `ComboboxTrigger.tsx` (ticket 13)
- `app/components/features/media/WorkFileThumbnail.tsx`, `CloudinaryUpload.tsx` (uso)
- `app/components/ui-sections/TokensFocusSection.tsx` (réplica da data)
- AGENTS.md (parágrafo "Abaixo de 640px… Essencial") se o recolher chegar ao desktop

## Fora do escopo

- Título, descrição e rodapé (ticket 05); popovers dos comboboxes (ticket 03).
- Dados, atalhos e lógica de upload/estratégia.
