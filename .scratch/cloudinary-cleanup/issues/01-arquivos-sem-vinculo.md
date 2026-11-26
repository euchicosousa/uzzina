# Encontrar e excluir arquivos sem uso no Cloudinary

**Status:** publicado. Reaberto em 26/11/2026. O proprietário executou a exclusão em Administração → Cloudinary, mas a contagem de candidatos sem vínculo permaneceu igual. A exclusão e a atualização do catálogo precisam ser reconciliadas.

**Bloqueado por:** Nenhum

## Resultado esperado

Criar um local administrativo para comparar os arquivos do Cloudinary com os arquivos usados pela UZZINA e apresentar candidatos à exclusão para revisão.

## Critérios de aceite

- [ ] Inventariar todas as referências, incluindo arquivos de trabalho, Instagram, avatares, logotipos, anexos, conteúdo público e outras fontes existentes. Investigar arquivos externos ao app e versões de URL transformadas antes de classificar.
- [ ] Consultar o catálogo completo do Cloudinary com paginação e tipos de mídia, identificar arquivos de forma estável e exibir resultados e cobertura da análise.
- [ ] Mostrar os candidatos sem vínculo com prévia, tamanho, origem e seleção, com contagem e estimativa de espaço recuperável.
- [ ] Conferir novamente os vínculos antes da exclusão e tratar uploads em andamento, inconsistências e falhas parciais.
- [ ] Exigir revisão e confirmação explícita da seleção. Manter fora da lista de exclusão arquivos de uso desconhecido ou com referências incertas até esclarecer.
- [ ] Validar com catálogo fictício, arquivos compartilhados e URLs transformadas, sem excluir arquivos reais durante a investigação.

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.

## Contador após exclusão — 26/11/2026

As capturas mostram 303 candidatos antes da exclusão, 301 após a confirmação
de dois arquivos e 303 na releitura. A consulta somente de leitura ao ambiente
do Cloudinary dos prints confirmou que os dois IDs continuam visíveis na API
como `placeholder: true`, `backup: true` e zero bytes. O catálogo devolveu
219 registros com o marcador de backup. A aplicação contava esses registros
como arquivos ativos.

A listagem passou a ignorar o marcador explícito do provedor ao montar as
listas e totais. A confirmação do lote verifica os IDs respondidos como
excluídos e aceita apenas os que desapareceram ou ficaram como registro de
backup. Se a API ainda mostrar o arquivo ativo ou a verificação falhar, a
tela informa a divergência. A correção preserva os backups.

## Medição de backups e miniaturas — 26/11/2026

Consultas de leitura no Cloudinary. O relatório `/usage`, atualizado em
25/11, registrou o plano Free com 8,19 de 25 créditos usados e
8.012.706.770 bytes de armazenamento. A busca paginada contabilizou
3.618.041.540 bytes de backup de ativos e 545.254.358 bytes de backup de
319 arquivos excluídos. Os dois arquivos das capturas somam 5.007.584 bytes
de backup. O inventário de transformações identificou 48.403 bytes nas
três capas de vídeo de 320 px, 47.707 bytes nas dez capas de 160 px e
317.494 bytes nas 55 miniaturas de imagem de 160 px.

Foram identificados 593 derivados, com 14.045.838 bytes. Três entradas de
transformação sem uso não devolveram listas. A medição de derivados e o
relatório de uso têm escopos e momentos de leitura diferentes. Limpar os
319 backups de arquivos excluídos recuperaria aproximadamente 0,51 crédito
de armazenamento. A recomendação é manter os backups com a folga atual.

## Ex-clientes e exclusão definitiva proposta — 26/11/2026

Consulta somente de leitura no Cloudinary e no banco de produção. O
proprietário identificou `executetecnologia` e `anaarcanjoodontologia` como
pastas de ex-clientes. Foram encontrados, respectivamente, 47 e 108 arquivos
ativos, com 145.737.400 e 358.619.355 bytes de originais. Os backups
somam 145.737.400 e 360.180.646 bytes, incluindo quatro arquivos já excluídos
na segunda pasta. Total inventariado de originais e backups: 1.010.274.801
bytes. A busca pelos nomes e caminhos não encontrou parceiros, ações
vinculadas, referências de mídia nas fontes da auditoria, agendamentos ou
tentativas de publicação associados às duas pastas.

Proposta para Administração → Cloudinary: apresentar filtro **Ex-clientes**
para pastas confirmadas, sem liberar por inferência toda a aba Origem
desconhecida. Separar a finalidade do estado do arquivo: **Arquivo de ação**,
**Imagem de perfil** (equipe ou cliente), **Logotipo de parceiro** e outros
vínculos. Arquivos com mais de um vínculo mostram todas as finalidades.
Imagens e logotipos em uso ficam protegidos até a substituição do vínculo.

Para a operação **Excluir definitivamente**, revalidar os vínculos no
servidor, identificar o original e os derivados desse arquivo, confirmar
a remoção do original e só então remover versões de backup pelo identificador
imutável do ativo. Vínculos de anexos removidos devem ser contabilizados
separadamente. Informar resultados parciais de cada etapa. Em 26/11 o proprietário autorizou a implementação e publicação, com
exclusão somente após confirmação na tela. A seleção usa identificador
imutável, com até 20 itens por lote. As abas Ex-clientes e Backups exibem os
registros elegíveis. A operação relata originais, vínculos e backups
separadamente. A verificação de produção fica em leitura até o proprietário
confirmar um lote na tela.
