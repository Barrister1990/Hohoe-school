-- ============================================
-- INSERT ADMIN USER
-- Replace the email and password with your actual admin credentials
-- ============================================

-- First, create the user in Supabase Auth (this should be done via Supabase Dashboard or Auth API)
-- Then run this script to create the user record and admin record

-- Example: Insert admin user (replace with your actual email)
-- The auth_user_id should match the UUID from auth.users table
-- You can get this by checking the auth.users table in Supabase Dashboard

-- Step 1: Insert into public.users
-- Replace 'YOUR_ADMIN_EMAIL@example.com' with your actual admin email
-- Replace 'YOUR_AUTH_USER_ID' with the UUID from auth.users table

INSERT INTO public.users (
  auth_user_id,
  email,
  name,
  role,
  phone,
  is_active,
  email_verified,
  password_change_required,
  is_class_teacher,
  is_subject_teacher
) VALUES (
  '80dfe6f7-e9cb-4a38-ba5a-7733b7df14a0',  -- Replace with actual UUID from auth.users
  'admin@hohoe.edu.gh',  -- Replace with your admin email
  'Admin User',
  'admin',
  '+233123456789',
  true,
  true,  -- Set to true if email is verified
  false,  -- Set to true if password change is required
  false,  -- Admin is not a class teacher
  false   -- Admin is not a subject teacher
)
ON CONFLICT (email) DO UPDATE
SET 
  auth_user_id = EXCLUDED.auth_user_id,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_class_teacher = EXCLUDED.is_class_teacher,
  is_subject_teacher = EXCLUDED.is_subject_teacher,
  updated_at = NOW();

-- Step 2: Insert into public.admins
INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'admin@hohoe.edu.gh'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ALTERNATIVE: If you want to create admin via SQL only
-- (Note: This requires creating the auth user first via Supabase Dashboard)
-- ============================================

-- To find your auth user ID:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find your admin user
-- 3. Copy the UUID (it's in the ID column)
-- 4. Replace '80dfe6f7-e9cb-4a38-ba5a-7733b7df14a0' above with that UUID

