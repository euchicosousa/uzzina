# UZZINA - Guia para Agentes de IA

## Continuidade da auditoria

Comece por [docs/audits/CURRENT.md](docs/audits/CURRENT.md), depois leia somente o ticket autorizado e seus arquivos/dependências. Relatórios antigos são histórico; consulte-os para resolver divergências específicas. Atualize CURRENT e o resultado do ticket ao terminar.

Contratos novos preparados: PATCH de contas usa `admin_update_client_account`; edição administrativa de pessoas usa `admin_update_person`; ambos exigem migrations compatíveis. SQL local não significa banco de produção atualizado.

Este repositório contém o sistema **UZZINA**, um painel e fluxo de gestão de projetos (sprints, ações criativas e calendário) para a agência criativa (CNVT®).

---

## 1. Stack de Tecnologias

- **Framework**: TanStack Router (SPA) com rotas fortemente tipadas.
- **Database & Auth**: Supabase (PostgreSQL) + Supabase Auth.
  - _Cliente Supabase_: A inicialização do cliente no navegador (`app/lib/supabase.client.ts`) é feita como **Singleton** para garantir que o timer do `autoRefreshToken` funcione de forma correta e ininterrupta.
- **Estilização**: Tailwind CSS v4 (com classes estendidas como `squircle` e `border_after` declaradas no `tailwind.css`).
- **Deploy**: Vercel. A pasta `/dist/` e artefatos de build estão ignorados no git para evitar envio de segredos.
- **Storage**: Imagens hospedadas via Cloudinary. O widget de upload é mantido montado no DOM para uploads múltiplos robustos e sem interrupções.
- **AI**: OpenAI API.
- **Rich Text Editor**: Tiptap v3 com suporte a BubbleMenu contextual para tabelas (ChevronDown/ChevronRight/Rows/Columns/Trash2), Links com estilo visual destacado e Highlights de texto.

---

## 2. Estrutura do Diretório Principal (`app/`)

- `app/routes/`: Telas e rotas da aplicação mapeadas por arquivo (`__root.tsx`, `app/`, `dash/`, etc.) gerando a árvore em `app/routeTree.gen.ts`.
- `app/components/`:
  - `prism/`: **Design system proprietário** do Uzzina. Primitivos de UI construídos com React Aria Components + CVA. Ver seção 5.
  - `uzzina/`: Elementos reutilizáveis do design system (ex: `UAvatar`, `UBadge`, `CloudinaryUpload`).
  - `features/`: Componentes e fluxos de regras de negócio (Kanban, Calendário, Gaveta de Ações, etc.).
  - `layout/`: Estruturas de layout (`Header`, `AppBar`, etc.).
  - `ui-sections/`: Seções demonstrativas do Design System para a rota `/ui`.
- `app/models/`: Consultas e operações Supabase organizadas por entidade (executadas via RPC ou SDK no client/serverless).
- `app/services/`: Serviços auxiliares (ex: `ai-client.ts`).
- `app/hooks/`: Hooks React customizados (ex: `useAppTheme`, `useActionMutations`, `useMultiSelection`).
- `app/lib/`: Configurações de preferências, constantes de domínio (`CONSTANTS.ts`), instância singleton do Supabase (`supabase.client.ts`) e cliente TanStack Query (`query-client.ts`).
- `api/`: Serverless Functions da Vercel (ex: `/api/ai`, `/api/create-user`).

---

## 3. Diretrizes e Convenções Principais

### Idioma de Desenvolvimento

- **Código-fonte**: Nomes de variáveis, tabelas, colunas, funções, comentários técnicos e arquivos devem ser criados em **Inglês (EN)**.
- **Interface (UI)**: Textos e termos renderizados na tela (labels, botões, alertas, modais) devem ser escritos em **Português do Brasil (PT-BR)**.

### Separação de Portais e Autenticação

- **Membros da Equipe (`/app`)**: Autenticado via Supabase Auth. Na inicialização do layout `app/routes/app.tsx`, a sessão é validada via `supabase.auth.getSession()` e sincronizada com `onAuthStateChange`. O bootstrap carrega dados do usuário via RPC `get_app_bootstrap`.
- **Clientes Externos (`/dash`)**: Login/retomada/logout por `/api/dash-auth`, sessão opaca de servidor em `dash_sessions` e cookie HttpOnly; isolado do Supabase Auth da equipe. `/api/dash-data` autoriza parceiros/ações; `/api/dash-action` autoriza comentários públicos e vínculo de anexos. A tela `/dash/action/$id` usa `app/services/dash-client.ts`, sem acesso direto ao SDK do banco. Autor e audiência de comentários são definidos pelo servidor, com Origin obrigatório em mutações. O adaptador local em `server/dev-api.ts` executa os mesmos handlers. Banco/RLS e produção ainda exigem as validações do pacote de auditoria (02–07); não tratar o portal inteiro como protegido antes disso.

