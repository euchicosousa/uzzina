# DS02 — Matriz inicial de conferência por rota

05/11/2026. Levantamento estático do checkout com subagente. A matriz cobre 24 destinos e os layouts raiz, equipe e portal, conforme a árvore de rotas. Aceites anteriores valem para o controle indicado. As demais combinações de tema claro/escuro, largura ampla/compacta e estados interativos aguardam evidência renderizada.

| Rotas | Controles e estados a conferir | Fixture ou papel |
| --- | --- | --- |
| `/` | Entrada, links, foco, quebra dos títulos | Público |
| `/login`, `/forgot-password`, `/reset-password` | Labels, senha, validação, erro, carregamento e token expirado | Anônimo, token fictício |
| `/app`, `/app/today`, `/app/partner/$slug` | Cabeçalho/AppBar, calendário, cartões, busca, gaveta e overlays. Marcadores CAL01 aceitos localmente. Editor D aceito | Membro com parceiro ativo, ações e datas fictícias |
| `/app/notifications`, `/app/help` | Sino e lista, vazio e ação indisponível, seletor da Ajuda no celular e foco | Membro, notificações fictícias |
| `/app/leads`, `/app/profile`, `/app/planejamento` | Lista/detalhe, preferências e upload de avatar, uso de IA, seleção de parceiro e estados desabilitados do Planejamento | Equipe, leads e uso fictícios; membro e admin no Perfil |
| `/app/admin/users`, `/app/admin/user/$userId`, `/app/admin/clients`, `/app/admin/client/$userId`, `/app/admin/partners`, `/app/admin/partner/$slug`, `/app/admin/celebrations` | Cartões, formulário e upload, foco, estados vazio/erro e feriados. Identidade do formulário aceita no C | Admin, registros fictícios em edição e criação |
| `/dash`, `/dash/login`, `/dash/action/$id`, `/dash/review/$slug` | Calendário e sessão do portal, revisão por token, contraste com cor do parceiro, erro de acesso. Anexos da ação aceitos | Conta externa, ações fictícias e tokens válidos/inválidos |
| `/ui` | Referência Prism para comparar variantes, foco, escala e densidade | Galeria |

O seletor de cor em lote e a geometria xs/sm do calendário de lote também têm aceite do proprietário.

## Achados para comparação no navegador

- Upload de avatar em Minha Conta e nos cadastros administrativos de pessoa, parceiro e conta externa repete a cobertura `bg-black/40` que aparece por hover. Conferir nome acessível, foco e descoberta por toque antes de propor ajuste compartilhado.
- A franquia de IA foi migrada para os tokens semânticos e aprovada pelo proprietário.
- Planejamento mantém controles HTML próprios. Conferir no recorte T01–T11. A ação de WhatsApp em Leads usa cor de marca externa e merece registro como exceção se a comparação confirmar adequação.
- Encaminhar a ordem de ícone e texto ao DS05 e a comparação de marcadores ao CAL01.

## Conferência no navegador local — 05/11

| Rota | Resultado |
| --- | --- |
| `/` | Entrada e links renderizaram. |
| `/login` | Formulário renderizou. Mostrar senha alternou para Ocultar senha. |
| `/forgot-password` | Formulário e botão de recuperação renderizaram. Envio pendente. |
| `/reset-password` | Formulário renderizou. Mostrar senha alternou para Ocultar senha. Botão de redefinição desabilitado com campos vazios. Recuperação com token pendente. |
| `/dash/login` | Formulário renderizou. Mostrar senha alternou para Ocultar senha. Entrada com conta externa pendente. |
| `/ui` | Navegação da galeria e seção de cores semânticas renderizaram. Cores e franquia têm aceite do proprietário. |

As seis telas foram observadas no navegador local em 390×740 e 1440×900. O documento não teve rolagem horizontal nessas medições. Isso não mede cortes internos, teclado virtual, todos os estados ou os dois temas. Nenhum formulário foi enviado.

## Rotas com sessão e revisão pública

