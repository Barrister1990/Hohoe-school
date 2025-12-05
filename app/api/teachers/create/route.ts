import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatError } from '@/lib/utils/error-formatter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, isClassTeacher, isSubjectTeacher, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // At least one role must be selected
    if (!isClassTeacher && !isSubjectTeacher) {
      return NextResponse.json(
        { error: 'Teacher must have at least one role (Class Teacher or Subject Teacher)' },
        { status: 400 }
      );
    }

    // Determine primary role (for role field - used for routing/navigation)
    // If both are selected, use 'class_teacher' as primary
    const primaryRole = isClassTeacher && isSubjectTeacher
      ? 'class_teacher'
      : isClassTeacher
      ? 'class_teacher'
      : 'subject_teacher';

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create user account' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile in public.users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        name,
        role: primaryRole, // Primary role for routing
        is_class_teacher: isClassTeacher || false,
        is_subject_teacher: isSubjectTeacher || false,
        phone: phone || null,
        is_active: true,
        email_verified: false,
        password_change_required: true, // Require password change on first login
      })
      .select()
      .single();

    if (userError) {
      // If user creation fails, try to clean up auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: userError.message || 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Send verification email using inviteUserByEmail (sends email automatically)
    // This will send a confirmation email with a link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${appUrl}/auth/callback`,
        data: {
          name,
          role: primaryRole,
        },
      }
    );

    // If invite fails, try to send a confirmation email manually
    if (inviteError) {
      console.warn('Failed to send invite email, trying alternative method:', inviteError);
      // Generate a confirmation link and send it via email template
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password: password,
      });
      // Note: In production, you would send this link via your email service
      // For now, the link is generated but email sending depends on Supabase email configuration
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        isActive: userData.is_active,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
    });
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      const friendlyError = formatError(error);
      return NextResponse.json(
        { error: friendlyError },
        { status: 500 }
      );
    }
}

