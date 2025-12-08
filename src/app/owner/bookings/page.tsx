'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate, formatTime, formatPrice } from '@/lib/utils';
import Toast from '@/components/Toast';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

type Booking = {
  _id: string;
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

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings(
          bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b)),
        );
        setToast({ message: `Booking ${newStatus} successfully`, type: 'success' });
      } else {
        setToast({ message: 'Failed to update booking', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      setToast({ message: getErrorMessage(error), type: 'error' });
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === 'all') {
      return bookings;
    }
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

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
          <nav className="flex flex-wrap gap-3 px-4 py-3" aria-label="Filters">
            {[
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
            ].map((tab) => (
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
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Players</p>
                    <p className="font-medium text-slate-900">
                      {booking.numberOfPlayers ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
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

                  {booking.status === 'pending' && (
                    <div className="ml-auto flex w-full gap-2 sm:w-auto">
                      <button
                        onClick={() => handleStatusChange(booking._id, 'confirmed')}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 py-2 text-xs font-semibold text-white shadow hover:brightness-110"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking._id, 'cancelled')}
                        className="flex-1 rounded-xl bg-rose-50 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                      >
                        Cancel
                      </button>
                    </div>
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
