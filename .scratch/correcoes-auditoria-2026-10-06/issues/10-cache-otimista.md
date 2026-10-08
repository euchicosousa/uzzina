# 10: Listas de ações respeitam confirmação e filtros

**Status:** código corrigido e verificado localmente em07/10/2026. Produção não implantada.
**Objetivo:** criar, duplicar, mover e falhar não produzem cards indevidos nem desfazem trabalho posterior.
**Dependência:** contrato de versão08 preservado; banco real continua pendente.

## Solução atual
Listas exibem dados confirmados; rascunho fica na gaveta. Sem cards temporários, snapshots de rollback ou journal. Essa simplificação substitui a prescrição anterior de updates otimistas: o objetivo é confiabilidade, não manter uma técnica específica.
Keys registram usuário/admin, parceiros e período/regra de atraso. Confirmação só entra em listas compatíveis; versão antiga não substitui posterior nem ressuscita card no período antigo. Escopo desconhecido exige recarga. Invalidations usam um único prefixo e aguardam as escritas concorrentes antes de refetch ativo.

## Critérios verificados
- [x] Criação pendente não aparece em listas alheias.
- [x] Criação/cópia confirmada aparece uma vez, com dados reais da mutation.
- [x] Data confirmada remove do período anterior e entra somente no compatível.
- [x] Falha antiga preserva sucesso posterior; confirmação antiga não ressuscita card.
- [x] Responsáveis, parceiros ativos e Feito/Concluído respeitados.
- [x] Hook real/QueryClient real/SDK real; adaptador externo controlado.

## Resultado
Código e suíte local aprovados:214 testes passam, tipagem/lint/build passam. Chromium desktop e390: criação/duplicação por UI passam com HTTP fictício; gaveta desktop preservada. Banco/produção e N09 integrado completo não certificados.
Arquivos e limites: `docs/audits/2026-10-07-fechamento-ticket-10.md`. Próxima leitura: CURRENT e ticket11, quando autorizado.
