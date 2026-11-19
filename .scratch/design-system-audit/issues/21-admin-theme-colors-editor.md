# DS21 — Página exclusiva do Admin para edição completa e visualização lado a lado de todas as cores dos temas

**Status.** Concluído como ticket independente em 18/11/2026 por decisão do proprietário. A primeira versão está preservada no commit 46a92ce. As próximas adaptações do editor passam à fase 5 do [DS35](35-unified-surfaces-and-neutrals.md), junto com a revisão das cores.

**Registro anterior.** Fase 1 (página `/app/admin/themes` + botão Salvar `.md`) implementada localmente em 16/11/2026, aguardando aceite visual antes da Fase 2 (correção do "Atenção" no escuro e prioridades derivadas). Modelo vigente: [protótipo v2](../prototipo-ds21-v2.html) com a [revisão](../../../docs/audits/2026-11-16-ds21-review.md).

**Continuidade.** O trabalho futuro no editor segue as decisões de cores do ticket principal.

## O que a pessoa vê hoje

Hoje a edição e a visualização das cores da UZZINA estão divididas em três lugares diferentes, e nenhum deles permite ao administrador controlar todas as variáveis (cor, luminosidade/luma, croma, transparência/mistura e estados) vendo tudo aplicado lado a lado:

1. **Minha Conta → Aparência → Personalizado (`CustomThemePanel.tsx`):** permite ao usuário editar apenas 4 cores em hexadecimal por modo (Cor principal, Texto sobre a cor principal, Fundo e Texto), a cor/opacidade da sombra, o relevo dos cartões e a cor da borda superior. Ele **não** permite editar as 11 paletas oficiais do app, nem controlar os deltas de luminosidade (`card`, `popover`, `input`, `border`, `action`, `action-hover`), nem as taxas de transparência/mistura (`secondary`, `secondary-foreground`, `overlay`, fundos semânticos), nem as cores de feedback (Erro, Aviso, Sucesso, Informação), de Prioridade ou de Fase (Ideia a Concluído).
2. **Galeria `/ui` → Cores Semânticas (`TokensColorsSection.tsx`):** mostra as amostras de cores e componentes de exemplo após o DS20, mas é **somente leitura** (não edita nada) e, em vários componentes interativos (como botões e menus), a cor de hover só aparece quando se passa o mouse por cima.
3. **Código-fonte (`app/lib/palettes.ts` e `app/tailwind.css`):** dezenas de valores OKLCH, deltas de luma (`--*-l-delta`), porcentagens de `color-mix` e fórmulas das fases (`phase-surface` e `phase-vivid`) estão fixos no código e exigem edição manual de arquivo para qualquer ajuste fino.

## O que o proprietário pediu

Criar uma **página exclusiva para administradores** (ex.: `/app/admin/themes` ou `/app/admin/colors`) dedicada à **edição completa de todas as cores dos temas** e à **visualização em tempo real nos componentes reais**:

1. **Acesso restrito ao Admin:** protegida por `AdminGuard`, acessível pelo menu de Administração.
2. **Layout em duas colunas:**
   - **Espaço grande à esquerda (Mostruário vivo de componentes reais):** exibe todos os componentes reais do app que usam aquelas cores em todas as suas aplicações (cartões de ação em todas as variantes e fases, botões, grupos de botões/toggles, campos de formulário, menus/popovers/diálogos, alertas, selos, prioridades, calendário).
   - **Barra lateral à direita (Painel de controle e edição de cada cor):** lista organizada com o nome de cada cor/token e os controles completos usando os componentes que já existem no Prism/Uzzina para ajustar **cor (matiz/croma), luminosidade (luma / delta L) e transparência (opacidade / mistura %)**.
