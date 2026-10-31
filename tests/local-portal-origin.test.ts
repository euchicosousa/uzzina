import { afterAll, beforeAll, beforeEach, expect, it, mock } from "bun:test";
import { createServer, type Server } from "node:http";
import { createDevApiMiddleware } from "../server/dev-api";

// These probes stop before account lookup. Any database access is unsupported.
mock.module("@supabase/supabase-js", () => ({ createClient: () => ({}) }));
import dashAuth from "../api/dash-auth";

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
let handlerLoads = 0;
beforeAll(async () => {
  const middleware = createDevApiMiddleware(async (path) => {
    handlerLoads++;
    if (path !== "./api/dash-auth.ts") throw new Error("Unexpected API");
    return dashAuth;
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
  process.env.APP_ORIGIN = base;
  process.env.NODE_ENV = "production";
  process.env.SUPABASE_URL = "https://database.test.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  delete process.env.VERCEL;
  handlerLoads = 0;
});
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
function entry(path: string, host = `localhost:${port}`, accept = "text/html") {
  return fetch(base + path, {
    headers: { Host: host, Accept: accept },
    redirect: "manual",
  });
}
it.each(["/dash", "/dash/login", "/dash/login/?partner=a&sidebar=show"])(
  "canonicalizes only the local portal document before its form mounts: %s",
  async (path) => {
    const response = await entry(path);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(base + path);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(handlerLoads).toBe(0);
    const canonical = await entry(path, `127.0.0.1:${port}`);
    expect(canonical.status).toBe(200);
    expect(await canonical.text()).toBe("SPA entry");
    expect(canonical.headers.get("location")).toBeNull();
  },
);
it("follows an explicitly configured localhost canonical origin in reverse", async () => {
  process.env.APP_ORIGIN = `http://localhost:${port}`;
  const response = await entry("/dash/login", `127.0.0.1:${port}`);
  expect(response.headers.get("location")).toBe(
    `http://localhost:${port}/dash/login`,
  );
  expect((await entry("/dash/login")).status).toBe(200);
});
it.each([
  "/login",
  "/reset-password",
  "/app",
  "/app/partner/a",
  "/dash/review/example?r=fixture",
  "/assets/app.js",
])(
  "preserves team authentication, public review and unrelated routes: %s",
  async (path) => {
    const response = await entry(path);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  },
);
it("does not canonicalize non-document requests", async () => {
  expect(
    (await entry("/dash/login", undefined, "application/json")).status,
  ).toBe(200);
});
it("does not enable local normalization in Vercel", async () => {
  process.env.VERCEL = "1";
  expect((await entry("/dash/login")).status).toBe(200);
});
it.each([
  "https://uzzina.example",
  "http://192.0.2.1:5176",
  "invalid",
  "http://user:pass@127.0.0.1:5176",
  "http://127.0.0.1:5176/other",
  "",
])(
  "does not redirect to an unsafe or nonlocal configured destination: %s",
  async (origin) => {
    process.env.APP_ORIGIN = origin;
    expect((await entry("/dash/login")).status).toBe(200);
  },
);
it.each(["outside.test", "localhost:1"])(
  "does not trust an unrelated Host: %s",
  async (host) => {
    expect((await entry("/dash/login", host)).status).toBe(200);
  },
);
it.each([
  undefined,
  "http://outside.test",
  "http://localhost",
  "http://localhost:1",
])("retains the real API's strict origin rejection: %s", async (origin) => {
  const response = await fetch(`${base}/api/dash-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify({ action: "login" }),
    redirect: "manual",
  });
  expect(response.status).toBe(403);
  expect(response.headers.get("location")).toBeNull();
});
it("keeps canonical validation and cookie-less verification on the real handler", async () => {
  const alias = await fetch(`${base}/api/dash-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: `http://localhost:${port}`,
    },
    body: JSON.stringify({ action: "login" }),
    redirect: "manual",
  });
  expect(alias.status).toBe(403);
  expect(alias.headers.get("location")).toBeNull();
  for (const [action, expected] of [
    ["login", 400],
    ["verify", 401],
  ] as const) {
    const response = await fetch(`${base}/api/dash-auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify({ action }),
    });
    expect(response.status).toBe(expected);
    expect(response.headers.get("set-cookie")).toBeNull();
  }
  const response = await fetch(`${base}/api/dash-auth`);
  expect(response.status).toBe(405);
});
