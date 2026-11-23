-- Applied in production (dfepmjcozszswocwvdpq) on 2026-11-22 via Supabase SQL Editor (verified in pg_proc).
-- Atomically deletes an archived partner, unlinks shared actions and shared clients,
-- deletes exclusive actions, exclusive clients and review links, and checks
-- optimistic snapshot counts so concurrent changes cannot silently delete new records.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION public.delete_archived_partner(
  p_partner_id uuid,
  p_expected_slug text,
  p_expected_exclusive_action_count integer,
  p_expected_shared_action_count integer,
  p_expected_exclusive_client_count integer,
  p_expected_shared_client_count integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_partner public.partners%ROWTYPE;
  v_exclusive_action_ids uuid[];
  v_exclusive_action_count integer := 0;
  v_shared_action_count integer := 0;
  v_exclusive_client_count integer := 0;
  v_shared_client_count integer := 0;
  v_comments_count integer := 0;
  v_notifications_count integer := 0;
  v_strategy_ops_count integer := 0;
  v_topics_count integer := 0;
  v_social_plans_count integer := 0;
  v_theme_requests_count integer := 0;
  v_holidays_count integer := 0;
  v_review_links_count integer := 0;
BEGIN
  SELECT * INTO v_partner
  FROM public.partners
  WHERE id = p_partner_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PARTNER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_partner.slug IS DISTINCT FROM p_expected_slug THEN
    RAISE EXCEPTION 'PARTNER_MISMATCH' USING ERRCODE = 'P0001';
  END IF;

  IF v_partner.archived IS NOT TRUE THEN
    RAISE EXCEPTION 'PARTNER_NOT_ARCHIVED' USING ERRCODE = 'P0001';
  END IF;

  -- Lock impacted actions and clients in deterministic order before counting.
  SELECT COALESCE(array_agg(a.id), ARRAY[]::uuid[])
  INTO v_exclusive_action_ids
  FROM (
    SELECT id
    FROM public.actions
    WHERE v_partner.slug = ANY(partners)
      AND cardinality(array_remove(partners, v_partner.slug)) = 0
    ORDER BY id
    FOR UPDATE
  ) AS a;
  v_exclusive_action_count := COALESCE(cardinality(v_exclusive_action_ids), 0);

  SELECT count(*)::integer
  INTO v_shared_action_count
  FROM (
    SELECT id
    FROM public.actions
    WHERE v_partner.slug = ANY(partners)
      AND cardinality(array_remove(partners, v_partner.slug)) > 0
    ORDER BY id
    FOR UPDATE
  ) AS shared_actions;

  SELECT count(*)::integer
  INTO v_exclusive_client_count
  FROM (
    SELECT id
    FROM public.clients
    WHERE v_partner.slug = ANY(partners)
      AND cardinality(array_remove(partners, v_partner.slug)) = 0
    ORDER BY id
    FOR UPDATE
  ) AS exclusive_clients;

  SELECT count(*)::integer
  INTO v_shared_client_count
  FROM (
    SELECT id
    FROM public.clients
    WHERE v_partner.slug = ANY(partners)
      AND cardinality(array_remove(partners, v_partner.slug)) > 0
    ORDER BY id
    FOR UPDATE
  ) AS shared_clients;

  IF v_exclusive_action_count <> p_expected_exclusive_action_count
    OR v_shared_action_count <> p_expected_shared_action_count
    OR v_exclusive_client_count <> p_expected_exclusive_client_count
    OR v_shared_client_count <> p_expected_shared_client_count
  THEN
    RAISE EXCEPTION 'IMPACT_CHANGED' USING ERRCODE = 'P0001';
  END IF;

  IF v_exclusive_action_count > 0 THEN
    SELECT count(*)::integer INTO v_comments_count
    FROM public.action_comments
    WHERE action_id = ANY(v_exclusive_action_ids);

    SELECT count(*)::integer INTO v_notifications_count
    FROM public.notifications
    WHERE action_id = ANY(v_exclusive_action_ids);

    SELECT count(*)::integer INTO v_strategy_ops_count
    FROM public.strategy_operations
    WHERE action_id = ANY(v_exclusive_action_ids);
  END IF;

  SELECT count(*)::integer INTO v_topics_count
  FROM public.partner_topics
  WHERE partner_id = v_partner.id;

  SELECT count(*)::integer INTO v_social_plans_count
  FROM public.social_plans
  WHERE partner_slug = v_partner.slug;

  SELECT count(*)::integer INTO v_theme_requests_count
  FROM public.planning_theme_requests
  WHERE partner_slug = v_partner.slug;

  IF to_regclass('public.partner_holidays') IS NOT NULL THEN
    EXECUTE 'SELECT count(*)::integer FROM public.partner_holidays WHERE partner_id = $1'
      INTO v_holidays_count
      USING v_partner.id;
  END IF;

  -- 1. Unlink shared actions (trg_actions_topic_ownership clears topic_id if it belonged to this partner).
  UPDATE public.actions
  SET partners = array_remove(partners, v_partner.slug)
  WHERE v_partner.slug = ANY(partners)
    AND cardinality(array_remove(partners, v_partner.slug)) > 0;

  -- 2. Delete exclusive actions (cascades comments, notifications, strategy_operations).
  IF v_exclusive_action_count > 0 THEN
    DELETE FROM public.actions
    WHERE id = ANY(v_exclusive_action_ids);
  END IF;

  -- 3. Unlink shared clients and delete exclusive clients (cascades dash_sessions).
  UPDATE public.clients
  SET partners = array_remove(partners, v_partner.slug)
  WHERE v_partner.slug = ANY(partners)
    AND cardinality(array_remove(partners, v_partner.slug)) > 0;

  DELETE FROM public.clients
  WHERE v_partner.slug = ANY(partners)
    AND cardinality(array_remove(partners, v_partner.slug)) = 0;

  -- 4. Delete review links for this partner.
  DELETE FROM public.review_links
  WHERE partner_slug = v_partner.slug;
  GET DIAGNOSTICS v_review_links_count = ROW_COUNT;

  -- 5. Delete partner (cascades partner_topics, partner_holidays, social_plans, planning_theme_requests).
  DELETE FROM public.partners
  WHERE id = v_partner.id;

  RETURN jsonb_build_object(
    'partner', jsonb_build_object(
      'id', v_partner.id,
      'slug', v_partner.slug,
      'title', v_partner.title
    ),
    'deleted', jsonb_build_object(
      'exclusiveActions', v_exclusive_action_count,
      'comments', v_comments_count,
      'notifications', v_notifications_count,
      'strategyOperations', v_strategy_ops_count,
      'exclusiveClients', v_exclusive_client_count,
      'topics', v_topics_count,
      'socialPlans', v_social_plans_count,
      'themeRequests', v_theme_requests_count,
      'holidays', v_holidays_count,
      'reviewLinks', v_review_links_count
    ),
    'unlinked', jsonb_build_object(
      'sharedActions', v_shared_action_count,
      'sharedClients', v_shared_client_count
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_archived_partner(uuid, text, integer, integer, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_archived_partner(uuid, text, integer, integer, integer, integer)
  TO service_role;

COMMIT;
