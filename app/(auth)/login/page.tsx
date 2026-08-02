import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Sign In | Movely',
  description: 'Sign in to your Movely account'
}

interface LoginPageProps {
  searchParams: Promise<{ 
    message?: string
    error?: string
    redirect?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  
  return (
    <div className="w-full space-y-4">
      {params.message === 'password_updated' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Password updated!</p>
              <p className="text-sm text-green-700 mt-1">Your new password has been saved. You can now sign in.</p>
            </div>
          </div>
        </div>
      )}

      {params.message === 'confirmed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Email confirmed!</p>
              <p className="text-sm text-green-700 mt-1">Your email has been confirmed. You can now sign in.</p>
            </div>
          </div>
        </div>
      )}
      
      {params.error === 'confirmation_failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">Confirmation failed</p>
              <p className="text-sm text-red-700 mt-1">Email confirmation failed. Please try again or contact support.</p>
            </div>
          </div>
        </div>
      )}
      
      <LoginForm redirectTo={params.redirect} />
    </div>
  )
}
