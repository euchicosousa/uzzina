# UZZINA atual — auditoria atualizada e instruções de correção

**Data:** 05/10/2026. **Projeto:** `/Users/euchicosousa/vercel/uzzina`.

**Atualização em 06/10/2026:** cláusula obrigatória de TDD adicionada conforme a skill de Matt Pocock. Esta atualização orienta as próximas alterações; não afirma que correções anteriores foram feitas em TDD.

Este é o documento de execução para a próxima rodada de correções na aplicação existente. Atualiza as orientações da auditoria de 26/09, incorporando a revisão de 05/10. O documento antigo permanece como histórico; suas sugestões de produto não são ordens de implementação.

## 1. Objetivo e limites desta rodada

Corrigir acesso, persistência, recuperação de erros e inconsistências comprovadas, preservando o funcionamento e a identidade do app atual. O agente realiza implementação e verificações por código. A revisão posterior com o usuário realiza os testes no app e navegador.

Trabalhe no UZZINA atual. Preserve React/TanStack Router SPA, TanStack Query, Supabase, Prism/React Aria, Tiptap, dnd-kit, Cloudinary, PP Object Sans, logotipo e temas existentes. Preserve home, página de parceiro, vistas atuais, Sprint e portal durante esta rodada, salvo ajustes diretamente necessários à correção de um defeito.

**Fora deste pacote:** reescrita, adoção de outro framework, nova home por abas, remoção automática de Feed/Categorias/Sprint, multiagência, publicação automática, métricas do Instagram, novos dashboards e nova hierarquia de projetos/responsáveis. Essas mudanças podem ser discutidas depois no app atual; não são pré-requisitos para corrigir os bugs.

Preserve os arquivos modificados por outros agentes. Antes de editar, releia o estado atual: as evidências abaixo são um ponto de partida, não uma garantia de que o arquivo continua idêntico.

## 2. Regras que devem continuar funcionando

- A ação é o objeto central; categoria/tipo identifica o trabalho e permanece no modelo.
- Toda ação tem parceiro. A própria agência pode ser um parceiro.
- Preserve responsáveis múltiplos equivalentes; não introduza líder obrigatório ou conclusão por pessoa.
- Preserve a distinção entre Feito e Concluído. Apenas Concluído encerra o ciclo; Feito pode continuar atrasado. Preserve a limpeza de Sprint ao concluir/arquivar.
- Preserve concluídas nas visualizações em que já são exibidas. Não crie ocultação global automática.
- A data principal representa quando executar o trabalho. Nesta rodada, não criar prazo/publicação como dois novos campos obrigatórios. Corrigir rótulos que prometam publicação sem esse dado.
- Preserve períodos mensais com semanas completas, de domingo a sábado. Datas de borda não são um bug. Se uma métrica conta a grade inteira, seu rótulo deve comunicar esse período.
- Preserve criação rápida ao sair do título quando os requisitos forem válidos, além do botão Criar. Editar uma ação existente deve continuar rápido e conservar o contexto.
- Na criação, mantenha o usuário criador como responsável inicial nos caminhos que já adotam esse padrão. Selecionar parceiro preenche contexto, sem substituir escolhas explícitas de responsáveis.
- O colaborador opera as ações às quais tem acesso; administração de clientes, equipe e contas do portal exige administrador. A proteção efetiva deve existir no banco/servidor, além da interface.

## 3. Estado inicial: o que reaproveitar e o que reabrir

Melhorias presentes no código revisado: token/JWT na API de IA; retirada de senha em claro dos handlers de clientes; liberação de locks em finally; Cmd+Enter aguardando salvamento; await nas operações em lote e inspeção de erros individuais; regra de limpeza de sprints; cache separado do Hoje por dia; filtros de modificadores nos atalhos; persistência de time; retirada de tópicos.

Preserve essas melhorias. Não as refaça apenas para trocar a implementação.

O relatório anterior não comprova o encerramento dos achados: há correções parciais e regressões. O resumo “20 resolvidos / 4 decisões / 28 pendentes” não corresponde à enumeração apresentada. A contagem futura deve ser derivada de uma lista por achado, distinguindo código, teste e produção.

Evidências reproduzidas em 05/10:

