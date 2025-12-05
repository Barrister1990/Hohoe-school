import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { attendanceService, CreateAttendanceData } from '@/lib/services/attendance-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/attendance
 * Get attendance records with optional filters
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
    const term = searchParams.get('term') ? parseInt(searchParams.get('term')!) : undefined;
    const academicYear = searchParams.get('academicYear') || undefined;
    const classId = searchParams.get('classId') || undefined;

    const attendance = await attendanceService.getAttendance(supabase, {
      studentId,
      term,
      academicYear,
      classId,
    });

    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance
 * Create or update attendance record
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
    const attendanceData: CreateAttendanceData = {
      studentId: body.studentId,
      term: body.term,
      academicYear: body.academicYear,
      totalDays: body.totalDays,
      presentDays: body.presentDays,
      absentDays: body.absentDays,
      lateDays: body.lateDays,
      excusedDays: body.excusedDays || 0,
    };

    const attendance = await attendanceService.upsertAttendance(supabase, attendanceData);
    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

