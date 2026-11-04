# 41 — Padronizar nomes de componentes próprios com prefixo U

**Resumo:** Padroniza nomes, arquivos, exports e imports dos componentes próprios com prefixo U.

**Commit de referência:** `d7efe5f` — somente o registro do ticket; implementação/estudo pendente.

**What to build:** uma convenção única e uma migração mecânica dos componentes compartilhados próprios para o prefixo U, com nomes, exports, imports e galeria coerentes.

**Blocked by:** nenhum bloqueio de entrega restante; V38/V40/V43 concluídos no commit `d7efe5f`. Executor Gemini; coordenar um escritor por checkout.

**Status:** Concluído (100%) — todos os componentes próprios migrados para `app/components/uzzina/U*`, callers atualizados, sem wrappers de reexportação ou aliases legados.

- [x] Registrar um mapa de nome atual para nome final dos componentes compartilhados próprios. Manter Prism nos primitivos e nomes de domínio nas páginas/estruturas de fluxo. Não prefixar todo componente React indiscriminadamente.
- [x] Resolver casos como CalendarToolbar e Icons exportado por UIcons, além dos wrappers compartilhados identificados no inventário atual. Aplicar nomes já definidos nos tickets de consolidação, sem recriar componentes removidos.
- [x] Distinguir arquivos Uzzina*Section da galeria dos componentes operacionais. Uniformizar os rótulos e referências da galeria ao nome documentado; preservar IDs/links existentes ou oferecer compatibilidade explícita.
- [x] Executar em lotes mecânicos: migrar consumidores por grupo e remover arquivos obsoletos sem reexportações vazias. Todos os imports e exports resolvidos.
- [x] Atualizar arquivo, símbolo, barrel, imports, tipos exportados e referências vigentes juntos. Conferir diferenças de maiúsculas/minúsculas no Git e resolução no build. Preservar histórico documental de entregas antigas.
- [x] Não misturar mudanças de comportamento, estilo ou arquitetura na renomeação. Preservar props, defaults, refs e contratos dos consumidores.
- [x] Conferir referências residuais com busca, typecheck, galeria e entradas normais dos componentes. Se alcançar arquivos importados por APIs, cumprir também a verificação serverless exigida antes de push.

Entregar mapa final, lotes executados, referências de compatibilidade e verificações reais. Começar CURRENT/AGENTS e estado Git. Um escritor por checkout; coordenar com os demais tickets que tocam a galeria. Referência em docs/audits/2026-11-04-component-consolidation-studies.md.
