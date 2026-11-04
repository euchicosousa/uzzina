# 14 — `/ui`: seção "Ícones" (vitrine dos ícones usados no app)

**Resumo:** Documenta os ícones usados pelo aplicativo, seus significados e tamanhos.

**Commit de referência:** `ce1230b` — entrega versionada no histórico local.

Status: Aprovado pelo proprietário em 03/11/2026, 100%. Aceite dos componentes não citados na revisão por capturas.
Escopo: criar UMA seção de vitrine nova em `/ui`, logo após "Foco", no primeiro grupo (Tokens). A seção mostra os ícones que o app já usa, com nome técnico e significado. **Não altere nenhum componente do app.** Não altere estilos, props, imports ou textos de nenhum arquivo de feature.

## Contexto para o executor

- Biblioteca: `lucide-react`. Ícones customizados ficam em `app/components/uzzina/UIcons.tsx` (função `Icons` com `slug`, usada para categorias, fases e estações; ver a lista na seção "Customizados").
- Padrão de tamanho nos controles: `sm` = `size-4`; `default` e `lg` = `size-5`. Cor: `currentColor`, opacidade 60% (regra do `PrismToggle` e de `[&_svg]:opacity-60`). Use `className="size-4 opacity-60"` ou `size-5 opacity-60`, sem cor fixa.
- Estrutura de referência: `app/components/ui-sections/TokensFocusSection.tsx` e `TokensSpacingSection.tsx` (usam `GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem` de `GalleryHelperComponents.tsx`).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/TokensIconsSection.tsx`, exportando `export function TokensIconsSection()`.
2. EDITAR `app/components/ui-sections/index.ts`: adicionar `export * from "./TokensIconsSection";` logo após a linha de `TokensFocusSection`.
3. EDITAR `app/routes/ui.tsx`:
   - Import: incluir `TokensIconsSection` no mesmo bloco de imports de `TokensFocusSection` (linha ~15).
   - `SIDEBAR_ITEMS`: após o item `tokens-focus` (linha ~72), adicionar:
     `{ id: "tokens-icons", label: "Ícones", section: "tokens", keywords: ["icones", "ícones", "icon", "lucide", "glifo"] }`
   - Render: no bloco `activeSection === "tokens"` (linha ~520), depois de `<TokensFocusSection />`, adicionar `<TokensIconsSection />`.
   - A seção raiz deve ter `id="tokens-icons"` (o item da barra lateral usa esse id para rolagem).

Não criar outros arquivos. Não criar testes.

## Conteúdo da seção

Cabeçalho (`GallerySectionHeader`):

- title: `Ícones`
- description: `Ícones usados no app, com o significado de cada um. Biblioteca Lucide, exceto os customizados.`

Três subgrupos, cada um com título pequeno (`text-sm font-medium`) e grade de itens. Cada item: ícone em dois tamanhos (`size-4` para sm e `size-5` para default e lg), com o nome técnico em `font-mono text-xs` e o significado em `text-xs text-muted-foreground`. Sem cartão, sem borda, sem fundo: layout em grade simples sobre o fundo da página (regra de design do AGENTS.md). Texto de interface em português brasileiro; nomes técnicos ficam como estão.

Os nomes abaixo são os **exatos** importados do `lucide-react` no app (contagem de arquivos entre parênteses). Quando um ícone tiver alias (ex.: `Trash2` e `Trash2Icon`), mostre o glifo uma vez com o nome canônico `*Icon` e cite o alias no significado.

### 1. Ações e edição

| Nome                         | Significado no app                   |
| ---------------------------- | ------------------------------------ |
| PlusIcon (13)                | Criar / adicionar                    |
| PencilIcon, Pencil           | Editar                               |
| TrashIcon, Trash2Icon, Trash | Excluir / remover                    |
| CopyIcon (1)                 | Duplicar                             |
| ArchiveIcon (5)              | Arquivar; ação arquivada             |
| ArchiveRestoreIcon (1)       | Desarquivar                          |
| SaveIcon (1)                 | Salvar                               |
| SendIcon (3)                 | Enviar (comentário, lote, mensagem)  |
| UploadIcon (4)               | Enviar arquivo                       |
| CloudUploadIcon (1)          | Enviar para a nuvem (salvar ação)    |
| CloudIcon (2)                | Nuvem / sincronizado                 |
| XIcon (14)                   | Fechar; remover item de lista        |
| CheckIcon (15)               | Selecionado / marcado                |
| RotateCcwIcon (3)            | Restaurar / reiniciar                |
| GripVerticalIcon (3)         | Alça de arraste / reordenar          |
| FilePlus                     | Novo arquivo                         |
| FileIcon (1)                 | Arquivo                              |
| FolderPlusIcon (1)           | Nova pasta / novo grupo de parceiros |
| ExternalLinkIcon (1)         | Abrir em nova aba                    |
| Share2Icon (1)               | Compartilhar                         |

### 2. Estados e feedback

| Nome                                     | Significado no app                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| CheckCircle2Icon (7)                     | Sucesso / concluído (toast, lead, comando)                                                                |
| CircleCheckBigIcon (1)                   | Concluído (AppBar)                                                                                        |
| BadgeCheckIcon (2)                       | Verificado; fase/estado "Concluído" (`finished`)                                                          |
| AlertCircleIcon (3)                      | Alerta de ação ou item                                                                                    |
| AlertTriangleIcon (8)                    | Aviso                                                                                                     |
| TriangleAlertIcon (1)                    | Aviso (página de leads)                                                                                   |
| OctagonAlertIcon (1)                     | Erro (toast)                                                                                              |
| ShieldAlertIcon (1)                      | Sem permissão (guarda de admin)                                                                           |
| XCircleIcon (1)                          | Sugestão recusada / erro de item                                                                          |
| InfoIcon (2)                             | Informação                                                                                                |
| LoaderIcon (4), Loader2, Loader2Icon (1) | Carregando (Loader2 é alias do mesmo glifo)                                                               |
| LockIcon (6)                             | Bloqueado; comentário interno / privado                                                                   |
| EyeIcon (7)                              | Mostrar (senha, prévia)                                                                                   |
| EyeOffIcon (6)                           | Ocultar (senha, prévia)                                                                                   |
| ClockIcon (3)                            | Horário; prazo; em atraso (lead)                                                                          |
| SignalIcon (2)                           | Indicador de estado da ação (cor `info` ou `error`, `ActionItem.tsx:397`)                                 |
| StarIcon (2)                             | Favorito / destaque                                                                                       |
| HeartIcon (1)                            | Curtir / marcar como importante (`ActionFormDrawer.tsx:974`)                                              |
| SparkleIcon (2), SparklesIcon (4)        | Sugestão ou geração por IA. SparkleIcon = botão de IA na gaveta; SparklesIcon = sugestões do planejamento |
| ZapIcon (2)                              | Sprint (também usado em `Icons` slug `sprint`)                                                            |

### 3. Navegação e layout

| Nome                                              | Significado no app                                        |
| ------------------------------------------------- | --------------------------------------------------------- |
| HomeIcon (2)                                      | Início                                                    |
| ArrowLeftIcon (2)                                 | Voltar                                                    |
| ChevronLeftIcon (5)                               | Mês/semana anterior; voltar em menu                       |
| ChevronRightIcon (5)                              | Próximo mês/semana; submenu                               |
| ChevronDownIcon (6)                               | Abrir seletor / lista                                     |
| ChevronUpIcon (1)                                 | Recolher (acordeão)                                       |
| ChevronsUpDownIcon (2)                            | Seletor com opções (select, ordenação)                    |
| PanelRightOpenIcon (1)                            | Abrir painel lateral (dash)                               |
| PanelRightCloseIcon (1)                           | Fechar painel lateral (dash)                              |
| LayoutGridIcon (4)                                | Grade / categorias (`Icons` slug `categories`)            |
| LayoutListIcon (1)                                | Visualização em lista                                     |
| ListIcon (5)                                      | Lista (formato de lista ou itens)                         |
| ListOrderedIcon (1)                               | Lista numerada                                            |
| Columns2Icon, Columns3Icon, Columns4Icon (1 cada) | Visualização em 2, 3 ou 4 colunas                         |
| Rows2Icon, Rows3Icon (1 cada)                     | Visualização em 2 ou 3 linhas                             |
| Grid3X3Icon (1), Grid3x3Icon (2)                  | Grade 3×3 (alias do mesmo glifo) — visualização em grade  |
| KanbanIcon (3)                                    | Visualização Kanban / alterar fase                        |
| BlocksIcon (2)                                    | Visualização em blocos                                    |
| CalendarDaysIcon (5)                              | Calendário (dias)                                         |
| CalendarIcon (10)                                 | Calendário / data; planejamento (`Icons` slug `planning`) |
| CalendarRangeIcon (3)                             | Período; calendário da equipe                             |
| SlidersHorizontalIcon (2)                         | Ajustes de conteúdo / reordenar mídia                     |
| SettingsIcon (5)                                  | Configurações                                             |
| FilterIcon (4)                                    | Filtro (também `Icons` slug `filter`)                     |
| ArrowDownAZIcon (1), ArrowUpAZIcon (1)            | Ordenar A→Z / Z→A                                         |
| SearchIcon (10)                                   | Buscar                                                    |
| SearchCheckIcon (1)                               | Revisão (`Icons` fase `review`)                           |
| BellIcon (3)                                      | Notificações                                              |
| LogOutIcon (4)                                    | Sair                                                      |
| LogInIcon (2)                                     | Entrar                                                    |

### 4. Entidades (pessoas, parceiros, contas)

| Nome                                                       | Significado no app                                |
| ---------------------------------------------------------- | ------------------------------------------------- |
| UserIcon (6)                                               | Perfil / pessoa                                   |
| User2Icon (1)                                              | Responsáveis                                      |
| UserCheckIcon (1)                                          | Cliente (`Icons` estação `client`)                |
| UserPlusIcon (4)                                           | Novo usuário                                      |
| UsersIcon (4)                                              | Equipe / pessoas                                  |
| BriefcaseIcon (2)                                          | Parceiro (do parceiro / contexto)                 |
| Building2Icon (1)                                          | Empresa                                           |
| HandshakeIcon (2)                                          | Parceria                                          |
| HeartHandshakeIcon (3)                                     | Parceiro (seletor de parceiros em filtros e Hoje) |
| MegaphoneIcon (1)                                          | Campanhas / divulgação                            |
| MailCheckIcon (1)                                          | E-mail confirmado / enviado                       |
| MailOpenIcon (1)                                           | E-mail aberto / recuperação de senha              |
| AtSignIcon (3)                                             | E-mail (campo de login)                           |
| PhoneIcon (1)                                              | Telefone (lead)                                   |
| GlobeIcon (1)                                              | Público / site (comentário público)               |
| KeyIcon (1)                                                | Senha (redefinição)                               |
| KeyboardIcon (1)                                           | Atalhos de teclado                                |
| ImageIcon (4)                                              | Imagem / post (`Icons` slug `post`)               |
| FlagIcon (2)                                               | Prioridade                                        |
| TagIcon (2)                                                | Categoria                                         |
| MessageSquareIcon (1)                                      | Comentários                                       |
| BarChart3Icon (1)                                          | Métricas (painel da Home)                         |
| SmartphoneIcon (1)                                         | Prévia no celular                                 |
| LaptopIcon (3), MonitorIcon (2), SunIcon (6), MoonIcon (6) | Tema: sistema/computador, claro, escuro           |
| PaletteIcon (4)                                            | Cores / tema (`Icons` estação `creation`)         |
| PipetteIcon (2)                                            | Conta-gotas: cor personalizada                    |
| HelpCircleIcon (3)                                         | Ajuda                                             |

### 5. Texto (barra do editor, `RichTextEditor.tsx`)

Importados sem o sufixo `Icon`: `Bold`, `Italic`, `Strikethrough`, `Heading1`, `Heading2`, `Heading3`, `List`, `ListOrdered`, `Quote`, `Link`, `Highlighter`, `Minus`, `Table`, `Columns`, `Rows`, `Trash2`, `ChevronDown`, `ChevronRight`, `Ellipsis`, `Undo2`, `Redo2`, `RemoveFormatting`. Mostrar cada um com o significado do comando: negrito, itálico, tachado, títulos 1–3, lista, lista numerada, citação, link, marca-texto, linha horizontal, tabela, colunas, linhas, excluir tabela, submenu, reticências (mais formatação), desfazer, refazer, limpar formatação. Para Heading/Columns etc., usar o nome exato do import.

Nota ao executor: ler `RichTextEditor.tsx` (linhas de import) e usar exatamente os nomes importados. Se algum nome não existir no pacote instalado, omita-o e reporte.

## Customizados (`app/components/uzzina/UIcons.tsx`, função `Icons`)

Mostrar com `<Icons slug="..." className="size-4 opacity-60" />`. Agrupar por tipo.

- Categorias: `ads` (Volume2Icon), `capture` (CameraIcon), `carousel` (GalleryHorizontalIcon), `design` (PenToolIcon), `dev` (BinaryIcon), `finance` (CoinsIcon), `meeting` (PresentationIcon), `post` (ImageIcon), `print` (PrinterIcon), `reels` (PlayIcon), `sm` (BadgeCheckIcon), `stories` (CircleFadingPlusIcon), `todo` (ClipboardCheckIcon), `sprint` (ZapIcon), `categories` (LayoutGridIcon), `filter` (FilterIcon), `instagram` (SVG próprio: quadrado arredondado, círculo e ponto).
- Fases: `idea` (LightbulbIcon), `do` (CirclePlayIcon), `doing` (PenLineIcon), `review` (SearchCheckIcon), `done` (CircleCheckIcon), `finished` (BadgeCheckIcon).
- Estações: `flow` (BrainIcon), `planning` (CalendarIcon), `creation` (PaletteIcon), `client` (UserCheckIcon).
- Padrão (sem slug reconhecido): HelpCircleIcon.

Significados das fases e estações: são as fases do Kanban e as estações do fluxo da agência (ver GLOSSARY.md). Consulte o glossário antes de escrever os rótulos.

## Ordem da seção

1. Título e descrição.
2. "Ações e edição".
3. "Estados e feedback".
4. "Navegação e layout".
5. "Entidades".
6. "Texto (editor)".
7. "Customizados".

Cada subgrupo: título em `text-sm font-medium`, itens em grade `grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4` (ou equivalente com Tailwind), sem caixas.

## Critérios de aceite

1. Os 3 arquivos (criado + 2 editados) e nenhum outro. `git diff --stat` mostra só esses.
2. Todo nome da tabela acima aparece uma vez, com o significado correto; aliases citados no texto, não duplicados como item.
3. Três tamanhos por ícone (size-4 e size-5); cor só `currentColor` com 60% de opacidade.
4. Sem cartão, borda ou fundo em cada item; títulos pt-BR, nomes técnicos como estão.
5. Entrada na barra lateral "Ícones" dentro do grupo Tokens, logo após "Foco", e rolagem por âncora para `tokens-icons`.
6. `bunx prettier --write` nos 3 arquivos alterados (plugin Tailwind) e `bun run typecheck` (ou `tsc --noEmit`) sem erros novos.
7. Sem teste novo. Roteiro curto de validação visual para o proprietário: abrir `/ui` > Tokens > "Ícones" e conferir glifos, nomes e significados.

## Fora do escopo

- Trocar ícones de componentes ou padronizar nomes no app.
- Criar ícones novos, SVG novos ou mudar `UIcons.tsx`.
- Tooltips, busca de ícones ou copiar nomes.
