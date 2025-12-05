import { User, UserRole } from '@/types';

/**
 * Mock Authentication Service
 * Simulates authentication flow:
 * - Admin creates users
 * - Users verify email
 * - Users change password on first login
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class MockAuthService {
  // Mock storage (in real app, this would be Supabase)
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@hohoe.edu.gh',
      name: 'Admin User',
      role: 'admin',
      phone: '+233123456789',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      email: 'teacher@hohoe.edu.gh',
      name: 'Test Teacher',
      role: 'class_teacher',
      phone: '+233123456790',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '3',
      email: 'subjectteacher@hohoe.edu.gh',
      name: 'Subject Teacher',
      role: 'subject_teacher',
      phone: '+233123456791',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  // Mock passwords (in real app, these would be hashed)
  private mockPasswords: Record<string, string> = {
    'admin@hohoe.edu.gh': 'admin123',
    'teacher@hohoe.edu.gh': 'teacher123',
    'subjectteacher@hohoe.edu.gh': 'teacher123',
  };

  // Mock email verification status
  private emailVerified: Record<string, boolean> = {
    'admin@hohoe.edu.gh': true,
    'teacher@hohoe.edu.gh': true, // Verified for easy testing
    'subjectteacher@hohoe.edu.gh': true, // Verified for easy testing
  };

  // Mock password changed status (first-time login)
  private passwordChanged: Record<string, boolean> = {
    'admin@hohoe.edu.gh': true,
    'teacher@hohoe.edu.gh': true, // Password changed for easy testing
    'subjectteacher@hohoe.edu.gh': true, // Password changed for easy testing
  };

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.mockUsers.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    const password = this.mockPasswords[credentials.email];
    if (!password || password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!this.emailVerified[credentials.email]) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Check if password needs to be changed (first-time login)
    if (!this.passwordChanged[credentials.email]) {
      throw new Error('PASSWORD_CHANGE_REQUIRED');
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;

    return {
      user,
      token,
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // In real app, token would be validated
    // For mock, we'll use email as token
    const email = token; // Simplified for mock

    if (this.mockUsers.find(u => u.email === email)) {
      this.emailVerified[email] = true;
    } else {
      throw new Error('Invalid verification token');
    }
  }

  /**
   * Change password (for first-time login or password reset)
   */
  async changePassword(
    email: string,
    request: PasswordChangeRequest
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (request.newPassword !== request.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    if (request.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check current password (if not first-time login)
    if (this.passwordChanged[email]) {
      const currentPassword = this.mockPasswords[email];
      if (currentPassword !== request.currentPassword) {
        throw new Error('Current password is incorrect');
      }
    }

    // Update password
    this.mockPasswords[email] = request.newPassword;
    this.passwordChanged[email] = true;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.mockUsers.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists (security)
      return;
    }

    // In real app, send email with reset token
    // For mock, we'll just return success
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // In real app, validate token
    // For mock, we'll use email as token
    const email = token;
    if (this.mockUsers.find(u => u.email === email)) {
      this.mockPasswords[email] = newPassword;
      this.passwordChanged[email] = true;
    } else {
      throw new Error('Invalid reset token');
    }
  }

  /**
   * Check if user needs to verify email
   */
  isEmailVerified(email: string): boolean {
    return this.emailVerified[email] ?? false;
  }

  /**
   * Check if user needs to change password
   */
  needsPasswordChange(email: string): boolean {
    return !this.passwordChanged[email];
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // In real app, invalidate token
  }

  /**
   * Create a new user account (for admin creating teachers)
   */
  async createUser(userData: {
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
  }): Promise<{ user: User; verificationToken: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    if (this.mockUsers.find(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    // Create new user
    const newUser: User = {
      id: String(this.mockUsers.length + 1),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to users list
    this.mockUsers.push(newUser);

    // Set initial password (temporary, user will change on first login)
    const tempPassword = `temp${Date.now()}`;
    this.mockPasswords[userData.email] = tempPassword;

    // Email not verified yet, password change required
    this.emailVerified[userData.email] = false;
    this.passwordChanged[userData.email] = false;

    // Generate verification token (in real app, this would be sent via email)
    const verificationToken = `verify_${userData.email}_${Date.now()}`;

    return {
      user: newUser,
      verificationToken,
    };
  }
}

export const mockAuthService = new MockAuthService();

