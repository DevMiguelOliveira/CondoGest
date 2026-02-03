-- =====================================================
-- CONDOGEST - Sistema de Gestão Condominial
-- Database Schema for Supabase PostgreSQL
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM (
  'ADMIN_SAAS',
  'ADMIN_CONDOMINIO',
  'SINDICO',
  'CONSELHEIRO',
  'MORADOR',
  'PRESTADOR'
);

CREATE TYPE tipo_lancamento AS ENUM ('receita', 'despesa');

CREATE TYPE status_lancamento AS ENUM ('pago', 'pendente', 'atrasado', 'cancelado');

CREATE TYPE prioridade_cartao AS ENUM ('baixa', 'media', 'alta', 'urgente');

CREATE TYPE status_cartao AS ENUM ('pendente', 'em_andamento', 'concluido', 'arquivado');

CREATE TYPE tipo_unidade AS ENUM ('apartamento', 'casa', 'sala', 'loja');

-- =====================================================
-- TABLES
-- =====================================================

-- Condominios (Multi-tenant base table)
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

-- Usuarios (extends Supabase auth.users)
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

-- Unidades (Apartments, houses, etc.)
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

-- Categorias (for financial entries)
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo tipo_lancamento NOT NULL,
  cor VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  icone VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(condominio_id, nome, tipo)
);

-- Centros de Custo
CREATE TABLE centros_custo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(condominio_id, nome)
);

-- Lancamentos Financeiros
CREATE TABLE lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  tipo tipo_lancamento NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_lancamento NOT NULL DEFAULT 'pendente',
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE SET NULL,
  unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  cartao_id UUID, -- Will be referenced after cartoes table is created
  comprovante_url TEXT,
  observacoes TEXT,
  multa DECIMAL(12, 2) DEFAULT 0,
  juros DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) GENERATED ALWAYS AS (valor + COALESCE(multa, 0) + COALESCE(juros, 0)) STORED,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quadros (Kanban Boards)
CREATE TABLE quadros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  ordem INTEGER NOT NULL DEFAULT 0,
  arquivado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listas (Kanban Columns)
CREATE TABLE listas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quadro_id UUID NOT NULL REFERENCES quadros(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  cor VARCHAR(7),
  limite_wip INTEGER, -- Work in Progress limit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cartoes (Kanban Cards)
CREATE TABLE cartoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lista_id UUID NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  prioridade prioridade_cartao NOT NULL DEFAULT 'media',
  status status_cartao NOT NULL DEFAULT 'pendente',
  data_vencimento DATE,
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  lancamento_id UUID REFERENCES lancamentos_financeiros(id) ON DELETE SET NULL,
  etiquetas TEXT[] DEFAULT '{}',
  capa_url TEXT,
  arquivado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from lancamentos to cartoes
ALTER TABLE lancamentos_financeiros 
ADD CONSTRAINT fk_lancamento_cartao 
FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE SET NULL;

-- Checklists
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cartao_id UUID NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
  titulo VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist Items
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  ordem INTEGER NOT NULL DEFAULT 0,
  data_conclusao TIMESTAMPTZ,
  concluido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Comentarios
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cartao_id UUID NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  editado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de Auditoria
CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL,
  entidade VARCHAR(50) NOT NULL,
  entidade_id UUID NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX idx_usuarios_condominio ON usuarios(condominio_id);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_categorias_condominio ON categorias(condominio_id);
CREATE INDEX idx_categorias_tipo ON categorias(tipo);
CREATE INDEX idx_lancamentos_condominio ON lancamentos_financeiros(condominio_id);
CREATE INDEX idx_lancamentos_status ON lancamentos_financeiros(status);
CREATE INDEX idx_lancamentos_tipo ON lancamentos_financeiros(tipo);
CREATE INDEX idx_lancamentos_vencimento ON lancamentos_financeiros(data_vencimento);
CREATE INDEX idx_lancamentos_unidade ON lancamentos_financeiros(unidade_id);
CREATE INDEX idx_quadros_condominio ON quadros(condominio_id);
CREATE INDEX idx_listas_quadro ON listas(quadro_id);
CREATE INDEX idx_cartoes_lista ON cartoes(lista_id);
CREATE INDEX idx_cartoes_responsavel ON cartoes(responsavel_id);
CREATE INDEX idx_cartoes_lancamento ON cartoes(lancamento_id);
CREATE INDEX idx_comentarios_cartao ON comentarios(cartao_id);
CREATE INDEX idx_logs_condominio ON logs_auditoria(condominio_id);
CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_entidade ON logs_auditoria(entidade, entidade_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadros ENABLE ROW LEVEL SECURITY;
ALTER TABLE listas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's condominio_id
CREATE OR REPLACE FUNCTION get_user_condominio_id()
RETURNS UUID AS $$
  SELECT condominio_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is ADMIN_SAAS
CREATE OR REPLACE FUNCTION is_admin_saas()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND role = 'ADMIN_SAAS'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Condominios policies
CREATE POLICY "Users can view their condominio"
  ON condominios FOR SELECT
  USING (
    id = get_user_condominio_id() OR is_admin_saas()
  );

CREATE POLICY "Admin can manage condominios"
  ON condominios FOR ALL
  USING (is_admin_saas());

-- Usuarios policies
CREATE POLICY "Users can view users in their condominio"
  ON usuarios FOR SELECT
  USING (
    condominio_id = get_user_condominio_id() OR 
    id = auth.uid() OR 
    is_admin_saas()
  );

CREATE POLICY "Users can update their own profile"
  ON usuarios FOR UPDATE
  USING (id = auth.uid());

-- Unidades policies
CREATE POLICY "Users can view units in their condominio"
  ON unidades FOR SELECT
  USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

CREATE POLICY "Admins can manage units"
  ON unidades FOR ALL
  USING (
    condominio_id = get_user_condominio_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN_SAAS', 'ADMIN_CONDOMINIO', 'SINDICO')
    )
  );

-- Categorias policies
CREATE POLICY "Users can view categories"
  ON categorias FOR SELECT
  USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

CREATE POLICY "Admins can manage categories"
  ON categorias FOR ALL
  USING (
    condominio_id = get_user_condominio_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN_SAAS', 'ADMIN_CONDOMINIO', 'SINDICO')
    )
  );

