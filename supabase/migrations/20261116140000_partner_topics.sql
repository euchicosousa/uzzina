-- TOP-01: partner topics (name + color) that replace the free color choice on actions.
-- PREPARED ONLY: not applied anywhere. Applying it in production needs the owner's explicit authorization.
-- actions.color is kept untouched; actions without a topic keep showing their own color.
BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. Topics owned by a partner (brand).
CREATE TABLE public.partner_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  color text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT partner_topics_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE,
  CONSTRAINT partner_topics_title_check
    CHECK (char_length(title) BETWEEN 1 AND 40 AND char_length(btrim(title)) >= 1),
  CONSTRAINT partner_topics_color_check
    CHECK (color ~ '^#[0-9a-f]{6}$')
);

-- Names are unique per partner, ignoring case and surrounding spaces.
CREATE UNIQUE INDEX partner_topics_partner_title_key
  ON public.partner_topics (partner_id, lower(btrim(title)));
CREATE INDEX partner_topics_partner_position_idx
  ON public.partner_topics (partner_id, position);

COMMENT ON TABLE public.partner_topics IS
  'Topics per brand (name + #rrggbb color). An action has at most one topic; the topic color replaces the action color on display. Empty by default.';

ALTER TABLE public.partner_topics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.partner_topics FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_topics TO authenticated;
GRANT ALL ON public.partner_topics TO service_role;

-- The subquery inherits the existing partner SELECT policies.
CREATE POLICY partner_topics_read ON public.partner_topics
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partners AS p
    WHERE p.id = partner_topics.partner_id
  ));

CREATE POLICY partner_topics_insert ON public.partner_topics
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_active_admin()));

CREATE POLICY partner_topics_update ON public.partner_topics
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_active_admin()))
  WITH CHECK ((SELECT public.is_active_admin()));

CREATE POLICY partner_topics_delete ON public.partner_topics
  FOR DELETE TO authenticated
  USING ((SELECT public.is_active_admin()));

-- 2. Limit of 12 topics per partner, immutable owner and updated_at upkeep.
CREATE FUNCTION public.handle_partner_topics_write()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Serialize concurrent inserts for the same partner so the limit holds.
    PERFORM pg_advisory_xact_lock(hashtextextended('partner_topics:' || NEW.partner_id::text, 0));
    IF (SELECT count(*) FROM public.partner_topics WHERE partner_id = NEW.partner_id) >= 12 THEN
      RAISE EXCEPTION USING ERRCODE = '23514',
        MESSAGE = 'A partner can have at most 12 topics';
    END IF;
  ELSE
    IF NEW.partner_id IS DISTINCT FROM OLD.partner_id THEN
      RAISE EXCEPTION USING ERRCODE = '23514',
        MESSAGE = 'The partner of a topic cannot change';
    END IF;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_partner_topics_write
  BEFORE INSERT OR UPDATE ON public.partner_topics
  FOR EACH ROW EXECUTE FUNCTION public.handle_partner_topics_write();

REVOKE EXECUTE ON FUNCTION public.handle_partner_topics_write() FROM PUBLIC, anon, authenticated;

-- 3. Optional topic on actions. Deleting a topic leaves its actions without topic.
ALTER TABLE public.actions
  ADD COLUMN topic_id uuid;
ALTER TABLE public.actions
  ADD CONSTRAINT actions_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES public.partner_topics(id) ON DELETE SET NULL;
CREATE INDEX actions_topic_id_idx ON public.actions (topic_id) WHERE topic_id IS NOT NULL;

COMMENT ON COLUMN public.actions.topic_id IS
  'Optional topic of one of the action partners. Displayed color = topic color, else actions.color.';

-- 4. A topic must belong to a partner of the action (actions.partners holds partner slugs).
-- SECURITY DEFINER so a member who cannot read every partner of a shared action is still validated correctly.
-- It reads only partner_topics/partners, never the action row by ID, and the actions SELECT policy is untouched.
CREATE FUNCTION public.handle_actions_topic_ownership()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  owner_in_action boolean;
BEGIN
  IF NEW.topic_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.partner_topics AS t
    JOIN public.partners AS p ON p.id = t.partner_id
    WHERE t.id = NEW.topic_id AND p.slug = ANY (NEW.partners)
  ) INTO owner_in_action;

  IF owner_in_action THEN
    RETURN NEW;
  END IF;

  -- Partners changed and the topic was not touched: drop the topic that lost its owner.
  IF TG_OP = 'UPDATE' THEN
    IF NEW.topic_id IS NOT DISTINCT FROM OLD.topic_id THEN
      NEW.topic_id := NULL;
      RETURN NEW;
    END IF;
  END IF;

  RAISE EXCEPTION USING ERRCODE = '23514',
    MESSAGE = 'The topic must belong to a partner of the action';
END;
$$;

CREATE TRIGGER trg_actions_topic_ownership
  BEFORE INSERT OR UPDATE OF topic_id, partners ON public.actions
  FOR EACH ROW EXECUTE FUNCTION public.handle_actions_topic_ownership();

REVOKE EXECUTE ON FUNCTION public.handle_actions_topic_ownership() FROM PUBLIC, anon, authenticated;

COMMIT;

-- ROLLBACK PLAN (run only if the topics must be removed; actions.color is never touched):
-- BEGIN;
-- SET LOCAL lock_timeout = '5s';
-- DROP TRIGGER IF EXISTS trg_actions_topic_ownership ON public.actions;
-- DROP FUNCTION IF EXISTS public.handle_actions_topic_ownership();
-- DROP INDEX IF EXISTS public.actions_topic_id_idx;
-- ALTER TABLE public.actions DROP CONSTRAINT IF EXISTS actions_topic_id_fkey;
-- ALTER TABLE public.actions DROP COLUMN IF EXISTS topic_id;
-- DROP TABLE IF EXISTS public.partner_topics;
-- DROP FUNCTION IF EXISTS public.handle_partner_topics_write();
-- COMMIT;
