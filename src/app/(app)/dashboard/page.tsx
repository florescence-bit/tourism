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
  valueColor = 'text-accent-blue',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  valueColor?: string;
}): ReactNode {
  return (
    <div className="card-elevated hover:shadow-elevation3 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="label-base text-text-tertiary">{label}</div>
          <div className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</div>
          <div className="text-caption text-text-tertiary mt-3">{detail}</div>
        </div>
        <div className="p-3 bg-surface-tertiary rounded-xl text-text-secondary group-hover:text-accent-blue transition-smooth">{icon}</div>
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
      className="card-interactive group block"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-surface-tertiary group-hover:bg-accent-blue/20 rounded-xl transition-smooth text-text-secondary group-hover:text-accent-blue">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-text-primary mb-2">{label}</h3>
      <p className="text-caption text-text-tertiary">{description}</p>
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
          <div className="h-12 bg-surface-tertiary rounded w-1/2"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-tertiary rounded-xl"></div>
            ))}
          </div>
          <div className="h-80 bg-surface-tertiary rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <div className="mb-12 animate-fade-in">
        <h1 className="text-headline mb-3">{user ? DASHBOARD_WELCOME : 'Welcome to RAH'}</h1>
        <p className="text-subtitle text-text-secondary">{user ? DASHBOARD_SUBTITLE : 'Please sign in to access your dashboard'}</p>
      </div>

      {!user ? (
        <div className="alert-info rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Sign in to access your dashboard</p>
          <p className="text-sm">Please sign in to see your safety stats, check-in history, and threat level.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Clock size={24} />}
              label="Last Check-In"
              value={recentCheckins[0]?.time ?? '—'}
              detail={recentCheckins[0]?.location ?? 'No check-ins yet'}
              valueColor="text-accent-blue"
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
              valueColor="text-accent-green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 card-elevated">
              <h2 className="text-title font-bold mb-6">Your Location</h2>
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

          <div className="card-elevated">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-accent-blue" />
              <h2 className="text-title font-bold">Recent Check-Ins</h2>
            </div>
            <div className="space-y-3">
              {recentCheckins.length > 0 ? (
                recentCheckins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex items-center justify-between p-4 bg-surface-secondary hover:bg-surface-tertiary rounded-lg border border-surface-tertiary transition-smooth"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <MapPin size={16} className="text-accent-blue" />
                        {checkin.location}
                      </div>
                      <div className="text-sm text-text-tertiary mt-2">{checkin.time}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                      checkin.status === 'Live'
                        ? 'badge-success'
                        : 'badge-primary'
                    }`}>
                      ✓ {checkin.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-text-tertiary py-8">
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
