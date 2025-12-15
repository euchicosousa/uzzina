export const STATES = {
  idea: {
    slug: "idea",
    title: "Ideia",
    shortcut: "i",
    color: "#fb3",
    foreground: "#333",
    order: 1,
  },
  do: {
    slug: "do",
    title: "Fazer",
    shortcut: "f",
    color: "#F75",
    foreground: "#fff",
    order: 2,
  },
  doing: {
    slug: "doing",
    title: "Fazendo",
    shortcut: "z",
    color: "#f49",
    foreground: "#fff",
    order: 3,
  },
  review: {
    slug: "review",
    title: "Análise",
    shortcut: "a",
    color: "#93e",
    foreground: "#fff",
    order: 4,
  },
  approved: {
    slug: "approved",
    title: "Aprovado",
    shortcut: "p",
    color: "#06f",
    foreground: "#fff",
    order: 5,
  },
  done: {
    slug: "done",
    title: "Feito",
    shortcut: "t",
    color: "#3cc",
    foreground: "#fff",
    order: 6,
  },
  finished: {
    slug: "finished",
    title: "Concluído",
    shortcut: "c",
    color: "#7c3",
    foreground: "#fff",
    order: 7,
  },
} as const;

export type STATE = keyof typeof STATES;
export type STATE_TYPE = (typeof STATES)[STATE];

export const CATEGORIES = {
  ads: {
    slug: "ads",
    title: "Tráfego Pago",
    shortcut: "a",
    color: "#0099ff",
    area: "account",
    tag: "ADS",
    tag_min: "ad",
  },
  capture: {
    slug: "capture",
    title: "Gravação",
    shortcut: "u",
    color: "#00ffc4",
    area: "creative",
    tag: "REC",
    tag_min: "gr",
  },
  carousel: {
    slug: "carousel",
    title: "Carrossel",
    shortcut: "c",
    color: "#ff0071",
    area: "creative",
    tag: "CRSL",
    tag_min: "cr",
  },
  design: {
    slug: "design",
    title: "Design",
    shortcut: "d",
    color: "#ff0080",
    area: "creative",
    tag: "DSGN",
    tag_min: "dg",
  },
  dev: {
    slug: "dev",
    title: "Tech/Coding",
    shortcut: "g",
    color: "#b1ff00",
    area: "creative",
    tag: "TECH",
    tag_min: "tc",
  },
  finance: {
    slug: "finance",
    title: "Financeiro",
    shortcut: "f",
    color: "#46b95d",
    area: "adm",
    tag: "FINC",
    tag_min: "fn",
  },
  meeting: {
    slug: "meeting",
    title: "Reunião",
    shortcut: "m",
    color: "#375bc8",
    area: "account",
    tag: "REUN",
    tag_min: "re",
  },
  plan: {
    slug: "plan",
    title: "Planejamento",
    shortcut: "e",
    color: "#00e6ff",
    area: "account",
    tag: "PLAN",
    tag_min: "pl",
  },
  post: {
    slug: "post",
    title: "Post",
    shortcut: "p",
    color: "#ff4000",
    area: "creative",
    tag: "POST",
    tag_min: "pt",
  },
  print: {
    slug: "print",
    title: "Impresso",
    shortcut: "i",
    color: "#cc33aa",
    area: "creative",
    tag: "IMPR",
    tag_min: "im",
  },
  reels: {
    slug: "reels",
    title: "Reels",
    shortcut: "r",
    color: "#aa00ff",
    area: "creative",
    tag: "REEL",
    tag_min: "rl",
  },
  sm: {
    slug: "sm",
    title: "Social Media",
    shortcut: "l",
    color: "#ff0015",
    area: "account",
    tag: "SOCI",
    tag_min: "sm",
  },
  stories: {
    slug: "stories",
    title: "Stories",
    shortcut: "s",
    color: "#aacc33",
    area: "creative",
    tag: "STOR",
    tag_min: "st",
  },
  todo: {
    slug: "todo",
    title: "Tarefa",
    shortcut: "t",
    color: "#0088ff",
    area: "account",
    tag: "TASK",
    tag_min: "ta",
  },
} as const;

export type CATEGORY = keyof typeof CATEGORIES;
export type CATEGORY_TYPE = (typeof CATEGORIES)[CATEGORY];

export const PRIORITIES = {
  low: {
    slug: "low",
    title: "Baixa",
    shortcut: ",",
  },
  medium: {
    slug: "medium",
    title: "Média",
    shortcut: ".",
  },
  high: {
    slug: "high",
    title: "Alta",
    shortcut: "/",
  },
} as const;

