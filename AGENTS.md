# UZZINA — guia para agentes

## Continuidade e escopo

Comece por [CURRENT.md](docs/audits/CURRENT.md), depois leia somente os arquivos e dependências da tarefa autorizada. Consulte relatórios anteriores apenas para resolver uma divergência específica. Ao terminar, atualize CURRENT com resultado, verificação e pendências reais; detalhes de operação ficam no documento correspondente. Ideias de produto registradas não autorizam implementação.

Antes de editar, confira o estado do Git e preserve mudanças externas. Um executor escreve no checkout por vez. Diferencie código preparado, SQL aplicado, teste local, staging e produção; um push não confirma deploy Ready.

## 1. Stack e estrutura

UZZINA é a aplicação existente de gestão de ações da agência CNVT: React, TanStack Router em SPA, TanStack Query, Supabase, Tailwind CSS v4, Prism/React Aria, Tiptap, Cloudinary e OpenAI. Vercel executa o frontend e as APIs.

| Caminho | Responsabilidade |
|---|---|
| `app/routes/` | Rotas; `app/routeTree.gen.ts` é gerado |
| `app/components/prism/` | Primitivos do design system |
| `app/components/uzzina/` | Componentes reutilizáveis de alto nível |
| `app/components/features/` | Fluxos de negócio, incluindo gaveta e upload |
| `app/components/layout/`, `ui-sections/` | Layout e galeria `/ui` |
| `app/hooks/`, `app/lib/` | Estado, cache, preferências e contratos compartilhados; paletas em `lib/palettes.ts`, variáveis CSS em `lib/palette-vars.ts`, rascunho de tema personalizado em `lib/custom-theme.ts` |
| `app/utils/` | Utilitários puros (barrel `~/utils`, `uzzina-utils`, `factory`); `cn` permanece em `~/lib/utils` |
| `app/data/` | Dados preservados sem uso pelo app (`hooks-library.ts`) |
| `app/models/`, `app/services/` | Consultas por entidade e clientes de API |
| `api/`, `server/` | Handlers Vercel, sessão e adaptador local; `server/supabase-admin.ts` (config/cliente service-role) e `server/auth.ts` (token Bearer) são compartilhados pelos handlers de portal/revisão/contas |
| `supabase/`, `tests/`, `scripts/` | Contratos do banco e verificações |

## 2. Convenções e verificação

- Código, arquivos e comentários técnicos novos em inglês; interface em português brasileiro.
- TypeScript estrito: use `unknown` com validação para dados dinâmicos; não introduza `any` nem assertions de não-nulo.
- Use a estrutura existente para corrigir o comportamento; arquitetura adicional exige uma necessidade concreta.
- Correções funcionais precisam de teste que falhe pelo defeito no código real. Controle a fronteira externa necessária; funções copiadas para o teste não comprovam a implementação.
- Execute testes pertinentes, `bun run format`, `bun run lint` e `bun run typecheck`; build quando a mudança afetar execução/publicação. Formatação/ordem de classes Tailwind: Prettier com apenas `prettier-plugin-tailwindcss` (único plugin de parser; outro plugin anula a ordenação). Biome só faz lint (formatter desligado). Não há CI: antes de qualquer push que toque `api/`, `server/`, `app/lib/ai-contract.ts`, arquivos importados pelas APIs ou `package.json`/`bun.lock`, rode `bun run test:serverless` (esperado: 7 PASS). Para documentação isolada, confira referências e diff, sem criar testes que apenas repetem texto.
- HTTP controlado no navegador verifica a interface, mas não certifica o banco/provedor. Inspeção textual de SQL não comprova autorização real. Registre esses limites.

## 3. Contratos de funcionamento

### Equipe, clientes e revisão pública

