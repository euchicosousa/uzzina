# Feriados — entrega parcial do banco em 01/11/2026

## Escopo autorizado e resultado

O proprietário autorizou executar apenas o trabalho Supabase dos dois tickets com subagentes, deixando o aplicativo para depois. Dois subagentes revisaram campo/compatibilidade e relação/autorização; um deles executou testes isolados. Somente o executor principal escreveu no checkout e tentou aplicar migrations remotas. Mudanças externas de Planejamento, fonte, cabeçalho e documentação foram preservadas.

**Aplicado e verificado em produção:** `celebrations.is_holiday boolean NOT NULL DEFAULT false`, projeto `dfepmjcozszswocwvdpq` (bussola/UZZINA), PostgreSQL17.11. Migration local `20261101215111_celebration_holiday_classification.sql`; remota `20261101215328`, nome `celebration_holiday_classification`.

**Preparado e validado localmente, NÃO aplicado em produção:** migration `20261101215117_partner_holiday_associations.sql`. Duas chamadas de `apply_migration` retornaram `status: expired`, com a mensagem “This confirmation expired after 2 minutes”. A confirmação exigida pela ferramenta não foi concluída; não houve rejeição declarada de auto-review. Consulta posterior confirmou ausência tanto de `partner_holidays` quanto de `replace_partner_holidays(uuid,uuid[])`. Nenhuma tentativa de contornar a confirmação por outro canal.

## Contrato do SQL preparado

- `partner_holidays`: PK `(partner_id, celebration_id)`, UUIDs referenciam identidades reais, sem listas de slugs ou cópias dos títulos. Não preenche seleções automaticamente.
- Coluna técnica `celebration_is_holiday GENERATED ALWAYS AS (true) STORED`, referência composta a `celebrations(id,is_holiday)` e UNIQUE correspondente. Só feriados podem ser vinculados; desclassificação vinculada falha com `23503`, mesmo com concorrência. A interface futura deve traduzir esse erro para orientar a remoção dos vínculos. Apagar parceiro/data elimina seus vínculos por cascade.
- RLS de leitura usa existência do parceiro sob a própria RLS existente. Authenticated recebe SELECT/INSERT/DELETE, sem UPDATE; INSERT/DELETE exigem administrador ativo. Anônimos não têm acesso. Não altera portal nem permissões vigentes de parceiros/datas.
- RPC `replace_partner_holidays(p_partner_id uuid,p_celebration_ids uuid[]) RETURNS uuid[]`: invoker, search_path vazio, exige identidade e administrador ativo, bloqueia parceiro durante a substituição, valida IDs, deduplica e devolve seleção ordenada canônica. Array vazio limpa; null é inválido. Uma falha reverte a operação inteira. A interface futura precisa serializar envios da seleção e tratar criação parcial do parceiro, sem repetir sua criação.

## Verificações

Antes de aplicar, catálogo remoto confirmou coluna/relação/RPC ausentes e policies/helpers compatíveis com o contrato do projeto. Somente a nova migration do campo foi aplicada; não houve db push/repair/reset ou replay do histórico parcial.

Após aplicar o campo:

- 110 datas antes/depois; zero classificadas automaticamente e zero nulos. Catálogo confirma boolean/NOT NULL/default false.
- Hash dos dados originais das datas, excluindo a nova coluna, permaneceu igual; hash dos parceiros também. Nenhuma data/parceiro regravado pela tarefa.
- Policies e grants de parceiros e datas foram comparados antes/depois e permaneceram iguais.
- Leituras remotas reais com `SET LOCAL ROLE authenticated` e claims de um administrador ativo e um membro ativo retornaram as110 datas, sem expor identidades no relatório. Transações read-only encerradas com rollback. Não foram feitos INSERT/UPDATE de fixtures em produção.
- Security advisors antes/depois: mesmos achados preexistentes (6 informações de RLS sem policy em tabelas privadas; pg_net em public; 8 funções definer intencionais; proteção de senhas vazadas desativada). Nenhum novo achado nesta entrega. Não alterar esses itens por proximidade; [referência do linter](https://supabase.com/docs/guides/database/database-linter).

PostgreSQL17 isolado executou as duas migrations reais: **18 grupos PASS**, incluindo defaults; seleção ordenada/deduplicada/idempotente; preservação dos campos do parceiro; FK/duplicata/data inválida; coluna gerada; desclassificação; RLS com linhas locais para marcas distintas, membro/inativo/anônimo; atomicidade com falha depois do DELETE; rollback; substituição concorrente da marca; corrida associação/desclassificação nas duas ordens; cascades e limpeza. Script reproduzível: [check-holiday-schema.cjs](../../scripts/check-holiday-schema.cjs). Requer `UZZINA_PG_BIN` apontando para binários locais e `UZZINA_PG_MODULE` para o módulo `pg`; cria cluster/socket temporários exclusivos, sem TCP ou produção, e para o cluster no finally. O resultado inicial veio do subagente; a versão entregue apenas parametriza caminhos para reprodução.

A versão parametrizada do script entregue no repositório também foi executada pelo subagente:18 PASS, cluster temporário encerrado. Essa execução local não certifica o catálogo remoto da relação ainda inexistente, nem autenticação pelo navegador/PostgREST. Sem alterações de TypeScript, models, UI, API, package/lock, build, commit, push ou deploy nesta entrega. Arquivos de migration preparados não comprovam aplicação da segunda etapa.

## Retomada

1. Conferir catálogo e histórico remoto novamente; aplicar **somente** a migration de associações quando a confirmação da ferramenta for concluída. Não reaplicar a do campo nem o histórico completo.
2. Verificar PK/FKs/índice/coluna gerada/RLS/grants/invoker RPC no remoto e leitura autorizada por parceiro. Registrar versão remota, hashes e resultado; verificação de escrita real exige ambiente apropriado, sem fixtures automáticas em produção.
3. Continuar os [tickets locais](../../.scratch/brand-holidays/README.md) para integração de tipos/models/cache e controles da interface, quando autorizado. O contrato novo de `Celebration.Row` ainda não foi propagado aos tipos/fixtures do aplicativo, para manter este trabalho restrito ao banco.

Fontes primárias consultadas: [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [funções Supabase](https://supabase.com/docs/guides/database/functions), [constraints PostgreSQL17](https://www.postgresql.org/docs/17/ddl-constraints.html), [generated columns](https://www.postgresql.org/docs/17/ddl-generated-columns.html). Changelog Supabase consultado; [avisos de PostgreSQL17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) não exigem mudança neste SQL, que não usa os operadores/extensões listados.
