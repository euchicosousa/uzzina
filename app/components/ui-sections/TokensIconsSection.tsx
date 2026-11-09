import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowDownAZIcon,
  ArrowLeftIcon,
  ArrowUpAZIcon,
  AtSignIcon,
  BadgeCheckIcon,
  BarChart3Icon,
  BellIcon,
  BlocksIcon,
  Bold,
  BriefcaseIcon,
  Building2Icon,
  CalendarDaysIcon,
  CalendarIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  CircleCheckBigIcon,
  ClockIcon,
  CloudIcon,
  CloudUploadIcon,
  Columns,
  Columns2Icon,
  Columns3Icon,
  Columns4Icon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FileIcon,
  FilePlusIcon,
  FilterIcon,
  FlagIcon,
  FolderPlusIcon,
  GlobeIcon,
  Grid3X3Icon,
  GripVerticalIcon,
  HandshakeIcon,
  Heading1,
  Heading2,
  Heading3,
  HeartHandshakeIcon,
  HeartIcon,
  HelpCircleIcon,
  Highlighter,
  HomeIcon,
  ImageIcon,
  InfoIcon,
  Italic,
  KanbanIcon,
  KeyIcon,
  KeyboardIcon,
  LaptopIcon,
  LayoutGridIcon,
  LayoutListIcon,
  Link as LinkEditorIcon,
  List,
  ListIcon,
  ListOrdered,
  ListOrderedIcon,
  LoaderIcon,
  LockIcon,
  LogInIcon,
  LogOutIcon,
  MailCheckIcon,
  MailOpenIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  Minus,
  MonitorIcon,
  MoonIcon,
  OctagonAlertIcon,
  PaletteIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PencilIcon,
  PhoneIcon,
  PipetteIcon,
  PlusIcon,
  Quote,
  Redo2,
  RemoveFormatting,
  RotateCcwIcon,
  Rows,
  Rows2Icon,
  Rows3Icon,
  SaveIcon,
  SearchCheckIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  Share2Icon,
  ShieldAlertIcon,
  SignalIcon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
  SparkleIcon,
  SparklesIcon,
  SquareCheckIcon,
  StarIcon,
  Strikethrough,
  SunIcon,
  Table as TableEditorIcon,
  TagIcon,
  Trash2,
  TrashIcon,
  TriangleAlertIcon,
  Undo2,
  UploadIcon,
  User2Icon,
  UserCheckIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import type * as React from "react";
