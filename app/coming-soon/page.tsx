import { redirect } from 'next/navigation'
import { ComingSoonForm } from '@/components/public/coming-soon-form'

export const metadata = {
  title: 'Movely — Coming Soon',
  description:
    'Movely is launching soon. A directory of independent professional drivers in Maryland, Baltimore & DC. Browse profiles and contact drivers directly — no fees, no middleman. Join the waitlist to be notified at launch.',
  openGraph: {
    title: 'Movely — Coming Soon',
    description:
      'A directory of independent professional drivers. No fees, no middleman. Launching soon — join the waitlist.',
    type: 'website',
  },
}

// Render on demand so the coming_soon guard reflects the runtime
// environment (not the build-time one). Vercel sets
// NEXT_PUBLIC_SITE_STATUS per environment, and we want the redirect/redirect
// decision to match the environment the request is actually served from.
export const dynamic = 'force-dynamic'

const SUPPORT_EMAIL = 'hello@movelygo.com'

/**
 * Standalone Coming Soon page (outside the (public) route group, so it has
 * no Navbar/Footer). During `NEXT_PUBLIC_SITE_STATUS=coming_soon`, middleware
 * rewrites `/` to this route. When the site goes live, this page redirects to
 * `/` so the route is never left orphaned post-launch.
 */
export default function ComingSoonPage() {
  if (process.env.NEXT_PUBLIC_SITE_STATUS !== 'coming_soon') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3D] via-[#0B1F3D] to-[#001F3F] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Brand mark */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Movely</span>
          </div>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-5">
            A better way to find{' '}
            <span className="text-amber-400">trusted local drivers.</span>
          </h1>

          {/* Value prop */}
          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl mx-auto mb-10">
            Movely connects you with independent professional drivers across Maryland, Baltimore &amp; DC.
            Browse profiles and contact drivers directly — no booking fees, no middleman.
          </p>

          {/* Email capture */}
          <div className="flex justify-center mb-10">
            <ComingSoonForm />
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No booking fees
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Direct contact
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Independent drivers
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Movely. All rights reserved.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-white/70 hover:text-amber-400 transition-colors">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </footer>
    </div>
  )
}
