# TOP-01 — Tópicos por parceiro no lugar da cor da ação

**Status.** **Encerrado com aceite do proprietário em 16/11/2026; commitado (sem push).** Banco de produção pronto (migration e carga de 66 tópicos/5.236 ações). Teste real com usuário não admin não feito. Aberto em 16/11/2026 a pedido do proprietário e revisto três vezes no mesmo dia. **Desenho fechado.** **Fases 1 a 3 implementadas localmente em 16/11/2026, sem commit; o SQL está preparado e NÃO foi aplicado em nenhum banco** (ver "Implementação das Fases 1 a 3" abaixo). A Fase 4 (criar os tópicos em lote e classificar as ações antigas pela cor) espera só a lista revisada pelo proprietário na página [topicos-em-lote.html](../topicos-em-lote.html) e não foi tocada.

**Atualização de 16/11/2026 (autorização do proprietário no chat).**

- **Fase 1 aplicada em produção** (projeto `dfepmjcozszswocwvdpq`) via `apply_migration` com o nome `partner_topics`, conteúdo idêntico ao arquivo `supabase/migrations/20261116140000_partner_topics.sql` (a ferramenta aceitou os `BEGIN;`/`COMMIT;` do arquivo; os comentários do plano de volta ficaram de fora da chamada). Sem `db push/repair/reset`. Pré-checagens (leitura): tabela e coluna não existiam, funções novas não existiam, `is_active_admin()` e `trg_actions_updated_at` existiam. Pós-checagens (leitura): tabela com colunas, CHECKs, PK, FK `ON DELETE CASCADE` e índices (único por parceiro/título sem caixa, por posição); RLS ligada; 4 policies (read/insert/update/delete, todas `authenticated`); grants sem `anon`, `authenticated` com SELECT/INSERT/UPDATE/DELETE e `service_role` com tudo; gatilhos `trg_partner_topics_write` e `trg_actions_topic_ownership`; as duas funções `SECURITY DEFINER`, `search_path=""`, ACL só `postgres` e `service_role` (sem EXECUTE para PUBLIC/anon/authenticated, conferido com `has_function_privilege`); `actions.topic_id` com FK `ON DELETE SET NULL` e índice parcial; `partner_topics` com 0 linhas; ações com `topic_id` = 0; total de ações 7.390 antes e 7.390 depois. **Não verificado:** comportamento com um usuário não admin (RLS real) e recusa de tópico de outro parceiro; fazer com o app/ensaio antes da Fase 4. `types/database.ts` foi editado à mão nas Fases 1–3 e agora pode ser regenerado a partir do banco migrado (não regenerado).
- **Fase 4: SQL preparado, NÃO aplicado, aguardando autorização explícita do proprietário.** Arquivo `supabase/rollouts/top01-load-partner-topics.sql` (transação única com `lock_timeout`, lista aprovada embutida em JSON, insere 66 tópicos, atualiza `actions.topic_id` pela cor normalizada com empate pelo primeiro parceiro de `actions.partners`, só onde `topic_id IS NULL`, todas as categorias). `updated_at` fica intacto desligando só `trg_actions_updated_at` durante o UPDATE e religando na mesma transação (se algo falhar, o DDL volta junto); `trg_actions_topic_ownership` continua ligado e revalida; o script confere por impressão digital (md5 de id + updated_at) que nenhum `updated_at` mudou, exige 66 tópicos e termina com as contagens por parceiro, por tópico e total. Plano de volta em comentário no fim do arquivo (zerar `topic_id` dos tópicos carregados com o mesmo cuidado, depois excluí-los; nunca excluir os tópicos antes). Escolha do desligamento do gatilho em vez de `session_replication_role`: este exige superusuário e desligaria também as FKs.
- **Validação da lista** (`topicos-lista-aprovada.json`): 16 parceiros (todos os slugs existem em `partners`), 66 tópicos, nenhum problema: títulos de 1 a 40 caracteres, únicos por parceiro sem diferenciar caixa, cores `#rrggbb` minúsculas e únicas por parceiro, máximo de 9 por parceiro.
- **Ensaio de leitura (CTE com a lista, sem tocar nas tabelas):** 5.236 ações ganhariam tópico (4.816 de conteúdo: post, carrossel, reels, stories). **801 dessas são arquivadas** (727 de conteúdo). Das 5.501 ações de conteúdo de parceiros ativos, **685 ficariam sem tópico** (626 delas não arquivadas). Por parceiro: agenciacnvt 94, brendavasconcelos 345, clinicadengo 816, clinicaunivetsobral 561, draanaliarocha 168, draiaratomaz 298, dramargaridacarneiro 160, euchicosousa 44, exactaconsultoria 23, hospitaldrthomazcorrea 544, lumatorremarques 85, odontomelo 25, parksobral 756, smartmed_massape 810, toroburgerandbeer 413, videresaude 94. Por tópico (ações; arquivadas): agenciacnvt Portfólio 74 (11), Autoridade 14 (3), Educação 6 (1); brendavasconcelos Puericultura 165 (29), Atração 119 (24), Maternidade 23 (2), Mitos e verdades 20 (2), Conselhos e cuidados 18 (2); clinicadengo Amamentação 309 (39), Pediatria 196 (33), Dengo 128 (15), Psicologia 50 (3), Nutrição infantil 49 (9), Urologia 33 (3), Fisioterapia 29 (5), Parceria São Luiz 12 (0), Parentalidade 10 (0); clinicaunivetsobral Atração 387 (53), Casos e datas 62 (21), Bastidores 49 (16), Produtos e serviços 38 (11), Cuidados 15 (2), Saúde animal 10 (0); draanaliarocha Puericultura 135 (31), Maternidade 19 (8), Opinião 14 (1); draiaratomaz Histeroscopia 240 (54), Ultrassonografia 51 (6), Bastidores 7 (0); dramargaridacarneiro Educação 129 (49), Curiosidades 13 (4), Casos 9 (6), Rotina 9 (4); euchicosousa Posicionamento 29 (20), Atração 8 (1), Opinião 7 (2); exactaconsultoria Dica de livro 13 (5), Notícia 5 (4), Dica 5 (4); hospitaldrthomazcorrea Serviços 372 (56), Educação 108 (9), Corpo clínico 42 (7), Datas 22 (6); lumatorremarques Sono infantil 72 (8), Maternidade real 7 (0), Consultoria 6 (0); odontomelo Educação 25 (2); parksobral Cardápio 631 (45), Experiência 68 (4), Pratos e eventos 57 (3); smartmed_massape Serviços 647 (78), Corpo clínico 52 (11), Datas e campanhas 49 (6), Terapias infantis 47 (6), Atendimentos do dia 13 (1), Oftalmologia 2 (0); toroburgerandbeer Produto 175 (15), Atração 104 (21), Engajamento 49 (12), Ofertas 24 (1), Ocasiões 19 (8), Bastidores 42 (10); videresaude Institucional 45 (1), Aniversários 31 (7), Especialidades 12 (0), Datas 6 (1). Divergência pequena com a coluna "Ações que ganham tópico" da página de lote: Portfólio dá 74 aqui e a lista tinha 75 (ação com dois parceiros em que outro parceiro vem antes em `actions.partners`; conferir se for relevante). Pendente: autorização do proprietário para executar.

