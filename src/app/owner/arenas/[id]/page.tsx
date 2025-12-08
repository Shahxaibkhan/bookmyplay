'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

type ArenaDetails = {
  _id: string;
  name: string;
  description?: string;
  slug: string;
};

type BranchSummary = {
  _id: string;
  name: string;
  address: string;
  whatsappNumber: string;
  isApproved: boolean;
  city?: string;
  area?: string;
  schedule?: { day: string; isOpen: boolean }[];
};

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

export default function ArenaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const arenaId = params.id as string;

  const [arena, setArena] = useState<ArenaDetails | null>(null);
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [arenaRes, branchesRes] = await Promise.all([
          fetch(`/api/arenas/${arenaId}`),
          fetch(`/api/branches?arenaId=${arenaId}`)
        ]);
        
        if (arenaRes.ok) {
          const arenaData = await arenaRes.json();
          setArena(arenaData.arena as ArenaDetails);
        }
        
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches((branchesData.branches || []) as BranchSummary[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError('Failed to load arena details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [arenaId]);

  const copyToClipboard = () => {
    if (!arena) return;
    const url = `${window.location.origin}/book/${arena.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setToast({ message: 'Booking URL copied to clipboard!', type: 'success' });
    }).catch(() => {
      setToast({ message: 'Failed to copy URL', type: 'error' });
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100">
        <div className="flex items-center gap-3 text-sm font-medium text-emerald-700">
          <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
          <span>Loading arena details...</span>
        </div>
      </div>
    );
  }

  if (!arena && fetchError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-rose-50 px-4 text-center">
        <div className="rounded-2xl border border-rose-200 bg-white px-6 py-8 shadow-sm">
          <p className="text-2xl">⚠️</p>
          <h2 className="mt-2 text-xl font-semibold text-rose-900">{fetchError}</h2>
          <button
            onClick={() => router.push('/owner/arenas')}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50"
          >
            Back to arenas
          </button>
        </div>
      </div>
    );
  }

  if (!arena) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Hero header similar to arenas list */}
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-6 py-6 text-emerald-50 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
                Arena overview
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                {arena.name}
              </h2>
              {arena.description && (
                <p className="mt-2 max-w-xl text-sm text-emerald-100">
                  {arena.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 sm:items-end">
              <Link
                href="/owner/arenas"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-300/40 backdrop-blur transition hover:bg-white/15"
              >
                <span className="text-base leading-none">←</span>
                <span>Back to arenas</span>
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 px-3 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-emerald-400/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>Arena code</span>
                <span className="font-semibold text-white">{arena.slug}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arena details card */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-emerald-50 to-lime-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Arena Details</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-600">Booking URL</p>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-white px-3 py-2 rounded-lg font-mono text-emerald-700 border border-emerald-200">/book/{arena.slug}</code>
              <button
                onClick={copyToClipboard}
                className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-semibold transition-colors shadow-md shadow-emerald-500/40"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Share this link once your branches are approved</p>
          </div>
        </div>
      </div>
      
      {/* Branches card */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Branches</h3>
            <p className="mt-1 text-sm text-slate-600">
              Manage branches for this arena and add more locations.
            </p>
          </div>
          <Link
            href={`/owner/arenas/${arenaId}/branches/new`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition-all hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Branch
          </Link>
        </div>

        {branches.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No branches yet</h4>
            <p className="text-gray-600 mb-4">Add your first branch to start adding courts and receiving bookings</p>
            <Link
              href={`/owner/arenas/${arenaId}/branches/new`}
              className="inline-block bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 transition-all font-semibold shadow-lg shadow-emerald-500/40"
            >
              Add First Branch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {branches.map((branch) => (
              <div
                key={branch._id}
                className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                  {branch.isApproved ? (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-1 rounded border border-emerald-100">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded border border-amber-100">
                      ⏳ Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{branch.address}</p>
                <p className="text-sm text-gray-600 mb-2">📞 {branch.whatsappNumber}</p>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/owner/arenas/${arenaId}/branches/${branch._id}`}
                    className="flex-1 rounded-full bg-emerald-700 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-md"
                  >
                    Manage Courts
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
