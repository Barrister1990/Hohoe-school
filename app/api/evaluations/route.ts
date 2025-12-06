import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { evaluationService, CreateEvaluationData } from '@/lib/services/evaluation-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/evaluations
 * Get evaluations with optional filters
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
    const classId = searchParams.get('classId') || undefined;
    const term = searchParams.get('term') ? parseInt(searchParams.get('term')!) : undefined;
    const academicYear = searchParams.get('academicYear') || undefined;

    if (studentId && term && academicYear) {
      // Get single evaluation
      const evaluation = await evaluationService.getEvaluation(
        supabase,
        studentId,
        term,
        academicYear
      );
      return NextResponse.json(evaluation);
    } else if (classId) {
      // Get evaluations for a class
      const evaluations = await evaluationService.getEvaluationsByClass(
        supabase,
        classId,
        term,
        academicYear
      );
      return NextResponse.json(evaluations);
    } else {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/evaluations
 * Create or update evaluation
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
    const evaluationData: CreateEvaluationData = {
      studentId: body.studentId,
      teacherId: body.teacherId || user.id,
      term: body.term,
      academicYear: body.academicYear,
      conductRating: body.conductRating,
      conductRemarks: body.conductRemarks,
      interestLevel: body.interestLevel,
      interestRemarks: body.interestRemarks,
      classTeacherRemarks: body.classTeacherRemarks,
    };

    const evaluation = await evaluationService.upsertEvaluation(supabase, evaluationData);
    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

