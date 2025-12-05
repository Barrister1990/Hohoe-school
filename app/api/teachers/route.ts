import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { teacherService } from '@/lib/services/teacher-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/teachers
 * Get all teachers
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

    const teachers = await teacherService.getTeachers(supabase);
    return NextResponse.json(teachers);
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

