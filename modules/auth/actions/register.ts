'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { registerSchema } from '../validations/auth.schema'

type RegisterState = {
  error?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  } | string
} | undefined

export async function register(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string
  }
  
  const validated = registerSchema.safeParse(rawData)
  
  if (!validated.success) {
    return { 
      error: validated.error.flatten().fieldErrors 
    }
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  
  if (error) {
    return { error: error.message }
  }
  
  if (data.session) {
    redirect('/dashboard')
  } else {
    redirect('/check-email')
  }
}