3. **Exibição lado a lado de estados, estágios e cores calculadas (sem esperar o hover):**
   - **Estados interativos lado a lado:** se um botão, cartão ou item tem uma cor em repouso e outra em **hover** (ou foco/selecionado), as duas cores e os dois estados do componente precisam aparecer **lado a lado permanentemente**, sem precisar passar o mouse para descobrir como fica.
   - **Cores de estágio/fase lado a lado com a original:** para cada estágio/fase (Ideia, Fazer, Fazendo, Análise, Feito, Concluído), mostrar a cor original da fase lado a lado com as cores derivadas (Suave em repouso, Suave em hover, Viva em repouso, Viva em hover, texto e contorno).
   - **Cores calculadas em tempo real:** quando uma cor for calculada automaticamente a partir de outra (por exemplo, via `oklch(from ...)` ou `color-mix(...)`), ela deve aparecer imediatamente ao lado da cor original (identificada como calculada/não editada diretamente, ou exibindo o controle do parâmetro que a calcula, como delta de luma ou % de transparência), atualizando ao vivo conforme a cor mãe muda.

## O que o código mostra hoje (inventário preliminar para o estudo)

### 1. Onde vivem as cores e fórmulas atuais

| Camada                           | Onde fica hoje                         | O que é configurável hoje vs. o que está fixo no código                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **11 Paletas oficiais**          | `app/lib/palettes.ts` (`PALLETE`)      | Cada paleta define em OKLCH (`h`, `c`, `l`) para claro e escuro: `primary`, `primaryFg`, `bg`, `fg`, `ring`, além de `relief`, `topBorderColor`, `shadowColor`, `shadowOpacity` e 6 deltas de luma (`cardLDelta`, `popoverLDelta`, `borderLDelta`, `inputLDelta`, `actionLDelta`, `actionHoverLDelta`). Hoje só mudam editando o arquivo TypeScript.                                                |
| **Injeção de variáveis CSS**     | `app/lib/palette-vars.ts`              | `applyPaletteVars()` escreve as variáveis `--primary-*`, `--*-override` e `--*-l-delta` no `document.documentElement`.                                                                                                                                                                                                                                                                              |
| **Superfícies e neutros (CSS)**  | `app/tailwind.css` (`:root` e `.dark`) | `card`, `popover`, `border`, `input`, `action` e `action-hover` usam `oklch(from var(--background) calc(l + var(--*-l-delta)) c h)`. Já `secondary` (`5%` claro / `10%` escuro de `foreground`), `secondary-foreground` (`65%` de `foreground`), `accent` (`primary` com $L - 0{,}15$ no claro e $L + 0{,}10$ no escuro) e `overlay` (`30%` de `shadow-tint`) têm porcentagens/deltas fixos no CSS. |
| **Botões e estados de hover**    | `app/components/prism/button.tsx`      | `default` usa `bg-primary` e no hover `hover:bg-primary/80` (80% de opacidade); `secondary` usa `bg-secondary` e no hover `hover:bg-secondary/80`; `outline` e `ghost` usam hover `hover:bg-secondary`; `error` usa `bg-error-background` e no hover `hover:bg-error-background/80`.                                                                                                                |
| **Feedbacks semânticos (4 + 1)** | `app/tailwind.css`                     | Erro, Aviso, Sucesso e Informação usam matizes/luma/croma fixos no CSS e fundos opacos misturados sobre `--card` (`13%` no erro claro, `7%` nos demais claros, `14%` em todos no escuro). `success-strong` usa esmeralda fixo (`emerald-600` e hover `emerald-700`).                                                                                                                                |
| **Prioridades (Hoje)**           | `app/tailwind.css`                     | `--priority-low`, `--priority-medium`, `--priority-high` em OKLCH fixos para claro e escuro.                                                                                                                                                                                                                                                                                                        |
| **Fases / Estágios (6 fases)**   | `CONSTANTS.ts` e `app/tailwind.css`    | As 6 cores base ficam em `PHASES` (`CONSTANTS.ts`). As classes `@utility phase-surface` (Suave) e `@utility phase-vivid` (Viva) em `app/tailwind.css` calculam o fundo de repouso, fundo de hover, texto, borda/anel, realce de topo e sombra a partir de `--phase-color` com variáveis internas (`--phase-mix`, `--phase-mix-hover`, `--vivid-hover-dl`, etc.).                                    |
| **Atrasadas (`late-surface`)**   | `ActionItem.tsx` e `app/tailwind.css`  | Usa `bg-error-background` e sombras vermelhas calculadas em `@utility late-surface`.                                                                                                                                                                                                                                                                                                                |

