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
AS $$
BEGIN
    -- Atualiza o hash da senha do cliente
    UPDATE public.clients
    SET password_hash = p_password_hash
    WHERE id = p_client_id;

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
