# Recuperação de salvamento e duplicação — custo-benefício em29/10/2026

## Decisão do proprietário em29/10/2026

Ticket encerrado sem implementação por decisão explícita: ocorrência isolada, evidência insuficiente de recorrência e custo-benefício desfavorável. Não permanece como pendência ou recomendação de execução automática; nenhuma alteração pequena de duplicação foi autorizada. A análise abaixo registra o raciocínio que fundamentou o encerramento.

## Recomendação

Não implementar agora a recuperação automática completa descrita no ticket01. O escopo reuniu confirmação perdida, conflitos, duplicação e cache/duas ações em uma entrega ampla. Para a evidência disponível, a relação entre benefício e custo é baixa. Manter a proteção atual de versão/comparação e reavaliar se houver recorrência, perda de trabalho comprovada ou uso frequente em conexão instável.

Isso é uma recomendação ao proprietário, não uma autorização de implementação nem decisão unilateral de cancelar todo o assunto. Não há proposta de apagar registros reais, migrar banco ou adicionar consulta em todo salvamento.

## Evidências e limites

- O proprietário relata um único episódio conhecido em aproximadamente dois anos de uso. Não há telemetria de incidência/volume nesta revisão; não transformar esse relato em taxa estatística de falha.
- O diagnóstico de17/10 mostra uma atualização aceita, outra com versão antiga e uma duplicação explícita posterior. Não prova que Atualizar duplicou a ação nem que Supabase ou a rede foi a causa única. Uma confirmação perdida é compatível e foi reproduzida, mas continua hipótese para aquele evento histórico.
- O comportamento atual preserva o patch local e impede atualizar uma versão divergente sem comparação. Há fricção na recuperação, mas o teste controlado mantém uma única ação; não indica INSERT automático causado pelo retry de UPDATE.
- Inspeção atual do botão Duplicar confirma que ele envia a mutação e pede fechamento sem aguardar confirmação; isso é uma oportunidade separada de melhoria de interface, mesmo que não demonstre a causa do incidente antigo.
- Reexecutados os três arquivos existentes de testes de diagnóstico de rede, conflito e coordenador de salvamento:18 PASS,81 assertions,0 falhas. Nenhum novo teste ou comportamento implementado. Essa verificação não mede confiabilidade de rede ou banco real.

## Onde está o custo real

A parte difícil não é apenas fazer outra leitura. É decidir se os dados encontrados podem confirmar com segurança o envio anterior sem apagar alterações locais mais recentes ou uma edição concorrente. Conteúdo igual não prova autoria; versão diferente não significa necessariamente outra pessoa. Timeout pode ocorrer antes ou depois da gravação, e o usuário pode continuar digitando, trocar de ação, abrir segunda ação ou encerrar a sessão enquanto a consulta está em voo.

Essa lógica exigiria novos estados, snapshots e regras de comparação/continuidade, mais testes e manutenção do caminho central de edição. Um erro de reconciliação poderia ser pior que o conflito explícito atual, porque apresentaria sucesso indevido ou perderia uma mudança. Deduplicação persistente entre dispositivos seria ainda outro escopo; não é consequência automática de desabilitar um botão.

## Vai deixar o sistema mais lento?

Não necessariamente. Uma recuperação acionada somente após erro não precisa acrescentar leitura ao salvamento saudável. Não há benchmark nesta análise e não cabe afirmar que todo o app ficará mais lento. Já uma verificação obrigatória antes/depois de cada salvamento acrescentaria rede e latência sem justificativa na incidência conhecida; não é recomendada.

O principal custo-benefício desfavorável é a complexidade e a superfície de regressão, mesmo que o caminho normal mantenha a mesma quantidade de requisições. No caminho de falha, uma nova leitura também pode falhar pela mesma conexão, sem resolver a experiência.

## Opções comparadas

| Opção | Benefício | Custo/risco relativo | Parecer |
|---|---|---|---|
| Manter versão/comparação atuais e observar uso | Evita investir em caso raro; conserva comportamento conhecido | Mantém fricção quando uma confirmação se perde | Recomendada agora para a recuperação completa |
| Mensagem neutra de falha/conflito | Evita atribuir culpa a outra sessão sem prova | Baixo, desde que só ajuste texto e cubra o comportamento pertinente | Pode ser considerada num ajuste futuro; não elimina o problema de rede |
| Proteção pequena da duplicação | Impede ativações concorrentes e sucesso/fechamento prematuros | Pequeno a médio; precisa respeitar retorno, duas ações e erros | Melhor candidato a melhoria separada, se o proprietário desejar |
| Recuperação/merge automáticos completos | Reduz etapas manuais em alguns resultados incertos | Alto: concorrência, estados, testes, manutenção; risco de confirmação indevida | Adiar até evidência de necessidade recorrente |
| Consulta em todo salvamento ou idempotência global nova | Pode ampliar garantias se corretamente desenhada | Latência/infraestrutura e escopo desproporcionais ao caso conhecido | Fora da recomendação atual |

Não são estimativas de prazo ou orçamento. Qualquer implementação futura precisa de reprodução e revisão do menor escopo útil.

## Se for autorizado um ajuste pequeno depois

Delimitar somente a duplicação da gaveta: guardar uma operação em voo, impedir nova ativação enquanto pendente, aguardar sucesso/erro antes de fechar ou anunciar, preservar texto/origem se falhar e respeitar a guarda de fechamento antes de enviar quando a edição não estiver confirmada. Conferir atalhos existentes para não contornar a regra no mesmo contexto, sem criar bloqueio distribuído genérico ou impedir usos legítimos nas listas.

Isso não implica conferir remotamente toda atualização, adicionar rebase automático, mudar schema ou resolver todos os resultados incertos. Mesmo o ajuste pequeno deve manter o painel correto e o rascunho quando a identidade mudar durante a operação. Sua autorização não está presumida nesta análise.

## Quando reabrir a decisão

Reavaliar com um novo caso reproduzível, frequência que cause retrabalho, perda de edição comprovada ou padrão repetido em vários usuários. Guardar somente data, operação, contexto e erro necessários para diagnóstico, sem implantar rastreamento de conteúdo ou serviço de monitoramento agora. Não gerar novas falhas em produção para justificar a melhoria.
