# Revisão independente dos tickets 05–09 — UZZINA

> **Histórico:** este documento registra a rodada anterior. Estado vigente e próxima leitura: [CURRENT.md](CURRENT.md); correções05–09: [fechamento](2026-10-06-fechamento-tickets-05-09.md).

Data: 06/10/2026. Checkout examinado: HEAD `fd66021`, mais alterações locais e arquivos novos do executor. Escopo: código, contratos, testes e preparação SQL de 05–09. Não é nova auditoria integral dos 52 achados nem inspeção do banco de produção.

## Parecer

A entrega não está aprovada como “05–09 concluídos”. Há implementação aproveitável, mas 06–09 permanecem parciais com defeitos concretos. Os testes passam e deixam passar falhas nos caminhos reais. Prioridade: estabilizar gravação/recuperação de ações (08–09), corrigir preparação de segurança (06–07), depois continuar10. Não aplicar estas migrations em produção nesta condição.

Nesta revisão não foi alterado código do aplicativo, teste, configuração ou migration, nem qualquer registro real. Somente documentos foram atualizados. Experimentos temporários usaram app local e Chromium, dados fictícios e HTTP externo controlado/bloqueado. Isso comprova o comportamento observado do código, não o estado do Supabase real.

## Verificações observadas

| Verificação | Resultado desta revisão | Alcance |
|---|---|---|
| `bun test` | 195 passam; 0 falham; 584 assertions; 13 arquivos | Suíte existente; não comprova gaveta nem banco real. |
| `bun run typecheck` | FALHA TS7053 em `action-save-coordinator.ts:142` | A afirmação de tipagem limpa do retorno não corresponde ao checkout atual. |
| `bun run lint` | Passa; 249 arquivos; sem correções automáticas | Padrões estáticos cobertos pelo linter. |
| Coordenador → mutation real no Chromium | `forceSave()` retorna false: `expectedUpdatedAt é obrigatório para atualização de ação.` | Código de produção real; rejeição anterior a qualquer write. |
| Coordenador → criação real no Chromium | `saveNow({title,description})` num rascunho retorna false: faltam date/category/priority/partners | Mesmo snapshot limitado usado pelo handleSave da gaveta; validação real. |
| Gaveta real: selecionar outro dia e apertar Atualizar | Passou no Chromium com HTTP controlado: primeiro PATCH contém só date; segundo usa versão retornada pelo primeiro | Caminho básico com linha/version válida e respostas de sucesso; não reproduziu incidente real. |
| Banco/migrations | Não executados | Policies/grants/tipos/triggers/atomicidade reais não certificados. |
| Mobile, upload real, cookies/produção | Não homologados nesta rodada | Não confundir Chromium controlado com17 completo. |

## Estado por ticket

| Ticket | Implementação correta/aproveitável | Pendência ou erro | Estado revisado |
|---|---|---|---|
| 05 | Token aleatório32bytes, hash no banco, TTL7dias, IDs vindos do registro, autorização antes de compartilhar, revogação por criador/admin, rejeição do link antigo | Migrations e fluxo completo de copiar/abrir/revogar precisam integração. Validação runtime dos bodies incompleta. | Implementado parcialmente; handlers cobertos localmente, fluxo e banco pendentes. |
| 06 | Gestão via servidor, admin ativo, bcrypt12, DTO sem senha/hash; RPCs propostas para revogar sessões | PATCH pode produzir efeito persistente antes de rejeitar entrada; validação incompleta; SECURITY DEFINER sem search_path fixo. | Parcial; corrigir antes de aprovar. |
| 07 | Script de inventário somente leitura; proposta de revogar anon; autenticação derivada na nova RPC | Isolamento de comentários errado, matriz SQL defeituosa, policies legadas não inventariadas, assinatura/tipos reais pendentes e semântica de período alterada | Não aprovado; preparação parcial, segurança real pendente. |
| 08 | Update de ação única filtra ID+versão; zero linhas vira conflito; retorna linha confirmada | Recuperação da gaveta incompatível, Desfazer usa versão antiga, timestamps ainda aceitos no patch, callers em lote pendentes11, banco/trigger não comprovados | Parcial; contrato não está integrado por inteiro. |
| 09 | Módulo de coordenação real, promessa de criação compartilhada e estados visíveis existem | Criação manual incompleta, edições de rascunho não entram na fila, fechamento externo contorna proteção, merge local/troca de ação inadequados; testes não montam gaveta | Não aprovado; regressões de gravação/recuperação. |