import { UIcons } from "~/components/uzzina/UIcons";
import {
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

interface IconItemDef {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  name: string;
  meaning: string;
}

const ACTION_ICONS: IconItemDef[] = [
  {
    icon: PlusIcon,
    name: "PlusIcon",
    meaning: "Criar ação, novo item, adicionar anexo",
  },
  {
    icon: PencilIcon,
    name: "PencilIcon",
    meaning: "Editar ação / comentário (alias: Pencil)",
  },
  {
    icon: TrashIcon,
    name: "TrashIcon",
    meaning: "Excluir / remover item ou anexo (aliases: Trash2Icon, Trash)",
  },
  {
    icon: CopyIcon,
    name: "CopyIcon",
    meaning: "Duplicar ação",
  },
  {
    icon: ArchiveIcon,
    name: "ArchiveIcon",
    meaning: "Arquivar ação (rodapé da gaveta e lote)",
  },
  {
    icon: ArchiveRestoreIcon,
    name: "ArchiveRestoreIcon",
    meaning: "Desarquivar ação (quando a ação já está arquivada no rodapé)",
  },
  {
    icon: SaveIcon,
    name: "SaveIcon",
    meaning: "Salvar formulário",
  },
  {
    icon: SendIcon,
    name: "SendIcon",
    meaning: "Enviar comentário na ação ou operações em lote",
  },
  {
    icon: UploadIcon,
    name: "UploadIcon",
    meaning: "Upload de arquivos de mídia (Cloudinary)",
  },
  {
    icon: CloudUploadIcon,
    name: "CloudUploadIcon",
    meaning: "Salvar ação na nuvem (botão principal do rodapé da gaveta)",
  },
  {
    icon: CloudIcon,
    name: "CloudIcon",
    meaning:
      "Salvar alterações (cabeçalho de Minha Conta e edição do parceiro)",
  },
  {
    icon: XIcon,
    name: "XIcon",
    meaning: "Fechar gaveta, modais e limpar seleção / busca",
  },
  {
    icon: CheckIcon,
    name: "CheckIcon",
    meaning: "Selecionado / marcado (comboboxes e menus)",
  },
  {
    icon: RotateCcwIcon,
    name: "RotateCcwIcon",
    meaning: "Limpar sprint (Home) e recalcular slots (Planejamento)",
  },
  {
    icon: GripVerticalIcon,
    name: "GripVerticalIcon",
    meaning: "Alça de arraste / reordenar mídia no modal de conteúdo",
  },
  {
    icon: FilePlusIcon,
    name: "FilePlus",
    meaning: "Novo arquivo / anexo (alias: FilePlusIcon)",
  },
  {
    icon: FileIcon,
    name: "FileIcon",
    meaning: "Arquivo anexado / documento de trabalho",
  },
  {
    icon: FolderPlusIcon,
    name: "FolderPlusIcon",
    meaning: "Novo grupo de parceiros / pasta",
  },
  {
    icon: ExternalLinkIcon,
    name: "ExternalLinkIcon",
    meaning: "Abrir em nova aba (mídia, prévia, portal)",
  },
  {
    icon: Share2Icon,
    name: "Share2Icon",
    meaning: "Compartilhar link de revisão pública com cliente",
  },
];

const FEEDBACK_ICONS: IconItemDef[] = [
  {
    icon: CheckCircle2Icon,
    name: "CheckCircle2Icon",
    meaning: "Sucesso (toast sonner), concluído (leads e comando)",
  },
  {
    icon: CircleCheckBigIcon,
    name: "CircleCheckBigIcon",
    meaning: "Ativar modo de seleção de ações em lote (AppBar)",
  },
  {
    icon: BadgeCheckIcon,
    name: "BadgeCheckIcon",
    meaning: 'Fase/estado "Concluído" (finished); verificado',
  },
  {
    icon: AlertCircleIcon,
    name: "AlertCircleIcon",
    meaning: "Alerta de ação ou item com pendência",
  },
  {
    icon: AlertTriangleIcon,
    name: "AlertTriangleIcon",
    meaning: "Aviso de confirmação / conflito",
  },
  {
    icon: TriangleAlertIcon,
    name: "TriangleAlertIcon",
    meaning: "Aviso na listagem e detalhe de leads",
  },
  {
    icon: OctagonAlertIcon,
    name: "OctagonAlertIcon",
    meaning: "Erro de requisição / falha (toast sonner)",
  },
  {
    icon: ShieldAlertIcon,
    name: "ShieldAlertIcon",
    meaning: "Sem permissão / acesso restrito (guarda de admin)",
  },
  {
    icon: XCircleIcon,
    name: "XCircleIcon",
    meaning: "Sugestão recusada / erro de item",
  },
  {
    icon: InfoIcon,
    name: "InfoIcon",
    meaning: "Informação e dicas de uso",
  },
  {
    icon: LoaderIcon,
    name: "LoaderIcon",
    meaning: "Carregando / em processamento (aliases: Loader2, Loader2Icon)",
  },
  {
    icon: LockIcon,
    name: "LockIcon",
    meaning: "Comentário interno privado (visível só para equipe); senha",
  },
  {
    icon: EyeIcon,
    name: "EyeIcon",
    meaning: 'Menu "Exibir" (ViewOptions); revelar senha ou prévia',
  },
  {
    icon: EyeOffIcon,
    name: "EyeOffIcon",
    meaning: "Ocultar senha ou prévia",
  },
  {
    icon: ClockIcon,
    name: "ClockIcon",
    meaning: "Horário da ação; ordenar por data; prazo em atraso (leads)",
  },
  {
    icon: SignalIcon,
    name: "SignalIcon",
    meaning:
      "Campo Prioridade (ViewOptions); estado da ação (info/error/success)",
  },
  {
    icon: StarIcon,
    name: "StarIcon",
    meaning: "Favorito / destaque",
  },
  {
    icon: HeartIcon,
    name: "HeartIcon",
    meaning: "Identificador da aba ESSENCIAL na gaveta de ação",
  },
  {
    icon: SparkleIcon,
    name: "SparkleIcon",
    meaning: "Botão de IA na gaveta (gerar título, descrição e legenda)",
  },
  {
    icon: SparklesIcon,
    name: "SparklesIcon",
    meaning: "Sugestões de pautas por IA (Planejamento); badge IA (Perfil)",
  },
  {
    icon: ZapIcon,
    name: "ZapIcon",
    meaning: "Sprint da ação (indicador e filtro; slug sprint)",
  },
];

const NAVIGATION_ICONS: IconItemDef[] = [
  {
    icon: HomeIcon,
    name: "HomeIcon",
    meaning: "Início / Dashboard da agência",
  },
  {
    icon: ArrowLeftIcon,
    name: "ArrowLeftIcon",
    meaning: "Voltar navegação / retorno de tela",
  },
  {
    icon: ChevronLeftIcon,
    name: "ChevronLeftIcon",
    meaning: "Mês/semana anterior; voltar em menus",
  },
  {
    icon: ChevronRightIcon,
    name: "ChevronRightIcon",
    meaning: "Próximo mês/semana; submenu",
  },
  {
    icon: ChevronDownIcon,
    name: "ChevronDownIcon",
    meaning: "Abrir seletores, comboboxes e menus",
  },
  {
    icon: ChevronUpIcon,
    name: "ChevronUpIcon",
    meaning: "Recolher seções (acordeão)",
  },
  {
    icon: ChevronsUpDownIcon,
    name: "ChevronsUpDownIcon",
    meaning: "Limitar altura dos dias (menu Visualizar); seletores",
  },
  {
    icon: PanelRightOpenIcon,
    name: "PanelRightOpenIcon",
    meaning: "Abrir painel lateral de comentários no portal (/dash)",
  },
  {
    icon: PanelRightCloseIcon,
    name: "PanelRightCloseIcon",
    meaning: "Fechar painel lateral de comentários no portal (/dash)",
  },
  {
    icon: LayoutGridIcon,
    name: "LayoutGridIcon",
    meaning:
      "Visão em Grade / Categorias (slug categories, galeria /ui, perfil)",
  },
  {
    icon: LayoutListIcon,
    name: "LayoutListIcon",
    meaning: 'Menu "Visualizar" (ViewOptions: modos linha, bloco e conteúdo)',
  },
  {
    icon: ListIcon,
    name: "ListIcon",
    meaning: "Visão em Lista (Perfil); histórico de prompts na gaveta",
  },
  {
    icon: ListOrderedIcon,
    name: "ListOrderedIcon",
    meaning: 'Menu "Ordenar" (ViewOptions: data, fase, direção)',
  },
  {
    icon: SquareCheckIcon,
    name: "SquareCheckIcon",
    meaning: "Ordenar por Fase (menu Ordenar do ViewOptions)",
  },
  {
    icon: Columns2Icon,
    name: "Columns2Icon",
    meaning: "4 colunas no modo Conteúdo (menu Visualizar)",
  },
  {
    icon: Columns3Icon,
    name: "Columns3Icon",
    meaning: "6 colunas no modo Conteúdo (menu Visualizar)",
  },
  {
    icon: Columns4Icon,
    name: "Columns4Icon",
    meaning: "7 colunas no modo Conteúdo (menu Visualizar)",
  },
  {
    icon: Rows2Icon,
    name: "Rows2Icon",
    meaning: "Modo Bloco (menu Visualizar no ViewOptions)",
  },
  {
    icon: Rows3Icon,
    name: "Rows3Icon",
    meaning: "Modo Linha (menu Visualizar no ViewOptions)",
  },
  {
    icon: Grid3X3Icon,
    name: "Grid3X3Icon",
    meaning:
      "Alternar Visão Feed / Instagram (no parceiro) e Visão por Categorias (em Hoje e Perfil) (alias: Grid3x3Icon)",
  },
  {
    icon: KanbanIcon,
    name: "KanbanIcon",
    meaning: "Visão por Kanban (em Hoje e Perfil); alterar fase no rodapé",
  },
  {
    icon: BlocksIcon,
    name: "BlocksIcon",
    meaning: "Visão por Feed (em Hoje e Perfil); visualização em blocos",
  },
  {
    icon: CalendarDaysIcon,
    name: "CalendarDaysIcon",
    meaning: 'Seletor de data na gaveta; botão "Hoje" no calendário',
  },
  {
    icon: CalendarIcon,
    name: "CalendarIcon",
    meaning:
      "Ir para Hoje / Ações do dia; alterar data em lote; estação planning",
  },
  {
    icon: CalendarRangeIcon,
    name: "CalendarRangeIcon",
    meaning: "Calendário da equipe; visão mensal do parceiro",
  },
  {
    icon: SlidersHorizontalIcon,
    name: "SlidersHorizontalIcon",
    meaning: "Reordenar mídias do Instagram / gerenciar conteúdo",
  },
  {
    icon: SettingsIcon,
    name: "SettingsIcon",
    meaning: "Configurações da conta / administração",
  },
  {
    icon: FilterIcon,
    name: "FilterIcon",
    meaning: "Filtros de ações e parceiros (também slug filter)",
  },
  {
    icon: ArrowDownAZIcon,
    name: "ArrowDownAZIcon",
    meaning: "Direção Decrescente (Z→A no menu Ordenar)",
  },
  {
    icon: ArrowUpAZIcon,
    name: "ArrowUpAZIcon",
    meaning: "Direção Crescente (A→Z no menu Ordenar)",
  },
  {
    icon: SearchIcon,
    name: "SearchIcon",
    meaning: "Busca global (Cmd+K) e campos de pesquisa",
  },
  {
    icon: SearchCheckIcon,
    name: "SearchCheckIcon",
    meaning: "Fase de Análise / Revisão (slug review em UIcons)",
  },
  {
    icon: BellIcon,
    name: "BellIcon",
    meaning: "Notificações (sino no Header e página /notifications)",
  },
  {
    icon: LogOutIcon,
    name: "LogOutIcon",
    meaning: "Sair da conta (logout da equipe e do portal)",
  },
  {
    icon: LogInIcon,
    name: "LogInIcon",
    meaning: "Entrar no sistema (login da equipe e do portal)",
  },
];

const ENTITY_ICONS: IconItemDef[] = [
  {
    icon: UserIcon,
    name: "UserIcon",
    meaning: "Perfil / usuário; alterar responsáveis em lote",
  },
  {
    icon: User2Icon,
    name: "User2Icon",
    meaning: "Gatilho do seletor de Responsáveis (UPeopleCombobox)",
  },
  {
    icon: UserCheckIcon,
    name: "UserCheckIcon",
    meaning: "Estação Cliente (slug client em UIcons)",
  },
  {
    icon: UserPlusIcon,
    name: "UserPlusIcon",
    meaning: "Cadastrar novo usuário ou conta de cliente comercial",
  },
  {
    icon: UsersIcon,
    name: "UsersIcon",
    meaning: "Equipe; exibir campo Responsáveis (ViewOptions); leads",
  },
  {
    icon: BriefcaseIcon,
    name: "BriefcaseIcon",
    meaning: '"Do parceiro" (menu de contexto do parceiro e busca global)',
  },
  {
    icon: Building2Icon,
    name: "Building2Icon",
    meaning: "Clientes comerciais / empresas na administração",
  },
  {
    icon: HandshakeIcon,
    name: "HandshakeIcon",
    meaning: "Seletor rápido de parceiro no AppBar; parceria",
  },
  {
    icon: HeartHandshakeIcon,
    name: "HeartHandshakeIcon",
    meaning: "Visão por Parceiros (em Hoje e Perfil); seletor de parceiros",
  },
  {
    icon: MegaphoneIcon,
    name: "MegaphoneIcon",
    meaning: "Campanhas / divulgação",
  },
  {
    icon: MailCheckIcon,
    name: "MailCheckIcon",
    meaning: "E-mail verificado / confirmação de envio",
  },
  {
    icon: MailOpenIcon,
    name: "MailOpenIcon",
    meaning: "E-mail aberto / recuperação de senha",
  },
  {
    icon: AtSignIcon,
    name: "AtSignIcon",
    meaning: "Campo de e-mail nas telas de login e redefinição",
  },
  {
    icon: PhoneIcon,
    name: "PhoneIcon",
    meaning: "Telefone / WhatsApp de contato no lead",
  },
  {
    icon: GlobeIcon,
    name: "GlobeIcon",
    meaning: "Comentário público (visível para o cliente no portal e revisão)",
  },
  {
    icon: KeyIcon,
    name: "KeyIcon",
    meaning: "Redefinição de senha",
  },
  {
    icon: KeyboardIcon,
    name: "KeyboardIcon",
    meaning: "Guia de atalhos de teclado da gaveta e do app",
  },
  {
    icon: ImageIcon,
    name: "ImageIcon",
    meaning: "Modo Conteúdo (ViewOptions); categoria Post Estático (post)",
  },
  {
    icon: FlagIcon,
    name: "FlagIcon",
    meaning: "Prioridade da ação",
  },
  {
    icon: TagIcon,
    name: "TagIcon",
    meaning: "Categoria da ação (campo na gaveta e menu Exibir)",
  },
  {
    icon: MessageSquareIcon,
    name: "MessageSquareIcon",
    meaning: "Comentários da ação",
  },
  {
    icon: BarChart3Icon,
    name: "BarChart3Icon",
    meaning: "Métricas operacionais no painel da Home",
  },
  {
    icon: SmartphoneIcon,
    name: "SmartphoneIcon",
    meaning: "Prévia de celular (Instagram / post)",
  },
  {
    icon: LaptopIcon,
    name: "LaptopIcon",
    meaning: "Tema do sistema / computador",
  },
  {
    icon: MonitorIcon,
    name: "MonitorIcon",
    meaning: "Tema do sistema (desktop)",
  },
  {
    icon: SunIcon,
    name: "SunIcon",
    meaning: "Tema claro",
  },
  {
    icon: MoonIcon,
    name: "MoonIcon",
    meaning: "Tema escuro",
  },
  {
    icon: PaletteIcon,
    name: "PaletteIcon",
    meaning: "Cores da ação / tema; estação creation (Criação)",
  },
  {
    icon: PipetteIcon,
    name: "PipetteIcon",
    meaning: "Conta-gotas para cor personalizada do tema ou ação",
  },
  {
    icon: HelpCircleIcon,
    name: "HelpCircleIcon",
    meaning: "Central de ajuda; fallback para slug não reconhecido",
  },
];

const EDITOR_ICONS: IconItemDef[] = [
  { icon: Bold, name: "Bold", meaning: "Negrito" },
  { icon: Italic, name: "Italic", meaning: "Itálico" },
  { icon: Strikethrough, name: "Strikethrough", meaning: "Tachado" },
  { icon: Heading1, name: "Heading1", meaning: "Título 1 (H1)" },
  { icon: Heading2, name: "Heading2", meaning: "Título 2 (H2)" },
  { icon: Heading3, name: "Heading3", meaning: "Título 3 (H3)" },
  { icon: List, name: "List", meaning: "Lista com marcadores" },
  { icon: ListOrdered, name: "ListOrdered", meaning: "Lista numerada" },
  { icon: Quote, name: "Quote", meaning: "Bloco de citação" },
  { icon: LinkEditorIcon, name: "Link", meaning: "Inserir / editar link" },
  {
    icon: Highlighter,
    name: "Highlighter",
    meaning: "Marca-texto / destaque",
  },
  { icon: Minus, name: "Minus", meaning: "Linha horizontal / divisor" },
  { icon: TableEditorIcon, name: "Table", meaning: "Inserir tabela" },
  { icon: Columns, name: "Columns", meaning: "Gerenciar colunas de tabela" },
  { icon: Rows, name: "Rows", meaning: "Gerenciar linhas de tabela" },
  { icon: Trash2, name: "Trash2", meaning: "Excluir tabela inteira" },
  {
    icon: ChevronDown,
    name: "ChevronDown",
    meaning: "Menu de opções da tabela",
  },
  {
    icon: ChevronRight,
    name: "ChevronRight",
    meaning: "Submenu de opções da tabela",
  },
  { icon: Undo2, name: "Undo2", meaning: "Desfazer alteração" },
  { icon: Redo2, name: "Redo2", meaning: "Refazer alteração" },
  {
    icon: RemoveFormatting,
    name: "RemoveFormatting",
    meaning: "Limpar formatação aplicada",
  },
];

interface CustomIconDef {
  slug?: string;
  name: string;
  meaning: string;
}

const CUSTOM_CATEGORIES: CustomIconDef[] = [
  { slug: "ads", name: "ads", meaning: "Tráfego Pago (Volume2Icon)" },
  { slug: "capture", name: "capture", meaning: "Gravação (CameraIcon)" },
  {
    slug: "carousel",
    name: "carousel",
    meaning: "Carrossel (GalleryHorizontalIcon)",
  },
  { slug: "design", name: "design", meaning: "Design (PenToolIcon)" },
  { slug: "dev", name: "dev", meaning: "Tech / Coding (BinaryIcon)" },
  { slug: "finance", name: "finance", meaning: "Financeiro (CoinsIcon)" },
  { slug: "meeting", name: "meeting", meaning: "Reunião (PresentationIcon)" },
  { slug: "post", name: "post", meaning: "Post Estático (ImageIcon)" },
  { slug: "print", name: "print", meaning: "Impresso (PrinterIcon)" },
  { slug: "reels", name: "reels", meaning: "Reels (PlayIcon)" },
  { slug: "sm", name: "sm", meaning: "Social Media (BadgeCheckIcon)" },
  {
    slug: "stories",
    name: "stories",
    meaning: "Stories (CircleFadingPlusIcon)",
  },
  { slug: "todo", name: "todo", meaning: "Tarefa (ClipboardCheckIcon)" },
  { slug: "sprint", name: "sprint", meaning: "Sprint (ZapIcon)" },
  {
    slug: "categories",
    name: "categories",
    meaning: "Visão Categorias (LayoutGridIcon)",
  },
  { slug: "filter", name: "filter", meaning: "Filtros (FilterIcon)" },
  {
    slug: "instagram",
    name: "instagram",
    meaning: "Instagram — aba Instagram e categoria (SVG próprio)",
  },
];

const CUSTOM_PHASES: CustomIconDef[] = [
  { slug: "idea", name: "idea", meaning: "Ideia (LightbulbIcon)" },
  { slug: "do", name: "do", meaning: "Fazer (CirclePlayIcon)" },
  { slug: "doing", name: "doing", meaning: "Fazendo (PenLineIcon)" },
  {
    slug: "review",
    name: "review",
    meaning: "Análise / Revisão (SearchCheckIcon)",
  },
  { slug: "done", name: "done", meaning: "Feito (CircleCheckIcon)" },
  {
    slug: "finished",
    name: "finished",
    meaning: "Concluído (BadgeCheckIcon)",
  },
];

const CUSTOM_STATIONS: CustomIconDef[] = [
  {
    slug: "flow",
    name: "flow",
    meaning: "Fluxo — estação Flow / cérebro (BrainIcon)",
  },
  {
    slug: "planning",
    name: "planning",
    meaning: "Planejamento — estação de planejamento (CalendarIcon)",
  },
  {
    slug: "creation",
    name: "creation",
    meaning: "Criação — estação de criação (PaletteIcon)",
  },
  {
    slug: "client",
    name: "client",
    meaning: "Cliente — estação do cliente / aprovação (UserCheckIcon)",
  },
];

const CUSTOM_DEFAULT: CustomIconDef[] = [
  {
    slug: undefined,
    name: "(padrão)",
    meaning: "Sem slug reconhecido — fallback de ajuda (HelpCircleIcon)",
  },
];

function IconGridItem({ icon: Icon, name, meaning }: IconItemDef) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <Icon className="size-4 opacity-60" />
        <Icon className="size-5 opacity-60" />
      </div>
      <span className="font-mono text-xs">{name}</span>
      <span className="text-xs text-muted-foreground">{meaning}</span>
    </div>
  );
}

