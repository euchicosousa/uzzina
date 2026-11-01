import { afterAll, beforeAll, beforeEach, expect, it, mock } from "bun:test";
import { createServer, type Server } from "node:http";
import { createDevApiMiddleware } from "../server/dev-api";

// Empty login/session requests must not consult the external database.
mock.module("@supabase/supabase-js", () => ({ createClient: () => ({}) }));
import dashAuth from "../api/dash-auth";
import dashAction from "../api/dash-action";

const savedEnv = {
  APP_ORIGIN: process.env.APP_ORIGIN,
  VERCEL: process.env.VERCEL,
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
let server: Server;
let base: string;
let port: number;
beforeAll(async () => {
  const middleware = createDevApiMiddleware(async (path) => {
    if (path === "./api/dash-auth.ts") return dashAuth;
    if (path === "./api/dash-action.ts") return dashAction;
    throw new Error("Unexpected API");
  });
  server = createServer((req, res) => {
    void middleware(req, res, () => {
      res.setHeader("Content-Type", "text/html");
      res.end("SPA entry");
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing port");
  port = address.port;
  base = `http://127.0.0.1:${port}`;
});
beforeEach(() => {
  process.env.APP_ORIGIN = "https://different-published-address.example";
  process.env.NODE_ENV = "production";
  process.env.SUPABASE_URL = "https://database.test.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  delete process.env.VERCEL;
});
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
it.each(["localhost", "127.0.0.1", "192.168.0.21"])(
  "preserves the requested portal address without canonical redirects: %s",
  async (host) => {
    process.env.APP_ORIGIN = `http://127.0.0.1:${port}`;
    for (const path of ["/dash", "/dash/login", "/dash/login/?partner=a"]) {
      const response = await fetch(base + path, {
        headers: { Host: `${host}:${port}`, Accept: "text/html" },
        redirect: "manual",
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(await response.text()).toBe("SPA entry");
    }
  },
);
it.each([
  undefined,
  "http://192.168.0.21:5176",
  "http://localhost:5176",
  "https://preview.example",
  "null",
])(
  "does not require an authorized Origin for login/logout: %s",
  async (origin) => {
    process.env.VERCEL = "1";
    for (const [action, expected] of [
      ["login", 400],
      ["verify", 401],
      ["logout", 200],
    ] as const) {
      const response = await fetch(base + "/api/dash-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Host: `192.168.0.21:${port}`,
          ...(origin ? { Origin: origin } : {}),
        },
        body: JSON.stringify({ action }),
        redirect: "manual",
      });
      expect(response.status).toBe(expected);
      expect(response.headers.get("location")).toBeNull();
      if (action === "login")
        expect((await response.json()).error).toBe(
          "E-mail e senha são obrigatórios.",
        );
      if (action === "logout")
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    }
  },
);
it.each(["POST", "PATCH", "DELETE"])(
  "portal %s still requires a session, independent of address",
  async (method) => {
    const response = await fetch(base + "/api/dash-action", {
      method,
      headers: {
        "Content-Type": "application/json",
        Origin: "http://192.168.0.21:5176",
      },
      body: "{}",
    });
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("Sessão inválida ou expirada.");
  },
);
