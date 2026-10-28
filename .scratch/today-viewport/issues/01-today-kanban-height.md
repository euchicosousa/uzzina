# 01: Aproveitar a altura disponível nas colunas do Kanban de Hoje

**What to build:** na página Hoje, visualizar o Kanban com as colunas usando o espaço disponível até o limite útil da janela. Quando houver mais ações do que cabem, rolar somente a lista da coluna correspondente, mantendo o cabeçalho da fase visível.

**Blocked by:** None (can start immediately).

**Status:** completed — approved by owner on 2026-10-28; local commit

- [x] O Kanban da página dedicada deixa de limitar as colunas a30vh e aproveita a área disponível abaixo do título e dos controles, sem criar rolagem vertical externa.
- [x] Os cabeçalhos de fase continuam visíveis; ações excedentes rolam dentro da coluna. A última ação permanece acessível acima da barra flutuante.
- [x] A altura acompanha o redimensionamento da janela e a quebra dos controles em telas menores, sem introduzir uma compensação fixa que só funcione na captura enviada.
- [x] Rolagem horizontal, seleção, abertura de ações e arraste existentes continuam funcionando; abrir/fechar o editor não torna as listas inacessíveis.
- [x] Parceiros, Categorias e Feed preservam sua aparência e rolagem. O bloco Hoje da Home preserva seu comportamento atual; o ajuste de aproveitamento da janela se aplica à página dedicada.
- [x] Teste no componente real reproduz o limite inadequado antes da correção. Navegador com dados controlados verifica altura útil, ausência de overflow externo, rolagem da coluna e acesso à última ação, com poucas/muitas ações e janelas de alturas diferentes.
- [x] Testes pertinentes, formatação, lint, typecheck e build passam; limites da verificação são registrados.


Verificação local:443 testes, format/lint/typecheck/build e Chromium isolado em desktop/mobile, incluindo resize, listas curtas/vazias/longas, editor, arraste com HTTP controlado e comparação com o uso na Home. Sem push/deploy.
