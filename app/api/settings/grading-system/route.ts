import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { gradingService } from '@/lib/services/grading-service';
import { formatError } from '@/lib/utils/error-formatter';
import { GradingSystem } from '@/types/grading-system';

/**
 * GET /api/settings/grading-system
 * Get active grading system
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

    const system = await gradingService.getGradingSystem(supabase);
    return NextResponse.json(system);
  } catch (error: any) {
    console.error('Error fetching grading system:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/grading-system
 * Update grading system
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
    const systemData: Omit<GradingSystem, 'createdAt' | 'updatedAt'> = {
      id: body.id || '',
      name: body.name,
      description: body.description || '',
      gradeLevels: body.gradeLevels,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const updated = await gradingService.updateGradingSystem(supabase, systemData);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating grading system:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