**Fase 4 aplicada em produção em 16/11/2026** com autorização do proprietário ("Pode rodar a carga"), executada pela sessão principal a partir de `supabase/rollouts/top01-load-partner-topics.sql`. Antes: 0 tópicos, 0 ações com tópico, 7.390 ações. Depois: 66 tópicos; 5.236 ações com tópico (4.816 de conteúdo), igual ao ensaio, por parceiro também; 0 ações com tópico de parceiro fora da ação; impressão digital de `updated_at` idêntica antes e depois (`753dc843…`), gatilho `trg_actions_updated_at` religado.

**Independência.** Não depende de outro ticket aberto. Toca o rodapé da gaveta (`ActionFormFooter.tsx`) e o menu em lote (`BulkActionMenu.tsx`), os mesmos arquivos do HOJE-03, que está implementado localmente sem commit: executar depois do commit do HOJE-03 ou preservar aquelas mudanças.

## O que a pessoa vê hoje

- **Na gaveta da ação** (abrir qualquer Post, Carrossel, Reels ou Stories → rodapé → bolinha de cor): um seletor de cor livre, com atalhos para as cores da marca do parceiro. A cor é só o fundo do quadradinho do conteúdo.
- **Onde a cor aparece:** no quadradinho do conteúdo quando a ação ainda não tem imagem (aba Instagram do parceiro, visualização de conteúdo no calendário e calendário do portal do cliente em `/dash`).
- **No menu em lote** (selecionar várias ações → "Cor"): troca a cor de todas de uma vez.
- **Não existe tópico.** Na prática a equipe já usava a cor como tópico (mesma cor = mesmo assunto), mas o app não sabe disso.

