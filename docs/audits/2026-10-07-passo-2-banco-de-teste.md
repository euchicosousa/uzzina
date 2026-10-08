# Passo2 — preparação e execução do pacote em PostgreSQL descartável

Atualização posterior em07/10: o staging Supabase separado foi preparado via MCP em PostgreSQL17.11. A seção de integração abaixo descreve o estado anterior; consulte [a entrega cloud](2026-10-07-staging-supabase.md) e CURRENT para o que foi aplicado/verificado e o que permanece pendente. Produção continua intacta.

07/10/2026. HEAD inicial/final0f8c637ee7da38d25b0b54a8cb290ff47984ae01. Mudanças anteriores preservadas; nenhum commit/deploy ou conexão com produção.

## Resultado

**Ambiente PostgreSQL local preparado e pacote executado do zero: passou.** Compilado PostgreSQL15.1 oficial em `/tmp/uzzina-pg15-runtime`, versão do catálogo enviado, sem Homebrew global/Docker/serviço de inicialização. Download SHA256 conferido com o arquivo oficial. Instância usa somente socket privado em `/tmp/uzzina-pg15-runtime/socket`, porta55432, sem listener TCP. Foram usados somente metadados e dados fictícios.

**Não é um projeto Supabase completo.** O baseline reconstrói colunas/tipos/defaults/constraints/índices/policies/funções/triggers exportados; não é dump integral nem cópia dos dados, não inclui todos os atributos de tipos, schemas e plataforma. `auth.users` é mínimo e `auth.uid()` lê a claim da conexão para testar o contrato; não há GoTrue/JWT de produção/PostgREST/API Vercel. O engine que executa constraints, RLS, grants, transações e locks é PostgreSQL real15.1. Homologação integrada ainda exige ambiente Supabase separado.

## Correções executadas

| Arquivo | Mudança |
|---|---|
| `supabase/migrations/20261006030000_database_authorization.sql` | Bootstrap permanece JSONB, sem DROP da função; construção/variáveis compatíveis. |
| `supabase/migrations/20261006005000_auth_trigger_compatibility.sql` | Remove somente trigger conhecido que insere em profiles ausente; recusa definição desconhecida. Não cria people automaticamente: formulário já insere o registro completo após criar credenciais. |
| `supabase/migrations/20261006040000_action_concurrency.sql` | Reconcilia handle_updated_at_actions/moddatetime; recusa outros donos conhecidos do timestamp; valida tipo exportado; UTC sem timezone para updated_at. Não converte actions.date. |
| `scripts/test-database-matrix.sql` | Fixtures incluem colors/created_at/updated_at obrigatórios. Testes PostgreSQL de timestamp/CAS, grants, defaults, calendário e notificações. |
| `supabase/migrations/20261007030000_ancillary_authorization.sql` | Calendário administrativo; notificações por destinatário/menção/autoria/ação, UPDATE somente read_at; revoga TRUNCATE/REFERENCES/TRIGGER de8 tabelas; defaults mínimos do owner postgres. |
| `types/database.ts` | Tipo offline da RPC auxiliar can_notify_mention. Não é geração a partir de produção. |
| `supabase/config.toml` | Major15 conforme banco exportado. Nenhum Supabase local iniciado. |

Nenhuma tela/hook/controlador novo foi introduzido. Arquivos novos de Python abaixo são instrumentos de teste SQL, não infraestrutura runtime do app:
- `build-db-test-baseline.py`: transforma CSV de catálogo em schema descartável sem linhas reais. Guard rejeita banco sem prefixo uzzina_test_.
- `check-db-package.py`: cria banco novo, aplica9 migrations em ordem, roda matriz e duas conexões, verifica limpeza e remove banco se tudo passa; preserva banco/logs em falha.
- `check-db-concurrency.py`: quota/preferências com duas conexões reais; observa pg_stat_activity para confirmar espera por lock.

## Falhas reproduzidas antes da correção

1. Insert fictício em auth.users: `relation "public.profiles" does not exist`, originado em handle_new_user. Transação recusada; nenhum usuário real envolvido.
2. Pacote original contra schema exportado: `cannot change return type of existing function` ao substituir get_app_bootstrap(UUID).
3. Matriz ampliada antes de hardening: `Browser role can truncate actions`.

Após correção, runner completo executou em banco novo e passou. Ajustes de fixtures e timestamp também passaram na matriz; não foram declarados reproduzidos isoladamente antes da correção.

## Evidência PostgreSQL observada

