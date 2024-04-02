// middleware.ts

// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import { NextResponse } from 'next/server';

// const isProtectedRoute = createRouteMatcher(['/', '/((?!api).*)']);

// export default clerkMiddleware((auth, request) => {
//   if (isProtectedRoute(request)) {
//     auth().protect();
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ['/', '/((?!api|_next/static|public).*)'],
// };

import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;

  // Exclude paths starting with /api, /_next/static, and /public from protection.
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next/static') && !pathname.startsWith('/public')) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: '/:path*', // Match all paths
  debug: true,
};