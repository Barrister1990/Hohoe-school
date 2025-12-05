import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { beceService, CreateBECEResultData } from '@/lib/services/bece-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/bece-results
 * Get all BECE results, optionally filtered by academic year
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

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || undefined;

    const results = await beceService.getBECEResults(supabase, academicYear || undefined);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching BECE results:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bece-results
 * Create one or more BECE results
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if it's a single result or array
    if (Array.isArray(body)) {
      const resultsData: CreateBECEResultData[] = body;
      const results = await beceService.createBECEResults(supabase, resultsData);
      return NextResponse.json(results, { status: 201 });
    } else {
      const resultData: CreateBECEResultData = body;
      const result = await beceService.createBECEResult(supabase, resultData);
      return NextResponse.json(result, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating BECE results:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

