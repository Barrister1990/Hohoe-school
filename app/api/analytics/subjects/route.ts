import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { analyticsService } from '@/lib/services/analytics-service';
import { formatError } from '@/lib/utils/error-formatter';

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

    const searchParams = request.nextUrl.searchParams;
    const academicYear = searchParams.get('academicYear') || undefined;
    const term = searchParams.get('term') ? parseInt(searchParams.get('term')!) : undefined;
    const classId = searchParams.get('classId') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;

    const performance = await analyticsService.getSubjectPerformance(supabase, {
      academicYear,
      term,
      classId,
      subjectId,
    });

    return NextResponse.json(performance);
  } catch (error: any) {
    console.error('Error fetching subject performance:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

