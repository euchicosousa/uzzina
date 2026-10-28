# Duas ações e busca — tickets aprovados

Preparada em 27/10/2026 com a skill To Tickets. Fonte: [levantamento consolidado](action-tabs-and-search-scope.md). O proprietário aprovou a divisão ao autorizar o início do ticket 01. Tickets publicados localmente. Ticket01 implementado e testado pelo proprietário, sem problema relatado. Ticket02 concluído localmente, com abertura validada e ajuste final de fechamento entregue, incluindo Primary/Secondary Action e alternância por abas. Ticket05 solicitado para criar ações pela busca; tickets05/03/04 ainda não iniciados.

Destino aprovado: um arquivo por ticket em `.scratch/action-tabs/issues/`, seguindo o padrão local das entregas anteriores. Estado inicial ready-for-agent; dependências abaixo determinam quais podem iniciar. Ordem sugerida após o acréscimo: 01 (feito) → 02 (concluído localmente) → 03 → 05 → 04, sempre um executor por vez e revisão de cada entrega antes de avançar. A numeração anterior foi preservada. Tickets05 e03 dependem de02; 03 passa à frente de05 por orientação posterior do proprietário. Ticket04 continua independente.

## 01 — Centralizar o painel de ação em um componente pai

**Bloqueado por:** nenhum.

**Entrega:** abrir, editar, salvar e fechar uma ação com o comportamento atual preservado, usando o novo pai para posição, exibição, comando de saída e guardas. Preparação anterior à mudança funcional, conforme a skill.

**Critérios de aceite:**

- Um único formulário reutilizado, sem cópia da implementação.
- Posicionamento controlado pelo pai; larguras distintas preservadas.
- Abertura por busca/cards/notificações/criação/duplicação preservada, assim como rascunhos e retorno de foco.
- Overlay, Escape e X passam pelo fechamento seguro; salvar não dispara mais de uma vez.
- Texto, arquivos, erro, conflito e IA continuam ligados à mesma instância durante suas atualizações.
- Testes dos componentes reais verificam comportamento antes/depois e os caminhos afetados. Conferência visual com uma ação e verificação de teclado.

## 02 — Abrir e trabalhar com uma segunda ação pela busca

**Bloqueado por:** 01 — Centralizar o painel de ação em um componente pai.

**Estado:** concluído localmente, com abertura validada pelo proprietário e ajuste de fechamento entregue; [resultado e limites](../audits/2026-10-27-two-action-tabs.md).

**Entrega:** abrir a segunda ação com Shift na busca, alternar entre duas por abas e trabalhar nas duas sem perda de estado. Esta etapa usa abas em todas as larguras; 03 acrescenta apresentação simultânea no desktop como evolução visual separada.

**Critérios de aceite:**

- No máximo duas instâncias completas do mesmo formulário, com identidade estável e estados independentes.
- Clique/Enter/Espaço comuns abrem/substituem principal. Shift+clique/Enter/Espaço nos resultados de ações abrem/substituem secundária; sem nenhuma aberta, abrem principal.
- Selecionar registro já aberto apenas foca o existente. Com apenas secundária aberta, abertura comum preenche principal e Shift substitui secundária.
- Demais entradas continuam comuns; sem abertura secundária fora da busca ou controles para ausência de teclado.
- Abas alternam a ação visível sem remontar a outra; abas internas permanecem completas.
- X fecha sua ação sem promoção da outra; secundária isolada permanece editável e sem marcador obrigatório de ação 2.
- Overlay e Escape fecham ambas pelo mesmo fluxo seguro, sem fechamento parcial quando uma guarda bloquear. Overlays internos preservam seu próprio Escape.
- Sem botão conjunto; X individuais fecham apenas sua própria ação.
- Salvar atinge apenas a ação em foco; troca de sessão limpa ambas e resultados antigos não interferem na identidade seguinte.
- Testes reais reproduzem a matriz de abertura, guardas, estado independente, salvamento e teclado; verificação visual da alternância, inclusive em tela estreita.

## 03 — Exibir duas ações lado a lado em desktop amplo

**Estado:** implementado localmente e verificado, aguardando avaliação do proprietário. Limiar estável1856px; larguras672px/896px; instâncias preservadas.

**Bloqueado por:** 02 — Abrir e trabalhar com uma segunda ação pela busca.

**Entrega:** aproveitar telas amplas para consultar/editar as duas ações simultaneamente, mantendo abas quando não houver espaço.

**Critérios de aceite:**

- Grupo ancorado à direita, principal à esquerda e secundária à direita; uma ação isolada permanece à direita.
- Larguras diferentes por aba preservadas. Limiar para lado a lado considera duas na maior largura e área utilizável; não depende da aba interna atualmente selecionada.
- Abaixo do limiar, inclusive em desktop, uma visível por vez com abas.
- Resize e mudança de aba interna preservam instâncias, texto, rolagem quando viável e ação ativa, sem remontagem ou gravações extras.
- Conteúdo e Legenda conservam imagem/texto utilizáveis em cada painel; conferir breakpoints internos pelo espaço disponível, sem reformulação adicional.
- Foco/atalhos e os dois caminhos de fechamento conjunto continuam corretos com ambas visíveis.
- Testes reais da transição e preservação de estado, mais verificação visual em combinações Essencial/Instagram/Observações, Conteúdo/Legenda e temas.

