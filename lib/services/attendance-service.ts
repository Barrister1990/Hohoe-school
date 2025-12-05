/**
 * Attendance Service
 * Handles all attendance-related operations with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Attendance {
  id: string;
  studentId: string;
  term: number;
  academicYear: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendancePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttendanceData {
  studentId: string;
  term: number;
  academicYear: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {
  id: string;
}

class AttendanceService {
  /**
   * Map database row to Attendance type
   */
  private mapDbToAttendance(row: any): Attendance {
    return {
      id: row.id,
      studentId: row.student_id,
      term: row.term,
      academicYear: row.academic_year,
      totalDays: row.total_days,
      presentDays: row.present_days,
      absentDays: row.absent_days,
      lateDays: row.late_days,
      excusedDays: row.excused_days,
      attendancePercentage: parseFloat(row.attendance_percentage || '0'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get attendance records, optionally filtered by student, term, or academic year
   */
  async getAttendance(
    supabase: SupabaseClient,
    filters?: {
      studentId?: string;
      term?: number;
      academicYear?: string;
      classId?: string;
    }
  ): Promise<Attendance[]> {
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters?.term) {
        query = query.eq('term', filters.term);
      }
      if (filters?.academicYear) {
        query = query.eq('academic_year', filters.academicYear);
      }
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      let attendance = data.map((row) => this.mapDbToAttendance(row));

      // If filtering by classId, we need to join with students
      if (filters?.classId) {
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('class_id', filters.classId);
        
        const studentIds = new Set(students?.map((s) => s.id) || []);
        attendance = attendance.filter((a) => studentIds.has(a.studentId));
      }

      return attendance;
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get attendance for a specific student
   */
  async getStudentAttendance(
    supabase: SupabaseClient,
    studentId: string,
    term?: number,
    academicYear?: string
  ): Promise<Attendance | null> {
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId);

      if (term) {
        query = query.eq('term', term);
      }
      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? this.mapDbToAttendance(data) : null;
    } catch (error: any) {
      console.error('Error fetching student attendance:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create or update attendance record
   */
  async upsertAttendance(
    supabase: SupabaseClient,
    attendanceData: CreateAttendanceData
  ): Promise<Attendance> {
    try {
      // Check if record exists
      const existing = await this.getStudentAttendance(
        supabase,
        attendanceData.studentId,
        attendanceData.term,
        attendanceData.academicYear
      );

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('attendance')
          .update({
            total_days: attendanceData.totalDays,
            present_days: attendanceData.presentDays,
            absent_days: attendanceData.absentDays,
            late_days: attendanceData.lateDays,
            excused_days: attendanceData.excusedDays,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return this.mapDbToAttendance(data);
      } else {
        // Create new
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            student_id: attendanceData.studentId,
            term: attendanceData.term,
            academic_year: attendanceData.academicYear,
            total_days: attendanceData.totalDays,
            present_days: attendanceData.presentDays,
            absent_days: attendanceData.absentDays,
            late_days: attendanceData.lateDays,
            excused_days: attendanceData.excusedDays,
          })
          .select()
          .single();

        if (error) throw error;
        return this.mapDbToAttendance(data);
      }
    } catch (error: any) {
      console.error('Error upserting attendance:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(supabase: SupabaseClient, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting attendance:', error);
      throw new Error(formatError(error));
    }
  }
}

export const attendanceService = new AttendanceService();

