# Passo1 — confronto com o inventário do banco atual

> Baseline histórica da coleta. As incompatibilidades locais foram corrigidas e executadas em PostgreSQL temporário no [passo2](2026-10-07-passo-2-banco-de-teste.md). Isso não altera o banco exportado nem certifica Supabase/produção.

Data da análise:07/10/2026. Coleta informada pelo catálogo:07/10/2026 às16:42:55UTC. PostgreSQL15.1. HEAD local:0f8c637ee7da38d25b0b54a8cb290ff47984ae01.

## Alcance e conclusão
CSV recebido do proprietário e lido integralmente: um campo `inventory` contendo JSON. Encontrados8 tabelas públicas,87 colunas,16 policies,4 funções de aplicação exportadas e3 triggers, incluindo auth.users. Não houve conexão direta do agente, leitura de linhas de negócio, execução de migrations, teste de exploração, backup ou deploy. O resultado descreve **o banco exportado**; o CSV não informa project-ref, deployment ou configuração Vercel. A correspondência com o projeto usado pelo app depende da seleção feita pelo proprietário.

Conclusão: o schema legado exportado ainda não contém os contratos novos exigidos pelo código local. RLS habilitada em8 tabelas não significa isolamento: várias policies permitem qualquer linha. As migrations locais também precisam de correções de compatibilidade antes de execução. Passo1 concluído como inspeção documental do catálogo; banco não homologado.

## 1. Contratos ausentes

| Contrato local | Observação no inventário | Impacto com o código novo usando este banco |
|---|---|---|
| Sessão do portal | `dash_sessions` ausente | Não persiste/verifica/revoga a sessão opaca prevista no02 |
| Link de revisão | `review_links` ausente | Geração/leitura segura05 não tem armazenamento |
| Contas | `admin_update_client_account`, `admin_update_client_password`, `admin_deactivate_client`, `client_migrate_legacy_password` ausentes | PATCH/desativação/transações de senha não dispõem das RPCs locais |
| Administração de equipe | `admin_update_person` ausente | Tela administrativa nova não dispõe da RPC |
| IA | `ai_usage` e `consume_ai_usage` ausentes | Handler14 não consegue consumir quota; espera-se503 após autorização/configuração |
| Preferências | `update_my_preferences` ausente | Perfil/Header15 não conseguem persistir pelo contrato novo |
| Isolamento | `is_active_member`, `is_active_admin`, `can_access_action` ausentes | Regras novas07 ainda não estão instaladas |
| Concorrência | `handle_actions_updated_at`/`trg_actions_updated_at` ausentes; existe trigger diferente | Há atualização de timestamp, mas não o mecanismo monotônico preparado08 |

A ausência de `supabase_migrations.schema_migrations` foi informada pelo catálogo. Isso **não prova** que nenhum SQL foi aplicado manualmente; os objetos existentes são a fonte de verdade.

## 2. Autorizações atuais — evidência de catálogo

### DB01 — contas de clientes acessíveis sem login
`clients` tem policy SELECT para `public`, com expressão `true`, e grant SELECT para `anon`. Ela abrange todas as linhas; o nome “Permitir leitura anonima restrita” não corresponde à definição. Não existem restrições de leitura por coluna que excluam `password` ou `password_hash` nos grants apresentados.

Consequência estrutural: a role anon tem autorização para consultar as contas e os campos sensíveis dessa tabela. Não foram lidos valores nem feita chamada pública ao endpoint para demonstrar exploração; a publicação do schema na Data API do projeto não consta da coleta. `password` existir não comprova que haja senhas em claro armazenadas: o conteúdo não foi consultado.

Encaminhamento: retirar leitura direta de clientes e usar somente APIs autorizadas; inventariar separadamente eventual dado legado antes de limpeza. Não apagar coluna/dados nesta etapa.

### DB02 — colaborador pode ultrapassar o que a interface mostra
Actions, partners, people e action_comments têm policies ALL para authenticated com USING true (algumas também WITH CHECK true) e grants amplos. Não condicionam responsável, parceiro autorizado, admin ou pessoa ativa.

