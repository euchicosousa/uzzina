-- Requires the audited people schema/auth contracts; prepared locally, NOT applied.
BEGIN;
CREATE OR REPLACE FUNCTION public.update_my_preferences(p_patch JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
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
REVOKE ALL ON FUNCTION public.update_my_preferences(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_preferences(JSONB) TO authenticated;
-- Preferences must not be replaced by direct browser writes. Profile details remain writable.
REVOKE UPDATE (preferences) ON public.people FROM PUBLIC, anon, authenticated;
COMMIT;