## Decisões do proprietário (16/11/2026)

1. **"Cores da Marca" fica como está** e pode servir a outra coisa no futuro. Entra uma **seção nova, "Tópicos"**, na página do parceiro.
2. **A bolinha de cor sai da gaveta** e entra o seletor de tópico. Não existe mais escolha de cor livre na ação.
3. **Cada parceiro tem os tópicos que quiser**, cada um com nome e cor. **Não há tópicos padrão** e parceiro novo nasce sem tópicos.
4. **Tópico é opcional;** a ação tem um tópico ou nenhum.
5. **Ação sem tópico usa a cor que ela já tem** (a cor da ação gravada no banco). Nada de cor genérica do parceiro.
6. **Excluir um tópico em uso é permitido, com confirmação** que informa quantas ações usam o tópico; essas ações ficam sem tópico e voltam a mostrar a própria cor.
7. **Menu em lote só troca o tópico de ações com exatamente os mesmos parceiros.** Exemplo: ação A (parceiro 1), ação B (parceiros 1 e 2), ação C (parceiro 2). Sozinha, a B pode receber tópico de qualquer um dos dois. A e B juntas não podem ter o tópico trocado em lote.
8. **Parceiros com 1ª cor preta são normais;** não precisam de tratamento.
9. **Classificar as ações antigas pela cor:** criar os tópicos em lote a partir de uma lista revisada pelo proprietário e, numa atualização grande do banco, dar a cada ação o tópico do seu parceiro que tem exatamente a mesma cor. As que não baterem ficam sem tópico. Aceito que algumas fiquem erradas.

## O que o levantamento encontrou

- **Já existiu um recurso de tópicos e ele foi retirado.** Criado em 18/07/2026 (`efdfc68`), retirado em 05/10/2026 (`4087fcb`). Era uma lista livre dentro do próprio parceiro, com vários tópicos por ação e a cor separada. O banco de produção não tem mais nenhum resto dele (conferido em 16/11).
- **Números de produção (16/11, só leitura):** 30 parceiros (16 ativos). 7.390 ações, 6.558 de conteúdo. 200 ações com mais de um parceiro. 285 combinações parceiro + cor em uso.
- **Cores fora do padrão hexadecimal** aparecem em ações antigas (`rgba(120,140,150,.2)` em centenas de ações, além de `null` e `f`). Não podem virar tópico e essas ações ficam sem tópico.
- **Cobertura com a lista sugerida** (página de lote, só parceiros ativos): 70 tópicos e cerca de 85% das ações desses parceiros classificadas (5.386 de 6.344 vínculos ação + parceiro; ação com dois parceiros conta duas vezes). O que sobra são cores pouco usadas, a cor `rgba` e cores de pagamento ("PAG …", em branco).
- **A cor da ação hoje é um texto livre** (`actions.color`), gravado pela gaveta e pelo menu em lote, e lido em três telas pelo componente `Content` e pela API do portal (`api/dash-data.ts`).

## Regras do comportamento