function CustomIconGridItem({ slug, name, meaning }: CustomIconDef) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <UIcons className="size-4 opacity-60" slug={slug} />
        <UIcons className="size-5 opacity-60" slug={slug} />
      </div>
      <span className="font-mono text-xs">{name}</span>
      <span className="text-xs text-muted-foreground">{meaning}</span>
    </div>
  );
}

export function TokensIconsSection() {
  return (
    <div id="tokens-icons">
      <GallerySection>
        <GallerySectionHeader
          description="Ícones usados no app com a validação do uso específico de cada um nas telas (visões de feed, modos do Kanban, gaveta, menus e barras). Biblioteca Lucide, exceto os customizados."
          title="Ícones"
        />
        <GallerySectionContent className="flex flex-col gap-10">
          {/* 1. Ações e edição */}
          <div className="flex flex-col gap-4" id="tokens-icons-actions">
            <h4 className="text-sm font-medium">1. Ações e edição</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
              {ACTION_ICONS.map((item) => (
                <IconGridItem
                  key={item.name}
                  icon={item.icon}
                  meaning={item.meaning}
                  name={item.name}
                />
              ))}
            </div>
          </div>

          {/* 2. Estados e feedback */}
          <div className="flex flex-col gap-4" id="tokens-icons-feedback">
            <h4 className="text-sm font-medium">2. Estados e feedback</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
              {FEEDBACK_ICONS.map((item) => (
                <IconGridItem
                  key={item.name}
                  icon={item.icon}
                  meaning={item.meaning}
                  name={item.name}
                />
              ))}
            </div>
          </div>

          {/* 3. Navegação e layout */}
          <div className="flex flex-col gap-4" id="tokens-icons-navigation">
            <h4 className="text-sm font-medium">3. Navegação e layout</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
              {NAVIGATION_ICONS.map((item) => (
                <IconGridItem
                  key={item.name}
                  icon={item.icon}
                  meaning={item.meaning}
                  name={item.name}
                />
              ))}
            </div>
          </div>

          {/* 4. Entidades */}
          <div className="flex flex-col gap-4" id="tokens-icons-entities">
            <h4 className="text-sm font-medium">
              4. Entidades (pessoas, parceiros, contas)
            </h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
              {ENTITY_ICONS.map((item) => (
                <IconGridItem
                  key={item.name}
                  icon={item.icon}
                  meaning={item.meaning}
                  name={item.name}
                />
              ))}
            </div>
          </div>

          {/* 5. Texto (editor) */}
          <div className="flex flex-col gap-4" id="tokens-icons-text">
            <h4 className="text-sm font-medium">
              5. Texto (barra do editor, RichTextEditor.tsx)
            </h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
              {EDITOR_ICONS.map((item) => (
                <IconGridItem
                  key={item.name}
                  icon={item.icon}
                  meaning={item.meaning}
                  name={item.name}
                />
              ))}
            </div>
          </div>

          {/* 6. Customizados */}
          <div className="flex flex-col gap-6" id="tokens-icons-custom">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium">
                6. Customizados (UIcons.tsx, função Icons)
              </h4>
              <p className="text-xs text-muted-foreground">
                Ícones por slug utilizados em categorias, fases do Kanban e
                estações de fluxo.
              </p>
            </div>

            {/* Categorias */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Categorias
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
                {CUSTOM_CATEGORIES.map((item) => (
                  <CustomIconGridItem
                    key={item.name}
                    meaning={item.meaning}
                    name={item.name}
                    slug={item.slug}
                  />
                ))}
              </div>
            </div>

            {/* Fases */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Fases (Kanban)
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
                {CUSTOM_PHASES.map((item) => (
                  <CustomIconGridItem
                    key={item.name}
                    meaning={item.meaning}
                    name={item.name}
                    slug={item.slug}
                  />
                ))}
              </div>
            </div>

            {/* Estações */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Estações (Fluxo)
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
                {CUSTOM_STATIONS.map((item) => (
                  <CustomIconGridItem
                    key={item.name}
                    meaning={item.meaning}
                    name={item.name}
                    slug={item.slug}
                  />
                ))}
              </div>
            </div>

            {/* Padrão */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Padrão (sem slug reconhecido)
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
                {CUSTOM_DEFAULT.map((item) => (
                  <CustomIconGridItem
                    key={item.name}
                    meaning={item.meaning}
                    name={item.name}
                    slug={item.slug}
                  />
                ))}
              </div>
            </div>
          </div>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