## 04 — Filtrar ações por parceiros dentro da busca

**Bloqueado por:** nenhum. Pode ser entregue com uma ação aberta; executar depois de 03 é organização do trabalho, não bloqueio técnico.

**Entrega:** buscar ações de todos, um ou vários parceiros sem sair da página atual, com filtro reiniciado em cada abertura.

**Critérios de aceite:**

- Filtro existe somente dentro da busca. Na abertura em página de parceiro, inicia com ele; nas demais páginas, sem seleção específica, buscando em todos os disponíveis.
- Fechar/reabrir reinicia o filtro pelo contexto atual, sem memória.
- Reutilizar o seletor de parceiros existente com suporte opcional a Todos os parceiros; seleção vazia representa todos, selecionar Todos limpa restrição e remover último selecionado volta a todos.
- Um/vários parceiros filtram ações de qualquer um dos selecionados, mantendo os limites de autorização existentes.
- Shift no seletor continua seleção exclusiva; Shift nos resultados de ações mantém a intenção secundária quando 02 estiver presente.
- Alterar filtro atualiza a consulta sem manter uma restrição escondida pelo parceiro da rota e sem alterar calendário, rota ou atribuição de parceiros.
- Consumidores atuais do seletor mantêm seus comportamentos. Regra de arquivadas, busca por título e demais limites atuais permanecem.
- Testes do seletor, busca e model reais com fronteira externa controlada verificam todos/um/vários, reset, ausência de vazamento para outros filtros e proteção contra resposta antiga após mudança de seleção.

## 05 — Criar ação pela busca e combinar rascunho com ação aberta

**Bloqueado por:** 02 — Abrir e trabalhar com uma segunda ação pela busca.

**Entrega:** comando Criar ação na busca global, sem retirar o atalho atual, com ativação comum na principal e Shift na secundária. Permitir rascunho principal + ação existente secundária e ação existente principal + rascunho secundário, com o mesmo limite de duas entradas, guardas e estado independente.

**Critérios de aceite:** comando disponível com busca vazia e pelo nome; fábrica/contexto de rascunho atuais; filtro da busca não atribui parceiros; nenhum INSERT apenas por abrir; confirmação mantém identidade/espaço e preserva a outra ação; testes reais de teclado, persistência, falha e fechamento. [Ticket completo](../../.scratch/action-tabs/issues/05-create-action-from-search.md).

## Verificação e encerramento por ticket

Cada ticket inclui seus testes e a atualização de CURRENT com resultado e limites reais. Executar format, lint, typecheck e build conforme AGENTS, além de verificações adicionais aplicáveis ao diff final. Atualizar contratos e galeria/KI se os componentes/fluxos modificados exigirem pelas regras do projeto. Não separar testes essenciais em um ticket futuro.

Os testes novos de comportamento devem exercer implementação real e demonstrar falha sem a mudança funcional correspondente. HTTP controlado não certifica banco/provedor. Nenhum ticket pede mudança de schema, persistência permanente, nova barra de busca ou deploy automático.

Tickets publicados localmente em 27/10/2026. Ticket 01 implementado e testado pelo proprietário, sem problema relatado: [resultado](../audits/2026-10-27-action-panel-parent.md). Ticket02 também implementado: [verificação](../audits/2026-10-27-two-action-tabs.md). Ticket03 implementado localmente; tickets05/04 não iniciados. Sem push/deploy.

O pedido do comando Criar ação foi registrado no ticket05, sem implementação. Visualização de uso da IA continua como ideia no TODO, sem ticket ou posição nesta sequência.

## Revisão após teste do proprietário

Abertura do ticket02 validada. Overlay confirmado; Escape dentro do Tiptap exige reprodução, pois fora do editor fecha normalmente. Ajuste solicitado: retirar CircleX da secundária e colocar X comum ao lado das abas externas, com title HTML “Fechar todas as ações”, visível com duas abertas. Manter abas externas/internas e X individuais; a última proposta substituiu a ideia inicial de fechar cada ação pela própria aba. Levantamento inicial seguido pelo ajuste de encerramento registrado abaixo.

Ticket03 ainda não iniciado: por isso não há lado a lado mesmo em tela ampla. Essa apresentação e o ajuste de fechamento são os próximos pontos destacados pelo proprietário; a sequência posterior definida é03→05→04, sem início automático.

Encerramento do02 autorizado: ajuste de fechamento implementado; Escape consumido pelo ProseMirror confirmado e preservado.68 testes pertinentes, format/lint/typecheck/build e navegador desktop/mobile com HTTP controlado passaram. Ticket03 é a próxima etapa indicada pelo proprietário;05 fica depois dele. Sem início do03 nesta rodada e sem publicação.

Decisão final do proprietário: botão de fechar todas removido, para não depender da barra externa ao chegar ao lado a lado. Somente Escape/overlay fazem fechamento conjunto; X individuais permanecem. Substitui orientações anteriores sobre CircleX ou X junto às abas. Remoção implementada localmente, sem iniciar ticket03.

Ticket03 verificado em28/10:438 testes, format/lint/typecheck/build e Chromium com HTTP controlado em390/1440/1855/1856/2560px passaram na cópia isolada do conteúdo selecionado para commit. Revisão do proprietário pendente. Sem push/deploy; próximos05 e04.
