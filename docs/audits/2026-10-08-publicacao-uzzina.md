# UZZINA — publicação preparada em 08/10/2026

## Resultado e ordem obrigatória

A etapa compatível do banco foi aplicada em produção. O código novo pode ser publicado após importar as variáveis privadas da UZZINA. A restrição final de permissões deve entrar somente quando a nova versão estiver Ready no endereço oficial.

1. **Já executado pelo Codex:** `supabase/rollouts/prepare-uzzina-release.sql` no projeto `dfepmjcozszswocwvdpq`, em uma transação. Instala sessões/revisões, RPCs administrativas, bootstrap, contador de IA, merge de preferências e trigger canônico de versão. Retira o trigger conhecido que tentava inserir em profiles ausente. Não revoga a escrita de preferências nem os acessos legados de clientes usados pelo app antigo. Novas tabelas privadas não têm acesso de navegador. Leads permanece fechado como homologado.
2. **Proprietário, Vercel do projeto UZZINA:** Settings → Environment Variables → importar `/Users/euchicosousa/vercel/uzzina/.env.vercel-production.local`, ambiente Production, substituindo os valores existentes. Não importar o arquivo da pasta lead. Oito variáveis: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, APP_ORIGIN, AI_DAILY_LIMIT. Nenhuma chave privada pode receber prefixo VITE_. O arquivo está ignorado e protegido; valores não entram neste documento.
3. **Publicar o código:** commit/push na branch de produção e aguardar a Vercel mostrar Ready. URL oficial: `https://uzzina.cnvt.com.br`. Confirmar que se trata do novo commit. Não aplicar a fase2 se o build/deploy falhar; a fase1 mantém a compatibilidade necessária.
4. **Codex, após confirmação de Ready:** aplicar `supabase/rollouts/finish-uzzina-release.sql`, em uma transação, usando a conexão privada já disponível. Essa etapa substitui policies/grants amplos, impede UPDATE direto de preferências, protege pessoas/parceiros/notificações/datas e fecha overloads públicos legados. Não exige senha novamente. Não executar supabase db push/repair indiscriminadamente: o banco não possui histórico de migrations e a fase1 corresponde a partes selecionadas das fontes.
5. **Depois da fase2:** atualizar abas antigas; confirmar login/home, editar ação/data, salvar preferência, IA, administração, portal e revisão pública no site. Repetir negativas de PostgREST e captação Leads. O proprietário pode usar a sessão normal na interface; não enviar senha. Se houver problema, retornar tela/ação/status sem segredos. Só fechar a publicação após essa conferência.

## Evidências observadas

- 267 testes / 0 falhas / 826 asserções; tipagem, Biome e build passam. Aviso de chunks maiores que500kB permanece; não bloqueou build.
- Backup privado novo: `/Users/euchicosousa/Documents/UZZINA-backups/2026-10-08_00-29-18`, archive/schema/roles/índice/manifest. Hashes e leitura integral do archive passaram antes da aplicação. Backup lógico não contém arquivos físicos Storage/Cloudinary ou configurações de painel/Vercel; roles sem senhas. Não anexar ao chat/Git.
- Catálogo atual e dados públicos do backup restaurados somente em PostgreSQL15.1 local descartável. Pais auth representados por UUIDs, sem GoTrue; não é restauração completa de Supabase Auth/plataforma. Cópia não foi enviada ao staging.
- As dez migrations originais e a matriz física passaram na cópia com dados; contagens preservadas. Restauração exigiu remover o SET transaction_timeout do dump18 e suspender triggers apenas durante COPY no banco LOCAL, devido à carga com FKs já criadas. FKs foram recriadas/revalidadas localmente. Isso não foi feito em produção.
- Os dois bundles reais foram ensaiados em uma segunda cópia: fase1 preservou escrita antiga de people.preferences/leitura antiga de clients e permitiu novos bootstrap/merge; fase2 passou na matriz de autorização. Todos os testes locais com fixtures terminaram em ROLLBACK.
- Produção, após fase1: Auth oficial criou/logou uma conta fictícia; bootstrap confirmou identidade e zero parceiros alheios; dois patches de preferências preservaram campos; consume_ai_usage aceitou primeira tentativa e recusou segunda no limite1. Handler real de IA executado localmente com NODE_ENV production/VERCEL e chave moderna: uma geração OpenAI fictícia retornou200 e reserva persistiu. Não foi chamada a API nova da Vercel ainda não publicada. Conta/people/ai_usage descartáveis removidos.
- Contagens finais de produção:4 pessoas,7.131 ações,30 parceiros,3 contas de clientes,2 leads — iguais ao preflight. Funções necessárias presentes; permissão antiga de preferências preservada; novas tabelas privadas fechadas ao anônimo. Nenhuma exclusão de registro real.
- SDK Supabase atual aceitou secret key moderna. Varredura dos valores privados conhecidos: zero ocorrências nos arquivos versionados ou JavaScript do build.

## Contador de IA e produto futuro

consume_ai_usage já pertence ao ticket14: reserva uma tentativa por usuário/dia UTC antes de chamar o provedor, com limite técnico AI_DAILY_LIMIT (padrão100). Não mede tokens/custos e não implementa cobrança, cota comercial por agência ou percentual de consumo. O plano de consumo por agência continua apenas em docs/plans/2026-10-07-consumo-ia-por-agencia.md. Não implementado nesta publicação.

## Controle e limites

O código de aplicação já está no commit local `6e82816`. Durante a conferência, a branch remota ainda apontava para `bf92ee8`; o site publicado servia o build antigo. Este preparo não enviou commits nem publicou o frontend. As cópias de dados e os dois bancos locais descartáveis do ensaio foram removidos; o PostgreSQL temporário foi encerrado. Backups privados originais preservados.

Fontes/bundles com SHA256: `supabase/rollouts/uzzina-release-manifest.json`. Fase1 aplicada; fase2 preparada, não aplicada. Os arquivos de rollout não substituem automaticamente histórico Supabase. SQL usa lock_timeout5s e statement_timeout120s para falhar/rollback em vez de aguardar indefinidamente.

O teste de código e os ensaios do banco não certificam o deploy Vercel, navegador publicado, Safari, telefone físico, upload real nem todos os percursos de foco. A conferência final exige a nova versão publicada. Conexão privada de produção vem de .env.backup.local; não imprimir, versionar ou substituir pela conexão do staging.