### Revisão pública por link

`/dash/review/$slug?r=token` não exige sessão de cliente. O layout reconhece a rota confirmada e só monta a revisão após limpar a sessão/cache anterior, evitando cancelar a consulta inicial. Isso não libera `/dash/action/$id` ou o portal: esses continuam exigindo cookie verificado. A leitura pública ocorre exclusivamente via `/api/review`, que valida token, parceiro, expiração e revogação; `ids` não autoriza acesso.

### Parceiros arquivados e cache

- Listas da equipe usam `QUERY_KEYS.actions.list` com usuário/admin, parceiros e período/regra de atraso. Criação/duplicação/edição entram na lista após confirmação; rascunho permanece na gaveta. Não reintroduzir cards temporários ou rollback de snapshots. Atualização de lista exige escopo conhecido e versão canônica; desconhecido é invalidado.

- O contexto operacional usa `getOperationalPartners`, filtra `partners.archived` e mantém cache `QUERY_KEYS.operationalPartners(userId,isAdmin)`. Nunca usar `getAllPartners` nessa lista, mesmo para administrador.
- A administração usa `QUERY_KEYS.adminPartners()` e mantém arquivados disponíveis. Invalidar o prefixo `["partners"]` alcança ambos os caches.
- Home/Hoje/cabeçalho usam escopo de parceiros nas consultas e descartam ações exclusivamente de parceiros ocultos. Endpoints do portal usam somente parceiros ativos vinculados à conta. Não apagar ações de parceiros arquivados.

### AI quota and deployment

- AI requests use the shared strict `app/lib/ai-contract.ts`. Quota and service-role credentials stay on the server.
- **Exceção de compatibilidade local**: No modo de desenvolvimento local do Vite (`NODE_ENV === "development"`, flag interna `UZZINA_LOCAL_AI_COMPAT === "true"` e sem `VERCEL`), o adaptador ativa compatibilidade explícita local utilizando chave pública (`SUPABASE_PUBLISHABLE_KEY || VITE_SUPABASE_ANON_KEY`) e Bearer token para verificação de usuário ativo, sem chamar a RPC `consume_ai_usage`. Essa exceção existe exclusivamente para restaurar a execução no Vite local habitual com o `.env` original.
- **Modo estrito obrigatório (Staging, Vercel e Produção)**: Em qualquer outro ambiente (`--mode staging`, Vercel, produção, ou sem a flag de compatibilidade), `consume_ai_usage` no servidor reserva obrigatoriamente uma tentativa antes da geração pela OpenAI; não há contador em memória nem fallback por erro (ausência ou falha de RPC falha fechada com 503/AI_QUOTA_UNAVAILABLE; quota esgotada retorna 429).
- Tabela preparada `ai_usage` armazena `(user_id, usage_day UTC, attempts)`; migration `20261007010000_ai_usage.sql` foi aplicada no staging e banco de teste, mas NÃO em produção. Deploy da API requer migration compatível.
- `AI_DAILY_LIMIT` tem padrão 100 (inteiro 1–10000), renovando às 00:00 UTC.
- Testes de código da compatibilidade local e do modo estrito verificados (10 casos); validação com navegador/usuário real em ambiente local e no staging permanecem pendentes.

### Identity and private cache

- Private query keys include audience/current authenticated identity. General entity prefixes are invalidation filters, not data queries.
- `resetQuerySession` clears queries/mutations and advances the cache generation; pending callbacks must ignore results from an ended generation. Providers remount by identity. Bootstrap validates both generation and returned user ID.
- Bulk/duplicate writes check session continuity before the next write; already dispatched writes cannot be undone by clearing browser cache.
- Portal identity comes from server session verification; review/token keys remain separate. Operational partners are seeded only after a validated bootstrap, then observed through their reactive query.

### Banco de teste — compatibilidade com o inventário de07/10/2026