| Caso | Resultado | Alcance |
|---|---|---|
| Título digitado → blur | Zero chamadas de salvar | Componente real ActionTitleInput e callbacks do EssentialsTab em página isolada; sem banco |
| Kanban → salvamento rejeitado | Fase recuperada, ação ativa permaneceu | Hook real useKanbanDnd com falha simulada |
| Parse de campos de texto omitidos | description/instagram_caption/content_description viram null | Esquema Zod real, executado isoladamente |
| Validação de data/arrays | Data inválida e parceiros/responsáveis vazios aceitos | Esquema Zod real |
| Lint, TypeScript e build | Passaram | Não validam esses comportamentos nem políticas de produção |

Para detalhes e evidências adicionais, consulte `docs/audits/2026-10-05-revisao-das-correcoes.md` quando trabalhar no achado correspondente. Nenhum estado do banco/Vercel foi confirmado nessa revisão.

### 3.1. Cláusula obrigatória — execução por TDD

Esta cláusula rege C01–C06, S01–S05 e os ajustes complementares com comportamento testável. “Ajustar o código” não encerra um item: a entrega exige um comportamento especificado, evidência do teste e indicação do alcance da validação.

**Referência:** skill `tdd` de Matt Pocock, em `/Users/euchicosousa/.agents/skills/tdd/SKILL.md`, e seus guias `tests.md` e `mocking.md`. O método é **red → green**, em uma fatia de comportamento por vez. Refatoração pertence à revisão posterior, com testes verdes; não ampliar a arquitetura durante a correção mínima.

#### A. Delimitar o comportamento e a interface pública

Antes do primeiro teste, registre os limites públicos a testar e obtenha confirmação do proprietário para esse escopo. A skill exige: **“Test only at pre-agreed seams.”** Aqui, seam significa a interface pública onde se observa o resultado, sem inspecionar detalhes internos. Reaproveite confirmações existentes; confirme novamente apenas quando surgir um limite diferente ainda não acordado.

Esta tabela é a proposta inicial de limites, não uma confirmação já concedida:

| Área | Limite público proposto | Resultado que interessa |
|---|---|---|
| Gaveta e rascunho | Interações do componente real em DOM simulado ou operações públicas do fluxo de edição | Ação criada/editada, rascunho recuperável, estado de salvamento correto |
| Contratos e persistência | API pública de criação/atualização e leitura do domínio | Campo omitido preservado, limpeza explícita aplicada, entrada inválida recusada |
| Arraste e lote | Operações públicas e estado observável consumido pelas vistas | Movimento confirmado ou recuperado, resultado por item, gesto encerrado |
| Cache e sessão | Consultas/ações públicas da integração e estado entregue aos consumidores | Recorte correto, contexto da nova sessão, ausência de dados de outra audiência |
| Segurança e integrações | Handlers HTTP e interfaces públicas de autenticação/autorização | Acesso permitido/negado, resposta correta, nenhum segredo exposto |
| Datas e regras | Funções públicas do domínio usadas pelas telas | Período correto, invariantes preservadas, término/atraso conforme o contrato |

Se o desenho da interface estiver indefinido, esclareça-o antes do teste. Use `GLOSSARY.md` e ADRs existentes na área para nomes e contratos. Não crie uma API artificial apenas para expor estado privado ao teste.

Para cada comportamento, escreva: **dado um estado inicial, quando ocorrer uma ação, então qual resultado observável deve existir**. O resultado esperado vem da regra de produto ou de um exemplo calculado independentemente, não da reprodução do algoritmo atual.

#### B. Executar uma fatia vertical por vez

1. **RED:** escreva um teste de um comportamento na interface acordada e execute-o antes da mudança. Confirme que falha pela regressão/invariante desejada. Erro de import, ferramenta ausente ou falha de montagem não comprova reprodução do defeito.
2. **GREEN:** implemente apenas o necessário para esse teste passar, preservando contratos existentes. Execute o teste novamente e os testes relacionados à área alterada.
3. **Próxima fatia:** só depois escolha o próximo comportamento e repita red → green. Não escrever toda a suíte primeiro e depois toda a implementação.
4. **Revisão:** após as fatias verdes, revise clareza, duplicação e interfaces. Refatore somente quando houver benefício concreto, mantendo os testes de comportamento verdes e respeitando o escopo.

