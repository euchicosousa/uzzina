-- Ticket 14: UTC daily attempt quota, consumed before calling the provider.
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_day date NOT NULL,
  attempts integer NOT NULL CHECK (attempts BETWEEN 1 AND 10000),
  PRIMARY KEY (user_id, usage_day)
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_usage FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_ai_usage(p_user_id uuid, p_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
  v_day date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
BEGIN
  IF p_user_id IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid quota arguments';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.people WHERE user_id = p_user_id AND visible IS TRUE) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Inactive member';
  END IF;
  INSERT INTO public.ai_usage (user_id, usage_day, attempts)
  VALUES (p_user_id, v_day, 1)
  ON CONFLICT (user_id, usage_day) DO UPDATE
    SET attempts = public.ai_usage.attempts + 1
    WHERE public.ai_usage.attempts < p_limit
  RETURNING attempts INTO v_count;
  RETURN v_count IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_usage(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_usage(uuid, integer) TO service_role;
