import type { Driver } from '@prisma/client'

export interface CompletenessItem {
  key: string
  label: string
  hint: string
  href: string
  isComplete: boolean
}

export interface CompletenessResult {
  percentage: number
  completedCount: number
  totalCount: number
  items: CompletenessItem[]
  completed: CompletenessItem[]
  missing: CompletenessItem[]
  isComplete: boolean
}

/**
 * Pure utility — computes profile completeness from an existing Driver record.
 * Uses ONLY real schema fields. Equal weighting per item.
 *
 * Note: most fields are required at profile creation, so freshly-created
 * profiles will always score around 78% (missing image + bio). This is
 * intentional — it surfaces the two quality items every driver should add.
 */
export class ProfileCompletenessService {
  private static readonly MIN_BIO_LENGTH = 40

  static evaluate(driver: Driver): CompletenessResult {
    const items: CompletenessItem[] = [
      {
        key: 'profileImage',
        label: 'Profile photo',
        hint: 'A clear photo of yourself helps customers trust you.',
        href: '/dashboard/profile',
        isComplete: !!driver.profileImageUrl,
      },
      {
        key: 'bio',
        label: 'Personal bio',
        hint: 'Write at least a couple of sentences about your experience.',
        href: '/dashboard/profile',
        isComplete: !!driver.bio && driver.bio.trim().length >= this.MIN_BIO_LENGTH,
      },
      {
        key: 'displayName',
        label: 'Display name',
        hint: 'The name customers will see on your profile.',
        href: '/dashboard/profile',
        isComplete: !!driver.displayName && driver.displayName.trim().length > 0,
      },
      {
        key: 'phone',
        label: 'Phone number',
        hint: 'So customers can call you directly.',
        href: '/dashboard/profile',
        isComplete: !!driver.phone && driver.phone.trim().length > 0,
      },
      {
        key: 'whatsapp',
        label: 'WhatsApp number',
        hint: 'So customers can message you directly.',
        href: '/dashboard/profile',
        isComplete: !!driver.whatsappNumber && driver.whatsappNumber.trim().length > 0,
      },
      {
        key: 'city',
        label: 'Base city',
        hint: 'Your primary operating city.',
        href: '/dashboard/profile',
        isComplete: !!driver.city && driver.city.trim().length > 0,
      },
      {
        key: 'serviceArea',
        label: 'Service area',
        hint: 'The areas you cover (e.g. Baltimore, BWI, DC).',
        href: '/dashboard/profile',
        isComplete: !!driver.serviceAreaText && driver.serviceAreaText.trim().length >= 10,
      },
      {
        key: 'vehicleType',
        label: 'Vehicle category',
        hint: 'Sedan, SUV, Van, Luxury.',
        href: '/dashboard/profile',
        isComplete: !!driver.vehicleType && driver.vehicleType.trim().length > 0,
      },
      {
        key: 'vehicleDetails',
        label: 'Vehicle details (make/model/year)',
        hint: 'Specifics like make, model, and year help customers choose you.',
        href: '/dashboard/profile',
        isComplete: !!(driver.vehicleMake && driver.vehicleModel && driver.vehicleYear),
      },
      {
        key: 'passengerCapacity',
        label: 'Passenger capacity',
        hint: 'How many passengers you can take.',
        href: '/dashboard/profile',
        isComplete: !!driver.passengerCapacity && driver.passengerCapacity > 0,
      },
      {
        key: 'amenities',
        label: 'Amenities & services',
        hint: 'A/C, Wi-Fi, child seat, pet-friendly, etc.',
        href: '/dashboard/profile',
        isComplete: Array.isArray(driver.amenities) && driver.amenities.length >= 3,
      },
      {
        key: 'paymentMethods',
        label: 'Payment methods',
        hint: 'Cash, card, Zelle, etc.',
        href: '/dashboard/profile',
        isComplete: Array.isArray(driver.paymentMethods) && driver.paymentMethods.length >= 1,
      },
      {
        key: 'operatingHours',
        label: 'Operating hours',
        hint: 'When you are available (e.g. Mon–Fri, 6 AM–8 PM).',
        href: '/dashboard/profile',
        isComplete: !!driver.operatingHours && driver.operatingHours.trim().length > 0,
      },
      {
        key: 'languages',
        label: 'Languages spoken',
        hint: 'Helps customers find a driver who speaks their language.',
        href: '/dashboard/profile',
        isComplete: Array.isArray(driver.languages) && driver.languages.length > 0,
      },
    ]

    const completed = items.filter((i) => i.isComplete)
    const missing = items.filter((i) => !i.isComplete)
    const percentage = Math.round((completed.length / items.length) * 100)

    return {
      percentage,
      completedCount: completed.length,
      totalCount: items.length,
      items,
      completed,
      missing,
      isComplete: missing.length === 0,
    }
  }
}
