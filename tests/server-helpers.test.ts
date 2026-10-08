import { afterEach, describe, expect, test } from "bun:test";
import type { VercelRequest } from "@vercel/node";
import { extractBearerToken } from "../server/auth";
import { getServiceConfig } from "../server/supabase-admin";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});
const request = (authorization?: string) =>
  ({ headers: { authorization } }) as unknown as VercelRequest;

describe("extractBearerToken", () => {
  test("accepts a single bearer token, case-insensitively", () => {
    expect(extractBearerToken(request("Bearer abc"))).toBe("abc");
    expect(extractBearerToken(request("bearer abc"))).toBe("abc");
  });
  test("rejects missing, malformed or extra-part headers", () => {
    expect(extractBearerToken(request())).toBeNull();
    expect(extractBearerToken(request("Basic abc"))).toBeNull();
    expect(extractBearerToken(request("Bearer a b"))).toBeNull();
    expect(extractBearerToken(request("abc"))).toBeNull();
  });
});

describe("getServiceConfig", () => {
  test("prefers SUPABASE_URL and falls back to VITE_SUPABASE_URL", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    process.env.SUPABASE_URL = "https://a.test";
    process.env.VITE_SUPABASE_URL = "https://b.test";
    expect(getServiceConfig()).toEqual({ url: "https://a.test", serviceRoleKey: "key" });
    delete process.env.SUPABASE_URL;
    expect(getServiceConfig()?.url).toBe("https://b.test");
  });
  test("returns null when the URL or key is missing", () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    expect(getServiceConfig()).toBeNull();
    process.env.SUPABASE_URL = "https://a.test";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(getServiceConfig()).toBeNull();
  });
});
