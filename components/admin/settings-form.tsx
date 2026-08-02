'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateSystemConfigs, type UpdateConfigsState } from '@/modules/system-config/actions/update-configs'
import { SystemConfigView } from '@/modules/system-config/services/system-config.service'
import { CONFIG_KEYS } from '@/modules/system-config/types'

interface SettingsFormProps {
  configs: SystemConfigView[]
}

const INITIAL_STATE: UpdateConfigsState = { status: 'idle' }

const fieldLabels: Record<string, string> = {
  [CONFIG_KEYS.ADMIN_NOTIFICATION_EMAIL]: 'Admin notification email',
  [CONFIG_KEYS.SUPPORT_EMAIL]: 'Public support email',
  [CONFIG_KEYS.FREE_PHOTO_LIMIT]: 'Free photo limit',
  [CONFIG_KEYS.MAX_FEATURED_DRIVERS]: 'Max featured drivers',
  [CONFIG_KEYS.DEFAULT_SENDER_NAME]: 'Email sender name',
  [CONFIG_KEYS.DEFAULT_SENDER_EMAIL]: 'Email sender address',
  [CONFIG_KEYS.DRIVER_APPROVAL_EMAIL_SUBJECT]: 'Driver approval email subject',
  [CONFIG_KEYS.DRIVER_REJECTION_EMAIL_SUBJECT]: 'Driver rejection email subject',
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3D] text-white rounded-lg font-semibold text-sm hover:bg-[#001F3F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
    >
      {pending ? 'Saving...' : 'Save settings'}
    </button>
  )
}

export function SettingsForm({ configs }: SettingsFormProps) {
  const [state, formAction] = useActionState(updateSystemConfigs, INITIAL_STATE)
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">General Configuration</h2>
        <div className="space-y-5">
          {configs.map((config) => (
            <div key={config.key} className="space-y-1.5">
              <label
                htmlFor={config.key}
                className="block text-sm font-semibold text-gray-700"
              >
                {fieldLabels[config.key] || config.key}
              </label>
              <p className="text-xs text-gray-500">{config.description}</p>
              <input
                id={config.key}
                name={config.key}
                type={config.key.includes('EMAIL') ? 'email' : 'text'}
                defaultValue={config.value}
                className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent ${
                  fieldErrors?.[config.key] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {fieldErrors?.[config.key] && (
                <p className="text-xs text-red-600">{fieldErrors[config.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {state.status === 'success' && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Settings saved successfully.
        </div>
      )}

      {state.status === 'error' && !fieldErrors && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {state.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton />
      </div>
    </form>
  )
}
