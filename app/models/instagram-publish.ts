import { z } from "zod";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";

export type PublishPartner = {
  id: string;
  slug: string;
  title: string;
  username: string | null;
  avatarUrl: string | null;
  feedTime?: string;
  storiesTime?: string;
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
export type PublishSchedule = {
  id: string;
  batch_id: string;
  ordinal: number;
  scheduled_at: string;
  status: string;
  results: PublishResult[];
  detail: string | null;
  instagram_schedule_batches: {
    action_id: string;
    partner_id: string;
    profile_username: string;
    format: string;
  };
};
export type PublishState = {
  partners: PublishPartner[];
  attempts: PublishAttempt[];
  schedules: PublishSchedule[];
};
export type InstagramCalendarEvent = {
  id: string;
  actionId: string;
  actionTitle: string;
  partnerId: string;
  partnerName: string;
  profileUsername: string;
  format: string;
  status: string;
  occurredAt: string;
  permalinks: string[];
};
export type InstagramPublishCalendar = {
  events: InstagramCalendarEvent[];
  connectedPartnerIds: string[];
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
export type ScheduleInput = {
  operation: "schedule";
  actionId: string;
  partnerSlug: string;
  profileUsername: string;
  format: "feed" | "video" | "reel" | "stories";
  files: string[];
  caption: string;
  scheduledAt: string[];
  timezone: string;
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
  input?: PublishInput | ScheduleInput,
  view?: "connection",
): Promise<PublishState | null> {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou.");
  const response = await fetch(
    input
      ? "/api/instagram-publish"
      : `/api/instagram-publish?${new URLSearchParams({
          actionId,
          ...(view ? { view } : {}),
        })}`,
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
        feedTime: z.string().optional(),
        storiesTime: z.string().optional(),
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
    schedules: z.array(
      z.object({
        id: z.string(),
        batch_id: z.string(),
        ordinal: z.number(),
        scheduled_at: z.string(),
        status: z.string(),
        results: z.array(
          z.object({ id: z.string(), permalink: z.string().nullable() }),
        ),
        detail: z.string().nullable(),
        instagram_schedule_batches: z.object({
          action_id: z.string(),
          partner_id: z.string(),
          profile_username: z.string(),
          format: z.string(),
        }),
      }),
    ),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new Error("Resposta inválida ao consultar as publicações.");
  return parsed.data;
}

export async function instagramPublishCalendarRequest(
  from: string,
  to: string,
): Promise<InstagramPublishCalendar> {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou.");
  const search = new URLSearchParams({ view: "calendar", from, to });
  const response = await fetch(`/api/instagram-publish?${search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Não foi possível carregar o calendário do Instagram.";
    throw new Error(message);
  }
  const schema = z.object({
    connectedPartnerIds: z.array(z.string()),
    events: z.array(
      z.object({
        id: z.string(),
        actionId: z.string(),
        actionTitle: z.string(),
        partnerId: z.string(),
        partnerName: z.string(),
        profileUsername: z.string(),
        format: z.string(),
        status: z.string(),
        occurredAt: z.string(),
        permalinks: z.array(z.url()),
      }),
    ),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new Error("A resposta do calendário do Instagram é inválida.");
  return parsed.data;
}

export async function instagramScheduleRequest(
  input: ScheduleInput,
): Promise<void> {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou.");
  const response = await fetch("/api/instagram-publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Não foi possível salvar a programação.";
    throw new InstagramPublishError(message, response.status, null);
  }
}

export async function instagramCancelScheduleRequest(
  actionId: string,
  scheduleId: string,
): Promise<void> {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou.");
  const response = await fetch("/api/instagram-publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation: "cancelSchedule", actionId, scheduleId }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Não foi possível cancelar a programação.";
    throw new InstagramPublishError(message, response.status, null);
  }
}
