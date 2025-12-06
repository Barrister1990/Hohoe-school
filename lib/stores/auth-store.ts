'use client';

import { authService, LoginCredentials, PasswordChangeRequest } from '@/lib/services/auth-service';
import { User } from '@/types';
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  changePassword: (email: string, request: PasswordChangeRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          // Add overall timeout to prevent hanging (60 seconds - only fires if truly stuck)
          // This allows normal slow network operations to complete
          const loginPromise = authService.login(credentials);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Login request timed out. Please check your internet connection and try again.'));
            }, 60000); // 60 second overall timeout - only fires if truly hung
          });

          const response = await Promise.race([loginPromise, timeoutPromise]);
          
          set({
            user: response.user,
            token: response.session?.access_token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return response.user; // Return user for immediate use
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
          });
          throw error; // Re-throw for component handling
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Use Promise.race with timeout to prevent hanging
          const logoutPromise = authService.logout();
          const timeoutPromise = new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 3000); // 3 second timeout
          });
          
          await Promise.race([logoutPromise, timeoutPromise]);
          
          // Always clear state, even if logout timed out or failed
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Even if logout fails, clear the state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verifyEmail(token);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      changePassword: async (email: string, request: PasswordChangeRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword(request);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password change failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.requestPasswordReset(email);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(token, newPassword);
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          token: null, // Token is managed by Supabase session
        });
      },
    })
);

