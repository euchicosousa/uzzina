# UZZINA — próximos trabalhos e ideias

## Verificação de uso

[Lista vigente de tickets abertos](docs/audits/2026-11-01-open-tickets.md), reconciliada após publicação permanente de estratégias em01/11.

Deploy de todas as entregas informado pelo proprietário em31/10; publicação deixa de ser pendência dessas entregas. Os aceites específicos continuam nos registros de CURRENT.

- [x] [Acesso ao portal local](.scratch/dash-local-auth/issues/01-canonical-local-origin.md): aprovado pelo proprietário em01/11 após remoção da regra de endereço, commit `a714b2d`. Login também aprovado pelo proprietário em01/11; implementação `08a0006` (push feito, ainda não publicada em produção).

- [ ] Conferir durante a semana o app publicado: login/home, edição/data, preferências, IA, administração, portal/revisão, upload e Leads. Banco fase2 já conferido no catálogo; estado em [CURRENT](docs/audits/CURRENT.md).
- [ ] Executar o [roteiro Safari/telefone](docs/audits/2026-10-29-owner-validation-guide.md) e trazer os resultados em outro chat, conforme decisão do proprietário.
- [ ] Revisar avisos/defaults da plataforma no contexto do banco atual.

## Trabalhos registrados para depois

- [x] [Estratégias07/09 permanentes](docs/audits/2026-11-01-strategy-permanent-rollout.md): código commitado/publicado Ready em01/11, SQL/segredo/agendamento assinados e heartbeat verificados; sem flags de ativação. Uso real escolhido pelo proprietário permanece separado dos testes controlados.

- [x] Mídia, rodapé16, identidade na IA e foco de Hoje aprovados pelo proprietário em01/11. Título permanece entregue no roteiro geral de uso, sem aceite específico novo inferido. [Fila remanescente](docs/audits/2026-11-01-open-tickets.md): Instagram paisagem/aviso de espaço e estudos posteriores de arraste/carrossel.


- [ ] [Correções do retorno mobile](.scratch/safari-mobile/README.md#correction-tickets-registered--2026-10-30):12/17 commitados em `ceafc6f`,13/18 em `4540ef6`;14/19 aceitos e commitados em `53508d2`. Header global e15 (abas compartilhadas) implementados/verificados e commitados em `566cbbe`; Header,12 e15 aprovados pelo proprietário em31/10; deploy informado pelo proprietário.16 rodapé implementado/verificado e commitado em `6019a80`, aprovado em01/11; Instagram retrato aprovado, paisagem permanece para avaliação de aviso de espaço. Aceites anteriores preservados.

- [ ] [Análise geral de estilo e simplificação](.scratch/visual-consistency/issues/01-app-style-analysis-and-simplification.md): novo ticket para inventário visual/técnico, menos padrões de botões/controles, espaçamento responsivo e proposta de consolidação. Rodadas1–3 entregues em [relatório](docs/audits/2026-10-31-style-analysis.md) (inventário, matriz em runtime com dados controlados, mockups, conformidade Prism/WCAG2.2 AA e sequência S0–S11; site de aprovação privado); aguarda decisões/autorização do proprietário. Não autoriza redesenho automático nem duplica os tickets de correção existentes.

- [x] [Controles de mídia sempre visíveis](.scratch/media-controls/issues/01-always-visible-media-controls.md): implementado/verificado localmente em31/10: remoção/alça/posição sempre visíveis, foco após exclusão e Escape do arraste. Deploy informado; aprovado pelo proprietário em01/11; widget Cloudinary preservado. Lentidão do arraste e gesto do carrossel registrados para estudo posterior.

- [x] [Correções de teclado K03/K04/K05](docs/audits/2026-10-29-keyboard-focus-inventory.md): K03 `a4eac79`,K04/K05 `3b4d2a4`, publicados Ready em01/11. Auditoria original concluída; demais aceites específicos constam da lista vigente.

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
