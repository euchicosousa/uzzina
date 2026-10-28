# 05: Criar ação pela busca e combinar rascunho com ação aberta

**What to build:** oferecer o comando Criar ação na busca global, preservando o atalho atual de criação. Permitir consultar uma ação existente enquanto cria outra, ou abrir uma ação existente enquanto mantém um rascunho aberto, usando os dois espaços já definidos.

**Blocked by:** 02 — Abrir e trabalhar com uma segunda ação pela busca. Não depende do filtro de parceiros nem do layout simultâneo de desktop; deve funcionar primeiro na alternância por abas.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Criar ação aparece como comando da busca global com busca vazia e pode ser localizado pelo seu nome; não depende de encontrar ações existentes.
- [ ] Clique/Enter/Espaço no comando cria um rascunho no espaço principal, com a mesma regra de substituição e guarda de saída já definida.
- [ ] Shift+clique/Enter/Espaço no comando cria o rascunho no espaço secundário, preservando a principal. Sem nenhuma ação aberta, cria na principal. Com a secundária ocupada, respeita sua guarda antes da substituição.
- [ ] O atalho atual de criação continua disponível, com sua abertura comum na principal; não criar outro atalho nem mudar sua combinação.
- [ ] Com um rascunho principal aberto, abrir resultado existente com Shift mantém o rascunho e abre a secundária. Com ação existente aberta, Shift no comando Criar ação mantém essa ação e abre o novo rascunho.
- [ ] Limite de duas entradas vale também para rascunhos. Cada rascunho possui identidade própria; ausência de ID do banco continua identificando ação ainda não criada.
- [ ] Criar o rascunho reutiliza os defaults e o contexto de criação atuais. O filtro exclusivo da busca continua apenas filtrando resultados, sem atribuir parceiros automaticamente ao rascunho.
- [ ] Abrir o comando não faz INSERT por si só. Persistência segue o fluxo existente de criação/salvamento e as guardas de rascunho.
- [ ] Ao confirmar criação e receber versão canônica/ID, a ação permanece no mesmo espaço e conserva seu estado; a outra entrada não é remontada, substituída ou fechada. Não duplicar INSERT em blur/clique/fechamento concorrentes.
- [ ] X, fechamento conjunto, descarte incompleto, falhas e conflitos preservam os contratos dos dois espaços. Alternar abas e mudar a largura não descarta texto pendente.
- [ ] Testes nos componentes reais cobrem comando comum/Shift, atalho preservado, os dois sentidos de rascunho+ação existente, identidade após INSERT, limites e saída bloqueada; conferir apresentação e teclado da busca com HTTP controlado.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Localhost uses production; browser fixtures must control external HTTP and must not create production test records. Review this delivery before proceeding. No automatic push or deploy.
