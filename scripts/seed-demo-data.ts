import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/mongodb';
import Owner from '../src/models/Owner';
import Arena from '../src/models/Arena';
import Branch from '../src/models/Branch';
import Court from '../src/models/Court';
import Booking from '../src/models/Booking';
import { generateSlug, generateReferenceCode } from '../src/lib/utils';

const demoOwnerSeed = {
  name: 'Demo Sports Collective',
  email: 'demo-owner@bookmyplay.test',
  password: 'PlayHard123!',
  phone: '0300-1234567',
};

type CourtSeed = {
  name: string;
  sportType: string;
  basePrice: number;
  slotDuration: number;
  maxPlayers?: number;
  courtNotes?: string;
  dayPrices?: { day: string; price: number }[];
  timePrices?: { fromTime: string; toTime: string; price: number; days?: string[] }[];
};

type BranchSeed = {
  name: string;
  address: string;
  googleMapLink: string;
  city: string;
  area: string;
  whatsappNumber: string;
  paymentBankName: string;
  paymentAccountTitle: string;
  paymentAccountNumber: string;
  paymentIban: string;
  paymentOtherMethods: string;
  courts: CourtSeed[];
};

type ArenaSeed = {
  name: string;
  description: string;
  branches: BranchSeed[];
};

type BookingSeed = {
  arena: string;
  branch: string;
  court: string;
  dayOffset: number;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  customerName: string;
  customerPhone: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentReferenceId?: string;
};

const arenaSeeds: ArenaSeed[] = [
  {
    name: 'Emerald Sports Hub',
    description: 'Flagship Karachi venue offering padel, futsal, and cricket lanes with pro lighting.',
    branches: [
      {
        name: 'Emerald DHA Phase 5',
        address: '5th Commercial Lane, DHA Phase 5',
        googleMapLink: 'https://maps.google.com/?q=24.8145,67.0971',
        city: 'Karachi',
        area: 'DHA Phase 5',
        whatsappNumber: '0301-1112233',
        paymentBankName: 'Meezan Bank',
        paymentAccountTitle: 'Emerald Sports Hub',
        paymentAccountNumber: '0111-222333-444',
        paymentIban: 'PK12MEZN0001234567890123',
        paymentOtherMethods: 'JazzCash: 0300-5556677 (Emerald Sports)\nEasypaisa: 0333-8889900 (Emerald Sports)',
        courts: [
          {
            name: 'Padel Prime',
            sportType: 'Padel',
            basePrice: 6000,
            slotDuration: 60,
            maxPlayers: 4,
            courtNotes: 'Outdoor padel court with glass walls and LED floodlights.',
            timePrices: [
              { fromTime: '18:00', toTime: '22:00', price: 7000, days: ['Friday', 'Saturday'] },
            ],
          },
          {
            name: 'Night Futsal',
            sportType: 'Futsal',
            basePrice: 8000,
            slotDuration: 60,
            maxPlayers: 14,
            courtNotes: 'Floodlit synthetic turf, scoreboard, and locker access.',
          },
        ],
      },
      {
        name: 'Emerald Clifton Rooftop',
        address: 'Block 4, Clifton Rooftop Courts',
        googleMapLink: 'https://maps.google.com/?q=24.8260,67.0349',
        city: 'Karachi',
        area: 'Clifton Block 4',
        whatsappNumber: '0307-5558899',
        paymentBankName: 'HBL',
        paymentAccountTitle: 'Emerald Clifton',
        paymentAccountNumber: '1777-888999-000',
        paymentIban: 'PK45HABB0001445566778899',
        paymentOtherMethods: 'Easypaisa: 0345-6677889 (Emerald Clifton)',
        courts: [
          {
            name: 'Sunset Padel',
            sportType: 'Padel',
            basePrice: 6500,
            slotDuration: 90,
            maxPlayers: 4,
            courtNotes: 'Rooftop padel experience with Arabian Sea breeze.',
          },
        ],
      },
    ],
  },
  {
    name: 'Capital Racket Club',
    description: 'Premium Islamabad center focused on racket and indoor football programs.',
    branches: [
      {
        name: 'Capital Sports Enclave',
        address: 'Club Avenue, E-11/3',
        googleMapLink: 'https://maps.google.com/?q=33.6993,72.9784',
        city: 'Islamabad',
        area: 'E-11/3',
        whatsappNumber: '0333-9090900',
        paymentBankName: 'UBL',
        paymentAccountTitle: 'Capital Racket Club',
        paymentAccountNumber: '2200-445566-778',
        paymentIban: 'PK90UNIL0002556677889900',
        paymentOtherMethods: 'JazzCash: 0321-1234000 (Capital RC)',
        courts: [
          {
            name: 'North Ridge Courts',
            sportType: 'Tennis',
            basePrice: 5500,
            slotDuration: 60,
            maxPlayers: 4,
            courtNotes: 'DecoTurf surface with ball machine access.',
          },
          {
            name: 'Mini Futsal Dome',
            sportType: 'Futsal',
            basePrice: 7500,
            slotDuration: 60,
            maxPlayers: 12,
            courtNotes: 'Covered futsal court ideal for academies.',
            dayPrices: [
              { day: 'Saturday', price: 8500 },
              { day: 'Sunday', price: 8500 },
            ],
          },
        ],
      },
    ],
  },
];

