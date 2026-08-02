import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Coming Soon gate — when NEXT_PUBLIC_SITE_STATUS=coming_soon (set only in
  // the Vercel Production environment), the public site shows a standalone
  // Coming Soon page. The real app stays fully accessible on the
  // staging/preview environment where this env var is unset.
  if (process.env.NEXT_PUBLIC_SITE_STATUS === 'coming_soon') {
    const { pathname } = request.nextUrl
    // Keep the auth callback functional so Supabase email links never break
    if (pathname === '/auth/callback' || pathname.startsWith('/auth/')) {
      // fall through to the normal session-refresh logic below
    } else if (pathname === '/') {
      return NextResponse.rewrite(new URL('/coming-soon', request.url))
    } else if (pathname === '/coming-soon') {
      return NextResponse.next()
    } else {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - this happens automatically
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard - requires authenticated user
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }
  }

  // Protect /admin - requires authenticated user (role check in layout)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
