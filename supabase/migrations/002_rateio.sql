-- =====================================================
-- CONDOGEST - Rateio Condominial
-- Migration para tabela de rateios e lançamentos gerados
-- Execute APÓS a migration 001_initial_schema.sql
-- =====================================================

-- Enum para modelo de rateio
CREATE TYPE modelo_rateio AS ENUM ('igualitario', 'fracao_ideal', 'valor_fixo');

-- Tabela de Rateios (registro de cada operação de rateio realizada)
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
  
  -- Impedir rateio duplicado da mesma despesa
  UNIQUE(despesa_id)
);

-- Itens do rateio (um registro por unidade participante)
CREATE TABLE rateio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rateio_id UUID NOT NULL REFERENCES rateios(id) ON DELETE CASCADE,
  unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE RESTRICT,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  fracao_ideal DECIMAL(10, 6),
  lancamento_gerado_id UUID REFERENCES lancamentos_financeiros(id) ON DELETE SET NULL,
  
  -- Impedir duplicata de unidade no mesmo rateio
  UNIQUE(rateio_id, unidade_id)
);

-- Indexes
CREATE INDEX idx_rateios_condominio ON rateios(condominio_id);
CREATE INDEX idx_rateios_despesa ON rateios(despesa_id);
CREATE INDEX idx_rateio_items_rateio ON rateio_items(rateio_id);
CREATE INDEX idx_rateio_items_unidade ON rateio_items(unidade_id);

-- RLS
ALTER TABLE rateios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rateio_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Rateio
CREATE POLICY "Users can view rateios of their condominio"
  ON rateios FOR SELECT
  USING (condominio_id = get_user_condominio_id() OR is_admin_saas());

CREATE POLICY "Sindicos can manage rateios"
  ON rateios FOR ALL
  USING (
    condominio_id = get_user_condominio_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN_SAAS', 'ADMIN_CONDOMINIO', 'SINDICO')
    )
  );

-- Políticas de Rateio Items
CREATE POLICY "Users can view rateio items"
  ON rateio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rateios r 
      WHERE r.id = rateio_items.rateio_id 
      AND (r.condominio_id = get_user_condominio_id() OR is_admin_saas())
    )
  );

CREATE POLICY "Sindicos can manage rateio items"
  ON rateio_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rateios r 
      WHERE r.id = rateio_items.rateio_id 
      AND r.condominio_id = get_user_condominio_id()
      AND EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN_SAAS', 'ADMIN_CONDOMINIO', 'SINDICO')
      )
    )
  );

-- =====================================================
-- Validação: soma das frações ideais de um condomínio
-- =====================================================
CREATE OR REPLACE FUNCTION validar_fracoes_ideais(p_condominio_id UUID)
RETURNS TABLE (
  soma_fracoes DECIMAL,
  valido BOOLEAN,
  diferenca DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(u.fracao_ideal), 0) AS soma_fracoes,
    ABS(COALESCE(SUM(u.fracao_ideal), 0) - 1.0) < 0.000001 AS valido,
    ABS(COALESCE(SUM(u.fracao_ideal), 0) - 1.0) AS diferenca
  FROM unidades u
  WHERE u.condominio_id = p_condominio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
