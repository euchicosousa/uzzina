import { afterEach, beforeEach, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "../api/import-from-link";
import { normalizeInstagramReference } from "../app/lib/instagram-reference";
import { referenceAssetIdentity } from "../server/instagram-reference-transfer";

const actionId = "11111111-1111-4111-8111-111111111111";
const partnerId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const imageBytes = Buffer.from([255, 216, 255, ...Array<number>(15).fill(0)]);
const videoBytes = Buffer.from([
  0,
  0,
  0,
  16,
  102,
  116,
  121,
  112,
  ...Array<number>(12).fill(0),
]);
const cloudBase = "https://res.cloudinary.com/test";
const originalFetch = globalThis.fetch;
const fixtureEnv = {
  SUPABASE_URL: "https://database.test",
  SUPABASE_PUBLISHABLE_KEY: "fixture-publishable",
  COMPOSIO_API_KEY: "fixture-composio",
  CLOUDINARY_CLOUD_NAME: "test",
  CLOUDINARY_API_KEY: "fixture-cloud-key",
  CLOUDINARY_API_SECRET: "fixture-cloud-secret",
};
const savedEnv = Object.fromEntries(
  Object.keys(fixtureEnv).map((key) => [key, process.env[key]]),
);
type Uploaded = {
  public_id: string;
  resource_type: string;
  secure_url: string;
};
let allowed = true;
let privatePost = false;
let loseResponse = false;
let expires = false;
let overLimit = false;
let wrongMime = false;
let noActiveConnection = false;
let sourceHost = "scontent.cdninstagram.com";
let countPostQueries = 0;
let uploaded: Map<string, Uploaded>;
let originReads: string[];
let storedFiles: string[];

const image = (id: string) => ({
  id,
  is_video: false,
  display_url: `https://${sourceHost}/${id}.jpg`,
});
const video = (id: string) => ({
  id,
  is_video: true,
  display_url: image(id).display_url,
  video_url: `https://${sourceHost}/${id}.mp4`,
});

beforeEach(() => {
  Object.assign(process.env, fixtureEnv);
  allowed = true;
  privatePost = false;
  loseResponse = false;
  expires = false;
  overLimit = false;
  wrongMime = false;
  noActiveConnection = false;
  sourceHost = "scontent.cdninstagram.com";
  uploaded = new Map();
  originReads = [];
  storedFiles = [];
  countPostQueries = 0;
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.hostname === "database.test") {
      expect(new Headers(init?.headers).get("Authorization")).toBe(
        "Bearer fixture-token",
      );
      if (url.pathname === "/auth/v1/user")
        return Response.json({ id: userId, aud: "authenticated" });
      if (url.pathname.endsWith("/can_access_action"))
        return Response.json(allowed);
      if (url.pathname.endsWith("/actions")) {
        expect(url.searchParams.get("select")).toBe("partners,work_files");
        return Response.json({
          partners: ["agency", "other"],
          work_files: storedFiles,
        });
      }
      if (url.pathname.endsWith("/partners"))
        return Response.json({
          id:
            url.searchParams.get("slug") === "eq.other" ? actionId : partnerId,
        });
    }
    if (url.hostname === "backend.composio.dev") {
      expect(init?.method).toBe("POST");
      expect(new Headers(init?.headers).get("x-api-key")).toBe(
        fixtureEnv.COMPOSIO_API_KEY,
      );
      const body = JSON.parse(String(init?.body));
      if (url.pathname.endsWith("/session")) {
        expect(body.toolkits.enable).toEqual(["scrapecreators"]);
        expect(body.instant.toolkits.enable).toEqual(["scrapecreators"]);
        expect(body.instant.tools.scrapecreators.enable).toEqual([
          "SCRAPECREATORS_GET_INSTAGRAM_POST",
        ]);
        return Response.json({ session_id: "trs_fixture" });
      }
      expect("account" in body).toBe(false);
      expect(body.tool_slug).toBe("SCRAPECREATORS_GET_INSTAGRAM_POST");
      if (noActiveConnection) {
        return Response.json(
          {
            error: {
              code: 4302,
              slug: "ToolRouterV2_NoActiveConnection",
              message:
                "No active connection found for toolkit(s) 'scrapecreators' in this session.",
            },
          },
          { status: 400 },
        );
      }
      const code = new URL(body.arguments.url).pathname.split("/")[2];
      countPostQueries++;
      const post =
        code === "photo"
          ? image("first")
          : code === "reel"
            ? video("second")
            : {
                ...image("cover"),
                __typename: "XDTGraphSidecar",
                edge_sidecar_to_children: {
                  edges: [image("first"), video("second"), image("third")].map(
                    (node) => ({ node }),
                  ),
                },
              };
      return Response.json({
        result_type: "completed",
        data: {
          successful: true,
          data: {
            xdt_shortcode_media: {
              ...post,
              shortcode: code,
              owner: { is_private: privatePost },
            },
          },
        },
      });
    }
    if (url.hostname === "scontent.cdninstagram.com") {
      expect(init?.redirect).toBe("manual");
      originReads.push(url.pathname);
      if (expires) {
        expires = false;
        return new Response(null, { status: 403 });
      }
      const movie = url.pathname.endsWith(".mp4");
      const bytes = movie ? videoBytes : imageBytes;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(bytes.subarray(0, 7));
          controller.enqueue(bytes.subarray(7));
          if (overLimit) controller.enqueue(new Uint8Array(10_000_000));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": wrongMime
            ? "text/html"
            : movie
              ? "video/mp4"
              : "image/jpeg",
        },
      });
    }
    if (url.hostname === "api.cloudinary.com") {
      if (url.pathname.includes("/resources/")) {
        const prior = uploaded.get(
          decodeURIComponent(url.pathname.split("/").at(-1) ?? ""),
        );
        return prior
          ? Response.json(prior)
          : new Response(null, { status: 404 });
      }
      const kind = url.pathname.endsWith("/video/upload") ? "video" : "image";
      const chunks: Buffer[] = [];
      const body = init?.body as unknown as AsyncIterable<Uint8Array>;
      for await (const chunk of body) chunks.push(Buffer.from(chunk));
      const boundary = new Headers(init?.headers)
        .get("content-type")
        ?.split("boundary=")[1];
      const payload = new Response(Buffer.concat(chunks), {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
      });
      const form = await payload.formData();
      const file = form.get("file");
      expect(typeof file).toBe("object");
      if (!file || typeof file === "string")
        throw new Error("Fixture upload had no bytes");
      expect(Buffer.from(await file.arrayBuffer())).toEqual(
        kind === "video" ? videoBytes : imageBytes,
      );
      const publicId = String(form.get("public_id"));
      const signature = ["asset_folder", "overwrite", "public_id", "timestamp"]
        .map((field) => `${field}=${form.get(field)}`)
        .join("&");
      expect(form.get("signature")).toBe(
        createHash("sha256")
          .update(signature + fixtureEnv.CLOUDINARY_API_SECRET)
          .digest("hex"),
      );
      expect(form.get("overwrite")).toBe("false");
      expect(form.get("asset_folder")).toBe(
        `uzzina/work/${partnerId}/instagram`,
      );
      const asset = {
        public_id: publicId,
        resource_type: kind,
        secure_url: `${cloudBase}/${kind}/upload/v1/${publicId}.${kind === "image" ? "jpg" : "mp4"}`,
      };
      uploaded.set(publicId, asset);
      if (loseResponse) {
        loseResponse = false;
        throw new Error("Lost upload response after storage");
      }
      return Response.json(asset);
    }
    throw new Error(`Unexpected fixture URL ${url.origin}`);
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

