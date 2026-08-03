import { NextRequest, NextResponse } from 'next/server'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { DEFAULT_PAGE_SIZE } from '@/modules/drivers/types/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const q = searchParams.get('q') || undefined
  const city = searchParams.get('city') || undefined
  const vehicleType = searchParams.get('vehicleType') || undefined
  const amenities = searchParams.getAll('amenities').filter(Boolean)
  const paymentMethods = searchParams.getAll('paymentMethods').filter(Boolean)
  const minCapacity = searchParams.get('minCapacity')
  const availabilityStatus = searchParams.get('availabilityStatus') || undefined
  const sort = (searchParams.get('sort') as 'featured' | 'newest') || 'featured'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const result = await DriverService.searchPublicDrivers({
    q,
    city,
    vehicleType,
    amenities: amenities.length > 0 ? amenities : undefined,
    paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined,
    minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
    availabilityStatus: availabilityStatus || undefined,
    sort,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  return NextResponse.json(result)
}
