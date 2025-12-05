import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { studentService } from '@/lib/services/student-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/students/graduated
 * Get all graduated students
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all students and filter for graduated
    const allStudents = await studentService.getStudents(supabase);
    const graduatedStudents = allStudents.filter((s) => s.status === 'graduated');

    return NextResponse.json(graduatedStudents);
  } catch (error: any) {
    console.error('Error fetching graduated students:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

