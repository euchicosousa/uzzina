# Duas ações abertas e filtro da busca

Levantamento consolidado em 27/10/2026 após as decisões do proprietário. Substitui as versões anteriores. [Roadmap e tickets](action-tabs-ticket-breakdown.md): ticket 01 implementado e testado pelo proprietário, sem problema relatado; [resultado e verificações](../audits/2026-10-27-action-panel-parent.md). Ticket02 implementado localmente para revisão: [duas ações por abas](../audits/2026-10-27-two-action-tabs.md), com nomes primaryAction/secondaryAction. Tickets05/03/04 ainda não iniciados; criação pela busca permanece no05.

## 1. Abertura e limite

No máximo duas ações, em espaços de principal e secundária. Esses nomes organizam o estado; não exigem rótulos “ação 1” ou “ação 2” na interface.

| Situação | Abertura comum | Shift+clique/Enter/Espaço em ação da busca |
| --- | --- | --- |
| Nenhuma aberta | Abre principal | Abre principal |
| Só principal aberta | Substitui principal | Abre secundária |
| Duas abertas | Substitui principal, preserva secundária | Substitui secundária, preserva principal |
| Só secundária aberta | Abre principal, preserva secundária | Substitui secundária |
| Ação selecionada já aberta | Foca a existente | Foca a existente |

A linha de secundária isolada decorre de manter seus papéis após fechar a principal: abertura comum tem destino principal; Shift tem destino secundária quando já existe uma ação aberta. A exceção de Shift abrir principal aplica-se quando nenhuma está aberta.

Verificar ação já aberta antes de escolher espaço, evitando duas instâncias do mesmo registro. Toda substituição respeita a guarda da ação substituída. Abrir secundária preserva principal e seu estado.

Abertura secundária existe somente na busca. Cards, notificações, criação e demais entradas mantêm abertura comum. Sem botão auxiliar de abertura secundária e sem fluxo adicional para uso sem teclado; esses itens foram retirados por decisão explícita.

### Criação pela busca — acréscimo do ticket05

O proprietário solicitou um comando Criar ação na busca global, mantendo o atalho de criação atual. No novo comando, ativação comum cria rascunho na principal e Shift cria na secundária; sem nenhuma aberta, Shift cria na principal. As demais entradas de criação continuam comuns. Assim, pode-se manter um rascunho enquanto se abre uma ação existente por Shift, ou manter a ação existente enquanto se cria um rascunho secundário. Limite, guardas, foco e preservação de estado são os mesmos dos dois espaços. A apresentação simultânea segue a largura da tela; alternância por abas funciona antes do ticket03.

Rascunhos usam a fábrica/contexto atuais, sem herdar o filtro exclusivo de resultados da busca. Receber o ID ao criar não muda o espaço nem remonta a outra ação. Detalhes e critérios no [ticket05](../../.scratch/action-tabs/issues/05-create-action-from-search.md).

## 2. Componente pai e reutilização

`ActionDrawerPanel` coordena posicionamento e exibição das até duas instâncias completas do mesmo `ActionFormDrawer`, com estado em `useActionPanels` (`primaryAction`/`secondaryAction`) e entrada compartilhada `initialAction`. Não duplicar a implementação do formulário. O pai também coordena espaços, foco, guardas e fechamento individual/conjunto.

Cada formulário mantém texto, abas internas, arquivos, IA, salvamento, erro e conflito independentes. Identidade estável da instância, inclusive para rascunhos, deve impedir remontagem da ação preservada ao fechar/substituir a outra ou redimensionar.

Representação por dois espaços explícitos ou coleção limitada é escolha de implementação; manter o papel de cada entrada, sem promoção automática. Não criar gerenciador de quantidade ilimitada.

O ticket01 transferiu o posicionamento ao pai; o ticket02 moveu o salvamento por teclado para o escopo local do formulário ativo e o Escape conjunto para o pai. Salvar atinge só a ação em foco. Guardas registradas por instância; IDs e overlays internos preservam foco independente. Troca de sessão limpa ambas.

## 3. Layout fechado

Ticket02 entregue com alternância por abas em todas as larguras. O ticket03 acrescenta o modo lado a lado abaixo, a partir de1600px, preservando as mesmas instâncias.

### Mobile e telas estreitas

Uma ação visível por vez, com abas para alternar entre as abertas. Cada uma conserva Essencial/Instagram/Observações. Sem perda de estado na alternância.

### Desktop

- Grupo único ancorado à direita, como o painel atual.
- Principal à esquerda, secundária à direita, dentro desse grupo.
- Preservar larguras diferentes conforme a aba: normal até `2xl`; Instagram até `3xl` em telas grandes.
- Exibir duas lado a lado somente quando houver espaço para ambas na maior largura. Calcular limiar estável por essa referência, evitando trocar entre painéis e abas ao mudar de aba interna.
- Abaixo do limiar, usar alternância por abas também no desktop.
- Com uma ação, apresentar um único painel à direita, independentemente do espaço lógico ocupado; sem espaço vazio ou indicação obrigatória de “ação 2”.

Em `InstagramTab.tsx`, Conteúdo e Legenda têm a mesma largura externa, mas proporções internas distintas de imagem/texto em lg. No ticket03 a composição interna passa a responder ao contêiner de cada painel. Limiar definido em1600px: duas larguras máximas de768px mais64px de overlay.

## 4. Fechamento fechado

- X individual fecha somente sua ação.
- Não promover secundária quando principal fechar, nem remontar a restante.
- Overlay fecha todas as abertas.
- Escape tem a mesma função do overlay: fecha todas as ações. Overlays internos continuam tratando seu próprio Escape quando aplicável; o comando de fechar ações não deve atravessar um diálogo/seletor que consumiu a tecla.
- Decisão final do proprietário: sem botão de fechamento conjunto. Fechar todas somente por Escape ou clique no overlay; X individuais dos formulários permanecem. Substitui as propostas anteriores de CircleX na secundária ou X junto às abas.
- Com secundária isolada, permanece apenas seu X individual.

