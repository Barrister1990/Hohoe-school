/**
 * Password Service
 * Handles password operations with Supabase
 */

import { supabase } from '@/lib/supabase/client';
import { authService } from './auth-service';

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
}

class PasswordService {
  /**
   * Change password (for logged-in users or first-time setup)
   * @param email User email
   * @param request Password change request
   * @param isFirstTime Whether this is first-time password setup
   */
  async changePassword(
    email: string,
    request: PasswordChangeRequest,
    isFirstTime: boolean = false
  ): Promise<void> {
    // Use authService which handles Supabase password change
    await authService.changePassword({
      currentPassword: isFirstTime ? '' : request.currentPassword,
      newPassword: request.newPassword,
      confirmPassword: request.confirmPassword,
    });
  }

  /**
   * Request password reset (forgot password)
   * @param email User email
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  /**
   * Reset password with token (from email link)
   * @param token Reset token from email
   * @param newPassword New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify the token first
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (verifyError) {
      throw new Error('Invalid or expired reset token. Please request a new password reset.');
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  /**
   * Verify email with token
   * @param token Verification token from email
   */
  async verifyEmail(token: string): Promise<void> {
    // Use authService which handles Supabase email verification
    await authService.verifyEmail(token);
  }

  /**
   * Check if email is verified
   * @param email User email
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check both auth user and public.users table
    const { data: userData } = await supabase
      .from('users')
      .select('email_verified')
      .eq('auth_user_id', user.id)
      .single();

    return user.email_confirmed_at !== null && (userData?.email_verified || false);
  }

  /**
   * Check if password change is required
   * @param email User email
   */
  async needsPasswordChange(email: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check password_change_required flag in public.users table
    const { data: userData } = await supabase
      .from('users')
      .select('password_change_required')
      .eq('auth_user_id', user.id)
      .single();

    return userData?.password_change_required || false;
  }
}

export const passwordService = new PasswordService();

