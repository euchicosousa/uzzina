# 07: Autorizações reproduzíveis no banco

**What to build:** Operações diretas proibidas são recusadas pelo banco, inclusive fora da interface, com migrations verificáveis.

**Blocked by:** 03, 04, 05, 06

**Status revisado em06/10/2026:** não aprovado — policies/matriz/inventário pendentes ou defeituosos.

## Execução prescrita
Arquivos: supabase/rpc_functions.sql; supabase_update_get_home_actions.sql; types/database.ts; APIs02–06. Criar scripts de inspeção read-only, migrations e script de teste em banco descartável.
1. Inventariar por SELECT pg_proc/pg_policies/grants/triggers as definições existentes. Sem acesso, produzir o script, registrar sua execução pendente e trabalhar com as tabelas/tipos locais. Nunca inventar inventário de produção.
2. Remover acesso anon a actions,partners,clients,people,action_comments e às RPCs privadas; acesso público de revisão passa exclusivamente pelo05. Policies de authenticated: pessoa ativa; admin gerencia agência atual; colaborador lê/escreve ações onde user_id está em responsibles. Cadastro de people/clients/partners somente admin. Não criar multitenancy aqui.
3. Proteger flags admin/user_id contra promoção pelo próprio colaborador. Alteração de preferences do próprio usuário tem caminho permitido e projeção restrita. Não dar UPDATE de toda a tabela para viabilizar uma coluna: usar privilégio de coluna/RPC restrita e revisar efeitos nos callers.
4. get_home_actions deriva auth.uid(); parâmetro legado p_user_id, se mantido por compatibilidade, deve coincidir com auth.uid(). Verificar admin no servidor; parceiro enviado só restringe, não amplia. Canonicalizar assinatura de cinco parâmetros e regras atuais phase/arquivamento.
5. Toda SECURITY DEFINER usa search_path fixo e tabelas qualificadas; grants mínimos. Remover sobrecargas inseguras somente após inspecionar assinaturas/callers. Sem RLS-bypass por parâmetro enviado.
6. Matriz real: anon, membroA responsável por açãoA, membroB responsável porB, admin ativo, membro inativo, clienteA via endpoint e token de revisão. Cobrir leitura/escrita, notas internas, conta e promoção admin. Rollback/limpeza só no banco de teste.
7. Atualizar tipos segundo migration/banco de teste; identificar tipos preparados offline como tal.

## Testes e alcance
Interface: SQL real e endpoints reais ligados a banco descartável. Mocks não encerram este ticket. Preparar script executável + fixtures sem dados reais. ClienteA→açãoB, anon→nota e membroA→admin devem ser negados.
NAVEGADOR: N06; PRODUÇÃO separada.

## Acceptance criteria
- [ ] Migration tem ordem/rollback planejado e mantém funções usadas.
- [ ] Matriz permitido/negado é executada no banco de teste ou fica explicitamente pendente.
- [ ] Nenhuma alegação de segurança em produção sem inventário/grants reais.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.


## Revisão independente após execução

Leia `docs/audits/2026-10-06-revisao-tickets-05-09.md` a partir da raiz do repositório. A entrega do executor não encerrou todos os critérios deste ticket. Suíte195 passou; typecheck falhouTS7053; banco real/produção não foram homologados. Corrigir os Rxx relacionados ao ticket e registrar teste real por comportamento, distinguindo módulo isolado de integração da gaveta. Esta revisão prevalece sobre alegações gerais de conclusão do retorno.
