import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Branch from '@/models/Branch';
import Arena from '@/models/Arena';

type BranchPayload = {
  arenaId: string;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const arenaId = searchParams.get('arenaId');

    await connectDB();

    const query: Record<string, unknown> = {};
    if (arenaId) {
      query.arenaId = arenaId;
    }

    if (session.user.role === 'owner') {
      const arenaFilter = arenaId
        ? { _id: arenaId, ownerId: session.user.id }
        : { ownerId: session.user.id };

      const ownedArenas = await Arena.find(arenaFilter).select('_id');

      if (arenaId && ownedArenas.length === 0) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!arenaId) {
        if (ownedArenas.length === 0) {
          return NextResponse.json({ branches: [] }, { status: 200 });
        }
        query.arenaId = { $in: ownedArenas.map((arena) => arena._id) };
      }
    }

    const branches = await Branch.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ branches }, { status: 200 });
  } catch (error) {
    console.error('Get branches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as BranchPayload;

    await connectDB();

    const arena = await Arena.findById(data.arenaId);
    if (!arena) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      arena.ownerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const branch = await Branch.create(data);

    return NextResponse.json(
      {
        message: 'Branch created successfully',
        branch,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create branch error:', error);
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    );
  }
}
