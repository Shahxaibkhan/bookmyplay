import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-lime-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Book<span className="text-emerald-600">My</span>Play
          </h1>
          <p className="text-xl text-emerald-700 mb-8">
            Sports Venue Booking Made Simple
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Owner Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border border-emerald-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Arena Owner</h2>
              <p className="text-gray-600 mb-6">
                Manage your venues, courts, and bookings
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/owner/login"
                className="block w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white text-center py-3 rounded-lg hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 transition-all font-semibold shadow-md shadow-emerald-500/40"
              >
                Login
              </Link>
              <Link
                href="/owner/signup"
                className="block w-full bg-white border-2 border-emerald-500 text-emerald-600 text-center py-3 rounded-lg hover:bg-emerald-50 transition-all font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border border-emerald-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin</h2>
              <p className="text-gray-600 mb-6">
                Manage platform, owners, and analytics
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/admin/login"
                className="block w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white text-center py-3 rounded-lg hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 transition-all font-semibold shadow-md shadow-emerald-500/40"
              >
                Admin Login
              </Link>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Looking to Book?</h2>
              <p className="text-gray-600 mb-6">
                Get the booking link from your favorite sports venue on their social media or contact them directly
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Visit venue&apos;s social media</li>
                <li>Click their booking link</li>
                <li>Select your slot</li>
                <li>Book instantly via WhatsApp</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-emerald-800">
          <p className="text-sm">
            © 2025 BookMyPlay. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
