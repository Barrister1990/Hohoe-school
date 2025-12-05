import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { subjectService, UpdateSubjectData } from '@/lib/services/subject-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/subjects/[id]
 * Get a single subject by ID
 */
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
    const subject = await subjectService.getSubject(supabase, id);
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subject);
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/subjects/[id]
 * Update a subject
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
    const updateData: UpdateSubjectData = {
      id,
      ...body,
    };

    const updatedSubject = await subjectService.updateSubject(supabase, updateData);
    return NextResponse.json(updatedSubject);
  } catch (error: any) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subjects/[id]
 * Delete a subject
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
    await subjectService.deleteSubject(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

