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

// export const GENESIS = {
//   market: {
//     category: "EXTERNO",
//     title: "Mercado",
//     slug: "market",
//     description: "Tendências macro e futurismo.",
//   },
//   news: {
//     category: "EXTERNO",
//     title: "Notícia",
//     slug: "news",
//     description: "Fatos atuais e breaking news.",
//   },
//   culture: {
//     category: "INTERNO",
//     title: "Cultura",
//     slug: "culture",
//     description: "Comportamento, memes e zeitgeist.",
//   },
//   bastidores: {
//     category: "INTERNO",
//     title: "Bastidores",
//     slug: "bastidores",
//     description: "Rotina crua e documentos.",
//   },
//   process: {
//     category: "INTERNO",
//     title: "Processo",
//     slug: "process",
//     description: 'O método técnico, o "como fazer".',
//   },
//   pov: {
//     category: "INTERNO",
//     title: "POV",
//     slug: "pov",
//     description: "Opinião proprietária e manifestos.",
//   },
//   errors: {
//     category: "INTERNO",
//     title: "Erros",
//     slug: "errors",
//     description: "Mitos e críticas ao mercado.",
//   },
//   community: {
//     category: "SOCIAL",
//     title: "Comunidade",
//     slug: "community",
//     description: "Respostas a dúvidas e Q&A.",
//   },
//   cases: {
//     category: "PROVA",
//     title: "Cases",
//     slug: "cases",
//     description: "Histórias de sucesso (Jornada do Herói).",
//   },
//   product: {
//     category: "INTERNO",
//     title: "Produto",
//     slug: "product",
//     description: "Oferta e mecanismo único.",
//   },
// } as const;

// export const MISSIONS = {
//   top: {
//     title: "Topo",
//     slug: "top",
//     description:
//       "Inconsciente/Sintoma: Focar em romper a bolha e simplicidade.",
//   },
//   middle: {
//     title: "Meio",
//     slug: "middle",
//     description:
//       "Consciente do Problema: Focar em diagnóstico e diferenciação.",
//   },
//   bottom: {
//     title: "Fundo",
//     slug: "bottom",
//     description: "Consciente da Solução: Focar em quebra de objeção e oferta.",
//   },
// } as const;

// export const GOALS = {
//   education: {
//     title: "Educação",
//     slug: "education",
//     description: "Tom Didático (Professor).",
//   },
//   informative: {
//     title: "Informativo",
//     slug: "informative",
//     description: "Tom Jornalístico (Repórter).",
//   },
//   authority: {
//     title: "Autoridade",
//     slug: "authority",
//     description: "Tom Firme/Polêmico (Crítico).",
//   },
//   inspiration: {
//     title: "Inspiração",
//     slug: "inspiration",
//     description: "Tom Elevado (Mentor).",
//   },
//   connection: {
//     title: "Conexão",
//     slug: "connection",
//     description: "Tom Vulnerável (Humano).",
//   },
//   entertainment: {
//     title: "Entretenimento",
//     slug: "entertainment",
//     description: "Tom Leve/Irônico (Amigo).",
//   },
//   demonstration: {
//     title: "Demonstração",
//     slug: "demonstration",
//     description: "Tom Técnico (Vendedor).",
//   },
// } as const;

export const GOALS = {
  education: {
    title: "Educação",
    slug: "education",
    instruction:
      "Macro: PROFESSOR (Papel Didático). Use a Nuance de Mentor: linguagem simples, acolhedora e focada no aprendizado prático do usuário.",
  },
  informative: {
    title: "Informativo",
    slug: "informative",
    instruction:
      "Macro: PROFESSOR (Papel Didático). Use a Nuance de Acadêmico: rigor técnico, clareza absoluta e foco na precisão dos dados apresentados.",
  },
  authority: {
    title: "Autoridade",
    slug: "authority",
    instruction:
      "Macro: CRÍTICO (Papel de Autoridade). Use a Nuance de Cético: foco em fatos e lógica fria. Se o texto não gerar discordância ou desconforto, ele está seguro demais.",
  },
  inspiration: {
    title: "Inspiração",
    slug: "inspiration",
    instruction:
      "Macro: EXPLORADOR (Papel de Curadoria). Use a Nuance de Desbravador: mostre o teste, o erro real e a jornada de quem está no campo de batalha.",
  },
  connection: {
    title: "Conexão",
    slug: "connection",
    instruction:
      "Macro: HUMANO (Papel de Conexão). Use a Nuance de Empático: foque nas dores e na jornada real do outro, gerando identificação imediata.",
  },
  entertainment: {
    title: "Entretenimento",
    slug: "entertainment",
    instruction:
      "Macro: CRÍTICO (Papel de Autoridade). Use a Nuance de Irônico: utilize o sarcasmo inteligente para educar e criticar padrões medíocres do mercado.",
  },
  demonstration: {
    title: "Demonstração",
    slug: "demonstration",
    instruction:
      "Macro: HUMANO (Papel de Conexão). Use a Nuance de Pragmático: mostre a vida real como ela é, sem filtros, focando na aplicação prática do produto ou método no dia a dia.",
  },
} as const;

