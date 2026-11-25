import { z } from "zod";
import {
  InstagramReferenceKind,
  MAX_INSTAGRAM_FILES,
} from "../app/lib/instagram-reference.js";

const ACTION = "SCRAPECREATORS_GET_INSTAGRAM_POST";
const ROUTER = "https://backend.composio.dev/api/v3.1/tool_router/session";
const unavailable =
  "Não foi possível obter os arquivos desta publicação pública.";

export class ReferenceImportError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export const sourceItemSchema = z.object({
  kind: InstagramReferenceKind,
  sourceUrl: z.string().max(4096).nullable(),
  id: z.string().max(100).nullable(),
});

export type SourceItem = z.infer<typeof sourceItemSchema>;

export function isInstagramMediaOrigin(input: string) {
  try {
    const url = new URL(input);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname.endsWith(".cdninstagram.com") ||
        /^scontent[.-][a-z0-9.-]+\.fbcdn\.net$/.test(url.hostname))
    );
  } catch {
    return false;
  }
}

const mediaSchema = z.object({
  id: z.string().max(100).nullish(),
  is_video: z.boolean().nullish(),
  video_url: z.string().max(4096).nullish(),
  display_url: z.string().max(4096).nullish(),
  __typename: z.string().nullish(),
});
const postSchema = mediaSchema.extend({
  shortcode: z.string().nullish(),
  owner: z.object({ is_private: z.boolean().nullish() }).nullish(),
  edge_sidecar_to_children: z
    .object({
      edges: z
        .array(z.object({ node: mediaSchema.nullish() }))
        .max(MAX_INSTAGRAM_FILES),
    })
    .nullish(),
});

const composioErrorSchema = z.object({
  error: z
    .object({
      slug: z.string().optional(),
      code: z.number().optional(),
    })
    .optional(),
  slug: z.string().optional(),
  code: z.number().optional(),
});

export async function resolveInstagramReference(
  apiKey: string,
  userId: string,
  url: string,
) {
  async function post(endpoint: string, body: object): Promise<unknown> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(18_000),
    });
    if (!response.ok) {
      const parsed = composioErrorSchema.safeParse(
        await response.json().catch(() => null),
      );
      const slug = parsed.success
        ? (parsed.data.error?.slug ?? parsed.data.slug)
        : undefined;
      const code = parsed.success
        ? (parsed.data.error?.code ?? parsed.data.code)
        : undefined;
      if (slug === "ToolRouterV2_NoActiveConnection" || code === 4302) {
        throw new ReferenceImportError(
          "Ative o Instant Toolkits para ScrapeCreators no painel da Composio (ou verifique o saldo em Billing).",
          503,
        );
      }
      throw new ReferenceImportError(
        "A consulta ao Instagram está indisponível. Tente novamente.",
        502,
      );
    }
    return await response.json();
  }

  const session = z
    .object({ session_id: z.string().regex(/^trs_[\w-]+$/) })
    .safeParse(
      await post(ROUTER, {
        user_id: `uzzina_instagram_reference_${userId}`,
        toolkits: { enable: ["scrapecreators"] },
        tools: { scrapecreators: { enable: [ACTION] } },
        manage_connections: { enable: false },
        instant: {
          toolkits: { enable: ["scrapecreators"] },
          tools: { scrapecreators: { enable: [ACTION] } },
        },
      }),
    );
  if (!session.success) throw new ReferenceImportError(unavailable, 502);
  const result = z
    .object({ result_type: z.literal("completed"), data: z.unknown() })
    .safeParse(
      await post(`${ROUTER}/${session.data.session_id}/execute`, {
        tool_slug: ACTION,
        arguments: { url, trim: false, include_play_count: false },
      }),
    );
  if (!result.success)
    throw new ReferenceImportError(
      "A consulta ao Instagram está indisponível. Tente novamente.",
      502,
    );

  const direct = z.object({ xdt_shortcode_media: postSchema.nullable() });
  const envelope = z.object({
    successful: z.boolean().optional(),
    success: z.boolean().optional(),
    data: z.unknown(),
  });
  let body = result.data.data;
  let postMedia: z.infer<typeof postSchema> | null = null;
  for (let level = 0; level < 3; level++) {
    const parsed = direct.safeParse(body);
    if (parsed.success) {
      postMedia = parsed.data.xdt_shortcode_media;
      break;
    }
    const wrapped = envelope.safeParse(body);
    if (
      !wrapped.success ||
      wrapped.data.successful === false ||
      wrapped.data.success === false
    )
      break;
    body = wrapped.data.data;
  }
  const shortcode = url.split("/")[4];
  if (
    !postMedia ||
    postMedia.owner?.is_private ||
    (postMedia.shortcode && postMedia.shortcode !== shortcode)
  )
    throw new ReferenceImportError(unavailable, 422);

  const edges = postMedia.edge_sidecar_to_children?.edges;
  if (
    (edges && !edges.length) ||
    (postMedia.__typename?.includes("Sidecar") && !edges)
  )
    throw new ReferenceImportError(unavailable, 422);
  const entries = edges ? edges.map((edge) => edge.node) : [postMedia];
  return entries.map((entry): SourceItem => {
    const video =
      entry?.is_video === true ||
      !!entry?.video_url ||
      entry?.__typename?.includes("Video") ||
      (!edges && url.includes("/reel/"));
    const sourceUrl = video ? entry?.video_url : entry?.display_url;
    return {
      kind: video ? "video" : "image",
      sourceUrl:
        sourceUrl && isInstagramMediaOrigin(sourceUrl) ? sourceUrl : null,
      id: entry?.id ?? null,
    };
  });
}
