# 11: Lote atua no recorte e informa resultado real

**What to build:** O usuário sabe quais ações foram alteradas e pode repetir somente as que falharam.

**Blocked by:** 08, 10

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: app/components/features/BulkActionMenu.tsx; app/hooks/useMultiSelection.tsx; app/hooks/useActionMutations.tsx; app/lib/supabase.mutations.ts; views que fornecem recorte.
1. Views fornecem eligibleActionIds a partir da lista já filtrada de dados, com versões por ID. Provider/menu recebem recorte explícito. QuerySelector global não decide permissão nem escopo. Interseção vazia retorna[] e desabilita ações.
2. Atualizar chave de contexto de seleção com rota, parceiro, período e filtros relevantes. Mudança limpa ou intersecta seleção; política escolhida: limpar ao mudar contexto. Cmd+A usa eligible IDs, preserva seleção de texto quando foco é input/textarea/contenteditable.
3. Resultado único: {succeededIds, failed:[{id,reason}], conflicts:[{id,currentVersion?}]}. Mutations retornam confirmações, nunca apenas void. Operações de data/hora preservam parte original de cada ação; zero rows é falha/conflito.
4. CAS por item com versão08; fase/categoria/data/hora/responsáveis/cor/Sprint/arquivamento seguem mesmo contrato. Concluir/arquivar limpa Sprint no servidor e no cache.
5. Toast conta succeededIds; remove da seleção só confirmadas, conserva restantes. Falha parcial não trata tudo como rollback completo. Nunca nova tentativa automática de conflito sem decisão de recarga.
6. Gere revisão somente de eligible IDs e chame endpoint05; não gerar URL por IDs.

## Testes e alcance
Interface: provider/menu/hooks reais montados, QueryClient real, SDK externo falso. 5 solicitadas,2 confirmadas,1 conflito,2 erros →toast2 e3 selecionadas; zero elegíveis→zero writes; zero linhas→zero sucesso; filtro muda→seleção vazia; Cmd+A em input mantém texto. Geometria CSS não faz parte deste teste.
NAVEGADOR: N10 do17.

## Acceptance criteria
- [ ] Conjunto vazio nunca vira seleção anterior.
- [ ] Todos os handlers contam IDs retornados.
- [ ] Falhas/conflitos continuam recuperáveis por item.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

