'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, MapPin, CreditCard, BarChart3, AlertCircle, User, Bell, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    router.push('/auth');
  }

  return (
    <aside className="hidden md:flex w-72 bg-surface-primary border-r border-surface-tertiary flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-surface-tertiary">
        <Link href="/" className="flex items-center hover:opacity-80 transition-smooth">
          <Image 
            src="/assets/logo.png" 
            alt="RAH Logo" 
            width={120} 
            height={60}
            priority
          />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-1">
        <SidebarLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
        <SidebarLink href="/check-in" label="Check-In" icon={<MapPin size={20} />} />
        <SidebarLink href="/digital-id" label="Digital ID" icon={<CreditCard size={20} />} />
        <SidebarLink href="/analytics" label="Analytics" icon={<BarChart3 size={20} />} />
        <SidebarLink href="/report" label="Report" icon={<AlertCircle size={20} />} />
        <SidebarLink href="/notifications" label="Notifications" icon={<Bell size={20} />} />
        <SidebarLink href="/profile" label="Profile" icon={<User size={20} />} />
        <SidebarLink href="/settings" label="Settings" icon={<Settings size={20} />} />
      </nav>

      <div className="border-t border-surface-tertiary p-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-xl transition-smooth duration-300 group font-medium"
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-3 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-smooth duration-200 group">
      <span className="text-text-tertiary group-hover:text-accent-blue transition-smooth">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
