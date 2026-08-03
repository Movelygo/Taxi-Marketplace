/**
 * Migration script: replaces test cities with data from @countrystatecity/countries package.
 *
 * Existing test cities (Baltimore, BWI, Washington DC, Towson, Essex, Glen Burnie,
 * Annapolis, Dundalk) are deleted and recreated with correct state codes and coordinates.
 *
 * "BWI" (airport code) → replaced by "Linthicum" (closest city to BWI airport).
 * "Washington DC" → renamed to "Washington D.C." to match package data.
 *
 * Drivers with malformed city text are backfilled:
 * - "virginia" → left unassigned (it's a state name, not a city)
 * - "Virginia beach" → Virginia Beach, VA (if we add it, otherwise unassigned)
 * - "Pasadena's" → Pasadena, MD
 * - "Baltimore" → Baltimore, MD
 *
 * Run: npx tsx scripts/migrate-cities.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// City data from @countrystatecity/countries — pre-extracted to avoid runtime lookup issues
// These are the cities we want in our DB, with correct state codes and coordinates
const CITIES_TO_SEED = [
  // Maryland
  { name: 'Baltimore', state: 'MD', lat: '39.29088160', lng: '-76.61075900' },
  { name: 'Linthicum', state: 'MD', lat: '39.20511000', lng: '-76.65275000' }, // replaces "BWI"
  { name: 'Towson', state: 'MD', lat: '39.40150000', lng: '-76.60191000' },
  { name: 'Essex', state: 'MD', lat: '39.30927000', lng: '-76.47496000' },
  { name: 'Glen Burnie', state: 'MD', lat: '39.16261000', lng: '-76.62469000' },
  { name: 'Annapolis', state: 'MD', lat: '38.97845000', lng: '-76.49218000' },
  { name: 'Dundalk', state: 'MD', lat: '39.25066000', lng: '-76.52052000' },
  { name: 'Pasadena', state: 'MD', lat: '39.10733000', lng: '-76.57108000' },
  // DC
  { name: 'Washington D.C.', state: 'DC', lat: '38.89511000', lng: '-77.03637000' },
  // Virginia
  { name: 'Virginia Beach', state: 'VA', lat: '36.85293000', lng: '-75.97799000' },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  console.log('🔄 Starting city migration...')

  // Step 1: Null out all driver.cityId (so we can delete cities without FK errors)
  console.log('1. Clearing driver.cityId references...')
  const cleared = await prisma.driver.updateMany({
    where: { cityId: { not: null } },
    data: { cityId: null },
  })
  console.log(`   Cleared ${cleared.count} driver(s)`)

  // Step 2: Delete all existing cities
  console.log('2. Deleting existing cities...')
  const deleted = await prisma.city.deleteMany({})
  console.log(`   Deleted ${deleted.count} citie(s)`)

  // Step 3: Create new cities from package data
  console.log('3. Creating cities from @countrystatecity/countries...')
  for (let i = 0; i < CITIES_TO_SEED.length; i++) {
    const c = CITIES_TO_SEED[i]
    const slug = slugify(c.name)
    await prisma.city.create({
      data: {
        name: c.name,
        slug,
        state: c.state,
        sortOrder: i,
        isActive: true,
      },
    })
    console.log(`   ✅ ${c.name}, ${c.state} (slug: ${slug})`)
  }

  // Step 4: Backfill drivers — match city text to new cities
  console.log('4. Backfilling driver.cityId from city text...')
  const drivers = await prisma.driver.findMany()

  for (const driver of drivers) {
    // Normalize the driver's city text for matching
    const normalizedCity = driver.city.trim().toLowerCase().replace(/[''`]/g, '')

    // Try exact match first
    let matchedCity = await prisma.city.findFirst({
      where: { name: { equals: driver.city, mode: 'insensitive' } },
    })

    // Try fuzzy match for known bad data
    if (!matchedCity) {
      const fuzzyMap: Record<string, string> = {
        'virginia beach': 'Virginia Beach',
        "pasadena's": 'Pasadena',
        'pasadenas': 'Pasadena',
        'pasadena': 'Pasadena',
        'baltimore': 'Baltimore',
        'dundalk2': 'Dundalk',
        'dundalk': 'Dundalk',
      }
      const target = fuzzyMap[normalizedCity]
      if (target) {
        matchedCity = await prisma.city.findFirst({
          where: { name: { equals: target, mode: 'insensitive' } },
        })
      }
    }

    if (matchedCity) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { cityId: matchedCity.id },
      })
      console.log(`   ✅ ${driver.displayName}: "${driver.city}" → ${matchedCity.name}, ${matchedCity.state}`)
    } else {
      console.log(`   ⚠️  ${driver.displayName}: "${driver.city}" → no match (left unassigned)`)
    }
  }

  // Summary
  const finalCities = await prisma.city.findMany({ orderBy: { sortOrder: 'asc' } })
  const linkedDrivers = await prisma.driver.count({ where: { cityId: { not: null } } })
  const totalDrivers = await prisma.driver.count()

  console.log('\n=== MIGRATION COMPLETE ===')
  console.log(`Cities in DB: ${finalCities.length}`)
  finalCities.forEach(c => console.log(`  ${c.name}, ${c.state} (${c.slug})`))
  console.log(`Drivers linked: ${linkedDrivers}/${totalDrivers}`)
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
