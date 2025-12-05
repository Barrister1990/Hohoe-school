/**
 * Subject Service
 * Handles all subject-related operations with Supabase
 */

import { Subject, SubjectCategory, SubjectLevelCategory } from '@/types';
import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UpdateSubjectData {
  id: string;
  name?: string;
  code?: string;
  category?: SubjectCategory;
  levelCategories?: SubjectLevelCategory[];
  description?: string;
}

class SubjectService {
  /**
   * Map database row to Subject type
   */
  private mapDbToSubject(row: any): Subject {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      category: row.category as SubjectCategory,
      levelCategories: (row.level_categories || []) as SubjectLevelCategory[],
      description: row.description || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get all subjects
   */
  async getSubjects(supabase: SupabaseClient): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Return empty array if no data
      if (!data || data.length === 0) {
        return [];
      }

      return (data || []).map((row) => this.mapDbToSubject(row));
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      // Return empty array instead of throwing for empty results
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get a single subject by ID
   */
  async getSubject(supabase: SupabaseClient, id: string): Promise<Subject | null> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data ? this.mapDbToSubject(data) : null;
    } catch (error: any) {
      console.error('Error fetching subject:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create a new subject
   */
  async createSubject(
    supabase: SupabaseClient,
    subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Subject> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: subjectData.name,
          code: subjectData.code.toUpperCase(),
          category: subjectData.category,
          level_categories: subjectData.levelCategories || [],
          description: subjectData.description || null,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (duplicate code)
        if (error.code === '23505' || error.message?.includes('unique')) {
          throw new Error('A subject with this code already exists. Please use a different code.');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create subject');
      }

      return this.mapDbToSubject(data);
    } catch (error: any) {
      console.error('Error creating subject:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update an existing subject
   */
  async updateSubject(supabase: SupabaseClient, subjectData: UpdateSubjectData): Promise<Subject> {
    try {
      const updateData: any = {};
      if (subjectData.name !== undefined) updateData.name = subjectData.name;
      if (subjectData.code !== undefined) updateData.code = subjectData.code.toUpperCase();
      if (subjectData.category !== undefined) updateData.category = subjectData.category;
      if (subjectData.levelCategories !== undefined) updateData.level_categories = subjectData.levelCategories;
      if (subjectData.description !== undefined) updateData.description = subjectData.description || null;

      const { data, error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', subjectData.id)
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (duplicate code)
        if (error.code === '23505' || error.message?.includes('unique')) {
          throw new Error('A subject with this code already exists. Please use a different code.');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Subject not found');
      }

      return this.mapDbToSubject(data);
    } catch (error: any) {
      console.error('Error updating subject:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a subject
   */
  async deleteSubject(supabase: SupabaseClient, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        // Check if subject is referenced in other tables
        if (error.code === '23503' || error.message?.includes('foreign key')) {
          throw new Error('Cannot delete subject. It is being used in grades or assignments. Please remove all references first.');
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      throw new Error(formatError(error));
    }
  }
}

export const subjectService = new SubjectService();

