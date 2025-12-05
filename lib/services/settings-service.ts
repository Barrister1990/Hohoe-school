/**
 * Settings Service
 * Handles all settings-related operations with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SchoolSettings {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  updatedAt: Date;
}

export interface AcademicSettings {
  id: string;
  currentAcademicYear: string;
  currentTerm: number;
  updatedAt: Date;
}

export interface AssessmentStructure {
  id: string;
  project: number;
  test1: number;
  test2: number;
  groupWork: number;
  exam: number;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  gradeAlerts: boolean;
  attendanceAlerts: boolean;
  reportAlerts: boolean;
  systemUpdates: boolean;
  theme: 'light' | 'dark' | 'auto';
  updatedAt: Date;
}

export interface SystemPreferences {
  id: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetentionYears: number;
  updatedAt: Date;
}

class SettingsService {
  /**
   * Get school settings
   */
  async getSchoolSettings(supabase: SupabaseClient): Promise<SchoolSettings | null> {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No settings found
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error fetching school settings:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update school settings
   */
  async updateSchoolSettings(
    supabase: SupabaseClient,
    settings: Partial<Omit<SchoolSettings, 'id' | 'updatedAt'>>
  ): Promise<SchoolSettings> {
    try {
      // Get existing settings or create new
      const existing = await this.getSchoolSettings(supabase);
      
      const updateData: any = {};
      if (settings.name !== undefined) updateData.name = settings.name;
      if (settings.address !== undefined) updateData.address = settings.address || null;
      if (settings.phone !== undefined) updateData.phone = settings.phone || null;
      if (settings.email !== undefined) updateData.email = settings.email || null;
      if (settings.website !== undefined) updateData.website = settings.website || null;

      let result;
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('school_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('school_settings')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        name: result.name,
        address: result.address || undefined,
        phone: result.phone || undefined,
        email: result.email || undefined,
        website: result.website || undefined,
        updatedAt: new Date(result.updated_at),
      };
    } catch (error: any) {
      console.error('Error updating school settings:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get academic settings
   */
  async getAcademicSettings(supabase: SupabaseClient): Promise<AcademicSettings | null> {
    try {
      const { data, error } = await supabase
        .from('academic_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        currentAcademicYear: data.current_academic_year,
        currentTerm: data.current_term,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error fetching academic settings:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update academic settings
   */
  async updateAcademicSettings(
    supabase: SupabaseClient,
    settings: Partial<Omit<AcademicSettings, 'id' | 'updatedAt'>>
  ): Promise<AcademicSettings> {
    try {
      const existing = await this.getAcademicSettings(supabase);
      
      const updateData: any = {};
      if (settings.currentAcademicYear !== undefined) updateData.current_academic_year = settings.currentAcademicYear;
      if (settings.currentTerm !== undefined) updateData.current_term = settings.currentTerm;

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('academic_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('academic_settings')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        currentAcademicYear: result.current_academic_year,
        currentTerm: result.current_term,
        updatedAt: new Date(result.updated_at),
      };
    } catch (error: any) {
      console.error('Error updating academic settings:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get assessment structure
   */
  async getAssessmentStructure(supabase: SupabaseClient): Promise<AssessmentStructure | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_structure')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        project: parseFloat(data.project),
        test1: parseFloat(data.test1),
        test2: parseFloat(data.test2),
        groupWork: parseFloat(data.group_work),
        exam: parseFloat(data.exam),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error fetching assessment structure:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update assessment structure
   */
  async updateAssessmentStructure(
    supabase: SupabaseClient,
    structure: Partial<Omit<AssessmentStructure, 'id' | 'updatedAt'>>
  ): Promise<AssessmentStructure> {
    try {
      const existing = await this.getAssessmentStructure(supabase);
      
      const updateData: any = {};
      if (structure.project !== undefined) updateData.project = structure.project;
      if (structure.test1 !== undefined) updateData.test1 = structure.test1;
      if (structure.test2 !== undefined) updateData.test2 = structure.test2;
      if (structure.groupWork !== undefined) updateData.group_work = structure.groupWork;
      if (structure.exam !== undefined) updateData.exam = structure.exam;

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('assessment_structure')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('assessment_structure')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        project: parseFloat(result.project),
        test1: parseFloat(result.test1),
        test2: parseFloat(result.test2),
        groupWork: parseFloat(result.group_work),
        exam: parseFloat(result.exam),
        updatedAt: new Date(result.updated_at),
      };
    } catch (error: any) {
      console.error('Error updating assessment structure:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(supabase: SupabaseClient, userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No preferences found, will use defaults
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        emailNotifications: data.email_notifications,
        gradeAlerts: data.grade_alerts,
        attendanceAlerts: data.attendance_alerts,
        reportAlerts: data.report_alerts,
        systemUpdates: data.system_updates,
        theme: data.theme as 'light' | 'dark' | 'auto',
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error fetching user preferences:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    supabase: SupabaseClient,
    userId: string,
    preferences: Partial<Omit<UserPreferences, 'id' | 'userId' | 'updatedAt'>>
  ): Promise<UserPreferences> {
    try {
      const existing = await this.getUserPreferences(supabase, userId);
      
      const updateData: any = {};
      if (preferences.emailNotifications !== undefined) updateData.email_notifications = preferences.emailNotifications;
      if (preferences.gradeAlerts !== undefined) updateData.grade_alerts = preferences.gradeAlerts;
      if (preferences.attendanceAlerts !== undefined) updateData.attendance_alerts = preferences.attendanceAlerts;
      if (preferences.reportAlerts !== undefined) updateData.report_alerts = preferences.reportAlerts;
      if (preferences.systemUpdates !== undefined) updateData.system_updates = preferences.systemUpdates;
      if (preferences.theme !== undefined) updateData.theme = preferences.theme;

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('user_preferences')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            ...updateData,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        userId: result.user_id,
        emailNotifications: result.email_notifications,
        gradeAlerts: result.grade_alerts,
        attendanceAlerts: result.attendance_alerts,
        reportAlerts: result.report_alerts,
        systemUpdates: result.system_updates,
        theme: result.theme as 'light' | 'dark' | 'auto',
        updatedAt: new Date(result.updated_at),
      };
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Get system preferences
   */
  async getSystemPreferences(supabase: SupabaseClient): Promise<SystemPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('system_preferences')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        autoBackup: data.auto_backup,
        backupFrequency: data.backup_frequency as 'daily' | 'weekly' | 'monthly',
        dataRetentionYears: data.data_retention_years,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error fetching system preferences:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Update system preferences
   */
  async updateSystemPreferences(
    supabase: SupabaseClient,
    preferences: Partial<Omit<SystemPreferences, 'id' | 'updatedAt'>>
  ): Promise<SystemPreferences> {
    try {
      const existing = await this.getSystemPreferences(supabase);
      
      const updateData: any = {};
      if (preferences.autoBackup !== undefined) updateData.auto_backup = preferences.autoBackup;
      if (preferences.backupFrequency !== undefined) updateData.backup_frequency = preferences.backupFrequency;
      if (preferences.dataRetentionYears !== undefined) updateData.data_retention_years = preferences.dataRetentionYears;

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('system_preferences')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('system_preferences')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        autoBackup: result.auto_backup,
        backupFrequency: result.backup_frequency as 'daily' | 'weekly' | 'monthly',
        dataRetentionYears: result.data_retention_years,
        updatedAt: new Date(result.updated_at),
      };
    } catch (error: any) {
      console.error('Error updating system preferences:', error);
      throw new Error(formatError(error));
    }
  }
}

export const settingsService = new SettingsService();

