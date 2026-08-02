import type { ReactNode } from 'react'

interface LegalPageProps {
  title: string
  /** Optional subtitle / tagline shown under the title */
  subtitle?: string
  /** ISO date string (YYYY-MM-DD) when this page was last updated */
  lastUpdated: string
  /**
   * If true, displays a prominent "Draft — informational only" banner.
   * Use this for legal pages that haven't been reviewed by counsel yet.
   */
  draft?: boolean
  children: ReactNode
}

export function LegalPage({ title, subtitle, lastUpdated, draft = false, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
          {subtitle && <p className="text-base text-gray-600 max-w-2xl">{subtitle}</p>}
          <p className="text-sm text-gray-500 mt-4">
            Last updated:{' '}
            <time dateTime={lastUpdated}>
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {draft && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-900">Draft — informational only</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                This page is a working draft. It has not been reviewed by counsel and is not a binding legal document. The final version will be published once review is complete.
              </p>
            </div>
          </div>
        )}

        <article className="prose-legal bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {children}
        </article>
      </div>
    </div>
  )
}

/**
 * Section heading for use inside a LegalPage article.
 */
export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-8 last:mb-0">
      <h2 className="text-xl font-bold text-gray-900 mb-3 scroll-mt-24">{title}</h2>
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  )
}
