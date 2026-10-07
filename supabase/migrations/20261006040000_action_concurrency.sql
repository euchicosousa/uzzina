-- Migration: 20261006040000_action_concurrency.sql
-- Descrição: Controle canônico de concorrência e timestamp para a tabela actions.
-- Ticket 08: Atualizar ação com conflito explícito.

-- 1. Preencher updated_at NULL de registros legados com base em created_at ou now()
UPDATE public.actions
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- 2. Garantir default canônico de servidor e restrição NOT NULL para updated_at
ALTER TABLE public.actions
  ALTER COLUMN updated_at SET DEFAULT NOW(),
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
    CLOCK_TIMESTAMP(),
    COALESCE(OLD.updated_at, '-infinity'::TIMESTAMPTZ) + INTERVAL '1 microsecond'
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
