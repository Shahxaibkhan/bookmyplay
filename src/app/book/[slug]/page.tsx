'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Toast from '@/components/Toast';

type BranchPaymentInfo = {
  paymentBankName?: string;
  paymentAccountTitle?: string;
  paymentAccountNumber?: string;
  paymentIban?: string;
  paymentOtherMethods?: string;
};

type PublicBranch = BranchPaymentInfo & {
  _id: string;
  name: string;
  city: string;
  area: string;
  whatsappNumber: string;
};

type CourtSchedule = {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
};

type DayPrice = {
  day: string;
  price: number;
};

type TimePrice = {
  fromTime: string;
  toTime: string;
  price: number;
  days?: string[];
};

type PublicCourt = {
  _id: string;
  branchId: string;
  name: string;
  sportType: string;
  slotDuration: number;
  basePrice: number;
  schedule?: CourtSchedule[];
  dayPrices?: DayPrice[];
  timePrices?: TimePrice[];
};

type PublicArena = {
  _id: string;
  name: string;
  description?: string;
};

type PublicArenaPayload = {
  arena: PublicArena;
  branches: PublicBranch[];
  courts: PublicCourt[];
};

type SlotOption = {
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
};

type SelectedSlot = Pick<SlotOption, 'startTime' | 'endTime' | 'price'>;

type BookingRecord = {
  startTime: string;
  status: string;
};

type BookingsResponse = {
  bookings?: BookingRecord[];
};

type BookingFormState = {
  customerName: string;
  customerPhone: string;
  paymentReferenceId: string;
};

