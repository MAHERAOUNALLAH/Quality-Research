import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This MUST be named "middleware" and it MUST be exported
export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('user-role')?.value;
  const isPathAdmin = request.nextUrl.pathname.startsWith('/admin');

  if (isPathAdmin) {
    // Only allow admin or superadmin
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// This tells Next.js where to run the code
export const config = {
  matcher: ['/admin/:path*'],
};