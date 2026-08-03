import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { DEFAULT_PAGE_SIZE } from '@/modules/drivers/types/search'
import {
  driverSearchQuerySchema,
  urlSearchParamsToObject,
} from '@/modules/drivers/validations/driver-search.schema'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const parsed = driverSearchQuerySchema.safeParse(
    urlSearchParamsToObject(request.nextUrl.searchParams),
  )

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid search parameters', fields: parsed.error.flatten().fieldErrors },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const result = await DriverService.searchPublicDrivers({
      ...parsed.data,
      pageSize: DEFAULT_PAGE_SIZE,
    })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: '/api/drivers/search' },
    })
    console.error('[drivers/search] Search failed', error)

    return NextResponse.json(
      { error: 'Search is temporarily unavailable. Please try again.' },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': '2',
        },
      },
    )
  }
}
