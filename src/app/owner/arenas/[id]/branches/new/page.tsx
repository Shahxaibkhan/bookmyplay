'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';
import ScreenLoader from '@/components/ScreenLoader';

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';

type BranchForm = {
  name: string;
  address: string;
  googleMapLink: string;
  city: string;
  area: string;
  whatsappNumber: string;
  paymentBankName: string;
  paymentAccountNumber: string;
  paymentIban: string;
  paymentAccountTitle: string;
  paymentOtherMethods: string;
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

const pakistanCities = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Rahim Yar Khan',
  'Gujrat',
  'Mardan',
  'Kasur',
  'Dera Ghazi Khan',
  'Sahiwal',
  'Nawabshah',
  'Mingora',
  'Okara',
  'Other',
];

export default function NewBranchPage() {
  const params = useParams();
  const router = useRouter();
  const arenaId = params.id as string;

  const [formData, setFormData] = useState<BranchForm>({
    name: '',
    address: '',
    googleMapLink: '',
    city: '',
    area: '',
    whatsappNumber: '',
    paymentBankName: '',
    paymentAccountNumber: '',
    paymentIban: '',
    paymentAccountTitle: '',
    paymentOtherMethods: '',
  });

  const [showOtherCity, setShowOtherCity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          arenaId,
        }),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create branch');
      }

      setToast({ message: 'Branch created successfully!', type: 'success' });
      setTimeout(() => {
        router.push(`/owner/arenas/${arenaId}`);
      }, 1200);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScreenLoader
        show={loading}
        headline="Saving branch details..."
        subtext="This usually takes a few seconds"
      />
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-5 py-4 text-emerald-50 shadow-lg">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
              Branches · New
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Add New Branch</h1>
            <p className="mt-1 text-xs text-emerald-100">
              Add a new location for this arena.
            </p>
          </div>
          <Link
            href={`/owner/arenas/${arenaId}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-emerald-50 ring-1 ring-emerald-300/40 backdrop-blur hover:bg-white/15"
          >
            <span className="text-base leading-none">←</span>
            <span>Back to arena</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Branch Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Main Branch, DHA Branch"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Full street address"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  City *
                </label>
                <select
                  required
                  value={showOtherCity ? 'Other' : formData.city}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherCity(true);
                      setFormData({ ...formData, city: '' });
                    } else {
                      setShowOtherCity(false);
                      setFormData({ ...formData, city: e.target.value });
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select City</option>
                  {pakistanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {showOtherCity && (
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter city name"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Area *
                </label>
                <input
                  type="text"
                  required
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Area/Locality"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Google Maps Link
              </label>
              <input
                type="url"
                value={formData.googleMapLink}
                onChange={(e) => setFormData({ ...formData, googleMapLink: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://goo.gl/maps/..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                WhatsApp Number * (for bookings)
              </label>
              <input
                type="tel"
                required
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="03xxxxxxxxx"
              />
              <p className="mt-1 text-sm text-gray-500">
                Booking confirmations will be sent to this WhatsApp number
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.paymentBankName}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentBankName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Meezan Bank, HBL, etc."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.paymentAccountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentAccountNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 0355XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.paymentIban}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentIban: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="PKxxMEZN0xxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account Title
                </label>
                <input
                  type="text"
                  value={formData.paymentAccountTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentAccountTitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Galaxy Sports"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Other Payment Methods (JazzCash / Easypaisa / etc.)
                </label>
                <textarea
                  value={formData.paymentOtherMethods}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentOtherMethods: e.target.value })
                  }
                  className="min-h-[80px] w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={
                    'JazzCash: 03xx xxxxxxx (Name)\nEasypaisa: 03xx xxxxxxx (Name)'
                  }
                />
              </div>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-gray-700">
              <p className="mb-1 font-semibold">Timings managed at court level</p>
              <p>
                You will set opening hours and slot timings separately for each court.
                This branch only defines the location and WhatsApp number.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/40 transition-all hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating Branch...' : 'Create Branch'}
              </button>
              <Link
                href={`/owner/arenas/${arenaId}`}
                className="rounded-lg border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
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