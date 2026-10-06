# UZZINA — revisão das correções e próximos passos

Data: 05/10/2026. Revisão da aplicação atual em `/Users/euchicosousa/vercel/uzzina`, sem continuar o protótipo Uzzina 2026.

## Conclusão

As mudanças corrigem problemas reais, mas não sustentam o rótulo geral de “resolvido e validado” usado no relatório recebido. Há correções parciais, uma regressão na gravação do título e problemas de segurança ainda presentes no código. A experiência principal continua essencialmente a mesma; estabilizar mutations não equivale a simplificar o produto.

Recomendação: continuar no app atual, corrigir os contratos de acesso e gravação e depois transformar a home existente em uma superfície com abas, reutilizando Prism, fonte, cores e componentes. Não há evidência nesta revisão que justifique trocar a stack ou reescrever tudo.

## Escopo e evidência

- Referência inicial: `docs/audits/2026-09-26-analise-uzzina.md` e relatório de confronto colado pelo usuário.
- Revisado o commit `4087fcb`, seu estado anterior e o estado atual dos fluxos relevantes. Não atribuo alterações anteriores a esse commit sem evidência.
- Preservadas as três alterações locais já existentes: `ActionFormDrawer.tsx`, `AppBar.tsx` e `app/routes/app.tsx`.
- Nenhum código da aplicação foi alterado nesta revisão. Este documento é o único novo arquivo de trabalho.
- Lint: passou, 217 arquivos checados. Typecheck da aplicação: passou.
- Build: passou, gerado fora do projeto em `/tmp/uzzina-review-2026-10-05`. Chunk principal: 980,19 kB / gzip 291,10 kB; editor rico: 513,87 kB / gzip 159,19 kB. Continua o alerta de chunks grandes; esses números não medem velocidade real.
- APIs também passaram em uma conferência TypeScript separada, com resolução de imports compatível com a raiz do projeto. O comando normal do projeto ainda exclui `api/**/*`.
- Reprodução isolada com o componente real `ActionTitleInput` e os callbacks do título de `EssentialsTab`: digitar e sair do título resultou em **zero chamadas de salvar**. Sem backend; demonstra a sequência local de eventos, não uma jornada completa em produção.
- Reprodução isolada com o hook real `useKanbanDnd`: após rejeição simulada do salvamento, a fase voltou para a original, mas a ação ativa continuou definida.
- Execução do esquema Zod real: campos de texto omitidos viram `null`; data inválida e arrays vazios de parceiros/responsáveis são aceitos.
- Não foi acessado o banco em produção, Vercel nem uma sessão real da equipe. Não confirmo migrations aplicadas, políticas/grants reais, chaves removidas da hospedagem, histórico de incidentes nem comportamento em celular físico.

## O relatório precisa ser corrigido

O sumário anuncia 20 resolvidos, quatro decisões e 28 pendências. A enumeração apresentada contém 15 números distintos na seção de implementados, dois na seção de decisões e 19 na tabela de pendências. O achado 08 aparece em duas seções. São **35 dos 52 achados representados por número**, além de ajustes complementares sem número.

Faltam nessa enumeração: **18, 29, 31, 33, 34, 35, 36, 38, 39, 41, 42, 43, 44, 47, 48, 49 e 50**. Isso não prova que nunca foram tratados; significa que o documento não demonstra o confronto completo que anuncia.

Outras divergências:

- “Nove tabelas” vem acompanhado de uma lista de oito nomes. A extensão das mudanças no banco exige inventário real.
- SHA-256 com salt seguro via pgcrypto não aparece como contrato reproduzível no repositório. O código usa SHA-256 com prefixo fixo no navegador.
- Sanitização, autenticação do portal e autorização não podem ser encerradas só por ligar RLS. Precisamos conhecer as condições das políticas e o comportamento das RPCs.
- O achado 30 é sobre a posição do trabalho em risco na home; não é o mesmo problema do hover do achado 32.
- As alternativas de produto da auditoria antiga eram propostas para discussão. Não devem ser automaticamente convertidas em requisitos.

## Melhorias confirmadas no código

