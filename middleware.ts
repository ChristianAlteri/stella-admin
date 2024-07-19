import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;
  // Exclude paths starting with /api, /_next/static, and /public from protection.
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next/static') && !pathname.startsWith('/public') && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up')) {
    auth().protect();
  }
  return NextResponse.next();
});

export const config = {
  matcher: '/:path*', // Match all paths
  debug: true,
};

// include middleware for login and register
// i want the middleware to only protect the login and register page
// for now, console.log("HEllOO")