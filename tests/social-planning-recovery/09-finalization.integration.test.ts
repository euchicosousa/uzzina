/**
 * T09 — finalization in one real database transaction.
 *
 * Runs the real migrations (social_plans, planning requests, action timestamps,
 * partner topics and the T09 finalization) on an isolated PostgreSQL (PGlite).
 * Calls go through `SET LOCAL ROLE authenticated|anon` plus JWT claims, like the
 * Data API, so grants and RLS are the real ones. The actions/partners/people
 * policies are copied from 20261006030000 + 20261008164615 (that migration
 * touches too many unrelated tables to run here).
 *
 * PGlite is not a project dependency. Point T09_PGLITE_MODULE at its dist/index.js
 * (see docs/audits/social-planning-recovery/T09-evidence.md). Without it the
 * suite fails with a configuration error instead of skipping.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Row = Record<string, unknown>;
type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Row[] }>;
  exec: (sql: string) => Promise<unknown>;
};
type Database = Queryable & {
  transaction: <T>(fn: (tx: Queryable) => Promise<T>) => Promise<T>;
};

const MIGRATIONS = join(import.meta.dir, "../../supabase/migrations");
const migration = (name: string) =>
  readFileSync(join(MIGRATIONS, name), "utf8");

const admin = randomUUID();
const otherAdmin = randomUUID();
const member = randomUUID();
const inactiveAdmin = randomUUID();

let db: Database;

async function openDatabase(): Promise<Database> {
  const modulePath = process.env.T09_PGLITE_MODULE;
  if (!modulePath || !existsSync(modulePath)) {
    throw new Error(
      "T09 needs an isolated PostgreSQL: set T09_PGLITE_MODULE to @electric-sql/pglite/dist/index.js.",
    );
  }
  const loaded: unknown = await import(modulePath);
  if (
    typeof loaded !== "object" ||
    loaded === null ||
    !("PGlite" in loaded) ||
    typeof loaded.PGlite !== "function"
  ) {
    throw new Error("T09_PGLITE_MODULE does not export PGlite.");
  }
  const PGlite = loaded.PGlite as new () => Database;
  return new PGlite();
}

const BASE_SCHEMA = `
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

CREATE TABLE public.people (user_id uuid PRIMARY KEY, admin boolean NOT NULL, visible boolean NOT NULL);
CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  slug text PRIMARY KEY,
  title text NOT NULL,
  archived boolean NOT NULL DEFAULT false,
  users_ids uuid[] NOT NULL DEFAULT '{}'
);
-- Columns as in supabase/staging/bootstrap.sql.
CREATE TABLE public.actions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  title text NOT NULL,
  description text,
  date timestamp NOT NULL,
  responsibles uuid[] NOT NULL,
  user_id uuid DEFAULT auth.uid() NOT NULL,
  color text DEFAULT '#ffffff'::text NOT NULL,
  time int2 DEFAULT '5'::smallint NOT NULL,
  priority text NOT NULL,
  category text NOT NULL,
  archived bool DEFAULT false,
  partners text[] NOT NULL,
  instagram_caption text,
  content_files text[],
  work_files text[],
  sprints text[],
  phase text DEFAULT 'idea'::text NOT NULL,
  content_description text,
  strategies jsonb
);
CREATE FUNCTION public.update_updated_at() RETURNS trigger LANGUAGE plpgsql AS
  $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Copied from 20261006030000_database_authorization.sql.
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.actions, public.partners, public.people FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.actions, public.partners TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.people TO authenticated;
GRANT ALL ON public.actions, public.partners, public.people TO service_role;
CREATE OR REPLACE FUNCTION public.is_active_member() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.people WHERE user_id::text = auth.uid()::text AND visible = true);
$$;
CREATE OR REPLACE FUNCTION public.is_active_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.people WHERE user_id::text = auth.uid()::text AND visible = true AND admin = true);
$$;
REVOKE ALL ON FUNCTION public.is_active_member(), public.is_active_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_member(), public.is_active_admin() TO authenticated, service_role;
CREATE POLICY people_select_active_members ON public.people FOR SELECT TO authenticated USING(public.is_active_member());
CREATE POLICY partners_select_policy ON public.partners FOR SELECT TO authenticated
  USING(public.is_active_admin() OR (public.is_active_member() AND archived = false AND users_ids::text[] @> ARRAY[auth.uid()::text]));
CREATE POLICY partners_write_admin_only ON public.partners FOR ALL TO authenticated USING(public.is_active_admin()) WITH CHECK(public.is_active_admin());
CREATE POLICY actions_insert_policy ON public.actions FOR INSERT TO authenticated WITH CHECK(
  public.is_active_admin() OR (public.is_active_member() AND responsibles::text[] @> ARRAY[auth.uid()::text]
    AND EXISTS(SELECT 1 FROM public.partners p WHERE p.archived = false AND p.slug = ANY(actions.partners) AND p.users_ids::text[] @> ARRAY[auth.uid()::text])));
CREATE POLICY actions_delete_policy ON public.actions FOR DELETE TO authenticated USING(public.is_active_admin());
-- SELECT policy as rewritten by 20261008164615_action_row_read_authorization.sql.
CREATE POLICY actions_select_policy ON public.actions FOR SELECT TO authenticated USING (
  public.is_active_admin()
  OR (public.is_active_member() AND responsibles::text[] @> ARRAY[auth.uid()::text]
    AND EXISTS (SELECT 1 FROM public.partners p WHERE p.archived = false AND p.slug = ANY(actions.partners) AND p.users_ids::text[] @> ARRAY[auth.uid()::text])));
`;

// Fault injection, isolated database only: fail a chosen action or the second link.
const FAULTS = `
CREATE FUNCTION public.t09_fail_action() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.title = current_setting('t09.fail_title', true) THEN
    RAISE EXCEPTION 'T09 injected action failure';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER t09_fail_action BEFORE INSERT ON public.actions
  FOR EACH ROW EXECUTE FUNCTION public.t09_fail_action();
CREATE FUNCTION public.t09_fail_link() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF current_setting('t09.fail_second_link', true) = 'on'
    AND EXISTS (SELECT 1 FROM public.social_plan_action_links WHERE plan_id = NEW.plan_id) THEN
    RAISE EXCEPTION 'T09 injected link failure';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER t09_fail_link BEFORE INSERT ON public.social_plan_action_links
  FOR EACH ROW EXECUTE FUNCTION public.t09_fail_link();
`;

type Suggestion = {
  id: string;
  title: string;
  format: "static" | "carousel" | "reels";
  objective: string;
  briefing: string;
  scheduled_date?: string;
  status: "pending" | "approved" | "rejected";
  created_action_id?: string;
};

type FinalizeResult = {
  plan: Row & { suggestions: Suggestion[]; version: number; status: string };
  created: { suggestion_id: string; action_id: string }[];
  links: { suggestion_id: string; action_id: string }[];
};

/** Runs `fn` like a Data API request: one transaction, caller's role and JWT subject. */
async function asCaller<T>(
  role: "authenticated" | "anon",
  userId: string | null,
  fn: (tx: Queryable) => Promise<T>,
  settings: Record<string, string> = {},
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.query(
      "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)",
      [userId ?? "", role],
    );
    for (const [key, value] of Object.entries(settings)) {
      await tx.query("SELECT set_config($1, $2, true)", [key, value]);
    }
    await tx.exec(`SET LOCAL ROLE ${role}`);
    return fn(tx);
  });
}

