import { headers } from 'next/headers'
import { createHash } from 'crypto'

/**
 * Get a SHA-256 hash of the client IP from Next.js headers.
 * Returns 'unknown' if IP cannot be determined (e.g., local dev).
 *
 * Used by reviews, reports, leads, and profile views for anti-fraud
 * and verified-contact correlation — without storing raw IPs.
 */
export async function getClientIpHash(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')

  const ip = forwarded?.split(',')[0].trim() || realIp || '127.0.0.1'
  return createHash('sha256').update(ip).digest('hex')
}
