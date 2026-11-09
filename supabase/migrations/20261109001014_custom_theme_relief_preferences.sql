-- Preserve existing authorization and preference validation while accepting custom card finishes.
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
          IF NOT v_value ?& ARRAY['light','dark'] OR EXISTS (
            SELECT 1 FROM jsonb_object_keys(v_value) AS key
            WHERE key NOT IN ('light', 'dark', 'relief', 'shadowColor', 'topBorderColor')
          ) THEN
            RAISE EXCEPTION 'Invalid custom theme' USING ERRCODE = '22023';
          END IF;
          IF v_value ? 'relief' AND jsonb_typeof(v_value -> 'relief') IS DISTINCT FROM 'boolean' THEN
            RAISE EXCEPTION 'Invalid custom relief' USING ERRCODE = '22023';
          END IF;
          FOREACH v_color IN ARRAY ARRAY['shadowColor', 'topBorderColor'] LOOP
            IF v_value ? v_color AND (
              jsonb_typeof(v_value -> v_color) IS DISTINCT FROM 'string' OR
              (v_value ->> v_color) !~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$'
            ) THEN
              RAISE EXCEPTION 'Invalid custom finish color' USING ERRCODE = '22023';
            END IF;
          END LOOP;
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
