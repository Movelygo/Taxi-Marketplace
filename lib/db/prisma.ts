import { PrismaClient } from '@prisma/client'
import { getRuntimeDatabaseUrl } from './database-url'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getRuntimeDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Always cache the singleton — even in production.
// In Vercel serverless, each function invocation reuses the same container,
// so this prevents creating a new PrismaClient (and a new DB connection)
// on every request. Without this, the Supabase connection pool (pool_size: 15)
// gets exhausted under concurrent load.
globalForPrisma.prisma = prisma
