import type { IncomingMessage, ServerResponse } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;
const HANDLERS: Record<string, string> = {
  "/api/ai": "./api/ai.ts",
  "/api/strategy-operations": "./api/strategy-operations.ts",
  "/api/strategy-worker": "./api/strategy-worker.ts",
  "/api/dash-auth": "./api/dash-auth.ts",
  "/api/dash-data": "./api/dash-data.ts",
  "/api/dash-action": "./api/dash-action.ts",
  "/api/review-links": "./api/review-links.ts",
  "/api/review": "./api/review.ts",
  "/api/client-accounts": "./api/client-accounts.ts",
  "/api/create-user": "./api/create-user.ts",
};

function localPortalLocation(req: IncomingMessage, url: URL): string | null {
  if (
    process.env.VERCEL ||
    req.method !== "GET" ||
    !/^\/dash(?:\/login)?\/?$/.test(url.pathname) ||
    !req.headers.accept?.toLowerCase().includes("text/html")
  )
    return null;

  const configuredOrigin = process.env.APP_ORIGIN?.trim();
  const host = req.headers.host;
  if (!configuredOrigin || !host) return null;
  try {
    const canonical = new URL(configuredOrigin);
    const incoming = new URL(`http://${host}`);
    const loopback = (hostname: string) =>
      hostname === "localhost" || hostname === "127.0.0.1";
    if (
      canonical.protocol !== "http:" ||
      canonical.origin.toLowerCase() !== configuredOrigin.toLowerCase() ||
      !loopback(canonical.hostname) ||
      !loopback(incoming.hostname) ||
      incoming.username ||
      incoming.password ||
      incoming.pathname !== "/" ||
      incoming.search ||
      incoming.hash ||
      incoming.port !== canonical.port ||
      incoming.hostname === canonical.hostname
    )
      return null;
    canonical.pathname = url.pathname;
    canonical.search = url.search;
    return canonical.href;
  } catch {
    return null;
  }
}

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
    const location = localPortalLocation(req, url);
    if (location) {
      res.statusCode = 307;
      res.setHeader("Location", location);
      res.setHeader("Cache-Control", "no-store");
      res.end();
      return;
    }
    const path = HANDLERS[url.pathname];
    if (!path) return next();
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
      const handler = await loadHandler(path);
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
