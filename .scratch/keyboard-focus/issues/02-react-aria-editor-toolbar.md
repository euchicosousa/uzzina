# 02: Usar Toolbar do React Aria na formatação do editor

**What to build:** operar a barra de formatação com teclado usando Toolbar do React Aria, mantendo Tiptap como editor, os comandos atuais e a aparência da UZZINA. A formatação continua fora do percurso principal da gaveta e pode ser acessada por um atalho documentado; após navegar pelos comandos, Tab retorna à descrição.

**Blocked by:** None — ticket01 completed and owner authorized ticket02.

**Status:** implemented — local checks passed; production publication pending.

- [x] Substituir a gestão própria dos botões pela Toolbar do React Aria já disponível na biblioteca instalada, preservando editor, conteúdo, ícones, estados e comandos.
- [x] Um atalho sem conflito permite ir da descrição à formatação; seu uso é descobrível na interface. Setas navegam pelos comandos sem alterar o texto.
- [x] Enter/Espaço executam o comando selecionado e preservam a seleção de texto necessária para formatar. Após aplicação, o usuário pode continuar escrevendo.
- [x] Tab da toolbar retorna à descrição. A integração não adiciona a formatação entre Título e Descrição nem entre Descrição e Parceiros.
- [x] O foco do comando é visível e distinto do estado ativo de uma formatação, usando os tokens Prism. Comandos têm nomes acessíveis e estados adequados.
- [x] Desfazer/Refazer e transições de habilitação não deixam o foco perdido; navegação funciona também quando a barra quebra em linhas.
- [x] O menu flutuante e os comandos de tabela continuam acessíveis e não interceptam o percurso principal. Verificar sua presença com texto selecionado.
- [x] Verificar os outros usos do editor compartilhado, incluindo conteúdo do Instagram e administração de parceiro. Política específica da gaveta não se espalha automaticamente para eles.
- [x] Se a solução introduzir um novo primitivo Prism reutilizável, documentá-lo e incluí-lo na galeria de componentes; evitar essa abstração caso a integração local seja suficiente.
- [x] Testes nos componentes reais cobrem acesso por atalho, navegação, aplicação de comandos, retorno ao texto, comandos desabilitados e integração com o percurso do ticket01. Conferência visual cobre claro/escuro e desktop/mobile.
- [x] Testes pertinentes, format, lint, typecheck e build passam; registrar implementação local e publicação separadamente.

**Scope boundary:** não substituir Tiptap, instalar Base UI ou redesenhar a toolbar. Não implementar uma barra global para todas as telas.

**Basis:** escolha do proprietário de manter React Aria e adaptar a toolbar, na conversa de14/10/2026. Ticket publicado para planejamento; execução ainda não iniciada.

## Implementation — 14/10/2026

Main and contextual toolbars use React Aria Toolbar/Button while retaining Tiptap commands. Arrow keys navigate; Enter/Space apply formatting and return to the text; Tab returns directly to the editor. Main toolbar shortcut: Alt+Shift+F10. Visible selection/table toolbar shortcut: Alt+Shift+F9. Commands expose accessible names, pressed states for toggles, focus indicators and reactive history availability.

The all-controls notice is hidden and takes no layout space. Contextual toolbar buttons are excluded from the ordinary drawer Tab sequence and remain reachable by shortcut.

374 tests /1120 assertions passed, including11 new cases across the real drawer and editor. Format/lint/typecheck/build passed. Isolated browser checks covered keyboard arrows, main/context shortcuts, Tab return, a390px viewport with two toolbar rows, no space from the hidden notice, and a3px ring in the real default dark palette. These checks do not certify the complete authenticated Instagram/admin routes, every palette/browser or backend/provider behavior. No database changes.
