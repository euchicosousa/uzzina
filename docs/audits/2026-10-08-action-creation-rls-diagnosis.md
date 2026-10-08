# Falha na criação de ações — diagnóstico

Data: 08/10/2026. Escopo solicitado: análise, sem correção; implementação será feita por outro agente.

Estado posterior: a correção foi preparada e aplicada apenas em staging, com regressão real validada. Este documento preserva o diagnóstico original; consulte o [resultado da implementação](2026-10-08-action-and-ai-fixes.md) para estado e publicação pendente.

Complemento: o usuário também relatou falha ao gerar legenda em ação já existente. A investigação confirmou HTTP500 `FUNCTION_INVOCATION_FAILED` na API publicada, independente da criação por RLS. Evidências e roteiro estão no [diagnóstico de IA](2026-10-08-ai-caption-runtime-diagnosis.md).

## Conclusão

Defeito reproduzido: a policy `actions_select_policy` usa `can_access_action(id)`, uma função SQL `STABLE` que consulta novamente `public.actions`. A criação no aplicativo usa `.insert(...).select().single()`, exigindo que a linha recém-inserida passe também pela policy de SELECT para ser devolvida. A consulta interna da função usa o snapshot do início do comando e ainda não encontra essa linha. O resultado é `false`, e o PostgreSQL recusa a operação com a mensagem das capturas:

```text
new row violates row-level security policy for table "actions"
```

Isso ocorre mesmo com administrador ativo: a condição de administrador está dentro do `EXISTS` que exige encontrar a ação. Não depende do título “Dia da Visão”, categoria, legenda ou horário.

Confiança alta: a mensagem foi reproduzida em PostgreSQL 15.1, e o catálogo efetivo de produção foi consultado em transação somente leitura, confirmando a mesma policy e função. Não foi capturada a requisição original do navegador do usuário; portanto, outros fatores específicos daquela sessão não foram examinados. O defeito confirmado é suficiente para explicar o fluxo apresentado.

## Evidências

- `app/lib/supabase.mutations.ts:49–53`: `createActionClient` encadeia INSERT, SELECT e `single`.
- `app/lib/supabase.mutations.ts:140–163`: duplicação usa a mesma combinação; também está exposta ao defeito, embora não tenha sido executada no navegador nesta análise.
- `supabase/rollouts/finish-uzzina-release.sql:48–53`: definição de `can_access_action` com `STABLE` e consulta à própria tabela.
- `supabase/rollouts/finish-uzzina-release.sql:67`: SELECT condicionado a `can_access_action(id)`.
- `supabase/migrations/20261006030000_database_authorization.sql`: contém o mesmo contrato.
- Produção: PostgreSQL `15.1 (Ubuntu 15.1-1.pgdg20.04+1)`, transação de inspeção com `transaction_read_only=on`; `actions_select_policy.qual = can_access_action(id)`; função efetiva confirma `STABLE SECURITY DEFINER` e o mesmo `EXISTS` sobre `actions`.
- Os hosts de Supabase de `.env` e `.env.vercel-production.local` são ambos `dfepmjcozszswocwvdpq.supabase.co`. Isso confirma a configuração local compartilhando o banco de produção; não é leitura das variáveis ativas do deploy Vercel. O README já documenta esse comportamento.

O conector Supabase não autorizou a consulta de catálogo nesta sessão. A inspeção foi concluída pela conexão PostgreSQL já configurada em `.env.backup.local`, usando TLS e transação somente leitura. Nenhum segredo foi registrado neste relatório.

## Reprodução e isolamento

Foi iniciado um cluster PostgreSQL 15.1 descartável, acessível apenas por socket local. O schema mínimo contém `people`, `partners`, `actions`, duas identidades fictícias (administrador e membro autorizado) e uma implementação local de `auth.uid()` baseada na claim da sessão. As funções e policies de ações foram extraídas diretamente do bundle versionado, sem reescrever a lógica investigada. Os testes usam a role `authenticated`; as transações de diagnóstico terminam em rollback ou são desfeitas ao fechar a conexão após erro.

