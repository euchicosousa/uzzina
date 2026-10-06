-- Migration: Criar tabela dash_sessions para sessões opacas do portal de clientes (/dash)
-- Data: 2026-10-06
-- Ticket 02: Login e retomada só com sessão válida

CREATE TABLE IF NOT EXISTS public.dash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_dash_sessions_token_hash ON public.dash_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_dash_sessions_client_id ON public.dash_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_dash_sessions_expires_revoked ON public.dash_sessions(expires_at, revoked_at);

-- Habilitar RLS estrito
ALTER TABLE public.dash_sessions ENABLE ROW LEVEL SECURITY;

-- Revogar todo acesso direto de anon e authenticated.
-- Apenas service_role no backend tem permissão para ler/gravar na tabela.
REVOKE ALL ON TABLE public.dash_sessions FROM anon, authenticated;
