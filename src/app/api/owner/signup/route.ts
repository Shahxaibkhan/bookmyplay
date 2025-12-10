import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import Owner from '@/models/Owner';
import { sendEmailVerification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
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
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const owner = await Owner.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'owner',
      accountType: 'free',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpires,
    });

    await sendEmailVerification({
      email,
      name,
      token: verificationToken,
    });

    return NextResponse.json(
      {
        message: 'Account created. Please verify your email to continue.',
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
