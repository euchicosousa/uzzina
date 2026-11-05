# 41 — Padronizar nomes de componentes próprios com prefixo U

**Resumo:** Padroniza nomes, arquivos, exports e imports dos componentes próprios com prefixo U.

**Commits:** `57a7be3` — migração dos nomes; correções e encerramento no commit `fix(ui): close V41 with restored date picker and canonical labels`, que inclui este registro.

**What to build:** uma convenção única e uma migração mecânica dos componentes compartilhados próprios para o prefixo U, com nomes, exports, imports e galeria coerentes.

**Blocked by:** nenhum bloqueio de entrega restante; V38/V40/V43 concluídos no commit `d7efe5f`. Executor Gemini; coordenar um escritor por checkout.

**Status:** Concluído e aprovado pelo proprietário (100%) em 04/11/2026 — encerramento e commit autorizados.

- [x] Registrar um mapa de nome atual para nome final dos componentes compartilhados próprios. Manter Prism nos primitivos e nomes de domínio nas páginas/estruturas de fluxo. Não prefixar todo componente React indiscriminadamente.
- [x] Resolver casos como CalendarToolbar e Icons exportado por UIcons, além dos wrappers compartilhados identificados no inventário atual. Aplicar nomes já definidos nos tickets de consolidação, sem recriar componentes removidos.
- [x] Distinguir arquivos Uzzina*Section da galeria dos componentes operacionais. Uniformizar os rótulos e referências da galeria ao nome documentado; preservar IDs/links existentes ou oferecer compatibilidade explícita.
- [x] Executar em lotes mecânicos: migrar consumidores por grupo e remover arquivos obsoletos sem reexportações vazias. Todos os imports e exports resolvidos.
- [x] Atualizar arquivo, símbolo, barrel, imports, tipos exportados e referências vigentes juntos. Conferir diferenças de maiúsculas/minúsculas no Git e resolução no build. Preservar histórico documental de entregas antigas.
- [x] Não misturar mudanças de comportamento, estilo ou arquitetura na renomeação. Preservar props, defaults, refs e contratos dos consumidores.
- [x] Conferir referências residuais com busca, typecheck, galeria e entradas normais dos componentes. Se alcançar arquivos importados por APIs, cumprir também a verificação serverless exigida antes de push.

Entregar mapa final, lotes executados, referências de compatibilidade e verificações reais. Começar CURRENT/AGENTS e estado Git. Um escritor por checkout; coordenar com os demais tickets que tocam a galeria. Referência em docs/audits/2026-11-04-component-consolidation-studies.md.

## Revisão independente — 04/11/2026

Subagente econômico e coordenador confirmaram nove renomes reais e Icons → UIcons, sem wrappers/aliases legados remanescentes. A entrega `57a7be3` não pode ser encerrada ainda: UActionDatePicker alterou layout e comportamento do horário além da renomeação; galeria mantém alguns rótulos PhaseIcon/PartnerCelebrationsSelector sem U. Restaurar o contrato/visual prévio do seletor, mantendo os novos nomes, e alinhar rótulos preservando hashes. [Parecer completo](../../../docs/audits/2026-11-04-v41-independent-review.md). Nenhuma correção de código realizada nesta revisão.

## Correções autorizadas e concluídas — 04/11/2026

UActionDatePicker restaurado ao arquivo de `d7efe5f`, alterando exclusivamente o nome da função exportada para UActionDatePicker. Comparação integral confirmou igualdade após essa única substituição: calendário, texto, tamanho, rótulo, divisor, valores vazios, preservação de segundos/ms e regra de edição da hora retornaram à implementação aprovada. Cabeçalhos, rótulos de exemplo e títulos dos playgrounds de UPhaseIcon/UPartnerCelebrationsSelector alinhados aos nomes novos, sem mudança de IDs/hashes. Prettier, Biome e typecheck aprovados. Sem novo ensaio visual: a prova desta rodada é a igualdade com a versão anterior aprovada.

Registro: `d7efe5f` contém a versão anterior; `57a7be3` contém a migração; a restauração e os rótulos desta rodada permanecem alterações locais. Sem novo commit/push/deploy.

## Aceite e encerramento — 04/11/2026

Proprietário confirmou que o V41 está correto e autorizou fechamento/commit. Correções finais integram o commit de encerramento com este registro. Verificações da correção: igualdade integral do seletor com a base aprovada após renomeação, Prettier, Biome e typecheck. Sem push/deploy.
