/**
 * Default profile attributes seeded into the ProfileAttribute table.
 * Admin can add/deactivate these from the panel without code changes.
 */

export const DEFAULT_AMENITIES = [
  { key: 'ac', label: 'A/C' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'phone_charger', label: 'Phone charger' },
  { key: 'child_seat', label: 'Child seat' },
  { key: 'pet_friendly', label: 'Pet-friendly' },
  { key: 'wheelchair_accessible', label: 'Wheelchair accessible' },
  { key: 'large_trunk', label: 'Large trunk' },
  { key: 'non_smoker', label: 'Non-smoker' },
  { key: 'night_service', label: 'Night service' },
  { key: 'airport_specialist', label: 'Airport specialist' },
  { key: 'long_distance', label: 'Long-distance / interstate' },
] as const

export const DEFAULT_PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash' },
  { key: 'card', label: 'Credit / Debit card' },
  { key: 'zelle', label: 'Zelle' },
  { key: 'cashapp', label: 'CashApp' },
  { key: 'venmo', label: 'Venmo' },
  { key: 'apple_google_pay', label: 'Apple / Google Pay' },
] as const

export const VEHICLE_CATEGORIES = [
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV-Minivan', label: 'SUV / Minivan' },
  { value: 'Van', label: 'Van' },
  { value: 'Luxury', label: 'Luxury' },
] as const
