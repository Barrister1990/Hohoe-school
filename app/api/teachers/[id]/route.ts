import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { teacherService, UpdateTeacherData } from '@/lib/services/teacher-service';
import { formatError } from '@/lib/utils/error-formatter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key for admin operations
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * GET /api/teachers/[id]
 * Get a single teacher by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const teacher = await teacherService.getTeacher(supabase, id);
    
    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error: any) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teachers/[id]
 * Update a teacher
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const updateData: UpdateTeacherData = {
      id,
      ...body,
    };

    const updatedTeacher = await teacherService.updateTeacher(supabase, updateData);
    return NextResponse.json(updatedTeacher);
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teachers/[id]
 * Delete a teacher
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // First, get the teacher to retrieve auth_user_id
    const { data: teacherData, error: fetchError } = await supabase
      .from('users')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    if (fetchError || !teacherData) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const authUserId = teacherData.auth_user_id;

    // Delete from Supabase Auth using admin client (use auth_user_id, not id)
    if (authUserId) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
      
      if (authError) {
        console.error('Failed to delete user from auth:', authError);
        // Still continue with database deletion, but log the error
        // The database deletion will cascade if auth_user_id has ON DELETE CASCADE
      }
    }

    // Delete from users table
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

