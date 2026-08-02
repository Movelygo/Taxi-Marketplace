import { PrismaClient } from '@prisma/client'
import { CONFIG_KEYS, DEFAULT_CONFIG } from '../modules/system-config/types'

const prisma = new PrismaClient()

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
