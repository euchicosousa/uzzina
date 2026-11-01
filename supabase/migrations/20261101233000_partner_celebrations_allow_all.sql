BEGIN;
SET LOCAL lock_timeout = '5s';

-- Remove the restriction that only holidays can be associated to a partner.
ALTER TABLE public.partner_holidays
  DROP CONSTRAINT IF EXISTS partner_holidays_holiday_fkey;

DROP INDEX IF EXISTS public.partner_holidays_celebration_idx;

ALTER TABLE public.partner_holidays
  DROP COLUMN IF EXISTS celebration_is_holiday;

ALTER TABLE public.partner_holidays
  ADD CONSTRAINT partner_holidays_celebration_id_fkey
    FOREIGN KEY (celebration_id) REFERENCES public.celebrations(id)
    ON DELETE CASCADE;

CREATE INDEX partner_holidays_celebration_idx
  ON public.partner_holidays (celebration_id);

COMMENT ON TABLE public.partner_holidays IS
  'Celebration and holiday selections per brand, stored by stable partner and celebration UUIDs. Empty by default.';

-- Update replace_partner_holidays to validate against all celebrations (not only holidays)
CREATE OR REPLACE FUNCTION public.replace_partner_holidays(
  p_partner_id uuid,
  p_celebration_ids uuid[]
) RETURNS uuid[]
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  selected_ids uuid[];
BEGIN
  IF auth.uid() IS NULL OR public.is_active_admin() IS NOT TRUE THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Active administrator required';
  END IF;
  IF p_partner_id IS NULL OR p_celebration_ids IS NULL
    OR array_position(p_celebration_ids, NULL) IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Partner and celebration IDs must not be null';
  END IF;

  SELECT coalesce(array_agg(ids.id ORDER BY ids.id), ARRAY[]::uuid[])
    INTO selected_ids
    FROM (SELECT DISTINCT unnest(p_celebration_ids) AS id) AS ids;

  -- Serialize replacements for a brand without changing its editable fields.
  PERFORM 1 FROM public.partners WHERE id = p_partner_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Partner not found or unavailable';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(selected_ids) AS selected(id)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.celebrations AS c
      WHERE c.id = selected.id
    )
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'Select only existing celebrations';
  END IF;

  DELETE FROM public.partner_holidays
    WHERE partner_id = p_partner_id AND NOT (celebration_id = ANY(selected_ids));

  INSERT INTO public.partner_holidays (partner_id, celebration_id)
    SELECT p_partner_id, id FROM unnest(selected_ids) AS selected(id)
    ON CONFLICT (partner_id, celebration_id) DO NOTHING;

  RETURN coalesce((
    SELECT array_agg(celebration_id ORDER BY celebration_id)
    FROM public.partner_holidays WHERE partner_id = p_partner_id
  ), ARRAY[]::uuid[]);
END;
$$;

REVOKE ALL ON FUNCTION public.replace_partner_holidays(uuid, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_partner_holidays(uuid, uuid[]) TO authenticated;
COMMENT ON FUNCTION public.replace_partner_holidays(uuid, uuid[]) IS
  'Active-admin atomic replacement of a brand celebration selection. Empty array clears; null is rejected. Returns canonical sorted IDs. Invoker RLS applies.';

COMMIT;
