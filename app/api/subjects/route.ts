import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { subjectService } from '@/lib/services/subject-service';
import { formatError } from '@/lib/utils/error-formatter';
import { Subject } from '@/types';

/**
 * GET /api/subjects
 * Get all subjects
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

    const subjects = await subjectService.getSubjects(supabase);
    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subjects
 * Create a new subject
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
    const subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      code: body.code,
      category: body.category,
      levelCategories: body.levelCategories || [],
      description: body.description,
    };

    const subject = await subjectService.createSubject(supabase, subjectData);
    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

