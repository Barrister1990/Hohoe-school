import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { settingsService } from '@/lib/services/settings-service';
import { authService } from '@/lib/services/auth-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/settings/preferences
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const preferences = await settingsService.getUserPreferences(supabase, user.id);
    return NextResponse.json(preferences);
  } catch (error: any) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/preferences
 * Update user preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updated = await settingsService.updateUserPreferences(supabase, user.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

