# 05: Criar ação pela busca e combinar rascunho com ação aberta

**What to build:** oferecer o comando Criar ação na busca global, preservando o atalho atual de criação. Permitir consultar uma ação existente enquanto cria outra, ou abrir uma ação existente enquanto mantém um rascunho aberto, usando os dois espaços já definidos.

**Blocked by:** 02 — Abrir e trabalhar com uma segunda ação pela busca. Não depende do filtro de parceiros nem do layout simultâneo de desktop; deve funcionar primeiro na alternância por abas.

**Status:** completed — tested by owner in primary and secondary panels; approved on 2026-10-28

## Acceptance criteria

- [x] Criar ação aparece como comando da busca global com busca vazia e pode ser localizado pelo seu nome; não depende de encontrar ações existentes.
- [x] Clique/Enter/Espaço no comando cria um rascunho no espaço principal, com a mesma regra de substituição e guarda de saída já definida.
- [x] Shift+clique/Enter/Espaço no comando cria o rascunho no espaço secundário, preservando a principal. Sem nenhuma ação aberta, cria na principal. Com a secundária ocupada, respeita sua guarda antes da substituição.
- [x] O atalho atual de criação continua disponível, com sua abertura comum na principal; não criar outro atalho nem mudar sua combinação.
- [x] Com um rascunho principal aberto, abrir resultado existente com Shift mantém o rascunho e abre a secundária. Com ação existente aberta, Shift no comando Criar ação mantém essa ação e abre o novo rascunho.
- [x] Limite de duas entradas vale também para rascunhos. Cada rascunho possui identidade própria; ausência de ID do banco continua identificando ação ainda não criada.
- [x] Criar o rascunho reutiliza os defaults e o contexto de criação atuais. O filtro exclusivo da busca continua apenas filtrando resultados, sem atribuir parceiros automaticamente ao rascunho.
- [x] Abrir o comando não faz INSERT por si só. Persistência segue o fluxo existente de criação/salvamento e as guardas de rascunho.
- [x] Ao confirmar criação e receber versão canônica/ID, a ação permanece no mesmo espaço e conserva seu estado; a outra entrada não é remontada, substituída ou fechada. Não duplicar INSERT em blur/clique/fechamento concorrentes.
- [x] X, fechamento conjunto, descarte incompleto, falhas e conflitos preservam os contratos dos dois espaços. Alternar abas e mudar a largura não descarta texto pendente.
- [x] Testes nos componentes reais cobrem comando comum/Shift, atalho preservado, os dois sentidos de rascunho+ação existente, identidade após INSERT, limites e saída bloqueada; conferir apresentação e teclado da busca com HTTP controlado.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Localhost uses production; browser fixtures must control external HTTP and must not create production test records. Review this delivery before proceeding. No automatic push or deploy.

## Local result

466 tests in43 files passed; format/format:check/lint/typecheck/build passed with the known chunk warning. Controlled Chromium checked the new command with both real forms and preserved creation shortcut. See docs/audits/2026-10-28-search-create-action.md for evidence and limits. No SQL, real writes, commit or deployment.

## Additional commands authorized on 2026-10-28

Owner authorized every command in docs/plans/global-search-command-candidates.md. Implemented profile, three theme modes, home/today/notifications/leads/help, sign-out and admin-only creation/list commands. Navigation and sign-out validate both leave guards; theme persistence survives closing search, supports retry and preserves the palette. 491 tests passed, plus format/lint/typecheck/build and controlled Chromium at1440px/390px, with screenshots inspected. Owner review of this extension remains pending. No commit or deploy.

## Owner review follow-up

On 2026-10-28 the owner accepted the remaining commands but reported dynamic import failures when creating actions and partners, duplicate celebration commands and missing help content. Deferred follow-up tickets are recorded under the search-review feature; notifications already has its own ticket. Do not mark this creation flow fully accepted until the reported loading failure is resolved and verified. No fixes authorized in this registration turn.
