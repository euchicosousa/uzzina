# UZZINA - Guia para Agentes de IA

Este repositório contém o sistema **UZZINA**, um painel e fluxo de gestão de projetos (sprints, ações criativas e calendário) para a agência criativa (CNVT®).

---

## 1. Stack de Tecnologias

- **Framework**: TanStack Router (SPA) com rotas fortemente tipadas.
- **Database & Auth**: Supabase (PostgreSQL) + Supabase Auth.
  - *Cliente Supabase*: A inicialização do cliente no navegador (`app/lib/supabase.client.ts`) é feita como **Singleton** para garantir que o timer do `autoRefreshToken` funcione de forma correta e ininterrupta.
- **Estilização**: Tailwind CSS v4 (com classes estendidas como `squircle` e `border_after` declaradas no `tailwind.css`).
- **Deploy**: Vercel. A pasta `/dist/` e artefatos de build estão ignorados no git para evitar envio de segredos.
- **Storage**: Imagens hospedadas via Cloudinary. O widget de upload é mantido montado no DOM para uploads múltiplos robustos e sem interrupções.
- **AI**: OpenAI API.
- **Rich Text Editor**: Tiptap v3 com suporte a BubbleMenu contextual para tabelas (ChevronDown/ChevronRight/Rows/Columns/Trash2), Links com estilo visual destacado e Highlights de texto.

---

## 2. Estrutura do Diretório Principal (`app/`)

- `app/routes/`: Telas e endpoints da aplicação (actions e APIs).
- `app/components/`:
  - `prism/`: **Design system proprietário** do Uzzina. Primitivos de UI construídos com React Aria Components + CVA. Ver seção 5.
  - `ui/`: Primitivos base do Radix UI (estilo shadcn/ui) — em processo de substituição pelo Prism.
  - `uzzina/`: Elementos reutilizáveis do design system (ex: `UAvatar`, `UBadge`).
  - `features/`: Lógica de regras de negócio (Kanban, Calendário, etc.).
  - `layout/`: Estruturas de layout (Header, Sidebar).
- `app/models/`: Consultas Supabase organizadas por entidade (`*.server.ts`).
- `app/services/`: Serviços de backend, inclusive autenticação (`*.server.ts`).
- `app/hooks/`: Hooks React customizados (ex: `useAppTheme`, `useMultiSelection`).
- `app/lib/`: Configurações de preferências, constantes de domínio e helpers do CRUD.

---

## 3. Diretrizes e Convenções Principais

### Idioma de Desenvolvimento

- **Código-fonte**: Nomes de variáveis, tabelas, colunas, funções, comentários técnicos e arquivos devem ser criados em **Inglês (EN)**.
- **Interface (UI)**: Textos e termos renderizados na tela (labels, botões, alertas, modais) devem ser escritos em **Português do Brasil (PT-BR)**.

### Separação de Portais e Autenticação

- **Membros da Equipe (`/app`)**: Protegido por Supabase Auth via JWT (`getUserId` em `services/auth.server.ts`).
- **Clientes Externos (`/dash`)**: Protegido por sessão de cookies independente (`getClientSession` em `services/client-auth.server.ts`) mapeado contra a tabela `clients` e sem usar Supabase Auth.

### Temas e Preferências

- O visual suporta modo Light/Dark e 12 paletas de cores harmônicas OKLCH (mapeadas em `app/lib/CONSTANTS.ts`).
- **Header**: Salva alterações em tempo real via Fetcher para `/action/set-preferences` (salvando no banco e cookies).
- **Perfil (`/app/profile`)**: Oferece pré-visualização instantânea (usando `previewColorIndex()` e `previewTheme()` do hook `useAppTheme`) sem salvar no banco de dados até que o formulário completo seja submetido pelo usuário.
- **Flicker Prevention**: `app/root.tsx` tem um script inline síncrono no `<head>` que lê o `localStorage` e aplica as variáveis CSS antes da hidratação para evitar piscadas na tela.

### Qualidade de Código e Tipagem Estrita

- **Sem `any`**: Nunca utilize `any`. O código TypeScript deve ser estritamente tipado. Use `unknown` com verificações de tipo (type guards) se os dados forem dinâmicos.
- **Sem Assertions de Não-Nulo (`!`)**: Nunca use asserções não-nulas (`!`) ou truques de tipagem como `null!`. Prefira usar getters seguros, inicializações opcionais ou validações explícitas de presença.
- **Conformidade com o Linter (Biome)**: Todas as alterações devem passar no comando `bun run lint` e no compilador `npx tsc`. Certifique-se de que não restem avisos ou erros.

