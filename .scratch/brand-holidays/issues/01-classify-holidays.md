# 01: Marcar datas comemorativas como feriado

**What to build:** administradores informam se uma data comemorativa é feriado ao criar/editar; a escolha persiste no Supabase e é indicada na lista e no calendário existente.

**Blocked by:** None (can start immediately).

**Status:** implemented-locally — banco e interface concluídos localmente; aguarda validação visual do proprietário.

- [x] Campo `is_holiday` boolean obrigatório com default false aplicado em produção; registros antigos desmarcados sem inferir pelo título.
- [x] Preservar dados, policies e grants existentes; catálogo/default/contagens/hash e leitura com identidades reais verificados. Escrita de fixtures e autorização negativa verificadas somente em PostgreSQL isolado.
- [x] Propagar campo aos tipos, models e leituras do aplicativo, sem consultas diretas novas em componentes/rotas; preservar cache por identidade e dados canônicos.
- [x] Oferecer checkbox Prism “É feriado” na criação administrativa, criação pela busca e edição. Novo cadastro desmarcado; edição carrega valor persistido e permite alternar.
- [x] Preservar campos em falha, cancelamento sem escrita, guardas de sessão/montagem e bloqueio durante envio. Após salvar/reabrir, valor confirmado permanece.
- [x] Indicar “Feriado” na lista e calendário compartilhado, com texto acessível mesmo quando truncado, sem depender de cor.
- [x] Preservar título/data/exclusão/ordenação/layout/rolagem e teclado. Caso a relação do ticket02 já esteja aplicada, traduzir a recusa `23503` ao desclassificar feriado vinculado, orientando remover associações primeiro.
- [x] Validar visualmente os dois pontos de criação, edição/reabertura, lista/calendário, teclado e largura estreita; checks proporcionais ao risco, build se publicar.
- [x] Atualizar documentação/status após integrar e distinguir frontend local de deploy Ready.

Não inclui calendário oficial, abrangência/localidade, recorrência, importação automática ou alterações na geração de Planejamento. O banco já está aplicado; não reaplicar o histórico de migrations para continuar a interface.
