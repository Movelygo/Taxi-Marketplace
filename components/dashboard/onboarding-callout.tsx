import Link from 'next/link'
import { Info, Clock, CheckCircle2, ChevronRight, Zap } from '@/components/ui/icons'

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
  ctaClass: string
  eyebrow: string
  icon: any
}> = {
  info: {
    container: 'bg-white border-gray-100 shadow-sm',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ctaClass: 'bg-[#0B1F3D] text-white hover:bg-[#001F3F]',
    eyebrow: 'text-blue-600',
    icon: Info,
  },
  pending: {
    container: 'bg-amber-50/50 border-amber-100 shadow-sm',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    ctaClass: 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-100',
    eyebrow: 'text-amber-700',
    icon: Clock,
  },
  action: {
    container: 'bg-[#0B1F3D] border-[#0B1F3D] text-white shadow-xl',
    iconBg: 'bg-amber-400/20',
    iconColor: 'text-amber-400',
    ctaClass: 'bg-amber-400 text-[#0B1F3D] hover:bg-amber-300',
    eyebrow: 'text-amber-400',
    icon: Zap,
  },
  success: {
    container: 'bg-green-50/50 border-green-100 shadow-sm',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    ctaClass: 'bg-white border border-green-200 text-green-800 hover:bg-green-100',
    eyebrow: 'text-green-700',
    icon: CheckCircle2,
  },
}

export function OnboardingCallout({ tone, title, description, cta, eyebrow }: OnboardingCalloutProps) {
  const styles = TONE_STYLES[tone]
  const Icon = styles.icon
  const isDark = tone === 'action'

  return (
    <div className={`rounded-[32px] border p-8 ${styles.container} transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className={`w-7 h-7 ${styles.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${styles.eyebrow}`}>
              {eyebrow}
            </p>
          )}
          <h3 className={`text-xl font-black mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-base font-medium opacity-80 leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>

        {cta && (
          <div className="flex-shrink-0">
            <Link
              href={cta.href}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg ${styles.ctaClass}`}
            >
              {cta.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
