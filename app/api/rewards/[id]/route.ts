import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { evaluationService } from '@/lib/services/evaluation-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * DELETE /api/rewards/[id]
 * Delete a reward
 */
export async function DELETE(
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
    await evaluationService.deleteReward(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reward:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

