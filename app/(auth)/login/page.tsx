import { LoginForm } from '@/components/auth/login-form'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
    <div className="w-full max-w-md space-y-4">
      {params.message === 'confirmed' && (
        <Alert>
          <AlertDescription>
            Your email has been confirmed! You can now sign in.
          </AlertDescription>
        </Alert>
      )}
      
      {params.error === 'confirmation_failed' && (
        <Alert variant="destructive">
          <AlertDescription>
            Email confirmation failed. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}
      
      <LoginForm redirectTo={params.redirect} />
    </div>
  )
}