1. `createClient` e `updateClient` separam `password` do objeto gravado; consultas administrativas deixam de selecionar o hash. Isso reduz exposição, mas não corrige a autenticação do portal inteiro.
2. `/api/ai` exige token e consulta `auth.getUser()`. O cliente envia Authorization; o fallback da chave OpenAI com prefixo VITE foi removido do handler. A configuração publicada não foi conferida.
3. Os bloqueios de criação usam `finally`, permitindo liberar a tentativa após erro.
4. O atalho Cmd+Enter aguarda o resultado e só fecha após sucesso. Não garante que todos os caminhos de fechamento preservem edições.
5. O lote aguarda mutations e verifica `error` nas respostas individuais de data/hora.
6. Conclusão e arquivamento limpam sprints na mutation individual e no lote genérico.
7. Hoje ganhou chave própria por usuário/dia e a data selecionada passou a dirigir a consulta.
8. Atalhos de fase ignoram Meta/Ctrl/Alt, corrigindo a interferência com comandos do sistema.
9. `time` entrou no schema. Tópicos saíram dos componentes/tipos examinados.
10. Nova ação pelo botão/atalho recebe o parceiro da página quando disponível.

São melhorias específicas verificadas por leitura. Não são declaração de validação operacional completa.

## Problemas prioritários encontrados

### 1. Título deixa de criar ou salvar ao perder foco — alta

Em `EssentialsTab.tsx:124`, o blur retorna se o título coincide com `RawAction.title`. Entretanto, o onChange já escreve cada tecla em `RawAction.title`. Ao sair do campo, a igualdade é esperada mesmo quando houve edição.

Consequência: a tentativa de eliminar updates sem mudança pode eliminar a criação rápida aprovada e a gravação de alterações no título. Outro salvamento posterior pode acabar persistindo o texto, mas o blur sozinho deixa de cumprir o contrato.

Correção proposta: comparar com o último título confirmado pelo servidor, distinguindo rascunho novo, alteração e visualização sem mudança. Atualizar essa referência apenas após sucesso. Manter criação no blur e botão Criar. Cobrir as três situações com teste de regressão.

### 2. Portal continua sem identidade verificável pelo servidor — crítica

`app/models/clients.ts:5` usa prefixo fixo `uzzina_v1_salt_`, SHA-256 e comparação no navegador. `authenticateClient` pede `password_hash` ao banco. `dash/login.tsx` salva apenas `uzzina_dash_client_id`; `dash.tsx` retoma por esse ID. `getClientById` não exige `active = true`.

A senha em texto puro deixou de ser enviada para persistência nesses handlers, mas a raiz dos achados 01/02 permanece. Não foi testada exploração nem confirmado acesso anônimo em produção. Se a RLS negar esse fluxo, o portal pode falhar; se liberar dados com base insuficiente, o acesso não está protegido só pela interface.

Correção proposta: autenticação real para os usuários de clientes, com identidade assinada, autorização por parceiro e revogação de conta arquivada. Preferir aproveitar o sistema de identidade existente, mantendo perfil de cliente separado do membro da equipe.

SHA-256 rápido não é adequado para armazenar senhas; referência: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). RLS exige políticas e identidade coerentes: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### 3. Banco ainda não é reproduzível pelo repositório — alta

`supabase/rpc_functions.sql` continua mostrando quatro argumentos e o campo `state`; o frontend usa cinco argumentos e `phase`. Não há cadeia de migrations de schema, policies e grants no diretório examinado. A definição de `get_app_bootstrap` usada pelo app não está versionada ali.

Revogar execução para anon/public não demonstra isolamento entre usuários autenticados, nem valida os parâmetros aceitos por uma função privilegiada. Não confirmo qual definição foi implantada.

Próximo passo: exportar as definições reais de funções e políticas, versionar migrations e testar acesso permitido/negado. Não executar o SQL antigo disponível como se fosse a configuração atual.

### 4. Correção de limpeza também transforma ausência em exclusão — alta

`nullableString`, em `validation.ts:48`, devolve `null` para `undefined`. Na reprodução, um input sem descrição, legenda ou conteúdo ganhou os três campos com `null` após parse.

Um update que omite texto pode, portanto, apagá-lo. Os caminhos que enviam snapshots completos podem evitar esse caso específico, mas mantêm a disputa entre snapshots antigos. Não houve demonstração de perda real no banco.

Correção proposta: três estados diferentes — campo ausente não altera; campo vazio explícito limpa; valor presente substitui. Separar contratos de criação e atualização; enviar patches e preservar rascunho em erro.

### 5. Arraste ainda não encerra corretamente quando o salvamento falha — alta

