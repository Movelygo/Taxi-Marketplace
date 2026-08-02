import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

/**
 * Dynamic robots.txt.
 *
 * - movelygo.com (Production): allows all crawlers, points to sitemap.
 * - staging.movelygo.com / preview URLs: disallows everything.
 *
 * Detection is based on the host header so it works correctly
 * regardless of which Vercel environment serves the request.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers()
  const host = headerList.get('host') || ''

  const isProduction =
    host === 'movelygo.com' ||
    host === 'www.movelygo.com'

  if (isProduction) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: 'https://movelygo.com/sitemap.xml',
    }
  }

  // Staging, preview deployments, localhost — block all crawlers
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
