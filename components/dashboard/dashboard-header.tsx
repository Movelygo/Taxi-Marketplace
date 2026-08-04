'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/modules/auth/actions/logout'

interface DashboardHeaderProps {
  userEmail: string
  /**
   * When true, shows the admin entry in the account menu.
   * The link itself is still protected by the admin layout.
   */
  isAdmin?: boolean
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/reviews', label: 'Reviews' },
]

/**
 * Authenticated app shell header used by all (dashboard) pages.
 *
 * Keeps a familial relationship with the public Navbar (same brand,
 * same height, same sticky behavior) but makes it clear the user is
 * inside the product, not on a marketing page.
 */
export function DashboardHeader({ userEmail, isAdmin = false }: DashboardHeaderProps) {
  const pathname = usePathname()
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)

  // Close menus on route change
  useEffect(() => {
    setAccountOpen(false)
    setMobileOpen(false)
  }, [pathname])

  // Click-outside for account menu
  useEffect(() => {
    if (!accountOpen) return
    function onDown(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [accountOpen])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 group">
            <Image
              src="/logo/logo.png"
              alt="Movely"
              width={120}
              height={32}
              priority
              className="h-7 sm:h-8 w-auto"
            />
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-gray-400 border-l border-gray-200 pl-2">
              Dashboard
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#0B1F3D] bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/drivers"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Browse drivers
            </Link>
          </nav>

          {/* Desktop account menu */}
          <div className="hidden md:block relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-haspopup="true"
              aria-expanded={accountOpen}
            >
              <div className="w-7 h-7 rounded-full bg-[#0B1F3D] text-white text-xs font-bold flex items-center justify-center">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[160px] truncate">{userEmail}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Signed in as</p>
                  <p className="text-sm text-gray-900 truncate">{userEmail}</p>
                </div>
                <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Edit profile
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Admin console
                  </Link>
                )}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <span className="text-base font-bold text-gray-900">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? 'text-[#0B1F3D] bg-gray-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/drivers"
                className="block px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Browse drivers
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="block px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Admin console
                </Link>
              )}
            </nav>

            <div className="px-5 py-4 border-t border-gray-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Signed in as</p>
              <p className="text-sm text-gray-900 truncate mb-3">{userEmail}</p>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