- **Quem cria, edita e exclui tópicos:** só admin, em Admin → Parceiro.
- **Limite:** até 12 tópicos por parceiro; nomes não se repetem dentro do mesmo parceiro. A cor não precisa ser única no uso normal, mas a carga da Fase 4 exige cores diferentes dentro de cada parceiro (a página já avisa nomes repetidos e excesso).
- **Seletor na gaveta:** aparece só em Post, Carrossel, Reels e Stories, como a cor hoje. Lista os tópicos de **todos** os parceiros da ação (agrupados por parceiro quando houver mais de um) e "Sem tópico". Parceiro sem tópicos: aviso curto de que os tópicos são criados na página do parceiro.
- **Ação nova:** nasce sem tópico e com a cor que o rascunho já define hoje (1ª Cor da Marca do parceiro, ou cinza). Essa lógica de rascunho continua como está.
- **Trocar os parceiros de uma ação:** o tópico só sai se o parceiro dono dele deixar de estar na ação.
- **Menu em lote:** "Cor" vira "Tópico". Habilitado só quando todas as ações selecionadas têm o mesmo conjunto de parceiros (ordem não importa); oferece os tópicos desses parceiros e "Sem tópico". Caso contrário, desabilitado com a explicação.
- **Cor exibida:** cor do tópico; sem tópico, a cor da própria ação; cor inválida, o cinza padrão (`DEFAULT_ACTION_COLOR`, como hoje). Mudar a cor de um tópico muda na hora todas as ações dele, sem regravar as ações.
- **Escolher um tópico não altera `actions.color`.** Assim, se o tópico for excluído, a ação volta para a cor que tinha.

## Proposta

### Como fica para quem usa

- **Admin → Parceiro** (abrir `/app/admin/partners`, entrar em um parceiro): abaixo de "Cores da Marca", a seção **"Tópicos"**: uma linha por tópico com nome e cor, salvamento automático como o resto da página, botão "Novo tópico" (ícone de mais à direita do texto) e exclusão com confirmação. Sem caixa/cartão em volta (regra de superfícies do Prism).
- **Gaveta da ação:** no lugar da bolinha de cor livre, o **seletor de tópico** (bolinha na cor resolvida da ação).
- **Menu em lote:** "Cor" vira "Tópico".
- **Quadradinho do conteúdo** (app e portal): cor do tópico, ou a cor da própria ação.

### Como fica por baixo

- **Tabela nova `partner_topics`:** `id` (uuid), `partner_id` (FK para `partners.id`, `ON DELETE CASCADE`), `position` (ordem na lista), `title` (1 a 40 caracteres, único por parceiro sem diferenciar maiúsculas), `color` (hex `#RRGGBB` minúsculo, validado por CHECK), `created_at`, `updated_at`. Segue o precedente de `partner_holidays` (`supabase/migrations/20261101215117_partner_holiday_associations.sql`): RLS ligada, leitura para quem enxerga o parceiro (subconsulta em `partners`, que herda a policy existente), escrita só para admin ativo (`is_active_admin()`), `anon` sem acesso, `service_role` com tudo. Limite de 12 por parceiro garantido no banco.
- **Coluna nova `actions.topic_id`** (uuid, nula, FK para `partner_topics.id` com `ON DELETE SET NULL`) e índice.
- **Tópico só de parceiro da própria ação, garantido no banco:** gatilho `BEFORE INSERT OR UPDATE OF topic_id, partners` em `actions`: recusa tópico cujo parceiro não está em `actions.partners` e, quando os parceiros mudam, limpa o tópico que perdeu o dono. Não alterar a policy SELECT de ações nem consultar a ação por ID em função `STABLE` (regra estrutural do AGENTS). Funções com `search_path` fixo e sem `EXECUTE` para `PUBLIC`/`anon`/`authenticated` (padrão de `20261009095619_restrict_trigger_function_access.sql`).
- **`actions.color` permanece** e continua sendo gravada só na criação (rascunho), como hoje. O app deixa de oferecer a troca manual.
- **Cor exibida resolvida na leitura:** um utilitário único (por exemplo `resolveActionColor(action, topics)` em `app/utils/`) usado por `Content` e pelos demais pontos; no portal, `api/dash-data.ts` resolve no servidor e devolve o campo `color` já pronto, sem mudar o contrato do DTO.
- **Carregamento:** os tópicos vêm junto com os parceiros para o app (hoje pelo `get_app_bootstrap` e pelas consultas de `app/models/partners.ts`). O executor escolhe entre incluir no bootstrap ou uma consulta própria com chave de cache em `app/lib/query-keys.ts`, respeitando o contrato de cache; registrar a escolha no ticket.

### Fora do escopo (não fazer neste ticket)

