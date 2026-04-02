import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Supabase webhook handler - to be implemented in Phase 1
  // This will sync auth.users with our users table
  return NextResponse.json({ message: 'Webhook handler - Phase 1' })
}
