'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authService } from '@/lib/services/auth-service';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook to initialize and maintain Supabase auth session
 * Should be used in the root layout or a provider component
 */
export function useAuthSession() {
  const { setUser, isLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Initialize session on mount
    const initSession = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session && mounted) {
          // Get user profile
          const user = await authService.getCurrentUser();
          if (user && mounted) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh user data when token is refreshed
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser]);
}