Consequências de autorização: ações/notas de outros responsáveis ficam acessíveis à role; cadastro/edição de parceiros e pessoas não está restrito ao admin; `people.admin` não tem proteção de coluna suficiente, permitindo alteração pela role authenticated. Ocultar botões ou filtrar consultas no navegador não impõe estas regras no banco.

Encaminhamento: substituir o conjunto permissivo e limitar grants/colunas, validando admin/membro/inativo em banco de teste. Acrescentar uma policy restritiva não resolve sozinho quando outra permissiva continua autorizando a mesma operação.

### DB03 — RPCs confiam no ID recebido
`get_app_bootstrap(p_user_id)` e `get_home_actions(...)` são SECURITY DEFINER, executáveis por authenticated, e usam `p_user_id` diretamente. Nenhuma deriva/valida auth.uid() ou pessoa ativa. `settings=null`: não há search_path fixado na definição exportada.

Encaminhamento: manter as assinaturas usadas pelo app, derivar identidade da sessão e tratar parâmetros apenas como recorte. Preservar parceiros arquivados fora da operação.

### DB04 — notificações, leads e datas também precisam de regras
- `notifications`: ALL authenticated/true, sem recipient_id na policy. A query do app filtra destinatário, mas a autorização do banco não. Excertos de comentários e notificações alheias podem ser consultados pela role.
- `leads`: policies SELECT/INSERT/UPDATE para anon e authenticated, com true; grants correspondentes presentes. Leitura e alteração anônimas ficam autorizadas. Antes de fechar inserção, identificar o formulário público legítimo; não confundir recepção de formulário com permissão para listar/editar todos os leads.
- `celebrations`: ALL authenticated/true, sem restrição administrativa para escritas ou bloqueio de pessoa inativa.

A migration07 atual **não cobre essas três tabelas**. Elas precisam entrar explicitamente na preparação, sem bloquear os fluxos legítimos do app. Notificações são inseridas pelo navegador em `app/models/notifications.ts`; uma regra de escrita precisa validar autor/comentário/ação e destinatários permitidos, não simplesmente proibir qualquer envio entre pessoas.

### DB05 — privilégios mais amplos que o necessário
Todas as8 tabelas concedem SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER a anon e authenticated. Defaults de postgres/supabase_admin também concedem privilégios amplos às mesmas roles em novas tabelas/funções/sequências.

RLS bloqueia linhas quando não há policy autorizadora; o grant sozinho não prova leitura anônima das outras tabelas. Entretanto TRUNCATE não é protegido por RLS. Não foi constatado endpoint REST de truncate: o achado é o privilégio SQL excessivo. Revogar operações desnecessárias e revisar defaults para que objetos futuros não nasçam abertos. `relforcerowsecurity=false` não é defeito isolado e não deve ser corrigido indiscriminadamente em objetos usados pelo backend privilegiado.

## 3. Compatibilidade: SQL local ainda não está pronto para este baseline

### DB06 — tipo de retorno impede substituir bootstrap
Banco: `get_app_bootstrap(UUID) RETURNS jsonb`. Migration07: mesma assinatura com `RETURNS JSON`. PostgreSQL não permite mudar o tipo de retorno por CREATE OR REPLACE. Preservar JSONB e construir JSONB; não usar DROP CASCADE como atalho. A assinatura de5 parâmetros de get_home_actions já existe e não precisa ser reinventada.