01–04 e correção de parceiros arquivados continuam baseline anterior. Foram preservadas referências de escopo/cache no código examinado; isso não equivale a rehomologar todos os fluxos anteriores após mudanças08. 10–17 continuam pendentes. Não substituir testes prévios por versões que escondam contratos novos.

## Erro relatado ao mudar a data — diagnóstico ainda aberto

O caminho da gaveta é `ActionDatePicker → EssentialsTab.onSelect → updateAction → ActionSaveCoordinator.scheduleUpdate → useActionMutations → updateActionClient`. O calendário chama onSelect ao fechar. O payload de data usa `getNewDateForAction`, que retorna apenas date; a versão vem de `confirmedAction.updated_at` do coordenador, não da seleção de data.

No Chromium, abrindo a gaveta real pelo teclado, selecionando outro dia, fechando o picker com Escape e apertando Atualizar, o fluxo básico passou com respostas HTTP controladas de sucesso. O PATCH de data usou a versão original; Atualizar usou a versão recém-retornada. Portanto não confirmei uma falha universal ao trocar data nem uma versão antiga em toda segunda gravação. Não há evidência suficiente para afirmar que a causa exata do incidente real é um campo de data inválido. O erro relatado não veio acompanhado do texto/resposta de rede. Há defeitos comprovados de recuperação e integração nesta cadeia; eles devem ser corrigidos sem alegar que a data foi resolvida automaticamente.

Triagem prescrita, antes de mudar a lógica:

1. Registrar mensagem exata, origem da ação (Hoje/calendário/busca), se erro ocorre ao fechar picker ou ao apertar Atualizar. Não registrar credenciais.
2. Capturar request PATCH actions e resposta: patch.date, versão no filtro updated_at, status/código de erro, versão da linha lida originalmente. Conservar string exata; não transformar versão em Date/ISO.
3. Ausência de request indica validação/fila/caller. PGRST116/zero linhas pode indicar versão antiga, linha removida ou invisível por RLS: hoje todos recebem o mesmo rótulo de conflito. Outra resposta deve manter o código original no diagnóstico.
4. Se updated_at estiver vazio/NULL, conferir read/RPC e migration040. Se versão existir, comparar com confirmação anterior e writes concorrentes. Não remover comparação de versão para fazer salvar.
5. Confirmar no banco de teste o tipo de updated_at, triggers existentes, avanço de versão e versão retornada. O relatório do executor diz que as migrations não foram aplicadas; não presumir que o Supabase real está compatível.
6. Testar gaveta real: mudar data→salvar→mudar novamente; picker aberto/fechado sem edição; data+descrição enquanto write está pendente; falha→retry; conflito→recuperação. Persistência/recarga real e gesto móvel ficam na homologação17.

## Falhas encontradas e instruções de correção

### R01 — P1: “Sobrescrever” não funciona; teste aprova um contrato inexistente

Evidência: `action-save-coordinator.ts:321–335` omite expectedUpdatedAt. `useActionMutations.tsx:83` e `supabase.mutations.ts:69` rejeitam a omissão. `drawer-save.test.ts` aceita ausência de versão no falso writeFn e chama isso de sucesso. A sonda com mutation real confirmou a rejeição.

Correção prescrita: remover a promessa de update incondicional. Recuperar versão atual sem perder draft, mostrar comparação e gravar decisão explícita usando a versão recém-lida, ainda protegida contra conflito seguinte. Não enfraquecer updateActionClient. Teste deve atravessar gaveta/hook/mutation reais, rejeitar versão ausente e confirmar preservação de edição após409.

### R02 — P1: criar pelo botão/atalho/retry pode enviar rascunho incompleto

Evidência: `ActionFormDrawer.tsx:247–251` envia só title/description/content_description a saveNow; `action-save-coordinator.ts:308–310` cria somente pendingPatch. Perde date/category/priority/partners e defaults do RawAction. O blur usa outro caminho com payload completo. A sonda real confirmou erro de validação para snapshot limitado. Pode parecer funcionar se o blur criar primeiro, mascarando o defeito do caminho manual/retry.

