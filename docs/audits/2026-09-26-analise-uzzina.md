# Auditoria crítica do UZZINA — 26/09/2026

Diagnóstico de produto, UX, funcionamento e arquitetura. Este documento registra achados e alternativas para discussão; não é um plano de implementação aprovado.

**Veredito**

O UZZINA concentra organização de tarefas, produção de conteúdo, calendário editorial, colaboração, portal de clientes, IA, cadastro de pessoas e leads. A complexidade mais prejudicial está na combinação de três fatores: muitos modos de apresentar a mesma ação; regras de trabalho pouco explícitas; e persistência de dados com comportamentos inconsistentes.

Para comandar uma agência, o sistema precisa permitir decidir rapidamente o que está em risco, quem precisa agir e qual é a próxima entrega. Hoje ele apresenta uma quantidade grande de registros e controles, mas deixa boa parte dessa interpretação para o gestor. Algumas falhas técnicas agravam exatamente essa dificuldade: o cartão pode parecer salvo, movido ou atualizado sem que o estado persistido corresponda ao mostrado.

Minha avaliação geral é **5/10 para o objetivo de comandar a agência**. É um julgamento profissional, não uma nota medida com usuários nem uma média científica. Não recomendo reescrever tudo. Recomendo estabilizar os contratos de acesso e salvamento e simplificar a experiência ao redor das decisões reais da operação.

**Como a análise foi feita e o que ela não comprova**

- Inventário dos arquivos relevantes, leitura aprofundada dos fluxos centrais, modelos, mutations, validações, autenticação, SQL disponível, componentes e rotas.
- Inspeção visual da sessão autenticada existente em `uzzina.cnvt.com.br`: página inicial, gaveta nas abas Essencial e Instagram e calendário de um parceiro. Navegação sem editar deliberadamente registros, executar IA ou publicar conteúdo.
- Ressalva descoberta na conferência final: o título recebe foco automaticamente e seu blur dispara update mesmo sem mudança. A inspeção da gaveta pode, portanto, ter atualizado `updated_at` da ação aberta; não houve alteração deliberada do texto. Não foi consultado o banco para confirmar essa escrita.
- Execução de lint, TypeScript e build. Build gerado fora do repositório, em `/private/tmp/uzzina-audit-build`.
- Execução isolada do esquema Zod e da aritmética de datas para comprovar achados sem escrever no banco.
- Consulta de documentação oficial de Linear, Asana, Basecamp, Planable, Supabase e NN/g para comparação de padrões.
- `node_modules`, `.git`, builds e lockfiles não foram tratados como código próprio a auditar. As dependências instaladas foram usadas apenas pelas ferramentas de verificação.
- Não foi feita auditoria do banco em produção: RLS, grants, triggers, índices, funções efetivamente implantadas, backups, configuração da Vercel e restrições do Cloudinary continuam não verificados.
- Não foi realizado teste de intrusão, teste destrutivo, teste de carga, sessão de usabilidade com a equipe, medição de Core Web Vitals ou validação visual em celular real. Não afirmo equivalência entre o commit local e a versão publicada.
- A lista abaixo reúne os achados desta auditoria, não uma garantia de descobrir todos os defeitos existentes.

**Dados verificáveis**

| Item | Resultado | Interpretação |
|---|---|---|
| Arquivos de fonte inventariados | 206 | `.ts`, `.tsx`, `.sql`, `.css` em app/api/types/supabase/scripts, sem árvore gerada |
| Linhas nesses arquivos | 32.182 | Incluem tipos, constantes e CSS; não são 32 mil linhas de lógica de negócio |
| Arquivos de rotas | 26 | Incluem layouts e rotas públicas |
| Componentes `.tsx` em Prism | 29 | Uma biblioteca de UI própria também precisa de manutenção |
| Fases | 6 | Ideia, Fazer, Fazendo, Análise, Feito, Concluído |
| Categorias | 13 | Misturam formato, departamento e atividade |
| Seções da home | Até 5 | Sprint, Hoje, Semana/Mês, Parceiros e Atrasadas |
| Vistas da seção Hoje | 4 | Kanban, Categorias, Feed e Parceiros |
| Testes automatizados identificados | Nenhum arquivo test/spec, script de teste ou workflow de CI localizado | Não equivale a afirmar que nunca houve teste manual ou CI externo |
| `bun run lint` | Passou: 219 arquivos checados | Regras de acessibilidade estão desabilitadas |
| `bun run typecheck` | Passou | `api/**/*` está excluído do tsconfig |
| Build | Passou, com alerta de chunks acima de 500 kB | Não demonstra bom desempenho em dispositivo real |
| Principal chunk JS | 974,79 kB; gzip 289,80 kB | Artefato de build, não tempo de carregamento |
| Chunk do editor | 513,87 kB; gzip 159,19 kB | Carregado separadamente; não somar automaticamente como custo inicial |
| CSS | 150,36 kB; gzip 22,67 kB | Tamanho medido pelo build |

Na sessão inspecionada, a interface mostrava **Hoje 1/7, Semana 21/58, Setembro 87/246 e 34 atrasadas**. São contadores exibidos pela aplicação naquele momento, não uma auditoria independente do banco. Não interpreto 87/246 como produtividade real: o período tem problemas de definição e as ações não têm pesos equivalentes.

Na seção Hoje, sete ações únicas apareciam em dez posições dos grupos por parceiro, porque três ações estavam associadas a mais de um parceiro. Isso não comprova duplicação de registros; comprova repetição visual que exige deduplicação mental do gestor.

**Notas por dimensão**

| Dimensão | Nota opinativa | Motivo |
|---|---:|---|
| Clareza para gestão diária | 4/10 | Exibe trabalho, mas não organiza decisões, impedimentos e responsáveis pela próxima etapa |
| Navegação e descoberta | 4/10 | Barra escondida, comandos sem nome e funções de negócio no menu do perfil |
| Edição e segurança de salvamento | 3/10 | Campos descartados, fechamento antecipado, concorrência e confirmações prematuras |
| Colaboração e aprovação | 3/10 | Link de revisão não fecha um processo de aprovação; comentários sem separação operacional clara |
| Segurança da implementação visível | 2/10 | Autenticação customizada no cliente e endpoint de IA sem autorização; exposição real depende da infraestrutura |
| Organização do código | 6/10 | Há separação por componentes e hooks, mas dados e regras estão distribuídos em camadas concorrentes |
| Capacidade de evoluir com confiança | 4/10 | Sem suíte localizada, SQL não reproduzível e documentação divergente |
| Hierarquia visual para operar | 5/10 | Grandes áreas e títulos convivem com informações essenciais truncadas e ícones pequenos |
| Desempenho | Sem nota medida | Build e padrões de consulta apontam riscos; faltam medições reais |

