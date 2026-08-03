export function getRuntimeDatabaseUrl(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) return undefined

  try {
    const url = new URL(databaseUrl)
    if (!url.hostname.endsWith('.pooler.supabase.com')) return databaseUrl

    if (url.port === '5432') url.port = '6543'
    if (url.port === '6543') url.searchParams.set('pgbouncer', 'true')
    if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1')
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20')

    return url.toString()
  } catch {
    return databaseUrl
  }
}
