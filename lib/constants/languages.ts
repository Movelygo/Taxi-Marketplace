export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'Arabic',
  'Amharic',
  'Mandarin',
  'Other',
] as const

export type Language = typeof LANGUAGES[number]
