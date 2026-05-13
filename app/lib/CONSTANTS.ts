export const PHASES = {
  idea: { slug: "idea", title: "Ideia", color: "#fb3", order: 1 },
  estrategia: {
    slug: "estrategia",
    title: "Estratégia",
    color: "#F75",
    order: 2,
  },
  alinhamento: {
    slug: "alinhamento",
    title: "Alinhamento",
    color: "#93e",
    order: 3,
  },
  criacao: { slug: "criacao", title: "Criação", color: "#f49", order: 4 },
  aprovacao: { slug: "aprovacao", title: "Aprovação", color: "#06f", order: 5 },
  concluido: { slug: "concluido", title: "Concluído", color: "#7c3", order: 6 },
} as const;

export type PHASE = keyof typeof PHASES;
export type PHASE_TYPE = (typeof PHASES)[PHASE];

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
  post: {
    slug: "post",
    title: "Post Estático",
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

export const CATEGORY_PHASES: Partial<Record<CATEGORY, PHASE[]>> = {
  post: [
    "idea",
    "estrategia",
    "alinhamento",
    "criacao",
    "aprovacao",
    "concluido",
  ],
  reels: [
    "idea",
    "estrategia",
    "alinhamento",
    "criacao",
    "aprovacao",
    "concluido",
  ],
  carousel: [
    "idea",
    "estrategia",
    "alinhamento",
    "criacao",
    "aprovacao",
    "concluido",
  ],
  ads: [
    "idea",
    "estrategia",
    "alinhamento",
    "criacao",
    "aprovacao",
    "concluido",
  ],
  design: ["idea", "estrategia", "criacao", "aprovacao", "concluido"],
  print: ["idea", "estrategia", "criacao", "aprovacao", "concluido"],
  dev: ["idea", "estrategia", "criacao", "aprovacao", "concluido"],
  stories: ["idea", "estrategia", "criacao", "aprovacao", "concluido"],
  sm: ["idea", "estrategia", "alinhamento", "criacao", "concluido"],
  capture: ["idea", "estrategia", "criacao", "concluido"],
  meeting: ["idea", "criacao", "concluido"],
  finance: ["idea", "criacao", "aprovacao", "concluido"],
  todo: ["idea", "criacao", "concluido"],
};

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
  "2xl": "2xl",
} as const;

export const COLUMNS = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
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
  hair: "hair",
} as const;

export const INTENT = {
  create_action: "create-action",
  update_action: "update-action",
  bulk_update_actions: "bulk-update-actions",
  duplicate_action: "duplicate-action",
  delete_action: "delete-action",
  create_comment: "create-comment",
  update_comment: "update-comment",
  delete_comment: "delete-comment",
  ai_caption: "ai-caption",
  ai_hooks: "ai-hooks",
  ai_post: "ai-post",
  ai_carousel: "ai-carousel",
  ai_stories: "ai-stories",
  ai_reels: "ai-reels",
} as const;

export const ORDER_BY = {
  date: "date",
  priority: "priority",
  phase: "phase",
} as const;

export const PALLETE = [
  {
    label: "Padrão",
    light: {
      primary: { h: 0, c: 0, l: 0 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 0, c: 0, l: 0.4 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Azul (Padrão)",
    light: {
      primary: { h: 264, c: 0.31, l: 0.45 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 264, c: 0.31, l: 0.58 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Roxo",
    light: {
      primary: { h: 290, c: 0.28, l: 0.54 },
      bg: { h: 290, c: 0.005, l: 0.99 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 290, c: 0.28, l: 0.68 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Magenta",
    light: {
      primary: { h: 350, c: 0.4, l: 0.9 },
      bg: { h: 320, c: 0.02, l: 0.98 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 350, c: 0.4, l: 0.8 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Rosa",
    light: {
      primary: { h: 340, c: 0.25, l: 0.65 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 340, c: 0.25, l: 0.68 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Vermelho",
    light: {
      primary: { h: 20, c: 0.25, l: 0.62 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 20, c: 0.25, l: 0.68 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Laranja",
    light: {
      primary: { h: 40, c: 0.22, l: 0.7 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 40, c: 0.22, l: 0.75 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Amarelo",
    light: {
      primary: { h: 100, c: 0.5, l: 0.8 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 100, c: 0.4, l: 0.8 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Verde",
    light: {
      primary: { h: 130, c: 0.2, l: 0.7 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 130, c: 0.2, l: 0.65 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Ciano",
    light: {
      primary: { h: 200, c: 0.2, l: 0.7 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 200, c: 0.2, l: 0.65 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Azul Claro",
    light: {
      primary: { h: 240, c: 0.22, l: 0.7 },
      bg: { h: 0, c: 0, l: 1 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 240, c: 0.22, l: 0.65 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
  {
    label: "Azul Marinho",
    light: {
      primary: { h: 250, c: 0.12, l: 0.5 },
      bg: { h: 90, c: 0.005, l: 0.99 },
      fg: { h: 0, c: 0, l: 0 },
    },
    dark: {
      primary: { h: 250, c: 0.12, l: 0.6 },
      bg: { h: 285, c: 0.005, l: 0.141 },
      fg: { h: 0, c: 0, l: 1 },
    },
  },
];
