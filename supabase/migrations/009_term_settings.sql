-- ============================================
-- TERM SETTINGS TABLE
-- Stores closing and reopening dates for each term
-- ============================================
CREATE TABLE IF NOT EXISTS public.term_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year TEXT NOT NULL,
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  closing_date DATE,
  reopening_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(academic_year, term) -- One record per term per academic year
);

CREATE INDEX IF NOT EXISTS idx_term_settings_academic_year ON public.term_settings(academic_year);
CREATE INDEX IF NOT EXISTS idx_term_settings_term ON public.term_settings(term);
CREATE INDEX IF NOT EXISTS idx_term_settings_year_term ON public.term_settings(academic_year, term);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_term_settings_updated_at BEFORE UPDATE ON public.term_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE public.term_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read term settings
CREATE POLICY "Authenticated users can read term settings" ON public.term_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can modify term settings
CREATE POLICY "Admins can modify term settings" ON public.term_settings
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