- `/app` usa Supabase Auth. `app/routes/app.tsx` acompanha getSession/onAuthStateChange e carrega `get_app_bootstrap`. Preserve o singleton em `app/lib/supabase.client.ts` para o refresh de sessão.
- `/dash` usa `/api/dash-auth`, sessão opaca em `dash_sessions` e cookie HttpOnly, separado do Auth da equipe. `/api/dash-data` autoriza leitura; `/api/dash-action` autoriza comentários públicos/anexos. Autor e audiência vêm do servidor; mutações exigem Origin válido. `app/services/dash-client.ts` não acessa diretamente o SDK do banco.
- `/dash/review/$slug?r=token` é público por token. `/api/review` verifica parceiro, expiração e revogação; IDs da URL não autorizam acesso. O layout limpa sessão/cache anterior antes de montar a revisão sem cancelar sua consulta inicial.
- `Content` é compartilhado com portal/revisão: renderize sem providers privados; monte consultas da equipe somente quando o campo e a identidade precisarem delas.
- PATCH administrativo de contas usa `admin_update_client_account`; edição administrativa de pessoas usa `admin_update_person`. Preserve autorização no servidor/banco, além da interface.
- Partners são os clientes comerciais da agência; clients são suas contas externas. O formulário de Leads está no repositório separado `/Users/euchicosousa/vercel/lead`: POST/PATCH por `/api/lead`, cookie HttpOnly/HMAC por lead, Origin exato, schema/limites e DML no servidor. Não reintroduzir acesso anônimo direto à tabela.

### Ações, identidade e cache

- Ações pertencem a parceiros. Preserve a data de execução, responsáveis múltiplos e os estados distintos Feito (`done`) e Concluído (`finished`). Conclusão pertence à ação inteira. Sprint e agrupamentos atuais não são removidos por uma limpeza técnica.
- A policy SELECT de ações deve autorizar pelos campos da própria linha; não consultar a ação por ID em uma função STABLE durante INSERT RETURNING. Criação/duplicação precisam devolver a versão canônica sem ampliar escopo de membros.
- Contexto operacional: `getOperationalPartners` e `QUERY_KEYS.operationalPartners(userId,isAdmin)` excluem arquivados. Administração: `getAllPartners`/`QUERY_KEYS.adminPartners()` preservam arquivados. Invalidar `["partners"]` alcança ambos; não apagar suas ações.
- Home/Hoje/cabeçalho consultam parceiros do escopo e descartam ações exclusivamente de parceiros ocultos. Endpoints do portal aceitam parceiros ativos vinculados à conta.
- Rascunho de "Nova ação": todos os pontos usam `createActionDraft` e `resolveDraftPartners` (`app/utils/factory.ts`); a gaveta identifica rascunho pela ausência de `id`. Componentes e rotas não chamam `.from()` diretamente: use `app/models/` (`actions`, `partners`, `people`).
- Listas usam `QUERY_KEYS.actions.list` com identidade, papel, parceiros e período/regra de atraso. Criação/duplicação/edição entram após confirmação; rascunhos ficam na gaveta. Preview de arraste pertence à operação. Não restaurar snapshots completos após uma falha antiga.
- Atualização de lista exige escopo conhecido e versão canônica; escopo desconhecido é invalidado. Comparação de conflitos preserva o controle de versão no coordenador; data/rótulos/nomes são formatados, HTML sanitizado e legenda literal.
- Chaves privadas incluem identidade/audiência. Prefixos gerais servem para invalidação. `resetQuerySession` limpa queries/mutations e avança a geração; callbacks antigos ignoram resultados. Providers remontam por identidade; bootstrap verifica geração e ID retornado.
- Lote/duplicação conferem continuidade da sessão antes da próxima escrita. Limpar cache não desfaz uma escrita já enviada. Sessão do portal e token de revisão têm chaves separadas.

### Preferências e visual

- HeaderMenu usa `usePreferencePersistence`/`createPreferencePersistence`: debounce250ms, uma escrita em voo, último patch por campo, falha preservada e retry explícito. Perfil também usa `update_my_preferences(p_patch)`; preserve o merge autorizado por auth.uid() e campos desconhecidos existentes.
- Temas usam localStorage e `people.preferences`; perfil oferece preview antes de salvar. O script síncrono de `index.html` aplica tema antes do React.
- Cloudinary usa cloud name/upload preset no widget. Mantenha o widget montado durante uploads múltiplos; close pode preceder os últimos eventos success. API secret não pertence a variáveis VITE_.

### IA e ambientes

