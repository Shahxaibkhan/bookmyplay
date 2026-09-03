'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate, formatTime, formatPrice } from '@/lib/utils';
import Toast from '@/components/Toast';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

type Booking = {
  _id: string;
  arenaId: string;
  branchId: string;
  courtId: string;
  arenaName?: string | null;
  branchName?: string | null;
  courtName?: string | null;
  referenceCode?: string;
  customerName: string;
  customerPhone: string;
  status: BookingStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  numberOfPlayers?: number;
  price: number;
  paymentReferenceId?: string;
  paymentScreenshotURL?: string;
};

type BookingResponse = { bookings?: Booking[] };
type ToastState = { message: string; type: 'success' | 'error' } | null;

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings?ownerId=${session?.user?.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = (await res.json().catch(() => null)) as BookingResponse | null;
        setBookings(data?.bookings ?? []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setToast({ message: getErrorMessage(error), type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesFilter = filter === 'all' || booking.status === filter;
      const searchable = [
        booking.referenceCode,
        booking.customerName,
        booking.customerPhone,
        booking.arenaName,
        booking.branchName,
        booking.courtName,
      ].join(' ').toLowerCase();
      return matchesFilter && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [bookings, filter, search]);

  const filterTabs: Array<{ key: 'all' | BookingStatus; label: string }> = [
    { key: 'all', label: `All (${bookings.length})` },
    {
      key: 'pending',
      label: `Pending (${bookings.filter((b) => b.status === 'pending').length})`,
    },
    {
      key: 'confirmed',
      label: `Confirmed (${bookings.filter((b) => b.status === 'confirmed').length})`,
    },
    {
      key: 'cancelled',
      label: `Cancelled (${bookings.filter((b) => b.status === 'cancelled').length})`,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
          <span>Loading your bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-5 py-5 text-emerald-50 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
                Bookings · Manage
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-white">Owner Bookings</h1>
              <p className="mt-1 text-xs text-emerald-100">
                Review upcoming reservations, confirm payments, and keep players updated.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-100/30">
                {bookings.filter((b) => b.status === 'confirmed').length} confirmed
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-100/30">
                {bookings.filter((b) => b.status === 'pending').length} pending
              </span>
              <Link
                href="/owner/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/30"
              >
                ← Back to dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white/90 shadow-sm">
          <div className="border-b border-emerald-50 px-4 py-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="booking-search">
              Find a booking
            </label>
            <input
              id="booking-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Reference, customer, phone, branch, or court"
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
            />
          </div>
          <nav className="flex flex-wrap gap-3 px-4 py-3" aria-label="Filters">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white shadow shadow-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/90 p-12 text-center shadow-sm">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-emerald-300"
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
            <h3 className="mb-2 text-xl font-semibold text-emerald-900">No bookings found</h3>
            <p className="text-sm text-emerald-600">
              {filter === 'all'
                ? 'No bookings yet. Share your booking URL to start receiving requests.'
                : `No ${filter} bookings right now.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-semibold text-slate-900">
                      {booking.customerName}
                    </h3>
                    <span className="text-xs font-medium text-slate-500">Ref #{booking.referenceCode}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : booking.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-emerald-600">
                      {formatPrice(booking.price)}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                  </div>
                </div>

                <div className="grid gap-4 border-y border-emerald-50 py-3 text-xs sm:grid-cols-5">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Phone</p>
                    <p className="font-medium text-slate-900">{booking.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Date</p>
                    <p className="font-medium text-slate-900">{formatDate(booking.date)}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Time</p>
                    <p className="font-medium text-slate-900">
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Duration</p>
                    <p className="font-medium text-slate-900">{booking.duration} min</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-4 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Arena</p>
                    <p className="font-medium text-slate-900">
                      {booking.arenaName || 'Unknown arena'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Branch</p>
                    <p className="font-medium text-slate-900">
                      {booking.branchName || 'Unknown branch'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Court</p>
                    <p className="font-medium text-slate-900">
                      {booking.courtName || 'Unknown court'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <Link
                    href={`/owner/bookings/${booking._id}`}
                    className="ml-auto rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    Manage booking
                  </Link>
                  {booking.paymentReferenceId && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                      Payment ref: {booking.paymentReferenceId}
                    </span>
                  )}

                  {booking.paymentScreenshotURL && (
                    <a
                      href={booking.paymentScreenshotURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      View payment proof ↗
                    </a>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
