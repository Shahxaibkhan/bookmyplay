import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Owner from '@/models/Owner';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const limiterKey = `owner-signup:${request.ip || request.headers.get('x-forwarded-for') || 'unknown'}`;
    const limiter = rateLimit(limiterKey, { limit: 5, windowMs: 60_000 });

    if (!limiter.ok) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in a minute.' },
        { status: 429 },
      );
    }

    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const owner = await Owner.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'owner',
      accountType: 'free',
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        ownerId: owner._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
