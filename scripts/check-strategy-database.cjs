const fs = require("node:fs");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { Client } = require(process.env.PG_MODULE || "pg");
const socket = process.env.PG_SOCKET;
if (!socket?.startsWith("/") || !Number.isInteger(Number(process.env.PG_PORT)))
  throw new Error("Explicit local PG_SOCKET and PG_PORT required");
const config = {
  host: socket,
  port: Number(process.env.PG_PORT),
  user: "postgres",
};
const database = `uzzina_test_strategy_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
const { join } = require("node:path");
const root = join(__dirname, "..");
const migrations = join(root, "supabase/migrations");
const migration = fs
  .readdirSync(migrations)
  .find((name) => name.endsWith("_durable_strategy_operations.sql"));
if (!migration) throw new Error("Strategy migration missing");
const ids = {
  owner: randomUUID(),
  other: randomUUID(),
  admin: randomUUID(),
  outsider: randomUUID(),
  action: randomUUID(),
  partner: randomUUID(),
};
let assertions = 0;
async function connect(db = database, role = "service_role") {
  const c = new Client({ ...config, database: db });
  await c.connect();
  if (role) await c.query(`set role ${role}`);
  return c;
}
const check = (value, message) => {
  assert.ok(value, message);
  assertions++;
};
const admin = new Client({ ...config, database: "postgres" });
(async () => {
  await admin.connect();
  await admin.query(`create database ${database}`);
  const setup = await connect(database, null);
  await setup.query(`DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role BYPASSRLS; END IF;
 END $$;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
 CREATE TABLE public.people(user_id uuid PRIMARY KEY,visible boolean,admin boolean);
 CREATE TABLE public.partners(id uuid PRIMARY KEY,slug text UNIQUE,title text,context text,archived boolean,users_ids uuid[]);
 CREATE TABLE public.actions(id uuid PRIMARY KEY,title text,description text,content_description text,category text,partners text[],
 responsibles uuid[],archived boolean,strategies jsonb,date timestamp,content_files text[],updated_at timestamp NOT NULL DEFAULT(clock_timestamp() AT TIME ZONE 'UTC'));
 GRANT USAGE ON SCHEMA public,auth TO service_role,authenticated,anon;
 GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public,auth TO service_role;
 CREATE FUNCTION public.handle_actions_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 NEW.updated_at=greatest(clock_timestamp() AT TIME ZONE 'UTC',OLD.updated_at+interval '1 microsecond'); RETURN NEW; END $$;
 CREATE TRIGGER trg_actions_updated_at BEFORE UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.handle_actions_updated_at();`);
  await setup.query(
    fs.readFileSync(
      join(root, "supabase/migrations/20261007010000_ai_usage.sql"),
      "utf8",
    ),
  );
  await setup.query(fs.readFileSync(join(migrations, migration), "utf8"));
  for (const [key, id] of Object.entries(ids).filter(([key]) =>
    ["owner", "other", "admin", "outsider"].includes(key),
  )) {
    await setup.query("insert into auth.users values($1)", [id]);
    await setup.query("insert into people values($1,true,$2)", [
      id,
      key === "admin",
    ]);
  }
  await setup.query("insert into partners values($1,$2,$3,$4,false,$5)", [
    ids.partner,
    "hospital",
    "Hospital",
    "Context",
    [ids.owner, ids.other],
  ]);
  await setup.query(
    "insert into actions(id,title,description,content_description,category,partners,responsibles,archived,strategies,date,content_files) values($1,'Title','Brief','Content','post',ARRAY['hospital'],$2,false,'[]','2026-10-31',ARRAY['media'])",
    [ids.action, [ids.owner, ids.other]],
  );
  const client = await connect();
  const version = async () =>
    (
      await setup.query("select updated_at::text from actions where id=$1", [
        ids.action,
      ])
    ).rows[0].updated_at;
  const accept = async (id = randomUUID(), who = ids.owner, v) =>
    (
      await client.query(
        "select accept_strategy_operation($1,$2,$3,$4) as op",
        [who, ids.action, id, v ?? (await version())],
      )
    ).rows[0].op;
  const claim = async (c = client) =>
    (
      await c.query("select claim_strategy_operation($1,100) as op", [
        randomUUID(),
      ])
    ).rows[0].op;
  const expectCode = async (fn, code) => {
    let err;
    try {
      await fn();
    } catch (e) {
      err = e;
    }
    check(err?.code === code, `expected ${code}, received ${err?.message}`);
  };
  await expectCode(async () => accept(), "55000");
  await claim();
  await setup.query("update actions set category='   ' where id=$1", [
    ids.action,
  ]);
  await expectCode(async () => accept(), "22023");
  await setup.query("update actions set category=null where id=$1", [
    ids.action,
  ]);
  await expectCode(async () => accept(), "22023");
  check(
    (await setup.query("select count(*)::int as count from ai_usage")).rows[0]
      .count === 0,
    "invalid source consumes no quota",
  );
  await setup.query("update actions set category='post' where id=$1", [
    ids.action,
  ]);
  await setup.query(
    "insert into partners values($1,'private','Private client','Private context',false,$2)",
    [randomUUID(), [ids.outsider]],
  );
  await setup.query(
    "update actions set partners=ARRAY['private','hospital'] where id=$1",
    [ids.action],
  );
  check(
    (
      await client.query("select strategy_source($1,$2) as source", [
        ids.action,
        ids.owner,
      ])
    ).rows[0].source.payload.partner_name === "Hospital",
    "source never leaks inaccessible first partner",
  );
  check(
    (
      await client.query("select strategy_source($1,$2) as source", [
        ids.action,
        ids.admin,
      ])
    ).rows[0].source.payload.partner_name === "Private client",
    "admin source preserves first operational partner",
  );
  await setup.query(
    "update actions set partners=ARRAY['hospital'] where id=$1",
    [ids.action],
  );
  await expectCode(async () => accept(randomUUID(), ids.outsider), "42501");
  await expectCode(
    async () => accept(randomUUID(), ids.owner, "2000-01-01"),
    "40001",
  );
  for (const role of ["anon", "authenticated"]) {
    const c = await connect(database, role);
    await expectCode(
      async () => c.query("select * from strategy_operations"),
      "42501",
    );
    await expectCode(
      async () =>
        c.query("select claim_strategy_operation($1,100)", [randomUUID()]),
      "42501",
    );
    await expectCode(
      async () =>
        c.query("select accept_strategy_operation($1,$2,$3,$4)", [
          ids.owner,
          ids.action,
          randomUUID(),
          await version(),
        ]),
      "42501",
    );
    await c.end();
  }
  const op = await accept();
  check(op.state === "queued", "accept durable identity");
  check((await accept(op.id)).id === op.id, "idempotent same operation");
  await expectCode(async () => accept(op.id, ids.other), "42501");
  await expectCode(async () => accept(), "23505");
  const workers = await Promise.all(Array.from({ length: 6 }, () => connect()));
  const stableVersion = await version();
  const repeated = await Promise.all(
    workers.map((c) =>
      c.query("select accept_strategy_operation($1,$2,$3,$4) as op", [
        ids.owner,
        ids.action,
        op.id,
        stableVersion,
      ]),
    ),
  );
  check(
    repeated.every((item) => item.rows[0].op.id === op.id),
    "concurrent duplicate acceptance returns same operation",
  );
  const claimed = await Promise.all(workers.map(claim));
  const lease = claimed.find(Boolean);
  check(claimed.filter(Boolean).length === 1, "one concurrent claim");
  check(
    (
      await setup.query("select attempts from ai_usage where user_id=$1", [
        ids.owner,
      ])
    ).rows[0].attempts === 1,
    "one quota charge",
  );
  await Promise.all(workers.map((c) => c.end()));
  const result = Array.from({ length: 5 }, (_, i) => ({
    headline: `Headline${i}`,
    angulo: "Angle",
    racional: "Reason",
    direcionamento: "Direction",
  }));
  await expectCode(
    async () =>
      client.query("select store_strategy_result($1,$2,$3)", [
        op.id,
        lease.leaseId,
        JSON.stringify(result.slice(0, 4)),
      ]),
    "22023",
  );
  await client.query("select store_strategy_result($1,$2,$3)", [
    op.id,
    lease.leaseId,
    JSON.stringify(result),
  ]);
  await setup.query(
    "update actions set content_files=ARRAY['new-media'],date='2026-11-02' where id=$1",
    [ids.action],
  );
  const finished = (
    await client.query("select finish_strategy_operation($1,$2) as op", [
      op.id,
      lease.leaseId,
    ])
  ).rows[0].op;
  check(finished.state === "succeeded", "finish persists canonical");
  const action = (
    await setup.query("select * from actions where id=$1", [ids.action])
  ).rows[0];
  check(
    action.strategies.length === 5 &&
      action.content_files[0] === "new-media" &&
      action.title === "Title",
    "only strategies written, unrelated edits preserved",
  );
  check(
    (
      await client.query("select finish_strategy_operation($1,$2) as op", [
        op.id,
        lease.leaseId,
      ])
    ).rows[0].op.state === "succeeded",
    "duplicate finish idempotent",
  );
  const uncertain = await accept();
  const uncertainLease = await claim();
  await setup.query(
    "update strategy_operations set lease_until=clock_timestamp()-interval '1 second' where id=$1",
    [uncertain.id],
  );
  check((await claim()) === null, "expired generation never repeated");
  check(
    (
      await client.query("select read_strategy_operation($1,$2) as op", [
        ids.owner,
        ids.action,
      ])
    ).rows[0].op.state === "uncertain",
    "ambiguous state observable",
  );
  await client.query("select store_strategy_result($1,$2,$3)", [
    uncertain.id,
    uncertainLease.leaseId,
    JSON.stringify(result),
  ]);
  await setup.query("update actions set title='Changed input' where id=$1", [
    ids.action,
  ]);
  check(
    (
      await client.query("select finish_strategy_operation($1,$2) as op", [
        uncertain.id,
        uncertainLease.leaseId,
      ])
    ).rows[0].op.state === "conflict",
    "late result cannot overwrite changed source",
  );
  await expectCode(
    async () =>
      client.query("select retry_strategy_result($1,$2,$3,false)", [
        ids.owner,
        uncertain.id,
        await version(),
      ]),
    "40001",
  );
  await client.query("select retry_strategy_result($1,$2,$3,true)", [
    ids.owner,
    uncertain.id,
    await version(),
  ]);
  const recovery = await claim();
  check(recovery.result.length === 5, "reviewed apply reuses retained result");
  await client.query("select finish_strategy_operation($1,$2)", [
    uncertain.id,
    recovery.leaseId,
  ]);
  check(
    (
      await setup.query("select attempts from ai_usage where user_id=$1", [
        ids.owner,
      ])
    ).rows[0].attempts === 2,
    "apply retry did not consume generation",
  );
  const persist = await accept();
  const persistLease = await claim();
  await client.query("select store_strategy_result($1,$2,$3)", [
    persist.id,
    persistLease.leaseId,
    JSON.stringify(result),
  ]);
  await setup.query(`CREATE FUNCTION public.test_reject_strategy_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture write failed'; END $$;
 CREATE TRIGGER test_reject_strategy_write BEFORE UPDATE ON actions FOR EACH ROW EXECUTE FUNCTION public.test_reject_strategy_write();`);
  await expectCode(
    async () =>
      client.query("select finish_strategy_operation($1,$2)", [
        persist.id,
        persistLease.leaseId,
      ]),
    "P0001",
  );
  await client.query("select fail_strategy_operation($1,$2,'SAVE_FAILED')", [
    persist.id,
    persistLease.leaseId,
  ]);
  check(
    (
      await setup.query("select result from strategy_operations where id=$1", [
        persist.id,
      ])
    ).rows[0].result.length === 5,
    "result survives action-write rollback",
  );
  await setup.query(
    "drop trigger test_reject_strategy_write on actions;drop function test_reject_strategy_write()",
  );
  await client.query("select retry_strategy_result($1,$2,$3,false)", [
    ids.owner,
    persist.id,
    await version(),
  ]);
  const persisted = await claim();
  await client.query("select finish_strategy_operation($1,$2)", [
    persist.id,
    persisted.leaseId,
  ]);
  check(
    (
      await setup.query("select attempts from ai_usage where user_id=$1", [
        ids.owner,
      ])
    ).rows[0].attempts === 3,
    "failed-write retry no extra charge",
  );
  const revoked = await accept();
  const revokedLease = await claim();
  await client.query("select store_strategy_result($1,$2,$3)", [
    revoked.id,
    revokedLease.leaseId,
    JSON.stringify(result),
  ]);
  await setup.query("update people set visible=false where user_id=$1", [
    ids.owner,
  ]);
  check(
    (
      await client.query("select finish_strategy_operation($1,$2) as op", [
        revoked.id,
        revokedLease.leaseId,
      ])
    ).rows[0].op.errorCode === "ACCESS_REVOKED",
    "finalize rechecks revoked member",
  );
  await expectCode(
    async () =>
      client.query("select read_strategy_operation($1,$2)", [
        ids.owner,
        ids.action,
      ]),
    "42501",
  );
  await setup.query("update people set visible=true where user_id=$1", [
    ids.owner,
  ]);
  // Two independent connections: a user selection committed while completion waits wins.
  const conflicting = await accept();
  const conflictingLease = await claim();
  await client.query("select store_strategy_result($1,$2,$3)", [
    conflicting.id,
    conflictingLease.leaseId,
    JSON.stringify(result),
  ]);
  const editor = await connect();
  await editor.query("begin");
  const selected = result.map((item, i) => ({ ...item, selected: i === 0 }));
  await editor.query("update actions set strategies=$1 where id=$2", [
    JSON.stringify(selected),
    ids.action,
  ]);
  const completing = client.query(
    "select finish_strategy_operation($1,$2) as op",
    [conflicting.id, conflictingLease.leaseId],
  );
  await new Promise((resolve) => setTimeout(resolve, 40));
  await editor.query("commit");
  check(
    (await completing).rows[0].op.state === "conflict",
    "concurrent selection blocks late finalization",
  );
  check(
    (
      await setup.query("select strategies from actions where id=$1", [
        ids.action,
      ])
    ).rows[0].strategies[0].selected === true,
    "selected result preserved",
  );
  await editor.end();
  for (const finishNewerFirst of [false, true]) {
    const old = await accept();
    const oldLease = await claim();
    await setup.query(
      "update strategy_operations set lease_until=clock_timestamp()-interval '1 second' where id=$1",
      [old.id],
    );
    await claim();
    const newer = await accept();
    const newLease = await claim();
    if (finishNewerFirst) {
      await client.query("select store_strategy_result($1,$2,$3)", [
        newer.id,
        newLease.leaseId,
        JSON.stringify(result),
      ]);
      await client.query("select finish_strategy_operation($1,$2)", [
        newer.id,
        newLease.leaseId,
      ]);
    }
    await client.query("select store_strategy_result($1,$2,$3)", [
      old.id,
      oldLease.leaseId,
      JSON.stringify(result),
    ]);
    const oldState = (
      await setup.query(
        "select state,result from strategy_operations where id=$1",
        [old.id],
      )
    ).rows[0];
    check(
      oldState.state === "conflict" && oldState.result.length === 5,
      "late old result retained without reviving/overwriting newer intent",
    );
    await expectCode(
      async () =>
        client.query("select retry_strategy_result($1,$2,$3,true)", [
          ids.owner,
          old.id,
          await version(),
        ]),
      "40001",
    );
    if (!finishNewerFirst) {
      await client.query("select store_strategy_result($1,$2,$3)", [
        newer.id,
        newLease.leaseId,
        JSON.stringify(result),
      ]);
      await client.query("select finish_strategy_operation($1,$2)", [
        newer.id,
        newLease.leaseId,
      ]);
    }
  }
  const archiver = await connect();
  await archiver.query("begin");
  await archiver.query("update actions set archived=true where id=$1", [
    ids.action,
  ]);
  const racingAccept = accept().then(
    () => null,
    (error) => error,
  );
  await new Promise((resolve) => setTimeout(resolve, 40));
  await archiver.query("commit");
  check(
    (await racingAccept)?.code === "42501",
    "accept rechecks access after action lock wait",
  );
  await archiver.end();
  await setup.query("update actions set archived=false where id=$1", [
    ids.action,
  ]);
  await setup.query("delete from actions where id=$1", [ids.action]);
  check(
    (
      await setup.query(
        "select count(*)::int as count from strategy_operations",
      )
    ).rows[0].count === 0,
    "deleted action removes private operations",
  );
  await client.end();
  await setup.end();
  await admin.query(`drop database ${database}`);
  await admin.end();
  console.log(
    "PASS",
    assertions,
    "real PostgreSQL17 authorization/idempotency/quota/leases/persistence/recovery/concurrency assertions",
  );
})().catch(async (error) => {
  console.error(error);
  console.error("Retained database:", database);
  process.exitCode = 1;
  try {
    await admin.end();
  } catch {}
});
