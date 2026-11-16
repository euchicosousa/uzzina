# HOJE-01 — Nova visualização do Hoje por prioridade (Baixa, Média, Alta)

**Status.** Encerrado: aceito pelo proprietário em 16/11/2026. Implementado; migration `20261116130000_today_view_priority_timeline.sql` aplicada em produção em 16/11 com aprovação do proprietário; validado pelo proprietário. Ajustes do proprietário em 16/11: colunas com borda superior verde/amarela/vermelha (tokens `--priority-low/medium/high`) e destaque de soltar `bg-secondary/50` (constante `DROP_TARGET_HIGHLIGHT` em `DnD.tsx`, usada também no Kanban de fases). O proprietário subiu esse destaque de 20% para 50% em 16/11, depois de ver o efeito. Commit local, sem push.

**Independência.** Este ticket e o [HOJE-02](02-hour-view.md) (visualização por hora) são separados e um não depende do outro. Os dois acrescentam um botão ao mesmo seletor de visualização do Hoje, então são executados um de cada vez no checkout; o segundo só encaixa o botão dele ao lado.

## O que a pessoa vê hoje

No **Hoje** (bloco da Home e página Hoje), um seletor de quatro ícones troca a forma de ver as ações do dia: **Status das ações** (colunas por fase, o Kanban), **Categorias**, **Feed do Instagram** e **Parceiros**.

Não existe uma forma de ver o dia separado pelo nível de urgência.

## O que o proprietário pediu

Uma nova visualização que divide as ações do dia em três grupos: **baixa, média e alta**.

## O que o levantamento encontrou

- **A marcação existe.** Toda ação tem o campo **Prioridade**, com três valores: Baixa, Média e Alta. No app o nome é "Prioridade", não "urgência".
- **Como se muda hoje:** pelos atalhos de teclado com a ação em foco (`,` Baixa, `.` Média, `/` Alta) e pelo menu de ações em lote. A gaveta de ação não tem um campo de prioridade (a busca no código só achou a prioridade na tela de comparação de conflito).
- **Quase tudo está em Média.** No banco de produção, em 16/11: 7.336 ações em Média, 34 em Alta, 3 em Baixa e 16 com o texto "null" gravado no lugar da prioridade (dado antigo). Ou seja: no primeiro dia de uso, a nova visualização vai mostrar praticamente tudo na coluna Média. Ela passa a ser útil à medida que a prioridade for marcada, e arrastar entre colunas (abaixo) é o que torna isso rápido.
- **Já existe a peça pronta para isso.** A visualização "Status das ações" usa um mecanismo de arrastar cartões entre colunas que serve para qualquer campo. A visualização por prioridade pode reaproveitar o mesmo mecanismo e o mesmo desenho de colunas, trocando fase por prioridade.
- **Sem mudança no banco** para a visualização em si. A única parte que exigiria banco é oferecer "Prioridade" como **visualização inicial do Hoje** em Minha Conta, porque o banco só aceita os quatro valores atuais nessa preferência.

## Proposta

Três colunas lado a lado, no mesmo desenho do "Status das ações": **Baixa, Média, Alta** (da menos urgente para a mais). Cada coluna mostra o nome, a quantidade e os cartões das ações do dia. Arrastar um cartão para outra coluna muda a prioridade da ação, com a mesma confirmação e o mesmo tratamento de conflito que o Kanban já usa. No celular, as colunas se comportam como as do Kanban hoje.

Antes: seletor com quatro ícones. Depois: cinco ícones, o novo com a dica "Prioridade" (seis quando o HOJE-02 também estiver pronto).

## O que fazer

