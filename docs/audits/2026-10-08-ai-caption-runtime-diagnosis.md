# Falha de geração de legenda — diagnóstico e roteiro de correção

Data: 08/10/2026. Escopo: investigação e documentação; outro agente fará a correção. Leitura conjunta: [falha de criação por RLS](2026-10-08-action-creation-rls-diagnosis.md).

Estado posterior: imports corrigidos e pacote real das funções validado no Node; geração com Auth/cota/OpenAI de staging passou. Este documento preserva o diagnóstico; consulte o [resultado da implementação](2026-10-08-action-and-ai-fixes.md). Ainda não houve deploy desta correção.

## Conclusão e evidência do usuário

O usuário confirmou que clicou em “Gerar legenda” em uma ação **já criada**. A captura das13h27 mostra a mensagem “Não foi possível gerar conteúdo com IA. Seu texto foi mantido.” e apenas a assinatura da parceira no campo. Posteriormente esclareceu que estava usando a versão local e refez o teste no app publicado. Não atribuir automaticamente à captura local a causa identificada na Vercel; o novo POST de produção tem evidência própria.

Foi confirmada uma segunda falha, independente da criação por RLS: a função publicada em `https://uzzina.cnvt.com.br/api/ai` retorna **HTTP500, FUNCTION_INVOCATION_FAILED**, inclusive para GET e POST sem autenticação. Essas chamadas deveriam ser tratadas no início do handler com405 e401, respectivamente. O corpo recebido é texto da plataforma Vercel, não o JSON de erro do handler.

O novo export enviado pelo usuário confirmou a causa de produção: **`ERR_MODULE_NOT_FOUND` ao importar `/var/task/app/lib/ai-contract` a partir de `/var/task/api/ai.js`**. O processo Node encerra com status1 antes de entrar no handler e chamar a OpenAI. A falha de resolução de módulo deixou de ser hipótese. Ainda é necessário inspecionar o artefato para definir a alteração exata de extensão/inclusão do arquivo e validar a correção. O erro de RLS de criação permanece separado.

## Percurso do código

1. `app/components/features/action-drawer/InstagramTab.tsx:221` chama `triggerAIAction(INTENT.ai_caption)`.
2. `ActionFormDrawer.tsx:320` chama `callAI` antes de tentar persistir a legenda. Não exige criar uma ação antes e não envia ID da ação à API de IA.
3. `app/services/ai-client.ts` envia POST para `/api/ai` com a sessão atual. HTTP500 não tem mensagem própria no mapa; cai no texto genérico observado. O cliente tolera o corpo não JSON da Vercel e usa esse mesmo texto.
4. Somente após uma resposta válida, `ActionFormDrawer.tsx:360–377` atualiza a legenda na interface e solicita a gravação. Em rascunho, `updateAction` mantém o conteúdo local sem forçar criação; em ação existente, agenda atualização.
5. `api/ai.ts` valida método, Bearer, configuração, entrada, usuário ativo e cota antes de chamar a OpenAI. A implementação não consulta `actions` nem `can_access_action` para gerar a legenda.

Portanto, RLS pode impedir a persistência de conteúdo de uma ação nova, mas não explica a função de IA publicada falhar até em GET sem acessar o banco.

## Verificações executadas

### Publicação real, sem escrita em ações

Consultas realizadas em08/10, aproximadamente13h28–13h30, America/Fortaleza:

| Consulta | Resultado real | Resultado esperado no código |
|---|---|---|
| GET `/api/ai` |500, texto `FUNCTION_INVOCATION_FAILED` |405, JSON e `Allow: POST` |
| POST `/api/ai`, JSON mínimo e sem Bearer |500, mesmo erro de plataforma |401, JSON de sessão inválida |
| GET `/api/review`, sem parâmetros |404, JSON do handler |Recusa normal de link inválido |
| GET `/api/client-accounts`, sem Bearer |401, JSON do handler |Recusa normal por ausência de token |
| GET `/api/dash-action`, sem cookie de sessão |500, erro de plataforma |401 por falta de sessão, se configurado; erro JSON de configuração se indisponível |