export const MISSIONS = {
  top: {
    title: "Topo",
    slug: "top",
    instruction:
      "Missão: Romper a bolha. Focar no Inconsciente ou no Sintoma. O conteúdo deve ser simples, direto e focado em atrair estranhos que ainda não conhecem a marca ou o problema.",
  },
  middle: {
    title: "Meio",
    slug: "middle",
    instruction:
      "Missão: Diagnosticar e diferenciar. Focar no Consciente do Problema. Atue como o especialista que expõe a causa real das dores, separando o amadorismo da solução profissional.",
  },
  bottom: {
    title: "Fundo",
    slug: "bottom",
    instruction:
      "Missão: Quebrar objeções e vender. Focar no Consciente da Solução. O conteúdo deve ser direto, focado em prova social, oferta clara e remoção de qualquer barreira para a conversão.",
  },
} as const;

export const GENESIS = {
  market: {
    category: "EXTERNO",
    title: "Mercado",
    slug: "market",
    instruction:
      "Origem: Mercado. Analise tendências macro e futurismo. Posicione a marca como uma antena que antecipa movimentos do setor.",
  },
  news: {
    category: "EXTERNO",
    title: "Notícia",
    slug: "news",
    instruction:
      "Origem: Notícia. Utilize fatos atuais e breaking news para gerar relevância imediata e autoridade de opinião.",
  },
  culture: {
    category: "EXTERNO",
    title: "Cultura",
    slug: "culture",
    instruction:
      "Origem: Cultura. Conecte a marca ao comportamento atual, memes e ao Zeitgeist.",
  },
  bastidores: {
    category: "INTERNO",
    title: "Bastidores",
    slug: "bastidores",
    instruction:
      "Origem: Bastidores. Mostre a rotina crua e documentos reais do processo. Menos perfeição, mais verdade operacional.",
  },
  process: {
    category: "INTERNO",
    title: "Processo",
    slug: "process",
    instruction:
      "Origem: Processo. Explique o método técnico proprietário (o 'como fazer') para validar a competência da marca.",
  },
  pov: {
    category: "INTERNO",
    title: "POV",
    slug: "pov",
    instruction:
      "Origem: POV (Point of View). Traga a opinião proprietária e manifestos que reforcem o posicionamento único da marca.",
  },
  errors: {
    category: "INTERNO",
    title: "Erros",
    slug: "errors",
    instruction:
      "Origem: Erros e Mitos. Critique práticas comuns do mercado e desmonte mitos que prejudicam o cliente.",
  },
  community: {
    category: "PROVA/SOCIAL",
    title: "Comunidade",
    slug: "community",
    instruction:
      "Origem: Comunidade. Utilize respostas a dúvidas reais e sessões de Q&A para construir proximidade e autoridade.",
  },
  cases: {
    category: "PROVA/SOCIAL",
    title: "Cases",
    slug: "cases",
    instruction:
      "Origem: Cases. Narre histórias de sucesso utilizando a jornada do herói e resultados concretos.",
  },
  product: {
    category: "PROVA/SOCIAL",
    title: "Produto",
    slug: "product",
    instruction:
      "Origem: Produto. Foque na oferta direta e no mecanismo único que torna a solução indispensável.",
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
  caption_ai: "caption-ai",
  create_comment: "create-comment",
  update_comment: "update-comment",
  delete_comment: "delete-comment",
} as const;

export const ORDER_BY = {
  date: "date",
  priority: "priority",
  state: "state",
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
      bg: { h: 220, c: 0.005, l: 0.99 },
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