### 2. Componentes já existentes para os controles da barra direita

Não é necessário criar seletores de cor do zero; o projeto já possui:

- **`PrismColorArea`**, **`PrismColorSlider`** e **`PrismColorField`** (`app/components/prism/`): área 2D de cor, barra deslizante por canal e campo numérico/texto por canal.
- **`UColorPickerDropdown`** (`app/components/uzzina/UColorPickerDropdown.tsx`): seletor flutuante com amostras e troca de formato (`HEX`, `RGB`, `HSL`, `HSB`).
- **`PrismSlider` + `PrismSliderTrack` / `PrismSliderThumb` / `PrismSliderFill`** (`app/components/prism/slider.tsx`): controle deslizante contínuo já usado para opacidade da sombra em `CustomThemePanel.tsx`, pronto para controlar **Luma (`L` de `0` a `1` e deltas `ΔL` de `-0.30` a `+0.30`)**, **Croma (`C` de `0` a `0.40`)**, **Matiz (`H` de `0°` a `360°`)** e **Transparência / Mistura (`0%` a `100%`)**.
- **`PrismToggleGroup`** e **`UPreferenceSwitch`**: para alternar o modo em edição (Claro / Escuro / Ambos lado a lado), a paleta base selecionada (Ônix até Fúcsia) e opções booleanas como relevo dos cartões.
- **Conversores OKLCH ↔ Hex (`app/utils/color.ts`):** `hexToOklch`, `oklchToHex` e funções de derivação.

## Antes e depois esperado

| Aspecto                                      | Antes (hoje)                                                                                                            | Depois (com a nova página do Admin)                                                                                                                                                                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quem acessa e onde fica**                  | Não existe painel de laboratório/edição de temas para o Admin; apenas o tema Personalizado básico em Minha Conta        | Nova rota exclusiva de Admin (`/app/admin/themes`), com área ampla de componentes à esquerda e barra lateral de edição à direita                                                                                                                    |
| **Alcance dos controles**                    | Só 4 cores Hex + sombra + relevo no tema Personalizado; deltas de luma, misturas, feedbacks e fases ficam presos no CSS | Controle completo na barra direita: cor (matiz/croma), luma (`L` e `ΔL`), transparência/mistura (`%`), sombras, borda de topo, feedbacks semânticos, prioridades e fases                                                                            |
| **Visualização de hover e estados**          | É preciso passar o mouse em cada botão ou cartão para ver a cor de hover                                                | Todo componente e toda amostra na barra lateral exibem **lado a lado** a cor original (repouso) e as variações de estado (hover, foco, selecionado), sem esperar o mouse                                                                            |
| **Visualização de cores calculadas / fases** | As cores derivadas (`card`, `secondary`, `accent`, fases Suave/Viva) ficam ocultas em fórmulas CSS                      | Toda cor calculada em tempo real aparece imediatamente ao lado da cor mãe (com seu valor resolvido visível e identificado como calculado, ou com o controle do parâmetro da fórmula), inclusive a cor original de cada fase ao lado de Suave e Viva |

## O que o estudo deste ticket precisa responder e propor

Como este é o passo de estudo antes da implementação, a primeira entrega é um **relatório de estudo + protótipo/maquete visual da página** respondendo a:

