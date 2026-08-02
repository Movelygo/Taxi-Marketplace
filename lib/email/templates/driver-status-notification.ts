export function buildDriverStatusNotificationHtml(driver: {
  displayName: string
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING'
  slug: string
}): string {
  const isApproved = driver.status === 'APPROVED'
  const title = isApproved ? 'Your Movely profile is now live' : 'Your Movely profile needs attention'
  const publicUrl = `${appUrl('/drivers')}/${driver.slug}`

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h1 style="color: #0B1F3D; font-size: 20px; margin-bottom: 16px;">${title}</h1>

      <p style="font-size: 15px; line-height: 1.6;">
        Hi ${escapeHtml(driver.displayName)},
      </p>

      ${isApproved
        ? `<p style="font-size: 15px; line-height: 1.6;">
            Your driver profile has been reviewed and approved. It is now visible to customers on the Movely directory.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            <a href="${publicUrl}" style="color: #0B1F3D; font-weight: 600; text-decoration: underline;">View your public profile</a>
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            You can track profile views and leads from your dashboard. Welcome aboard!
          </p>`
        : `<p style="font-size: 15px; line-height: 1.6;">
            Your driver profile has been reviewed and currently does not meet the requirements to be listed on Movely.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            You can review and update your profile from your dashboard at any time. If you believe this was a mistake, please reply to this email.
          </p>`}

      <p style="margin-top: 32px; font-size: 12px; color: #6B7280;">
        Movely — Driver-customer connection platform
      </p>
    </div>
  `
}

export function buildDriverStatusNotificationText(driver: {
  displayName: string
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING'
  slug: string
}): string {
  const isApproved = driver.status === 'APPROVED'
  const publicUrl = `${appUrl('/drivers')}/${driver.slug}`

  return `Hi ${driver.displayName},

${isApproved
    ? `Your driver profile has been reviewed and approved. It is now visible to customers on the Movely directory.

View your public profile: ${publicUrl}

You can track profile views and leads from your dashboard. Welcome aboard!`
    : `Your driver profile has been reviewed and currently does not meet the requirements to be listed on Movely.

You can review and update your profile from your dashboard at any time. If you believe this was a mistake, please reply to this email.`}

Movely — Driver-customer connection platform
`
}

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://staging.movelygo.com'
  return `${base}${path}`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
