# 01: Recuperar salvamento sem confirmação e tornar a duplicação segura

**What to build:** quando uma ação existente for salva e a confirmação se perder, permitir recuperar o estado confirmado sem perder a edição local, criar cópia ou sobrescrever alterações concorrentes. Ao duplicar explicitamente, impedir envio durante salvamento/erro/conflito, proteger contra ativação repetida e informar o resultado antes de fechar a ação correta.

**Blocked by:** Not applicable — closed by owner; original scope retained only as historical context.

**Status:** closed-not-planned — owner decision 2026-10-29; isolated incident, insufficient evidence of recurrence and unfavorable cost-benefit; no implementation

## Encerramento pelo proprietário — 29/10/2026

O proprietário decidiu encerrar o ticket sem implementar: o caso conhecido é pontual, não há evidência suficiente de recorrência e o custo/complexidade não se justificam. Não tratar como correção entregue; nenhuma mudança funcional foi feita. O escopo original abaixo permanece apenas como histórico, fora da fila de execução. Reabrir somente por nova solicitação apoiada em nova evidência; não criar automaticamente um ticket menor de duplicação.

## Origem e evidência

Em17/10/2026, o proprietário relatou um problema com “Segurando o burger”, do Toro. O diagnóstico encontrou original e cópia persistida. Às13:00:04 uma atualização foi aceita; às13:00:10 uma atualização com a mesma versão anterior recebeu conflito; às13:00:14 houve leitura do original e criação de outra ação pelo fluxo de duplicação. Horários de Fortaleza.

Não há evidência de Atualizar ter se convertido automaticamente em Duplicar. Os registros não identificam gesto físico, atalho ou intenção. Teste controlado demonstrou que uma escrita aplicada cuja resposta se perde pode fazer a próxima tentativa conflitar com a própria gravação; não provou que essa foi a única causa do caso real.

Inspeção em29/10 confirmou que o coordenador ainda preserva versão antiga quando não recebe confirmação, bloqueia a persistência em conflito até comparação e mantém o patch local. O botão Duplicar dispara a mutação antes de pedir fechamento e não aguarda o resultado. Estes são os comportamentos a reproduzir no código real antes da mudança.

## Experiência esperada

1. O usuário edita uma ação existente e salva.
2. Se a confirmação falhar, permanece na ação com texto e alterações preservados. A mensagem não afirma sem evidência que outra pessoa editou.
3. Ao conferir/tentar novamente, o aplicativo consulta a versão canônica autorizada e compara o estado enviado, a base conhecida e a edição local atual.
4. Se for seguro reconhecer o resultado já persistido, atualiza a confirmação e a versão sem reenviar a mesma atualização; alterações feitas depois do envio continuam pendentes.
5. Se houver divergência real ou não for possível concluir com segurança, mantém comparação/decisão explícita e não sobrescreve automaticamente.
6. Duplicar é operação explícita separada. Com edição não confirmada ou estado de erro/conflito, a interface orienta resolver o salvamento primeiro. Quando liberada, uma ativação produz uma operação em voo, mostra progresso e só comunica sucesso após confirmação canônica.

## Critérios de aceite — recuperação

- [ ] Reproduzir escrita aplicada/resposta perdida no coordenador e na gaveta reais; o teste deve falhar pelo comportamento atual, sem copiar a implementação para a fixture.
- [ ] Recuperar somente ação existente, pela mesma identidade e escopo autorizados. Atualização continua sendo UPDATE com ID e versão; nenhum erro pode produzir INSERT, Duplicar ou um novo rascunho.
- [ ] Distinguir base confirmada, snapshot efetivamente enviado e alterações locais posteriores. Não limpar todo o patch nem trocar o formulário pela resposta de leitura.
- [ ] Reconhecer o estado já persistido apenas quando a comparação for segura. Igualdade de horário ou conteúdo isolado não prova autoria; sem histórico de operação, não afirmar que a escrita foi necessariamente deste navegador.
- [ ] Se a versão canônica divergir, ou houver ambiguidade em campo relevante, preservar a comparação explícita existente. Não aplicar rebase automático apenas para fazer um retry passar.
- [ ] Edição durante a recuperação permanece local; caso haja próximo envio, ele usa a versão confirmada correta e somente mudanças ainda necessárias.
- [ ] Falha de leitura/rede mantém campos, erro e possibilidade de nova conferência; não apresenta sucesso falso nem gera loop de retry/polling.
- [ ] Mensagens em português distinguem confirmação incerta, falha de acesso/rede e versão diferente. Não atribuir toda divergência a outra sessão/pessoa.
- [ ] Fechamento, navegação e Sair continuam respeitando as guardas; não descartar rascunho para resolver erro.

## Critérios de aceite — duplicação

