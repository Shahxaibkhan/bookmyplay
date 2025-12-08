import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Arena from '@/models/Arena';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let arenas;
    if (session.user.role === 'admin') {
      arenas = await Arena.find().sort({ createdAt: -1 });
    } else {
      arenas = await Arena.find({ ownerId: session.user.id }).sort({
        createdAt: -1,
      });
    }

    return NextResponse.json({ arenas }, { status: 200 });
  } catch (error) {
    console.error('Get arenas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arenas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } =
      await request.json();

    if (
      !name ||
      !description
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await Arena.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const arena = await Arena.create({
      ownerId: session.user.id,
      name,
      slug,
      description,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Arena created successfully',
        arena,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create arena error:', error);
    return NextResponse.json(
      { error: 'Failed to create arena' },
      { status: 500 }
    );
  }
}
