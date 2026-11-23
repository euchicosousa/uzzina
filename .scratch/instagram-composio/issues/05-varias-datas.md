# Programar em várias datas e repetir por período

**Status:** migração de banco aplicada em produção; interface local no diálogo compartilhado; API e execução automática pendentes.

**Bloqueado por:** 04

## Resultado esperado

Para o mesmo conteúdo, selecionar até dez datas e horários específicos, rever as ocorrências e programá-las como publicações independentes. Repetição semanal dentro de um período permanece como uma possibilidade posterior e não faz parte desta prévia de interface.

## Critérios de aceite

- [ ] Criar ocorrências independentes para as datas selecionadas.
- [ ] Permitir mudar ou cancelar uma data individualmente.
- [ ] Validar horário, fuso e limites do período.
- [ ] O botão Programar abre o mesmo diálogo de publicação, já na aba Programar; não há tela inline independente.
- [ ] A aba Programar permite adicionar até dez pares de data/hora (surge outra linha vazia após preencher a anterior). O perfil conectado vem dos parceiros da ação e o formato da categoria; a pessoa não escolhe esses itens.
- [ ] Salvar e executar horários só será habilitado quando API, worker/agendador e cancelamento/edição individual estiverem implementados e validados.
- [ ] A interface da lista fica na seção Publicação; a página geral de calendário e o envio automático são entregas posteriores.

## Migração aplicada

As tabelas de lote e ocorrências foram criadas em produção pela migration `20261123153317_instagram_scheduled_publications.sql`, registrada como `20261123153317`. A verificação de catálogo confirmou RLS habilitada, leitura pelo `service_role` e sem privilégio SELECT para `anon`/`authenticated`. Isso não implementa ainda o salvamento das datas nem a execução automática.

## Lista de itens programados

A solicitação de mostrar um item demonstrativo “Programado para hoje às 17h” com link aguarda destino. A busca no app encontrou o feed/calendário do parceiro e o feed do `/dash`, que exibem ações de conteúdo, mas não uma página que liste ocorrências da tabela de agendamentos. Não se criou um link fictício para uma tela genérica.

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
