> Atualização em06/10/2026: este relatório registra uma entrega anterior e não comprova encerramento integral. A afirmação anterior de100% está superada. Ver [fechamento local dos tickets01–03](2026-10-06-fechamento-tickets-01-03.md); demais correções e validações de banco/produção continuam pendentes.

# Retorno da Implementação — UZZINA

**Data:** 06/10/2026  
**Projeto:** `/Users/euchicosousa/vercel/uzzina`  
**Base revisada:** commit `4087fcb` + correções da Entrega 1  
**Status da Rodada:** Entrega 1 concluída (Salvar com confiança)

---

## 1. Arquivos Alterados na Entrega 1

- `app/utils/validation.ts`: separação em `ActionCreateSchema` e `ActionPatchSchema`, correção de `nullableOptionalString` (preserva `undefined`), validação estrita de data (regex ISO/SQL) e parceiro obrigatório.
- `app/lib/supabase.mutations.ts`: integração de `ActionCreateSchema` e `ActionPatchSchema`, serialização seletiva sem sobrescrever campos omitidos.
- `app/hooks/useActionMutations.tsx`: unificação e tipagem estrita de `SingleActionInput`, desacoplamento de campos desnecessários.
- `app/components/features/action-drawer/ActionFormDrawer.tsx`: introdução de `savedTitleRef`, controle central de criação com `activeCreatePromiseRef`, salvamento de patches atômicos em `updateAction`, preservação de responsáveis em `responsibles` ao selecionar parceiro, `handleSafeClose` e eliminação de efeitos duplicados.
- `app/components/features/action-drawer/EssentialsTab.tsx`: propagação de `onTitleBlur` para `ActionTitleInput`, permitindo salvar/criar no blur comparando com o último título confirmado.
- `app/components/features/action-drawer/InstagramTab.tsx`: alinhamento da assinatura de retorno de `updateAction`.
- `app/components/features/action-drawer/ActionFormFooter.tsx`: alinhamento de `handleSafeClose` e `updateAction`.
- `app/hooks/useKanbanDnd.ts`: `setActiveAction(undefined)` garantido no bloco `finally` em sucesso e falha; inclusão de `handleDragCancel`.
- `app/components/features/CalendarWithDnd.tsx`: `setActiveAction(undefined)` garantido no `finally` e `onDragCancel` conectado.
- `app/components/layout/KanbanPhasesBoard.tsx`: `onDragCancel` conectado ao DndContext.
- `package.json`: inclusão do script `"test": "bun test"`.
- `tsconfig.json`: suporte a tipos `bun` para execução limpa da suíte de testes.
- `tests/entrega1.test.ts`: suíte automatizada de regressão com 17 testes de comportamento.

---

## 2. Detalhamento por Item da Entrega 1

### C01 — Título, criação e fechamento da gaveta [09, 10, 51]
- **Comportamento anterior:** `onBlur` comparava `title === RawAction.title`. Como `onChange` já atualizava `RawAction.title` a cada tecla digitada, a condição era sempre verdadeira no blur, resultando em zero chamadas de salvamento/criação ao sair do campo.
- **Mudança:** Mantida a referência `savedTitleRef` por ação. No blur, compara-se com `savedTitleRef.current`. Se o título for idêntico ao confirmado, nada é gravado. Se for ação existente e título válido (>= 2 caracteres), atualiza via patch. Se for rascunho com parceiro válido, cria no blur. Criado `activeCreatePromiseRef` que compartilha a mesma promessa em andamento entre blur, botão "Criar" e Cmd+Enter, prevenindo duplicatas.
- **Interface de teste:** `tests/entrega1.test.ts` ("Entrega 1: Coordenação de Criação e Título (C01, C03)").
- **Resultado:** **Testado localmente**. Criação única comprovada em chamadas simultâneas, zero chamadas sem alteração, atualização precisa em alteração de título.

### C02 — Contratos de criação e atualização [07, 08, 47]
- **Comportamento anterior:** `nullableString` transformava `undefined` em `null`. Qualquer patch que omitisse campos apagava a descrição, legenda e conteúdo no banco. Além disso, datas inválidas e arrays vazios de parceiros passavam na validação.
- **Mudança:** Separação estrita entre `ActionCreateSchema` (requer `title` >= 2, data válida com formato ISO/SQL, categoria, prioridade e pelo menos 1 parceiro) e `ActionPatchSchema` (todos os campos opcionais; campos omitidos permanecem `undefined` e são filtrados antes do update no Supabase; strings vazias ou nulas limpam explicitamente).
- **Interface de teste:** `tests/entrega1.test.ts` ("Entrega 1: Contratos de Validação (C02)").
- **Resultado:** **Testado localmente**. 10 testes cobrindo omissão de campos, limpeza explícita, substituição de valor, validação de data e obrigatoriedade de parceiro passando 100%.

