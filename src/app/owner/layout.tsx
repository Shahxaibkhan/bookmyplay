'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/owner/dashboard', label: 'Overview' },
  { href: '/owner/arenas', label: 'Arenas' },
  { href: '/owner/bookings', label: 'Bookings' },
];

const PUBLIC_ROUTES = ['/owner/login', '/owner/signup'];

const isActive = (pathname: string, href: string) => {
  if (href === '/owner/dashboard') {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname() || '/owner';
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isPublicRoute) {
      if (session?.user?.role === 'owner') {
        router.replace('/owner/dashboard');
      }
      return;
    }

    if (status === 'unauthenticated') {
      router.replace('/owner/login');
      return;
    }

    if (session?.user?.role && session.user.role !== 'owner') {
      router.replace('/');
    }
  }, [status, router, session?.user?.role, isPublicRoute]);

  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100">
        {children}
      </div>
    );
  }

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100">
        <div className="flex items-center gap-3 text-sm font-medium text-emerald-700">
          <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
          <span>Preparing your owner workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-500 text-white shadow-sm">
              <span className="text-lg font-semibold">B</span>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">
                Book<span className="text-emerald-600">My</span>Play
              </p>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400">
                Owner console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-3 overflow-x-auto py-2 text-sm">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow'
                      : 'inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-700'
                  }
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
