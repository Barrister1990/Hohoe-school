import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { permissionService } from '@/lib/services/permission-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/permissions
 * Get all permissions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const permissions = await permissionService.getPermissions(supabase);
    return NextResponse.json(permissions);
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

