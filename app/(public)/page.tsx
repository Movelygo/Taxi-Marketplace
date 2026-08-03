import Link from 'next/link'
import { FAQ } from '@/components/public/faq'
import { FeaturedDriversSection } from '@/components/public/featured-drivers-section'
import { HeroVisual } from '@/components/public/hero-visual'
import { CityService } from '@/modules/cities/services/city.service'

export const metadata = {
  title: 'Find Trusted Independent Drivers in Maryland, Baltimore & DC',
  description:
    'Movely connects you with independent professional drivers in your area. Browse profiles, contact directly via phone or WhatsApp, and arrange transportation on your terms — no booking fees.',
  openGraph: {
    title: 'Movely — Connect with Trusted Independent Drivers',
    description:
      'Search, compare, and contact independent drivers directly. No fees, no middleman.',
    type: 'website',
  },
}

const HOMEPAGE_FAQ = [
  {
    question: 'Does Movely book the ride for me?',
    answer:
      'No. Movely is a directory that helps you find drivers. You contact the driver directly via phone or WhatsApp and arrange the trip together.',
  },
  {
    question: 'Does Movely charge booking fees?',
    answer:
      'No. There are no booking fees, commissions, or platform charges. You arrange the ride and pay the driver directly.',
  },
  {
    question: 'Are drivers verified or background-checked?',
    answer:
      'Movely is a discovery platform. We do not perform background checks. Each driver maintains their own profile, and you are responsible for verifying credentials, licenses, and insurance directly with the driver before riding.',
  },
  {
    question: 'How do I contact a driver?',
    answer:
      'Each driver profile includes phone and WhatsApp buttons. Tap them to call or message the driver directly.',
  },
]

export default async function HomePage() {
  const cities = await CityService.getAllActive()
  return (
    <div>
      {/* Hero Section — balanced 2-column layout on lg+ */}
      <section className="relative bg-gradient-to-br from-[#0B1F3D] via-[#0B1F3D] to-[#001F3F] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Text column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Serving Maryland, Baltimore & DC
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
                Find your next driver.<br />
                <span className="text-amber-400">No fees, no middleman.</span>
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-2xl">
                Movely is a directory of independent professional drivers. Browse profiles, compare, and contact drivers directly to arrange your ride.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/drivers"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 text-[#0B1F3D] rounded-lg font-bold text-sm hover:bg-amber-300 transition-colors"
                >
                  Find Drivers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/for-drivers"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  Join as Driver
                </Link>
              </div>
            </div>

            {/* Visual column — hidden on small screens, structural slot for future enhancements */}
            <div className="hidden lg:block lg:col-span-5">
              <HeroVisual cityNames={cities.map((c) => c.name)} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured drivers — auto-hides if none */}
      <FeaturedDriversSection />

      {/* Why Movely */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Why Movely</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              A simpler way to connect
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              No apps installed on the customer side. No fees taken from the driver side. Just a clean directory that puts you in touch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#0B1F3D] hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Search & Discover</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Browse detailed profiles with vehicle info, service areas, and languages. Find the right driver for your needs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#0B1F3D] hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Directly</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Phone or WhatsApp the driver directly. Discuss the route, ask questions, and arrange pickup on your terms.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#0B1F3D] hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Transparent Profiles</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Vehicle type, service areas, languages — all upfront. Verify credentials with the driver before riding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Three steps. Done.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="w-9 h-9 rounded-lg bg-[#0B1F3D] text-amber-400 font-bold flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Browse drivers</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Filter by your city. Open profiles to see vehicle, service area, and languages.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="w-9 h-9 rounded-lg bg-[#0B1F3D] text-amber-400 font-bold flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Contact directly</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Call or WhatsApp the driver. Discuss route, timing, and pricing.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="w-9 h-9 rounded-lg bg-[#0B1F3D] text-amber-400 font-bold flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Arrange your ride</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Confirm details with the driver. No fees, no middleman.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3D] hover:underline"
            >
              Learn more about how Movely works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Service Areas</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Available across the Maryland & DC area
            </h2>
            <p className="text-base text-gray-600">
              Browse drivers in these cities.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/drivers?city=${encodeURIComponent(city.name)}`}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-[#0B1F3D] hover:text-white text-sm font-medium text-gray-700 transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* For Drivers strip */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">For Drivers</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Independent driver?<br />Get found by customers.
              </h2>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                List your profile on Movely and connect with customers who are actively looking for transportation in your area. You keep 100% of what you earn — no commissions, no booking fees.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Professional public profile with photos and service info',
                  'Direct customer leads via WhatsApp and phone',
                  'You control your pricing, schedule, and bookings',
                  'No commissions, no platform fees',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0B1F3D] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-5 py-3 bg-[#0B1F3D] text-white rounded-lg font-semibold text-sm hover:bg-[#001F3F] transition-colors"
                >
                  Create Your Profile
                </Link>
                <Link
                  href="/for-drivers"
                  className="px-5 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-2xl font-bold text-[#0B1F3D]">0%</p>
                  <p className="text-xs text-gray-600 mt-1">Platform commission</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-2xl font-bold text-[#0B1F3D]">100%</p>
                  <p className="text-xs text-gray-600 mt-1">Of earnings to you</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-2xl font-bold text-[#0B1F3D]">Free</p>
                  <p className="text-xs text-gray-600 mt-1">To create your profile</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-2xl font-bold text-[#0B1F3D]">Direct</p>
                  <p className="text-xs text-gray-600 mt-1">Customer contact</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Common Questions</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Quick answers
            </h2>
          </div>
          <FAQ items={HOMEPAGE_FAQ} />
          <div className="text-center mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3D] hover:underline"
            >
              Have another question? Contact us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#0B1F3D] to-[#001F3F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find your driver today
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
            Search the directory and contact independent drivers directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/drivers"
              className="px-6 py-3.5 bg-amber-400 text-[#0B1F3D] rounded-lg font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              Browse Drivers
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