**Catálogo de achados**

Legenda: **C** = confirmado por código; **R** = reproduzido localmente; **V** = observado na interface; **H** = hipótese/risco a validar. Uma implementação defeituosa confirmada não significa que um incidente já aconteceu. Gravidade crítica significa prioridade de investigação/correção, não prova de invasão.

**01 — Crítica · C/H — A sessão do cliente não é uma autenticação verificável pelo servidor.**

O login compara dados no navegador e salva `uzzina_dash_client_id`. O layout usa esse ID para carregar o cliente, sem token próprio assinado, validade ou verificação de senha nessa retomada. Arquivar o cliente também não é verificado por `getClientById`. Se o acesso anônimo ao banco permite o fluxo, a proteção visual não impede chamadas diretas; se o banco o proíbe, o portal pode não funcionar como pretendido. Não testei personificação de clientes. Alternativa: identidade verificável no servidor e políticas por cliente/parceiro, com revogação efetiva. Evidência: [clients.ts:95](/Users/euchicosousa/vercel/uzzina/app/models/clients.ts:95), [dash.tsx:45](/Users/euchicosousa/vercel/uzzina/app/routes/dash.tsx:45).

**02 — Crítica · C — O código ainda envia senha em claro para persistência.**

`createClient` espalha `clientData`, que contém `password`, junto de `password_hash`. `updateClient` faz o mesmo; o upgrade de senha antiga adiciona o hash, mas não apaga o campo original. O hash é SHA-256 com salt fixo público. O login busca `select('*')` e precisa receber o verificador no navegador. Isso não estabelece se todos os registros atuais contêm senha legível, mas o caminho de escrita está confirmado. Alternativa: remover credenciais da tabela de perfil e usar autenticação apropriada. Evidência: [clients.ts:6](/Users/euchicosousa/vercel/uzzina/app/models/clients.ts:6), [clients.ts:47](/Users/euchicosousa/vercel/uzzina/app/models/clients.ts:47).

**03 — Crítica · C/H — A API de IA não verifica quem está consumindo a conta.**

O handler verifica método, chave e campos mínimos, mas não autentica usuário nem aplica cota/rate limit no código. O cliente também não envia autorização. Se o endpoint estiver público sem proteção externa, chamadas não autorizadas podem consumir recursos. O fallback para variável `VITE_OPENAI_API_KEY` merece remoção; a presença do nome, isoladamente, não prova chave vazada no bundle. Alternativa: autorização no servidor, limites de entrada e consumo por pessoa/agência. Evidência: [api/ai.ts:5](/Users/euchicosousa/vercel/uzzina/api/ai.ts:5), [ai-client.ts](/Users/euchicosousa/vercel/uzzina/app/services/ai-client.ts).

**04 — Crítica · C/H — O SQL disponível delega confiança a parâmetros fornecidos pelo cliente.**

