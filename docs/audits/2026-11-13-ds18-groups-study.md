# DS18 — Estudo dos grupos do Prism (botões, toggles e campos)

13/11/2026. Ticket: [DS18](../../.scratch/design-system-audit/issues/18-group-borders-review.md). Só leitura e proposta: nenhuma linha do app foi alterada.

Prévia antes/depois: [.scratch/design-system-audit/comparativo-ds18-grupos.html](../../.scratch/design-system-audit/comparativo-ds18-grupos.html). Abra no navegador e use o tema, o tamanho e o espaço no topo.

## 1. De onde vem a borda que incomoda

**Resposta curta:** a linha escura entre os botões não é uma borda desenhada de propósito. Ela nasce de uma sobreposição de 1px combinada com cores translúcidas.

- Todo botão do Prism tem uma borda de 1px. Dentro do `PrismButtonGroup`, cada botão é puxado 1px por cima do anterior (`-ml-px`, ou `-mt-px` no vertical). A ideia original era fundir duas bordas cinza numa só.
- Isso funciona quando a borda é opaca: `outline` (borda cinza) e `default` (borda da cor primária). As duas linhas ficam uma sobre a outra e o resultado é uma linha só.
- No `secondary`, fundo e borda são a mesma cor **translúcida** (preto a 5% no claro, branco a 10% no escuro). Desde o commit `e304288` a borda do secundário tem essa cor. Na faixa de 1px onde os dois botões se sobrepõem, as transparências somam (5% + 5%) e aparece uma **linha mais escura**. É a "borda" visível na seção 1 da prévia.
- A gaveta já escondia o problema: entre os botões de IA há um `PrismButtonGroupSeparator` com `bg-background`, uma tira de 1px pintada com a cor da página por cima da faixa escura. O separador de fábrica é cinza (`bg-border/80`); o `bg-background` é um remendo local repetido cinco vezes.
- No `ghost` a borda é transparente, mas o fundo de hover invade 1px do vizinho.
- `PrismToggleGroup` com `attached` faz a mesma sobreposição. O toggle não recorta o fundo na borda (`bg-clip-padding` só existe no botão), então, no `secondary`, os fundos de 5% também se somam na junção. No `outline` a linha compartilhada é a desejada.
- `PrismToggleGroup` sem `attached` (padrão) não tem esse problema: os itens ficam separados por `spacing` × 4px (padrão 2 = 8px) e cada um mantém o próprio raio.
- `PrismInputGroup` não tem sobreposição. É uma caixa só com fundo `bg-input` e borda transparente, que fica colorida no foco (`ring`) e vermelha no erro, igual ao `PrismInput`. O campo interno perde borda e anel. Não há borda indesejada aqui.

Raio: o ButtonGroup zera o raio de todos os filhos com `rounded-none!` e devolve o raio do tamanho (`--group-radius`: 2xl até `default`, 3xl no `lg`) só nas pontas, também com `!`. Sem o `!`, o raio do próprio botão venceria. O ToggleGroup chega ao mesmo resultado com seis listas longas de classes `first:`/`last:`/`only:` (horizontal e vertical × pequeno, padrão e grande).

## 2. Inventário de uso

### Grupo de botões (`PrismButtonGroup`) — sempre colado hoje

| Onde abrir no app | Configuração |
| --- | --- |
| Gaveta de ação → aba Essencial → linha "Criar/Recriar estratégia" (lista, botão, seletor de modelo) | secondary, sm, separadores com `bg-background` |
| Gaveta → aba Instagram → Conteúdo → "Selecione a estratégia" (lista, botão, modelo) | secondary, sm, dois separadores com `bg-background` |
| Gaveta → aba Instagram → "Gerar legenda" + modelo | secondary, sm, separador com `bg-background` |
| Gaveta → janela "Ver estratégias" → cada estratégia → "USAR ESTA ESTRATÉGIA" + modelo | secondary, sm, **sem separador: a linha escura aparece aqui** |
| Barra do calendário (anterior / data / próximo) em Hoje, Home e página do parceiro | secondary, sm; no celular o botão do meio tem exceção local (`max-md:ml-0! max-md:rounded-(--group-radius)!`) |
| `/ui` → Button (ButtonGroup) e UAIModelSelect | galeria |

Correção ao ticket: não há ButtonGroup no rodapé da gaveta. O uso em `ActionFormDrawer` é a janela de estratégias.

### Grupo de toggles (`PrismToggleGroup`)

| Onde abrir | Modo |
| --- | --- |
| Hoje e Home → ícones de visualização (Kanban, categorias…) | com espaço (8px), sm |
| Home → calendário → Semana/Mês/… (período) | **colado**, secondary, sm |
| Minha Conta → Tema (Claro/Escuro/Sistema) | **colado**, outline, largura total |
| Minha Conta → Layout padrão, Visualização inicial do Hoje, Sidebar do Instagram | **colado**, outline, largura total |
| Minha Conta → Cor de destaque | com espaço, grade de 2/3 colunas |
| Ações em lote → Cor | `spacing={0}`: encostados, mas cada um com raio próprio |
| Ações em lote → Sprint e Responsáveis | grade com `gap-3`/`gap-1` passados por fora, que substituem o `spacing` |
| Seletor de cor (paleta dos parceiros) | com espaço |
| Portal `/dash` → calendário → Semana/Mês | com espaço, sm |
| Admin de usuário → Áreas | com espaço, seleção múltipla |
| Admin de parceiro → plano (sow) | grade de 3 colunas, itens altos (`h-auto py-4`) |
| `/ui` → Toggle & ToggleGroup, Playground, Tokens/Cores | galeria |

