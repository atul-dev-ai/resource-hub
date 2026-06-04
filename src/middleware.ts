import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/student-portal') || request.nextUrl.pathname.startsWith('/admin-portal')

  if (isProtectedRoute && !user) {
    // Redirect to login if trying to access protected routes without being authenticated
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect /student-portal/dashboard to /student-portal
  if (request.nextUrl.pathname === '/student-portal/dashboard' || request.nextUrl.pathname === '/admin-portal/dashboard') {
    return NextResponse.redirect(new URL(request.nextUrl.pathname.replace('/dashboard', ''), request.url))
  }

  // Optional: Redirect authenticated users away from login/signup pages
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/student-portal', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/student-portal/:path*',
    '/admin-portal/:path*',
    '/login',
    '/signup'
  ],
}