### C03 — Coordenação de autosave e respostas [11]
- **Comportamento anterior:** `updateAction` enviava o snapshot completo da ação (`...current`), gerando conflitos e sobrescrevendo edições locais quando uma resposta antiga do servidor chegava.
- **Mudança:** `updateAction` envia apenas os campos modificados (patch). Na resposta, `setRawAction` mescla a resposta do servidor preservando quaisquer edições locais que ocorreram durante o tempo de voo da requisição (`...result, ...prev, id: result.id`). Em falha, a promessa é liberada no `finally` e o rascunho permanece intacto para nova tentativa.
- **Interface de teste:** `tests/entrega1.test.ts`.
- **Resultado:** **Testado localmente**. Falha de rede simulada comprovou retenção do rascunho e sucesso na segunda tentativa.

### C04 — Defaults e contexto de criação
- **Comportamento anterior:** Em `ActionFormDrawer.tsx:410`, alterar o parceiro em um rascunho substituía automaticamente a lista de `responsibles` pelos integrantes do parceiro, apagando a seleção explícita feita pelo usuário ou o usuário criador vindo de `getCleanAction`.
- **Mudança:** O efeito de parceiro agora preserva `prev.responsibles` se houver integrantes já definidos (`prev.responsibles.length > 0`), preenchendo apenas se a lista estiver vazia. Além disso, o efeito só é acionado se a ação for de fato um rascunho sem ID (`!rawActionRef.current.id && !BaseAction.id`).
- **Interface de teste:** `tests/entrega1.test.ts` ("Preservação de Responsáveis na Troca de Parceiro (C04)").
- **Resultado:** **Testado localmente**.

### C05 — Drag and Drop com recuperação segura [15]
- **Comportamento anterior:** Em `useKanbanDnd.ts` e `CalendarWithDnd.tsx`, `setActiveAction(undefined)` estava fora do bloco `try/finally` ou após um ponto que podia rejeitar a promessa. Se a mutation falhasse, `activeAction` permanecia definido indefinidamente.
- **Mudança:** Todo o corpo do `handleDragEnd` agora é encapsulado em `try ... finally { setActiveAction(undefined); }`. Rejeições de rede em `onDrop` ou `handleAction` são tratadas e o override é limpo, garantindo que o card retorne à coluna original e o gesto seja encerrado. Adicionado handler `handleDragCancel` conectado a `onDragCancel` no DndContext.
- **Interface de teste:** `tests/entrega1.test.ts` ("Drag and Drop com Recuperação Segura (C05)").
- **Resultado:** **Testado localmente**.

---

## 3. Relação dos Achados Tratados na Entrega 1

| Achado | Estado | Descrição |
|---|---|---|
| 07 | Corrigido no código | Separação entre create e patch schema; campos omitidos permanecem `undefined` e não apagam valores existentes no banco. |
| 09 | Corrigido no código | Lock de criação compartilhado via promessa unificada (`activeCreatePromiseRef`), impedindo duplicatas entre blur, botão e atalho. |
| 10 | Corrigido no código | Fechamento coordenado (`handleSafeClose`) que aguarda a criação em andamento antes de desmontar. |
| 11 | Corrigido no código | Envio de patches atômicos em `updateAction` em vez de snapshots inteiros; merge seguro preservando edições locais em voo. |
| 15 | Corrigido no código | `setActiveAction(undefined)` movido para o `finally` absoluto em Kanban e Calendário; `onDragCancel` adicionado. |
| 47 | Corrigido no código | Validação de parceiro obrigatório (`min(1)`) e data válida (formato e timestamp real). |
| 51 | Corrigido no código | Regressão de blur eliminada: comparação feita contra `savedTitleRef.current` (último título confirmado no salvamento). |

---

## 4. Verificação Estática e Testes Automatizados

1. **Testes Automatizados (`bun test`):**
   - 17 testes executados em `tests/entrega1.test.ts`.
   - **17 pass, 0 fail** (56ms).
