import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader userEmail={user.email} isAdmin={user.role === 'ADMIN'} />

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">© {year} Movely</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
              Support
            </Link>
            <Link href="/driver-guidelines" className="hover:text-gray-900 transition-colors">
              Driver guidelines
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