[Contrato do PostgreSQL15](https://www.postgresql.org/docs/15/sql-createfunction.html).

### DB07 — trigger legado referencia tabela ausente
`auth.users` possui trigger ativo `on_auth_user_created` chamando `handle_new_user()`. A função insere em `public.profiles`; nenhuma relação `profiles` aparece no inventário público (e a tabela de pessoas real é `people`). Isso indica falha na criação de usuário que aciona esse trigger, inclusive via API administrativa e fixtures da matriz.

Confirmar/reconciliar em staging antes de inserir usuários. Não substituir cegamente por insert em people: essa tabela exige name/surname/initials/short/areas, e o fluxo administrativo de criação precisa ser respeitado. Nenhuma das7 migrations locais trata este trigger.

### DB08 — dois mecanismos disputariam updated_at
Já existe `handle_updated_at_actions BEFORE UPDATE ... moddatetime('updated_at')`. Migration08 só remove o trigger novo `trg_actions_updated_at` e procura atribuição textual `NEW.updated_at :=` para detectar outros. Isso não identifica confiavelmente uma função de extensão como moddatetime. O legado pode sobreviver e sobrescrever o timestamp do mecanismo novo.

Reconciliar explicitamente o trigger existente na cópia de teste; manter somente um dono do campo. `actions.date`, `created_at` e `updated_at` são timestamp **sem timezone**. A função nova usa timestamptz; definir/conferir timezone e conversão antes de confiar no versionamento. Não converter as datas de execução automaticamente, pois isso muda a regra operacional do produto.

### DB09 — fixtures da matriz não correspondem ao schema atual
`test-database-matrix.sql` insere parceiros sem `colors`, embora seja NOT NULL e não tenha default. Insere ações sem created_at/updated_at; created_at é NOT NULL sem default e08 só adiciona default para updated_at. Portanto a matriz pode falhar na preparação antes de exercitar autorização. O trigger de auth.users também pode falhar antes disso.

Ajustar fixtures mínimas ao baseline exportado e executar em transação numa cópia descartável. Teste textual que procura trechos de SQL não detecta esses erros; aprovação exige execução PostgreSQL real.

### DB10 — camada antiga precisa permanecer disponível durante a migração
Clientes já possuem `password_hash`; **não é necessário criar novamente essa coluna**. Também existe `password`; inspecionar uso/quantidade sem expor valores antes de remover qualquer legado. People.user_id é UUID UNIQUE com FK para auth.users; partners.slug já é UNIQUE; estas estruturas são compatíveis com o código atual. A criação de review_links aponta created_by para people.id, e o handler grava person.id: contrato consistente.

O bootstrap legado retorna também celebrations; a definição nova não retorna essa chave. Conferir callers antes de aplicar (o app possui consulta separada para celebrations). Não concluir regressão apenas pela ausência da chave, mas preservar consumidores reais se houver.

## 4. Ordem da próxima preparação — ainda sem execução em produção

1. Criar staging/cópia compatível com o PostgreSQL15 e o schema exportado. `supabase/config.toml` local declara major_version17; não tratar esse ambiente como versão idêntica à exportada.
2. Corrigir o pacote local: bootstrap JSONB, trigger de criação de usuário, dono único de updated_at e fixtures obrigatórias. Completar autorizações para notificações/leads/celebrations e privilégios excessivos, com regras que preservem seus fluxos.
3. Inventariar dependências e aplicar em staging os contratos na ordem lógica: sessões → revisão → contas → autorizações → concorrência → quota → preferências. Executar por transações e registrar falhas/rollback; não entregar uma colagem de produção antes da homologação.
4. Executar matriz permitido/negado; validar triggers, RPCs, assinatura/tipos e efetivas permissões de anon/membro/admin/inativo. Depois integrar APIs/frontend ao mesmo staging.
5. Só após aprovação preparar atualização de produção com backup e recuperação. A inspeção atual não autoriza nem realiza deploy.

## Estado e responsabilidade

Passo1: concluído como leitura/comparação do catálogo enviado. Passo2: ambiente e pacote compatível pendentes. Nenhum ajuste de código/SQL funcional foi realizado nesta análise, somente este relatório e continuidade. Não foi reexecutada a suíte do app, pois nenhuma implementação foi alterada. Homologação real e inspeção Vercel continuam pendentes.

As incompatibilidades DB06–DB09 pertencem ao pacote que preparamos, não são falha do proprietário nem motivo para ele executar SQL adicional às cegas. Devem ser resolvidas antes de entregar o roteiro de aplicação.

Fonte de interpretação de RLS/grants: [PostgreSQL15 — Row Security Policies](https://www.postgresql.org/docs/15/ddl-rowsecurity.html). Evidências específicas de catálogo estão no CSV do proprietário; nenhuma linha de negócio foi acessada.

SHA256 do CSV recebido: `2551b1969e59d4fbae0fcd2097719106e4f49556bb99f2dbce1f408c85da67cf`.
