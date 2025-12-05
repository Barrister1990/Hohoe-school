'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { authService, LoginCredentials, PasswordChangeRequest } from '@/lib/services/auth-service';

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
          const response = await authService.login(credentials);
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
          await authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ isLoading: false });
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

