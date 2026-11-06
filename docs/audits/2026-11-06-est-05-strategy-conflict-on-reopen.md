# EST-05 — Bloqueio de estratégias ao reabrir a ação

06/11/2026. Investigação feita só pela leitura do código, sem navegador nem banco. Implementação (alternativa A) registrada abaixo. Ticket: `.scratch/action-strategy/issues/05-strategy-conflict-on-reopen.md`, criado na worktree `ticket-updates` e ainda não versionado.

## Causa

A alteração "de outra pessoa ou sessão" vem da própria operação de estratégias. Ela é tratada como versão concorrente porque a gaveta reabre a partir de uma linha velha do cache da lista.

1. **A gaveta reabre com a linha da lista.** `useActionPanels.openAction` (`app/hooks/useActionPanels.ts:115`) recebe o objeto `Action` do item clicado, que vem da lista em cache. O coordenador usa essa linha como base confirmada (`action-save-coordinator.ts:97`).
2. **A lista fica velha quando a geração termina com a gaveta fechada.** O worker grava `strategies` e um `updated_at` novo no servidor. A invalidação de `["actions"]` só acontece em `onComplete` de `useDurableStrategies`, e só com a gaveta montada (`ActionFormDrawer.tsx:501`). O app não usa polling nem Realtime para a lista. A linha da lista continua com estratégias vazias e o `updated_at` anterior.
3. **A leitura da abertura vê uma versão mais nova.** `checkRemoteVersion()` sem estratégias esperadas (`ActionFormDrawer.tsx:808-813`) chama `receiveRemoteVersion`. Esse método devolve `"newer"`, grava `remoteVersion` e abre a comparação (`:757-764`), mesmo sem `pendingPatch`. Pelo contrato do AGENTS, o coordenador "nunca adota sozinho".
4. **Cancelar não resolve.** Cancelar só faz `setComparison(null)`. `remoteVersion` continua no coordenador, então a faixa amarela continua (`:1058`) e as escritas ficam pausadas (`persist`, linha 171).
5. **As estratégias ficam travadas por três motivos:**
   - `strategyControlsBlocked` inclui `!!coordinatorState.remoteVersion` (`:583`);
   - a última operação durável é lida como `succeeded`, e o resultado dela difere de `RawAction.strategies`, que vem da base velha e está vazio, então `isDurablePreview` fica verdadeiro (`:571-584`);
   - ao abrir o diálogo, a tentativa de adoção automática `checkRemoteVersion(completedStrategies)` → `adoptGeneratedStrategies` é recusada porque `remoteVersion` já existe (`action-save-coordinator.ts:270`). A única saída que o código previa para a própria geração fica bloqueada pela leitura da abertura, que chegou antes.

A comparação mostra o que o ticket relata: estratégias na versão atual, versão aberta vazia, nenhuma alteração local e o texto "Outra pessoa ou sessão modificou esta ação…" (`ActionFormDrawer.tsx` em `PrismDialogDescription`).

## Casos

| Situação | Comportamento atual |
| --- | --- |
| A geração termina **com a gaveta aberta** e o diálogo de estratégias aberto | Adoção automática por `adoptGeneratedStrategies`. Funciona. |
| A geração termina com a gaveta aberta e o diálogo fechado | A lista é invalidada por `onComplete`. A base da gaveta continua velha e os controles ficam em pré-visualização até abrir o diálogo, que então adota. Funciona, com atraso. |
| A geração termina **depois de fechar** e a ação é reaberta | O bug do ticket: a comparação abre e as estratégias ficam bloqueadas. |
| A geração ainda está em andamento quando a ação é reaberta | A leitura da abertura vê a mesma versão, sem modal. O polling acompanha e o diálogo adota ao terminar. Funciona. |
| Segunda reabertura após o bug | A lista recebeu a versão canônica por `applyCanonicalAction` (`:763`), mesmo depois de Cancelar. A reabertura seguinte não mostra o modal. |
| Edição concorrente real (outro campo, outra pessoa) com o form limpo | Mesmo modal: "Usar versão atual" é a única saída. |
| Edição concorrente com alterações locais pendentes | O modal é necessário: protege o rascunho, e "Salvar minhas alterações" faz rebase. |

## O que fazer hoje (seguro)

Na comparação, clique em **Usar versão atual**. Sem alterações locais, nada é descartado. Esse botão chama `adoptRemoteVersion` e `syncFieldsFromBase`: limpa `remoteVersion`, carrega as estratégias salvas, e a pré-visualização deixa de diferir da base. Seleção e recriação voltam a funcionar.

Se já clicou em Cancelar: clique em **Comparar** na faixa amarela do topo e depois em **Usar versão atual**. Fechar e reabrir a ação também resolve, porque a lista já recebeu a versão canônica.

Isso só vale quando o diálogo diz "Você não tem alterações pendentes". Com alterações, compare os campos antes de decidir.

## Alternativas