- `/app`, `/app/today`, `/app/partner/$slug`: inspeção de composição. Aceites específicos do editor, calendário em lote e CAL01 preservados. Abertura de ações, busca e estados vazios aguardam dados controlados.
- `/app/help` e `/app/notifications`: seletor móvel, sino e lista aprovados pelo proprietário. Erros e estados vazios específicos continuam sem nova evidência.
- `/app/leads`, `/app/profile`, `/app/planejamento`: Leads e Planejamento aguardam sessão controlada; as abas do Perfil seguem no IA-M02. Medidor e aspecto dos avatares já aceitos.
- `/app/admin/users`, `/app/admin/clients`, `/app/admin/partners` e `/app/admin/celebrations`: listas e controles revisados no código. Botões de editar e apagar datas têm nome explícito. Estados de lista e sessão administrativa aguardam navegador.
- `/app/admin/user/$userId`, `/app/admin/client/$userId`, `/app/admin/partner/$slug`: formulários revisados no código. Identidade de Pessoa e aspecto dos avatares têm aceite. O mesmo achado de nome acessível se aplica aos três uploads.
- `/dash` e `/dash/action/$id`: calendário e anexos aceitos pelo proprietário. O seletor do feed tem nome e estado expandido. O acionador do gerenciador exibe a contagem de arquivos, mas o nome não descreve a ação.
- `/dash/review/$slug`: código distingue revisão indisponível de erro de rede. Falta conferir com tokens fictícios válido, expirado e revogado.

## Retornos acionáveis

1. Dar nome de ação explícito aos quatro botões de upload de avatar. Com foto, o avatar interno pode ter texto alternativo vazio e o ícone de upload não dá nome ao botão. Conferir anúncio por leitor de tela e descoberta por toque. O aceite visual do formato continua válido.
2. Incluir “Gerenciar arquivos” no nome acessível do gatilho do portal, mantendo a contagem visível no nome. Preservar a disposição já aceita.

A próxima cobertura renderizada precisa de uma sessão controlada para equipe, administração e portal, e de tokens fictícios para revisão. Usar exemplos de erro, vazio e carregamento em claro e escuro e registrar cada recorte separadamente.

## Correções de acessibilidade e verificações controladas — 05/11

Os quatro acionadores de avatar agora têm nome explícito. No portal, o nome do gerenciador inclui a ação e a contagem visível. Formatação, diff e typecheck passaram.

41 testes existentes passaram. Leads cobriu busca sem resultados, carregamento e falha com nova tentativa. Notificações cobriu carregamento, vazio, falha e recuperação. Hoje cobriu seleção e navegação por data, mas não o vazio específico desta rodada. A API da revisão cobriu token válido, inválido, expirado e revogado com banco simulado.

Pendente no navegador com sessão e dados controlados: estados de Minha Conta, dia vazio em Hoje, anúncio dos nomes dos acionadores, renderização da revisão com tokens e demais combinações da matriz. Os testes de componente e API não substituem essa evidência.

## Navegador com respostas controladas

- **Hoje, 1440 px.** Uma sessão fictícia sem ações mostrou a mensagem de dia vazio.
- **Minha Conta, 1440 px.** A resposta de franquia foi retida para observar o carregamento, devolveu 503 e depois retornou 75% ao clicar em Tentar novamente. O botão Alterar foto foi localizado por nome acessível e recebeu foco.
- **Portal, 390 px.** A ação fictícia com um anexo expôs o botão Gerenciar arquivos, 1 arquivo, que recebeu foco.
- **Revisão, 390 px.** O token fictício válido exibiu a ação esperada. Os tokens fictícios expirado e revogado receberam 404 controlado, exibiram a mensagem de indisponibilidade e não mostraram a ação.

Chromium temporário, app local e interceptação HTTP. APIs externas e chamadas locais de API fora das fixtures foram bloqueadas. Não houve gravação real. Nomes e foco foram conferidos pela semântica do navegador, sem leitor de tela físico. O ensaio da revisão confirma a interface perante a resposta simulada, enquanto os testes de API cobrem a rejeição dos tokens. Restam estados, temas e larguras fora do recorte na matriz ampla.

## Uploads administrativos por teclado

Nos cadastros de Pessoa, Cliente e Parceiro (`/new`), em 390 e 1440 px, Tab alcançou o botão pelo nome acessível e Enter chamou a abertura do widget com a pasta esperada. Seis cenários passaram. Chromium local, sessão fictícia e script do widget substituído por resposta controlada. O ensaio cobre o acionador e a integração de abertura, sem abrir o seletor real do Cloudinary ou enviar imagens. Na edição de Pessoa, Cliente e Parceiro com foto fictícia carregada, outros seis cenários passaram nas mesmas larguras. O botão manteve o nome acessível, recebeu Tab e acionou o widget simulado com Enter. Permanecem na matriz as demais comparações de tema, estados e papel.

