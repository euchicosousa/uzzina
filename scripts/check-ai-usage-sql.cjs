// Execute the actual migration with an isolated native PostgreSQL single-user backend.
// No listener, application credentials or remote database connection is used.
const fs = require("node:fs/promises");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");
const assert = require("node:assert/strict");
(async () => {
  const bin = process.env.PG_BIN_DIR;
  if (!bin?.startsWith("/"))
    throw new Error("Explicit absolute PG_BIN_DIR required");
  const directory = await fs.mkdtemp("/tmp/uzzina-ai-usage-sql-");
  try {
    const init = spawnSync(
      join(bin, "initdb"),
      [
        "-D",
        directory,
        "-U",
        "postgres",
        "-A",
        "trust",
        "--no-locale",
        "--encoding=UTF8",
      ],
      { encoding: "utf8" },
    );
    assert.equal(init.status, 0, init.stderr);
    const migration = await fs.readFile(
      "supabase/migrations/20261101230000_ai_agency_usage.sql",
      "utf8",
    );
    const providerMigration = await fs.readFile(
      "supabase/migrations/20261105120000_ai_provider_metering.sql",
      "utf8",
    );
    const setup = `
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema public,auth to anon,authenticated,service_role;
create table public.people(user_id uuid primary key,visible boolean);
create table public.strategy_operations(id uuid primary key,requester_id uuid,lease_id uuid);
create table public.ai_usage(user_id uuid,attempts integer);
grant select on public.strategy_operations to service_role;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333');
insert into public.people values ('11111111-1111-4111-8111-111111111111',true),('22222222-2222-4222-8222-222222222222',true),('33333333-3333-4333-8333-333333333333',false);
insert into public.strategy_operations values ('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','66666666-6666-4666-8666-666666666666');
insert into public.ai_usage values ('11111111-1111-4111-8111-111111111111',7);
`;
    const checks = `
create function public.test_assert(p_ok boolean,p_message text) returns void language plpgsql as $$ begin if p_ok is distinct from true then raise exception 'ASSERTION FAILED: %',p_message; end if; end $$;
set role service_role;
select public.record_ai_generation('44444444-4444-4444-8444-444444444444','ai-caption','gpt-6-luna',1000,500,1500,200,'11111111-1111-4111-8111-111111111111');
select public.record_ai_generation('44444444-4444-4444-8444-444444444444','ai-caption','gpt-6-luna',1000,500,1500,200,'11111111-1111-4111-8111-111111111111');
select test_assert((select count(*)=1 and sum(units_consumed)=2 from ai_generation_logs),'dedup and cached input subset');
do $$ begin begin perform public.record_ai_generation('55555555-5555-4555-8555-555555555555','ai-strategy','gpt-6-luna',1000,500,1500,null,null,'55555555-5555-4555-8555-555555555555','77777777-7777-4777-8777-777777777777'); raise exception 'wrong lease accepted'; exception when insufficient_privilege then null; end; end $$;
select public.record_ai_generation('55555555-5555-4555-8555-555555555555','ai-strategy','gpt-6-luna',1000,500,1500,null,'22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555555','66666666-6666-4666-8666-666666666666');
select test_assert((select user_id='11111111-1111-4111-8111-111111111111'::uuid from ai_generation_logs where strategy_operation_id is not null),'strategy actor derives from operation');
select public.record_ai_generation('77777777-7777-4777-8777-777777777777','ai-caption','gpt-6-luna',p_user_id=>'11111111-1111-4111-8111-111111111111');
select public.record_ai_generation('88888888-8888-4888-8888-888888888888','ai-caption','gpt-6-luna',100,50,99,null,'11111111-1111-4111-8111-111111111111');
select test_assert((select count(*)=2 from ai_generation_logs where measurement_status='incomplete' and units_consumed is null),'unknown usage is not zero');
reset role; set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin begin perform 1 from ai_generation_logs; raise exception 'raw logs readable'; exception when insufficient_privilege then null; end; begin perform 1 from ai_usage_metering; raise exception 'internal policy readable'; exception when insufficient_privilege then null; end; begin perform record_ai_generation('99999999-9999-4999-8999-999999999999','ai-caption','gpt-6-luna',p_user_id=>'11111111-1111-4111-8111-111111111111'); raise exception 'client could write'; exception when insufficient_privilege then null; end; end $$;
select test_assert((get_agency_ai_usage()->>'total_generations')::integer=4,'aggregate generation count');
select test_assert((get_agency_ai_usage()->>'incomplete_generations')::integer=2,'aggregate incomplete count');
select test_assert((get_agency_ai_usage()->>'percentage')::numeric=0.4,'existing weighted convention');
select test_assert((get_agency_ai_usage()->>'reference_units')::integer=1000,'monthly reference');
select test_assert((get_agency_ai_usage()->>'partial_period')::boolean,'new measurement has partial historical coverage');
select test_assert(not (get_agency_ai_usage() ? 'user_id') and not (get_agency_ai_usage() ? 'prompt_tokens'),'no raw identity or token data exposed');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
select test_assert((get_agency_ai_usage()->>'total_units')::numeric=4,'active members share agency aggregate');
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
do $$ begin begin perform get_agency_ai_usage(); raise exception 'inactive member accepted'; exception when insufficient_privilege then null; end; end $$;
select set_config('request.jwt.claim.sub','',false);
do $$ begin begin perform get_agency_ai_usage(); raise exception 'missing identity accepted'; exception when insufficient_privilege then null; end; end $$;
reset role; set role anon;
do $$ begin begin perform get_agency_ai_usage(); raise exception 'anonymous aggregate accepted'; exception when insufficient_privilege then null; end; end $$;
reset role;
select test_assert((select attempts=7 from ai_usage),'technical quota unchanged');
update ai_generation_logs set created_at=(date_trunc('month',clock_timestamp() at time zone 'America/Fortaleza') at time zone 'America/Fortaleza')-interval '1 millisecond' where id='44444444-4444-4444-8444-444444444444';
update ai_generation_logs set created_at=((date_trunc('month',clock_timestamp() at time zone 'America/Fortaleza')+interval '1 month') at time zone 'America/Fortaleza') where id='55555555-5555-4555-8555-555555555555';
update ai_usage_metering set started_at=(date_trunc('month',clock_timestamp() at time zone 'America/Fortaleza') at time zone 'America/Fortaleza');
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
select test_assert((get_agency_ai_usage()->>'total_generations')::integer=2 and (get_agency_ai_usage()->>'total_units')::numeric=0,'Fortaleza month excludes previous and next boundary');
select test_assert(not (get_agency_ai_usage()->>'partial_period')::boolean,'full-period coverage after rollover');
reset role;
`;
    const providerChecks = `
select test_assert((select count(*)=4 from ai_generation_logs where provider_meter is null and provider_cost_usd is null),'historical weighted measurements preserved');
set role service_role;
select public.record_ai_generation('66666666-6666-4666-8666-666666666666','ai-strategy','gpt-6-luna',120,30,150,20,null,'55555555-5555-4555-8555-555555555555','66666666-6666-4666-8666-666666666666','{"provider":"openai","provider_id":"chatcmpl-1","cost_nanos":25200,"tariff":{"version":"standard-v1"}}');
select public.record_ai_generation('99999999-9999-4999-8999-999999999999','ai-caption','gpt-6-luna',120,30,150,20,'11111111-1111-4111-8111-111111111111',p_meter=>'{"provider":"openai","provider_id":"chatcmpl-1","cost_nanos":25200}');
select public.record_ai_generation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ai-caption','gpt-6-luna',p_user_id=>'11111111-1111-4111-8111-111111111111',p_meter=>'{"provider":"openai","provider_id":"chatcmpl-2","cost_nanos":null}');
select test_assert((select count(*)=2 from ai_generation_logs where provider_meter is not null),'duplicate provider calls suppressed, distinct incomplete call retained');
select test_assert((select provider_cost_usd=0.000025200 and provider_meter->'tariff'->>'version'='standard-v1' from ai_generation_logs where provider_call_id='chatcmpl-1'),'exact decimal and tariff snapshot retained');
select test_assert((select provider_cost_usd is null from ai_generation_logs where provider_call_id='chatcmpl-2'),'missing cost stays pending');
reset role; set role authenticated;
do $$ begin begin perform public.record_ai_generation('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','ai-caption','gpt-6-luna',p_user_id=>'11111111-1111-4111-8111-111111111111',p_meter=>'{}'); raise exception 'client could write provider meter'; exception when insufficient_privilege then null; end; end $$;
reset role;
select 'AI_USAGE_SQL_PASS';
`;
    const flattened =
      `${setup}\n${migration}\n${checks}\n${providerMigration}\n${providerChecks}`
        .replace(/--[^\n]*/g, "")
        .replace(/\n/g, " ");
    const input = `${flattened}\n`;
    const result = spawnSync(
      join(bin, "postgres"),
      ["--single", "-D", directory, "postgres"],
      { input, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.ok(
      !/ERROR:|FATAL:|ASSERTION FAILED/.test(result.stdout + result.stderr),
      result.stdout + result.stderr,
    );
    assert.ok(result.stdout.includes("AI_USAGE_SQL_PASS"), result.stdout);
    console.log(
      "PASS isolated PostgreSQL migration, deduplication, lease identity, raw-table/RPC grants, active/inactive/anonymous aggregate, real usage, incomplete state, cache subsets, Fortaleza month boundaries and unchanged quota.",
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