export type PRIORITY = keyof typeof PRIORITIES;
export type PRIORITY_TYPE = (typeof PRIORITIES)[PRIORITY];

export const AREAS = {
  adm: {
    slug: "adm",
    title: "Administrativo/Financeiro",
    role: 1,
  },
  account: {
    slug: "account",
    title: "Atendimento",
    role: 2,
  },
  creative: {
    slug: "creative",
    title: "Criação",
    role: 3,
  },
} as const;

export type AREA = keyof typeof AREAS;
export type AREA_TYPE = (typeof AREAS)[AREA];

export const GENESIS = {
  market: {
    category: "EXTERNO",
    title: "Mercado",
    slug: "market",
    description: "Tendências macro e futurismo.",
  },
  news: {
    category: "EXTERNO",
    title: "Notícia",
    slug: "news",
    description: "Fatos atuais e breaking news.",
  },
  culture: {
    category: "INTERNO",
    title: "Cultura",
    slug: "culture",
    description: "Comportamento, memes e zeitgeist.",
  },
  bastidores: {
    category: "INTERNO",
    title: "Bastidores",
    slug: "bastidores",
    description: "Rotina crua e documentos.",
  },
  process: {
    category: "INTERNO",
    title: "Processo",
    slug: "process",
    description: 'O método técnico, o "como fazer".',
  },
  pov: {
    category: "INTERNO",
    title: "POV",
    slug: "pov",
    description: "Opinião proprietária e manifestos.",
  },
  errors: {
    category: "INTERNO",
    title: "Erros",
    slug: "errors",
    description: "Mitos e críticas ao mercado.",
  },
  community: {
    category: "SOCIAL",
    title: "Comunidade",
    slug: "community",
    description: "Respostas a dúvidas e Q&A.",
  },
  cases: {
    category: "PROVA",
    title: "Cases",
    slug: "cases",
    description: "Histórias de sucesso (Jornada do Herói).",
  },
  product: {
    category: "INTERNO",
    title: "Produto",
    slug: "product",
    description: "Oferta e mecanismo único.",
  },
} as const;

export const MISSIONS = {
  top: {
    title: "Topo",
    slug: "top",
    description:
      "Inconsciente/Sintoma: Focar em romper a bolha e simplicidade.",
  },
  middle: {
    title: "Meio",
    slug: "middle",
    description:
      "Consciente do Problema: Focar em diagnóstico e diferenciação.",
  },
  bottom: {
    title: "Fundo",
    slug: "bottom",
    description: "Consciente da Solução: Focar em quebra de objeção e oferta.",
  },
} as const;

export const GOALS = {
  education: {
    title: "Educação",
    slug: "education",
    description: "Tom Didático (Professor).",
  },
  informative: {
    title: "Informativo",
    slug: "informative",
    description: "Tom Jornalístico (Repórter).",
  },
  authority: {
    title: "Autoridade",
    slug: "authority",
    description: "Tom Firme/Polêmico (Crítico).",
  },
  inspiration: {
    title: "Inspiração",
    slug: "inspiration",
    description: "Tom Elevado (Mentor).",
  },
  connection: {
    title: "Conexão",
    slug: "connection",
    description: "Tom Vulnerável (Humano).",
  },
  entertainment: {
    title: "Entretenimento",
    slug: "entertainment",
    description: "Tom Leve/Irônico (Amigo).",
  },
  demonstration: {
    title: "Demonstração",
    slug: "demonstration",
    description: "Tom Técnico (Vendedor).",
  },
} as const;

export const SCRIPT = `HOOK/HEADLINE - Para o dedo.
MECANISMO - Explica a lógica (o porquê).
PROVA - O dado concreto/visual.
APLICAÇÃO - O que fazer agora.
DIREÇÃO - O CTA estratégico.`;

export const SIZE = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
} as const;

export const DATE_TIME_DISPLAY = {
  Relative: 1,
  DateTime: 2,
  DateMonthTime: 3,
  DayDateMonthTime: 4,
  DayDate: 5,
  TimeOnly: 6,
  DateOnly: 7,
  Null: 8,
} as const;

export const VARIANT = {
  line: "line",
  block: "block",
  content: "content",
  hour: "hour",
} as const;

export const INTENT = {
  create_action: "create-action",
  update_action: "update-action",
  duplicate_action: "duplicate-action",
  caption_ai: "caption-ai",
} as const;

export const ORDER_BY = {
  date: "date",
  instagram_date: "instagram_date",
  priority: "priority",
  state: "state",
} as const;
