import { PrismaClient } from '@prisma/client'
import { CONFIG_KEYS, DEFAULT_CONFIG } from '../modules/system-config/types'
import { DEFAULT_AMENITIES, DEFAULT_PAYMENT_METHODS } from '../modules/drivers/constants/profile-attributes'

const prisma = new PrismaClient()

// Check for --with-test-data flag
const withTestData = process.argv.includes('--with-test-data')
// Check for --cleanup-test-data flag
const cleanupTestData = process.argv.includes('--cleanup-test-data')

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

  // Test data seeding (only with --with-test-data flag)
  if (withTestData) {
    await seedTestData()
  }

  // Test data cleanup (only with --cleanup-test-data flag)
  if (cleanupTestData) {
    await cleanupTestDataFn()
  }
}

// ─── Test Data Seeding ───────────────────────────────────────────────

const TEST_EMAIL_DOMAIN = '@movely.test'

const TEST_DRIVERS = [
  { name: 'Carlos Ramirez', city: 'Baltimore', state: 'MD', vehicle: 'Sedan', make: 'Toyota', model: 'Camry', year: 2022, color: 'Silver', capacity: 4, amenities: ['ac', 'phone_charger', 'non_smoker'], payments: ['cash', 'card'], bio: 'Professional driver with 8 years of experience serving Baltimore and surrounding areas. Reliable, punctual, and always professional.', languages: ['English', 'Spanish'], hours: 'Mon-Sun, 6 AM - 10 PM' },
  { name: 'Michael Johnson', city: 'Baltimore', state: 'MD', vehicle: 'SUV-Minivan', make: 'Honda', model: 'Pilot', year: 2021, color: 'Black', capacity: 7, amenities: ['ac', 'wifi', 'phone_charger', 'large_trunk', 'pet_friendly'], payments: ['cash', 'card', 'zelle'], bio: 'Family-friendly SUV driver. Great for airport trips and group outings. Pet-friendly!', languages: ['English'], hours: '24/7' },
  { name: 'Ahmed Hassan', city: 'Dundalk', state: 'MD', vehicle: 'Sedan', make: 'Nissan', model: 'Altima', year: 2023, color: 'White', capacity: 4, amenities: ['ac', 'phone_charger', 'non_smoker', 'night_service'], payments: ['cash', 'card', 'cashapp'], bio: 'Night service specialist. Available late nights and early mornings. BWI airport expert.', languages: ['English', 'Arabic'], hours: 'Mon-Sun, 8 PM - 6 AM' },
  { name: 'Roberto Silva', city: 'Towson', state: 'MD', vehicle: 'Van', make: 'Ford', model: 'Transit', year: 2020, color: 'Blue', capacity: 12, amenities: ['ac', 'large_trunk', 'wheelchair_accessible', 'non_smoker'], payments: ['cash', 'card'], bio: 'Large group transportation specialist. Wheelchair accessible van available. Perfect for events and corporate trips.', languages: ['English', 'Spanish', 'Portuguese'], hours: 'Mon-Sat, 5 AM - 8 PM' },
  { name: 'David Chen', city: 'Washington D.C.', state: 'DC', vehicle: 'Luxury', make: 'Mercedes', model: 'E-Class', year: 2023, color: 'Black', capacity: 4, amenities: ['ac', 'wifi', 'phone_charger', 'non_smoker', 'large_trunk'], payments: ['card', 'apple_google_pay'], bio: 'Premium luxury service for business travelers and special occasions. Impeccably maintained vehicle.', languages: ['English', 'Mandarin'], hours: 'Mon-Sun, 7 AM - 11 PM' },
  { name: 'Marcus Williams', city: 'Pasadena', state: 'MD', vehicle: 'SUV-Minivan', make: 'Toyota', model: 'Sienna', year: 2022, color: 'Gray', capacity: 7, amenities: ['ac', 'phone_charger', 'child_seat', 'pet_friendly', 'large_trunk'], payments: ['cash', 'card', 'venmo'], bio: 'Safe and reliable driver. Child seat available upon request. Serving Anne Arundel county and BWI.', languages: ['English'], hours: 'Mon-Sun, 5 AM - 9 PM' },
  { name: 'Elena Volkov', city: 'Annapolis', state: 'MD', vehicle: 'Sedan', make: 'Hyundai', model: 'Sonata', year: 2021, color: 'Red', capacity: 4, amenities: ['ac', 'phone_charger', 'non_smoker'], payments: ['cash', 'card', 'zelle'], bio: 'Friendly driver serving Annapolis and surrounding areas. Available for airport runs and local trips.', languages: ['English', 'Russian'], hours: 'Mon-Fri, 6 AM - 7 PM' },
  { name: 'James Thompson', city: 'Linthicum', state: 'MD', vehicle: 'SUV-Minivan', make: 'Chevrolet', model: 'Suburban', year: 2020, color: 'Black', capacity: 8, amenities: ['ac', 'wifi', 'phone_charger', 'large_trunk', 'airport_specialist', 'long_distance'], payments: ['cash', 'card', 'cashapp', 'zelle'], bio: 'Airport specialist based near BWI. Long-distance trips welcome. Comfortable ride for up to 8 passengers.', languages: ['English'], hours: '24/7' },
]

