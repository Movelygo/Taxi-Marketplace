import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDriverSearchWhere } from '../modules/drivers/repositories/driver.repository'
import { driverSearchQuerySchema } from '../modules/drivers/validations/driver-search.schema'

test('parses and normalizes valid directory search parameters', () => {
  const result = driverSearchQuerySchema.parse({
    q: '  airport  ',
    city: 'Baltimore',
    amenities: ['ac', 'wifi'],
    paymentMethods: 'cash',
    minCapacity: '4',
    availabilityStatus: 'AVAILABLE',
    sort: 'newest',
    page: '2',
  })

  assert.deepEqual(result, {
    q: 'airport',
    city: 'Baltimore',
    amenities: ['ac', 'wifi'],
    paymentMethods: ['cash'],
    minCapacity: 4,
    availabilityStatus: 'AVAILABLE',
    sort: 'newest',
    page: 2,
  })
})

test('rejects invalid or abusive directory search parameters', () => {
  assert.equal(driverSearchQuerySchema.safeParse({ availabilityStatus: 'INVALID' }).success, false)
  assert.equal(driverSearchQuerySchema.safeParse({ page: '0' }).success, false)
  assert.equal(driverSearchQuerySchema.safeParse({ page: 'not-a-number' }).success, false)
  assert.equal(driverSearchQuerySchema.safeParse({ q: 'x'.repeat(101) }).success, false)
  assert.equal(driverSearchQuerySchema.safeParse({ amenities: Array(21).fill('ac') }).success, false)
})

test('combines text and city filters with AND instead of broadening results', () => {
  const where = buildDriverSearchWhere({ q: 'airport', city: 'Baltimore' })

  assert.equal(where.status, 'APPROVED')
  assert.equal(where.OR, undefined)
  assert.ok(Array.isArray(where.AND))
  assert.equal(where.AND.length, 2)
  assert.ok('OR' in where.AND[0])
  assert.ok('OR' in where.AND[1])
})

test('adds structured filters to the approved-driver query', () => {
  const where = buildDriverSearchWhere({
    vehicleType: 'Sedan',
    amenities: ['ac', 'wifi'],
    paymentMethods: ['cash'],
    minCapacity: 4,
    availabilityStatus: 'AVAILABLE',
  })

  assert.deepEqual(where.vehicleType, { equals: 'Sedan', mode: 'insensitive' })
  assert.deepEqual(where.amenities, { hasSome: ['ac', 'wifi'] })
  assert.deepEqual(where.paymentMethods, { hasSome: ['cash'] })
  assert.deepEqual(where.passengerCapacity, { gte: 4 })
  assert.equal(where.availabilityStatus, 'AVAILABLE')
})
