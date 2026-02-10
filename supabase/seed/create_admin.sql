-- =====================================================
-- CONDOGEST - Criar Usuário Admin
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================
-- ⚠️ IMPORTANTE: Execute este script UMA ÚNICA VEZ
-- ⚠️ Após executar, faça login com as credenciais abaixo
-- =====================================================

-- 1. Criar condomínio de demonstração
INSERT INTO condominios (id, nome, endereco, cidade, estado, cep, cnpj)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Condomínio CondoGest Demo',
  'Rua Exemplo, 100 - Centro',
  'São Paulo',
  'SP',
  '01001-000',
  '00.000.000/0001-00'
)
ON CONFLICT (cnpj) DO NOTHING;

-- 2. Criar usuário admin no Supabase Auth
-- Email: admin@condogest.com
-- Senha: Admin@2026!
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  is_super_admin
)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@condogest.com',
  crypt('Admin@2026!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Administrador CondoGest"}',
  NOW(),
  NOW(),
  '',
  '',
  false
)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar identidade de email para o usuário
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'admin@condogest.com',
  jsonb_build_object(
    'sub', 'b0000000-0000-0000-0000-000000000001',
    'email', 'admin@condogest.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4. Criar perfil do admin na tabela usuarios
INSERT INTO usuarios (id, email, nome, role, condominio_id, ativo)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'admin@condogest.com',
  'Administrador CondoGest',
  'ADMIN_SAAS',
  'a0000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'ADMIN_SAAS',
  nome = 'Administrador CondoGest',
  condominio_id = 'a0000000-0000-0000-0000-000000000001';

-- =====================================================
-- ✅ CREDENCIAIS DE ACESSO
-- Email: admin@condogest.com
-- Senha: Admin@2026!
-- Role:  ADMIN_SAAS (acesso total)
-- =====================================================
