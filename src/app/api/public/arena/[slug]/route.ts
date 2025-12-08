import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';
import Court from '@/models/Court';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const arena = await Arena.findOne({ slug: params.slug, isActive: true });

    if (!arena) {
      return NextResponse.json(
        { error: 'Arena not found' },
        { status: 404 }
      );
    }

    // Only show approved branches to public
    const branches = await Branch.find({ arenaId: arena._id, isActive: true, isApproved: true });
    
    // Arena should have at least one approved branch to be publicly visible
    if (branches.length === 0) {
      return NextResponse.json(
        { error: 'This arena is not yet available for booking. No approved branches found.' },
        { status: 404 }
      );
    }
    
    const courts = await Court.find({ arenaId: arena._id, isActive: true });

    return NextResponse.json(
      {
        arena,
        branches,
        courts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get arena details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arena details' },
      { status: 500 }
    );
  }
}