O inventário exportado é PostgreSQL15.1. O pacote foi executado localmente em PostgreSQL15.1 descartável, com catálogo reconstruído sem dados e adaptador mínimo de `auth.uid()`; isso não certifica GoTrue/PostgREST/Vercel/produção. `supabase/config.toml` acompanha major15.

`get_app_bootstrap(UUID)` mantém retorno JSONB. A migration `20261006005000_auth_trigger_compatibility.sql` retira somente o trigger legado conhecido que escrevia em profiles ausente; o formulário administrativo continua criando credenciais antes de inserir os campos completos em people. Concorrência reconcilia moddatetime legado e usa um único trigger/versão UTC em updated_at timestamp sem timezone, sem converter a data de execução.

`20261007030000_ancillary_authorization.sql`: datas comemorativas com escrita administrativa; notificações lidas somente pelo destinatário ativo autorizado à ação, alteração só de read_at e inserção por menção/autoria/escopo verificados em `can_notify_mention`. Revoga TRUNCATE/REFERENCES/TRIGGER das roles do navegador e ajusta defaults do owner postgres. Defaults de supabase_admin seguem pendentes de revisão na plataforma.

Leads têm integração externa em `/Users/euchicosousa/vercel/lead` usando INSERT/SELECT(id)/UPDATE por ID. Suas policies/DML não foram fechadas nesta rodada para não quebrar captação. Exposição anônima de leads **continua pendente** e exige mudança coordenada no formulário; nunca declarar o banco inteiro seguro por estes testes.

Reprodução e limites: `docs/audits/2026-10-07-passo-2-banco-de-teste.md`; runner `scripts/check-db-package.py`. Produção não alterada.

### Supabase de staging — atualização de07/10

Projeto `zacrrtilppvekiyoybzn` preparado via MCP em PostgreSQL17.11, com11 tabelas e9 migrations existentes após bootstrap de aplicação. Auth oficial preservado. `supabase/staging/bootstrap.sql` e applied-manifest.json são exclusivos desse projeto vazio; não são migrations de produção. Versões remotas atribuídas pelo MCP diferem dos nomes locais: não rodar db push/repair cegamente.

Matriz SQL com ROLLBACK e chamadas anônimas reais de PostgREST passaram. Testes autenticados GoTrue/JWT/app/API e concorrência cloud continuam pendentes. Leads estão fechados nesse staging, sem certificar ou alterar o formulário externo/banco atual. Defaults de supabase_admin preservados; Advisor mantém8 avisos de SECURITY DEFINER autenticado intencional, a revisar conforme relatório cloud.

`.env.staging.local` ignorado separa URL/chave publicável; service/OpenAI vazias. Inicializar com `node node_modules/vite/bin/vite.js --mode staging --host 127.0.0.1 --port 5180 --strictPort`: Bun1.2.19 pode pré-carregar .env atual e sobrepor o modo. Não apontar o app atual/formulário externo para staging nem pedir segredos no chat. Detalhes e pendências: docs/audits/2026-10-07-staging-supabase.md. Declarações de migrations não aplicadas em produção continuam válidas; agora aplicadas no staging separado.

### Temas e Preferências

- O visual suporta modo Light/Dark e 12 paletas de cores harmônicas OKLCH (mapeadas em `app/lib/CONSTANTS.ts`).
- **Persistência**: As preferências do usuário são sincronizadas via `localStorage` e salvas no banco de dados (`people.preferences`).
- **Perfil (`/app/profile`)**: Oferece pré-visualização instantânea (usando `previewColorIndex()` e `previewTheme()` do hook `useAppTheme`) antes de persistir as alterações.
- **Flicker Prevention**: `index.html` contém um script síncrono inline no `<head>` que lê o `localStorage` e injeta as variáveis CSS OKLCH e classes de tema antes do React ser montado.

### Qualidade de Código e Tipagem Estrita

- **Sem `any`**: Nunca utilize `any`. O código TypeScript deve ser estritamente tipado. Use `unknown` com verificações de tipo (type guards) se os dados forem dinâmicos.
- **Sem Assertions de Não-Nulo (`!`)**: Nunca use asserções não-nulas (`!`) ou truques de tipagem como `null!`. Prefira usar getters seguros, inicializações opcionais ou validações explícitas de presença.
- **Conformidade com o Linter (Biome)**: Todas as alterações devem passar no comando `bun run lint` e no compilador `bun run typecheck`. Certifique-se de que não restem avisos ou erros.

