import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import Branch from '@/models/Branch';
import Arena from '@/models/Arena';
import { generateReferenceCode } from '@/lib/utils';

type PublicBookingPayload = {
  courtId: string;
  branchId: string;
  arenaId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  price: number;
  paymentReferenceId?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get('courtId');
    const date = searchParams.get('date');

    if (!courtId || !date) {
      return NextResponse.json(
        { error: 'courtId and date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({
      courtId,
      date,
      status: { $ne: 'cancelled' },
    })
      .select('startTime endTime status')
      .sort({ startTime: 1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Public bookings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booked slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as PublicBookingPayload;

    const requiredFields: Array<keyof PublicBookingPayload> = [
      'courtId',
      'branchId',
      'arenaId',
      'customerName',
      'customerPhone',
      'date',
      'startTime',
      'duration',
      'price',
    ];

    const missing = requiredFields.filter((field) => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    const [court, branch, arena] = await Promise.all([
      Court.findById(data.courtId),
      Branch.findById(data.branchId),
      Arena.findById(data.arenaId),
    ]);

    if (!court || !branch || !arena) {
      return NextResponse.json(
        { error: 'Invalid arena/branch/court selection' },
        { status: 404 }
      );
    }

    if (
      String(court.branchId) !== String(branch._id) ||
      String(branch.arenaId) !== String(arena._id) ||
      String(court.arenaId) !== String(arena._id)
    ) {
      return NextResponse.json(
        { error: 'Booking context mismatch' },
        { status: 400 }
      );
    }

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

    const booking = await Booking.create({
      ...data,
      ownerId: arena.ownerId,
      referenceCode,
      status: 'pending',
      whatsappSent: false,
    });

    return NextResponse.json(
      {
        message: 'Booking request submitted',
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Public bookings POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