-- Lancamentos policies
CREATE POLICY "Users can view lancamentos"
  ON lancamentos_financeiros FOR SELECT
  USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

CREATE POLICY "Authorized users can manage lancamentos"
  ON lancamentos_financeiros FOR ALL
  USING (
    condominio_id = get_user_condominio_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN_SAAS', 'ADMIN_CONDOMINIO', 'SINDICO', 'CONSELHEIRO')
    )
  );

-- Quadros policies
CREATE POLICY "Users can view quadros"
  ON quadros FOR SELECT
  USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

CREATE POLICY "Authorized users can manage quadros"
  ON quadros FOR ALL
  USING (
    condominio_id = get_user_condominio_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role NOT IN ('MORADOR')
    )
  );

-- Listas policies
CREATE POLICY "Users can view listas"
  ON listas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quadros q 
      WHERE q.id = listas.quadro_id 
      AND (q.condominio_id = get_user_condominio_id() OR is_admin_saas())
    )
  );

CREATE POLICY "Authorized users can manage listas"
  ON listas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quadros q 
      WHERE q.id = listas.quadro_id 
      AND q.condominio_id = get_user_condominio_id()
      AND EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND role NOT IN ('MORADOR')
      )
    )
  );

-- Cartoes policies
CREATE POLICY "Users can view cartoes"
  ON cartoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listas l
      JOIN quadros q ON q.id = l.quadro_id
      WHERE l.id = cartoes.lista_id
      AND (q.condominio_id = get_user_condominio_id() OR is_admin_saas())
    )
  );

CREATE POLICY "Authorized users can manage cartoes"
  ON cartoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listas l
      JOIN quadros q ON q.id = l.quadro_id
      WHERE l.id = cartoes.lista_id
      AND q.condominio_id = get_user_condominio_id()
      AND EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND role NOT IN ('MORADOR')
      )
    )
  );

-- Comentarios policies
CREATE POLICY "Users can view comentarios"
  ON comentarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cartoes c
      JOIN listas l ON l.id = c.lista_id
      JOIN quadros q ON q.id = l.quadro_id
      WHERE c.id = comentarios.cartao_id
      AND (q.condominio_id = get_user_condominio_id() OR is_admin_saas())
    )
  );

