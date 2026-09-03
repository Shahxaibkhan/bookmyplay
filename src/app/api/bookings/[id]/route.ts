import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const booking = await Booking.findById(params.id).lean();
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      String(booking.ownerId) !== String(session.user.id)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [arena, branch, court] = await Promise.all([
      Arena.findById(booking.arenaId).select('name').lean(),
      Branch.findById(booking.branchId).select('name whatsappNumber').lean(),
      Court.findById(booking.courtId).select('name').lean(),
    ]);

    return NextResponse.json({
      booking: {
        ...booking,
        arenaName: arena?.name ?? null,
        branchName: branch?.name ?? null,
        branchWhatsappNumber: branch?.whatsappNumber ?? null,
        courtName: court?.name ?? null,
      },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { status, reason, date, startTime } = data;

    if (status && !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'admin' &&
      String(booking.ownerId) !== String(session.user.id)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (status === 'cancelled') {
      if (!reason || typeof reason !== 'string' || !reason.trim()) {
        return NextResponse.json({ error: 'A cancellation reason is required' }, { status: 400 });
      }

      booking.status = 'cancelled';
      booking.cancellationReason = reason.trim();
      booking.actionHistory.push({
        action: 'cancelled',
        reason: reason.trim(),
        changedBy: String(session.user.id),
        createdAt: new Date(),
      });
    } else if (date || startTime) {
      if (!reason || typeof reason !== 'string' || !reason.trim() || !date || !startTime) {
        return NextResponse.json(
          { error: 'New date, new start time, and a reschedule reason are required' },
          { status: 400 }
        );
      }

      const court = await Court.findById(booking.courtId);
      if (!court || !court.isActive) {
        return NextResponse.json({ error: 'Court is not available' }, { status: 404 });
      }

      const schedule = court.schedule?.find((item: { day: string }) =>
        item.day === new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
      );
      const [hours, minutes] = String(startTime).split(':').map(Number);
      const newStartMinutes = hours * 60 + minutes;
      const newEndMinutes = newStartMinutes + booking.duration;
      const toMinutes = (value: string) => {
        const [itemHours, itemMinutes] = value.split(':').map(Number);
        return itemHours * 60 + itemMinutes;
      };

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(new Date(`${date}T00:00:00Z`).getTime()) ||
        new Date(`${date}T00:00:00Z`) < new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z') ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
        !schedule?.isOpen ||
        newStartMinutes < toMinutes(schedule.openingTime) ||
        newEndMinutes > toMinutes(schedule.closingTime)
      ) {
        return NextResponse.json({ error: 'New time is outside court availability' }, { status: 400 });
      }

      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        courtId: booking.courtId,
        date,
        startTime,
        status: { $ne: 'cancelled' },
      });
      if (conflict) {
        return NextResponse.json({ error: 'The new slot is already booked' }, { status: 409 });
      }

      const previousDate = booking.date;
      const previousStartTime = booking.startTime;
      const previousEndTime = booking.endTime;
      booking.date = date;
      booking.startTime = startTime;
      booking.endTime = `${String(Math.floor(newEndMinutes / 60)).padStart(2, '0')}:${String(newEndMinutes % 60).padStart(2, '0')}`;
      booking.actionHistory.push({
        action: 'rescheduled',
        reason: reason.trim(),
        changedBy: String(session.user.id),
        previousDate,
        previousStartTime,
        previousEndTime,
        newDate: booking.date,
        newStartTime: booking.startTime,
        newEndTime: booking.endTime,
        createdAt: new Date(),
      });
    } else if (status === 'confirmed') {
      booking.status = 'confirmed';
    } else {
      return NextResponse.json({ error: 'No booking action provided' }, { status: 400 });
    }

    try {
      await booking.save();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        return NextResponse.json({ error: 'The new slot is already booked' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(
      {
        message: status === 'cancelled' ? 'Booking cancelled successfully' : date || startTime ? 'Booking rescheduled successfully' : 'Booking status updated successfully',
        booking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
