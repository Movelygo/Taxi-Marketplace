import { User, UserRole } from '@prisma/client'

export type { User, UserRole }

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}
