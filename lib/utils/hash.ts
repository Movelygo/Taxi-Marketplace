import { createHash } from 'crypto'

/**
 * Generate a SHA-256 hash of an IP address
 * Used for privacy-preserving IP tracking in leads and profile views
 */
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

/**
 * Get client IP from request headers
 * Checks common proxy headers first, falls back to direct connection
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // Fallback - won't work in production but needed for local dev
  return '127.0.0.1'
}
