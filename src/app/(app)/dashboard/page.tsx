/**
 * @file src/app/(app)/dashboard/page.tsx
 * @description Main dashboard page showing safety status, recent check-ins, and quick actions.
 * Features:
 * - Displays live user location on interactive map
 * - Shows quick stats: last check-in, threat level, total check-ins from Firebase
 * - Lists recent check-in history from Firestore
 * - Quick action buttons (Check-In, Digital ID, Report)
 * - Threat level calculated based on getUserAnalytics data
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import useLiveLocation from '@/lib/useLiveLocation';
import { onAuthChange, getUserAnalytics, listCheckIns } from '@/lib/firebaseClient';
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
  MAX_RECENT_CHECKINS,
  DASHBOARD_WELCOME,
  DASHBOARD_SUBTITLE,
} from '@/lib/constants';

// ============================================================================
// TYPES
// ============================================================================

interface DisplayCheckin {
  id: string;
  location: string;
  time: string;
  status: string;
}

interface ThreatInfo {
  level: 'Safe' | 'Caution' | 'Warning' | 'Danger';
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentCheckins, setRecentCheckins] = useState<DisplayCheckin[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, any>>({
    totalCheckIns: 0,
    safetyScore: 0,
    threatLevel: 'Safe',
  });

  // Subscribe to auth state and load data
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          // Load analytics
          const analyticsData = await getUserAnalytics(u.uid);
          setAnalytics(analyticsData);

          // Load recent check-ins
          const checkIns = await listCheckIns(u.uid);
          const mapped = checkIns.slice(0, MAX_RECENT_CHECKINS).map((c: any) => ({
            id: c.id,
            location: c.place || `${c.latitude?.toFixed(5)}, ${c.longitude?.toFixed(5)}` || 'Unknown location',
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Unknown time',
            status: 'Logged',
          }));

          // Add live location if available
          const liveEntry = position
            ? {
                id: 'live',
                location:
                  position.place ||
                  `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`,
                time: 'Just now',
                status: 'Live',
              }
            : null;

          const list = liveEntry
            ? [liveEntry, ...mapped]
            : mapped.length > 0 ? mapped : [];

          setRecentCheckins(list);
        } catch (err) {
          console.error('[Dashboard] Error loading data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setRecentCheckins([]);
      }
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, [position]);

  const getThreatLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'text-green-400';
      case 'caution': return 'text-yellow-400';
      case 'warning': return 'text-orange-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-800 rounded w-1/2"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-3xl"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2">{user ? DASHBOARD_WELCOME : 'Welcome to RAH'}</h1>
        <p className="text-gray-600">{user ? DASHBOARD_SUBTITLE : 'Please sign in to access your dashboard'}</p>
      </div>

      {!user ? (
        <div className="p-8 bg-blue-900 border border-blue-700 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <p className="text-lg font-semibold mb-2">Sign in to access your dashboard</p>
          <p className="text-sm text-blue-300">Please sign in to see your safety stats, check-in history, and threat level.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Clock size={24} />}
              label="Last Check-In"
              value={recentCheckins[0]?.time ?? '—'}
              detail={recentCheckins[0]?.location ?? 'No check-ins yet'}
            />

            <StatCard
              icon={<Shield size={24} />}
              label="Threat Level"
              value={analytics.threatLevel || 'Safe'}
              detail={`Safety Score: ${analytics.safetyScore?.toFixed(0) || 0}/100`}
              valueColor={getThreatLevelColor(analytics.threatLevel)}
            />

            <StatCard
              icon={<AlertCircle size={24} />}
              label="Total Check-Ins"
              value={`${analytics.totalCheckIns || 0}`}
              detail={`${analytics.recentCheckIns30Days || 0} in last 30 days`}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      checkin.status === 'Live'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-gray-800 text-gray-300'
                    }`}>
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
        </>
      )}
    </div>
  );
}
