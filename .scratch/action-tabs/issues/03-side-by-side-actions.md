# 03: Exibir duas ações lado a lado em desktop amplo

**Blocked by:** 02 — Abrir e trabalhar com uma segunda ação pela busca.

**What to build:** aproveitar telas amplas para consultar/editar as duas ações simultaneamente, mantendo abas quando não houver espaço.

**Status:** completed — accepted by owner; local commit authorized

## Acceptance criteria

- [x] Grupo ancorado à direita, principal à esquerda e secundária à direita; uma ação isolada permanece à direita.
- [x] Larguras diferentes por aba preservadas. Limiar para lado a lado considera duas na maior largura e área utilizável; não depende da aba interna atualmente selecionada.
- [x] Abaixo do limiar, inclusive em desktop, uma visível por vez com abas.
- [x] Resize e mudança de aba interna preservam instâncias, texto, rolagem quando viável e ação ativa, sem remontagem ou gravações extras.
- [x] Conteúdo e Legenda conservam imagem/texto utilizáveis em cada painel; conferir breakpoints internos pelo espaço disponível, sem reformulação adicional.
- [x] Foco/atalhos e os dois caminhos de fechamento conjunto (Escape/overlay), sem botão conjunto continuam corretos com ambas visíveis.
- [x] Testes reais da transição e preservação de estado, mais verificação visual em combinações Essencial/Instagram/Observações, Conteúdo/Legenda e temas.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

438 tests in41 files, format/format:check/lint/typecheck/build passed against an isolated copy of the selected commit content. Controlled Chromium checked1440px/390px and2560px with1855/1856 boundary, both themes, image/caption composition, preserved DOM/text/scroll on resize, scoped saving, individual close and logout. Stable threshold1856px; widths672/896px. No database/provider writes. Local commit authorized; no push/deploy. External Today/AppBar/layout changes excluded. See docs/audits/2026-10-28-side-by-side-actions.md.

Owner follow-up: layout validated; Instagram reduced to3xl/768px and the side-by-side threshold to1600px (2×768+64). Essential stays672px. Relevant73 tests and format/lint/typecheck/build passed; previous verification above describes the original1856px release. No new commit or deployment for this follow-up.

## Owner acceptance

Proprietário confirmou que o resultado final está correto, incluindo Instagram3xl/768px e limiar1600px, e autorizou encerrar o ticket03 e criar o commit local. Sem push/deploy. Ticket05 permanece a próxima entrega, sem início automático.
