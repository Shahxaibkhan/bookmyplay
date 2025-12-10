'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error' | 'missing'>(
    'idle',
  );
  const [message, setMessage] = useState('');

  const runVerification = async (token: string) => {
    setStatus('verifying');
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Verification failed');
      }

      setStatus('success');
      setMessage(data?.message || 'Email verified successfully.');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'Unable to verify email at this time.',
      );
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('missing');
      setMessage('Verification token is missing. Please use the link from your email.');
      return;
    }

    runVerification(token);
  }, [searchParams]);

  const token = searchParams.get('token');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center shadow-xl shadow-emerald-500/20">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">BookMyPlay</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Verify your email</h1>

        {status === 'verifying' && (
          <div className="mt-8 flex flex-col items-center gap-4 text-slate-600">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p>Confirming your account…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-800">
              {message}
            </div>
            <Link
              href="/owner/login?verified=1"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
            >
              Proceed to login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message}
            </div>
            {token && (
              <button
                type="button"
                onClick={() => runVerification(token)}
                className="w-full rounded-2xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Retry verification
              </button>
            )}
          </div>
        )}

        {status === 'missing' && (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {message}
            </div>
            <p className="text-sm text-slate-500">
              Request a new verification email from the login screen if your link has expired.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
