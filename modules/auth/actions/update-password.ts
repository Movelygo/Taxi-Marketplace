'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('session') || msg.includes('token') || msg.includes('expired') || msg.includes('invalid')) {
      return { error: 'This reset link is invalid or has expired. Please request a new one.' }
    }
    return { error: error.message }
  }

  redirect('/login?message=password_updated')
}