---

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
- **Ícones**: Tabler Icons (`@tabler/icons-react`). Tamanho padrão automático nos botões: `size-5` (via `[&_svg:not([class*='size-'])]:size-5`).

### Tokens de Cores OKLCH (tailwind.css)

| Token | Uso |
|---|---|
| `bg-background` | Fundo da página |
| `bg-surface` | Cards e painéis (substitui `bg-card`) |
| `bg-input` | Fundo de campos de formulário |
| `text-foreground` / `text-muted-foreground` | Texto primário / secundário |
| `border-border` / `border-input` | Bordas padrão / bordas de input |
| `bg-primary` / `text-primary-foreground` | Ação principal |
| `border-ring` / `ring-ring/50` | Focus ring |
| `text-error` / `bg-error-background` | Estado de erro |
| `text-success` / `bg-success-background` | Estado de sucesso |
| `text-warning` / `bg-warning-background` | Estado de aviso |
| `text-info` / `bg-info-background` | Estado informativo |

> **Atenção**: Nunca usar `bg-card` nem `text-card-foreground` — o token correto é `bg-surface` e `text-surface-foreground`.

### Componentes Disponíveis

#### `PrismButton` (`prism-button.tsx`)
Botão baseado em `Button` do React Aria.

**Props principais:**
| Prop | Tipo | Valores | Default |
|---|---|---|---|
| `variant` | `string` | `"default"`, `"ghost"` | `"default"` |
| `size` | `string` | `"default"`, `"icon"` | `"default"` |
| `className` | `string \| fn` | — | — |

**Tokens visuais:**
- Altura padrão: `h-12` (48px)
- Ícone: `size-12`
- Border radius: `rounded-xl squircle`
- Focus: `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring`

#### `PrismInput` (`prism-input.tsx`)
Campo de texto baseado em `TextField` + `Group` do React Aria. Internamente usa `RAGroup` para que o focus ring e estados de erro se apliquem ao container inteiro (inclui prefixo e sufixo).

**Props principais:**
| Prop | Tipo | Descrição |
|---|---|---|
| `label` | `string` | Label visível acima do campo |
| `labelAction` | `ReactNode` | Elemento renderizado à direita do label (ex: link "Esqueceu sua senha?") |
| `prefix` | `ReactNode` | Elemento renderizado à esquerda dentro do campo (ex: ícone) |
| `suffix` | `ReactNode` | Elemento renderizado à direita dentro do campo (ex: botão de toggle) |
| `placeholder` | `string` | Placeholder do input |
| `type` | `string` | Tipo HTML do input (`"text"`, `"password"`, `"email"`, etc.) |
| `inputClassName` | `string` | Classes extras no `<input>` interno |
| `name` | `string` | Atributo name para forms |
| `required` | `boolean` | Equivale a `isRequired` do React Aria |

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
    <Link className="text-xs text-muted-foreground hover:underline" to="/forgot-password">
      Esqueceu sua senha?
    </Link>
  }
  type={showPassword ? "text" : "password"}
  suffix={
    <PrismButton
      className="rounded-l-none"
      size="icon"
      variant="ghost"
      onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
    >
      {showPassword ? <IconEye /> : <IconEyeOff />}
    </PrismButton>
  }
/>
```

#### `PrismAlert` / `PrismAlertTitle` / `PrismAlertDescription` (`prism-alert.tsx`)
Componente de notificação semântica com ícone decorativo de fundo.

**Variantes:** `"default"`, `"error"`, `"success"`, `"warning"`, `"info"`

**Estrutura:**
```tsx
<PrismAlert variant="error">
  <IconAlertTriangle />         {/* ícone decorativo — opacidade 10%, absoluto à direita */}
  <PrismAlertTitle>Título</PrismAlertTitle>
  <PrismAlertDescription>Descrição</PrismAlertDescription>
</PrismAlert>
```

### Galeria de UI: `/ui`

A rota `/ui` é a documentação viva do Prism design system. É organizada com uma **sidebar sticky** de navegação à esquerda e um `<main>` de conteúdo à direita.

**Layout:**
- Container: `grid grid-cols-1 lg:grid-cols-[320px_1fr]`
- Sidebar: `lg:sticky top-0 lg:min-h-screen lg:border-r`
- Seções de conteúdo: componentes auxiliares `GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem` definidos localmente no arquivo.

**Abas disponíveis:**
- **Tokens de Design**: Cores semânticas OKLCH, escala de espaçamento exponencial.
- **Componentes de UI**: `PrismButton`, `PrismInput`, `PrismAlert`.

**Regra**: Sempre que adicionar um novo componente Prism, adicionar uma seção correspondente na aba "Componentes de UI" da `/ui`.
