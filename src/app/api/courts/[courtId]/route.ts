import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Court from '@/models/Court';
import Branch from '@/models/Branch';
import Arena from '@/models/Arena';

type CourtUpdatePayload = {
  name?: string;
  sportType?: string;
  basePrice?: number;
  slotDuration?: number;
  maxPlayers?: number;
  courtNotes?: string;
  dayPrices?: unknown[];
  timePrices?: unknown[];
  branchId?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { courtId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const court = await Court.findById(params.courtId);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Allow admins to fetch any court
    if (session.user.role === 'admin') {
      return NextResponse.json({ court }, { status: 200 });
    }

    // Owners can fetch courts that belong to their arena
    const arena = await Arena.findById(court.arenaId);
    if (arena && String(arena.ownerId) === String(session.user.id)) {
      return NextResponse.json({ court }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Get court error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch court' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courtId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as CourtUpdatePayload;

    await connectDB();

    const court = await Court.findById(params.courtId);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Check authorization
    if (session.user.role !== 'admin') {
      const arena = await Arena.findById(court.arenaId);
      if (!arena || String(arena.ownerId) !== String(session.user.id)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Verify branch exists
    const branch = await Branch.findById(data.branchId || court.branchId);
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Update court
    const updatedCourt = await Court.findByIdAndUpdate(
      params.courtId,
      {
        name: data.name,
        sportType: data.sportType,
        basePrice: data.basePrice,
        slotDuration: data.slotDuration,
        maxPlayers: data.maxPlayers,
        courtNotes: data.courtNotes,
        dayPrices: data.dayPrices || [],
        timePrices: data.timePrices || [],
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: 'Court updated successfully',
        court: updatedCourt,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update court error:', error);
    return NextResponse.json(
      { error: 'Failed to update court' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courtId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const court = await Court.findById(params.courtId);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Check authorization
    if (session.user.role !== 'admin') {
      const arena = await Arena.findById(court.arenaId);
      if (!arena || String(arena.ownerId) !== String(session.user.id)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Delete court
    await Court.findByIdAndDelete(params.courtId);

    return NextResponse.json(
      { message: 'Court deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete court error:', error);
    return NextResponse.json(
      { error: 'Failed to delete court' },
      { status: 500 }
    );
  }
}
