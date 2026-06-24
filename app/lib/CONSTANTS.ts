export const PHASES = {
  idea: {
    slug: "idea",
    title: "Ideia",
    color: "#fb3",
    order: 1,
    shortcut: "i",
    key: "KeyI",
  },
  fazer: {
    slug: "fazer",
    title: "Fazer",
    color: "#F75",
    order: 2,
    shortcut: "f",
    key: "KeyF",
  },
  produzindo: {
    slug: "produzindo",
    title: "Produzindo",
    color: "#93e",
    order: 3,
    shortcut: "p",
    key: "KeyP",
  },
  alinhamento: {
    slug: "alinhamento",
    title: "Alinhamento",
    color: "#f49",
    order: 4,
    shortcut: "a",
    key: "KeyA",
  },
  revisao: {
    slug: "revisao",
    title: "Revisão",
    color: "#06f",
    order: 5,
    shortcut: "r",
    key: "KeyR",
  },
  concluido: {
    slug: "concluido",
    title: "Concluído",
    color: "#7c3",
    order: 6,
    shortcut: "c",
    key: "KeyC",
  },
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
export const SIZE = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  "2xl": "2xl",
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
  hair: "hair",
} as const;
export const INTENT = {
  create_action: "create-action",
  update_action: "update-action",
  bulk_update_actions: "bulk-update-actions",
  bulk_update_date_only: "bulk-update-date-only",
  bulk_update_time_only: "bulk-update-time-only",
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
  mark_notification_read: "mark-notification-read",
  mark_all_notifications_read: "mark-all-notifications-read",
} as const;
export const ORDER_BY = {
  date: "date",
  priority: "priority",
  phase: "phase",
} as const;
export const PALLETE = [
  {
    id: "default",
    label: "Padrão",
    light: {
      primary: {
        h: 0,
        c: 0,
        l: 0,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 240,
        c: 0.001,
        l: 0.96,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 0,
        c: 0,
        l: 1,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 250,
        c: 0.01,
        l: 0.2,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "energy",
    label: "Energy",
    light: {
      primary: {
        h: 120,
        c: 0.26,
        l: 0.9,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 240,
        c: 0.001,
        l: 0.96,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 120,
        c: 0.26,
        l: 0.9,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 250,
        c: 0.01,
        l: 0.2,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "blue",
    label: "Azul (Padrão)",
    light: {
      primary: {
        h: 264,
        c: 0.31,
        l: 0.45,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 264,
        c: 0.31,
        l: 0.58,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "purple",
    label: "Roxo",
    light: {
      primary: {
        h: 290,
        c: 0.28,
        l: 0.54,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 290,
        c: 0.005,
        l: 0.99,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 290,
        c: 0.28,
        l: 0.68,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "magenta",
    label: "Magenta",
    light: {
      primary: {
        h: 350,
        c: 0.4,
        l: 0.9,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 320,
        c: 0.02,
        l: 0.98,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 350,
        c: 0.4,
        l: 0.8,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 340,
        c: 0.1,
        l: 0.3,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  // {
  //   id: "pink",
  //   label: "Rosa",
  //   light: {
  //     primary: { h: 340, c: 0.25, l: 0.65 },
  //     primaryFg: { h: 0, c: 0, l: 1 },
  //     bg: { h: 0, c: 0, l: 1 },
  //     fg: { h: 0, c: 0, l: 0 },
  //   },
  //   dark: {
  //     primary: { h: 340, c: 0.25, l: 0.68 },
  //     primaryFg: { h: 0, c: 0, l: 1 },
  //     bg: { h: 285, c: 0.005, l: 0.141 },
  //     fg: { h: 0, c: 0, l: 1 },
  //   },
  // },
  {
    id: "red",
    label: "Vermelho",
    light: {
      primary: {
        h: 20,
        c: 0.25,
        l: 0.62,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 20,
        c: 0.25,
        l: 0.68,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "orange",
    label: "Laranja",
    light: {
      primary: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 130,
        c: 0.01,
        l: 0.95,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 25,
        c: 0.18,
        l: 0.65,
      },
      primaryFg: {
        h: 130,
        c: 0.02,
        l: 0.9,
      },
      bg: {
        h: 180,
        c: 0.015,
        l: 0.25,
      },
      fg: {
        h: 130,
        c: 0.01,
        l: 0.95,
      },
    },
  },
  {
    id: "yellow",
    label: "Amarelo",
    light: {
      primary: {
        h: 100,
        c: 0.5,
        l: 0.8,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 100,
        c: 0.4,
        l: 0.8,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "green",
    label: "Verde",
    light: {
      primary: {
        h: 130,
        c: 0.2,
        l: 0.7,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 130,
        c: 0.2,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "cyan",
    label: "Ciano",
    light: {
      primary: {
        h: 200,
        c: 0.2,
        l: 0.7,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 200,
        c: 0.2,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "light-blue",
    label: "Azul Claro",
    light: {
      primary: {
        h: 240,
        c: 0.22,
        l: 0.7,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 0,
        c: 0,
        l: 1,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 240,
        c: 0.22,
        l: 0.65,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 0,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
  {
    id: "navy",
    label: "Azul Marinho",
    light: {
      primary: {
        h: 250,
        c: 0.12,
        l: 0.5,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 90,
        c: 0.005,
        l: 0.99,
      },
      fg: {
        h: 0,
        c: 0,
        l: 0,
      },
    },
    dark: {
      primary: {
        h: 250,
        c: 0.12,
        l: 0.6,
      },
      primaryFg: {
        h: 0,
        c: 0,
        l: 1,
      },
      bg: {
        h: 285,
        c: 0.005,
        l: 0.141,
      },
      fg: {
        h: 0,
        c: 0,
        l: 1,
      },
    },
  },
];
