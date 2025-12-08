'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Toast from '@/components/Toast';

type ArenaSummary = {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  branchesCount?: number;
  courtsCount?: number;
};

type ToastState = {
  message: string;
  type: 'success' | 'error' | 'warning';
} | null;

export default function ArenasPage() {
  const { data: session } = useSession();
  const [arenas, setArenas] = useState<ArenaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [fetchError, setFetchError] = useState('');

  const loadArenas = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch('/api/arenas');
      const result = (await res.json()) as { arenas?: ArenaSummary[] };
      setArenas(Array.isArray(result.arenas) ? result.arenas : []);
    } catch (error) {
      console.error('Error fetching arenas:', error);
      setFetchError('Failed to load arenas. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArenas();
  }, [loadArenas]);

  const handleDelete = async (arenaId: string) => {
    if (!confirm('Are you sure you want to delete this arena?')) return;

    try {
      const res = await fetch(`/api/arenas/${arenaId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setArenas((prev) => prev.filter((a) => a._id !== arenaId));
        setToast({ message: 'Arena deleted successfully', type: 'success' });
      } else {
        setToast({ message: 'Failed to delete arena', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting arena:', error);
      setToast({ message: 'Error deleting arena', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Hero header like dashboard */}
        <div className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-6 py-6 text-emerald-50 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
              Owner dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
              Manage your arenas
            </h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-100">
              View and manage all your sports venues, branches, and courts from
              a single clean list.
            </p>
            </div>

            <div className="flex flex-col items-end gap-2 sm:items-end">
              {session?.user?.email && (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-emerald-400/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="hidden sm:inline">Signed in as</span>
                  <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-[220px]">
                    {session.user.email}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href="/owner/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-300/40 backdrop-blur transition hover:bg-white/15"
                >
                  <span className="text-base leading-none">←</span>
                  <span>Back to home</span>
                </Link>

                <Link
                  href="/owner/arenas/new"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-slate-50 text-base">
                    +
                  </span>
                  <span>New arena</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content card */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-sm">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500/70" />
            <span className="ml-2">Loading your arenas...</span>
          </div>
        ) : fetchError ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center shadow-sm">
            <span className="mb-3 text-2xl">⚠️</span>
            <h3 className="mb-2 text-xl font-semibold text-rose-900">
              Something went wrong
            </h3>
            <p className="mb-4 max-w-md text-sm text-rose-800">{fetchError}</p>
            <button
              onClick={loadArenas}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Try again
            </button>
          </div>
        ) : arenas.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <svg
                className="h-9 w-9 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 21h8m-4-4v4m9-9a9 9 0 11-18 0 9 9 0 0118 0zm-9-4v4m0 0h4m-4 0H8"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              You don&apos;t have any arenas yet
            </h3>
            <p className="mb-6 max-w-md text-sm text-slate-600">
              Create your first arena to start publishing time slots, manage
              courts, and receive bookings from players.
            </p>
            <Link
              href="/owner/arenas/new"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <span>Create your first arena</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {arenas.length} arena{arenas.length > 1 ? 's' : ''} found
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {arenas.map((arena) => (
                <div
                  key={arena._id}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {arena.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {arena.description ||
                          arena.location ||
                          'No description added yet.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(arena._id)}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Live</span>
                    </span>
                    <div className="flex items-center gap-3">
                      {arena.branchesCount != null && (
                        <span>{arena.branchesCount} branches</span>
                      )}
                      {arena.courtsCount != null && (
                        <span>{arena.courtsCount} courts</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/owner/arenas/${arena._id}`}
                      className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-md"
                    >
                      Manage arena
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
