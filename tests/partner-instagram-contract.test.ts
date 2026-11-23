import { describe, expect, it } from "bun:test";
import {
  makePartnerComposioUserId,
  parsePartnerInstagramLink,
  parseVerifiedInstagramAccount,
} from "../app/lib/partner-instagram-contract";

const expected = {
  connectedAccountId: "ca_connected_123",
  composioUserId: "uzzina-partner:partner-123",
  authConfigId: "ac_uzzina_instagram",
};

function account(overrides: Record<string, unknown> = {}) {
  return {
    id: expected.connectedAccountId,
    user_id: expected.composioUserId,
    status: "ACTIVE",
    toolkit: { slug: "instagram" },
    auth_config: { id: expected.authConfigId },
    state: { val: { displayName: "cnvt.oficial" } },
    ...overrides,
  };
}

describe("partner Instagram Composio contract", () => {
  it("accepts a valid Connect Link and requires HTTPS", () => {
    expect(
      parsePartnerInstagramLink({
        connected_account_id: expected.connectedAccountId,
        redirect_url: "https://connect.composio.dev/link/opaque",
        expires_at: "2026-11-22T19:00:00.000Z",
      }),
    ).toEqual({
      connectedAccountId: expected.connectedAccountId,
      redirectUrl: "https://connect.composio.dev/link/opaque",
      expiresAt: "2026-11-22T19:00:00.000Z",
    });
    expect(
      parsePartnerInstagramLink({
        connected_account_id: expected.connectedAccountId,
        redirect_url: "http://connect.composio.dev/link/opaque",
        expires_at: "2026-11-22T19:00:00.000Z",
      }),
    ).toBeNull();
  });

  it("accepts only the expected active Instagram account and its handle", () => {
    expect(parseVerifiedInstagramAccount(account(), expected)).toEqual({
      connectedAccountId: expected.connectedAccountId,
      profileUsername: "@cnvt.oficial",
    });
    expect(
      parseVerifiedInstagramAccount(
        account({ user_id: "uzzina-partner:another-partner" }),
        expected,
      ),
    ).toBeNull();
    expect(
      parseVerifiedInstagramAccount(
        account({ auth_config: { id: "ac_other" } }),
        expected,
      ),
    ).toBeNull();
    expect(
      parseVerifiedInstagramAccount(
        account({ toolkit: { slug: "facebook" } }),
        expected,
      ),
    ).toBeNull();
    expect(
      parseVerifiedInstagramAccount(account({ status: "EXPIRED" }), expected),
    ).toBeNull();
    expect(
      parseVerifiedInstagramAccount(
        account({ state: { val: { displayName: "CNVT Oficial" } } }),
        expected,
      ),
    ).toBeNull();
  });

  it("derives a stable Composio user ID that isolates partners", () => {
    expect(makePartnerComposioUserId("partner-123")).toBe(
      "uzzina-partner:partner-123",
    );
    expect(makePartnerComposioUserId("partner-456")).not.toBe(
      makePartnerComposioUserId("partner-123"),
    );
  });
});
