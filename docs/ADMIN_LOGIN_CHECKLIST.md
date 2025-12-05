# Admin Login Checklist

Use this checklist to verify that everything is set up correctly for admin login with Supabase.

## ✅ Prerequisites

- [ ] Supabase project created
- [ ] Environment variables added to `.env.local`:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

## ✅ Database Setup

- [ ] Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
- [ ] Run `supabase/migrations/003_add_teacher_role_flags.sql` in Supabase SQL Editor
- [ ] Verify tables are created:
  - [ ] `users` table exists
  - [ ] `admins` table exists
  - [ ] `is_class_teacher` and `is_subject_teacher` columns exist in `users` table

## ✅ Admin User Setup

- [ ] Create admin user in Supabase Auth:
  - [ ] Go to **Authentication** → **Users**
  - [ ] Click **Add User** → **Create New User**
  - [ ] Enter admin email and password
  - [ ] Check **Auto Confirm User**
  - [ ] Copy the **User UID** (UUID)

- [ ] Insert admin into database:
  - [ ] Open Supabase SQL Editor
  - [ ] Edit `supabase/migrations/002_insert_admin.sql`
  - [ ] Replace `YOUR_AUTH_USER_ID` with the UUID from above
  - [ ] Replace `YOUR_ADMIN_EMAIL@example.com` with your admin email
  - [ ] Run the SQL script

- [ ] Verify admin user:
  ```sql
  SELECT u.*, a.id as admin_id
  FROM public.users u
  LEFT JOIN public.admins a ON a.user_id = u.id
  WHERE u.role = 'admin';
  ```
  - [ ] Should return your admin user with an admin record

## ✅ Code Setup

- [ ] Verify `lib/supabase/client.ts` exists and has correct environment variables
- [ ] Verify `lib/services/auth-service.ts` exists and uses Supabase
- [ ] Verify `lib/stores/auth-store.ts` uses `authService` (not `mockAuthService`)
- [ ] Verify `components/auth/AuthSessionProvider.tsx` exists
- [ ] Verify `app/layout.tsx` wraps children with `AuthSessionProvider`

## ✅ Testing

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Login:**
   - [ ] Navigate to `http://localhost:3000`
   - [ ] Enter admin email and password
   - [ ] Click "Sign in"
   - [ ] Should redirect to `/admin/dashboard`
   - [ ] Should see admin dashboard

3. **Test Session Persistence:**
   - [ ] After logging in, refresh the page
   - [ ] Should remain logged in (not redirected to login page)
   - [ ] User data should persist

4. **Test Logout:**
   - [ ] Click logout button
   - [ ] Should redirect to login page
   - [ ] Should not be able to access protected routes

## ✅ Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` file exists
- Verify all three environment variables are set
- Restart development server after adding variables

### "User profile not found"
- Verify admin user exists in both `auth.users` and `public.users`
- Check that `auth_user_id` in `public.users` matches the UUID in `auth.users`

### "Invalid email or password"
- Verify admin user exists in Supabase Auth
- Check that password is correct
- Verify email is confirmed (Auto Confirm User was checked)

### "Account is inactive"
- Check `is_active` column in `public.users` table
- Should be `true` for admin user

### Session not persisting after refresh
- Verify `AuthSessionProvider` is in `app/layout.tsx`
- Check browser console for errors
- Verify Supabase client is configured correctly

## ✅ Next Steps After Successful Login

- [ ] Test creating a teacher account
- [ ] Test email verification flow
- [ ] Test password reset flow
- [ ] Test password change flow

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Check Next.js server logs
4. Review error messages carefully