O finally remove o override em `useKanbanDnd.ts:58`, mas `setActiveAction(undefined)` está depois do bloco que pode rejeitar. A reprodução confirmou a ação ativa após erro. `CalendarWithDnd.tsx` tem a mesma estrutura.

Correção proposta: limpar também a ação ativa no finally e tratar a rejeição no limite da interação. Em falha, mostrar erro e voltar para o estado canônico. Evitar que o encerramento de uma requisição antiga apague o override de um arraste mais recente da mesma ação.

### 6. Responsável escolhido ainda pode ser substituído pelo parceiro — alta para o fluxo definido

Em `ActionFormDrawer.tsx:410`, mudar o primeiro parceiro de um rascunho substitui `responsibles` pela lista de integrantes dos parceiros. A condição usa `BaseAction.id`, que também pode permanecer vazio após criação na gaveta.

Isso contraria a decisão: responsável inicial é quem cria; escolher parceiro não desfaz a seleção de responsáveis feita pela pessoa.

Correção proposta: centralizar defaults de criação, aplicá-los uma vez e preservar escolhas explícitas. Contexto de parceiro deve preencher parceiro, sem reatribuir o trabalho silenciosamente.

### 7. Segurança e recuperação de cache continuam incompletas — alta

- Chaves de parceiro, pessoas e notificações não incluem toda a identidade/visibilidade relevante.
- Logout não limpa o QueryClient nos caminhos lidos; sessão nova também precisa de bootstrap coerente.
- Hoje reaproveita qualquer cache da home, sem verificar cobertura do dia. Para datas fora do período carregado, pode nascer um vazio provisório indevido. `staleTime: 0` provoca refetch, mas não transforma cache incompleto em resultado válido.
- O cache da home não inclui período nem parceiros usados na RPC.
- Updates otimistas afetam todas as listas `actions`; a criação é inserida em todas e depois refetched, sem respeitar o recorte de cada chave.
- Atrasados já está dentro do prefixo `actions`, mas recebe também uma segunda atualização pelo prefixo `actions/late`. Na criação, temporários calculados por relógio podem divergir; o contrato precisa de um ID único por mutation.

Correção proposta: chaves por identidade/recorte, limpeza em troca de sessão, seed só quando a cobertura for conhecida e atualização por pertencimento à consulta. Não solucionar isso com mais refetch indiscriminado.

### 8. Atualizações simultâneas ainda podem sobrescrever conteúdo — alta

`updateAction` envia `...current` com um patch e substitui todo o rascunho pela resposta. Não há fila por ação nem controle de versão. Isso afeta também duas mudanças da mesma pessoa, uploads e respostas de IA, não só dois profissionais editando juntos.

Correção proposta: campos modificados, serialização das gravações por ação e comparação de versão para conflitos entre sessões. Feedback Salvo/Salvando/Falhou deve acompanhar a operação efetiva.

### 9. Lotes detectam erro, mas não comunicam resultado parcial — alta/média

Promise.all de N updates continua permitindo que alguns gravem e outros falhem. O código lança o primeiro erro, sem informar quais itens deram certo. No update genérico, a contagem do toast usa IDs selecionados, não linhas retornadas; uma restrição de acesso pode afetar menos linhas sem erro equivalente.

Correção proposta: operação atômica quando adequado ou retorno de sucesso/falha por ID. Contagem e seleção precisam representar o que realmente foi salvo. O otimista de lote também deve refletir a remoção de sprint ao concluir.

### 10. Comentários internos, HTML e autorização administrativa continuam pendentes — alta

- `ObservationsTab` ainda cria comentários com `is_internal: false` sem escolha de audiência no compositor lido.
- HTML é renderizado sem sanitização explícita nos pontos examinados do portal.
- Rotas administrativas não têm guard equivalente à proteção visual do menu; permissões do banco real ainda não foram conferidas.
- A API de IA valida identidade, mas não verifica membro ativo/permissão da agência nem aplica limites de consumo no código lido.

São problemas diferentes: guard melhora navegação; banco/servidor protege dados; sanitização trata HTML; audiência evita exposição operacional. Não substituir um controle pelo outro.

## Decisões de produto que devem permanecer

