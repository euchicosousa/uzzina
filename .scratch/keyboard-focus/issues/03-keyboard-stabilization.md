# 03: Definir a estabilização de foco e teclado nas telas da UZZINA

**What to build:** usar a experiência validada da gaveta e da toolbar para produzir um mapa dos comportamentos de teclado das telas e uma fila priorizada de correções. O resultado deve permitir escolher os próximos fluxos com critérios verificáveis, sem iniciar uma migração geral.

**Blocked by:** 01 — Navegar pelos campos principais da gaveta de ação; 02 — Usar Toolbar do React Aria na formatação do editor. A consolidação depende das decisões verificadas nesses fluxos.

**Status:** planned — future review; not authorized for implementation.

- [ ] Inventariar telas e fluxos existentes, identificando foco inicial, sequência de Tab/Shift+Tab, navegação por setas, atalhos, abertura/fechamento de overlays e retorno de foco.
- [ ] Priorizar fluxos por uso e impacto. Cada próxima correção é uma entrega demonstrável de um fluxo, com dependências reais, sem uma reescrita ampla do design system.
- [ ] Registrar padrões React Aria/Prism aproveitáveis, limitações específicas e evidências observadas. Separar constatação no código de comportamento verificado no navegador.
- [ ] Incluir controles auxiliares, busca/opções dos seletores, campos grandes de texto, uploads/anexos e conteúdo compartilhado com portal/revisão. Não exigir providers privados em conteúdo público.
- [ ] Documentar diferenças entre foco, seleção, hover e estado ativo; submeter as aparências ainda indefinidas ao proprietário antes de implementá-las.
- [ ] Definir critérios para escopos locais, Tab dentro de overlays, controles ignorados no percurso principal, acesso auxiliar, contenção, ciclos, atalhos e retorno de foco.
- [ ] Planejar/verificar teclado em temas claro/escuro, desktop/mobile e browsers relevantes, incluindo Safari; declarar a cobertura efetivamente executada e suas limitações.
- [ ] Entregar uma lista de próximas correções com comportamento esperado, critérios de aceitação, prioridade e bloqueios. Nenhuma correção de outras telas é implementada automaticamente como parte deste levantamento.

**Scope boundary:** trabalho futuro de diagnóstico e padronização, separado das duas entregas da gaveta. A publicação deste ticket não autoriza sua execução nem migração para Base UI.

**Basis:** solicitação do proprietário de um ticket futuro para estabilizar gestão de foco, teclado e telas, na conversa de14/10/2026.

## Owner follow-up — 14/10/2026

The owner confirmed the primary action focus flow and reported that some controls still lack visible focus in all-controls mode. Prioritize the existing focus inventory for the next review: title, responsibles, text editors, selectors, searches, attachments and tab controls. Toolbar focus indicators are addressed in ticket02; other appearances remain separate and must be agreed before implementation. The bottom shortcut notice stays hidden until the owner chooses a placement.
