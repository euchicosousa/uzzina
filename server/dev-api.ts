import type { IncomingMessage, ServerResponse } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;
type HandlerRoute = { path: string; scope?: string };
const HANDLERS: Record<string, HandlerRoute> = {
  "/api/ai": { path: "./api/ai.ts" },
  "/api/planning-theme": { path: "./api/planning-theme.ts" },
  "/api/strategy-operations": { path: "./api/strategy-operations.ts" },
  "/api/strategy-worker": { path: "./api/strategy-worker.ts" },
  "/api/dash": { path: "./api/dash.ts" },
  "/api/admin-accounts": { path: "./api/admin-accounts.ts" },
  "/api/client-accounts": {
    path: "./api/admin-accounts.ts",
    scope: "clients",
  },
  "/api/create-user": {
    path: "./api/admin-accounts.ts",
    scope: "create-user",
  },
  "/api/admin-cleanup": { path: "./api/admin-cleanup.ts" },
  "/api/instagram-reference": { path: "./api/instagram-reference.ts" },
  "/api/instagram-publish": { path: "./api/instagram-publish.ts" },
  "/api/partner-instagram-connection": {
    path: "./api/partner-instagram-connection.ts",
  },
};

/** Local adapter for the same serverless handlers deployed to Vercel. */
export function createDevApiMiddleware(
  loadHandler: (path: string) => Promise<Handler>,
) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: unknown) => void,
  ) => {
    const url = new URL(req.url || "/", "http://localhost");
    const route = HANDLERS[url.pathname];
    if (!route) return next();
    let body: unknown;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += buffer.length;
          if (size > 1024 * 1024) {
            res.writeHead(413, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Pedido muito grande." }));
            return;
          }
          chunks.push(buffer);
        }
        const raw = Buffer.concat(chunks).toString("utf8");
        body = raw ? JSON.parse(raw) : {};
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JSON inválido." }));
        return;
      }
    }
    const query: Record<string, string | string[]> = {};
    url.searchParams.forEach((value, key) => {
      const previous = query[key];
      query[key] =
        previous === undefined
          ? value
          : [...(Array.isArray(previous) ? previous : [previous]), value];
    });
    if (route.scope) query.scope = route.scope;
    const response = {
      setHeader: (key: string, value: string | string[] | number) => {
        res.setHeader(key, value);
        return response;
      },
      status: (code: number) => {
        res.statusCode = code;
        return response;
      },
      json: (data: unknown) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
        return response;
      },
    };
    try {
      const handler = await loadHandler(route.path);
      await handler(
        {
          method: req.method,
          body,
          headers: req.headers,
          query,
        } as VercelRequest,
        response as unknown as VercelResponse,
      );
    } catch {
      if (!res.writableEnded) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "API local indisponível." }));
      }
    }
  };
}
