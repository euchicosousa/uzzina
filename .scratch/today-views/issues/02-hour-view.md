# HOJE-02 — Nova visualização do Hoje "Linha do tempo" (o dia por hora, estilo Gantt)

**Status.** **Encerrado com aceite do proprietário em 16/11/2026; commitado (sem push).** Implementado localmente na `main` em 16/11/2026 (Etapas 1–5 concluídas, ainda sem commit), aguardando validação visual/interação final do proprietário em dev/produção e commit. Decisões ajustadas durante a execução em 16/11/2026 (ver seção "Decisões fechadas").

**Independência.** Este ticket e o [HOJE-01](01-priority-view.md) (visualização por prioridade) são separados e um não depende do outro. Os dois acrescentam um botão ao mesmo seletor de visualização do Hoje, então são executados um de cada vez no checkout.

## O que a pessoa vê hoje

No **Hoje**, as ações do dia aparecem em quadros (por fase, categoria, feed ou parceiro). Cada ação mostra a hora, mas não existe uma visão em que o dia aparece como uma **linha do tempo**, com cada ação ocupando o espaço da sua duração.

## O que o proprietário pediu

- Uma visualização **por hora**, como um gráfico de Gantt: cada ação posicionada na hora em que começa, com o comprimento do tempo que leva.
- **Focada na pessoa.** Quem é administrador pode ver a própria linha e a dos outros da agência.
- **Arrastar** a ação para mudar o horário, em passos de 5 ou 10 minutos (preferência inicial: 10).
- **Duas alças**, uma no começo e outra no fim, para puxar e mudar a duração. As alças só existem nessa visualização, sobre o cartão em formato de linha.
- **Sem checagem de conflito de horário.** Duas ações podem ocupar o mesmo período; o próprio usuário ajusta.

## O que o levantamento encontrou

- **A ação tem tudo o que a visualização precisa:** data com hora de início e uma duração em minutos (campo `time`).
- **O tamanho mínimo real é 5 minutos, não 10.** No banco de produção, em 16/11: 3.595 ações com 5 minutos, 2.792 com 10, 596 com 20, 232 com 30, 105 com 60 e poucas com 15, 45, 50, 90 e 120. O banco preenche 5 quando nada é informado; o app cria ações novas com 10.
- **Hoje não existe lugar no app para mudar a duração.** O campo é gravado na criação e nunca mais editado pela interface. A visualização por hora seria o primeiro lugar onde a duração é alterada. Por decisão do proprietário, continua assim: a gaveta não ganha campo de duração.
- **Os horários de início não estão alinhados.** Cerca de 60% das ações começam em minuto terminado em zero; o restante começa em qualquer minuto (14h07, 9h23). A ação aparece na posição real; o encaixe em passos só acontece quando alguém arrasta.
- **Ações muito curtas são o maior desafio de desenho.** Quase 9 em cada 10 ações duram 5 ou 10 minutos. Numa linha do tempo em que uma hora ocupa, por exemplo, 240 pontos de largura, uma ação de 10 minutos tem 40 pontos: não cabe o título dentro dela. O costume em gráficos desse tipo é a barra ter o tamanho real e o título continuar para fora, à direita. Isso precisa ser visto em prévia antes de implementar.
- **Sobreposição precisa ser exibida, mesmo sem checagem.** Sem bloquear nada, duas ações no mesmo horário têm de aparecer as duas; a proposta é empilhá-las em faixas dentro da linha da pessoa.
- **Uma ação pode ter vários responsáveis.** Ela aparece na linha de cada um; movê-la muda o horário da ação inteira, para todos.
- **Arrastar:** o app já usa a biblioteca dnd-kit (Kanban, calendário, reordenar arquivos). Ela resolve o arrastar do cartão com encaixe em passos. Para as alças de começo e fim, a biblioteca não tem um recurso pronto de redimensionar; o executor avalia usar alças arrastáveis da própria dnd-kit ou eventos de ponteiro simples, o que for menor e funcionar no toque.
- **Teclado e leitor de tela.** A regra do app exige alternativa por teclado para componente composto: com a ação em foco, setas movem um passo e uma combinação (por exemplo Shift + setas) muda a duração. Faz parte da entrega.
- **Salvar:** cada soltura grava a ação com a mesma proteção de conflito já usada no Kanban (se outra pessoa mudou a ação, o movimento não é aplicado por cima).
- **Sem mudança no banco** para a visualização em si. Oferecê-la como "Visualização inicial do Hoje" em Minha Conta exige banco (ver "Banco", abaixo).
- **Não existe duração padrão por categoria no app.** Toda ação nova nasce com 10 minutos, seja qual for a categoria, e trocar a categoria não mexe na duração. Os dados antigos mostram que isso já existiu em algum momento (Stories 5, Reels 20, Gravação 60, Design 30). Essa regra foi separada no [HOJE-03](03-category-default-duration.md), porque mexe na criação e na troca de categoria, fora do Hoje.
- **Celular.** Uma linha do tempo horizontal não cabe bem em tela estreita. A prévia precisa mostrar o comportamento (rolagem horizontal, ou linha do tempo vertical no celular).

