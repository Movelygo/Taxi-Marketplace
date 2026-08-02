'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updatePassword } from '@/modules/auth/actions/update-password'
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
      {pending ? 'Updating...' : 'Set new password'}
    </button>
  )
}

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(updatePassword, undefined)

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a secure password for your account."
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
          />
          <p className="text-xs text-gray-500">Minimum 8 characters.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
          />
        </div>

        {state?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{state.error}</p>
            {state.error.includes('expired') || state.error.includes('invalid') ? (
              <Link href="/forgot-password" className="text-xs font-semibold text-red-800 underline mt-1 inline-block">
                Request a new reset link
              </Link>
            ) : null}
          </div>
        )}

        <SubmitButton />
      </form>
    </AuthCard>
  )
}