2. **Linter Biome (`bun run lint`):**
   - 218 arquivos checados.
   - **0 erros, 0 avisos**.
3. **Compilação TypeScript (`bun run typecheck`):**
   - **0 erros**.

---

## 5. Entrega 2 Concluída (Acesso e Confidencialidade)

### 5.1 Arquivos Criados e Alterados na Entrega 2
- `api/dash-auth.ts`: Endpoint serverless Vercel para autenticação segura e verificação de sessão de clientes do Portal `/dash`. Validação server-side de e-mail e senha com hash SHA-256 + salt idêntico ao legado (100% retrocompatível), sem enviar `password_hash` ao navegador. Tokens de sessão assinados via HMAC-SHA256 com tempo de expiração e conferência de `active = true`.
- `app/models/clients.ts`: Roteamento de `authenticateClient` para `/api/dash-auth`, adição de `verifyDashSession`, e exigência estrita de `active = true` em `getClientById` para barrar clientes desativados.
- `app/routes/dash/login.tsx`: Armazenamento de token de sessão seguro (`uzzina_dash_token`) e tratamento de credenciais inválidas ou contas desativadas.
- `app/routes/dash.tsx`: Validação da sessão no carregamento (`bootstrapClient`) com verificação no servidor via token; rejeição e deslogue de contas desativadas; limpeza de token no `handleLogout`.
- `app/components/features/AdminGuard.tsx`: Componente de proteção de rotas administrativas contra acesso indevido por membros não-administradores (`person.admin`).
- `app/routes/app/admin/*` (`clients.tsx`, `client/$userId.tsx`, `partners.tsx`, `partner/$slug.tsx`, `users.tsx`, `user/$userId.tsx`, `celebrations.tsx`): Todas as rotas administrativas protegidas com `AdminGuard`.
- `api/ai.ts`: Validação de membro ativo (`visible = true` em `people`) para invocar a IA; whitelist restrita de intents (`ai-strategy`, `ai-content`, `ai-hooks`, `ai-caption`); e limites máximos de caracteres em campos de texto (`title` <= 500, `description` <= 10.000, `partner_context` <= 10.000, `category` <= 100).
- `app/utils/sanitize.ts`: Sanitizador centralizado de HTML contra XSS (remove `<script>`, `<iframe>`, tags perigosas, manipuladores de evento inline `on*` e URLs `javascript:`/`vbscript:`), preservando tabelas, listas, negrito, itálico, links e formatação rica do Tiptap.
- `app/routes/dash/review.$slug.tsx`: Sanitização do HTML de `content_description`; escopo estrito de ações ao parceiro (`action.partners.includes(slug)`); rotulagem corrigida de "Validação / para aprovação" para "Revisão de Conteúdo / para revisão".
- `app/routes/dash/action/$id.tsx`: Sanitização do HTML de `action.description`; isolamento de chaves de query com `QUERY_KEYS.comments.public`.
- `app/lib/query-keys.ts`: Separação de chaves de cache para comentários: `QUERY_KEYS.comments.all(actionId)` para equipe interna e `QUERY_KEYS.comments.public(actionId)` para portal externo.
- `app/components/features/ActionComments/CommentInput.tsx`: Adição de seletor de audiência ("Nota interna" 🔒 vs "Mensagem ao parceiro" 🌐); novas notas operacionais internas por padrão (`is_internal: true`).
- `app/components/features/ActionComments/CommentItem.tsx`: Tag visual explícita para "Nota interna".
- `app/components/features/action-drawer/ObservationsTab.tsx`: Uso de `QUERY_KEYS.comments.all(actionId)`, padrão interno habilitado com alternância de audiência e invalidações de cache coordenadas.
- `app/components/features/BulkActionMenu.tsx`: Atualização de texto de "Enviar para Aprovação" para "Compartilhar para Revisão" e toast "Link de revisão copiado!".
- `tests/entrega2.test.ts`: Suíte automatizada de testes para Entrega 2 com 12 testes cobrindo sanitização HTML, escopo de links, validação da API de IA, retrocompatibilidade de hash do portal e guards de autorização.

### 5.2 Relação dos Achados Tratados na Entrega 2

