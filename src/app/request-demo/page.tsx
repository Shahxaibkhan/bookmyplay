"use client";

import { FormEvent } from "react";
import Link from "next/link";

const successHighlights = [
  "Dedicated launch manager",
  "Custom WhatsApp flows",
  "Branch-level analytics",
];

export default function RequestDemoPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const summary = [
      `New demo request for BookMyPlay`,
      `Name: ${formData.get("name") || "N/A"}`,
      `Email: ${formData.get("email") || "N/A"}`,
      `WhatsApp: ${formData.get("phone") || "N/A"}`,
      `Branches: ${formData.get("branches") || "N/A"}`,
      `Courts per branch: ${formData.get("courts") || "N/A"}`,
      `Notes: ${formData.get("notes") || "None"}`,
    ].join("\n");

    const encodedMessage = encodeURIComponent(summary);
    const whatsappUrl = `https://wa.me/923434994409?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-lime-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="flex flex-col gap-3 text-sm font-semibold text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 hover:text-emerald-900">
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
          <Link
            href="/owner/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-emerald-400"
          >
            Owner dashboard
          </Link>
        </div>
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Request a demo</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            See how BookMyPlay powers every arena workflow.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Share a few details and our success team will reach out within one business day with a tailored walkthrough,
            pricing, and a rollout plan that fits your branches.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white/90 p-6 sm:p-8 shadow-xl shadow-emerald-100 border border-emerald-100"
          >
            <div className="grid gap-5">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-gray-800">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-gray-800">
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@arena.com"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-semibold text-gray-800">
                  WhatsApp number (Pakistan)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="branches" className="text-sm font-semibold text-gray-800">
                    Branches live today
                  </label>
                  <input
                    id="branches"
                    name="branches"
                    type="number"
                    min="1"
                    placeholder="4"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="courts" className="text-sm font-semibold text-gray-800">
                    Courts per branch
                  </label>
                  <input
                    id="courts"
                    name="courts"
                    type="number"
                    min="1"
                    placeholder="8"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="text-sm font-semibold text-gray-800">
                  Anything specific you want to see?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Collections automation, WhatsApp flows, payout reports..."
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Submit & schedule
              </button>
              <p className="text-xs text-gray-500">
                By submitting you agree to let BookMyPlay contact you about product updates, onboarding, and support.
              </p>
            </div>
          </form>

          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 sm:p-8 shadow-lg">
            <p className="text-sm font-semibold text-emerald-700">What to expect</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">A 30‑minute live workspace review.</h2>
            <p className="mt-3 text-gray-600">
              We’ll map your current booking flow, show how owners use toolkit dashboards, and hand over a rollout plan
              covering training, support, and integration timelines.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              {successHighlights.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
              <p className="text-sm font-semibold text-gray-800">Prefer WhatsApp?</p>
              <p className="text-sm text-gray-600">
                Drop “DEMO” to 03434994409 and our success lane will reply within 2 hours.
              </p>
              <Link
                href="/owner/login"
                className="mt-4 inline-flex items-center justify-center rounded-2xl border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Already a customer? Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