## Entrada e recuperação com respostas controladas

Em 390×740, o login da equipe exibiu a rejeição simulada de credenciais e o login do portal exibiu indisponibilidade após 503. A recuperação de senha mostrou falha simulada e confirmação de envio na segunda tentativa. A página de redefinição mostrou a mensagem de link inválido ou expirado ao receber rejeição do token fictício. Nenhum e-mail foi enviado e nenhuma senha foi alterada.

## Listas, temas e rotas da equipe — 06/11

- Administração: Usuários e Parceiros passaram a usar uma coluna abaixo de sm, inclusive nos arquivados. As mensagens de vazio aparecem após consulta bem-sucedida sem registros. Usuários, Clientes, Parceiros e Datas Comemorativas passaram em 16 cenários com lista vazia ou preenchida a 390 e 1440 px. Em 390 px, o espaço do nome passou de 0 para 166 px em Usuários e de 57 para 228 px em Parceiros.
- Auth e galeria: 20 combinações em claro/escuro e duas larguras, sem estouro horizontal do documento. O primeiro campo recebeu foco visível nos quatro formulários. Placeholder claro em torno de 3,82:1 permanece como ponto de revisão do input compartilhado; rótulos e valores continuam legíveis nas amostras.
- Feedbacks: foram criados tokens de texto para info, warning e error nos badges, alertas e exemplos da galeria. Os preenchimentos da franquia permanecem com as cores aceitas. No Chromium, a menor razão aproximada dos exemplos medidos foi 5,00:1 no claro e 5,29:1 no escuro, em 390 e 1440 px. A medição final usou instância local temporária com cache separado porque o servidor principal ainda servia o nome anterior do módulo do seletor de IA.
- Home, Hoje, Parceiro e Leads renderizaram com registros fictícios em 390 e 1440 px no tema claro. Em Leads, o botão WhatsApp usa fundo preto e texto branco na renderização atual; as classes verdes locais perdem na cascata. Sem regressão de contraste observada nesse estado.
- Planejamento: reproduzido erro de atualização infinita com e sem parceiro nas duas larguras, atrasando uma resposta válida de celebrações em 1,2 s. A referência vazia recriada enquanto a consulta carrega alimenta o efeito de seleção. Encaminhado ao T03.

## Fechamento da revisão — 06/11

| Recorte | Evidência final |
| --- | --- |
| Usuários, Clientes, Parceiros e Datas Comemorativas | 16 sequências no Chromium (4 rotas × 2 temas × 2 larguras). Carregamento anunciado, falha explícita e nova tentativa até o vazio legítimo. Somam-se aos 16 cenários de lista vazia/preenchida registrados acima. |
| Login da equipe e do portal, recuperação e redefinição | Nas quatro telas, medição do placeholder após correção do PrismInput em 390 e 1440 px. Contraste aproximado de 3,82:1 para 5,30:1 no claro e 5,20:1 no escuro. Erro de entrada, falha e recuperação do envio e rejeição de token já cobertos com respostas simuladas. |
| Home, Hoje, Parceiro e Leads | Registros fictícios renderizaram em claro e escuro a 390 e 1440 px, sem estouro horizontal do documento. No tema escuro, não houve erros de página nas quatro rotas. |
| Minha Conta | Nas quatro combinações de tema e largura, nome e foco de Alterar foto, carregamento da franquia, erro e recuperação para 75%. No celular, alternância entre Informações pessoais e Preferências conferida. |
| Portal e revisão pública | Nas quatro combinações, foco e nome do gerenciador com um anexo. Os três estados de token da revisão foram conferidos nessas mesmas combinações, sem estouro horizontal. |
| Planejamento | Falha de atualização reproduzida em claro e escuro. Reprodução, hipótese de causa e roteiro de confirmação no [T03](../../.scratch/social-planning-recovery/issues/03-normalized-input.md). |

A revisão termina com as 24 rotas catalogadas e os desvios acionáveis corrigidos ou encaminhados. A evidência combina inspeção de código, aceites do proprietário e verificações controladas. Não há cobertura exaustiva de todos os estados em todas as rotas, comparação renderizada antes/depois para cada controle, nem evidência de leitor de tela físico, Safari móvel, autenticação real ou seletor real do Cloudinary. Esses recortes permanecem sem evidência e não foram tratados como aprovações. A comparação de ordem de ícone e texto permanece no DS05; o redesenho de Minha Conta, no IA-M02.
