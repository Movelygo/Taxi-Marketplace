import { buildWelcomeEmailHtml } from '@/lib/email/templates/welcome-email'
import { buildDriverStatusNotificationHtml } from '@/lib/email/templates/driver-status-notification'
import { buildInquiryAdminNotificationHtml } from '@/lib/email/templates/inquiry-admin-notification'
import Link from 'next/link'

export const metadata = {
  title: 'Email Previews | Dev',
}

const TEMPLATES = [
  { slug: 'welcome', label: 'Welcome Email' },
  { slug: 'driver-approved', label: 'Driver Approved' },
  { slug: 'driver-rejected', label: 'Driver Rejected' },
  { slug: 'driver-suspended', label: 'Driver Suspended' },
  { slug: 'inquiry', label: 'Inquiry Admin Notification' },
]

function getHtml(slug: string): string {
  switch (slug) {
    case 'welcome':
      return buildWelcomeEmailHtml({ email: 'john@example.com' })
    case 'driver-approved':
      return buildDriverStatusNotificationHtml({
        displayName: "John's Taxi Service",
        status: 'APPROVED',
        slug: 'johns-taxi-service',
      })
    case 'driver-rejected':
      return buildDriverStatusNotificationHtml({
        displayName: "John's Taxi Service",
        status: 'REJECTED',
        slug: 'johns-taxi-service',
      })
    case 'driver-suspended':
      return buildDriverStatusNotificationHtml({
        displayName: "John's Taxi Service",
        status: 'SUSPENDED',
        slug: 'johns-taxi-service',
      })
    case 'inquiry':
      return buildInquiryAdminNotificationHtml({
        name: 'Jane Customer',
        email: 'jane@example.com',
        subject: 'Question about airport pickup',
        message: 'Hi, do you offer service from BWI to downtown Baltimore? I need a ride next Friday at 6 AM.',
        id: 'test-id',
        createdAt: new Date(),
      })
    default:
      return '<p>Template not found</p>'
  }
}

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const { template: selected } = await searchParams
  const current = selected || 'welcome'
  const html = getHtml(current)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-[#0B1F3D] text-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight">Email Preview</h1>
            <p className="text-xs text-white/50">Dev only — delete before launch</p>
          </div>
          <Link href="/" className="text-xs text-white/60 hover:text-white">&larr; Back to site</Link>
        </div>
      </div>

      {/* Template selector */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {TEMPLATES.map((t) => (
            <Link
              key={t.slug}
              href={`/dev/emails?template=${t.slug}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                current === t.slug
                  ? 'bg-[#0B1F3D] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B1F3D] hover:text-[#0B1F3D]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Email render in iframe */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rendered HTML</span>
            <span className="text-xs text-gray-400">600px max-width (email standard)</span>
          </div>
          <iframe
            srcDoc={html}
            className="w-full"
            style={{ minHeight: '900px', border: 'none', display: 'block' }}
            title="Email preview"
            sandbox=""
          />
        </div>
      </div>
    </div>
  )
}
