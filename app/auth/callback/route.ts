import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/email-sender'
import { buildWelcomeEmailHtml, buildWelcomeEmailText } from '@/lib/email/templates/welcome-email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const supabase = await createClient()

  // Handle PKCE flow (code parameter — used by password reset emails)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // Handle magic link / OTP flow (token_hash + type parameters)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Send welcome email on signup confirmation
      if (type === 'signup' && data.user?.email) {
        try {
          await sendEmail({
            to: data.user.email,
            subject: 'Welcome to Movely — let\'s get started',
            html: buildWelcomeEmailHtml({ email: data.user.email }),
            text: buildWelcomeEmailText({ email: data.user.email }),
          })
        } catch (emailError) {
          console.error('[auth/callback] welcome email failed:', emailError)
        }
      }

      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', origin))
      }
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=confirmation_failed', origin)
  )
}
