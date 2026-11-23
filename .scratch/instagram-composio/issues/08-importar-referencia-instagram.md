# 08: Importar mídia de uma referência pública do Instagram para Arquivos

**O que construir:** no gerenciador **Arquivos do Instagram** dentro da ação, permitir colar o link de uma publicação ou Reel público. A UZZINA obtém as mídias disponíveis, envia cada arquivo para a pasta Cloudinary do parceiro e adiciona os links permanentes à ação na ordem original, como se tivessem sido enviados pela equipe.

**Bloqueado por:** Nenhum. É independente da conexão OAuth do parceiro e dos tickets 02–07 do Instagram; depende apenas do gerenciador de arquivos e do upload Cloudinary existentes.

**Status:** proposto para execução futura; criar este ticket não autoriza iniciar a implementação.

## Critérios de aceite

- [ ] No gerenciador de arquivos da ação, oferecer a ação **Importar do Instagram**, receber um link explícito de post ou Reel e explicar quais formatos de link são aceitos.
- [ ] Importar somente mídia pública compatível; não pedir login do Instagram nem tentar acessar contas privadas, Stories ou conteúdo indisponível.
- [ ] Escolher e documentar o provedor após confirmar custo, limites, disponibilidade de imagens/vídeos e suporte a carrosséis. Comparar o ScrapeCreators via Composio Instant com o Actor de download do Apify; verificar se a chamada via Composio consegue entregar os bytes ou só URLs de mídia.
- [ ] Buscar e transferir os arquivos no servidor, validar o link e os tipos/tamanhos retornados, e enviar os bytes para o Cloudinary usando as configurações já existentes. Não gravar no app links temporários do Instagram ou do provedor.
- [ ] Preservar a ordem de fotos e vídeos do carrossel e inserir os arquivos no gerenciador sem substituir os itens já presentes.
- [ ] Mostrar andamento e resultado por arquivo; falha parcial deve permitir identificar quais itens entraram e tentar novamente sem duplicar os que foram concluídos.
- [ ] Não publicar automaticamente o conteúdo importado; a equipe ainda revisa e usa os arquivos na ação como qualquer outro material.
- [ ] Validar, com autorização para uso como referência, um post público de imagem, um Reel e um carrossel; conferir arquivos e ordem no Cloudinary e na ação.

## Referências

- [Como funciona Composio Instant](https://docs.composio.dev/docs/instant-tools)
- [ScrapeCreators no Composio](https://composio.dev/toolkits/scrapecreators/api)
- [Actor Instagram Video Downloader no Apify](https://apify.com/instagram-data-api/instagram-video-downloader)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para avaliar transferência de mídia externa, limites do provedor e envio seguro ao Cloudinary.
- Codex — gpt-6.2-sol. Adequado para implementar o fluxo vertical de importação com validação e estados de upload.
- Codex — gpt-6.1-terra. Adequado para conferir a experiência do botão, progresso e falhas no gerenciador de arquivos.
