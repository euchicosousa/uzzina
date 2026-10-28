# Altura do Kanban na página Hoje

Proposta revisada em28/10/2026 após captura enviada pelo proprietário. Status: recorte aprovado e implementação autorizada em28/10/2026. Ticket local concluído; implementação e verificações locais finalizadas, sem push/deploy. Esta revisão substitui a proposta anterior de modificar os quatro modos da página.

## Objetivo e diagnóstico

Corrigir somente a área do Kanban na página Hoje. As colunas usam altura fixa de30vh e rolagem interna, deixando espaço livre abaixo enquanto as listas já precisam rolar, como na captura do proprietário.

As colunas devem aproveitar a altura disponível abaixo do título e dos controles, preservando seus cabeçalhos e sua rolagem interna quando houver ações excedentes. Não transformar os quatro modos em um novo layout nem substituir a rolagem por coluna por uma rolagem vertical conjunta.

## Divisão proposta

### 01: Aproveitar a altura disponível nas colunas do Kanban de Hoje

**What to build:** na página Hoje, visualizar o Kanban com as colunas usando o espaço disponível até o limite útil da janela. Quando houver mais ações do que cabem, rolar somente a lista da coluna correspondente, mantendo o cabeçalho da fase visível.

**Blocked by:** None (can start immediately).

**Status:** completed locally

- [x] O Kanban da página dedicada deixa de limitar as colunas a30vh e aproveita a área disponível abaixo do título e dos controles, sem criar rolagem vertical externa.
- [x] Os cabeçalhos de fase continuam visíveis; ações excedentes rolam dentro da coluna. A última ação permanece acessível acima da barra flutuante.
- [x] A altura acompanha o redimensionamento da janela e a quebra dos controles em telas menores, sem introduzir uma compensação fixa que só funcione na captura enviada.
- [x] Rolagem horizontal, seleção, abertura de ações e arraste existentes continuam funcionando; abrir/fechar o editor não torna as listas inacessíveis.
- [x] Parceiros, Categorias e Feed preservam sua aparência e rolagem. O bloco Hoje da Home preserva seu comportamento atual; o ajuste de aproveitamento da janela se aplica à página dedicada.
- [x] Teste no componente real reproduz o limite inadequado antes da correção. Navegador com dados controlados verifica altura útil, ausência de overflow externo, rolagem da coluna e acesso à última ação, com poucas/muitas ações e janelas de alturas diferentes.
- [x] Testes pertinentes, formatação, lint, typecheck e build passam; limites da verificação são registrados.

## Execução e limites

Um único ticket completo, sem dependências. Reutilizar a estrutura existente; nenhuma refatoração ampla, mudança de banco, API, persistência ou redesenho dos outros modos faz parte deste recorte. Ajustes pontuais de passagem de altura devem ser exclusivos do Kanban da página dedicada.

Ticket publicado e concluído em [.scratch/today-viewport/issues/01-today-kanban-height.md](../../.scratch/today-viewport/issues/01-today-kanban-height.md). O proprietário reforçou os dois usos: Home conserva colunas de30vh; página dedicada ativa explicitamente o preenchimento da altura útil. A proposta anterior não autoriza mudanças nos outros modos.

## Verificação desta revisão

Implementação limitada ao Kanban standalone. O contêiner mede a altura disponível no ancestral rolável e acompanha a janela e o cabeçalho com ResizeObserver; reserva da barra flutuante incluída na mesma altura. As listas rolam por fase e têm acesso por teclado. Ao sair do Kanban, o componente restaura a altura natural e a reserva externa dos demais modos.

Teste na rota e nos componentes reais falhou com altura vazia no lugar de820px sem ativar o modo dedicado; passou após a mudança. Cobre também resize para620px, retorno à altura natural e uso compacto na Home. Suite do checkout:443 testes/1475 assertions; format/lint/typecheck/build passaram, com aviso conhecido de chunks.

Chromium isolado com Auth/HTTP controlados, WebSockets bloqueados e sem chamadas reais ao banco/provedor verificou:

| Cenário | Área útil da página | Altura rolável da coluna | Overflow vertical externo |
| --- | --- | --- | --- |
| Desktop1440×900 | 836px | 502px | nenhum |
| Desktop1440×600 | 536px | 202px | nenhum |
| Celular390×700 | 636px | 328px | nenhum |
| Celular390×480 | 416px | 108px | nenhum |

Listas com83 ações no total, vazias e curtas; acesso ao fim da lista; abertura e fechamento do editor por Escape; troca de modo; arraste de Fazer para Fazendo com PATCH interceptado. A Home manteve coluna total de270px em janela de900px (30vh), com210px de lista abaixo do cabeçalho. A reserva inferior usada nesta rodada foi98px, conforme o estilo vigente do checkout; não foi fixada pela implementação.

Verificação automatizada usa dados controlados e não certifica uma sessão real em produção. Sem SQL, escrita real, geração/upload real, commit, push ou deploy desta entrega. Mudanças externas preservadas.