## Proposta

- **Eixo do tempo na horizontal,** com as horas marcadas no topo e uma linha vertical indicando o "agora".
- **Uma linha por pessoa.** Quem não é administrador vê só a própria. O administrador vê todas, com a própria primeiro, e filtra por um seletor de responsáveis (o mesmo seletor de pessoas já usado no app, `UPeopleCombobox`), que começa com todos.
- **Cada ação é um cartão em formato de linha,** com a barra no tamanho da duração e o título continuando à direita quando a barra for curta. Clicar abre a gaveta, como em qualquer outro lugar.
- **Arrastar o cartão** muda o horário de início; **puxar a alça da esquerda** muda o início mantendo o fim; **puxar a alça da direita** muda o fim. Tudo em passos fixos, com o horário novo visível durante o gesto.
- **Passo de 5 minutos** e duração mínima de 5 minutos.
- **Faixa de horário exibida:** 8h às 22h (14 horas). Uma caixa de seleção "24 horas" mostra o dia inteiro; desmarcada, volta às 8h–22h. Nada além disso.
- **Arrastar não muda o dia:** a visualização mostra um dia; trocar a data continua pela gaveta ou pelo calendário.

## O que fazer

1. **Prévia primeiro:** uma página isolada ou um exemplo na `/ui` com dados fictícios, mostrando ações de 5, 10, 30 e 60 minutos, sobreposição, duas pessoas, claro e escuro, e a versão de celular. O proprietário aprova o desenho antes do passo 2.
2. Acrescentar a visualização `timeline` ao Hoje: tipo `TodayViewMode` e validação em `app/lib/preferences.ts`; rótulo, botão do seletor e escolha do quadro em `app/components/features/home/TodayViewParts.tsx` (Home e página Hoje).
3. Criar o quadro da linha do tempo em `app/components/layout/` e a variação do cartão em linha com as duas alças, ativa só nessa visualização (prop do `ActionItem` ou invólucro próprio, sem alterar o cartão nas outras telas).
4. Gravar início e duração com `useActionMutations` (`INTENT.update_action`, `expectedUpdatedAt`), com atualização otimista e desfazer em caso de falha, no padrão de `useKanbanDnd`.
5. Teclado, foco e nome acessível das alças; a área rolável não é parada de foco (regra de 03/11).
6. Acrescentar "Linha do tempo" às opções de "Visualização inicial do Hoje" em `app/routes/app/profile.tsx`, mantendo "Parceiros" como padrão, conferindo antes a regra descrita em "Banco".
7. Atualizar `docs/contracts/pages-today-profile-planning.md`, `docs/contracts/database-and-deploy.md` (se houver migration), a galeria `/ui` se nascer componente reutilizável e `CURRENT.md`.

## Etapas de execução (subdivisão para subagentes)

Cada etapa abaixo pode ser executada por um subagente por vez, em ordem, com validação entre elas:

### Etapa 1 — Prévia visual isolada (gate de aprovação)

