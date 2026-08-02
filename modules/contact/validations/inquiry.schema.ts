import { z } from 'zod'

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name.')
    .max(100, 'Name is too long.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .max(200, 'Email is too long.'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject is too short.')
    .max(150, 'Subject is too long.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(2000, 'Message is too long (max 2000 characters).'),
})

export type InquiryInput = z.infer<typeof inquirySchema>
