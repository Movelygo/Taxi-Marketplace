import Link from 'next/link'

export const metadata = {
  title: 'How Movely Works — Transparent Driver Directory',
  description:
    'How Movely connects customers with independent drivers. No bookings, no fees, no middleman — just direct contact.',
  openGraph: {
    title: 'How Movely Works',
    description: 'A transparent look at how our driver directory works.',
    type: 'website',
  },
}

const CUSTOMER_STEPS = [
  {
    step: '01',
    title: 'Browse the directory',
    description: 'Open the Drivers page and filter by city. You can see each driver\'s vehicle type, service area, and languages spoken.',
  },
  {
    step: '02',
    title: 'Open a driver profile',
    description: 'Each profile shows real information about the driver: name, vehicle, photo, service area, languages, and contact options.',
  },
  {
    step: '03',
    title: 'Contact the driver directly',
    description: 'Tap the phone or WhatsApp button. You\'re now in a direct conversation with the driver — no Movely staff in between.',
  },
  {
    step: '04',
    title: 'Arrange the trip',
    description: 'Discuss your route, pickup time, and price with the driver. Confirm details and pay them directly — no platform fees.',
  },
]

const DRIVER_STEPS = [
  {
    step: '01',
    title: 'Sign up for a free account',
    description: 'Register with your email to claim a profile.',
  },
  {
    step: '02',
    title: 'Fill out your profile',
    description: 'Add your name, vehicle info, photo, service areas, languages, and contact info.',
  },
  {
    step: '03',
    title: 'Wait for approval',
    description: 'Our team manually reviews each new profile before it goes live in the directory. Typically 1–2 business days.',
  },
  {
    step: '04',
    title: 'Receive direct leads',
    description: 'Approved profiles appear in the directory and on city pages. Customers contact you directly. You handle pricing and bookings.',
  },
]

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1F3D] via-[#0B1F3D] to-[#001F3F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full mb-6">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                How It Works
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              A directory, not a dispatcher.
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
              Movely connects customers with independent drivers. We don&apos;t book trips, take commissions, or set prices. We just help the two sides find each other.
            </p>
          </div>
        </div>
      </section>

      {/* For Customers */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">For Customers</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Finding a driver
            </h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
              Movely puts you in direct contact with independent drivers. No app to install, no account required to browse.
            </p>
          </div>

          <div className="space-y-4">
            {CUSTOMER_STEPS.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 flex items-start gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#0B1F3D] text-amber-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/drivers"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B1F3D] text-white rounded-lg font-bold text-sm hover:bg-[#001F3F] transition-colors"
            >
              Browse Drivers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* For Drivers */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">For Drivers</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Listing your service
            </h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
              If you&apos;re an independent driver, Movely is a free way to put your service in front of local customers.
            </p>
          </div>

          <div className="space-y-4">
            {DRIVER_STEPS.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 flex items-start gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#0B1F3D] text-amber-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/for-drivers"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B1F3D] text-white rounded-lg font-bold text-sm hover:bg-[#001F3F] transition-colors"
            >
              Learn More for Drivers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Transparency</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Movely does and doesn&apos;t do
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-bold text-green-900">What Movely is</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-900">
                <li>• A directory of independent drivers</li>
                <li>• A way for customers to discover drivers nearby</li>
                <li>• A free tool for drivers to list their service</li>
                <li>• A direct phone / WhatsApp connection</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-base font-bold text-amber-900">What Movely is not</h3>
              </div>
              <ul className="space-y-2 text-sm text-amber-900">
                <li>• A ride-share or taxi company</li>
                <li>• A booking or dispatch system</li>
                <li>• A payment processor</li>
                <li>• A background-check or verification service</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6 max-w-2xl mx-auto">
            Customers are responsible for verifying any driver&apos;s license, insurance, and credentials before riding.
          </p>
        </div>
      </section>

      {/* What's coming */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Roadmap</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What&apos;s coming next
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Movely is in early access. Features we&apos;re actively working on:
            </p>
          </div>

          <ul className="space-y-3 max-w-xl mx-auto">
            {[
              'Customer reviews and ratings',
              'Driver vehicle photo galleries',
              'Profile view analytics for drivers',
              'Advanced search filters (price range, vehicle class, availability)',
              'In-app messaging',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#0B1F3D] to-[#001F3F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to use Movely?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/drivers"
              className="px-6 py-3.5 bg-amber-400 text-[#0B1F3D] rounded-lg font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              Find Drivers
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-sm hover:bg-white/20 transition-colors"
            >
              Join as Driver
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
