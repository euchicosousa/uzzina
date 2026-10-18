# Diagnóstico: atualização com falha de conexão e cópia de ação

Em17/10/2026, investigação solicitada pelo proprietário, sem autorização de correção ou publicação. Ação informada: “Segurando o burger”, em produção. Consultas ao Supabase foram somente de leitura; nenhuma ação foi alterada ou removida.

## Resultado

Há dois registros persistidos de `toroburgerandbeer`, e não somente um cartão repetido no cache:

| Registro | ID | Criação registrada |
| --- | --- | --- |
| Segurando o burger | `a5b34ae5-219a-49d1-87b7-3daa8b5df4b7` | 05/10/2026 às23:10:40 UTC |
| Segurando o burger (Cópia) | `ff9c9cce-e872-49c1-aa74-4b79f0bdd2f9` | 17/10/2026 às16:00:14.227 UTC |

A evidência aponta para acionamento do fluxo explícito de duplicação, separado da atualização. O sufixo `(Cópia)` é adicionado por `duplicateActionClient`, que lê o original e insere outra linha. A sequência correspondente aparece nos logs de produção. Não há evidência de que Atualizar tenha se convertido automaticamente em Duplicar. Não é possível atribuir o comando a um clique físico, atalho ou intenção do usuário pelos registros disponíveis.

## Sequência observada

Logs `edge_logs`, janela17/10/2026,15:58–16:04 UTC. Horários abaixo em America/Fortaleza (UTC−3), truncados aos segundos. Consultas de listas e preflight omitidos.

| Horário local | Operação observada |
| --- | --- |
| 12:59:55 | PATCH do original, usando versão de14/10: HTTP200. |
| 13:00:04 | PATCH do original, usando `updated_at=2026-10-17T15:59:55.773733`: HTTP200. |
| 13:00:10 | Outro PATCH do original com a mesma versão anterior: HTTP406. |
| 13:00:14 | GET do original por ID: HTTP200; logo após, POST de ações: HTTP201. Corresponde à janela de criação da cópia. |
| 13:02:05 | Novo PATCH do original, agora com `updated_at=2026-10-17T16:00:04.630019`: HTTP200. |

O segundo PATCH com versão antiga explica o aviso de conflito. Uma confirmação perdida na conexão pode produzir exatamente essa sequência; outra instância de edição com versão antiga também pode. HTTP200 no servidor não prova que a resposta foi recebida pelo navegador. Os logs consultados não contêm o gesto de interface nem o corpo das requisições; a associação do POST à cópia é sustentada pelo horário, registro persistido, leitura prévia do original e implementação de duplicação.

## Código conferido

- `app/lib/supabase.mutations.ts`: `updateActionClient` usa UPDATE por ID e versão. Zero linhas/PGRST116 gera `ActionConflictError`, sem fallback para INSERT. `duplicateActionClient` usa GET do original e INSERT com título acrescido de `(Cópia)`.
- `app/components/features/action-drawer/action-save-coordinator.ts`: ação existente mantém identidade após erro; nova tentativa usa UPDATE e a versão confirmada anteriormente. Se a resposta anterior se perdeu, a versão fica antiga e a nova tentativa pode conflitar com a própria escrita.
- `app/hooks/useActionMutations.tsx`: criação, atualização e duplicação têm intents separados. Nenhum tratamento de erro chama duplicação. `app/lib/query-client.ts` configura retry para consultas, sem configurar retry de mutações.
- `app/components/features/action-drawer/ActionFormFooter.tsx`: Duplicar chama a mutação diretamente, sem confirmação, sem aguardar resultado e sem bloquear por erro/conflito do coordenador; depois solicita fechamento seguro. A recusa desse fechamento não cancela a duplicação já enviada. Atualizar possui handler separado.
- `app/hooks/useActionShortcut.tsx`: Shift+D também aciona duplicação, com proteções contra repetição de tecla, modificadores do sistema e edição em campos.
- Catálogo real de produção: o único trigger não interno de `actions` é `trg_actions_updated_at`, BEFORE UPDATE. Sua função apenas avança `NEW.updated_at`; não insere outra ação.

## Verificação

Novo teste em `tests/action-network-diagnosis.test.ts` exerce coordenador e mutações reais, substituindo apenas a fronteira do cliente de banco. O banco simulado aplica UPDATE e perde a resposta; nova tentativa chega ao conflito, mantém uma única linha e não executa INSERT. O teste verifica também que o coordenador envia intent de atualização e o ID original. Segundo caso verifica que duplicação explícita cria identidade diferente e o sufixo observado.

`bun test tests/action-network-diagnosis.test.ts tests/action-conflict.test.ts tests/drawer-save.test.ts`:18 PASS,81 assertions. `bun run format`, `bun run lint` e `bun run typecheck` passaram. Não houve mudança funcional, build, push ou deploy. Testes controlados não reproduzem o gesto do usuário nem certificam a entrega da resposta na rede real.

## Pendências e propostas

Diagnóstico encerrado com evidência forte do fluxo de duplicação, sem atribuição de erro ao usuário. Melhorias possíveis, ainda não implementadas: reconciliar a versão após resposta de salvamento perdida; tornar a mensagem menos categórica sobre outra sessão; avaliar bloqueio de Duplicar durante salvamento/erro/conflito e indicação do resultado. Qualquer reconciliação precisa preservar edições concorrentes e comparação de versões. A cópia permanece intacta em produção.
