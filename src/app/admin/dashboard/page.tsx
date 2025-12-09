'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Toast from '@/components/Toast';

type BranchSchedule = {
  day: string;
  isOpen: boolean;
};

type Branch = {
  _id: string;
  arenaId: string;
  name: string;
  address: string;
  city: string;
  area: string;
  whatsappNumber: string;
  schedule?: BranchSchedule[];
  isApproved: boolean;
};

type Arena = {
  _id: string;
  name: string;
};

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

type Booking = {
  _id: string;
  arenaId: string;
  branchId: string;
  courtId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  price: number;
  status: BookingStatus;
};

type ToastState = { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;

const parseBookingDate = (booking: Booking) => {
  const time = booking.startTime || '00:00';
  return new Date(`${booking.date}T${time}`);
};

const isWithinDays = (booking: Booking, days: number) => {
  const bookingDate = parseBookingDate(booking);
  const diff = Date.now() - bookingDate.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

const formatAmount = (value: number) => `Rs ${value.toLocaleString()}`;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [fetchError, setFetchError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArena, setSelectedArena] = useState<'all' | string>('all');
  const [selectedBranch, setSelectedBranch] = useState<'all' | string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7' | '30' | '90'>('all');
  const [bookingsSort, setBookingsSort] = useState<'recent' | 'amount'>('recent');
  const [arenaSort, setArenaSort] = useState<'bookings' | 'revenue'>('bookings');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (session?.user?.role && session.user.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    setSelectedBranch('all');
  }, [selectedArena]);

  const loadDashboardData = useCallback(async () => {
    if (session?.user?.role !== 'admin') return;

    setRefreshing(true);
    setFetchError('');

    try {
      const [branchesRes, arenasRes, bookingsRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/arenas'),
        fetch('/api/bookings'),
      ]);

      const branchesData = await branchesRes.json();
      const arenasData = await arenasRes.json();
      const bookingsData = await bookingsRes.json();

      setBranches(branchesData.branches || []);
      setArenas(arenasData.arenas || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFetchError('Unable to load dashboard data. Please try again.');
      setToast({ message: 'Failed to fetch latest data', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.role]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      loadDashboardData();
    }
  }, [session, loadDashboardData]);

  const handleApproveBranch = async (branchId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/branches/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      });

      if (res.ok) {
        if (approve) {
          setBranches((prev) => prev.map((branch) => (branch._id === branchId ? { ...branch, isApproved: true } : branch)));
          setToast({ message: 'Branch approved successfully!', type: 'success' });
        } else {
          setBranches((prev) => prev.filter((branch) => branch._id !== branchId));
          setToast({ message: 'Branch rejected and deleted successfully', type: 'success' });
        }
      } else {
        setToast({ message: 'Failed to update branch', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      setToast({ message: 'Error updating branch', type: 'error' });
    }
  };

  const pendingBranches = useMemo(() => branches.filter((branch) => !branch.isApproved), [branches]);
  const approvedBranches = useMemo(() => branches.filter((branch) => branch.isApproved), [branches]);
  const branchOptions = useMemo(() => {
    if (selectedArena === 'all') return branches;
    return branches.filter((branch) => branch.arenaId === selectedArena);
  }, [branches, selectedArena]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (selectedArena !== 'all' && booking.arenaId !== selectedArena) return false;
      if (selectedBranch !== 'all' && booking.branchId !== selectedBranch) return false;
      if (dateFilter === 'all') return true;
      return isWithinDays(booking, Number(dateFilter));
    });
  }, [bookings, selectedArena, selectedBranch, dateFilter]);

  const sortedBookings = useMemo(() => {
    const list = [...filteredBookings];
    if (bookingsSort === 'recent') {
      return list.sort((a, b) => parseBookingDate(b).getTime() - parseBookingDate(a).getTime());
    }
    return list.sort((a, b) => b.price - a.price);
  }, [filteredBookings, bookingsSort]);

  const bookingsByStatus = useMemo(() => {
    return filteredBookings.reduce(
      (acc, booking) => {
        acc[booking.status] += 1;
        return acc;
      },
      { pending: 0, confirmed: 0, cancelled: 0 },
    );
  }, [filteredBookings]);

  const totalRevenue = useMemo(() => {
    return filteredBookings
      .filter((booking) => booking.status !== 'cancelled')
      .reduce((sum, booking) => sum + booking.price, 0);
  }, [filteredBookings]);

  const arenaPerformance = useMemo(() => {
    const performance = arenas.map((arena) => {
      const arenaBranches = branches.filter((branch) => branch.arenaId === arena._id);
      const arenaBookings = bookings.filter((booking) => booking.arenaId === arena._id);
      const arenaRevenue = arenaBookings
        .filter((booking) => booking.status !== 'cancelled')
        .reduce((sum, booking) => sum + booking.price, 0);

      return {
        id: arena._id,
        name: arena.name,
        branches: arenaBranches.length,
        pendingBranches: arenaBranches.filter((branch) => !branch.isApproved).length,
        bookings: arenaBookings.length,
        revenue: arenaRevenue,
      };
    });

    return performance.sort((a, b) => {
      return arenaSort === 'revenue' ? b.revenue - a.revenue : b.bookings - a.bookings;
    });
  }, [arenas, branches, bookings, arenaSort]);

  const loaderView = (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 flex items-center justify-center px-6">
      <div className="rounded-3xl bg-white/70 shadow-xl shadow-emerald-500/20 px-10 py-8 text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm font-semibold text-emerald-700 tracking-wide">Preparing admin workspace…</p>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return loaderView;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/90">Command center</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Admin Control Room</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-100">
              Monitor every arena, branch and booking in one place. Filter activity by arena, branch or timeframe for precise control.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-2xl bg-white/10 p-4 text-sm text-emerald-50 shadow-inner shadow-emerald-900/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:w-auto">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Signed in as</p>
              <p className="text-base font-semibold">{session.user.name}</p>
              <p className="text-xs text-emerald-100">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {fetchError && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-3 text-sm text-rose-900 shadow-sm">
            <span>{fetchError}</span>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="rounded-full border border-rose-300 px-4 py-1.5 font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? 'Refreshing…' : 'Try again'}
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active arenas</p>
            <p className="mt-2 text-4xl font-semibold text-emerald-700">{arenas.length}</p>
            <p className="text-xs text-slate-500">Across {branches.length} branches</p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending approvals</p>
            <p className="mt-2 text-4xl font-semibold text-amber-600">{pendingBranches.length}</p>
            <p className="text-xs text-slate-500">{approvedBranches.length} branches live</p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Filtered bookings</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{filteredBookings.length}</p>
            <p className="text-xs text-slate-500">Confirmed {bookingsByStatus.confirmed}</p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Revenue (filters)</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">{formatAmount(totalRevenue)}</p>
            <p className="text-xs text-slate-500">Excludes cancelled bookings</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Booking insights</h2>
              <p className="text-sm text-slate-500">Slice bookings by arena, branch or timeframe.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              <select
                value={selectedArena}
                onChange={(event) => setSelectedArena(event.target.value)}
                className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All arenas</option>
                {arenas.map((arena) => (
                  <option key={arena._id} value={arena._id}>
                    {arena.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
                className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
                disabled={branchOptions.length === 0}
              >
                <option value="all">All branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value as typeof dateFilter)}
                className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>

              <select
                value={bookingsSort}
                onChange={(event) => setBookingsSort(event.target.value as typeof bookingsSort)}
                className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="recent">Sort: Most recent</option>
                <option value="amount">Sort: Highest amount</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-100">
            {sortedBookings.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">No bookings match the current filters.</div>
            ) : (
              <table className="min-w-full divide-y divide-emerald-50 text-sm">
                <thead className="bg-emerald-50/70">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-emerald-800">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-emerald-800">Arena</th>
                    <th className="px-4 py-3 text-left font-semibold text-emerald-800">Branch</th>
                    <th className="px-4 py-3 text-left font-semibold text-emerald-800">Date & time</th>
                    <th className="px-4 py-3 text-left font-semibold text-emerald-800">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-emerald-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 bg-white">
                  {sortedBookings.slice(0, 15).map((booking) => {
                    const arenaName = arenas.find((arena) => arena._id === booking.arenaId)?.name ?? '—';
                    const branchName = branches.find((branch) => branch._id === booking.branchId)?.name ?? '—';

                    return (
                      <tr key={booking._id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{booking.customerName}</td>
                        <td className="px-4 py-3 text-slate-600">{arenaName}</td>
                        <td className="px-4 py-3 text-slate-600">{branchName}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {booking.date} · {booking.startTime}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">{formatAmount(booking.price)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{bookingsByStatus.pending}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Confirmed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{bookingsByStatus.confirmed}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Cancelled</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{bookingsByStatus.cancelled}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Arena performance</h2>
              <p className="text-sm text-slate-500">Compare arenas by revenue or booking volume.</p>
            </div>
            <select
              value={arenaSort}
              onChange={(event) => setArenaSort(event.target.value as typeof arenaSort)}
              className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="bookings">Sort by bookings</option>
              <option value="revenue">Sort by revenue</option>
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {arenaPerformance.length === 0 && (
              <p className="rounded-2xl border border-dashed border-emerald-200 px-4 py-6 text-center text-sm text-slate-500">
                No arenas found.
              </p>
            )}

            {arenaPerformance.map((arena) => (
              <div
                key={arena.id}
                className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-6 shadow-inner"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Arena</p>
                    <h3 className="text-xl font-semibold text-slate-900">{arena.name}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    {arena.branches} branches
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-emerald-100 bg-white/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bookings</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{arena.bookings}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-white/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-700">{formatAmount(arena.revenue)}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-white/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending branches</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-600">{arena.pendingBranches}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-white/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Approval rate</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {arena.branches === 0
                        ? '—'
                        : `${Math.round(((arena.branches - arena.pendingBranches) / arena.branches) * 100)}%`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {pendingBranches.length > 0 && (
          <section className="mt-8 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">Pending branch approvals</h2>
              <p className="text-sm text-slate-500">Approve or reject new locations instantly.</p>
            </div>

            <div className="mt-6 space-y-4">
              {pendingBranches.map((branch) => {
                const arena = arenas.find((entry) => entry._id === branch.arenaId);

                return (
                  <div
                    key={branch._id}
                    className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-slate-900">{branch.name}</h3>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                            {arena?.name ?? 'Arena'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{branch.address}</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {branch.city}, {branch.area}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">WhatsApp</p>
                            <p className="mt-1 font-semibold text-slate-900">{branch.whatsappNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open days</p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {branch.schedule?.filter((slot) => slot.isOpen).length ?? 0} days
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveBranch(branch._id, true)}
                          className="rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveBranch(branch._id, false)}
                          className="rounded-2xl border border-rose-200 bg-white px-5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