- Uma data principal para executar a ação. Publicação automática continua futura; não criar `due_date`/`publish_date` só porque a auditoria antiga sugeriu.
- Feito e Concluído têm significados distintos. Apenas Concluído encerra a ação. Melhorar a explicação sem inventar fases por colaborador.
- Responsáveis equivalentes, sem dono principal obrigatório.
- Parceiro obrigatório; a agência também pode ser um parceiro.
- Concluídas permanecem visíveis nas vistas de período.
- Calendário mensal inclui semanas completas de domingo a sábado. O rótulo de métricas deve esclarecer o período, sem esconder os dias de borda.
- Categorias/tipos continuam atributos da ação. Remover a visualização Categorias não é apagar esse atributo.
- Hoje simples; abas para Atrasados, Calendário e Kanban; filtro de parceiro compartilhado; datas independentes por aba.
- Criação ao sair do título; botão Criar como alternativa; edição deve conservar o contexto.
- Identidade visual existente: Prism, PP Object Sans, logotipo e temas.
- Remover ou absorver Sprint continua uma possibilidade de simplificação, não uma decisão obrigatória confirmada nesta retomada.
- Multiagência é intenção de evolução. O esquema atual não demonstra que esse isolamento já exista; preparar permissões antes de comercializar, sem impor essa expansão à próxima correção pequena.

## Próximos passos sugeridos, sem implementação autorizada por este parecer

### Entrega 1 — salvar com confiança

Corrigir título/blur, ausência vs null, encerramento de DnD e preservação de responsáveis. Adicionar testes pequenos de regressão desses contratos. Depois tratar fila/patches por ação e conflitos de edição.

Aceite: abrir/fechar sem mudança não grava; título alterado salva; ação nova válida cria no blur uma vez; falha conserva rascunho e permite tentar novamente; editar um campo não limpa outro; arraste falho encerra o gesto e recupera o estado anterior; parceiro não sobrescreve responsável escolhido.

### Entrega 2 — acesso e confidencialidade

Conferir banco real de forma somente leitura, versionar migrations/policies/RPCs e corrigir identidade do portal. Acrescentar guards administrativos e testes de acesso. Separar audiência dos comentários, sanitizar HTML e isolar cache por sessão.

Aceite: colaborador só acessa ações atribuídas; admin tem acesso administrativo previsto; usuário de cliente só acessa parceiros permitidos; arquivamento revoga acesso; outra sessão não exibe cache da anterior; nota interna não aparece no portal. Testar também requisições diretas, não só menus.

### Entrega 3 — nova organização no app atual

Converter a home por etapas, reutilizando componentes existentes. Hoje abre primeiro em grade compacta de parceiro/título, com opção de rolagem horizontal. Abas substituem a sequência de blocos; parceiro global, datas por aba, URL e histórico. Criar/abrir/editar continua na mesma superfície. Não transportar automaticamente Feed, Categorias e todas as opções atuais.

Aceite: filtrar parceiro, trocar aba e abrir/fechar ação preserva contexto; período do calendário cobre semanas completas; Kanban mantém período próprio; atraso não depende desse período; móvel consegue acessar navegação, criação e edição sem hover.

### Entrega 4 — aparar inconsistências existentes

Separar erro/vazio/loading e oferecer tentar novamente; corrigir busca multiparceiro; manter parceiros do bootstrap atualizados após edição; restringir seleção em lote ao contexto visível; corrigir mês/janela do portal; permitir listar/restaurar pessoas arquivadas. Resolver audiências e aprovação antes de ampliar publicação/Instagram.

Não chamar um link de documento de “aprovação” se nenhuma decisão fica registrada. É possível ajustar a promessa da interface antes de construir um workflow maior.

## Rastreabilidade dos 52 achados

Legenda: **C** correção específica presente no código; **P** parcial/regressão/risco remanescente; **A** pendência reconfirmada; **D** precisa ser reinterpretado conforme decisões posteriores; **N** sem revalidação específica suficiente nesta revisão. C não significa banco ou jornada publicada validada.

