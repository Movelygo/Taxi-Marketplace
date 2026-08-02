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

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h1 style="color: #0B1F3D; font-size: 20px; margin-bottom: 16px;">New contact form submission</h1>
      <p style="font-size: 14px; color: #6B7280; margin-bottom: 24px;">Received on ${date}</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; width: 100px;">From</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">${escapeHtml(inquiry.name)} &lt;${escapeHtml(inquiry.email)}&gt;</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Subject</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">${escapeHtml(inquiry.subject)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; vertical-align: top;">Message</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</td>
        </tr>
      </table>

      <p style="margin-top: 24px; font-size: 14px;">
        <a href="${appUrl('/admin/inquiries')}" style="color: #0B1F3D; font-weight: 600; text-decoration: underline;">View in admin inbox</a>
      </p>

      <p style="margin-top: 32px; font-size: 12px; color: #6B7280;">
        Movely — Driver-customer connection platform
      </p>
    </div>
  `
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