const TEST_REVIEWS = [
  { rating: 5, text: 'Excellent service! Very punctual and professional. Will definitely use again.', reviewerName: 'Sarah M.', verified: true, status: 'APPROVED' },
  { rating: 5, text: 'Great ride to the airport. On time and very friendly. Highly recommend!', reviewerName: 'John D.', verified: true, status: 'APPROVED' },
  { rating: 4, text: 'Good service overall. A bit late but communicated well. Nice vehicle.', reviewerName: 'Maria L.', verified: false, status: 'APPROVED' },
  { rating: 5, text: 'Amazing driver! Made us feel safe and comfortable. The car was spotless.', reviewerName: 'Tom B.', verified: true, status: 'APPROVED' },
  { rating: 3, text: 'Decent ride but the car could have been cleaner. Driver was nice though.', reviewerName: 'Anonymous', verified: false, status: 'APPROVED' },
  { rating: 5, text: 'Best taxi experience I have had in Baltimore. Professional and on time!', reviewerName: 'Lisa K.', verified: true, status: 'APPROVED' },
  { rating: 4, text: 'Good driver, fair price. Would recommend to friends.', reviewerName: 'Carlos P.', verified: false, status: 'APPROVED' },
  { rating: 2, text: 'Was 20 minutes late. The ride itself was okay but waiting was frustrating.', reviewerName: 'Anonymous', verified: false, status: 'PENDING' },
  { rating: 5, text: 'Outstanding service for our family trip to DC. Very accommodating with kids.', reviewerName: 'Jennifer W.', verified: true, status: 'APPROVED' },
  { rating: 1, text: 'Never showed up. Very disappointing.', reviewerName: 'Robert H.', verified: false, status: 'REJECTED' },
]

const TEST_REPORTS = [
  { reason: 'MISLEADING_PROFILE', details: 'The vehicle in the photo does not match what showed up. The photo shows a luxury sedan but the driver arrived in an older model.', reporterEmail: 'concerned@test.com', status: 'NEW' },
  { reason: 'SAFETY_CONCERN', details: 'Driver was speeding and using phone while driving. Did not feel safe during the ride.', reporterEmail: 'safety@test.com', status: 'NEW' },
  { reason: 'NOT_A_REAL_DRIVER', details: 'I think this profile might be fake. The phone number goes to a different person.', reporterEmail: null, status: 'REVIEWED' },
]

