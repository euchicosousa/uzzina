# 41 — Padronizar nomes de componentes próprios com prefixo U

**What to build:** uma convenção única e uma migração mecânica dos componentes compartilhados próprios para o prefixo U, com nomes, exports, imports e galeria coerentes.

**Blocked by:** V40 e V43, que consolidam/removem componentes; V38 para estabilizar o nome do editor de paleta. Executor Gemini.

**Status:** ready-for-agent (bloqueado pelas consolidações)

- [ ] Registrar um mapa de nome atual para nome final dos componentes compartilhados próprios. Manter Prism nos primitivos e nomes de domínio nas páginas/estruturas de fluxo. Não prefixar todo componente React indiscriminadamente.
- [ ] Resolver casos como CalendarToolbar e Icons exportado por UIcons, além dos wrappers compartilhados identificados no inventário atual. Aplicar nomes já definidos nos tickets de consolidação, sem recriar componentes removidos.
- [ ] Distinguir arquivos Uzzina*Section da galeria dos componentes operacionais. Uniformizar os rótulos e referências da galeria ao nome documentado; preservar IDs/links existentes ou oferecer compatibilidade explícita.
- [ ] Executar em lotes mecânicos: introduzir nomes novos compatíveis, migrar consumidores por grupo e só então remover aliases antigos sem referências restantes. Cada lote precisa manter imports e exports resolvidos.
- [ ] Atualizar arquivo, símbolo, barrel, imports, tipos exportados e referências vigentes juntos. Conferir diferenças de maiúsculas/minúsculas no Git e resolução no build. Preservar histórico documental de entregas antigas.
- [ ] Não misturar mudanças de comportamento, estilo ou arquitetura na renomeação. Preservar props, defaults, refs e contratos dos consumidores.
- [ ] Conferir referências residuais com busca, typecheck, galeria e entradas normais dos componentes. Se alcançar arquivos importados por APIs, cumprir também a verificação serverless exigida antes de push.

Entregar mapa final, lotes executados, referências de compatibilidade e verificações reais. Começar CURRENT/AGENTS e estado Git. Um escritor por checkout; coordenar com os demais tickets que tocam a galeria. Referência em docs/audits/2026-11-04-component-consolidation-studies.md.
