import { supabase } from '@/lib/supabase/client';
import { User, UserRole } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session: any;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        // Format Supabase auth errors to be user-friendly
        const errorMessage = authError.message || 'Invalid email or password';
        
        if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Email not confirmed')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        if (errorMessage.includes('Email rate limit')) {
          throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
        }
        
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      if (!authData.user || !authData.session) {
        throw new Error('Authentication failed');
      }

      // Get user profile from public.users table
      // Use auth_user_id for more reliable lookup
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError || !userData) {
        // Provide user-friendly error message
        if (userError?.code === 'PGRST116') {
          // No rows returned - user exists in auth but not in public.users
          throw new Error(
            'Your account is not fully set up. Please contact your administrator to complete your account setup.'
          );
        }
        
        // Check for RLS/permission errors
        if (userError?.code === '42501' || userError?.message?.includes('permission') || userError?.message?.includes('policy')) {
          throw new Error(
            'Unable to access your account information. Please contact your administrator.'
          );
        }
        
        throw new Error('Unable to load your account. Please contact your administrator if this problem persists.');
      }

      if (!userData.is_active) {
        await supabase.auth.signOut();
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Check if email is verified
      if (!userData.email_verified && authData.user.email_confirmed_at === null) {
        await supabase.auth.signOut();
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      // Check if password change is required
      if (userData.password_change_required) {
        throw new Error('PASSWORD_CHANGE_REQUIRED');
      }

      // Convert to User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        phone: userData.phone || undefined,
        isActive: userData.is_active,
        isClassTeacher: userData.is_class_teacher || false,
        isSubjectTeacher: userData.is_subject_teacher || false,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      };

      return {
        user,
        session: authData.session,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Sign out from Supabase Auth (this clears the session and cookies)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // Don't throw error - still clear local state even if signOut fails
        // This ensures user can still logout even if there's a network issue
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw - ensure logout completes even if there's an error
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        return null;
      }

      // Get user profile using auth_user_id (more reliable than email)
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error || !userData) {
        return null;
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        phone: userData.phone || undefined,
        isActive: userData.is_active,
        isClassTeacher: userData.is_class_teacher || false,
        isSubjectTeacher: userData.is_subject_teacher || false,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Verify email with token
   * Supports both OTP tokens and confirmation tokens from email links
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Try OTP verification first (for email confirmation links)
      let error = null;
      
      // Check if token is a hash (from OTP) or a regular token (from confirmation link)
      if (token.length > 20) {
        // Likely an OTP token hash
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });
        error = otpError;
      } else {
        // Try as confirmation token
        // Note: For email confirmation, Supabase handles this automatically via the callback
        // Since we don't have the email here, we skip this verification attempt
        // and rely on the session check below or the automatic callback handling
        // The token verification will be handled by Supabase's callback mechanism
        error = new Error('Email required for token verification');
      }

      // If OTP verification fails, try to verify using the session
      // (Supabase email confirmation links automatically confirm when clicked)
      if (error) {
        // Check if user is already confirmed (link might have auto-confirmed)
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email_confirmed_at) {
          // User is already confirmed, just update the flag
          await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('auth_user_id', user.id);
          return; // Success
        }

        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          throw new Error('This verification link has expired or is invalid. Please request a new verification email.');
        }
        throw new Error('Unable to verify your email. Please try again or request a new verification link.');
      }

      // Update email_verified in public.users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ email_verified: true })
          .eq('auth_user_id', user.id);
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(request: PasswordChangeRequest): Promise<void> {
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: request.newPassword,
      });

      if (error) {
        if (error.message?.includes('same as')) {
          throw new Error('New password must be different from your current password.');
        }
        if (error.message?.includes('weak') || error.message?.includes('password')) {
          throw new Error('Password does not meet security requirements. Please choose a stronger password.');
        }
        throw new Error('Unable to change password. Please try again.');
      }

      // Update password_change_required flag
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ password_change_required: false })
          .eq('auth_user_id', user.id);
        
        if (updateError) {
          console.error('Failed to update password_change_required:', updateError);
          // Don't throw - password is changed, just couldn't update the flag
        }
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message?.includes('rate limit')) {
          throw new Error('Too many password reset requests. Please wait a few minutes before trying again.');
        }
        // Don't reveal if email exists or not for security
        // Always show success message
        throw new Error('If an account exists with this email, a password reset link has been sent.');
      }
    } catch (error: any) {
      // For security, always show a generic success message
      // The actual error is logged but not shown to user
      if (error.message?.includes('rate limit')) {
        throw error; // Show rate limit errors
      }
      // For other errors, don't reveal details - just show generic message
      throw new Error('If an account exists with this email, a password reset link has been sent.');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });

      if (error) {
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          throw new Error('This password reset link has expired or is invalid. Please request a new one.');
        }
        throw new Error('Unable to verify reset link. Please request a new password reset.');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (updateError.message?.includes('weak') || updateError.message?.includes('password')) {
          throw new Error('Password does not meet security requirements. Please choose a stronger password.');
        }
        throw new Error('Unable to reset password. Please try again.');
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Create teacher account (admin only)
   * Note: This should be called via API route that has service role key
   */
  async createTeacher(data: {
    name: string;
    email: string;
    phone?: string;
    role: 'class_teacher' | 'subject_teacher';
    password: string;
  }): Promise<User> {
    try {
      // Call API route instead of direct Supabase call
      // (Admin operations require service role key which should not be exposed to client)
      const response = await fetch('/api/teachers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create teacher');
      }

      return result.user;
    } catch (error: any) {
      throw error;
    }
  }
}

export const authService = new AuthService();

