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
    const academicYear = searchParams.get('academicYear');

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year is required' },
        { status: 400 }
      );
    }

    const analytics = await analyticsService.getBECEAnalytics(supabase, academicYear);

    if (!analytics) {
      return NextResponse.json(
        { error: 'No BECE data found for this academic year' },
        { status: 404 }
      );
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching BECE analytics:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

