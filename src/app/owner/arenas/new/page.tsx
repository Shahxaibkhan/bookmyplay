'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

type ArenaForm = {
  name: string;
  description: string;
};

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

export default function NewArenaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ArenaForm>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/arenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create arena');
      }

      setToast({
        message: 'Arena created successfully! Now add branches and courts.',
        type: 'success',
      });
      setTimeout(() => {
        router.push(`/owner/arenas/${data.arena._id}`);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setToast({
        message,
        type: 'error',
      });
    } finally {
      setLoading(false);
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

      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-5 py-4 text-emerald-50 shadow-lg">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
              Arenas · New
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Create New Arena
            </h1>
            <p className="mt-1 text-xs text-emerald-100">
              Step 1: Set up your arena brand, then add branches and courts.
            </p>
          </div>
          <Link
            href="/owner/arenas"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-emerald-50 ring-1 ring-emerald-300/40 backdrop-blur hover:bg-white/15"
          >
            <span className="text-base leading-none">←</span>
            <span>Back to arenas</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Arena Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Galaxy Sports Arena, Shah Sports Complex"
              />
              <p className="mt-1 text-xs text-gray-500">
                Your main arena / brand name — can have multiple locations.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe your arena brand, facilities, and what makes it special..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Tell customers about your arena and amenities.
              </p>
            </div>

            <div className="mt-2 flex items-center justify-end gap-3 border-t border-emerald-50 pt-4">
              <Link
                href="/owner/arenas"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 disabled:opacity-60"
              >
                {loading ? 'Creating…' : 'Create arena'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
