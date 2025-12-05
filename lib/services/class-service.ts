/**
 * Class Service
 * Handles all class-related operations with Supabase
 */

import { Class, Term } from '@/types';
import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CreateClassData {
  name: string;
  level: number; // 0-10 (KG 1=0, KG 2=1, Basic 1=2, ..., Basic 9=10)
  stream?: string;
  classTeacherId: string;
  capacity: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id: string;
}

class ClassService {
  /**
   * Get all classes
   */
  async getClasses(supabase: SupabaseClient): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Return empty array if no data, don't throw error
      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDbToClass(row));
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      // Return empty array instead of throwing for empty results
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get a single class by ID
   */
  async getClass(supabase: SupabaseClient, id: string): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data ? this.mapDbToClass(data) : null;
    } catch (error: any) {
      console.error('Error fetching class:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create a new class
   */
  async createClass(supabase: SupabaseClient, classData: CreateClassData): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: classData.name,
          level: classData.level,
          stream: classData.stream || null,
          class_teacher_id: classData.classTeacherId,
          capacity: classData.capacity,
          student_count: 0,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDbToClass(data);
    } catch (error: any) {
      console.error('Error creating class:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update an existing class
   */
  async updateClass(supabase: SupabaseClient, classData: UpdateClassData): Promise<Class> {
    try {
      const updateData: any = {};
      if (classData.name !== undefined) updateData.name = classData.name;
      if (classData.level !== undefined) updateData.level = classData.level;
      if (classData.stream !== undefined) updateData.stream = classData.stream || null;
      if (classData.classTeacherId !== undefined) updateData.class_teacher_id = classData.classTeacherId || null;
      if (classData.capacity !== undefined) updateData.capacity = classData.capacity;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', classData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDbToClass(data);
    } catch (error: any) {
      console.error('Error updating class:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a class
   */
  async deleteClass(supabase: SupabaseClient, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting class:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Map database row to Class type
   * Note: academicYear and term are not stored in DB (classes are permanent)
   * We set default values for compatibility with frontend
   */
  private mapDbToClass(row: any): Class {
    // Get current academic year (YYYY/YYYY format)
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const academicYear = `${currentYear}/${nextYear}`;

    return {
      id: row.id,
      name: row.name,
      level: row.level,
      stream: row.stream,
      classTeacherId: row.class_teacher_id,
      academicYear, // Default to current academic year
      term: 1 as Term, // Default to term 1 (not stored in DB)
      studentCount: row.student_count,
      capacity: row.capacity,
      subjects: [], // Will be populated from subject_assignments if needed
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const classService = new ClassService();

