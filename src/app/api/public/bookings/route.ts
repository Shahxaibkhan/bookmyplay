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
  duration: number;
  paymentReferenceId?: string;
  numberOfPlayers?: number;
};

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function getDayName(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function calculatePrice(court: typeof Court.prototype, dayName: string, startTime: string) {
  for (const slab of court.timePrices || []) {
    const appliesToDay = !slab.days?.length || slab.days.includes(dayName);
    if (appliesToDay && startTime >= slab.fromTime && startTime < slab.toTime) {
      return slab.price;
    }
  }

  const dayPrice = court.dayPrices?.find((price: { day: string }) => price.day === dayName);
  return dayPrice?.price ?? court.basePrice;
}

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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 });
    }

    const bookingDate = new Date(`${data.date}T00:00:00Z`);
    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'Booking date cannot be in the past' }, { status: 400 });
    }

    if (!TIME_PATTERN.test(data.startTime)) {
      return NextResponse.json({ error: 'Invalid start time' }, { status: 400 });
    }

    if (!Number.isInteger(data.duration) || data.duration <= 0) {
      return NextResponse.json({ error: 'Invalid booking duration' }, { status: 400 });
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
      return NextResponse.json({ error: 'Booking context mismatch' }, { status: 400 });
    }

    if (!court.isActive || !branch.isActive || !branch.isApproved || !arena.isActive || !arena.isApproved) {
      return NextResponse.json({ error: 'This venue is not available for booking' }, { status: 404 });
    }

    const dayName = getDayName(data.date);
    const daySchedule = court.schedule?.find((schedule: { day: string }) => schedule.day === dayName);
    if (!daySchedule?.isOpen) {
      return NextResponse.json({ error: 'Court is closed on this day' }, { status: 400 });
    }

    if (data.duration !== court.slotDuration) {
      return NextResponse.json({ error: 'Invalid booking duration for this court' }, { status: 400 });
    }

    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = startMinutes + data.duration;
    if (startMinutes < timeToMinutes(daySchedule.openingTime) || endMinutes > timeToMinutes(daySchedule.closingTime)) {
      return NextResponse.json({ error: 'Selected time is outside court hours' }, { status: 400 });
    }

    if (
      data.numberOfPlayers !== undefined &&
      (!Number.isInteger(data.numberOfPlayers) || data.numberOfPlayers < 1 ||
        (court.maxPlayers !== undefined && data.numberOfPlayers > court.maxPlayers))
    ) {
      return NextResponse.json({ error: 'Invalid number of players' }, { status: 400 });
    }

    const price = calculatePrice(court, dayName, data.startTime);

    const existingBooking = await Booking.findOne({
      courtId: data.courtId,
      date: data.date,
      startTime: data.startTime,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This slot is already booked' },
        { status: 409 }
      );
    }

    let referenceCode = generateReferenceCode();
    while (await Booking.findOne({ referenceCode })) {
      referenceCode = generateReferenceCode();
    }

    try {
      const booking = await Booking.create({
        courtId: court._id,
        branchId: branch._id,
        arenaId: arena._id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        date: data.date,
        startTime: data.startTime,
        endTime: `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`,
        duration: court.slotDuration,
        price,
        paymentReferenceId: data.paymentReferenceId,
        numberOfPlayers: data.numberOfPlayers,
        ownerId: arena.ownerId,
        referenceCode,
        status: 'confirmed',
        whatsappSent: false,
      });

      return NextResponse.json(
        {
          message: 'Booking confirmed',
          booking,
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        return NextResponse.json({ error: 'This slot is already booked' }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Public bookings POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
