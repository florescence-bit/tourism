import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, MapPin, CreditCard, BarChart3, AlertCircle, User, Bell, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 bg-black border-r border-gray-800 flex-col">
      <div className="p-8 border-b border-gray-800">
        <Link href="/" className="flex items-center">
          <Image 
            src="/assets/logo.png" 
            alt="RAH Logo" 
            width={120} 
            height={60}
            priority
          />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-2">
        <SidebarLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
        <SidebarLink href="/check-in" label="Check-In" icon={<MapPin size={20} />} />
        <SidebarLink href="/digital-id" label="Digital ID" icon={<CreditCard size={20} />} />
        <SidebarLink href="/analytics" label="Analytics" icon={<BarChart3 size={20} />} />
  <SidebarLink href="/report" label="Report" icon={<AlertCircle size={20} />} />
  <SidebarLink href="/notifications" label="Notifications" icon={<Bell size={20} />} />
  <SidebarLink href="/profile" label="Profile" icon={<User size={20} />} />
  <SidebarLink href="/settings" label="Settings" icon={<Settings size={20} />} />
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-400 hover:text-white hover:bg-gray-900 rounded-2xl transition duration-300">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-gray-900 hover:text-white transition duration-300 group">
      <span className="text-gray-500 group-hover:text-white transition">{icon}</span>
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </Link>
  );
}
