'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';
import ScreenLoader from '@/components/ScreenLoader';

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';

type BranchForm = {
  name: string;
  address: string;
  city: string;
  area: string;
  whatsappNumber: string;
  paymentBankName: string;
  paymentAccountNumber: string;
  paymentIban: string;
  paymentAccountTitle: string;
  paymentOtherMethods: string;
};

type BranchApiResponse = {
  branch: Partial<BranchForm> & {
    paymentOtherMethods?: string;
  };
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const arenaId = params.id as string;
  const branchId = params.branchId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [formData, setFormData] = useState<BranchForm>({
    name: '',
    address: '',
    city: '',
    area: '',
    whatsappNumber: '',
    paymentBankName: '',
    paymentAccountNumber: '',
    paymentIban: '',
    paymentAccountTitle: '',
    paymentOtherMethods: '',
  });

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await fetch(`/api/branches/${branchId}`);
        if (res.ok) {
          const data = (await res.json().catch(() => null)) as BranchApiResponse | null;
          if (data?.branch) {
            setFormData({
              name: data.branch.name ?? '',
              address: data.branch.address ?? '',
              city: data.branch.city ?? '',
              area: data.branch.area ?? '',
              whatsappNumber: data.branch.whatsappNumber ?? '',
              paymentBankName: data.branch.paymentBankName ?? '',
              paymentAccountNumber: data.branch.paymentAccountNumber ?? '',
              paymentIban: data.branch.paymentIban ?? '',
              paymentAccountTitle: data.branch.paymentAccountTitle ?? '',
              paymentOtherMethods: data.branch.paymentOtherMethods ?? '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching branch:', error);
        setToast({ message: 'Failed to load branch details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [branchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/branches/${branchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({ message: 'Branch updated successfully!', type: 'success' });
        setTimeout(() => {
          router.push(`/owner/arenas/${arenaId}/branches/${branchId}`);
        }, 1500);
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setToast({ message: data?.error || 'Failed to update branch', type: 'error' });
      }
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-emerald-700 font-semibold">Loading branch details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScreenLoader
        show={submitting}
        headline="Updating branch..."
        subtext="Applying your latest changes"
      />
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-5 py-4 text-emerald-50 shadow-lg">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
              Branch settings
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Edit Branch</h1>
            <p className="mt-1 text-xs text-emerald-100">
              Update branch details and payout information.
            </p>
          </div>
          <Link
            href={`/owner/arenas/${arenaId}/branches/${branchId}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-emerald-50 ring-1 ring-emerald-300/40 backdrop-blur hover:bg-white/15"
          >
            <span className="text-base leading-none">←</span>
            <span>Back to branch</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Branch details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="Main Branch, Downtown, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="+92300xxxxxxx"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="Karachi, Lahore, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Area *
              </label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="DHA, Gulberg, etc."
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-emerald-50 pt-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.paymentBankName}
                onChange={(e) => setFormData({ ...formData, paymentBankName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="Meezan Bank, HBL, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={formData.paymentAccountNumber}
                onChange={(e) => setFormData({ ...formData, paymentAccountNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500 text-gray-900 placeholder-gray-400"
                placeholder="e.g. 0355XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IBAN
              </label>
              <input
                type="text"
                value={formData.paymentIban}
                onChange={(e) => setFormData({ ...formData, paymentIban: e.target.value })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="PKxxMEZN0xxxxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Title
              </label>
              <input
                type="text"
                value={formData.paymentAccountTitle}
                onChange={(e) => setFormData({ ...formData, paymentAccountTitle: e.target.value })}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="Galaxy Sports"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Other Payment Methods (JazzCash / Easypaisa / etc.)
              </label>
              <textarea
                value={formData.paymentOtherMethods}
                onChange={(e) => setFormData({ ...formData, paymentOtherMethods: e.target.value })}
                className="min-h-[80px] w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="JazzCash: 03xx xxxxxxx (Name)\nEasypaisa: 03xx xxxxxxx (Name)"
              />
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-sm text-gray-700">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Timings managed at court level</h2>
            <p>
              Branch timings are no longer editable here. Configure opening hours and
              slot timings separately for each court under this branch.
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white py-3 rounded-lg font-bold text-lg hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/40"
            >
              {submitting ? 'Updating...' : 'Update Branch'}
            </button>
            <Link
              href={`/owner/arenas/${arenaId}/branches/${branchId}`}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>

          
          </form>
        </div>
      </div>
      </div>
    </>
  );
}
