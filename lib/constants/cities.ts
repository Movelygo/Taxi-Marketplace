export const CITIES = [
  'Baltimore',
  'BWI',
  'Washington DC',
  'Towson',
  'Essex',
  'Glen Burnie',
  'Annapolis',
  'Dundalk',
] as const

export type City = typeof CITIES[number]
