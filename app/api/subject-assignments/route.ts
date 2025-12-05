import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { subjectAssignmentService, CreateSubjectAssignmentData } from '@/lib/services/subject-assignment-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/subject-assignments
 * Get all subject assignments, optionally filtered
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
    const teacherId = searchParams.get('teacherId') || undefined;
    const classId = searchParams.get('classId') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;

    const assignments = await subjectAssignmentService.getSubjectAssignments(supabase, {
      teacherId,
      classId,
      subjectId,
    });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error('Error fetching subject assignments:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subject-assignments
 * Create one or more subject assignments
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

    // Check if it's a single assignment or array
    if (Array.isArray(body)) {
      const assignmentsData: CreateSubjectAssignmentData[] = body;
      const assignments = await subjectAssignmentService.createSubjectAssignments(supabase, assignmentsData);
      return NextResponse.json(assignments, { status: 201 });
    } else {
      const assignmentData: CreateSubjectAssignmentData = body;
      const assignment = await subjectAssignmentService.createSubjectAssignment(supabase, assignmentData);
      return NextResponse.json(assignment, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating subject assignments:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

