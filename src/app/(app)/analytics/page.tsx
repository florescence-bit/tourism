'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Shield, User, Calendar } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const data = await getUserAnalytics(u.uid);
          console.log('[Analytics] Data received:', data);
          
          // Format checkInsPerDay for charts
          const formattedCheckIns = data.checkInsPerDay 
            ? Object.entries(data.checkInsPerDay).map(([date, count]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: count as number,
              }))
            : [];
          
          setAnalytics({
            ...data,
            checkInsPerDay: formattedCheckIns,
          });
          
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
      <div className="w-full max-w-6xl">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-headline text-white mb-2">Analytics</h1>
            <p className="text-subtitle text-text-secondary">Your safety insights and statistics</p>
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

        {/* KEY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-blue/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Total Check-ins</h3>
              <Shield size={20} className="text-accent-blue" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalCheckIns || 0}</p>
            <p className="text-xs text-text-secondary mt-2">All time</p>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-green/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Last 30 Days</h3>
              <TrendingUp size={20} className="text-accent-green" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.recentCheckIns30Days || 0}</p>
            <p className="text-xs text-text-secondary mt-2">Check-ins</p>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-orange/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Reports Filed</h3>
              <AlertCircle size={20} className="text-accent-orange" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalReports || 0}</p>
            <p className="text-xs text-text-secondary mt-2">Total reports</p>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-purple/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-text-secondary">Safety Score</h3>
              <BarChart3 size={20} className="text-accent-purple" />
            </div>
            <p className="text-3xl font-bold text-white">{analytics.safetyScore || 0}%</p>
            <div className="w-full bg-surface-secondary rounded-full h-1.5 mt-2">
              <div 
                className="bg-gradient-to-r from-accent-green to-accent-blue h-1.5 rounded-full"
                style={{ width: `${analytics.safetyScore || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* BAR CHART - Check-ins Per Day */}
          <div className="card-base p-6 border border-surface-secondary/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-accent-blue" />
              Check-in Trend (Last 30 Days)
            </h2>
            {analytics.checkInsPerDay && analytics.checkInsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.checkInsPerDay}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
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

          {/* LINE CHART - Safety Score Trend */}
          <div className="card-base p-6 border border-surface-secondary/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-accent-green" />
              Safety Score Trend
            </h2>
            {analytics.checkInsPerDay && analytics.checkInsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.checkInsPerDay}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #4a5568',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-secondary text-center py-12">No data available yet</p>
            )}
          </div>
        </div>

        {/* ACTIVITY SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* STATS COMPARISON */}
          <div className="card-base p-6 border border-surface-secondary/50">
            <h2 className="text-lg font-semibold text-white mb-6">Activity Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-surface-secondary/30">
                <div>
                  <p className="text-sm text-text-secondary">Total Check-ins</p>
                  <p className="text-2xl font-bold text-white mt-1">{analytics.totalCheckIns || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">Average per day</p>
                  <p className="text-lg font-semibold text-accent-blue mt-1">
                    {analytics.totalCheckIns > 0 
                      ? ((analytics.totalCheckIns / 365).toFixed(1)) 
                      : '0.0'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-surface-secondary/30">
                <div>
                  <p className="text-sm text-text-secondary">Last 30 Days</p>
                  <p className="text-2xl font-bold text-white mt-1">{analytics.recentCheckIns30Days || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">Average per day</p>
                  <p className="text-lg font-semibold text-accent-green mt-1">
                    {analytics.recentCheckIns30Days > 0 
                      ? ((analytics.recentCheckIns30Days / 30).toFixed(1)) 
                      : '0.0'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pb-4">
                <div>
                  <p className="text-sm text-text-secondary">Reports Filed</p>
                  <p className="text-2xl font-bold text-white mt-1">{analytics.totalReports || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">Last 30 Days</p>
                  <p className="text-lg font-semibold text-accent-orange mt-1">
                    {analytics.recentReports30Days || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* THREAT LEVEL & STATUS */}
          <div className="card-base p-6 border border-surface-secondary/50">
            <h2 className="text-lg font-semibold text-white mb-6">Current Status</h2>
            
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-3">Threat Level</p>
              <div className={`px-6 py-4 rounded-lg font-semibold text-center ${
                analytics.threatLevel === 'Low'
                  ? 'bg-accent-green/20 text-accent-green'
                  : analytics.threatLevel === 'Medium'
                  ? 'bg-accent-orange/20 text-accent-orange'
                  : 'bg-accent-red/20 text-accent-red'
              }`}>
                {analytics.threatLevel || 'Unknown'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-secondary/30 rounded-lg">
                <span className="text-text-secondary text-sm">Safety Score</span>
                <span className="font-semibold text-white">{analytics.safetyScore || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary/30 rounded-lg">
                <span className="text-text-secondary text-sm">Last Check-in</span>
                <span className="font-semibold text-white">
                  {analytics.lastCheckInAt 
                    ? new Date(analytics.lastCheckInAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="card-base p-6 border border-surface-secondary/50">
          <h2 className="text-lg font-semibold text-white mb-4">Insights & Recommendations</h2>
          <div className="space-y-3">
            {analytics.totalCheckIns === 0 && (
              <div className="p-4 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
                <p className="text-accent-orange text-sm">
                  💡 Start checking in to improve your safety tracking and earn a better safety score.
                </p>
              </div>
            )}
            {analytics.safetyScore >= 80 && (
              <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                <p className="text-accent-green text-sm">
                  ✨ Great job! Your safety score is excellent. Keep up the regular check-ins.
                </p>
              </div>
            )}
            {analytics.safetyScore >= 60 && analytics.safetyScore < 80 && (
              <div className="p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
                <p className="text-accent-blue text-sm">
                  📈 Your safety score is good. More check-ins will help improve it further.
                </p>
              </div>
            )}
            {analytics.totalReports > 0 && (
              <div className="p-4 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
                <p className="text-accent-orange text-sm">
                  ⚠️ You have filed {analytics.totalReports} report(s). Please stay safe and report any issues.
                </p>
              </div>
            )}
            {analytics.recentCheckIns30Days === 0 && analytics.totalCheckIns > 0 && (
              <div className="p-4 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
                <p className="text-accent-orange text-sm">
                  📋 No check-ins in the last 30 days. Regular check-ins help maintain safety awareness.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
