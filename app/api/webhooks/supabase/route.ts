import { NextResponse } from 'next/server'

export async function POST(_request: Request) {
  // Supabase webhook handler - placeholder
  // User sync is handled by database trigger, not webhook
  return NextResponse.json({ message: 'Webhook handler - not needed for Phase 1' })
}
