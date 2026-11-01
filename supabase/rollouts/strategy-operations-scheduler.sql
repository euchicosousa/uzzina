-- Production rollout preparation. Install inactive; activate only after Ready and an authenticated worker probe.
-- Preconditions: reviewed target and matching distinct
-- STRATEGY_WORKER_SECRET >=32 chars in the server environment and Vault secret
-- named uzzina_strategy_worker_secret. Never store the service-role key here.
-- This file enables extensions/scheduling and must not run against a guessed target.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='uzzina_strategy_worker_secret') THEN
  RAISE EXCEPTION 'Configure the distinct worker secret in Vault first';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.wake_strategy_worker() RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_secret text;
BEGIN
 SELECT decrypted_secret INTO STRICT v_secret FROM vault.decrypted_secrets WHERE name='uzzina_strategy_worker_secret';
 IF length(v_secret)<32 THEN RAISE EXCEPTION 'Worker secret is too short'; END IF;
 PERFORM net.http_post(
  url:='https://uzzina.cnvt.com.br/api/strategy-worker',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_secret),
  body:='{}'::jsonb,
  timeout_milliseconds:=120000
 );
END $$;
REVOKE ALL ON FUNCTION public.wake_strategy_worker() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.wake_strategy_worker() TO service_role;
SELECT cron.schedule('uzzina-strategy-worker','30 seconds','SELECT public.wake_strategy_worker()');
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname='uzzina-strategy-worker'), active:=false);

-- Post-rollout metadata checks only: no decrypted secret or request headers.
SELECT jobname,schedule,active FROM cron.job WHERE jobname='uzzina-strategy-worker';

-- After Ready + authenticated empty-queue probe (run separately):
-- SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname='uzzina-strategy-worker'), active:=true);
