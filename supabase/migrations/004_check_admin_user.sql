-- ============================================
-- CHECK ADMIN USER SETUP
-- Run this to verify your admin user is set up correctly
-- ============================================

-- Check if admin user exists in public.users
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.email_verified,
  u.password_change_required,
  u.auth_user_id,
  a.id as admin_id,
  CASE 
    WHEN a.id IS NULL THEN '❌ Missing admin record'
    ELSE '✅ Admin record exists'
  END as admin_status
FROM public.users u
LEFT JOIN public.admins a ON a.user_id = u.id
WHERE u.role = 'admin';

-- Check if auth user exists and matches
-- Replace 'YOUR_ADMIN_EMAIL@example.com' with your actual admin email
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at,
  u.id as public_user_id,
  u.email as public_email,
  CASE 
    WHEN u.id IS NULL THEN '❌ User not in public.users table'
    WHEN u.auth_user_id != au.id THEN '⚠️ auth_user_id mismatch'
    ELSE '✅ User exists in both tables'
  END as status
FROM auth.users au
LEFT JOIN public.users u ON u.email = au.email
WHERE au.email = 'YOUR_ADMIN_EMAIL@example.com'; -- Replace with your admin email

-- If the above query shows user not in public.users, run this to insert:
-- (Replace YOUR_AUTH_USER_ID and YOUR_ADMIN_EMAIL@example.com)
/*
INSERT INTO public.users (
  auth_user_id,
  email,
  name,
  role,
  is_active,
  email_verified,
  password_change_required
) VALUES (
  'YOUR_AUTH_USER_ID',  -- Get this from auth.users table
  'YOUR_ADMIN_EMAIL@example.com',
  'Admin User',
  'admin',
  true,
  true,
  false
)
ON CONFLICT (email) DO UPDATE
SET 
  auth_user_id = EXCLUDED.auth_user_id,
  updated_at = NOW();

INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
ON CONFLICT (user_id) DO NOTHING;
*/

