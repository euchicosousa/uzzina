import { z } from "zod";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  InstagramReferenceKind,
  MAX_INSTAGRAM_FILES,
} from "~/lib/instagram-reference";

export type ReferenceContext = { actionId: string; partnerSlug: string };

const prepared = z.object({
  ticket: z.string().min(1),
  items: z
    .array(
      z.object({
        position: z.number().int().nonnegative(),
        kind: InstagramReferenceKind,
        url: z.url().nullable(),
      }),
    )
    .min(1)
    .max(MAX_INSTAGRAM_FILES)
    .refine((items) => items.every((item, index) => item.position === index)),
});
const transferred = z.object({
  position: z.number().int(),
  url: z.url(),
  ticket: z.string().min(1),
});

async function request<T>(
  input: object,
  schema: z.ZodType<T>,
  signal: AbortSignal,
) {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou.");
  const response = await fetch("/api/instagram-reference", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal,
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = z.object({ error: z.string() }).safeParse(body);
    throw new Error(
      failure.success ? failure.data.error : "Não foi possível importar agora.",
    );
  }
  return schema.parse(body);
}

export function prepareInstagramReference(
  context: ReferenceContext,
  url: string,
  signal: AbortSignal,
) {
  return request({ ...context, operation: "prepare", url }, prepared, signal);
}

export function transferInstagramReference(
  context: ReferenceContext,
  ticket: string,
  position: number,
  retry: boolean,
  signal: AbortSignal,
) {
  return request(
    { ...context, operation: "transfer", ticket, position, retry },
    transferred,
    signal,
  );
}
