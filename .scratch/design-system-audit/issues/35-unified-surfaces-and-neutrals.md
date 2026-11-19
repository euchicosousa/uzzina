# DS35 — Um sistema único e simples para os fundos e os cinzas do app

**Status.** Aberto em 17/11/2026 a pedido do proprietário, como ticket principal de todos os assuntos de cinzas e fundos. Absorve como fases o DS23, DS30, DS31, DS32, DS33 e DS34 (os arquivos continuam como detalhe de cada fase). Começa por estudo e decisão; nenhuma alteração no código do app sem a aprovação de cada fase.

**Fase 1, 19/11.** [Bancada de estudo](../ds35-bancada-de-estudo.html) disponível na `main` local. Reúne cinco comparativos do uso atual com hipóteses em Ônix e Carbono, nos dois modos, e recomendações para P1–P8. A separação de cartão neutro e flutuante sobre o fundo branco do Carbono claro merece conferência pela borda e pela sombra. Controles e larguras de 320 a 1440 px verificados no Chromium isolado. Os exemplos são maquetes. As oito decisões seguem pendentes.

## O problema, em palavras simples

O mesmo tipo de coisa é pintado de jeitos diferentes em telas diferentes. Cada ajuste resolveu um caso pequeno e criou mais uma cor, mais um estado ou mais uma exceção. O resultado é um app inconsistente: o mesmo botão cinza aparece em vários tons, há destaques diferentes para o mesmo papel e cores usadas para o que nunca foram pensadas.

Exemplos medidos no código em 17/11 (`app/`, sem arquivos gerados):

- **O cartão (`bg-card`) virou várias coisas.** 31 usos em 19 arquivos: destaque de notificação não lida e o hover dela (menu do sino e página Notificações), hover de linha em Admin → Datas comemorativas, caixas do Planejamento e do portal do cliente, comentários de outras pessoas, e o fundo padrão do alerta, do toast, do selo e do botão de rádio. Nunca foi definido para quê ele serve. Vários desses usos são caixas em volta de blocos, o que a regra de superfícies do AGENTS já proíbe.
- **O mesmo "destaque suave" escrito três vezes sem nome:** `bg-secondary/50` no grupo Admin do menu do avatar (`Header.tsx`), no alvo ao arrastar (`DnD.tsx`) e no hover da célula do calendário (`CalendarDayCell.tsx`, 20% no escuro).
- **Transparências escritas à mão:** 79 usos de `foreground/NN` em 39 arquivos, mais 5 de `bg-secondary/NN` e 7 de `bg-card/NN`.
- **Cinza que não reage ao mouse:** 14 itens já são cinza e o hover usa o mesmo cinza (inventário do DS33).
- **Cinza em lugar errado:** o botão cinza sobre o cartão claro fica quase invisível (0,016 de diferença de luz); sobre cor de fase e imagem vira um cinza sólido estranho.
- **Peso morto:** 132 ajustes por paleta (`*LDelta`, 6 campos × 11 paletas) que o CSS já não lê desde o DS28.

Uso atual das cores neutras (contagem por `grep` em 17/11): `bg-secondary` 132 usos em 48 arquivos; `text-secondary-foreground` 341 em 91; `border-border` 87 em 29; `bg-background` 45 em 25; `bg-card` 31 em 19; `bg-action` 29 em 7; `bg-popover` 24 em 19; `bg-input` 21 em 14; `border-input` 3; `bg-accent` 2; `bg-secondary-hover` 1.

## O princípio: simples, com limites

Decisão de direção do proprietário em 17/11:

1. **Poucas cores, cada uma com um papel.** Uma cor existe para um papel claro, não para um caso.
2. **Limitar o uso em vez de criar variações.** Se uma cor fica errada num lugar, a resposta é "ela não é usada ali", não uma nova variante para aquele lugar. Exemplo dado pelo proprietário: o botão secundário só pode ficar sobre o fundo da página; se ficou ruim em outro lugar, não é para usar ali.
3. **Nada de casos de uso aos milhares.** Cada exceção nova precisa entrar no contrato e na galeria `/ui`, ou não entra no app.

## O que a pesquisa mostrou (base para a fase 1)

Relatório: [docs/audits/2026-11-17-ds23-referencias.md](../../../docs/audits/2026-11-17-ds23-referencias.md). Verificado nas fontes oficiais: shadcn/ui, Radix, Carbon (IBM), Atlassian.

