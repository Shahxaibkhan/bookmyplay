import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const OWNER_PUBLIC_PATHS = ['/owner/login', '/owner/signup'];
const ADMIN_PUBLIC_PATHS = ['/admin/login'];

const isPathPublic = (pathname: string, publicPaths: string[]) =>
  publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isOwnerRoute = pathname.startsWith('/owner');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isOwnerRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isOwnerRoute) {
    const isPublicOwnerRoute = isPathPublic(pathname, OWNER_PUBLIC_PATHS);

    if (!token) {
      if (isPublicOwnerRoute) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/owner/login', req.url));
    }

    if (token.role !== 'owner') {
      const redirectUrl = token.role === 'admin' ? '/admin/dashboard' : '/';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    if (isPublicOwnerRoute) {
      return NextResponse.redirect(new URL('/owner/dashboard', req.url));
    }
  }

  if (isAdminRoute) {
    const isPublicAdminRoute = isPathPublic(pathname, ADMIN_PUBLIC_PATHS);

    if (!token) {
      if (isPublicAdminRoute) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    if (token.role !== 'admin') {
      const redirectUrl = token.role === 'owner' ? '/owner/dashboard' : '/';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    if (isPublicAdminRoute) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/admin/:path*'],
};
