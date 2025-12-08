'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Booking = {
  status: 'pending' | 'confirmed' | string;
};

type Stats = {
  totalArenas: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
};

const defaultStats: Stats = {
  totalArenas: 0,
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
};

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [arenasRes, bookingsRes] = await Promise.all([
          fetch('/api/arenas'),
          fetch(`/api/bookings?ownerId=${session?.user?.id}`),
        ]);

        if (!arenasRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to fetch owner dashboard data');
        }

        const arenasData = await arenasRes.json();
        const bookingsData = await bookingsRes.json();

        const bookings = (bookingsData.bookings || []) as Booking[];

        setStats({
          totalArenas: arenasData.arenas?.length || 0,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b) => b.status === 'pending')
            .length,
          confirmedBookings: bookings.filter((b) => b.status === 'confirmed')
            .length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
          <span>Loading your overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-6 py-6 text-emerald-50 shadow-lg sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
            Welcome back
          </p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl text-white">
            {session?.user?.name || 'Owner'}, your courts are ready.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-emerald-100">
            Track arenas, branches, courts, and bookings in one clean dashboard.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/owner/arenas/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-slate-50">
              +
            </span>
            <span>New arena</span>
          </Link>
          <Link
            href="/owner/bookings"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-600/40 px-4 py-2.5 text-sm font-semibold text-emerald-50 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-500"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>View bookings</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Arenas</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {stats.totalArenas}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {stats.totalBookings}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Bookings
              </p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {stats.pendingBookings}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Confirmed Bookings
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {stats.confirmedBookings}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/owner/arenas/new"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/70"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full p-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Create arena</p>
              <p className="text-sm text-slate-600">Add a new venue</p>
            </div>
          </Link>

          <Link
            href="/owner/bookings"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/70"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full p-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">View bookings</p>
              <p className="text-sm text-slate-600">
                {stats.pendingBookings} pending
              </p>
            </div>
          </Link>

          <Link
            href="/owner/arenas"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/70"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full p-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Manage arenas</p>
              <p className="text-sm text-slate-600">
                {stats.totalArenas} arenas
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      {stats.totalArenas === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-emerald-900 mb-2">
            🎉 Welcome to BookMyPlay!
          </h3>
          <p className="text-emerald-800 mb-4">
            Get started by creating your first arena. Once approved, you&apos;ll
            receive a unique booking link to share with your customers.
          </p>
          <Link
            href="/owner/arenas/new"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-md"
          >
            Create Your First Arena
          </Link>
        </div>
      )}
    </div>
  );
}