async function request(body: object) {
  const req = {
    method: "POST",
    headers: { authorization: "Bearer fixture-token" },
    body: { actionId, partnerSlug: "agency", ...body },
  } as VercelRequest;
  const res = {
    code: 0,
    data: {} as Record<string, unknown>,
    setHeader() {},
    status(code: number) {
      this.code = code;
      return this;
    },
    json(data: Record<string, unknown>) {
      this.data = data;
    },
  };
  await handler(req, res as unknown as VercelResponse);
  return res;
}

const prepare = (path: string) =>
  request({
    operation: "prepare",
    url: `https://www.instagram.com/${path}/?igsh=ignored`,
  });
const transfer = (ticket: unknown, position: number, retry = false) =>
  request({ operation: "transfer", ticket, position, retry });

it.each([
  ["p/photo", "image", "/first.jpg"],
  ["reel/reel", "video", "/second.mp4"],
])(
  "copies %s into Cloudinary with a signed request",
  async (path, kind, mediaPath) => {
    const batch = await prepare(path);
    expect(batch.code).toBe(200);
    expect(batch.data.items).toEqual([{ position: 0, kind, url: null }]);
    expect(JSON.stringify(batch.data)).not.toContain("cdninstagram.com");
    const item = await transfer(batch.data.ticket, 0);
    expect(item.code).toBe(200);
    expect(item.data.url).toStartWith(`${cloudBase}/${kind}/upload/`);
    expect(originReads).toEqual([mediaPath]);
    expect(countPostQueries).toBe(1);
  },
);

