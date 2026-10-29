# UZZINA — próximos trabalhos e ideias

## Verificação de uso

- [ ] Conferir durante a semana o app publicado: login/home, edição/data, preferências, IA, administração, portal/revisão, upload e Leads. Banco fase2 já conferido no catálogo; estado em [CURRENT](docs/audits/CURRENT.md).
- [ ] Completar validação em Safari/telefone e foco dos fluxos restantes.
- [ ] Revisar avisos/defaults da plataforma no contexto do banco atual.

## Trabalhos registrados para depois

- [ ] [Visualização do uso de IA](.scratch/ai-usage/issues/01-ai-usage-visibility.md): ticket criado em28/10/2026; definir escopo, período, referência, permissões e apresentação antes de implementar. Preservar quota técnica atual e não expor custos do provedor. [Especificação existente](docs/plans/2026-10-07-consumo-ia-por-agencia.md).

- [x] [Corrigir carregamento de Criar parceiro/Criar ação](.scratch/search-review/issues/01-fix-lazy-module-loading.md): correção local (inicialização duplicada/cache do Vite) testada e aprovada pelo proprietário em28/10.
- [x] [Criar data comemorativa por modal](.scratch/search-review/issues/02-create-celebration-dialog.md): aprovado pelo proprietário após revisão visual e commitado localmente em28/10; Gerenciar mantém a página atual.
- [x] [Implementar Ajuda e documentação](.scratch/search-review/issues/03-complete-help-page.md): implementado e commitado localmente em28/10 (311d102); aguarda avaliação do proprietário.
- [x] [Separar a página Hoje e rolar só o conteúdo](.scratch/today-viewport/issues/02-dedicated-today-page-scroll.md): aprovado pelo proprietário e commitado localmente em28/10.

- [ ] [Implementar a página de notificações](.scratch/notifications/issues/01-complete-notifications-page.md): rota ainda contém texto provisório; reaproveitar o fluxo do sino. Solicitado em28/10/2026 para execução posterior, sem início automático.

## Ideias para avaliar depois

- [ ] Avaliar transferência/unificação da conta de staging após estabilização, mantendo produção e testes separados.

## Sugestões de UX preservadas da auditoria original

Propostas para discussão no app existente; nenhuma está autorizada para implementação por constar aqui. Elas não são defeitos técnicos restantes nem plano de reescrita.

- Tornar mais visível o trabalho que exige decisão/prioridade na home, sem redesenhar tudo automaticamente.
- Avaliar redução de controles na superfície principal e agrupamento de preferências visuais em Exibição.
- Tornar navegação estável e esclarecer quando o seletor de parceiro navega ou filtra.
- Rever repetição de ações multiparceiro e densidade dos cards conforme o uso real.
- Diferenciar, quando fizer sentido, trabalho bloqueado e dependências do cliente; evitar campos obrigatórios sem necessidade.
- Avaliar aprovação formal vinculada à versão do conteúdo somente se houver demanda; hoje revisão não constitui esse processo.
- Melhorar identificação de briefing, entregáveis e audiência da conversa; avaliar assistência de IA contextual.
- Avaliar métricas que ajudem decisões de capacidade/risco e organização comercial de Leads, antes de adicionar dashboards/pipeline.
- Medir desempenho com volume/rede representativos e acompanhar falhas recorrentes antes de otimizar.

## Escolhas atuais a respeitar

Uma data de execução, Feito/Concluído distintos, responsáveis múltiplos e conclusão da ação inteira. Sprint/agrupamentos existentes permanecem até decisão específica. Sugestões antigas de segunda data ou responsável principal não viram tarefas automaticamente.

Conversas sobre nova versão, página única/abas e reescrita ficam fora deste TODO. Não foi criado documento de direção dessa versão.
