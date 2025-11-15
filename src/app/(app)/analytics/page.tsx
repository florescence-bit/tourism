 'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { onAuthChange, getUserAnalytics } from '@/lib/firebaseClient';

export default function Analytics() {
  const [user, setUser] = useState<any>(null);
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

  // Subscribe to auth state and load analytics
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const data = await getUserAnalytics(u.uid);
          setAnalytics(data);
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
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Prepare chart data from check-ins per day
  const chartData = analytics.checkInsPerDay || [];

  // Get threat level color
  const getThreatLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'text-green-400';
      case 'caution': return 'text-yellow-400';
      case 'warning': return 'text-orange-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getThreatLevelBg = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'bg-green-900 text-green-300';
      case 'caution': return 'bg-yellow-900 text-yellow-300';
      case 'warning': return 'bg-orange-900 text-orange-300';
      case 'danger': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (!user) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Analytics</h1>
          <p className="text-gray-400">Track your safety and travel patterns</p>
        </div>
        <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <p className="text-lg font-semibold mb-2">Sign in to view your analytics</p>
          <p className="text-sm text-blue-300">Please sign in to see your safety score, check-in history, and threat level analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">Track your safety and travel patterns</p>
      </div>
      
      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatBox
          icon={<BarChart3 size={24} className="text-blue-400" />}
          label="Total Check-Ins"
          value={analytics.totalCheckIns.toString()}
          detail={`${analytics.recentCheckIns30Days} in last 30 days`}
        />
        <StatBox
          icon={<Shield size={24} className={getThreatLevelColor(analytics.threatLevel)} />}
          label="Threat Level"
          value={analytics.threatLevel}
          detail={<span className={`text-xs px-2 py-1 rounded ${getThreatLevelBg(analytics.threatLevel)}`}>{analytics.threatLevel}</span>}
        />
        <StatBox
          icon={<TrendingUp size={24} className="text-purple-400" />}
          label="Safety Score"
          value={`${analytics.safetyScore.toFixed(0)}/100`}
          detail={analytics.safetyScore >= 80 ? 'Excellent' : analytics.safetyScore >= 60 ? 'Good' : 'Needs attention'}
        />
        <StatBox
          icon={<AlertCircle size={24} className="text-yellow-400" />}
          label="Total Reports"
          value={analytics.totalReports.toString()}
          detail="Safety incidents"
        />
      </div>

      {/* Check-Ins Chart */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={24} className="text-blue-400" />
          <h3 className="text-lg font-bold">Check-Ins Per Day (Last 7 Days)</h3>
        </div>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <XAxis dataKey="day" angle={-30} textAnchor="end" height={60} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Bar dataKey="count" fill="#60A5FA" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No check-in data yet. Start checking in to see your patterns!</p>
          </div>
        )}
      </div>

      {/* Safety Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Safety Overview
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Overall Status</span>
              <span className={`text-sm px-3 py-1 rounded-full ${getThreatLevelBg(analytics.threatLevel)}`}>
                {analytics.threatLevel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Last Check-In</span>
              <span className="text-sm text-gray-400">
                {analytics.lastCheckInAt 
                  ? new Date(analytics.lastCheckInAt).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-2">Safety Score Progress</div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, analytics.safetyScore))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Activity Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Check-Ins This Month</span>
              <span className="font-semibold">{analytics.recentCheckIns30Days}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Safety Reports</span>
              <span className="font-semibold">{analytics.totalReports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Average Daily Check-Ins</span>
              <span className="font-semibold">
                {chartData.length > 0 
                  ? (chartData.reduce((sum: number, d: any) => sum + (d.count || 0), 0) / chartData.length).toFixed(1)
                  : '0'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail?: string | React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">{label}</div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-xs text-gray-500 mt-2">
            {typeof detail === 'string' ? detail : detail}
          </div>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}
