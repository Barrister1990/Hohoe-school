/**
 * Error Formatter Utility
 * Converts technical errors into user-friendly messages
 */

export function formatError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // If it's already a user-friendly string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, check the message
  if (error instanceof Error) {
    const message = error.message;

    // Supabase errors
    if (message.includes('User profile not found')) {
      return 'Your account was not found in the system. Please contact your administrator.';
    }

    if (message.includes('Invalid email or password') || message.includes('Invalid login credentials')) {
      return 'The email or password you entered is incorrect. Please try again.';
    }

    if (message.includes('Email rate limit exceeded')) {
      return 'Too many emails sent. Please wait a few minutes before trying again.';
    }

    if (message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }

    if (message.includes('Email not confirmed')) {
      return 'Please verify your email address before logging in. Check your inbox for the verification link.';
    }

    if (message.includes('Token has expired') || message.includes('expired')) {
      return 'This link has expired. Please request a new one.';
    }

    if (message.includes('Invalid token') || message.includes('Token is invalid')) {
      return 'This link is invalid or has already been used. Please request a new one.';
    }

    if (message.includes('Network') || message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (message.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }

    // Database errors
    if (message.includes('duplicate key') || message.includes('already exists')) {
      return 'This record already exists. Please use a different value.';
    }

    if (message.includes('foreign key') || message.includes('constraint')) {
      return 'This action cannot be completed. Some related data is missing.';
    }

    if (message.includes('permission denied') || message.includes('policy')) {
      return 'You do not have permission to perform this action.';
    }

    if (message.includes('infinite recursion')) {
      return 'A system error occurred. Please contact support if this persists.';
    }

    // Auth errors
    if (message.includes('Account is inactive')) {
      return 'Your account has been deactivated. Please contact your administrator.';
    }

    if (message.includes('EMAIL_NOT_VERIFIED')) {
      return 'Please verify your email address before logging in.';
    }

    if (message.includes('PASSWORD_CHANGE_REQUIRED')) {
      return 'You need to change your password before logging in.';
    }

    // Generic error patterns
    if (message.includes('Failed to') || message.includes('Error')) {
      // Try to extract a more user-friendly message
      const cleanMessage = message
        .replace(/^Error: /i, '')
        .replace(/^Failed to /i, '')
        .replace(/\.$/, '');
      
      return cleanMessage || 'An error occurred. Please try again.';
    }

    // Return the original message if no pattern matches
    // But clean it up a bit
    return message
      .replace(/^Error: /i, '')
      .replace(/^\[.*?\] /, '')
      .trim() || 'An unexpected error occurred. Please try again.';
  }

  // For other error types, return a generic message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Format Supabase-specific errors
 */
export function formatSupabaseError(error: any): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Supabase error structure
  if (error.message) {
    return formatError(error);
  }

  // Supabase PostgREST errors
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'The requested information was not found.';
      case '23505':
        return 'This record already exists. Please use a different value.';
      case '23503':
        return 'This action cannot be completed. Some related data is missing.';
      case '42501':
        return 'You do not have permission to perform this action.';
      default:
        return formatError(error);
    }
  }

  return formatError(error);
}