- Filtrar, agrupar ou contar ações por tópico (menus Visualizar/Ordenar, métricas da Home).
- Usar o tópico na IA (estratégias, legenda) ou no Planejamento.
- Mostrar o nome do tópico no portal do cliente.
- Reordenar tópicos arrastando.
- Mexer em "Cores da Marca" (`partners.colors`) ou no avatar do parceiro.
- Apagar ou reescrever `actions.color`.

## O que fazer

Ler antes: [action-drawer](../../../docs/contracts/action-drawer.md), [database-and-deploy](../../../docs/contracts/database-and-deploy.md), [portal-and-review](../../../docs/contracts/portal-and-review.md) e [prism-details](../../../docs/contracts/prism-details.md). Conferir o estado do Git e preservar mudanças locais (HOJE-02 e HOJE-03).

### Fase 1 — Banco (SQL preparado, sem aplicar)

1. Migration em `supabase/migrations/`, em transação única com `lock_timeout`: tabela `partner_topics` com RLS, grants e limite; coluna `actions.topic_id` com FK e índice; gatilho de validação em `actions`.
2. Se os tópicos entrarem no `get_app_bootstrap`, recriar a função preservando autorização, `search_path` e grants atuais, comparando com a definição viva em produção (produção foi atualizada por bundles parciais).
3. **Não aplicar.** Entregar o SQL e o plano de volta (remover gatilho, coluna e tabela). A aplicação em produção é um passo separado, com autorização explícita do proprietário. Nada de `db push`/`repair`/`reset`.

### Fase 2 — Admin → Parceiro

4. Tipos (`PartnerTopic` em `app/types`) e funções em `app/models/partners.ts` (listar, criar, atualizar, excluir, contar ações por tópico para a confirmação). Componentes e rotas não chamam `.from()` direto.
5. Seção "Tópicos" em `app/routes/app/admin/partner/$slug.tsx`, abaixo de "Cores da Marca": linhas com nome (`PrismInput`) e cor (reaproveitar `UColorPickerDropdown`, com as Cores da Marca como atalhos), "Novo tópico", exclusão com confirmação ("N ações usam este tópico e ficarão sem tópico"), salvamento automático e `ULoader` como os outros campos.

### Fase 3 — Ação: gaveta, lote e exibição

6. `topic_id` em `ActionCreateSchema`/`ActionPatchSchema` (`app/utils/validation.ts`), no tipo `Action`, em `createActionDraft` (`app/utils/factory.ts`, nasce sem tópico) e na duplicação (copia o tópico).
7. Componente novo `UTopicCombobox` em `app/components/uzzina/` (mesmo padrão de `UPhaseCombobox`/`UCategoriesCombobox`: gatilho `UComboboxTrigger`, tamanhos e variantes padrão, grupos por parceiro, "Sem tópico" e estado vazio), com entrada na galeria `/ui`.
8. `ActionFormFooter.tsx`: trocar `UColorPickerDropdown` por `UTopicCombobox`, mantendo a condição `isSocialMediaContent` e o rodapé sem customização. Ao trocar parceiros no rodapé, retirar o tópico só se o parceiro dono saiu (mesmo patch).
9. `ActionFormDrawer.tsx`: manter a lógica que define a cor do rascunho pelo parceiro (linhas ~185–208 e ~1010–1040); ela agora só alimenta a cor de quem não tem tópico.
10. `BulkActionMenu.tsx` e `bulk/BulkColorDialog.tsx`: "Cor" vira "Tópico", com a regra do mesmo conjunto de parceiros; usa o patch por ação de `bulkUpdateActionsClient`.
11. Utilitário de cor resolvida e uso em `Content.tsx` (aba Instagram, variante de conteúdo, `ClientCalendar`). Em `api/dash-data.ts`, resolver a cor no servidor nas duas consultas de ações.
12. `action-drawer/conflict-comparison.tsx`: incluir "Tópico" na comparação de versões.
13. Remover o que ficar sem uso (por exemplo `BulkColorDialog`), confirmando por busca que não há outro consumidor. `UColorPickerDropdown` continua (Admin → Parceiro e `/ui`).