- [ ] Conferir todos os pontos existentes de duplicação, incluindo botão e Shift+D, para que nenhum contorne a proteção quando a mesma ação tem edição não confirmada. Preservar os atalhos válidos de listas/cartões e não capturar texto digitado como comando.
- [ ] Na gaveta, bloquear duplicação durante salvamento, recuperação, erro, conflito, alterações não confirmadas ou outra duplicação em voo. Explicar brevemente o motivo quando necessário; rascunho sem ID não oferece duplicação.
- [ ] Uma ativação por clique/teclado envia uma operação. Clique duplo, tecla repetida e alternância de foco não iniciam outra cópia enquanto a primeira está pendente. A proteção vale entre entradas do mesmo app para a mesma ação, não apenas no botão visível.
- [ ] Aguardar resultado antes de anunciar sucesso/fechar. Cópia confirmada recebe identidade distinta e o sufixo existente; manter data, parceiros e regras atuais de cópia.
- [ ] Falha preserva original, edição e painel aberto; não chama fechamento como se tivesse concluído.
- [ ] Se a duplicação já enviada ficar sem confirmação, apresentar resultado incerto e não repetir automaticamente um INSERT. Não prometer deduplicação global ou exactly-once entre dispositivos sem mecanismo persistente comprovado; necessidade de SQL/idempotência adicional exige desenho e escopo explícitos antes de aplicar.
- [ ] Não fechar o outro painel, promover a secundária nem perder alterações surgidas durante a operação. Se a ação de origem mudou/foi substituída enquanto aguardava, confirmação antiga não fecha o formulário atual.
- [ ] Atualizar listas/cache só após confirmação canônica, preservando versões mais recentes e invalidação de escopo desconhecido; sem restaurar snapshots completos após falha antiga.

## Identidade, concorrência e limites

- [ ] Validar identidade/geração/montagem antes de ler, escrever e aplicar resultado. Logout/troca de pessoa/substituição de painel invalida callbacks antigos; não afirmar que reset desfaz escrita já enviada.
- [ ] Manter atualização baseada em versão, formatação/sanitização da comparação e isolamento entre principal/secundária. Não relaxar RLS ou permissões.
- [ ] Não transformar campos de ação em autosave novo, adicionar confirmação genérica a toda operação nem reestruturar a arquitetura sem necessidade concreta.
- [ ] Não alterar, apagar ou deduplicar registros reais do caso Toro; a investigação histórica não autoriza limpeza de dados.

## Verificação necessária na execução

Testes de comportamento no código real, controlando somente a fronteira externa, devem cobrir:

- Escrita aplicada com resposta perdida; recuperação compatível sem novo UPDATE/INSERT desnecessário.
- Escrita não aplicada; retry seguro quando autorizado, sem declarar gravação anterior inexistente.
- Outra sessão alterando o mesmo campo e campos diferentes; ambiguidade e comparação preservadas.
- Edição adicional durante envio/recuperação; confirmação antiga não apaga o valor mais novo.
- Falha de leitura, ação sem acesso, troca de sessão e resposta posterior à troca de ação/painel.
- Duplicação pendente/sucesso/falha/resultado incerto; clique repetido e atalho; bloqueio em erro/conflito.
- Duas ações abertas, painel ativo, guardas de fechamento e cache de listas após resposta canônica.

Executar testes pertinentes, format/lint/typecheck/build e verificação serverless quando o escopo efetivo exigir. No navegador, usar HTTP controlado para cenários de rede/confirmação sem criar fixtures em produção. Distinguir teste controlado de certificação do banco/provedor. Não salvar capturas no checkout. Atualizar documentação vigente e status com os resultados reais.

## Entrega e autorização

Uma entrega vertical: estado de salvamento/consulta canônica → decisão segura/erro → comandos de duplicação → cache/guardas → testes. Não separar API, banco e UI em tickets horizontais. Nenhuma migration é presumida necessária. Criar este ticket não inicia implementação, não autoriza SQL remoto, chamadas reais de escrita, commit, push ou deploy.

## Cost-benefit review — 2026-10-29

Owner questioned the scope because only one incident is known in roughly two years. Recommendation delivered: defer full automatic recovery; existing version/comparison protections and local edits remain. A recovery path limited to errors need not slow healthy saves, but safe reconciliation adds substantial concurrency/state maintenance and an extra read can fail on the same connection. No benchmark or real incidence rate was measured.

A small duplication safeguard and neutral wording may have better cost-benefit as a separate, explicitly authorized scope. Do not implement the original broad ticket automatically or treat this recommendation as owner approval of the smaller change. Existing diagnostics/conflict/save tests rerun:18 PASS,81 assertions; no automatic INSERT caused by retry of an update in the controlled regression. No new production queries/writes or SQL.
