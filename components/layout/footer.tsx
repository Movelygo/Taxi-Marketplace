import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0B1F3D] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Movely</span>
            </Link>
            <p className="text-sm text-white/60 mt-4 leading-relaxed">
              The simple way to find and connect with independent drivers in your area.
            </p>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">For Customers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/drivers" className="text-white/70 hover:text-amber-400 transition-colors">
                  Browse Drivers
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-white/70 hover:text-amber-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Drivers */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">For Drivers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/for-drivers" className="text-white/70 hover:text-amber-400 transition-colors">
                  Why Join
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-white/70 hover:text-amber-400 transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white/70 hover:text-amber-400 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:hello@movelygo.com"
                  className="text-white/70 hover:text-amber-400 transition-colors"
                >
                  hello@movelygo.com
                </a>
              </li>
              <li>
                <Link href="/driver-guidelines" className="text-white/70 hover:text-amber-400 transition-colors">
                  Driver Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {year} Movely. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Serving the Maryland, Baltimore, and DC area.
          </p>
        </div>
      </div>
    </footer>
  )
}