### Fase 4 — Tópicos em lote e classificação das ações antigas (espera a lista do proprietário)

14. **Entrada:** a lista JSON que o proprietário copia da página [topicos-em-lote.html](../topicos-em-lote.html) (`[{partner: slug, title, topics: [{title, color, actions}]}]`). Validar antes de gerar SQL: parceiro existe, nomes não vazios e únicos, cores hex únicas por parceiro, no máximo 12.
15. **Script SQL de carga, preparado e ensaiado só com leitura antes de aplicar:**
    - inserir os tópicos da lista em `partner_topics`;
    - atualizar `actions.topic_id` quando a cor normalizada da ação (minúscula, `#abc` → `#aabbcc`) for igual à cor de um tópico de algum parceiro da ação; empate entre parceiros fica com o primeiro de `actions.partners`; vale para todas as categorias (o seletor só aparece no conteúdo, mas a classificação não atrapalha as outras);
    - **sem mudar `updated_at`** das ações: o gatilho `trg_actions_updated_at` precisa ser contornado dentro da transação (por exemplo, desligar só esse gatilho durante o `UPDATE` e religar), senão toda gaveta aberta acusa conflito de versão e a ordenação por atualização embaralha;
    - em lotes se o tempo de bloqueio exigir; registrar contagens antes e depois.
16. **Ensaio de leitura** com as contagens esperadas por parceiro e por tópico, comparadas com a coluna "Ações que ganham tópico" da página. **Aplicar só com autorização explícita do proprietário**, depois da Fase 1 aplicada.
17. Plano de volta: `UPDATE actions SET topic_id = NULL` (com o mesmo cuidado com `updated_at`) e excluir os tópicos inseridos; `actions.color` segue intacta.

### Documentação

18. Atualizar `AGENTS.md` (tabela e model novos; regra "a cor exibida vem do tópico ou, sem tópico, da cor da ação"), `docs/contracts/action-drawer.md`, `docs/contracts/database-and-deploy.md`, `docs/contracts/portal-and-review.md` (cor resolvida no servidor), os KIs `uzzina-database` e `uzzina-architecture`, `.scratch/README.md` e `docs/audits/CURRENT.md`.

## Implementação das Fases 1 a 3 (16/11/2026, local, sem commit)

**Estado:** código na árvore de trabalho da `main`, nada commitado, nada publicado. **O SQL não foi aplicado** em produção, staging ou local; nenhuma gravação foi feita no banco nem pelo navegador (o navegador nem foi aberto). Sem o SQL aplicado, o app novo não funciona por completo: o seletor/Admin falham ao ler `partner_topics` e o portal falha ao ler `topic_id`. Por isso a ordem de publicação abaixo (banco antes do deploy) é obrigatória.

**Migration (Fase 1):** `supabase/migrations/20261116140000_partner_topics.sql`, transação única com `lock_timeout`. Cria `partner_topics` (RLS: leitura por quem enxerga o parceiro, escrita só `is_active_admin()`, `anon` sem acesso; CHECK de nome 1–40 e cor `#rrggbb` minúscula; nome único por parceiro sem diferenciar caixa; limite de 12 por parceiro e parceiro imutável num gatilho com trava consultiva), adiciona `actions.topic_id` (FK `ON DELETE SET NULL`, índice parcial) e o gatilho `trg_actions_topic_ownership` (recusa tópico de parceiro que não está em `actions.partners` e limpa o tópico quando o dono sai; `SECURITY DEFINER`, `search_path` vazio, sem `EXECUTE` para `PUBLIC`/`anon`/`authenticated`). O plano de volta está em comentário no fim do arquivo. A policy SELECT de ações não foi tocada. Efeito conhecido: excluir um tópico dispara o `ON DELETE SET NULL` em `actions`, e o gatilho de versão (`trg_actions_updated_at`) atualiza o `updated_at` dessas ações (aceitável: a cor delas mudou; gavetas abertas pedem comparação). **Não ensaiado contra um banco** (só leitura de código); conferir em staging ou numa transação desfeita antes de aplicar.