const bookingSeeds: BookingSeed[] = [
  {
    arena: 'Emerald Sports Hub',
    branch: 'Emerald DHA Phase 5',
    court: 'Padel Prime',
    dayOffset: 1,
    startTime: '18:00',
    endTime: '19:00',
    durationMinutes: 60,
    customerName: 'Ali Raza',
    customerPhone: '0300-7778899',
    price: 7000,
    status: 'confirmed',
    paymentReferenceId: 'TRX-PADEL-001',
  },
  {
    arena: 'Emerald Sports Hub',
    branch: 'Emerald Clifton Rooftop',
    court: 'Sunset Padel',
    dayOffset: 2,
    startTime: '20:30',
    endTime: '22:00',
    durationMinutes: 90,
    customerName: 'Mehak Khan',
    customerPhone: '0312-4445566',
    price: 6500,
    status: 'pending',
    paymentReferenceId: 'TRX-PADEL-ROOF',
  },
  {
    arena: 'Capital Racket Club',
    branch: 'Capital Sports Enclave',
    court: 'North Ridge Courts',
    dayOffset: 3,
    startTime: '07:00',
    endTime: '08:00',
    durationMinutes: 60,
    customerName: 'Hassan Javed',
    customerPhone: '0301-9090909',
    status: 'confirmed',
    paymentReferenceId: 'TRX-TENNIS-042',
  },
];

const getFutureDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

type CourtMapItem = {
  arenaName: string;
  branchName: string;
  courtName: string;
  arenaId: string;
  branchId: string;
  courtId: string;
};

async function ensureDemoOwner() {
  let owner = await Owner.findOne({ email: demoOwnerSeed.email });
  if (owner) {
    return owner;
  }

  const hashedPassword = await bcrypt.hash(demoOwnerSeed.password, 10);
  owner = await Owner.create({
    ...demoOwnerSeed,
    password: hashedPassword,
    role: 'owner',
  });

  console.log(`Created demo owner: ${owner.email}`);
  return owner;
}

async function ensureUniqueSlug(name: string) {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await Arena.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB');

  const owner = await ensureDemoOwner();
  const courtMap: CourtMapItem[] = [];
  const createdCounts = {
    arenas: 0,
    branches: 0,
    courts: 0,
    bookings: 0,
  };

  for (const arenaSeed of arenaSeeds) {
    let arena = await Arena.findOne({ ownerId: owner._id.toString(), name: arenaSeed.name });
    if (!arena) {
      arena = await Arena.create({
        ownerId: owner._id.toString(),
        name: arenaSeed.name,
        slug: await ensureUniqueSlug(arenaSeed.name),
        description: arenaSeed.description,
        isActive: true,
      });
      createdCounts.arenas += 1;
      console.log(`Created arena: ${arena.name}`);
    }

    for (const branchSeed of arenaSeed.branches) {
      let branch = await Branch.findOne({ arenaId: arena._id.toString(), name: branchSeed.name });
      if (!branch) {
        branch = await Branch.create({
          ...branchSeed,
          arenaId: arena._id.toString(),
          images: [],
          isApproved: true,
          isActive: true,
        });
        createdCounts.branches += 1;
        console.log(`  Added branch: ${branch.name}`);
      }

      for (const courtSeed of branchSeed.courts) {
        let court = await Court.findOne({ branchId: branch._id.toString(), name: courtSeed.name });
        if (!court) {
          court = await Court.create({
            ...courtSeed,
            branchId: branch._id.toString(),
            arenaId: arena._id.toString(),
            images: [],
            isActive: true,
          });
          createdCounts.courts += 1;
          console.log(`    Added court: ${court.name}`);
        }

        courtMap.push({
          arenaName: arenaSeed.name,
          branchName: branchSeed.name,
          courtName: courtSeed.name,
          arenaId: arena._id.toString(),
          branchId: branch._id.toString(),
          courtId: court._id.toString(),
        });
      }
    }
  }

  for (const bookingSeed of bookingSeeds) {
    const ref = courtMap.find(
      (item) =>
        item.arenaName === bookingSeed.arena &&
        item.branchName === bookingSeed.branch &&
        item.courtName === bookingSeed.court,
    );

    if (!ref) {
      console.warn(`Skipping booking seed — court not found: ${bookingSeed.court}`);
      continue;
    }

    const date = getFutureDate(bookingSeed.dayOffset);
    const existing = await Booking.findOne({
      courtId: ref.courtId,
      date,
      startTime: bookingSeed.startTime,
    });

    if (existing) {
      continue;
    }

    await Booking.create({
      courtId: ref.courtId,
      branchId: ref.branchId,
      arenaId: ref.arenaId,
      ownerId: owner._id.toString(),
      customerName: bookingSeed.customerName,
      customerPhone: bookingSeed.customerPhone,
      date,
      startTime: bookingSeed.startTime,
      endTime: bookingSeed.endTime,
      duration: bookingSeed.durationMinutes ?? 60,
      price: bookingSeed.price ?? 5000,
      paymentReferenceId: bookingSeed.paymentReferenceId,
      referenceCode: generateReferenceCode(),
      status: bookingSeed.status,
      whatsappSent: false,
    });

    createdCounts.bookings += 1;
  }

  console.log('Seed complete:', createdCounts);
}

seed()
  .then(() => mongoose.connection.close())
  .catch((error) => {
    console.error('Seed failed', error);
    return mongoose.connection.close();
  });
