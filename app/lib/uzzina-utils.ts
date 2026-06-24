import Color from "color";
export const getGridCols = (count: number) => {
  // Se for muito item, não tentamos ser espertos, usamos um padrão
  if (count > 20) return "grid-cols-4 sm:grid-cols-5";
  if (count % 5 === 0) return "grid-cols-5";
  if (count % 4 === 0) return "grid-cols-4";
  if (count % 3 === 0) return "grid-cols-3";
  return "grid-cols-4"; // Fallback
};
export const getGridClasses = (columns: number) => {
  if (columns === 1) return "flex flex-col";

  // Se for um valor fixo entre 2 e 6
  if (columns >= 2 && columns <= 6) {
    const classes = ["grid", "grid-cols-2"]; // Começa sempre com 2 no mobile

    if (columns >= 3) classes.push("sm:grid-cols-3");
    if (columns >= 4) classes.push("md:grid-cols-4");
    if (columns >= 5) classes.push("lg:grid-cols-5");
    if (columns === 6) classes.push("xl:grid-cols-6"); // 6 colunas costuma pedir telas bem largas

    return classes.join(" ");
  }

  // Fallback para auto-fill (o mais seguro para listas gigantes)
  return "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]";
};
export const normalizeHexColor = (color: string) => {
  if (color && color.length === 4 && color.startsWith("#")) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  if (color && color.length === 7 && color.startsWith("#")) {
    return color;
  }
  return "#666";
};

/**
 * Cor padrão aplicada quando action.color é nulo, vazio ou inválido.
 * Corresponde ao cinza neutro já usado implicitamente em normalizeHexColor.
 */
const DEFAULT_ACTION_COLOR = "#666666";

/**
 * Normaliza e valida qualquer valor de cor bruto vindo do banco de dados.
 *
 * - Cor válida (hex, rgb, nome CSS, etc.) → retorna em formato #RRGGBB
 * - Nulo, vazio ou inválido              → retorna DEFAULT_ACTION_COLOR
 *
 * Nunca lança exceção — seguro para usar diretamente em qualquer render.
 */
export function safeColor(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_ACTION_COLOR;
  try {
    return Color(raw).hex();
  } catch {
    return DEFAULT_ACTION_COLOR;
  }
}
