// Explicit staging-only integration check using real Auth, PostgREST and app mutations.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../app/lib/supabase.client";
import {
  createActionClient,
  duplicateActionClient,
  readActionClient,
} from "../app/lib/supabase.mutations";
import type { Database } from "../types/database";

async function configFile(path: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const line of (await readFile(path, "utf8")).split("\n")) {
    const index = line.indexOf("=");
    if (index < 0 || line.trim().startsWith("#")) continue;
    result[line.slice(0, index).trim()] = line
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return result;
}

const env = await configFile(".env.staging.local");
const users = await configFile(".env.staging-users.local");
assert.equal(
  new URL(env.VITE_SUPABASE_URL || "").hostname,
  "zacrrtilppvekiyoybzn.supabase.co",
);
assert.ok(env.SUPABASE_SERVICE_ROLE_KEY);
process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL;
process.env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const browser = createSupabaseBrowserClient();
const service = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const createdIds: string[] = [];
const title = `Creation regression ${crypto.randomUUID()}`;
const date = "2026-10-08 13:00:00";
async function login(prefix: string) {
  const email = users[`${prefix}_EMAIL`];
  const password = users[`${prefix}_PASSWORD`];
  assert.ok(email && password);
  const result = await browser.auth.signInWithPassword({ email, password });
  assert.equal(result.error, null, "Staging sign-in failed");
  assert.ok(result.data.user);
  return result.data.user.id;
}
try {
  const memberId = await login("STAGING_COLLAB_A");
  const { data: partners, error } = await service
    .from("partners")
    .select("slug,users_ids,archived");
  assert.equal(error, null);
  assert.ok(partners);
  const own = partners.find(
    (partner) => !partner.archived && partner.users_ids.includes(memberId),
  );
  const other = partners.find(
    (partner) => !partner.archived && !partner.users_ids.includes(memberId),
  );
  const archived = partners.find(
    (partner) => partner.archived && partner.users_ids.includes(memberId),
  );
  assert.ok(
    own && other && archived,
    "Expected isolated staging partner fixtures",
  );
  const input = {
    title,
    date,
    category: "post",
    priority: "medium",
    partners: [own.slug],
    responsibles: [memberId],
  };
  if (process.argv.includes("--expect-rls-failure")) {
    await assert.rejects(
      createActionClient(input),
      /new row violates row-level security policy/,
    );
    console.log(
      "REPRODUCED: real member creation fails with RLS before migration",
    );
  } else {
    const created = await createActionClient(input);
    assert.ok(created.id);
    createdIds.push(created.id);
    assert.ok(created.updated_at);
    assert.equal(created.date, date.replace(" ", "T"));
    assert.equal((await readActionClient(created.id)).title, title);
    const duplicate = await duplicateActionClient(created.id);
    assert.ok(duplicate.id);
    createdIds.push(duplicate.id);
    assert.notEqual(duplicate.id, created.id);
    assert.equal(duplicate.date, created.date);
    assert.deepEqual(duplicate.responsibles, created.responsibles);
    for (const denied of [
      { ...input, partners: [other.slug] },
      { ...input, partners: [archived.slug] },
      { ...input, responsibles: [users.STAGING_COLLAB_B_UID || ""] },
    ]) {
      await assert.rejects(
        createActionClient(denied),
        /row-level security policy/,
      );
    }
    const adminId = await login("STAGING_ADMIN");
    const adminAction = await createActionClient({
      ...input,
      partners: [other.slug],
      responsibles: [memberId],
    });
    assert.ok(adminAction.id);
    createdIds.push(adminAction.id);
    assert.equal(adminAction.user_id, adminId);
    console.log(
      "PASS: real Auth and app creation/duplication return canonical rows; partner, archive and responsibility negatives hold",
    );
  }
} finally {
  // Only this run's returned fixture IDs are removed.
  if (createdIds.length) {
    const { error } = await service
      .from("actions")
      .delete()
      .in("id", createdIds);
    assert.equal(error, null, "Fixture cleanup failed");
  }
  await browser.auth.signOut();
}
