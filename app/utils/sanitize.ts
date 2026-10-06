/**
 * Sanitizador de HTML seguro e leve para conteúdo do Tiptap e entradas externas.
 * Remove scripts, iframes, manipuladores inline de eventos (onerror, onclick, etc.)
 * e esquemas perigosos de URL (javascript:, vbscript:), preservando formatação rica.
 */

const DANGEROUS_TAGS_REGEX = /<\s*(script|style|iframe|object|embed|form|input|button|svg|math|link|meta|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|style|iframe|object|embed|form|input|button|svg|math|link|meta|base)\b[^>]*>/gi;
const INLINE_EVENT_HANDLERS_REGEX = /\s+on[a-z]+(\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+))?/gi;
const JAVASCRIPT_URL_REGEX = /(href|src)\s*=\s*['"]\s*(?:javascript|vbscript|data(?!\s*:\s*image)):[^'"]*['"]/gi;

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  // 1. Remove tags ativamente maliciosas / executáveis e seu conteúdo
  let sanitized = html.replace(DANGEROUS_TAGS_REGEX, "");

  // 2. Remove manipuladores de evento (onerror, onload, onclick, onmouseover, etc.)
  sanitized = sanitized.replace(INLINE_EVENT_HANDLERS_REGEX, "");

  // 3. Remove URLs com esquemas perigosos (javascript:, vbscript:, data: não-imagem)
  sanitized = sanitized.replace(JAVASCRIPT_URL_REGEX, '$1="#"');

  return sanitized.trim();
}
