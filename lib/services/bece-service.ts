/**
 * BECE Results Service
 * Handles all BECE results operations with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface BECEResult {
  id: string;
  studentId: string;
  academicYear: string;
  subject: string;
  grade: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBECEResultData {
  studentId: string;
  academicYear: string;
  subject: string;
  grade: string;
  remark?: string;
}

export interface UpdateBECEResultData extends Partial<CreateBECEResultData> {
  id: string;
}

class BECEService {
  /**
   * Map database row to BECEResult type
   */
  private mapDbToBECEResult(row: any): BECEResult {
    return {
      id: row.id,
      studentId: row.student_id,
      academicYear: row.academic_year,
      subject: row.subject,
      grade: row.grade,
      remark: row.remark || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get BECE results for a student
   */
  async getBECEResultsByStudent(
    supabase: SupabaseClient,
    studentId: string,
    academicYear?: string
  ): Promise<BECEResult[]> {
    try {
      let query = supabase
        .from('bece_results')
        .select('*')
        .eq('student_id', studentId)
        .order('subject', { ascending: true });

      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDbToBECEResult(row));
    } catch (error: any) {
      console.error('Error fetching BECE results:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get all BECE results, optionally filtered by academic year
   */
  async getBECEResults(
    supabase: SupabaseClient,
    academicYear?: string
  ): Promise<BECEResult[]> {
    try {
      let query = supabase
        .from('bece_results')
        .select('*')
        .order('academic_year', { ascending: false })
        .order('student_id', { ascending: true })
        .order('subject', { ascending: true });

      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDbToBECEResult(row));
    } catch (error: any) {
      console.error('Error fetching BECE results:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get BECE results grouped by student
   */
  async getBECEResultsByStudentGrouped(
    supabase: SupabaseClient,
    academicYear?: string
  ): Promise<Record<string, BECEResult[]>> {
    try {
      const results = await this.getBECEResults(supabase, academicYear);
      const grouped: Record<string, BECEResult[]> = {};

      results.forEach((result) => {
        if (!grouped[result.studentId]) {
          grouped[result.studentId] = [];
        }
        grouped[result.studentId].push(result);
      });

      return grouped;
    } catch (error: any) {
      console.error('Error grouping BECE results:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create a BECE result
   */
  async createBECEResult(
    supabase: SupabaseClient,
    resultData: CreateBECEResultData
  ): Promise<BECEResult> {
    try {
      const { data, error } = await supabase
        .from('bece_results')
        .insert({
          student_id: resultData.studentId,
          academic_year: resultData.academicYear,
          subject: resultData.subject,
          grade: resultData.grade,
          remark: resultData.remark || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create BECE result');
      }

      return this.mapDbToBECEResult(data);
    } catch (error: any) {
      console.error('Error creating BECE result:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Create multiple BECE results
   */
  async createBECEResults(
    supabase: SupabaseClient,
    resultsData: CreateBECEResultData[]
  ): Promise<BECEResult[]> {
    try {
      if (resultsData.length === 0) {
        return [];
      }

      const insertData = resultsData.map((result) => ({
        student_id: result.studentId,
        academic_year: result.academicYear,
        subject: result.subject,
        grade: result.grade,
        remark: result.remark || null,
      }));

      const { data, error } = await supabase
        .from('bece_results')
        .insert(insertData)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create BECE results');
      }

      return data.map((row) => this.mapDbToBECEResult(row));
    } catch (error: any) {
      console.error('Error creating BECE results:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update a BECE result
   */
  async updateBECEResult(
    supabase: SupabaseClient,
    resultData: UpdateBECEResultData
  ): Promise<BECEResult> {
    try {
      const updateData: any = {};
      if (resultData.subject !== undefined) updateData.subject = resultData.subject;
      if (resultData.grade !== undefined) updateData.grade = resultData.grade;
      if (resultData.remark !== undefined) updateData.remark = resultData.remark || null;
      if (resultData.academicYear !== undefined) updateData.academic_year = resultData.academicYear;

      const { data, error } = await supabase
        .from('bece_results')
        .update(updateData)
        .eq('id', resultData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('BECE result not found');
      }

      return this.mapDbToBECEResult(data);
    } catch (error: any) {
      console.error('Error updating BECE result:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a BECE result
   */
  async deleteBECEResult(supabase: SupabaseClient, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bece_results')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting BECE result:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete all BECE results for a student
   */
  async deleteBECEResultsByStudent(
    supabase: SupabaseClient,
    studentId: string,
    academicYear?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('bece_results')
        .delete()
        .eq('student_id', studentId);

      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting BECE results:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Calculate aggregate for a student's BECE results
   */
  calculateAggregate(results: BECEResult[]): number | null {
    if (results.length === 0) {
      return null;
    }

    // Grade mapping: A1=1, B2=2, B3=3, C4=4, C5=5, C6=6, D7=7, E8=8, F9=9
    const gradeMap: Record<string, number> = {
      'A1': 1,
      'B2': 2,
      'B3': 3,
      'C4': 4,
      'C5': 5,
      'C6': 6,
      'D7': 7,
      'E8': 8,
      'F9': 9,
    };

    let total = 0;
    let count = 0;

    results.forEach((result) => {
      const gradeValue = gradeMap[result.grade.toUpperCase()];
      if (gradeValue !== undefined) {
        total += gradeValue;
        count++;
      }
    });

    return count > 0 ? total : null;
  }
}

export const beceService = new BECEService();

