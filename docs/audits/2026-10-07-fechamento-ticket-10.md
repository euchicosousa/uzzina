# Ticket10 — cache de ações confiável

Data: 07/10/2026. Base: HEAD0f8c637 e alterações locais preexistentes05–09 preservadas. Escopo: cache de ações da equipe; sem alteração de schema, permissões, layout, sensores ou produção.

## Plano executado
1. Reproduzir criação pendente contaminando listas alheias, mudança de data mantendo card no período antigo e confirmação atrasada ressuscitando card.
2. Corrigir hook de produção e migrar as keys dos consumidores para escopos explícitos.
3. Testar o hook/SDK reais com fronteira externa controlada; validar criação/duplicação na aplicação real e regressões da gaveta; atualizar continuidade.

## Decisão para reduzir complexidade
As listas passam a exibir alterações confirmadas. Não há inserção de cards temporários nem restauração de snapshots inteiros. Assim, uma falha não altera a lista confirmada e não desfaz trabalho posterior. O formulário conserva edição imediata, rascunho e indicadores de salvamento; o calendário mantém seu feedback de arraste existente.

Essa decisão substitui as propostas anteriores de tempId/journal/rollback por operação. A consequência visível é que cards novos e alterações de lista aguardam a confirmação do servidor. Em rede lenta há espera, sem aparentar sucesso antes de ele existir. Não foi removido cache de leitura nem alterada a SPA.

## Alterações
- `useActionMutations.tsx`: removidos os snapshots e quatro blocos de updates otimistas; um cancelamento/invalidation por prefixo; refetch ativo aguarda as operações de escrita restantes. Confirmações individuais atualizam somente listas compatíveis e respeitam versão canônica, incluindo microssegundos. Registro compartilhado por QueryClient impede resposta antiga de recolocar card já removido. Helpers de arquivar/Sprint enviam apenas campos necessários.
- `query-keys.ts`: key de lista inclui usuário, função administrativa, parceiros e período; atraso usa regra própria, não período mensal. Listas desconhecidas são invalidadas, sem inventar pertinência.
- Home, Hoje, parceiro, Header e AppBar usam o mesmo contrato. Removido initialData que copiava dados mensais sem comprovar cobertura do período solicitado; cache exato da própria consulta permanece. Atalhos visitam o prefixo de ações uma única vez, pois atrasados já pertencem a ele.
- Criação usa a mutation existente; duplicação usa a leitura/INSERT real e título `(Cópia)`. Campos, parceiro arquivado e Feito/Concluído preservados.
- Hook principal:465→254 linhas. Não criado framework de operações.

## Evidência
`tests/action-cache.test.tsx`: sete testes no hook real, QueryClient real e mutations reais; somente Supabase externo controlado. RED observado antes da correção para contaminação da criação, movimentação de período e confirmação fora de ordem. Cobre também falha anterior após sucesso novo, criação/cópia única, escopo desconhecido, responsabilidade, Feito versus Concluído e limpeza de Sprint.

Suíte completa:214 passam,0 falham,662 assertions em15 arquivos. Typecheck, lint e build passam; build mantém aviso de chunk acima500kB.

`scripts/check-action-cache-browser.cjs`: aplicação real, autenticação e Supabase SDK reais, HTTP externo controlado. Criação por blur com POST suspenso, nenhuma inserção provisória, confirmação única, duplicação pelo atalho com uma única cópia e parceiro arquivado ausente. Chromium desktop1440 e viewport390. Não comprova gesto touch no aparelho nem persistência física.

`scripts/check-drawer-save-browser.cjs`: regressão desktop passa para data, fechar sem alterar, salvar redundante, falha e tentativa seguinte.

## Limites e próxima entrega
Banco real/produção não acessados. Novas migrations05–09 continuam pendentes. N09 completo ainda inclui validação integrada de mover/concluir e recarga com banco de teste; cenários de cache/movimento/conclusão foram exercitados no hook real, não declarados homologação física.

Lotes de data/hora ainda só permitem confirmar via recarga, pois seus contratos atuais não retornam linhas; resultado por item/CAS pertencem11. Suas falhas não restauram mais snapshots. Corrigir seleção e respostas no11 aproveitando esta política de confirmação, sem reintroduzir o rollback geral. Arrastes/sessões no12 e isolamento de identidade no13 continuam separados.
