/**
 * Permission Service
 * Handles all permission-related operations with Supabase
 */

import { formatError } from '@/lib/utils/error-formatter';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  permission?: Permission;
  createdAt: Date;
}

class PermissionService {
  /**
   * Map database row to Permission type
   */
  private mapDbToPermission(row: any): Permission {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description || undefined,
      category: row.category,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get all permissions
   */
  async getPermissions(supabase: SupabaseClient): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDbToPermission(row));
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get permissions for a specific user
   */
  async getUserPermissions(
    supabase: SupabaseClient,
    userId: string
  ): Promise<UserPermission[]> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          permission:permissions(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        permissionId: row.permission_id,
        permission: row.permission ? this.mapDbToPermission(row.permission) : undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return [];
      }
      throw new Error(formatError(error));
    }
  }

  /**
   * Get permission codes for a user (simplified)
   */
  async getUserPermissionCodes(
    supabase: SupabaseClient,
    userId: string
  ): Promise<string[]> {
    try {
      const userPermissions = await this.getUserPermissions(supabase, userId);
      return userPermissions
        .map((up) => up.permission?.code)
        .filter((code): code is string => code !== undefined);
    } catch (error: any) {
      console.error('Error fetching user permission codes:', error);
      return [];
    }
  }

  /**
   * Set permissions for a user (replaces all existing permissions)
   */
  async setUserPermissions(
    supabase: SupabaseClient,
    userId: string,
    permissionCodes: string[]
  ): Promise<void> {
    try {
      // Get permission IDs from codes
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('id, code')
        .in('code', permissionCodes);

      if (permError) {
        throw permError;
      }

      if (!permissions || permissions.length === 0) {
        throw new Error('No valid permissions found');
      }

      // Delete existing permissions for this user
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new permissions
      if (permissions.length > 0) {
        const insertData = permissions.map((perm) => ({
          user_id: userId,
          permission_id: perm.id,
        }));

        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert(insertData);

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error: any) {
      console.error('Error setting user permissions:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Add a permission to a user
   */
  async addUserPermission(
    supabase: SupabaseClient,
    userId: string,
    permissionCode: string
  ): Promise<void> {
    try {
      // Get permission ID from code
      const { data: permission, error: permError } = await supabase
        .from('permissions')
        .select('id')
        .eq('code', permissionCode)
        .single();

      if (permError || !permission) {
        throw new Error('Permission not found');
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('permission_id', permission.id)
        .single();

      if (existing) {
        return; // Already exists, no need to add
      }

      // Insert permission
      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: permission.id,
        });

      if (insertError) {
        // Handle unique constraint violation
        if (insertError.code === '23505' || insertError.message?.includes('unique')) {
          return; // Already exists
        }
        throw insertError;
      }
    } catch (error: any) {
      console.error('Error adding user permission:', error);
      throw new Error(formatError(error));
    }
  }

  /**
   * Remove a permission from a user
   */
  async removeUserPermission(
    supabase: SupabaseClient,
    userId: string,
    permissionCode: string
  ): Promise<void> {
    try {
      // Get permission ID from code
      const { data: permission, error: permError } = await supabase
        .from('permissions')
        .select('id')
        .eq('code', permissionCode)
        .single();

      if (permError || !permission) {
        throw new Error('Permission not found');
      }

      // Delete permission
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission_id', permission.id);

      if (deleteError) {
        throw deleteError;
      }
    } catch (error: any) {
      console.error('Error removing user permission:', error);
      throw new Error(formatError(error));
    }
  }
}

export const permissionService = new PermissionService();

