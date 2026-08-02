import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailMessage {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  from,
  subject,
  html,
  text,
  replyTo,
}: EmailMessage): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[sendEmail] RESEND_API_KEY not set; skipping send')
    return
  }

  const { error } = await resend.emails.send({
    from: from || 'Movely <hello@mail.movelygo.com>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    replyTo,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
