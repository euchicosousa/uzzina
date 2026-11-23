import { z } from "zod";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export type PublishPartner = {
  id: string;
  slug: string;
  title: string;
  username: string | null;
  avatarUrl: string | null;
};
export type PublishResult = { id: string; permalink: string | null };
export type PublishAttempt = {
  id: string;
  partner_id: string;
  profile_username: string;
  format: string;
  status: string;
  phase: string;
  current_container_id: string | null;
  results: PublishResult[];
  detail: string | null;
  created_at: string;
};
export type PublishState = {
  partners: PublishPartner[];
  attempts: PublishAttempt[];
};
export type PublishInput = {
  actionId: string;
  partnerSlug: string;
  profileUsername: string;
  format: "feed" | "video" | "reel" | "stories";
  files: string[];
  caption: string;
  confirmed: true;
};

export class InstagramPublishError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly outcome: string | null,
  ) {
    super(message);
  }
}
export async function instagramPublishRequest(
  actionId: string,
  input?: PublishInput,
): Promise<PublishState | null> {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou.");
  const response = await fetch(
    input
      ? "/api/instagram-publish"
      : `/api/instagram-publish?actionId=${encodeURIComponent(actionId)}`,
    {
      method: input ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(input ? { "Content-Type": "application/json" } : {}),
      },
      ...(input ? { body: JSON.stringify(input) } : {}),
    },
  );
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Não foi possível verificar a publicação.";
    const outcome =
      typeof body === "object" &&
      body !== null &&
      "status" in body &&
      typeof body.status === "string"
        ? body.status
        : null;
    throw new InstagramPublishError(message, response.status, outcome);
  }
  if (input) return null;
  const schema = z.object({
    partners: z.array(
      z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        username: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      }),
    ),
    attempts: z.array(
      z.object({
        id: z.string(),
        partner_id: z.string(),
        profile_username: z.string(),
        format: z.string(),
        status: z.string(),
        phase: z.string(),
        current_container_id: z.string().nullable(),
        results: z.array(
          z.object({ id: z.string(), permalink: z.string().nullable() }),
        ),
        detail: z.string().nullable(),
        created_at: z.string(),
      }),
    ),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new Error("Resposta inválida ao consultar as publicações.");
  return parsed.data;
}
