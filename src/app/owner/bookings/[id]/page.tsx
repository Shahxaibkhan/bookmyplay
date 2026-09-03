'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate, formatPrice, formatTime } from '@/lib/utils';
import Toast from '@/components/Toast';

type Booking = {
  _id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  paymentReferenceId?: string;
  cancellationReason?: string;
  actionHistory?: Array<{
    action: string;
    reason: string;
    previousDate?: string;
    previousStartTime?: string;
    newDate?: string;
    newStartTime?: string;
    createdAt: string;
  }>;
  arenaName?: string;
  branchName?: string;
  branchWhatsappNumber?: string;
  courtName?: string;
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [reason, setReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const loadBooking = async () => {
      const response = await fetch(`/api/bookings/${params.id}`);
      const payload = await response.json();
      if (!response.ok) {
        setToast({ message: payload.error || 'Booking not found', type: 'error' });
      } else {
        setBooking(payload.booking);
      }
      setLoading(false);
    };
    if (params.id) loadBooking();
  }, [params.id]);

  const whatsappUrl = useMemo(() => {
    if (!booking?.branchWhatsappNumber) return null;
    const message = `Booking update\n\nReference: ${booking.referenceCode}\nArena: ${booking.arenaName}\nBranch: ${booking.branchName}\nCourt: ${booking.courtName}\nDate: ${formatDate(booking.date)}\nTime: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}\nStatus: ${booking.status.toUpperCase()}${booking.cancellationReason ? `\nReason: ${booking.cancellationReason}` : ''}`;
    return `https://wa.me/${booking.branchWhatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  }, [booking]);

  const updateBooking = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update booking');
      setBooking(data.booking);
      setShowCancel(false);
      setShowReschedule(false);
      setReason('');
      setToast({ message: data.message, type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Unable to update booking', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading booking...</div>;
  if (!booking) return <div className="mx-auto max-w-3xl p-8"><Link href="/owner/bookings" className="text-emerald-700">← Back to bookings</Link><p className="mt-8 text-slate-600">Booking unavailable.</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-lime-50 px-4 py-6 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <main className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/owner/bookings" className="text-sm font-semibold text-emerald-700">← Back to bookings</Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Booking management</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">{booking.referenceCode}</h1>
          </div>
          <span className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${booking.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{booking.status}</span>
        </div>

        <section className="grid gap-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-950">Reservation</h2>
            <Info label="Customer" value={`${booking.customerName} · ${booking.customerPhone}`} />
            <Info label="Arena" value={booking.arenaName || 'Unknown'} />
            <Info label="Branch" value={booking.branchName || 'Unknown'} />
            <Info label="Court" value={booking.courtName || 'Unknown'} />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-950">Slot</h2>
            <Info label="Date" value={formatDate(booking.date)} />
            <Info label="Time" value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} (${booking.duration} min)`} />
            <Info label="Amount" value={formatPrice(booking.price)} />
            <Info label="Payment reference" value={booking.paymentReferenceId || 'Not provided'} />
          </div>
        </section>

        {booking.status !== 'cancelled' && (
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Owner actions</h2>
            <p className="mt-1 text-sm text-slate-500">Update the reservation, then send the prepared message to the customer.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => setShowReschedule((value) => !value)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Reschedule</button>
              <button onClick={() => setShowCancel((value) => !value)} className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">Cancel booking</button>
              {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Message customer on WhatsApp</a>}
            </div>

            {showCancel && <div className="mt-5 max-w-xl space-y-3 rounded-xl bg-rose-50 p-4"><label className="block text-sm font-semibold text-rose-900" htmlFor="cancel-reason">Cancellation reason</label><textarea id="cancel-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 w-full rounded-lg border border-rose-200 bg-white p-3 text-sm" placeholder="e.g. Court maintenance" /><button disabled={saving || !reason.trim()} onClick={() => updateBooking({ status: 'cancelled', reason })} className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Confirm cancellation'}</button></div>}

            {showReschedule && <div className="mt-5 max-w-xl space-y-3 rounded-xl bg-emerald-50 p-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-emerald-950">New date<input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-200 bg-white p-3 font-normal" /></label><label className="text-sm font-semibold text-emerald-950">New start time<input type="time" value={newStartTime} onChange={(event) => setNewStartTime(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-200 bg-white p-3 font-normal" /></label></div><label className="block text-sm font-semibold text-emerald-950" htmlFor="reschedule-reason">Reason<textarea id="reschedule-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-emerald-200 bg-white p-3 text-sm font-normal" placeholder="e.g. Customer requested a later time" /></label><button disabled={saving || !newDate || !newStartTime || !reason.trim()} onClick={() => updateBooking({ date: newDate, startTime: newStartTime, reason })} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Confirm reschedule'}</button></div>}
          </section>
        )}

        {booking.cancellationReason && <section className="rounded-2xl border border-rose-100 bg-rose-50 p-6"><h2 className="font-semibold text-rose-950">Cancellation reason</h2><p className="mt-2 text-sm text-rose-800">{booking.cancellationReason}</p></section>}
        {!!booking.actionHistory?.length && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-950">Activity history</h2><div className="mt-4 space-y-3">{booking.actionHistory.map((item, index) => <div key={`${item.createdAt}-${index}`} className="border-l-2 border-emerald-300 pl-3 text-sm"><p className="font-semibold text-slate-900">{item.action === 'rescheduled' ? 'Rescheduled' : 'Cancelled'}</p><p className="text-slate-600">{item.reason}</p>{item.previousDate && <p className="text-xs text-slate-500">{item.previousDate} {item.previousStartTime} → {item.newDate} {item.newStartTime}</p>}</div>)}</div></section>}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-900">{value}</p></div>;
}
