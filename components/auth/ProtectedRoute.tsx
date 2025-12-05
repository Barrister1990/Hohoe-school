'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push(redirectTo);
        return;
      }

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/teacher/dashboard');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role access
  if (allowedRoles) {
    const hasAccess = allowedRoles.some((role) => {
      if (role === 'admin') {
        return user.role === 'admin';
      }
      // For teacher roles, check the boolean flags
      if (role === 'class_teacher') {
        return user.isClassTeacher === true;
      }
      if (role === 'subject_teacher') {
        return user.isSubjectTeacher === true;
      }
      return false;
    });

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}