- **shadcn/ui** (a base do Prism): tudo opaco; cada cor tem um papel fixo: `secondary` é botão de menos destaque, `accent` é hover e foco de itens de menu e lista, `muted` é fundo discreto. Não tenta fazer um cinza servir a tudo.
- **Radix:** uma escala numerada em que cada degrau tem um papel (fundo, fundo de componente, hover, pressionado, borda, texto). A regra de uso é o que dá consistência.
- **Carbon e Atlassian:** camadas com hover próprio. Resolvem superfícies aninhadas, mas exigem declarar a camada em cada contêiner. **Pelo princípio de limitar, este modelo fica fora do caminho padrão** (estudo guardado no DS23).
- **Desfoque de fundo (`backdrop-filter`):** não serve para hover comum (custo, camada extra, não resolve mistura de cor).

Leitura para a UZZINA: ficar perto do shadcn (papéis fixos e poucos) e emprestar do Radix a ideia de que cada cor tem um papel escrito, com a lista de onde pode e onde não pode ser usada.

## Ponto de partida para a fase 1 (hipótese, não decidido)

Proposta a discutir com o proprietário, montada a partir do uso real. Os nomes atuais ficam; nada é renomeado (decisão de 17/11).

| Papel                                                                                        | Cor                                                                             | Pode ficar sobre            | Não pode                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------- | ------------------------------------- |
| Fundo da página                                                                              | `background`                                                                    | —                           | —                                     |
| Flutuante (menu, diálogo, gaveta, toast)                                                     | `popover`                                                                       | página                      | —                                     |
| Campo                                                                                        | `input`                                                                         | página, flutuante           | cor de fase, imagem                   |
| Cartão de ação                                                                               | `action` (e fases)                                                              | página                      | —                                     |
| Botão secundário, selo, chip, avatar vazio                                                   | `secondary` (+ `secondary-hover`)                                               | página (flutuante: decidir) | cartão, cor de fase, imagem, destaque |
| Hover e foco de item transparente (menu, lista, aba)                                         | decidir: `secondary` ou `accent`                                                | página, flutuante           | cor de fase, imagem                   |
| Destaque suave (Admin do menu, alvo de arrastar, célula do calendário, notificação não lida) | uma cor só, com nome (decidir: o `card` passa a ser isto?)                      | página, flutuante           | —                                     |
| Borda                                                                                        | `border`; borda de container translúcida do DS24                                | qualquer                    | —                                     |
| Texto                                                                                        | `foreground`, `secondary-foreground`                                            | qualquer superfície neutra  | —                                     |
| Sobre cor de fase e imagem                                                                   | nenhum cinza; só ícone branco com sombra (`image-icon`) e a própria cor da fase | —                           | qualquer cinza                        |

Limites propostos (a confirmar na fase 1):

1. O secundário só fica sobre os fundos permitidos na tabela.
2. Fundos não são escritos com transparência à mão (`foreground/NN`, `secondary/NN`, `card/NN`). As exceções ficam listadas no contrato (película de diálogo, borda de container, ícone sobre imagem).
3. Nada de cinza sobre cor de fase e imagem.
4. Sem caixas com fundo em volta de blocos (regra que já existe no AGENTS).
5. Cor nova ou uso novo só entra pelo contrato e pela galeria `/ui`.

## Fases

Cada fase só começa com a aprovação da anterior. As fases 1 e 2 são estudo, sem código.

1. **Contrato dos papéis (estudo e decisão).** Fechar a tabela acima: quantos papéis, qual cor em cada um, onde pode e onde não pode. Usar a pesquisa e as decisões D1 a D10 do inventário do DS33. Entrega: relatório curto e página HTML com todos os papéis em Ônix e Carbono, claro e escuro, mostrando o uso permitido e o proibido, com o CSS embaixo. Depois do aceite, o contrato vira `docs/contracts/surfaces-and-neutrals.md` e entra no índice do AGENTS.
2. **Inventário por papel.** Cada uso das cores neutras classificado como "conforme" ou "viola o limite X → vira Y". Ampliar o inventário do DS33 (que já cobre o secundário e as transparências, 433 usos) para cartão, flutuante, campo, borda, cartão de ação, `accent` e fundo. Entrega: relatório com a lista por tela e o que muda na tela em cada lote.
3. **Cores no CSS e limpeza das paletas.** Aplicar o contrato em `app/tailwind.css` e tirar das paletas o que não é mais usado (antigo [DS30](30-palette-cleanup-parent-color.md): ajustes de luz, texto, relevo). Ideal: nada muda na tela além do aprovado.
4. **Reescrita por área, em lotes.** Ordem: primitivos do Prism, depois cabeçalho e menu do sino, Notificações, Planejamento, portal do cliente, Admin. Cada lote vem com roteiro curto do que olhar. Inclui os hovers e as transparências do antigo [DS33](33-manual-transparencies-and-secondary.md).
5. **Ferramentas que dependem do contrato:** tema Personalizado de Minha Conta ([DS31](31-custom-theme-parent-color.md)), editor de temas do Admin ([DS32](32-admin-theme-editor-parent-color.md)) e widget do Cloudinary ([DS34](34-cloudinary-widget-neutrals.md)). Cada um mantém o próprio arquivo com suas decisões.
6. **Fechar e proteger.** Galeria `/ui` com os papéis e os limites, tabela de tokens do AGENTS, contrato em `docs/contracts/`. Decidir se entra uma checagem simples que aponte os padrões proibidos.