- `app/lib/ai-contract.ts` valida os contratos. Segredos OpenAI/Supabase ficam no servidor.
- Imports relativos de valores nas APIs usam o caminho `.js` emitido pelo build de funções ESM. Confira o pacote com `bun run test:serverless`: Bun/Vite e testes com mocks não certificam a resolução pelo Node publicado.
- `bun run dev` roda `vite --mode staging` e usa apenas o banco de staging (`.env.staging.local`); não existe modo local para produção e não deve haver `.env` com produção na pasta (o Bun o pré-carregaria sobre o modo).
- Compatibilidade local só ocorre com NODE_ENV development, `UZZINA_LOCAL_AI_COMPAT=true` e sem VERCEL. O adaptador ativa a flag apenas no modo development; usa chave pública/Bearer e membro ativo, sem `consume_ai_usage`.
- Staging/Vercel/produção usam reserva persistente via `consume_ai_usage` antes da geração. Falha da RPC retorna503/AI_QUOTA_UNAVAILABLE; limite esgotado retorna429. Sem contador em memória ou fallback por erro.
- `ai_usage` registra usuário/dia UTC/tentativas; AI_DAILY_LIMIT padrão100, intervalo1–10000. Isso é limite técnico, distinto da proposta futura de medição por agência/modelo/token.
- Fontes e finalidade dos envs estão no README. Não imprimir/versionar segredos nem pedir credenciais já disponíveis. Preferir Node para iniciar staging: Bun pode pré-carregar .env e sobrepor o modo.

### Banco e implantação

- `get_app_bootstrap(UUID)` retorna JSONB. A migration de compatibilidade remove somente o trigger legado conhecido que escrevia em profiles ausente; administração cria Auth antes de preencher people.
- Controle de concorrência usa um único trigger/versão UTC em updated_at timestamp sem timezone; preserve a data de execução e a compatibilidade com moddatetime legado.
- Contratos de autorização: datas comemorativas com escrita administrativa; notificações pelo destinatário ativo autorizado à ação, UPDATE apenas de read_at e menção/autoria/escopo verificados pelo servidor/banco.
- As migrations incrementam o catálogo existente; não constituem sozinhas um schema inicial completo. SQL versionado não confirma aplicação. Consulte CURRENT e o manifest do rollout antes de publicar ou alterar permissões.
- Produção usa PostgreSQL15; staging cloud usa17. `supabase/config.toml` major15 configura o ambiente local, não os serviços cloud. Bootstrap/manifest em supabase/staging são exclusivos do staging; versões remotas diferem dos nomes locais.
- Não executar db push/repair/reset cegamente: produção foi atualizada por bundles parciais, sem histórico de migrations. Publicação exige verificar nova versão Ready antes de restringir os acessos legados.

## 4. Manutenção de documentação

Documente contratos vigentes aqui, operação no README e status/pendências em CURRENT. Ideias futuras permanecem separadas em docs/plans, sem implementação automática.

Ao adicionar/modificar tabelas ou models, atualize este guia e `~/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`. Novas rotas/portais/fluxos exigem atualização do guia e do KI correspondente, incluindo `uzzina-architecture/artifacts/architecture.md`. Novos componentes Prism/Uzzina também entram na galeria `/ui`.

## 5. Design system: Prism

Preserve o estilo próprio, temas e paletas OKLCH da UZZINA. Novos primitivos ficam em `app/components/prism/`, exportados por index.ts, com React Aria Components, CVA e `cn()` de `~/lib/utils`. Componentes de negócio reutilizam esses primitivos. Consulte implementação e `/ui` para props e variantes atuais.

| Token | Uso |
|---|---|
| bg-background / bg-card / bg-input | Página, painéis e campos |
| text-foreground / text-muted-foreground | Texto principal e secundário |
| border-border / border-input | Bordas |
| bg-primary / text-primary-foreground | Ação principal |
| border-ring / ring-ring/50 | Foco |
| text-error / bg-error-background | Erro |
| text-success / bg-success-background | Sucesso |
| text-warning / bg-warning-background | Aviso |
| text-info / bg-info-background | Informação |

Use estados React Aria data-[hovered], data-[pressed], data-[focused] e data-[disabled]. Ícones Lucide novos seguem sufixo Icon; botões definem tamanho padrão e focus ring. PrismInput aplica foco/erro ao Group que inclui prefixo/sufixo. PrismAlert reúne ícone, título e descrição por variante. Componente composto precisa de verificação própria de foco/teclado, além das garantias dos primitivos.

`/ui` reúne tokens, componentes Prism e componentes Uzzina; novas seções ficam em app/components/ui-sections e são integradas à rota.
