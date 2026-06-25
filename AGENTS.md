# Uzzina - Guia para Agentes de IA

Este repositório contém o sistema **Uzzina**, um painel e fluxo de gestão de projetos (sprints, ações criativas e calendário) para a agência criativa (CNVT®).

---

## 1. Stack de Tecnologias

*   **Framework**: React Router v7 (SSR) com Loader/Action pattern.
*   **Database & Auth**: Supabase (PostgreSQL) + Supabase Auth.
*   **Estilização**: Tailwind CSS v4 (com classes estendidas como `squircle` e `border_after` declaradas no `tailwind.css`).
*   **Deploy**: Vercel.
*   **Storage**: Imagens hospedadas via Cloudinary.
*   **AI**: OpenAI API.

---

## 2. Estrutura do Diretório Principal (`app/`)

*   `app/routes/`: Telas e endpoints da aplicação (actions e APIs).
*   `app/components/`:
    *   `ui/`: Primitivos base do Radix UI (estilo shadcn/ui).
    *   `uzzina/`: Elementos reutilizáveis do design system (ex: `UAvatar`, `UBadge`).
    *   `features/`: Lógica de regras de negócio (Kanban, Calendário, etc.).
    *   `layout/`: Estruturas de layout (Header, Sidebar).
*   `app/models/`: Consultas Supabase organizadas por entidade (`*.server.ts`).
*   `app/services/`: Serviços de backend, inclusive autenticação (`*.server.ts`).
*   `app/hooks/`: Hooks React customizados (ex: `useAppTheme`, `useMultiSelection`).
*   `app/lib/`: Configurações de preferências, constantes de domínio e helpers do CRUD.

---

## 3. Diretrizes e Convenções Principais

### Idioma de Desenvolvimento
*   **Código-fonte**: Nomes de variáveis, tabelas, colunas, funções, comentários técnicos e arquivos devem ser criados em **Inglês (EN)**.
*   **Interface (UI)**: Textos e termos renderizados na tela (labels, botões, alertas, modais) devem ser escritos em **Português do Brasil (PT-BR)**.

### Separação de Portais e Autenticação
*   **Membros da Equipe (`/app`)**: Protegido por Supabase Auth via JWT (`getUserId` em `services/auth.server.ts`).
*   **Clientes Externos (`/dash`)**: Protegido por sessão de cookies independente (`getClientSession` em `services/client-auth.server.ts`) mapeado contra a tabela `clients` e sem usar Supabase Auth.

### Temas e Preferências
*   O visual suporta modo Light/Dark e 12 paletas de cores harmônicas OKLCH (mapeadas em `app/lib/CONSTANTS.ts`).
*   **Header**: Salva alterações em tempo real via Fetcher para `/action/set-preferences` (salvando no banco e cookies).
*   **Perfil (`/app/profile`)**: Oferece pré-visualização instantânea (usando `previewColorIndex()` e `previewTheme()` do hook `useAppTheme`) sem salvar no banco de dados até que o formulário completo seja submetido pelo usuário.
*   **Flicker Prevention**: `app/root.tsx` tem um script inline síncrono no `<head>` que lê o `localStorage` e aplica as variáveis CSS antes da hidratação para evitar piscadas na tela.

### Qualidade de Código e Tipagem Estrita
*   **Sem `any`**: Nunca utilize `any`. O código TypeScript deve ser estritamente tipado. Use `unknown` com verificações de tipo (type guards) se os dados forem dinâmicos.
*   **Sem Assertions de Não-Nulo (`!`)**: Nunca use asserções não-nulas (`!`) ou truques de tipagem como `null!`. Prefira usar getters seguros, inicializações opcionais ou validações explícitas de presença.
*   **Conformidade com o Linter (Biome)**: Todas as alterações devem passar no comando `bun run lint` e no compilador `npx tsc`. Certifique-se de que não restem avisos ou erros.

---

## 4. Manutenção de Documentação (IMPORTANTE)

Sempre que realizar alterações estruturais no projeto:
1. **Banco de Dados/Models**: Se adicionar/modificar tabelas ou models, atualize a seção correspondente no `AGENTS.md` e o Knowledge Item em `~/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`.
2. **Rotas/Arquitetura**: Se criar novas rotas ou portais, atualize `AGENTS.md` e o Knowledge Item em `~/.gemini/antigravity-ide/knowledge/uzzina-architecture/artifacts/architecture.md`.
3. **Novos Fluxos**: Mantenha os KIs correspondentes atualizados para garantir que o contexto do projeto continue correto nas próximas sessões.