CREATE POLICY "Users can create comentarios"
  ON comentarios FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update own comentarios"
  ON comentarios FOR UPDATE
  USING (usuario_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_condominios_updated_at
  BEFORE UPDATE ON condominios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON unidades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lancamentos_updated_at
  BEFORE UPDATE ON lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quadros_updated_at
  BEFORE UPDATE ON quadros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_listas_updated_at
  BEFORE UPDATE ON listas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cartoes_updated_at
  BEFORE UPDATE ON cartoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comentarios_updated_at
  BEFORE UPDATE ON comentarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update lancamento status based on due date
CREATE OR REPLACE FUNCTION update_lancamento_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pendente' AND NEW.data_vencimento < CURRENT_DATE THEN
    NEW.status = 'atrasado';
    -- Calculate late fees (2% fine + 0.033% daily interest)
    NEW.multa = NEW.valor * 0.02;
    NEW.juros = NEW.valor * 0.00033 * (CURRENT_DATE - NEW.data_vencimento);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_lancamento_late
  BEFORE INSERT OR UPDATE ON lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION update_lancamento_status();

-- Sync card status with financial entry
CREATE OR REPLACE FUNCTION sync_cartao_lancamento()
RETURNS TRIGGER AS $$
BEGIN
  -- When card is completed, mark linked lancamento as paid
  IF NEW.status = 'concluido' AND NEW.lancamento_id IS NOT NULL THEN
    UPDATE lancamentos_financeiros 
    SET status = 'pago', data_pagamento = CURRENT_DATE
    WHERE id = NEW.lancamento_id AND status != 'pago';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_cartao_to_lancamento
  AFTER UPDATE ON cartoes
  FOR EACH ROW EXECUTE FUNCTION sync_cartao_lancamento();

-- Sync lancamento status with card
CREATE OR REPLACE FUNCTION sync_lancamento_cartao()
RETURNS TRIGGER AS $$
BEGIN
  -- When lancamento becomes late, update linked card priority
  IF NEW.status = 'atrasado' AND NEW.cartao_id IS NOT NULL AND OLD.status != 'atrasado' THEN
    UPDATE cartoes 
    SET prioridade = 'urgente'
    WHERE id = NEW.cartao_id;
  END IF;
  
  -- When lancamento is paid, mark linked card as completed
  IF NEW.status = 'pago' AND NEW.cartao_id IS NOT NULL AND OLD.status != 'pago' THEN
    UPDATE cartoes 
    SET status = 'concluido'
    WHERE id = NEW.cartao_id AND status != 'concluido';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_lancamento_to_cartao
  AFTER UPDATE ON lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION sync_lancamento_cartao();

-- =====================================================
-- SEED DATA (for development)
-- =====================================================

-- This section should only be run in development environment
-- Comment out or remove for production

-- Insert sample categories (will be created per condominio after signup)
-- INSERT INTO categorias (condominio_id, nome, tipo, cor) VALUES
-- ('your-condo-id', 'Taxa Condominial', 'receita', '#10B981'),
-- ('your-condo-id', 'Aluguel Salão', 'receita', '#3B82F6'),
-- ('your-condo-id', 'Manutenção', 'despesa', '#F59E0B'),
-- ('your-condo-id', 'Funcionários', 'despesa', '#8B5CF6'),
-- ('your-condo-id', 'Água/Luz', 'despesa', '#EF4444');

-- =====================================================
-- FUNCTIONS FOR API
-- =====================================================

-- Get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_condominio_id UUID)
RETURNS TABLE (
  saldo_atual DECIMAL,
  total_receitas DECIMAL,
  total_despesas DECIMAL,
  inadimplencia DECIMAL,
  inadimplencia_percentual DECIMAL
) AS $$
DECLARE
  v_receitas DECIMAL;
  v_despesas DECIMAL;
  v_inadimplencia DECIMAL;
BEGIN
  SELECT COALESCE(SUM(valor), 0) INTO v_receitas
  FROM lancamentos_financeiros
  WHERE condominio_id = p_condominio_id 
    AND tipo = 'receita' 
    AND status = 'pago'
    AND date_trunc('month', data_pagamento) = date_trunc('month', CURRENT_DATE);

  SELECT COALESCE(SUM(valor), 0) INTO v_despesas
  FROM lancamentos_financeiros
  WHERE condominio_id = p_condominio_id 
    AND tipo = 'despesa' 
    AND status = 'pago'
    AND date_trunc('month', data_pagamento) = date_trunc('month', CURRENT_DATE);

  SELECT COALESCE(SUM(valor_total), 0) INTO v_inadimplencia
  FROM lancamentos_financeiros
  WHERE condominio_id = p_condominio_id 
    AND tipo = 'receita' 
    AND status = 'atrasado';

  RETURN QUERY
  SELECT 
    v_receitas - v_despesas AS saldo_atual,
    v_receitas AS total_receitas,
    v_despesas AS total_despesas,
    v_inadimplencia AS inadimplencia,
    CASE WHEN v_receitas > 0 
      THEN ROUND((v_inadimplencia / v_receitas) * 100, 2) 
      ELSE 0 
    END AS inadimplencia_percentual;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get monthly cash flow
CREATE OR REPLACE FUNCTION get_fluxo_caixa_mensal(
  p_condominio_id UUID,
  p_meses INTEGER DEFAULT 6
)
RETURNS TABLE (
  mes TEXT,
  receitas DECIMAL,
  despesas DECIMAL,
  saldo DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE - (p_meses - 1 || ' months')::INTERVAL),
      date_trunc('month', CURRENT_DATE),
      '1 month'::INTERVAL
    ) AS month_date
  )
  SELECT 
    to_char(m.month_date, 'Mon') AS mes,
    COALESCE(SUM(CASE WHEN l.tipo = 'receita' AND l.status = 'pago' THEN l.valor ELSE 0 END), 0) AS receitas,
    COALESCE(SUM(CASE WHEN l.tipo = 'despesa' AND l.status = 'pago' THEN l.valor ELSE 0 END), 0) AS despesas,
    COALESCE(SUM(CASE WHEN l.tipo = 'receita' AND l.status = 'pago' THEN l.valor ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN l.tipo = 'despesa' AND l.status = 'pago' THEN l.valor ELSE 0 END), 0) AS saldo
  FROM months m
  LEFT JOIN lancamentos_financeiros l 
    ON date_trunc('month', l.data_pagamento) = m.month_date
    AND l.condominio_id = p_condominio_id
    AND l.status = 'pago'
  GROUP BY m.month_date
  ORDER BY m.month_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
