import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { classService } from '@/lib/services/class-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/classes/teacher/[teacherId]
 * Get classes assigned to a teacher (as class teacher)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
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

    const { teacherId } = await params;
    
    // Get all classes and filter by class_teacher_id
    const allClasses = await classService.getClasses(supabase);
    const teacherClasses = allClasses.filter((c) => c.classTeacherId === teacherId);

    return NextResponse.json(teacherClasses);
  } catch (error: any) {
    console.error('Error fetching teacher classes:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