**Decisão sobre o bootstrap:** `get_app_bootstrap` **não foi alterado**. Os tópicos vêm de uma consulta própria (`getPartnerTopics`, chave `QUERY_KEYS.partnerTopics(userId)` = `["partner-topics","team",userId]`, `staleTime` de 5 min), via o hook `usePartnerTopics`. Motivos: não exige recriar uma função de autorização cuja definição viva em produção veio de pacotes parciais (não foi inspecionada), o RLS já limita os tópicos aos parceiros visíveis e a chave com identidade segue o contrato de cache. `get_home_actions` é `RETURNS SETOF actions`, então devolve `topic_id` sozinha depois da migration.

**Decisões que o ticket não fechava:**

- Portal: `api/dash-data.ts` lê `topic_id` e a cor do tópico com a service role e devolve só `color` já resolvida (DTO inalterado). A revisão pública (`/api/review`) não envia cor e não mudou.
- `Content` se divide em `Content` (portal/revisão: sem consulta) e `TeamContent` (equipe: usa `usePartnerTopics`), porque o portal renderiza sem `QueryClientProvider`.
- Utilitário único: `app/lib/action-color.ts` (puro, importável pela API) com `pickActionColor`; `resolveActionColor` em `app/utils/uzzina-utils.ts` aplica o `safeColor`.
- Cor do tópico gravada em minúsculas (`#rrggbb`) pelo editor do Admin, que salva a cor com atraso de 500 ms para não gravar a cada arrasto.
- Nome novo de tópico no Admin nasce "Novo tópico" (ou "Novo tópico 2", ...) com a 1ª Cor da Marca; a exclusão conta as ações pelo RLS do administrador.
- Menu em lote: com parceiros mistos, o item "Alterar Tópico" aparece desabilitado com a explicação "Só funciona com ações dos mesmos parceiros"; com vários parceiros iguais, os tópicos aparecem como "Parceiro · Tópico".
- `scripts/check-serverless-runtime.cjs` ganhou `app/lib/action-color.ts` na lista de fontes (a API passou a importá-lo).
- `types/database.ts` foi editado à mão (tabela `partner_topics`, `actions.topic_id`, retorno de `get_home_actions`), porque o gerador depende do banco já migrado; regenerar depois de aplicar.

**Arquivos criados:** `supabase/migrations/20261116140000_partner_topics.sql`, `app/lib/action-color.ts`, `app/utils/topics.ts`, `app/hooks/usePartnerTopics.ts`, `app/components/uzzina/UTopicCombobox.tsx`, `app/components/features/PartnerTopicsEditor.tsx`, `app/components/ui-sections/UzzinaTopicComboboxSection.tsx`, `tests/partner-topics.test.ts`.
**Arquivos alterados:** `types/database.ts`, `app/types/index.ts`, `app/lib/query-keys.ts`, `app/models/partners.ts`, `app/utils/uzzina-utils.ts`, `app/utils/validation.ts`, `app/utils/factory.ts`, `app/components/features/action-drawer/ActionFormFooter.tsx`, `app/components/features/action-drawer/conflict-comparison.tsx`, `app/components/features/BulkActionMenu.tsx`, `app/components/features/bulk/index.ts`, `app/components/features/Content.tsx`, `app/routes/app/admin/partner/$slug.tsx`, `app/routes/ui.tsx`, `app/components/ui-sections/index.ts`, `api/dash-data.ts`, `scripts/check-serverless-runtime.cjs`, e fixtures de teste (`topic_id: null`) em `tests/action-cache.test.tsx`, `tests/action-reopen-version.test.tsx`, `tests/drawer-component.test.tsx` (seletor de cor trocado por "Tópico"), `tests/drawer-save.test.ts`, `tests/fixtures/calendar-height.tsx`, `tests/notifications-navigation.test.tsx`, `tests/timeline.test.ts`. **Removido:** `app/components/features/bulk/BulkColorDialog.tsx` (sem outro consumidor; `UColorPickerDropdown` continua em Admin e `/ui`). `ActionFormDrawer.tsx` não precisou mudar: a lógica de cor do rascunho continua como estava.

