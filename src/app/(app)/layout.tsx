/**
 * @file src/app/(app)/layout.tsx
 * @description Layout for app routes (dashboard, check-in, auth, etc).
 * Features:
 * - Sidebar navigation
 * - Header with user info and notifications
 * - Allows public access to /auth for unauthenticated users
 * - Checks authentication status; redirects to /auth if not authenticated (except on /auth page itself)
 * - Main content area with flexible overflow handling
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthChange, isFirebaseConfigured } from '@/lib/firebaseClient';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  // Current authenticated user or null
  const [user, setUser] = useState<any>(null);

  // Whether auth state is still loading
  const [authLoading, setAuthLoading] = useState(true);

  // Whether component has mounted on client
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Check if current page is /auth
  const isAuthPage = pathname === '/auth';

  /**
   * Check authentication status on mount and subscribe to changes.
   * Redirect to /auth if user is not authenticated (except when already on /auth).
   * Timeout after 5 seconds to prevent infinite loading (e.g., if Firebase config is missing).
   */
  useEffect(() => {
    setMounted(true);

    // Safety timeout: if auth check takes more than 5 seconds, assume user is not authenticated
    // This prevents infinite loading on Vercel if Firebase environment variables are not configured
    const timeoutId = setTimeout(() => {
      if (authLoading) {
        console.warn('[AppLayout] Auth check timeout - assuming user not authenticated');
        setAuthLoading(false);
        // If not on /auth or home, redirect to /auth
        if (pathname !== '/auth' && pathname !== '/') {
          router.push('/auth');
        }
      }
    }, 5000);

    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      clearTimeout(timeoutId);

      // Only redirect if:
      // 1. User is NOT authenticated
      // 2. NOT on the /auth page (allow unauthenticated access to /auth)
      // 3. NOT on home page (home page is public)
      if (!currentUser && pathname !== '/auth' && pathname !== '/') {
        console.debug('[AppLayout] User not authenticated, redirecting to /auth');
        router.push('/auth');
      }
    });

    return () => {
      clearTimeout(timeoutId);
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router, pathname, authLoading]);

  // Show loading state while checking authentication
  // If Firebase is not configured on this deployment, show a helpful message
  if (!isFirebaseConfigured()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-primary text-text-primary px-6">
        <div className="max-w-md text-center animate-fade-in">
          <div className="mb-6 text-4xl">⚙️</div>
          <h2 className="text-title mb-4">Application Not Configured</h2>
          <p className="text-body mb-4">
            Firebase configuration is missing in this deployment. Authentication is unavailable.
            Please configure the required environment variables (NEXT_PUBLIC_FIREBASE_*) in your
            deployment settings (Vercel) and redeploy.
          </p>
          <p className="text-caption text-text-tertiary">
            If you are the project owner, see project documentation for setup steps.
          </p>
        </div>
      </div>
    );
  }

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-primary">
        <div className="text-center animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-surface-tertiary border-t-accent-blue animate-spin"></div>
            </div>
          </div>
          <p className="text-text-secondary font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // On /auth page: allow unauthenticated users to access (public page)
  // Show full layout (sidebar, header, content)
  if (isAuthPage) {
    return (
      <div className="flex h-screen bg-surface-primary text-text-primary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-gradient-to-b from-surface-primary to-surface-secondary">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // On protected routes (dashboard, check-in, etc):
  // Only show if user is authenticated
  if (!user) {
    // User will be redirected by useEffect, show nothing while redirecting
    return null;
  }

  // User is authenticated; render protected layout with sidebar and header
  return (
    <div className="flex h-screen bg-surface-primary text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-surface-primary to-surface-secondary">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
