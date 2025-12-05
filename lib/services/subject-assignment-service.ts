/**
 * Subject Assignment Service
 * Handles all subject assignment operations with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  createdAt: Date;
}

export interface CreateSubjectAssignmentData {
  subjectId: string;
  teacherId: string;
  classId: string;
}

class SubjectAssignmentService {
  /**
   * Map database row to SubjectAssignment type
   */
  private mapDbToSubjectAssignment(row: any): SubjectAssignment {
    return {
      id: row.id,
      subjectId: row.subject_id,
      teacherId: row.teacher_id,
      classId: row.class_id,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Get all subject assignments, optionally filtered by teacher, class, or subject
   */
  async getSubjectAssignments(
    supabase: SupabaseClient,
    filters?: {
      teacherId?: string;
      classId?: string;
      subjectId?: string;
    }
  ): Promise<SubjectAssignment[]> {
    try {
      let query = supabase
        .from('subject_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.teacherId) {
        query = query.eq('teacher_id', filters.teacherId);
      }
      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }
      if (filters?.subjectId) {
        query = query.eq('subject_id', filters.subjectId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDbToSubjectAssignment(row));
    } catch (error: any) {
      console.error('Error fetching subject assignments:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get subject assignments for a specific teacher
   */
  async getTeacherSubjectAssignments(
    supabase: SupabaseClient,
    teacherId: string
  ): Promise<SubjectAssignment[]> {
    return this.getSubjectAssignments(supabase, { teacherId });
  }

  /**
   * Create a subject assignment
   */
  async createSubjectAssignment(
    supabase: SupabaseClient,
    assignmentData: CreateSubjectAssignmentData
  ): Promise<SubjectAssignment> {
    try {
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('subject_assignments')
        .select('id')
        .eq('subject_id', assignmentData.subjectId)
        .eq('teacher_id', assignmentData.teacherId)
        .eq('class_id', assignmentData.classId)
        .single();

      if (existing) {
        throw new Error('This subject is already assigned to this teacher for this class');
      }

      const { data, error } = await supabase
        .from('subject_assignments')
        .insert({
          subject_id: assignmentData.subjectId,
          teacher_id: assignmentData.teacherId,
          class_id: assignmentData.classId,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505' || error.message?.includes('unique')) {
          throw new Error('This subject is already assigned to this teacher for this class');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create subject assignment');
      }

      return this.mapDbToSubjectAssignment(data);
    } catch (error: any) {
      console.error('Error creating subject assignment:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create multiple subject assignments
   */
  async createSubjectAssignments(
    supabase: SupabaseClient,
    assignmentsData: CreateSubjectAssignmentData[]
  ): Promise<SubjectAssignment[]> {
    try {
      if (assignmentsData.length === 0) {
        return [];
      }

      const insertData = assignmentsData.map((assignment) => ({
        subject_id: assignment.subjectId,
        teacher_id: assignment.teacherId,
        class_id: assignment.classId,
      }));

      const { data, error } = await supabase
        .from('subject_assignments')
        .insert(insertData)
        .select();

      if (error) {
        // Handle unique constraint violations
        if (error.code === '23505' || error.message?.includes('unique')) {
          throw new Error('One or more assignments already exist');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create subject assignments');
      }

      return data.map((row) => this.mapDbToSubjectAssignment(row));
    } catch (error: any) {
      console.error('Error creating subject assignments:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a subject assignment
   */
  async deleteSubjectAssignment(
    supabase: SupabaseClient,
    assignmentId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('subject_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting subject assignment:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a subject assignment by teacher, subject, and class
   */
  async deleteSubjectAssignmentByKeys(
    supabase: SupabaseClient,
    teacherId: string,
    subjectId: string,
    classId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('subject_assignments')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('subject_id', subjectId)
        .eq('class_id', classId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting subject assignment:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete all subject assignments for a teacher
   */
  async deleteTeacherSubjectAssignments(
    supabase: SupabaseClient,
    teacherId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('subject_assignments')
        .delete()
        .eq('teacher_id', teacherId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting teacher subject assignments:', error);
      throw new Error(formatError(error));
    }
  }
}

export const subjectAssignmentService = new SubjectAssignmentService();