O modelo de camadas do [DS23](23-opaque-surface-aware-colors.md) fica como estudo de referência; só volta se a fase 1 mostrar que os limites não bastam.

## Decisões do proprietário na fase 1

Perguntas em linguagem simples; a fase 1 traz a recomendação para cada uma.

- [ ] **P1.** O botão cinza (secundário) fica só sobre o fundo da página, ou também dentro de menus e diálogos?
- [ ] **P2.** O cartão (`card`) deixa de ser "caixa" e passa a ser o destaque suave (notificação não lida, alvo de arrastar, célula do calendário, Admin do menu), ou sai do sistema?
- [ ] **P3.** O hover de itens transparentes (menus, listas, abas) usa o mesmo cinza do botão secundário, ou uma cor própria (`accent`, como no shadcn)?
- [ ] **P4.** Sobre cor de fase e imagem: confirmar que nenhum cinza é usado (avatar sem foto e "+3" no cartão de fase, quadros atrás de imagem).
- [ ] **P5.** Transparências escritas à mão: proibidas para fundos, com uma lista curta de exceções? Quais exceções (borda de container do DS24, texto apagado, película de diálogo)?
- [ ] **P6.** Estado pressionado: entra como cor própria ou não (mais simples)?
- [ ] **P7.** Caixas do Planejamento e do portal que hoje usam `bg-card`: perdem a caixa (seguindo a regra de superfícies) ou viram exceção registrada?
- [ ] **P8.** Proteção: só regra escrita, ou também uma checagem automática simples que liste usos proibidos?

## Fases absorvidas

| Antes | Vira                 | O que aproveita                                                         |
| ----- | -------------------- | ----------------------------------------------------------------------- |
| DS23  | Referência da fase 1 | Estudo de superfícies (16/11), páginas de opções e de camadas, pesquisa |
| DS33  | Fases 2 e 4          | Inventário de 433 usos, página de grupos, decisões D1 a D10             |
| DS30  | Fase 3               | Lista de campos das paletas que saem                                    |
| DS31  | Fase 5               | Estudo do tema Personalizado                                            |
| DS32  | Fase 5               | Ajustes do editor de temas do Admin |
| DS34  | Fase 5               | Widget do Cloudinary (depende também do UP01)                           |

**Dependências vinculadas em 18/11 por decisão do proprietário.**

- [DS21 · Editor de temas do Admin](21-admin-theme-colors-editor.md). Encerrado como frente independente. A fase 5 parte da versão preservada no commit 46a92ce para adaptar a prévia e os controles quando as regras de cores estiverem definidas.
- [DS29 · Sombra de menus, janelas e cartões](29-single-shadow-formula.md). Dependência pendente da fase 3. A fórmula foi escolhida no laboratório. Falta aplicá-la e conferir o resultado no claro e no escuro quando essa fase for autorizada.

## Material de apoio

- [Inventário do DS33](../../../docs/audits/2026-11-17-ds33-inventory.md) e [página de grupos](../ds33-grupos.html)
- [Pesquisa de outros sistemas](../../../docs/audits/2026-11-17-ds23-referencias.md)
- [Três opções de cinza por superfície](../ds23-opcoes-superficie.html) e [modelo de camadas](../ds23-camadas.html)
- [Estudo de superfícies de 16/11](../../../docs/audits/2026-11-16-ds23-surfaces-study.md) e [análise da cor pai (DS24)](../../../docs/audits/2026-11-16-ds24-cor-pai-analise.md)

## Critérios de conclusão

- [ ] Contrato aprovado e publicado em `docs/contracts/surfaces-and-neutrals.md`.
- [ ] Nenhum uso fora do contrato no inventário final (ou exceção registrada).
- [ ] Ajustes por paleta sem uso removidos.
- [ ] Galeria `/ui` e AGENTS atualizados.
- [ ] Aceite visual do proprietário em cada lote, nos dois modos.

## Modelos sugeridos

- **Claude Code — Opus 5.5.** Fase 1: decisões de desenho, contrato e página de papéis, com o proprietário.
- **Claude Code — Sonnet 5.5.** Fases 3 e 4 nos primitivos do Prism e nas telas de maior alcance, com conferência nos dois modos.
- **Claude Code — Haiku 5.5.** Fase 2 (inventário por busca) e lotes mecânicos da fase 4, com regra fixa.
