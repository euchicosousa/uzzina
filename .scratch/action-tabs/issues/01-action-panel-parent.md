# 01: Centralizar o painel de ação em um componente pai

**Blocked by:** nenhum.

**What to build:** abrir, editar, salvar e fechar uma ação com o comportamento atual preservado, usando o novo pai para posição, exibição, comando de saída e guardas. Preparação anterior à mudança funcional, conforme a skill.

**Status:** tested-locally-by-owner — no issue reported

## Acceptance criteria

- [x] Um único formulário reutilizado, sem cópia da implementação.
- [x] Posicionamento controlado pelo pai; larguras distintas preservadas.
- [x] Abertura por busca/cards/notificações/criação/duplicação preservada, assim como rascunhos e retorno de foco.
- [x] Overlay, Escape e X passam pelo fechamento seguro; salvar não dispara mais de uma vez.
- [x] Texto, arquivos, erro, conflito e IA continuam ligados à mesma instância durante suas atualizações.
- [x] Testes dos componentes reais verificam comportamento antes/depois e os caminhos afetados. Conferência visual com uma ação e verificação de teclado.

## Verification

Run relevant tests against real components, format, lint, typecheck and build according to AGENTS. Record results and actual limits in CURRENT. Review each delivery before starting the next ticket. No automatic push or deploy.

## Local result

401 tests, format/lint/typecheck/build and diff passed. Real Chromium with controlled HTTP checked desktop/mobile, themes and existing drawer operations. No real database/provider validation or publication. See docs/audits/2026-10-27-action-panel-parent.md. Ticket 02 has not started.
