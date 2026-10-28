// Runs the real baseline + migration in an isolated PostgreSQL (PGlite) fixture.
// PGLITE_MODULE may point at a temporary installation; never connects to Supabase.
const { PGlite } = require(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const fs = require("node:fs/promises");
const assert = require("node:assert/strict");

(async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to authenticated;
      create table public.people(user_id uuid primary key, visible boolean, preferences jsonb);
      alter table public.people enable row level security;
      grant select on public.people to authenticated;
      create policy own_person on public.people for select to authenticated using (user_id = auth.uid());
      insert into public.people values
        ('11111111-1111-4111-8111-111111111111', true, '{"theme":"light","futureKey":{"keep":true}}'),
        ('22222222-2222-4222-8222-222222222222', true, '{"defaultTodayView":"feed"}'),
        ('33333333-3333-4333-8333-333333333333', false, '{}');
    `);
    await db.exec(
      await fs.readFile(
        "supabase/migrations/20261007020000_preferences_merge.sql",
        "utf8",
      ),
    );
    const rejects = async (patch, code) => {
      await assert.rejects(
        db.query("select public.update_my_preferences($1::jsonb)", [
          JSON.stringify(patch),
        ]),
        (e) => e.code === code,
      );
    };
    const identity = async (id) => {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
        id,
      ]);
    };
    await db.exec("set role authenticated");
    await identity("11111111-1111-4111-8111-111111111111");
    await rejects({ defaultTodayView: "kanban" }, "22023");
    console.log("Regression confirmed: old RPC rejects defaultTodayView.");
    await db.exec("reset role");
    const before = await db.query(
      "select proacl::text as acl, proowner from pg_proc where oid='public.update_my_preferences(jsonb)'::regprocedure",
    );
    await db.exec(
      await fs.readFile(
        "supabase/migrations/20261028201902_today_view_preference.sql",
        "utf8",
      ),
    );
    const after = await db.query(
      "select proacl::text as acl, proowner from pg_proc where oid='public.update_my_preferences(jsonb)'::regprocedure",
    );
    assert.deepEqual(
      after.rows,
      before.rows,
      "Migration must preserve owner and grants",
    );
    await db.exec("set role authenticated");
    for (const mode of ["partners", "kanban", "categories", "feed"]) {
      const result = await db.query(
        "select public.update_my_preferences($1::jsonb) as prefs",
        [JSON.stringify({ defaultTodayView: mode })],
      );
      assert.equal(result.rows[0].prefs.defaultTodayView, mode);
      assert.equal(result.rows[0].prefs.theme, "light");
      assert.deepEqual(result.rows[0].prefs.futureKey, { keep: true });
    }
    for (const value of [null, "invalid", 0, true, {}, []])
      await rejects({ defaultTodayView: value }, "22023");
    await rejects({ anotherUnknownKey: "kanban" }, "22023");
    await rejects(
      {
        user_id: "22222222-2222-4222-8222-222222222222",
        defaultTodayView: "kanban",
      },
      "22023",
    );
    await db.query("select public.update_my_preferences($1::jsonb)", [
      JSON.stringify({ theme: "dark" }),
    ]);
    const own = await db.query("select preferences from public.people");
    assert.equal(own.rows.length, 1);
    assert.equal(own.rows[0].preferences.defaultTodayView, "feed");
    assert.equal(own.rows[0].preferences.theme, "dark");
    await assert.rejects(
      db.query("update public.people set preferences='{}'"),
      (e) => e.code === "42501",
    );
    await identity("");
    await rejects({ defaultTodayView: "kanban" }, "42501");
    await identity("33333333-3333-4333-8333-333333333333");
    await rejects({ defaultTodayView: "kanban" }, "42501");
    await db.exec("reset role; set role anon");
    await rejects({ defaultTodayView: "kanban" }, "42501");
    await db.exec("reset role");
    const other = await db.query(
      "select preferences from public.people where user_id='22222222-2222-4222-8222-222222222222'",
    );
    assert.deepEqual(other.rows[0].preferences, { defaultTodayView: "feed" });
    console.log(
      "PASS: four modes, invalid types/keys, authorized merge, unknown existing fields, theme coexistence, account isolation, inactive/anonymous rejection, no direct preference UPDATE, unchanged owner/grants.",
    );
  } finally {
    await db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
