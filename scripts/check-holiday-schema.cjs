// Run against an exclusive local PostgreSQL cluster, never a remote database.
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const assert = require("node:assert/strict");
if (!process.env.UZZINA_PG_BIN || !process.env.UZZINA_PG_MODULE)
  throw new Error(
    "Set UZZINA_PG_BIN and UZZINA_PG_MODULE to local PostgreSQL binaries and the pg module.",
  );
const { Client } = require(process.env.UZZINA_PG_MODULE);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uzzina-holiday-schema-"));
const bin = process.env.UZZINA_PG_BIN;
const root = path.resolve(__dirname, "..");
const port = 56479;
function cmd(n, args) {
  const r = spawnSync(bin + "/" + n, args, { encoding: "utf8" });
  if (r.status) throw new Error(r.stdout + r.stderr);
}
const ids = {
  admin: "10000000-0000-0000-0000-000000000001",
  member: "10000000-0000-0000-0000-000000000002",
  outsider: "10000000-0000-0000-0000-000000000003",
  inactive: "10000000-0000-0000-0000-000000000004",
  a: "20000000-0000-0000-0000-000000000001",
  b: "20000000-0000-0000-0000-000000000002",
  h1: "30000000-0000-0000-0000-000000000001",
  h2: "30000000-0000-0000-0000-000000000002",
  non: "30000000-0000-0000-0000-000000000003",
  missing: "30000000-0000-0000-0000-000000000004",
};
const passed = [];
const ok = (n) => {
  passed.push(n);
  console.log("PASS " + n);
};
async function client(user) {
  const c = new Client({
    host: dir,
    port,
    user: "postgres",
    database: "postgres",
  });
  await c.connect();
  if (user) {
    await c.query("SET ROLE authenticated");
    await c.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
      user,
    ]);
  }
  return c;
}
async function error(c, sql, params, code) {
  try {
    await c.query(sql, params);
    assert.fail("Expected error " + code);
  } catch (e) {
    assert.equal(e.code, code, e.message);
  }
}
const rpc = (c, p, a) =>
  c.query("SELECT public.replace_partner_holidays($1,$2::uuid[]) ids", [p, a]);
