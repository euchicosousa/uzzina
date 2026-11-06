BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.strategy_operations
  ADD COLUMN model_id text NOT NULL DEFAULT 'gpt-6-luna'
  CHECK (model_id IN ('gpt-6-luna','claude-haiku-5-5','claude-sonnet-5-5','claude-opus-5-5'));

CREATE OR REPLACE FUNCTION public.reserve_strategy_monthly()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NOT public.reserve_ai_monthly(NEW.requester_id, NEW.id, octet_length((NEW.source->'payload')::text), 8192, NEW.model_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0003', MESSAGE = 'Monthly AI allowance exceeded';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.accept_strategy_operation_with_model(p_user_id uuid,p_action_id uuid,p_operation_id uuid,p_expected_version timestamp,p_model text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_action public.actions; v_source jsonb;
BEGIN
 IF p_model IS NULL OR p_model NOT IN ('gpt-6-luna','claude-haiku-5-5','claude-sonnet-5-5','claude-opus-5-5') THEN
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

CREATE FUNCTION public.claim_strategy_operation_with_model(p_lease_id uuid,p_limit integer,p_model_aware boolean DEFAULT true) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_allowed boolean;
BEGIN
 IF p_lease_id IS NULL OR p_limit NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid claim'; END IF;
 UPDATE public.strategy_runtime SET last_worker_at=clock_timestamp() WHERE singleton;
 -- A lost provider response is deliberately not regenerated after a restart.
 UPDATE public.strategy_operations SET state='uncertain',error_code='PROVIDER_UNCERTAIN',updated_at=clock_timestamp()
 WHERE state='generating' AND lease_until<clock_timestamp();
 SELECT * INTO v_operation FROM public.strategy_operations
 WHERE state IN ('queued','generated') AND (p_model_aware OR model_id = 'gpt-6-luna') AND (lease_until IS NULL OR lease_until<clock_timestamp())
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

-- Old deployments must never claim a Claude operation and execute it as Luna.
CREATE OR REPLACE FUNCTION public.claim_strategy_operation(p_lease_id uuid,p_limit integer)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT public.claim_strategy_operation_with_model(p_lease_id,p_limit,false);
$$;

REVOKE ALL ON FUNCTION public.accept_strategy_operation_with_model(uuid,uuid,uuid,timestamp,text),
  public.claim_strategy_operation_with_model(uuid,integer,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_strategy_operation_with_model(uuid,uuid,uuid,timestamp,text),
  public.claim_strategy_operation_with_model(uuid,integer,boolean) TO service_role;
COMMIT;
