import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { settingsService } from '@/lib/services/settings-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/settings/assessment
 * Get assessment structure
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

    const structure = await settingsService.getAssessmentStructure(supabase);
    return NextResponse.json(structure);
  } catch (error: any) {
    console.error('Error fetching assessment structure:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/assessment
 * Update assessment structure
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
    const updated = await settingsService.updateAssessmentStructure(supabase, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating assessment structure:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

