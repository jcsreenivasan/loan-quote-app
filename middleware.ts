import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// When CLERK_SECRET_KEY is not configured (Phase 1 / no-auth deploy),
// the middleware simply passes every request through. Auth is activated
// automatically once the Clerk env vars are added.
export default process.env.CLERK_SECRET_KEY
  ? clerkMiddleware()
  : () => NextResponse.next()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
