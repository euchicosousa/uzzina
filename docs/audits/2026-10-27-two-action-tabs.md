# Ticket02 — duas ações com alternância por abas

Implementação local em27/10/2026, autorizada pelo proprietário junto à adoção dos termos Primary Action e Secondary Action. Fonte: [levantamento](../plans/action-tabs-and-search-scope.md), [roadmap](../plans/action-tabs-ticket-breakdown.md) e [ticket02](../../.scratch/action-tabs/issues/02-secondary-action-tabs.md). Ticket01 permanece no [registro anterior](2026-10-27-action-panel-parent.md).

## Resultado

`useActionPanels` controla os espaços explícitos `primaryAction` e `secondaryAction`, identidade de cada entrada, ação ativa, aba interna e guardas. `setPrimaryAction` substitui `setBaseAction` nas entradas e nos consumidores existentes. O formulário compartilhado recebe `initialAction`, pois atende aos dois espaços. Termos registrados em GLOSSARY.md.

`ActionDrawerPanel` usa abas React Aria e mantém ambos os formulários montados, com o inativo oculto/inert. Texto, arquivos, editor, aba interna e coordenador de salvamento permanecem associados à mesma entrada. Cada espaço conserva sua largura por aba, mas só uma ação aparece por vez em todas as larguras nesta entrega.

### Abertura e substituição

| Estado | Ativação comum | Shift na busca |
| --- | --- | --- |
| Nenhuma aberta | Abre principal | Abre principal |
| Principal aberta | Substitui principal | Abre secundária |
| Duas abertas | Substitui principal | Substitui secundária |
| Só secundária aberta | Abre principal | Substitui secundária |
| Registro já aberto | Foca o existente | Foca o existente |

Somente resultados de ações da busca têm intenção secundária. Clique e Enter usam o modificador fornecido pelo comando existente. Espaço ativa o resultado após navegação com as setas ou foco no resultado; durante digitação normal continua sendo texto. Ctrl/Meta/Alt e composição de texto não são convertidos em ativação por Espaço.

O atalho atual de Nova ação continua abrindo principal, preservando secundária. Um rascunho pode coexistir com ação existente; confirmar seu INSERT atualiza o ID usado para evitar duplicação, sem mudar a chave da entrada ou desmontar a outra ação. O novo comando Criar ação na busca continua reservado ao ticket05.

### Fechamento, foco e sessão

X fecha sua entrada sem promover a secundária. Overlay, Escape e CircleX da secundária usam um único fechamento conjunto, validando as duas guardas antes de remover qualquer entrada. CircleX aparece somente com duas abertas. Comandos estruturais são serializados; falha de salvamento/conflito/IA/rascunho preserva o trabalho e impede a saída correspondente.

Salvar por teclado é tratado localmente pelo formulário ativo. A busca e overlays internos conservam seu teclado e Escape. Foco de uma ação não é roubado por callbacks enfileirados da outra; abas externas usam navegação React Aria. Reset de sessão limpa as duas, invalida operações pendentes e os setters fornecidos pela rota rejeitam chamadas de gerações anteriores.

Dois formulários revelaram IDs DOM repetidos nos avatares de um mesmo parceiro. UAvatarGroup passou a qualificar esses IDs por instância, mantendo as chaves de dados e o visual. O teste real falhou com o ID repetido antes da correção e passou depois.

## Verificação

- 432 testes passaram, sem falhas. Incluem a cobertura anterior, matriz do hook real e integração de dois formulários, busca real, atalhos e fronteira Supabase controlada.
- Cobertura inclui cliques/Enter/Espaço comuns e com Shift; deduplicação; substituição bloqueada; principal e secundária isoladas; abas/estado; salvamento por ação; descarte de rascunho; fechamento conjunto com falha/retry; serialização; respostas após reset; IDs DOM; Escape da busca e digitação de espaços.
- Format, lint, typecheck e build passaram. Aviso conhecido de chunks grandes permanece. Referências e diff conferidos; nenhum `BaseAction`/`setBaseAction` restante em app/tests.
- `check-action-panels-browser.cjs`: Chromium isolado em1440px e390px, com Auth/REST/preferências/logout controlados. Confirmou substituições, Shift+clique/Enter/Espaço, edição e legenda preservadas, rascunho pelo atalho existente, um INSERT canônico, identidade estável após criação, secundária isolada, fechamento com falha/retry e limpeza das duas no logout.
- Claro/escuro selecionados pelos controles reais do cabeçalho, com captura opcional das telas. A verificação anterior de uma ação também passou pelo script existente, incluindo data, atualização redundante, fechamento sem escrita e erro/retry.
- KI externo de arquitetura atualizado conforme AGENTS. Não foi criado primitivo Prism/Uzzina; o contêiner é interno ao editor existente.

