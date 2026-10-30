# UZZINA — próximos trabalhos e ideias

## Verificação de uso

- [ ] Conferir durante a semana o app publicado: login/home, edição/data, preferências, IA, administração, portal/revisão, upload e Leads. Banco fase2 já conferido no catálogo; estado em [CURRENT](docs/audits/CURRENT.md).
- [ ] Executar o [roteiro Safari/telefone](docs/audits/2026-10-29-owner-validation-guide.md) e trazer os resultados em outro chat, conforme decisão do proprietário.
- [ ] Revisar avisos/defaults da plataforma no contexto do banco atual.

## Trabalhos registrados para depois

- [ ] [Controles de mídia sempre visíveis](.scratch/media-controls/issues/01-always-visible-media-controls.md): ticket preparado em29/10 para remoção/reordenação no gerenciador da UZZINA em desktop/mobile e por teclado. Não altera widget Cloudinary; implementação não iniciada.

- [ ] Escolher próximas correções do [levantamento de teclado concluído](docs/audits/2026-10-29-keyboard-focus-inventory.md): cinco grupos de achados com prioridade e critérios, sem implementação automática. Não repetir a revisão como pendência aberta.

- [ ] [Visualização do uso de IA](.scratch/ai-usage/issues/01-ai-usage-visibility.md): ticket existente atualizado em29/10/2026: visualização discreta dentro de Minha Conta, uma entrega completa para continuar em outro chat. Definir escopo, período, referência e permissões antes de implementar. Preservar quota técnica atual e não expor custos do provedor. [Especificação existente](docs/plans/2026-10-07-consumo-ia-por-agencia.md).

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
