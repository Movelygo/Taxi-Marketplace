'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { subscribe, type SubscribeState } from '@/modules/waitlist/actions/subscribe'

const SUPPORT_EMAIL = 'hello@movelygo.com'
const INITIAL_STATE: SubscribeState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto shrink-0 px-6 py-3.5 bg-amber-400 text-[#0B1F3D] rounded-lg font-bold text-sm hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Joining...
        </>
      ) : (
        <>
          Notify me
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </>
      )}
    </button>
  )
}

export function ComingSoonForm() {
  const [state, formAction] = useActionState(subscribe, INITIAL_STATE)

  if (state.status === 'success') {
    return (
      <div className="w-full max-w-md p-5 rounded-2xl border border-amber-400/30 bg-amber-400/10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">You&apos;re on the list</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              We&apos;ll email you the moment Movely goes live. Talk soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined
  const generalError =
    state.status === 'error' && !state.fieldErrors ? state.message : undefined

  return (
    <div className="w-full max-w-md">
      <form action={formAction} className="space-y-3" noValidate>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full px-4 py-3.5 bg-white/10 border rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                fieldErrors?.email ? 'border-red-400/60' : 'border-white/20'
              }`}
            />
          </div>
          <SubmitButton />
        </div>

        {fieldErrors?.email && (
          <p className="text-xs text-red-300">{fieldErrors.email}</p>
        )}

        {generalError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/30">
            <p className="text-sm text-red-200">{generalError}</p>
          </div>
        )}

        <p className="text-xs text-white/50">
          Prefer email? Reach us at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-amber-400 hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </form>
    </div>
  )
}
