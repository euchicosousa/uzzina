# Central de tickets da UZZINA

Fotografia de 03/11/2026 sobre o checkout local em `b5b5f33`, com alterações de trabalho. A busca de issues abertas no GitHub retornou zero. Foram examinados 120 arquivos de tickets em 21 séries locais e os índices que também têm entradas sem arquivo próprio.

As quatro notas são estimativas de triagem em porcentagem. Conclusão mede o avanço até o aceite descrito. Urgência pesa impacto e dependências. Facilidade mede a simplicidade do trabalho restante. Delegação estima quanto desse trabalho um agente pode entregar quando os pré-requisitos estiverem disponíveis. Aceite pessoal reduz delegação mesmo em tarefas fáceis. As notas não representam benchmarks de modelos nem probabilidade medida.

Sol = Sol 6.1. Terra = Terra 6.1. São os dois modelos pedidos disponíveis para disparo direto neste chat. Os demais nomes indicados pelo proprietário podem receber o mesmo ticket por um executor externo.

|  Nº | ID e entrega                                                                                                                           | Conclusão | Urgência | Facilidade | Delegação | Agente direto  | Próximo passo e bloqueios                                                                                                                                     |
| --: | -------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | --------: | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | [T01 · Rastrear decisões D1–D6](../../.scratch/social-planning-recovery/issues/01-confirm-decisions.md)                                |       35% |      95% |        80% |       85% | Sol            | Começar agora. Vincular cada decisão à aprovação do proprietário e marcar quais dependências estão liberadas.                                                 |
| 2 | [T02 · Persistência por parceiro e conflito entre edições](../../.scratch/social-planning-recovery/issues/02-canonical-storage.md)     |       55% |      95% |        30% |       85% | Terra          | Após D1/D6. Modelo e rota usam Supabase. Executar em banco isolado com dois clientes, verificar RLS, conflito, reabertura e ausência de cópia local indevida. |
| 3 | [T03 · Datas, frequência, formatos e extras](../../.scratch/social-planning-recovery/issues/03-normalized-input.md)                    |       30% |      80% |        60% |       90% | Sol            | Após D2–D4. Exercitar data impossível e soma manual com extras pelo formulário e pelo cálculo compartilhado.                                                  |
| 4 | [T04 · Separar proposta aberta de configuração nova](../../.scratch/social-planning-recovery/issues/04-workspace-state.md)             |       25% |      75% |        55% |       90% | Terra          | Após T02/D6. Trocar marca e proposta com edição ou resposta em voo sem misturar estado.                                                                       |
| 5 | [T05 · Preservar edição até confirmação](../../.scratch/social-planning-recovery/issues/05-editor-confirmation.md)                     |       30% |      70% |        65% |       85% | Sol            | Após T02/T04. Falhar ao salvar, manter o texto e recuperar foco e teclado do diálogo.                                                                         |
| 6 | [T06 · Usar o calendário existente na revisão](../../.scratch/social-planning-recovery/issues/06-shared-calendar.md)                   |       15% |      60% |        40% |       75% | Terra          | Após T02/T04/T05. Substituir grade paralela e mover sugestão sem criar ação. Conferir rolagem no navegador.                                                   |
| 7 | [T07 · Gerar por tema com IA e recuperar falhas](../../.scratch/social-planning-recovery/issues/07-real-theme-ai.md)                   |       10% |      80% |        25% |       80% | Terra          | Após T02/D6. Demonstrar handler, autorização, quota e persistência com provedor controlado e retry sem segunda geração.                                       |
| 8 | [T08 · Gerar por período com IA](../../.scratch/social-planning-recovery/issues/08-real-period-ai.md)                                  |       15% |      65% |        40% |       85% | Terra          | Após T03/T07. Comparar slots, formatos e extras pedidos com os persistidos.                                                                                   |
| 9 | [T09 · Finalizar aprovadas em uma transação](../../.scratch/social-planning-recovery/issues/09-transactional-finalization.md)          |       10% |      95% |        20% |       85% | Terra          | Após T02/D5. Forçar falha na segunda criação e repetir por duas conexões. Exigir zero criação parcial ou duplicada.                                           |
| 10 | [T10 · Confirmar finalização e atualizar a Mesa](../../.scratch/social-planning-recovery/issues/10-finalization-ui.md)                 |       20% |      75% |        45% |       85% | Sol            | Após T04/T05/T09. Perder resposta após gravação, reabrir e reconciliar IDs, estado e lista.                                                                   |
| 11 | [T11 · Aceite independente do Planejamento](../../.scratch/social-planning-recovery/issues/11-independent-acceptance.md)               |        0% |      85% |        35% |       70% | Terra          | Último. Revisor diferente do implementador reexecuta R1–R11 e separa prova de banco, provedor e visual.                                                       |
| 12 | [P00 · Fidelidade da Mesa ao mockup](../../.scratch/social-planning/issues/00-align-page-with-approved-mockup.md)                      |       85% |      35% |        90% |       25% | Sol            | Residual da série original. Há aprovação parcial de layout. Conferir se o aceite visual integral já foi dado e anexar a T11.                                  |
| 13 | [P08 · Instruções reutilizáveis por marca](../../.scratch/social-planning/issues/08-brand-planning-instructions.md)                    |       30% |      60% |        55% |       85% | Sol            | Coluna registrada em produção. Fechar leitura, edição autorizada, troca de marca e uso pelo gerador em coordenação com T07/T08.                               |
| 14 | [V12 · Filtros no campo de busca global](../../.scratch/visual-controls/issues/12-global-search-filters.md)                            |       20% |      65% |        80% |       95% | Sol            | Decisões registradas. Implementar parceiros e arquivadas no sufixo, conferir teclado e escopo. Claude consta como executor. Confirmar posse antes de editar.  |
| 15 | [F01 · Classificar feriados](../../.scratch/brand-holidays/issues/01-classify-holidays.md)                                             |       85% |      50% |        80% |       40% | Sol            | Campo confirmado em produção e UI local. Validar criar, reabrir e reconhecer o feriado na lista e no calendário.                                              |
| 16 | [F02 · Selecionar feriados por marca](../../.scratch/brand-holidays/issues/02-partner-holidays.md)                                     |       70% |      70% |        55% |       70% | Terra          | Registros divergem sobre tabela e RPC remotas. Conferir catálogo em leitura antes de qualquer SQL. Validar isolamento entre marcas e retry.                   |
| 17 | [IA01 · Consumo de IA em Minha Conta](../../.scratch/ai-usage/issues/01-ai-usage-visibility.md)                                        |       75% |      55% |        50% |       75% | Terra          | Visual aceito segundo CURRENT. Confirmar migration, permissões e agregação mensal com registro real controlado, inclusive duplicidade.                        |
| 18 | [V35 · Microseções no menu lateral da galeria](../../.scratch/visual-controls/issues/35-ui-sidebar-subsections.md) | 90% | 35% | 90% | 25% | Sol | Primeiro clique corrigido após reprodução no Comet e histórico real; aguarda aceite final. |
| 19 | [V36 · Estudo dos wrappers de avatar](../../.scratch/visual-controls/issues/36-avatar-wrapper-comparison-study.md) | 0% | 25% | 75% | 90% | Sol | Comparar recursos, consumidores e responsabilidades. Entrega somente de estudo. |
| 20 | [V41 · Padronizar nomes com prefixo U](../../.scratch/visual-controls/issues/41-standardize-uzzina-component-names.md) | 0% | 40% | 55% | 85% | Gemini | Liberado: V38/V40/V43 concluídos em d7efe5f; renomeação ainda pendente. |

