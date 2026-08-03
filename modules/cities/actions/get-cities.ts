'use server'

import { CityService } from '../services/city.service'

export async function getActiveCities() {
  return CityService.getAllActive()
}

export async function getAllCities() {
  return CityService.getAll()
}