(async () => {
  let owner, admin, member, out, inactive, c1, c2;
  try {
    cmd("initdb", [
      "-D",
      dir + "/data",
      "-U",
      "postgres",
      "-A",
      "trust",
      "--no-locale",
      "--encoding=UTF8",
      "-c",
      "shared_memory_type=mmap",
      "-c",
      "dynamic_shared_memory_type=posix",
    ]);
    cmd("pg_ctl", [
      "-D",
      dir + "/data",
      "-l",
      dir + "/postgres.log",
      "-o",
      `-k ${dir} -p ${port} -h ''`,
      "-w",
      "start",
    ]);
    owner = await client();
    await owner.query(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; GRANT USAGE ON SCHEMA auth TO authenticated,anon,service_role;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE public.people(user_id uuid PRIMARY KEY, visible boolean NOT NULL, admin boolean NOT NULL);
INSERT INTO people VALUES('${ids.admin}',true,true),('${ids.member}',true,false),('${ids.outsider}',true,false),('${ids.inactive}',false,true);
CREATE FUNCTION public.is_active_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.people WHERE user_id=auth.uid() AND visible AND admin) $$;
CREATE FUNCTION public.is_active_member() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.people WHERE user_id=auth.uid() AND visible) $$;
REVOKE ALL ON FUNCTION public.is_active_admin(),public.is_active_member() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.is_active_admin(),public.is_active_member() TO authenticated,service_role;
CREATE TABLE public.partners(id uuid PRIMARY KEY, archived boolean NOT NULL DEFAULT false, users_ids text[] NOT NULL DEFAULT '{}', title text NOT NULL DEFAULT 'Unchanged');
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.partners TO authenticated;
CREATE POLICY partners_select_policy ON public.partners FOR SELECT TO authenticated USING(public.is_active_admin() OR (public.is_active_member() AND archived=false AND users_ids @> ARRAY[auth.uid()::text]));
CREATE POLICY partners_write_admin_only ON public.partners FOR ALL TO authenticated USING(public.is_active_admin()) WITH CHECK(public.is_active_admin());
INSERT INTO partners(id,users_ids) VALUES('${ids.a}',ARRAY['${ids.member}']),('${ids.b}','{}');
CREATE TABLE public.celebrations(id uuid PRIMARY KEY, title text NOT NULL, date text NOT NULL);
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.celebrations TO authenticated;
CREATE POLICY celebrations_read_members ON public.celebrations FOR SELECT TO authenticated USING(public.is_active_member());
CREATE POLICY celebrations_manage_admin ON public.celebrations FOR ALL TO authenticated USING(public.is_active_admin()) WITH CHECK(public.is_active_admin());
INSERT INTO celebrations VALUES('${ids.non}','Non-holiday','2026-11-01');`);
    for (const name of [
      "20261101215111_celebration_holiday_classification.sql",
      "20261101215117_partner_holiday_associations.sql",
    ])
      await owner.query(
        fs.readFileSync(root + "/supabase/migrations/" + name, "utf8"),
      );
    assert.equal(
      (await owner.query("SELECT is_holiday FROM celebrations")).rows[0]
        .is_holiday,
      false,
    );
    ok("real migrations apply and old records default false");
    await owner.query(
      "INSERT INTO celebrations VALUES($1,$2,$3,true),($4,$5,$6,true)",
      [ids.h1, "Holiday1", "2026-11-02", ids.h2, "Holiday2", "2026-11-03"],
    );
    admin = await client(ids.admin);
    member = await client(ids.member);
    out = await client(ids.outsider);
    inactive = await client(ids.inactive);
    assert.deepEqual(
      (await rpc(admin, ids.a, [ids.h2, ids.h1, ids.h1])).rows[0].ids,
      [ids.h1, ids.h2],
    );
    assert.deepEqual((await rpc(admin, ids.a, [ids.h2, ids.h1])).rows[0].ids, [
      ids.h1,
      ids.h2,
    ]);
    ok("RPC deduplicates, sorts, is idempotent");
    assert.equal(
      (await admin.query("SELECT title FROM partners WHERE id=$1", [ids.a]))
        .rows[0].title,
      "Unchanged",
    );
    ok("partner fields preserved");
    await error(
      admin,
      "INSERT INTO partner_holidays(partner_id,celebration_id) VALUES($1,$2)",
      [ids.a, ids.h1],
      "23505",
    );
    await error(
      admin,
      "INSERT INTO partner_holidays(partner_id,celebration_id) VALUES($1,$2)",
      [ids.a, ids.non],
      "23503",
    );
    await error(
      admin,
      "INSERT INTO partner_holidays(partner_id,celebration_id) VALUES($1,$2)",
      [ids.a, ids.missing],
      "23503",
    );
    await error(
      admin,
      "INSERT INTO partner_holidays(partner_id,celebration_id,celebration_is_holiday) VALUES($1,$2,false)",
      [ids.a, ids.non],
      "428C9",
    );
    ok("duplicate, nonholiday, nonexistent and generated override blocked");
    await error(
      admin,
      "UPDATE celebrations SET is_holiday=false WHERE id=$1",
      [ids.h1],
      "23503",
    );
    ok("linked holiday unclassification blocked");
    await error(
      admin,
      "SELECT replace_partner_holidays($1,$2::uuid[])",
      [ids.a, [ids.non]],
      "22023",
    );
    assert.equal(
      (
        await admin.query(
          "SELECT count(*)::int n FROM partner_holidays WHERE partner_id=$1",
          [ids.a],
        )
      ).rows[0].n,
      2,
    );
    ok("invalid replacement preserves prior selection");
    await error(
      admin,
      "SELECT replace_partner_holidays($1,NULL)",
      [ids.a],
      "22023",
    );
    await error(
      admin,
      "SELECT replace_partner_holidays($1,$2::uuid[])",
      [ids.a, [null]],
      "22023",
    );
    await error(
      admin,
      "SELECT replace_partner_holidays($1,$2::uuid[])",
      [ids.missing, []],
      "P0002",
    );
    ok("null inputs and missing partner refused");
    assert.equal(
      (await member.query("SELECT * FROM partner_holidays")).rowCount,
      2,
    );
    assert.equal(
      (await out.query("SELECT * FROM partner_holidays")).rowCount,
      0,
    );
    assert.equal(
      (await inactive.query("SELECT * FROM partner_holidays")).rowCount,
      0,
    );
    ok("RLS member scope and inactive deny");
    for (const c of [member, out, inactive]) {
      await error(
        c,
        "SELECT replace_partner_holidays($1,$2::uuid[])",
        [ids.a, []],
        "42501",
      );
      await error(
        c,
        "INSERT INTO partner_holidays(partner_id,celebration_id) VALUES($1,$2)",
        [ids.b, ids.h1],
        "42501",
      );
      assert.equal((await c.query("DELETE FROM partner_holidays")).rowCount, 0);
    }
    ok("nonadmin RPC/direct insert/delete denied");
    await owner.query("SET ROLE anon");
    await error(owner, "SELECT * FROM partner_holidays", [], "42501");
    await error(
      owner,
      "SELECT replace_partner_holidays($1,$2::uuid[])",
      [ids.a, []],
      "42501",
    );
    await owner.query("RESET ROLE");
    ok("anon read and RPC denied");
    await owner.query(
      "CREATE FUNCTION public.fail_second_holiday() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.celebration_id='" +
        ids.h2 +
        "'::uuid THEN RAISE EXCEPTION 'Injected local failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER local_fail BEFORE INSERT ON partner_holidays FOR EACH ROW EXECUTE FUNCTION fail_second_holiday();",
    );
    await rpc(admin, ids.a, [ids.h1]);
    await error(
      admin,
      "SELECT replace_partner_holidays($1,$2::uuid[])",
      [ids.a, [ids.h2]],
      "P0001",
    );
    assert.deepEqual(
      (
        await admin.query(
          "SELECT celebration_id FROM partner_holidays WHERE partner_id=$1",
          [ids.a],
        )
      ).rows.map((x) => x.celebration_id),
      [ids.h1],
    );
    await owner.query(
      "DROP TRIGGER local_fail ON partner_holidays; DROP FUNCTION fail_second_holiday()",
    );
    ok("write failure after delete rolls back prior selection");
    await admin.query("BEGIN");
    await rpc(admin, ids.a, [ids.h2]);
    await admin.query("ROLLBACK");
    assert.deepEqual(
      (
        await admin.query(
          "SELECT celebration_id FROM partner_holidays WHERE partner_id=$1",
          [ids.a],
        )
      ).rows.map((x) => x.celebration_id),
      [ids.h1],
    );
    ok("explicit rollback preserves selection");
    c1 = await client(ids.admin);
    c2 = await client(ids.admin);
    await c1.query("BEGIN");
    await rpc(c1, ids.a, [ids.h1]);
    let finished = false;
    let pending = rpc(c2, ids.a, [ids.h2]).then((r) => {
      finished = true;
      return r;
    });
    await new Promise((r) => setTimeout(r, 150));
    assert.equal(finished, false);
    await c1.query("COMMIT");
    assert.deepEqual((await pending).rows[0].ids, [ids.h2]);
    ok("concurrent same-partner replacements serialize");
    // Link creation holds native FK key lock; unclassification waits then fails.
    await rpc(admin, ids.a, []);
    await c1.query("BEGIN");
    await rpc(c1, ids.a, [ids.h1]);
    finished = false;
    pending = c2
      .query("UPDATE celebrations SET is_holiday=false WHERE id=$1", [ids.h1])
      .then(
        () => ({ code: "success" }),
        (e) => e,
      )
      .then((r) => {
        finished = true;
        return r;
      });
    await new Promise((r) => setTimeout(r, 150));
    assert.equal(finished, false);
    await c1.query("COMMIT");
    assert.equal((await pending).code, "23503");
    ok("concurrent insert then unclassify waits and rejects");
    // Reverse direction: change classification first; racing insertion fails.
    await rpc(admin, ids.a, []);
    await c1.query("BEGIN");
    await c1.query("UPDATE celebrations SET is_holiday=false WHERE id=$1", [
      ids.h1,
    ]);
    finished = false;
    pending = rpc(c2, ids.a, [ids.h1])
      .then(
        () => ({ code: "success" }),
        (e) => e,
      )
      .then((r) => {
        finished = true;
        return r;
      });
    await new Promise((r) => setTimeout(r, 150));
    assert.equal(finished, false);
    await c1.query("COMMIT");
    assert.equal((await pending).code, "23503");
    ok("concurrent unclassify then insert rejects dangling classification");
    await admin.query("UPDATE celebrations SET is_holiday=true WHERE id=$1", [
      ids.h1,
    ]);
    await rpc(admin, ids.a, [ids.h1]);
    await rpc(admin, ids.b, [ids.h1, ids.h2]);
    await admin.query("DELETE FROM partners WHERE id=$1", [ids.a]);
    assert.equal(
      (
        await admin.query(
          "SELECT * FROM partner_holidays WHERE partner_id=$1",
          [ids.a],
        )
      ).rowCount,
      0,
    );
    assert.equal(
      (
        await admin.query(
          "SELECT * FROM partner_holidays WHERE partner_id=$1",
          [ids.b],
        )
      ).rowCount,
      2,
    );
    ok("partner cascade isolated from other brand");
    await admin.query("DELETE FROM celebrations WHERE id=$1", [ids.h1]);
    assert.equal(
      (
        await admin.query(
          "SELECT * FROM partner_holidays WHERE celebration_id=$1",
          [ids.h1],
        )
      ).rowCount,
      0,
    );
    ok("celebration delete cascades");
    assert.deepEqual((await rpc(admin, ids.b, [])).rows[0].ids, []);
    ok("empty array clears selection");
    fs.writeFileSync(
      dir + "/result.json",
      JSON.stringify({ passed: passed.length, checks: passed }, null, 2),
    );
    console.log("ALL " + passed.length + " CHECKS PASSED");
    console.log("Artifacts: " + dir);
  } finally {
    for (const c of [owner, admin, member, out, inactive, c1, c2])
      if (c) await c.end().catch(() => {});
    try {
      cmd("pg_ctl", ["-D", dir + "/data", "-m", "fast", "-w", "stop"]);
    } catch (e) {
      console.log(e.message);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