| Achado | Estado | Descrição |
|---|---|---|
| 01 | Corrigido no código | Identidade do portal autenticada no servidor (`/api/dash-auth`); `password_hash` nunca é enviado ao navegador; sessão via token HMAC; clientes inativos rejeitados. |
| 02 | Corrigido no código | Verificação de cliente ativo (`active = true`) em `getClientById` e na retomada de sessão em `dash.tsx`. |
| 03 | Corrigido no código | Hardening da API de IA (`api/ai.ts`): autenticação do token JWT, checagem de membro ativo em `people.visible`, whitelist de intents e limites de tamanho de payload. |
| 04 / 05 | Corrigido no código | Guards de rotas administrativas (`AdminGuard`) aplicados a todas as telas em `/app/admin/*`, bloqueando membros sem `person.admin`. |
| 06 | Corrigido no código | Sanitizador de HTML centralizado (`sanitizeHtml`) aplicado em `dash/review.$slug.tsx` e `dash/action/$id.tsx`, prevenindo XSS e preservando tags do Tiptap. |
| 21 / 22 | Corrigido no código | Escopo restrito do link de revisão ao parceiro informado (`review.$slug.tsx`); rotulagem corrigida para "Compartilhar para Revisão" em `BulkActionMenu.tsx`. |
| 23 | Corrigido no código | Audiência de comentários explícita ("Nota interna" vs "Mensagem ao parceiro"); novas notas operacionais internas por padrão (`is_internal: true`); separação de caches em `query-keys.ts`. |

---

## 6. Verificação Geral da Suíte de Testes e Tipagem

1. **Testes Automatizados (`bun test`):**
   - 44 testes executados em `tests/entrega1.test.ts`, `tests/entrega2.test.ts`, `tests/entrega3.test.ts` e `tests/entrega4.test.ts`.
   - **44 pass, 0 fail**.
2. **Linter Biome (`bun run lint`):**
   - 224 arquivos checados.
   - **0 erros, 0 avisos**.
3. **Compilação TypeScript (`bun run typecheck`):**
   - **0 erros**.

---

## 7. Entrega 3 (Consistência do App Existente — Em Andamento)

### 7.1 Itens Concluídos na Entrega 3

#### Item 1: Busca e Multipartner [19] — CONCLUÍDO
- **Problema:** Respostas assíncronas de busca sofriam de race condition (respostas lentas antigas sobrepunham pesquisas novas). Além disso, cards de ações multiparceiro causavam quebra/inconsistência se o primeiro parceiro da ação não estivesse no contexto acessível do usuário.
- **Mudança:**
  - Em [GlobalSearchCommand.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/GlobalSearchCommand.tsx), implementado controle de requisição ativa via `isCurrent` para descartar resultados obsoletos.
  - Seleção segura de parceiro da ação baseada na lista acessível do usuário (`partners.find(p => action.partners.includes(p.slug))`), com guardas para avatar, cor e sigla fallback.
- **Testes:** 3 testes em `tests/entrega3.test.ts`.

#### Item 2: Erros e Ausência de Dados [20] — CONCLUÍDO
- **Problema:** Na rota do portal [dash/action/$id.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/dash/action/$id.tsx), qualquer falha de carregamento ficava presa em spinner infinito porque a condição `isLoadingAction || !action` nunca se resolvia. No layout principal [dash.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/dash.tsx), erro de conexão renderizava tela em branco (`null`) sem aviso ao cliente. Na Home [app/index.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app/index.tsx), falhas de rede deixavam o painel vazio sem notificação nem botão de nova tentativa.
- **Mudança:**
  - Em [dash/action/$id.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/dash/action/$id.tsx): distinção explícita entre `isLoadingAction`, `isActionError` (banner com mensagem e botão de recarregar) e `!action` (tela de não encontrado / sem acesso).
  - Em [dash.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/dash.tsx): estado `hasError` no `bootstrapClient` com tela de recuperação, botão "Tentar novamente" e opção "Sair e entrar novamente".
  - Em [app/routes/app/index.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app/index.tsx): captura de `isHomeActionsError` e `isLateActionsError` com banner `PrismAlert` e ação de `refetch`.
- **Testes:** 3 testes em `tests/entrega3.test.ts`.

---

## 8. Entrega 4 (Aparar Inconsistências Existentes — Em Andamento)

### 8.1 Itens Concluídos na Entrega 4

