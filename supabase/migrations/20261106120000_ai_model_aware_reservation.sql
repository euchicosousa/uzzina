BEGIN;
SET LOCAL lock_timeout = '5s';

-- The reservation priced every call at the highest GPT-6 Luna tariff. Claude models
-- cost more per token, so the same bound would under-reserve and let a month exceed its
-- allowance. The model now selects the bound; the default keeps the previous behavior,
-- so existing 4-argument callers (including reserve_strategy_monthly) are unchanged.
--
-- Rates are nano-USD per token and must match server/ai-model-catalog.ts: the highest
-- input-side tariff (5-minute cache write, long band where one exists) and the highest
-- output tariff of each model.
DROP FUNCTION public.reserve_ai_monthly(uuid,uuid,integer,integer);
CREATE FUNCTION public.reserve_ai_monthly(
  p_user_id uuid,
  p_id uuid,
  p_input_bytes integer,
  p_output_limit integer,
  p_model text DEFAULT 'gpt-6-luna'
)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_period date;
  v_amount numeric;
  v_allowance numeric;
  v_input_rate numeric;
  v_output_rate numeric;
  v_existing public.ai_monthly_reservations;
  v_ledger record;
BEGIN
  IF p_user_id IS NULL OR p_id IS NULL OR p_input_bytes IS NULL OR p_output_limit IS NULL
    OR p_input_bytes NOT BETWEEN 0 AND 65536 OR p_output_limit NOT BETWEEN 1 AND 8192 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid AI reservation';
  END IF;
  CASE p_model
    WHEN 'gpt-6-luna' THEN v_input_rate := 250; v_output_rate := 750;
    WHEN 'claude-haiku-5-5' THEN v_input_rate := 625; v_output_rate := 2500;
    WHEN 'claude-sonnet-5-5' THEN v_input_rate := 2500; v_output_rate := 10000;
    WHEN 'claude-opus-5-5' THEN v_input_rate := 5000; v_output_rate := 20000;
    ELSE RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Unknown AI model';
  END CASE;
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
  -- and framing. Price all input at the model's highest input-side tariff.
  v_amount := ((p_input_bytes::numeric * 6 + 16384) * v_input_rate + p_output_limit * v_output_rate) / 1000000000;
  SELECT allowance_usd INTO STRICT v_allowance FROM public.ai_monthly_allowance_config WHERE singleton;
  SELECT * INTO v_ledger FROM public.ai_monthly_ledger(p_user_id, v_period);
  IF v_ledger.spent + v_ledger.held + v_amount > v_allowance THEN RETURN false; END IF;
  INSERT INTO public.ai_monthly_reservations (id, user_id, period, reserved_usd)
    VALUES (p_id, p_user_id, v_period, v_amount);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_ai_monthly(uuid,uuid,integer,integer,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_monthly(uuid,uuid,integer,integer,text) TO service_role;
COMMIT;
