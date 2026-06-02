import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth.edge';

export default auth((req) => {
    const { nextUrl } = req;
    const token = req.auth;
    const isAuthenticated = !!token;

    // 1. Handle Health Checks early
    if (nextUrl.pathname === '/api/health') {
        return NextResponse.next();
    }

    // Redirect root URL to sign-in page (or dashboard if already authenticated)
    if (nextUrl.pathname === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // 2. Extract Tenant (Slug)
    // Extract subdomain or x-tenant-slug header
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    const tenantSlug = !isLocalhost
        ? hostname.split('.')[0]
        : req.headers.get('x-tenant-slug');

    const isDashboard = nextUrl.pathname.startsWith('/dashboard');

    if (isDashboard && !isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (isDashboard && isAuthenticated && token?.user?.role !== 'restaurant_owner' && token?.user?.role !== 'system_admin') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Pass tenant context via header for server-side use
    const response = NextResponse.next();
    if (tenantSlug) {
        response.headers.set('x-tenant-slug', tenantSlug);
    }

    return response;
});

export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
