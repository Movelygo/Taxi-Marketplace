import { SystemConfig } from '@prisma/client'
import { CONFIG_KEYS, DEFAULT_CONFIG, ConfigKey } from '../types'
import { SystemConfigRepository } from '../repositories/system-config.repository'

export interface SystemConfigView {
  id?: string
  key: string
  value: string
  description: string
  updatedAt?: Date
  updatedBy?: string | null
}

export class SystemConfigService {
  static async get(key: ConfigKey): Promise<string> {
    const config = await SystemConfigRepository.findByKey(key)
    return config?.value ?? DEFAULT_CONFIG[key].value
  }

  static async getAll(): Promise<SystemConfigView[]> {
    const existing = await SystemConfigRepository.findAll()
    return Object.values(CONFIG_KEYS).map((key) => {
      const record = existing.find((c) => c.key === key)
      return {
        id: record?.id,
        key,
        value: record?.value ?? DEFAULT_CONFIG[key].value,
        description: DEFAULT_CONFIG[key].description,
        updatedAt: record?.updatedAt,
        updatedBy: record?.updatedBy,
      }
    })
  }

  static async set(
    key: ConfigKey,
    value: string,
    updatedBy?: string,
  ): Promise<SystemConfig> {
    const trimmed = value.trim()
    return SystemConfigRepository.upsert({
      key,
      value: trimmed,
      description: DEFAULT_CONFIG[key].description,
      updatedBy,
    })
  }

  static async setMany(
    values: Record<string, string>,
    updatedBy?: string,
  ): Promise<void> {
    const promises = Object.entries(values).map(([key, value]) =>
      this.set(key as ConfigKey, value, updatedBy),
    )
    await Promise.all(promises)
  }

  static async seedDefaults(updatedBy?: string): Promise<void> {
    for (const key of Object.values(CONFIG_KEYS)) {
      const exists = await SystemConfigRepository.exists(key)
      if (!exists) {
        await SystemConfigRepository.create({
          key,
          value: DEFAULT_CONFIG[key].value,
          description: DEFAULT_CONFIG[key].description,
          updatedBy,
        })
      }
    }
  }

  static async getAdminNotificationEmail(): Promise<string> {
    return this.get(CONFIG_KEYS.ADMIN_NOTIFICATION_EMAIL)
  }

  static async getSupportEmail(): Promise<string> {
    return this.get(CONFIG_KEYS.SUPPORT_EMAIL)
  }

  static async getSender(): Promise<{ name: string; email: string; full: string }> {
    const [name, email] = await Promise.all([
      this.get(CONFIG_KEYS.DEFAULT_SENDER_NAME),
      this.get(CONFIG_KEYS.DEFAULT_SENDER_EMAIL),
    ])
    return { name, email, full: `${name} <${email}>` }
  }

  static async getFreePhotoLimit(): Promise<number> {
    const value = await this.get(CONFIG_KEYS.FREE_PHOTO_LIMIT)
    return parseInt(value, 10) || 2
  }

  static async getMaxFeaturedDrivers(): Promise<number> {
    const value = await this.get(CONFIG_KEYS.MAX_FEATURED_DRIVERS)
    return parseInt(value, 10) || 10
  }

  static async getDriverApprovalSubject(): Promise<string> {
    return this.get(CONFIG_KEYS.DRIVER_APPROVAL_EMAIL_SUBJECT)
  }

  static async getDriverRejectionSubject(): Promise<string> {
    return this.get(CONFIG_KEYS.DRIVER_REJECTION_EMAIL_SUBJECT)
  }
}