1. **Mapa completo de variáveis editáveis x calculadas:** listar cada grupo da barra lateral direita (1. Paleta Base e Superfícies; 2. Cartão de Ação e Sombras; 3. Botões e Controles Interativos; 4. Estágios/Fases da Ação — Original, Suave e Viva; 5. Feedbacks Semânticos e Prioridades), indicando quais variáveis CSS já têm override e quais em `app/tailwind.css` ou `button.tsx` precisam virar variável CSS customizável em tempo real (ex.: `--secondary-alpha`, `--secondary-fg-alpha`, `--accent-l-delta`, `--phase-mix`, `--phase-mix-hover`, `--error-bg-mix`, etc.).
2. **Desenho dos pares lado a lado (Original + Estado/Calculada):** definir como exibir, tanto no painel da direita quanto nos componentes reais da esquerda:
   - O par **Repouso | Hover | Foco** nos botões (`default`, `secondary`, `outline`, `ghost`, `error`, `ghost-error`), itens de menu e cartões de ação.
   - A tira de **Estágio/Fase**: Cor Original da Fase | Suave (Repouso) | Suave (Hover) | Viva (Repouso) | Viva (Hover) | Texto e Anel.
   - As cores derivadas ao lado da cor mãe (ex.: `Background` ao lado de `Card`, `Popover`, `Input`, `Border`, `Action` e `Action Hover`; `Foreground` ao lado de `Secondary 5%/10%` e `Secondary Foreground 65%`; `Primary` ao lado de `Accent` e `Primary Hover 80%`).
3. **Como salvar / aplicar o resultado da edição do Admin:** apresentar as opções para o proprietário decidir:
   - _Opção A — Salvar no banco de dados (efeito imediato para toda a agência):_ uma configuração global de temas/paletas no Supabase que sobrescreve os padrões de `palettes.ts` e `tailwind.css` para todos os usuários.
   - _Opção B — Exportar / copiar configuração pronta para o código:_ botão na página do Admin que copia o código atualizado de `palettes.ts` / variáveis de `tailwind.css` (ou salva em banco + exporta), mantendo zero custo extra no carregamento inicial.
   - _Opção C — Híbrido:_ testar ao vivo na página com rascunho persistido localmente e escolher entre aplicar globalmente ou exportar para o código.

## Decisões que o proprietário precisa tomar (para orientar ou fechar o estudo)

1. **Destino do que o Admin edita na página:** quando você ajustar as cores, luma e transparências nessa página do Admin, você quer que exista um botão **"Salvar para todo o app"** (gravando no banco para valer imediatamente para toda a equipe) ou um botão **"Copiar/Exportar para o código"** (para atualizarmos as paletas oficiais no código), ou os dois?
2. **Cores que hoje são calculadas por fórmula (como o Hover do botão a 80%, o `Secondary` a 5%/10% ou a mistura da Fase Suave a 7%/14%):** na barra da direita, além de mostrar a cor calculada ao lado da original em tempo real, você quer poder **destravar e editar a porcentagem/luma dessa fórmula** (por exemplo, mudar o hover ou a transparência do `Secondary` com um controle deslizante), ou elas ficam apenas visíveis como leitura ao lado da original?
3. **Modo Claro e Escuro na tela:** você prefere que a área da esquerda mostre um modo por vez (com um botão rápido Claro / Escuro no topo da barra direita) ou que seja possível dividir a área da esquerda para ver Claro e Escuro ao mesmo tempo?

## Entregas do estudo (16/11/2026)