Correção: unificar payload inicial completo e válido de criação com a promessa compartilhada. Não enviar snapshot inteiro para updates existentes. Testar botão/atalho antes de blur, falha inicial→retry e confirmação do ID.

### R03 — P1: edições durante criação não chegam à fila a partir da UI

Evidência: `ActionFormDrawer.tsx:168–189` só chama scheduleUpdate se RawAction já tiver id. Enquanto INSERT está em voo, alterações comuns em rascunho retornam null sem recordLocalChanges. `EssentialsTab.tsx:320` atualiza a ref da descrição, mas não registra patch no coordenador. O teste chama recordLocalChanges diretamente, portanto não verifica a integração que o usuário usa.

Correção: registrar revisão/patch de campos na mesma chave enquanto creating; após INSERT persistir diferenças com ID+versão retornados. Montar gaveta real e editar data/responsáveis/descrição durante INSERT pendente; recarga deve confirmar valores posteriores, não o snapshot antigo.

### R04 — P1: clique externo e troca de ação descartam a proteção de salvamento

Evidência: `app/routes/app.tsx:215` fecha diretamente com setBaseAction(null); não chama handleSafeClose. `ActionFormDrawer.tsx:273` reset limpa patches na troca sem aguardar/salvar/manter draft recuperável. O caso A→B do teste apenas ignora resposta antiga; não prova preservação de trabalho nem passagem pelo fechamento real.

Correção: um contrato de pedido de fechamento/troca utilizado por overlay/X/Escape/atalho e navegação. Falha mantém editor aberto ou draft recuperável explicitamente identificado. Testar clique externo com write falhando e troca de ação com texto sem blur.

### R05 — P1: confirmação antiga pode sobrescrever campos locais novos

Evidência: `ActionFormDrawer.tsx:139–148` espalha a linha confirmada inteira sobre RawAction, sem usar revisão local/pendingPatch. O coordenador protege exclusão de patches por revisão, mas o componente não protege o conteúdo exibido. Enquanto request antigo chega, campo local novo pode voltar ao valor anterior; refs e editor podem divergir.

Correção: aplicar campos confirmados somente quando revisão local não mudou; ID/versão vêm do servidor. Testar request1 pendente→editar mesmo campo→responder1→ver texto mais recente→responder2. Asserções devem incluir DOM/editor e payload seguinte.

### R06 — P2: abrir/fechar sem editar ainda gera write

Evidência: handleSafeClose sempre envia título/descrições; safeClose registra esses valores como pendingPatch sem comparar com confirmação. Logo isDirty torna true e saveNow grava mesmo conteúdo, alterando updated_at e invalidando consultas. Abrir/fechar picker também chama onSelect sem comparação de data.

Correção: diferenciar alterações reais de snapshot para validação; nenhum write se valores canônicos não mudaram. Testar gaveta e picker sem alterações, incluindo Escape/X, contando zero PATCH e mantendo updated_at.

### R07 — P1: “Desfazer” do arquivamento captura versão anterior

Evidência: `useActionShortcut.tsx:169–180` fornece action.updated_at antigo no callback Desfazer. Trigger040 avança a versão na gravação de arquivar; restore então conflita. O toast de sucesso é emitido antes de confirmação.

Correção: aguardar resultado do arquivamento, oferecer Desfazer só após sucesso e usar sua versão retornada. Testar falha sem toast de sucesso e archiveV1→retornoV2→undoV2. Não recircular snapshot amplo.

### R08 — P1: comentários não estão isolados por ação na migration

Evidência: migration030:226 usa apenas is_active_member() para SELECT action_comments. INSERT também exige só autor próprio, sem vínculo com ação autorizada. Membro ativo pode ler notas de ações alheias se esta policy for aplicada e houver grant. RLS da tabela actions não se propaga automaticamente para action_comments.

Correção: vincular cada operação ao action_id autorizado e regras de autoria/audiência. Banco de teste deve demonstrar membroA→comentárioB negado para SELECT/INSERT/UPDATE/DELETE, admin permitido e portal sem notas internas. Policy legada permissiva pode ampliar acesso: inventariar e tratar antes de afirmar proteção.

### R09 — P1: PATCH de conta rejeita pedido depois de mudar senha/desativar

