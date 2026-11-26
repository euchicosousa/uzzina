CREATE FUNCTION public.prevent_partner_slug_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'The partner slug cannot be changed after creation.'
    USING ERRCODE = '23514';
END;
$$;

CREATE TRIGGER trg_partner_slug_immutable
BEFORE UPDATE ON public.partners
FOR EACH ROW
WHEN (OLD.slug IS DISTINCT FROM NEW.slug)
EXECUTE FUNCTION public.prevent_partner_slug_change();

REVOKE EXECUTE ON FUNCTION public.prevent_partner_slug_change()
  FROM PUBLIC, anon, authenticated, service_role;
