'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register } from '@/modules/auth/actions/register'
import Link from 'next/link'
import { AuthCard } from './auth-card'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="w-full bg-[#0B1F3D] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#001F3F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      disabled={pending}
    >
      {pending ? 'Creating account...' : 'Create account'}
    </button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined)

  return (
    <AuthCard
      eyebrow="Driver onboarding"
      title="Join as a driver"
      subtitle="List your services on Movely and connect with customers — no fees, no commissions."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#0B1F3D] hover:underline">
            Sign in
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
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none text-sm"
            required
          />
          {state?.error && typeof state.error === 'object' && 'email' in state.error && (
            <p className="text-xs text-red-600">{state.error.email?.[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none text-sm"
            required
          />
          {state?.error && typeof state.error === 'object' && 'password' in state.error ? (
            <p className="text-xs text-red-600">{state.error.password?.[0]}</p>
          ) : (
            <p className="text-xs text-gray-500">Minimum 8 characters.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none text-sm"
            required
          />
          {state?.error && typeof state.error === 'object' && 'confirmPassword' in state.error && (
            <p className="text-xs text-red-600">{state.error.confirmPassword?.[0]}</p>
          )}
        </div>

        {typeof state?.error === 'string' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <SubmitButton />

        <p className="text-xs text-gray-500 text-center pt-1">
          By creating an account you agree to the{' '}
          <Link href="/terms" className="font-semibold text-[#0B1F3D] hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-semibold text-[#0B1F3D] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  )
}
