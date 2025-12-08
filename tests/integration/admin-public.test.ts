import '../utils/authMocks';

import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Owner from '@/models/Owner';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';
import Court from '@/models/Court';
import Booking from '@/models/Booking';
import { setSessionUser } from '../utils/authMocks';
import { GET as listBranches } from '@/app/api/branches/route';
import { PUT as updateBranchApproval } from '@/app/api/branches/[id]/route';
import { GET as listArenas } from '@/app/api/arenas/route';
import { GET as listBookings } from '@/app/api/bookings/route';
import { GET as getPublicArenaDetails } from '@/app/api/public/arena/[slug]/route';
import {
  GET as getPublicBookings,
  POST as createPublicBooking,
} from '@/app/api/public/bookings/route';

const BASE_URL = 'http://localhost:3000';

const state: Record<string, string> & {
  bookingDate?: string;
} = {};

function buildRequest(path: string) {
  return new NextRequest(new URL(path, BASE_URL));
}

function buildJsonRequest(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH',
  payload: unknown
) {
  return new NextRequest(new URL(path, BASE_URL), {
    method,
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('Admin dashboard data and public booking APIs', () => {
  beforeAll(async () => {
    await connectDB();

    const suffix = Date.now();

    const pendingOwner = await Owner.create({
      name: 'Admin QA Owner',
      email: `admin-qa-${suffix}@bookmycourt.test`,
      password: 'hashed-password',
      phone: '+10000000000',
      role: 'owner',
      accountType: 'free',
    });

    const pendingArena = await Arena.create({
      ownerId: pendingOwner._id,
      name: `Admin QA Arena ${suffix}`,
      slug: `admin-qa-arena-${suffix}`,
      description: 'Admin dashboard integration arena',
      isActive: true,
    });

    const pendingBranch = await Branch.create({
      arenaId: pendingArena._id,
      name: 'Pending Approval Branch',
      address: '1 Admin Way',
      city: 'Karachi',
      area: 'Central',
      whatsappNumber: '+11111111111',
      googleMapLink: 'https://maps.example.com/pending',
      isApproved: false,
      isActive: true,
    });

    const publicOwner = await Owner.create({
      name: 'Public QA Owner',
      email: `public-qa-${suffix}@bookmycourt.test`,
      password: 'hashed-password',
      phone: '+12223334444',
      role: 'owner',
      accountType: 'free',
    });

    const publicArena = await Arena.create({
      ownerId: publicOwner._id,
      name: `Public QA Arena ${suffix}`,
      slug: `public-qa-arena-${suffix}`,
      description: 'Arena exposed to public API',
      isActive: true,
    });

    const publicBranch = await Branch.create({
      arenaId: publicArena._id,
      name: 'Public API Branch',
      address: '2 Booking Blvd',
      city: 'Lahore',
      area: 'East',
      whatsappNumber: '+13334445555',
      googleMapLink: 'https://maps.example.com/public',
      isApproved: true,
      isActive: true,
    });

    const publicCourt = await Court.create({
      arenaId: publicArena._id,
      branchId: publicBranch._id,
      name: 'QA Showcase Court',
      sportType: 'futsal',
      basePrice: 250,
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
      courtNotes: 'Automation court',
      isActive: true,
    });

    const bookingDate = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 10);

    await Booking.create({
      arenaId: publicArena._id,
      branchId: publicBranch._id,
      courtId: publicCourt._id,
      ownerId: publicOwner._id,
      customerName: 'Seeded Customer',
      customerPhone: '+19998887777',
      date: bookingDate,
      startTime: '08:00',
      endTime: '09:00',
      duration: 60,
      price: 250,
      status: 'confirmed',
      referenceCode: `PUB-${suffix}`,
      whatsappSent: false,
    });

    state.pendingOwnerId = pendingOwner._id.toString();
    state.pendingArenaId = pendingArena._id.toString();
    state.pendingBranchId = pendingBranch._id.toString();
    state.publicOwnerId = publicOwner._id.toString();
    state.publicArenaId = publicArena._id.toString();
    state.publicArenaSlug = publicArena.slug;
    state.publicBranchId = publicBranch._id.toString();
    state.publicCourtId = publicCourt._id.toString();
    state.bookingDate = bookingDate;
  });

  afterAll(async () => {
    const arenaIds = [state.pendingArenaId, state.publicArenaId].filter(Boolean);
    const ownerIds = [state.pendingOwnerId, state.publicOwnerId].filter(Boolean);

    if (arenaIds.length > 0) {
      await Booking.deleteMany({ arenaId: { $in: arenaIds } });
      await Court.deleteMany({ arenaId: { $in: arenaIds } });
      await Branch.deleteMany({ arenaId: { $in: arenaIds } });
      await Arena.deleteMany({ _id: { $in: arenaIds } });
    }

    if (ownerIds.length > 0) {
      await Owner.deleteMany({ _id: { $in: ownerIds } });
    }
  });

  test('admin can review global data and approve pending branches', async () => {
    setSessionUser({
      id: 'admin-user',
      name: 'QA Admin',
      email: 'admin@bookmycourt.test',
      role: 'admin',
    });

    const branchesResponse = await listBranches(buildRequest('/api/branches'));
    expect(branchesResponse.status).toBe(200);
    const branchesBody = (await branchesResponse.json()) as {
      branches: Array<{ _id: string; arenaId: string; isApproved: boolean }>;
    };

    const pendingBranch = branchesBody.branches.find(
      (branch) => branch._id === state.pendingBranchId
    );
    expect(pendingBranch).toBeDefined();
    expect(pendingBranch?.isApproved).toBe(false);

    const approvalResponse = await updateBranchApproval(
      buildJsonRequest(`/api/branches/${state.pendingBranchId}`, 'PUT', {
        isApproved: true,
      }),
      { params: { id: state.pendingBranchId } }
    );

    expect(approvalResponse.status).toBe(200);
    const approvalBody = (await approvalResponse.json()) as {
      branch: { _id: string; isApproved: boolean };
    };
    expect(approvalBody.branch.isApproved).toBe(true);

    const refreshedBranches = (await (
      await listBranches(buildRequest('/api/branches'))
    ).json()) as { branches: Array<{ _id: string; isApproved: boolean }> };

    const updatedBranch = refreshedBranches.branches.find(
      (branch) => branch._id === state.pendingBranchId
    );
    expect(updatedBranch?.isApproved).toBe(true);

    const arenasResponse = await listArenas();
    expect(arenasResponse.status).toBe(200);
    const arenasBody = (await arenasResponse.json()) as {
      arenas: Array<{ slug: string }>;
    };
    expect(
      arenasBody.arenas.some((arena) => arena.slug === state.publicArenaSlug)
    ).toBe(true);

    const bookingsResponse = await listBookings(
      buildRequest('/api/bookings')
    );
    expect(bookingsResponse.status).toBe(200);
    const bookingsBody = (await bookingsResponse.json()) as {
      bookings: Array<{ customerName: string; arenaId: string }>;
    };
    expect(
      bookingsBody.bookings.some(
        (booking) => booking.arenaId === state.publicArenaId
      )
    ).toBe(true);
  });

  test('public arena catalogue and bookings enforce approval + slot protections', async () => {
    setSessionUser(null);

    const arenaResponse = await getPublicArenaDetails(
      buildRequest(`/api/public/arena/${state.publicArenaSlug}`),
      { params: { slug: state.publicArenaSlug } }
    );
    expect(arenaResponse.status).toBe(200);
    const arenaBody = (await arenaResponse.json()) as {
      branches: Array<{ _id: string; isApproved: boolean }>;
      courts: Array<{ _id: string }>;
    };
    expect(arenaBody.branches.length).toBeGreaterThan(0);
    expect(arenaBody.branches.every((branch) => branch.isApproved)).toBe(true);
    expect(
      arenaBody.courts.some((court) => court._id === state.publicCourtId)
    ).toBe(true);

    const slotResponse = await getPublicBookings(
      buildRequest(
        `/api/public/bookings?courtId=${state.publicCourtId}&date=${state.bookingDate}`
      )
    );
    expect(slotResponse.status).toBe(200);
    const slotBody = (await slotResponse.json()) as {
      bookings: Array<{ startTime: string }>;
    };
    expect(slotBody.bookings.map((b) => b.startTime)).toContain('08:00');

    const invalidBookingResponse = await createPublicBooking(
      buildJsonRequest('/api/public/bookings', 'POST', {
        courtId: state.publicCourtId,
        branchId: state.publicBranchId,
        arenaId: state.publicArenaId,
        customerName: 'Missing Phone',
        date: state.bookingDate,
        startTime: '09:00',
        duration: 60,
        price: 250,
      })
    );
    expect(invalidBookingResponse.status).toBe(400);

    const nextSlotPayload = {
      courtId: state.publicCourtId,
      branchId: state.publicBranchId,
      arenaId: state.publicArenaId,
      customerName: 'Public Flow',
      customerPhone: '+14445556666',
      date: state.bookingDate,
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      price: 250,
      paymentReferenceId: 'PAY-123',
    };

    const createBookingResponse = await createPublicBooking(
      buildJsonRequest('/api/public/bookings', 'POST', nextSlotPayload)
    );
    expect(createBookingResponse.status).toBe(201);

    const duplicateBookingResponse = await createPublicBooking(
      buildJsonRequest('/api/public/bookings', 'POST', nextSlotPayload)
    );
    expect(duplicateBookingResponse.status).toBe(400);
  });
});
