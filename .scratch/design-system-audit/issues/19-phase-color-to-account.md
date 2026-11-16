# DS19 — Levar a "Cor da fase" do menu Visualizar para Minha Conta → Aparência

**Status.** Código implementado em 16/11/2026 na árvore de trabalho da `main`, sem commit; migração `20261116120000_phase_color_preference.sql` aplicada em produção em 16/11 com autorização do proprietário; falta testar salvar pelo app, o aceite visual e o commit. Aberto em 16/11/2026 a pedido do proprietário; decisões na seção "Decisões do proprietário".

**Relação com o DS17.** O [DS17](17-vivid-phase-color-cards.md) criou a opção Viva e as duas preferências "Cor viva no escuro" e "Texto na cor viva"; ele ainda aguarda aceite visual. O DS19 não muda a aparência dos cartões: muda **onde se escolhe** a cor da fase e **quando** as duas preferências aparecem.

## O que a pessoa vê hoje

A cor da fase pinta o cartão de cada ação com a cor da fase em que ela está (Ideia, Fazer, Fazendo, Análise, Feito, Concluído). Existem três opções: **Desligada**, **Suave** (tom leve) e **Viva** (cor cheia).

Hoje essa escolha está espalhada e não fica salva:

- **Menu "Visualizar"** (o botão de opções de exibição no topo da lista de ações): aparece na página de um parceiro, no bloco Sprint da Home e no calendário Semana/Mês da Home. É o grupo "Cor da fase" com os três itens.
- **Botão de paleta no Hoje** (ícone de paleta ao lado do seletor de visualização, no bloco Hoje da Home e na página Hoje): abre um menu pequeno com os mesmos três itens. Só aparece nas visualizações Parceiros e Categorias; o Kanban não oferece, porque já agrupa por fase.
- Em todos esses lugares a escolha vale só para aquela tela e **volta para Desligada ao recarregar**.

Separado disso, em **Minha Conta → Aparência**, logo abaixo de "Cor de Destaque", ficam "Cor viva no escuro" (pura ou atenuada) e "Texto na cor viva" (escuro ou claro), sempre visíveis, mesmo para quem não usa a Viva.

## O que o proprietário pediu

1. **Retirar totalmente** a "Cor da fase" do menu Visualizar.
2. **Criar a opção em Minha Conta → Aparência**, com três valores: **Desligada** (padrão), **Suave** e **Viva**.
3. **Mostrar "Cor viva no escuro" e "Texto na cor viva" somente quando a escolha for Viva.** Em Desligada e Suave elas não aparecem.

## Antes e depois

| Onde                                                      | Antes                                                                            | Depois                                                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Menu Visualizar (parceiro, Sprint, calendário Semana/Mês) | Grupo "Cor da fase" com Desligada / Suave / Viva                                 | Grupo removido; o menu fica só com Layout, Limitar altura e Colunas                                 |
| Minha Conta → Aparência                                   | Não há "Cor da fase"; "Cor viva no escuro" e "Texto na cor viva" sempre visíveis | Nova opção "Cor da fase" (Desligada / Suave / Viva), logo acima das duas; elas só aparecem com Viva |
| Como a escolha vale                                       | Por tela, sem salvar                                                             | Uma escolha só, salva na conta, igual em todas as telas e aparelhos                                 |
| Botão de paleta no Hoje                                   | Menu com os três valores                                                         | Removido (decisão de 16/11)                                                                         |

## O que o código mostra hoje

- O grupo do menu Visualizar fica em `app/components/uzzina/UViewOptions.tsx` (campo `phaseColor` e chave `showOptions.phaseColor`). Três telas ligam esse grupo: `app/routes/app/partner/$slug.tsx`, `app/components/features/home/HomeSprintView.tsx` e `HomeCalendarView.tsx`. A galeria `/ui` tem um exemplo dele (`UzzinaViewOptionsSection.tsx`).
- O botão do Hoje é outro controle, fora do menu Visualizar: `useTodayPhaseColor` em `app/components/features/home/TodayViewParts.tsx`, usado por `HomeTodayView.tsx` e `today/TodayPageView.tsx`.
- O cartão recebe o valor pela prop `showPhaseColor` (`ActionItem.tsx`), repassada por `PartnersBoard`, `CategoriesBoard`, `CalendarDayCell`, `CalendarWithDnd` e `HomeSprintView`. `KanbanPhasesBoard` não repassa.
- As preferências da conta vivem em `app/lib/preferences.ts` (`UserPreferences`, padrões e leitura) e a tela em `app/routes/app/profile.tsx` (aba Aparência; "Cor viva no escuro" e "Texto na cor viva" por volta das linhas 1083–1170, com prévia dos cartões).
- **Precisa de mudança no banco.** A função `update_my_preferences` (última versão em `supabase/migrations/20261113120000_vivid_phase_preferences.sql`) recusa qualquer chave que não conheça ("Unknown preference key"). Salvar uma preferência nova (`phaseColor`, valores `off`/`soft`/`vivid`) exige nova migração com `CREATE OR REPLACE` dessa função, aplicada em produção com autorização do proprietário **antes** de publicar o código. Sem ela, salvar em Minha Conta falha. A leitura (`get_app_bootstrap`) precisa ser conferida para confirmar que devolve a chave nova sem ajuste.

