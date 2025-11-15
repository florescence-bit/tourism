"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { onAuthChange, signOut } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
    <header className="bg-surface-secondary border-b border-surface-tertiary sticky top-0 z-40 backdrop-blur-md glass-effect">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 hover:bg-surface-tertiary rounded-lg transition-smooth text-text-primary" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-title font-bold">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 hover:bg-surface-tertiary rounded-xl transition-smooth relative group text-text-secondary hover:text-text-primary"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full animate-pulse"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-72 bg-surface-secondary border border-surface-tertiary rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-down">
                <div className="p-4 border-b border-surface-tertiary bg-surface-primary">
                  <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    <div className="p-3 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
                      <p className="text-sm font-medium text-text-primary">Welcome to RAH!</p>
                      <p className="text-xs text-text-secondary mt-1">Your safety companion is now active</p>
                      <p className="text-xs text-text-tertiary mt-2">Just now</p>
                    </div>
                    <div className="p-3 bg-accent-green/10 rounded-lg border border-accent-green/20">
                      <p className="text-sm font-medium text-text-primary">Check-in Successful</p>
                      <p className="text-xs text-text-secondary mt-1">Your location has been shared with your contacts</p>
                      <p className="text-xs text-text-tertiary mt-2">2 hours ago</p>
                    </div>
                    <div className="p-3 bg-surface-tertiary rounded-lg border border-surface-secondary">
                      <p className="text-sm text-text-secondary">No more notifications</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-surface-tertiary bg-surface-primary">
                  <Link 
                    href="/notifications" 
                    className="text-xs text-accent-blue hover:text-accent-blue/80 font-medium transition"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-surface-tertiary rounded-xl border border-surface-tertiary/50 group">
            {user ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xs font-bold text-white">
                  {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary leading-tight">{user.displayName ?? user.email ?? 'User'}</p>
                  <p className="text-xs text-text-tertiary">Authenticated</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-surface-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">G</div>
                <div>
                  <p className="text-sm font-semibold text-text-primary leading-tight">Guest</p>
                  <p className="text-xs text-text-tertiary">Not signed in</p>
                </div>
              </>
            )}
          </div>

          {user ? (
            <button onClick={() => handleSignOut()} className="btn-secondary text-sm">Sign out</button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth" className="btn-primary text-sm">Sign In / Up</Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-surface-tertiary border-t border-surface-tertiary/50 p-4 space-y-2 animate-slide-down">
          <MobileMenuLink href="/dashboard" label="Dashboard" />
          <MobileMenuLink href="/check-in" label="Check-In" />
          <MobileMenuLink href="/digital-id" label="Digital ID" />
          <MobileMenuLink href="/analytics" label="Analytics" />
          <MobileMenuLink href="/report" label="Report" />
          <MobileMenuLink href="/notifications" label="Notifications" />
          <MobileMenuLink href="/profile" label="Profile" />
          <MobileMenuLink href="/settings" label="Settings" />
          {user ? (
            <button onClick={() => handleSignOut()} className="w-full text-left px-4 py-2 text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-smooth">Logout</button>
          ) : (
            <>
              <MobileMenuLink href="/auth" label="Sign In / Sign Up" />
            </>
          )}
        </div>
      )}
    </header>
  );
}

function MobileMenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-smooth font-medium">
      {label}
    </Link>
  );
}