- **Relatório completo do estudo:** [`docs/audits/2026-11-16-ds21-admin-theme-colors-study.md`](../../../docs/audits/2026-11-16-ds21-admin-theme-colors-study.md) — inventário separado de **(A) Cores diretamente editáveis** vs. **(B) Cores calculadas em tempo real** (`⚡ Auto / Calculada`), com a cor mãe, a fórmula exata no Claro e no Escuro e onde cada uma é aplicada nos componentes reais.
- **Esboço interativo (protótipo HTML autocontido):** [`.scratch/design-system-audit/prototipo-ds21-editor-cores-admin.html`](../prototipo-ds21-editor-cores-admin.html) — abre direto no navegador com as 11 paletas reais da UZZINA, alternância Claro/Escuro, mostruário vivo à esquerda exibindo **Repouso | Hover | Foco lado a lado sem precisar passar o mouse**, tira das **6 fases (Cor Original + Suave Repouso + Suave Hover + Viva Repouso + Viva Hover)** e barra lateral direita funcional com sliders de `L`, `C`, `H`, `ΔL`, `%` e seletor Hex que recalculam todas as derivadas (`⚡ Calculada`) ao vivo.

## Critérios de conclusão

- [x] Levantamento completo de todas as cores, deltas de luma, transparências (`color-mix` / `/80`), fases e estados de hover em `palettes.ts`, `palette-vars.ts`, `tailwind.css` e componentes Prism (`docs/audits/2026-11-16-ds21-admin-theme-colors-study.md`).
- [x] Proposta de layout e maquete interativa da página `/app/admin/themes` (área esquerda com componentes reais e estados lado a lado; barra direita com controles de cor, luma e transparência e amostras originais + calculadas lado a lado em `.scratch/design-system-audit/prototipo-ds21-editor-cores-admin.html`).
- [x] Decisões do proprietário registradas no ticket (forma de salvamento/exportação, edição de fórmulas calculadas e visualização Claro/Escuro) antes de escrever código no app.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Equilíbrio ideal para mapear todas as variáveis OKLCH e fórmulas de `app/tailwind.css` e `app/lib/palettes.ts`, montar a maquete interativa com estados lado a lado e depois implementar a rota `/app/admin/themes` reutilizando os componentes Prism.
- **Gemini — Gemini 4 Argon (Medium).** Ótima capacidade de análise para cruzar os tokens do DS20 com os controles de `UColorPickerDropdown` e `PrismSlider` e estruturar o estudo completo de variáveis editáveis x calculadas.
- **Claude Code — Opus 5.5.** Recomendado se o proprietário decidir que todas as fórmulas hoje fixas no CSS (misturas de fase, opacidades de hover de botões e feedbacks semânticos) devem virar variáveis dinâmicas salvas no banco e carregadas no bootstrap do app. Disponibilidade depende do plano.

## Decisões do proprietário (16/11/2026, após a revisão e o protótipo v2)

- **Protótipo v2 aprovado como modelo** ([revisão](../../../docs/audits/2026-11-16-ds21-review.md), [protótipo](../prototipo-ds21-v2.html)), com ajustes feitos no mesmo dia: só desktop/tablet (sem modo celular), cabeçalho em uma linha, página sem rolagem (só as duas colunas rolam), +8px entre os itens principais da lista.
- **Claro e escuro lado a lado** como padrão.
- **Regras fixas das fórmulas continuam travadas** (sem edição).
- **Editável:** tudo o que aparece no protótipo (paleta, fases, avisos, prioridades). Cor que faltar entra depois, se aparecer.
- **Proposta nova a avaliar:** prioridades derivadas das cores semânticas (Baixa ← sucesso, Média ← atenção, Alta ← erro), como o atraso já deriva do erro. Hoje são valores próprios em `app/tailwind.css` (`--priority-low/medium/high`, matizes 150/90/25), próximos mas não iguais aos semânticos.
- **Salvar = baixar um arquivo de instruções** (decidido em 16/11). O editor não grava nada no código nem no banco. "Salvar" baixa um arquivo (Markdown com bloco JSON) que o proprietário entrega a uma IA (Claude, GPT etc.) para aplicar. O arquivo precisa ser autoexplicativo: paleta e modo alterados, cada token com valor antigo e novo, onde cada valor mora (`app/lib/palettes.ts`, `app/tailwind.css` ou banco, se algum dia houver) e os passos de aplicação e verificação (typecheck, `/ui`, aceite visual). "Copiar código" pode continuar como atalho. Sem tabela nova e sem escrita em arquivo pelo app.
- **Prioridades derivadas das semânticas:** aceita como direção (Baixa ← sucesso, Média ← atenção, Alta ← erro); corrigir antes o amarelo de atenção no escuro, que sai quase branco.

