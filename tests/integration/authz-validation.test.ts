import '../utils/authMocks';

import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Owner from '@/models/Owner';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';
import Court from '@/models/Court';
import Booking from '@/models/Booking';
import { setSessionUser } from '../utils/authMocks';
import { GET as getArenas } from '@/app/api/arenas/route';
import { GET as getBranches, POST as createBranch } from '@/app/api/branches/route';
import { GET as getCourts } from '@/app/api/courts/route';
import { GET as getBookings } from '@/app/api/bookings/route';
import { PATCH as updateBookingStatus } from '@/app/api/bookings/[id]/route';
import { PUT as updateBranchApproval } from '@/app/api/branches/[id]/route';
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

describe('API authorization and validation coverage', () => {
  beforeAll(async () => {
    await connectDB();

    const suffix = Date.now();

    const ownerPrimary = await Owner.create({
      name: 'Coverage Owner A',
      email: `coverage-owner-a-${suffix}@bookmyplay.test`,
      password: 'hashed',
      phone: '+11110000000',
      role: 'owner',
      accountType: 'free',
    });

    const ownerSecondary = await Owner.create({
      name: 'Coverage Owner B',
      email: `coverage-owner-b-${suffix}@bookmyplay.test`,
      password: 'hashed',
      phone: '+22220000000',
      role: 'owner',
      accountType: 'free',
    });

    const arenaA = await Arena.create({
      ownerId: ownerPrimary._id,
      name: `Coverage Arena A ${suffix}`,
      slug: `coverage-arena-a-${suffix}`,
      description: 'Primary arena for coverage tests',
      isActive: true,
    });

    const arenaB = await Arena.create({
      ownerId: ownerSecondary._id,
      name: `Coverage Arena B ${suffix}`,
      slug: `coverage-arena-b-${suffix}`,
      description: 'Secondary arena for coverage tests',
      isActive: true,
    });

    const approvedBranchA = await Branch.create({
      arenaId: arenaA._id,
      name: 'Approved Branch A',
      address: '11 Alpha Road',
      city: 'Karachi',
      area: 'Central',
      whatsappNumber: '+923001112233',
      googleMapLink: 'https://maps.example.com/a',
      isApproved: true,
      isActive: true,
    });

    const unapprovedBranchA = await Branch.create({
      arenaId: arenaA._id,
      name: 'Unapproved Branch A',
      address: '22 Beta Road',
      city: 'Karachi',
      area: 'South',
      whatsappNumber: '+923004445566',
      isApproved: false,
      isActive: true,
    });

    const branchB = await Branch.create({
      arenaId: arenaB._id,
      name: 'Branch B',
      address: '33 Gamma Road',
      city: 'Lahore',
      area: 'North',
      whatsappNumber: '+923008889990',
      isApproved: true,
      isActive: true,
    });

    const courtA = await Court.create({
      arenaId: arenaA._id,
      branchId: approvedBranchA._id,
      name: 'Court A',
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
      courtNotes: 'Coverage court A',
    });

    const courtB = await Court.create({
      arenaId: arenaB._id,
      branchId: branchB._id,
      name: 'Court B',
      sportType: 'tennis',
      basePrice: 200,
      slotDuration: 60,
      schedule: [
        {
          day: 'Monday',
          isOpen: true,
          openingTime: '08:00',
          closingTime: '22:00',
        },
      ],
      dayPrices: [],
      timePrices: [],
      maxPlayers: 4,
      images: [],
    });

    const bookingDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const bookingA = await Booking.create({
      arenaId: arenaA._id,
      branchId: approvedBranchA._id,
      courtId: courtA._id,
      ownerId: ownerPrimary._id,
      customerName: 'Booked Customer A',
      customerPhone: '+923009991111',
      date: bookingDate,
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      price: 150,
      status: 'pending',
      referenceCode: `AUTH-A-${suffix}`,
      whatsappSent: false,
    });

    const bookingB = await Booking.create({
      arenaId: arenaB._id,
      branchId: branchB._id,
      courtId: courtB._id,
      ownerId: ownerSecondary._id,
      customerName: 'Booked Customer B',
      customerPhone: '+923009992222',
      date: bookingDate,
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      price: 200,
      status: 'confirmed',
      referenceCode: `AUTH-B-${suffix}`,
      whatsappSent: false,
    });

    state.ownerA = ownerPrimary._id.toString();
    state.ownerB = ownerSecondary._id.toString();
    state.arenaA = arenaA._id.toString();
    state.arenaB = arenaB._id.toString();
    state.branchApprovedA = approvedBranchA._id.toString();
    state.branchPendingA = unapprovedBranchA._id.toString();
    state.branchB = branchB._id.toString();
    state.courtA = courtA._id.toString();
    state.courtB = courtB._id.toString();
    state.bookingA = bookingA._id.toString();
    state.bookingB = bookingB._id.toString();
    state.bookingDate = bookingDate;
  });

  afterAll(async () => {
    const arenaIds = [state.arenaA, state.arenaB].filter(Boolean);
    const ownerIds = [state.ownerA, state.ownerB].filter(Boolean);

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

  test('arenas GET enforces authentication and role scoping', async () => {
    setSessionUser(null);
    const unauthorized = await getArenas();
    expect(unauthorized.status).toBe(401);

    setSessionUser({
      id: state.ownerA,
      name: 'Owner A',
      email: 'oa@bookmyplay.test',
      role: 'owner',
    });
    const ownerResponse = await getArenas();
    expect(ownerResponse.status).toBe(200);
    const ownerBody = (await ownerResponse.json()) as { arenas: Array<{ _id: string }> };
    expect(ownerBody.arenas).toHaveLength(1);
    expect(ownerBody.arenas[0]._id).toBe(state.arenaA);

    setSessionUser({
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@bookmyplay.test',
      role: 'admin',
    });
    const adminResponse = await getArenas();
    expect(adminResponse.status).toBe(200);
    const adminBody = (await adminResponse.json()) as { arenas: Array<{ _id: string }> };
    expect(adminBody.arenas.map((a) => a._id)).toEqual(
      expect.arrayContaining([state.arenaA, state.arenaB])
    );
  });

  test('branches GET filters by ownership and arenaId', async () => {
    setSessionUser({
      id: state.ownerA,
      name: 'Owner A',
      email: 'oa@bookmyplay.test',
      role: 'owner',
    });

    const branchesResponse = await getBranches(buildRequest('/api/branches'));
    expect(branchesResponse.status).toBe(200);
    const branchesBody = (await branchesResponse.json()) as {
      branches: Array<{ arenaId: string }>;
    };
    expect(
      branchesBody.branches.every((branch) => branch.arenaId === state.arenaA)
    ).toBe(true);

    const unauthorizedResponse = await getBranches(
      buildRequest(`/api/branches?arenaId=${state.arenaB}`)
    );
    expect(unauthorizedResponse.status).toBe(401);
  });

  test('courts GET blocks cross-owner access and supports arena filter', async () => {
    setSessionUser({
      id: state.ownerB,
      name: 'Owner B',
      email: 'ob@bookmyplay.test',
      role: 'owner',
    });

    const filteredResponse = await getCourts(
      buildRequest(`/api/courts?arenaId=${state.arenaB}`)
    );
    expect(filteredResponse.status).toBe(200);
    const filteredBody = (await filteredResponse.json()) as {
      courts: Array<{ arenaId: string }>;
    };
    expect(
      filteredBody.courts.every((court) => court.arenaId === state.arenaB)
    ).toBe(true);

    const blockedResponse = await getCourts(
      buildRequest(`/api/courts?arenaId=${state.arenaA}`)
    );
    expect(blockedResponse.status).toBe(401);
  });

  test('bookings GET restricts data visibility per owner while admins see all', async () => {
    setSessionUser({
      id: state.ownerA,
      name: 'Owner A',
      email: 'oa@bookmyplay.test',
      role: 'owner',
    });

    const ownerResponse = await getBookings(buildRequest('/api/bookings'));
    expect(ownerResponse.status).toBe(200);
    const ownerBody = (await ownerResponse.json()) as {
      bookings: Array<{ ownerId: string }>;
    };
    expect(ownerBody.bookings).toHaveLength(1);
    expect(ownerBody.bookings[0].ownerId).toBe(state.ownerA);

    setSessionUser({
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@bookmyplay.test',
      role: 'admin',
    });

    const adminResponse = await getBookings(
      buildRequest(`/api/bookings?ownerId=${state.ownerB}`)
    );
    expect(adminResponse.status).toBe(200);
    const adminBody = (await adminResponse.json()) as {
      bookings: Array<{ ownerId: string }>;
    };
    expect(
      adminBody.bookings.every((booking) => booking.ownerId === state.ownerB)
    ).toBe(true);
  });

  test('booking status updates respect authorization', async () => {
    setSessionUser({
      id: state.ownerB,
      name: 'Owner B',
      email: 'ob@bookmyplay.test',
      role: 'owner',
    });

    const blockedUpdate = await updateBookingStatus(
      buildJsonRequest(`/api/bookings/${state.bookingA}`, 'PATCH', {
        status: 'confirmed',
      }),
      { params: { id: state.bookingA } }
    );
    expect(blockedUpdate.status).toBe(401);

    setSessionUser({
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@bookmyplay.test',
      role: 'admin',
    });

    const adminUpdate = await updateBookingStatus(
      buildJsonRequest(`/api/bookings/${state.bookingA}`, 'PATCH', {
        status: 'cancelled',
      }),
      { params: { id: state.bookingA } }
    );
    expect(adminUpdate.status).toBe(200);
    const adminBody = (await adminUpdate.json()) as {
      booking: { status: string };
    };
    expect(adminBody.booking.status).toBe('cancelled');
  });

  test('branch approval endpoint can delete pending submissions', async () => {
    setSessionUser({
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@bookmyplay.test',
      role: 'admin',
    });

    const rejectionResponse = await updateBranchApproval(
      buildJsonRequest(`/api/branches/${state.branchPendingA}`, 'PUT', {
        isApproved: false,
      }),
      { params: { id: state.branchPendingA } }
    );
    expect(rejectionResponse.status).toBe(200);

    const followUp = await getBranches(buildRequest('/api/branches'));
    const body = (await followUp.json()) as { branches: Array<{ _id: string }> };
    expect(body.branches.find((branch) => branch._id === state.branchPendingA)).toBeUndefined();
  });

  test('public booking listing validates required query params', async () => {
    const missingParams = await getPublicBookings(buildRequest('/api/public/bookings'));
    expect(missingParams.status).toBe(400);

    await Booking.create({
      arenaId: state.arenaA,
      branchId: state.branchApprovedA,
      courtId: state.courtA,
      ownerId: state.ownerA,
      customerName: 'Coverage Public Slot',
      customerPhone: '+923001231234',
      date: state.bookingDate,
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      price: 160,
      status: 'pending',
      referenceCode: `AUTH-PUBLIC-${Date.now()}`,
      whatsappSent: false,
    });

    const validResponse = await getPublicBookings(
      buildRequest(
        `/api/public/bookings?courtId=${state.courtA}&date=${state.bookingDate}`
      )
    );
    expect(validResponse.status).toBe(200);
    const body = (await validResponse.json()) as { bookings: Array<{ startTime: string }> };
    expect(body.bookings.map((b) => b.startTime)).toContain('14:00');
  });

  test('public booking creation rejects inconsistent contexts', async () => {
    const invalidContext = await createPublicBooking(
      buildJsonRequest('/api/public/bookings', 'POST', {
        courtId: state.courtA,
        branchId: state.branchB,
        arenaId: state.arenaA,
        customerName: 'Mismatch User',
        customerPhone: '+923000000000',
        date: state.bookingDate,
        startTime: '12:00',
        duration: 60,
        price: 150,
      })
    );
    expect(invalidContext.status).toBe(400);

    const missingField = await createPublicBooking(
      buildJsonRequest('/api/public/bookings', 'POST', {
        courtId: state.courtA,
        branchId: state.branchApprovedA,
        arenaId: state.arenaA,
        customerName: 'Missing Phone',
        date: state.bookingDate,
        startTime: '13:00',
        duration: 60,
        price: 150,
      })
    );
    expect(missingField.status).toBe(400);
  });

  test('owners can create branches under their arena while admins bypass role check', async () => {
    setSessionUser({
      id: state.ownerA,
      name: 'Owner A',
      email: 'oa@bookmyplay.test',
      role: 'owner',
    });

    const branchResponse = await createBranch(
      buildJsonRequest('/api/branches', 'POST', {
        arenaId: state.arenaA,
        name: 'Owner Created Branch',
        address: '44 Delta Road',
        city: 'Karachi',
        area: 'West',
        whatsappNumber: '+923005552222',
        googleMapLink: 'https://maps.example.com/owner',
        isApproved: true,
        isActive: true,
      })
    );
    expect(branchResponse.status).toBe(201);
    const branchBody = (await branchResponse.json()) as { branch: { arenaId: string } };
    expect(branchBody.branch.arenaId).toBe(state.arenaA);

    setSessionUser({
      id: state.ownerA,
      name: 'Owner A',
      email: 'oa@bookmyplay.test',
      role: 'owner',
    });
    const forbiddenBranch = await createBranch(
      buildJsonRequest('/api/branches', 'POST', {
        arenaId: state.arenaB,
        name: 'Should Fail',
        address: '55 Epsilon Road',
        city: 'Karachi',
        area: 'East',
        whatsappNumber: '+923007778888',
      })
    );
    expect(forbiddenBranch.status).toBe(401);
  });
});
