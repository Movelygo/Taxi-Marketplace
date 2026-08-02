import type { ReactNode } from 'react'

interface AuthCardProps {
  /** Concise page title — kept short, no decoration */
  title: string
  /** Optional one-line subtitle */
  subtitle?: string
  /** Optional eyebrow above the title (e.g. "Driver onboarding") */
  eyebrow?: string
  /** Form / body */
  children: ReactNode
  /** Footer slot — typically inter-page links (Sign in / Register / Forgot) */
  footer?: ReactNode
}

/**
 * Shared compact card for all auth pages.
 *
 * Visual direction: replaces the previous oversized navy gradient header
 * with a quiet, premium card. No giant empty space, no decorative
 * blocks — just a clear heading and the form.
 */
export function AuthCard({ title, subtitle, eyebrow, children, footer }: AuthCardProps) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-8 pt-8 pb-2">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F3D]/70 mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>}
        </div>
        <div className="px-6 sm:px-8 py-6">{children}</div>
      </div>

      {footer && (
        <div className="mt-5 text-center text-sm text-gray-600">{footer}</div>
      )}
    </div>
  )
}
