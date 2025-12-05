import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { classService, CreateClassData } from '@/lib/services/class-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/classes
 * Get all classes
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

    const classes = await classService.getClasses(supabase);
    return NextResponse.json(classes);
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/classes
 * Create a new class
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
    const classData: CreateClassData = {
      name: body.name,
      level: body.level,
      stream: body.stream,
      classTeacherId: body.classTeacherId,
      capacity: body.capacity || 30,
    };

    const newClass = await classService.createClass(supabase, classData);
    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

