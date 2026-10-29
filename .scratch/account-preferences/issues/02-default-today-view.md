# 02: Persistir a visualização inicial de Hoje para Home e página dedicada

**What to build:** Em Minha Conta > Preferências, permitir escolher uma única visualização inicial de Hoje entre Parceiros, Kanban, Categorias e Feed. Salvar a escolha na conta e usá-la tanto no bloco Hoje da Home quanto na página Hoje, mantendo a alternância manual temporária em cada contexto.

**Blocked by:** None (can start immediately). Não depende do ticket01; a preferência pode ser acrescentada ao formulário atual. Se ambos forem executados, coordenar alterações em `ProfilePage`, sem dois executores escrevendo simultaneamente no checkout.

**Status:** completed — owner approved 2026-10-29; frontend published and production RPC applied

## Resultado em28/10/2026

Implementação autorizada após aceite e commit local do ticket01 (`064948e`). Componentes atuais são separados: `HomeTodayView` e `TodayPageView`, compartilhando `TodayViewParts`; as referências ao componente único e `standalone` abaixo são históricas. Ambos agora leem `defaultTodayView` na montagem, preservando alternância manual temporária. Seletor na conta salva explicitamente. Resposta atrasada de tema não substitui o novo campo salvo por outro fluxo.

505 testes/1785 assertions passaram; navegador controlado e PostgreSQL isolado verificaram o fluxo, validação e isolamento. Após recusa inicial da revisão automática, proprietário autorizou explicitamente a alteração SQL. Migration aplicada à produção, versão remota `20261028205047`; catálogo, validação com identidade inexistente e permissões conferidos, sem tocar preferências reais. Bloqueio de SQL resolvido; interface local aguardando avaliação, sem deploy solicitado. Relatório: [visualização inicial de Hoje](../../../docs/audits/2026-10-28-today-default-view.md).

## Contexto técnico e pontos de integração

Inspeção do checkout em28/10/2026:

- `HomeTodayView` é compartilhado pela Home `/app/` e pela rota `/app/today`. O estado local `view` inicia sempre em `partners`. O `PrismToggleGroup` oferece `kanban` (Kanban), `categories` (Categorias), `feed` (Feed do Instagram) e `partners` (Parceiros); alternar hoje não persiste nada.
- A Home habilita `linkTitle`; o título leva à página dedicada com a data selecionada. A página dedicada passa `standalone`, controla a data por search param validado e faz sua consulta por dia. A preferência deve mudar a visualização inicial, preservando data, consultas e escopo operacional.
- Kanban tem dois contratos: Home mantém colunas de30vh; página dedicada usa `HomeViewWrapper.fillViewport` e `KanbanPhasesBoard.fillHeight` para ocupar a altura útil, reservar AppBar e rolar por coluna. Os outros modos mantêm altura natural. Feed filtra somente categorias de Instagram compatíveis; uma lista vazia nesse modo não é motivo para trocar automaticamente a escolha.
- `UserPreferences`, `SerializedPreferences` e `getUserPreferences` centralizam tipos, leitura e defaults. O `defaultViewVariant` existente representa Linha/Bloco/Conteúdo dos painéis de clientes; não representa os quatro modos de Hoje. A nova preferência precisa de campo próprio, por exemplo `defaultTodayView`, com validação dos quatro valores e fallback `partners`.
- `ProfilePage` mantém rascunho local e salva explicitamente com `updateMyPreferences`; a confirmação é atribuída a `person.preferences`. `AppContext` fornece `person` e remonta por identidade. Uma atribuição a esse objeto não é, por si, notificação reativa: conferir a leitura da confirmação na próxima montagem e não depender de um efeito que sobrescreva a escolha manual em todo render.
- `updateMyPreferences` usa a RPC `update_my_preferences(p_patch)`. O SQL versionado valida uma lista fechada de chaves e rejeita chaves desconhecidas; faz merge em `people.preferences`, autorizado por `auth.uid()` e membro ativo. Portanto, não basta adicionar o campo no frontend: preparar evolução incremental da validação da RPC preservando os contratos atuais. A definição efetivamente publicada precisa ser conferida no futuro rollout; não foi consultada nesta investigação.
- `usePreferencePersistence`/`createPreferencePersistence` atendem os controles de cabeçalho/busca com debounce250ms, escrita serializada, último patch por campo, retry e guardas de identidade. O novo seletor deve respeitar o salvamento explícito da conta; não transformar os toggles manuais de Hoje em autosave. Preservar coexistência dos patches e campos desconhecidos já armazenados.

