import { afterEach, describe, expect, it } from "bun:test";
import { createInstagramConnectLink } from "../server/composio-instagram";

const originalFetch = globalThis.fetch;

afterEach(() => {
  Object.defineProperty(globalThis, "fetch", { value: originalFetch });
});

describe("Composio Instagram client", () => {
  it("creates a managed Connect Link server-side for a partner-scoped user", async () => {
    let capturedUrl = "";
    let capturedHeaders: HeadersInit | undefined;
    let capturedBody = "";
    Object.defineProperty(globalThis, "fetch", {
      value: async (input: URL | RequestInfo, init?: RequestInit) => {
        capturedUrl = String(input);
        capturedHeaders = init?.headers;
        capturedBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({
            connected_account_id: "ca_attempt_123",
            redirect_url: "https://connect.composio.dev/link/one-time",
            expires_at: "2026-11-22T19:00:00.000Z",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    });

    const link = await createInstagramConnectLink({
      apiKey: "test-secret-value",
      authConfigId: "ac_uzzina_instagram",
      composioUserId: "uzzina-partner:partner-123",
      callbackUrl:
        "https://uzzina.cnvt.com.br/app/admin/partner/brand?instagram_attempt=id&instagram_state=secret",
    });

    expect(capturedUrl).toBe(
      "https://backend.composio.dev/api/v3.1/connected_accounts/link",
    );
    expect(new Headers(capturedHeaders).get("x-api-key")).toBe(
      "test-secret-value",
    );
    expect(JSON.parse(capturedBody)).toEqual({
      auth_config_id: "ac_uzzina_instagram",
      user_id: "uzzina-partner:partner-123",
      callback_url:
        "https://uzzina.cnvt.com.br/app/admin/partner/brand?instagram_attempt=id&instagram_state=secret",
    });
    expect(link.connectedAccountId).toBe("ca_attempt_123");
    expect(link.redirectUrl).toBe("https://connect.composio.dev/link/one-time");
  });
});
