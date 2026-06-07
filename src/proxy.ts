import NextAuth from 'next-auth'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register'
  const isPublicPage = nextUrl.pathname === '/' || isAuthPage

  if (!isLoggedIn && !isPublicPage) {
    return Response.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/dashboard', nextUrl))
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - google images / favicons or similar external assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
