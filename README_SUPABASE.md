# Supabase Integration - Quick Start

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Run SQL Migrations

1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_insert_admin.sql` (after creating admin user in Auth)

### 3. Create Admin User

**Via Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Enter email and password
4. Check **Auto Confirm User**
5. Copy the **User UID** (UUID)

**Then run SQL:**
```sql
-- Replace YOUR_AUTH_USER_ID and YOUR_ADMIN_EMAIL@example.com
INSERT INTO public.users (
  auth_user_id, email, name, role, is_active, email_verified
) VALUES (
  'YOUR_AUTH_USER_ID',
  'YOUR_ADMIN_EMAIL@example.com',
  'Admin User',
  'admin',
  true,
  true
);

INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
```

### 4. Test Login

1. Start dev server: `npm run dev`
2. Login with your admin credentials
3. Try creating a teacher account

## Files Created

- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/services/auth-service.ts` - Authentication service (Supabase)
- `app/api/teachers/create/route.ts` - API route for creating teachers
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `supabase/migrations/002_insert_admin.sql` - Admin insertion script

## Important Notes

- Service role key should NEVER be exposed to client
- All admin operations go through API routes
- Email verification is required for new teachers
- Teachers must change password on first login

For detailed setup, see `docs/SUPABASE_SETUP.md`

