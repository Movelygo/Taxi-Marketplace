import {
  emailLayout,
  text,
  buttonPrimary,
  callout,
  appUrl,
  escapeHtml,
} from './layout'

// ── Review approved: notify driver ──

export function buildReviewApprovedHtml(review: {
  rating: number
  text: string
  reviewerName: string
  isVerifiedContact: boolean
  driverSlug: string
}): string {
  const profileUrl = appUrl(`/drivers/${review.driverSlug}`)

  const body = [
    text(`Hi,`),
    text(`A new review has been published on your Movely profile.`),
    callout(
      `<strong>${'★'.repeat(review.rating)}</strong> (${review.rating}/5)${review.isVerifiedContact ? ' &middot; <strong>Verified contact</strong>' : ''}<br><br>"${escapeHtml(review.text)}"`,
      'info',
    ),
    text(`Reviewer: <strong>${escapeHtml(review.reviewerName)}</strong>`),
    buttonPrimary(profileUrl, 'View your profile'),
    text(`You can respond publicly to this review from your dashboard. A thoughtful response shows future customers you care about feedback.`),
  ].join('')

  return emailLayout({
    preheader: `New ${review.rating}-star review from ${review.reviewerName}`,
    headerTitle: 'You have a new review',
    headerSubtitle: 'A customer shared their experience',
    body,
  })
}

export function buildReviewApprovedText(review: {
  rating: number
  text: string
  reviewerName: string
  driverSlug: string
}): string {
  const profileUrl = appUrl(`/drivers/${review.driverSlug}`)
  return `You have a new review

Rating: ${review.rating}/5
Reviewer: ${review.reviewerName}

"${review.text}"

View your profile: ${profileUrl}

You can respond publicly to this review from your dashboard.

Movely — Driver-customer connection platform
hello@movelygo.com`
}

// ── Review pending: notify admin ──

export function buildReviewPendingAdminHtml(review: {
  rating: number
  text: string
  reviewerName: string
  reviewerEmail: string
  isVerifiedContact: boolean
  driverDisplayName: string
  reviewId: string
}): string {
  const adminUrl = appUrl('/admin/reviews')

  const body = [
    text(`A new review is awaiting moderation.`),
    callout(
      `<strong>${'★'.repeat(review.rating)}</strong> (${review.rating}/5)${review.isVerifiedContact ? ' &middot; <strong>Verified contact</strong>' : ''}<br><br>"${escapeHtml(review.text)}"`,
      'info',
    ),
    text(`<strong>Reviewer:</strong> ${escapeHtml(review.reviewerName)} &lt;${escapeHtml(review.reviewerEmail)}&gt;<br><strong>Driver:</strong> ${escapeHtml(review.driverDisplayName)}`),
    buttonPrimary(adminUrl, 'Review in admin queue'),
  ].join('')

  return emailLayout({
    preheader: `New ${review.rating}-star review pending moderation`,
    headerTitle: 'New review pending moderation',
    headerSubtitle: 'Please review before publishing',
    body,
  })
}

export function buildReviewPendingAdminText(review: {
  rating: number
  text: string
  reviewerName: string
  reviewerEmail: string
  driverDisplayName: string
}): string {
  return `New review pending moderation

Rating: ${review.rating}/5
Reviewer: ${review.reviewerName} <${review.reviewerEmail}>
Driver: ${review.driverDisplayName}

"${review.text}"

Review in admin: ${appUrl('/admin/reviews')}

Movely — Driver-customer connection platform`
}

// ── Report submitted: notify admin ──

export function buildReportAdminHtml(report: {
  reason: string
  details: string
  reporterEmail: string | null
  driverDisplayName: string
  driverSlug: string
}): string {
  const adminUrl = appUrl('/admin/reports')

  const body = [
    text(`A new profile report has been submitted.`),
    callout(
      `<strong>Reason:</strong> ${escapeHtml(report.reason.replace(/_/g, ' '))}<br><strong>Driver:</strong> ${escapeHtml(report.driverDisplayName)}<br>${report.reporterEmail ? `<strong>From:</strong> ${escapeHtml(report.reporterEmail)}` : 'Anonymous report'}`,
      'warning',
    ),
    text(`"${escapeHtml(report.details)}"`),
    buttonPrimary(adminUrl, 'Review in admin queue'),
  ].join('')

  return emailLayout({
    preheader: `New report: ${report.reason.replace(/_/g, ' ')}`,
    headerTitle: 'New profile report',
    headerSubtitle: 'A visitor reported a safety or policy concern',
    body,
  })
}

export function buildReportAdminText(report: {
  reason: string
  details: string
  reporterEmail: string | null
  driverDisplayName: string
}): string {
  return `New profile report

Reason: ${report.reason.replace(/_/g, ' ')}
Driver: ${report.driverDisplayName}
From: ${report.reporterEmail || 'Anonymous'}

"${report.details}"

Review in admin: ${appUrl('/admin/reports')}

Movely — Driver-customer connection platform`
}
