'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema } from '../validations/auth.schema'

type LoginState = {
  error?: {
    email?: string[]
    password?: string[]
  } | string
} | undefined

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }
  
  const validated = loginSchema.safeParse(rawData)
  
  if (!validated.success) {
    return { 
      error: validated.error.flatten().fieldErrors 
    }
  }
  
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password
  })
  
  if (error) {
    return { error: error.message }
  }
  
  const redirectTo = formData.get('redirectTo') as string | null
  redirect(redirectTo || '/dashboard')
}