IDs das duas chamadas de IA, úteis para localizar logs:

```text
GET  gru1::5vkcc-1791476932545-adf282aa0cd3
POST gru1::t4wnf-1791476933105-b5af7b51a9ba
```

Laço de reprodução seguro, sem autenticação e sem geração:

```sh
curl -i https://uzzina.cnvt.com.br/api/ai
curl -i -X POST https://uzzina.cnvt.com.br/api/ai \
  -H 'Content-Type: application/json' \
  --data '{"intent":"ai-caption","category":"post"}'
```

### Provedor e configuração local

- GET `/v1/models/gpt-6-luna` na OpenAI retornou200 com a chave existente em `.env`.
- Uma única geração mínima, com texto fictício e os mesmos parâmetros de Chat Completions e `response_format: json_object` usados na legenda, retornou200 e JSON com `caption` não vazia. Consumo informado:149 tokens. Nenhum conteúdo de cliente foi enviado nesse teste.
- Os arquivos `.env`, `.env.vercel-production.local` e `.env.staging.local` contêm a mesma chave OpenAI. Isso **não confirma** quais valores estão ativos na Vercel.
- `.env.vercel-production.local` contém as variáveis exigidas pelo modo estrito e `AI_DAILY_LIMIT=100`. O `.env` comum depende do modo local de compatibilidade; não contém chave privilegiada do Supabase. Nada disso demonstra configuração ativa do deploy.
- Não há evidência para trocar o modelo ou a chave como primeira medida: a combinação local consultada funcionou.

### Banco e testes

- Consulta de produção em transação somente leitura confirmou `consume_ai_usage(uuid,integer)` e EXECUTE para `service_role`. Não foi executada a função mutável.
- Não havia registros em `ai_usage` para o dia UTC corrente no momento da consulta. Isso é compatível com a falha anterior à reserva da cota; não é rastreamento da requisição original nem certificação da RPC sob a identidade do servidor.
- `bun test tests/ai.test.ts tests/ai-client.test.ts`:56 testes passaram,151 assertions. Eles simulam OpenAI/Supabase e não empacotam nem inicializam a função no runtime publicado.
- A leitura de logs pela CLI Vercel falhou com `The specified token is not valid`. Não houve relogin, alteração de credenciais nem deploy. O export posterior fornecido pelo usuário supriu o stack trace necessário; acesso autenticado continua necessário para conferir artefatos e validar uma publicação futura.

## Causa confirmada: resolução dos módulos no runtime publicado

`api/ai.ts:1` importa em runtime `../app/lib/ai-contract` sem extensão. `api/dash-action.ts:4`, que também falhou, importa `../server/dash-session` sem extensão. Já as APIs de comparação que responderam normalmente não usam import relativo de valor; seus imports locais são apenas de tipos.

