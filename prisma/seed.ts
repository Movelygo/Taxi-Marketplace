import { PrismaClient } from '@prisma/client'
import { CONFIG_KEYS, DEFAULT_CONFIG } from '../modules/system-config/types'
import { DEFAULT_AMENITIES, DEFAULT_PAYMENT_METHODS } from '../modules/drivers/constants/profile-attributes'

const prisma = new PrismaClient()

// Cities to seed — data sourced from @countrystatecity/countries package
// These are the cities Movely currently serves (Maryland + DC + Virginia area)
const SEED_CITIES = [
  { name: 'Baltimore', state: 'MD', sortOrder: 0 },
  { name: 'Linthicum', state: 'MD', sortOrder: 1 }, // closest city to BWI airport
  { name: 'Towson', state: 'MD', sortOrder: 2 },
  { name: 'Essex', state: 'MD', sortOrder: 3 },
  { name: 'Glen Burnie', state: 'MD', sortOrder: 4 },
  { name: 'Annapolis', state: 'MD', sortOrder: 5 },
  { name: 'Dundalk', state: 'MD', sortOrder: 6 },
  { name: 'Pasadena', state: 'MD', sortOrder: 7 },
  { name: 'Washington D.C.', state: 'DC', sortOrder: 8 },
  { name: 'Virginia Beach', state: 'VA', sortOrder: 9 },
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
  console.log('🌱 Starting database seed...')

  // Seed default system configuration
  for (const key of Object.values(CONFIG_KEYS)) {
    const exists = await prisma.systemConfig.findUnique({ where: { key } })
    if (!exists) {
      await prisma.systemConfig.create({
        data: {
          key,
          value: DEFAULT_CONFIG[key].value,
          description: DEFAULT_CONFIG[key].description,
        },
      })
      console.log(`✅ Created default config: ${key}`)
    } else {
      console.log(`ℹ️  Config already exists: ${key}`)
    }
  }

  // Seed cities from @countrystatecity/countries package data
  console.log('🏙️  Seeding cities...')
  for (const cityData of SEED_CITIES) {
    const slug = slugify(cityData.name)

    const existing = await prisma.city.findUnique({ where: { slug } })
    if (!existing) {
      await prisma.city.create({
        data: {
          name: cityData.name,
          slug,
          state: cityData.state,
          sortOrder: cityData.sortOrder,
          isActive: true,
        },
      })
      console.log(`✅ Created city: ${cityData.name} (${cityData.state})`)
    } else {
      console.log(`ℹ️  City already exists: ${cityData.name}`)
    }
  }

  // Backfill: link existing drivers to cities by matching city text
  console.log('🔗 Backfilling driver.cityId from city text...')
  const drivers = await prisma.driver.findMany({ where: { cityId: null } })
  for (const driver of drivers) {
    const city = await prisma.city.findFirst({
      where: { name: { equals: driver.city, mode: 'insensitive' } },
    })
    if (city) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { cityId: city.id },
      })
      console.log(`✅ Linked driver ${driver.displayName} → ${city.name}`)
    } else {
      console.log(`⚠️  Driver ${driver.displayName} has city "${driver.city}" with no match`)
    }
  }

  // Seed profile attributes (amenities + payment methods)
  console.log('🏷️  Seeding profile attributes...')
  const allAttrs = [
    ...DEFAULT_AMENITIES.map((a, i) => ({ ...a, category: 'AMENITY' as const, sortOrder: i })),
    ...DEFAULT_PAYMENT_METHODS.map((p, i) => ({ ...p, category: 'PAYMENT_METHOD' as const, sortOrder: i })),
  ]
  for (const attr of allAttrs) {
    const existing = await prisma.profileAttribute.findUnique({ where: { key: attr.key } })
    if (!existing) {
      await prisma.profileAttribute.create({
        data: {
          key: attr.key,
          label: attr.label,
          category: attr.category,
          sortOrder: attr.sortOrder,
          isActive: true,
        },
      })
      console.log(`✅ Created ${attr.category.toLowerCase()}: ${attr.label}`)
    } else {
      console.log(`ℹ️  ${attr.category.toLowerCase()} already exists: ${attr.label}`)
    }
  }

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
