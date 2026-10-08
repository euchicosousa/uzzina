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

- IA/portal: imports corrigidos e pacote das quatro APIs validado no Node nativo; geração real de legenda pelo handler empacotado passou com serviços de staging. Novo deploy em produção ainda pendente; sem publicação nesta tarefa. Falha local anterior não reproduzida separadamente. [Diagnóstico do Astra](2026-10-08-ai-caption-runtime-diagnosis.md), [correção/verificações](2026-10-08-action-and-ai-fixes.md).
- Os dois exports identificam o projeto Vercel `prj_8PN3IDaxZAHtFwkwViE7GplFBQWE`, diferente do vínculo local `.vercel/project.json` (`prj_sFbkpGYbgTWb1uHFoGMIFpmZ90Pz`). Conferir o destino antes de publicar. CLI tem token inválido, mas o segundo export já forneceu os stack traces; não há pendência de novo log para confirmar a causa. Vínculo não alterado.
0. Criação/duplicação: policy SELECT corrigida pela migration `20261008164615_action_row_read_authorization.sql`, aplicada apenas ao staging como versão remota `20261008165014`. Funções reais do app com Auth/PostgREST passaram para membro e administrador; negativas de escopo/responsabilidade/parceiro arquivado preservadas. Fixtures removidas, staging continua com4 ações e nenhuma ação temporária; a geração fictícia registrou1 tentativa de IA em staging. Produção continua aguardando aplicação somente da migration incremental. [Manifest](../../supabase/rollouts/action-read-fix-manifest.json), [diagnóstico do Astra](2026-10-08-action-creation-rls-diagnosis.md).
1. Proprietário fará durante a semana a conferência de login/home, ação/data, preferências, IA, administração, portal/revisão, upload e Leads no site publicado. Falhas devem registrar passos, erro e navegador; print para problemas visuais. Não marcar como aprovado antecipadamente.
2. Safari/telefone físico e percurso completo de foco dos fluxos restantes: teclado virtual, editor, seleção, rolagem, overlays e upload real. Resultados anteriores de Chromium/toque emulado e relatos de arrastes/mobile têm escopo limitado.
3. Revisar avisos de plataforma/SECURITY DEFINER e defaults de supabase_admin no banco efetivo; o catálogo verificado nesta rodada não auditou os defaults da plataforma.

## Documentação

Diagnóstico geral de 08/10 (código, prevenção de erros e visual) em [docs/plans/2026-10-08-diagnostico-geral.md](../plans/2026-10-08-diagnostico-geral.md). Após o commit `2cc7c45`, as APIs publicadas de IA e do portal responderam às guardas (405/401/403) sem FUNCTION_INVOCATION_FAILED, e o proprietário confirmou o uso da IA. A aplicação da migration de leitura de ações em produção não foi verificada. O plano não autoriza implementação.

Fase 3 do diagnóstico executada em 08/10 (sem commit/deploy): constantes/paletas separadas, rascunho de ação único, `.from()` fora dos componentes, helpers de servidor, gaveta/perfil/tema divididos. 290 testes, lint, tipagem, build e pacote serverless (7 handlers) passaram. Divergências e pendências em [fase3-resultado](../plans/2026-10-08-fase3-resultado.md) (3.9 não aplicado; 3.5/3.7 parciais).

Tickets e relatórios intermediários removidos após preservar pendências, contratos operacionais e sugestões de UX relevantes no TODO. Histórico versionado segue no Git. Testes/scripts, migrations, rollouts com manifest, envs privados e backups preservados. Não foi criado documento de direção da nova versão.

Atualize este arquivo com o resultado real de cada tarefa, sem anexar diários de estados superados. Ideias do TODO não autorizam implementação.
