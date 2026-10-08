-- Migration: 20261006040000_action_concurrency.sql
-- Descrição: Controle canônico de concorrência e timestamp para a tabela actions.
-- Ticket 08: Atualizar ação com conflito explícito.

-- Reconcile the exact moddatetime trigger observed in the exported baseline.
DO $$ DECLARE v_definition TEXT; BEGIN
 SELECT pg_get_triggerdef(oid) INTO v_definition FROM pg_trigger
 WHERE tgrelid='public.actions'::regclass AND tgname='handle_updated_at_actions' AND NOT tgisinternal;
 IF v_definition IS NOT NULL THEN
   IF v_definition NOT LIKE '%moddatetime(''updated_at'')%' THEN
     RAISE EXCEPTION 'Unknown legacy actions timestamp trigger; inspect before applying';
   END IF;
   DROP TRIGGER handle_updated_at_actions ON public.actions;
 END IF;
 IF EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
   WHERE t.tgrelid='public.actions'::regclass AND NOT t.tgisinternal
     AND t.tgname <> 'trg_actions_updated_at'
     AND (pg_get_functiondef(p.oid) ~* 'NEW[.]updated_at[[:space:]]*(:=|=)' OR p.proname='moddatetime')) THEN
   RAISE EXCEPTION 'Inspect existing actions timestamp trigger before applying concurrency migration';
 END IF;
 IF (SELECT atttypid FROM pg_attribute WHERE attrelid='public.actions'::regclass AND attname='updated_at') <> 'timestamp'::regtype THEN
   RAISE EXCEPTION 'Expected exported timestamp without time zone contract';
 END IF;
END $$;

-- 1. Preencher updated_at NULL de registros legados com base em created_at ou now()
UPDATE public.actions
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- 2. Garantir default canônico de servidor e restrição NOT NULL para updated_at
ALTER TABLE public.actions
  ALTER COLUMN updated_at SET DEFAULT (CLOCK_TIMESTAMP() AT TIME ZONE 'UTC'),
  ALTER COLUMN updated_at SET NOT NULL;

-- 3. Função canônica de atualização de timestamp com garantia de monotonicidade
CREATE OR REPLACE FUNCTION public.handle_actions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = GREATEST(
    CLOCK_TIMESTAMP() AT TIME ZONE 'UTC',
    COALESCE(OLD.updated_at, '-infinity'::TIMESTAMP) + INTERVAL '1 microsecond'
  );
  RETURN NEW;
END;
$$;

-- 4. Trigger BEFORE UPDATE na tabela actions
DROP TRIGGER IF EXISTS trg_actions_updated_at ON public.actions;
CREATE TRIGGER trg_actions_updated_at
BEFORE UPDATE ON public.actions
FOR EACH ROW
EXECUTE FUNCTION public.handle_actions_updated_at();