**A. Adotar automaticamente na abertura quando o form está limpo (recomendada).** Na leitura da abertura, se `receiveRemoteVersion` devolver `"newer"`, o coordenador não estiver sujo, não houver escrita em voo e os rascunhos de texto descarregados por `flushTextDrafts` forem iguais à base, o form chama `adoptRemoteVersion` e `syncFieldsFromBase`, sem modal. Essa leitura existe para trocar a linha do cache pela canônica, e com o form limpo não há edição a proteger. Também cobre caches velhos por outras causas, como uma edição feita em outra gaveta ou dispositivo antes da abertura.
- Muda o contrato "Nunca adota sozinha" do AGENTS. A regra passa a valer só quando existem alterações locais, a decisão é do proprietário.
- Risco: a pessoa digita nos primeiros instantes, antes da resposta. Título e legenda ficam em `textDraftsRef` e os editores Tiptap só registram no blur, então a condição precisa comparar esses rascunhos com a base. Se houver diferença, a comparação continua.
- Se a pessoa já estiver digitando no editor, adotar remonta os editores (`setDescriptionVersion`/`setContentVersion`). A comparação dos rascunhos evita trocar o texto se a descrição já foi alterada. Com o texto igual, remontar só mexe no foco, que o `focusRestoreRequest` existente já trata.

**B. Adotar só a própria geração (mínima).** Mantém o contrato. Na abertura, se a última operação durável for `succeeded`, as estratégias remotas coincidirem com `operation.result` e o restante da linha for igual à base, o form chama `adoptGeneratedStrategies` antes de `receiveRemoteVersion`. Também é preciso que `adoptGeneratedStrategies` aceite quando a `remoteVersion` conhecida é a mesma linha. Resolve o caso do ticket, mas não os outros caches velhos, e depende da ordem entre duas leituras (operação e ação).

**C. Só invalidar a lista ao concluir com a gaveta fechada.** Não basta. A conclusão pode ocorrer sem nenhuma tela que observe a operação, e uma lista ainda não reconsultada continua velha.

**D. Manter o modal e só trocar o texto.** Por exemplo: "Esta ação recebeu estratégias geradas enquanto estava fechada. Use a versão atual." Remove o susto, mas mantém a interrupção que o proprietário quer evitar.

Recomendação: A, com a condição dos rascunhos. A seleção e a persistência seguem pelo coordenador: depois da adoção, a base passa a ser a versão canônica e a próxima escrita envia `expectedUpdatedAt` correto. O modal fica reservado aos conflitos reais, quando há alterações locais. O texto "outra pessoa ou sessão" passa a aparecer só nesse caso. Se o contrato não puder mudar agora, B resolve o relato.

## Roteiro de aceite (após a correção)

1. Abra uma ação sem estratégias, gere estratégias e feche a gaveta logo depois de iniciar.
2. Espere cerca de 1 minuto, até o worker concluir, e reabra pela lista. Não deve aparecer comparação nem faixa amarela, e as estratégias salvas aparecem e podem ser selecionadas.
3. Selecione uma estratégia: o título muda e é salvo, sem erro de conflito.
4. Repita, mas digite no título antes de a leitura da abertura responder (rede lenta no DevTools). A comparação aparece com "Salvar minhas alterações".
5. Edite um campo da mesma ação em outra aba, volte à primeira sem editar e reabra. Com A, a versão nova é carregada sem modal. Com B, a comparação continua.
6. Gere com a gaveta aberta e o diálogo aberto: comportamento inalterado (adoção e toast).

## Limites

Nada foi reproduzido no navegador nem no banco. O tempo do worker (`pg_cron` de 30 s) vem do relatório do IA-M05. A análise usou o checkout `proposal/ia-m02-profile-tabs`. Em `ActionFormDrawer.tsx`, ele difere da `main` só pela barra de progresso do IA-M05, que não toca esse fluxo.

## Modelos sugeridos (implementação)

- **OpenAI**: GPT-6 Astra, para mexer na condição de adoção sem quebrar as guardas de versão e de sessão.
- **Anthropic**: Claude Opus 5.5, que já conhece o rastro deste relatório e o contrato do coordenador.
- **Google**: Gemini 4 Argon, para a correção e o roteiro de aceite. A disponibilidade depende do plano.

## Implementação — 06/11

Alternativa A e novos nomes dos botões, na branch `fix/est-05-strategy-reopen`.

- Em `checkRemoteVersion`, quando a leitura da abertura (ou a leitura ao fechar o diálogo de estratégias) recebe uma versão mais nova, o formulário adota essa versão sem modal (`adoptRemoteVersion` e `syncFieldsFromBase`), desde que: o coordenador não tenha alterações, os rascunhos de título e legenda (`textDraftsRef`) sejam iguais à base, e a descrição e o conteúdo dos editores sejam iguais à base. Se alguma dessas condições falhar, a comparação continua.
- `adoptGeneratedStrategies` aceita a mesma linha que já está registrada em `remoteVersion`.
- Com alterações locais, o modal oferece "Usar versão atual" e "Usar minha versão".
- Se o foco estava no editor quando a adoção é silenciosa, ele vai para o título, e não para o editor remontado. O foco continua no formulário.
