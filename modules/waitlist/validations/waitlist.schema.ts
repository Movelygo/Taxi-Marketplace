import { z } from 'zod'

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .max(200, 'Email is too long.'),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
