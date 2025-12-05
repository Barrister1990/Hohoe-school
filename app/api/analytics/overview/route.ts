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
    const teacherId = searchParams.get('teacherId') || undefined;
    const classId = searchParams.get('classId') || undefined;

    const overview = await analyticsService.getAnalyticsOverview(supabase, {
      academicYear,
      term,
      teacherId,
      classId,
    });

    return NextResponse.json(overview);
  } catch (error: any) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

