BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.strategy_operations
  DROP CONSTRAINT strategy_operations_model_id_check,
  ADD CONSTRAINT strategy_operations_model_id_check CHECK (model_id IN ('gpt-6-luna','gpt-6.1-terra','gpt-6.1-sol','gpt-6-astra','claude-haiku-5-5','claude-sonnet-5-5','claude-opus-5-5'));

CREATE OR REPLACE FUNCTION public.reserve_ai_monthly(
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
    WHEN 'gpt-6.1-terra' THEN v_input_rate := 2500; v_output_rate := 7500;
    WHEN 'gpt-6.1-sol' THEN v_input_rate := 5000; v_output_rate := 15000;
    WHEN 'gpt-6-astra' THEN v_input_rate := 25000; v_output_rate := 75000;
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

CREATE OR REPLACE FUNCTION public.accept_strategy_operation_with_model(p_user_id uuid,p_action_id uuid,p_operation_id uuid,p_expected_version timestamp,p_model text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_action public.actions; v_source jsonb;
BEGIN
 IF p_model IS NULL OR p_model NOT IN ('gpt-6-luna','gpt-6.1-terra','gpt-6.1-sol','gpt-6-astra','claude-haiku-5-5','claude-sonnet-5-5','claude-opus-5-5') THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Unknown strategy model';
 END IF;
 IF NOT public.strategy_scope(p_user_id,p_action_id) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Action unavailable'; END IF;
 SELECT * INTO v_operation FROM public.strategy_operations WHERE id=p_operation_id;
 IF FOUND THEN
  IF v_operation.requester_id<>p_user_id OR v_operation.action_id<>p_action_id THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Operation unavailable'; END IF;
  RETURN public.strategy_public_operation(v_operation);
 END IF;
 IF NOT public.strategy_ready() THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='Worker unavailable'; END IF;
 SELECT * INTO v_action FROM public.actions WHERE id=p_action_id FOR UPDATE;
 PERFORM 1 FROM public.people WHERE user_id=p_user_id FOR SHARE;
 PERFORM 1 FROM public.partners WHERE slug=ANY(v_action.partners) FOR SHARE;
 IF NOT public.strategy_scope(p_user_id,p_action_id) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Action unavailable'; END IF;
 SELECT * INTO v_operation FROM public.strategy_operations WHERE id=p_operation_id;
 IF FOUND THEN
  IF v_operation.requester_id<>p_user_id OR v_operation.action_id<>p_action_id THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Operation unavailable'; END IF;
  RETURN public.strategy_public_operation(v_operation);
 END IF;
 IF v_action.updated_at IS DISTINCT FROM p_expected_version THEN RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='Action changed'; END IF;
 IF EXISTS(SELECT 1 FROM public.strategy_operations WHERE action_id=p_action_id AND state IN ('queued','generating','generated')) THEN
  RAISE EXCEPTION USING ERRCODE='23505',MESSAGE='Operation already pending';
 END IF;
 v_source:=public.strategy_source(p_action_id,p_user_id);
 IF v_source IS NULL OR coalesce(length(trim(v_source#>>'{payload,partner_name}')),0) NOT BETWEEN 1 AND 500
 OR coalesce(length(trim(v_source#>>'{payload,category}')),0) NOT BETWEEN 1 AND 100
 OR length(v_source#>>'{payload,title}')>500 OR length(v_source#>>'{payload,description}')>10000
 OR length(v_source#>>'{payload,partner_context}')>10000 OR octet_length((v_source->'payload')::text)>65536 THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid editorial source';
 END IF;
 INSERT INTO public.strategy_operations(id,action_id,requester_id,state,source,apply_source,model_id)
 VALUES(p_operation_id,p_action_id,p_user_id,'queued',v_source,v_source,p_model) RETURNING * INTO v_operation;
 RETURN public.strategy_public_operation(v_operation);
END $$;

COMMIT;
