import { z } from 'zod'

export const reportSchema = z.object({
  driverId: z.string().uuid('Invalid driver ID.'),
  reason: z.enum([
    'NOT_A_REAL_DRIVER',
    'SAFETY_CONCERN',
    'MISLEADING_PROFILE',
    'INAPPROPRIATE_CONDUCT',
    'OTHER',
  ]),
  details: z
    .string()
    .trim()
    .min(10, 'Please provide at least 10 characters of detail.')
    .max(2000, 'Details are too long (max 2000 characters).'),
  reporterEmail: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(200, 'Email is too long.')
    .optional()
    .or(z.literal('')),
})

export type ReportInput = z.infer<typeof reportSchema>
