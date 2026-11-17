/**
 * Conversão de cores Hexadecimal para OKLCH e vice-versa.
 * Sem dependências externas para poder rodar nativamente ou ser inlinado.
 */

export interface OklchColor {
  h: number;
  c: number;
  l: number;
}

// Converte RGB linear para RGB sRGB
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

/**
 * Converte cor Hex (ex: "#FF0000" ou "FF0000") para OKLCH.
 */
export function hexToOklch(hex: string): OklchColor {
  // Limpa o hex
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (cleanHex.length !== 6) {
    return { h: 0, c: 0, l: 0 }; // fallback
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // sRGB linear
  const rL = srgbToLinear(r);
  const gL = srgbToLinear(g);
  const bL = srgbToLinear(b);

  // LMS
  const l_ = 0.4122214708 * rL + 0.5363337775 * gL + 0.0514459954 * bL;
  const m_ = 0.2119034982 * rL + 0.6806995451 * gL + 0.1073970008 * bL;
  const s_ = 0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL;

  // LMS non-linear
  const lL = Math.cbrt(l_);
  const mL = Math.cbrt(m_);
  const sL = Math.cbrt(s_);

  // OKLCH
  const L = 0.2104542553 * lL + 0.793617785 * mL - 0.0040720468 * sL;
  const a = 1.9779984951 * lL - 2.428592205 * mL + 0.4505937099 * sL;
  const b_ = 0.0259040371 * lL + 0.7827717662 * mL - 0.808675766 * sL;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Arredonda valores para evitar floats gigantescos
  return {
    h: Math.round(H * 100) / 100,
    c: Math.round(C * 1000) / 1000,
    l: Math.round(L * 1000) / 1000,
  };
}

/**
 * Converte OKLCH para Hexadecimal.
 */
export function oklchToHex(h: number, c: number, l: number): string {
  const H = (h * Math.PI) / 180;
  const a = c * Math.cos(H);
  const b_ = c * Math.sin(H);

  // LMS non-linear
  const lL = l + 0.3963377774 * a + 0.2158037573 * b_;
  const mL = l - 0.1055613458 * a - 0.0638541728 * b_;
  const sL = l - 0.0894841775 * a - 1.291485548 * b_;

  // LMS linear
  const l_ = lL * lL * lL;
  const m_ = mL * mL * mL;
  const s_ = sL * sL * sL;

  // RGB linear
  let rL = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  let gL = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  let bL = -0.0041960863 * l_ - 0.7034186148 * m_ + 1.707614701 * s_;

  // Garante os limites
  rL = Math.max(0, Math.min(1, rL));
  gL = Math.max(0, Math.min(1, gL));
  bL = Math.max(0, Math.min(1, bL));

  // RGB sRGB
  const r = Math.round(linearToSrgb(rL) * 255);
  const g = Math.round(linearToSrgb(gL) * 255);
  const b = Math.round(linearToSrgb(bL) * 255);

  const hexComponent = (val: number) => {
    const hex = val.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${hexComponent(r)}${hexComponent(g)}${hexComponent(b)}`.toUpperCase();
}

/**
 * Deriva cor primária no dark mode.
 * Geralmente mantemos H e C, e aumentamos o L em 0.13 para contraste.
 */
export function deriveDarkPrimary(lightHex: string): string {
  const oklch = hexToOklch(lightHex);
  const darkL = Math.min(0.9, oklch.l + 0.13);
  return oklchToHex(oklch.h, oklch.c, darkL);
}
export const deriveDarkAccent = deriveDarkPrimary;

/**
 * Deriva cor de Background no dark mode.
 * Geralmente invertemos a luminosidade (1 - l).
 */
export function deriveDarkBg(lightHex: string): string {
  const oklch = hexToOklch(lightHex);
  // Se for muito clara (L alto), a versão escura é bem escura.
  // Inversão simples: 1 - L, mas limitada para não ficar totalmente preto (#000).
  const darkL = Math.max(0.12, Math.min(0.2, 1 - oklch.l));
  // Mantemos o H e C, ou ajustamos c ligeiramente para cinza confortável
  const darkC = Math.min(0.015, oklch.c);
  return oklchToHex(oklch.h, darkC, darkL);
}

/**
 * Deriva cor de Foreground no dark mode.
 * Invertemos a luminosidade (1 - l).
 */
export function deriveDarkFg(lightHex: string): string {
  const oklch = hexToOklch(lightHex);
  // Foreground precisa ser bem claro no dark mode (L alto)
  const darkL = Math.max(0.85, Math.min(0.98, 1 - oklch.l));
  const darkC = Math.min(0.01, oklch.c);
  return oklchToHex(oklch.h, darkC, darkL);
}

/**
 * Deriva a cor de texto ideal (Foreground) para ficar sobre o fundo da cor primária.
 * Se a primária for muito clara, retorna preto/escuro. Se for escura, retorna branco/claro.
 */
export function derivePrimaryFg(primaryHex: string): string {
  const oklch = hexToOklch(primaryHex);
  return oklch.l > 0.62 ? "#000000" : "#FFFFFF";
}
export const deriveAccentFg = derivePrimaryFg;

function oklchToLinearRgb(c: OklchColor): [number, number, number] {
  const rad = (c.h * Math.PI) / 180;
  const a = c.c * Math.cos(rad);
  const b = c.c * Math.sin(rad);

  const lL = c.l + 0.3963377774 * a + 0.2158037573 * b;
  const mL = c.l - 0.1055613458 * a - 0.0638541728 * b;
  const sL = c.l - 0.0894841775 * a - 1.291485548 * b;

  const l_ = lL * lL * lL;
  const m_ = mL * mL * mL;
  const s_ = sL * sL * sL;

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186148 * m_ + 1.707614701 * s_,
  ];
}

/** Parses an `oklch(L C H)` CSS string into `{ l, c, h }`. */
export function parseOklchString(value: string): OklchColor | null {
  const match = value
    .trim()
    .match(
      /^oklch\(\s*([\d.+-]+%?)\s+([\d.+-]+)\s+([\d.+-]+)(?:\s*\/[^)]*)?\)$/i,
    );
  if (!match) return null;
  const rawL = match[1];
  const l = rawL.endsWith("%") ? parseFloat(rawL) / 100 : parseFloat(rawL);
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);
  if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h)) return null;
  return { l, c, h: ((h % 360) + 360) % 360 };
}

/** Formats an `OklchColor` as `oklch(L C H)` with 3 decimal places. */
export function formatOklchString(color: OklchColor): string {
  return `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(3)})`;
}

/** Returns true when the OKLCH color fits inside the standard sRGB gamut. */
export function isOklchInSrgbGamut(color: OklchColor): boolean {
  const [r, g, b] = oklchToLinearRgb(color);
  return (
    r >= -0.002 &&
    r <= 1.002 &&
    g >= -0.002 &&
    g <= 1.002 &&
    b >= -0.002 &&
    b <= 1.002
  );
}

/** Computes WCAG 2.1 relative luminance contrast ratio between two OKLCH colors. */
export function getOklchContrastRatio(a: OklchColor, b: OklchColor): number {
  const relLum = (color: OklchColor) => {
    const [r, g, bl] = oklchToLinearRgb(color).map((v) =>
      Math.max(0, Math.min(1, v)),
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const l1 = relLum(a);
  const l2 = relLum(b);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}
