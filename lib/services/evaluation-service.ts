/**
 * Class Teacher Evaluation Service
 * Handles class teacher evaluations and rewards with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ConductRating = 'Respectful' | 'Obedience' | 'Hardworking' | 'Dutiful' | 'Humble' | 'Calm' | 'Approachable' | 'Unruly';
export type InterestLevel = 'Artwork' | 'Reading' | 'Football' | 'Athletics' | 'Music' | 'Computing Skills';
export type ClassTeacherRemarks = 'Dutiful' | 'Dutiful. Well done. Keep it up' | 'Keep it up' | 'Has improved' | 'Could do better' | 'More room for improvement' | 'Very positive in the class' | 'Very courteous' | 'Conduct well in class';

export interface ClassTeacherEvaluation {
  id: string;
  studentId: string;
  teacherId: string;
  term: number;
  academicYear: string;
  conductRating?: ConductRating;
  conductRemarks?: string;
  interestLevel?: InterestLevel;
  interestRemarks?: string;
  classTeacherRemarks?: ClassTeacherRemarks;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassTeacherReward {
  id: string;
  studentId: string;
  teacherId: string;
  rewardType: 'Merit' | 'Achievement' | 'Participation' | 'Leadership' | 'Improvement' | 'Other';
  description?: string;
  dateAwarded: Date;
  createdAt: Date;
}

export interface CreateEvaluationData {
  studentId: string;
  teacherId: string;
  term: number;
  academicYear: string;
  conductRating?: ConductRating;
  conductRemarks?: string;
  interestLevel?: InterestLevel;
  interestRemarks?: string;
  classTeacherRemarks?: ClassTeacherRemarks;
}

export interface CreateRewardData {
  studentId: string;
  teacherId: string;
  rewardType: 'Merit' | 'Achievement' | 'Participation' | 'Leadership' | 'Improvement' | 'Other';
  description?: string;
  dateAwarded?: string; // ISO date string
}

class EvaluationService {
  /**
   * Map database row to ClassTeacherEvaluation type
   */
  private mapDbToEvaluation(row: any): ClassTeacherEvaluation {
    return {
      id: row.id,
      studentId: row.student_id,
      teacherId: row.teacher_id,
      term: row.term,
      academicYear: row.academic_year,
      conductRating: row.conduct_rating as ConductRating | undefined,
      conductRemarks: row.conduct_remarks || undefined,
      interestLevel: row.interest_level as InterestLevel | undefined,
      interestRemarks: row.interest_remarks || undefined,
      classTeacherRemarks: row.class_teacher_remarks as ClassTeacherRemarks | undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map database row to ClassTeacherReward type
   */
  private mapDbToReward(row: any): ClassTeacherReward {
    return {
      id: row.id,
      studentId: row.student_id,
      teacherId: row.teacher_id,
      rewardType: row.reward_type as ClassTeacherReward['rewardType'],
      description: row.description || undefined,
      dateAwarded: new Date(row.date_awarded),
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Get evaluation for a student
   */
  async getEvaluation(
    supabase: SupabaseClient,
    studentId: string,
    term: number,
    academicYear: string
  ): Promise<ClassTeacherEvaluation | null> {
    try {
      const { data, error } = await supabase
        .from('class_teacher_evaluations')
        .select('*')
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('academic_year', academicYear)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? this.mapDbToEvaluation(data) : null;
    } catch (error: any) {
      console.error('Error fetching evaluation:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get evaluations for multiple students (by class)
   */
  async getEvaluationsByClass(
    supabase: SupabaseClient,
    classId: string,
    term?: number,
    academicYear?: string
  ): Promise<ClassTeacherEvaluation[]> {
    try {
      // First get student IDs for the class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId);

      if (studentsError) throw studentsError;
      if (!students || students.length === 0) return [];

      const studentIds = students.map((s) => s.id);

      let query = supabase
        .from('class_teacher_evaluations')
        .select('*')
        .in('student_id', studentIds);

      if (term) {
        query = query.eq('term', term);
      }
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

      return data.map((row) => this.mapDbToEvaluation(row));
    } catch (error: any) {
      console.error('Error fetching evaluations:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Create or update evaluation
   */
  async upsertEvaluation(
    supabase: SupabaseClient,
    evaluationData: CreateEvaluationData
  ): Promise<ClassTeacherEvaluation> {
    try {
      // Check if exists
      const existing = await this.getEvaluation(
        supabase,
        evaluationData.studentId,
        evaluationData.term,
        evaluationData.academicYear
      );

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('class_teacher_evaluations')
          .update({
            teacher_id: evaluationData.teacherId,
            conduct_rating: evaluationData.conductRating || null,
            conduct_remarks: evaluationData.conductRemarks || null,
            interest_level: evaluationData.interestLevel || null,
            interest_remarks: evaluationData.interestRemarks || null,
            class_teacher_remarks: evaluationData.classTeacherRemarks || null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return this.mapDbToEvaluation(data);
      } else {
        // Create
        const { data, error } = await supabase
          .from('class_teacher_evaluations')
          .insert({
            student_id: evaluationData.studentId,
            teacher_id: evaluationData.teacherId,
            term: evaluationData.term,
            academic_year: evaluationData.academicYear,
            conduct_rating: evaluationData.conductRating || null,
            conduct_remarks: evaluationData.conductRemarks || null,
            interest_level: evaluationData.interestLevel || null,
            interest_remarks: evaluationData.interestRemarks || null,
            class_teacher_remarks: evaluationData.classTeacherRemarks || null,
          })
          .select()
          .single();

        if (error) throw error;
        return this.mapDbToEvaluation(data);
      }
    } catch (error: any) {
      console.error('Error upserting evaluation:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get rewards for a student
   */
  async getStudentRewards(
    supabase: SupabaseClient,
    studentId: string,
    term?: number,
    academicYear?: string
  ): Promise<ClassTeacherReward[]> {
    try {
      let query = supabase
        .from('class_teacher_rewards')
        .select('*')
        .eq('student_id', studentId)
        .order('date_awarded', { ascending: false });

      // Note: rewards table doesn't have term/academic_year, so we filter by date if needed
      // For now, we'll return all rewards for the student

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDbToReward(row));
    } catch (error: any) {
      console.error('Error fetching rewards:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Create a reward
   */
  async createReward(
    supabase: SupabaseClient,
    rewardData: CreateRewardData
  ): Promise<ClassTeacherReward> {
    try {
      const { data, error } = await supabase
        .from('class_teacher_rewards')
        .insert({
          student_id: rewardData.studentId,
          teacher_id: rewardData.teacherId,
          reward_type: rewardData.rewardType,
          description: rewardData.description || null,
          date_awarded: rewardData.dateAwarded || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDbToReward(data);
    } catch (error: any) {
      console.error('Error creating reward:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Delete a reward
   */
  async deleteReward(supabase: SupabaseClient, rewardId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('class_teacher_rewards')
        .delete()
        .eq('id', rewardId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting reward:', error);
      throw new Error(formatError(error));
    }
  }
}

export const evaluationService = new EvaluationService();

