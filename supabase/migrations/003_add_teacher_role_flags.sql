-- ============================================
-- ADD TEACHER ROLE FLAGS
-- Allows teachers to have both class_teacher and subject_teacher roles
-- ============================================

-- Add boolean flags for teacher roles
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_class_teacher BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_subject_teacher BOOLEAN DEFAULT false;

-- Update existing records based on role
UPDATE public.users 
SET 
  is_class_teacher = (role = 'class_teacher'),
  is_subject_teacher = (role = 'subject_teacher')
WHERE role IN ('class_teacher', 'subject_teacher');

-- Add constraint: teachers must have at least one role flag
-- Drop constraint if it exists first
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS check_teacher_roles;

ALTER TABLE public.users
ADD CONSTRAINT check_teacher_roles CHECK (
  role = 'admin' OR 
  (is_class_teacher = true OR is_subject_teacher = true)
);

-- Add indexes for role flags
CREATE INDEX IF NOT EXISTS idx_users_is_class_teacher ON public.users(is_class_teacher) WHERE is_class_teacher = true;
CREATE INDEX IF NOT EXISTS idx_users_is_subject_teacher ON public.users(is_subject_teacher) WHERE is_subject_teacher = true;

-- Update role check constraint to allow 'class_teacher' or 'subject_teacher' as primary role
-- The actual capabilities are determined by the boolean flags
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
  role IN ('admin', 'class_teacher', 'subject_teacher')
);

