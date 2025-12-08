import '../utils/authMocks';

import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Owner from '@/models/Owner';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';
import Court from '@/models/Court';
import Booking from '@/models/Booking';
import { POST as ownerSignup } from '@/app/api/owner/signup/route';
import { POST as createArena } from '@/app/api/arenas/route';
import { POST as createBranch } from '@/app/api/branches/route';
import { POST as createCourt } from '@/app/api/courts/route';
import { POST as createBooking } from '@/app/api/bookings/route';
import { setSessionUser } from '../utils/authMocks';

const BASE_URL = 'http://localhost:3000';

function buildRequest(path: string, payload: unknown) {
  return new NextRequest(new URL(path, BASE_URL), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('Owner lifecycle API flow', () => {
  const uniqueSuffix = Date.now();
  const ownerEmail = `qa-owner-${uniqueSuffix}@bookmycourt.test`;
  const ownerName = 'QA Owner';

  let ownerId: string | undefined;
  let arenaId: string | undefined;
  let branchId: string | undefined;
  let courtId: string | undefined;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await connectDB();

    if (arenaId) {
      await Booking.deleteMany({ arenaId });
      await Court.deleteMany({ arenaId });
      await Branch.deleteMany({ arenaId });
      await Arena.deleteOne({ _id: arenaId });
    }

    if (ownerId) {
      await Owner.deleteOne({ _id: ownerId });
    }
  });

  test('owner can onboard and manage core resources', async () => {
    const signupResponse = await ownerSignup(
      buildRequest('/api/owner/signup', {
        name: ownerName,
        email: ownerEmail,
        password: 'SecurePass!123',
        phone: '+1234567890',
      })
    );

    expect(signupResponse.status).toBe(201);
    const signupBody = (await signupResponse.json()) as { ownerId: string };
    ownerId = signupBody.ownerId;

    setSessionUser({
      id: ownerId,
      name: ownerName,
      email: ownerEmail,
      role: 'owner',
    });

    const arenaResponse = await createArena(
      buildRequest('/api/arenas', {
        name: `QA Arena ${uniqueSuffix}`,
        description: 'Automated test arena',
      })
    );

    expect(arenaResponse.status).toBe(201);
    const arenaBody = (await arenaResponse.json()) as { arena: { _id: string } };
    arenaId = arenaBody.arena._id;

    const branchResponse = await createBranch(
      buildRequest('/api/branches', {
        arenaId,
        name: `QA Branch ${uniqueSuffix}`,
        address: '123 Automation St',
        googleMapLink: 'https://maps.example.com/qa',
        city: 'Testville',
        area: 'Downtown',
        whatsappNumber: '+1234567890',
        paymentBankName: 'QA Bank',
        paymentAccountNumber: '9876543210',
        paymentAccountTitle: 'QA Sports',
        paymentOtherMethods: 'Cash',
        images: [],
        isApproved: true,
        isActive: true,
      })
    );

    expect(branchResponse.status).toBe(201);
    const branchBody = (await branchResponse.json()) as { branch: { _id: string } };
    branchId = branchBody.branch._id;

    const courtResponse = await createCourt(
      buildRequest('/api/courts', {
        arenaId,
        branchId,
        name: `QA Court ${uniqueSuffix}`,
        sportType: 'futsal',
        basePrice: 150,
        slotDuration: 60,
        schedule: [
          {
            day: 'Monday',
            isOpen: true,
            openingTime: '06:00',
            closingTime: '23:00',
          },
        ],
        dayPrices: [],
        timePrices: [],
        maxPlayers: 10,
        images: [],
        courtNotes: 'Automated test court',
      })
    );

    expect(courtResponse.status).toBe(201);
    const courtBody = (await courtResponse.json()) as { court: { _id: string } };
    courtId = courtBody.court._id;

    const bookingPayload = {
      arenaId,
      branchId,
      courtId,
      ownerId,
      customerName: 'QA Customer',
      customerPhone: '+1111111111',
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      price: 150,
      status: 'confirmed',
      numberOfPlayers: 5,
    };

    const bookingResponse = await createBooking(
      buildRequest('/api/bookings', bookingPayload)
    );

    expect(bookingResponse.status).toBe(201);
    const bookingBody = (await bookingResponse.json()) as { booking: { referenceCode: string } };
    expect(bookingBody.booking.referenceCode).toMatch(/^[A-Z0-9]{6}$/);

    const duplicateResponse = await createBooking(
      buildRequest('/api/bookings', bookingPayload)
    );

    expect(duplicateResponse.status).toBe(400);
  });

  test('rejects arena creation when session is missing', async () => {
    setSessionUser(null);

    const response = await createArena(
      buildRequest('/api/arenas', {
        name: 'Unauthorized Arena',
        description: 'Should not be created',
      })
    );

    expect(response.status).toBe(401);

    setSessionUser(
      ownerId
        ? {
            id: ownerId,
            name: ownerName,
            email: ownerEmail,
            role: 'owner',
          }
        : null
    );
  });
});