Evidência: `api/client-accounts.ts:240–274` faz RPC de senha/desativação antes de validar parceiros em284–305. Senha válida+parceiro inválido pode retornar400 depois de trocar senha e revogar sessões. Campos gerais podem falhar após efeito já confirmado. PATCH não reaplica validação de nome/email do POST; casts não validam runtime.

Correção: validar body completo antes de qualquer efeito. Definir resposta/atomicidade do conjunto; combinar alterações necessárias em transação quando contrato exige tudo ou nada. Testar senha+parceiro inválido→400 e zero RPC/write; nome/email/tipos inválidos→400; falha persistente sem confirmação falsa. Não declarar transação do pedido inteiro só porque cada RPC isolada é transacional.

### R10 — P1: matriz SQL não é homologação executável

Evidência: `test-database-matrix.sql:50` lê actions como anon depois do REVOKE; insufficient_privilege esperado não é capturado e aborta bloco/transação. Linha131 usa RAISE NOTICE fora de PL/pgSQL. Teste Bun apenas verifica que strings BEGIN/ROLLBACK/SET ROLE existem.

Correção: script executável em banco descartável com erros esperados capturados e falhas inesperadas diferenciadas; limpeza garantida pelo runner/encerramento transacional, sem tratar ocorrência da palavra ROLLBACK como prova. Acrescentar matriz completa descrita no07, inclusive escritaB, notas, RPC adulterada, clientes/review e concorrência08. Sem banco, marcar preparado/não executado; nunca “validado SQL”.

### R11 — P1: preparação de policies/RPCs não preserva todos os contratos

Evidências: migration030 apaga apenas policies com nomes novos escolhidos; policies existentes de outros nomes continuam e permissivas se combinam por OR. Migration020 tem três funções SECURITY DEFINER sem search_path fixo, apesar do contrato07. get_home_actions em030:350–357 inclui atrasados fora do intervalo e exclui done no ramo extra; arquivo vigente `supabase_update_get_home_actions.sql` limita período e declara atraso separado. Done=Feito, finished=Concluído: não alterar essa distinção. get_app_bootstrap da migration continua retornando arquivados, embora frontend filtre; isso não é sozinho prova de regressão visual, mas diverge do escopo operacional.

Correção: inventário read-only real de assinaturas, overloads, tipos de colunas/arrays, policies/grants e triggers. Preservar período atual, parceiros ativos e auth.uid. O ticket07 exige p_user_id compatível com auth.uid; a nova função abre exceção para admin, não prevista nesse contrato: alinhar o parâmetro ou registrar decisão explícita antes de declarar conformidade. O SQL antigo indica arraysUUID, novo usa text[]; TypeScript string[] não decide tipo PostgreSQL. Registrar incompatibilidade até conferir, sem aplicar SQL às cegas. Restringir alteração própria de people às colunas/RPC permitidas, conforme07; policy que impede promoção não equivale a projeção de escrita restrita.

### R12 — P2: timestamp canônico ainda não é dono único

Evidência: `ActionPatchSchema:168` aceita updated_at e mutation copia campo; callers de título/atalhos espalham action completo, incluindo updated_at. Portal `api/dash-action.ts:140` ainda envia timestamp de relógio do servidor HTTP. Inserts também permitem updated_at gerado no browser. Trigger040 pode sobrepor esses valores quando aplicado, mas seu efeito/ordem não foram inspecionados. Bulk continua versão/timestamp antigos até11.

Correção: versão esperada deve ser metadado separado e patch deve conter apenas campos de negócio. Remover timestamps de payloads pertinentes; default/trigger do banco fornecem versão. Testar mudança de data manda somente date, além de ID/metadado, e usa a versão exata retornada na próxima escrita. Preservar o aviso de incompatibilidade bulk até11.

### R13 — P2: retorno antigo de A pode ser aceito após A→B→A

Evidência: coordinator compara apenas key/ID com targetKey; reset limpa inFlightPromise sem geração. Ao voltar ao mesmo ID, resposta da abertura antiga passa na igualdade e finally pode limpar ponteiro da nova gravação. Teste atual só faz A→B.

Correção: geração de operação/draft por reset e proteção tanto da aplicação da resposta quanto do finally. Testar A1 lento→B→A2 novo→respostas fora de ordem, sem sobrescrever A2 nem liberar fila prematuramente. Confirmar interação com componente real e mudanças do R04.