---

### Preferências — contrato preparado no ticket15
HeaderMenu usa `usePreferencePersistence`/`createPreferencePersistence`: debounce250ms, um write em voo, último patch por campo, falha preservada e retry explícito. Perfil também envia preferências via `update_my_preferences(p_patch)`; não substituir JSON diretamente. RPC deriva dono de `auth.uid()`, valida chaves/tipos, preserva campos desconhecidos existentes e faz merge transacional. `20261007020000_preferences_merge.sql` revoga UPDATE direto da coluna preferences; exige migration07 compatível. Migration local NÃO aplicada/homologada; sem RPC, salvar preferências falha e mantém tentativa recuperável. Não publicar frontend separadamente do banco necessário.

## 4. Manutenção de Documentação (IMPORTANTE)

Sempre que realizar alterações estruturais no projeto:

1. **Banco de Dados/Models**: Se adicionar/modificar tabelas ou models, atualize a seção correspondente no `AGENTS.md` e o Knowledge Item em `~/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`.
2. **Rotas/Arquitetura**: Se criar novas rotas ou portais, atualize `AGENTS.md` e o Knowledge Item em `~/.gemini/antigravity-ide/knowledge/uzzina-architecture/artifacts/architecture.md`.
3. **Novos Componentes Prism**: Se adicionar primitivos ao `app/components/prism/`, atualize a seção 5 deste arquivo.
4. **Novos Fluxos**: Mantenha os KIs correspondentes atualizados para garantir que o contexto do projeto continue correto nas próximas sessões.

---

## 5. Design System: Prism

O **Prism** é o design system proprietário do Uzzina. Todos os novos componentes de UI devem ser criados dentro de `app/components/prism/` e exportados pelo barrel `app/components/prism/index.ts`.

### Fundamentos

- **Base**: React Aria Components (`react-aria-components`) para acessibilidade nativa (estados `data-[hovered]`, `data-[pressed]`, `data-[focused]`, `data-[disabled]`, etc.).
- **Variantes**: `class-variance-authority` (CVA) para variantes de estilo declarativas.
- **Utilitário**: `cn()` de `~/lib/utils` para merging condicional de classes.
- **Tokens visuais**: Classes semânticas OKLCH do `tailwind.css` (ver abaixo).
- **Ícones**: Lucide React (`lucide-react`) utilizando a convenção com o sufixo `Icon` (ex: `XIcon`, `CheckIcon`). Tamanho padrão automático nos botões: `size-5` (via `[&_svg:not([class*='size-'])]:size-5`).

### Tokens de Cores OKLCH (tailwind.css)

| Token                                       | Uso                                   |
| ------------------------------------------- | ------------------------------------- |
| `bg-background`                             | Fundo da página                       |
| `bg-card`                                   | Cards e painéis                       |
| `bg-input`                                  | Fundo de campos de formulário         |
| `text-foreground` / `text-muted-foreground` | Texto primário / secundário           |
| `border-border` / `border-input`            | Bordas padrão / bordas de input       |
| `bg-primary` / `text-primary-foreground`    | Ação principal                        |
| `border-ring` / `ring-ring/50`              | Focus ring                            |
| `text-error` / `bg-error-background`        | Estado de erro                        |
| `text-success` / `bg-success-background`    | Estado de sucesso                     |
| `text-warning` / `bg-warning-background`    | Estado de aviso                       |
| `text-info` / `bg-info-background`          | Estado informativo                    |

### Componentes Disponíveis

#### `PrismButton` (`prism-button.tsx`)

Botão baseado em `Button` do React Aria.

**Props principais:**

| Prop        | Tipo           | Valores                | Default     |
| ----------- | -------------- | ---------------------- | ----------- |
| `variant`   | `string`       | `"default"`, `"ghost"` | `"default"` |
| `size`      | `string`       | `"default"`, `"icon"`  | `"default"` |
| `className` | `string \| fn` | —                      | —           |

**Tokens visuais:**

- Altura padrão: `h-12` (48px)
- Ícone: `size-12`
- Border radius: `rounded-xl squircle`
- Focus: `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring`

#### `PrismInput` (`prism-input.tsx`)

Campo de texto baseado em `TextField` + `Group` do React Aria. Internamente usa `RAGroup` para que o focus ring e estados de erro se apliquem ao container inteiro (inclui prefixo e sufixo).

