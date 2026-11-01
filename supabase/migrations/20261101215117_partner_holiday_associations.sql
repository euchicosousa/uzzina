BEGIN;
SET LOCAL lock_timeout = '5s';

-- The composite reference enforces classification even across concurrent writes.
ALTER TABLE public.celebrations
  ADD CONSTRAINT celebrations_id_is_holiday_key UNIQUE (id, is_holiday);

CREATE TABLE public.partner_holidays (
  partner_id uuid NOT NULL,
  celebration_id uuid NOT NULL,
  celebration_is_holiday boolean GENERATED ALWAYS AS (true) STORED NOT NULL,
  CONSTRAINT partner_holidays_pkey PRIMARY KEY (partner_id, celebration_id),
  CONSTRAINT partner_holidays_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE,
  CONSTRAINT partner_holidays_holiday_fkey
    FOREIGN KEY (celebration_id, celebration_is_holiday)
    REFERENCES public.celebrations(id, is_holiday)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX partner_holidays_celebration_idx
  ON public.partner_holidays (celebration_id, celebration_is_holiday);

COMMENT ON TABLE public.partner_holidays IS
  'Holiday selections per brand, stored by stable partner and celebration UUIDs. Empty by default.';
COMMENT ON COLUMN public.partner_holidays.celebration_is_holiday IS
  'Generated true for the composite foreign key. Prevents selecting non-holidays or unclassifying linked holidays.';

ALTER TABLE public.partner_holidays ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.partner_holidays FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.partner_holidays TO authenticated;
GRANT ALL ON public.partner_holidays TO service_role;

-- The subquery inherits the existing partner SELECT policies.
CREATE POLICY partner_holidays_read ON public.partner_holidays
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partners AS p
    WHERE p.id = partner_holidays.partner_id
  ));

CREATE POLICY partner_holidays_insert ON public.partner_holidays
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_active_admin()));

CREATE POLICY partner_holidays_delete ON public.partner_holidays
  FOR DELETE TO authenticated
  USING ((SELECT public.is_active_admin()));

CREATE FUNCTION public.replace_partner_holidays(
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
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Partner and holiday IDs must not be null';
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
      WHERE c.id = selected.id AND c.is_holiday
    )
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'Select only existing celebrations classified as holidays';
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
  'Active-admin atomic replacement of a brand holiday selection. Empty array clears; null is rejected. Returns canonical sorted IDs. Invoker RLS applies.';

COMMIT;
