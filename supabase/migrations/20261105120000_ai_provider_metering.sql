BEGIN;
SET LOCAL lock_timeout = '5s';

-- Keep historical weighted measurements and add an independent provider ledger.
ALTER TABLE public.ai_generation_logs
  ADD COLUMN provider_call_id text,
  ADD COLUMN provider_meter jsonb,
  ADD COLUMN provider_cost_usd numeric(18,9) CHECK (provider_cost_usd >= 0),
  DROP CONSTRAINT ai_generation_logs_strategy_operation_id_key;

CREATE INDEX ai_generation_logs_strategy_operation_idx
  ON public.ai_generation_logs (strategy_operation_id)
  WHERE strategy_operation_id IS NOT NULL;
CREATE UNIQUE INDEX ai_generation_logs_provider_call_idx
  ON public.ai_generation_logs ((provider_meter->>'provider'), provider_call_id)
  WHERE provider_call_id IS NOT NULL;

-- The trailing default keeps older API deployments compatible during rollout.
DROP FUNCTION public.record_ai_generation(uuid,text,text,integer,integer,integer,integer,uuid,uuid,uuid);
CREATE FUNCTION public.record_ai_generation(
  p_event_id uuid,
  p_intent text,
  p_model text,
  p_prompt_tokens integer DEFAULT NULL,
  p_completion_tokens integer DEFAULT NULL,
  p_total_tokens integer DEFAULT NULL,
  p_cached_tokens integer DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_operation_id uuid DEFAULT NULL,
  p_lease_id uuid DEFAULT NULL,
  p_meter jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := p_user_id;
  v_measured boolean;
  v_units numeric;
BEGIN
  IF p_event_id IS NULL OR p_intent IS NULL OR length(p_intent) NOT BETWEEN 1 AND 100
    OR p_model IS NULL OR length(p_model) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid usage event';
  END IF;
  IF p_operation_id IS NOT NULL THEN
    IF p_lease_id IS NULL OR p_intent <> 'ai-strategy'
      OR p_event_id <> (CASE WHEN p_meter IS NULL THEN p_operation_id ELSE p_lease_id END) THEN
      RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid strategy usage event';
    END IF;
    SELECT requester_id INTO v_user_id FROM public.strategy_operations
    WHERE id=p_operation_id AND lease_id=p_lease_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Strategy lease unavailable';
    END IF;
  ELSIF p_lease_id IS NOT NULL OR v_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Usage identity required';
  END IF;
  v_measured := p_prompt_tokens IS NOT NULL AND p_completion_tokens IS NOT NULL
    AND p_prompt_tokens >= 0 AND p_completion_tokens >= 0
    AND (p_total_tokens IS NULL OR p_total_tokens::bigint = p_prompt_tokens::bigint+p_completion_tokens::bigint)
    AND (p_cached_tokens IS NULL OR (p_cached_tokens >= 0 AND p_cached_tokens <= p_prompt_tokens));
  -- Same internal convention as the existing API; cached/reasoning tokens are subsets.
  -- This is versioned usage weighting, not provider prices or a new billing policy.
  v_units := CASE WHEN v_measured THEN round((p_prompt_tokens::numeric + p_completion_tokens::numeric*2)/1000,2) ELSE NULL END;
  INSERT INTO public.ai_generation_logs (
    id,user_id,strategy_operation_id,intent,model,prompt_tokens,completion_tokens,
    total_tokens,cached_tokens,units_consumed,policy_version,measurement_status,
    provider_call_id, provider_meter, provider_cost_usd
  ) VALUES (
    p_event_id,v_user_id,p_operation_id,p_intent,p_model,p_prompt_tokens,p_completion_tokens,
    p_total_tokens,p_cached_tokens,v_units,'weighted_tokens_v1',CASE WHEN v_measured THEN 'measured' ELSE 'incomplete' END,
    p_meter->>'provider_id', p_meter - 'cost_nanos' - 'provider_id',
    (p_meter->>'cost_nanos')::numeric / 1000000000
  ) ON CONFLICT DO NOTHING;
  RETURN p_event_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_ai_generation(uuid,text,text,integer,integer,integer,integer,uuid,uuid,uuid,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ai_generation(uuid,text,text,integer,integer,integer,integer,uuid,uuid,uuid,jsonb) TO service_role;

COMMIT;
