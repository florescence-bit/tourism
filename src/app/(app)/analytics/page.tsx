'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Shield, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { onAuthChange, getUserAnalytics, getProfile } from '@/lib/firebaseClient';

export default function Analytics() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Record<string, any>>({
    totalCheckIns: 0,
    recentCheckIns30Days: 0,
    totalReports: 0,
    safetyScore: 0,
    threatLevel: 'Safe',
    lastCheckInAt: null,
    checkInsPerDay: [],
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const data = await getUserAnalytics(u.uid);
          setAnalytics(data);
          
          const userProfile = await getProfile(u.uid);
          setProfile(userProfile || {});
        } catch (err) {
          console.error('[Analytics] Error loading analytics:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-8 w-full max-w-5xl">
          <div className="h-10 bg-surface-secondary rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-secondary rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-secondary rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-headline text-white mb-2">Analytics</h1>
            <p className="text-subtitle text-text-secondary">Your safety insights</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to view analytics</p>
            <p className="text-sm text-text-secondary">
              Please sign in to see your safety analytics and insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-headline text-white mb-2">Analytics</h1>
            <p className="text-subtitle text-text-secondary">Your safety insights</p>
          </div>
          
          {profile?.fullName && (
            <div className="card-base p-4 border border-accent-purple/30 bg-gradient-to-r from-accent-purple/10 to-transparent flex items-center gap-3">
              <div className="p-3 bg-surface-secondary rounded-lg">
                <User size={20} className="text-accent-purple" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Analytics for</p>
                <p className="text-white font-semibold">{profile.fullName}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Total Check-ins</h3>
              <Shield size={20} className="text-accent-blue" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalCheckIns || 0}</p>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Last 30 Days</h3>
              <TrendingUp size={20} className="text-accent-green" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.recentCheckIns30Days || 0}</p>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Reports Filed</h3>
              <AlertCircle size={20} className="text-accent-orange" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalReports || 0}</p>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Safety Score</h3>
              <BarChart3 size={20} className="text-accent-purple" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.safetyScore || 0}%</p>
          </div>
        </div>

        <div className="card-base p-6 border border-surface-secondary/50 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Check-in Trend</h2>
          {analytics.checkInsPerDay && analytics.checkInsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.checkInsPerDay}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #4a5568',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-secondary text-center py-12">No data available yet</p>
          )}
        </div>

        <div className="card-base p-6 border border-surface-secondary/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Threat Level</h3>
              <p className="text-sm text-text-secondary">Current safety status</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              analytics.threatLevel === 'Safe'
                ? 'bg-accent-green/20 text-accent-green'
                : analytics.threatLevel === 'Caution'
                ? 'bg-accent-orange/20 text-accent-orange'
                : 'bg-accent-red/20 text-accent-red'
            }`}>
              {analytics.threatLevel || 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
