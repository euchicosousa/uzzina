# Encontrar e excluir arquivos sem uso no Cloudinary

**Status:** limpeza definitiva aprovada pelo proprietário em produção em 26/11/2026. Reaberto para investigar o limite de consultas na auditoria, observado depois do aceite. A correção da contagem saiu em `eede297e`. A separação por uso, as pastas dos ex-clientes e a confirmação definitiva saíram em `735e4de3`.

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

## Ex-clientes e exclusão definitiva — 26/11/2026

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

**Aceite em produção (26/11):** o proprietário confirmou que a operação funcionou. A confirmação encerra a entrega, sem registrar volume de arquivos apagados ou espaço liberado. [Deploy Ready](https://vercel.com/agenciacnvt/uzzina/2rugd8L79MHmrNrttSPeXmhVsgiH).

## Limite de consultas da auditoria — 26/11/2026

O proprietário mostrou o painel bloqueado às 14h49. Uma única consulta de
leitura ao Cloudinary retornou HTTP 420, 0 de 500 consultas restantes e
renovação às 15h00 em America/Fortaleza. A exclusão definitiva consulta
versões de backup por arquivo, revalida a remoção e atualiza o catálogo.
Até duas consultas de versões podem ser feitas por arquivo. A investigação
anterior também consumiu parte da mesma cota compartilhada.

Proposta: mostrar o horário de renovação, preservar o último relatório com
aviso de desatualização, e verificar o saldo e reservar capacidade para
confirmar o lote antes de alterar originais. Se um lote ficar parcial,
identificar e retomar só os backups restantes após a renovação e a
confirmação do proprietário. Nenhuma alteração foi publicada nesta análise.

### Redução de consultas aprovada em 26/11

O proprietário autorizou reduzir consultas durante a limpeza. O servidor
revalida os metadados apenas dos IDs selecionados e mantém a rechecagem de
vínculos e de publicações pendentes no banco. Depois da tentativa de
remoção de versões, confirma os backups por lote. Um resultado ambíguo
aparece como pendente e só pode ser revisto após atualizar a análise.
O painel mantém o último catálogo durante a rodada e desconta as exclusões
confirmadas. `Atualizar análise` reconcilia o catálogo completo no encerramento.

A prova de leitura na conta confirmou que a consulta direta por IDs pode
rejeitar um grupo se um ID já desapareceu. A pré-checagem divide somente
grupos rejeitados e ignora os IDs ausentes. O modo de pastas fixas usa
caminho público nas buscas. A conferência final consulta todos os caminhos
do lote juntos e valida os IDs retornados. A amostra real reconheceu um
original ativo, um backup existente e um caminho ausente, sem exclusões.

**Recorrência em produção, 26/11 às 15h47.** O proprietário relatou que
a cota acabou após excluir algumas imagens. Uma leitura retornou HTTP 420,
0/500 de saldo e renovação às 16h00 em Fortaleza. A verificação em lote
eliminou leituras repetidas, mas a primeira consulta de versões continua
necessária para apagar os backups e consome a maior parte da cota. Não há
contagem por lote que permita atribuir todas as 500 unidades a essa rodada.
Opções para decisão: manter a limpeza conjunta com checagem de saldo, ou
limpar originais e derivados primeiro e oferecer os backups em uma rodada
separada. Nenhuma alteração de código nesta análise.

**Decisão em 26/11/2026.** O proprietário manteve uma única operação para original, derivados e backups.

## Cruzamento das pastas com os parceiros atuais — 26/11/2026

A leitura após 16h confirmou as 22 pastas raiz da captura, cruzadas com 16 parceiros ativos e com as referências às mídias. “Só backup” conta arquivos sem original ativo, não as versões de backup dos originais ativos.

| Nº | Pasta | Cruzamento | Originais ativos | Só backup | Arquivos referenciados |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | `agenciacnvt` | Agência CNVT ™ | 12 | 0 | 12 |
| 2 | `anaarcanjoodontologia` | Ex-cliente confirmado | 90 | 22 | 0 |
| 3 | `brendavasconcelos` | Brenda Vasconcelos | 142 | 10 | 142 |
| 4 | `bussola` | Vínculo com ações da Clínica Dengo | 5 | 4 | 4 |
| 5 | `cali.pizza.holiday` | Sem parceiro no cadastro e sem vínculo detectado | 30 | 5 | 0 |
| 6 | `clinicadengo` | Clínica Dengo | 186 | 6 | 186 |
| 7 | `clinicaunivetsobral` | Clínica Univet | 58 | 0 | 58 |
| 8 | `donaformigasobral` | Sem parceiro no cadastro e sem vínculo detectado | 6 | 0 | 0 |
| 9 | `draiaratomaz` | Dra. Iara Tomaz | 100 | 58 | 103 |
| 10 | `dramargaridacarneiro` | Dra. Margarida Carneiro | 24 | 0 | 24 |
| 11 | `dranataliagomes` | Sem parceiro no cadastro e sem vínculo detectado | 1 | 0 | 0 |
| 12 | `dubecco` | Sem parceiro no cadastro e sem vínculo detectado | 8 | 0 | 0 |
| 13 | `euchicosousa` | Chico Sousa | 7 | 0 | 7 |
| 14 | `executetecnologia` | Ex-cliente confirmado | 45 | 2 | 0 |
| 15 | `frotasgas` | Sem parceiro no cadastro e sem vínculo detectado | 52 | 0 | 0 |
| 16 | `hospitaldrthomazcorrea` | Hospital Dr. Thomaz Corrêa | 118 | 1 | 118 |
| 17 | `ochicosousa` | Vínculo com ações que usam o cadastro antigo ochicosousa | 12 | 0 | 12 |
| 18 | `parksobral` | PARK Sobral | 227 | 20 | 227 |
| 19 | `postosfrotas` | Sem parceiro no cadastro e sem vínculo detectado | 81 | 0 | 0 |
| 20 | `smartmed_massape` | SmartMed | 240 | 2 | 240 |
| 21 | `toroburgerandbeer` | Toro Burger & Beer | 116 | 0 | 116 |
| 22 | `uzzina` | Pasta compartilhada da UZZINA | 625 | 114 | 590 |

Ana Lia Rocha, Exacta Consultoria, Luma Torre, Odonto Melo e VIDERE SAÚDE não têm pasta própria na raiz. O cruzamento não é uma autorização de exclusão.

### Exclusão manual das pastas — 26/11/2026 às 16h04

O proprietário removeu pastas pelo console do Cloudinary. A captura e
a leitura subsequente confirmaram 12 pastas raiz. A busca por prefixo
encontrou zero originais ativos em `bussola`, `ochicosousa`,
`executetecnologia` e `anaarcanjoodontologia`. As referências anteriores
a 4 arquivos de `bussola` e 12 de `ochicosousa` correspondem a ativos
que agora só estão no backup. Os quatro de `bussola` aparecem em ações
da Clínica Dengo; os do outro prefixo aparecem em ações com o identificador
histórico `ochicosousa`. Backups remanescentes: 9, 12, 47 e 112,
respectivamente. Consulta somente de leitura. O proprietário dispensou a restauração
desses ativos nessa rodada.
