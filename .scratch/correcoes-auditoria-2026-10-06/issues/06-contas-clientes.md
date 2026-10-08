# 06: Administrador cria contas e revoga sessões

> Atualização06/10: correções de código verificadas nesta rodada. Consulte `docs/audits/CURRENT.md` e o fechamento05–09 para evidências e limites; SQL/banco/produção continuam pendentes quando aplicáveis.

**What to build:** Administrador gerencia contas do portal; troca de senha e desativação encerram acesso anterior.

**Blocked by:** 02

**Status revisado em06/10/2026:** parcial — validação/efeitos persistentes e SQL incorretos.

## Execução prescrita
Arquivos: app/models/clients.ts; app/routes/app/admin/clients.tsx; app/routes/app/admin/client/$userId.tsx; api/dash-auth.ts; api/create-user.ts. Criar api/client-accounts.ts.
1. Migrar createClient/updateClient/archiveClient do painel para servidor autenticado com Supabase Auth da equipe. Verificar pessoa admin=true e visible=true antes de qualquer leitura/gravação privilegiada. Remover hash de senha no browser.
2. Usar bcryptjs já instalado, custo12. Novas senhas mínimo8/máximo72 bytes UTF-8. No login, hashes $2a/$2b/$2y seguem bcrypt; legado SHA-256 só compara no servidor e, após sucesso, é migrado com update condicional ao hash legado para evitar sobrescrever troca concorrente.
3. Entrada estrita: name/email/partners/image/password conforme campos atuais; admin nunca recebida da conta cliente. Parceiros devem existir e não estar arquivados. Resposta nunca password_hash.
4. Troca de senha/desativação usa RPC transacional: mudar conta e revogar dash_sessions da conta na mesma transação. Definir funções/migration com execução apenas service_role. Login/retomada verificam conta ativa; reativação não reativa sessões.
5. Senha vazia em update preserva senha; senha não é limpa implicitamente. Não migrar contas sem senha para credencial inventada.
6. Erro de permissão retornado ao painel com mensagem útil; guard é complementar. Falta de banco interrompe operação sem anunciar sucesso.

## Testes e alcance
Interface: client-accounts/dash-auth handlers reais e métodos reais. Testar admin/comum/inativo, hash legado conhecido calculado independentemente, bcrypt válido/inválido, troca e desativação revogando sessões por RPC. A chamada do banco é falsa no teste local: atomicidade é validação real no07.
NAVEGADOR: N02/N06 do17.

## Acceptance criteria
- [ ] Cadastro/edição privilegiados não são feitos pelo SDK do browser.
- [ ] Hash legado migra sem quebrar senha válida e sem corrida com troca.
- [ ] Troca/desativação revogam sessões de forma atômica.
- [ ] Nenhuma resposta expõe hash.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.


## Revisão independente após execução

Leia `docs/audits/2026-10-06-revisao-tickets-05-09.md` a partir da raiz do repositório. A entrega do executor não encerrou todos os critérios deste ticket. Suíte195 passou; typecheck falhouTS7053; banco real/produção não foram homologados. Corrigir os Rxx relacionados ao ticket e registrar teste real por comportamento, distinguindo módulo isolado de integração da gaveta. Esta revisão prevalece sobre alegações gerais de conclusão do retorno.