type ToastState = {
  message: string;
  type: 'error' | 'warning';
} | null;

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<PublicArenaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<PublicCourt | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<SlotOption[]>([]);
  const [noSlotsReason, setNoSlotsReason] = useState<string | null>(null);

  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    customerName: '',
    customerPhone: '',
    paymentReferenceId: '',
  });

  useEffect(() => {
    const fetchArenaData = async () => {
      try {
        const res = await fetch(`/api/public/arena/${slug}`);
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || 'Arena not found');
        }

        setData(payload as PublicArenaPayload);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Arena not found';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchArenaData();
  }, [slug]);

  const calculatePrice = useCallback(
    (time: string): number => {
      if (!selectedCourt) return 0;

      if (selectedDate) {
        const dayName = new Date(selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
        });
        for (const slab of selectedCourt.timePrices || []) {
          const appliesToDay =
            !slab.days || slab.days.length === 0 || slab.days.includes(dayName);
          if (appliesToDay && time >= slab.fromTime && time < slab.toTime) {
            return slab.price;
          }
        }

        const dayPrice = selectedCourt.dayPrices?.find(
          (price) => price.day === dayName
        );
        if (dayPrice) return dayPrice.price;
      }

      return selectedCourt.basePrice;
    },
    [selectedCourt, selectedDate]
  );

  const generateSlots = useCallback(
    (takenSlots: string[] = []) => {
      if (!selectedBranch || !selectedCourt || !selectedDate) return;

      const date = new Date(selectedDate);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      const daySchedule = (selectedCourt.schedule || []).find(
        (schedule) => schedule.day === dayName
      );

      if (!daySchedule || !daySchedule.isOpen) {
        setNoSlotsReason('Court is closed on this day.');
        setAvailableSlots([]);
        return;
      }

      const allSlots: SlotOption[] = [];
      const slotDuration = selectedCourt.slotDuration || 60;

      const [openHour, openMin] = daySchedule.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = daySchedule.closingTime.split(':').map(Number);

      let currentTime = openHour * 60 + openMin;
      const closingTime = closeHour * 60 + closeMin;

      while (currentTime + slotDuration <= closingTime) {
        const startHour = Math.floor(currentTime / 60);
        const startMin = currentTime % 60;
        const endTime = currentTime + slotDuration;
        const endHour = Math.floor(endTime / 60);
        const endMin = endTime % 60;

        const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(
          startMin
        ).padStart(2, '0')}`;
        const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(
          endMin
        ).padStart(2, '0')}`;

        const price = calculatePrice(startTimeStr);
        const isTaken = takenSlots.includes(startTimeStr);

        allSlots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          price,
          available: !isTaken,
        });

        currentTime += slotDuration;
      }

      setAvailableSlots(allSlots);
      setNoSlotsReason(
        allSlots.length === 0 ? 'No slots available for this date.' : null
      );
    },
    [calculatePrice, selectedBranch, selectedCourt, selectedDate]
  );

  const loadBookedSlotsAndGenerate = useCallback(async () => {
    if (!selectedCourt || !selectedDate) return;

    try {
      const res = await fetch(
        `/api/public/bookings?courtId=${selectedCourt._id}&date=${selectedDate}`
      );
      const payload = (await res.json()) as BookingsResponse;
      const taken = (payload.bookings ?? [])
        .filter((booking) => booking.status !== 'cancelled')
        .map((booking) => booking.startTime);
      generateSlots(taken);
    } catch (fetchError) {
      console.error('Failed to load existing bookings for this court/date', fetchError);
      generateSlots([]);
    }
  }, [selectedCourt, selectedDate, generateSlots]);

  useEffect(() => {
    if (selectedBranch && selectedDate && selectedCourt) {
      loadBookedSlotsAndGenerate();
    }
  }, [selectedBranch, selectedDate, selectedCourt, loadBookedSlotsAndGenerate]);

  const toggleSlotSelection = (slot: SlotOption) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(
        (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.startTime === slot.startTime && s.endTime === slot.endTime)
        );
      }
      return [...prev, slot].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    });
  };

  const formatPakPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (!digits.startsWith('0')) return '0' + digits;
    if (digits.length <= 4) return digits;
    return digits.slice(0, 4) + '-' + digits.slice(4, 11);
  };

  const handleBooking = async () => {
    if (!bookingForm.customerName || !bookingForm.customerPhone) {
      setToast({ message: 'Please fill in all required fields', type: 'warning' });
      return;
    }

    if (!bookingForm.paymentReferenceId) {
      setToast({ message: 'Please enter the payment transaction ID', type: 'warning' });
      return;
    }

    if (!selectedSlots.length) {
      setToast({ message: 'Please select at least one time slot', type: 'warning' });
      return;
    }

    if (!data || !selectedBranch || !selectedCourt) {
      setToast({ message: 'Complete all steps before booking', type: 'warning' });
      return;
    }

    const totalAmount = selectedSlots.reduce(
      (sum, slot) => sum + (slot.price || 0),
      0
    );

    const totalMinutes = selectedSlots.length * (selectedCourt.slotDuration || 60);
    const totalHours = (totalMinutes / 60).toFixed(1).replace('.0', '');

    const slotsText = selectedSlots
      .map(
        (slot) =>
          `- ${formatTime(slot.startTime)} to ${formatTime(slot.endTime)} (Rs ${slot.price})`
      )
      .join('\n');

    // Create confirmed bookings for each selected slot.
    // If a slot is already booked (400), just skip it and continue
    // so the user is not shown an error toast.
    try {
      for (const slot of selectedSlots) {
        const res = await fetch('/api/public/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courtId: selectedCourt._id,
            branchId: selectedBranch._id,
            arenaId: data.arena._id,
            customerName: bookingForm.customerName,
            customerPhone: bookingForm.customerPhone,
            date: selectedDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: selectedCourt.slotDuration || 60,
            price: slot.price,
            paymentReferenceId: bookingForm.paymentReferenceId || undefined,
            // Mark as confirmed so slot is blocked until owner deletes/cancels
            status: 'confirmed',
          }),
        });

        if (!res.ok) {
          // For conflicts / already-booked, just skip without surfacing error
          const body = await res.json().catch(() => ({}));
          console.warn('Create booking failed', res.status, body?.error);
          continue;
        }
      }
    } catch (e) {
      console.error('Error creating bookings from public portal', e);
      // Silent failure for user; do not block WhatsApp opening
    }

    const message = `New Booking Request

Arena: ${data.arena.name}
Branch: ${selectedBranch.name}
Court: ${selectedCourt.name}

Customer Details:
Name: ${bookingForm.customerName}
Phone: ${bookingForm.customerPhone}

Booking Details:
Sport: ${selectedCourt.sportType}
Date: ${new Date(selectedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}
Slots:\n${slotsText}
Total Duration: ${totalHours} hour(s)

Payment:
Total Amount: Rs ${totalAmount}
${bookingForm.paymentReferenceId ? `Reference: ${bookingForm.paymentReferenceId}` : ''}

Please confirm this booking. Thank you!
    `.trim();

    const whatsappNumber = selectedBranch.whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    // After creating bookings, open WhatsApp and refresh local slots
    window.open(whatsappURL, '_blank');

    // Refresh booked slots and available slots so just-booked
    // times appear as disabled when user returns to this page
    try {
      await loadBookedSlotsAndGenerate();
      setSelectedSlots([]);
    } catch (e) {
      console.error('Failed to refresh slots after booking', e);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-semibold">Loading BookMyPlay experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Arena Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 pb-20 md:pb-0">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            {data.arena.name}
          </h1>
          <p className="text-emerald-100 mt-1">{data.arena.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-50">
            {['Branch','Court','Date','Slot','Details'].map((label, index) => {
              const step = index + 1;
              const active =
                (step === 1 && selectedBranch) ||
                (step === 2 && selectedCourt) ||
                (step === 3 && selectedDate) ||
                (step === 4 && selectedSlots.length > 0) ||
                (step === 5 && selectedSlots.length > 0);
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 bg-emerald-700/40 border border-emerald-300/40 ${
                    active ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold">
                    {step}
                  </span>
                  <span className="uppercase tracking-wide text-[10px] font-semibold">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                1. Select Branch
              </h2>
              {data.branches.length === 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-900 font-semibold">No Branches Available</p>
                  <p className="text-yellow-800 text-sm mt-1">
                    This arena is setting up branches. Please check back soon!
                  </p>
                </div>
              ) : (
                <select
                  value={selectedBranch?._id || ''}
                  onChange={(e) => {
                    const branch = data?.branches.find((b) => b._id === e.target.value) || null;
                    setSelectedBranch(branch);
                    setSelectedCourt(null);
                    setSelectedDate('');
                    setSelectedSlots([]);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                >
                  <option value="">Select branch</option>
                  {data?.branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.city}, {branch.area})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedBranch && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  2. Select Court
                </h2>
                <select
                  value={selectedCourt?._id || ''}
                  onChange={(e) => {
                    if (!data || !selectedBranch) return;
                    const courtsForBranch = data.courts.filter(
                      (court) => court.branchId === selectedBranch._id
                    );
                    const court = courtsForBranch.find((c) => c._id === e.target.value) || null;
                    setSelectedCourt(court);
                    setSelectedDate('');
                    setSelectedSlots([]);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                >
                  <option value="">Select court</option>
                  {data?.courts
                    .filter((court) => court.branchId === selectedBranch._id)
                    .map((court) => (
                      <option key={court._id} value={court._id}>
                        {court.name} ({court.sportType})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {selectedCourt && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  3. Select Date
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {selectedDate && availableSlots.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  4. Select Time Slot
                </h2>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {availableSlots.map((slot, index) => {
                    if (!slot.available) {
                      return (
                        <div
                          key={index}
                          className="p-4 rounded-lg border-2 border-gray-200 bg-gray-100 text-left opacity-60 cursor-not-allowed"
                        >
                          <p className="font-semibold text-gray-500">
                            {formatTime(slot.startTime)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {slot.endTime && `to ${formatTime(slot.endTime)}`}
                          </p>
                          <p className="text-gray-500 font-medium mt-2 text-sm">
                            Booked
                          </p>
                        </div>
                      );
                    }

                    const isSelected = selectedSlots.some(
                      (s) =>
                        s.startTime === slot.startTime &&
                        s.endTime === slot.endTime
                    );
                    return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleSlotSelection(slot)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        {formatTime(slot.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.endTime && `to ${formatTime(slot.endTime)}`}
                      </p>
                      <p className="text-emerald-600 font-bold mt-2">
                        Rs {slot.price}
                      </p>
                    </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDate && availableSlots.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 text-sm text-gray-700">
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Slots Available</h2>
                <p>{noSlotsReason || 'No time slots could be generated for this date.'}</p>
              </div>
            )}

            {selectedBranch && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  {selectedBranch.paymentBankName && (
                    <p>
                      <span className="font-semibold">Bank:</span> {selectedBranch.paymentBankName}
                    </p>
                  )}
                  {selectedBranch.paymentAccountTitle && (
                    <p>
                      <span className="font-semibold">Account Name:</span> {selectedBranch.paymentAccountTitle}
                    </p>
                  )}
                  {selectedBranch.paymentAccountNumber && (
                    <p>
                      <span className="font-semibold">Account No.:</span> {selectedBranch.paymentAccountNumber}
                    </p>
                  )}
                  {selectedBranch.paymentIban && (
                    <p className="break-all">
                      <span className="font-semibold">IBAN:</span> {selectedBranch.paymentIban}
                    </p>
                  )}
                  {selectedBranch.paymentOtherMethods && (
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <p className="font-semibold mb-1">Other Methods:</p>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
{selectedBranch.paymentOtherMethods}
                      </pre>
                    </div>
                  )}
                  {!selectedBranch.paymentBankName &&
                    !selectedBranch.paymentAccountNumber &&
                    !selectedBranch.paymentIban &&
                    !selectedBranch.paymentAccountTitle &&
                    !selectedBranch.paymentOtherMethods && (
                      <p className="text-gray-500 text-sm">
                        Payment details will be shared by the arena.
                      </p>
                    )}
                </div>
              </div>
            )}

            {selectedSlots.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.customerName}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.customerPhone}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          customerPhone: e.target.value,
                        })
                      }
                      onBlur={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          customerPhone: formatPakPhone(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      placeholder="03xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Reference / Transaction ID
                    </label>
                    <input
                      type="text"
                      value={bookingForm.paymentReferenceId}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          paymentReferenceId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      placeholder="e.g. bank transfer ID"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                    <h3 className="font-semibold text-emerald-900 mb-2">Booking Summary</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(selectedDate).toLocaleDateString()}
                      </p>
                      <div>
                        <span className="font-medium">Slots:</span>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          {selectedSlots.map((slot) => (
                            <li key={slot.startTime + slot.endTime}>
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}{' '}
                              (Rs {slot.price})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p>
                        <span className="font-medium">Total Duration:</span>{' '}
                        {(
                          (selectedSlots.length * (selectedCourt.slotDuration || 60)) /
                          60
                        )
                          .toFixed(1)
                          .replace('.0', '')}{' '}
                        hour(s)
                      </p>
                      <p className="text-lg font-bold text-emerald-700 mt-2">
                        Total: Rs{' '}
                        {selectedSlots.reduce(
                          (sum, slot) => sum + (slot.price || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const isBookingReady =
                      !!selectedBranch &&
                      !!selectedCourt &&
                      !!selectedDate &&
                      selectedSlots.length > 0 &&
                      !!bookingForm.customerName &&
                      !!bookingForm.customerPhone &&
                      bookingForm.customerPhone.replace(/\D/g, '').length >= 10 &&
                      !!bookingForm.paymentReferenceId;

                    return (
                      <button
                        onClick={handleBooking}
                        disabled={!isBookingReady}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors ${
                          isBookingReady
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Send Booking via WhatsApp
                      </button>
                    );
                  })()}

                  <p className="text-xs text-center text-gray-500">
                    You will be redirected to WhatsApp to confirm your booking
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p className="flex items-center justify-center gap-1">
            Powered by
            <span className="inline-flex font-semibold tracking-tight text-slate-900">
              <span className="text-slate-900">Book</span>
              <span className="text-emerald-500">My</span>
              <span className="text-slate-900">Play</span>
            </span>
          </p>
        </div>
      </div>

      {/* Mobile sticky summary bar */}
      {selectedSlots.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white/95 border-t border-emerald-200 shadow-lg md:hidden">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-gray-600 truncate">
                {formatTime(selectedSlots[0].startTime)}
                {selectedSlots.length > 1 ? ' and more' : ''}
              </p>
            </div>
            {(() => {
              const isBookingReady =
                !!selectedBranch &&
                !!selectedCourt &&
                !!selectedDate &&
                selectedSlots.length > 0 &&
                !!bookingForm.customerName &&
                !!bookingForm.customerPhone &&
                bookingForm.customerPhone.replace(/\D/g, '').length >= 10 &&
                !!bookingForm.paymentReferenceId;

              return (
                <button
                  onClick={handleBooking}
                  disabled={!isBookingReady}
                  className={`flex-shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-colors ${
                    isBookingReady
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  Send on WhatsApp
                </button>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
