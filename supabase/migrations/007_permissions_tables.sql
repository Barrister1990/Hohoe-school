-- ============================================
-- PERMISSIONS TABLE
-- Stores available permissions in the system
-- ============================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON public.permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);

-- ============================================
-- USER PERMISSIONS TABLE
-- Links users to their permissions
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON public.user_permissions(permission_id);

-- ============================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================
INSERT INTO public.permissions (code, name, description, category) VALUES
  ('view_students', 'View Students', 'View student information and profiles', 'Students'),
  ('add_students', 'Add Students', 'Add new students to the system', 'Students'),
  ('edit_students', 'Edit Students', 'Modify student information', 'Students'),
  ('view_grades', 'View Grades', 'View student grades and assessments', 'Grades'),
  ('enter_grades', 'Enter Grades', 'Enter and update student grades', 'Grades'),
  ('create_assessments', 'Create Assessments', 'Create new assessments and exams', 'Grades'),
  ('view_reports', 'View Reports', 'Access student and class reports', 'Reports'),
  ('export_data', 'Export Data', 'Export data to CSV or PDF', 'Reports')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read permissions
CREATE POLICY "Authenticated users can read permissions" ON public.permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions" ON public.user_permissions
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Admins can view all user permissions
CREATE POLICY "Admins can view all user permissions" ON public.user_permissions
  FOR SELECT USING (public.is_admin());

-- Admins can modify permissions
CREATE POLICY "Admins can modify permissions" ON public.permissions
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can modify user permissions
CREATE POLICY "Admins can modify user permissions" ON public.user_permissions
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

