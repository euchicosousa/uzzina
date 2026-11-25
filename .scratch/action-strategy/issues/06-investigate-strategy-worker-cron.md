# EST-06: Investigar o cronômetro de geração de estratégias

**O que investigar:** identificar o cron que chama periodicamente o worker usado por **Gerar estratégias** na gaveta de uma ação. Explicar por que ele existe, se esse processamento em segundo plano ainda é necessário/desejado e o que deixaria de funcionar se fosse pausado ou removido. Recomendar manter, ajustar ou substituir o mecanismo. Não alterar, pausar ou desligar nada durante o estudo.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status: concluído (25/11/2026).** Código e migration em produção; a fila antiga está zerada (30 operações concluídas, nenhuma pendente) e o cron `uzzina-strategy-worker` foi **pausado** em 25/11/2026 (`cron.alter_job(..., active := false)`, confirmado `active=false`). Reversível: `SELECT cron.alter_job(jobid, active := true) FROM cron.job WHERE jobname = 'uzzina-strategy-worker';`. Falta apenas o teste real de Gerar/Recriar estratégias pelo proprietário; se falhar, reative o cron. O endpoint antigo e o cron seguem preservados (sem remoção).

- [x] Localizar e explicar o cron: frequência, serviço, worker chamado e operação que ele processa.
- [x] Verificar como **Gerar estratégias** registra e acompanha a operação, e confirmar se há outro caminho no código que executa a fila.
- [x] Confirmar o estado atual em produção e apontar evidências; separar o que está no código do que foi efetivamente verificado no serviço.
- [x] Recomendar uma substituição para o cron, com impactos, estimativa e validação.

## Resultado da leitura do código e dos registros (22/11/2026)

- O cron do Supabase chama `/api/strategy-worker` a cada 30 segundos. O worker pega no máximo uma operação salva por chamada, gera as estratégias com o modelo escolhido e grava/aplica o resultado. O navegador não executa a geração.
- Na gaveta da ação, **Gerar estratégias** registra o pedido e acompanha o estado consultando o servidor a cada 2 segundos. Fechar a gaveta ou o app não cancela o trabalho; a fila e as tentativas de recuperação ficam no servidor.
- O worker também atualiza `last_worker_at`, usado para indicar se o serviço está pronto. Sem chamadas periódicas, essa prontidão expira em cerca de 2 minutos e novas solicitações persistentes são recusadas. Portanto, remover só o cron sem substituto interromperia o fluxo atual de geração.
- O código não oferece um caminho alternativo que execute a fila após aceitar o pedido. Uma alternativa exigiria mudança de arquitetura, como disparar o worker após gravar e manter um mecanismo de recuperação para operações pendentes.
- Os registros de publicação documentam a ativação e execuções bem-sucedidas em 01/11/2026. A primeira consulta ao vivo foi bloqueada pela revisão automática até a confirmação do projeto pelo proprietário.
- O fluxo atual depende do cron para processar a fila. Para preservar os botões da gaveta, a troca do fluxo precisa acontecer antes da pausa do cron.

## Estado em produção e proposta de mudança

Após o proprietário confirmar o projeto `bussola`, a consulta de leitura confirmou o cron ativo a cada 30 segundos. A última execução bem-sucedida observada foi às 22h41min31s de 22/11, no horário de Fortaleza, com registro de atividade do executor no segundo seguinte.

A proposta mantém **Gerar estratégias** e **Recriar estratégias** na gaveta. O servidor gera e salva no mesmo pedido iniciado pelo clique. Com a aba fechada ou a conexão interrompida, a conclusão deixa de ser garantida. Ao voltar, a pessoa confere se o resultado foi gravado antes de repetir, pois a IA pode ter processado e cobrado a tentativa. Estratégias já salvas permanecem na ação. Planejamento usa um fluxo separado.

O trabalho inclui adaptar o servidor e a gaveta, preservar permissões, versão da ação, escolha do modelo, quota e proteção contra pedidos duplicados, validar geração, recriação e interrupção e esvaziar a fila antiga antes de pausar o cron. Há um gerador direto no servidor que pode ser reaproveitado, mas a gravação segura na ação precisa fazer parte do novo fluxo. Estimativa de um dia de trabalho para preparar e validar a troca. Limpeza definitiva de endpoints e estruturas antigas pode ficar para depois, com até mais um dia de trabalho se for solicitada. Parecer concluído em documentação local. Nenhuma mudança funcional aplicada.

## Modelos sugeridos

- Codex — gpt-6.2-sol. Adequado para rastrear o cron e suas dependências no código e na documentação operacional.
- Codex — gpt-6.2-astra. Alternativa para avaliar os impactos de pausar ou remover o processamento em produção.
- Codex — gpt-6.1-terra. Alternativa para explicar com clareza o fluxo visível ao proprietário.

