import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { settingsService } from '@/lib/services/settings-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/settings/academic
 * Get academic settings
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

    const settings = await settingsService.getAcademicSettings(supabase);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching academic settings:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/academic
 * Update academic settings
 */
export async function PATCH(request: NextRequest) {
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
    const updated = await settingsService.updateAcademicSettings(supabase, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating academic settings:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

