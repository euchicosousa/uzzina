# 08: Importar mídia de uma referência pública do Instagram para Arquivos

**O que construir:** em **Gaveta da ação → aba Essencial → Arquivos** (`work_files`), disponível em todas as categorias de ação, permitir colar o link de uma publicação ou Reel público. A UZZINA obtém as mídias disponíveis, envia cada arquivo para a pasta Cloudinary do parceiro (`uzzina/work/<id do parceiro>/instagram`) e adiciona os links permanentes à ação na ordem original, respeitando a capacidade de 100 arquivos na ação e até 20 itens por referência do Instagram, como se tivessem sido enviados pela equipe.

**Bloqueado por:** Nenhum. É independente da conexão OAuth do parceiro e dos tickets 02–07 do Instagram; depende apenas do gerenciador de arquivos e do upload Cloudinary existentes.

**Status:** Descontinuado e removido do código em 25/11/2026 por decisão do proprietário.

## Interação no modal

- Em **Gaveta da ação → aba Essencial → Arquivos** (`work_files`), disponível em todas as categorias de ação, colocar um botão de ícone de link ao lado de **Adicionar**, com nome acessível **Importar do Instagram**. Manter o clique e o arraste do upload atual.
- Abrir um popover ancorado no botão, com campo para colar uma URL, seletor de parceiro no padrão Prism (`PrismSelect`) quando houver mais de um parceiro na ação, e comando **Importar**. Permitir colar e confirmar pelo teclado, corrigir um link inválido no próprio campo e fechar com Escape devolvendo o foco ao botão.
- Um post estático acrescenta uma imagem; um vídeo ou Reel acrescenta o vídeo; um carrossel acrescenta todos os itens, inclusive vídeos quando houver, na ordem da publicação. A ação recebe os arquivos do Cloudinary do parceiro (`uzzina/work/<id do parceiro>/instagram`), respeitando o limite de até 20 itens por referência do Instagram e a capacidade de 100 arquivos em `work_files`. A mídia deve continuar abrindo mesmo quando a URL temporária da origem expirar.
- Usar a lista e o salvamento existentes em `work_files` no modal. Preservar os arquivos anteriores. Os itens concluídos entram na lista conforme o fluxo atual, inclusive ao fechar e reabrir o modal. Na retomada de falha parcial, conservar a posição original de cada item.

## Critérios de aceite

- [x] No gerenciador de arquivos da ação (**Gaveta da ação → aba Essencial → Arquivos**), oferecer a ação **Importar do Instagram**, receber um link explícito de post ou Reel e explicar quais formatos de link são aceitos.
- [x] Importar somente mídia pública compatível; não pedir login do Instagram nem tentar acessar contas privadas, Stories ou conteúdo indisponível.
- [x] Usar ScrapeCreators via Composio Instant, conforme decisão do proprietário.
- [x] Buscar e transferir os arquivos no servidor, validar o link e os tipos/tamanhos retornados, e enviar os bytes para o Cloudinary usando as configurações já existentes (`uzzina/work/<id do parceiro>/instagram`). Não gravar no app links temporários do Instagram ou do provedor.
- [x] Preservar a ordem de fotos e vídeos do carrossel e inserir os arquivos em `work_files` sem substituir os itens já presentes (capacidade de 100 arquivos na ação e até 20 itens por referência).
- [x] Mostrar andamento e resultado por arquivo; falha parcial deve permitir identificar quais itens entraram e tentar novamente sem duplicar os que foram concluídos.
- [x] Não publicar automaticamente o conteúdo importado; a equipe ainda revisa e usa os arquivos na ação como qualquer outro material.
- [ ] Validar, com autorização para uso como referência, um post público de imagem, um Reel e um carrossel; conferir arquivos e ordem no Cloudinary e na ação.

## Primeiro teste local

Começar com serviços simulados e três referências: uma imagem, um Reel e um carrossel misto. Reservar espaço para o lote antes de transferir. Usar a posição original de cada item, pois o upload manual pode ordenar arquivos pelo nome. Com um anexo anterior e falha no segundo item de três, repetir esse item e verificar a lista final: anexo anterior, item 1, item 2, item 3. Concluir, reabrir e conferir a ordem e as URLs do Cloudinary. O modal comunica as alterações da lista conforme elas acontecem. Fechar o popover antes de confirmar a importação deve conservar a lista anterior.

## Chamada e transferência

1. Depois de validar o link público e a permissão de editar a ação, o servidor executa `SCRAPECREATORS_GET_INSTAGRAM_POST` uma vez por publicação. A chamada entrega os dados da mídia e as URLs de origem. Para um carrossel, conservar a posição de cada item no retorno. Se uma URL expirar, consultar novamente somente quando for preciso recuperar a origem.
2. O servidor deriva a pasta Cloudinary do parceiro autorizado (`uzzina/work/<id do parceiro>/instagram`). Para cada item, verifica origem HTTPS, tipo e limite de tamanho e transfere os bytes em fluxo com upload assinado. A transferência em fluxo evita manter um vídeo inteiro na memória e permite verificar o tamanho durante a leitura. Usar identidade estável por item no lote para conciliar uma resposta perdida antes de tentar de novo.
3. Quando o Cloudinary confirmar a cópia, devolver à interface a URL HTTPS final e a posição. Associar a `work_files` da ação apenas as cópias confirmadas (respeitando a capacidade de 100 arquivos na ação e até 20 itens por referência). Em falha parcial, identificar cada item pendente e preservar os concluídos. Validar localmente com serviços simulados. O ensaio real usa uma foto, um Reel e um carrossel públicos de uso autorizado, em destino de teste.

## Referências

- [Como funciona Composio Instant](https://docs.composio.dev/docs/instant-tools)
- [ScrapeCreators no Composio](https://composio.dev/toolkits/scrapecreators/api)
- [Upload em fluxo no Cloudinary](https://cloudinary.com/documentation/node_image_and_video_upload#the_upload_stream_method)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para avaliar transferência de mídia externa, limites do provedor e envio seguro ao Cloudinary.
- Codex — gpt-6.2-sol. Adequado para implementar o fluxo vertical de importação com validação e estados de upload.
- Codex — gpt-6.1-terra. Adequado para conferir a experiência do botão, progresso e falhas no gerenciador de arquivos.
