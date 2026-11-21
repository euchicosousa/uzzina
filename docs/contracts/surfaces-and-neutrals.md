# Superfícies e cinzas (DS35)

Contrato das cores neutras do app. Decidido pelo proprietário em 21/11/2026 a partir da [página de ajuste](../../.scratch/design-system-audit/ds35-camadas-de-cinza.html). Ticket: [DS35](../../.scratch/design-system-audit/issues/35-unified-surfaces-and-neutrals.md).

## Princípio

Toda cor neutra é **o fundo da página mais um ajuste de luz (ΔL)**. Não existem cores neutras avulsas, transparências escritas à mão para fundo nem variantes por caso. Uma camada tem um papel; se ela fica ruim num lugar, a resposta é "não se usa ali".

## Onde os valores moram

| Peça                      | Papel                                                                                                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/lib/palettes.ts`     | Dados. Cada paleta, em `light` e em `dark`, traz `bg`, `fgLDelta` (texto), `popoverLDelta`, `cardLDelta`, `inputLDelta`, `secondaryLDelta`, `secondaryHoverLDelta`, `borderLDelta`, `actionLDelta`, `actionHoverLDelta`, mais `primary`, `primaryFg` e `accent`. |
| `app/lib/palette-vars.ts` | Ponte. `applyPaletteVars` grava os valores como variáveis CSS (`--<camada>-l-delta` no claro, `--dark-<camada>-l-delta` no escuro, `--accent-override` e `--dark-accent-override`).                                                                              |
| `app/tailwind.css`        | Consumo. `--card: oklch(from var(--background) calc(l + var(--card-l-delta, -0.02)) c h)` e as demais. O segundo argumento de `var()` é o padrão (igual ao Ônix) para temas que não definem o valor, como o Personalizado.                                       |
| `index.html`              | Pré-carrega só o fundo e a primária do Ônix nas páginas públicas; os ajustes vêm dos padrões do CSS.                                                                                                                                                             |

Para mudar um cinza de uma paleta, mude o número dela em `palettes.ts`; não escreva valor fixo no CSS. O tema **Personalizado** só guarda cores, relevo e sombra; os ajustes de luz usam os padrões do CSS, e a cor de texto escolhida entra por `--foreground-override`. O editor de temas do Admin só gera o código para corrigir `palettes.ts` junto com o desenvolvedor.

## Camadas

Valores do Ônix (luz somada ao fundo; claro / escuro). As demais paletas começam como cópia e podem divergir.

| Camada (classe)           | ΔL claro / escuro             | Papel e onde é usada                                                                                                                                                                                                                                                                                | Não pode                                                   |
| ------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `background`              | 0                             | Fundo da página.                                                                                                                                                                                                                                                                                    | —                                                          |
| `popover`                 | +0,02 / −0,03                 | Tudo que flutua: menu, diálogo, gaveta, popover, lista de seleção, tooltip e aviso (toast).                                                                                                                                                                                                         | Sobre cartão de fase ou imagem.                            |
| `card`                    | −0,02 / +0,05                 | Objeto com conteúdo (descrição no portal, comentário de outra pessoa, alerta padrão, prévias de tema) e **realce de estado** (notificação não lida, grupo Admin, alvo ao arrastar, hover da célula do calendário) e faixas de cabeçalho. O uso como objeto e como realce pode se dividir no futuro. | Hover de item (use `secondary`); caixa em volta de blocos. |
| `input`                   | −0,04 / −0,06                 | Campo de texto, caixa de seleção, rádio.                                                                                                                                                                                                                                                            | Cartão de ação, cor de fase, imagem.                       |
| `secondary`               | −0,06 / +0,12                 | Cinza sobre a página ou o flutuante: botão cinza, selo (o padrão e o cinza são o mesmo), trilho de progresso, avatar vazio, e **hover e foco de item transparente** (menu, lista, aba, ghost), item aberto ou selecionado.                                                                          | Cartão de ação, cor de fase, imagem.                       |
| `secondary-hover`         | −0,08 / +0,15                 | Hover de quem já é `secondary` (botão cinza, selecionado, aberto, selo em link) ou `card` (notificação não lida). É a única fonte do hover do botão cinza.                                                                                                                                          | Repouso.                                                   |
| `border`                  | −0,09 / +0,15                 | Linha de 1px e divisor. A borda translúcida de container (`foreground/5` claro, `/10` escuro) continua como exceção.                                                                                                                                                                                | Preenchimento.                                             |
| `action` e `action-hover` | +0,02 / +0,10 e +0,10 / +0,20 | Cartão de ação e o hover dele. Têm cor própria; não há cinza dentro do cartão. Avatar vazio e "+N" no cartão viram contorno (`border-border`, sem fundo).                                                                                                                                           | Cinza (`secondary`) dentro.                                |
| `foreground` (`fgLDelta`) | −0,96 / +0,8                  | Texto principal: preto no claro, branco no escuro, croma 0. O texto de apoio (`secondary-foreground`) é derivado do fundo com ΔL fixo no CSS.                                                                                                                                                       | —                                                          |
| `accent` (`ring`)         | cor da paleta                 | Cor de destaque da paleta; hoje é uma cópia da `primary`. O anel de foco usa `--ring: var(--accent)`; as classes `ring-ring` e `border-ring` seguem como estão.                                                                                                                                     | —                                                          |

`accent` e `muted` não são mais cinzas: o `muted` foi removido (nunca teve uso) e o `accent` virou a cor de destaque acima.

## Regras de uso

1. O botão cinza (`secondary`) fica na página ou no flutuante. Nunca sobre cartão de ação, cor de fase ou imagem.
2. Hover de item transparente usa `secondary`; hover de quem já é `secondary` ou `card` usa `secondary-hover`. Item selecionado ou aberto com mouse usa `secondary-hover`.
3. Nenhum cinza sobre cor de fase ou imagem: sem fundo atrás de imagem ou miniatura (fica o `ring-border` ou `border`), avatar sem foto como contorno no cartão de ação.
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
