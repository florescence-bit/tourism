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
import { onAuthChange } from '@/lib/firebaseClient';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  // Whether component has mounted on client (prevents hydration mismatch)
  const [mounted, setMounted] = useState(false);

  // Current authenticated user or null
  const [user, setUser] = useState<any>(null);

  // Whether auth state is still loading
  const [authLoading, setAuthLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Check if current page is /auth
  const isAuthPage = pathname === '/auth';

  /**
   * Check authentication status on mount and subscribe to changes.
   * Redirect to /auth if user is not authenticated (except when already on /auth).
   */
  useEffect(() => {
    setMounted(true);

    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      // If user signed out AND not on auth page, redirect to /auth
      if (!currentUser && !isAuthPage) {
        console.debug('[AppLayout] User not authenticated, redirecting to /auth');
        router.push('/auth');
      }
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router, isAuthPage]);

  // Show loading state while checking authentication
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // On /auth page: allow unauthenticated users, show full layout with sidebar and header
  // On other pages: only show if authenticated
  if (!user && !isAuthPage) {
    return null;
  }

  // Render layout with sidebar and header for all authenticated pages
  // Also render for /auth page (even if not authenticated)
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
