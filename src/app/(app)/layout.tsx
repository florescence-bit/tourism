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
   */
  useEffect(() => {
    setMounted(true);

    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

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
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router, pathname]);

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

  // On /auth page: allow unauthenticated users to access (public page)
  // Show full layout (sidebar, header, content)
  if (isAuthPage) {
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

  // On protected routes (dashboard, check-in, etc):
  // Only show if user is authenticated
  if (!user) {
    // User will be redirected by useEffect, show nothing while redirecting
    return null;
  }

  // User is authenticated; render protected layout with sidebar and header
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
