import { PrismaClient } from '@prisma/client'
import { CONFIG_KEYS, DEFAULT_CONFIG } from '../modules/system-config/types'
import { CITIES } from '../lib/constants/cities'
import { DEFAULT_AMENITIES, DEFAULT_PAYMENT_METHODS } from '../modules/drivers/constants/profile-attributes'

const prisma = new PrismaClient()

// Map CITIES constants to state codes
function getStateForCity(name: string): string {
  if (name === 'Washington DC') return 'DC'
  if (name === 'BWI') return 'MD'
  return 'MD' // all others are Maryland
}

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

  // Seed cities from CITIES constant
  console.log('🏙️  Seeding cities...')
  for (let i = 0; i < CITIES.length; i++) {
    const name = CITIES[i]
    const slug = slugify(name)
    const state = getStateForCity(name)

    const existing = await prisma.city.findUnique({ where: { slug } })
    if (!existing) {
      await prisma.city.create({
        data: { name, slug, state, sortOrder: i, isActive: true },
      })
      console.log(`✅ Created city: ${name} (${state})`)
    } else {
      console.log(`ℹ️  City already exists: ${name}`)
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