async function finalize(
  userId: string | null,
  planId: string,
  expectedVersion: number,
  options: {
    role?: "authenticated" | "anon";
    settings?: Record<string, string>;
  } = {},
): Promise<FinalizeResult> {
  return asCaller(
    options.role ?? "authenticated",
    userId,
    async (tx) => {
      const { rows } = await tx.query(
        "SELECT public.finalize_social_plan($1, $2) AS result",
        [planId, expectedVersion],
      );
      return rows[0]?.result as FinalizeResult;
    },
    options.settings,
  );
}

async function errorOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("Expected the call to fail");
}

async function first(sql: string, params: unknown[] = []): Promise<Row> {
  const { rows } = await db.query(sql, params);
  const row = rows[0];
  if (!row) throw new Error(`No row for: ${sql}`);
  return row;
}

async function counts(planId: string) {
  const row = await first(
    `SELECT
       (SELECT count(*)::int FROM public.actions) AS actions,
       (SELECT count(*)::int FROM public.social_plan_action_links WHERE plan_id = $1) AS links,
       (SELECT version FROM public.social_plans WHERE id = $1) AS version,
       (SELECT status FROM public.social_plans WHERE id = $1) AS status,
       (SELECT suggestions FROM public.social_plans WHERE id = $1) AS suggestions`,
    [planId],
  );
  return row as {
    actions: number;
    links: number;
    version: number;
    status: string;
    suggestions: Suggestion[];
  };
}

