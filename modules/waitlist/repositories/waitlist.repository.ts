import { prisma } from '@/lib/db/prisma'
import type { WaitlistEntry } from '@prisma/client'
import type { WaitlistInput } from '../validations/waitlist.schema'

export class WaitlistRepository {
  /**
   * Idempotent signup: re-submitting the same email is a no-op (upsert by
   * unique email) so the Coming Soon form never errors on duplicate signups.
   */
  static async upsertByEmail(input: WaitlistInput): Promise<WaitlistEntry> {
    return prisma.waitlistEntry.upsert({
      where: { email: input.email },
      update: {},
      create: { email: input.email },
    })
  }
}
