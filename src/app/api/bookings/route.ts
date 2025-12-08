import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';
import { generateReferenceCode } from '@/lib/utils';

type BookingFilterQuery = {
  ownerId?: string;
  arenaId?: string;
  courtId?: string;
  date?: string;
};

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

type BookingPayload = BookingFilterQuery & {
  branchId: string;
  startTime: string;
  status?: BookingStatus;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const arenaId = searchParams.get('arenaId');
    const courtId = searchParams.get('courtId');
    const date = searchParams.get('date');

    await connectDB();

    const query: BookingFilterQuery = {};
    if (session.user.role === 'owner') {
      query.ownerId = session.user.id;
    } else if (ownerId) {
      query.ownerId = ownerId;
    }

    if (arenaId) query.arenaId = arenaId;
    if (courtId) query.courtId = courtId;
    if (date) query.date = date;

    if (arenaId) {
      const arena = await Arena.findById(arenaId);
      if (!arena) {
        return NextResponse.json({ error: 'Arena not found' }, { status: 404 });
      }
      if (
        session.user.role !== 'admin' &&
        String(arena.ownerId) !== String(session.user.id)
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (courtId) {
      const court = await Court.findById(courtId);
      if (!court) {
        return NextResponse.json({ error: 'Court not found' }, { status: 404 });
      }

      if (session.user.role !== 'admin') {
        const arena = await Arena.findById(court.arenaId);
        if (!arena || String(arena.ownerId) !== String(session.user.id)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
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

    const data = (await request.json()) as BookingPayload;

    await connectDB();

    const [court, branch, arena] = await Promise.all([
      Court.findById(data.courtId),
      Branch.findById(data.branchId),
      Arena.findById(data.arenaId),
    ]);

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    if (!arena) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      String(arena.ownerId) !== String(session.user.id)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      String(branch.arenaId) !== String(arena._id) ||
      String(court.arenaId) !== String(arena._id) ||
      String(court.branchId) !== String(branch._id)
    ) {
      return NextResponse.json(
        { error: 'Court, branch and arena do not match' },
        { status: 400 }
      );
    }

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      courtId: data.courtId,
      date: data.date,
      startTime: data.startTime,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This slot is already booked' },
        { status: 400 }
      );
    }

    let referenceCode = generateReferenceCode();
    while (await Booking.findOne({ referenceCode })) {
      referenceCode = generateReferenceCode();
    }

    const requestedStatus = data.status;
    const isValidStatus =
      requestedStatus === 'pending' ||
      requestedStatus === 'confirmed' ||
      requestedStatus === 'cancelled';

    const booking = await Booking.create({
      ...data,
      ownerId: arena.ownerId,
      referenceCode,
      status: isValidStatus ? requestedStatus : 'pending',
      whatsappSent: false,
    });

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
