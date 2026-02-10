-- =====================================================
-- FIX PERMISSÕES SUPABASE (Roles anon & service_role)
-- =====================================================

-- Garantir acesso ao Schema Public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant em TODAS as tabelas para service_role (Admin API)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant em TODAS as tabelas para authenticated (Usuários Logados)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant limitado para anon (Visitantes não logados)
-- Apenas select se RLS permitir
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Configurar defaults para FUTURAS tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- Garantir acesso à tabela auth.users (necessário para triggers)
GRANT SELECT ON TABLE auth.users TO service_role;

-- SUCESSO
SELECT 'Permissões corrigidas com sucesso!' as status;
