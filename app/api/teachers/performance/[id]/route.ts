import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/teachers/performance/[id]
 * Get teacher performance data
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

    const { id: teacherId } = await params;

    // Get teacher data
    const { data: teacherData } = await supabase
      .from('users')
      .select('is_class_teacher, is_subject_teacher')
      .eq('id', teacherId)
      .single();

    if (!teacherData) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const isClassTeacher = teacherData.is_class_teacher || false;
    const isSubjectTeacher = teacherData.is_subject_teacher || false;

    // Initialize performance data
    const performance: any = {
      teacherId,
      isClassTeacher,
      isSubjectTeacher,
      performanceScore: 0,
    };

    // Get class teacher performance
    if (isClassTeacher) {
      // Get assigned classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name, student_count')
        .eq('class_teacher_id', teacherId);

      if (classes && classes.length > 0) {
        const assignedClass = classes[0];
        performance.assignedClass = assignedClass.name;
        performance.totalStudents = assignedClass.student_count || 0;

        // Get evaluations count (class_teacher_evaluations)
        const { count: evaluationsCount } = await supabase
          .from('class_teacher_evaluations')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherId);

        // Get total students that need evaluation
        const { count: studentsCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_teacher_id', teacherId)
          .eq('status', 'active');

        performance.evaluationsDone = evaluationsCount || 0;
        performance.evaluationsTotal = studentsCount || 0;

        // Get attendance entries (attendance)
        const { count: attendanceCount } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherId);

        performance.attendanceEntered = attendanceCount || 0;
        performance.attendanceTotal = studentsCount || 0;
      }
    }

    // Get subject teacher performance
    if (isSubjectTeacher) {
      // Get subject assignments
      const { data: assignments } = await supabase
        .from('subject_assignments')
        .select('subject_id')
        .eq('teacher_id', teacherId);

      if (assignments) {
        const uniqueSubjects = [...new Set(assignments.map(a => a.subject_id))];
        performance.assignedSubjects = uniqueSubjects.length;

        // Get graded subjects (subjects with grades entered)
        const { data: gradedSubjects } = await supabase
          .from('grades')
          .select('subject_id')
          .eq('teacher_id', teacherId)
          .limit(1);

        performance.subjectsGraded = gradedSubjects ? uniqueSubjects.length : 0;
        performance.subjectsTotal = uniqueSubjects.length;
      } else {
        performance.assignedSubjects = 0;
        performance.subjectsGraded = 0;
        performance.subjectsTotal = 0;
      }
    }

    // Calculate performance score
    let score = 0;
    let totalTasks = 0;

    if (isClassTeacher) {
      if (performance.evaluationsTotal > 0) {
        score += (performance.evaluationsDone / performance.evaluationsTotal) * 50;
        totalTasks += 50;
      }
      if (performance.attendanceTotal > 0) {
        score += (performance.attendanceEntered / performance.attendanceTotal) * 50;
        totalTasks += 50;
      }
    }

    if (isSubjectTeacher) {
      if (performance.subjectsTotal > 0) {
        score += (performance.subjectsGraded / performance.subjectsTotal) * 100;
        totalTasks += 100;
      }
    }

    performance.performanceScore = totalTasks > 0 ? Math.round((score / totalTasks) * 100) : 0;

    return NextResponse.json(performance);
  } catch (error: any) {
    console.error('Error fetching teacher performance:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