O projeto usa `"type": "module"` e TypeScript com `moduleResolution: "bundler"`. O desenvolvimento usa `server.ssrLoadModule`, e os testes usam Bun; esses ambientes não comprovam a resolução de imports pelo artefato Node publicado na Vercel. Os logs agora mostram o resolvedor ESM do Node tentando carregar justamente os caminhos sem extensão e lançando `ERR_MODULE_NOT_FOUND`. Em ESM nativo, imports relativos exigem extensão, conforme a [documentação Node](https://nodejs.org/api/esm.html#mandatory-file-extensions).

A correção deve garantir que o import emitido resolva o arquivo efetivamente incluído na função. Se o artefato emitir `ai-contract.js` e `dash-session.js`, uma direção é usar imports de runtime com `.js` compatíveis com esse resultado. Também é preciso confirmar inclusão/transpilação dos módulos; mudar somente o texto do import sem verificar o pacote não basta. Não há evidência de que modelo, chave OpenAI, cota ou RLS causem essas invocações500: elas falham no carregamento anterior a essas etapas.

### Export que confirmou a causa

Fonte: `/Users/euchicosousa/Downloads/uzzina-log-export-2026-10-08T16-39-11.json`. São15 entradas de8 requisições distintas. Cinco requisições de `/api/ai` falharam com500; incluem os probes anteriores e POSTs de navegador. O novo teste do usuário consta às16h38m48 UTC, **13h38m48 em America/Fortaleza**, com requestId `sljnp-1791477528268-92b6839268c3` e o mesmo deployment identificado abaixo.

Trecho decisivo da geração:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/app/lib/ai-contract'
imported from /var/task/api/ai.js
Node.js process exited with exit status: 1.
```

O export também confirma a causa do500 do probe de `/api/dash-action`, às13h29m46:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/dash-session'
imported from /var/task/api/dash-action.js
```

`api/dash-auth.ts` e `api/dash-data.ts` importam o mesmo `server/dash-session` em runtime e devem entrar na revisão da correção. Não há requisições dessas duas rotas neste export; o impacto nelas permanece potencial, não testado nesta análise.

## Complemento: export de logs enviado pelo usuário

Arquivo analisado: `/Users/euchicosousa/Downloads/uzzina-log-export-2026-10-08T16-37-41.json`. O nome indica exportação às16h37 UTC; os eventos internos são das16h29m43–44 UTC, equivalentes a13h29m43–44 em America/Fortaleza.

O export tem duas entradas da **mesma requisição**, ambas para GET `uzzina.cnvt.com.br/api/review`, com status404 e user-agent `Python-urllib/3.9`. Horário, método, rota e agente correspondem ao probe de comparação feito nesta investigação. Uma entrada registra a execução e a outra o aviso Node `DEP0169` sobre `url.parse()`. A API de revisão respondeu o JSON esperado para ausência de um link válido.

Não há entrada de `/api/ai`, status500, `FUNCTION_INVOCATION_FAILED` ou stack trace de falha de inicialização nesse arquivo. O aviso de depreciação, embora exportado com `level: error`, não comprova a causa da falha da IA. O export também não permite concluir que a Vercel não tenha outros logs: pode refletir o filtro, o intervalo ou o conjunto de eventos exportado.

### Divergência confirmada de projeto Vercel

| Origem | Identificador |
|---|---|
| `projectId` no log do domínio publicado | `prj_8PN3IDaxZAHtFwkwViE7GplFBQWE` |
| `projectId` em `.vercel/project.json` local | `prj_sFbkpGYbgTWb1uHFoGMIFpmZ90Pz` |
| Deployment registrado no export | `dpl_5svuAMUkaxMVP8ampxFXbV55TnH5` |
| Domínio do deployment registrado | `uzzina-ih0rtkc83-agenciacnvt.vercel.app` |

Os IDs de projeto são diferentes. Isso não prova a causa do500 nem permite afirmar qual vínculo está obsoleto, mas impede assumir que comandos executados com o vínculo local consultem ou publiquem no projeto que serviu o domínio. A tentativa anterior da CLI nem chegou à consulta, pois o token era inválido. Não foi alterado o vínculo local.

O segundo export confirma esses mesmos identificadores e já contém o erro da IA; não é necessário pedir outro log para comprovar a falha de resolução. O próximo agente deve identificar o projeto/deployment que serve o domínio atualmente, partindo desses IDs, e inspecionar o artefato correto. A divergência de projeto deve ser resolvida antes de qualquer deploy; não executar relink ou publicação automaticamente com base apenas neste relatório.

## Passo a passo para o agente executor

1. **Preservar estado e identificar o projeto correto.** Ler CURRENT e os dois diagnósticos; conferir Git. Confrontar o projeto do export com o vínculo local divergente, conforme a seção anterior. Identificar o destino atual de `uzzina.cnvt.com.br`; não assumir que o nome UZZINA ou o vínculo local bastam. Não alterar vínculo nem publicar até confirmar o destino.
2. **Usar o stack trace confirmado e conferir o artefato servido.** O segundo export já identifica `ERR_MODULE_NOT_FOUND` de `ai-contract` e `dash-session`. No projeto correto, conferir commit, runtime Node e estado Ready; comparar a API publicada ao checkout. Inspecionar imports emitidos e a presença/extensão dos arquivos nas funções. A CLI local precisa de autenticação renovada; usar uma sessão autorizada já disponível, se houver. Ready sozinho não comprova que a função inicializa.
3. **Corrigir a resolução e inclusão dos módulos.** Reproduzir o carregamento no artefato de funções equivalente ao da Vercel. Ajustar os imports relativos de runtime para apontar ao arquivo emitido, com extensão explícita quando exigida pelo ESM; confirmar que os módulos são incluídos/transpilados no pacote. Revisar `api/ai.ts`, `api/dash-action.ts`, `api/dash-auth.ts` e `api/dash-data.ts`, além das dependências transitivas pertinentes. Não confundir imports apenas de tipos, removidos na compilação, com dependências executadas. Manter um único contrato de IA e os controles de sessão do portal, sem copiar validações nem remover segurança para contornar o import.
4. **Adicionar regressão na fronteira correta.** Exercitar o módulo/artefato realmente empacotado, sem substituir o import que falhava. GET deve retornar405 e POST sem Bearer deve retornar401, ambos JSON e sem chamar Supabase/OpenAI. Os testes atuais com dependências simuladas não substituem essa verificação.
5. **Validar a configuração e a geração em staging.** Confirmar as variáveis exigidas por `api/ai.ts` no ambiente efetivo, sem expô-las. Usar Auth real, membro ativo e cota persistente. Gerar uma legenda fictícia em ação existente, conferir200 com `{intent:"ai-caption",output:{caption:"..."}}`, aguardar persistência e reabrir a ação. Preservar o texto anterior em erros, e conferir negativas401/403/429/503 conforme os contratos existentes.
6. **Corrigir também a criação por RLS, como frente independente.** Seguir o outro documento. Depois testar geração em rascunho, criação, retorno canônico, salvamento da legenda e reabertura. Não considerar que resolver um defeito resolve o outro.
7. **Executar verificações e publicar de forma controlada.** Testes pertinentes, lint, typecheck, build do app e verificação do artefato de funções. Após novo deploy Ready, repetir os probes públicos405/401 e a geração autenticada. Verificar também `/api/dash-action` e os handlers afetados pela correção compartilhada. Atualizar CURRENT distinguindo código preparado, staging e produção validada.

Se a função passar a responder mas a geração continuar falhando, localizar a etapa pela resposta:

| Resposta | Próxima verificação |
|---|---|
| Sem POST na rede | Validação local, clique, sessão e erros do navegador |
|400 /413 | Schema, categoria, tamanho dos textos e limite de64KB |
|401 /403 | Sessão Auth e pessoa ativa |
|503 `AI_CONFIGURATION_MISSING` | Variáveis do ambiente efetivamente publicado |
|503 `AI_QUOTA_UNAVAILABLE` | RPC, chave de servidor e autorização da reserva |
|429 | Cota diária e `Retry-After` |
|502 | Erro seguro do provedor, compatibilidade dos parâmetros ou JSON de saída |
|200 seguido de falha PATCH em `actions` | Persistência, versão/conflito e autorização da ação |
|500 de plataforma /504 | Runtime Logs, inicialização ou timeout da função |

## Estado final e limites

Nenhum código, migration, permissão ou deploy foi alterado. Nenhuma ação foi criada/editada por esta investigação; nenhuma cota de produção foi consumida pelo aplicativo nos probes do agente. A chamada mínima direta ao provedor é um teste sintético e não certifica a API da Vercel. O defeito de invocação publicado foi reproduzido e sua causa de resolução de módulos foi confirmada pelos logs. A correção ainda precisa ser implementada e testada no artefato e na publicação. A falha local relatada pelo usuário não foi reproduzida; não presumir que o loader do Vite falhe da mesma forma que o Node publicado.

Referência do teste de disponibilidade: [OpenAI — Retrieve a model](https://developers.openai.com/api/reference/resources/models/methods/retrieve). Disponibilidade do modelo não substitui teste de geração nem do handler publicado.