**Props principais:**

| Prop             | Tipo        | Descrição                                                                |
| ---------------- | ----------- | ------------------------------------------------------------------------ |
| `label`          | `string`    | Label visível acima do campo                                             |
| `labelAction`    | `ReactNode` | Elemento renderizado à direita do label (ex: link "Esqueceu sua senha?") |
| `prefix`         | `ReactNode` | Elemento renderizado à esquerda dentro do campo (ex: ícone)              |
| `suffix`         | `ReactNode` | Elemento renderizado à direita dentro do campo (ex: botão de toggle)     |
| `placeholder`    | `string`    | Placeholder do input                                                     |
| `type`           | `string`    | Tipo HTML do input (`"text"`, `"password"`, `"email"`, etc.)             |
| `inputClassName` | `string`    | Classes extras no `<input>` interno                                      |
| `name`           | `string`    | Atributo name para forms                                                 |
| `required`       | `boolean`   | Equivale a `isRequired` do React Aria                                    |

**Tokens visuais:**

- Altura do container: `h-12` (48px)
- Border radius: `rounded-xl squircle`
- Focus ring no `RAGroup`: `focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50`
- Padding adaptável: `pl-5` quando sem prefix / `pr-5` quando sem suffix
- Ícones internos: `[&_svg]:text-foreground/40`

**Padrão de uso com suffix + labelAction:**

```tsx
<PrismInput
  label="Senha"
  labelAction={
    <Link
      className="text-xs text-muted-foreground hover:underline"
      to="/forgot-password"
    >
      Esqueceu sua senha?
    </Link>
  }
  suffix={
    <PrismButton
      className="rounded-l-none"
      onClick={(e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
      }}
      size="icon"
      variant="ghost"
    >
      {showPassword ? <IconEye /> : <IconEyeOff />}
    </PrismButton>
  }
  type={showPassword ? "text" : "password"}
/>
```

#### `PrismAlert` / `PrismAlertTitle` / `PrismAlertDescription` (`prism-alert.tsx`)

Componente de notificação semântica com ícone decorativo de fundo.

**Variantes:** `"default"`, `"error"`, `"success"`, `"warning"`, `"info"`

**Estrutura:**

```tsx
<PrismAlert variant="error">
  <IconAlertTriangle />{" "}
  {/* ícone decorativo — opacidade 10%, absoluto à direita */}
  <PrismAlertTitle>Título</PrismAlertTitle>
  <PrismAlertDescription>Descrição</PrismAlertDescription>
</PrismAlert>
```

### Galeria de UI: `/ui`

A rota `/ui` é a documentação viva do Prism design system. É organizada modularmente com componentes auxiliares em `app/components/ui-sections/`, contendo uma **sidebar sticky** de navegação à esquerda e um `<main>` de conteúdo à direita.

**Abas disponíveis:**

- **Tokens de Design**: Cores semânticas OKLCH, escala de espaçamento exponencial.
- **Componentes de UI**: Todos os primitivos do Prism catalogados: `PrismButton`, `PrismButtonGroup`, `PrismInput`, `PrismInputGroup`, `PrismTextarea`, `PrismBadge`, `PrismToggle`, `PrismToggleGroup`, `PrismCheckbox`, `PrismRadioGroup`, `PrismCalendar`, `PrismAlert`, `PrismPopover`, `PrismMenu`, `PrismDialog`, `PrismCombobox`, `PrismCommand`, `PrismToaster` (Sonner), e `PrismSeparator`.
- **Componentes Uzzina**: Componentes de alto nível do Uzzina (ex: `ViewOptionsComponent`, `CategoriesCombobox`, `PhaseCombobox`, `StationCombobox`).

**Regra**: Sempre que adicionar um novo componente Prism ou componente Uzzina de alto nível, adicionar uma seção correspondente em `app/components/ui-sections/` e integrá-lo na rota `/ui`.


### Staging provisionado — continuidade de07/10
Chave privada preenchida pelo proprietário e validada sem imprimir. Três contas Auth oficiais/dados fictícios prontos; login/JWT/PostgREST, bootstrap/home, isolamento, preferências e data/CAS verificados. .env.staging-users.local ignorado guarda credenciais; não pedir chave novamente. App iniciado em5180 com Node. UI/API do app e demais limites no relatório de staging; produção intacta. Menções anteriores a chave vazia são históricas.