**Verificação (16/11):** `bun run typecheck` sem erros; `bun run build` ok; `bun run test:serverless` 9 PASS; `bun test tests/partner-topics.test.ts` 6 pass (cor resolvida, regra do mesmo conjunto de parceiros, tópico após troca de parceiros); testes de `content-portal`, `portal-actions`, `conflict-comparison`, `action-draft`, `multi-selection`, `drawer-save`, `action-cache`, `action-panels`, `action-reopen-version`, `timeline`, `calendar-height`, `database-authorization` passam. `tests/drawer-component.test.tsx`: 105 pass e 4 falhas que já existiam e não vêm deste ticket (procuram o botão "Ver ID da ação", removido no HOJE-03); algumas execuções sob carga mostraram falhas intermitentes de tempo em testes de busca. **Não verificado:** a migration contra um banco, RLS/gatilhos reais, a interface no navegador (claro e escuro), o portal com dados reais e o roteiro de aceite abaixo.

## Ordem de publicação

1. Fase 1 aplicada em produção (autorização à parte). O app atual continua funcionando, porque a coluna é opcional.
2. Fase 4 aplicada (autorização à parte), com a lista revisada.
3. Deploy do app novo (Fases 2 e 3), com versão Ready conferida. Pode vir antes da Fase 4; nesse caso as ações aparecem sem tópico até a carga.

## Verificação

- **Obrigatório antes de qualquer push:** `bun run test:serverless` (toca `api/dash-data.ts`; esperado 9 PASS), typecheck e build.
- **Banco:** a inspeção do SQL não comprova autorização real. Depois de aplicado, conferir com um usuário não admin: lê os tópicos dos seus parceiros, não lê os de parceiro alheio, não consegue criar, editar nem excluir tópico; gravar `topic_id` de outro parceiro é recusado.
- **Carga:** contagens do ensaio iguais às da aplicação; nenhuma ação com `updated_at` alterado pela carga.
- **Navegador com `bun run dev`:** usa o banco real de produção. Só leitura na conferência automatizada; os testes de gravação abaixo são do proprietário.
- Sem testes novos por rotina. Justificam-se testes focados no utilitário de cor resolvida e na regra do menu em lote (mesmo conjunto de parceiros), por serem os pontos que mais podem errar em silêncio.

## Roteiro de aceite para o proprietário

1. Admin → Parceiros → abrir um parceiro: "Cores da Marca" igual a antes; abaixo, "Tópicos". Criar um tópico, mudar nome e cor e recarregar para conferir que salvou.
2. Abrir uma ação de Post desse parceiro: no rodapé não há mais bolinha de cor livre; o seletor mostra os tópicos e "Sem tópico". Escolher um e ver o quadradinho na aba Instagram do parceiro mudar de cor.
3. Voltar ao Admin, trocar a cor daquele tópico e conferir que a ação mudou de cor sozinha.
4. Excluir um tópico em uso: a confirmação mostra quantas ações; depois, a ação volta para a cor antiga.
5. Ação com dois parceiros: o seletor mostra os tópicos dos dois.
6. Menu em lote: ações com os mesmos parceiros trocam o tópico; misturar A (parceiro 1) com B (parceiros 1 e 2) deixa "Tópico" desabilitado.
7. Depois da carga: abrir ações antigas e conferir que a maioria já tem o tópico da sua cor.
8. Portal do cliente (`/dash`): o calendário mostra a cor do tópico.
9. Conferir no claro e no escuro.

## Onde está

Fases 1–3 no checkout local da `main`, sem commit; SQL preparado e não aplicado; página [topicos-em-lote.html](../topicos-em-lote.html) (lista sugerida, só arquivo local). Nada em branch, no banco ou em produção. Falta: a lista revisada pelo proprietário (só para a Fase 4), a Fase 4, as duas aplicações no banco (autorizações à parte), o aceite visual e o push com deploy Ready conferido.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Fases 2 e 3 (interface) com o mapa de arquivos deste ticket; escopo bem delimitado.
- **Claude Code — Opus 5.5.** Fases 1 e 4: autorização no banco, gatilhos e a carga de milhares de ações sem mexer em `updated_at` são a parte de maior risco; também serve para a execução inteira em uma passada.
- **Codex — GPT-6.1 Sol.** Alternativa de mesmo porte para a implementação ou para revisar o SQL das Fases 1 e 4 de forma independente; conferir a disponibilidade no plano.
