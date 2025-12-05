import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { subjectAssignmentService } from '@/lib/services/subject-assignment-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * DELETE /api/subject-assignments/[id]
 * Delete a subject assignment
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
    await subjectAssignmentService.deleteSubjectAssignment(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting subject assignment:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