Todos os caminhos preservam proteções de texto pendente, salvamento, rascunho, conflito, erro e IA. Fechar todas usa um único fluxo compartilhado por overlay, Escape e botão; verificar as guardas antes de remover as instâncias, evitando fechamento parcial por bloqueio de uma delas. Limpar o estado diretamente não pode ignorar essas proteções.

## 5. Filtro exclusivo da busca

O seletor existe somente dentro da busca e altera somente quais ações ela procura.

### Inicialização a cada abertura

- Na página de um parceiro: esse parceiro selecionado.
- Nas demais páginas: nenhum parceiro específico selecionado, buscando em todos os disponíveis.
- Fechou e abriu de novo: reiniciar pelo contexto atual, sem memória da seleção anterior.

### Seleção

Permitir todos, um ou vários parceiros. “Todos os parceiros” corresponde à ausência de restrição por parceiro específico; usar seleção vazia como representação simples. Escolher todos limpa a restrição; remover a última seleção também volta a todos. Seleção de vários encontra ações de qualquer um deles, respeitando os parceiros disponíveis ao usuário.

A rota fornece apenas a seleção inicial do filtro. Ao mudar o seletor dentro da busca, a consulta usa essa seleção. Não alterar calendário, rota ou outros estados da página.

O proprietário esclareceu que “buscar todas as ações” se referia à opção de arquivadas como referência para localização visual. Registrar filtro de parceiros próximo à área de controles da busca; isso não solicita alterar a regra de arquivamento. No código inspecionado, includeArchived está comentado; não foi certificado controle ativo no navegador.

### Reaproveitamento verificado

`app/components/features/PartnersCombobox.tsx` é o candidato adequado:

- Já recebe selectedPartners como array e devolve novo array em onSelect.
- Clique comum adiciona/remove, permitindo um ou vários parceiros.
- Shift seleciona exclusivamente um parceiro e fecha o popover.
- Possui variante filter, apresentação dos selecionados e pesquisa interna de parceiros.
- Não navega nem grava filtros globais; estado pode pertencer exclusivamente à busca.
- Ainda não oferece item explícito “Todos os parceiros”; vazio aparece como “Parceiros”. Para este uso, adicionar capacidade opcional de exibir/selecionar Todos e apresentar esse rótulo quando vazio, sem mudar a atribuição de parceiros nos formulários existentes.

O `PartnerFilterPopover` privado de AppBar.tsx também alterna seleção múltipla, mas mistura navegação, contagem de atrasos e estado da página. Não é a melhor base para reutilização direta.

O Shift do seletor de parceiros mantém sua seleção exclusiva. O Shift que abre secundária aplica-se somente a resultados de ações, sem misturar as duas intenções.

## 6. Acesso, continuidade e verificação

Cmd/Ctrl+K permanece disponível com ações abertas. Não adicionar barra, botão, gesto ou mecanismo alternativo para ausência de teclado. O fato de AppBar ficar oculta durante edição não cria pendência nesta proposta.

Preservar comportamento atual de navegação; não adicionar persistência após recarregar. Manter o restante do aplicativo e permissões existentes. Ações ocultas pela alternância conservam seu trabalho; apenas a ação em foco recebe comandos de salvamento. Escape das ações segue fechamento conjunto.

Referências adicionais: app/routes/app.tsx (estado/overlay/busca), ActionDrawerFocusScope.tsx (foco local), GlobalSearchCommand.tsx (resultados e escopo atual), prism/command.tsx (onAction com shiftKey) e models/actions.ts (consulta por título e parceiros).

Cobertura futura: toda a matriz de abertura, inclusive secundária isolada; limite de duas; mesma ação; substituição bloqueada; rascunhos; X individual; ausência de promoção; ausência de botão conjunto; fechamento conjunto por Escape/overlay e guardas; foco e overlays; salvamentos independentes; combinações de abas/larguras; resize sem remontagem; filtro todos/um/vários e reset a cada abertura; sessão.

Decisões de produto fechadas; ticket02 implementado e verificado conforme o relatório, sem SQL ou publicação. Ícone definitivo e medidas do lado a lado permanecem acabamento/validação do ticket03. Mudanças externas preservadas.

## Revisão do proprietário após o ticket02

Abertura de duas ações testada e confirmada como correta. Overlay fecha as ações, conforme relato. Exibição lado a lado ainda não existe: pertence ao ticket03, independentemente da largura atual da tela. Abas externas e internas ficam mantidas, apesar da observação de excesso visual; sem reformulação solicitada.

Escape fora do Tiptap fecha; dentro dele não fechou no teste do proprietário. Registrar para reprodução em texto sem menus, com seleção e com menus/diálogos internos. O pai ignora eventos defaultPrevented e alvos em diálogo/popover; isso indica uma possibilidade, sem confirmar a causa no editor. Preservar Escape próprio de menus/diálogos. Nenhuma correção funcional autorizada por este levantamento.

Encerramento do ticket02: botão conjunto ajustado e Escape conferido em Chromium e na dependência instalada. prosemirror-view captureKeyDown retorna true para Escape (keyCode27), e seu handler chama preventDefault; o pai respeita essa decisão. Comportamento preservado, sem pendência de diagnóstico. Próximo ticket solicitado pelo proprietário:03;05 fica depois dele.

Revisão final: proprietário retirou o botão conjunto, pois a barra externa deixará de existir na apresentação lado a lado. Remoção autorizada e implementada; X individuais e guardas mantidos.
