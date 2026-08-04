import {
  emailLayout,
  text,
  dataTable,
  buttonPrimary,
  appUrl,
  escapeHtml,
} from './layout'

export function buildInquiryAdminNotificationHtml(inquiry: {
  name: string
  email: string
  subject: string
  message: string
  id: string
  createdAt: Date
}): string {
  const date = inquiry.createdAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const body = [
    text(`A new contact form submission was received on <strong>${date}</strong>.`),
    dataTable([
      { label: 'From', value: `${inquiry.name} <${inquiry.email}>` },
      { label: 'Subject', value: inquiry.subject },
      { label: 'Message', value: inquiry.message },
    ]),
    buttonPrimary(appUrl('/admin/inquiries'), 'View in admin inbox'),
    text(`Or reply directly to ${escapeHtml(inquiry.email)}.`),
  ].join('')

  return emailLayout({
    preheader: `New inquiry from ${inquiry.name}: ${inquiry.subject}`,
    headerTitle: 'New contact form submission',
    headerSubtitle: 'A visitor sent a message through the contact form',
    body,
  })
}

export function buildInquiryAdminNotificationText(inquiry: {
  name: string
  email: string
  subject: string
  message: string
  id: string
  createdAt: Date
}): string {
  return `New contact form submission

From: ${inquiry.name} <${inquiry.email}>
Subject: ${inquiry.subject}
Received: ${inquiry.createdAt.toLocaleString('en-US')}

${inquiry.message}

View in admin: ${appUrl('/admin/inquiries')}

Movely — Driver-customer connection platform
hello@movelygo.com`
}