/** Today in America/Sao_Paulo, plus an offset in days, as YYYY-MM-DD. */
async function saoPauloDay(offsetDays: number): Promise<string> {
  const row = await first(
    "SELECT to_char((now() AT TIME ZONE 'America/Sao_Paulo')::date + $1::int, 'YYYY-MM-DD') AS day",
    [offsetDays],
  );
  return String(row.day);
}

function suggestion(
  title: string,
  patch: Partial<Suggestion> = {},
): Suggestion {
  return {
    id: randomUUID(),
    title,
    format: "static",
    objective: `Objetivo de ${title}`,
    briefing: `Briefing de ${title}`,
    scheduled_date: "2031-03-10",
    status: "approved",
    ...patch,
  };
}

async function createPlan(
  suggestions: Suggestion[],
  partnerSlug = "alpha",
  owner = admin,
): Promise<string> {
  const row = await first(
    `INSERT INTO public.social_plans (partner_slug, user_id, mode, input, suggestions)
     VALUES ($1, $2, 'period', '{}'::jsonb, $3::jsonb) RETURNING id`,
    [partnerSlug, owner, JSON.stringify(suggestions)],
  );
  return String(row.id);
}

async function resetActions() {
  await db.exec(
    "DELETE FROM public.social_plan_action_links; DELETE FROM public.social_plans; DELETE FROM public.actions;",
  );
}

beforeAll(async () => {
  db = await openDatabase();
  await db.exec(BASE_SCHEMA);
  for (const name of [
    "20261006040000_action_concurrency.sql",
    "20261116140000_partner_topics.sql",
    "20261102120000_social_plans.sql",
    "20261119215026_planning_theme_requests.sql",
    "20261119223435_planning_period_batches.sql",
    "20261120120000_social_plan_finalization.sql",
    "20261120140000_social_plan_release.sql",
  ]) {
    await db.exec(migration(name));
  }
  await db.exec(FAULTS);
  await db.query("INSERT INTO auth.users VALUES ($1), ($2), ($3), ($4)", [
    admin,
    otherAdmin,
    member,
    inactiveAdmin,
  ]);
  await db.query(
    "INSERT INTO public.people VALUES ($1, true, true), ($2, true, true), ($3, false, true), ($4, true, false)",
    [admin, otherAdmin, member, inactiveAdmin],
  );
  await db.query(
    "INSERT INTO public.partners (slug, title, archived, users_ids) VALUES ('alpha', 'Alpha', false, ARRAY[$1, $2]::uuid[]), ('archived', 'Arquivado', true, ARRAY[$1]::uuid[])",
    [admin, member],
  );
});

