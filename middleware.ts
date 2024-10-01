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


// export function middleware(req: NextRequest) {
//   // Check if the request is for the webhook route
//   if (req.nextUrl.pathname === "/api/webhook") {
//     // Allow raw body (don't parse it)
//     req.headers.set("Content-Type", "application/json");
//     return NextResponse.next({
//       request: {
//         body: req.body,
//       },
//     });
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: "/api/webhook", // Apply middleware only to the /api/webhook route
// };