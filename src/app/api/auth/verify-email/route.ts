import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Owner from '@/models/Owner';

async function verifyToken(token: string) {
  await connectDB();

  const owner = await Owner.findOne({
    emailVerificationToken: token,
    emailVerificationExpiresAt: { $gt: new Date() },
  });

  if (!owner) {
    return {
      success: false,
      status: 400,
      error: 'Verification link is invalid or has expired.',
    };
  }

  owner.isEmailVerified = true;
  owner.emailVerificationToken = undefined;
  owner.emailVerificationExpiresAt = undefined;
  owner.emailVerifiedAt = new Date();

  await owner.save();

  return {
    success: true,
    status: 200,
    message: 'Email verified successfully. You can now log in.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required.' },
        { status: 400 },
      );
    }

    const result = await verifyToken(token);
    return NextResponse.json(
      result.success ? { message: result.message } : { error: result.error },
      { status: result.status },
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Unable to verify email at the moment.' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required.' },
        { status: 400 },
      );
    }

    const result = await verifyToken(token);
    return NextResponse.json(
      result.success ? { message: result.message } : { error: result.error },
      { status: result.status },
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Unable to verify email at the moment.' },
      { status: 500 },
    );
  }
}
