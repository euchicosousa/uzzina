# Duas ações lado a lado — ticket03

Autorizado pelo proprietário após concluir o02, com commit local e sem deploy.

## Implementação

ActionDrawerPanel mantém superfícies estáveis ao alternar apresentação: com duas entradas e janela mínima de1856px, as duas ficam visíveis, principal à esquerda e secundária à direita no grupo ancorado à direita. Esse limite reserva duas gavetas máximas de896px e64px de overlay. Cada gaveta preserva672px em Essencial/Observações e896px em Instagram; mudar de aba não muda o limiar. Abaixo do limite há abas; uma ação isolada fica à direita.

React Aria continua gerindo as abas e suas associações por useTabPanel; superfícies recebem região nomeada quando ambas visíveis e ficam ocultas/inert apenas no modo de abas. A travessia de coleção do React Aria não monta formulários. Foco/ponteiro definem ação ativa antes dos comandos; cada formulário continua com seu coordenador, guardas e atalho local. Fechamento individual, Escape/overlay, busca e sessão preservados, sem botão conjunto.

Instagram usa container queries no painel: imagem/texto e botões respondem à largura efetivamente disponível. Não há novo primitivo nem nova galeria.

## Verificação

Teste real de duas ações em desktop amplo falhou antes da implementação (uma visível) e passou depois. Cobertura adicional exercita limiar1855/1856px, resize sem remontagem/escrita, preservação de texto/aba, seleção por foco, salvamento por formulário, fechamento sem promoção e falha/retry pelos dois caminhos conjuntos. Verificação final na cópia isolada do conteúdo destinado ao commit:438 testes passaram em41 arquivos; format, format:check, lint, typecheck e build passaram. Aviso conhecido de chunks grandes permanece. A espera do primeiro carregamento lazy do editor no teste usa timeout de5s para não confundir carga fria com falha de foco.

## Escopo e publicação

Sem SQL ou escrita real em produção. HTTP controlado não certifica RLS/provedor. Tickets05 (criar pela busca) e04 (filtro) permanecem futuros. Alterações externas em Hoje/AppBar/layout preservadas fora do commit; verificação final usa cópia isolada do conteúdo selecionado. Commit local autorizado; sem push ou deploy.

Chromium com o build isolado: fluxo inicial em1440px e390px, seguido de2560px e fronteira1855/1856px; HTTP externo totalmente controlado. Confirmados ordem/ancoragem, larguras672/896, imagens locais simuladas, Conteúdo e Legenda, Essencial/Observações, temas claro/escuro, ausência de rolagem horizontal nas superfícies, salvamentos por identidade, fechamento sem promoção, logout com duas abertas e resize preservando elementos, texto e scrollTop da legenda sem gravações extras. Capturas inspecionadas em /tmp/uzzina-side-by-side-instagram-light.png e -dark.png.

No checkout compartilhado, lint detectou um thenable em teste externo de visibilidade da AppBar; esse arquivo não integra esta entrega. A cópia isolada validada preserva a AppBar anterior, incorpora apenas a migração de nomes necessária aos painéis e mantém fora dela o ajuste externo da data de Hoje, espaçadores e mudanças de layout. Nenhum arquivo privado de ambiente entra no commit.

## Redução do Instagram para3xl

Depois de validar o lado a lado, proprietário pediu Instagram em3xl:768px/48rem no lugar de896px/56rem, em uma ou duas ações. Limite de lado a lado passa de1856px para1600px:2×768+64. Essencial/Observações continuam672px. As proporções de imagem/texto passam a atuar a partir de47rem de espaço interno para acomodar a borda do painel de768px, mantendo Conteúdo em1/3+2/3 e Legenda em1/2+1/2. Sem reformulação dos controles.

Teste da fronteira1599/1600 falhou com o limite anterior e passou após o ajuste;73 testes pertinentes passaram. Format/lint/typecheck e build passaram, com aviso conhecido de chunks. Roteiro de navegador atualizado para768px e a nova fronteira; Chromium com build isolado e HTTP controlado passou:768px por painel, fronteira1599/1600, imagem e Conteúdo lado a lado, Legenda, claro/escuro, preservação de DOM/texto/rolagem, foco, fechamento e sessão. Captura clara inspecionada. Contratos e KI sincronizados. Sem novo commit, push/deploy, SQL ou escrita real nesta revisão.

## Encerramento aprovado

Proprietário confirmou o funcionamento da versão final e autorizou encerrar o ticket03 e criar o commit local, sem publicação. Escopo final: Essencial/Observações672px, Instagram768px/3xl e lado a lado a partir de1600px, com os resultados de verificação registrados acima. Nesta rodada somente aceite/documentação e commit; referências/diff conferidos, sem nova mudança funcional ou necessidade de repetir testes. Alterações externas em Hoje/Kanban preservadas fora do commit.
