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
    const {
      name,
      email,
      phone,
      isClassTeacher,
      isSubjectTeacher,
      password,
      classId,
      subjectAssignments,
    } = body;

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

    if (isClassTeacher && !classId) {
      return NextResponse.json(
        { error: 'Class selection is required when Class Teacher is selected' },
        { status: 400 }
      );
    }

    if (subjectAssignments && !Array.isArray(subjectAssignments)) {
      return NextResponse.json(
        { error: 'Invalid subject assignments format' },
        { status: 400 }
      );
    }

    if (isSubjectTeacher && (!Array.isArray(subjectAssignments) || subjectAssignments.length === 0)) {
      return NextResponse.json(
        { error: 'At least one subject assignment is required when Subject Teacher is selected' },
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
      email_confirm: true,
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
        email_verified: true,
        password_change_required: true,
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

    try {
      // Assign class if teacher is a class teacher
      if (isClassTeacher && classId) {
        const { error: classUpdateError } = await supabaseAdmin
          .from('classes')
          .update({
            class_teacher_id: userData.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', classId);

        if (classUpdateError) {
          throw classUpdateError;
        }
      }

      // Assign subjects if provided
      if (Array.isArray(subjectAssignments) && subjectAssignments.length > 0) {
        const insertData = subjectAssignments.map((assignment: any) => ({
          teacher_id: userData.id,
          subject_id: assignment.subjectId,
          class_id: assignment.classId,
        }));

        const { error: assignmentsError } = await supabaseAdmin
          .from('subject_assignments')
          .insert(insertData);

        if (assignmentsError) {
          throw assignmentsError;
        }
      }
    } catch (assignmentError) {
      // Best-effort rollback to avoid partial teacher records
      await supabaseAdmin
        .from('subject_assignments')
        .delete()
        .eq('teacher_id', userData.id);

      if (classId) {
        await supabaseAdmin
          .from('classes')
          .update({
            class_teacher_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', classId)
          .eq('class_teacher_id', userData.id);
      }

      await supabaseAdmin.from('users').delete().eq('id', userData.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      throw assignmentError;
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

