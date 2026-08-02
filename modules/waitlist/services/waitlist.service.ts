import type { WaitlistEntry } from '@prisma/client'
import { WaitlistRepository } from '../repositories/waitlist.repository'
import type { WaitlistInput } from '../validations/waitlist.schema'

export class WaitlistService {
  static async subscribe(input: WaitlistInput): Promise<WaitlistEntry> {
    return WaitlistRepository.upsertByEmail(input)
  }
}
