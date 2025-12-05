import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { evaluationService, CreateRewardData } from '@/lib/services/evaluation-service';
import { formatError } from '@/lib/utils/error-formatter';

/**
 * GET /api/rewards
 * Get rewards for a student
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
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const rewards = await evaluationService.getStudentRewards(supabase, studentId);
    return NextResponse.json(rewards);
  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rewards
 * Create a reward
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
    const rewardData: CreateRewardData = {
      studentId: body.studentId,
      teacherId: body.teacherId || user.id,
      rewardType: body.rewardType,
      description: body.description,
      dateAwarded: body.dateAwarded,
    };

    const reward = await evaluationService.createReward(supabase, rewardData);
    return NextResponse.json(reward, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}