| Achado | Estado | Leitura atual |
|---|---|---|
| 01 | A | Portal ainda retoma por ID local, sem sessão verificável própria. |
| 02 | P | Escrita em claro removida nesses handlers; hash fixo e verificador no navegador permanecem. |
| 03 | P | JWT adicionado; permissão operacional, limites e deploy não verificados. |
| 04 | P | Grants/RPCs reais não comprovados; SQL local ainda diverge do frontend. |
| 05 | A | Guard de admin ausente nos caminhos lidos; RLS real não verificada. |
| 06 | A | HTML do portal continua sem sanitização explícita examinada. |
| 07 | P | Vazio vira null, mas campo omitido também: contrato perigoso para updates parciais. |
| 08 | C/D | time validado; tópicos removidos por decisão. |
| 09 | C | Lock liberado por finally. |
| 10 | C | Cmd+Enter aguarda sucesso; outros fechamentos continuam revisão separada. |
| 11 | A | Snapshots inteiros e ausência de coordenação/versionamento. |
| 12 | P | Await existe; sucesso por item/contagem e seleção contextual faltam. |
| 13 | P | Erros detectados; lote continua não atômico e sem resultado por ID. |
| 14 | C | Regra aplicada na persistência individual/lote; otimista de lote não espelha tudo. |
| 15 | P | Override limpo; ação ativa permanece após rejeição. |
| 16 | P | Dia dirige consulta; seed/cobertura e chaves de outros recortes incompletos. |
| 17 | A | Identidade/visibilidade ausentes em chaves; sem limpeza global localizada. |
| 18 | A | Parceiros continuam em estado do bootstrap separado das queries invalidadas. |
| 19 | A | Busca encontra overlap, mas render acessa primeiro parceiro sem guarda. |
| 20 | A | Queries das telas lidas não separam adequadamente erro de ausência. |
| 21 | A | Revisão continua documento, sem decisão/versionamento de aprovação. |
| 22 | A | Link sem contrato reproduzível de token/escopo por parceiro. |
| 23 | A | Observação da equipe ainda pública por padrão. |
| 24 | A | Stories segue excluído de isInstagramFeed por padrão. |
| 25 | N | Pendência informada pelo relatório; navegação/janela precisa de teste próprio. |
| 26 | D | Semanas completas são desejadas; esclarecer rótulo/contrato da métrica. |
| 27 | D | Manter data de execução; ajustar semântica “Data de publicar” no portal. |
| 28 | D | Manter Feito/Concluído; tornar significado compreensível. |
| 29 | N/D | Sprint é modo de foco; remoção/absorção é candidata, ordenação não retestada. |
| 30 | A/D | Home ainda composta por blocos; seguir organização por abas aprovada. |
| 31 | D | Multiparceiro é válido; comunicar mesma ação sem inflar volume percebido. |
| 32 | A | Revelador da barra continua onMouseEnter. |
| 33 | N/D | Unificar contexto/filtro na home; modo do seletor não retestado nesta revisão. |
| 34 | A/D | Hoje mantém quatro alternativas; simplificar conforme direção aceita. |
| 35 | N | Densidade/truncamento exige inspeção visual atual e mobile real. |
| 36 | A | Rodapé segue usando showText=false em controles centrais. |
| 37 | P | Modificadores corrigidos; alvo por hover ainda precisa de revisão. |
| 38 | A | Seleção global não se restringe ao contexto visível no código lido. |
| 39 | N | Notificações/ajuda não validadas em interação nesta revisão. |
| 40 | D | Não exigir líder/owner: responsáveis equivalentes é decisão aceita. |
| 41 | D | Não criar projetos/hierarquias sem necessidade concreta. |
| 42 | N/D | Não priorizar painel de capacidade antes dos fluxos confiáveis. |
| 43 | A | a11y desabilitada no lint; composição/foco exige teste próprio. |
| 44 | N | Não houve validação desta aplicação em celular físico. |
| 45 | A | Preferências seguem baseadas no snapshot do bootstrap. |
| 46 | A | Cópia mantém campos; título otimista diverge da inserção. |
| 47 | A | Schema aceita parceiros vazios/data inválida; caminhos de dados continuam amplos. |
| 48 | A | Schema/policies/RPCs reais não reproduzíveis pelas migrations localizadas. |
| 49 | A | Não localizada suíte de testes; APIs excluídas do typecheck normal. |
| 50 | N | Bundle grande confirmado; desempenho/observabilidade reais não medidos. |
| 51 | P | Bloqueio de gravação sem mudança introduziu regressão de título/blur. |
| 52 | A | Lista de arquivados usa fetchPeople, que filtra visible=true. |

Este parecer propõe uma sequência de decisões e entregas. Não autoriza automaticamente todas as recomendações nem presume que toda pendência antiga deva virar funcionalidade.