## Instruções para a execução (16/11/2026)

Leia antes de escrever código: este ticket, a [revisão](../../../docs/audits/2026-11-16-ds21-review.md), o [protótipo v2](../prototipo-ds21-v2.html) (abra no navegador, em 1440×900), `AGENTS.md` (seção 5, Prism) e `docs/contracts/prism-details.md`. O protótipo v1 (`prototipo-ds21-editor-cores-admin.html`) fica só como exemplo do que **não** fazer.

### O que construir

1. **Rota** `app/routes/app/admin/themes.tsx` (`/app/admin/themes`), dentro de `AdminGuard`, no mesmo padrão de `admin/partners.tsx`, com item "Cores dos temas" no menu de Administração do `Header.tsx`. Só desktop e tablet deitado (≥ 1024px); não criar modo celular.
2. **Layout igual ao v2:** cabeçalho de uma linha (título, seletor de paleta, Claro/Escuro/Lado a lado, Descartar, Copiar código, Salvar); a página não rola, só as duas colunas (`h-dvh`/altura disponível, `min-h-0`, `overflow-y-auto` em cada coluna; conferir que o último item de cada coluna aparece inteiro). Abre em **Lado a lado**.
3. **Prévia com componentes reais**, não réplicas: `ActionItem` (variantes e fases suave/viva, atrasado), `PrismButton` em todas as variantes, campos, menus/popover, `PrismAlert`, selos, colunas de prioridade. Estados (repouso, hover, foco, selecionado) lado a lado sem depender do mouse: forçar o estado por atributo/classe na prévia, sem alterar os componentes do app. Se um componente não permitir isso sem mudança, pare e registre a necessidade em vez de duplicar o componente.
4. **A interface do editor fica fixa em Ônix** (a do app do usuário), e só as prévias recebem a paleta editada. `applyPaletteVars` hoje escreve no `document.documentElement`; crie uma variante que escreva as mesmas variáveis num elemento (sem mudar o comportamento atual). O modo escuro do Tailwind é `&:is(.dark *)` e `.dark` funciona em qualquer elemento; já a prévia **clara** dentro do app em modo escuro precisa redeclarar as variáveis claras no contêiner. Teste as duas prévias com o app em claro **e** em escuro.
5. **Lista de cores à direita igual ao v2:** dois modos por linha, calculadas recuadas abaixo da cor de origem, cadeado nas regras fixas (não editáveis), contraste nas linhas de texto, +8px entre itens principais, edição inline com Luz/Saturação/Matiz (`PrismSlider`, `PrismColorField`, `UColorPickerDropdown`; nada de controle feito do zero), passar o mouse numa linha contorna onde a cor é usada na prévia.
6. **Fases e prioridades** são globais (valem para todas as paletas): mostrar o aviso "vale para todas as paletas" e, no arquivo de Salvar, apontar o lugar certo (`PHASES` em `app/lib/CONSTANTS.ts`; `--priority-*` e avisos em `app/tailwind.css`), separado do que é por paleta (`app/lib/palettes.ts`).
7. **Estado só em memória.** Nada vai para o banco nem para arquivos. Opcional: rascunho no `localStorage` (com `try/catch`). Descartar volta ao valor do código. Avisar ao trocar de paleta com alterações não salvas.

### Salvar (arquivo para IA)

"Salvar" baixa `uzzina-cores-<paleta>-<AAAA-MM-DD>.md`, que o proprietário entrega a uma IA. Conteúdo, em português, autoexplicativo para quem não viu a conversa:

