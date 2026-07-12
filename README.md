# UZZINA ⚡️

O **UZZINA** é o sistema de gestão de projetos, sprints, calendário operacional e ações criativas da agência **CNVT®**. Ele oferece um painel interativo (Kanban e Calendário com suporte a Drag and Drop) projetado para otimizar os fluxos de trabalho da equipe de criação e oferecer relatórios de acompanhamento em tempo real para clientes externos.

---

## 🚀 Stack de Tecnologias

- **Framework**: [TanStack Router](https://tanstack.com/router/latest) (executando em modo Single Page Application - SPA com rotas tipadas).
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (PostgreSQL) + Supabase Auth.
- **Gerenciamento de Estado & Cache**: [TanStack React Query v5](https://tanstack.com/query/latest) (otimizando buscas de dados e provendo sincronização de estado com atualizações otimistas instantâneas).
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) (incluindo classes customizadas do design system como `squircle` e `border_after`).
- **Storage**: Cloudinary (hospedagem de imagens de referência e entregáveis via upload widget resiliente).
- **Editor Rich Text**: Tiptap v3 (com extensões para links automáticos, highlights de texto, tabelas integradas e bubble menus contextuais para melhoria da experiência de briefings).
- **Deploy**: Vercel.

---

## 📂 Estrutura de Diretórios (`app/`)

```bash
app/
├── components/
│   ├── client/       # Componentes exclusivos do portal do cliente
│   ├── features/     # Componentes de negócio (Kanban, Calendário, Formulários, etc.)
│   ├── layout/       # Componentes estruturais (Header, Sidebar)
│   ├── ui/           # Primitivos base de interface (estilo shadcn/ui)
│   └── uzzina/       # Elementos reutilizáveis do Design System (UAvatar, UBadge, etc.)
├── hooks/            # Hooks customizados (useOptimisticQuery, useActionMutations, etc.)
├── lib/              # Configurações do Supabase, constantes de domínio e helpers utilitários
├── models/           # Queries e regras de banco Supabase estruturadas por entidade (*.server.ts)
├── routes/           # Rotas, views e endpoints da aplicação
└── services/         # Regras de backend (como autenticação de membros e clientes externos)
```

---

## ⚙️ Conceitos e Diretrizes de Desenvolvimento

### 1. Idioma de Desenvolvimento

- **Código-fonte**: Nomes de variáveis, tabelas, colunas, funções, comentários técnicos e nomes de arquivos devem ser escritos sempre em **Inglês (EN)**.
- **Interface (UI)**: Textos e termos renderizados na tela (labels, botões, modais, alertas) devem ser escritos em **Português do Brasil (PT-BR)**.

### 2. Separação de Portais

- **Portal Interno (`/app`)**: Área destinada aos membros da agência. Protegida por Supabase Auth via JWT (`getUserId` em `services/auth.server.ts`).
- **Portal do Cliente (`/dash`)**: Área destinada a clientes externos para acompanhamento das ações aprovadas. Protegida por sessão de cookies independente (`getClientSession` em `services/client-auth.server.ts`), validada diretamente contra a tabela `clients` e sem criar usuários no Supabase Auth.

### 3. Gerenciamento de Estado Otimista (React Query)

Para garantir uma experiência de uso extremamente rápida e fluida (sem telas travadas ou "flickers" visuais):

- **Mutações**: Centralizadas no hook customizado `useActionMutations()`. Ele encapsula as chamadas de banco e registra as mutações ativas no cache global.
- **Queries**: Em vez de `useQuery` puro para obter as ações, usamos o wrapper **`useOptimisticQuery()`**. Ele escuta as mutações pendentes em tempo real e mescla instantaneamente na UI qualquer criação, deleção, edição ou duplicação antes mesmo de o servidor responder.
- **Prevenção de Flicker**: Os dados otimistas só deixam de ser aplicados quando a query de revalidação correspondente termina de ser baixada do banco de dados (comparando timestamps `submittedAt > dataUpdatedAt`), evitando que o card atualizado volte momentaneamente ao estado anterior durante o refetch.

### 4. Estilização e Temas

- O sistema suporta modo Claro/Escuro (Light/Dark) e 12 paletas de cores harmônicas OKLCH (definidas em `app/lib/CONSTANTS.ts`).
- **Evitando Piscadas**: No `app/root.tsx`, existe um script inline síncrono injetado no `<head>` que lê a preferência no `localStorage` e injeta as variáveis CSS necessárias antes da hidratação do React para evitar que a tela pisque no primeiro carregamento.

---

## 🛠️ Como rodar o projeto localmente

### Pré-requisitos

Certifique-se de possuir o [Bun](https://bun.sh/) ou o Node.js instalados na sua máquina.

### Instalação

Instale as dependências do projeto:

```bash
bun install
# ou
npm install
```

### Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
bun run dev
# ou
npm run dev
```

O projeto estará disponível por padrão em `http://localhost:5173`.
