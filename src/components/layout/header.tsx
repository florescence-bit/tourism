"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Settings, LogOut, Bell } from 'lucide-react';
import { onAuthChange, signOut } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => { if (unsub && typeof unsub === 'function') unsub(); };
  }, []);

  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (e) {
      // ignore
    }
    // redirect to auth page after sign out
    router.push('/auth');
  }

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 hover:bg-gray-900 rounded-lg transition" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button className="p-2.5 hover:bg-gray-900 rounded-xl transition relative group">
            <Bell size={20} className="text-gray-400 group-hover:text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-xl group">
            {user ? (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                  {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{user.displayName ?? user.email ?? 'User'}</p>
                  <p className="text-xs text-gray-500">Authenticated</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">G</div>
                <div>
                  <p className="text-sm font-medium leading-tight">Guest</p>
                  <p className="text-xs text-gray-500">Not signed in</p>
                </div>
              </>
            )}
          </div>

          {user ? (
            <button onClick={() => handleSignOut()} className="px-3 py-2 rounded bg-gray-900 text-sm">Sign out</button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth" className="px-3 py-2 rounded bg-white text-black text-sm">Sign In / Up</Link>
            </div>
          )}

          <button className="p-2.5 hover:bg-gray-900 rounded-xl transition">
            <Settings size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 p-4 space-y-2">
          <MobileMenuLink href="/dashboard" label="Dashboard" />
          <MobileMenuLink href="/check-in" label="Check-In" />
          <MobileMenuLink href="/digital-id" label="Digital ID" />
          <MobileMenuLink href="/analytics" label="Analytics" />
          <MobileMenuLink href="/report" label="Report" />
          <MobileMenuLink href="/notifications" label="Notifications" />
          <MobileMenuLink href="/profile" label="Profile" />
          <MobileMenuLink href="/settings" label="Settings" />
          {user ? (
            <button onClick={() => handleSignOut()} className="w-full text-left px-4 py-2 text-gray-400 hover:text-white">Logout</button>
          ) : (
            <>
              <MobileMenuLink href="/auth" label="Sign In / Sign Up" />
              <MobileMenuLink href="/auth" label="Sign In" />
            </>
          )}
        </div>
      )}
    </header>
  );
}

function MobileMenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition">
      {label}
    </Link>
  );
}
