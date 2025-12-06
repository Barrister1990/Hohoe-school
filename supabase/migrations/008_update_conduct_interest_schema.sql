-- ============================================
-- Update class_teacher_evaluations table
-- Change conduct_rating and interest_level constraints
-- Add class_teacher_remarks field
-- ============================================

-- Drop existing constraints (PostgreSQL auto-generates constraint names)
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find and drop conduct_rating constraint
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.class_teacher_evaluations'::regclass
    AND contype = 'c'
    AND conname LIKE '%conduct_rating%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.class_teacher_evaluations DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END IF;
  
  -- Find and drop interest_level constraint
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.class_teacher_evaluations'::regclass
    AND contype = 'c'
    AND conname LIKE '%interest_level%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.class_teacher_evaluations DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END IF;
END $$;

-- Add new constraint for conduct_rating with new values
ALTER TABLE public.class_teacher_evaluations
  ADD CONSTRAINT class_teacher_evaluations_conduct_rating_check 
  CHECK (conduct_rating IS NULL OR conduct_rating IN ('Respectful', 'Obedience', 'Hardworking', 'Dutiful', 'Humble', 'Calm', 'Approachable', 'Unruly'));

-- Add new constraint for interest_level with new values
ALTER TABLE public.class_teacher_evaluations
  ADD CONSTRAINT class_teacher_evaluations_interest_level_check 
  CHECK (interest_level IS NULL OR interest_level IN ('Artwork', 'Reading', 'Football', 'Athletics', 'Music', 'Computing Skills'));

-- Add class_teacher_remarks field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'class_teacher_evaluations' 
    AND column_name = 'class_teacher_remarks'
  ) THEN
    ALTER TABLE public.class_teacher_evaluations
      ADD COLUMN class_teacher_remarks TEXT;
  END IF;
END $$;

