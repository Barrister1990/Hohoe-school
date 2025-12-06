'use client';

import { useAlert } from '@/components/shared/AlertProvider';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatError } from '@/lib/utils/error-formatter';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { showSuccess } = useAlert();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLocalError(null);
    clearError();
    setIsNavigating(true);

    try {
      const user = await login({
        email: data.email,
        password: data.password,
      });

      if (user) {
        // Show success toast first
        showSuccess(`Welcome back, ${user.name}!`, 'Login successful');
        
        // Determine target URL
        const targetUrl = user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
        
        // Wait for alert to render, then navigate
        // Use setTimeout to ensure React has time to render the alert dialog
        setTimeout(() => {
          // Clear navigation state
          setIsNavigating(false);
          // Use window.location.href for full page reload - ensures alert shows and navigation works
          window.location.href = targetUrl;
        }, 600); // 600ms delay to ensure alert renders and is visible
        
        return;
      } else {
        setLocalError('Login failed. Please try again.');
        setIsNavigating(false);
      }
    } catch (err) {
      // Always reset navigation state on error
      setIsNavigating(false);
      
      const errorMessage = formatError(err);
      
      // Handle specific error cases (check original error, not formatted)
      const originalError = err instanceof Error ? err.message : '';
      if (originalError === 'EMAIL_NOT_VERIFIED' || originalError.includes('EMAIL_NOT_VERIFIED')) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      
      if (originalError === 'PASSWORD_CHANGE_REQUIRED' || originalError.includes('PASSWORD_CHANGE_REQUIRED')) {
        router.push(`/change-password?email=${encodeURIComponent(data.email)}&firstTime=true`);
        return;
      }

      setLocalError(errorMessage);
    }
  };

  const displayError = error || localError;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1.5">
          Sign in to your account
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Enter your credentials to access the system
        </p>
      </div>

      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs sm:text-sm text-red-700">{displayError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              className="block w-full pl-9 pr-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="name@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <span className="mr-1">•</span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="block w-full pl-9 pr-9 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <span className="mr-1">•</span>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || isNavigating}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {(isLoading || isNavigating) ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-center text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <span className="text-gray-500">
            Contact your administrator to create one.
          </span>
        </p>
      </div>
    </div>
  );
}
