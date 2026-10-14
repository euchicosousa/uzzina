# 01: Navegar pelos campos principais da gaveta de ação

**What to build:** na aba Essencial, abrir a ação com foco no título e percorrer Título → Descrição → Parceiros → Status/Fase → Tipo/Categoria → Cor, quando disponível → Criar/Atualizar. Shift+Tab percorre o caminho inverso. Calendário, seletores e diálogos abertos mantêm seu teclado próprio. Usar React Aria para delimitar e gerenciar o foco da ActionFormDrawer, preservando o comportamento de edição e salvamento.

**Blocked by:** None.

**Status:** in-progress — implementation prepared locally; browser verification pending.

- [x] Abertura de rascunho e de ação existente inicia no título. Atualizações, consultas e salvamentos não roubam o foco do usuário.
- [x] Tab e Shift+Tab percorrem os destinos principais na ordem definida, sem índices positivos e ignorando destinos ausentes/desabilitados.
- [x] Responsáveis, ID, data, estratégia, anexos, toolbar, sprint, duplicar e arquivar não criam paradas intermediárias no percurso principal. Exclusão do percurso não desabilita os controles.
- [x] A gestão é local à aba Essencial; eventos de portais, popovers, diálogos, outras abas e widget externo não são capturados indevidamente.
- [x] Dentro de listas/tabelas da descrição, Tab sai para Parceiros e Shift+Tab retorna ao título sem alterar recuo, célula ou linhas. Os comandos de edição desses conteúdos permanecem disponíveis.
- [x] Abrir um seletor preserva busca, setas, Enter e seleção exclusiva por Shift. Abrir data preserva navegação do calendário e edição do horário; fechamento retorna ao gatilho.
- [x] Data usa sublinhado no foco, como seu hover e o estilo de Adicionar arquivo. Botões Prism que já possuem indicador preservam esse estilo.
- [x] Antes de excluir acesso sequencial aos auxiliares, documentar e validar uma forma de acessá-los pelo teclado, incluindo fechar e trocar abas. O acesso à formatação pode continuar provisoriamente existente, fora do percurso principal; sua substituição fica no ticket02.
- [x] Verificar limites do percurso e retorno ao controle que abriu a gaveta. Não introduzir contenção ou ciclo novo sem registrar a decisão de comportamento.
- [x] Registrar campos sem sinalização e aqueles com foco pouco perceptível; aparências ainda não definidas pelo proprietário não são inventadas neste ticket.
- [ ] Testes exercitam os componentes reais e falham no comportamento anterior, incluindo conteúdo simples, lista/tabela, percurso inverso e overlays. Conferência visual cobre claro/escuro, desktop/mobile e rodapé com overflow.
- [x] Testes pertinentes, format, lint, typecheck e build passam. Resultado distingue implementação local de eventual publicação; nenhum SQL ou alteração de autorização é necessário.

**Scope boundary:** não migrar a navegação de outras telas nem mudar automaticamente os consumidores compartilhados do editor. Dependência direta de React Aria deve ser declarada se seus hooks forem importados diretamente.

**Basis:** decisões do proprietário na conversa de14/10/2026 e avaliação da gaveta. Ticket local aprovado na conversa; implementação do ticket01 autorizada pelo proprietário.

## Implementation status — 14/10/2026

Primary navigation is implemented locally using React Aria FocusScope/useFocusManager. Alt+F10 switches between the primary sequence and all controls; the shortcut is shown in the drawer. The title keeps autofocus; the date trigger uses an underline on keyboard focus. No new styles were chosen for fields awaiting the owner’s decision. Toolbar replacement remains ticket02.

363 tests / 1060 assertions passed, including13 new drawer keyboard cases. Browser verification is pending because automatic browser approval review failed due to a usage limit. This does not certify theme, viewport, visual overflow, or browser-specific rendering. No push/deploy or database changes.

Format, lint, typecheck, build, diff checks and7 serverless checks passed. The remaining acceptance item is the browser verification of themes, viewports and overflow.
