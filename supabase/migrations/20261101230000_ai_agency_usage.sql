-- Prepared but not previously applied: complete agency accounting without changing quota.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.ai_usage_metering (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reference_units numeric NOT NULL DEFAULT 1000 CHECK (reference_units > 0),
  policy_version text NOT NULL DEFAULT 'weighted_tokens_v1'
    CHECK (policy_version = 'weighted_tokens_v1')
);
INSERT INTO public.ai_usage_metering(singleton) VALUES (true);
ALTER TABLE public.ai_usage_metering ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_usage_metering FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.ai_usage_metering TO service_role;

CREATE TABLE public.ai_generation_logs (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_operation_id uuid UNIQUE REFERENCES public.strategy_operations(id) ON DELETE SET NULL,
  intent text NOT NULL CHECK (length(intent) BETWEEN 1 AND 100),
  model text NOT NULL CHECK (length(model) BETWEEN 1 AND 200),
  prompt_tokens integer CHECK (prompt_tokens >= 0),
  completion_tokens integer CHECK (completion_tokens >= 0),
  total_tokens integer CHECK (total_tokens >= 0),
  cached_tokens integer CHECK (cached_tokens >= 0),
  units_consumed numeric(16,2),
  policy_version text NOT NULL CHECK (policy_version = 'weighted_tokens_v1'),
  measurement_status text NOT NULL CHECK (measurement_status IN ('measured','incomplete'))
);
CREATE INDEX ai_generation_logs_created_at_idx ON public.ai_generation_logs(created_at);
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_generation_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.ai_generation_logs TO service_role;

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
  p_lease_id uuid DEFAULT NULL
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
    IF p_lease_id IS NULL OR p_event_id <> p_operation_id OR p_intent <> 'ai-strategy' THEN
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
    total_tokens,cached_tokens,units_consumed,policy_version,measurement_status
  ) VALUES (
    p_event_id,v_user_id,p_operation_id,p_intent,p_model,p_prompt_tokens,p_completion_tokens,
    p_total_tokens,p_cached_tokens,v_units,'weighted_tokens_v1',CASE WHEN v_measured THEN 'measured' ELSE 'incomplete' END
  ) ON CONFLICT (id) DO NOTHING;
  RETURN p_event_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_ai_generation(uuid,text,text,integer,integer,integer,integer,uuid,uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ai_generation(uuid,text,text,integer,integer,integer,integer,uuid,uuid,uuid) TO service_role;

CREATE FUNCTION public.get_agency_ai_usage()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_tz text := 'America/Fortaleza';
  v_start timestamptz;
  v_end timestamptz;
  v_meter public.ai_usage_metering;
  v_units numeric;
  v_count integer;
  v_incomplete integer;
  v_month integer;
  v_label text;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.people WHERE user_id=auth.uid() AND visible IS TRUE
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Active member required';
  END IF;
  SELECT * INTO STRICT v_meter FROM public.ai_usage_metering WHERE singleton;
  v_start := date_trunc('month', v_now AT TIME ZONE v_tz) AT TIME ZONE v_tz;
  v_end := (date_trunc('month', v_now AT TIME ZONE v_tz)+interval '1 month') AT TIME ZONE v_tz;
  v_month := extract(month FROM v_now AT TIME ZONE v_tz)::integer;
  v_label := (ARRAY['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'])[v_month]
    ||' de '||to_char(v_now AT TIME ZONE v_tz,'YYYY');
  SELECT coalesce(sum(units_consumed) FILTER (WHERE measurement_status='measured'),0),count(*),
    count(*) FILTER (WHERE measurement_status='incomplete')
    INTO v_units,v_count,v_incomplete
    FROM public.ai_generation_logs WHERE created_at>=v_start AND created_at<v_end;
  RETURN jsonb_build_object(
    'period',v_label,'percentage',least(100,round(v_units/v_meter.reference_units*100,2)),
    'total_units',v_units,'reference_units',v_meter.reference_units,'total_generations',v_count,
    'incomplete_generations',v_incomplete,'measurement_started_at',v_meter.started_at,
    'partial_period',v_meter.started_at>v_start,'updated_at',v_now
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_agency_ai_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_agency_ai_usage() TO authenticated;

COMMENT ON TABLE public.ai_generation_logs IS 'Service-only provider usage. Event IDs deduplicate recording retries; no prompts or provider prices are stored.';
COMMENT ON TABLE public.ai_usage_metering IS 'Single-agency CNVT internal monthly reference and metering start; private to the service role and authorized aggregate.';
COMMENT ON FUNCTION public.record_ai_generation(uuid,text,text,integer,integer,integer,integer,uuid,uuid,uuid) IS 'Service-only idempotent accounting. Strategy identity comes from its persisted lease. Does not consume or alter technical quota.';
COMMIT;