### Comparação de conflitos e IA — complemento07/10
Gaveta usa ConflictComparison local: duas versões com campos na mesma ordem e scroll próprio; data via parseU, nomes/rótulos de domínio, conteúdo/descrição sanitizados e legenda literal. Persistência e CAS permanecem no coordenador existente. IA retorna códigos públicos de configuração ausente/quota indisponível, traduzidos por allowlist no cliente. Chave OpenAI existente configurada no staging; geração real da API passou200, UI exige nova sessão de teste. Não inferir configuração/migrations de produção a partir disso.


### Homologação real — passo 1,07/10
Matriz de staging em `docs/audits/2026-10-07-passo-1-homologacao-staging.md`: IA/quota/interface, portal/revisão, contas/pessoas/Auth, lote e CAS reais passaram. Adaptador local mapeia `/api/create-user` para o handler existente. `Content` é compartilhado com portal/revisão e deve renderizar sem contexto/query provider privados; consulta de responsáveis é montada apenas quando há pessoa da equipe e o campo precisa ser mostrado. Não criar contexto fictício nem chave privada genérica. Revisão em lote exige parceiro da rota; opção fica desabilitada fora desse contexto.267 testes passam, dados descartáveis removidos. Produção não alterada; próxima etapa é leads coordenada, seguida das pendências móveis/implantação.


### Leads externos — passo 2,07/10
Integração em `/Users/euchicosousa/vercel/lead` agora preparada com `/api/lead` POST/PATCH e cookie HttpOnly/HMAC por lead (24h, Origin exato, schema/limites). Nenhum acesso direto ao banco no fluxo novo; formulário aguarda confirmação e preserva resposta em falha. Migration `20261007232335_external_leads_authorization.sql` aplicada somente ao staging: anon sem grants/policies, membros ativos com SELECT, DML no servidor. Sem nova tabela/model/RPC. Produção/formulário publicados continuam antigos até rollout coordenado; helper da migration03 obrigatório. Resultado e limites: docs/audits/2026-10-07-passo-2-leads-externos.md. Não declarar captação pública resistente a bots apenas por Origin nem certificar produção por staging.


### Leads — fechamento isolado preparado em07/10
Formulário HTTPS publicado validado com chave moderna, cookie e registros fictícios removidos. `supabase/rollouts/close-production-leads.sql` prepara somente permissões de leads, com verificação de membro via people existente; não exige is_active_member nem rollout completo. Matriz SQL staging passou com ROLLBACK; arquivo NÃO aplicado em produção. Anônimo continua preenchendo pela API pública, sem acesso direto à tabela. Aprovação/execução no banco atual e negativas/leitura da equipe após aplicação ainda pendentes. Detalhes em docs/audits/2026-10-07-passo-2-leads-externos.md.


### Leads — estado de produção em08/10
Rollout isolado close-production-leads.sql executado pelo proprietário e confirmado no catálogo atual. Anon sem grants/policies de leitura/escrita direta; membros ativos leem via people existente, DML pelo servidor. PostgREST anônimo recusou GET/POST/PATCH/DELETE com42501; captação HTTPS POST/PATCH e persistência reais passaram após fechamento; fixtures removidas/desfeitas. RLS de leads fechado em produção, sem aplicar outras migrations. Interface da listagem/detalhe na UZZINA publicada com sessão real ainda exige confirmação do proprietário. Registros de produção pendente anteriores são históricos apenas para leads; demais pendências continuam válidas.


### Publicação preparada —08/10
Fase1 prepare-uzzina-release.sql aplicada ao banco atual com backup/ensaio prévio: dependências administrativas/portal/revisão, contador de IA, merge de preferências, bootstrap seguro e versão canônica disponíveis. Não confundir com pacote inteiro aplicado: fase2 finish-uzzina-release.sql ainda NÃO aplicada e exige nova versão Ready primeiro, pois restringe acessos do código antigo. Manifest de rollout registra hashes/estado; banco atual sem histórico Supabase, não usar db push/repair cegamente.267 testes e tipagem/lint/build passam; produção Auth/SDK/preferências/IA confirmados com conta descartável removida. Arquivo privado env da pasta UZZINA foi preparado para importação Vercel Production com APP_ORIGIN=https://uzzina.cnvt.com.br. Roteiro/limites em docs/audits/2026-10-08-publicacao-uzzina.md. consume_ai_usage é contador técnico já implementado, não a futura medição comercial por agência.
