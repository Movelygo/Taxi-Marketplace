'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { forgotPassword } from '@/modules/auth/actions/forgot-password'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 bg-[#0B1F3D] hover:bg-[#001F3F] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
    >
      {pending ? 'Sending...' : 'Send reset link'}
    </button>
  )
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPassword, undefined)

  if (state?.success) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If an account exists for that email, you’ll receive a password reset link shortly. Click the link in the email to set a new password."
        footer={
          <Link href="/login" className="font-semibold text-[#0B1F3D] hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-green-800">
            Reset link sent. Check your inbox (and spam folder, just in case).
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a link to reset it."
      footer={
        <>
          Remember it?{' '}
          <Link href="/login" className="font-semibold text-[#0B1F3D] hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </AuthCard>
  )
}
