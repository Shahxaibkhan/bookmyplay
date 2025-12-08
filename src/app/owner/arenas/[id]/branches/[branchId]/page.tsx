'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

type Branch = {
  _id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  whatsappNumber?: string;
  googleMapLink?: string;
  paymentBankName?: string;
  paymentAccountNumber?: string;
  paymentIban?: string;
  paymentAccountTitle?: string;
  paymentOtherMethods?: string;
};

type Court = {
  _id: string;
  name: string;
  basePrice: number;
  slotDuration: number;
  sportType: string;
  courtNotes?: string;
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

type BranchResponse = { branch?: Branch };
type CourtsResponse = { courts?: Court[] };

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';

export default function BranchDetailPage() {
  const params = useParams();
  const arenaId = params.id as string;
  const branchId = params.branchId as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [branchRes, courtsRes] = await Promise.all([
        fetch(`/api/branches/${branchId}`),
        fetch(`/api/courts?branchId=${branchId}`),
      ]);

      if (branchRes.ok) {
        const branchData = (await branchRes.json().catch(() => null)) as BranchResponse | null;
        setBranch(branchData?.branch ?? null);
      } else {
        setBranch(null);
      }

      if (courtsRes.ok) {
        const courtsData = (await courtsRes.json().catch(() => null)) as CourtsResponse | null;
        setCourts(courtsData?.courts ?? []);
      } else {
        setCourts([]);
      }
    } catch (error) {
      console.error('Error fetching branch/courts:', error);
      setToast({ message: 'Failed to load branch details', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasPaymentInfo = useMemo(() => {
    if (!branch) return false;
    return (
      Boolean(branch.paymentBankName) ||
      Boolean(branch.paymentAccountNumber) ||
      Boolean(branch.paymentIban) ||
      Boolean(branch.paymentAccountTitle) ||
      Boolean(branch.paymentOtherMethods)
    );
  }, [branch]);

  const handleDeleteCourt = async (courtId: string, courtName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${courtName}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingCourtId(courtId);
    try {
      const res = await fetch(`/api/courts/${courtId}`, { method: 'DELETE' });

      if (res.ok) {
        setToast({ message: 'Court deleted successfully', type: 'success' });
        await fetchData();
      } else {
        const data = await res.json().catch(() => null);
        setToast({
          message: data?.error || 'Failed to delete court',
          type: 'error',
        });
      }
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setDeletingCourtId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-emerald-700 font-semibold">Loading branch workspace...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-center text-sm font-medium text-red-700">
          Branch not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-6 py-6 text-emerald-50 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
                Branch overview
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                {branch.name}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-emerald-100">{branch.address}</p>
            </div>

            <div className="flex flex-col items-end gap-2 sm:items-end">
              <div className="text-[11px] text-emerald-100">
                <span className="font-medium uppercase tracking-[0.18em] text-emerald-200/90">
                  Branch
                </span>
                <p className="mt-1 text-emerald-50">
                  {branch.city}, {branch.area}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/owner/arenas/${arenaId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-300/40 backdrop-blur transition hover:bg-white/15"
                >
                  <span className="text-base leading-none">←</span>
                  <span>Back to arena</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-emerald-50 to-lime-50 p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-900">Branch Details</h3>
            <Link
              href={`/owner/arenas/${arenaId}/branches/${branchId}/edit`}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Branch
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">WhatsApp (Bookings)</p>
              <p className="font-semibold text-gray-900">
                {branch.whatsappNumber || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-900">
                {branch.city}, {branch.area}
              </p>
            </div>
            {branch.googleMapLink && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Google Maps</p>
                <a
                  href={branch.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View location ↗
                </a>
              </div>
            )}
          </div>

          <div className="mt-3 rounded-lg border border-emerald-100 bg-white/80 p-4 text-sm text-gray-700">
            <p className="mb-1 font-semibold">Timings managed at court level</p>
            <p>
              Opening and closing times are configured for each court separately. This
              branch simply groups courts under the same location and WhatsApp
              number.
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-emerald-100 bg-white/80 p-5">
            <h4 className="mb-3 text-base font-semibold text-slate-900">Payment &amp; Payout Details</h4>
            {hasPaymentInfo ? (
              <dl className="grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-2">
                {branch.paymentBankName && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Bank</dt>
                    <dd className="font-semibold text-slate-900">{branch.paymentBankName}</dd>
                  </div>
                )}
                {branch.paymentAccountTitle && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Account Title</dt>
                    <dd className="font-semibold text-slate-900">{branch.paymentAccountTitle}</dd>
                  </div>
                )}
                {branch.paymentAccountNumber && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Account Number</dt>
                    <dd className="font-semibold text-slate-900">{branch.paymentAccountNumber}</dd>
                  </div>
                )}
                {branch.paymentIban && (
                  <div className="md:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">IBAN</dt>
                    <dd className="break-all font-semibold text-slate-900">{branch.paymentIban}</dd>
                  </div>
                )}
                {branch.paymentOtherMethods && (
                  <div className="md:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Other Methods</dt>
                    <dd className="whitespace-pre-wrap font-semibold text-slate-900">
                      {branch.paymentOtherMethods}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-slate-600">
                No payment instructions saved yet. Add payout details so players know how to pay before booking.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Courts</h3>
              <p className="mt-1 text-sm text-slate-600">
                Manage individual courts, pricing and timings under this branch.
              </p>
            </div>
            <Link
              href={`/owner/arenas/${arenaId}/branches/${branchId}/courts/new`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
            >
              <svg
                className="h-5 w-5"
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
              Add Court
            </Link>
          </div>

          {courts.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">
                No courts yet
              </h4>
              <p className="mb-4 text-gray-600">
                Add your first court to start receiving bookings.
              </p>
              <Link
                href={`/owner/arenas/${arenaId}/branches/${branchId}/courts/new`}
                className="inline-block rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/40 transition-all hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600"
              >
                Add First Court
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <div
                  key={court._id}
                  className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md"
                >
                  <div className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-lime-400" />

                  <div className="relative flex flex-col gap-3 pt-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          {court.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Slot duration {court.slotDuration} min
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        {court.sportType}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold text-emerald-600">
                        Rs. {court.basePrice}
                      </span>
                      <span className="text-xs text-slate-500">/ slot</span>
                    </div>

                    {court.courtNotes && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {court.courtNotes}
                      </p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/owner/arenas/${arenaId}/branches/${branchId}/courts/${court._id}/edit`}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 hover:shadow-md"
                      >
                        Edit court
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourt(court._id, court.name)}
                        disabled={deletingCourtId === court._id}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        {deletingCourtId === court._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
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