## Critérios de aceite

- Preferências apresenta seletor acessível “Visualização inicial do Hoje” com as quatro opções existentes, explicando que vale para o bloco da Home e a página Hoje. O rótulo diferencia esta escolha do Layout Padrão dos clientes.
- A seleção é rascunho até Salvar Alterações. Apenas abrir, selecionar sem salvar ou sair da tela não grava o novo campo. Sucesso confirma o valor canônico; envio bloqueia repetição; falha mantém rascunho e permite tentar novamente, sem anunciar persistência bem-sucedida.
- Salvar persiste por usuário em `people.preferences` pelo model/RPC existente, sem escrita direta pela rota/componente. O contrato aceita somente `partners`, `kanban`, `categories` e `feed`; patches inválidos são recusados e autorização/merge/campos existentes são preservados. Preparar migration incremental e distinguir SQL preparado de SQL aplicado.
- Sem campo salvo, ou com valor ausente, nulo ou inválido no registro legado, ambos os contextos iniciam em Parceiros, preservando o padrão atual. Não reutilizar `defaultViewVariant` nem criar preferências separadas por contexto.
- Após salvar, cada nova montagem de Hoje na Home ou na página dedicada inicia pela mesma preferência confirmada, inclusive ao recarregar, sair/entrar na conta ou abrir outro navegador com a mesma conta. Nenhum estado local de outro usuário determina o modo inicial.
- Alternar manualmente continua imediato e local à instância aberta, sem alterar a preferência persistida nem sincronizar forçadamente outra instância. A seleção manual permanece ao mudar data, filtros, dados da consulta, rerender ou resize durante essa montagem; sair/remontar volta ao padrão salvo. Uma resposta tardia não desfaz uma escolha manual já feita.
- Salvar um novo padrão passa a valer na próxima abertura/montagem; sair da conta ou trocar identidade descarta operações antigas. Patches de tema/paleta em paralelo não apagam o novo campo, nem o novo campo sobrescreve outras preferências.
- Preservar link de título e data selecionada, navegação de datas, filtros/escopo de parceiros operacionais, seleção múltipla e edição de ações. Os modos continuam usando os mesmos componentes e filtros, inclusive Feed vazio.
- Ao iniciar em Kanban, respeitar Home compacta versus página standalone com altura útil/rolagem por coluna; nos outros modos preservar altura natural e reserva da AppBar. Preferências de altura dos calendários continuam independentes e não persistidas.
- Testes no código real cobrem os quatro valores nos dois contextos, fallback legado/inválido, salvar/erro/retry, remontagem/recarga, alternância manual após atualização de dados/data, merge e troca de sessão. Reaproveitar a cobertura existente de persistência e navegação de Hoje; acrescentar verificação do novo contrato da RPC em ambiente autorizado, sem fixtures de escrita em produção.
- Conferir seletor e os dois contextos em desktop/mobile e temas com HTTP controlado. Antes de publicar frontend dependente da nova chave, verificar compatibilidade da RPC no ambiente de destino e registrar evidência distinta de teste local, banco e deploy Ready.

## Riscos e decisões de escopo

- Frontend com a nova chave diante da RPC antiga gera erro Unknown preference key e pode falhar depois de o perfil já ter sido salvo. O rollout deve tratar essa dependência dentro deste ticket, sem pressupor migrations aplicadas.
- Um efeito que reaplique o default em cada mudança de `person.preferences` pode desfazer alternância manual; usar semântica de inicialização por montagem/identidade, com confirmação disponível no bootstrap.
- Estado de preferências e callbacks antigos podem misturar usuários ou perder patches. Preservar isolamento por identidade e geração, retornos canônicos e merge autorizado.
- O ajuste não cria visualizações, não muda o padrão dos painéis de clientes e não persiste automaticamente a última visualização manual. Não há dependência funcional do ticket01.

## Verificação deste registro

Componentes, rotas, tipos/defaults, model, controlador de persistência, SQL versionado e testes existentes foram inspecionados. Sem alteração funcional, execução de testes/build, consulta/escrita de banco, migration aplicada, commit ou publicação. Somente a criação deste ticket foi autorizada.

## Owner acceptance — 2026-10-29

Owner explicitly approved and closed this delivery. Production deployment `dpl_99LPVHqzaaqxJ4m5UQ4LF4JSa8Mg` is READY on `uzzina.cnvt.com.br`, commit `c1d18b8`. Earlier findings and limits above describe the implementation history; they do not reopen this ticket or certify additional tests. No functional change or SQL in this acceptance update.
