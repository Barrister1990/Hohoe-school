import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { studentService } from '@/lib/services/student-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/students/generate-id
 * Generate next student ID
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

    const studentId = await studentService.generateNextStudentId(supabase);
    return NextResponse.json({ studentId });
  } catch (error: any) {
    console.error('Error generating student ID:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

