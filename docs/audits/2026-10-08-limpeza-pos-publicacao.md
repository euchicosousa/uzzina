# Limpeza após o push — 08/10/2026

O proprietário confirmou o push e solicitou primeiro a limpeza dos arquivos desnecessários. Esta entrega não aplica a fase2 de permissões; deploy Ready e validação publicada continuam pendentes.

## Removidos

- Cinco arquivos em `.tanstack/tmp`: cópias intermediárias do gerador de rotas, algumas com templates antigos. Não são as rotas usadas pelo app; as rotas em app/routes e app/routeTree.gen.ts permanecem. Diretório incluído no .gitignore para impedir novo versionamento.
- `supabase_update_get_home_actions.sql`: definição antiga SECURITY DEFINER sem a validação de identidade e o search_path do contrato atual. Substituída por supabase/migrations/20261006030000_database_authorization.sql e pelos bundles testados de publicação.
- `supabase/rpc_functions.sql`: definição anterior com quatro argumentos e coluna state, incompatível com o contrato atual. Mesma fonte canônica substituta. Não há importação/referência executável dos dois SQLs em app, API, servidor, testes ou scripts; referências em relatórios antigos são evidência histórica, não instrução de execução.
- `.DS_Store` fora de node_modules/Git/Vercel/dist: metadados locais do macOS, já ignorados.

## Preservados e motivo

- tests e scripts/check-*-browser: regressões reproduzíveis; os roteiros de navegador executam a interface real com HTTP controlado e seus limites estão documentados. Não são descartáveis por serem usados fora do build.
- migrations, rollouts e manifests: contratos atuais e sequência de publicação ainda necessária. Não apagar finish-uzzina-release.sql antes da fase2.
- scripts de inspeção e matriz do banco: permitem verificar permissões e compatibilidade sem depender de memória do agente.
- .scratch/correcoes-auditoria-2026-10-06 e docs/audits: os tickets e evidências são referenciados por CURRENT. Não apagar como temporários apenas pelo nome da pasta.
- scripts/migrate-phases.ts: ferramenta anterior às mudanças desta auditoria; conclusão dessa migração de dados não foi confirmada nesta limpeza, portanto preservada.
- envs privados, credenciais de teste e backup: usados nas operações ainda pendentes e ignorados pelo Git. Backups externos preservados.

Nenhum componente de aplicação, teste, configuração de upload, dado de negócio ou dependência foi removido. A quantidade removida do Git é sete arquivos; a remoção de metadados macOS é local.

## Verificação

Tipagem, lint e build passaram após a limpeza; Biome conferiu274 arquivos sem ajustes. git diff --check passou. O build mantém o aviso já conhecido de chunks maiores que500kB. A suíte de267 testes anterior permanece evidência do código inalterado e não foi repetida nesta limpeza de arquivos sem execução; esta limpeza não equivale à homologação do novo site publicado.
