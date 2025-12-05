import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { permissionService } from '@/lib/services/permission-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/permissions/user/[userId]
 * Get permissions for a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const permissionCodes = await permissionService.getUserPermissionCodes(supabase, userId);
    return NextResponse.json(permissionCodes);
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/permissions/user/[userId]
 * Set permissions for a user (replaces all existing)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { permissionCodes } = body;

    if (!Array.isArray(permissionCodes)) {
      return NextResponse.json(
        { error: 'permissionCodes must be an array' },
        { status: 400 }
      );
    }

    await permissionService.setUserPermissions(supabase, userId, permissionCodes);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting user permissions:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

