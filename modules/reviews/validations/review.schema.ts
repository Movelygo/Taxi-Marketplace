import { z } from 'zod'

export const reviewSchema = z.object({
  driverId: z.string().uuid('Invalid driver ID.'),
  rating: z
    .number({ invalid_type_error: 'Please select a rating.' })
    .int('Rating must be a whole number.')
    .min(1, 'Please select a rating.')
    .max(5, 'Rating must be between 1 and 5.'),
  text: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(2000, 'Review is too long (max 2000 characters).'),
  reviewerName: z
    .string()
    .trim()
    .min(2, 'Please enter your name.')
    .max(100, 'Name is too long.'),
  reviewerEmail: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .max(200, 'Email is too long.'),
  // Optional: lead token from localStorage for verified-contact badge
  leadToken: z.string().optional(),
})

export type ReviewInput = z.infer<typeof reviewSchema>

// Driver response to a review
export const reviewResponseSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID.'),
  response: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(1000, 'Response is too long (max 1000 characters).'),
})

export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>

// Driver flag/appeal of a review
export const reviewFlagSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID.'),
  reason: z
    .string()
    .trim()
    .min(10, 'Please explain why you believe this review is unfair.')
    .max(1000, 'Reason is too long (max 1000 characters).'),
})

export type ReviewFlagInput = z.infer<typeof reviewFlagSchema>
