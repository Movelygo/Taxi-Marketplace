'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from '@/modules/auth/actions/login'
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
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(login, undefined)

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your driver profile and see your customer leads."
      footer={
        <>
          New to Movely?{' '}
          <Link href="/register" className="font-semibold text-[#0B1F3D] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-[#0B1F3D] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none text-sm"
            required
          />
          {state?.error && typeof state.error === 'object' && 'password' in state.error && (
            <p className="text-xs text-red-600">{state.error.password?.[0]}</p>
          )}
        </div>

        {typeof state?.error === 'string' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <SubmitButton />
      </form>
    </AuthCard>
  )
}