it("keeps the mixed sequence and reconciles a lost Cloudinary response without recopying", async () => {
  const batch = await prepare("p/mixed");
  expect(batch.data.items).toEqual([
    { position: 0, kind: "image", url: null },
    { position: 1, kind: "video", url: null },
    { position: 2, kind: "image", url: null },
  ]);
  const first = await transfer(batch.data.ticket, 0);
  loseResponse = true;
  expect((await transfer(batch.data.ticket, 1)).code).toBe(502);
  const third = await transfer(batch.data.ticket, 2);
  const second = await transfer(batch.data.ticket, 1, true);
  const { publicId } = referenceAssetIdentity(partnerId, actionId, "mixed", 1);
  expect(second.data.url).toBe(uploaded.get(publicId)?.secure_url);
  expect(originReads).toEqual(["/first.jpg", "/second.mp4", "/third.jpg"]);
  expect(countPostQueries).toBe(1);
  storedFiles = [first.data.url, second.data.url, third.data.url].filter(
    (url): url is string => typeof url === "string",
  );
  const reopened = await prepare("p/mixed");
  expect(reopened.data.items).toEqual(
    storedFiles.map((url, position) => ({
      position,
      url,
      kind: position === 1 ? "video" : "image",
    })),
  );
});

it("refreshes source only after a CDN expiry", async () => {
  const batch = await prepare("p/photo");
  expires = true;
  expect((await transfer(batch.data.ticket, 0)).code).toBe(200);
  expect(countPostQueries).toBe(2);
});

it("blocks unauthorized actions, cross-partner tickets, private posts and unsupported origins", async () => {
  allowed = false;
  expect((await prepare("p/photo")).code).toBe(403);
  expect(countPostQueries).toBe(0);
  allowed = true;
  expect((await prepare("stories/profile")).code).toBe(400);
  privatePost = true;
  expect((await prepare("p/photo")).code).toBe(422);
  privatePost = false;
  sourceHost = "scontent.cdninstagram.com.evil.test";
  expect((await prepare("p/photo")).code).toBe(422);
  sourceHost = "scontent.cdninstagram.com";
  const batch = await prepare("p/photo");
  expect(
    (
      await request({
        operation: "transfer",
        actionId: partnerId,
        ticket: batch.data.ticket,
        position: 0,
        retry: false,
      })
    ).code,
  ).toBe(403);
  expect(
    (
      await request({
        operation: "transfer",
        partnerSlug: "other",
        ticket: batch.data.ticket,
        position: 0,
        retry: false,
      })
    ).code,
  ).toBe(403);
  expect(originReads).toEqual([]);
});

it("checks total slots and enforces the actual byte and media limits before accepting an asset", async () => {
  storedFiles = Array<string>(20).fill(`${cloudBase}/image/upload/old.jpg`);
  expect((await prepare("p/mixed")).code).toBe(200);
  storedFiles = Array<string>(98).fill(`${cloudBase}/image/upload/old.jpg`);
  expect((await prepare("p/mixed")).code).toBe(409);
  storedFiles = [];
  const batch = await prepare("p/photo");
  wrongMime = true;
  expect((await transfer(batch.data.ticket, 0)).code).toBe(422);
  wrongMime = false;
  overLimit = true;
  expect((await transfer(batch.data.ticket, 0)).code).toBe(413);
  expect(uploaded.size).toBe(0);
});

it("reports 503 with clear guidance when Composio Instant Toolkits is not active", async () => {
  noActiveConnection = true;
  const batch = await prepare("p/photo");
  expect(batch.code).toBe(503);
  expect(batch.data.error).toBe(
    "Ative o Instant Toolkits para ScrapeCreators no painel da Composio (ou verifique o saldo em Billing).",
  );
});

it("normalizes /p/, /reel/, /reels/ and username-prefixed links while rejecting invalid references", () => {
  expect(
    normalizeInstagramReference("https://www.instagram.com/reels/reel-1/"),
  ).toBe("https://www.instagram.com/reel/reel-1/");
  expect(
    normalizeInstagramReference(
      "https://instagram.com/usuario.teste/reels/reel_2/?igsh=123",
    ),
  ).toBe("https://www.instagram.com/reel/reel_2/");
  expect(
    normalizeInstagramReference(
      "https://www.instagram.com/usuario.teste/reel/reel-3",
    ),
  ).toBe("https://www.instagram.com/reel/reel-3/");
  expect(
    normalizeInstagramReference(
      "https://www.instagram.com/usuario.teste/p/post-1/",
    ),
  ).toBe("https://www.instagram.com/p/post-1/");
  expect(
    normalizeInstagramReference("https://www.instagram.com/p/post-2/"),
  ).toBe("https://www.instagram.com/p/post-2/");

  expect(
    normalizeInstagramReference("https://www.instagram.com/reels/"),
  ).toBeNull();
  expect(
    normalizeInstagramReference("https://www.instagram.com/usuario/reels/"),
  ).toBeNull();
  expect(
    normalizeInstagramReference(
      "https://www.instagram.com/stories/usuario/123/",
    ),
  ).toBeNull();
  expect(
    normalizeInstagramReference("https://www.instagram.com/usuario/"),
  ).toBeNull();
  expect(
    normalizeInstagramReference("https://example.com/reel/abc/"),
  ).toBeNull();
  expect(
    normalizeInstagramReference(
      `https://www.instagram.com/reel/${"a".repeat(2020)}/`,
    ),
  ).toBeNull();
});
