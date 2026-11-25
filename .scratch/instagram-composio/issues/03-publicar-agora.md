# 03: Publicar conteúdo imediatamente no Instagram pela ação

**O que construir:** na aba Instagram de uma ação, permitir que a equipe escolha o material, confira o perfil de destino e publique imediatamente. A etapa deve cobrir os formatos básicos usados pela agência: imagem/carrossel no feed, vídeo no feed, Reel e sequência de Stories. A publicação acontece quando a equipe confirma; não cria agendamento.

**Bloqueado por:** Nenhum. A conexão do perfil já está disponível; a página de consulta de dados ficará para uma etapa posterior.

**Status: concluído (25/11/2026).** Aceito pelo proprietário: carrossel, Stories e post estático testados; Reel fica para depois, e o ticket reabre se houver erro. Histórico: implementação enviada para `main`; proprietário confirmou publicação real pela UZZINA em 23/11/2026. **Aceito pelo proprietário em 25/11/2026**, incluindo a publicação de feed pela programação.

## Etapas previstas

1. **Confirmar os formatos e a seleção do material.** Reaproveitar os arquivos da ação. Definir como a equipe escolhe um ou mais itens, confere a ordem e informa a legenda nos formatos que a aceitam. Validar separadamente imagem única, carrossel, vídeo no feed, Reel e Stories; se algum formato não for aceito pela conexão, informar isso claramente antes de enviar.
2. **Revisar antes de publicar.** Na aba Instagram da ação, um botão **Publicar ou programar** abre o diálogo compartilhado. Mostrar foto e @ do único perfil conectado à ação, os arquivos em ordem e a legenda, quando houver. O formato vem da categoria e fica travado; a aba Publicar inicia o envio sem uma caixa de confirmação adicional.
3. **Enviar imediatamente e acompanhar o resultado.** Ao confirmar, chamar o fluxo de publicação da Composio, mostrar o andamento e apresentar sucesso ou erro. Quando disponíveis, guardar o identificador e o link retornados para que a equipe possa reconhecer a publicação.
4. **Evitar duplicatas em falhas incertas.** Se houver timeout ou resposta incompleta, indicar que o resultado precisa ser confirmado antes de tentar novamente; não repetir automaticamente uma publicação que possa já ter saído.
5. **Validar cada formato com a conta de teste.** Fazer um envio de imagem/carrossel no feed, vídeo no feed, Reel e Stories, conferindo destino, ordem e resultado no Instagram. A validação de cada formato só é considerada concluída depois da conferência do proprietário.

## Critérios de aceite

- [ ] Um botão Publicar ou programar abre o mesmo diálogo nas abas Publicar e Programar.
- [ ] Sem perfil conectado, o botão não aparece e a seção orienta a conectar o Instagram; com perfil e sem arquivo de mídia, o botão fica desabilitado pelo padrão Prism; o upload reativa o botão imediatamente. A compatibilidade do arquivo é validada no modal e no servidor.
- [ ] Perfil conectado e formato da categoria são identificados automaticamente e não podem ser alterados no diálogo.
- [ ] A opção de publicação não aparece sem perfil Instagram conectado; no diálogo, Publicar agora permanece desabilitado sem arquivo compatível. Legenda vazia não impede publicação.
- [ ] Imagem/carrossel no feed, vídeo no feed, Reel e Stories têm seleção e envio testados separadamente.
- [ ] Para carrossel e Stories, a ordem selecionada é preservada.
- [ ] A legenda é apresentada e enviada nos formatos que a aceitam.
- [ ] O app informa andamento, resultado e erros; quando retornados, preserva identificador e link da publicação.
- [ ] Timeout ou resposta incerta não provoca uma segunda publicação automática.
- [ ] Nenhuma publicação é agendada nesta etapa.

## Fora desta etapa

- Agendamento para data futura, repetição semanal ou publicação com o app fechado (Tickets 04 e 05).
- Página de relatórios e histórico de insights (Ticket 06).
- Stickers interativos de link ou marcação em Stories; permanecem para uma etapa posterior de investigação.

## Referência

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para implementar o fluxo de publicação e tratar resultados incertos sem duplicar envios.
- Codex — gpt-6.2-sol. Adequado para executar o fluxo vertical com menor custo, preservando os limites definidos.
- Codex — gpt-6.1-terra. Adequado para revisar seleção de formato, confirmação e estados visuais antes do envio.

## Resultado local em 23/11/2026

A gaveta da ação → Instagram oferece um botão **Publicar ou programar**. Sem perfil conectado, ele é substituído por uma mensagem para conectar; com perfil mas sem arquivo de mídia, fica visível e desabilitado pela variante/estado padrão Prism; o upload reativa o botão imediatamente. Ao abrir o diálogo, a compatibilidade do arquivo é validada antes do envio. O destino é automático e mostra foto/@; o formato indica a categoria e não pode ser trocado. Arquivos da ação aparecem em ordem e podem ser reorganizados; legenda vazia é permitida e não há checkbox de confirmação. O servidor confirma a conexão e registra a tentativa antes de usar a Composio. O diálogo mostra andamento e resultados; IDs e links retornados são guardados. A aba de programação é somente visual e não salva horários.

O proprietário definiu que toda a equipe ativa pode publicar, respeitado o acesso existente à ação e ao parceiro, sem aprovação editorial adicional. A implementação prepara imagem JPEG/PNG/carrossel de imagens e vídeos, vídeo no feed, Reel e sequência de Stories, até 20 arquivos. A Meta exige mídia acessível publicamente e pode impor restrições adicionais. Em 23/11, o proprietário confirmou publicação real pela UZZINA; a conversa não registrou de forma inequívoca quais formatos além desse envio foram testados pelo app.

A migration `20261123153257_instagram_publish_attempts.sql` foi aplicada ao projeto de produção `uzzina` (`dfepmjcozszswocwvdpq`) e registrada como `20261123153257`; guarda tentativas, contêiner atual e resultados e bloqueia novo envio da mesma ação e parceiro enquanto houver estado pendente, incerto ou parcial. Não repete automaticamente. Uma interrupção ou sequência parcial exige conferência no Instagram e intervenção operacional; a interface ainda não oferece liberação dessas tentativas. Cada publicação de Story bem sucedida é registrada antes de passar à próxima.

Migration aplicada e RLS/grants conferidos em produção. Prettier, typecheck, build e `git diff --check` passaram após o ajuste de estados. Commits `72a58813` e `ca4b305d` enviados para `main` em 23/11; o push não confirma que o deploy ficou Ready. A autorização real de membro, matriz de formatos e aceite visual ainda precisam de validação.

Fontes: [Composio — publicação de mídia](https://docs.composio.dev/kb/guide/toolkits-instagram), [proxy Composio](https://docs.composio.dev/reference/api-reference/tools/postToolsExecuteProxy) e [publicação Meta](https://developers.facebook.com/documentation/instagram-platform/content-publishing).
