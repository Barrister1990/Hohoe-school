import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { beceService } from '@/lib/services/bece-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/bece-results/student/[studentId]
 * Get BECE results for a specific student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
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

    const { studentId } = await params;
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || undefined;

    const results = await beceService.getBECEResultsByStudent(
      supabase,
      studentId,
      academicYear || undefined
    );
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching BECE results:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

