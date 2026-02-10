-- =====================================================
-- MASTER SETUP: RESET TOTAL & RECRIAÇÃO
-- =====================================================

-- 1. LIMPEZA TOTAL (RESET)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN_SAAS', 'ADMIN_CONDOMINIO', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PRESTADOR');
CREATE TYPE tipo_lancamento AS ENUM ('receita', 'despesa');
CREATE TYPE status_lancamento AS ENUM ('pago', 'pendente', 'atrasado', 'cancelado');
CREATE TYPE prioridade_cartao AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE status_cartao AS ENUM ('pendente', 'em_andamento', 'concluido', 'arquivado');
CREATE TYPE tipo_unidade AS ENUM ('apartamento', 'casa', 'sala', 'loja');
CREATE TYPE modelo_rateio AS ENUM ('igualitario', 'fracao_ideal', 'valor_fixo');

-- 4. TABELAS
CREATE TABLE condominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  cep VARCHAR(9) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'MORADOR',
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  bloco VARCHAR(20),
  numero VARCHAR(20) NOT NULL,
  tipo tipo_unidade NOT NULL DEFAULT 'apartamento',
  area DECIMAL(10, 2),
  fracao_ideal DECIMAL(10, 6),
  proprietario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  morador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(condominio_id, bloco, numero)
);

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo tipo_lancamento NOT NULL,
  cor VARCHAR(7) DEFAULT '#64748b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_lancamento NOT NULL DEFAULT 'pendente',
  tipo tipo_lancamento NOT NULL,
  observacoes TEXT,
  comprovante_url TEXT,
  centro_custo_id UUID, 
  unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rateios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  despesa_id UUID NOT NULL REFERENCES lancamentos_financeiros(id) ON DELETE RESTRICT,
  modelo modelo_rateio NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL CHECK (valor_total > 0),
  total_unidades INTEGER NOT NULL CHECK (total_unidades > 0),
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(despesa_id)
);

CREATE TABLE rateio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rateio_id UUID NOT NULL REFERENCES rateios(id) ON DELETE CASCADE,
  unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE RESTRICT,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  fracao_ideal DECIMAL(10, 6),
  lancamento_gerado_id UUID REFERENCES lancamentos_financeiros(id) ON DELETE SET NULL,
  UNIQUE(rateio_id, unidade_id)
);

-- 5. RLS POLICIES
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE rateios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rateio_items ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_condominio_id()
RETURNS UUID AS $$
  SELECT condominio_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_saas()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'ADMIN_SAAS');
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies Condominios
CREATE POLICY "Public access setup" ON condominios FOR SELECT USING (true);
CREATE POLICY "Users view own condo" ON condominios FOR SELECT USING (id = get_user_condominio_id() OR is_admin_saas());

-- Policies Usuarios
CREATE POLICY "Users view own profile" ON usuarios FOR SELECT USING (auth.uid() = id OR is_admin_saas());
CREATE POLICY "Admins manage all" ON usuarios FOR ALL USING (is_admin_saas());

-- Policies Unidades
CREATE POLICY "View units" ON unidades FOR SELECT USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

-- Policies Categorias
CREATE POLICY "View categories" ON categorias FOR SELECT USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

-- Policies Lancamentos
CREATE POLICY "View lancamentos" ON lancamentos_financeiros FOR SELECT USING (condominio_id = get_user_condominio_id() OR is_admin_saas());
CREATE POLICY "Manage lancamentos" ON lancamentos_financeiros FOR ALL USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

-- Policies Rateios
CREATE POLICY "View rateios" ON rateios FOR SELECT USING (condominio_id = get_user_condominio_id() OR is_admin_saas());
CREATE POLICY "View rateio items" ON rateio_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM rateios r WHERE r.id = rateio_items.rateio_id AND (r.condominio_id = get_user_condominio_id() OR is_admin_saas()))
);


-- 6. INSERIR DADOS INICIAIS (Admin e Condominio)

-- Condominio Demo
INSERT INTO condominios (id, nome, endereco, cidade, estado, cep, cnpj)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Condomínio CondoGest Demo', 'Rua Exemplo, 100', 'São Paulo', 'SP', '01001-000', '00.000.000/0001-00');

-- Admin User (Auth)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@condogest.com',
  crypt('Admin@2026!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Administrador CondoGest"}',
  NOW(), NOW(), '', '', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'admin@condogest.com', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000001', 'email', 'admin@condogest.com'), 'email', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Admin Profile (Usuarios)
INSERT INTO usuarios (id, email, nome, role, condominio_id, ativo)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'admin@condogest.com',
  'Administrador CondoGest',
  'ADMIN_SAAS',
  'a0000000-0000-0000-0000-000000000001',
  true
) ON CONFLICT (id) DO UPDATE SET role='ADMIN_SAAS', condominio_id='a0000000-0000-0000-0000-000000000001';

-- 7. SETUP FINALIZAÇÃO
SELECT 'SETUP CONCLUÍDO COM SUCESSO! Admin criado.' as status;
