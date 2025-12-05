import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { beceService, UpdateBECEResultData } from '@/lib/services/bece-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * PATCH /api/bece-results/[id]
 * Update a BECE result
 */
export async function PATCH(
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
    const body = await request.json();
    const updateData: UpdateBECEResultData = {
      id,
      ...body,
    };

    const updated = await beceService.updateBECEResult(supabase, updateData);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating BECE result:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bece-results/[id]
 * Delete a BECE result
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
    await beceService.deleteBECEResult(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting BECE result:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

