export const CONFIG_KEYS = {
  ADMIN_NOTIFICATION_EMAIL: 'ADMIN_NOTIFICATION_EMAIL',
  SUPPORT_EMAIL: 'SUPPORT_EMAIL',
  FREE_PHOTO_LIMIT: 'FREE_PHOTO_LIMIT',
  MAX_FEATURED_DRIVERS: 'MAX_FEATURED_DRIVERS',
  DEFAULT_SENDER_NAME: 'DEFAULT_SENDER_NAME',
  DEFAULT_SENDER_EMAIL: 'DEFAULT_SENDER_EMAIL',
  DRIVER_APPROVAL_EMAIL_SUBJECT: 'DRIVER_APPROVAL_EMAIL_SUBJECT',
  DRIVER_REJECTION_EMAIL_SUBJECT: 'DRIVER_REJECTION_EMAIL_SUBJECT',
} as const

export type ConfigKey = keyof typeof CONFIG_KEYS

export const DEFAULT_CONFIG: Record<
  ConfigKey,
  { value: string; description: string }
> = {
  [CONFIG_KEYS.ADMIN_NOTIFICATION_EMAIL]: {
    value: 'hello@movelygo.com',
    description: 'Email address that receives admin notifications (new inquiries, reports, etc.)',
  },
  [CONFIG_KEYS.SUPPORT_EMAIL]: {
    value: 'hello@movelygo.com',
    description: 'Public support email shown across the site',
  },
  [CONFIG_KEYS.FREE_PHOTO_LIMIT]: {
    value: '2',
    description: 'Maximum number of photos on a free driver profile',
  },
  [CONFIG_KEYS.MAX_FEATURED_DRIVERS]: {
    value: '10',
    description: 'Maximum number of featured drivers displayed',
  },
  [CONFIG_KEYS.DEFAULT_SENDER_NAME]: {
    value: 'Movely',
    description: 'Default sender name for transactional emails',
  },
  [CONFIG_KEYS.DEFAULT_SENDER_EMAIL]: {
    value: 'hello@mail.movelygo.com',
    description: 'Default sender email for transactional emails',
  },
  [CONFIG_KEYS.DRIVER_APPROVAL_EMAIL_SUBJECT]: {
    value: 'Your Movely profile has been approved',
    description: 'Subject line for driver approval emails',
  },
  [CONFIG_KEYS.DRIVER_REJECTION_EMAIL_SUBJECT]: {
    value: 'Your Movely profile needs attention',
    description: 'Subject line for driver rejection emails',
  },
}