O script mais novo define `get_home_actions` como `SECURITY DEFINER`, aceita `p_user_id` e parceiros, não compara esse ID com `auth.uid()` e não fixa `search_path`. Se implantado com permissão de execução inadequada, pode consultar dados com os privilégios do dono. O arquivo antigo implementa outra assinatura e outra lógica. Não conheço os grants e a função em produção. Alternativa: revisar identidade, autorização e escopo dentro da função e versionar a definição real. Evidência: [SQL:18](/Users/euchicosousa/vercel/uzzina/supabase_update_get_home_actions.sql:18). A documentação do [Supabase sobre funções](https://supabase.com/docs/guides/database/functions) explica a diferença entre invoker e definer.

**05 — Alta · C/H — A autorização administrativa depende de uma camada que não está documentada no repositório.**

O menu esconde itens de admin, mas as rotas administrativas lidas não têm guarda equivalente. Consultas e updates vão diretamente ao Supabase, incluindo edição de `people.admin`. A API de criação de usuário verifica admin, mas isso não cobre os outros caminhos. Não afirmo escalada de privilégio sem conhecer RLS. Alternativa: guarda de rota para UX e autorização efetiva no banco/servidor, com testes de acesso negado. Evidência: [admin/user](/Users/euchicosousa/vercel/uzzina/app/routes/app/admin/user/$userId.tsx), [create-user.ts](/Users/euchicosousa/vercel/uzzina/api/create-user.ts).

**06 — Alta · C/H — HTML persistido é renderizado sem sanitização explícita nas telas examinadas.**

Há `dangerouslySetInnerHTML` para descrição e conteúdo. Comentários de lint dizendo que o editor é seguro não validam tudo que pode chegar pelo banco/API; a IA também fornece HTML. Não executei payload malicioso. Alternativa: definir uma política de HTML permitido, sanitizar na fronteira adequada e testar entradas reais. Evidência: [detalhe do cliente](/Users/euchicosousa/vercel/uzzina/app/routes/dash/action/$id.tsx), [revisão](/Users/euchicosousa/vercel/uzzina/app/routes/dash/review.$slug.tsx).

**07 — Alta · C/R — Apagar certos campos não envia a limpeza ao banco.**

`nullableString` converte `''` e `null` em `undefined`. Ao serializar o update, a propriedade some. Confirmado isoladamente: descrição vazia resulta em `{}` no payload correspondente. Assim, limpar legenda ou conteúdo pode manter o texto antigo no servidor. O editor pode serializar alguns vazios como HTML, o que muda o caso específico, mas não corrige o contrato. Alternativa: distinguir campo ausente de campo explicitamente limpo. Evidência: [validation.ts:48](/Users/euchicosousa/vercel/uzzina/app/utils/validation.ts:48).

**08 — Alta · C/R — Os temas selecionados podem nunca persistir.**

`topic_ids` é enviado pela interface, mas não existe no `ActionFormSchema`. Zod o remove. A reprodução mostrou `topicIdsPresent: false`. `time` também é removido, embora apareça no modelo. Alternativa: contrato completo e testes de ida e volta dos campos realmente editáveis. Evidência: [EssentialsTab.tsx:168](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/EssentialsTab.tsx:168), [validation.ts:56](/Users/euchicosousa/vercel/uzzina/app/utils/validation.ts:56).

**09 — Alta · C — Uma criação que falha pode bloquear novas tentativas até fechar a gaveta.**

`isCreatingRef` é ligado antes do `await`, mas só desligado quando há resultado bem-sucedido. Não há `finally`. Uma falha de validação, rede ou banco deixa o bloqueio ativo. O usuário corrige o problema e o próximo clique pode não fazer nada. Alternativa: liberar o bloqueio em todos os resultados e preservar o rascunho. Evidência: [ActionFormDrawer.tsx:122](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx:122), [ActionFormDrawer.tsx:319](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx:319).

**10 — Alta · C — O atalho fecha a edição antes de saber se salvou.**

`Cmd+Enter` chama a função assíncrona e fecha imediatamente. Mesmo uma validação recusada pode fechar a gaveta. O botão também fecha antecipadamente com Shift; o sentido de Shift é diferente do atalho de teclado. Escape e o fundo fecham sem fluxo explícito de rascunho pendente. Não executei salvamentos reais para reproduzir perda. Alternativa: fechamento condicionado ao sucesso, estado persistente de salvamento e recuperação de rascunho. Evidência: [ActionFormDrawer.tsx:383](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx:383), [ActionFormFooter.tsx](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormFooter.tsx).

**11 — Alta · C/H — Autosaves concorrentes podem sobrescrever alterações.**

Os handlers enviam o objeto inteiro da ação com um patch e substituem o estado inteiro pelo resultado. Alterar dois campos rapidamente ou receber resposta de IA enquanto edita abre disputa entre snapshots antigos. Não há comparação de versão no update examinado. O mesmo padrão aparece em arrays de anexos. Alternativa: updates de campos alterados, fila por ação ou controle de versão, com feedback de conflito. Evidência: [ActionFormDrawer.tsx:302](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx:302), [supabase.mutations.ts](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts).

**12 — Alta · C — Operações em lote anunciam sucesso antes da resposta.**

`performBulkAction` dispara a Promise, limpa a seleção e mostra sucesso sem `await`. Data e hora repetem o padrão. Se falhar, a interface já afirmou o contrário e perdeu a seleção útil para tentar novamente. Alternativa: confirmar resultado persistido; em falha parcial, mostrar exatamente quais itens não mudaram. Evidência: [BulkActionMenu.tsx:141](/Users/euchicosousa/vercel/uzzina/app/components/features/BulkActionMenu.tsx:141).

**13 — Alta · C — Alteração de data/hora em lote ignora erros das escritas individuais.**

O `Promise.all` reúne respostas do Supabase, mas o código não inspeciona `error` de cada update. Uma resposta HTTP com erro retornada pelo SDK não precisa rejeitar a Promise. Além disso, são N escritas independentes. Alternativa: operação transacional ou resultado por registro; não tratar o lote como concluído só porque as Promises resolveram. Evidência: [supabase.mutations.ts:148](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts:148), [supabase.mutations.ts:181](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts:181).

**14 — Alta · C — A regra de concluir/arquivar não é aplicada uniformemente.**

Update individual limpa `sprints` ao concluir ou arquivar. O update genérico em lote não aplica essa regra; alguns callers fazem parte do trabalho, outros dependem do caminho escolhido. Alternativa: uma única regra de domínio válida para botão, atalho, arraste e lote, idealmente garantida também na persistência. Evidência: [supabase.mutations.ts:117](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts:117).

**15 — Alta · C — O arraste pode continuar mostrando um estado falso após falhar.**

Calendário e Kanban mantêm overrides locais que nunca são removidos no código lido. Mesmo que React Query faça rollback ou receba um estado mais recente, o override continua prevalecendo. No calendário, o comentário promete limpeza após revalidação, mas ela não foi implementada. Alternativa: uma única fonte de estado otimista, com reconciliação e rollback. Evidência: [CalendarWithDnd.tsx:49](/Users/euchicosousa/vercel/uzzina/app/components/features/CalendarWithDnd.tsx:49), [useKanbanDnd.ts:23](/Users/euchicosousa/vercel/uzzina/app/hooks/useKanbanDnd.ts:23).

**16 — Alta · C — Home e Hoje compartilham cache para consultas diferentes.**

A home busca uma janela mensal e Hoje busca um dia, mas ambas usam `actions.home(userId)`. Resultado depende da navegação/refetch. Além disso, Hoje permite trocar o dia na toolbar, mas a consulta da rota continua presa ao dia atual. Alternativa: incluir período e escopo na chave e conectar navegação à consulta. Evidência: [index.tsx:45](/Users/euchicosousa/vercel/uzzina/app/routes/app/index.tsx:45), [today.tsx:27](/Users/euchicosousa/vercel/uzzina/app/routes/app/today.tsx:27), [HomeTodayView.tsx](/Users/euchicosousa/vercel/uzzina/app/components/features/home/HomeTodayView.tsx).

**17 — Alta · C/H — Cache não separa todos os usuários e contextos de confidencialidade.**

Notificações usam chave sem usuário. Consultas do parceiro variam por usuário/admin, mas a chave não inclui identidade. Comentários internos e públicos usam a mesma chave `['comments', actionId]`. Não localizei limpeza global de cache no logout. Em navegação SPA entre contextos, dados anteriores podem aparecer antes do refetch. RLS não remove dados que já estejam no cache do navegador. Alternativa: particionar por identidade/visibilidade e limpar na troca de sessão. Evidência: [query-keys.ts](/Users/euchicosousa/vercel/uzzina/app/lib/query-keys.ts), [ObservationsTab.tsx:34](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ObservationsTab.tsx:34), [Header.tsx:435](/Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx:435).

**18 — Média · C — Parceiros no contexto não acompanham necessariamente as edições.**

O bootstrap guarda parceiros em `useState`. Edições administrativas invalidam caches de parceiros, mas não atualizam esse estado do layout. Nome, cores, temas e integrantes podem permanecer antigos nos seletores e no contexto enviado à IA até remontar/recarregar. Alternativa: uma fonte consultável e invalidável para esses dados. Evidência: [app.tsx:37](/Users/euchicosousa/vercel/uzzina/app/routes/app.tsx:37), [admin/partner:148](/Users/euchicosousa/vercel/uzzina/app/routes/app/admin/partner/$slug.tsx:148).

**19 — Média · C/H — Busca pode responder ao texto antigo ou quebrar em ações multiparceiro.**

Há debounce, mas não cancelamento/controle de resposta obsoleta. Uma resposta antiga pode substituir a nova. A renderização exige que o primeiro parceiro da ação esteja na lista visível, embora a busca aceite overlap com qualquer parceiro. Se apenas o segundo estiver acessível, `partner.colors` pode acessar undefined. Alternativa: cancelamento, estado explícito de erro e seleção segura do parceiro acessível. Evidência: [GlobalSearchCommand.tsx:68](/Users/euchicosousa/vercel/uzzina/app/components/features/GlobalSearchCommand.tsx:68), [GlobalSearchCommand.tsx:137](/Users/euchicosousa/vercel/uzzina/app/components/features/GlobalSearchCommand.tsx:137).

**20 — Alta · C — Erro e ausência de dados são confundidos.**

Várias queries usam `data = []` sem mostrar erro. No detalhe do cliente, erro que deixa `action` ausente cai no mesmo loading indefinidamente; no layout, falha pode resultar em tela vazia. Isso faz a pessoa interpretar indisponibilidade como calendário vazio ou carregamento interminável. Alternativa: estados separados para carregando, vazio, sem acesso, falha e conteúdo desatualizado, sempre com ação de recuperação. Evidência: [dash/action](/Users/euchicosousa/vercel/uzzina/app/routes/dash/action/$id.tsx), [dash.tsx](/Users/euchicosousa/vercel/uzzina/app/routes/dash.tsx), [home](/Users/euchicosousa/vercel/uzzina/app/routes/app/index.tsx).

**21 — Alta · C — A aprovação é apresentada como processo, mas implementada como documento.**

“Enviar para aprovação” só copia um link. A página informa conteúdos para aprovação, porém não registra Aprovar, Pedir ajuste, aprovador, versão ou data da decisão. Os dados são lidos ao abrir, portanto o documento muda conforme o registro muda. Alternativa: se a intenção é só apresentar, chamar de “Compartilhar revisão”; se é aprovar, registrar decisão vinculada à versão. Evidência: [BulkActionMenu.tsx:194](/Users/euchicosousa/vercel/uzzina/app/components/features/BulkActionMenu.tsx:194), [review.$slug.tsx](/Users/euchicosousa/vercel/uzzina/app/routes/dash/review.$slug.tsx).

**22 — Alta · C/H — O link de revisão tem contrato de acesso e escopo inconsistente.**

O helper diz ser público, mas a rota está sob o layout `/dash`, que exige o ID local do cliente. Não há token de compartilhamento com expiração/revogação no fluxo lido. Os IDs da URL são consultados sem cruzar `partners` com o slug da página. A seleção global pode atravessar contextos. Alternativa: definir acesso autenticado ou link restrito e validar todos os itens contra o parceiro permitido. RLS em produção continua não verificado. Evidência: [supabase.queries.ts:144](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.queries.ts:144), [dash.tsx:45](/Users/euchicosousa/vercel/uzzina/app/routes/dash.tsx:45).

**23 — Alta · C — Comentário da equipe é público por padrão sem escolha evidente na aba.**

`ObservationsTab` cria com `is_internal: false`. O modelo prevê comentários internos, mas o compositor dessa aba não oferece seleção de audiência. Um comentário operacional pode ser tratado pelo usuário como interno por estar no portal da equipe. Alternativa: “Nota interna” e “Mensagem ao cliente” explicitamente diferenciadas, com audiência visível antes de enviar. Evidência: [ObservationsTab.tsx:66](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ObservationsTab.tsx:66).

**24 — Média · C — Stories recebe experiência diferente sem justificativa de produto.**

`isInstagramFeed` exclui stories por padrão. A gaveta usa essa função para mostrar a aba Instagram, então stories fica sem a mesma edição. No portal, o calendário mobile usa `instaActions` com stories e o desktop usa `feedActions` sem stories. Alternativa: separar “é conteúdo de rede social” de “aparece na grade do feed” e garantir paridade de dados entre dispositivos. Evidência: [validation.ts](/Users/euchicosousa/vercel/uzzina/app/utils/validation.ts), [ActionFormDrawer.tsx:432](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx:432), [dash/index.tsx:109](/Users/euchicosousa/vercel/uzzina/app/routes/dash/index.tsx:109).

**25 — Média · C/R — Calendário do cliente navega meses como blocos de 30 dias e tem janela fixa.**

Janeiro/31 + 30 dias resulta em março/02, confirmado localmente. A consulta busca de hoje −30 a hoje +90, independentemente do mês navegado. Ao ultrapassar a janela, pode mostrar vazio sem avisar que não consultou o período. Alternativa: navegação por mês civil e fetch do período visível. Evidência: [dash/index.tsx:46](/Users/euchicosousa/vercel/uzzina/app/routes/dash/index.tsx:46), [dash/index.tsx:99](/Users/euchicosousa/vercel/uzzina/app/routes/dash/index.tsx:99).

**26 — Média · C/R — A métrica “Setembro” conta dias de agosto e outubro.**

`DashboardMetrics` usa início/fim da grade semanal do calendário para o total mensal. Em setembro de 2026, o intervalo calculado é 30/08 a 03/10. O rótulo de mês não comunica isso. Alternativa: separar intervalo visual de intervalo analítico; definir se a métrica mede entregas com vencimento no mês ou conclusões ocorridas no mês. Evidência: [DashboardMetrics.tsx:47](/Users/euchicosousa/vercel/uzzina/app/components/features/home/DashboardMetrics.tsx:47).

**27 — Alta · C/V — Uma data única mistura planejamento, prazo e publicação.**

O modelo tem `date`, usada para ordenar, classificar atraso, exibir no calendário e informar “Data de publicar” ao cliente. A fábrica de novas ações atribui 11h ou agora +10 minutos. Assim, uma tarefa ainda sendo planejada já nasce com horário operacional arbitrário. A interface real mostrava muitos horários quebrados, mas não atribuo todos à fábrica sem histórico. Alternativa: entrada sem agendamento obrigatório; distinguir prazo interno de publicação quando necessário. Evidência: [factory.ts](/Users/euchicosousa/vercel/uzzina/app/utils/factory.ts), [database.ts:61](/Users/euchicosousa/vercel/uzzina/types/database.ts:61).

**28 — Alta · C/V — “Feito” e “Concluído” não explicitam a passagem final.**

Só `finished` é considerado encerrado nos atrasos e métricas. Para quem vê “Feito”, é razoável presumir encerramento, mas a ação pode continuar atrasada. “Análise” também não esclarece se é revisão interna ou do cliente. Alternativa: nomear resultados concretos por fluxo: Em produção, Revisão interna, Aguardando cliente, Pronto para publicar, Publicado; tarefas internas podem ter menos estados. Não implementar todos automaticamente. Evidência: [CONSTANTS.ts:1](/Users/euchicosousa/vercel/uzzina/app/lib/CONSTANTS.ts:1), [supabase.queries.ts](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.queries.ts).

**29 — Média · C/V — “Sprint” é uma lista pessoal de foco, sem estrutura de sprint.**

`sprints` contém IDs de pessoas, não uma entidade com período, objetivo ou capacidade. A ordenação é local ao dispositivo. O hook remove da ordem IDs que não aparecem na lista recebida; ao aplicar filtro de parceiro, pode apagar a ordem dos itens temporariamente ocultos. A consulta da home também limita o universo por período, conforme o SQL implantado. Alternativa: chamar de “Meu foco” se essa é a finalidade; só criar ciclos reais se resolverem uma necessidade da equipe. Evidência: [useSprintOrder.ts:34](/Users/euchicosousa/vercel/uzzina/app/hooks/useSprintOrder.ts:34), [home](/Users/euchicosousa/vercel/uzzina/app/routes/app/index.tsx).

**30 — Alta · V/C — A home coloca o trabalho em risco depois da exploração visual.**

Na sessão real havia 34 atrasadas; a lista vinha após Sprint, Hoje, calendário e Parceiros. O contador superior sinaliza quantidade, mas não organiza a resolução. Alternativa: começar por uma fila curta de decisões: atrasos relevantes, aprovações pendentes, bloqueios e entregas próximas. Calendário deve continuar disponível como ferramenta de planejamento. Evidência: [index.tsx:98](/Users/euchicosousa/vercel/uzzina/app/routes/app/index.tsx:98).

**31 — Média · V/C — A mesma ação se repete em vários grupos e seções.**

Sete ações únicas geraram dez posições na vista por parceiros, além das ocorrências no calendário e nos atrasos. Há justificativa para a associação multiparceiro, mas a soma visual aumenta a sensação de volume e dificulta saber quantos trabalhos distintos existem. Alternativa: lista operacional única por ação; relações secundárias como etiquetas, preservando repetição apenas nas vistas contextuais. Evidência: home observada e [PartnersBoard.tsx](/Users/euchicosousa/vercel/uzzina/app/components/layout/PartnersBoard.tsx).

**32 — Alta · V/C — A navegação principal desaparece e depende de hover.**

Nas páginas fora da home, a barra se esconde. O revelador é uma `div` com `onMouseEnter`, sem controle equivalente de teclado. Na tela de parceiro, só uma pequena seta indica a barra. Alternativa: navegação estável com alvos identificáveis; se houver recolhimento, oferecer botão clicável e acessível. Evidência: [app.tsx:205](/Users/euchicosousa/vercel/uzzina/app/routes/app.tsx:205), [app.tsx:237](/Users/euchicosousa/vercel/uzzina/app/routes/app.tsx:237).

**33 — Média · C — Um seletor alterna entre navegar e filtrar.**

No AppBar, escolher parceiro pode navegar para outra página ou alterar filtro da home, dependendo de um modo dentro do popover. São efeitos muito diferentes para o mesmo gesto. A detecção de home também usa `/app` em um local e aceita `/app/` em outro. Alternativa: separar “Ir para cliente” de “Filtrar clientes” e tornar o escopo visível. Evidência: [AppBar.tsx](/Users/euchicosousa/vercel/uzzina/app/components/layout/AppBar.tsx).

**34 — Média · V/C — Há excesso de decisões de apresentação na superfície principal.**

Home tem cinco blocos e Hoje tem quatro vistas; a página do parceiro combina variantes, ordenação, campos visíveis e filtros. A interface oferece personalização antes de orientar a tarefa. Alternativa: um padrão operacional forte e opções avançadas em “Exibição”, mantendo filtros frequentes explícitos. O princípio de [divulgação progressiva da NN/g](https://www.nngroup.com/articles/progressive-disclosure/) sustenta reduzir opções avançadas na tela principal; isso não significa esconder a navegação essencial.

**35 — Média · V — Espaço grande para estrutura e pouco espaço para informação decisiva.**

A home observada dedica uma área grande a um único item de Sprint; ao mesmo tempo, títulos de Hoje são truncados. No calendário em modo conteúdo, um cartão alto determina uma linha muito alta, deixando dias vazios enormes e exigindo rolagem para ver o mês. Alternativa: títulos de seção menores, densidade operacional compacta, resumo por dia e mídia completa sob demanda. Não há medição de contraste ou benchmark de velocidade visual nesta auditoria.

**36 — Alta · V/C — Estado e comandos exigem memorizar ícones.**

Rodapé da gaveta esconde parceiro, fase e categoria atrás de controles sem texto. A árvore de acessibilidade mostrou botões sem nome; o progresso era anunciado como “Progresso Fundo Progresso”, sem a fase semântica. Cor distingue categoria, fase, parceiro e atraso em diferentes lugares. Alternativa: rótulos dos controles centrais e estado escrito, tooltip como complemento. Evidência: [ActionFormFooter.tsx](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormFooter.tsx), [PhaseIcon.tsx](/Users/euchicosousa/vercel/uzzina/app/components/features/PhaseIcon.tsx). Referência: [reconhecimento e memória em interfaces](https://www.nngroup.com/articles/recognition-and-recall/).

**37 — Média · C/V — Atalhos dependem do mouse e podem capturar combinações indevidas.**

O alvo é o cartão sob `:hover`, e as teclas de fase não descartam previamente Ctrl/Meta/Alt. Com cursor sobre um cartão e sem input focado, combinações como Cmd+C podem entrar no ramo da tecla C e concluir a ação. Não executei esse atalho na produção. Alternativa: atalhos documentados, alvo pelo foco/seleção e exclusão explícita de modificadores não previstos. Evidência: [useActionShortcut.tsx](/Users/euchicosousa/vercel/uzzina/app/hooks/useActionShortcut.tsx).

**38 — Média · C/H — Seleção em lote pode sobreviver à mudança de contexto.**

O provider global mantém IDs ao navegar e `Cmd+A` consulta todos os elementos com `data-action-id`, sem verificar visibilidade efetiva ou pertencimento à vista atual. Isso aumenta risco de atuar em itens que já não aparecem. Alternativa: escopo de seleção explícito, contagem de itens ocultos e revisão dos alvos antes das operações sensíveis. Evidência: [useMultiSelection.tsx](/Users/euchicosousa/vercel/uzzina/app/hooks/useMultiSelection.tsx).

**39 — Alta · C/V — Notificações e ajuda têm caminhos incompletos.**

As rotas Ajuda e Notificações retornam texto `Hello ...`. O Header coloca `PrismPopover` onde deveria haver um trigger/contexto de abertura; na inspeção, o sino não apareceu. Sem corrigir isso, menções não formam uma caixa de entrada confiável. Alternativa: terminar o fluxo mínimo ou retirar os caminhos inacabados da navegação até existirem. Evidência: [Header.tsx:206](/Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx:206), [help.tsx](/Users/euchicosousa/vercel/uzzina/app/routes/app/help.tsx), [notifications.tsx](/Users/euchicosousa/vercel/uzzina/app/routes/app/notifications.tsx).

**40 — Média · C/V — Responsáveis múltiplos não definem quem conduz a próxima etapa.**

A ação observada tinha quatro responsáveis. O modelo oferece array de responsáveis, mas não um dono explícito da próxima decisão nem um bloqueio estruturado. Isso pode funcionar para colaboração, mas dificulta cobrar uma entrega. Alternativa: um responsável principal e colaboradores, com a próxima ação atribuída a alguém. Não concluo que a equipe esteja sem responsabilidade fora do app; o sistema não a torna clara.

**41 — Média · C — O modelo de negócio é centrado em ações, sem entidade de projeto no esquema disponível.**

Embora a documentação diga gestão de projetos, o esquema mostra ações, parceiros, pessoas e leads, sem projeto/campanha com escopo, objetivo e prazo próprio. As 13 categorias misturam formato (Reels), função (Financeiro), disciplina (Design) e atividade (Reunião). Alternativa: decidir primeiro quais objetos a agência realmente precisa. Cliente → projeto/campanha opcional → entrega pode ajudar; transformar tudo em hierarquia obrigatória só criaria mais trabalho. Evidência: [database.ts](/Users/euchicosousa/vercel/uzzina/types/database.ts), [CONSTANTS.ts:57](/Users/euchicosousa/vercel/uzzina/app/lib/CONSTANTS.ts:57).

**42 — Média · C — Métricas de volume não respondem capacidade e risco.**

Um post e uma campanha contam igualmente. Não identifiquei fluxo estruturado para capacidade, dependências, tempo parado em fase ou histórico de aprovação. Existe `time`, mas ele não estabelece sozinho um sistema de esforço, e a validação o remove. Alternativa: começar com poucas medidas acionáveis, descritas adiante, sem criar um dashboard de dezenas de gráficos.

**43 — Média · C — A biblioteca de UI não garante acessibilidade nos fluxos compostos.**

Primitivos usam React Aria, mas a gaveta é uma `div`, abas são manuais e vários botões são sem nome. Calendário e Kanban usam só PointerSensor nos caminhos examinados, embora Sprint tenha KeyboardSensor. O lint desabilita todo o grupo a11y. Não houve auditoria completa WCAG. Alternativa: verificar foco, fechamento, nomes, navegação sem mouse e alternativas ao arraste no produto montado. Evidência: [biome.json](/Users/euchicosousa/vercel/uzzina/biome.json), [ActionFormDrawer.tsx](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormDrawer.tsx).

**44 — Média · C/H — Mobile precisa de validação própria, não só classes responsivas.**

Além do hover e da diferença de Stories, a gaveta só explicita larguras no breakpoint lg, o rodapé é extenso com overflow escondido e Leads fixa uma coluna de 320 px antes do detalhe. São riscos concretos de layout, mas não foram reproduzidos em telefone. Alternativa: fluxo compacto por tarefa, lista diária no celular e ações críticas sempre acessíveis. Evidência: [leads.tsx](/Users/euchicosousa/vercel/uzzina/app/routes/app/leads.tsx), [ActionFormFooter.tsx](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/ActionFormFooter.tsx).

**45 — Média · C — Preferências podem sobrescrever mudanças anteriores.**

`queuePreference` monta cada escrita usando `person.preferences` do bootstrap, aplica o lote pendente e depois limpa o lote. Como o perfil em contexto não é atualizado, uma alteração posterior pode reintroduzir valores antigos de uma anterior. Alternativa: fonte de estado atualizada e atualização granular/mesclagem segura. Evidência: [Header.tsx:298](/Users/euchicosousa/vercel/uzzina/app/components/layout/Header.tsx:298).

**46 — Média · C — Duplicar não tem contrato claro de nova entrega.**

A cópia otimista aparece com “(Cópia)”, mas a inserção não acrescenta esse sufixo. O duplicador também carrega data, fase, responsáveis, sprint e demais campos originais. Dependendo do uso, pode criar trabalho já concluído ou atrasado. Alternativa: definir o que uma cópia preserva e exibir os campos relevantes antes de confirmar, ou oferecer duplicação como rascunho. Evidência: [supabase.mutations.ts:82](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts:82), [useActionMutations.tsx](/Users/euchicosousa/vercel/uzzina/app/hooks/useActionMutations.tsx).

**47 — Média · C — A camada de dados tem caminhos paralelos e contratos amplos demais.**

Consultas estão em models, `supabase.queries`, hooks e rotas. Regras estão na UI, mutation e SQL. Tipos de tabelas são usados como contratos de tela mesmo quando só alguns campos foram selecionados, com casts para `Action`. A validação aceita data inválida e parceiros vazios na reprodução isolada. Alternativa: limites de domínio claros, inputs de create/update distintos, tipos específicos de leitura e invariantes testáveis. O problema não é a escolha de SPA ou Supabase, mas a dispersão de responsabilidade.

**48 — Alta · C — Banco e documentação não são reproduzíveis a partir do repositório disponível.**

Não há cadeia de migrations com esquema, políticas e funções. Dois SQLs de home diferem: quatro/cinco parâmetros, `state`/`phase`, comportamento admin e janela. README descreve cookies e serviços removidos; AGENTS ainda lista nomes de arquivos Prism antigos. `get_app_bootstrap` é usado, mas sua definição não está entre os SQLs localizados. Alternativa: versionar o banco real e atualizar documentação a partir da implementação. Isso reduz correções baseadas em contexto falso.

**49 — Alta · C — Verificações passam, mas não cobrem os comportamentos que mais importam.**

Não localizei testes de persistência, autorização, edição, aprovação ou navegação. TypeScript exclui `api`, lint exclui acessibilidade. A existência de 32 mil linhas sem esses testes torna cada mudança no fluxo central mais arriscada. Alternativa: poucos testes de contratos e jornadas críticas antes de aumentar a suíte indiscriminadamente. Evidência: [package.json](/Users/euchicosousa/vercel/uzzina/package.json), [tsconfig.json](/Users/euchicosousa/vercel/uzzina/tsconfig.json), [biome.json](/Users/euchicosousa/vercel/uzzina/biome.json).

**50 — Média · C/H — Desempenho e recuperação tendem a piorar com volume.**

Há consultas frequentes com `select('*')`, sem paginação em vários fluxos, dados de HTML/mídia no mesmo registro usado para listas e updates que invalidam todo o conjunto de ações. No calendário há filtros por dia sobre a lista. Build alerta sobre chunks grandes. Nenhum desses números prova lentidão atual, mas são pontos para medir com volume e rede real. Não localizei instrumentação de erro de aplicação; console/toast não permite acompanhar falhas recorrentes da equipe. Alternativa: medir antes de otimizar, buscar resumos nas listas, paginar onde necessário e monitorar falhas de salvamento.

**51 — Média · C/H — Apenas consultar uma ação pode mudar sua última atualização.**

O título da gaveta usa autofocus. Seu `onBlur` chama `updateAction` sem comparar o texto com o original; a mutation atribui novo `updated_at`. Trocar de aba após abrir pode assim gravar o mesmo conteúdo e alterar a data da última edição. Isso também gera refetch desnecessário e participa do risco de sobrescrever snapshots antigos. Alternativa: gravar apenas diferenças reais e distinguir edição de visualização. Evidência: [EssentialsTab.tsx:127](/Users/euchicosousa/vercel/uzzina/app/components/features/action-drawer/EssentialsTab.tsx:127), [supabase.mutations.ts](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.mutations.ts).

**52 — Média · C — A lista de usuários arquivados não pode ser preenchida pela consulta usada.**

A rota de usuários separa pessoas ativas e arquivadas, mas `fetchPeople` já restringe a consulta a `visible = true`. O grupo de arquivados fica vazio por construção, prejudicando a recuperação administrativa. Alternativa: consultas diferentes para seletor de pessoas ativas e administração de todas as pessoas. Evidência: [users.tsx:10](/Users/euchicosousa/vercel/uzzina/app/routes/app/admin/users.tsx:10), [supabase.queries.ts](/Users/euchicosousa/vercel/uzzina/app/lib/supabase.queries.ts).

**O que a dinâmica do produto deveria esclarecer**

| Pergunta cotidiana | Situação encontrada | Alternativa de uso a discutir |
|---|---|---|
| O que preciso decidir agora? | Contadores e várias seções exigem interpretação | Fila de decisões, priorizada por impacto e proximidade |
| O que faço em seguida? | Sprint pessoal, Hoje e Atrasadas podem competir | Meu trabalho com ordem explícita e motivo da prioridade |
| Quem está travado? | Fase e responsáveis não exprimem impedimento | Bloqueio com motivo, dono da solução e data de início |
| O que depende do cliente? | Análise é genérica; comentários não equivalem a aprovação | Aguardando cliente com prazo e próxima cobrança |
| Posso confiar que salvou? | Autosave, Atualizar e otimismos independentes | Salvando / Salvo / Falhou, com rascunho preservado |
| O que será publicado? | Data única e fase final ambígua | Agenda de publicação separada do prazo interno |
| O que o cliente está vendo? | Portal exclui Ideia, mas não tem gate explícito de compartilhamento | Visualização de audiência e liberação deliberada |
| Há capacidade para mais trabalho? | Quantidade de cartões | Esforço disponível versus comprometido, começando simples |
| O que mudou desde ontem? | Sem histórico central de mudanças observado | Atividade relevante, versões e alterações de prazo/fase |

**Comparação com outros apps — padrões a aproveitar, não recomendação de migração**

| Referência | Padrão documentado | O que aprender para o UZZINA | O que evitar copiar |
|---|---|---|---|
| Linear | My Issues prioriza grupos de trabalho; Triage separa entrada de execução; Cycles têm período | Uma entrada para organizar solicitações, uma lista pessoal orientada à ação e nomes coerentes com o objeto | Estrutura de engenharia desnecessária e rituais de sprint se a agência não os usa |
| Asana | Aprovação explicita aprovar/pedir ajuste/rejeitar; Workload mostra capacidade | Tratar aprovação como decisão e mostrar distribuição do trabalho | Criar dependências e campos obrigatórios em toda tarefa pequena |
| Basecamp | Hill Charts distinguem incerteza de execução | Percentual de tarefas concluídas não conta sozinho se uma entrega está sob controle | Adicionar mais um gráfico sem uma decisão associada |
| Planable | Aprovação vinculada ao conteúdo, histórico de versões e controle de alterações após aprovação | Cliente deve saber o que está aprovando; mudanças posteriores precisam ser rastreáveis | Expandir já para uma suíte de publicação multicanal |

Fontes oficiais consultadas em 26/09/2026: [Linear — My Issues](https://linear.app/docs/my-issues), [Triage](https://linear.app/docs/triage), [Cycles](https://linear.app/docs/use-cycles); [Asana — Aprovações](https://help.asana.com/s/article/approvals), [Workload](https://help.asana.com/s/article/portfolio-workload-and-universal-workload); [Basecamp — Hill Charts](https://basecamp.com/hill-charts); [Planable — Aprovações e versões](https://planable.io/guides/content-approvals-in-planable/).

A principal diferença que interessa não é a quantidade de recursos. É a clareza entre entrada, execução, decisão, aprovação e encerramento. Hoje essas responsabilidades estão misturadas na entidade ação e na gaveta.

**Simplificações candidatas para discussão**

Estas são alternativas de produto, sem compromisso de implementação, sequência ou estimativa.

1. Trocar a home extensa por uma visão de comando e dar ao calendário uma página/função de planejamento claramente acessível.
2. Manter Meu trabalho, Clientes, Calendário e Decisões/Aprovações em navegação estável. Administração pode ser secundária.
3. Reduzir a barra de controles por padrão; reunir personalização visual no menu Exibição.
4. Renomear Sprint para Meu foco, se não houver ciclos reais.
5. Separar prazo de produção e publicação onde a operação realmente exige essa distinção.
6. Definir um único responsável principal por entrega, mantendo colaboradores.
7. Tornar a gaveta previsível: dados essenciais visíveis, briefing identificado, entregáveis identificados e conversa com audiência explícita.
8. Remover a dúvida entre autosave e Atualizar; oferecer estado de salvamento e recuperação.
9. Fazer “Aprovar” significar uma decisão registrada sobre uma versão.
10. Recolher IA em assistência contextual. Não deixar geração competir com organização da entrega e validação do briefing.
11. Manter leads em área secundária enquanto não houver uma rotina comercial clara; a tela atual não demonstra um pipeline completo.
12. Consolidar o que já existe antes de adicionar financeiro, mais canais, automações extensas ou dashboards novos.

**Critérios de dados para decidir o que merece investimento**

Não há telemetria suficiente nesta auditoria para afirmar frequência dos erros ou tempo perdido. Sugestões de medidas, com metas iniciais de discussão e não benchmarks universais:

| Medida | Como observar | Uso da informação |
|---|---|---|
| Tempo até identificar as 3 prioridades | Sessão real com gestor; contar tempo e trocas de tela | Validar a nova visão de comando |
| Sucesso de criação | Criar ação válida, fechar, reabrir e conferir | Detectar falhas e falsa confirmação |
| Persistência de limpeza e temas | Editar, salvar, recarregar, comparar | Garantir correção dos contratos |
| Falhas de mutation | Erros por operação e contexto, sem coletar conteúdo sensível desnecessário | Priorizar confiabilidade |
| Itens sem dono principal | Contagem sobre trabalho ativo | Melhorar distribuição e cobrança |
| Tempo parado por fase | Exige histórico das mudanças | Identificar gargalos reais |
| Tempo esperando cliente | Do envio à decisão | Separar atraso interno de espera externa |
| Retrabalho após aprovação | Nova versão posterior à decisão | Avaliar qualidade e clareza de aprovação |
| Reagendamentos por entrega | Exige histórico de data | Distinguir planejamento de adiamento recorrente |
| Carga por pessoa | Começar por estimativa simples de esforço, não só contagem | Evitar distribuir 10 tarefas desiguais como se fossem equivalentes |
| Reconciliação visual/banco | Arrastar/editar com falha controlada em homologação | Nunca manter aparência de sucesso após falha |
| Desempenho em celular | Medir navegação e interação com volume representativo | Escolher otimizações com evidência |

As verificações que eu exigiria para considerar a experiência confiável são: erro não perder rascunho; tentativa seguinte funcionar; lote não mentir sobre sucesso; nenhum dado do cliente errado aparecer; toda ação compartilhada ter audiência clara; agenda mostrar corretamente o período; e nenhum comando central depender exclusivamente de hover.

**Questões ainda abertas que afetam decisões futuras**

- O que “Feito” e “Concluído” significam operacionalmente hoje? Qual significa publicação, se algum?
- O campo de data representa prazo, produção ou publicação para cada tipo de ação?
- O gestor precisa enxergar tudo da agência ou só o que lhe foi atribuído? Os SQLs disponíveis divergem sobre admin.
- O cliente aprova no UZZINA ou responde por outro canal? A decisão precisa ficar registrada aqui?
- Quais das vistas alternativas são usadas toda semana? Quais existem só porque foram fáceis de acrescentar?
- Quantas pessoas editam a mesma entrega e qual o volume mensal real?
- Quais RLS, grants, triggers e definições de RPC estão efetivamente implantados?
- Há backup e restauração testada? O repositório não responde isso.
- O que mais causa retrabalho: encontrar informação, cobrar responsável, aprovação, atraso ou perda de alteração?

**Decisão técnica de fundo**

O tamanho do repositório, sozinho, não justifica uma reescrita. Os limites de confiança e os contratos de dados precisam ser corrigidos; as telas precisam ter prioridades mais claras. Manter TanStack, Supabase e Prism é compatível com isso. A separação já existente entre componentes, hooks e modelos oferece pontos de intervenção, mas não deve ser confundida com separação consistente de regras.

O objetivo de uma próxima etapa deve ser reduzir a quantidade de interpretação, dúvida e recuperação manual necessária para operar a agência. A escolha de quais achados virarão trabalho fica para a discussão seguinte, conforme solicitado.
