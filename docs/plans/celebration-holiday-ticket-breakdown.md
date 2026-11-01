# Datas comemorativas — indicação de feriado

Preparado em01/11/2026 com To Tickets. Posteriormente o proprietário autorizou somente a etapa Supabase com subagentes: campo aplicado/verificado em produção; integração do aplicativo adiada. O [ticket individual](../../.scratch/brand-holidays/issues/01-classify-holidays.md) contém o checklist vigente; este documento preserva o detalhamento da proposta. [Execução e limites](../audits/2026-11-01-holiday-schema.md).

## 1. Marcar datas comemorativas como feriado no cadastro e nas visualizações

**Bloqueado por:** nenhum. Independente dos tickets de Planejamento.

**Entrega:** administradores podem informar se uma data comemorativa é feriado ao criar ou editar. A escolha persiste no Supabase e aparece na lista administrativa e nas ocorrências do calendário existente.

### Critérios de aceite propostos

- Adicionar à entidade de datas comemorativas o booleano `is_holiday`, obrigatório e com padrão `false`. Registros existentes começam desmarcados; não inferir classificação pelo título. Esta é uma proposta de compatibilidade, sujeita à aprovação do proprietário.
- Oferecer checkbox Prism com rótulo “É feriado” tanto na criação pela página administrativa quanto na criação pela busca e no diálogo de edição. Novo cadastro começa desmarcado; edição carrega o valor salvo e permite marcar/desmarcar.
- Criar, editar e reabrir preservam o valor confirmado pelo banco. Falha ao salvar mantém os valores para nova tentativa; cancelar não grava. Preservar as guardas de identidade/sessão e os estados de envio existentes.
- Modelos, tipos e leituras transportam o campo; atualizações de cache refletem a alteração na lista e nos calendários sem exigir recarregamento da página. Nenhum acesso direto ao banco novo em componentes/rotas.
- Exibir indicação textual “Feriado” para itens marcados na lista administrativa e no calendário compartilhado, inclusive em título acessível quando houver truncamento, sem depender apenas de cor. Itens desmarcados continuam como datas comemorativas comuns.
- Preservar título, data, ordenação, exclusão, rolagem e layout responsivo existentes. Controle acessível por teclado, com rótulo associado e bloqueado durante envio.
- Preservar leitura pelos membros ativos e escrita somente por administradores no banco, além da restrição da interface. Não ampliar permissões para portal, revisão pública ou acesso anônimo.
- Preparar migration incremental compatível com o catálogo real e com frontend anterior, sem executar histórico completo de migrations. Registrar separadamente SQL preparado, SQL aplicado/verificado e frontend publicado/Ready; código local ou push não comprovam publicação.
- Atualizar documentação vigente de banco, guia de agentes, conhecimento de banco e CURRENT ao executar, conforme as regras do projeto.

### Verificação proporcional

Roteiro do proprietário: criar uma data marcada e outra desmarcada pelos dois pontos de entrada; editar alternando o estado; reabrir e conferir persistência, lista e calendário; conferir Tab/Espaço e largura estreita. O executor deve conferir no banco coluna/default e autorização efetiva usando identidades adequadas, sem assumir que inspeção textual de SQL certifica RLS. Não usar escritas fictícias contra produção em testes automáticos. Formatar arquivos alterados e verificar tipos pelo impacto no contrato compartilhado; automação adicional somente diante de risco concreto. Build ao publicar e verificações serverless se o diff atingir os caminhos que as exigem no guia.

### Limites

Não inclui abrangência nacional/estadual/municipal, localidade, recorrência, importação de calendário oficial, classificação automática, bloqueio de trabalho/agendamento, filtros novos ou mudanças na geração de Planejamento. O campo informa a classificação do cadastro; não garante que seja feriado para toda localidade. A autorização posterior limitou execução à etapa de banco.

## Evidência consultada

Fluxo atual confirmado no código: entidade `celebrations` contém título/data/identidade; criação administrativa própria e diálogo compartilhado para busca/edição; lista agrupada por mês; calendário compartilha renderização das datas; policies versionadas distinguem membros ativos e administradores. Não foi consultado nem alterado o catálogo remoto nesta rodada. Mudanças externas no checkout foram preservadas.

## Próximo passo

A etapa de banco foi aplicada; seguir o ticket individual para retomar o aplicativo quando autorizado. Não reaplicar o campo nem o histórico completo de migrations.
