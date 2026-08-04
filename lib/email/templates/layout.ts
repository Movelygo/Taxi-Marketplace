/**
 * Movely — Reusable email template system
 *
 * Provides a branded HTML email layout and helper components so every
 * transactional email shares a consistent visual identity.
 *
 * Design principles:
 * - Table-based layout (max email client compatibility)
 * - Inline styles only (email clients strip <style> tags)
 * - Brand colors: #0B1F3D (primary), #F8F9FA (surface), #6B7280 (muted)
 * - System font stack (no external fonts loaded)
 * - 600px max-width (standard email width)
 * - Dark header band with logo + brand name
 * - Content card on light surface
 * - Footer with brand + contact
 */

// ── Brand constants ──────────────────────────────────────────

const BRAND = {
  name: 'Movely',
  primary: '#0B1F3D',
  primaryDark: '#001F3F',
  surface: '#F8F9FA',
  cardBg: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#F59E0B', // amber-500 — for highlights
  success: '#10B981',
  danger: '#EF4444',
  fontStack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

// ── Helpers ──────────────────────────────────────────────────

export function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://staging.movelygo.com'
  return `${base}${path}`
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ── Layout wrapper ───────────────────────────────────────────

export interface EmailLayoutProps {
  /** Pre-header text (shown in email preview, hidden in body) */
  preheader?: string
  /** Main heading displayed in the dark header band */
  headerTitle: string
  /** Optional subheading under the header title */
  headerSubtitle?: string
  /** HTML content for the body section */
  body: string
  /** Optional accent color for the header band (defaults to brand primary) */
  headerBg?: string
}

/**
 * Wraps content in the full Movely branded email shell.
 * Every template should use this as the outermost wrapper.
 */
export function emailLayout({
  preheader,
  headerTitle,
  headerSubtitle,
  body,
  headerBg = BRAND.primary,
}: EmailLayoutProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(headerTitle)}</title>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.surface};opacity:0;">${escapeHtml(preheader)}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:${BRAND.fontStack};-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper: centers on desktop -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.surface};min-height:100vh;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Email container: 600px max -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.cardBg};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- ── Header band ── -->
          <tr>
            <td style="background-color:${headerBg};padding:32px 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:20px;font-weight:900;color:#FFFFFF;letter-spacing:-0.02em;line-height:1.2;">
                      ${BRAND.name}
                    </div>
                    <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">
                      Driver Directory
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:24px;">
                    <h1 style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;line-height:1.3;">
                      ${escapeHtml(headerTitle)}
                    </h1>
                    ${headerSubtitle ? `<p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.5;">${escapeHtml(headerSubtitle)}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:32px 40px 8px;background-color:${BRAND.cardBg};">
              ${body}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:24px 40px 32px;background-color:${BRAND.cardBg};border-top:1px solid ${BRAND.border};">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${BRAND.primary};">
                ${BRAND.name}
              </p>
              <p style="margin:0 0 4px;font-size:12px;color:${BRAND.textSecondary};line-height:1.5;">
                Driver-customer connection platform
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.textSecondary};line-height:1.5;">
                <a href="mailto:hello@movelygo.com" style="color:${BRAND.textSecondary};text-decoration:none;">hello@movelygo.com</a>
                &nbsp;&middot;&nbsp;
                <a href="${appUrl('/drivers')}" style="color:${BRAND.textSecondary};text-decoration:none;">Browse drivers</a>
                &nbsp;&middot;&nbsp;
                <a href="${appUrl('/privacy')}" style="color:${BRAND.textSecondary};text-decoration:none;">Privacy</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Below-card note (unsubscribe, etc. — currently empty) -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:16px 0;font-size:11px;color:#9CA3AF;">
              &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Reusable body components ─────────────────────────────────

/** A paragraph with standard body text styling */
export function text(content: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.textPrimary};">${content}</p>`
}

/** A section heading within the body */
export function heading(content: string): string {
  return `<h2 style="margin:0 0 12px;font-size:17px;font-weight:800;color:${BRAND.primary};letter-spacing:-0.01em;">${content}</h2>`
}

/** A primary CTA button (dark, full-width on mobile) */
export function buttonPrimary(href: string, label: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${href}" style="display:inline-block;padding:14px 32px;background-color:${BRAND.primary};color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:-0.01em;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`
}

/** A secondary link (inline, underlined) */
export function link(href: string, label: string): string {
  return `<a href="${href}" style="color:${BRAND.primary};font-weight:600;text-decoration:underline;">${escapeHtml(label)}</a>`
}

/** A divider line */
export function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BRAND.border};margin:24px 0;">`
}

/** An info callout box (light surface with left border accent) */
export function callout(content: string, variant: 'info' | 'success' | 'warning' = 'info'): string {
  const colors = {
    info: { bg: '#F0F4FF', border: '#3B82F6', text: '#1E40AF' },
    success: { bg: '#ECFDF5', border: BRAND.success, text: '#065F46' },
    warning: { bg: '#FFFBEB', border: BRAND.accent, text: '#92400E' },
  }
  const c = colors[variant]
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="background-color:${c.bg};border-left:3px solid ${c.border};border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:${c.text};">${content}</p>
        </td>
      </tr>
    </table>`
}

/** A key-value data table (for inquiry details, etc.) */
export function dataTable(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.textSecondary};font-size:13px;font-weight:600;width:120px;vertical-align:top;">
          ${escapeHtml(r.label)}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.textPrimary};font-size:14px;font-weight:500;white-space:pre-wrap;">
          ${escapeHtml(r.value)}
        </td>
      </tr>`,
    )
    .join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      ${rowsHtml}
    </table>`
}
