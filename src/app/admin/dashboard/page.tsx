'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  price: number;
  status: BookingStatus;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

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
          // Update branch as approved
          setBranches(
            branches.map((b) =>
              b._id === branchId ? { ...b, isApproved: true } : b
            )
          );
          setToast({ message: 'Branch approved successfully!', type: 'success' });
        } else {
          // Remove deleted branch from list
          setBranches(branches.filter((b) => b._id !== branchId));
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const pendingBranches = branches.filter((b) => b.isApproved === false);
  const approvedBranches = branches.filter((b) => b.isApproved === true);
  const totalBookings = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100 mt-1">BookMyPlay Platform Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-purple-200">{session.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <span>{fetchError}</span>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="inline-flex items-center rounded-full border border-rose-300 px-4 py-1.5 font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? 'Refreshing...' : 'Try again'}
            </button>
          </div>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Branches
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {branches.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-indigo-600"
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {pendingBranches.length}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-yellow-600"
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalBookings}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Approved Branches
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {approvedBranches.length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
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

        {/* Pending Branches */}
        {pendingBranches.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Branch Approvals
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve branches before they become publicly visible
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingBranches.map((branch) => {
                  const arena = arenas.find((a) => a._id === branch.arenaId);
                  return (
                    <div
                      key={branch._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {branch.name}
                            </h3>
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold">
                              {arena?.name || 'Arena'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {branch.address}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Location</p>
                              <p className="font-medium text-gray-900">
                                {branch.city}, {branch.area}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">WhatsApp</p>
                              <p className="font-medium text-gray-900">
                                {branch.whatsappNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Operating Days</p>
                              <p className="font-medium text-gray-900">
                                {branch.schedule?.filter((s) => s.isOpen).length || 0} days
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleApproveBranch(branch._id, true)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveBranch(branch._id, false)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No bookings yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.slice(0, 10).map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {booking.customerPhone}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {booking.date} at {booking.startTime}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          Rs {booking.price}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
