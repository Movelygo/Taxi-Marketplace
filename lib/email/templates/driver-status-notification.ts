import {
  emailLayout,
  text,
  buttonPrimary,
  link,
  callout,
  appUrl,
  escapeHtml,
} from './layout'

export function buildDriverStatusNotificationHtml(driver: {
  displayName: string
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING'
  slug: string
}): string {
  const isApproved = driver.status === 'APPROVED'
  const isSuspended = driver.status === 'SUSPENDED'
  const publicUrl = appUrl(`/drivers/${driver.slug}`)
  const dashboardUrl = appUrl('/dashboard')

  const headerTitle = isApproved
    ? 'Your profile is now live'
    : isSuspended
      ? 'Your profile has been suspended'
      : 'Your profile needs attention'

  const headerSubtitle = isApproved
    ? 'You\'re now visible to customers on Movely'
    : 'Please review your profile and take action'

  const headerBg = isApproved ? '#0B1F3D' : isSuspended ? '#7F1D1D' : '#0B1F3D'

  let body = ''

  body += text(`Hi <strong>${escapeHtml(driver.displayName)}</strong>,`)

  if (isApproved) {
    body += text(
      'Your driver profile has been reviewed and approved. It is now visible to customers searching the Movely directory.',
    )
    body += callout(
      'You can track profile views and customer leads from your dashboard. Keep your availability status updated to attract more inquiries.',
      'success',
    )
    body += buttonPrimary(publicUrl, 'View your public profile')
    body += text(`Or visit your ${link(dashboardUrl, 'driver dashboard')} to manage your profile.`)
  } else if (isSuspended) {
    body += text(
      'Your driver profile has been suspended and is no longer visible to customers. This may be due to a policy violation or a report from a user.',
    )
    body += callout(
      'If you believe this was a mistake, please reply to this email and our team will review your case.',
      'warning',
    )
    body += buttonPrimary(dashboardUrl, 'Go to dashboard')
  } else {
    body += text(
      'Your driver profile has been reviewed and currently does not meet the requirements to be listed on Movely.',
    )
    body += text(
      'You can review and update your profile from your dashboard at any time. If you believe this was a mistake, please reply to this email.',
    )
    body += buttonPrimary(dashboardUrl, 'Update your profile')
  }

  return emailLayout({
    preheader: isApproved
      ? 'Your Movely driver profile is now live and visible to customers.'
      : 'Your Movely driver profile needs attention. Please review.',
    headerTitle,
    headerSubtitle,
    headerBg,
    body,
  })
}

export function buildDriverStatusNotificationText(driver: {
  displayName: string
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING'
  slug: string
}): string {
  const isApproved = driver.status === 'APPROVED'
  const isSuspended = driver.status === 'SUSPENDED'
  const publicUrl = appUrl(`/drivers/${driver.slug}`)
  const dashboardUrl = appUrl('/dashboard')

  const title = isApproved
    ? 'Your profile is now live'
    : isSuspended
      ? 'Your profile has been suspended'
      : 'Your profile needs attention'

  let body = `Hi ${driver.displayName},\n\n`

  if (isApproved) {
    body += `Your driver profile has been reviewed and approved. It is now visible to customers on the Movely directory.\n\n`
    body += `View your public profile: ${publicUrl}\n\n`
    body += `Driver dashboard: ${dashboardUrl}\n\n`
    body += `You can track profile views and customer leads from your dashboard. Keep your availability status updated to attract more inquiries.`
  } else if (isSuspended) {
    body += `Your driver profile has been suspended and is no longer visible to customers.\n\n`
    body += `If you believe this was a mistake, please reply to this email.\n\n`
    body += `Dashboard: ${dashboardUrl}`
  } else {
    body += `Your driver profile has been reviewed and currently does not meet the requirements to be listed on Movely.\n\n`
    body += `You can review and update your profile from your dashboard at any time.\n\n`
    body += `Dashboard: ${dashboardUrl}\n\n`
    body += `If you believe this was a mistake, please reply to this email.`
  }

  body += `\n\nMovely — Driver-customer connection platform\nhello@movelygo.com`

  return `${title}\n\n${body}`
}
