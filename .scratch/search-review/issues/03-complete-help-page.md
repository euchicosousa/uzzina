# 03: Implementar a página de ajuda e documentação

**What to build:** Ajuda e documentação na busca e no menu do perfil abre uma página útil de orientação sobre os fluxos atuais do aplicativo, em português brasileiro, em vez do texto provisório.

**Blocked by:** None (can start immediately). A falha de carregamento de formulários é investigada em01; não bloqueia a implementação do conteúdo desta página.

**Status:** implemented locally 2026-10-28 (owner authorized after layout review); awaiting owner evaluation. No commit/publication.

## Evidence

Em28/10/2026 o proprietário relatou Ajuda vazia. A renderização isolada do componente real confirmou somente texto provisório Hello, sem conteúdo de ajuda. A captura com URL de Ajuda e erro do formulário da gaveta está registrada no ticket01 como problema separado; não atribuir aquele erro ao conteúdo desta página.

## Acceptance criteria

- [x] Substituir texto provisório por página com título, orientações úteis e navegação legível; usar apenas recursos realmente existentes.
- [x] Cobrir busca global, criação/edição, duas ações com Shift, abas/lado a lado, X individual e fechamento conjunto, filtros da busca e atalhos atuais. Respeitar Escape consumido por editores/overlays internos.
- [x] Explicar acesso à conta e os três modos de tema; orientações administrativas aparecem somente para o perfil apropriado. Não expor material interno, segredos ou operações técnicas ao usuário.
- [x] Reaproveitar a documentação e os contratos vigentes, revisando os textos para quem usa o produto. Não adicionar suporte externo, chat, formulário de contato ou novas funcionalidades presumidas.
- [x] Acesso pela busca e pelo menu funciona para a equipe; conferir desktop/mobile, temas, teclado, rolagem e reserva da AppBar.
- [x] Teste na rota real demonstra ausência de conteúdo no estado anterior e verifica o conteúdo/navegação finais. Conferir visualmente sem consulta/escrita real.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e atualizar CURRENT/documentação/KI aplicáveis. Sem implementação, commit ou publicação autorizados por este registro.

## Result

`HelpPage` (`app/components/features/HelpPage.tsx`) in `/app/help`: sticky index (desktop) / section selector (mobile), sections for global search, creating/editing, two actions, action shortcuts, account/themes, and admin-only Administração. Test `tests/help-page.test.tsx` failed on the placeholder before. Browser: scroll fixed after reproducing a clipped-container shift (absolute sr-only captions), see CURRENT.
