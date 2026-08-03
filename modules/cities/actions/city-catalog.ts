'use server'

import { prisma } from '@/lib/db/prisma'
import type { City } from '@prisma/client'
import usStatesData from '../data/us-states.json'
import usCitiesData from '../data/us-cities.json'

export interface StateOption {
  name: string
  code: string
}

export interface CityWithStatus {
  name: string
  stateCode: string
  latitude: string
  longitude: string
  dbCity: City | null
}

// Static data extracted from @countrystatecity/countries package at build time.
// Reading from local JSON avoids dynamic import issues in serverless environments.
const US_STATES: StateOption[] = usStatesData as StateOption[]

type CityEntry = { name: string; lat: string; lng: string }
type CitiesByState = Record<string, CityEntry[]>
const US_CITIES: CitiesByState = usCitiesData as CitiesByState

export async function getUSStates(): Promise<StateOption[]> {
  return US_STATES
}

export async function getCitiesForState(stateCode: string): Promise<CityWithStatus[]> {
  const packageCities = US_CITIES[stateCode] ?? []

  // Get all cities from DB that belong to this state
  const dbCities = await prisma.city.findMany({
    where: { state: stateCode },
  })

  // Create a map by name (case-insensitive) for quick lookup
  const dbMap = new Map<string, City>()
  for (const dbCity of dbCities) {
    dbMap.set(dbCity.name.toLowerCase(), dbCity)
  }

  // Merge: package cities with their DB status
  const result: CityWithStatus[] = packageCities.map((pkgCity) => {
    const dbCity = dbMap.get(pkgCity.name.toLowerCase()) ?? null
    return {
      name: pkgCity.name,
      stateCode,
      latitude: pkgCity.lat,
      longitude: pkgCity.lng,
      dbCity,
    }
  })

  // Also include DB cities that don't exist in the package (e.g. custom names)
  for (const dbCity of dbCities) {
    const existsInPackage = packageCities.some(
      (p) => p.name.toLowerCase() === dbCity.name.toLowerCase()
    )
    if (!existsInPackage) {
      result.push({
        name: dbCity.name,
        stateCode,
        latitude: '',
        longitude: '',
        dbCity,
      })
    }
  }

  // Sort: active first, then inactive, then not-in-db, all alphabetical
  result.sort((a, b) => {
    const aActive = a.dbCity?.isActive ? 0 : a.dbCity ? 1 : 2
    const bActive = b.dbCity?.isActive ? 0 : b.dbCity ? 1 : 2
    if (aActive !== bActive) return aActive - bActive
    return a.name.localeCompare(b.name)
  })

  return result
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function activateCities(
  cityNames: string[],
  stateCode: string
): Promise<{ error?: string; success?: boolean; activatedCount?: number }> {
  let activated = 0
  for (const cityName of cityNames) {
    const slug = slugify(cityName)
    const existing = await prisma.city.findUnique({ where: { slug } })
    if (existing) {
      if (!existing.isActive) {
        await prisma.city.update({ where: { id: existing.id }, data: { isActive: true } })
        activated++
      }
    } else {
      const maxOrder = await prisma.city.aggregate({ _max: { sortOrder: true } })
      await prisma.city.create({
        data: {
          name: cityName,
          slug,
          state: stateCode,
          isActive: true,
          sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        },
      })
      activated++
    }
  }

  return { success: true, activatedCount: activated }
}

export async function deactivateCities(
  cityIds: string[]
): Promise<{ error?: string; success?: boolean; deactivatedCount?: number }> {
  const result = await prisma.city.updateMany({
    where: { id: { in: cityIds } },
    data: { isActive: false },
  })
  return { success: true, deactivatedCount: result.count }
}

export async function getAllActiveCities(): Promise<City[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
}