- **Objetivo:** validar o desenho antes de mexer no Hoje real.
- **Escopo:** criar uma prévia isolada (na `/ui` ou rota de prévia) com dados fictícios mostrando:
  - Eixo horizontal 8h–22h, checkbox `"24 horas"` e linha vertical do `"agora"`.
  - Ações de 5, 10, 30 e 60 minutos (barra proporcional + título continuando para fora à direita nas curtas).
  - Sobreposição de ações no mesmo horário empilhadas em faixas dentro da linha da pessoa.
  - Duas pessoas, modos claro e escuro, e comportamento no celular.
- **Critério de passagem:** aprovação explícita do proprietário antes de iniciar a Etapa 2.

### Etapa 2 — Núcleo puro de cálculos e regras (sem UI)

- **Objetivo:** isolar a lógica de tempo, faixas e agrupamento, garantindo previsibilidade com testes unitários.
- **Escopo:**
  - Conversão horário ↔ posição/largura para as janelas 8h–22h e 24h.
  - Algoritmo de empilhamento em faixas (lanes) para ações sobrepostas.
  - Encaixe em passos de 5 minutos e duração mínima de 5 minutos (mover início, puxar alça esquerda mantendo fim, puxar alça direita mantendo início, sem trocar o dia).
  - Agrupamento por responsável (não-admin vê só a própria linha; admin vê todas com a própria primeiro e filtra por responsáveis; ação sem responsável cai na linha de quem criou).
  - Testes unitários focados desses helpers (`bun test`).
- **Critério de passagem:** helpers tipados sem `any` e suíte unitária verde.

### Etapa 3 — Integração no Hoje e Minha Conta (somente leitura + clique na gaveta)

- **Objetivo:** colocar a visualização real no app sem risco de alterações acidentais enquanto o layout estabiliza.
- **Escopo:**
  - Incluir `"timeline"` em `TodayViewMode` (`app/lib/preferences.ts`).
  - Adicionar botão e renderização em `app/components/features/home/TodayViewParts.tsx` (Home e Hoje).
  - Adicionar `"Linha do tempo"` em Minha Conta (`app/routes/app/profile.tsx`), mantendo `"Parceiros"` como padrão, após conferir se `20261116130000_today_view_priority_timeline.sql` já está ativa em produção.
  - Criar `TimelineBoard` em `app/components/layout/` com filtro `UPeopleCombobox`, checkbox `"24 horas"`, linha do `"agora"`, respeito à "Cor da fase" e sinal de concluído, área rolável fora da ordem de foco e clique abrindo a gaveta.
- **Critério de passagem:** visual idêntico ao aprovado na Etapa 1 com dados reais (somente leitura) e `tsc --noEmit` limpo.

### Etapa 4 — Arrastar, alças de duração, teclado e gravação concorrente

- **Objetivo:** habilitar edição direta de horário e duração na linha do tempo.
- **Escopo:**
  - Arrastar o cartão para mudar o horário de início (passo de 5 min), exibindo o novo horário durante o gesto.
  - Alça esquerda (muda início mantendo fim) e alça direita (muda fim/duração), mínimo de 5 min, funcionando com mouse e toque.
  - Navegação e edição por teclado (setas movem 1 passo; `Shift + setas` ajustam duração) e `aria-label` nas alças.
  - Gravação otimista com `useActionMutations` (`INTENT.update_action`, `expectedUpdatedAt`) e rollback em caso de conflito/erro (padrão `useKanbanDnd`).
- **Critério de passagem:** typecheck limpo + roteiro de validação manual para o proprietário testar em ações reais.

### Etapa 5 — Documentação e fechamento

- **Objetivo:** consolidar contratos e status do ticket.
- **Escopo:** atualizar `docs/contracts/pages-today-profile-planning.md`, galeria `/ui` (se aplicável) e `docs/audits/CURRENT.md`; conferência final de formatação e build.

## Decisões fechadas em 16/11/2026