async function seedTestData() {
  console.log('\n🧪 Seeding test data (--with-test-data)...')

  // Check if test data already exists
  const existingTestUsers = await prisma.user.findMany({
    where: { email: { endsWith: TEST_EMAIL_DOMAIN } },
  })
  if (existingTestUsers.length > 0) {
    console.log(`⚠️  Test data already exists (${existingTestUsers.length} test users). Run with --cleanup-test-data first to reset.`)
    return
  }

  // Get city IDs for service area assignment
  const cities = await prisma.city.findMany()
  const cityByName = new Map(cities.map(c => [c.name.toLowerCase(), c]))

  let driversCreated = 0
  let reviewsCreated = 0
  let reportsCreated = 0

  for (let i = 0; i < TEST_DRIVERS.length; i++) {
    const td = TEST_DRIVERS[i]

    // Create User
    const userId = `test-user-${i + 1}-${Date.now()}`
    const email = `driver${i + 1}${TEST_EMAIL_DOMAIN}`
    const user = await prisma.user.create({
      data: { id: userId, email, role: 'DRIVER' },
    })

    // Find city
    const city = cityByName.get(td.city.toLowerCase())
    const cityId = city?.id

    // Create Driver
    const slug = `test-driver-${i + 1}-${Date.now()}`
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        slug,
        displayName: td.name,
        phone: `555000${String(i + 1).padStart(4, '0')}`,
        whatsappNumber: `1555000${String(i + 1).padStart(4, '0')}`,
        cityId,
        city: td.city,
        vehicleType: td.vehicle,
        vehicleMake: td.make,
        vehicleModel: td.model,
        vehicleYear: td.year,
        vehicleColor: td.color,
        passengerCapacity: td.capacity,
        amenities: td.amenities,
        paymentMethods: td.payments,
        operatingHours: td.hours,
        languages: td.languages,
        bio: td.bio,
        status: 'APPROVED',
        availabilityStatus: i % 4 === 0 ? 'BUSY' : 'AVAILABLE',
        isFeatured: i < 2,
        featuredOrder: i < 2 ? i + 1 : 0,
      },
    })
    driversCreated++

    // Create ServiceArea records — assign 2-4 cities per driver
    const serviceCityNames = [td.city]
    // Add 1-3 more nearby cities
    const nearbyCities = cities.filter(c =>
      c.state === td.state && c.name.toLowerCase() !== td.city.toLowerCase()
    )
    for (let j = 0; j < Math.min(2 + (i % 2), nearbyCities.length); j++) {
      serviceCityNames.push(nearbyCities[j].name)
    }
    // Some drivers also serve DC
    if (i % 3 === 0 && td.state !== 'DC') {
      const dc = cityByName.get('washington d.c.')
      if (dc) serviceCityNames.push('Washington D.C.')
    }

    for (const cityName of serviceCityNames) {
      const sc = cityByName.get(cityName.toLowerCase())
      if (sc) {
        await prisma.serviceArea.create({
          data: { driverId: driver.id, cityId: sc.id },
        }).catch(() => {}) // ignore duplicates
      }
    }

    // Create 3-7 reviews per driver
    const reviewCount = 3 + (i % 5)
    for (let j = 0; j < reviewCount; j++) {
      const reviewTemplate = TEST_REVIEWS[j % TEST_REVIEWS.length]
      const review = await prisma.review.create({
        data: {
          driverId: driver.id,
          rating: reviewTemplate.rating,
          text: reviewTemplate.text,
          reviewerName: reviewTemplate.reviewerName,
          reviewerEmail: `reviewer${i}${j}${TEST_EMAIL_DOMAIN}`,
          ipHash: `test-ip-${i}-${j}`,
          isVerifiedContact: reviewTemplate.verified,
          status: reviewTemplate.status as any,
          publishedAt: reviewTemplate.status === 'APPROVED' ? new Date(Date.now() - j * 86400000) : null,
          createdAt: new Date(Date.now() - j * 86400000),
        },
      })
      reviewsCreated++

      // Add driver response to some approved reviews
      if (reviewTemplate.status === 'APPROVED' && j % 3 === 0) {
        await prisma.review.update({
          where: { id: review.id },
          data: {
            driverResponse: 'Thank you for your feedback! Glad you had a great experience.',
            driverRespondedAt: new Date(Date.now() - j * 86400000 + 3600000),
          },
        })
      }

      // Flag one review per driver (every 5th review)
      if (j === 4 && i < 3) {
        await prisma.review.update({
          where: { id: review.id },
          data: {
            isFlaggedByDriver: true,
            flagReason: 'This review appears to be from a competitor, not a real customer.',
            flaggedAt: new Date(),
            flagStatus: 'FLAG_PENDING',
          },
        })
      }
    }

    // Create 0-1 reports per driver (first 3 drivers get reports)
    if (i < 3) {
      const reportTemplate = TEST_REPORTS[i]
      await prisma.report.create({
        data: {
          driverId: driver.id,
          reason: reportTemplate.reason as any,
          details: reportTemplate.details,
          reporterEmail: reportTemplate.reporterEmail,
          ipHash: `test-report-ip-${i}`,
          status: reportTemplate.status as any,
          createdAt: new Date(Date.now() - i * 86400000),
        },
      })
      reportsCreated++
    }
  }

  console.log(`✅ Created ${driversCreated} test drivers`)
  console.log(`✅ Created ${reviewsCreated} test reviews`)
  console.log(`✅ Created ${reportsCreated} test reports`)
  console.log(`\n📌 Test data uses ${TEST_EMAIL_DOMAIN} email domain for identification`)
  console.log(`📌 Run with --cleanup-test-data to remove all test data`)
}

async function cleanupTestDataFn() {
  console.log('\n🧹 Cleaning up test data (--cleanup-test-data)...')

  // Find all test users
  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: TEST_EMAIL_DOMAIN } },
    select: { id: true, email: true },
  })

  if (testUsers.length === 0) {
    console.log('ℹ️  No test data found to clean up.')
    return
  }

  console.log(`Found ${testUsers.length} test users to remove...`)

  // Get driver IDs for these users
  const testDrivers = await prisma.driver.findMany({
    where: { userId: { in: testUsers.map(u => u.id) } },
    select: { id: true },
  })
  const driverIds = testDrivers.map(d => d.id)

  // Delete in order (cascading will handle most, but be explicit)
  if (driverIds.length > 0) {
    await prisma.review.deleteMany({ where: { driverId: { in: driverIds } } })
    await prisma.report.deleteMany({ where: { driverId: { in: driverIds } } })
    await prisma.serviceArea.deleteMany({ where: { driverId: { in: driverIds } } })
    await prisma.lead.deleteMany({ where: { driverId: { in: driverIds } } }).catch(() => {})
    await prisma.profileView.deleteMany({ where: { driverId: { in: driverIds } } }).catch(() => {})
    await prisma.driverPhoto.deleteMany({ where: { driverId: { in: driverIds } } }).catch(() => {})
    await prisma.driver.deleteMany({ where: { id: { in: driverIds } } })
  }

  // Delete test reviews that might have been created with test emails (not tied to test drivers)
  await prisma.review.deleteMany({
    where: { reviewerEmail: { endsWith: TEST_EMAIL_DOMAIN } },
  })

  // Delete test reports
  await prisma.report.deleteMany({
    where: { ipHash: { startsWith: 'test-report-ip-' } },
  })

  // Finally delete users
  const deleted = await prisma.user.deleteMany({
    where: { id: { in: testUsers.map(u => u.id) } },
  })

  console.log(`✅ Deleted ${deleted.count} test users and all associated data`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