Para correção já feita por outro agente, escreva/verifique o teste contra o estado atual. Se necessário, demonstre a regressão numa cópia isolada da versão defeituosa, preservando o trabalho atual. Registre **teste de regressão posterior** quando não houve red antes da implementação; não invente histórico de TDD nem desfaça alterações compartilhadas para produzir uma falha.

#### C. Qualidade dos testes

- Execute o código real do projeto através do limite público. Prefira testes de integração do comportamento quando cobrem melhor o contrato.
- Use mocks nas fronteiras externas: Supabase/banco, OpenAI, upload/rede, relógio ou aleatoriedade quando necessários. Preserve os componentes, regras e colaboradores internos reais. Não substitua a função que deveria detectar o bug por uma implementação falsa.
- Simule sucesso, falha e respostas fora de ordem nas fronteiras apropriadas. Um SDK falso prova comportamento local, não policies reais do banco.
- Faça o nome do teste descrever o que a pessoa ou consumidor consegue fazer. Uma expectativa lógica por comportamento; múltiplas verificações são aceitáveis quando demonstram o mesmo resultado.
- Verifique resultado público: ação recuperável pela leitura, título exibido, rascunho preservado, resposta HTTP, seleção/restante e estado de consulta. Contagem/ordem de chamadas a métodos internos, refs privadas, classes CSS e snapshots amplos não substituem esse resultado.
- Não copie callbacks ou algoritmos de produção para dentro da fixture como se fossem o código testado. Os testes duráveis devem importar/exercitar a implementação real; uma reprodução diagnóstica anterior não substitui a regressão automatizada.
- Evite assertivas tautológicas: o valor esperado deve poder discordar da implementação. Não medir qualidade por percentual arbitrário de cobertura, quantidade de testes ou número de mocks.

#### D. Exemplos de critérios, sem prescrever a implementação

| Item | Dado / quando | Então — comportamento público esperado |
|---|---|---|
| C01 | Rascunho válido; digitar título e sair do campo | A ação fica criada e pode ser recuperada; repetir salvar não cria duplicata |
| C01 | Ação existente; consultar sem editar | O registro público permanece inalterado, inclusive sua versão de edição |
| C02 | Ação com legenda; atualizar apenas a fase | A leitura continua retornando a legenda original |
| C02 | Ação com legenda; solicitar limpeza explícita | A leitura retorna a legenda vazia conforme o contrato definido |
| C03 | Editar dois campos; receber respostas fora de ordem | A leitura/estado confirmado preserva as duas alterações e o rascunho recente |
| C04 | Responsável escolhido; trocar parceiro | O rascunho conserva o responsável escolhido |
| C05 | Soltar ação; gravação rejeitada | A vista recupera posição/fase anterior, encerra o gesto e informa falha |
| C05 | Lote com um item recusado | Resultado informa quais mudaram e conserva a possibilidade de repetir o item recusado |
| C06 | Trocar identidade | Consumidores não recebem dados privados da identidade anterior |
| S01/S02 | Identidade sem permissão; tentar operação protegida | Operação é recusada sem ler/gravar dados proibidos |
| S04 | Criar nota interna; consultar pela audiência do cliente | A nota não está disponível por essa interface |

Os testes de cada área devem usar as interfaces que realmente existirem no projeto ou forem acordadas durante a implementação. Esta tabela define resultados, não exige nomes novos de funções, estruturas novas ou uma reescrita.

#### E. Impedimentos e conclusão

Sem navegador, prossiga com testes de domínio, handlers, integração com fronteiras externas falsas e componentes reais em DOM simulado. Jornadas em navegador e celular continuam na seção 8. Sem banco de teste, prepare os casos de autorização e registre integração/RLS pendente; resultados de mocks não são substitutos.

Se não for possível testar localmente um comportamento, identifique a dependência concreta, o teste preparado/planejado e seu resultado esperado. Conclua trabalhos independentes. Código implementado sem essa execução permanece **implementado, teste pendente**, nunca **testado**.

Para cada fatia entregue, registre no relatório: interface acordada, comportamento, arquivo/nome do teste, comando, falha RED observada, resultado GREEN e limitações. Anexe saídas relevantes sem credenciais/dados sensíveis. Para testes posteriores a uma correção existente, registre essa condição em lugar de RED fictício.

**Critério de aceite do item:** resultados observáveis definidos, testes disponíveis passando, verificações da área passando e pendências externas explicitadas. Lint/build isolados ou uma afirmação “ajustado” não atendem a esse critério.