## Mudanças desde a primeira triagem

A fila vigente tem **20 tickets abertos**. Na série visual, permanecem V12, V35 (aceite final), V36 (estudo) e V41 (renomeação). As entregas encerradas foram retiradas da fila acima. O [índice atualizado](../../.scratch/visual-controls/README.md) detalha finalidade, conclusão e commits; os registros das rodadas abaixo preservam o histórico.

## Verificação solicitada pelo proprietário — 03/11/2026

Base Git `b5b5f33` com ajustes locais do proprietário. V05 aprovado explicitamente nesta conversa. A conferência do código confirma largura automática e mínimo 48px no gatilho grande, acomodando avatares de 32px, com `gap-px` e `p-2` na faixa. O aceite visual de todos os tamanhos foi fornecido pelo proprietário.

| Verificação executada                                                                                          | Resultado                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run typecheck`                                                                                            | Aprovado, zero erros.                                                                                                                                                 |
| `bun run test:serverless`                                                                                      | 9 PASS.                                                                                                                                                               |
| `bunx biome lint` nos quatro arquivos do gatilho, Parceiros, Sprint e rodapé                                   | Aprovado.                                                                                                                                                             |
| `bun test tests/combobox-trigger.test.tsx tests/combobox-shift.test.tsx tests/global-search-partners.test.tsx` | 88 PASS, zero falhas.                                                                                                                                                 |
| `scripts/check-footer-controls-browser.cjs` com Chromium e servidor de fixtures isolado em 5187                | 27 grupos PASS, larguras 390/844/1600, claro/escuro. Inclui geometria, avatares contidos, seleção/Shift, desabilitado, faixa rolável e independência de dois rodapés. |
| `bun test` completo                                                                                            | 781 PASS, 26 falhas e 1 erro, 807 testes em 67 arquivos.                                                                                                              |
| Reexecução isolada de `tests/local-portal-origin.test.ts` com porta local permitida                            | 11 PASS. As 11 falhas desse arquivo e o erro de inicialização da rodada geral foram causados pela impossibilidade de abrir a porta.                                   |

Restam **15 falhas da execução geral para diagnóstico**, distribuídas em navegação de notificações (1), altura do calendário da Home (1), preferências do perfil (2), gaveta (10) e fallback de fonte (1). A lista abaixo preserva os casos exatos. O conjunto completo continua sem aprovação automática. Essas falhas demandam distinguir expectativas antigas, interferência entre mocks e regressões reais antes de abrir tickets de correção.

O teste de navegador inicialmente procurava `data-strip-fade`, elemento substituído pela máscara CSS. Foi atualizado para verificar a máscara após rolagem e também a contenção dos avatares grandes. A nova execução passou. Arquivo alterado nesta rodada além dos registros de status, `scripts/check-footer-controls-browser.cjs`.

Ensaios controlados com fixtures e respostas substituídas. SQL remoto, provedor real de IA e deploy não foram verificados nesta rodada. Os testes de navegador executam componentes reais com dados fictícios e requisições externas bloqueadas. Logs locais em `/tmp/uzzina-ticket-tests.log`, `/tmp/uzzina-ticket-browser-final.log`, `/tmp/uzzina-ticket-selectors.log`, `/tmp/uzzina-ticket-portal-recheck.log` e `/tmp/uzzina-ticket-serverless.log`.

Casos pendentes da suíte geral

- `tests/notifications-navigation.test.tsx` — AI processing blocks leaving and keeps the action and route
- `tests/home-calendar-height.test.tsx` — starts the week limited and month automatic, preserving each user choice
- `tests/profile-palette-swatches.test.tsx` — selecting a palette previews it without writing until the manual save
- `tests/profile-palette-swatches.test.tsx` — uses real mobile section tabs while preference choices remain radios
- `tests/drawer-component.test.tsx` — phone-width action panel > collapses metadata to the date and an expand control without visible labels
- `tests/drawer-component.test.tsx` — phone-width action panel > shows the file indicator only when work attachments exist
- `tests/drawer-component.test.tsx` — phone-width action panel > edge fades follow the strip scroll position
- `tests/drawer-component.test.tsx` — phone-width action panel > keyboard focus brings an offscreen strip control into view
- `tests/drawer-component.test.tsx` — phone-width action panel > the Essencial Tab order is unchanged on a phone-width panel
- `tests/drawer-component.test.tsx` — the main drawer sequence skips auxiliary controls in both directions
- `tests/drawer-component.test.tsx` — social actions include color before save and skip sprint and destructive commands
- `tests/drawer-component.test.tsx` — the date calendar and time segments keep their own Tab navigation
- `tests/drawer-component.test.tsx` — the panel owns width changes without remounting the form
- `tests/drawer-component.test.tsx` — edits made during INSERT survive its response and reach UPDATE
- `tests/font-loading.test.ts` — brand web font in the production build > system sans fallback stays after the brand family

## Encaminhamento por agente

| Executor sugerido          | Escopo proposto                                                                |
| -------------------------- | ------------------------------------------------------------------------------ |
| Sol 6.1                    | V12, T03, T05 e T10. Alterações delimitadas de interface, cálculo e estado.    |
| Terra 6.1                  | T02, T07 e T09. Banco, concorrência e recuperação após falha.                  |
| Gemini 3.8 Flash, externo  | Conferir inventário da V14 e levantar divergências de ícones com captura.      |
| Claude Opus 5.5, externo   | Revisão independente de autorização e atomicidade em T02/T09 ou auditoria T11. |
| Claude Sonnet 5.5, externo | Implementar V12 se for o executor Claude já designado, ou T05 após liberação.  |
| Claude Haiku 5.5, externo  | Organizar evidências e preparar roteiro de aceite de V14/V15/V17/V18.          |

A distribuição externa é uma sugestão por escopo. Acesso e desempenho dessas versões não foram verificados. Para delegar, indicar ID, executor e entrega esperada. Um escritor por checkout. Cada retorno deve incluir o que mudou, prova executada, pendências e se houve alteração remota.

## Reconciliação e cobertura

A série de recuperação é a fila funcional vigente. Os tickets originais P01–P07 e C00–C10 ficam como rastreabilidade. P00 e P08 aparecem como resíduos explícitos para preservar o aceite visual e a integração por marca. O teste atual de T02 implementa createMockSupabase em memória. Os cinco casos registrados comprovam apenas o comportamento simulado. [Contrato e dependências](../../.scratch/social-planning-recovery/README.md) · [Teste existente](../../tests/social-planning-recovery/02-persistence.test.ts)

O índice específico do Prism registra V01, V09 e V11 aprovados e V08 removido. Os demais aprovados são V02–V04, V06–V07 e V10. A lista extensa de componentes é um inventário de trabalho, sem um ticket novo por linha. A série anterior de consistência visual foi suspensa após a reversão da rodada. [Índice Prism](../../.scratch/visual-controls/README.md) · [Inventário](../plans/visual-controls-where.md)

Senha, aviso de paisagem (Safari 03/20), carrossel e foco em lote tiveram atualização de aceite posterior à lista de 01/11. O proprietário validou a correção da lentidão ao digitar na gaveta e encerrou o item, acompanhado fora da contagem de tickets. O atraso ao soltar mídia continua como relato para investigação, sem ticket próprio. [Histórico](CURRENT.md)

Séries inspecionadas e quantidade de arquivos

- account-preferences (2)
- action-save-recovery (1)
- action-tabs (5)
- ai-partner-identity (1)
- ai-usage (1)
- brand-holidays (2)
- calendar-height (3)
- dash-local-auth (1)
- keyboard-focus (3)
- media-controls (1)
- notifications (1)
- partner-portal (1)
- safari-mobile (20)
- search-review (3)
- social-planning (9)
- social-planning-corrections (11)
- social-planning-recovery (11)
- today-focus (1)
- today-viewport (2)
- visual-consistency (11)
- visual-controls (30)

## Revisão por capturas — 03/11/2026

O proprietário aprovou os demais componentes apresentados. V14, V15 e V17 encerrados em 100%. V18 mantém seis pontos em investigação por subagentes: decoração do Alert sobre ação outline, cantos do ButtonGroup vertical, tom dos placeholders, crash ao adicionar chip no Combobox, apresentação de Tabs e uso de PrismButton no Toaster. A aprovação se refere aos componentes apresentados, preservando V19–V34 que continuam sem entrega registrada.

Nesta rodada, investigação de código e atualização documental. O resultado ainda exige implementação e verificação dos seis pontos.

Achados dos subagentes: Alert tem decoração absoluta sobre botão transparente; ButtonGroup aplica raios laterais mesmo na orientação vertical; placeholders reutilizam a cor global de texto secundário; o crash vem do contexto de coleção do React Aria ao montar Tag; Tabs da captura é a variante drawer com caixa extra na galeria, enquanto a gaveta real usa underline; Sonner aceita PrismButton como action ReactNode. A causa interna do contexto de chips ainda requer reprodução isolada. Sugestões preservadas para a próxima implementação.

## Correções dos seis casos — 03/11/2026

Aplicadas após autorização do proprietário. Alert desloca a decoração para a esquerda quando há ação à direita. ButtonGroup calcula cantos externos pela orientação. Placeholders usam foreground/50 em campos, seletores, busca e editor. A galeria de chips usa multisseleção nativa, coleção dinâmica completa e PrismComboboxChipList. O erro original foi reproduzido no Chromium com os mesmos dados fictícios, e o fluxo corrigido passou ao adicionar múltiplos itens, remover pelo botão e apagar por Backspace. Dados reais não são necessários para esse fluxo e nenhum consumidor operacional usa atualmente os chips Prism.

A variante drawer de Tabs foi preservada. A linha inferior agora pertence às abas inativas, sem a linha contínua do contêiner atravessar a selecionada. Underline mantém a linha do contêiner. O exemplo de toaster usa PrismButton outline sm como ação e fecha somente seu toast.

Verificação controlada em Chromium com componentes reais e requisições externas bloqueadas. Alert com decoração no lado oposto e grupo vertical com cantos internos zerados confirmados por medidas. Testes de abas/seletores 36 PASS. Tipagem conferida. Aceite visual dos seis ajustes permanece pendente. Sem SQL ou deploy nesta rodada.

## Aceite dos ajustes e alinhamento do toaster — 03/11/2026

Proprietário encerrou Alert, ButtonGroup vertical, placeholders, chips e Tabs. A ação do toaster recebeu margem automática à esquerda para ocupar o extremo direito da notificação, preservando o espaço interno. V18 aguarda somente a conferência desse último alinhamento. Alteração visual local, diff conferido.

## Encerramento e commit da rodada visual — 03/11/2026

V18 encerrado em 100% após a conclusão das seis correções e autorização do proprietário para fechar os tickets finalizados e fazer commit. Botão do toaster alinhado ao extremo direito. V05, V14, V15 e V17 também encerrados. Fila atual com 33 tickets abertos. Alterações da galeria, primitivos, rodapé aprovado e registros desta rodada integram o commit local. Trabalho em andamento de Planejamento permanece separado. As 15 falhas gerais já documentadas continuam como pendência de diagnóstico.

## Novo ticket — 04/11/2026

V35 criado com duas partes. Parte 1 mostra links das microseções apenas sob a seção selecionada. Parte 2 reserva a animação para avaliação posterior. Fila vigente com 34 tickets abertos. Somente documentação nesta rodada.

## Estudo de avatares — 04/11/2026

Criado V36 para comparar PrismAvatar/PrismAvatarGroup com UAvatar/UAvatarGroup, identificando regras próprias e duplicações. Sem autorização de refatoração nesta entrega. Fila vigente com 35 tickets abertos.

## Revisão independente V19–V34 — 04/11/2026

[Resultado e correções](2026-11-04-ui-tickets-19-34-review.md). Somente V19–V24 foram encontrados, com ensaio básico de navegador aprovado e pequenos ajustes de formatação/lint/contrato pendentes. V25–V34 sem entrega no checkout. Estados de conclusão nesta revisão não equivalem a aceite visual.

## V19–V24 encerrados — 04/11/2026

Os seis tickets foram corrigidos por subagente e validados pelo coordenador a pedido do proprietário. Conclusão 100%, conforme [revisão atualizada](2026-11-04-ui-tickets-19-34-review.md). Fila vigente com 29 abertos; V25–V34 continuam pendentes.

## Revisão V25–V34 — 04/11/2026

[Entregas e pendências verificadas](2026-11-04-ui-tickets-25-34-review.md). Dez seções presentes. Lint/typecheck aprovados, nove arquivos com formatação pendente e overflow em V34 a 375px. V31 pode seguir para aceite visual. Nenhum encerramento nesta revisão.

## Ajustes e aceite visual — 04/11/2026

V25–V34 com formatação corrigida e overflow do título V34 resolvido no cabeçalho da galeria. Confirmação controlada no navegador sem erros. [Lista de verificação visual](2026-11-04-ui-visual-acceptance-checklist.md). Tickets 30/32/34 reconciliados com os buffers do editor, mantendo os relatos e a revisão.

## Aceites e estudos — 04/11/2026

Aceite visual de V21/V24/V30/V32 registrado e OK aplicado na galeria/menu. V33/V31/V34 permanecem em estudo de revisão conforme [parecer dos subagentes](2026-11-04-color-and-celebration-studies.md). Propostas ainda sem implementação.

## Novos aceites e estudos de consolidação — 04/11/2026

V27/V28/V29 e RichTextEditor aprovados visualmente. Padrão compacto do editor aplicado. [Estudos de Sprint, nomes, loaders e ToggleInput](2026-11-04-component-consolidation-studies.md) disponíveis para decisão.

Fila numerada após registrar os aceites de V27/V28/V29/V30/V32: 24 itens abertos.

## V37–V39 criados — 04/11/2026

Tickets dos estudos de cores, paleta e seletor de datas, destinados ao Gemini. PhaseIcon preservado por decisão do proprietário. Fila vigente com 27 itens.

## V40–V43 criados — 04/11/2026

Quatro tickets de consolidação para Gemini. V41 aguarda V38/V40/V43 para renomear a estrutura final. V40/V42/V43 podem iniciar independentemente, respeitando um escritor por checkout. Fila vigente com 31 itens.

## Revisão calma do V39 — 04/11/2026

[Achados verificados](2026-11-04-v37-v39-independent-review.md). V39 sem implementação; V37/V38 presentes, com ressalvas em validação e cobertura. Ticket V39 recebeu critérios complementares de foco, vazio de filtro e saving.

## V35 e V39 — 04/11/2026

Animação de submenu retirada do V35; [flicker estudado](2026-11-04-v35-selection-flicker-study.md), correção ainda pendente. V39 implementado com tamanhos padrão e verificado no navegador, aguardando aceite visual.

## V35 corrigido e V39 revisado por subagentes leves — 04/11/2026

V35 corrigido e validado no Chromium, incluindo seleção estável, hash e scroll manual. V39 aprovado tecnicamente em segunda revisão independente. Tickets/índice/CURRENT alinhados; ambos aguardam aceite visual. Sem commit/publicação.

## Refinamentos V35/V39 — 04/11/2026

Pai navega ao primeiro filho; seletor com Tabs, badges, borda superior no cabeçalho, aviso Feriado por mês e títulos truncados. Ambos conferidos no Chromium e aguardam aceite visual. Detalhes nos respectivos tickets.

## Aceite V39 e ajuste V35 — 04/11/2026

V39 aprovado pelo proprietário, retirado da fila aberta. V35 reforçado e testado medindo posição real do conteúdo no primeiro clique; aguarda confirmação do proprietário.

## V35 — conflito de rolagem identificado — 04/11/2026

Falha reproduzida no Comet e no histórico real: rolagem automática de hash do roteador cancelava a rolagem do menu. Corrigido pela navegação com controle explícito de rolagem. Primeiro clique confirmado na página do proprietário; regressão permanente usa histórico real e mede deslocamento. Aceite final ainda pendente. Ensaios anteriores em memória não reproduziam esse conflito.

## Consolidação de tickets e commits — 04/11/2026

Rodada visual versionada em `d7efe5f`; entregas anteriores em `b5b5f33`/`ce1230b` e ajuste de direções do Sheet em `8d80249`. V19–V34 e V37–V40/V42/V43 concluídos conforme registros atuais da série. V35 corrigido e commitado, aguardando aceite final; V36 sem parecer entregue; V41 sem migração entregue, com dependências liberadas. V12 preservado pendente conforme seu ticket. Atualizados os resumos individuais e a coluna de commits no índice. A presença de um ticket no commit não comprova implementação. Nenhum push/deploy verificado nesta atualização documental.
