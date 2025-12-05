import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { subjectAssignmentService } from '@/lib/services/subject-assignment-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * DELETE /api/subject-assignments/delete
 * Delete a subject assignment by teacher, subject, and class
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const subjectId = searchParams.get('subjectId');
    const classId = searchParams.get('classId');

    if (!teacherId || !subjectId || !classId) {
      return NextResponse.json(
        { error: 'Missing required parameters: teacherId, subjectId, classId' },
        { status: 400 }
      );
    }

    await subjectAssignmentService.deleteSubjectAssignmentByKeys(
      supabase,
      teacherId,
      subjectId,
      classId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting subject assignment:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

