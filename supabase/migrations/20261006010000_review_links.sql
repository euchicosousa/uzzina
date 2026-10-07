-- Migration: Criar tabela review_links para links seguros de revisão de conteúdo (/dash/review/$slug)
-- Data: 2026-10-06
-- Ticket 05: Compartilhar revisão só por link limitado

CREATE TABLE IF NOT EXISTS public.review_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    partner_slug TEXT NOT NULL,
    action_ids UUID[] NOT NULL,
    created_by UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_review_links_token_hash ON public.review_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_review_links_partner_slug ON public.review_links(partner_slug);
CREATE INDEX IF NOT EXISTS idx_review_links_created_by ON public.review_links(created_by);
CREATE INDEX IF NOT EXISTS idx_review_links_expires_revoked ON public.review_links(expires_at, revoked_at);

-- Habilitar RLS estrito
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;

-- Revogar todo acesso direto de anon e authenticated.
-- Apenas service_role no backend tem permissão para ler/gravar na tabela.
REVOKE ALL ON TABLE public.review_links FROM anon, authenticated;
