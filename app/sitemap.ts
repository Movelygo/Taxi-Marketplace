import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

/**
 * Dynamic sitemap.xml.
 *
 * Only generated for movelygo.com (Production).
 * For staging/preview, returns an empty sitemap so no pages get indexed.
 *
 * Lists the public pages that should be discoverable by search engines.
 * Dynamic driver profiles are not included here because they require
 * a DB query and most drivers are not approved yet. They will be added
 * in Phase H (SEO + launch) once the directory is populated.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers()
  const host = headerList.get('host') || ''

  const isProduction =
    host === 'movelygo.com' ||
    host === 'www.movelygo.com'

  if (!isProduction) {
    return []
  }

  const base = 'https://movelygo.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/drivers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/for-drivers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/driver-guidelines`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  return staticPages
}
