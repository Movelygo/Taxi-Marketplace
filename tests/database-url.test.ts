import test from 'node:test'
import assert from 'node:assert/strict'
import { getRuntimeDatabaseUrl } from '../lib/db/database-url'

test('converts Supabase session pooler URLs for serverless Prisma', () => {
  const result = getRuntimeDatabaseUrl(
    'postgresql://user:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  )
  const url = new URL(result!)

  assert.equal(url.port, '6543')
  assert.equal(url.searchParams.get('pgbouncer'), 'true')
  assert.equal(url.searchParams.get('connection_limit'), '1')
  assert.equal(url.searchParams.get('pool_timeout'), '20')
})

test('preserves existing Supabase connection settings', () => {
  const result = getRuntimeDatabaseUrl(
    'postgresql://user:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=3&pool_timeout=30',
  )
  const url = new URL(result!)

  assert.equal(url.port, '6543')
  assert.equal(url.searchParams.get('connection_limit'), '3')
  assert.equal(url.searchParams.get('pool_timeout'), '30')
})

test('does not modify non-Supabase database URLs', () => {
  const input = 'postgresql://user:password@localhost:5432/movely?schema=public'
  assert.equal(getRuntimeDatabaseUrl(input), input)
})
