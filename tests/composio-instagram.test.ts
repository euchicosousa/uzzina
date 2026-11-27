import { afterEach, describe, expect, it } from "bun:test";
import {
  createInstagramConnectLink,
  disconnectInstagramConnectedAccount,
  getInstagramConnectedAccount,
} from "../server/composio-instagram";
import { parseInstagramAccountObservation } from "../app/lib/partner-instagram-contract";

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
  it.each([400, 409])(
    "disables the old account after revocation returns %i and reconnects with a new account",
    async (status) => {
      const expected = {
        connectedAccountId: "ca_old",
        composioUserId: "uzzina-partner:partner-123",
        authConfigId: "ac_uzzina_instagram",
      };
      const calls: string[] = [];
      Object.defineProperty(globalThis, "fetch", {
        value: async (input: URL | RequestInfo, init?: RequestInit) => {
          const path = new URL(String(input)).pathname.split(
            "/connected_accounts/",
          )[1];
          calls.push(path);
          if (path === "ca_old/revoke") return Response.json({}, { status });
          if (path === "ca_old/status") {
            expect(init?.method).toBe("PATCH");
            expect(JSON.parse(String(init?.body))).toEqual({ enabled: false });
            return Response.json({});
          }
          if (path === "link") {
            expect(JSON.parse(String(init?.body)).user_id).toBe(
              expected.composioUserId,
            );
            return Response.json({
              connected_account_id: "ca_new",
              redirect_url: "https://connect.composio.dev/link/new",
              expires_at: "2026-11-28T19:00:00Z",
            });
          }
          return Response.json({
            id: path,
            user_id: expected.composioUserId,
            auth_config: { id: expected.authConfigId },
            toolkit: { slug: "instagram" },
            status: path === "ca_old" ? "INACTIVE" : "ACTIVE",
          });
        },
      });
      expect(
        await disconnectInstagramConnectedAccount(
          "fixture",
          expected,
          "ACTIVE",
        ),
      ).toBe("disabled");
      const link = await createInstagramConnectLink({
        apiKey: "fixture",
        authConfigId: expected.authConfigId,
        composioUserId: expected.composioUserId,
        callbackUrl: "https://uzzina.cnvt.com.br/app/admin/partner/brand",
      });
      expect(link.connectedAccountId).toBe("ca_new");
      const account = await getInstagramConnectedAccount(
        "fixture",
        link.connectedAccountId,
      );
      expect(
        parseInstagramAccountObservation(account, {
          ...expected,
          connectedAccountId: link.connectedAccountId,
        })?.status,
      ).toBe("ACTIVE");
      expect(calls).toEqual([
        "ca_old/revoke",
        "ca_old/status",
        "ca_old",
        "link",
        "ca_new",
      ]);
    },
  );
});
