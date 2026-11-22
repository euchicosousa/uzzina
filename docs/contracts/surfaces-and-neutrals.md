# Superfícies e cinzas (DS35)

Contrato das cores neutras do app. Decidido pelo proprietário em 21/11/2026 a partir da [página de ajuste](../../.scratch/design-system-audit/ds35-camadas-de-cinza.html). Ticket: [DS35](../../.scratch/design-system-audit/issues/35-unified-surfaces-and-neutrals.md).

## Princípio

Toda cor neutra é **o fundo da página mais um ajuste de luz (ΔL)**. Não existem cores neutras avulsas, transparências escritas à mão para fundo nem variantes por caso. Uma camada tem um papel; se ela fica ruim num lugar, a resposta é "não se usa ali".

## Onde os valores moram

| Peça                      | Papel                                                                                                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/lib/palettes.ts`     | Dados. Cada paleta, em `light` e em `dark`, traz `bg`, `fgLDelta` (texto), `popoverLDelta`, `cardLDelta`, `inputLDelta`, `secondaryLDelta`, `secondaryHoverLDelta`, `borderLDelta`, `actionLDelta`, `actionHoverLDelta`, mais `primary`, `primaryFg` e `accent`. |
| `app/lib/palette-vars.ts` | Ponte. `applyPaletteVars` grava os valores como variáveis CSS (`--<camada>-l-delta` no claro, `--dark-<camada>-l-delta` no escuro, `--accent-override` e `--dark-accent-override`).                                                                              |
| `app/tailwind.css`        | Consumo. `--card: oklch(from var(--background) calc(l + var(--card-l-delta, -0.02)) c h)` e as demais. (Sem valor de reserva no CSS desde o DS36: todo tema define as deltas.)                                                                                   |
| `index.html`              | Pré-carrega só o fundo e a primária do Ônix nas páginas públicas; os ajustes vêm dos padrões do CSS.                                                                                                                                                             |

Para mudar um cinza de uma paleta, mude o número dela em `palettes.ts`; não escreva valor fixo no CSS. O tema Personalizado foi removido (21/11/2026); quem tinha o índice -1 cai no Ônix (índice 0) na leitura da preferência (`normalizePaletteIndex`, `app/lib/preferences.ts`) e na do navegador (`useAppTheme.ts`). O editor de temas do Admin só gera o código para corrigir `palettes.ts` junto com o desenvolvedor.

## Camadas

Valores do Ônix (luz somada ao fundo; claro / escuro). As demais paletas começam como cópia e podem divergir.

| Camada (classe)           | ΔL claro / escuro             | Papel e onde é usada                                                                                                                                                                                                                                                                                                                                                                                                     | Não pode                                                   |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `background`              | 0                             | Fundo da página.                                                                                                                                                                                                                                                                                                                                                                                                         | —                                                          |
| `popover`                 | +0,02 / −0,03                 | Tudo que flutua: menu, diálogo, gaveta, popover, lista de seleção, tooltip e aviso (toast).                                                                                                                                                                                                                                                                                                                              | Sobre item da Ação com cor de fase ou imagem.              |
| `card`                    | −0,02 / +0,05                 | Fundo fixo que informa ou sinaliza e **não é clicável** (descrição no portal, comentário de outra pessoa, alerta padrão, prévias de tema, nota explicativa, selo cinza, atalho de teclado, avatar vazio, item do acordeão) e **realce de estado** (notificação não lida, grupo Admin, alvo ao arrastar, hover da célula do calendário) e faixas de cabeçalho. O uso como objeto e como realce pode se dividir no futuro. | Hover de item (use `secondary`); caixa em volta de blocos. |
| `input`                   | −0,04 / −0,06                 | Campo de texto, caixa de seleção, rádio, trilho de barra de progresso e de controle deslizante.                                                                                                                                                                                                                                                                                                                          | Item da Ação, cor de fase, imagem.                         |
| `secondary`               | −0,06 / +0,12                 | Cinza de **tudo que é clicável**, sobre a página ou o flutuante: botão cinza, e **hover e foco de item transparente** (menu, lista, aba, ghost), item aberto ou selecionado.                                                                                                                                                                                                                                             | Item da Ação, cor de fase, imagem.                         |
| `secondary-hover`         | −0,08 / +0,15                 | Hover de quem já é `secondary` (botão cinza, selecionado, aberto, selo em link) ou `card` (notificação não lida). É a única fonte do hover do botão cinza.                                                                                                                                                                                                                                                               | Repouso.                                                   |
| `border`                  | −0,09 / +0,15                 | Linha de 1px e divisor. A borda translúcida de container (`foreground/5` claro, `/10` escuro) continua como exceção.                                                                                                                                                                                                                                                                                                     | Preenchimento.                                             |
| `action` e `action-hover` | +0,02 / +0,10 e +0,10 / +0,20 | Item da Ação e o hover dele. Têm cor própria; não há cinza dentro do item da Ação. Avatar vazio e "+N" no item da Ação viram contorno (`border-border`, sem fundo).                                                                                                                                                                                                                                                      | Cinza (`secondary`) dentro.                                |
| `foreground` (`fgLDelta`) | −0,96 / +0,8                  | Texto principal: preto no claro, branco no escuro, croma 0. O texto de apoio (`secondary-foreground`) é derivado do fundo com ΔL fixo no CSS.                                                                                                                                                                                                                                                                            | —                                                          |
| `accent` (`ring`)         | cor da paleta                 | Cor de destaque da paleta; hoje é uma cópia da `primary`. O anel de foco usa `--ring: var(--accent)`; as classes `ring-ring` e `border-ring` seguem como estão.                                                                                                                                                                                                                                                          | —                                                          |

`accent` e `muted` não são mais cinzas: o `muted` foi removido (nunca teve uso) e o `accent` virou a cor de destaque acima.

## Regras de uso

1. O botão cinza (`secondary`) fica na página ou no flutuante. Nunca sobre item da Ação, cor de fase ou imagem.
2. Hover de item transparente usa `secondary`; hover de quem já é `secondary` ou `card` usa `secondary-hover`. Item selecionado ou aberto com mouse usa `secondary-hover`.
3. Nenhum cinza sobre cor de fase ou imagem: sem fundo atrás de imagem ou miniatura (fica o `ring-border` ou `border`), avatar sem foto como contorno no item da Ação.
4. Fundos não usam transparência escrita à mão (`foreground/NN`, `secondary/NN`, `card/NN`). Exceções registradas: borda de container, texto apagado e placeholder (`foreground/40`), película de diálogo (`bg-overlay`), botões sobre foto. Fundos antigos com transparência ainda existem em poucos lugares e ficam como pendência do DS35.
5. Sem caixas com fundo em volta de blocos de formulário (regra de superfícies do AGENTS).
6. Estado pressionado não tem cor própria; o botão desloca 1px. Desabilitado é `opacity-50`.
7. Camada ou uso novo só entra por este contrato e pela galeria `/ui`.

## Coincidência entre camadas

Num mesmo tema duas camadas podem ficar quase iguais (no Carbono claro o fundo é branco e o flutuante não fica mais claro; no claro `input` e `secondary` diferem por 0,02). O que vale é o papel: cada uso aponta para a camada do seu papel, e a separação visual nesses casos vem da borda e da sombra. Abaixo de 0,03 de diferença o olho quase não separa; a página de ajuste marca esses pares.

## Como verificar

- A página de ajuste mostra uma página de mostra, os controles ΔL e ΔC por camada, no claro e no escuro, e exporta o texto para corrigir a paleta.
- No navegador, leia as variáveis com `getComputedStyle` (Ônix claro: página 0,96, `popover` 0,98, `card` 0,94, `input` 0,92, `secondary` 0,90, `secondary-hover` 0,88, `border` 0,87; Ônix escuro: 0,20, 0,17, 0,25, 0,14, 0,32, 0,35, 0,35).
- Para achar usos fora do contrato, rode `grep -rnE "bg-card|bg-secondary/[0-9]|hover:bg-card|foreground/[0-9]+" app --include='*.tsx'` e confira cada linha contra a tabela.

## Bloco compartilhado e fórmulas (DS36)

Cores e números que valem para todas as paletas moram em `SHARED_COLORS` (`app/lib/palettes.ts`): estados (erro, atenção, sucesso, informação e a mistura de fundo do aviso), sucesso forte, fases, categorias, marca-texto, texto de apoio, halo, mouse da principal, sombra, sombra da Ação atrasada, brilho do item da Ação e as derivações suave e vivo das fases. Cada paleta guarda só o que muda de tema para tema, incluindo o texto sobre a principal, que é um deslocamento (`primaryFgDelta`: ΔL, ΔC, ΔH) da própria principal.

- O `palette-vars.ts` grava tudo como variáveis `--shared-<nome>` (claro) e `--shared-dark-<nome>` (escuro); o `tailwind.css` só lê.
- Não há valor de reserva no CSS para ΔL de camadas: um tema tem de definir todos. `useAppTheme.ts` não tem reserva própria.
- Texto de apoio sai do fundo com ΔL e ΔC (claro −0,512 e +0,549; croma −0,001 e −0,007). Não é cor fixa.
- Principal no mouse é a principal com a porcentagem do fundo indicada (classes `hover:bg-primary-hover`). Halo de foco é `ring-ring-halo`.
- Sombra (DS29): `--shadow-color` = fundo misturado à principal, escurecido. Mesma fórmula para as 10 paletas.
- Brilho da borda do item da Ação: branco com a porcentagem indicada; no escuro 10%.
- Prioridades são leitura: Baixa = Sucesso, Média = Atenção, Alta = Erro.
- O `index.html` só pré-define fundo e texto do Ônix nas páginas públicas. O resto sai de `applyPaletteVars(PALLETE[0])` em `app/main.tsx`, antes do primeiro render.
- Fundos (decisão de 21/11): `bg-secondary` = o que se clica (item, botão, campo-ação); `bg-card` = fundo fixo informativo, não clicável (nota, estado vazio, avatar sem foto, atalho de teclado, badge cinza, dia de hoje e intervalo do Prism Calendar, fundo do acordeão `variant="card"`, coluna do Kanban no arraste); `bg-input` = componente (trilho do Slider e das barras de progresso). Hover sobre card é `bg-secondary-hover`. Hover e foco de item que já era secondary não muda.
- Acordeão Prism: `variant="default"` (sem fundo e sem cor no hover) e `variant="card"` (fundo `bg-card`, hover `bg-secondary-hover`). Gaveta de ação usa default; editor de temas usa card.
- `text-secondary-foreground` é texto apagado, sem relação com `bg-secondary`; o padrão é `text-foreground`.
- Texto e ícone sobre imagem não têm fundo: `image-icon` (ícone branco com `drop-shadow`) e `image-text` (texto branco com `text-shadow`); a prévia do Instagram usa os dois, sem `bg-black/*`.
- Sombra de aviso (`sonner.tsx`): usa `toast-state-shadow`, derivada da cor do estado com os mesmos valores de L, C e opacidade da sombra de Fase (claro e escuro). O aviso padrão usa `shadow-toast`, da sombra da paleta.
