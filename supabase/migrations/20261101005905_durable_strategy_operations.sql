-- Durable strategy work is private to authenticated server endpoints.
CREATE TABLE public.strategy_operations (
 id uuid PRIMARY KEY,
 action_id uuid NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
 requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 state text NOT NULL CHECK (state IN ('queued','generating','generated','succeeded','failed','conflict','uncertain')),
 source jsonb NOT NULL,
 apply_source jsonb NOT NULL,
 result jsonb,
 error_code text,
 quota_reserved boolean NOT NULL DEFAULT false,
 write_attempts integer NOT NULL DEFAULT 0 CHECK(write_attempts BETWEEN 0 AND 5),
 lease_id uuid,
 lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX strategy_operations_pending ON public.strategy_operations(created_at) WHERE state IN ('queued','generated','generating');
CREATE INDEX strategy_operations_owner_action ON public.strategy_operations(requester_id,action_id,created_at DESC);
CREATE UNIQUE INDEX strategy_operations_one_active ON public.strategy_operations(action_id) WHERE state IN ('queued','generating','generated');
ALTER TABLE public.strategy_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.strategy_operations FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.strategy_operations TO service_role;

CREATE TABLE public.strategy_runtime (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 last_worker_at timestamptz
);
INSERT INTO public.strategy_runtime(singleton) VALUES(true);
ALTER TABLE public.strategy_runtime ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.strategy_runtime FROM PUBLIC,anon,authenticated;
GRANT SELECT,UPDATE ON public.strategy_runtime TO service_role;

CREATE FUNCTION public.strategy_scope(p_user_id uuid,p_action_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.people me JOIN public.actions a ON a.id=p_action_id
 WHERE me.user_id=p_user_id AND me.visible IS TRUE AND a.archived IS NOT TRUE
 AND EXISTS(SELECT 1 FROM public.partners p WHERE p.slug=ANY(a.partners) AND p.archived IS FALSE
   AND (me.admin IS TRUE OR (p_user_id=ANY(p.users_ids) AND p_user_id=ANY(a.responsibles)))));
$$;

CREATE FUNCTION public.strategy_source(p_action_id uuid,p_user_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object(
 'action',jsonb_build_object('title',a.title,'description',a.description,'content_description',a.content_description,
   'category',a.category,'partners',a.partners,'strategies',a.strategies),
 'partner',jsonb_build_object('id',p.id,'title',p.title,'context',p.context),
 'payload',jsonb_build_object('intent','ai-strategy','title',coalesce(a.title,''),
   'description','DESCRIÇÃO: '||coalesce(a.description,'')||' DESCRIÇÃO DO CONTEÚDO: '||coalesce(a.content_description,''),
   'partner_name',btrim(p.title),'partner_context',coalesce(p.context,'')||' — '||coalesce(a.category,''),'category',btrim(a.category)))
 FROM public.actions a CROSS JOIN LATERAL (
  SELECT partner.* FROM unnest(a.partners) WITH ORDINALITY AS entry(slug,position)
  JOIN public.partners partner ON partner.slug=entry.slug AND partner.archived IS FALSE
  WHERE EXISTS(SELECT 1 FROM public.people me WHERE me.user_id=p_user_id AND me.visible IS TRUE
    AND (me.admin IS TRUE OR p_user_id=ANY(partner.users_ids))) ORDER BY entry.position LIMIT 1
 ) p WHERE a.id=p_action_id;
$$;

CREATE FUNCTION public.strategy_ready() RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.strategy_runtime WHERE singleton AND last_worker_at>clock_timestamp()-interval '2 minutes');
$$;

CREATE FUNCTION public.strategy_public_operation(p_operation public.strategy_operations) RETURNS jsonb
LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('id',p_operation.id,'actionId',p_operation.action_id,'state',p_operation.state,
 'result',p_operation.result,'errorCode',p_operation.error_code,'createdAt',p_operation.created_at,'updatedAt',p_operation.updated_at);
$$;

CREATE FUNCTION public.accept_strategy_operation(p_user_id uuid,p_action_id uuid,p_operation_id uuid,p_expected_version timestamp)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_action public.actions; v_source jsonb;
BEGIN
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
 INSERT INTO public.strategy_operations(id,action_id,requester_id,state,source,apply_source)
 VALUES(p_operation_id,p_action_id,p_user_id,'queued',v_source,v_source) RETURNING * INTO v_operation;
 RETURN public.strategy_public_operation(v_operation);
END $$;

CREATE FUNCTION public.read_strategy_operation(p_user_id uuid,p_action_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations;
BEGIN
 IF NOT public.strategy_scope(p_user_id,p_action_id) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Action unavailable'; END IF;
 SELECT * INTO v_operation FROM public.strategy_operations WHERE action_id=p_action_id AND requester_id=p_user_id ORDER BY created_at DESC,id DESC LIMIT 1;
 IF NOT FOUND THEN RETURN NULL; END IF;
 RETURN public.strategy_public_operation(v_operation);
END $$;

CREATE FUNCTION public.claim_strategy_operation(p_lease_id uuid,p_limit integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_allowed boolean;
BEGIN
 IF p_lease_id IS NULL OR p_limit NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid claim'; END IF;
 UPDATE public.strategy_runtime SET last_worker_at=clock_timestamp() WHERE singleton;
 -- A lost provider response is deliberately not regenerated after a restart.
 UPDATE public.strategy_operations SET state='uncertain',error_code='PROVIDER_UNCERTAIN',updated_at=clock_timestamp()
 WHERE state='generating' AND lease_until<clock_timestamp();
 SELECT * INTO v_operation FROM public.strategy_operations
 WHERE state IN ('queued','generated') AND (lease_until IS NULL OR lease_until<clock_timestamp())
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
 RETURN jsonb_build_object('id',v_operation.id,'leaseId',v_operation.lease_id,'payload',v_operation.source->'payload','result',v_operation.result);
END $$;

CREATE FUNCTION public.store_strategy_result(p_operation_id uuid,p_lease_id uuid,p_result jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations;
BEGIN
 IF jsonb_typeof(p_result) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid strategies'; END IF;
 IF jsonb_array_length(p_result)<>5 OR EXISTS(
  SELECT 1 FROM jsonb_array_elements(p_result) element CROSS JOIN unnest(ARRAY['headline','angulo','racional','direcionamento']) field
  WHERE jsonb_typeof(element->field) IS DISTINCT FROM 'string' OR length(trim(element->>field)) NOT BETWEEN 1 AND 50000
 ) THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid strategies'; END IF;
 SELECT * INTO v_operation FROM public.strategy_operations WHERE id=p_operation_id FOR UPDATE;
 IF NOT FOUND OR v_operation.lease_id IS DISTINCT FROM p_lease_id OR v_operation.state NOT IN ('generating','uncertain') OR v_operation.result IS NOT NULL THEN
  RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='Stale operation lease';
 END IF;
 PERFORM 1 FROM public.actions WHERE id=v_operation.action_id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.strategy_operations WHERE action_id=v_operation.action_id AND created_at>v_operation.created_at) THEN
  UPDATE public.strategy_operations SET result=p_result,state='conflict',error_code='NEWER_OPERATION',updated_at=clock_timestamp() WHERE id=p_operation_id;
 ELSE
  UPDATE public.strategy_operations SET result=p_result,state='generated',error_code=NULL,updated_at=clock_timestamp() WHERE id=p_operation_id;
 END IF;
END $$;

CREATE FUNCTION public.finish_strategy_operation(p_operation_id uuid,p_lease_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations;
BEGIN
 SELECT * INTO v_operation FROM public.strategy_operations WHERE id=p_operation_id FOR UPDATE;
 IF NOT FOUND OR v_operation.lease_id IS DISTINCT FROM p_lease_id THEN RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='Stale operation lease'; END IF;
 IF v_operation.state IN ('succeeded','conflict','failed') THEN RETURN public.strategy_public_operation(v_operation); END IF;
 IF v_operation.state<>'generated' OR v_operation.result IS NULL THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='Result unavailable'; END IF;
 PERFORM 1 FROM public.actions WHERE id=v_operation.action_id FOR UPDATE;
 PERFORM 1 FROM public.people WHERE user_id=v_operation.requester_id FOR SHARE;
 PERFORM 1 FROM public.partners p JOIN public.actions a ON a.id=v_operation.action_id WHERE p.slug=ANY(a.partners) FOR SHARE OF p;
 IF NOT public.strategy_scope(v_operation.requester_id,v_operation.action_id) THEN
  UPDATE public.strategy_operations SET state='failed',error_code='ACCESS_REVOKED',updated_at=clock_timestamp() WHERE id=v_operation.id RETURNING * INTO v_operation;
 ELSIF public.strategy_source(v_operation.action_id,v_operation.requester_id) IS DISTINCT FROM v_operation.apply_source THEN
  UPDATE public.strategy_operations SET state='conflict',error_code='SOURCE_CHANGED',updated_at=clock_timestamp() WHERE id=v_operation.id RETURNING * INTO v_operation;
 ELSE
  UPDATE public.actions SET strategies=v_operation.result WHERE id=v_operation.action_id;
  UPDATE public.strategy_operations SET state='succeeded',error_code=NULL,updated_at=clock_timestamp(),lease_until=NULL WHERE id=v_operation.id RETURNING * INTO v_operation;
 END IF;
 RETURN public.strategy_public_operation(v_operation);
END $$;

CREATE FUNCTION public.fail_strategy_operation(p_operation_id uuid,p_lease_id uuid,p_code text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF p_code NOT IN ('PROVIDER_UNCERTAIN','INVALID_RESULT','SAVE_FAILED') THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Invalid error'; END IF;
 UPDATE public.strategy_operations SET state=CASE WHEN result IS NOT NULL AND write_attempts<4 THEN 'generated'
 WHEN result IS NOT NULL THEN 'failed' WHEN p_code='PROVIDER_UNCERTAIN' THEN 'uncertain' ELSE 'failed' END,
 error_code=p_code,write_attempts=CASE WHEN result IS NOT NULL THEN least(write_attempts+1,5) ELSE write_attempts END,
 lease_until=CASE WHEN result IS NOT NULL THEN clock_timestamp()+interval '30 seconds' ELSE lease_until END,updated_at=clock_timestamp()
 WHERE id=p_operation_id AND lease_id=p_lease_id AND state NOT IN ('succeeded','conflict');
END $$;

CREATE FUNCTION public.retry_strategy_result(p_user_id uuid,p_operation_id uuid,p_expected_version timestamp,p_confirm_changed_source boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_operation public.strategy_operations; v_action public.actions; v_source jsonb;
BEGIN
 SELECT * INTO v_operation FROM public.strategy_operations WHERE id=p_operation_id FOR UPDATE;
 IF NOT FOUND OR v_operation.requester_id<>p_user_id OR NOT public.strategy_scope(p_user_id,v_operation.action_id) THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Operation unavailable';
 END IF;
 IF v_operation.result IS NULL OR v_operation.state NOT IN ('generated','failed','conflict') THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='Result unavailable'; END IF;
 SELECT * INTO v_action FROM public.actions WHERE id=v_operation.action_id FOR UPDATE;
 IF v_action.updated_at IS DISTINCT FROM p_expected_version THEN RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='Action changed'; END IF;
 IF EXISTS(SELECT 1 FROM public.strategy_operations WHERE action_id=v_operation.action_id AND id<>v_operation.id AND created_at>v_operation.created_at) THEN
  RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='Newer operation exists';
 END IF;
 v_source:=public.strategy_source(v_operation.action_id,v_operation.requester_id);
 IF v_source IS DISTINCT FROM v_operation.apply_source AND NOT p_confirm_changed_source THEN RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='Source review required'; END IF;
 UPDATE public.strategy_operations SET state='generated',apply_source=v_source,error_code=NULL,write_attempts=0,lease_until=NULL,lease_id=NULL,updated_at=clock_timestamp()
 WHERE id=p_operation_id RETURNING * INTO v_operation;
 RETURN public.strategy_public_operation(v_operation);
END $$;

-- Explicit allowlist: neither browser role can read payloads/results or impersonate a requester.
DO $$ DECLARE v_function regprocedure; BEGIN
 FOR v_function IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('strategy_scope','strategy_source','strategy_ready','strategy_public_operation',
 'accept_strategy_operation','read_strategy_operation','claim_strategy_operation','store_strategy_result',
 'finish_strategy_operation','fail_strategy_operation','retry_strategy_result') LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',v_function);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',v_function);
 END LOOP;
END $$;