1. Acrescentar a visualização `priority` ao Hoje: tipo `TodayViewMode` e validação em `app/lib/preferences.ts`; rótulo, botão do seletor e a escolha do quadro em `app/components/features/home/TodayViewParts.tsx` (vale para a Home e para a página Hoje).
2. Criar o quadro de prioridade em `app/components/layout/`, reaproveitando `useKanbanDnd` (`app/hooks/useKanbanDnd.ts`) e a estrutura de colunas de `KanbanPhasesBoard.tsx`, com `fieldKey: "priority"`. Se a coluna do Kanban puder ser compartilhada sem deformar o componente atual, compartilhar; senão, manter separado e simples.
3. Ações com prioridade inválida (o "null" antigo) aparecem na coluna Média, sem alterar o dado sozinho.
4. Foco e teclado: seguir o que o Kanban já garante (regiões de rolagem não são parada de foco; atalhos `,` `.` `/` continuam funcionando no cartão).
5. Acrescentar "Prioridade" às opções de "Visualização inicial do Hoje" em `app/routes/app/profile.tsx`, mantendo "Parceiros" como padrão, e preparar a migration descrita em "Banco".
6. Atualizar `docs/contracts/pages-today-profile-planning.md`, `docs/contracts/database-and-deploy.md` (se houver migration) e `CURRENT.md`.

## Decisões fechadas em 16/11/2026

1. **Nome:** "Prioridade".
2. **Ordem das colunas:** Baixa → Média → Alta (corrigido pelo proprietário em 16/11).
3. **Arrastar entre colunas muda a prioridade,** como no Kanban das fases. É a forma de mudar a prioridade por enquanto.
4. **Sem campo de prioridade na gaveta agora.** O proprietário reconhece que o lugar natural seria a gaveta (a ação nasce como Média), mas isso fica para depois, fora deste ticket. Os atalhos e o menu em lote continuam como estão.
5. **Entra em "Visualização inicial do Hoje" em Minha Conta,** como opção. O padrão não muda: continua "Parceiros".
6. **Ícone:** bandeira (recomendação aceita junto com o restante; trocar é ajuste de uma linha).

### Banco: uma mudança só para as duas visualizações

O banco só aceita quatro valores em "Visualização inicial do Hoje". Para oferecer as novas, a função `update_my_preferences` precisa aceitar também `priority` e `timeline` (a do [HOJE-02](02-hour-view.md)). Para os dois tickets continuarem independentes e o banco ser alterado **uma vez só**:

- **este ticket é executado primeiro** (ordem decidida: HOJE-01, HOJE-03, HOJE-02), então é ele que prepara a migration já aceitando os **dois** valores novos (cópia fiel da função em produção, conferida antes, no padrão do DS19);
- o segundo ticket só acrescenta a opção dele na tela, sem tocar no banco.

Aceitar no banco um valor que a tela ainda não oferece não causa efeito: o app ignora valor desconhecido e usa "Parceiros". A migration só é aplicada em produção com o "sim" do proprietário; até lá a opção nova não salva em Minha Conta (a visualização em si funciona).

## Critérios de conclusão

- [x] Novo botão no seletor do Hoje, na Home e na página Hoje, com nome acessível e dica.
- [x] Três colunas com as ações do dia por prioridade, contagem por coluna, claro e escuro.
- [x] Arrastar entre colunas muda a prioridade (se aprovado), com desfazer em caso de falha.
- [x] Ações com prioridade inválida aparecem em Média.
- [x] "Prioridade" disponível em Minha Conta → Visualização inicial do Hoje; padrão continua "Parceiros".
- [x] Migration preparada aceitando `priority` e `timeline`, aplicada só com aprovação do proprietário.
- [x] Roteiro curto de validação. `bun run dev` usa o banco de produção: arrastar um cartão altera uma ação real; o executor só lê, e o teste de arrastar fica com o proprietário.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Visualização nova que reaproveita um mecanismo existente; escopo pequeno e bem delimitado.
- **Codex — GPT-6 Luna.** Alternativa leve: é em boa parte uma cópia adaptada do quadro de fases.
- **Claude Code — Opus 5.5.** Só se a decisão for compartilhar a coluna com o Kanban por meio de uma refatoração do quadro atual.