## 4. Execução — primeiro, confiabilidade dos dados

Implemente os itens abaixo em ordem, com mudanças revisáveis. Cada item termina quando o comportamento do código e seus testes disponíveis atendem ao critério. A ausência de navegador não impede esses trabalhos.

### C01 — título, criação e fechamento da gaveta [09, 10, 51]

**Ponto de partida:** `action-drawer/EssentialsTab.tsx`, `ActionTitleInput.tsx`, `ActionFormDrawer.tsx`, `ActionFormFooter.tsx`.

O onChange atual já grava o título no rascunho. Compará-lo a `RawAction.title` no blur não distingue edição de ausência de mudança.

Compare com o último título confirmado no salvamento, por ação. Rascunho válido sem ID deve criar ao sair do título; título alterado em ação existente deve atualizar; simples consulta não deve gravar. Atualize a referência de confirmação apenas após sucesso. Ao trocar de ação, reinicialize-a para o registro correto.

Use um único controle de criação em andamento para blur, botão e atalho. Um segundo pedido não cria outra ação. Se um pedido de fechar/salvar chega durante a criação, coordene-o com a promessa em andamento e o ID resultante, preservando o texto mais recente.

Audite também Escape, clique externo, botão fechar e troca de ação: alterações ainda não confirmadas precisam ser salvas ou permanecer recuperáveis. O rascunho não deve desaparecer silenciosamente por erro. Preserve a velocidade do autosave; confirmação de descarte deve se limitar a conteúdo realmente pendente que seria perdido.

**Testes sem navegador:** consultar sem alteração; editar título; criar no blur; blur+botão simultâneos; falha e nova tentativa; tentativa de fechar durante salvamento; resposta antiga depois de nova digitação. Testes de componente podem usar ambiente DOM simulado e mutations falsas.

### C02 — contratos de criação e atualização [07, 08, 47]

**Ponto de partida:** `app/utils/validation.ts`, `app/lib/supabase.mutations.ts` e callers.

Separe input de criação de patch de atualização. Em patch: ausência/undefined preserva o campo; vazio explícito ou null limpa campos que aceitam limpeza; valor presente substitui. A correção de nullableString deve preservar essa distinção, inclusive na serialização para Supabase. Aplique também aos arrays opcionais de arquivos e sprints.

Valide parceiro obrigatório, responsáveis conforme a regra existente e datas reais nos formatos suportados. Enumere fase/categoria/prioridade a partir das constantes de domínio, mantendo compatibilidade com os registros existentes. Preserve time no contrato. Atualizações de fase/data não devem exigir reenvio de todo o texto da ação.

**Testes sem navegador:** omitir, limpar e substituir cada campo; preservar outros campos em patch; data inválida; arrays vazios; round-trip de time; payload efetivamente enviado ao SDK falso. Se um legado incompatível for localizado, registre e prepare migração explícita, em vez de descartá-lo silenciosamente.

### C03 — coordenação de autosave e respostas [11]

**Ponto de partida:** `ActionFormDrawer.tsx`, `useActionMutations.tsx`, mutations de ações e fluxos de IA/upload.

Envie apenas campos modificados. Coordene gravações por ação, cobrindo todas as origens relevantes, em vez de bloquear a aplicação inteira. Uma resposta antiga não pode substituir campos editados depois do início da requisição. Preserve rascunho/patch pendente em falha e apresente estado de salvamento correspondente ao resultado real.

Para edições em sessões distintas, prepare controle de versão: comparação atômica de updated_at ou versão equivalente na persistência. Ausência de correspondência deve gerar conflito, não confirmação de sucesso. A próxima versão usada deve vir da resposta confirmada. Se exigir mudança de banco, separe código/migration e registre aplicação pendente.

**Testes sem navegador:** dois patches rápidos; respostas fora de ordem; falha seguida de sucesso; texto digitado enquanto IA/upload responde; conflito simulado. Documente como duas sessões serão verificadas depois no app.

### C04 — defaults e contexto de criação

**Ponto de partida:** `app/utils/factory.ts`, `AppBar.tsx`, `app/routes/app.tsx`, `ActionFormDrawer.tsx`, criação por parceiro/calendário.

