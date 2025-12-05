# RLS Policy Explanation

## The Problem

When a user logs in, the system needs to:
1. Authenticate with Supabase Auth ✅
2. Query the `public.users` table to get user profile ❌ (Blocked by RLS)

## Why It Fails

The RLS policy was checking if the user is an admin by querying the `users` table:
```sql
EXISTS (
  SELECT 1 FROM public.users u
  WHERE u.email = auth.jwt() ->> 'email'
  AND u.role = 'admin'
)
```

But to check if the user is an admin, we need to SELECT from `users` table, which requires the policy to pass - creating a circular dependency.

## The Solution

### 1. Separate SELECT Policy
- **"Users can view own profile"**: Allows any authenticated user to SELECT their own record
- Uses `email = auth.jwt() ->> 'email'` to match the logged-in user
- This allows login to work

### 2. Admin Policies for Modifications
- **"Admins can modify users"**: Only for INSERT/UPDATE/DELETE operations
- Admins can modify any user record
- Regular users can only view their own

### 3. Policy Order Matters
- SELECT policies are checked first
- If a SELECT policy allows access, the query succeeds
- Other policies (INSERT/UPDATE/DELETE) are checked separately

## Current Policy Structure

```sql
-- 1. Users can SELECT their own profile (for login)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- 2. Admins can do everything else (INSERT/UPDATE/DELETE)
CREATE POLICY "Admins can modify users" ON public.users
  FOR ALL USING (role = 'admin');
```

## Testing

After running the migration:
1. Login should work - user can SELECT their own profile
2. Admin can modify users - admin policies allow modifications
3. No infinite recursion - policies don't reference each other

## Troubleshooting

If you still get "Unable to access your account information":

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'users';
   ```

2. **Check existing policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

3. **Verify user email matches:**
   ```sql
   -- Check auth user email
   SELECT email FROM auth.users WHERE id = auth.uid();
   
   -- Check public.users email
   SELECT email FROM public.users WHERE email = 'your-email@example.com';
   ```

4. **Temporarily disable RLS for testing:**
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   -- Test login
   -- Then re-enable: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ```

