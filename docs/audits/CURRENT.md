# UZZINA — estado atual

Atualizado em 08/10/2026. Contratos: [AGENTS](../../AGENTS.md). Execução/ambientes: [README](../../README.md). Próximos trabalhos e ideias: [TODO](../../TODO.md).

## Publicação e banco

- Proprietário confirmou push e deploy funcionando; informou aplicação do finish-uzzina-release.sql. A conferência de uso será feita durante a semana, conforme sua decisão.
- Produção Supabase dfepmjcozszswocwvdpq: fase1 aplicada anteriormente; fase2 agora confirmada por consulta read-only ao catálogo. Policies esperadas presentes e sem policies extras, RLS ativo nas tabelas públicas, sem grants anônimos de tabela/coluna, sem UPDATE direto de preferences/admin pela equipe, tabelas privadas sem grants da equipe, sem privilégios TRUNCATE/REFERENCES/TRIGGER para navegador e funções verificadas sem EXECUTE anônimo. Contador de IA permanece exclusivo do servidor.
- Contagens preservadas:4 pessoas,7.131 ações,30 parceiros,3 contas externas e2 leads. Nenhum dado alterado pela conferência. Estado/fontes/hashes e resultado resumido estão no [manifest](../../supabase/rollouts/uzzina-release-manifest.json).
- Isso confirma a configuração observada, não os percursos autenticados do app publicado nem a execução integral de cada função. Não reaplicar os SQLs apenas por haver testes de uso pendentes.

## Evidências e limites

- Correções de08/10 preparadas: imports `.js` nas APIs de IA/portal e migration incremental da policy SELECT de ações. Os novos testes falharam antes pelos erros originais e passaram depois. PostgreSQL15.1: pacote de migrations, matriz real de autorização (criação/duplicação com RETURNING, administrador/membro e negativas) e concorrência em duas conexões passaram.267 testes/826 assertions, lint, tipagem e build passaram. Builder Vercel + Node22.17 carregou quatro funções; handler empacotado gerou legenda com Auth/cota/OpenAI reais de staging. Isso não certifica o deploy publicado. [Resultado e rollout pendente](2026-10-08-action-and-ai-fixes.md).
- Código:267 testes, tipagem, lint e build passaram antes da publicação. Limpeza de temporários/SQLs antigos seguida de tipagem/lint/build; o aviso conhecido de chunks maiores que500kB permanece. Documentação/remoção de relatórios não altera runtime.
- Staging: Auth oficial e matriz real de IA, portal/revisão, contas/pessoas, lote e conflito passaram; fixtures removidas/restauradas. Produção fase1 também teve Auth/bootstrap/preferências e handler estrito de IA verificados com conta temporária removida.
- Leads: formulário/API publicados, captação persistida e negativas de acesso verificadas; tabela fechada ao anônimo em produção. Leitura de membro ativo e recusa de DML direto verificadas. Lista/detalhe no site UZZINA entra na conferência de uso.
- Backups privados preservados em Documents/UZZINA-backups, incluindo2026-10-08_00-29-18 anterior à fase1. Hashes/archive verificados e ensaio de dados públicos em PostgreSQL15 passou; não equivale a restore integral de Auth nem backup de mídia externa.

## Pendências reais

- IA/portal: correção de imports publicada (`2cc7c45`). Em 08/10, as APIs publicadas responderam às guardas (405/401/403) sem FUNCTION_INVOCATION_FAILED, e o proprietário gerou conteúdo com IA no site.
- Os dois exports identificam o projeto Vercel `prj_8PN3IDaxZAHtFwkwViE7GplFBQWE`, diferente do vínculo local `.vercel/project.json` (`prj_sFbkpGYbgTWb1uHFoGMIFpmZ90Pz`). Conferir o destino antes de publicar. CLI tem token inválido, mas o segundo export já forneceu os stack traces; não há pendência de novo log para confirmar a causa. Vínculo não alterado.
0. Criação/duplicação: a migration `20261008164615_action_row_read_authorization.sql` está versionada em `2cc7c45`; o proprietário confirmou a criação de ações no site e no local (que usa o banco de produção). Policy de produção não consultada diretamente nesta sessão; registrar a versão remota no [manifest](../../supabase/rollouts/action-read-fix-manifest.json) quando houver acesso.
1. Proprietário fará durante a semana a conferência de login/home, ação/data, preferências, IA, administração, portal/revisão, upload e Leads no site publicado. Falhas devem registrar passos, erro e navegador; print para problemas visuais. Não marcar como aprovado antecipadamente.
2. Safari/telefone físico e percurso completo de foco dos fluxos restantes: teclado virtual, editor, seleção, rolagem, overlays e upload real. Resultados anteriores de Chromium/toque emulado e relatos de arrastes/mobile têm escopo limitado.
3. Revisar avisos de plataforma/SECURITY DEFINER e defaults de supabase_admin no banco efetivo; o catálogo verificado nesta rodada não auditou os defaults da plataforma.

## Documentação

Diagnóstico geral de 08/10 em [diagnostico-geral](../plans/2026-10-08-diagnostico-geral.md). Lista de trabalho atual, com tarefas T1–T10 prontas para execução: [ajustes-proximos](../plans/2026-10-08-ajustes-proximos.md). Nenhuma tarefa está autorizada sem pedido do proprietário.

Commits locais de 08/10, sem push: Fase 3 (`35976e6`, detalhes em [fase3-resultado](../plans/2026-10-08-fase3-resultado.md)); correção de "Criada há cerca de 3 horas" em rascunhos com `toDbTimestamp` (`f5639ef`, teste falhou antes em America/Sao_Paulo); Prettier só com `prettier-plugin-tailwindcss` (o `jsx-attr-sort` anulava a ordenação de classes) e formatação completa (`f92d9f5`, `cc91dab`, ignorado no blame por `.git-blame-ignore-revs`). Verificação: format:check, lint, typecheck, 291 testes, build, 7 funções no Node nativo; 369 strings de classes reordenadas sem mudança no resultado do `cn()`; navegador local mostra rascunho "Criada há menos de um minuto".

Ajustes de 08/10, rodada 2 (commitados e publicados): T4 (dev só no staging; envs reduzidos a 4 arquivos; login e criação de ação no staging confirmados pelo proprietário), T8 (menus Visualizar/Ordenar/Exibir), T10 (pessoas/preferências em `app/models/people.ts`), T11 (`getVisualizeGroups`: menu Visualizar sem seletor indevido nem menu vazio; 2 testes falharam antes), T12 (`test:serverless` obrigatório antes de push, sem CI) e correção do layout da página Minha Conta (opções de cor quebram linha; colunas com `minmax(0, …)`; confirmada visualmente pelo proprietário). 305 testes, lint, tipagem, formatação, build e 7 funções no Node passaram. Decisões em [ajustes-resultado](../plans/2026-10-08-ajustes-resultado.md) e [ajustes-proximos](../plans/2026-10-08-ajustes-proximos.md).

Tickets e relatórios intermediários removidos após preservar pendências, contratos operacionais e sugestões de UX relevantes no TODO. Histórico versionado segue no Git. Testes/scripts, migrations, rollouts com manifest, envs privados e backups preservados. Não foi criado documento de direção da nova versão.

Atualize este arquivo com o resultado real de cada tarefa, sem anexar diários de estados superados. Ideias do TODO não autorizam implementação.