## Qualidade dos testes: o que manter e completar

Testar módulo de produção isolado é válido; não deve ser confundido com teste da sua integração. Os testes05/06 importam handlers reais e falsificam SDK/Auth: manter o núcleo e acrescentar entradas inválidas/efeitos parciais. Os testes08 inspecionam mutation real: manter filtros e conflitos; timestamp avançando dentro de array falso não comprova trigger, RLS nem duas transações.

`drawer-save.test.ts` verifica somente ActionSaveCoordinator e troca o writeFn. Não importa/monta ActionFormDrawer, não usa eventos reais, provider/hook/mutation reais, e ainda aceita o contrato falso de forceSave. Não é substituto do item09 prescrito. Instalar RTL não prova que ela foi utilizada. `database-authorization.test.ts` é checagem textual auxiliar; seus sete passes não comprovam autorização, sintaxe/execução SQL nem atomicidade.

Testes de código com DOM simulado e componente real são necessários para fila, erro/retry, snapshots e integração. Não abandonar esses casos como “só navegador”. Navegador valida foco, popover, clique externo, teclado, toque/layout, upload e persistência integrada; banco real valida RLS, grants, tipos, triggers e transações. Cada camada tem status separado.

## Retificação dos 52 achados

A matriz baseline continua histórica. As linhas07–11 do retorno do Gemini estavam aprovadas por evidências de concorrência que não encerram os temas originais:

| Achado original | Estado desta revisão | Evidência/ação |
|---|---|---|
| 02 | Parcial | Bcrypt/DTO no servidor existem; contaPATCH e banco ainda incompletos (R09/R11). |
| 04 | Parcial, SQL não homologado | Auth derivada existe; policies/overloads/tipos/matriz não comprovados (R08/R10/R11). |
| 05 | Parcial | Guard/handler admin aproveitáveis; autorização global não encerrada pelo SQL preparado. |
| 07 | Revalidar limpeza explícita | Conflito de versão não prova que limpar campos/arrays persiste. Testar caminhos reais. |
| 08 | Revalidar temas da ação | Coordenador/CAS não prova persistência de temas. Não confundir com preferências/paleta. |
| 09 | Não encerrado | Retry da criação tem snapshot incompleto e edição em voo não integrada (R02/R03). |
| 10 | Não encerrado | Atalho/fechamento real não testados, overlay contorna proteção (R02/R04). |
| 11 | Parcial com erros | Há proteção de versão, mas recuperação/merge/fila precisam revisão (R01/R05/R13). |
| 23 | Parcial com falha no SQL novo | Isolamento de comentários de equipe precisa R08 e banco real. |
| 48 | Parcial com preparação defeituosa | Inventário não executado e matriz SQL deve ser corrigida. |
| 49 | Não encerrado | Suíte verde sem gaveta real; falso aceita contrato impossível; typecheck falha. |
| 51 | Não corrigido integralmente | safeClose/picker registram edição sem mudança (R06). |

Os demais achados mantêm os encaminhamentos da baseline, sem nova aprovação por associação ao número do ticket. Não foi verificado novamente todo o app nesta rodada.

## Próxima execução e retorno

Executar em fatias: R01/R02/R03 e captura do erro de data; R04/R05/R06/R13; R07/R12; R09; R08/R10/R11. Preservar contratos já corretos e estilo atual. Cada fatia: teste real que falha→mudança mínima→mesmo teste passa; correção prévia não recebe RED inventado. Depois suíte, typecheck e lint. Build ao fechamento/configuração/rotas alteradas.

Somente após estabilizar08–09 continuar `.scratch/correcoes-auditoria-2026-10-06/issues/10-cache-otimista.md` (o nome `10-calendario-acoes-tardias.md` do retorno anterior não existe). Integração de segurança continua condicionada ao banco real e conjunto compatível.

O executor atualiza `2026-10-06-retorno-gemini-pendencias.md` preservando histórico e separa, para cada Rxx: arquivo alterado, teste/interface real, RED observado, GREEN, caso que ainda falha, banco/navegador/produção. Informar texto/código/causa demonstrada do erro de data e resultado da segunda gravação/recarga. “195 testes passam” não substitui evidência por comportamento. Não modificar baseline52 para fabricar fechamento.