## O que fazer

1. Criar a preferência `phaseColor` (`off` padrão, `soft`, `vivid`) em `preferences.ts`, com validação na leitura, e a migração que ensina `update_my_preferences` a aceitá-la.
2. Em Minha Conta → Aparência, criar o bloco "Cor da fase" com os três valores, no mesmo padrão dos vizinhos (`ProfileSetting` + `PrismToggleGroup`), acima de "Cor viva no escuro". Mostrar "Cor viva no escuro" e "Texto na cor viva" só quando o valor for Viva; os valores já salvos dessas duas continuam guardados quando ficam escondidas. Sem cartão/caixa em volta do bloco (regra de superfícies do AGENTS).
3. Remover o grupo "Cor da fase" de `UViewOptions` (campo, `showOptions.phaseColor`, itens de menu, ícones que sobrarem sem uso) e das três telas que o ligam; ajustar o exemplo da `/ui`.
4. Fazer todos os cartões de ação do app lerem a preferência da conta (decisão 2), inclusive o Kanban.
5. Remover o botão de paleta do Hoje (`useTodayPhaseColor`), conforme a decisão 1.
6. Atualizar `docs/contracts/pages-today-profile-planning.md` (preferências e Hoje), o AGENTS se a regra de preferências mudar, o KI de banco (`uzzina-database`) e `CURRENT.md`.

## Decisões do proprietário (16/11/2026)

1. **Botão de paleta do Hoje deixa de existir.** O único controle da cor da fase fica em Minha Conta → Aparência. Remover `useTodayPhaseColor` e seu uso no bloco Hoje da Home e na página Hoje.
2. **A cor passa a valer em todo o app.** Todo cartão de ação segue a preferência da conta, em todas as telas e visualizações. Isso inclui lugares que hoje não oferecem a opção, como o Kanban do Hoje; o executor lista todos os pontos que mostram cartão de ação e aplica a preferência em cada um, apontando no roteiro de validação os que ganharam cor pela primeira vez.
3. **Padrão Desligada.**

Para conferir depois: Minha Conta → Aparência (nova opção e as duas da cor viva aparecendo só em Viva), menu Visualizar sem o grupo, Hoje sem o botão de paleta e os cartões coloridos em todas as telas.

## Critérios de conclusão

- [x] Menu Visualizar sem "Cor da fase" nas três telas e na `/ui`.
- [x] (código) Minha Conta → Aparência com "Cor da fase" (Desligada / Suave / Viva), salva na conta e aplicada nas telas combinadas. Salvar não foi testado: depende da migração.
- [x] "Cor viva no escuro" e "Texto na cor viva" visíveis só com Viva; valores preservados ao esconder (o estado fica na tela; só a exibição é condicional).
- [ ] Migração escrita e aplicada em produção em 16/11 (`supabase/migrations/20261116120000_phase_color_preference.sql`), registrada no CURRENT; falta testar salvar pelo app.
- [x] Botão de paleta do Hoje removido e cor aplicada em todos os cartões de ação do app, incluindo o Kanban (`ActionItem` lê a preferência; `showPhaseColor` removido).
- [ ] Roteiro curto de validação (entregue no relatório da execução; falta o aceite) para o proprietário, claro e escuro. `bun run dev` usa o banco de produção: na verificação pelo navegador, salvar preferência só com autorização.

## O que foi feito (16/11/2026)

- `preferences.ts`: `phaseColor` com padrão `off` e leitura validada (`isPhaseColorMode`).
- Migração nova copia `update_my_preferences` do DS17 e acrescenta só a chave `phaseColor` (`off`/`soft`/`vivid`). Aplicada em produção em 16/11 pelo executor principal, depois de comparar a função vigente com a do DS17. Leitura conferida: `get_app_bootstrap` devolve a linha inteira de `people`, então a chave nova chega sem ajuste.
- Minha Conta → Aparência: grupo "Cor da fase" acima de "Cor viva no escuro"; as duas só aparecem com Viva. Entra no mesmo fluxo de alterações/salvar das outras preferências.
- Removido o grupo do `UViewOptions`, das três telas, da `/ui` e o botão de paleta do Hoje. Teste do menu Visualizar ajustado (`tests/view-options.test.tsx`, 10 passam).
- `ActionItem` lê a preferência da conta; a prop `showPhaseColor` e seu repasse por `ActionContainer`, `PartnersBoard`, `CategoriesBoard`, `TodayBoard`, calendários e Sprint foram removidos. Ganham cor pela primeira vez: Kanban de fases do Hoje (colunas e cartão em arrasto), Feed do Instagram do Hoje e a lista Atrasadas da Home (`HomeLateView`; atrasada mantém o fundo vermelho). Já tinham cor e agora seguem a conta: Hoje em Parceiros/Categorias, página do parceiro, Sprint e calendários.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Mudança bem delimitada (um menu, uma tela de preferências, uma migração que copia o padrão do DS17); cobre o risco com custo baixo.
- **Codex — GPT-6 Luna.** Alternativa leve para a parte mecânica: remover o grupo do menu e repassar a preferência aos cartões, seguindo este ticket.
- **Claude Code — Opus 5.5.** Só se a decisão for manter o atalho no Hoje sincronizado com a conta ou se a leitura da preferência exigir mexer no carregamento inicial do app.
