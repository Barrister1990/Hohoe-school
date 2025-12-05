# Supabase Setup Guide

This guide will help you set up Supabase for the Hohoe LMS system.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Environment variables configured

## Step 1: Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to find these:**
- Go to your Supabase project dashboard
- Navigate to **Settings** > **API**
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 2: Run Database Migrations

1. **Option A: Using Supabase Dashboard (Recommended)**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run** to execute the migration

2. **Option B: Using Supabase CLI**
   ```bash
   # Install Supabase CLI (if not already installed)
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

## Step 3: Create Admin User

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **Add User** > **Create New User**
3. Enter:
   - **Email**: Your admin email
   - **Password**: Your admin password
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create User**
5. Copy the **User UID** (UUID) from the user list

### Method 2: Via SQL

1. First, create the user in Supabase Auth (via Dashboard or API)
2. Get the User UID from **Authentication** > **Users**
3. Open **SQL Editor** in Supabase Dashboard
4. Edit and run `supabase/migrations/002_insert_admin.sql`:
   - Replace `YOUR_AUTH_USER_ID` with the UUID from step 2
   - Replace `YOUR_ADMIN_EMAIL@example.com` with your actual admin email
5. Click **Run**

### Verify Admin Creation

Run this query in SQL Editor to verify:

```sql
SELECT u.*, a.id as admin_id
FROM public.users u
LEFT JOIN public.admins a ON a.user_id = u.id
WHERE u.role = 'admin';
```

You should see your admin user with an admin record.

## Step 4: Configure Email Templates (Optional)

1. Go to **Authentication** > **Email Templates** in Supabase Dashboard
2. Customize the email templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

## Step 5: Configure Row Level Security (RLS)

The migration script includes basic RLS policies. You may want to refine them based on your security requirements.

To test RLS:
1. Go to **Authentication** > **Policies**
2. Review the policies created
3. Adjust as needed

## Step 6: Test Authentication

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Try logging in with your admin credentials
4. Verify that:
   - Login works
   - User session is maintained
   - Logout works

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains all required variables
- Restart your development server after adding environment variables

### "User profile not found"
- Make sure you've run the database migrations
- Verify the user exists in both `auth.users` and `public.users`

### "Failed to create user account"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify the service role key has admin permissions

### Email verification not working
- Check **Authentication** > **Settings** > **Email Auth**
- Ensure email provider is configured
- Check email templates in **Authentication** > **Email Templates**

## Next Steps

After setting up authentication:
1. Test teacher creation via the admin panel
2. Test email verification flow
3. Test password reset flow
4. Configure additional RLS policies as needed

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to version control
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- The service role key bypasses RLS - use it only in server-side API routes
- Regularly review and update RLS policies

## Support

For issues:
1. Check Supabase logs in the dashboard
2. Check browser console for client-side errors
3. Check Next.js server logs
4. Review Supabase documentation: https://supabase.com/docs

