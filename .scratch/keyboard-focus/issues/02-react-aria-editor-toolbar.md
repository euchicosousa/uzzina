# 02: Usar Toolbar do React Aria na formatação do editor

**What to build:** operar a barra de formatação com teclado usando Toolbar do React Aria, mantendo Tiptap como editor, os comandos atuais e a aparência da UZZINA. A formatação continua fora do percurso principal da gaveta e pode ser acessada por um atalho documentado; após navegar pelos comandos, Tab retorna à descrição.

**Blocked by:** 01 — Navegar pelos campos principais da gaveta de ação. O ticket01 estabelece o percurso e o acesso auxiliar com os quais esta toolbar precisa integrar-se.

**Status:** ready-for-agent — blocked by ticket01; execution not started.

- [ ] Substituir a gestão própria dos botões pela Toolbar do React Aria já disponível na biblioteca instalada, preservando editor, conteúdo, ícones, estados e comandos.
- [ ] Um atalho sem conflito permite ir da descrição à formatação; seu uso é descobrível na interface. Setas navegam pelos comandos sem alterar o texto.
- [ ] Enter/Espaço executam o comando selecionado e preservam a seleção de texto necessária para formatar. Após aplicação, o usuário pode continuar escrevendo.
- [ ] Tab da toolbar retorna à descrição. A integração não adiciona a formatação entre Título e Descrição nem entre Descrição e Parceiros.
- [ ] O foco do comando é visível e distinto do estado ativo de uma formatação, usando os tokens Prism. Comandos têm nomes acessíveis e estados adequados.
- [ ] Desfazer/Refazer e transições de habilitação não deixam o foco perdido; navegação funciona também quando a barra quebra em linhas.
- [ ] O menu flutuante e os comandos de tabela continuam acessíveis e não interceptam o percurso principal. Verificar sua presença com texto selecionado.
- [ ] Verificar os outros usos do editor compartilhado, incluindo conteúdo do Instagram e administração de parceiro. Política específica da gaveta não se espalha automaticamente para eles.
- [ ] Se a solução introduzir um novo primitivo Prism reutilizável, documentá-lo e incluí-lo na galeria de componentes; evitar essa abstração caso a integração local seja suficiente.
- [ ] Testes nos componentes reais cobrem acesso por atalho, navegação, aplicação de comandos, retorno ao texto, comandos desabilitados e integração com o percurso do ticket01. Conferência visual cobre claro/escuro e desktop/mobile.
- [ ] Testes pertinentes, format, lint, typecheck e build passam; registrar implementação local e publicação separadamente.

**Scope boundary:** não substituir Tiptap, instalar Base UI ou redesenhar a toolbar. Não implementar uma barra global para todas as telas.

**Basis:** escolha do proprietário de manter React Aria e adaptar a toolbar, na conversa de14/10/2026. Ticket publicado para planejamento; execução ainda não iniciada.
