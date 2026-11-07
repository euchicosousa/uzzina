BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. Tabela canônica de modelos de IA
CREATE TABLE IF NOT EXISTS public.ai_models (
  id text PRIMARY KEY,
  name text NOT NULL,
  provider text NOT NULL,
  level smallint NOT NULL CHECK (level BETWEEN 1 AND 5),
  input_rate numeric NOT NULL,
  output_rate numeric NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- Garante no máximo um modelo como padrão do sistema
CREATE UNIQUE INDEX IF NOT EXISTS ai_models_single_default_idx
  ON public.ai_models (is_default) WHERE is_default = true;

-- Carga dos 7 modelos canônicos a partir do catálogo único
INSERT INTO public.ai_models (id, name, provider, level, input_rate, output_rate, is_default, enabled)
VALUES
  ('gpt-6-luna', 'GPT-6 Luna', 'openai', 1, 250, 750, true, true),
  ('gpt-6.1-terra', 'GPT-6.1 Terra', 'openai', 2, 2500, 7500, false, true),
  ('gpt-6.1-sol', 'GPT-6.1 Sol', 'openai', 3, 5000, 15000, false, true),
  ('gpt-6-astra', 'GPT-6 Astra', 'openai', 5, 25000, 75000, false, true),
  ('claude-haiku-5-5', 'Claude Haiku 5.5', 'anthropic', 1, 625, 2500, false, true),
  ('claude-sonnet-5-5', 'Claude Sonnet 5.5', 'anthropic', 3, 2500, 10000, false, true),
  ('claude-opus-5-5', 'Claude Opus 5.5', 'anthropic', 4, 5000, 20000, false, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  level = EXCLUDED.level,
  input_rate = EXCLUDED.input_rate,
  output_rate = EXCLUDED.output_rate,
  is_default = EXCLUDED.is_default,
  enabled = EXCLUDED.enabled,
  updated_at = clock_timestamp();

-- Permissões e RLS. O navegador nunca lê esta tabela: as APIs e o worker usam a
-- service role, e update_my_preferences é SECURITY DEFINER. Por isso só a
-- service role lê; anon e authenticated ficam sem acesso e sem policy (RLS ligada).
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_models_select_all ON public.ai_models;
REVOKE ALL ON public.ai_models FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.ai_models TO service_role;

-- 2. Chave estrangeira em strategy_operations em vez de CHECK com lista hardcoded
ALTER TABLE public.strategy_operations
  DROP CONSTRAINT IF EXISTS strategy_operations_model_id_check;

ALTER TABLE public.strategy_operations
  DROP CONSTRAINT IF EXISTS strategy_operations_model_id_fkey,
  ADD CONSTRAINT strategy_operations_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.ai_models(id);

-- 3. accept_strategy_operation_with_model: valida contra a tabela ai_models
CREATE OR REPLACE FUNCTION public.accept_strategy_operation_with_model(
  p_user_id uuid,
  p_action_id uuid,
  p_operation_id uuid,
  p_expected_version timestamp,
  p_model text
)
RETURNS jsonb LANGUAGE plpgsql SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_action public.actions; v_source jsonb;
BEGIN
 IF p_model IS NULL OR NOT EXISTS (SELECT 1 FROM public.ai_models WHERE id = p_model AND enabled) THEN
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

-- 4. reserve_ai_monthly: lê as taxas de public.ai_models em vez da lista fixa
CREATE OR REPLACE FUNCTION public.reserve_ai_monthly(p_user_id uuid, p_id uuid, p_input_bytes integer, p_output_limit integer, p_model text DEFAULT 'gpt-6-luna'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
  SELECT input_rate, output_rate INTO v_input_rate, v_output_rate
    FROM public.ai_models WHERE id = p_model AND enabled;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Unknown AI model';
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
  -- and framing. Price all input at the model's highest input-side tariff.
  v_amount := ((p_input_bytes::numeric * 6 + 16384) * v_input_rate + p_output_limit * v_output_rate) / 1000000000;
  SELECT allowance_usd INTO STRICT v_allowance FROM public.ai_monthly_allowance_config WHERE singleton;
  SELECT * INTO v_ledger FROM public.ai_monthly_ledger(p_user_id, v_period);
  IF v_ledger.spent + v_ledger.held + v_amount > v_allowance THEN RETURN false; END IF;
  INSERT INTO public.ai_monthly_reservations (id, user_id, period, reserved_usd)
    VALUES (p_id, p_user_id, v_period, v_amount);
  RETURN true;
END;
$function$;

-- 5. claim_strategy_operation_with_model: sem lista de modelos em produção; mantida idêntica
CREATE OR REPLACE FUNCTION public.claim_strategy_operation_with_model(
  p_lease_id uuid,
  p_limit integer,
  p_model_aware boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_allowed boolean;
BEGIN
 IF p_lease_id IS NULL OR p_limit NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid claim'; END IF;
 UPDATE public.strategy_runtime SET last_worker_at=clock_timestamp() WHERE singleton;
 -- A lost provider response is deliberately not regenerated after a restart.
 UPDATE public.strategy_operations SET state='uncertain',error_code='PROVIDER_UNCERTAIN',updated_at=clock_timestamp()
 WHERE state='generating' AND lease_until<clock_timestamp();

 SELECT * INTO v_operation FROM public.strategy_operations
 WHERE state IN ('queued','generated')
   AND (p_model_aware OR model_id = 'gpt-6-luna')
   AND (lease_until IS NULL OR lease_until<clock_timestamp())
 ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN NULL; END IF;
 IF NOT public.strategy_scope(v_operation.requester_id,v_operation.action_id) THEN
  UPDATE public.strategy_operations SET state='failed',error_code='ACCESS_REVOKED',updated_at=clock_timestamp() WHERE id=v_operation.id;
  RETURN NULL;
 END IF;
 IF public.strategy_source(v_operation.action_id,v_operation.requester_id) IS DISTINCT FROM v_operation.apply_source THEN
  UPDATE public.strategy_operations SET state='conflict',error_code='SOURCE_CHANGED',updated_at=clock_timestamp() WHERE id=v_operation.id;
  RETURN NULL;
 END IF;
 IF v_operation.result IS NULL AND NOT v_operation.quota_reserved THEN
  v_allowed:=public.consume_ai_usage(v_operation.requester_id,p_limit);
  IF NOT v_allowed THEN
   UPDATE public.strategy_operations SET state='failed',error_code='QUOTA_EXCEEDED',updated_at=clock_timestamp() WHERE id=v_operation.id;
   RETURN NULL;
  END IF;
 END IF;
 UPDATE public.strategy_operations SET state=CASE WHEN result IS NULL THEN 'generating' ELSE 'generated' END,
 quota_reserved=true,lease_id=p_lease_id,lease_until=clock_timestamp()+interval '150 seconds',updated_at=clock_timestamp()
 WHERE id=v_operation.id RETURNING * INTO v_operation;
 RETURN jsonb_build_object('id',v_operation.id,'leaseId',v_operation.lease_id,'payload',(v_operation.source->'payload') || jsonb_build_object('model',v_operation.model_id),'result',v_operation.result);
END $$;

-- 6. update_my_preferences: valida chaves de modelos contra a tabela ai_models
CREATE OR REPLACE FUNCTION public.update_my_preferences(p_patch jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_key TEXT;
  v_value JSONB;
  v_mode TEXT;
  v_color TEXT;
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_patch IS NULL OR jsonb_typeof(p_patch) <> 'object' OR octet_length(p_patch::text) > 16384 THEN
    RAISE EXCEPTION 'Invalid preference patch' USING ERRCODE = '22023';
  END IF;
  FOR v_key, v_value IN SELECT * FROM jsonb_each(p_patch) LOOP
    CASE v_key
      WHEN 'theme' THEN
        IF jsonb_typeof(v_value) <> 'string' OR v_value #>> '{}' NOT IN ('light','dark','system') THEN
          RAISE EXCEPTION 'Invalid theme' USING ERRCODE = '22023';
        END IF;
      WHEN 'themeColorIndex' THEN
        IF jsonb_typeof(v_value) <> 'number' THEN RAISE EXCEPTION 'Invalid palette' USING ERRCODE = '22023'; END IF;
        IF (v_value::text)::numeric <> trunc((v_value::text)::numeric) OR (v_value::text)::numeric NOT BETWEEN -1 AND 11 THEN
          RAISE EXCEPTION 'Invalid palette' USING ERRCODE = '22023';
        END IF;
      WHEN 'followPartnerColor', 'showInstagramSidebar' THEN
        IF jsonb_typeof(v_value) <> 'boolean' THEN RAISE EXCEPTION 'Invalid preference flag' USING ERRCODE = '22023'; END IF;
      WHEN 'defaultViewVariant' THEN
        IF jsonb_typeof(v_value) <> 'string' OR v_value #>> '{}' NOT IN ('line','block','content') THEN
          RAISE EXCEPTION 'Invalid view' USING ERRCODE = '22023';
        END IF;
      WHEN 'defaultTodayView' THEN
        IF jsonb_typeof(v_value) <> 'string' OR v_value #>> '{}' NOT IN ('partners','kanban','categories','feed') THEN
          RAISE EXCEPTION 'Invalid Today view' USING ERRCODE = '22023';
        END IF;
      WHEN 'defaultStrategyModel', 'defaultContentModel', 'defaultCaptionModel' THEN
        IF jsonb_typeof(v_value) <> 'string' OR NOT EXISTS (
          SELECT 1 FROM public.ai_models WHERE id = (v_value #>> '{}') AND enabled
        ) THEN
          RAISE EXCEPTION 'Invalid AI model preference' USING ERRCODE = '22023';
        END IF;
      WHEN 'strategyModels', 'contentModels', 'captionModels' THEN
        IF jsonb_typeof(v_value) <> 'array' THEN
          RAISE EXCEPTION 'Invalid AI task models preference' USING ERRCODE = '22023';
        END IF;
        IF EXISTS (
          SELECT 1
          FROM jsonb_array_elements(v_value) AS item
          WHERE jsonb_typeof(item) <> 'string'
             OR NOT EXISTS (
               SELECT 1 FROM public.ai_models WHERE id = (item #>> '{}') AND enabled
             )
        ) THEN
          RAISE EXCEPTION 'Invalid AI model in task models preference' USING ERRCODE = '22023';
        END IF;
      WHEN 'customTheme' THEN
        IF v_value <> 'null'::jsonb THEN
          IF jsonb_typeof(v_value) <> 'object' THEN RAISE EXCEPTION 'Invalid custom theme' USING ERRCODE = '22023'; END IF;
          IF (SELECT count(*) FROM jsonb_object_keys(v_value)) <> 2 OR NOT v_value ?& ARRAY['light','dark'] THEN
            RAISE EXCEPTION 'Invalid custom theme' USING ERRCODE = '22023';
          END IF;
          FOREACH v_mode IN ARRAY ARRAY['light','dark'] LOOP
            IF jsonb_typeof(v_value -> v_mode) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid custom colors' USING ERRCODE = '22023'; END IF;
            IF (SELECT count(*) FROM jsonb_object_keys(v_value -> v_mode)) <> 4 THEN RAISE EXCEPTION 'Invalid custom colors' USING ERRCODE = '22023'; END IF;
            FOREACH v_color IN ARRAY ARRAY['primaryHex','primaryFgHex','bgHex','fgHex'] LOOP
              IF jsonb_typeof(v_value -> v_mode -> v_color) IS DISTINCT FROM 'string' OR
                 (v_value -> v_mode ->> v_color) !~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$' THEN
                RAISE EXCEPTION 'Invalid custom color' USING ERRCODE = '22023';
              END IF;
            END LOOP;
          END LOOP;
        END IF;
      ELSE RAISE EXCEPTION 'Unknown preference key' USING ERRCODE = '22023';
    END CASE;
  END LOOP;
  UPDATE public.people
    SET preferences = (CASE WHEN jsonb_typeof(preferences::jsonb) = 'object' THEN preferences::jsonb ELSE '{}'::jsonb END) || p_patch
    WHERE user_id::text = v_user_id::text AND visible = true
    RETURNING preferences::jsonb INTO v_result;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active member required' USING ERRCODE = '42501'; END IF;
  RETURN v_result;
END;
$$;

COMMIT;

