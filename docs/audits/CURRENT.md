# UZZINA — estado atual

Atualizado em 08/10/2026. Contratos: [AGENTS](../../AGENTS.md). Execução/ambientes: [README](../../README.md). Próximos trabalhos e ideias: [TODO](../../TODO.md).

## Publicação e banco

- Proprietário confirmou push e deploy funcionando; informou aplicação do finish-uzzina-release.sql. A conferência de uso será feita durante a semana, conforme sua decisão.
- Produção Supabase dfepmjcozszswocwvdpq: fase1 aplicada anteriormente; fase2 agora confirmada por consulta read-only ao catálogo. Policies esperadas presentes e sem policies extras, RLS ativo nas tabelas públicas, sem grants anônimos de tabela/coluna, sem UPDATE direto de preferences/admin pela equipe, tabelas privadas sem grants da equipe, sem privilégios TRUNCATE/REFERENCES/TRIGGER para navegador e funções verificadas sem EXECUTE anônimo. Contador de IA permanece exclusivo do servidor.
- Contagens preservadas:4 pessoas,7.131 ações,30 parceiros,3 contas externas e2 leads. Nenhum dado alterado pela conferência. Estado/fontes/hashes e resultado resumido estão no [manifest](../../supabase/rollouts/uzzina-release-manifest.json).
- Isso confirma a configuração observada, não os percursos autenticados do app publicado nem a execução integral de cada função. Não reaplicar os SQLs apenas por haver testes de uso pendentes.

## Evidências e limites

- Código:267 testes, tipagem, lint e build passaram antes da publicação. Limpeza de temporários/SQLs antigos seguida de tipagem/lint/build; o aviso conhecido de chunks maiores que500kB permanece. Documentação/remoção de relatórios não altera runtime.
- Staging: Auth oficial e matriz real de IA, portal/revisão, contas/pessoas, lote e conflito passaram; fixtures removidas/restauradas. Produção fase1 também teve Auth/bootstrap/preferências e handler estrito de IA verificados com conta temporária removida.
- Leads: formulário/API publicados, captação persistida e negativas de acesso verificadas; tabela fechada ao anônimo em produção. Leitura de membro ativo e recusa de DML direto verificadas. Lista/detalhe no site UZZINA entra na conferência de uso.
- Backups privados preservados em Documents/UZZINA-backups, incluindo2026-10-08_00-29-18 anterior à fase1. Hashes/archive verificados e ensaio de dados públicos em PostgreSQL15 passou; não equivale a restore integral de Auth nem backup de mídia externa.

## Pendências reais

1. Proprietário fará durante a semana a conferência de login/home, ação/data, preferências, IA, administração, portal/revisão, upload e Leads no site publicado. Falhas devem registrar passos, erro e navegador; print para problemas visuais. Não marcar como aprovado antecipadamente.
2. Safari/telefone físico e percurso completo de foco dos fluxos restantes: teclado virtual, editor, seleção, rolagem, overlays e upload real. Resultados anteriores de Chromium/toque emulado e relatos de arrastes/mobile têm escopo limitado.
3. Revisar avisos de plataforma/SECURITY DEFINER e defaults de supabase_admin no banco efetivo; o catálogo verificado nesta rodada não auditou os defaults da plataforma.

## Documentação

Tickets e relatórios intermediários removidos após preservar pendências, contratos operacionais e sugestões de UX relevantes no TODO. Histórico versionado segue no Git. Testes/scripts, migrations, rollouts com manifest, envs privados e backups preservados. Não foi criado documento de direção da nova versão.

Atualize este arquivo com o resultado real de cada tarefa, sem anexar diários de estados superados. Ideias do TODO não autorizam implementação.
