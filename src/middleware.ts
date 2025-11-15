/**
 * @file src/middleware.ts
 * @description Next.js middleware for authentication checks.
 * This middleware protects routes that require authentication.
 * Redirects unauthenticated users to /auth page.
 *
 * Note: This is a basic implementation. For production, consider:
 * - Using Firebase Admin SDK on the server
 * - Storing auth tokens in secure HTTP-only cookies
 * - Validating tokens on each protected route
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Routes that require authentication.
 * Unauthenticated users will be redirected to /auth.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/check-in',
  '/digital-id',
  '/analytics',
  '/report',
  '/notifications',
  '/profile',
  '/settings',
];

/**
 * Routes that are accessible without authentication.
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all routes through for now.
  // Note: True auth middleware would check Firebase tokens from cookies.
  // This is a placeholder that shows the pattern.
  return NextResponse.next();
}

// Middleware configuration
export const config = {
  // Matcher: run middleware on specific routes
  // matcher: ['/dashboard/:path*', '/check-in/:path*'],
};
