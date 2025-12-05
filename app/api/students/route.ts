import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { studentService, CreateStudentData } from '@/lib/services/student-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/students
 * Get all students, optionally filtered by class
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

    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId') || undefined;

    const students = await studentService.getStudents(supabase, classId || undefined);
    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create a new student
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
    const studentData: CreateStudentData = {
      studentId: body.studentId,
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      classId: body.classId,
      classTeacherId: body.classTeacherId,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      address: body.address,
      enrollmentDate: body.enrollmentDate || new Date().toISOString().split('T')[0],
      status: body.status || 'active',
      photoUrl: body.photoUrl,
    };

    const student = await studentService.createStudent(supabase, studentData);
    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