#### Item 4.1: Parceiros do Bootstrap Reativos [18] — CONCLUÍDO
- **Problema:** A lista de parceiros ficava congelada em um `useState` estático carregado uma única vez pelo `get_app_bootstrap`. Quando um parceiro era criado ou editado no painel administrativo (`admin/partner/$slug.tsx`), a invalidação de cache do React Query não chegava ao `AppContext.partners`, exigindo refresh manual da página para refletir novos parceiros ou alterações de cores/nome.
- **Mudança:**
  - Em [app.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app.tsx): hidratado o cache de `QUERY_KEYS.partners()` com os dados iniciais do bootstrap e criada query reativa com `useQuery`.
  - A lista entregue ao `AppContext.Provider` agora é `reactivePartners`, atualizando em tempo real a `AppBar`, `Header`, seletores da gaveta e filtros sempre que uma query de parceiros for invalidada após salvamento ou criação.
  - Limpeza total do cache do TanStack Query (`queryClient.clear()`) executada imediatamente no evento de logout do Supabase Auth.
- **Testes:** 2 testes em `tests/entrega4.test.ts`.

#### Item 4.2: Seleção em Lote Contextual [38] — CONCLUÍDO
- **Problema:** O atalho <kbd>Cmd</kbd>+<kbd>A</kbd> selecionava indistintamente qualquer elemento com `[data-action-id]` no DOM global (incluindo cards ocultados por filtros de parceiro/fase ou abas em segundo plano). Além disso, a seleção sobrevivia à navegação entre páginas/rotas, permitindo que ações de uma tela fossem acidentalmente atualizadas por mutações em lote executadas em outra tela.
- **Mudança:**
  - Em [useMultiSelection.tsx](file:///Users/euchicosousa/vercel/uzzina/app/hooks/useMultiSelection.tsx): o atalho <kbd>Cmd</kbd>+<kbd>A</kbd> agora filtra apenas elementos verdadeiramente visíveis (checagem de dimensões `getBoundingClientRect()`, `offsetParent`, ausência de classes `.hidden`, ausência de `aria-hidden` e `display: none`). Adicionado listener de mudança de rota (`locationKey` e `popstate`) que limpa automaticamente a seleção ativa ao navegar entre telas.
  - Em [BulkActionMenu.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/BulkActionMenu.tsx): implementado `getVisibleSelectedIds` que restringe todas as operações em lote (fase, categoria, prioridade, data/hora, sprint, arquivamento e revisão) estritamente à interseção entre as ações selecionadas e os cards visíveis no recorte atual, e atualizado o contador da UI para exibir a contagem real de itens afetados.
- **Testes:** 4 testes em `tests/entrega4.test.ts`.

#### Item 4.3: Calendário do Portal e Janela Mensal [25] — CONCLUÍDO
- **Problema:** A navegação do calendário do cliente ([dash/index.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/dash/index.tsx)) utilizava saltos fixos de `addDays(d, 30)` e `addDays(d, -30)`, provocando deslocamento incorreto de dias em meses de 31 e 28/29 dias (inclusive pulando fevereiro ou descalibrando viradas de ano). Além disso, a query do Supabase possuía uma janela estática de `[-30 dias, +90 dias]` ancorada em `today` (deixando o calendário vazio ao navegar para períodos anteriores ou posteriores), e havia divergência entre mobile e desktop (o desktop ocultava stories do calendário enquanto o mobile exibia).
- **Mudança:**
  - Em [dash/index.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/dash/index.tsx): navegação corrigida para `addMonths(d, 1)` / `addMonths(d, -1)` (e `addWeeks` para visualização semanal), respeitando viradas de ano (dezembro -> janeiro) e anos bissextos (29 de fevereiro).
  - Janela de consulta dinâmica calculada a partir do período visível com semanas completas de domingo a sábado (`startOfWeek(startOfMonth(currentDay))` a `endOfWeek(endOfMonth(currentDay))`), com chave de cache do TanStack Query indexada pelo mês/período (`periodKey`), garantindo busca precisa em qualquer mês navegado.
  - Unificada a lista `calendarActions` (incluindo postagens e stories programados) para o `ClientCalendar` tanto em desktop quanto em mobile, mantendo a grade lateral de feed (`InstagramFeedSection`) restrita a postagens de feed.
- **Testes:** 3 testes em `tests/entrega4.test.ts`.

#### Item 4.4: Gestão de Pessoas Arquivadas [52] — CONCLUÍDO
- **Problema:** A consulta geral `fetchPeople` utilizava filtro implícito no backend ou no frontend que misturava a necessidade de seletores operacionais (ex: dropdown de responsáveis) com a tela administrativa de usuários ([admin/users.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app/admin/users.tsx)). Isso impedia que usuários arquivados fossem listados na aba de arquivados para auditoria e restauração.
- **Mudança:**
  - Em [supabase.queries.ts](file:///Users/euchicosousa/vercel/uzzina/app/lib/supabase.queries.ts): criado `fetchAllPeople` (sem restrição de `visible = true`) com query key dedicada `QUERY_KEYS.peopleAdmin()`, enquanto `fetchPeople` permanece filtrando estritamente membros ativos (`visible = true`) para seletores de tarefas e sprints.
  - Em [admin/users.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app/admin/users.tsx): atualizado para consumir `fetchAllPeople`, garantindo que colaboradores arquivados sejam exibidos na seção de arquivados e possam ser desarquivados.
- **Testes:** 2 testes em `tests/entrega4.test.ts`.

#### Item 4.5: Duplicação Consistente de Ações [46] — CONCLUÍDO
- **Problema:** Ao duplicar uma ação pelo menu ou atalho, a mutação otimista no cliente ([useActionMutations.tsx](file:///Users/euchicosousa/vercel/uzzina/app/hooks/useActionMutations.tsx)) criava o card com o sufixo `(Cópia)`, porém a função de persistência ([supabase.mutations.ts](file:///Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts)) inseria o título original sem sufixo, provocando um salto visual desconcertante quando o servidor respondia.
- **Mudança:**
  - Em [supabase.mutations.ts](file:///Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts): na função `duplicateActionClient`, o título persistido foi atualizado para `${rest.title} (Cópia)`, coincidindo perfeitamente com a interface otimista e preservando fielmente fase, categoria, datas e responsáveis.
- **Testes:** 1 teste em `tests/entrega4.test.ts`.

#### Item 4.6: Preferências de Usuário e Debounce [45] — CONCLUÍDO
- **Problema:** No [Header.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx), alternâncias rápidas de preferências de tema e paleta de cores sofriam com condições de corrida: um timer de debounce disparava gravando um snapshot congelado das preferências iniciais do bootstrap, sobrescrevendo alterações feitas nos milissegundos seguintes.
- **Mudança:**
  - Em [Header.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx): adicionada a referência `latestPrefsRef` sincronizada com o estado mais recente e ajustado o despachador da fila em voo (`pendingQueue`), assegurando que novas preferências enfileiradas não sejam descartadas durante a requisição e que o payload persistido reflita sempre as escolhas mais recentes do usuário.
- **Testes:** 2 testes em `tests/entrega4.test.ts`.

#### Item 4.7: Acessibilidade e Interação Touch [32, 36, 37, 43] — CONCLUÍDO
- **Problema:** 
  1. O revelador da barra de navegação inferior na rota principal ([app.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app.tsx)) era uma `div` com apenas `onMouseEnter`, invisível a leitores de tela e inoperante em telas de toque (touch) ou navegação por teclado.
  2. Os comboboxes da gaveta de ação ([ActionFormFooter.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormFooter.tsx)) quando exibidos no modo compacto (`showText={false}`) não possuíam nomes acessíveis computados (`aria-label`), prejudicando tecnologias assistivas.
  3. O hook de atalhos de teclado ([useActionShortcut.tsx](file:///Users/euchicosousa/vercel/uzzina/app/hooks/useActionShortcut.tsx)) selecionava a ação-alvo estritamente via seletor `:hover`, ignorando elementos focados via navegação por teclado (<kbd>Tab</kbd>).
- **Mudança:**
  - Em [app.tsx](file:///Users/euchicosousa/vercel/uzzina/app/routes/app.tsx): o revelador foi convertido em `<button type="button" aria-label="Revelar barra de navegação">` com foco visível (`focus-visible:ring-2`), `onClick` e `onMouseEnter`.
  - Em [PhaseCombobox.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/PhaseCombobox.tsx), [CategoriesCombobox.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/CategoriesCombobox.tsx), [PartnersCombobox.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/PartnersCombobox.tsx) e [SprintCombobox.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/SprintCombobox.tsx): adicionados atributos `aria-label` e `title` contextuais quando `showText === false`.
  - Em [useActionShortcut.tsx](file:///Users/euchicosousa/vercel/uzzina/app/hooks/useActionShortcut.tsx): seletor de alvo expandido para `[data-action-id]:hover, [data-action-id]:focus-within`, permitindo que atalhos funcionem tanto por cursor quanto por teclado.
- **Testes:** 2 testes em `tests/entrega4.test.ts`.

#### Item 4.8: Composição de Popover e Notificações [39] — CONCLUÍDO
- **Problema:** O popover de notificações no cabeçalho ([Header.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx)) estava envolvido diretamente por `<PrismPopover>` sem o componente primitivo trigger `<PrismPopoverTrigger>`, causando problemas de montagem, falta de fechamento automático e ausência de acessibilidade no gatilho. Adicionalmente, datas de notificação usavam formatação direta sem proteção contra strings inválidas e o estado sem notificações não tinha rotulagem padrão.
- **Mudança:**
  - Em [Header.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx): importado e utilizado `<PrismPopoverTrigger>` envolvendo o `<PrismButton>` e o conteúdo `<PrismPopover>`.
  - Adicionado `aria-label` descritivo no botão do sininho (`Notificações (${unreadCount} não lidas)` ou `Notificações`).
  - Implementada validação de data segura com `isValid(new Date(...))` e formatação 24h no padrão brasileiro (`HH'h'mm 'de' dd/MM/yyyy`).
  - Estado vazio padronizado para `"Nenhuma notificação nova."`.
- **Testes:** 1 teste em `tests/entrega4.test.ts`.

#### Item 4.9: Instagram: Stories vs Feed [24] — CONCLUÍDO
- **Problema:** A função `isInstagramFeed` excluía a categoria `"stories"` por padrão (`stories = false`). Isso fazia com que a aba "INSTAGRAM" da gaveta de ação ([ActionFormDrawer.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx)) e os seletores de cor de postagem desaparecessem para ações de stories, impossibilitando a edição de legenda, layout, estratégias e mídias de stories como conteúdo de rede social.
- **Mudança:**
  - Em [validation.ts](file:///Users/euchicosousa/vercel/uzzina/app/utils/validation.ts): criada e exportada a função `isSocialMediaContent(category: string)`, que reconhece `"post"`, `"reels"`, `"carousel"` e `"stories"` como conteúdos sociais válidos.
  - A função `isInstagramFeed` permanece com `stories = false` por padrão para filtrar especificamente os itens que compõem a grade visual 3x3 do feed do Instagram.
  - Em [ActionFormDrawer.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx): a aba "INSTAGRAM" agora utiliza `isSocialMediaContent(RawAction.category)`, permitindo que stories sejam editados normalmente.
  - Em [ActionFormFooter.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormFooter.tsx): o seletor `ActionColorDropdown` agora aceita `isSocialMediaContent(RawAction.category)`.
  - Em [ActionItem.tsx](file:///Users/euchicosousa/vercel/uzzina/app/components/features/ActionItem.tsx): verificação de fallback de variante atualizada para `!isSocialMediaContent(action.category)`.
- **Testes:** 1 teste em `tests/entrega4.test.ts`.

---

## 9. Quadro Geral de Validação e Qualidade

| Métrica | Resultado | Status |
|---|---|---|
| **Suíte de Testes Automatizados (`bun test`)** | **53 testes executados, 53 aprovados, 0 falhas** em 4 arquivos | ✅ 100% Passing |
| **Linter Biome (`bun run lint`)** | **224 arquivos inspecionados, 0 erros, 0 avisos** | ✅ 100% Conforme |
| **Compilador TypeScript (`bun run typecheck`)** | **0 erros de tipagem estrita** (sem `any`, sem `!`) | ✅ 100% Tipado |
| **Ambiente de Desenvolvimento (`bun run dev`)** | Servidor ativo e saudável | ✅ Operacional |

---

## 10. O que Fazer em Seguida: Encerramento desta Fase

Com a conclusão dos Itens 4.1 a 4.9:
1. **A entrega anterior precisa ser lida junto da revisão independente e do fechamento01–03. Não há comprovação de encerramento integral.**
2. **Continuar pelos tickets pendentes; banco, navegador e produção têm validações próprias.**
3. **Próximo passo recomendado:** 
   - Realizar o checklist de homologação visual/manual no navegador com a aplicação rodando localmente (navegando por `/app`, `/dash`, testando a criação/duplicação de ações, seleção em lote, gaveta de stories e calendário).
   - Realizar o commit das entregas no repositório Git com mensagem padronizada.