1. **Passo do arrastar e duração mínima:** passo de 5 minutos; duração mínima exibida e editável de 10 minutos (ajustado na execução). Escala final de `6px/min`, eixo contínuo `00h–24h` (sem checkbox "24 horas") com rolagem automática inicial para a linha "Agora" no dia atual.
2. **Nome:** "Linha do tempo" (no código, `timeline`). "Agenda" foi recusado.
3. **Pessoas:** quem não é administrador vê só a própria linha; o administrador inicia com apenas o próprio usuário selecionado no `UPeopleCombobox` e pode incluir outros responsáveis (ajustado na execução).
   - **Ação sem responsável:** sem linha "Sem responsável"; a ação sem responsável aparece na linha de **quem a criou** (`user_id`). Impedir ação sem responsável na gaveta fica fora deste ticket.
4. **Barras e títulos:** barras com altura automática (`min-h-9`) e título em até 2 linhas (`line-clamp-2`, sem título externo para barras curtas).
5. **Ações concluídas e cor da fase:** aparecem normalmente, sem esmaecer, com o sinal de concluído que o cartão já tem. Em `VARIANT.timeline`, `ActionItem` força cor da fase (`vivid` quando a conta está em `vivid`, caso contrário `soft`; atrasadas mantêm o fundo de atraso).
6. **Duração só muda nesta visualização.** A gaveta não ganha campo de duração. A duração inicial vem da categoria ([HOJE-03](03-category-default-duration.md), executado antes deste).
7. **Entra em "Visualização inicial do Hoje" em Minha Conta,** como opção. O padrão não muda agora: continua "Parceiros". A visualização fica em teste.

### Contexto, fora do escopo

O proprietário quer que esta visualização se torne, no futuro, o Hoje principal: o "Hoje de ação", enquanto a de Parceiros é mais de planejamento. Há também a ideia de "dar o play no dia", com o tempo correndo sobre as ações. **Nada disso entra neste ticket;** serve só para o executor não fechar portas no desenho (por exemplo, a linha do "agora" já existe).

### Banco: uma mudança só para as duas visualizações

O [HOJE-01](01-priority-view.md) roda antes (ordem decidida: HOJE-01, HOJE-03, HOJE-02) e já prepara a migration de `update_my_preferences` aceitando `priority` e `timeline`. Este ticket só acrescenta a opção na tela; antes, confere em produção que a função aceita `timeline`. Se o HOJE-01 não tiver rodado, este ticket prepara a migration com os dois valores. A migration só é aplicada com o "sim" do proprietário.

Para ver antes de aprovar: a prévia do passo 1 é o que mostra a visualização; hoje não há nada parecido no app para comparar.

## Critérios de conclusão

- [x] Prévia aprovada pelo proprietário (`6px/min`, altura automática `min-h-9` + `line-clamp-2`, sem título externo).
- [x] Novo botão no seletor do Hoje, na Home e na página Hoje.
- [x] Linha do tempo com uma linha por pessoa e filtro de responsáveis (`UPeopleCombobox`, admin inicia com o próprio usuário); ação sem responsável na linha de quem criou.
- [x] Faixa contínua `00h–24h` com rolagem automática inicial para "Agora" no dia atual.
- [x] "Linha do tempo" disponível em Minha Conta → Visualização inicial do Hoje; padrão continua "Parceiros".
- [x] Banco aceitando `timeline` conferido (migration do HOJE-01 aplicada).
- [x] Arrastar e as duas alças funcionando no passo de 5 min (mínimo 10 min), com mouse, toque e teclado.
- [x] Sem checagem de conflito de horário; ações sobrepostas visíveis em faixas empilhadas.
- [x] Gravação com proteção de conflito (`expectedUpdatedAt`) e rollback em caso de falha.
- [ ] Validação visual/interação final do proprietário em dev/produção (`bun run dev` usa o banco de produção) e commit.

## Modelos sugeridos

- **Claude Code — Opus 5.5.** Componente novo com arrastar, redimensionar, teclado, sobreposição e gravação concorrente; é a parte mais complexa de interação do app.
- **Claude Code — Sonnet 5.5.** Bom para a prévia do passo 1 e, se o desenho aprovado for simples, para a implementação inteira com custo menor.
- **Codex — GPT-6.1 Sol.** Alternativa de mesmo porte para a implementação; conferir a disponibilidade no plano.
