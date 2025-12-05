/**
 * Analytics Service
 * Handles all analytics-related operations with Supabase
 * Calculates performance metrics, trends, and insights from grades and attendance data
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateGrade } from '@/lib/utils/grading';

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  averageScore: number;
  grade: string;
  trend: 'improving' | 'stable' | 'declining';
  subjectsCompleted: number;
  totalSubjects: number;
  attendanceRate: number;
  termScores: { term: number; score: number }[];
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  averageScore: number;
  passRate: number;
  totalStudents: number;
  studentsCompleted: number;
  gradeDistribution: {
    HP: number;
    P: number;
    AP: number;
    D: number;
    E: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  termScores: { term: number; score: number }[];
  classPerformance: { className: string; average: number }[];
}

export interface ClassPerformance {
  classId: string;
  className: string;
  level: number;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  topPerformers: number;
  averagePerformers: number;
  needsSupport: number;
  subjectBreakdown: { subjectName: string; average: number }[];
  attendanceRate: number;
}

export interface BECEAnalytics {
  academicYear: string;
  totalStudents: number;
  averageAggregate: number;
  gradeDistribution: {
    excellent: number; // 6-12
    veryGood: number; // 13-18
    good: number; // 19-24
    fair: number; // 25-30
  };
  subjectPerformance: { subject: string; averageGrade: string }[];
  topPerformers: { studentName: string; aggregate: number }[];
}

class AnalyticsService {
  /**
   * Get student performance analytics
   */
  async getStudentPerformance(
    supabase: SupabaseClient,
    options: {
      academicYear?: string;
      term?: number;
      classId?: string;
      studentId?: string;
    } = {}
  ): Promise<StudentPerformance[]> {
    try {
      const { academicYear, term, classId, studentId } = options;

      // Build query for grades
      let gradesQuery = supabase
        .from('grades')
        .select(`
          id,
          student_id,
          subject_id,
          term,
          academic_year,
          project,
          test1,
          test2,
          group_work,
          exam,
          students (
            id,
            first_name,
            last_name,
            student_id,
            class_id,
            classes (
              id,
              name
            )
          )
        `);

      if (academicYear) {
        gradesQuery = gradesQuery.eq('academic_year', academicYear);
      }
      if (term) {
        gradesQuery = gradesQuery.eq('term', term);
      }
      if (studentId) {
        gradesQuery = gradesQuery.eq('student_id', studentId);
      }

      const { data: grades, error: gradesError } = await gradesQuery;

      if (gradesError) throw gradesError;

      // Filter by class if specified
      let filteredGrades = grades || [];
      if (classId) {
        filteredGrades = filteredGrades.filter(
          (g: any) => g.students?.class_id === classId
        );
      }

      // Get unique students
      const studentMap = new Map<string, any>();
      filteredGrades.forEach((g: any) => {
        if (g.students && !studentMap.has(g.students.id)) {
          studentMap.set(g.students.id, g.students);
        }
      });

      // Get attendance records
      let attendanceQuery = supabase
        .from('attendance')
        .select('student_id, attendance_percentage');

      if (academicYear) {
        attendanceQuery = attendanceQuery.eq('academic_year', academicYear);
      }
      if (term) {
        attendanceQuery = attendanceQuery.eq('term', term);
      }

      const { data: attendanceRecords } = await attendanceQuery;

      const attendanceMap = new Map<string, number>();
      attendanceRecords?.forEach((att: any) => {
        attendanceMap.set(att.student_id, att.attendance_percentage || 0);
      });

      // Get subjects count
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id');

      const totalSubjects = subjects?.length || 0;

      // Calculate performance for each student
      const performance: StudentPerformance[] = [];

      for (const [studentId, student] of studentMap.entries()) {
        const studentGrades = filteredGrades.filter(
          (g: any) => g.students?.id === studentId
        );

        if (studentGrades.length === 0) continue;

        // Calculate average score from individual assessments
        const calculateTotalScore = (g: any): number => {
          // Class Score: 50% of (Project + Test1 + Test2 + Group Work)
          const classTotal = (g.project || 0) + (g.test1 || 0) + (g.test2 || 0) + (g.group_work || 0);
          const classMax = 40 + 20 + 20 + 20; // 100
          const classScore = classMax > 0 ? (classTotal / classMax) * 50 : 0;
          
          // Exam Score: 50% of Exam
          const examScore = ((g.exam || 0) / 100) * 50;
          
          // Total Score
          return classScore + examScore;
        };

        const totalScores = studentGrades
          .map((g: any) => calculateTotalScore(g))
          .reduce((sum: number, score: number) => sum + score, 0);
        const averageScore = totalScores / studentGrades.length;

        // Get grade
        const grade = calculateGrade(averageScore);

        // Calculate term scores for trend
        const termScores: { term: number; score: number }[] = [];
        for (let t = 1; t <= 3; t++) {
          const termGrades = studentGrades.filter(
            (g: any) => g.term === t
          );
          if (termGrades.length > 0) {
            const termTotal = termGrades
              .map((g: any) => calculateTotalScore(g))
              .reduce((sum: number, score: number) => sum + score, 0);
            termScores.push({
              term: t,
              score: termTotal / termGrades.length,
            });
          }
        }

        // Determine trend
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (termScores.length >= 2) {
          const latest = termScores[termScores.length - 1].score;
          const previous = termScores[termScores.length - 2].score;
          if (latest > previous + 2) trend = 'improving';
          else if (latest < previous - 2) trend = 'declining';
        }

        // Count unique subjects
        const uniqueSubjects = new Set(
          studentGrades.map((g: any) => g.subject_id)
        ).size;

        performance.push({
          studentId,
          studentName: `${student.first_name} ${student.last_name}`,
          studentCode: student.student_id,
          classId: student.class_id,
          className: student.classes?.name || 'Unknown',
          averageScore: Math.round(averageScore * 10) / 10,
          grade,
          trend,
          subjectsCompleted: uniqueSubjects,
          totalSubjects,
          attendanceRate: attendanceMap.get(studentId) || 0,
          termScores,
        });
      }

      return performance;
    } catch (error: any) {
      console.error('Error fetching student performance:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get subject performance analytics
   */
  async getSubjectPerformance(
    supabase: SupabaseClient,
    options: {
      academicYear?: string;
      term?: number;
      classId?: string;
      subjectId?: string;
    } = {}
  ): Promise<SubjectPerformance[]> {
    try {
      const { academicYear, term, classId, subjectId } = options;

      // Build query for grades
      let gradesQuery = supabase
        .from('grades')
        .select(`
          id,
          subject_id,
          student_id,
          term,
          academic_year,
          project,
          test1,
          test2,
          group_work,
          exam,
          subjects (
            id,
            name
          ),
          students (
            class_id,
            classes (
              id,
              name
            )
          )
        `);

      if (academicYear) {
        gradesQuery = gradesQuery.eq('academic_year', academicYear);
      }
      if (term) {
        gradesQuery = gradesQuery.eq('term', term);
      }
      if (subjectId) {
        gradesQuery = gradesQuery.eq('subject_id', subjectId);
      }

      const { data: grades, error: gradesError } = await gradesQuery;

      if (gradesError) throw gradesError;

      // Filter by class if specified
      let filteredGrades = grades || [];
      if (classId) {
        filteredGrades = filteredGrades.filter(
          (g: any) => g.students?.class_id === classId
        );
      }

      // Get all subjects
      const { data: allSubjects } = await supabase
        .from('subjects')
        .select('id, name');

      // Get unique students count
      const uniqueStudents = new Set(
        filteredGrades.map((g: any) => g.students?.class_id).filter(Boolean)
      );

      // Group by subject
      const subjectMap = new Map<string, any[]>();
      filteredGrades.forEach((g: any) => {
        if (!g.subject_id) return;
        if (!subjectMap.has(g.subject_id)) {
          subjectMap.set(g.subject_id, []);
        }
        subjectMap.get(g.subject_id)!.push(g);
      });

      const performance: SubjectPerformance[] = [];

      // Helper function to calculate total score
      const calculateTotalScore = (g: any): number => {
        const classTotal = (g.project || 0) + (g.test1 || 0) + (g.test2 || 0) + (g.group_work || 0);
        const classMax = 40 + 20 + 20 + 20;
        const classScore = classMax > 0 ? (classTotal / classMax) * 50 : 0;
        const examScore = ((g.exam || 0) / 100) * 50;
        return classScore + examScore;
      };

      for (const [subjId, subjectGrades] of subjectMap.entries()) {
        const subject = allSubjects?.find((s) => s.id === subjId);
        if (!subject) continue;

        // Calculate average score
        const totalScores = subjectGrades
          .map((g: any) => calculateTotalScore(g))
          .reduce((sum: number, score: number) => sum + score, 0);
        const averageScore = totalScores / subjectGrades.length;

        // Calculate pass rate (>= 40%)
        const passingGrades = subjectGrades.filter(
          (g: any) => calculateTotalScore(g) >= 40
        );
        const passRate = Math.round(
          (passingGrades.length / subjectGrades.length) * 100
        );

        // Count unique students
        const uniqueStudentIds = new Set(
          subjectGrades.map((g: any) => g.student_id)
        );

        // Grade distribution
        const gradeDistribution = {
          HP: 0,
          P: 0,
          AP: 0,
          D: 0,
          E: 0,
        };

        subjectGrades.forEach((g: any) => {
          const totalScore = calculateTotalScore(g);
          const grade = calculateGrade(totalScore);
          if (grade === 'HP') gradeDistribution.HP++;
          else if (grade === 'P') gradeDistribution.P++;
          else if (grade === 'AP') gradeDistribution.AP++;
          else if (grade === 'D') gradeDistribution.D++;
          else if (grade === 'E') gradeDistribution.E++;
        });

        // Calculate term scores for trend
        const termScores: { term: number; score: number }[] = [];
        for (let t = 1; t <= 3; t++) {
          const termGrades = subjectGrades.filter((g: any) => g.term === t);
          if (termGrades.length > 0) {
            const termTotal = termGrades
              .map((g: any) => calculateTotalScore(g))
              .reduce((sum: number, score: number) => sum + score, 0);
            termScores.push({
              term: t,
              score: termTotal / termGrades.length,
            });
          }
        }

        // Determine trend
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (termScores.length >= 2) {
          const latest = termScores[termScores.length - 1].score;
          const previous = termScores[termScores.length - 2].score;
          if (latest > previous + 2) trend = 'improving';
          else if (latest < previous - 2) trend = 'declining';
        }

        // Class performance
        const classMap = new Map<string, number[]>();
        subjectGrades.forEach((g: any) => {
          const className = g.students?.classes?.name;
          if (className) {
            if (!classMap.has(className)) {
              classMap.set(className, []);
            }
            classMap.get(className)!.push(g.total_score || 0);
          }
        });

        const classPerformance = Array.from(classMap.entries()).map(
          ([className, scores]) => ({
            className,
            average: Math.round(
              (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10
            ) / 10,
          })
        );

        performance.push({
          subjectId: subjId,
          subjectName: subject.name,
          averageScore: Math.round(averageScore * 10) / 10,
          passRate,
          totalStudents: uniqueStudents.size,
          studentsCompleted: uniqueStudentIds.size,
          gradeDistribution,
          trend,
          termScores,
          classPerformance,
        });
      }

      return performance;
    } catch (error: any) {
      console.error('Error fetching subject performance:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get class performance analytics
   */
  async getClassPerformance(
    supabase: SupabaseClient,
    classId: string,
    options: {
      academicYear?: string;
      term?: number;
    } = {}
  ): Promise<ClassPerformance | null> {
    try {
      const { academicYear, term } = options;

      // Get class info
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, level')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      if (!classData) return null;

      // Get students in class
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('status', 'active');

      const studentIds = students?.map((s) => s.id) || [];

      // Get grades for students in this class
      let gradesQuery = supabase
        .from('grades')
        .select(`
          id,
          student_id,
          subject_id,
          term,
          academic_year,
          project,
          test1,
          test2,
          group_work,
          exam,
          subjects (
            name
          )
        `)
        .in('student_id', studentIds);

      if (academicYear) {
        gradesQuery = gradesQuery.eq('academic_year', academicYear);
      }
      if (term) {
        gradesQuery = gradesQuery.eq('term', term);
      }

      const { data: grades } = await gradesQuery;

      // Get attendance
      let attendanceQuery = supabase
        .from('attendance')
        .select('student_id, attendance_percentage')
        .in('student_id', studentIds);

      if (academicYear) {
        attendanceQuery = attendanceQuery.eq('academic_year', academicYear);
      }
      if (term) {
        attendanceQuery = attendanceQuery.eq('term', term);
      }

      const { data: attendanceRecords } = await attendanceQuery;

      // Helper function to calculate total score
      const calculateTotalScore = (g: any): number => {
        const classTotal = (g.project || 0) + (g.test1 || 0) + (g.test2 || 0) + (g.group_work || 0);
        const classMax = 40 + 20 + 20 + 20;
        const classScore = classMax > 0 ? (classTotal / classMax) * 50 : 0;
        const examScore = ((g.exam || 0) / 100) * 50;
        return classScore + examScore;
      };

      // Calculate student averages
      const studentAverages = new Map<string, number[]>();
      grades?.forEach((g: any) => {
        if (!studentAverages.has(g.student_id)) {
          studentAverages.set(g.student_id, []);
        }
        studentAverages.get(g.student_id)!.push(calculateTotalScore(g));
      });

      const studentOverallAverages = Array.from(studentAverages.entries()).map(
        ([studentId, scores]) => ({
          studentId,
          average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        })
      );

      const classAverage =
        studentOverallAverages.length > 0
          ? studentOverallAverages.reduce(
              (sum, s) => sum + s.average,
              0
            ) / studentOverallAverages.length
          : 0;

      // Pass rate (>= 40%)
      const passingStudents = studentOverallAverages.filter(
        (s) => s.average >= 40
      ).length;
      const passRate = Math.round(
        (passingStudents / studentOverallAverages.length) * 100
      );

      // Performance categories
      const topPerformers = studentOverallAverages.filter(
        (s) => s.average >= 80
      ).length;
      const averagePerformers = studentOverallAverages.filter(
        (s) => s.average >= 60 && s.average < 80
      ).length;
      const needsSupport = studentOverallAverages.filter(
        (s) => s.average < 60
      ).length;

      // Subject breakdown
      const subjectMap = new Map<string, number[]>();
      grades?.forEach((g: any) => {
        const subjectName = g.subjects?.name || 'Unknown';
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, []);
        }
        subjectMap.get(subjectName)!.push(calculateTotalScore(g));
      });

      const subjectBreakdown = Array.from(subjectMap.entries()).map(
        ([subjectName, scores]) => ({
          subjectName,
          average:
            Math.round(
              (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10
            ) / 10,
        })
      );

      // Average attendance
      const attendanceSum =
        attendanceRecords?.reduce(
          (sum, att: any) => sum + (att.attendance_percentage || 0),
          0
        ) || 0;
      const attendanceRate =
        attendanceRecords && attendanceRecords.length > 0
          ? Math.round(attendanceSum / attendanceRecords.length)
          : 0;

      return {
        classId: classData.id,
        className: classData.name,
        level: classData.level,
        totalStudents: studentIds.length,
        averageScore: Math.round(classAverage * 10) / 10,
        passRate,
        topPerformers,
        averagePerformers,
        needsSupport,
        subjectBreakdown,
        attendanceRate,
      };
    } catch (error: any) {
      console.error('Error fetching class performance:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get BECE analytics
   */
  async getBECEAnalytics(
    supabase: SupabaseClient,
    academicYear: string
  ): Promise<BECEAnalytics | null> {
    try {
      // Get BECE results for the academic year
      const { data: beceResults, error: beceError } = await supabase
        .from('bece_results')
        .select(`
          id,
          student_id,
          subject,
          grade,
          students (
            id,
            first_name,
            last_name
          )
        `);

      if (beceError) throw beceError;

      // Group by student
      const studentMap = new Map<string, any[]>();
      beceResults?.forEach((result: any) => {
        if (!studentMap.has(result.student_id)) {
          studentMap.set(result.student_id, []);
        }
        studentMap.get(result.student_id)!.push(result);
      });

      // Calculate aggregates
      const aggregates: { studentId: string; studentName: string; aggregate: number }[] = [];

      for (const [studentId, results] of studentMap.entries()) {
        const student = results[0]?.students;
        if (!student) continue;

        // Convert grades to numerical values (A1=1, B2=2, etc.)
        const gradeValues: Record<string, number> = {
          A1: 1,
          B2: 2,
          B3: 3,
          C4: 4,
          C5: 5,
          C6: 6,
          D7: 7,
          E8: 8,
          F9: 9,
        };

        const aggregate = results.reduce((sum, r: any) => {
          const value = gradeValues[r.grade] || 9;
          return sum + value;
        }, 0);

        aggregates.push({
          studentId,
          studentName: `${student.first_name} ${student.last_name}`,
          aggregate,
        });
      }

      // Calculate statistics
      const totalStudents = aggregates.length;
      const averageAggregate =
        aggregates.length > 0
          ? aggregates.reduce((sum, a) => sum + a.aggregate, 0) /
            aggregates.length
          : 0;

      // Grade distribution
      const gradeDistribution = {
        excellent: aggregates.filter((a) => a.aggregate >= 6 && a.aggregate <= 12).length,
        veryGood: aggregates.filter((a) => a.aggregate >= 13 && a.aggregate <= 18).length,
        good: aggregates.filter((a) => a.aggregate >= 19 && a.aggregate <= 24).length,
        fair: aggregates.filter((a) => a.aggregate >= 25 && a.aggregate <= 30).length,
      };

      // Subject performance
      const subjectMap = new Map<string, string[]>();
      beceResults?.forEach((result: any) => {
        if (!subjectMap.has(result.subject)) {
          subjectMap.set(result.subject, []);
        }
        subjectMap.get(result.subject)!.push(result.grade);
      });

      const subjectPerformance = Array.from(subjectMap.entries()).map(
        ([subject, grades]) => {
          // Calculate average grade
          const gradeValues: Record<string, number> = {
            A1: 1,
            B2: 2,
            B3: 3,
            C4: 4,
            C5: 5,
            C6: 6,
            D7: 7,
            E8: 8,
            F9: 9,
          };

          const avgValue =
            grades.reduce((sum, g) => sum + (gradeValues[g] || 9), 0) /
            grades.length;

          // Convert back to grade
          let averageGrade = 'F9';
          if (avgValue <= 1.5) averageGrade = 'A1';
          else if (avgValue <= 2.5) averageGrade = 'B2';
          else if (avgValue <= 3.5) averageGrade = 'B3';
          else if (avgValue <= 4.5) averageGrade = 'C4';
          else if (avgValue <= 5.5) averageGrade = 'C5';
          else if (avgValue <= 6.5) averageGrade = 'C6';
          else if (avgValue <= 7.5) averageGrade = 'D7';
          else if (avgValue <= 8.5) averageGrade = 'E8';

          return { subject, averageGrade };
        }
      );

      // Top performers
      const topPerformers = aggregates
        .sort((a, b) => a.aggregate - b.aggregate)
        .slice(0, 10)
        .map((a) => ({
          studentName: a.studentName,
          aggregate: a.aggregate,
        }));

      return {
        academicYear,
        totalStudents,
        averageAggregate: Math.round(averageAggregate * 10) / 10,
        gradeDistribution,
        subjectPerformance,
        topPerformers,
      };
    } catch (error: any) {
      console.error('Error fetching BECE analytics:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get analytics overview statistics
   */
  async getAnalyticsOverview(
    supabase: SupabaseClient,
    options: {
      academicYear?: string;
      term?: number;
      teacherId?: string;
      classId?: string;
    } = {}
  ): Promise<{
    totalStudents: number;
    averageScore: number;
    passRate: number;
    completedGrades: number;
    gradeDistribution: { name: string; value: number; color: string }[];
    performanceTrend: { term: string; average: number }[];
    subjectPerformance: { subject: string; average: number }[];
  }> {
    try {
      const { academicYear, term, teacherId, classId } = options;

      // Get students
      let studentsQuery = supabase.from('students').select('id').eq('status', 'active');

      if (classId) {
        studentsQuery = studentsQuery.eq('class_id', classId);
      } else if (teacherId) {
        // Get teacher's classes (as class teacher)
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('class_teacher_id', teacherId);

        // Get teacher's subject assignments
        const { data: subjectAssignments } = await supabase
          .from('subject_assignments')
          .select('class_id, subject_id')
          .eq('teacher_id', teacherId);

        const classIdsFromAssignments = new Set<string>();
        subjectAssignments?.forEach((sa: any) => {
          classIdsFromAssignments.add(sa.class_id);
        });

        const classIdsFromClasses = teacherClasses?.map((c) => c.id) || [];
        const allClassIds = [
          ...classIdsFromClasses,
          ...Array.from(classIdsFromAssignments),
        ];

        if (allClassIds.length > 0) {
          studentsQuery = studentsQuery.in('class_id', allClassIds);
        } else {
          // If no classes, return empty
          return {
            totalStudents: 0,
            averageScore: 0,
            passRate: 0,
            completedGrades: 0,
            gradeDistribution: [],
            performanceTrend: [],
            subjectPerformance: [],
          };
        }
      }

      const { data: students } = await studentsQuery;
      const totalStudents = students?.length || 0;

      // Get teacher's assigned subject IDs if filtering by teacher
      let assignedSubjectIds: string[] = [];
      if (teacherId && !classId) {
        const { data: subjectAssignments } = await supabase
          .from('subject_assignments')
          .select('subject_id')
          .eq('teacher_id', teacherId);
        assignedSubjectIds = subjectAssignments?.map((sa: any) => sa.subject_id) || [];
      }

      // Get grades
      let gradesQuery = supabase.from('grades').select('id, project, test1, test2, group_work, exam, term, academic_year, subject_id, student_id');

      if (academicYear) {
        gradesQuery = gradesQuery.eq('academic_year', academicYear);
      }
      if (term) {
        gradesQuery = gradesQuery.eq('term', term);
      }
      if (classId) {
        const studentIds = students?.map((s) => s.id) || [];
        if (studentIds.length > 0) {
          gradesQuery = gradesQuery.in('student_id', studentIds);
        }
      } else if (teacherId) {
        // Filter by teacher's students and assigned subjects
        const studentIds = students?.map((s) => s.id) || [];
        if (studentIds.length > 0) {
          gradesQuery = gradesQuery.in('student_id', studentIds);
        }
        // Filter by assigned subjects if teacher has subject assignments
        if (assignedSubjectIds.length > 0) {
          gradesQuery = gradesQuery.in('subject_id', assignedSubjectIds);
        }
      }

      const { data: grades } = await gradesQuery;

      // Helper function to calculate total score
      const calculateTotalScore = (g: any): number => {
        const classTotal = (g.project || 0) + (g.test1 || 0) + (g.test2 || 0) + (g.group_work || 0);
        const classMax = 40 + 20 + 20 + 20;
        const classScore = classMax > 0 ? (classTotal / classMax) * 50 : 0;
        const examScore = ((g.exam || 0) / 100) * 50;
        return classScore + examScore;
      };

      // Calculate average score
      const totalScores = grades?.map((g: any) => calculateTotalScore(g)) || [];
      const averageScore =
        totalScores.length > 0
          ? totalScores.reduce((sum, s) => sum + s, 0) / totalScores.length
          : 0;

      // Calculate pass rate
      const passingGrades = grades?.filter((g: any) => calculateTotalScore(g) >= 40) || [];
      const passRate =
        grades && grades.length > 0
          ? Math.round((passingGrades.length / grades.length) * 100)
          : 0;

      // Calculate completed grades percentage
      const uniqueStudentsWithGrades = new Set(
        grades?.map((g: any) => g.student_id) || []
      );
      const completedGrades =
        totalStudents > 0
          ? Math.round((uniqueStudentsWithGrades.size / totalStudents) * 100)
          : 0;

      // Grade distribution
      const gradeCounts = {
        HP: 0,
        P: 0,
        AP: 0,
        D: 0,
        E: 0,
      };

      grades?.forEach((g: any) => {
        const totalScore = calculateTotalScore(g);
        const grade = calculateGrade(totalScore);
        if (grade === 'HP') gradeCounts.HP++;
        else if (grade === 'P') gradeCounts.P++;
        else if (grade === 'AP') gradeCounts.AP++;
        else if (grade === 'D') gradeCounts.D++;
        else if (grade === 'E') gradeCounts.E++;
      });

      const gradeDistribution = [
        { name: 'HP', value: gradeCounts.HP, color: '#10B981' },
        { name: 'P', value: gradeCounts.P, color: '#3B82F6' },
        { name: 'AP', value: gradeCounts.AP, color: '#FBBF24' },
        { name: 'D', value: gradeCounts.D, color: '#F97316' },
        { name: 'E', value: gradeCounts.E, color: '#EF4444' },
      ];

      // Performance trend (by term)
      const performanceTrend: { term: string; average: number }[] = [];
      for (let t = 1; t <= 3; t++) {
        const termGrades = grades?.filter((g: any) => g.term === t) || [];
        if (termGrades.length > 0) {
          const termTotal = termGrades
            .map((g: any) => calculateTotalScore(g))
            .reduce((sum, s) => sum + s, 0);
          performanceTrend.push({
            term: `Term ${t}`,
            average: Math.round((termTotal / termGrades.length) * 10) / 10,
          });
        }
      }

      // Subject performance
      const subjectMap = new Map<string, number[]>();
      grades?.forEach((g: any) => {
        // Only include subjects assigned to teacher (if filtering by teacher)
        if (teacherId && assignedSubjectIds.length > 0 && !assignedSubjectIds.includes(g.subject_id)) {
          return;
        }
        if (!subjectMap.has(g.subject_id)) {
          subjectMap.set(g.subject_id, []);
        }
        subjectMap.get(g.subject_id)!.push(calculateTotalScore(g));
      });

      // Get subject names
      const subjectIds = Array.from(subjectMap.keys());
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .in('id', subjectIds);

      const subjectPerformance = Array.from(subjectMap.entries())
        .map(([subjectId, scores]) => {
          const subject = subjects?.find((s) => s.id === subjectId);
          return {
            subject: subject?.name || 'Unknown',
            average:
              Math.round(
                (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10
              ) / 10,
          };
        })
        .slice(0, 5);

      return {
        totalStudents,
        averageScore: Math.round(averageScore * 10) / 10,
        passRate,
        completedGrades,
        gradeDistribution,
        performanceTrend,
        subjectPerformance,
      };
    } catch (error: any) {
      console.error('Error fetching analytics overview:', error);
      throw new Error(formatError(error));
    }
  }
}

export const analyticsService = new AnalyticsService();