## Implementação local e transição (22/11/2026)

Na gaveta de uma ação, em Essencial → Estratégias, **Gerar estratégias** e **Recriar estratégias** passam a esperar a geração e a gravação na própria requisição. A tela pede para manter a aba aberta. Estratégias anteriores permanecem durante a recriação; um resultado só substitui o conjunto depois da gravação segura. Após interrupção, a conclusão não é garantida: reabra a ação e confira antes de tentar de novo. Uma resposta incerta da IA não é gerada novamente automaticamente. O Planejamento continua independente.

O código está pronto para publicação. A [migration](../../../supabase/migrations/20261122230000_direct_strategy_operations.sql) foi aplicada no Supabase de produção `uzzina` em 23/11/2026, registro remoto `20261123124102`; as três RPCs foram conferidas como `SECURITY INVOKER`, com `search_path` vazio e EXECUTE apenas para `service_role`. Typecheck, build, oito verificações serverless, Prettier dos arquivos alterados e Biome focado passaram. As RPCs novas conservam a autorização, versão, modelo, reservas e lease; resultado retido pode ser aplicado sem outra chamada de IA. Um pedido que ficou na fila sem começar expira após três minutos e libera a reserva; uma geração de resposta incerta fica marcada para conferência. A API antiga do executor e o agendador continuam disponíveis; cron segue ativo até a conferência e drenagem descritas abaixo.

### Publicação e drenagem — estado em 23/11

1. Conferir o projeto e as funções vigentes no banco, aplicar somente a migração acima e verificar as três RPCs novas e seus grants: somente `service_role`, sem `anon`/`authenticated`. Manter o cron ativo e o app antigo funcionando. Não usar `db push` em lote.
2. Publicar o código com duração de 180 segundos para a API e confirmar que a versão está **Ready**. Validar numa ação autorizada Gerar, Recriar, modelo escolhido, reabertura e estratégias anteriores. Simular interrupção de forma controlada e conferir estado e eventual uso antes de repetir. Não confundir respostas HTTP simuladas com validação do banco ou provedor real.
3. Com o cron ainda ativo, consultar contagens e idades de `strategy_operations` por estado, sem expor conteúdo. Esperar a fila antiga (`queued`, `generating`, `generated`) zerar; investigar operações presas, resultados retidos ou incertos individualmente, sem apagar nem regenerar. Não desativar enquanto houver trabalho antigo pendente.
4. Depois da versão Ready conferida e da fila drenada, pausar especificamente `uzzina-strategy-worker` com `cron.alter_job(..., active := false)` e confirmar `active=false`. Após mais de dois minutos, validar novamente geração e recriação e que não dependem do heartbeat; monitorar erros, uso e operações pendentes. Cron e endpoint antigos ficam preservados para retorno, sem remoção de dados.
5. Se falhar, reativar o cron e voltar à versão anterior se necessário; verificar fila/resultado antes de repetir qualquer geração. A migração adiciona funções e mantém as antigas, permitindo esse retorno. A limpeza definitiva é trabalho separado.

Consultas operacionais para a etapa posterior de drenagem:

```sql
-- Somente leitura: verificar pendências antes de pausar.
SELECT state, count(*), min(created_at) AS oldest_created_at
FROM public.strategy_operations
WHERE state IN ('queued', 'generating', 'generated')
GROUP BY state;
SELECT jobid, jobname, schedule, active
FROM cron.job WHERE jobname = 'uzzina-strategy-worker';

-- Escrita: somente após Ready, validação e fila antiga drenada.
SELECT cron.alter_job(jobid, active := false)
FROM cron.job WHERE jobname = 'uzzina-strategy-worker';
SELECT jobid, jobname, schedule, active
FROM cron.job WHERE jobname = 'uzzina-strategy-worker';

-- Retorno, se necessário.
-- SELECT cron.alter_job(jobid, active := true)
-- FROM cron.job WHERE jobname = 'uzzina-strategy-worker';
```

### Verificação e limites

50 testes locais da API passaram com provedor e banco simulados; `tsc --noEmit` e 11 verificações serverless passaram. Biome identificou uma dependência ausente preexistente em `checkRemoteVersion` no arquivo da gaveta, fora desta alteração; não foi modificada. Migração exercitada em PostgreSQL isolado com esquema simplificado para aceitação, claim exclusivo sequencial, lease vencido e acesso negado. Isso não prova autorização real, concorrência entre conexões nem configuração de produção. Falta conferir a interface e uma geração real após publicação autorizada.