Centralize a construção do rascunho. Preserve data e parceiro fornecidos pelo ponto de entrada, a seleção explícita de responsáveis e o usuário criador como default. Corrija o efeito da gaveta que substitui responsáveis pelos integrantes do parceiro. Use o ID atual confirmado, não apenas o ID inicial de BaseAction, para distinguir ação criada de rascunho.

Ao reabrir ou trocar um rascunho, título, descrição, conteúdo e arquivos devem pertencer ao mesmo rascunho. Trocar parceiro não deve reaproveitar estado residual de outra ação. Evite três interpretações concorrentes da URL entre fábrica, botão e gaveta.

**Testes sem navegador:** botão/atalho/parceiro/calendário; seleção manual preservada após troca de parceiro; duas criações consecutivas; criação confirmada seguida de nova edição.

### C05 — drag and drop e operações em lote [12, 13, 14, 15, 38]

**Ponto de partida:** `useKanbanDnd.ts`, `CalendarWithDnd.tsx`, `BulkActionMenu.tsx`, `useMultiSelection.tsx`, mutations.

Encerre o gesto e limpe activeAction em sucesso, cancelamento e falha. Trate rejeições e remova somente o override correspondente à operação que terminou. A resposta de um arraste anterior não pode apagar o estado de um novo arraste da mesma ação. Preserve rollback e reconciliação com o cache canônico.

No lote, escolha um contrato explícito: atomicidade no banco quando disponível, ou resultado por ID. Liste falhas parciais; mantenha os itens que precisam de nova tentativa; confirme a contagem realmente afetada. A ausência de erro do SDK não basta se foram afetadas menos linhas que as solicitadas. O otimista deve espelhar conclusão/arquivamento e limpeza de sprints.

Restrinja seleção ao recorte atual ou torne itens ocultos explicitamente revisáveis. Cmd+A deve selecionar ações efetivamente visíveis, sem misturar outra vista/contexto. Preserve a exclusão dos atalhos nativos em campos editáveis.

**Testes sem navegador:** rejeição de arraste; cancelamento; dois arrastes da mesma ação; lote parcialmente salvo; zero linhas afetadas; conclusão/arquivamento em todos os caminhos; mudança de contexto com seleção.

### C06 — cache, sessão e bootstrap [16, 17, 18]

**Ponto de partida:** `query-keys.ts`, `useActionMutations.tsx`, `app/routes/app.tsx`, rotas de leitura e comentários.

Inclua nas chaves os parâmetros que mudam dados ou audiência: identidade, período, parceiros e visibilidade conforme a consulta. Cache de comentários públicos e internos deve ter escopo distinto. Limpe/cancele dados sensíveis na saída/troca de identidade e reinicialize bootstrap/contexto para a nova pessoa.

Use initialData do Hoje somente quando o cache de origem cobrir o dia e escopo solicitados. Preserve data de atualização do cache quando relevante. Uma lista vazia derivada de período não consultado não é evidência de dia sem ações.

Atualizações otimistas precisam respeitar o recorte de cada lista. Crie um único ID temporário por mutation; não gere IDs por relógio dentro de cada updater. Evite atualizar atrasados duas vezes por prefixos sobrepostos. Reconcile resultado persistido e temporário sem duplicação.

Faça os parceiros compartilhados acompanharem edições administrativas por uma fonte consultável/invalidável. Invalidar uma query não atualiza automaticamente um useState preenchido no bootstrap.

**Testes sem navegador:** dia dentro/fora da cobertura; parceiro alterado; troca de usuário; audiência de comentários; criar/mover/concluir sem contaminar listas de outros períodos; rollback sem desfazer uma mutation posterior.

## 5. Execução — acesso, confidencialidade e portal

Esses itens também são trabalho de código. Dependência de banco/hospedagem deve ser descrita separadamente; não rotule como concluído em produção sem acesso e evidência.

### S01 — identidade dos usuários do portal [01, 02]

**Ponto de partida:** `app/models/clients.ts`, `dash.tsx`, `dash/login.tsx`, cadastro/edição de clients.

O contrato alvo é identidade validada pelo servidor e autorizada por parceiro. Aproveite Supabase Auth ou uma sessão de servidor equivalente com expiração/revogação; mantenha perfil de cliente separado do perfil da equipe. Um ID em localStorage serve no máximo como preferência, nunca como credencial suficiente. O navegador não deve receber password_hash para comparar senha.

