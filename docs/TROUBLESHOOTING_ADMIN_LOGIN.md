# Troubleshooting Admin Login - "User profile not found"

## Problem

When logging in as admin, you get the error: **"User profile not found"**

## Cause

This error means:
- ✅ Your admin user exists in **Supabase Auth** (auth.users table)
- ❌ Your admin user does NOT exist in **public.users** table

The login succeeds in Supabase Auth, but the system can't find the user profile in the database.

## Solution

### Step 1: Get Your Auth User ID

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your admin user
3. Copy the **ID** (UUID) - this is your `auth_user_id`

### Step 2: Insert Admin User into Database

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query to get your auth user ID (replace with your email):

```sql
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'your-admin-email@example.com';
```

3. Copy the `id` (UUID) from the result

4. Run this INSERT statement (replace the placeholders):

```sql
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
  'PASTE_YOUR_AUTH_USER_ID_HERE',  -- The UUID from step 3
  'your-admin-email@example.com',  -- Your admin email
  'Admin User',
  'admin',
  '+233123456789',
  true,
  true,
  false,
  false,
  false
)
ON CONFLICT (email) DO UPDATE
SET 
  auth_user_id = EXCLUDED.auth_user_id,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Also insert into admins table
INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

### Step 3: Verify Admin User

Run this query to verify:

```sql
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.email_verified,
  u.auth_user_id,
  a.id as admin_id,
  CASE 
    WHEN a.id IS NULL THEN 'Missing admin record'
    ELSE 'OK'
  END as status
FROM public.users u
LEFT JOIN public.admins a ON a.user_id = u.id
WHERE u.email = 'your-admin-email@example.com';
```

You should see:
- ✅ User record exists
- ✅ Admin record exists
- ✅ `auth_user_id` matches the UUID from auth.users

### Step 4: Try Login Again

1. Go to your login page
2. Enter your admin email and password
3. Should now login successfully!

## Quick Fix Script

If you want a one-step solution, use this script (replace placeholders):

```sql
-- Get auth user ID and insert into public.users in one go
DO $$
DECLARE
  v_auth_user_id UUID;
  v_user_id UUID;
BEGIN
  -- Get auth user ID
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = 'your-admin-email@example.com';
  
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found in auth.users. Please create the user in Authentication first.';
  END IF;
  
  -- Insert or update user
  INSERT INTO public.users (
    auth_user_id,
    email,
    name,
    role,
    is_active,
    email_verified,
    password_change_required,
    is_class_teacher,
    is_subject_teacher
  ) VALUES (
    v_auth_user_id,
    'your-admin-email@example.com',
    'Admin User',
    'admin',
    true,
    true,
    false,
    false,
    false
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    auth_user_id = EXCLUDED.auth_user_id,
    updated_at = NOW()
  RETURNING id INTO v_user_id;
  
  -- Insert into admins table
  INSERT INTO public.admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE NOTICE 'Admin user created/updated successfully!';
END $$;
```

## Common Issues

### Issue 1: "Admin user not found in auth.users"
**Solution:** Create the user in Supabase Auth first:
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Enter email and password
4. Check **Auto Confirm User**
5. Then run the INSERT script above

### Issue 2: "Duplicate key value violates unique constraint"
**Solution:** The user already exists. Use `ON CONFLICT` in the INSERT (already included in the script above).

### Issue 3: "auth_user_id mismatch"
**Solution:** The `auth_user_id` in public.users doesn't match the ID in auth.users. Update it:

```sql
UPDATE public.users
SET auth_user_id = 'CORRECT_UUID_FROM_AUTH_USERS'
WHERE email = 'your-admin-email@example.com';
```

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Make sure you've run all migrations (001, 003)

