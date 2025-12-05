-- ============================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- ============================================

-- Create a security definer function to check if current user is admin
-- This bypasses RLS when checking admin status, preventing recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
DROP POLICY IF EXISTS "Admins can do everything" ON public.admins;

-- Fix: Use auth.uid() instead of email for better reliability
-- This avoids infinite recursion and is more efficient

-- IMPORTANT: For login to work, users need to be able to SELECT their own profile
-- The "Users can view own profile" policy handles this
-- Admin policies are for INSERT/UPDATE/DELETE operations

-- Users can view their own profile (using auth_user_id from auth.uid())
-- This is critical for login - users must be able to SELECT their own record
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

-- Admins can view all users (using security definer function to avoid recursion)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- Policy for users table: Admins can INSERT/UPDATE/DELETE everything
-- Note: SELECT is handled by separate policies above
DROP POLICY IF EXISTS "Admins can modify users" ON public.users;
CREATE POLICY "Admins can modify users" ON public.users
  FOR INSERT, UPDATE, DELETE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy for admins table: Admins can do everything
-- Using security definer function to avoid recursion
DROP POLICY IF EXISTS "Admins can access admins" ON public.admins;
CREATE POLICY "Admins can access admins" ON public.admins
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow all authenticated users to read all tables
-- These can be restricted later based on requirements

-- Classes
DROP POLICY IF EXISTS "Authenticated users can read" ON public.classes;
DROP POLICY IF EXISTS "Authenticated users can read classes" ON public.classes;
CREATE POLICY "Authenticated users can read classes" ON public.classes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Students
DROP POLICY IF EXISTS "Authenticated users can read" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can read students" ON public.students;
CREATE POLICY "Authenticated users can read students" ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

-- Subjects
DROP POLICY IF EXISTS "Authenticated users can read" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can read subjects" ON public.subjects;
CREATE POLICY "Authenticated users can read subjects" ON public.subjects
  FOR SELECT USING (auth.role() = 'authenticated');

-- Subject Assignments
DROP POLICY IF EXISTS "Authenticated users can read subject_assignments" ON public.subject_assignments;
CREATE POLICY "Authenticated users can read subject_assignments" ON public.subject_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grades
DROP POLICY IF EXISTS "Authenticated users can read grades" ON public.grades;
CREATE POLICY "Authenticated users can read grades" ON public.grades
  FOR SELECT USING (auth.role() = 'authenticated');

-- Attendance
DROP POLICY IF EXISTS "Authenticated users can read attendance" ON public.attendance;
CREATE POLICY "Authenticated users can read attendance" ON public.attendance
  FOR SELECT USING (auth.role() = 'authenticated');

-- Class Teacher Evaluations
DROP POLICY IF EXISTS "Authenticated users can read class_teacher_evaluations" ON public.class_teacher_evaluations;
CREATE POLICY "Authenticated users can read class_teacher_evaluations" ON public.class_teacher_evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Class Teacher Rewards
DROP POLICY IF EXISTS "Authenticated users can read class_teacher_rewards" ON public.class_teacher_rewards;
CREATE POLICY "Authenticated users can read class_teacher_rewards" ON public.class_teacher_rewards
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grading System
DROP POLICY IF EXISTS "Authenticated users can read grading_system" ON public.grading_system;
CREATE POLICY "Authenticated users can read grading_system" ON public.grading_system
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grade Levels
DROP POLICY IF EXISTS "Authenticated users can read grade_levels" ON public.grade_levels;
CREATE POLICY "Authenticated users can read grade_levels" ON public.grade_levels
  FOR SELECT USING (auth.role() = 'authenticated');

-- BECE Results
DROP POLICY IF EXISTS "Authenticated users can read bece_results" ON public.bece_results;
CREATE POLICY "Authenticated users can read bece_results" ON public.bece_results
  FOR SELECT USING (auth.role() = 'authenticated');

