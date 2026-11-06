BEGIN;
SET LOCAL lock_timeout = '5s';

-- Drain previous-version work before requiring reservations at acceptance.
LOCK TABLE public.strategy_operations IN SHARE ROW EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.strategy_operations WHERE state IN ('queued', 'generating')) THEN
    RAISE EXCEPTION 'Drain queued and generating strategies before enabling monthly reservations';
  END IF;
END;
$$;

CREATE TABLE public.ai_monthly_allowance_config (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  allowance_usd numeric(18,9) NOT NULL CHECK (allowance_usd > 0)
);
INSERT INTO public.ai_monthly_allowance_config VALUES (true, 5);

CREATE TABLE public.ai_monthly_reservations (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period date NOT NULL,
  reserved_usd numeric(18,9) NOT NULL CHECK (reserved_usd > 0),
  released boolean NOT NULL DEFAULT false
);
CREATE INDEX ai_monthly_reservations_user_period_idx
  ON public.ai_monthly_reservations (user_id, period);
ALTER TABLE public.ai_generation_logs ADD COLUMN allowance_reservation_id uuid;
CREATE FUNCTION public.link_ai_monthly_reservation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.allowance_reservation_id := coalesce(NEW.strategy_operation_id, NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER link_ai_monthly_reservation BEFORE INSERT ON public.ai_generation_logs
  FOR EACH ROW EXECUTE FUNCTION public.link_ai_monthly_reservation();
CREATE INDEX ai_generation_logs_user_created_meter_idx
  ON public.ai_generation_logs (user_id, created_at) WHERE provider_meter IS NOT NULL;
ALTER TABLE public.ai_monthly_allowance_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_monthly_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_monthly_allowance_config, public.ai_monthly_reservations FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON public.ai_monthly_allowance_config TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.ai_monthly_reservations TO service_role;

-- Attribute queued work to acceptance, and retain already measured USD calls
-- from before the reservations rollout in their original month.
CREATE FUNCTION public.ai_monthly_ledger(p_user_id uuid, p_period date)
RETURNS TABLE (spent numeric, held numeric, calls bigint, incomplete bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH events AS (
    SELECT l.provider_cost_usd AS cost, l.allowance_reservation_id AS reservation_id
    FROM public.ai_generation_logs l
    LEFT JOIN public.ai_monthly_reservations r ON r.id = l.allowance_reservation_id
    WHERE l.user_id = p_user_id AND l.provider_meter IS NOT NULL
      AND (r.period = p_period OR (r.id IS NULL
        AND l.created_at >= p_period::timestamp AT TIME ZONE 'UTC'
        AND l.created_at < (p_period + interval '1 month') AT TIME ZONE 'UTC'))
  )
  SELECT coalesce(sum(e.cost), 0),
    (SELECT coalesce(sum(r.reserved_usd), 0)
     FROM public.ai_monthly_reservations r
     WHERE r.user_id = p_user_id AND r.period = p_period AND NOT r.released
       AND NOT EXISTS (SELECT 1 FROM events paid WHERE paid.reservation_id = r.id AND paid.cost IS NOT NULL)),
    count(*), count(*) FILTER (WHERE e.cost IS NULL)
  FROM events e;
$$;

CREATE FUNCTION public.reserve_ai_monthly(p_user_id uuid, p_id uuid, p_input_bytes integer, p_output_limit integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_period date;
  v_amount numeric;
  v_allowance numeric;
  v_existing public.ai_monthly_reservations;
  v_ledger record;
BEGIN
  IF p_user_id IS NULL OR p_id IS NULL OR p_input_bytes IS NULL OR p_output_limit IS NULL
    OR p_input_bytes NOT BETWEEN 0 AND 65536 OR p_output_limit NOT BETWEEN 1 AND 8192 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid AI reservation';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 94753));
  SELECT * INTO v_existing FROM public.ai_monthly_reservations WHERE id = p_id;
  IF FOUND THEN
    IF v_existing.user_id <> p_user_id OR v_existing.released THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Invalid reservation owner or state';
    END IF;
    RETURN true;
  END IF;
  v_period := date_trunc('month', clock_timestamp() AT TIME ZONE 'UTC')::date;
  -- Upper bound for UTF-8 prompt data, repeated/escaped fields, static instructions
  -- and framing. Price all input at the highest Luna cache-write tariff.
  v_amount := ((p_input_bytes::numeric * 6 + 16384) * 250 + p_output_limit * 750) / 1000000000;
  SELECT allowance_usd INTO STRICT v_allowance FROM public.ai_monthly_allowance_config WHERE singleton;
  SELECT * INTO v_ledger FROM public.ai_monthly_ledger(p_user_id, v_period);
  IF v_ledger.spent + v_ledger.held + v_amount > v_allowance THEN RETURN false; END IF;
  INSERT INTO public.ai_monthly_reservations (id, user_id, period, reserved_usd)
    VALUES (p_id, p_user_id, v_period, v_amount);
  RETURN true;
END;
$$;

CREATE FUNCTION public.reserve_strategy_monthly()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NOT public.reserve_ai_monthly(NEW.requester_id, NEW.id, octet_length((NEW.source->'payload')::text), 8192) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0003', MESSAGE = 'Monthly AI allowance exceeded';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reserve_strategy_monthly BEFORE INSERT ON public.strategy_operations
  FOR EACH ROW EXECUTE FUNCTION public.reserve_strategy_monthly();

CREATE FUNCTION public.release_unstarted_strategy_monthly()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  UPDATE public.ai_monthly_reservations SET released = true WHERE id = OLD.id;
  RETURN NULL;
END;
$$;
CREATE TRIGGER release_unstarted_strategy_monthly AFTER UPDATE OF state ON public.strategy_operations
  FOR EACH ROW WHEN (OLD.state = 'queued' AND NEW.state IN ('failed','conflict'))
  EXECUTE FUNCTION public.release_unstarted_strategy_monthly();
CREATE TRIGGER release_deleted_queued_strategy_monthly AFTER DELETE ON public.strategy_operations
  FOR EACH ROW WHEN (OLD.state = 'queued')
  EXECUTE FUNCTION public.release_unstarted_strategy_monthly();

CREATE FUNCTION public.get_my_ai_allowance()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid();
  v_period date := date_trunc('month', now() AT TIME ZONE 'UTC')::date;
  v_ledger record;
  v_allowance numeric;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.people WHERE user_id = v_user AND visible IS TRUE) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AI allowance unavailable';
  END IF;
  SELECT allowance_usd INTO STRICT v_allowance FROM public.ai_monthly_allowance_config WHERE singleton;
  SELECT * INTO v_ledger FROM public.ai_monthly_ledger(v_user, v_period);
  RETURN jsonb_build_object(
    'period', to_char(v_period, 'YYYY-MM'),
    'percentage', least(100, round(v_ledger.spent / v_allowance * 100, 2)),
    'total_generations', v_ledger.calls,
    'incomplete_generations', v_ledger.incomplete,
    'has_pending', v_ledger.held > 0
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ai_monthly_ledger(uuid,date),
  public.reserve_ai_monthly(uuid,uuid,integer,integer), public.reserve_strategy_monthly(),
  public.release_unstarted_strategy_monthly(), public.link_ai_monthly_reservation(), public.get_my_ai_allowance()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_monthly_ledger(uuid,date),
  public.reserve_ai_monthly(uuid,uuid,integer,integer), public.reserve_strategy_monthly(),
  public.release_unstarted_strategy_monthly(), public.link_ai_monthly_reservation() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_my_ai_allowance() TO authenticated;
COMMIT;
