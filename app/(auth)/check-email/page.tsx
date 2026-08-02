import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'

export const metadata = {
  title: 'Check Your Email | Movely',
  description: 'Confirm your email address to activate your account',
}

export default function CheckEmailPage() {
  return (
    <AuthCard
      title="Check your email"
      subtitle="We sent you a confirmation link. Click it to activate your account, then come back here to sign in."
      footer={
        <>
          Didn&apos;t receive it?{' '}
          <Link href="/register" className="font-semibold text-[#0B1F3D] hover:underline">
            Try registering again
          </Link>
        </>
      }
    >
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3 mb-4">
        <svg className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-blue-900">
          Check your inbox — and your spam folder, just in case. The link expires after 1 hour.
        </p>
      </div>

      <Link
        href="/login"
        className="block w-full py-3 px-4 bg-[#0B1F3D] hover:bg-[#001F3F] text-white font-semibold rounded-lg transition-colors text-sm text-center"
      >
        Return to sign in
      </Link>
    </AuthCard>
  )
}
