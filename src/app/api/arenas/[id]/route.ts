import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Arena from '@/models/Arena';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const arena = await Arena.findById(params.id);

    if (!arena) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      arena.ownerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ arena }, { status: 200 });
  } catch (error) {
    console.error('Get arena error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arena' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const arena = await Arena.findById(params.id);

    if (!arena) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      arena.ownerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();
    const updatedArena = await Arena.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json(
      {
        message: 'Arena updated successfully',
        arena: updatedArena,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update arena error:', error);
    return NextResponse.json(
      { error: 'Failed to update arena' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const arena = await Arena.findById(params.id);

    if (!arena) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      arena.ownerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Arena.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Arena deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete arena error:', error);
    return NextResponse.json(
      { error: 'Failed to delete arena' },
      { status: 500 }
    );
  }
}
