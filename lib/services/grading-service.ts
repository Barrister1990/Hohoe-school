/**
 * Grading System Service
 * Handles grading system operations with Supabase
 */

import { GradingSystem, GradeLevel } from '@/types/grading-system';
import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

class GradingService {
  /**
   * Map database row to GradeLevel
   */
  private mapDbToGradeLevel(row: any): GradeLevel {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      minPercentage: parseFloat(row.min_percentage),
      maxPercentage: parseFloat(row.max_percentage),
      order: row.order_index,
    };
  }

  /**
   * Get active grading system with grade levels
   */
  async getGradingSystem(supabase: SupabaseClient): Promise<GradingSystem | null> {
    try {
      // Get active grading system
      const { data: systemData, error: systemError } = await supabase
        .from('grading_system')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (systemError) {
        if (systemError.code === 'PGRST116') {
          return null; // No active system found
        }
        throw systemError;
      }

      if (!systemData) return null;

      // Get grade levels for this system
      const { data: levelsData, error: levelsError } = await supabase
        .from('grade_levels')
        .select('*')
        .eq('grading_system_id', systemData.id)
        .order('order_index', { ascending: false });

      if (levelsError) {
        throw levelsError;
      }

      const gradeLevels = (levelsData || []).map((row) => this.mapDbToGradeLevel(row));

      return {
        id: systemData.id,
        name: systemData.name,
        description: systemData.description || '',
        gradeLevels,
        isActive: systemData.is_active,
        createdAt: new Date(systemData.created_at),
        updatedAt: new Date(systemData.updated_at),
      };
    } catch (error: any) {
      console.error('Error fetching grading system:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update grading system
   */
  async updateGradingSystem(
    supabase: SupabaseClient,
    system: Omit<GradingSystem, 'createdAt' | 'updatedAt'>
  ): Promise<GradingSystem> {
    try {
      // Update or create grading system
      const existing = await this.getGradingSystem(supabase);
      
      let systemId: string;
      if (existing) {
        // Update existing system
        const { data, error } = await supabase
          .from('grading_system')
          .update({
            name: system.name,
            description: system.description || null,
            is_active: system.isActive,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        systemId = data.id;
      } else {
        // Create new system
        const { data, error } = await supabase
          .from('grading_system')
          .insert({
            name: system.name,
            description: system.description || null,
            is_active: system.isActive,
          })
          .select()
          .single();

        if (error) throw error;
        systemId = data.id;
      }

      // Delete existing grade levels
      const { error: deleteError } = await supabase
        .from('grade_levels')
        .delete()
        .eq('grading_system_id', systemId);

      if (deleteError) throw deleteError;

      // Insert new grade levels
      if (system.gradeLevels.length > 0) {
        const levelsToInsert = system.gradeLevels.map((level) => ({
          grading_system_id: systemId,
          code: level.code,
          name: level.name,
          min_percentage: level.minPercentage,
          max_percentage: level.maxPercentage,
          order_index: level.order,
          color_class: null, // Can be added later if needed
        }));

        const { error: insertError } = await supabase
          .from('grade_levels')
          .insert(levelsToInsert);

        if (insertError) throw insertError;
      }

      // Fetch updated system
      const updated = await this.getGradingSystem(supabase);
      if (!updated) {
        throw new Error('Failed to retrieve updated grading system');
      }

      return updated;
    } catch (error: any) {
      console.error('Error updating grading system:', error);
      throw new Error(formatError(error));
    }
  }
}

export const gradingService = new GradingService();