Prepare cadastro, login, retomada, logout, troca de senha e desativação. Operações privilegiadas de criação/vínculo de identidade ficam no servidor. Não leve service-role ou segredos ao bundle. Preserve senhas existentes apenas se houver migração comprovadamente compatível; se não houver, planeje ativação/redefinição. Não substitua credenciais existentes por hashes inventados nem prometa migração de 100% sem comprovação.

**Testes sem navegador:** sessão ausente/inválida/expirada; identidade sem parceiro; cliente arquivado; cadastro permitido só ao admin; respostas sem hash; revogação. Banco indisponível: entregar migrations/código coerentes e marcar integração pendente, sem quebrar silenciosamente o fluxo publicado ou manter um fallback inseguro como definitivo.

### S02 — autorização e banco reproduzível [04, 05, 48]

**Ponto de partida:** `supabase/`, `api/create-user.ts`, routes/admin, RPCs chamadas pelo app.

Se houver acesso ao banco, primeiro inventarie schema, policies, grants, funções, triggers e assinaturas por leitura. Sem acesso, registre a lacuna e prepare scripts de inspeção/migrations, sem assumir a definição implantada. O SQL local ainda tem quatro parâmetros e state; o frontend chama cinco parâmetros e phase.

Versione schema e mudanças reais em migrations. RPCs devem derivar/validar identidade e acesso contra a sessão; parâmetros p_user_id/parceiros não são autorização por si. Em SECURITY DEFINER, limite privilégios, fixe search_path apropriado e verifique escopo explicitamente.

Proteja leitura/escrita de ações, parceiros, pessoas e clientes. Colaborador não pode alterar admin, cadastrar equipe/contas ou acessar ações alheias. Acrescente guards de rota para acesso direto às telas administrativas; mantenha proteção no banco/servidor independente do guard.

**Testes sem navegador:** matriz de acesso com SQL/backend ou mocks de fronteira. Teste real de policies exige banco de teste; mocks não comprovam RLS. Scripts devem incluir casos permitido/negado e tentativa de mudar identidade/parceiro/flag admin. Aplicação em produção e validação de grants ficam registradas à parte.

### S03 — API de IA [03]

Preserve verificação do token e getUser. Valide membro ativo/permissão de usar IA; trate configuração ausente e erros de autenticação dentro do limite de erro do handler. Valide corpo, intent, tamanhos e estrutura de saída. Defina limites de consumo com persistência adequada ao serverless, sem depender apenas de contador em memória de uma instância.

**Testes sem navegador:** sem token, token inválido, usuário sem permissão, entrada inválida, upstream falho e limite atingido. Falsifique OpenAI nos testes: nenhuma geração paga é necessária. A ausência de chave no código não comprova remoção nas variáveis/bundles publicados.

### S04 — HTML e audiência de comentários [06, 23]

Defina política de HTML permitido compatível com o conteúdo real do Tiptap. Use sanitização mantida e centralizada, incluindo entradas de IA/API e renderizações do portal. Preserve tabelas, listas, links e formatação suportada. Validar somente o editor de entrada não protege contra conteúdo vindo de outro caminho.

Na equipe, torne Nota interna e Mensagem ao cliente explícitas; novas notas operacionais ficam internas por padrão. Preserve flags de comentários já existentes, sem reclassificá-los em massa. Portal consulta somente público; autorização deve impedir acesso direto a notas internas, além do filtro visual/cache.

**Testes sem navegador:** HTML malicioso/URL perigosa, conteúdo legítimo do editor; novo comentário interno/público; portal exclui interno; caches de audiência separados.

### S05 — revisão e aprovação [21, 22]

Corrija o contrato de acesso e escopo do link: IDs precisam pertencer ao parceiro e à audiência autorizada. Preserve o uso existente de compartilhamento sem ampliar acesso implicitamente. Para link sem login, preparar token verificável com expiração/revogação; para acesso autenticado, manter continuidade do destino após login.

Enquanto não existe decisão registrada sobre uma versão, nomeie o recurso como compartilhar para revisão, sem afirmar aprovação concluída. Um workflow novo de aprovação/versionamento fica para discussão posterior; não é exigido neste pacote.

**Testes sem navegador:** IDs de parceiro diferente, token inválido/expirado/revogado quando aplicável, sessão sem acesso e continuidade do destino.

## 6. Execução — consistência do app existente

