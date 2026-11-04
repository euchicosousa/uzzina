# Central de tickets da UZZINA

Fotografia de 03/11/2026 sobre o checkout local em `b5b5f33`, com alterações de trabalho. A busca de issues abertas no GitHub retornou zero. Foram examinados 120 arquivos de tickets em 21 séries locais e os índices que também têm entradas sem arquivo próprio.

As quatro notas são estimativas de triagem em porcentagem. Conclusão mede o avanço até o aceite descrito. Urgência pesa impacto e dependências. Facilidade mede a simplicidade do trabalho restante. Delegação estima quanto desse trabalho um agente pode entregar quando os pré-requisitos estiverem disponíveis. Aceite pessoal reduz delegação mesmo em tarefas fáceis. As notas não representam benchmarks de modelos nem probabilidade medida.

Sol = Sol 6.1. Terra = Terra 6.1. São os dois modelos pedidos disponíveis para disparo direto neste chat. Os demais nomes indicados pelo proprietário podem receber o mesmo ticket por um executor externo.

|  Nº | ID e entrega                                                                                                                                   | Conclusão | Urgência | Facilidade | Delegação | Agente direto  | Próximo passo e bloqueios                                                                                                                                     |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | --------: | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | [T01 · Rastrear decisões D1–D6](../../.scratch/social-planning-recovery/issues/01-confirm-decisions.md)                                        |       35% |      95% |        80% |       85% | Sol            | Começar agora. Vincular cada decisão à aprovação do proprietário e marcar quais dependências estão liberadas.                                                 |
| 2 | [T02 · Persistência por parceiro e conflito entre edições](../../.scratch/social-planning-recovery/issues/02-canonical-storage.md)             |       55% |      95% |        30% |       85% | Terra          | Após D1/D6. Modelo e rota usam Supabase. Executar em banco isolado com dois clientes, verificar RLS, conflito, reabertura e ausência de cópia local indevida. |
| 3 | [T03 · Datas, frequência, formatos e extras](../../.scratch/social-planning-recovery/issues/03-normalized-input.md)                            |       30% |      80% |        60% |       90% | Sol            | Após D2–D4. Exercitar data impossível e soma manual com extras pelo formulário e pelo cálculo compartilhado.                                                  |
| 4 | [T04 · Separar proposta aberta de configuração nova](../../.scratch/social-planning-recovery/issues/04-workspace-state.md)                     |       25% |      75% |        55% |       90% | Terra          | Após T02/D6. Trocar marca e proposta com edição ou resposta em voo sem misturar estado.                                                                       |
| 5 | [T05 · Preservar edição até confirmação](../../.scratch/social-planning-recovery/issues/05-editor-confirmation.md)                             |       30% |      70% |        65% |       85% | Sol            | Após T02/T04. Falhar ao salvar, manter o texto e recuperar foco e teclado do diálogo.                                                                         |
| 6 | [T06 · Usar o calendário existente na revisão](../../.scratch/social-planning-recovery/issues/06-shared-calendar.md)                           |       15% |      60% |        40% |       75% | Terra          | Após T02/T04/T05. Substituir grade paralela e mover sugestão sem criar ação. Conferir rolagem no navegador.                                                   |
| 7 | [T07 · Gerar por tema com IA e recuperar falhas](../../.scratch/social-planning-recovery/issues/07-real-theme-ai.md)                           |       10% |      80% |        25% |       80% | Terra          | Após T02/D6. Demonstrar handler, autorização, quota e persistência com provedor controlado e retry sem segunda geração.                                       |
| 8 | [T08 · Gerar por período com IA](../../.scratch/social-planning-recovery/issues/08-real-period-ai.md)                                          |       15% |      65% |        40% |       85% | Terra          | Após T03/T07. Comparar slots, formatos e extras pedidos com os persistidos.                                                                                   |
| 9 | [T09 · Finalizar aprovadas em uma transação](../../.scratch/social-planning-recovery/issues/09-transactional-finalization.md)                  |       10% |      95% |        20% |       85% | Terra          | Após T02/D5. Forçar falha na segunda criação e repetir por duas conexões. Exigir zero criação parcial ou duplicada.                                           |
| 10 | [T10 · Confirmar finalização e atualizar a Mesa](../../.scratch/social-planning-recovery/issues/10-finalization-ui.md)                         |       20% |      75% |        45% |       85% | Sol            | Após T04/T05/T09. Perder resposta após gravação, reabrir e reconciliar IDs, estado e lista.                                                                   |
| 11 | [T11 · Aceite independente do Planejamento](../../.scratch/social-planning-recovery/issues/11-independent-acceptance.md)                       |        0% |      85% |        35% |       70% | Terra          | Último. Revisor diferente do implementador reexecuta R1–R11 e separa prova de banco, provedor e visual.                                                       |
| 12 | [P00 · Fidelidade da Mesa ao mockup](../../.scratch/social-planning/issues/00-align-page-with-approved-mockup.md)                              |       85% |      35% |        90% |       25% | Sol            | Residual da série original. Há aprovação parcial de layout. Conferir se o aceite visual integral já foi dado e anexar a T11.                                  |
| 13 | [P08 · Instruções reutilizáveis por marca](../../.scratch/social-planning/issues/08-brand-planning-instructions.md)                            |       30% |      60% |        55% |       85% | Sol            | Coluna registrada em produção. Fechar leitura, edição autorizada, troca de marca e uso pelo gerador em coordenação com T07/T08.                               |
| 14 | [V12 · Filtros no campo de busca global](../../.scratch/visual-controls/issues/12-global-search-filters.md)                                    |       20% |      65% |        80% |       95% | Sol            | Decisões registradas. Implementar parceiros e arquivadas no sufixo, conferir teclado e escopo. Claude consta como executor. Confirmar posse antes de editar.  |
| 15 | [F01 · Classificar feriados](../../.scratch/brand-holidays/issues/01-classify-holidays.md)                                                     |       85% |      50% |        80% |       40% | Sol            | Campo confirmado em produção e UI local. Validar criar, reabrir e reconhecer o feriado na lista e no calendário.                                              |
| 16 | [F02 · Selecionar feriados por marca](../../.scratch/brand-holidays/issues/02-partner-holidays.md)                                             |       70% |      70% |        55% |       70% | Terra          | Registros divergem sobre tabela e RPC remotas. Conferir catálogo em leitura antes de qualquer SQL. Validar isolamento entre marcas e retry.                   |
| 17 | [IA01 · Consumo de IA em Minha Conta](../../.scratch/ai-usage/issues/01-ai-usage-visibility.md)                                                |       75% |      55% |        50% |       75% | Terra          | Visual aceito segundo CURRENT. Confirmar migration, permissões e agregação mensal com registro real controlado, inclusive duplicidade.                        |
| 18 | [V19 · /ui: seção "Avatar" (PrismAvatar)](../../.scratch/visual-controls/issues/19-ui-prism-avatar-section.md)                                 |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 19 | [V20 · /ui: seção "Sheet" (PrismSheet)](../../.scratch/visual-controls/issues/20-ui-prism-sheet-section.md)                                    |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 20 | [V21 · /ui: seção "ComboboxTrigger"](../../.scratch/visual-controls/issues/21-ui-combobox-trigger-section.md)                                  |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 21 | [V22 · /ui: seção "ResponsiblesCombobox"](../../.scratch/visual-controls/issues/22-ui-responsibles-combobox-section.md)                        |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17. Também depende do lote 4 de V18.                                                                                           |
| 22 | [V23 · /ui: seção "SprintCombobox"](../../.scratch/visual-controls/issues/23-ui-sprint-combobox-section.md)                                    |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17. Também depende do lote 4 de V18.                                                                                           |
| 23 | [V24 · /ui: seção "PhaseIcon"](../../.scratch/visual-controls/issues/24-ui-phase-icon-section.md)                                              |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 24 | [V25 · /ui: seção "ULoader"](../../.scratch/visual-controls/issues/25-ui-uloader-section.md)                                                   |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 25 | [V26 · /ui: seção "UToggleInput"](../../.scratch/visual-controls/issues/26-ui-utoggle-input-section.md)                                        |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 26 | [V27 · /ui: seção "UPreferenceSwitch"](../../.scratch/visual-controls/issues/27-ui-upreference-switch-section.md)                              |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 27 | [V28 · /ui: seção "UAvatarSelector"](../../.scratch/visual-controls/issues/28-ui-uavatar-selector-section.md)                                  |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 28 | [V29 · /ui: seção "UAdminItemCard"](../../.scratch/visual-controls/issues/29-ui-uadmin-item-card-section.md)                                   |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 29 | [V30 · /ui: seção "CalendarToolbar"](../../.scratch/visual-controls/issues/30-ui-calendar-toolbar-section.md)                                  |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 30 | [V31 · /ui: seção "ColorListEditor"](../../.scratch/visual-controls/issues/31-ui-color-list-editor-section.md)                                 |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 31 | [V32 · /ui: seção "ActionDatePicker"](../../.scratch/visual-controls/issues/32-ui-action-date-picker-section.md)                               |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |
| 32 | [V33 · /ui: seção "ActionColorDropdown"](../../.scratch/visual-controls/issues/33-ui-action-color-dropdown-section.md)                         |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17. Também depende do lote 4 de V18.                                                                                           |
| 33 | [V34 · /ui: seção "PartnerCelebrationsSelector"](../../.scratch/visual-controls/issues/34-ui-partner-celebrations-selector-section.md)         |        0% |      20% |        75% |       90% | Gemini externo | A fazer. Depende do aceite de V17.                                                                                                                            |

## Mudanças desde a primeira triagem

A fila vigente tem **33 tickets abertos**. V05 foi encerrado com 100% após o aceite explícito do proprietário e a verificação desta rodada. V13 e V16 continuam concluídos. Foram acrescentados V17–V34, dos quais V17/V18 têm implementação local e aguardam aceite, enquanto V19–V34 constam a fazer. A contagem aumentou pela criação desses 18 tickets. [Índice da galeria](../../.scratch/visual-controls/README.md)

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
