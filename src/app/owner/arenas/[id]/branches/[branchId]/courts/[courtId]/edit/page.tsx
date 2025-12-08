'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';

const sportTypes = ['Cricket', 'Padel', 'Tennis', 'Football', 'Futsal', 'Badminton', 'Squash', 'Basketball', 'Volleyball'] as const;
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

type DayOfWeek = (typeof daysOfWeek)[number];

type CourtFormState = {
  name: string;
  sportType: string;
  basePrice: string;
  slotDuration: string;
  maxPlayers: string;
  courtNotes: string;
};

type ScheduleDay = {
  day: DayOfWeek;
  isOpen: boolean;
  isAllDay: boolean;
  openingTime: string;
  closingTime: string;
};

type DayPrice = { day: DayOfWeek | ''; price: string };
type TimePriceGroup = 'all' | 'weekdays' | 'weekends';
type TimePrice = {
  fromTime: string;
  toTime: string;
  price: string;
  dayGroup: TimePriceGroup;
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

type CourtApiResponse = {
  court: {
    name?: string;
    sportType?: string;
    basePrice?: number;
    slotDuration?: number;
    maxPlayers?: number;
    courtNotes?: string;
    schedule?: ScheduleDay[];
    dayPrices?: Array<{ day: DayOfWeek; price: number }>;
    timePrices?: Array<{
      fromTime: string;
      toTime: string;
      price: number;
      days?: DayOfWeek[];
    }>;
  };
};

const defaultSchedule = (): ScheduleDay[] =>
  daysOfWeek.map((day) => ({
    day,
    isOpen: true,
    isAllDay: false,
    openingTime: '06:00',
    closingTime: '23:00',
  }));

const weekdayList: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekendList: DayOfWeek[] = ['Saturday', 'Sunday'];

const dayGroupToDays = (group: TimePriceGroup): DayOfWeek[] => {
  if (group === 'weekdays') {
    return weekdayList;
  }
  if (group === 'weekends') {
    return weekendList;
  }
  return [];
};

const deriveDayGroup = (days?: DayOfWeek[]): TimePriceGroup => {
  if (!days || days.length === 0) {
    return 'all';
  }
  if (days.length === weekendList.length && weekendList.every((day) => days.includes(day))) {
    return 'weekends';
  }
  if (days.length === weekdayList.length && weekdayList.every((day) => days.includes(day))) {
    return 'weekdays';
  }
  return 'all';
};

export default function EditCourtPage() {
  const params = useParams();
  const router = useRouter();
  const arenaId = params.id as string;
  const branchId = params.branchId as string;
  const courtId = params.courtId as string;

  const [formData, setFormData] = useState<CourtFormState>({
    name: '',
    sportType: '',
    basePrice: '',
    slotDuration: '60',
    maxPlayers: '',
    courtNotes: '',
  });
  const [schedule, setSchedule] = useState<ScheduleDay[]>(defaultSchedule());
  const [dayPrices, setDayPrices] = useState<DayPrice[]>([]);
  const [timePrices, setTimePrices] = useState<TimePrice[]>([]);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const toggleDay = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  const updateDayTime = (
    index: number,
    field: 'openingTime' | 'closingTime' | 'isAllDay',
    value: string | boolean
  ) => {
    setSchedule((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
              ...(field === 'isAllDay' && value === true
                ? { openingTime: '00:00', closingTime: '23:59' }
                : {}),
            }
          : item
      )
    );
  };

  useEffect(() => {
    const fetchCourt = async () => {
      setFetchLoading(true);
      try {
        const res = await fetch(`/api/courts/${courtId}`);
        if (!res.ok) throw new Error('Failed to load court');

        const data = (await res.json().catch(() => null)) as CourtApiResponse | null;
        if (!data?.court) {
          throw new Error('Court not found');
        }

        const court = data.court;

        setFormData({
          name: court.name || '',
          sportType: court.sportType || '',
          basePrice: court.basePrice?.toString() || '',
          slotDuration: court.slotDuration?.toString() || '60',
          maxPlayers: court.maxPlayers?.toString() || '',
          courtNotes: court.courtNotes || '',
        });

        if (court.schedule && court.schedule.length > 0) {
          setSchedule(
            court.schedule.map((day) => ({
              ...day,
              isAllDay: day.isAllDay ?? false,
            })),
          );
        }

        if (court.dayPrices && court.dayPrices.length > 0) {
          setDayPrices(
            court.dayPrices.map((dp) => ({
              day: dp.day,
              price: dp.price.toString(),
            })),
          );
          setShowAdvancedPricing(true);
        }

        if (court.timePrices && court.timePrices.length > 0) {
          setTimePrices(
            court.timePrices.map((tp) => ({
              fromTime: tp.fromTime,
              toTime: tp.toTime,
              price: tp.price.toString(),
              dayGroup: deriveDayGroup(tp.days),
            })),
          );
          setShowAdvancedPricing(true);
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        setToast({ message, type: 'error' });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCourt();
  }, [courtId]);

  const addDayPrice = () => {
    setDayPrices((prev) => [...prev, { day: '', price: '' }]);
  };

  const removeDayPrice = (index: number) => {
    setDayPrices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDayPrice = (
    index: number,
    field: 'day' | 'price',
    value: string,
  ) => {
    setDayPrices((prev) => {
      const updated = [...prev];
      if (field === 'day') {
        updated[index].day = value as DayOfWeek | '';
      } else {
        updated[index].price = value;
      }
      return updated;
    });
  };

  const addTimePrice = () => {
    setTimePrices((prev) => [
      ...prev,
      { fromTime: '', toTime: '', price: '', dayGroup: 'all' },
    ]);
  };

  const removeTimePrice = (index: number) => {
    setTimePrices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTimePrice = (
    index: number,
    field: 'fromTime' | 'toTime' | 'price' | 'dayGroup',
    value: string,
  ) => {
    setTimePrices((prev) => {
      const updated = [...prev];
      updated[index][field] =
        field === 'dayGroup' ? (value as TimePriceGroup) : value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        branchId,
        arenaId,
        basePrice: Number.parseFloat(formData.basePrice),
        slotDuration: Number.parseInt(formData.slotDuration, 10),
        maxPlayers: formData.maxPlayers
          ? Number.parseInt(formData.maxPlayers, 10)
          : undefined,
        dayPrices: dayPrices
          .filter(
            (dp): dp is { day: DayOfWeek; price: string } => Boolean(dp.day && dp.price),
          )
          .map((dp) => ({
            day: dp.day,
            price: Number.parseFloat(dp.price),
          })),
        timePrices: timePrices
          .filter((tp) => tp.fromTime && tp.toTime && tp.price)
          .map((tp) => ({
            fromTime: tp.fromTime,
            toTime: tp.toTime,
            price: Number.parseFloat(tp.price),
            days: dayGroupToDays(tp.dayGroup),
          })),
        schedule,
      };

      const res = await fetch(`/api/courts/${courtId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update court');
      }

      setToast({ message: 'Court updated successfully!', type: 'success' });
      setTimeout(() => {
        router.push(`/owner/arenas/${arenaId}/branches/${branchId}`);
      }, 1200);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message || 'Something went wrong');
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-50 to-lime-100 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-gray-600">Loading court...</p>
        </div>
      </div>
    );
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

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-5 py-4 text-emerald-50 shadow-lg">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
              Courts · Edit
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Edit Court</h1>
            <p className="mt-1 text-xs text-emerald-100">
              Match the new court experience with updated details, timings, and pricing.
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

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 shadow-sm">
          {error && (
            <div className="m-6 border-l-4 border-red-500 bg-red-50 px-6 py-4 text-red-700">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <span className="text-lg font-bold text-emerald-700">1</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Court Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Cricket 1, Padel Court A"
                  />
                  <p className="mt-1 text-xs text-gray-500">Give your court a recognizable title.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Sport Type *
                  </label>
                  <select
                    required
                    value={formData.sportType}
                    onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select sport type</option>
                    {sportTypes.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Choose the sport played on this court.</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Court Notes <span className="font-normal text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={formData.courtNotes}
                  onChange={(e) => setFormData({ ...formData, courtNotes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Special facilities, equipment, or notes about this court..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <span className="text-lg font-bold text-emerald-700">2</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Pricing & Slots</h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">Daily Timings</label>
                <p className="mb-3 text-xs text-gray-500">Update open hours per day; slots generate inside this window.</p>
                <div className="space-y-2">
                  {schedule.map((day, index) => (
                    <div
                      key={day.day}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-semibold ${
                          day.isOpen ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white text-gray-400'
                        }`}
                      >
                        ✓
                      </button>
                      <span className="w-24 text-sm font-medium text-gray-800">{day.day}</span>
                      {day.isOpen ? (
                        <div className="flex items-center gap-3 text-sm">
                          <label className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={day.isAllDay || false}
                              onChange={(e) => updateDayTime(index, 'isAllDay', e.target.checked)}
                              className="h-3 w-3 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>All day (24 hrs)</span>
                          </label>
                          {!day.isAllDay && (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={day.openingTime}
                                onChange={(e) => updateDayTime(index, 'openingTime', e.target.value)}
                                className="rounded border border-gray-300 px-2 py-1 text-gray-900"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={day.closingTime}
                                onChange={(e) => updateDayTime(index, 'closingTime', e.target.value)}
                                className="rounded border border-gray-300 px-2 py-1 text-gray-900"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-red-600">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">Base Price (Rs.) *</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">Slot Duration (min) *</label>
                  <select
                    required
                    value={formData.slotDuration}
                    onChange={(e) => setFormData({ ...formData, slotDuration: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Max Players <span className="font-normal text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <span className="text-lg font-bold text-emerald-700">3</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Advanced Pricing</h2>
                    <p className="text-sm text-gray-600">Optional: set special day/time prices identical to the add flow.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedPricing((v) => !v)}
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {showAdvancedPricing ? 'Hide' : 'Show'} options
                  <svg
                    className={`h-5 w-5 transition-transform ${showAdvancedPricing ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showAdvancedPricing && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-gray-900">Day-specific pricing</h3>
                        <p className="text-sm text-gray-600">Weekend or special-day pricing aligned with the add view.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addDayPrice}
                        className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add day price
                      </button>
                    </div>
                    {dayPrices.length === 0 ? (
                      <p className="text-sm italic text-gray-600">No day-specific prices set. Base price will be used for all days.</p>
                    ) : (
                      <div className="space-y-3">
                        {dayPrices.map((dp, index) => (
                          <div key={index} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-white p-3">
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-semibold text-gray-700">Day</label>
                              <select
                                value={dp.day}
                                onChange={(e) => updateDayPrice(index, 'day', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                              >
                                <option value="">Select day</option>
                                {daysOfWeek.map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-semibold text-gray-700">Price (Rs.)</label>
                              <input
                                type="number"
                                placeholder="e.g., 1500"
                                value={dp.price}
                                onChange={(e) => updateDayPrice(index, 'price', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDayPrice(index)}
                              className="mt-6 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-gray-900">Time-specific pricing (priority)</h3>
                        <p className="text-sm text-gray-600">Peak/off-peak slabs override day pricing just like on the create form.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addTimePrice}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add time slab
                      </button>
                    </div>
                    {timePrices.length === 0 ? (
                      <p className="text-sm italic text-gray-600">No time-specific prices set. Same price will apply for all hours.</p>
                    ) : (
                      <div className="space-y-3">
                        {timePrices.map((tp, index) => (
                          <div key={index} className="flex items-start gap-3 rounded-lg border border-indigo-200 bg-white p-3">
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-semibold text-gray-700">From time</label>
                              <input
                                type="time"
                                value={tp.fromTime}
                                onChange={(e) => updateTimePrice(index, 'fromTime', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-semibold text-gray-700">To time</label>
                              <input
                                type="time"
                                value={tp.toTime}
                                onChange={(e) => updateTimePrice(index, 'toTime', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-semibold text-gray-700">Price (Rs.)</label>
                              <input
                                type="number"
                                value={tp.price}
                                onChange={(e) => updateTimePrice(index, 'price', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                                placeholder="e.g., 2000"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-semibold text-gray-700">Days</label>
                              <select
                                value={tp.dayGroup || 'all'}
                                onChange={(e) => updateTimePrice(index, 'dayGroup', e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                              >
                                <option value="all">All days</option>
                                <option value="weekdays">Weekdays (Mon–Fri)</option>
                                <option value="weekends">Weekends (Sat–Sun)</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTimePrice(index)}
                              className="mt-6 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-end gap-3 border-t border-emerald-100 pt-4">
              <Link
                href={`/owner/arenas/${arenaId}/branches/${branchId}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
