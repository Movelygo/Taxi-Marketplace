import Link from 'next/link'

export type CalloutTone = 'info' | 'pending' | 'action' | 'success'

interface OnboardingCalloutProps {
  tone: CalloutTone
  title: string
  description: string
  cta?: {
    label: string
    href: string
  }
  /**
   * Optional small label rendered above the title (e.g. "Next step").
   */
  eyebrow?: string
}

const TONE_STYLES: Record<CalloutTone, {
  container: string
  iconBg: string
  iconColor: string
  ctaBg: string
  ctaText: string
  eyebrow: string
}> = {
  info: {
    container: 'bg-white border-gray-200',
    iconBg: 'bg-[#0B1F3D]/5',
    iconColor: 'text-[#0B1F3D]',
    ctaBg: 'bg-[#0B1F3D] hover:bg-[#001F3F]',
    ctaText: 'text-white',
    eyebrow: 'text-gray-500',
  },
  pending: {
    container: 'bg-amber-50/60 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    ctaBg: 'bg-white border border-amber-200 hover:bg-amber-100',
    ctaText: 'text-amber-800',
    eyebrow: 'text-amber-700',
  },
  action: {
    container: 'bg-[#0B1F3D] border-[#0B1F3D] text-white',
    iconBg: 'bg-amber-400/15',
    iconColor: 'text-amber-400',
    ctaBg: 'bg-amber-400 hover:bg-amber-300',
    ctaText: 'text-[#0B1F3D]',
    eyebrow: 'text-amber-400',
  },
  success: {
    container: 'bg-green-50/60 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    ctaBg: 'bg-white border border-green-200 hover:bg-green-100',
    ctaText: 'text-green-800',
    eyebrow: 'text-green-700',
  },
}

const TONE_ICONS: Record<CalloutTone, React.ReactNode> = {
  info: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  pending: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  action: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  ),
  success: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
}

export function OnboardingCallout({ tone, title, description, cta, eyebrow }: OnboardingCalloutProps) {
  const styles = TONE_STYLES[tone]
  const isDark = tone === 'action'

  return (
    <div className={`rounded-2xl border p-6 ${styles.container}`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
          <svg className={`w-5 h-5 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {TONE_ICONS[tone]}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${styles.eyebrow}`}>
              {eyebrow}
            </p>
          )}
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
            {description}
          </p>
          {cta && (
            <div className="mt-4">
              <Link
                href={cta.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${styles.ctaBg} ${styles.ctaText}`}
              >
                {cta.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
