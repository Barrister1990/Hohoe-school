/**
 * Student Service
 * Handles all student-related operations with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import { Student, StudentStatus } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CreateStudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female';
  classId: string;
  classTeacherId?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  enrollmentDate: string; // ISO date string
  status?: StudentStatus;
  photoUrl?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: string;
}

class StudentService {
  /**
   * Get all students, optionally filtered by class
   */
  async getStudents(supabase: SupabaseClient, classId?: string): Promise<Student[]> {
    try {
      let query = supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Return empty array if no data, don't throw error
      if (!data || data.length === 0) {
        return [];
      }

      return data.map(this.mapDbToStudent);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      // Return empty array instead of throwing for empty results
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get a single student by ID
   */
  async getStudent(supabase: SupabaseClient, id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data ? this.mapDbToStudent(data) : null;
    } catch (error: any) {
      console.error('Error fetching student:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create a new student
   */
  async createStudent(supabase: SupabaseClient, studentData: CreateStudentData): Promise<Student> {
    try {

      // If classTeacherId is not provided, get it from the class
      let classTeacherId = studentData.classTeacherId;
      if (!classTeacherId && studentData.classId) {
        const { data: classData } = await supabase
          .from('classes')
          .select('class_teacher_id')
          .eq('id', studentData.classId)
          .single();

        if (classData?.class_teacher_id) {
          classTeacherId = classData.class_teacher_id;
        }
      }

      const { data, error } = await supabase
        .from('students')
        .insert({
          student_id: studentData.studentId,
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          middle_name: studentData.middleName || null,
          date_of_birth: studentData.dateOfBirth,
          gender: studentData.gender,
          class_id: studentData.classId,
          class_teacher_id: classTeacherId || null,
          parent_name: studentData.parentName || null,
          parent_phone: studentData.parentPhone || null,
          address: studentData.address || null,
          enrollment_date: studentData.enrollmentDate,
          status: studentData.status || 'active',
          photo_url: studentData.photoUrl || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update class student count
      await this.updateClassStudentCount(supabase, studentData.classId);

      return this.mapDbToStudent(data);
    } catch (error: any) {
      console.error('Error creating student:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update an existing student
   */
  async updateStudent(supabase: SupabaseClient, studentData: UpdateStudentData): Promise<Student> {
    try {

      const updateData: any = {};
      if (studentData.studentId !== undefined) updateData.student_id = studentData.studentId;
      if (studentData.firstName !== undefined) updateData.first_name = studentData.firstName;
      if (studentData.lastName !== undefined) updateData.last_name = studentData.lastName;
      if (studentData.middleName !== undefined) updateData.middle_name = studentData.middleName || null;
      if (studentData.dateOfBirth !== undefined) updateData.date_of_birth = studentData.dateOfBirth;
      if (studentData.gender !== undefined) updateData.gender = studentData.gender;
      if (studentData.classId !== undefined) updateData.class_id = studentData.classId;
      if (studentData.classTeacherId !== undefined) updateData.class_teacher_id = studentData.classTeacherId || null;
      if (studentData.parentName !== undefined) updateData.parent_name = studentData.parentName || null;
      if (studentData.parentPhone !== undefined) updateData.parent_phone = studentData.parentPhone || null;
      if (studentData.address !== undefined) updateData.address = studentData.address || null;
      if (studentData.enrollmentDate !== undefined) updateData.enrollment_date = studentData.enrollmentDate;
      if (studentData.status !== undefined) updateData.status = studentData.status;
      if (studentData.photoUrl !== undefined) updateData.photo_url = studentData.photoUrl || null;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', studentData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update class student count if class changed
      if (studentData.classId) {
        await this.updateClassStudentCount(supabase, studentData.classId);
      }

      return this.mapDbToStudent(data);
    } catch (error: any) {
      console.error('Error updating student:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a student
   */
  async deleteStudent(supabase: SupabaseClient, id: string): Promise<void> {
    try {

      // Get student to get class_id for updating count
      const student = await this.getStudent(supabase, id);
      const classId = student?.classId;

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update class student count
      if (classId) {
        await this.updateClassStudentCount(supabase, classId);
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Generate next student ID
   */
  async generateNextStudentId(supabase: SupabaseClient): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('student_id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return 'STU001';
      }

      const lastId = data[0].student_id;
      const match = lastId.match(/STU(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return `STU${String(num + 1).padStart(3, '0')}`;
      }

      // Fallback: count all students
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      return `STU${String((count || 0) + 1).padStart(3, '0')}`;
    } catch (error: any) {
      console.error('Error generating student ID:', error);
      // Fallback
      return `STU${String(Date.now()).slice(-3)}`;
    }
  }

  /**
   * Update class student count
   */
  private async updateClassStudentCount(supabase: SupabaseClient, classId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('status', 'active');

      await supabase
        .from('classes')
        .update({ student_count: count || 0 })
        .eq('id', classId);
    } catch (error) {
      console.error('Error updating class student count:', error);
      // Don't throw - this is a background operation
    }
  }

  /**
   * Map database row to Student type
   */
  private mapDbToStudent(row: any): Student {
    return {
      id: row.id,
      studentId: row.student_id,
      firstName: row.first_name,
      lastName: row.last_name,
      middleName: row.middle_name,
      dateOfBirth: new Date(row.date_of_birth),
      gender: row.gender,
      classId: row.class_id,
      classTeacherId: row.class_teacher_id,
      parentName: row.parent_name,
      parentPhone: row.parent_phone,
      address: row.address,
      enrollmentDate: new Date(row.enrollment_date),
      status: row.status,
      photo: row.photo_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const studentService = new StudentService();

