export const VEHICLE_TYPES = [
  'Sedan',
  'SUV',
  'Van',
  'Minivan',
  'Luxury Sedan',
  'Taxi',
  'Other',
] as const

export type VehicleType = typeof VEHICLE_TYPES[number]
