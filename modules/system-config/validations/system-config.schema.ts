import { z } from 'zod'
import { CONFIG_KEYS } from '../types'

export const configKeySchema = z.nativeEnum(CONFIG_KEYS)

export const updateConfigSchema = z.object({
  [CONFIG_KEYS.ADMIN_NOTIFICATION_EMAIL]: z
    .string()
    .min(1, 'Admin email is required.')
    .email('Please enter a valid email address.'),
  [CONFIG_KEYS.SUPPORT_EMAIL]: z
    .string()
    .min(1, 'Support email is required.')
    .email('Please enter a valid email address.'),
  [CONFIG_KEYS.FREE_PHOTO_LIMIT]: z
    .string()
    .regex(/^\d+$/, 'Must be a positive whole number.'),
  [CONFIG_KEYS.MAX_FEATURED_DRIVERS]: z
    .string()
    .regex(/^\d+$/, 'Must be a positive whole number.'),
  [CONFIG_KEYS.DEFAULT_SENDER_NAME]: z
    .string()
    .min(1, 'Sender name is required.')
    .max(100, 'Sender name is too long.'),
  [CONFIG_KEYS.DEFAULT_SENDER_EMAIL]: z
    .string()
    .min(1, 'Sender email is required.')
    .email('Please enter a valid email address.'),
  [CONFIG_KEYS.DRIVER_APPROVAL_EMAIL_SUBJECT]: z
    .string()
    .min(1, 'Approval subject is required.')
    .max(200, 'Subject is too long.'),
  [CONFIG_KEYS.DRIVER_REJECTION_EMAIL_SUBJECT]: z
    .string()
    .min(1, 'Rejection subject is required.')
    .max(200, 'Subject is too long.'),
})

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>
