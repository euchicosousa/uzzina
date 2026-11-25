# Programar publicações do Instagram em várias datas

**Status:** migração de banco, API e agendador de Stories em produção, com execução registrada em 23/11/2026. **Aceito pelo proprietário em 25/11/2026**: Post, Carrossel, Reel e Stories programáveis (migration `20261125130000` aplicada; commit `55ed1f0c`), com tentar novamente e copiar programação. Aberto: o calendário `/app/instagram` não mostrava itens do dia (correção em andamento). [Estado e evidências](../../../docs/audits/CURRENT.md)

**Bloqueado por:** 04

## Resultado esperado

Para o mesmo conteúdo (imagem/carrossel no feed, vídeo no feed, Reel ou sequência de Stories), selecionar até dez datas e horários específicos, rever as ocorrências e programá-las como publicações independentes. A categoria da ação determina o formato e cada ocorrência guarda o mesmo snapshot confirmado dos arquivos, da ordem e da legenda aplicável. Repetição semanal dentro de um período permanece como possibilidade posterior e não faz parte desta primeira entrega.

## Critérios de aceite

- [ ] Criar ocorrências independentes para as datas selecionadas.
- [ ] Aplicar o mesmo fluxo a imagem/carrossel no feed, vídeo no feed, Reel e Stories; Stories mantêm resultado por item.
- [ ] Permitir mudar ou cancelar uma data individualmente.
- [ ] Validar horário, fuso e limites do período.
- [ ] O botão Programar abre o mesmo diálogo de publicação, já na aba Programar; não há tela inline independente.
- [ ] A aba Programar permite adicionar até dez pares de data/hora (surge outra linha vazia após preencher a anterior). O perfil conectado vem dos parceiros da ação e o formato da categoria; a pessoa não escolhe esses itens.
- [ ] Conferir salvamento, execução, cancelamento e edição de ocorrências individuais em várias datas.
- [ ] Conferir a lista de ocorrências de várias datas na seção Publicação. A tela Publicações e a execução automática de Stories têm evidência própria na [ficha de programação](04-programar-stories.md).

## Migração aplicada

As tabelas de lote e ocorrências foram criadas em produção pela migration `20261123153317_instagram_scheduled_publications.sql`, registrada como `20261123153317`. A verificação de catálogo confirmou RLS habilitada, leitura pelo `service_role` e sem privilégio SELECT para `anon`/`authenticated`. A migration prepara o armazenamento. O salvamento e a execução de Stories foram publicados na etapa de programação.

## Lista de itens programados

A solicitação de mostrar um item demonstrativo “Programado para hoje às 17h” ficou sem destino na rodada inicial. A tela Publicações agora lista os eventos registrados pela UZZINA por dia. Na triagem, conferir se essa tela atende ao link demonstrativo e à navegação esperada.

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
