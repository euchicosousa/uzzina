-- Migration: Funções transacionais para gestão de contas e revogação de sessões do portal (/dash)
-- Data: 2026-10-06
-- Ticket 06: Administrador cria contas e revoga sessões

-- 1. Troca transacional de senha com revogação imediata de sessões ativas
CREATE OR REPLACE FUNCTION public.admin_update_client_password(
    p_client_id UUID,
    p_password_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualiza o hash da senha do cliente
    UPDATE public.clients
    SET password_hash = p_password_hash
    WHERE id = p_client_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Client not found';
    END IF;

    -- Revoga todas as sessões ativas daquele cliente de forma atômica
    UPDATE public.dash_sessions
    SET revoked_at = now()
    WHERE client_id = p_client_id
      AND revoked_at IS NULL;
END;
$$;

-- 2. Desativação transacional de cliente com revogação imediata de sessões ativas
CREATE OR REPLACE FUNCTION public.admin_deactivate_client(
    p_client_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Desativa o cliente
    UPDATE public.clients
    SET active = false
    WHERE id = p_client_id;

    -- Revoga todas as sessões ativas do cliente de forma atômica
    UPDATE public.dash_sessions
    SET revoked_at = now()
    WHERE client_id = p_client_id
      AND revoked_at IS NULL;
END;
$$;

-- 3. Migração condicional de hash legado para bcrypt durante login bem-sucedido
-- Retorna o número de linhas atualizadas (1 se migrado, 0 se houve alteração concorrente)
CREATE OR REPLACE FUNCTION public.client_migrate_legacy_password(
    p_client_id UUID,
    p_legacy_hash TEXT,
    p_new_hash TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE public.clients
    SET password_hash = p_new_hash
    WHERE id = p_client_id
      AND password_hash = p_legacy_hash;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
END;
$$;

-- Restrição de privilégios: apenas o backend privilegiado (service_role) pode invocar essas funções
REVOKE ALL ON FUNCTION public.admin_update_client_password(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_client_password(UUID, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_deactivate_client(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_deactivate_client(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.client_migrate_legacy_password(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.client_migrate_legacy_password(UUID, TEXT, TEXT) TO service_role;

-- A single transaction updates the account and revokes sessions together.
CREATE OR REPLACE FUNCTION public.admin_update_client_account(
  p_client_id UUID, p_changes JSONB, p_password_hash TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_client public.clients%ROWTYPE;
BEGIN
  SELECT * INTO v_client FROM public.clients WHERE id = p_client_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Client not found'; END IF;
  IF p_changes ? 'partners' AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(p_changes->'partners') selected(slug)
    WHERE NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.slug = selected.slug AND p.archived = false)
  ) THEN RAISE EXCEPTION 'Invalid partner'; END IF;
  UPDATE public.clients SET
    name = CASE WHEN p_changes ? 'name' THEN p_changes->>'name' ELSE name END,
    email = CASE WHEN p_changes ? 'email' THEN p_changes->>'email' ELSE email END,
    image = CASE WHEN p_changes ? 'image' THEN p_changes->>'image' ELSE image END,
    active = CASE WHEN p_changes ? 'active' THEN (p_changes->>'active')::BOOLEAN ELSE active END,
    partners = CASE WHEN p_changes ? 'partners' THEN ARRAY(SELECT jsonb_array_elements_text(p_changes->'partners')) ELSE partners END,
    password_hash = COALESCE(p_password_hash, password_hash)
  WHERE id = p_client_id RETURNING * INTO v_client;
  IF p_password_hash IS NOT NULL OR p_changes->>'active' = 'false' THEN
    UPDATE public.dash_sessions SET revoked_at = now() WHERE client_id = p_client_id AND revoked_at IS NULL;
  END IF;
  RETURN to_jsonb(v_client) - 'password_hash';
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_client_account(UUID, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_client_account(UUID, JSONB, TEXT) TO service_role;