describe("T09 finalization (isolated PostgreSQL)", () => {
  test("F01 three approved suggestions become three actions with links and D5 defaults", async () => {
    await resetActions();
    const today = await saoPauloDay(0);
    const a = suggestion("A", { format: "static", scheduled_date: today });
    const b = suggestion("B", { format: "carousel", objective: "" });
    const c = suggestion("C", {
      format: "reels",
      scheduled_date: "2031-12-31",
    });
    const planId = await createPlan([a, b, c]);

    const clock = await first(
      "SELECT to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD HH24:MI:SS') AS local",
    );
    const result = await finalize(admin, planId, 1);
    const after = await counts(planId);

    expect(result.created).toHaveLength(3);
    expect(after).toMatchObject({
      actions: 3,
      links: 3,
      version: 2,
      status: "finalized",
    });
    expect(result.plan.version).toBe(2);
    expect(result.plan.status).toBe("finalized");

    const actions = (
      await db.query(
        `SELECT a.*, to_char(a.date, 'YYYY-MM-DD HH24:MI:SS') AS local_date, l.suggestion_id
         FROM public.actions a JOIN public.social_plan_action_links l ON l.action_id = a.id
         ORDER BY a.title`,
      )
    ).rows;
    const byTitle = new Map(actions.map((row) => [String(row.title), row]));
    for (const row of actions) {
      expect(row).toMatchObject({
        priority: "medium",
        phase: "do",
        color: "#999999",
        topic_id: null,
        archived: false,
        partners: ["alpha"],
        responsibles: [admin],
        user_id: admin,
      });
    }
    expect(byTitle.get("A")).toMatchObject({
      category: "post",
      time: 30,
      description: "Briefing de A\n\nObjetivo: Objetivo de A",
      content_description: "Briefing de A",
      suggestion_id: a.id,
    });
    expect(byTitle.get("B")).toMatchObject({
      category: "carousel",
      time: 50,
      description: "Briefing de B",
      local_date: "2031-03-10 11:00:00",
    });
    expect(byTitle.get("C")).toMatchObject({
      category: "reels",
      time: 40,
      local_date: "2031-12-31 11:00:00",
    });

    // D5: today in São Paulo -> 11:00 before 11h, otherwise now + 10 minutes.
    const local = String(clock.local);
    const hour = Number(local.slice(11, 13));
    const expectedToday =
      hour < 11
        ? `${today} 11:00:00`
        : String(
            (
              await first(
                "SELECT to_char(date_trunc('second', $1::timestamp + interval '10 minutes'), 'YYYY-MM-DD HH24:MI:SS') AS v",
                [local],
              )
            ).v,
          );
    expect(byTitle.get("A")?.local_date).toBe(expectedToday);

    // Every suggestion carries the id of its action, in the database and in the response.
    for (const item of after.suggestions) {
      const link = result.links.find((l) => l.suggestion_id === item.id);
      expect(item.created_action_id).toBe(link?.action_id);
    }
  });

  test("F02 a failure on the second action or second link leaves zero actions and the proposal unchanged", async () => {
    await resetActions();
    const planId = await createPlan([
      suggestion("A"),
      suggestion("Falhar aqui"),
      suggestion("C"),
    ]);
    const before = await counts(planId);

    const actionFailure = await errorOf(
      finalize(admin, planId, 1, {
        settings: { "t09.fail_title": "Falhar aqui" },
      }),
    );
    expect(actionFailure).toContain("T09 injected action failure");
    expect(await counts(planId)).toEqual(before);
    expect(before).toMatchObject({
      actions: 0,
      links: 0,
      version: 1,
      status: "draft",
    });

    const linkFailure = await errorOf(
      finalize(admin, planId, 1, {
        settings: { "t09.fail_second_link": "on" },
      }),
    );
    expect(linkFailure).toContain("T09 injected link failure");
    expect(await counts(planId)).toEqual(before);

    // Without the fault the same call succeeds.
    const result = await finalize(admin, planId, 1);
    expect(result.created).toHaveLength(3);
  });

  test("F03/F05 retry after commit and an old tab return the same links without writing", async () => {
    await resetActions();
    const planId = await createPlan([
      suggestion("A"),
      suggestion("B"),
      suggestion("C"),
    ]);
    const firstCall = await finalize(admin, planId, 1);
    // F05: the response above is "lost"; the client repeats the same request.
    const retry = await finalize(admin, planId, 1);
    // F03: another tab still holds version 1 and another admin finalizes.
    const oldTab = await finalize(otherAdmin, planId, 1);
    const after = await counts(planId);

    expect(retry.created).toEqual([]);
    expect(oldTab.created).toEqual([]);
    expect(retry.links).toEqual(firstCall.links);
    expect(oldTab.links).toEqual(firstCall.links);
    expect(after).toMatchObject({ actions: 3, links: 3, version: 2 });
  });

  test("F04 ten interleaved calls from two admins and stale versions create exactly three actions", async () => {
    await resetActions();
    const planId = await createPlan([
      suggestion("A"),
      suggestion("B"),
      suggestion("C"),
    ]);
    const callers = [admin, otherAdmin];
    const outcomes: string[] = [];
    // PGlite has a single backend, so the ten requests are serialized; see evidence.
    await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        finalize(callers[index % 2], planId, 1 + (index % 3 === 2 ? 1 : 0))
          .then((result) => outcomes.push(`ok:${result.created.length}`))
          .catch((error: unknown) =>
            outcomes.push(
              `error:${error instanceof Error ? error.message : ""}`,
            ),
          ),
      ),
    );
    const after = await counts(planId);
    expect(after).toMatchObject({ actions: 3, links: 3, version: 2 });
    expect(outcomes.filter((o) => o === "ok:3")).toHaveLength(1);
    expect(outcomes.filter((o) => o === "ok:0")).toHaveLength(9);

    // The durable key itself rejects a second action for the same suggestion.
    const linked = after.suggestions[0];
    const duplicate = await errorOf(
      asCaller("authenticated", admin, (tx) =>
        tx.query(
          "INSERT INTO public.social_plan_action_links (plan_id, suggestion_id, action_id, created_by) VALUES ($1, $2, $3, $4)",
          [planId, linked.id, randomUUID(), admin],
        ),
      ),
    );
    expect(duplicate).toContain("duplicate key");
  });

  test("F06 only active admins finalize; member, inactive admin, anon and archived partner write nothing", async () => {
    await resetActions();
    const planId = await createPlan([suggestion("A"), suggestion("B")]);
    const archivedPlan = await createPlan([suggestion("Z")], "archived");

    expect(await errorOf(finalize(member, planId, 1))).toContain(
      "PLANNING_ADMIN_REQUIRED",
    );
    expect(await errorOf(finalize(inactiveAdmin, planId, 1))).toContain(
      "PLANNING_ADMIN_REQUIRED",
    );
    expect(
      await errorOf(finalize(null, planId, 1, { role: "anon" })),
    ).toContain("permission denied for function finalize_social_plan");
    expect(await errorOf(finalize(admin, archivedPlan, 1))).toContain(
      "PLANNING_PROPOSAL_UNAVAILABLE",
    );
    expect(await counts(planId)).toMatchObject({
      actions: 0,
      links: 0,
      version: 1,
    });
    expect(await counts(archivedPlan)).toMatchObject({ links: 0, version: 1 });

    // A member cannot read links or write them directly either.
    const memberLinks = await asCaller("authenticated", member, (tx) =>
      tx.query(
        "SELECT count(*)::int AS n FROM public.social_plan_action_links",
      ),
    );
    expect(memberLinks.rows[0]?.n).toBe(0);

    // Another active admin may finalize a proposal created by someone else.
    const result = await finalize(otherAdmin, planId, 1);
    expect(result.created).toHaveLength(2);
    const owners = await first(
      "SELECT array_agg(DISTINCT user_id::text) AS users, array_agg(DISTINCT responsibles[1]::text) AS responsibles FROM public.actions",
    );
    expect(owners).toEqual({ users: [otherAdmin], responsibles: [otherAdmin] });
  });

  test("F07 the caller cannot change partner or author, and tampered ids in the JSON do not duplicate", async () => {
    await resetActions();
    const planId = await createPlan([suggestion("A"), suggestion("B")]);
    const forbidden = await errorOf(
      asCaller("authenticated", admin, (tx) =>
        tx.query(
          "UPDATE public.social_plans SET partner_slug = 'archived', user_id = $2 WHERE id = $1",
          [planId, member],
        ),
      ),
    );
    expect(forbidden).toContain("permission denied");

    const firstCall = await finalize(admin, planId, 1);
    // An admin rewrites the suggestions without created_action_id (version 3).
    const stripped = (await counts(planId)).suggestions.map(
      ({ created_action_id: _ignored, ...rest }) => rest,
    );
    await asCaller("authenticated", admin, (tx) =>
      tx.query(
        "SELECT public.update_social_plan_versioned($1, 2, NULL, 'draft', NULL, $2::jsonb)",
        [planId, JSON.stringify(stripped)],
      ),
    );
    const again = await finalize(admin, planId, 3);
    expect(again.created).toEqual([]);
    expect(again.links).toEqual(firstCall.links);
    // The response restores the canonical ids from the links.
    expect(
      again.plan.suggestions.map((item) => item.created_action_id),
    ).toEqual(firstCall.links.map((link) => link.action_id));
    expect(await counts(planId)).toMatchObject({ actions: 2, links: 2 });
  });

  test("F08 pending and rejected stay as they are; approving later converts only the new one; undated rejects all", async () => {
    await resetActions();
    const pending = suggestion("Pendente", { status: "pending" });
    const rejected = suggestion("Rejeitada", { status: "rejected" });
    const approved = suggestion("Aprovada");
    const planId = await createPlan([pending, rejected, approved]);

    const result = await finalize(admin, planId, 1);
    expect(result.created.map((c) => c.suggestion_id)).toEqual([approved.id]);
    let state = await counts(planId);
    expect(state).toMatchObject({
      actions: 1,
      links: 1,
      version: 2,
      status: "finalized",
    });
    expect(
      state.suggestions.map((s) => [s.status, s.created_action_id]),
    ).toEqual([
      ["pending", undefined],
      ["rejected", undefined],
      ["approved", result.created[0]?.action_id],
    ]);

    // Later the pending one is approved (version 3) and finalized: only it is created.
    const approvedLater = state.suggestions.map((item) =>
      item.id === pending.id ? { ...item, status: "approved" } : item,
    );
    await asCaller("authenticated", admin, (tx) =>
      tx.query(
        "SELECT public.update_social_plan_versioned($1, 2, NULL, NULL, NULL, $2::jsonb)",
        [planId, JSON.stringify(approvedLater)],
      ),
    );
    const second = await finalize(admin, planId, 3);
    expect(second.created.map((c) => c.suggestion_id)).toEqual([pending.id]);
    state = await counts(planId);
    expect(state).toMatchObject({ actions: 2, links: 2, version: 4 });

    // Undated or impossible dates reject the whole call.
    for (const badDate of [undefined, "", "2031-02-30", "10/03/2031"]) {
      await resetActions();
      const badPlan = await createPlan([
        suggestion("Com data"),
        suggestion("Sem data", { scheduled_date: badDate }),
      ]);
      expect(await errorOf(finalize(admin, badPlan, 1))).toContain(
        "PLANNING_SUGGESTION_UNDATED",
      );
      expect(await counts(badPlan)).toMatchObject({
        actions: 0,
        links: 0,
        version: 1,
        status: "draft",
      });
    }

    // Nothing approved is an error, not an empty success.
    await resetActions();
    const nonePlan = await createPlan([suggestion("P", { status: "pending" })]);
    expect(await errorOf(finalize(admin, nonePlan, 1))).toContain(
      "PLANNING_NOTHING_APPROVED",
    );
  });

  test("F03b a stale version with something left to convert is a conflict and writes nothing", async () => {
    await resetActions();
    const a = suggestion("A");
    const b = suggestion("B", { status: "pending" });
    const planId = await createPlan([a, b]);
    // Another tab approves B (version 2) while this tab still holds version 1.
    await asCaller("authenticated", otherAdmin, (tx) =>
      tx.query(
        "SELECT public.update_social_plan_versioned($1, 1, NULL, NULL, NULL, $2::jsonb)",
        [planId, JSON.stringify([a, { ...b, status: "approved" }])],
      ),
    );
    expect(await errorOf(finalize(admin, planId, 1))).toContain(
      "VERSION_CONFLICT: current version is 2",
    );
    expect(await counts(planId)).toMatchObject({
      actions: 0,
      links: 0,
      version: 2,
    });
  });

  test("F09 a deleted action is not recreated and only its id is returned", async () => {
    await resetActions();
    const planId = await createPlan([suggestion("A"), suggestion("B")]);
    const firstCall = await finalize(admin, planId, 1);
    const deleted = firstCall.created[0]?.action_id;
    await asCaller("authenticated", admin, (tx) =>
      tx.query("DELETE FROM public.actions WHERE id = $1", [deleted]),
    );
    const again = await finalize(admin, planId, 2);
    expect(again.created).toEqual([]);
    expect(again.links).toEqual(firstCall.links);
    expect(await counts(planId)).toMatchObject({ actions: 1, links: 2 });
  });

  test("F10 a new proposal with the same titles and dates gets its own actions", async () => {
    await resetActions();
    const make = () => [suggestion("Igual"), suggestion("Igual 2")];
    const firstPlan = await createPlan(make());
    const secondPlan = await createPlan(make());
    await finalize(admin, firstPlan, 1);
    const second = await finalize(admin, secondPlan, 1);
    expect(second.created).toHaveLength(2);
    expect((await counts(secondPlan)).actions).toBe(4);
  });

  test("F11 rollback before commit leaves nothing and a later call converts once", async () => {
    await resetActions();
    const planId = await createPlan([suggestion("A"), suggestion("B")]);
    // The request dies after the RPC ran but before commit.
    const aborted = await errorOf(
      asCaller("authenticated", admin, async (tx) => {
        await tx.query("SELECT public.finalize_social_plan($1, 1)", [planId]);
        throw new Error("connection lost before commit");
      }),
    );
    expect(aborted).toContain("connection lost before commit");
    expect(await counts(planId)).toMatchObject({
      actions: 0,
      links: 0,
      version: 1,
    });
    const result = await finalize(admin, planId, 1);
    expect(result.created).toHaveLength(2);
  });

  test("L01 release frees one finalized suggestion, keeps its action and lets it be finalized again", async () => {
    await resetActions();
    const planId = await createPlan([suggestion("A"), suggestion("B")]);
    const done = await finalize(admin, planId, 1);
    const target = done.created[0]?.suggestion_id;
    const keptAction = done.created[0]?.action_id;
    const released = await asCaller("authenticated", admin, async (tx) => {
      const { rows } = await tx.query(
        "SELECT public.release_social_plan_suggestion($1, $2, $3) AS result",
        [planId, target, 2],
      );
      return rows[0]?.result as { plan: { version: number; status: string } };
    });
    expect(released.plan).toMatchObject({ version: 3, status: "draft" });
    const state = await counts(planId);
    // Only the link goes; both actions stay.
    expect(state).toMatchObject({ actions: 2, links: 1, status: "draft" });
    const freed = state.suggestions.find((item) => item.id === target);
    expect(freed?.status).toBe("approved");
    expect(freed?.created_action_id).toBeUndefined();
    expect(
      (
        await first(
          "SELECT count(*)::int AS n FROM public.actions WHERE id = $1",
          [keptAction],
        )
      ).n,
    ).toBe(1);
    // Finalizing again converts only the released one.
    const again = await finalize(admin, planId, 3);
    expect(again.created).toHaveLength(1);
    expect(again.created[0]?.suggestion_id).toBe(target);
    expect(await counts(planId)).toMatchObject({ actions: 3, links: 2 });
  });

  test("L02 release rejects non-admins, stale versions and suggestions without an action, writing nothing", async () => {
    await resetActions();
    const planId = await createPlan([
      suggestion("A"),
      suggestion("B", { status: "pending" }),
    ]);
    const done = await finalize(admin, planId, 1);
    const target = done.created[0]?.suggestion_id;
    const release = (
      user: string | null,
      id: string,
      version: number,
      role: "authenticated" | "anon" = "authenticated",
    ) =>
      asCaller(role, user, (tx) =>
        tx.query("SELECT public.release_social_plan_suggestion($1, $2, $3)", [
          planId,
          id,
          version,
        ]),
      );
    expect(await errorOf(release(member, String(target), 2))).toContain(
      "PLANNING_ADMIN_REQUIRED",
    );
    expect(await errorOf(release(inactiveAdmin, String(target), 2))).toContain(
      "PLANNING_ADMIN_REQUIRED",
    );
    expect(await errorOf(release(null, String(target), 2, "anon"))).toContain(
      "permission denied",
    );
    expect(await errorOf(release(admin, String(target), 1))).toContain(
      "VERSION_CONFLICT",
    );
    expect(await errorOf(release(admin, "not-a-suggestion", 2))).toContain(
      "PLANNING_NOT_FINALIZED",
    );
    expect(await counts(planId)).toMatchObject({
      actions: 1,
      links: 1,
      version: 2,
      status: "finalized",
    });
  });

  test("R1 regression: one INSERT per request (old browser loop) leaves a partial result", async () => {
    await resetActions();
    // Reproduces the removed finalizer: each action in its own request.
    let created = 0;
    for (const title of ["A", "Falhar aqui", "C"]) {
      try {
        await asCaller(
          "authenticated",
          admin,
          (tx) =>
            tx.query(
              "INSERT INTO public.actions (title, date, responsibles, priority, category, partners, created_at, updated_at) VALUES ($1, '2031-03-10 11:00', ARRAY[$2]::uuid[], 'medium', 'post', ARRAY['alpha'], now(), now())",
              [title, admin],
            ),
          { "t09.fail_title": "Falhar aqui" },
        );
        created++;
      } catch {
        // The old loop counted the error and kept going.
      }
    }
    // F02 would reject this state: the old path leaves 2 of 3 actions behind.
    expect(created).toBe(2);
    expect(
      (await first("SELECT count(*)::int AS n FROM public.actions")).n,
    ).toBe(2);
  });
});
