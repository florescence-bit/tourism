/**
 * @file src/app/(app)/dashboard/page.tsx
 * @description Main dashboard page showing safety status, recent check-ins, and quick actions.
 * Features:
 * - Displays live user location on interactive map
 * - Shows quick stats: last check-in, threat level, saved check-ins count
 * - Lists recent check-in history from localStorage
 * - Quick action buttons (Check-In, Digital ID, Report)
 * - Threat level calculated based on recent check-in activity
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import useLiveLocation from '@/lib/useLiveLocation';
import Link from 'next/link';
import {
  MapPin,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  Shield,
} from 'lucide-react';

// Dynamically import SimpleMap with ssr: false to avoid server-side Leaflet issues
const SimpleMap = dynamic(() => import('@/components/map/SimpleMap'), {
  loading: () => <div className="rounded-3xl bg-gray-900 h-96 animate-pulse" />,
  ssr: false,
}) as any;
import {
  STORAGE_KEY_CHECKINS,
  MAX_RECENT_CHECKINS,
  THREAT_LEVEL_THRESHOLDS,
  DASHBOARD_WELCOME,
  DASHBOARD_SUBTITLE,
} from '@/lib/constants';

// ============================================================================
// TYPES
// ============================================================================

interface DisplayCheckin {
  id: number;
  location: string;
  time: string;
  status: string;
}

interface ThreatInfo {
  level: 'Low' | 'Medium' | 'High';
  color: string;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  detail,
  valueColor = 'text-white',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  valueColor?: string;
}): ReactNode {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-2 font-medium">{label}</div>
          <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
          <div className="text-sm text-gray-600 mt-2">{detail}</div>
        </div>
        <div className="p-3 bg-gray-900 rounded-2xl text-gray-400">{icon}</div>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  description: string;
}): ReactNode {
  return (
    <Link
      href={href}
      className="bg-gray-950 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 hover:bg-gray-900 transition block group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 bg-gray-900 group-hover:bg-gray-800 rounded-2xl transition text-gray-400">
          {icon}
        </div>
      </div>
      <h3 className="font-medium text-lg mb-1">{label}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Dashboard() {
  const { position } = useLiveLocation();
  const [recentCheckins, setRecentCheckins] = useState<DisplayCheckin[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHECKINS);
      const parsed = raw ? JSON.parse(raw) : [];

      const mapped = (parsed || []).map((p: any, i: number) => ({
        id: i + 1,
        location: p.location,
        time: p.time,
        status: 'Safe',
      }));

      const liveEntry = position
        ? {
            id: 0,
            location:
              position.place ||
              `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`,
            time: 'Just now',
            status: 'Safe',
          }
        : null;

      const list = liveEntry
        ? [liveEntry, ...mapped.slice(0, MAX_RECENT_CHECKINS - 1)]
        : mapped.length
          ? mapped.slice(0, MAX_RECENT_CHECKINS)
          : [
              {
                id: 1,
                location: 'Taj Mahal, Agra',
                time: '2 hours ago',
                status: 'Safe',
              },
              {
                id: 2,
                location: 'Gateway of India, Mumbai',
                time: '5 hours ago',
                status: 'Safe',
              },
              {
                id: 3,
                location: 'Hawa Mahal, Jaipur',
                time: '1 day ago',
                status: 'Safe',
              },
            ];

      setRecentCheckins(list);
    } catch (error) {
      console.error('[Dashboard] Error loading check-ins:', error);
    }
  }, [position]);

  const getSavedCheckinsCount = (): number => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHECKINS);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const getThreatLevel = (): ThreatInfo => {
    const count = getSavedCheckinsCount();
    if (count >= THREAT_LEVEL_THRESHOLDS.LOW) {
      return { level: 'Low', color: 'text-green-400' };
    } else if (count > THREAT_LEVEL_THRESHOLDS.MEDIUM) {
      return { level: 'Medium', color: 'text-yellow-400' };
    } else {
      return { level: 'High', color: 'text-red-400' };
    }
  };

  const threatInfo = getThreatLevel();
  const checkinsCount = getSavedCheckinsCount();

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2">{DASHBOARD_WELCOME}</h1>
        <p className="text-gray-600">{DASHBOARD_SUBTITLE}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Clock size={24} />}
          label="Last Check-In"
          value={recentCheckins[0]?.time ?? '—'}
          detail={recentCheckins[0]?.location ?? 'No recent check-ins'}
        />

        <StatCard
          icon={<Shield size={24} />}
          label="Threat Level"
          value={threatInfo.level}
          detail={
            checkinsCount
              ? `${checkinsCount} recent check-in${checkinsCount !== 1 ? 's' : ''}`
              : 'No recent activity'
          }
          valueColor={threatInfo.color}
        />

        <StatCard
          icon={<AlertCircle size={24} />}
          label="Saved Check-Ins"
          value={`${checkinsCount} records`}
          detail="Stored on this device"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-950 rounded-3xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Your Location</h2>
          <SimpleMap
            latitude={position?.lat ?? 28.6139}
            longitude={position?.lon ?? 77.209}
          />
        </div>

        <div className="space-y-4">
          <ActionButton
            href="/check-in"
            icon={<MapPin size={24} />}
            label="Check-In"
            description="Share your location"
          />
          <ActionButton
            href="/digital-id"
            icon={<CreditCard size={24} />}
            label="Digital ID"
            description="View ID card"
          />
          <ActionButton
            href="/report"
            icon={<AlertCircle size={24} />}
            label="Report"
            description="Report incident"
          />
        </div>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={24} />
          <h2 className="text-lg font-semibold">Recent Check-Ins</h2>
        </div>
        <div className="space-y-3">
          {recentCheckins.length > 0 ? (
            recentCheckins.map((checkin) => (
              <div
                key={checkin.id}
                className="flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 rounded-2xl border border-gray-800 transition"
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <MapPin size={16} />
                    {checkin.location}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{checkin.time}</div>
                </div>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                  ✓ {checkin.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No check-ins yet. Start by checking in your current location.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
