# 10: Mudanças otimistas respeitam cada lista

**What to build:** Criar, duplicar, mover e falhar não produzem cards indevidos nem desfazem trabalho posterior.

**Blocked by:** 08

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: app/hooks/useActionMutations.tsx; app/lib/query-keys.ts; app/lib/supabase.mutations.ts.
1. Mover IDs temporários para início da mutation: uma identificação crypto.randomUUID por operação, usada em todas as listas. Reconciliar temporário→persistido na resposta, nunca criar por relógio dentro de updater.
2. Definir descritor de escopo nas keys: audiência/usuário, tipo de lista, período from/to, parceiro/filtros relevantes. Separar prefixo lateActions de actions ou executar uma única visita por key, sem atualizar atrasados duas vezes. Migrar consumidores juntos mantendo build.
3. Inserir/mover apenas se dados satisfazem escopo completo; se algum filtro/escopo não puder ser determinado, invalidar a lista em vez de assumir pertinência. Ideia/arquivamento/conclusão seguem regras atuais de cada visualização.
4. Rollback por operação e campos: restaurar somente alterações cuja revisão ainda é da operação falha. Snapshot inteiro não pode substituir mudança posterior. Registrar journal de optimistic patches por ID/operationId e recomputar do estado canônico + pendências. Não misturar revisão de banco com ID da operação.
5. Confirmado: atualizar versão/canonical e retirar somente patch daquela operação. Conflito: retirar seu patch sem descartar rascunho do09.
6. Duplicação: chamar duplicateActionClient real; título Cópia e dados persistidos/otimistas vêm do contrato da produção. Manter uma duplicata por operação.

## Testes e alcance
Interface: useActionMutations real com QueryClient real e SDK externo falso. Preparar listas HojeA, outrodia, outroparceiro, atrasados. Criar A não entra em outrodia/B; duplicar aparece uma vez; falha de op1 depois de sucesso op2 não desfaz op2; concluir sai dos atrasados e Sprint, continua onde concluídas são visíveis.
NAVEGADOR: N09 do17.

## Acceptance criteria
- [ ] Uma operationId/tempId por mutation.
- [ ] Listas não recebem dados fora do escopo.
- [ ] Rollback antigo não restaura snapshot sobre sucesso novo.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