Após os contratos anteriores, corrija os seguintes problemas sem redesenhar o produto:

| Item / achados | Instrução de código | Verificação possível sem navegador |
|---|---|---|
| Busca [19] | Cancelar ou descartar respostas obsoletas; escolher parceiro acessível entre os relacionados; tratar ausência com guarda | Respostas invertidas e ação cujo primeiro parceiro não está no contexto |
| Erros [20] | Separar carregando, vazio, sem acesso e falha; preservar dados desatualizados com aviso quando cabível; oferecer tentar novamente | Estados de query e tentativas com mocks |
| Stories [24] | Separar “conteúdo de rede social” de “entra no feed”; manter dados equivalentes entre desktop/mobile e edição compatível | Predicados e composição de listas; layout fica para revisão posterior |
| Calendário do portal [25] | Navegar por mês, consultar período visível e preservar semanas completas usadas pelo calendário | Janeiro/fevereiro, ano bissexto, mudança de ano, bordas domingo/sábado |
| Métricas/data/fases [26,27,28] | Esclarecer período contado e data de execução; manter Feito distinto de Concluído | Contagem por período e regras de encerramento/atraso existentes |
| Foco [29] | Preservar ordenação de itens temporariamente ocultos por filtro | Filtrar e limpar filtro mantém ordem anterior |
| Navegação [32] | Oferecer acionamento por botão/toque/teclado onde hoje há somente hover, usando Prism | Semântica, handlers e estados; facilidade real de uso fica para navegador |
| Controles/atalhos [36,37,43] | Dar nomes acessíveis e estado textual aos controles centrais; preservar exclusão de modificadores; foco/teclado em overlays | Testes DOM simulados; a11y local nos componentes tocados, sem uma faxina global de lint |
| Notificações/ajuda [39] | Corrigir composição de trigger/popover; caminhos visíveis devem ter função real ou estado honesto de indisponibilidade | Composição/handlers; abertura, foco e navegação serão testados depois |
| Preferências [45] | Atualizar fonte local após salvar e mesclar mudanças sem reintroduzir snapshot antigo; tratar falhas e debounce em voo | Duas mudanças sequenciais e durante requisição; conflito/migração se necessário |
| Duplicação [46] | Fazer título/payload otimistas e persistidos coincidirem; preservar contrato atual, explicitando os campos copiados | Comparar cópia exibida e enviada; não inventar nova fase/data automática |
| Pessoas arquivadas [52] | Separar consulta de pessoas ativas para seletores da consulta administrativa completa | Admin obtém arquivadas; seletor de responsáveis continua somente com elegíveis |
| Qualidade [49] | Incluir APIs na verificação de tipos por config/script próprio; integrar os testes críticos à rotina do projeto | Scripts passam e testes de regressão falham com comportamento defeituoso |

**Casos mantidos para avaliação posterior:** posição dos blocos, repetição multiparceiro, modos de filtro, densidade, hierarquia de produto, métricas de capacidade, mobile e desempenho real [30,31,33,34,35,40,41,42,44,50]. Preserve o produto nesta rodada. Corrija um bug concreto encontrado nesses caminhos, mas registre alterações maiores como propostas separadas.

## 7. Responsabilidades de validação

| Camada | Responsável nesta rodada | O que comprova |
|---|---|---|
| Leitura, alteração, lint, tipos, build | Agente de implementação | Coerência estática/compilação |
| Testes de domínio, SDK/API falsos e DOM simulado | Agente de implementação | Contratos locais e recuperação com falhas controladas |
| SQL/RLS/RPC real em ambiente de teste | Agente, se tiver acesso; caso contrário, pendência entregue | Autorização/persistência efetivas no banco testado |
| Jornadas no app/navegador e inspeção visual | Revisão posterior aqui com o usuário | Integração real, contexto, foco, salvamento e comportamento percebido |
| Celular físico e teclado virtual | Revisão posterior com dispositivo disponível | Uso real em Safari/Android; emulação de largura não basta |
| Deploy, variáveis/grants de produção, migração/recuperação | Verificação própria com acesso e autorização adequados | Estado publicado; não é consequência automática do merge/build |

O agente deve criar uma suíte pequena de regressões dos contratos alterados, com ferramentas compatíveis com o projeto. **Não precisa ter navegador para testar lógica, requisições falsas, promessas concorrentes ou componentes em DOM simulado.** Quando uma capacidade não estiver disponível, concluir o restante e indicar precisamente o teste pendente. Não simular um resultado aprovado.

