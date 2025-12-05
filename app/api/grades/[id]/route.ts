import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { gradeService } from '@/lib/services/grade-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * DELETE /api/grades/[id]
 * Delete a grade
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
    await gradeService.deleteGrade(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting grade:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

