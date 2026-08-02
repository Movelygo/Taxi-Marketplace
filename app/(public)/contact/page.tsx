import Link from 'next/link'
import { ContactForm } from '@/components/public/contact-form'

export const metadata = {
  title: 'Contact Movely — Get in Touch',
  description:
    'Get in touch with the Movely team. Email us with questions, support requests, or feedback.',
  openGraph: {
    title: 'Contact Movely',
    description: 'Get in touch with the Movely team.',
    type: 'website',
  },
}

const SUPPORT_EMAIL = 'hello@movelygo.com'

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1F3D] via-[#0B1F3D] to-[#001F3F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full mb-6">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Contact
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              We&apos;d love to hear from you.
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
              Questions, feedback, or support requests — send us a message and we&apos;ll get back to you within 1–2 business days.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white">
              <div className="w-11 h-11 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Email us</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                The best way to reach us. We read every message and reply within 1–2 business days.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3D] hover:underline"
              >
                {SUPPORT_EMAIL}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* Help center */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white">
              <div className="w-11 h-11 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Common questions</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Check the FAQs on our homepage and the For Drivers page — most questions are answered there.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3D] hover:underline"
              >
                View FAQs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Contact Form — real, persisted submissions */}
          <ContactForm />
        </div>
      </section>

      {/* Support sections */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0B1F3D] uppercase tracking-widest mb-3">Get help</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What can we help with?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Driver support',
                description: 'Profile help, approval status, account questions.',
                tag: 'For drivers',
              },
              {
                title: 'Finding a driver',
                description: 'Trouble browsing the directory or contacting a driver.',
                tag: 'For customers',
              },
              {
                title: 'Report an issue',
                description: 'Report a misleading profile, bug, or technical issue.',
                tag: 'General',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-gray-200 bg-white">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#0B1F3D]/5 text-[10px] font-semibold text-[#0B1F3D] uppercase tracking-wider mb-3">
                  {item.tag}
                </span>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-600 mt-10">
            For any of the above, email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#0B1F3D] hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
