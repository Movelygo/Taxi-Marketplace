'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitInquiry, type SubmitInquiryState } from '@/modules/contact/actions/submit-inquiry'
import Link from 'next/link'

const SUPPORT_EMAIL = 'hello@movelygo.com'
const INITIAL_STATE: SubmitInquiryState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3D] text-white rounded-lg font-semibold text-sm hover:bg-[#001F3F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sending...
        </>
      ) : (
        <>
          Send message
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </>
      )}
    </button>
  )
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitInquiry, INITIAL_STATE)

  if (state.status === 'success') {
    return (
      <div className="p-6 sm:p-8 rounded-2xl border border-green-200 bg-green-50">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-900 mb-1">Message received</h2>
            <p className="text-sm text-green-800">
              Thanks for reaching out. We&apos;ll get back to you within 1–2 business days at the email you provided.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-900 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined
  const generalError =
    state.status === 'error' && !state.fieldErrors ? state.message : undefined

  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Send us a message</h2>
        <p className="text-sm text-gray-600">
          Fill out the form below and we&apos;ll respond within 1–2 business days.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            label="Your name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            error={fieldErrors?.name}
            required
            autoComplete="name"
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            error={fieldErrors?.email}
            required
            autoComplete="email"
          />
        </div>

        <FormField
          label="Subject"
          name="subject"
          type="text"
          placeholder="What can we help with?"
          error={fieldErrors?.subject}
          required
        />

        <div className="space-y-1.5">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Tell us a bit more..."
            className={`w-full px-4 py-3 bg-white border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent ${
              fieldErrors?.message ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={2000}
          />
          {fieldErrors?.message && (
            <p className="text-xs text-red-600">{fieldErrors.message}</p>
          )}
        </div>

        {generalError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{generalError}</p>
          </div>
        )}

        {state.status === 'error' && state.fieldErrors && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">{state.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-xs text-gray-500">
            Prefer email?{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#0B1F3D] hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}

interface FormFieldProps {
  label: string
  name: string
  type: 'text' | 'email'
  placeholder?: string
  error?: string
  required?: boolean
  autoComplete?: string
}

function FormField({ label, name, type, placeholder, error, required, autoComplete }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