| Caso | Resultado |
|---|---|
| Administrador ativo: INSERT sem RETURNING, seguido de SELECT separado | Sucesso; SELECT encontra a linha |
| Administrador ativo: INSERT com RETURNING | Falha com a mensagem exata das capturas |
| Membro ativo, responsável e vinculado ao parceiro: INSERT sem RETURNING e SELECT separado | Sucesso |
| Mesmo membro: INSERT com RETURNING | Falha com a mesma mensagem |
| Administrador: INSERT com RETURNING, substituindo apenas a policy SELECT por avaliação dos campos da própria linha | Sucesso no experimento; alteração revertida |

As duas primeiras comparações foram repetidas sem alterar a identidade nem os vínculos. Elas isolam a verificação de SELECT sobre a linha nova e demonstram que sessão inválida ou falta de vínculo não são necessárias para produzir o erro. Ao final, a tabela de ações do cluster descartável continha zero linhas.

Comandos executados para a reprodução (artefatos temporários de diagnóstico, não parte da aplicação):

```sh
python3 /tmp/uzzina-action-rls-diagnose.py
python3 /tmp/uzzina-action-rls-cases.py
```

O primeiro comando gerou `Authenticated admin INSERT RETURNING: exit 3` e o erro acima. O segundo confirmou as cinco comparações da tabela. Os caminhos temporários não são dependências permanentes; a correção deve acrescentar cobertura reproduzível no repositório.

## Por que as verificações anteriores passaram

- `tests/database-authorization.test.ts` inspeciona texto SQL; o próprio teste declara que não certifica autorização no banco.
- `scripts/test-database-matrix.sql:43` insere as ações como fixtures antes de assumir a role `authenticated`. Não contém teste positivo de criação autenticada com `INSERT ... RETURNING`.
- `scripts/check-action-cache-browser.cjs:32–36` responde ao POST com dados simulados. Verifica o comportamento da interface/cache, mas não executa RLS.
- O manifest e CURRENT anteriores registravam conferência de catálogo da fase2, com percursos autenticados do app publicado ainda pendentes. Conferir a existência das policies não testa a interação delas com a criação.

## Direção para o agente que corrigirá

1. Criar um teste de regressão real no PostgreSQL que faça criação autenticada com `RETURNING`, cobrindo administrador e colaborador autorizado. Preservar também negativas de membro inativo, parceiro fora do escopo e ausência de responsabilidade.
2. Corrigir a policy de leitura de `actions` para avaliar os atributos da própria linha, ou um helper que receba esses atributos, preservando os critérios atuais de administrador/membro, responsabilidade e vínculo com parceiro ativo. A prova local com avaliação da própria linha eliminou o erro; não equivale à validação completa de uma migration candidata.
3. Revisar os demais usos de `can_access_action`, inclusive comentários e notificações, antes de alterar a função compartilhada. Uma consulta por ID ainda pode ser adequada para ações já persistidas; não ampliar acessos incidentalmente.
4. Preservar o retorno canônico da criação. Apenas remover `.select()` muda o contrato esperado pela gaveta e pelo cache e não constitui correção completa.
5. Verificar criação e duplicação via Supabase/PostgREST com Auth real em staging, além das negativas de autorização. Depois conferir o percurso publicado após a aplicação controlada da correção do banco.
6. Preparar migration incremental; consultar CURRENT/manifest antes do rollout. Não reaplicar cegamente o bundle inteiro nem desativar RLS. Uma alteração exclusiva do frontend não modifica a policy de produção.

## Limites e estado final

Não houve alteração de código da aplicação, migrations, permissões, dados de produção ou deploy. Houve somente documentação no repositório e experimentos no banco local descartável. Nenhuma criação foi tentada em produção por esta investigação. O defeito continua pendente de correção.

Por ser uma tarefa de diagnóstico e documentação, não foram executados lint, typecheck ou build; foram verificadas as referências, o diff e a reprodução real em PostgreSQL. A prova não é um teste integral de GoTrue/PostgREST/navegador, nem certificação de uma correção.

## Referências técnicas

- [PostgreSQL 15 — CREATE POLICY](https://www.postgresql.org/docs/15/sql-createpolicy.html): linhas novas devolvidas por RETURNING precisam satisfazer as policies de SELECT; a recusa gera erro.
- [PostgreSQL 15 — Function Volatility Categories](https://www.postgresql.org/docs/15/xfunc-volatility.html): funções STABLE usam o snapshot estabelecido no início do comando chamador.
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): distinção entre grants e autorização por linha.
