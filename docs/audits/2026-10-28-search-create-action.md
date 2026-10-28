# Criar ação pela busca — ticket05

## Resultado local

Autorizado em28/10/2026 após aprovação e encerramento do ticket04. A busca global oferece Criar ação no grupo Comandos, disponível com texto vazio ou pelo nome. Clique/Enter/Espaço abrem rascunho na principal; Shift solicita secundária pelo mesmo controlador existente. Sem ações abertas, o controlador usa a principal. Cada abertura usa createActionDraft e resolveDraftPartners, com identidade atual, rota e filtros operacionais. A seleção de parceiros da busca permanece apenas um filtro de resultados.

A criação não faz INSERT ao abrir: persistência, guardas, limites, identidade após confirmação e fechamento continuam nos formulários/controlador existentes. O atalho Cmd/Ctrl+Alt+A permanece inalterado. Espaço continua texto antes da navegação pelas setas; portais internos mantêm seu teclado. Nenhuma nova barra, atalho ou componente de design system.

## Verificação

Cinco testes do comando real falharam antes da implementação por ausência do item; passaram depois. Testes adicionais verificam ativação comum/Shift, contexto independente do filtro, ausência de HTTP ao abrir, substituição bloqueada e Espaço como texto. Nos formulários/controlador reais: rascunho secundário com ação existente, rascunho principal com resultado secundário, criação com painéis vazios, duas identidades distintas e falha ao substituir secundária. Fronteira Auth simulada do teste passou a fornecer getUser, necessário à fábrica real sem user_id antes da persistência.

Suite completa:466 testes em43 arquivos,1607 assertions, sem falhas. Format/format:check/lint/typecheck/build passaram; permanece o aviso conhecido de chunks acima de500kB.

Chromium1440px/390px com aplicativo e SDK reais, respostas HTTP controladas e snapshot isolado conferiu comando por nome/Shift+Espaço, criação normal pelo menu, atalho preservado, ausência de INSERT ao abrir, criação confirmada com uma única escrita e identidade estável. A mesma jornada cobre filtros, temas, ações existentes, resize, salvamento por painel, fechamento e sessão. Ambas as larguras passaram, incluindo claro/escuro e a jornada completa com duas ações.

## Limites

Sem SQL, consulta/escrita real, geração de IA, upload, commit, push ou deploy. HTTP controlado certifica a interface e os contratos locais, não o banco/provedor. Alterações paralelas de Hoje/Kanban foram preservadas. Ticket05 aguarda avaliação do proprietário.

## Ordem dos comandos e levantamento posterior

A pedido do proprietário, grupo Comandos movido para depois dos resultados de parceiros/ações, antes dos filtros. Shift preservado. Conferidos HeaderMenu, AdminGuard, destinos de cadastros/perfil e modos de tema para o [levantamento de candidatos](../plans/global-search-command-candidates.md); novos comandos são apenas proposta, sem implementação. Verificações desta rodada registradas em CURRENT.

## Todos os comandos autorizados

Na rodada seguinte ao levantamento, o proprietário autorizou a implementação integral. Comandos agora incluem Minha conta, tema claro/escuro/sistema, início/Hoje/notificações/leads/ajuda e Sair. Administração aparece somente para person.admin, com criar/gerenciar parceiros, clientes, usuários e datas comemorativas; destinos existentes preservam AdminGuard e autorização de servidor/banco. Data comemorativa usa a página existente com formulário e lista.

GlobalSearchCommand mantém usePreferencePersistence no wrapper, que permanece montado ao fechar o conteúdo. Troca de tema não altera paleta. Falha preserva patch e oferece Tentar salvar preferências na abertura seguinte. Navegação e Sair validam closeAllActions; bloqueio preserva ambas as ações e a busca. onBeforeLeave da rota confere geração de identidade antes/depois das guardas. Execução de comando tem proteção contra repetição e ignora conclusão de conteúdo desmontado. Erro de logout permite nova tentativa.

Testes reais cobrem todos os destinos, ausência de comandos administrativos para membro comum, persistência depois do fechamento, retry de tema, Shift/Espaço na navegação, logout/falha/retry e guardas das duas gavetas. Como controle negativo, retirar a renderização dos novos comandos fez o teste de Minha conta falhar; renderização restaurada antes dos testes finais. Suite completa:491 testes/1711 assertions em43 arquivos, sem falhas (timeout15s para testes de integração mais pesados). Format/format:check/lint/typecheck/build passaram; aviso conhecido de chunks permanece. Chromium1440px/390px com HTTP controlado conferiu conta, destino de cadastro, três temas persistidos e logout pela busca, além da jornada completa das duas ações. Capturas da lista em ambas as larguras inspecionadas. Sem banco/provedor real, SQL, commit ou publicação.

Revisão do roadmap:01-04 concluídos/validados;05 implementado e verificado, com avaliação do proprietário pendente desta ampliação. Sem outro ticket funcional restante na sequência. Commit de04/05 e publicação não foram solicitados. Visualização do uso de IA permanece registro futuro, sem implementação automática.
