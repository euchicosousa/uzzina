-- Ticket AI Usage: Agency AI consumption tracking and visibility in My Account.
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent text NOT NULL,
  model text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  units_consumed numeric(10, 2) NOT NULL DEFAULT 0
);

ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_generation_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.ai_generation_logs TO service_role;

CREATE OR REPLACE FUNCTION public.log_ai_generation(
  p_user_id uuid,
  p_intent text,
  p_model text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_total_tokens integer,
  p_units_consumed numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.ai_generation_logs (
    user_id,
    intent,
    model,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    units_consumed
  ) VALUES (
    p_user_id,
    p_intent,
    p_model,
    COALESCE(p_prompt_tokens, 0),
    COALESCE(p_completion_tokens, 0),
    COALESCE(p_total_tokens, 0),
    COALESCE(p_units_consumed, 0)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_ai_generation(uuid, text, text, integer, integer, integer, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_ai_generation(uuid, text, text, integer, integer, integer, numeric) TO service_role;

CREATE OR REPLACE FUNCTION public.get_agency_ai_usage()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_is_active boolean;
  v_month_start timestamptz;
  v_next_month timestamptz;
  v_total_units numeric;
  v_total_generations integer;
  v_ref_units numeric := 1000.0; -- Franquia mensal de referência da agência CNVT
  v_percentage numeric;
  v_tz text := 'America/Fortaleza';
  v_month_name text;
  v_year text;
  v_month_label text;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  SELECT visible INTO v_is_active
  FROM public.people
  WHERE user_id = v_caller_id;

  IF v_is_active IS NOT TRUE THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Inactive or unauthorized member';
  END IF;

  v_month_start := date_trunc('month', clock_timestamp() AT TIME ZONE v_tz) AT TIME ZONE v_tz;
  v_next_month := date_trunc('month', (clock_timestamp() AT TIME ZONE v_tz) + interval '1 month') AT TIME ZONE v_tz;

  v_year := to_char(clock_timestamp() AT TIME ZONE v_tz, 'YYYY');
  v_month_name := CASE to_char(clock_timestamp() AT TIME ZONE v_tz, 'MM')
    WHEN '01' THEN 'Janeiro'
    WHEN '02' THEN 'Fevereiro'
    WHEN '03' THEN 'Março'
    WHEN '04' THEN 'Abril'
    WHEN '05' THEN 'Maio'
    WHEN '06' THEN 'Junho'
    WHEN '07' THEN 'Julho'
    WHEN '08' THEN 'Agosto'
    WHEN '09' THEN 'Setembro'
    WHEN '10' THEN 'Outubro'
    WHEN '11' THEN 'Novembro'
    WHEN '12' THEN 'Dezembro'
  END;
  v_month_label := v_month_name || ' de ' || v_year;

  SELECT
    COALESCE(SUM(units_consumed), 0),
    COUNT(*)
  INTO v_total_units, v_total_generations
  FROM public.ai_generation_logs
  WHERE created_at >= v_month_start AND created_at < v_next_month;

  IF v_ref_units > 0 THEN
    v_percentage := round((v_total_units / v_ref_units) * 100, 1);
  ELSE
    v_percentage := 0;
  END IF;

  RETURN jsonb_build_object(
    'period', v_month_label,
    'percentage', v_percentage,
    'total_units', v_total_units,
    'reference_units', v_ref_units,
    'total_generations', v_total_generations,
    'updated_at', clock_timestamp()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_agency_ai_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_agency_ai_usage() TO authenticated, service_role;

