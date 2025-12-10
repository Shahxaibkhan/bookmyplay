import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimiter';

const handler = NextAuth(authOptions);

export async function GET(request: NextRequest) {
	return handler(request) as Promise<NextResponse>;
}

export async function POST(request: NextRequest) {
	const limiterKey = `nextauth:${request.ip || request.headers.get('x-forwarded-for') || 'unknown'}`;
	const limiter = rateLimit(limiterKey, { limit: 10, windowMs: 60_000 });

	if (!limiter.ok) {
		return NextResponse.json(
			{ error: 'Too many login attempts. Please wait a minute before retrying.' },
			{ status: 429 },
		);
	}

	return handler(request) as Promise<NextResponse>;
}