### Grupo de campo (`PrismInputGroup`)

Login da equipe (e-mail e senha), login do portal (dois campos, um com `squircle` repetido), Esqueci a senha, Redefinir senha (dois), Leads → busca (sm), página do parceiro → busca (sm, com `bg-input` repetido), admin de cliente, admin de usuário, seletor de datas comemorativas, `/ui` → Input. **Também é a base do `PrismSelect` e do `PrismCombobox`**: qualquer mudança nele atinge todos os seletores do app.

## 3. Grupo de botões — aprovado em 13/11 (versão 4)

Histórico: a versão 1 tinha "colado" e "com espaço"; "com espaço" foi descartado (um grupo é uma peça só). Na versão 3 o proprietário fixou a regra por variante. Na versão 4 ele aprovou a regra e tirou o respiro do outline e do ghost: no outline o respiro fica frio, e no ghost é 1px desnecessário.

**API:** `attached`, ligado por padrão. Cantos internos retos e raio só nas pontas.

| Variante | `attached` (padrão) | `attached={false}` |
| --- | --- | --- |
| default (primário) | puxão de 1px | respiro de 1px na cor da página |
| outline | puxão de 1px (as bordas viram uma linha) | não existe: sempre junto |
| secondary | sem puxão, lado a lado | respiro de 1px |
| ghost | sem puxão, lado a lado | não existe: sempre junto |

**Ajuste do botão, aprovado e commitado em `a00ef0e`:** no hover do primário, fundo e borda recebem a mesma cor opaca, `color-mix(in oklab, var(--primary), var(--background) 20%)` (em `oklch` o azul ficava roxo). O ghost pinta o fundo até a borda transparente (`bg-clip-border`), sem sobra de 1px. Vale para todos os botões do app. Contrato em `docs/contracts/prism-details.md`.

**A implementar no grupo (ainda não feito):** puxão aplicado pelo `data-variant` do filho (`default` e `outline`); `attached={false}` só com efeito no default e no secondary; saem os separadores `bg-background` da gaveta e a exceção do celular na barra do calendário.

## 3b. Grupo de toggles — aprovado em 13/11 (versão 6)

Toggle herda as variantes do botão (fonte única) e acrescenta só o selecionado; secondary selecionado = botão primário. Outline e secondary: junto por padrão (puxão só no outline), `attached={false}` separa por 4px. Ghost (e o `default`, que é ghost): sempre separado por 4px, nunca junto, porque junto ele fica quebrado.

## 3c. Grupo de campo — aprovado sem mudança visual

O proprietário aprovou deixar como está: não há grupo de campo com botão ao lado. Entra só a limpeza de código (seção 4).

## 4. Limpeza que a regra permite

1. Uma regra única de "grupo colado" em `app/tailwind.css` (raio por `--group-radius`, cantos internos retos, puxão só no outline), usada pelos dois grupos. Saem os seis `!` do ButtonGroup e as seis listas de raio do `ToggleGroupItem`.
2. Saem os cinco `className="bg-background"` dos separadores da gaveta. O `PrismButtonGroupSeparator` só continua se o proprietário quiser um traço visível.
3. `PrismButtonGroupText`: a mesma lista de classes escrita duas vezes, unificar.
4. `PrismToggleGroup`: `flex-col items-stretch` repetido com `data-vertical:`; props `attached`/`fullWidth` por item que nenhuma tela usa; atributos `data-spacing`/`data-attached` que nenhum CSS lê; detecção de `flex-1`/`shrink`/`grow` lendo o texto do `className`.
5. `PrismInputGroup`: `"use client"` sem efeito numa SPA; medidas do `InputGroupButton` que repetem o tamanho de ícone; `squircle` repetido no login do portal e `bg-input` repetido na busca do parceiro.
6. `UCalendarToolbar`: remover a exceção do celular no botão do meio.

## 5. Implementação (13/11, sem commit)

Tudo aprovado. Implementado em `button.tsx` (variantes exportadas), `toggle.tsx`, `toggle-group.tsx`, `button-group.tsx` e `input-group.tsx` (limpeza), mais as telas: gaveta (Essencial e Instagram com `attached={false}`, sem separadores), barra do calendário (sem a exceção do celular), Minha Conta e calendário da Home (`attached` redundante removido), lote de cor e seletor de cor (`spacing` removido), login do portal e busca do parceiro (classes repetidas). `/ui`: controle `attached` no ButtonGroup e no ToggleGroup, sem `spacing`.

O que muda na tela: período do calendário da Home e "Usar esta estratégia" sem linha escura; barra do calendário sem linhas e com o botão do meio igual no celular; toggles ghost (ícones do Hoje/Home, Semana/Mês do portal, Cor de destaque, Áreas, plano, seletor de cor, lote de cor) separados por 4px em vez de 8px (lote de cor: antes encostados); toggle secondary com a borda do botão; os controles do `/ui` (PropsPlayground) separados por 4px.

## Limites

A prévia é HTML estático com o tema padrão e um primário azul só para leitura; não usa as paletas OKLCH do app. Ela mostra a geometria e as transparências, não substitui a conferência no `/ui` depois da implementação. Nada foi verificado no app real; a implementação, quando aprovada, deve atualizar `/ui`, `docs/contracts/prism-details.md` e a regra de grupos no AGENTS.
