# Correções de criação de ações e APIs de IA/portal

As duas falhas descritas nos diagnósticos do Astra foram corrigidas no código preparado. A migration de leitura de ações foi aplicada **somente em staging**. Produção ainda precisa da aplicação incremental e de um novo deploy das funções no projeto Vercel correto.

## Alterações

- `api/ai.ts` importa `ai-contract.js`; `api/dash-auth.ts`, `api/dash-data.ts` e `api/dash-action.ts` importam `dash-session.js`. O builder real emite e inclui esses módulos, e o Node consegue carregá-los. Validação e regras de sessão permanecem nas implementações compartilhadas existentes.
- `20261008164615_action_row_read_authorization.sql` altera apenas `actions_select_policy.USING` para avaliar responsabilidade e parceiro ativo da linha proposta, com o mesmo bypass de administrador ativo. Nenhum grant, dado ou função `can_access_action` foi modificado. INSERT/UPDATE/DELETE e comentários/notificações preservam os contratos anteriores.
- O retorno de criação/duplicação continua canônico; não foi removido `.select()` nem introduzido um segundo salvamento para contornar o banco.

## Verificação

Antes das correções, os novos testes falharam pelas mensagens originais: `ERR_MODULE_NOT_FOUND` ao importar a função realmente empacotada e `new row violates row-level security policy for table "actions"` no INSERT RETURNING autenticado. A criação também foi reproduzida via função real do aplicativo com Auth/PostgREST de staging, antes da aplicação.

Depois das correções:

| Verificação | Resultado |
|---|---|
| `bun test` |267 testes,826 assertions, sem falhas |
| lint e typecheck |Passaram |
| build frontend |Passou; permanece aviso existente de chunks acima de500kB |
| `node scripts/check-serverless-runtime.cjs` |Quatro funções emitidas pelo builder Vercel carregadas pelo Node22.17; guardas de método/sessão responderam corretamente sem rede |
| Mesmo script com `--staging-caption` |Handler empacotado gerou legenda válida com Auth real, reserva persistente de staging e OpenAI |
| Pacote completo de migrations no PostgreSQL15.1 descartável |Matriz de autorização e concorrência em duas conexões passaram; fixtures desfeitas |
| `bun scripts/check-action-create-staging.ts` |Criação/duplicação de membro e criação administrativa passaram; parceiro fora do escopo, arquivado e ausência de responsabilidade recusados |

Uma comparação inicial do teste de staging precisou normalizar o separador da data: PostgREST devolve `T` em vez de espaço. A data de execução não mudou. O teste foi corrigido e repetido com sucesso; as fixtures dessa tentativa também foram removidas.

A versão remota da migration em staging é `20261008165014`, diferente do nome local gerado pela CLI. Hash e estado por ambiente estão no [manifest incremental](../../supabase/rollouts/action-read-fix-manifest.json). A geração de teste consumiu uma tentativa de IA em staging; não consumiu cota nem modificou ações de produção.

## Limites e publicação pendente

O teste de funções usa o builder instalado e o Node nativo, com pacotes externos do node_modules local. Ele cobre o erro real de importação, mas não certifica o serviço Vercel publicado. A geração foi feita com o handler empacotado invocado localmente e serviços reais de staging; não equivale ao clique completo no navegador em produção. A falha local relatada anteriormente não foi reproduzida separadamente.

Para concluir produção:

1. Conferir o catálogo e aplicar **somente** a migration incremental no Supabase de produção. Não usar db push/repair/reset nem reaplicar os bundles anteriores. Conferir policy e negativas de autorização após aplicação.
2. Confirmar que `uzzina.cnvt.com.br` pertence ao projeto `prj_8PN3IDaxZAHtFwkwViE7GplFBQWE`, indicado pelos logs. O vínculo local aponta para outro projeto e não foi alterado. A CLI Vercel tinha token inválido; renovar autenticação ou usar uma sessão já autorizada antes do deploy.
3. Publicar o código corrigido no destino confirmado e aguardar Ready. Verificar `/api/ai`: GET405 e POST sem Bearer401, sem `FUNCTION_INVOCATION_FAILED`; testar guardas das APIs do portal.
4. Conferir no site publicado criação, duplicação e geração/salvamento/reabertura da legenda em ação existente. Registrar o resultado real em CURRENT e no manifest.

Os arquivos de diagnóstico do Astra foram preservados como evidência histórica e estão ligados a este resultado. Nenhum commit, push, aplicação SQL em produção ou deploy foi realizado nesta tarefa até este registro.
