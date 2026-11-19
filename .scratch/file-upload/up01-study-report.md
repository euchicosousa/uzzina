# UP01 — estudo do envio próprio de arquivos

Data: 18/11/2026. Estudo documental, leitura estática do checkout e inspeção somente leitura do Console Cloudinary. Sem alterações no app e sem uploads reais.

## Recomendação

Seguir o desenho aprovado por etapas, começando pela janela **Arquivos** e aba Essencial. Fazer a prévia como protótipo sem chamadas à Cloudinary. Não assumir ainda que um componente único consegue servir os cinco contextos sem adaptações de política e estado. Reutilizar a operação de upload em comum, com interfaces de seleção e conclusão próprias por contexto.

Manter `/dash` no widget nesta etapa, conforme decisão do proprietário. O portal tem autenticação própria e seu contrato proíbe providers privados da equipe. Uma substituição futura requer estudo e aceite próprios.

## Confirmação técnica

- A Cloudinary documenta upload direto do navegador por `POST https://api.cloudinary.com/v1_1/<cloud_name>/<resource_type>/upload`, com `file` e um preset unsigned. Logo, o envio pode evitar a Vercel. As chamadas unsigned só aceitam um conjunto restrito de parâmetros. O preset precisa definir as demais opções, como formatos permitidos e transformações. O nome do preset fica público no cliente e deve ter guardrails.
- O tipo `auto` deixa o Cloudinary classificar o arquivo. Para a janela **Arquivos**, que recebe tipos diferentes, a proposta é conferir o `resource_type`, o formato e a URL devolvidos pelo provedor. Um PDF comum pode ser tratado como imagem. A [documentação de uploads](https://cloudinary.com/documentation/upload_parameters#uploading_pdf_files) orienta usar `raw` para PDF protegido por senha. Os dois caminhos têm teto de 10 MB nesta conta. Na validação da integração, conferir também se cada PDF abre pelo endereço devolvido e aparece corretamente na ação.
- A barra de progresso é implementável com `XMLHttpRequest.upload` e o evento `progress`. A documentação da API confirma respostas e erros HTTP. `XMLHttpRequest.abort()` permite cancelar a conexão; não há autorização para remover um ativo que já tenha sido concluído. Cancelamento deve distinguir seleção local, transmissão em andamento e upload já concluído.
- Arquivos acima de 100 MB exigem envio em partes pela Upload API. O fluxo manual usa `X-Unique-Upload-Id`, `Content-Range` e chunks de pelo menos 5 MB, salvo o último. Isso aumenta a complexidade de retomada, progresso agregado e limpeza. Recomendo deixar acima de 100 MB fora da primeira etapa, Os limites da conta confirmados abaixo deixam o envio em partes fora da primeira etapa.
- No Console, confirmei que existe o preset `bussola_unsigned` em modo **Unsigned**. A lista mostra `Overwrite: false`, `Use filename: true`, `Unique filename: true` e `Use asset folder as public id prefix: true`; mostra também o preset como padrão para ML image, ML video e ML raw. Na aba **General** da edição, o campo **Asset folder** está vazio, a sobrescrita está desativada e o prefixo usa o caminho da pasta inicial. O widget atual informa a pasta de destino ao enviar: `uzzina/work` para arquivos de trabalho e `uzzina/content` para conteúdo. A primeira etapa precisa preservar essa organização e conferir o resultado de cada tipo de envio. Na aba **Transform**, os campos de transformação na entrada e de geração antecipada de versões estão vazios. A opção de geração antecipada assíncrona está desligada. Na aba **Advanced**, o envio assíncrono está desligado e o campo de notificação está vazio. Em **Optimize and Deliver**, os campos **Allowed formats** e **Format** estão vazios. O preset não declara lista de extensões nem conversão para um formato fixo. O tipo de entrega aparece como **Upload**. A proposta é manter as regras de seleção de cada área da UZZINA e conferir a aceitação e a URL retornada pelo Cloudinary durante a integração.
- O Console mostra a conta no plano **Free**. A [comparação oficial de planos](https://cloudinary.com/pricing/compare-plans) publica máximos por arquivo de **10 MB para imagem, 100 MB para vídeo e 10 MB para raw**. A captura de **Settings → Account → Usage Limits**, fornecida pelo proprietário em 18/11/2026, confirma esses três valores na conta. O painel indica também **25 MP por imagem**, **50 MP somados entre quadros** e **100 MB para manipulação de imagem online**. Manipulação tem um limite próprio. O limite de envio de imagem é 10 MB.
- O widget da UZZINA aplica `maxFileSize: 50_000_000` aos arquivos escolhidos no dispositivo. Para a primeira etapa, a proposta é preservar esse teto no app e aplicar também o limite da conta por tipo quando ele for menor. Com os limites conferidos na conta, a proposta é **10 MB para imagem e raw e 50 MB para vídeo**. Aumentar o teto de vídeo até o máximo da conta seria uma decisão de produto. Formatos ambíguos, como PDF, precisam ser conferidos pelo tipo que o Cloudinary retorna.
- A configuração local de produção aponta para o mesmo preset encontrado no Console e ele é o padrão no código de `/app` e `/dash`. O preset pode restringir formatos e configurar transformações. O teto de bytes por arquivo é aplicado pelo Cloudinary no nível da conta. O app pode adotar um teto menor. [Documentação de presets](https://cloudinary.com/documentation/upload_presets) · [Referência do widget](https://cloudinary.com/documentation/upload_widget_reference).
- Nenhum segredo deve ir ao navegador. O nome do cloud e preset podem ser públicos. Se a conta exigir configuração que unsigned uploads não podem impor por chamada, a decisão pertence ao preset, ou a um endpoint assinado no servidor, que ampliaria o escopo.

Fontes oficiais consultadas:

- [Cloudinary — Client-side uploading](https://cloudinary.com/documentation/client_side_uploading)
- [Cloudinary — Upload API, unsigned requests e chunked upload](https://cloudinary.com/documentation/upload_images)
- [Cloudinary — Upload presets e proteção de unsigned presets](https://cloudinary.com/documentation/upload_presets)
- [Cloudinary — Upload Widget API reference](https://cloudinary.com/documentation/upload_widget_reference)

## Fluxos observados no código

- **Instagram e Arquivos:** `ContentFilesManager` aceita uploads um a um por callback, conserva uma referência dos arquivos atuais e ordena o lote recente alfabeticamente. `ContentReorderDialog` mostra miniaturas, reordena com dnd-kit, seleciona, exclui e desfaz. Limites atuais são 20 arquivos de conteúdo e 100 de trabalho. A origem do drag precisa ser reconhecida antes de iniciar dnd-kit, e o drop de arquivos externos deve só aceitar tipos e quantidade compatíveis com o destino.
- **Aba Essencial:** o callback de upload atualiza estado local e persiste `work_files` por ação. O envio pode terminar enquanto se salva ou fecha a gaveta. A experiência precisa manter cada arquivo pendente ligado à ação e aguardar os uploads necessários antes de oferecer confirmação, ou avisar explicitamente que o arquivo ainda não foi anexado. Não gravar URL temporária de prévia como se fosse URL final.
- **Avatar e logotipo:** `CloudinaryUpload` pede crop quadrado e monta URL transformada usando as coordenadas retornadas. O substituto precisa selecionar e validar arquivo local, permitir enquadramento quadrado por mouse/toque/teclado, enviar original e aplicar as coordenadas à URL final. Se o custo for alto, o ticket já registra a alternativa de manter widget somente para avatar.
- **Portal:** usa o widget compartilhado, mas possui sessão e autenticação próprias em `/api/dash-*`. Compartilhar uma peça visual não pode importar `AppContext`, clientes ou autorização da equipe. Deixar o portal para outra etapa é coerente.

## UX e riscos

- Na janela **Arquivos**, manter um botão acessível “Adicionar” que abre o seletor do sistema. A área vazia pode indicar arraste ou clique. Com miniaturas, a área recebe arquivos externos enquanto o comando de reordenar fica no controle de alça existente. Não transformar a região toda em parada de foco. Anunciar estado e progresso por arquivo com região `aria-live` sem interromper digitação.
- No celular não há drop de desktop. O botão permanece o caminho de seleção. O widget também oferece câmera em certos contextos HTTPS, embora a seleção local móvel possa abrir a câmera do aparelho. Confirmar o comportamento nos aparelhos aceitos antes de remover o widget.
- Colar imagem pode ser uma melhoria separada. Clipboard pode conter múltiplos formatos, imagem gerada sem nome e conteúdo grande. Para a primeira entrega, aceitar apenas imagens raster do clipboard e apresentar um item pendente antes de iniciar o upload.
- O preview do Instagram pode receber drop, mas o drop sobre regiões interativas precisa não acionar clique de abertura, troca de mídia, nem scroll. A janela Arquivos deve continuar como alternativa acionável.
- Fechar a janela não pode destruir a fila enquanto uploads estão ativos. O widget atual é mantido montado porque `close` precede alguns eventos `success` em upload múltiplo. Uma implementação própria precisa fila estável, limite de concorrência, callbacks por ID e estado de cancelamento. Falha parcial mantém os sucessos e oferece retry somente para falhas.
- Se o Cloudinary concluiu o upload mas salvar a ação falhou, o asset existe mas ainda não está referenciado. A interface deve conservar o resultado pendente e permitir repetir a gravação, sem reenviar o arquivo. Não apagar assets automaticamente sem fluxo autorizado de exclusão.
- Como o preset não tem uma lista explícita de extensões, conferir a classificação dos arquivos no retorno da API e validar os formatos usados em cada área da UZZINA. Aplicar os limites de bytes confirmados na conta. A validação local antecipa a mensagem de erro. O provedor aplica independentemente os formatos do preset e os limites da conta.

## Plano por etapas

1. **Arquivos + Essencial.** Picker, drop no diálogo, progresso individual, cancelamento em voo, retry, rejeição de formato/tamanho, fila persistente ao fechar/abrir, reordenação e salvamento da ação depois do upload. Fica como entrega demonstrável em dados fictícios antes de integração real.
2. **Prévia Instagram.** Drop no retângulo da mídia reutilizando a fila do primeiro passo. Conferir carrossel, vídeo, ordem, limites de 20 e resolução de falha parcial.
3. **Avatar e logotipo.** Recorte acessível de quadrado, teclado e toque, envio do original e URL transformada. Se a prévia mostrar interação excessivamente complexa, decidir manter widget só neste fluxo.
4. **Portal, separadamente.** Só depois, examinar interface do visitante e autorização do endpoint com o contrato de portal.

## Prévia e roteiro

Ver [protótipo visual UP01](up01-preview.html). Usa ações locais e arquivos fictícios. Não tem input de arquivo conectado a servidor nem chamada ao Cloudinary. Foi exercitado em DOM com vazio/restauração, reordenação acessível por botões, remoção, troca do limite de Conteúdo para Trabalho e conclusão com upload pendente. A prévia também foi aberta em Chromium headless com viewport 375×812: sem overflow horizontal e duas colunas de miniaturas. Erros de página: zero. Os eventos de drop e clipboard só mostram mensagens simuladas, não leem os arquivos/clipboard reais. Isso valida a navegação da prévia e o layout, não prova drag/drop real do sistema.

1. Na área vazia, conferir texto, botão e foco de teclado.
2. Com itens fictícios, conferir resumo de progresso paralelo, sucesso parcial, erro e retry.
3. Alternar conteúdo e arquivos de trabalho e observar a diferença dos limites atuais.
4. Conferir a representação móvel sem depender de arrastar.
5. Confirmar que fechar e reabrir conserva os itens pendentes na mesma sessão.

## Limites desta análise

Documentação oficial, leitura de código e dados visíveis do Console foram verificados em 18/11/2026. Confirmados: preset unsigned existente, plano Free e limites por tipo no painel da conta. O Console confirma que o preset não fixa formatos nem transformações. Restam os ensaios de upload, abertura dos arquivos e uso em aparelho durante a integração. O protótipo não prova comportamento do navegador no drag/drop nem faz upload. A inspeção não alterou configurações nem enviou arquivos.
