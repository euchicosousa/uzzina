# 02: Abrir e trabalhar com uma segunda ação pela busca

**Blocked by:** 01 — Centralizar o painel de ação em um componente pai.

**What to build:** abrir a segunda ação com Shift na busca, alternar entre duas por abas e trabalhar nas duas sem perda de estado. Esta etapa usa abas em todas as larguras; 03 acrescenta apresentação simultânea no desktop como evolução visual separada.

**Status:** completed-locally — opening validated by owner; closing follow-up implemented

## Acceptance criteria

- [x] Controle dos espaços nomeado primaryAction/secondaryAction, entrada compartilhada initialAction e consumidores anteriores migrados de setBaseAction para setPrimaryAction.

- [x] No máximo duas instâncias completas do mesmo formulário, com identidade estável e estados independentes.
- [x] Clique/Enter/Espaço comuns abrem/substituem principal. Shift+clique/Enter/Espaço nos resultados de ações abrem/substituem secundária; sem nenhuma aberta, abrem principal.
- [x] Selecionar registro já aberto apenas foca o existente. Com apenas secundária aberta, abertura comum preenche principal e Shift substitui secundária.
- [x] Demais entradas continuam comuns; sem abertura secundária fora da busca ou controles para ausência de teclado.
- [x] Abas alternam a ação visível sem remontar a outra; abas internas permanecem completas.
- [x] X fecha sua ação sem promoção da outra; secundária isolada permanece editável e sem marcador obrigatório de ação 2.
- [x] Overlay e Escape fecham ambas pelo mesmo fluxo seguro, sem fechamento parcial quando uma guarda bloquear. Overlays internos preservam seu próprio Escape.
- [x] Sem botão conjunto; X individuais fecham apenas sua própria ação.
- [x] Salvar atinge apenas a ação em foco; troca de sessão limpa ambas e resultados antigos não interferem na identidade seguinte.
- [x] Testes reais reproduzem a matriz de abertura, guardas, estado independente, salvamento e teclado; verificação visual da alternância, inclusive em tela estreita.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

432 tests, format/lint/typecheck/build passed. Chromium with controlled HTTP checked 1440px/390px, modifiers, independent state/saving, draft identity, safe close/retry, logout and real theme controls. No real database/provider writes or publication. Evidence: docs/audits/2026-10-27-two-action-tabs.md. Tickets05/03/04 have not started.

## Owner review

Abertura confirmada como correta pelo proprietário. Overlay fecha; Escape fecha fora do Tiptap, mas não dentro dele: pendente reproduzir e identificar consumo do evento. Abas mantidas. Nova orientação visual substitui o CircleX da secundária por um X comum ao lado das abas superiores, somente com duas ações, com title HTML “Fechar todas as ações”. Sem implementação desse ajuste nesta rodada. Lado a lado permanece ticket03, ainda não iniciado.

## Closing follow-up completed

X individuais preservados. X conjunto movido para junto das abas externas, com title HTML nativo e sem CircleX; alternar ações mantém o controle no mesmo lugar. Teste real falhou antes do ajuste e passou depois.68 testes pertinentes, format/lint/typecheck/build passaram; Chromium desktop/mobile com HTTP controlado validou fechamento e posição. Escape investigado no navegador e no código instalado: prosemirror-view captureKeyDown consome keyCode27; editHandlers.keydown chama preventDefault. Painel respeita esse consumo; nenhuma mudança no teclado do editor. Sem banco real, SQL, push/deploy. Próxima etapa: ticket03, antes de05 por orientação do proprietário.

Decisão final do proprietário: botão de fechar todas removido, para não depender da barra externa ao chegar ao lado a lado. Somente Escape/overlay fazem fechamento conjunto; X individuais permanecem. Substitui orientações anteriores sobre CircleX ou X junto às abas. Remoção implementada localmente, sem iniciar ticket03.
