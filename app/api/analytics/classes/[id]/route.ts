import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { analyticsService } from '@/lib/services/analytics-service';
import { formatError } from '@/lib/utils/error-formatter';

export async function GET(
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
    const searchParams = request.nextUrl.searchParams;
    const academicYear = searchParams.get('academicYear') || undefined;
    const term = searchParams.get('term') ? parseInt(searchParams.get('term')!) : undefined;

    const performance = await analyticsService.getClassPerformance(supabase, id, {
      academicYear,
      term,
    });

    if (!performance) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(performance);
  } catch (error: any) {
    console.error('Error fetching class performance:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

