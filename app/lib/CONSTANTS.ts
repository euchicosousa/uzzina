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

export const STATE = {
  idea: "idea",
  do: "do",
  doing: "doing",
  review: "review",
  approved: "approved",
  done: "done",
  finished: "finished",
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

export const PRIORITY = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export const ORDER_BY = {
  date: "date",
  instagram_date: "instagram_date",
  priority: "priority",
  state: "state",
} as const;
