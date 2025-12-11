import Link from "next/link";

const stats = [
  { value: "220+", label: "Partner Arenas" },
  { value: "18k", label: "Monthly Bookings" },
  { value: "4.9/5", label: "Owner Satisfaction" },
  { value: "24/7", label: "Support Coverage" },
];

const highlights = [
  "Realtime slot visibility",
  "WhatsApp-native booking links",
  "Automated payouts & ledger",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-lime-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24 space-y-16">
        <section className="space-y-8 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700/80">
            Sports Venue OS
            <span className="h-px w-10 bg-emerald-600 hidden sm:inline-flex" aria-hidden="true" />
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            <span className="block text-emerald-600 text-5xl sm:text-6xl lg:text-7xl tracking-tight">
              BookMyPlay
            </span>
            Grow every arena on one dashboard.
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl">
            BookMyPlay is the operating system for ambitious arena owners—centralizing slot management, WhatsApp
            bookings, payouts, and branch analytics so you can scale without extra staff.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/request-demo"
              className="w-full sm:w-auto rounded-full bg-emerald-600 px-8 py-3 text-center font-semibold text-white shadow-lg shadow-emerald-500/40 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Request a Demo
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {highlights.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm text-gray-700"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-emerald-200 bg-white/90 p-6 sm:p-8 shadow-lg shadow-emerald-200/60">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Already operating?</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Jump back in.</h2>
            <p className="mt-3 text-gray-600">
              Pick up where you left off—review branch performance, approve payouts, or add a new court in minutes.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-800">Need a quick action?</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/owner/login"
                    className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-center font-semibold text-emerald-700 transition-colors hover:border-emerald-400"
                  >
                    Owner Login
                  </Link>
                  <a
                    href="https://wa.me/923434994409?text=Hi%20BookMyPlay%20team%2C%20need%20help%20with%20my%20owner%20account."
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 transition-colors hover:border-gray-300"
                  >
                    WhatsApp Support
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm text-gray-600">
                  Have feedback? Drop it in your success channel—we respond within 2 working hours.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-white/90 p-6 sm:p-8 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">New to BookMyPlay?</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Launch in under a week.</h2>
            <p className="mt-3 text-gray-600">
              We onboard your branches, connect WhatsApp flows, and activate payment automation so you focus on filling
              courts, not spreadsheets.
            </p>
            <ul className="mt-6 space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-semibold text-gray-900">Guided onboarding playbook</p>
                  <p className="text-sm text-gray-600">Templates, launch comms, and best-practice automation.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-semibold text-gray-900">Hands-on success team</p>
                  <p className="text-sm text-gray-600">Dedicated CSM plus WhatsApp-first support.</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/owner/signup"
                className="flex-1 rounded-2xl bg-emerald-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Start Onboarding
              </Link>
              <Link
                href="/request-demo?intent=success"
                className="flex-1 rounded-2xl border border-emerald-200 px-6 py-3 text-center font-semibold text-emerald-700 transition-colors hover:border-emerald-400"
              >
                Talk to Success
              </Link>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200/60 to-lime-200/70 blur-2xl" aria-hidden="true" />
          <div className="relative rounded-3xl border border-white/70 bg-white/90 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10">
            <p className="text-sm font-semibold text-emerald-700">Live snapshot</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">PKR 12.5M revenue</p>
            <p className="text-sm text-gray-500">Past 30 days • +18% vs last month</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs uppercase tracking-wider text-emerald-600">Branches tracked</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Realtime slot-level utilization</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-500">Fastest booking</p>
                <p className="text-lg font-semibold text-gray-900">52 seconds</p>
                <p className="text-sm text-gray-600">Average time from link click to confirmed slot.</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-500">Support</p>
                <p className="text-sm text-gray-700">Dedicated success manager + WhatsApp support lane.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/60 bg-white/80 p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{item.value}</p>
              <p className="text-sm uppercase tracking-wide text-gray-500">{item.label}</p>
            </div>
          ))}
        </section>

        <footer className="text-center text-emerald-800/80 text-sm">
          © {new Date().getFullYear()} BookMyPlay · Purpose-built for arena operators.
        </footer>
      </div>
    </div>
  );
}