- Cabeçalho: o que é o arquivo, app/repositório (UZZINA), data, paleta, e a frase "Aplique somente estas mudanças; não altere fórmulas nem outros valores".
- Tabela por mudança: token, modo (claro/escuro/ambos), valor antigo → novo (OKLCH com 3 casas), arquivo e chave exata onde fica (ex.: `app/lib/palettes.ts` → `PALLETE.coral.light.actionHoverLDelta`).
- Bloco JSON com os mesmos dados (para conferência automática).
- Passos de aplicação e verificação: editar só as chaves listadas, `bun run typecheck`, Prettier nos arquivos tocados, conferir em `/ui` → Tokens de Design → Cores Semânticas e em `/app/admin/themes`, aceite visual do proprietário em claro e escuro; commit só com autorização dele.
- Sem mudanças: o botão fica desabilitado. "Copiar código" copia o mesmo conteúdo.

### Ordem e correções de dados

1. Página e Salvar (itens acima). Entregar para aceite visual antes do resto.
2. **Corrigir o amarelo de "Atenção"** (a fórmula estoura a luz para 1 e sai quase branco no escuro; ver revisão, seção 2): propor o valor, mostrar antes/depois na própria página e aplicar após o "sim" do proprietário.
3. **Prioridades derivadas** das semânticas (Baixa ← sucesso, Média ← atenção, Alta ← erro), depois do item 2: viram calculadas (recuadas, com cadeado) na lista. Conferir as colunas do Hoje → Prioridade e a galeria `/ui`.
4. **Não corrigir sem perguntar:** Coral claro `actionHoverLDelta` = +1,00 (provável erro de digitação) e a saturação de Damasco/Fúcsia acima do que a tela mostra. Apontar no relatório final e esperar decisão.

### Regras que o v1 quebrou e não podem se repetir

- Escala de controles 24/32/40/48 (`xs`/`sm`/`default`/`lg`), raios `rounded-2xl squircle` (itens internos `rounded-xl squircle`), tipografia do app (no máximo 3–4 tamanhos na página), ícones Lucide (nunca emoji), ícone de ação à direita do texto.
- Sem caixas/cartões com borda em volta de seções ou itens da lista; tudo direto sobre o fundo.
- Nomes técnicos (`--card`, fórmulas) pequenos e secundários; o nome em português ("Cartão", "Fundo") é o principal.
- Usar tokens (`bg-secondary`, `text-secondary-foreground`, `border-border`), nunca cores fixas na interface do editor.

### Limites de segurança

- `bun run dev` usa o banco de produção: no navegador, só leitura. Esta página não grava nada.
- Código e comentários em inglês, interface em português; TypeScript estrito, sem `any`. Componente novo reutilizável entra em `/ui`.
- Preserve mudanças do proprietário no checkout; commit e push só com pedido dele.
- Ao terminar: atualizar este ticket (status e critérios), `.scratch/README.md` e `docs/audits/CURRENT.md`, com o que foi verificado e o que não foi (ex.: prévia clara com o app em escuro).

### Critérios de aceite da implementação

- [x] `/app/admin/themes` só para admin, abre em Lado a lado, sem rolagem da página, com o último item de cada coluna visível (implementado; conferir no navegador).
- [x] Prévia com componentes reais e estados lado a lado; editor fixo no tema do usuário; prévias isoladas para claro e escuro (implementado; conferir com app em claro e escuro).
- [x] Edição inline atualiza prévia e calculadas ao vivo; regras fixas travadas.
- [ ] Salvar baixa o `.md` no formato acima; uma IA consegue aplicá-lo sem contexto extra (geração implementada; falta testar com uma mudança real e conferir o diff).
- [ ] Typecheck (`tsc --noEmit`), Prettier e `vite build` ok (passaram em 16/11); falta aceite visual do proprietário.
- [ ] Depois: Atenção corrigida (com "sim") e prioridades derivadas, cada um com aceite.
