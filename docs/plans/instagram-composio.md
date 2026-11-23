# Plano de integração do Instagram com a Composio

Proposta de 22/11/2026. A UZZINA usaria a Composio para conectar perfis, publicar e buscar dados no Instagram. O Supabase guardaria a programação e os dados coletados. A equipe poderia consultar e exportar relatórios a partir do que já está no banco, sem repetir a importação a cada consulta.

## 1. Conectar o perfil do parceiro

Propor **Conectar Instagram** no cadastro do parceiro. Uma pessoa autorizada pela clínica concede acesso na Meta. Ao voltar, o cadastro mostra o **@perfil conectado**, o estado da conexão e as opções de reconectar ou desconectar. O servidor vincula a conexão ao parceiro e confere o destino de cada publicação. Em ações com vários parceiros, a equipe confirma explicitamente o destino de cada envio.

O piloto começa pelo OAuth gerenciado da Composio com um perfil **Empresa** de teste. Publicar Stories, listar mídias e consultar insights são operações distintas, com permissões a confirmar na mesma conexão. Se faltar uma permissão essencial, avaliar um app Meta próprio e o processo de revisão aplicável. [Autorização gerenciada](https://docs.composio.dev/docs/authentication/custom-app-vs-managed-app) · [Ferramentas do Instagram](https://docs.composio.dev/toolkits/instagram)

## 2. Publicar agora ou programar

A [aba Instagram da ação](../../app/components/features/action-drawer/InstagramTab.tsx) já mostra a prévia e o gerenciador de arquivos na mesma coluna. A primeira proposta é colocar **Publicar agora** e **Programar** abaixo da prévia, perto dos arquivos. Conferir a composição em gaveta estreita antes de fechar a posição. Se a aba ficar apertada, experimentar um diálogo **Publicação no Instagram** aberto a partir da ação.

Antes de confirmar, a equipe vê o @ de destino, os arquivos finais e sua ordem, a legenda quando aplicável e o horário no fuso do parceiro. A programação guarda essa versão dos materiais. A autorização para conectar o perfil e a eventual aprovação editorial da peça são decisões separadas. Definir com a agência quais parceiros exigem aprovação antes do envio e quem pode publicar.

### Selecionar Stories para cada dia

Uma ação de Stories pode reunir todos os arquivos disponíveis e ter vários agendamentos ligados a ela. Na ação da clínica, a equipe carrega os dez Stories dos profissionais e, em **Programar**, marca os três que atendem na segunda, define a ordem e confirma o horário. Os dez arquivos continuam disponíveis na ação. Para terça, a equipe abre a mesma ação e marca outra seleção. Cada agendamento guarda os arquivos selecionados, o @ de destino, a data, o horário e a ordem. Cada Story tem resultado próprio, para identificar quais saíram e quais precisam de atenção.

### Duplicar uma ação

A cópia leva o conteúdo e os arquivos da ação. Ela começa com a lista de agendamentos vazia. A programação, os resultados e o histórico pertencem à ação original. Para usar a cópia, a equipe seleciona os Stories, escolhe as datas e confirma. A UZZINA cria novos agendamentos vinculados à cópia nesse momento.

### Programar em várias datas

Para a oferta da hamburgueria, a equipe pode selecionar uma vez o material e o horário e escolher como distribuir:

- **Datas específicas.** Marcar quatro datas no calendário e confirmar todas de uma vez.
- **Repetição semanal.** Escolher toda segunda-feira, com início e fim definidos, por exemplo, durante dois meses.

A proposta é mostrar as datas e o horário antes da confirmação e criar uma ocorrência independente para cada data. Assim a equipe pode cancelar ou mudar uma segunda específica sem alterar as outras. O primeiro fluxo a validar é a seleção de Stories para uma data. As duas opções de várias datas ficam previstas como evolução desse mesmo fluxo.

**Publicar agora** usa a mesma fila com execução imediata. **Programar** grava a data futura no Supabase. Um Supabase Cron aciona o servidor para buscar itens no horário e chamar a Composio. A UZZINA guarda o resultado e o identificador do Instagram, exibe o link quando disponível e permite cancelar ou reprogramar itens ainda pendentes. Se a resposta do Instagram se perder, o servidor verifica o resultado antes de tentar publicar outra vez. [Supabase Cron](https://supabase.com/docs/guides/cron) · [Publicação na API da Meta](https://developers.facebook.com/documentation/instagram-platform/content-publishing) · [Publicação pela Composio](https://docs.composio.dev/kb/guide/toolkits-instagram)

## 3. Guardar os dados do Instagram na UZZINA

| O que coletar | Como usar no relatório |
| --- | --- |
| Inventário de mídias disponíveis, inclusive posts feitos fora da UZZINA | Data, formato, legenda, link e identificador do Instagram. Filtrar, contar e abrir as publicações de um período. |
| Insights por mídia | Ordenar posts ou Reels por alcance, visualizações, compartilhamentos ou salvamentos, conforme as métricas disponíveis para cada formato. |
| Insights do perfil | Acompanhar alcance e interações da conta no período e outras métricas conforme a permissão. Para alcance único do perfil, usar o dado do período devolvido pela Meta, pois somar alcances individuais pode contar a mesma pessoa várias vezes. |
| Insights de Stories | Coletar perto da publicação, enquanto os dados estiverem acessíveis, ou aproveitar o evento de expiração se o fluxo autorizado o oferecer. Assim a UZZINA pode incluir Stories nos relatórios futuros. |

Após conectar o perfil, oferecer **Importar publicações**. A equipe escolhe as datas inicial e final. Um comando na tela percorre as páginas de resultados e guarda as mídias disponíveis cuja data de publicação cai no intervalo. Mostrar quantas foram salvas, o intervalo coberto e se a coleta terminou ou ficou parcial. Depois, sincronizar periodicamente, atualizar por identificador sem duplicar publicações e registrar cada métrica com data da coleta, período e origem. Definir a frequência por formato após medir o piloto. Uma atualização manual solicitaria a sincronização do que estiver defasado.

Um relatório anual pode listar posts antigos disponíveis e ainda ter lacunas nos insights do perfil ou nos Stories. A cobertura depende da métrica, formato, janela da Meta e permissões. Indicar **última atualização**, **período coberto** e **dado indisponível** quando aplicável. Totais acumulados coletados hoje para um post antigo devem aparecer como acumulados até a coleta. Para dizer quanto ele ganhou apenas no mês selecionado, são necessárias medições que cubram esse intervalo. [Insights da Meta](https://developers.facebook.com/docs/insights/overview/) · [Métricas do perfil](https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user/insights/) · [Evento de expiração de Stories](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-instagram)

### Analisar o que o público escreveu

Depois de importar a lista, a equipe poderá escolher todos os posts do período ou apenas alguns e solicitar **Analisar comentários**. Os insights fornecem contagens. Para ler o conteúdo, buscar os comentários de cada mídia e, quando incluídas, as respostas às conversas, percorrendo as páginas disponíveis. Guardar texto, data e identificadores do comentário, da publicação e do parceiro no Supabase. Reusar os dados coletados e atualizar por identificador antes de uma nova análise quando solicitado.

O período inicial seleciona os **posts publicados** entre duas datas. Mostrar separadamente até quando os comentários foram coletados, pois um post de outubro pode receber uma pergunta em novembro. A análise proposta agrupa dúvidas, pedidos e temas recorrentes, mostra quantos comentários foram analisados e aponta as publicações que sustentam cada conclusão. Para clínicas, apresentar os temas de forma agregada, evitando reproduzir dados pessoais de quem comentou.

No piloto, comprovar leitura do texto e das respostas pela conexão gerenciada e medir chamadas por página e por conversa. Essas chamadas e o eventual processamento por IA são adicionais à estimativa de publicação e insights. Se a permissão de comentários faltar, indicar a coleta indisponível e preservar os relatórios das métricas já obtidas. [Comentários e respostas na Composio](https://docs.composio.dev/toolkits/instagram)

## 4. Relatórios no parceiro

Propor **Relatórios → Instagram** na página do parceiro. A equipe escolhe perfil, período e formato. A tela começa com publicações do período, métricas disponíveis e ranking por uma métrica escolhida. Exemplos de consulta:

- **Quais foram os cinco posts com mais salvamentos em outubro?**
- **Quais Reels de 2026 tiveram mais visualizações nos dados disponíveis?**
- **Exportar todas as publicações do período com as métricas coletadas.**

Filtros, rankings e exportação CSV leem o Supabase. Com isso, abrir o mesmo relatório várias vezes não consome novas chamadas à Composio. O CSV pode ser usado em planilha ou em uma ferramenta de análise como o Claude. Google Sheets e Drive ficam como opções para automatizar a entrega se houver demanda. A localização proposta é na área interna do parceiro. Acesso pelo portal do cliente é uma decisão de produto. [Google Sheets](https://docs.composio.dev/toolkits/googlesheets) · [Google Drive](https://docs.composio.dev/toolkits/googledrive)

## 5. Piloto, volume e expansão

1. **Validar uma conexão gerenciada.** Em um perfil Empresa de teste, conectar, publicar um post simples, publicar uma sequência curta de Stories com formatos usados pela equipe, listar as mídias de um mês e buscar insights por mídia e perfil. Registrar permissões efetivas, métricas devolvidas, dados indisponíveis e chamadas por operação.
2. **Validar o fluxo de publicação.** Fazer um envio imediato e um agendado com a UZZINA fechada. Selecionar três de dez Stories e verificar que só os três saem, na ordem. Duplicar a ação e conferir que a cópia abre com os arquivos e a lista de agendamentos vazia. Confirmar um novo agendamento na cópia e conferir o vínculo e o perfil de destino. Verificar o tratamento de falhas parciais e respostas perdidas sem duplicar publicações. Na evolução para várias datas, validar as ocorrências geradas e o cancelamento de uma data isolada.
3. **Validar a coleta e o relatório.** Importar período curto, guardar métricas, comparar uma amostra com o Instagram e gerar ranking e CSV usando somente os dados salvos. Só então medir o custo de importar o ano inteiro.

Para 15 clientes, com cinco Stories diários e um post simples por dia útil, um mês de 31 dias com 23 dias úteis soma **2.670 publicações**. São **5.340 chamadas básicas** para publicar, ou **8.010** com uma consulta adicional por item. Se a coleta fizer ainda uma chamada de insights para cada uma dessas mídias, a referência sobe para **10.680**. A estimativa ainda precisa somar listagem, insights do perfil, novas medições, tentativas e carrosséis. Usar execução em sessão para trabalhar com a cota gerenciada de **20 mil chamadas por mês** do Hobby. A execução fora de sessão tem um teto próprio de **10 mil**. Um Cron por minuto consumiria **44.640 invocações** em 31 dias se cada checagem acionar uma Edge Function, frente à cota Free de **500 mil** da organização. [Composio Platform Pricing](https://composio.dev/pricing/platform) · [Cota do Supabase](https://supabase.com/docs/guides/platform/manage-your-usage/edge-function-invocations)

O catálogo do Instagram também inclui comentários, menções, mensagens e eventos, sujeitos às permissões do fluxo. O **TikTok** aparece no catálogo com ferramentas para listar vídeos, consultar estatísticas e postar. A Composio documenta que a publicação pública exige app próprio aprovado no TikTok. Facebook, Google Sheets e Drive têm integrações que podem apoiar distribuição e relatórios mais adiante. O plano atual concentra o trabalho no Instagram. [Catálogo da Composio](https://docs.composio.dev/toolkits) · [Requisitos do TikTok](https://docs.composio.dev/kb/guide/toolkits-tiktok)

**Situação da proposta.** Pesquisa documental. Permissões, formatos e custo por operação ainda dependem do piloto com conta de teste.
