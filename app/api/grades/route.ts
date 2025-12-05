import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { gradeService, CreateGradeData } from '@/lib/services/grade-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/grades
 * Get grades with optional filters
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
    const studentId = searchParams.get('studentId') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const classId = searchParams.get('classId') || undefined;
    const teacherId = searchParams.get('teacherId') || undefined;
    const term = searchParams.get('term') ? parseInt(searchParams.get('term')!) : undefined;
    const academicYear = searchParams.get('academicYear') || undefined;
    const withDetails = searchParams.get('withDetails') === 'true';

    if (withDetails) {
      const grades = await gradeService.getGradesWithDetails(supabase, {
        studentId,
        subjectId,
        classId,
        teacherId,
        term,
        academicYear,
      });
      return NextResponse.json(grades);
    } else {
      const grades = await gradeService.getGrades(supabase, {
        studentId,
        subjectId,
        classId,
        teacherId,
        term,
        academicYear,
      });
      return NextResponse.json(grades);
    }
  } catch (error: any) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades
 * Create or update grade
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
    const gradeData: CreateGradeData = {
      studentId: body.studentId,
      subjectId: body.subjectId,
      classId: body.classId,
      teacherId: body.teacherId || user.id,
      term: body.term,
      academicYear: body.academicYear,
      project: body.project,
      test1: body.test1,
      test2: body.test2,
      groupWork: body.groupWork,
      exam: body.exam,
    };

    const grade = await gradeService.upsertGrade(supabase, gradeData);
    return NextResponse.json(grade);
  } catch (error: any) {
    console.error('Error saving grade:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

