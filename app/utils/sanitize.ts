import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "hr",
  "img",
  "span",
  "div",
];

const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "target",
  "rel",
  "colspan",
  "rowspan",
  "class",
  "width",
  "height",
];

const FORBID_TAGS = [
  "style",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "iframe",
  "frame",
  "object",
  "embed",
  "svg",
  "math",
  "script",
];

const FORBID_ATTR = ["style"];

let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

function getPurifier(): ReturnType<typeof DOMPurify> | null {
  if (purifyInstance) return purifyInstance;

  const win =
    typeof window !== "undefined"
      ? window
      : (globalThis as unknown as { window?: unknown }).window;
  if (!win) return null;

  const purifier = DOMPurify(win as Parameters<typeof DOMPurify>[0]);

  // Hook para proibir estritamente data: e blob: em src e href (Requisito 3 do Ticket 01)
  purifier.addHook("uponSanitizeAttribute", (node, data) => {
    if (
      (data.attrName === "src" || data.attrName === "href") &&
      /^\s*(?:data|blob):/i.test(data.attrValue)
    ) {
      node.removeAttribute(data.attrName);
    }
  });

  purifyInstance = purifier;
  return purifier;
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  const purifier = getPurifier();
  if (!purifier) {
    // Fallback defensivo se executado sem nenhum DOM disponível
    return html.replace(/<[^>]*>/g, "").trim();
  }

  return purifier
    .sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      FORBID_TAGS,
      FORBID_ATTR,
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      USE_PROFILES: {
        html: true,
        svg: false,
        svgFilters: false,
        mathMl: false,
      },
    })
    .trim();
}
