import Link from 'next/link'
import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { NavLinks, MobileMenu } from './nav-links'

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3D] flex items-center justify-center group-hover:bg-[#001F3F] transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Movely</span>
          </Link>

          {/* Desktop Navigation Links */}
          <NavLinks />

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F] transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F] transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <MobileMenu isAuthenticated={!!user} />
        </div>
      </div>
    </nav>
  )
}
