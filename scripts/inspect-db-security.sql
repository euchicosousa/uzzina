-- ==============================================================================
-- UZZINA: Script de Inspeção de Segurança e Autorização do Banco de Dados
-- Data: 2026-10-06
-- Ticket 07: Autorizações reproduzíveis no banco
-- ==============================================================================
-- Este script é estritamente READ-ONLY (somente leitura).
-- Pode ser executado em qualquer ambiente para auditar RLS, Policies, Grants e RPCs.
-- ==============================================================================

-- 1. Status de RLS em todas as tabelas do schema public
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Lista de todas as Políticas de RLS (Policies) ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Privilégios concedidos às roles 'anon' e 'authenticated' nas tabelas públicas
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee, privilege_type;

-- 4. Funções RPC no schema public: SECURITY DEFINER, search_path e permissões
SELECT 
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type,
    p.proconfig AS configuration_settings, -- Exibe search_path se configurado
    r.rolname AS owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 5. Privilégios concedidos em Funções para 'anon' e 'authenticated'
SELECT 
    routine_schema,
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY routine_name, grantee;

-- 6. Triggers existentes nas tabelas públicas
SELECT 
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS event,
    action_timing AS timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;
