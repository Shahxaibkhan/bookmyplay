import Link from "next/link";

const playbook = [
  {
    title: "Branch health",
    description: "Track occupancy, cancellations, and payouts in real time for every arena.",
    href: "/owner/dashboard",
    cta: "Open dashboard",
  },
  {
    title: "Courts & slots",
    description: "Add courts, tweak pricing, and push live booking links in under a minute.",
    href: "/owner/arenas",
    cta: "Manage courts",
  },
  {
    title: "Bookings & ledgers",
    description: "Centralize manual WhatsApp holds, online payments, and staff notes.",
    href: "/owner/bookings",
    cta: "Review bookings",
  },
];

const productScreens = [
  {
    title: "Branch overview",
    metric: "87% utilization",
    description: "Live feed of occupancy, drop-offs, and court health across all branches.",
    highlights: ["642 active bookings today", "12 flagged payments", "Net +18% vs last month"],
  },
  {
    title: "Collections & payouts",
    metric: "PKR 4.3M ready to settle",
    description: "Automated payout batches with ledger notes and WhatsApp notifications.",
    highlights: ["Auto-split across 3 branches", "UPI + Cards + Cash", "Next run 7:00 PM"],
  },
  {
    title: "WhatsApp flows",
    metric: "52s avg booking time",
    description: "Pre-built flows with sample copy for trials, memberships, and renewals.",
    highlights: ["Reusable message blocks", "Slot reminders", "Late-night promo drip"],
  },
];

export default function OwnerToolkitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-lime-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Owner toolkit</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Everything you need to run every branch.</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Use this space as your quick-launch hub: deep dives on features, shortcuts into the dashboard, and resources to
            onboard new staff or franchise partners.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/request-demo"
              className="rounded-full border border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Need a refresher? Book a success call
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {playbook.map((item) => (
            <div key={item.title} className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{item.title}</p>
              <p className="mt-3 text-gray-700">{item.description}</p>
              <Link
                href={item.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
              >
                {item.cta}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/90 p-6 sm:p-10 shadow-xl shadow-emerald-100">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Product screens</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Peek at live workspaces.</h2>
          <p className="mt-3 text-gray-600 max-w-2xl">
            These mock cards mirror what owners see once they log in—complete with sample data so you can picture how
            BookMyPlay tracks utilization, automates payouts, and powers WhatsApp-first booking journeys.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {productScreens.map((screen) => (
              <div key={screen.title} className="rounded-3xl border border-emerald-50 bg-gradient-to-br from-white to-emerald-50/70 p-6 shadow-lg">
                <p className="text-sm font-semibold text-emerald-700">{screen.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{screen.metric}</p>
                <p className="mt-2 text-sm text-gray-600">{screen.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {screen.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-gray-100 bg-white/95 p-6 sm:p-8 shadow-xl">
            <p className="text-sm font-semibold text-gray-700">New staff onboarding</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Share the toolkit pack.</h2>
            <p className="mt-3 text-gray-600">
              Download ready-to-use SOPs, WhatsApp templates, and escalation checklists for managers and front-desk teams.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/request-demo?intent=sop-kit"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center text-sm font-semibold text-emerald-700 hover:border-emerald-400"
              >
                Get the SOP kit
              </Link>
              <Link
                href="/owner/dashboard"
                className="rounded-2xl border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:border-gray-400"
              >
                View training agenda
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">Tip: add new teammates under Settings → Access Control.</p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-100 via-white to-lime-100 p-6 sm:p-8">
            <p className="text-sm font-semibold text-emerald-700">Need help fast?</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Talk to your success lane.</h2>
            <p className="mt-3 text-gray-600">
              Message us on WhatsApp or schedule a 15‑minute huddle with your Customer Success Manager to unblock workflows or
              plan the next expansion.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white bg-white/80 p-4">
                <p className="text-sm font-semibold text-gray-800">WhatsApp lane</p>
                <p className="text-sm text-gray-600">Text “HELP” to +92 343 499 4409 for priority routing.</p>
              </div>

              <div className="rounded-2xl border border-white bg-white/80 p-4">
                <p className="text-sm font-semibold text-gray-800">Office hours</p>
                <p className="text-sm text-gray-600">Tues & Thurs · 3–5 PM IST · Slots released weekly.</p>
              </div>
              <Link
                href="/request-demo"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Book a check-in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