## 8. Checklist que será executado aqui depois

Preparar registros de teste e instruções para estas jornadas; a execução em registros reais é uma etapa separada:

1. Abrir ação e sair sem mudar nada; verificar que não houve escrita desnecessária.
2. Criar por título/blur, botão e atalho, incluindo falha de rede e nova tentativa; confirmar uma única ação após recarregar.
3. Alterar título/descrição/legenda, limpar campos, editar rapidamente e reabrir; conferir dados persistidos.
4. Fechar por botão, Escape, clique externo e durante salvamento; confirmar preservação/recuperação do rascunho.
5. Alterar parceiro após escolher responsáveis; verificar que a escolha permanece.
6. Arrastar no calendário/Kanban com sucesso, erro e arrastes sucessivos; conferir estado após refetch/recarregamento.
7. Executar lote com resultado parcial; verificar contagem, seleção restante e mensagem.
8. Mudar dias/períodos, incluindo fora do mês carregado; conferir cache, vazios e erro/tentar novamente.
9. Trocar login admin/colaborador/cliente; verificar contexto, cache, acesso direto e contas arquivadas. Testes de políticas precisam de requests/banco, além do navegador.
10. Criar nota interna e mensagem pública; conferir o portal e o link de revisão no parceiro correto.
11. Inspecionar Stories, calendário do portal, preferências, busca, notificações e recuperação de pessoas arquivadas.
12. Usar teclado e larguras móveis; testar foco, toque, controles, gaveta, arquivos e teclado virtual em dispositivo físico quando disponível.
13. Testar edição simultânea em duas sessões e geração/upload com rascunho sendo editado.

Build/lint, mocks e essas jornadas são evidências distintas. Nenhum resultado isolado autoriza afirmar “seguro”, “mobile perfeito” ou “100% resolvido”.

## 9. Entrega obrigatória do agente

Entregue código, testes e migrations/configuração necessários; preserve mudanças anteriores. Atualize a documentação dos contratos alterados. Siga as convenções do repositório, usando tipos seguros e componentes Prism nos ajustes de UI.

Acrescente `docs/audits/2026-10-05-retorno-da-implementacao.md` com:

- Commit/base revisada e arquivos alterados.
- Por C01–C06, S01–S05 e item complementar: comportamento anterior, mudança, interface de teste acordada, arquivo/nome/comando do teste, evidência RED → GREEN ou indicação de regressão posterior, resultado e alcance da validação.
- Dependências de banco/hospedagem: migrations preparadas, aplicadas em qual ambiente e como foram verificadas.
- Relação por número dos achados 01–52: corrigido no código, parcialmente corrigido, preservado por decisão, adiado ou não verificado. Totais calculados dessa relação, sem duplicar o achado 08 por tratar dois assuntos.
- Verificações ainda pendentes aqui, com passos, dados de teste e resultado esperado.
- Riscos conhecidos e decisões que exigem o proprietário. Não reabrir como requisito as escolhas já delimitadas neste documento.

Use os estados **implementado**, **testado localmente**, **validado no banco de teste**, **pendente de navegador** e **pendente de produção** de forma explícita. Exemplo: “C01 implementado e testado em DOM simulado; criação/recarga no app pendente”.

**Condição de encerramento da rodada do agente:** correções possíveis concluídas, verificações disponíveis executadas, impedimentos externos identificados por item e retorno pronto para revisão aqui. Sem acesso externo, não marque como concluída a autorização do banco ou a migração publicada. O próximo passo será confrontar esse retorno com código e app, reproduzir as jornadas e corrigir o que permanecer.

## Referências

- Histórico: `docs/audits/2026-09-26-analise-uzzina.md` — consultar evidência original por número; alternativas de UX permanecem propostas.
- Parecer atualizado: `docs/audits/2026-10-05-revisao-das-correcoes.md` — consultar detalhes técnicos e rastreabilidade quando abordar o item.
- Método de execução: `/Users/euchicosousa/.agents/skills/tdd/SKILL.md`, `tests.md` e `mocking.md` — testes por interfaces públicas, fatias red → green e mocks somente nas fronteiras externas.
- [OWASP — armazenamento de senhas](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