-9 migrations aplicadas na ordem dos nomes, contra retorno JSONB/trigger legado/colunas do baseline, não somente schema vazio.
- Fixtures de auth.users e people criadas sem trigger profiles; transação inteira da matriz terminou em ROLLBACK.
- Anon recusado para ações/parceiros; membroA acessa sua ação e não lê/escreve ação/nota deB; bootstrap com identidade forjada recusado.
- Promoção a admin recusada; inativo sem ações; admin com acesso esperado.
- Um trigger de timestamp, versão controlada pelo servidor e crescente, condição de versão antiga afeta zero linhas; data de execução preservada.
- Quota esgotada recusada, isolada por pessoa, inativo recusado, função privilegiada fora das roles de navegador.
- Preferências mantêm campos anteriores/desconhecidos; tipos/chaves indevidos e escrita direta recusados.
- TRUNCATE sem grants para anon/authenticated nas8 tabelas; probe nova de owner postgres não herda SELECT/UPDATE de navegador.
- Colaborador não cria data administrativa; inativo não lê datas/notificações.
- Autor cria notificação por menção real de um segundo responsável autorizado; remetente não lê a notificação do destinatário; destinatário lê e marca read_at. Não mencionado, autoria alheia e reatribuição de destinatário recusados.
- **Duas conexões/locks reais:** segunda reserva da quota espera a primeira e retorna false; attempts final1. Patches simultâneos de preferências esperam e preservam theme/themeColorIndex/futureKey.
- Após matriz/concurrency, auth.users/people/actions/ai_usage: zero linhas de fixture. Banco da execução final foi removido pelo runner.

Últimos logs: `/var/folders/qd/fccnsjv97n5c1cj8lx38sg6w0000gn/T/uzzina-db-check-9lzgregd`. Logs são evidência local, não devem ser enviados para produção.

Código:249 testes/0 falhas,739 asserções/20 arquivos(16,43s). Tipagem/lint passam,269 arquivos sem avisos. Build passa, aviso de chunk>500kB existente. Esses resultados são separados dos testes PostgreSQL. Sem jsdom fingindo autorização de banco.

## Integração externa de leads — pendência preservada

Proprietário informou formulário externo; encontrado `/Users/euchicosousa/vercel/lead/src/lib/leads.ts`: browser anon insere lead e recebe `.select('id').single()`, depois atualiza por ID ao longo do formulário. Fechar SELECT/UPDATE anônimo agora quebra o fluxo.

**Nenhuma mudança foi escrita nesse projeto externo.** Policies e DML atuais de leads ficaram preservados; só os privilégios extras TRUNCATE/REFERENCES/TRIGGER foram revogados no pacote. A exposição anônima de leitura/alteração do cadastro permanece e NÃO é aprovada como segura.

A correção exige contrato coordenado no formulário (API/sessão ou credencial específica do rascunho) e banco, seguido de teste real criar→responder→concluir. Não publicar o hardening parcial como proteção integral do banco. Essa integração precisa de entrega própria, sem bloquear o teste das outras migrations.

Defaults de `supabase_admin` não foram alterados: pertencem à plataforma e exigem conferir privilégios/ownership no ambiente Supabase. Defaults de postgres foram corrigidos e testados, pois este é o owner das8 tabelas exportadas. RLS não foi forçada para owners/backend indiscriminadamente.

## Reproduzir o teste local

Com instância temporária15.1 disponível:

```bash
python3 scripts/check-db-package.py /tmp/uzzina-pg15-runtime/install/bin /tmp/uzzina-pg15-runtime/socket /caminho/inventory.csv
```

O runner usa só socket explícito e bancos novos uzzina_test_; não aceita string de conexão de produção. Para iniciar novamente a instância preparada:

```bash
/tmp/uzzina-pg15-runtime/install/bin/pg_ctl -D /tmp/uzzina-pg15-runtime/data -l /tmp/uzzina-pg15-runtime/server.log -o "-k /tmp/uzzina-pg15-runtime/socket -h '' -p 55432" start
```

Instância temporária será parada ao final desta rodada; fonte/binários permanecem em/tmp para continuidade e não entram no app/repositório. PostgreSQL15.1 antigo foi usado apenas para reproduzir a versão exportada, sem exposição TCP; isso não recomenda instalar essa minor em produção nova.

## O que falta para completar o ambiente de integração

1. Disponibilizar **projeto Supabase de teste separado**. Nenhum acesso administrativo/cloud foi recebido, projeto pago não foi criado e env atual não foi trocado.
2. Copiar schema compatível por mecanismo de dump/restore ou branch oficial, sem reutilizar credenciais reais de clientes. O baseline auth mínimo deste teste **não deve ser aplicado no Supabase real**.
3. Inventariar também ownership/defaults da plataforma, aplicar pacote corrigido no staging e validar via GoTrue/PostgREST/API real; somente depois testar UI usando esse ambiente.
4. Tratar a integração externa de leads junto. Há pendência de autorização, não uma aprovação silenciosa das antigas policies.

Portanto a preparação/executabilidade PostgreSQL local está concluída; criação do staging Supabase e fechamento de leads estão explicitamente pendentes. Passo3 (integração real) e produção continuam não aprovados.
