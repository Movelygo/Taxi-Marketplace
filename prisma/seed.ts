import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user (ID must be created in Supabase Auth first)
  // This is just a placeholder - actual admin must be created via Supabase
  console.log('ℹ️  Note: Admin user must be created in Supabase Auth first')
  console.log('ℹ️  Then run this seed with the actual UUID')

  // Example: Uncomment and update with actual Supabase auth user ID
  /*
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taxilink.com' },
    update: {},
    create: {
      id: 'YOUR_SUPABASE_AUTH_USER_UUID_HERE',
      email: 'admin@taxilink.com',
      role: UserRole.ADMIN,
    },
  })
  console.log('✅ Admin user created:', adminUser.email)
  */

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
