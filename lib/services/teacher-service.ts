/**
 * Teacher Service
 * Handles all teacher-related operations with Supabase
 */

import { User } from '@/types';
import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UpdateTeacherData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
  isActive?: boolean;
}

class TeacherService {
  /**
   * Get all teachers
   */
  async getTeachers(supabase: SupabaseClient): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['class_teacher', 'subject_teacher'])
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Return empty array if no data
      if (!data || data.length === 0) {
        return [];
      }

      return (data || []).map((row) => this.mapDbToUser(row));
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      // Return empty array instead of throwing for empty results
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get a single teacher by ID
   */
  async getTeacher(supabase: SupabaseClient, id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data ? this.mapDbToUser(data) : null;
    } catch (error: any) {
      console.error('Error fetching teacher:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update an existing teacher
   */
  async updateTeacher(supabase: SupabaseClient, teacherData: UpdateTeacherData): Promise<User> {
    try {
      const updateData: any = {};
      if (teacherData.name !== undefined) updateData.name = teacherData.name;
      if (teacherData.email !== undefined) updateData.email = teacherData.email;
      if (teacherData.phone !== undefined) updateData.phone = teacherData.phone || null;
      if (teacherData.isClassTeacher !== undefined) updateData.is_class_teacher = teacherData.isClassTeacher;
      if (teacherData.isSubjectTeacher !== undefined) updateData.is_subject_teacher = teacherData.isSubjectTeacher;
      if (teacherData.isActive !== undefined) updateData.is_active = teacherData.isActive;

      // Update primary role if role flags changed
      if (teacherData.isClassTeacher !== undefined || teacherData.isSubjectTeacher !== undefined) {
        // Get current teacher data to determine new primary role
        const currentTeacher = await this.getTeacher(supabase, teacherData.id);
        if (currentTeacher) {
          const isClassTeacher = teacherData.isClassTeacher !== undefined 
            ? teacherData.isClassTeacher 
            : currentTeacher.isClassTeacher || false;
          const isSubjectTeacher = teacherData.isSubjectTeacher !== undefined 
            ? teacherData.isSubjectTeacher 
            : currentTeacher.isSubjectTeacher || false;

          // Determine primary role (for routing/navigation)
          const primaryRole = isClassTeacher && isSubjectTeacher
            ? 'class_teacher'
            : isClassTeacher
            ? 'class_teacher'
            : 'subject_teacher';

          updateData.role = primaryRole;
        }
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', teacherData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDbToUser(data);
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      throw new Error(formatError(error));
    }
  }


  /**
   * Map database row to User type
   */
  private mapDbToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      phone: row.phone,
      avatar: row.avatar_url,
      isActive: row.is_active,
      isClassTeacher: row.is_class_teacher || false,
      isSubjectTeacher: row.is_subject_teacher || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const teacherService = new TeacherService();

