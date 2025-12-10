import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { settingsService } from '@/lib/services/settings-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/settings/term
 * Get term settings for an academic year
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

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year is required' },
        { status: 400 }
      );
    }

    const settings = await settingsService.getTermSettingsByYear(supabase, academicYear);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching term settings:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/term
 * Create or update term settings
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { academicYear, term, closingDate, reopeningDate } = body;

    if (!academicYear || !term) {
      return NextResponse.json(
        { error: 'Academic year and term are required' },
        { status: 400 }
      );
    }

    const updated = await settingsService.upsertTermSettings(supabase, {
      academicYear,
      term,
      closingDate: closingDate ? new Date(closingDate) : undefined,
      reopeningDate: reopeningDate ? new Date(reopeningDate) : undefined,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating term settings:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