## Limites e próximos tickets

Código preparado localmente. Não houve SQL, escrita em banco real, geração real de IA, upload real, push, deploy ou confirmação de produção. HTTP controlado não certifica RLS/provedor; o teste físico do proprietário continua sendo a revisão desta entrega. Localhost permanece configurado para produção por decisão anterior dele.

Ticket05 (comando Criar ação na busca), ticket03 (lado a lado) e ticket04 (filtro de parceiros) não foram iniciados. Próxima entrega proposta é05, após revisão do02.

## Revisão do proprietário e levantamento posterior

Proprietário confirmou abertura funcionando e fechamento pelo overlay. Relatou ausência de lado a lado em tela ampla: comportamento ainda não implementado, reservado ao ticket03. Abas externas/internas mantidas após observação de excesso visual.

Última orientação para fechamento substitui proposta inicial de X em cada aba: um X comum ao lado das abas superiores fecha todas, com title HTML nativo “Fechar todas as ações”. Retirar CircleX da secundária; mostrar controle conjunto apenas com duas abertas. X individuais permanecem conforme regra vigente. Ajuste ainda não implementado.

Escape fecha fora do editor, mas não dentro do Tiptap no teste do proprietário. Inspeção local: pai usa listener de keydown no document e ignora defaultPrevented, busca aberta e alvos em diálogo/popover. Captura explícita do RichTextEditor cobre Tab/F9/F10, sem regra própria explícita para Escape. Causa no editor/extensões ainda não reproduzida; não afirmar incompatibilidade geral do Tiptap nem contornar eventos internos sem diagnóstico.

Rodada somente documental: referências locais e diff conferidos; sem alteração funcional, novos testes/build, SQL ou publicação. Resultados anteriores de432 testes permanecem referentes à implementação anterior, não a um ajuste novo.

## Encerramento do ticket02 — ajuste de fechamento e Escape

Autorizado pelo proprietário após validar a abertura. X individuais mantidos. X conjunto agora pertence ao ActionDrawerPanel, ao lado das abas externas, usando XIcon comum e title HTML “Fechar todas as ações”. Aparece só com duas abertas e permanece disponível em qualquer aba. Removidos CircleX e onCloseAll do formulário compartilhado.

Teste de integração real falhou antes do ajuste por ausência do title e passou com o botão no pai; verifica posição, permanência ao alternar abas, X individual e fechamento conjunto.68 testes pertinentes passaram, sem falhas; format/lint/typecheck/build passaram. Aviso conhecido de chunks grandes mantido. Chromium1440px/390px com HTTP controlado conferiu o fluxo e a posição do controle.

Escape reproduzido no editor real: evento chega ao document com defaultPrevented=true, mantendo ambas abertas; após focar o título, Escape fecha ambas. Captura temporária da origem de preventDefault apontou editHandlers.keydown do prosemirror-view; código instalado em src/capturekeys.ts retorna true para keyCode27 e src/input.ts chama preventDefault. Causa confirmada na captura nativa do ProseMirror. Instrumentação temporária de stack/prototype removida; script conserva somente asserções de evento e comportamento. Nenhuma modificação no editor ou contenção global adicionada.

Sem SQL, escrita real em produção, push/deploy. Nova verificação exercita aplicação real com HTTP controlado, sem certificar RLS/provedor. Ticket02 concluído localmente; ticket03 vem a seguir, depois05 e04.

## Remoção final do botão conjunto

Proprietário autorizou retirar o X conjunto porque a barra de ações não existirá no futuro lado a lado. Botão removido; X individuais mantidos. Somente Escape/overlay passam pelo fechamento conjunto, sem alterar guardas ou o comportamento do Tiptap. Teste do componente real reproduziu a presença indevida antes da remoção e passou depois. Testes de fechamento/falha/retry e script de navegador atualizados para os caminhos restantes. Contratos, plano, ticket e KI sincronizados. Sem início do03, SQL, escrita real, push/deploy.

Verificação após remoção:67 testes pertinentes passaram; format/lint/typecheck/build passaram, com aviso conhecido de chunks. Chromium1440px com HTTP controlado validou ausência do botão, fechamento individual e conjunto via overlay/Escape, falha/retry e consumo do Escape pelo Tiptap. Sem escrita real ou publicação.
