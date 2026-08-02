import Link from 'next/link'
import { FAQ } from '@/components/public/faq'

export const metadata = {
  title: 'For Drivers — List Your Service on Movely',
  description:
    'Independent driver in Maryland, Baltimore, or DC? Join Movely to get found by customers actively looking for transportation. No commissions, no fees.',
  openGraph: {
    title: 'For Drivers — Join Movely',
    description:
      'Connect with customers in your area. Keep 100% of your earnings.',
    type: 'website',
  },
}

const DRIVER_FAQ = [
  {
    question: 'Does Movely take a commission?',
    answer:
      'No. Movely does not take any percentage of your earnings. You arrange rides directly with customers and keep 100% of what you charge.',
  },
  {
    question: 'How much does it cost to list?',
    answer:
      'Creating your profile is free during early access. We may introduce optional paid features in the future (such as featured placement), but a basic profile will always be free.',
  },
  {
    question: 'How do customers contact me?',
    answer:
      'Your public profile shows your phone number and WhatsApp. Customers tap to call or message you directly. You handle the booking, route, and pricing yourself.',
  },
  {
    question: 'Do I need a special license?',
    answer:
      'Movely does not verify licenses or insurance. You are responsible for operating legally in your area — including any required local permits, commercial driver licensing, and insurance.',
  },
  {
    question: 'How long does approval take?',
    answer:
      'After you submit your profile, our team manually reviews it before it goes live in the public directory. This typically takes 1–2 business days during early access.',
  },
]

const BENEFITS = [
  {
    title: 'Public profile that converts',
    description:
      'Photos, vehicle info, languages, service areas — everything a customer needs to choose you over a generic ride app.',
    icon: 'profile',
  },
  {
    title: 'WhatsApp + phone leads',
    description:
      'Every profile view can become a direct WhatsApp message or call. No app install required for the customer.',
    icon: 'message',
  },
  {
    title: 'You set your rates',
    description:
      'Movely never quotes a price for you. You discuss pricing directly with each customer based on the trip.',
    icon: 'price',
  },
  {
    title: 'Local SEO discovery',
    description:
      'Each profile is optimized to appear in local searches like "driver in Baltimore" — so customers find you without paying for ads.',
    icon: 'search',
  },
  {
    title: 'Analytics coming soon',
    description:
      'Profile view tracking and lead analytics are in development. You\'ll see exactly how customers find you.',
    icon: 'chart',
  },
  {
    title: 'No commissions, ever',
    description:
      'Movely makes money from optional driver features and local advertising — not from cutting into your fare.',
    icon: 'zero',
  },
]

const ICONS: Record<string, React.ReactNode> = {
  profile: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  ),
  message: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  ),
  price: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  search: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  ),
  chart: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  ),
  zero: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  ),
}

export default function ForDriversPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1F3D] via-[#0B1F3D] to-[#001F3F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full mb-6">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                For Independent Drivers
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              Get found by customers.<br />
              <span className="text-amber-400">Keep 100% of your earnings.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-2xl">
              Movely is a free directory for independent professional drivers in Maryland, Baltimore, and DC. Customers find you, contact you directly, and arrange the trip on your terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 text-[#0B1F3D] rounded-lg font-bold text-sm hover:bg-amber-300 transition-colors"
              >
                Create Your Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/drivers"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-sm hover:bg-white/20 transition-colors"
              >
                See Example Profiles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for independent drivers
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Movely is not a ride-share app. We don&apos;t dispatch trips, we don&apos;t set prices, and we don&apos;t take a cut. We just help customers find you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#0B1F3D] hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {ICONS[b.icon]}
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How signup works */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From signup to live profile
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Create your account',
                description: 'Sign up with your email. Takes about 30 seconds.',
              },
              {
                step: '02',
                title: 'Build your profile',
                description: 'Add your name, vehicle info, service areas, languages, photo, and contact details (phone + WhatsApp).',
              },
              {
                step: '03',
                title: 'Submit for review',
                description: 'Our team manually reviews each profile before it goes live. This usually takes 1–2 business days during early access.',
              },
              {
                step: '04',
                title: 'Start receiving leads',
                description: 'Once approved, your profile appears in the public directory. Customers can call and WhatsApp you directly.',
              },
            ].map((s) => (
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

          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0B1F3D] text-white rounded-lg font-bold text-sm hover:bg-[#001F3F] transition-colors"
            >
              Get Started — It&apos;s Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Driver FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Honest answers
            </h2>
          </div>
          <FAQ items={DRIVER_FAQ} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#0B1F3D] to-[#001F3F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
            Create your free Movely profile and start connecting with local customers.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 text-[#0B1F3D] rounded-lg font-bold text-sm hover:bg-amber-300 transition-colors"
          >
            Create Your Profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
