 'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDataGovResource } from '@/lib/dataGovClient';

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    async function load() {
      const resourceId = process.env.NEXT_PUBLIC_DATAGOV_RESOURCE_ID;
      if (!resourceId) return;
      setLoading(true);
      setError(null);
      try {
        const records = await fetchDataGovResource(resourceId);
        if (!records || records.length === 0) {
          setError('No records returned from data.gov.in for the configured resource id.');
          setChartData([]);
          return;
        }

        // Try to infer a state-like key and a numeric key
        const sample = records[0];
        const keys = Object.keys(sample);
        const stateKey = keys.find((k) => /state|ut|region|district/i.test(k)) || keys.find((k) => /name/i.test(k));
        const numericKey = keys.find((k) => /count|value|cases|number|total|crime|incidents/i.test(k));

        const counts: Record<string, number> = {};
        for (const r of records) {
          const name = stateKey ? (r[stateKey] ?? 'Unknown') : 'Unknown';
          const rawNum = numericKey ? Number(r[numericKey]) : NaN;
          const val = Number.isFinite(rawNum) ? rawNum : 1;
          counts[name] = (counts[name] || 0) + val;
        }

        const data = Object.entries(counts).map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 12);

        setChartData(data);
      } catch (err: any) {
        setError(err.message || String(err));
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
          value="24"
          detail="Last 30 days"
        />
        <StatBox
          icon={<Shield size={24} className="text-green-400" />}
          label="Threat Alerts"
          value="0"
          detail="All clear"
        />
        <StatBox
          icon={<TrendingUp size={24} className="text-purple-400" />}
          label="Safety Score"
          value="94/100"
          detail="Excellent"
        />
        <StatBox
          icon={<AlertCircle size={24} className="text-yellow-400" />}
          label="Incidents"
          value="0"
          detail="No incidents"
        />
      </div>

  {/* Safety Trend */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={24} className="text-blue-400" />
          <h3 className="text-lg font-bold">Safety Trend (Last 7 Days)</h3>
        </div>
        <div className="space-y-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const percentage = 95 - i * 2;
            return (
              <div key={day} className="flex items-center gap-4">
                <span className="w-12 text-sm font-medium text-gray-400">{day}</span>
                <div className="flex-1">
                  <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 flex items-center justify-end pr-3"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs font-bold text-white">{percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

  {/* Additional Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Crime Rate (data.gov.in)
          </h4>
          <div className="space-y-3">
            {process.env.NEXT_PUBLIC_DATAGOV_RESOURCE_ID ? (
              <div style={{ width: '100%', height: 320 }}>
                {loading ? (
                  <div className="text-sm text-gray-400">Loading data.gov.in crime data...</div>
                ) : error ? (
                  <div className="text-sm text-red-400">{error}</div>
                ) : chartData.length === 0 ? (
                  <div className="text-sm text-gray-400">No chartable data found for the configured dataset.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                      <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#60A5FA" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                No data.gov.in dataset configured. To enable the crime rate chart, set <code>NEXT_PUBLIC_DATAGOV_RESOURCE_ID</code> to the resource id of a crime dataset and ensure <code>NEXT_PUBLIC_DATAGOV_KEY</code> is set in your <code>.env.local</code>.
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Weekly Activity
          </h4>
          <div className="space-y-3">
            {[
              { day: 'This Week', activity: 'High' },
              { day: 'Last Week', activity: 'Normal' },
              { day: 'Average', activity: 'Normal' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-300">{item.day}</span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  item.activity === 'High' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                }`}>
                  {item.activity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">{label}</div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-xs text-gray-500 mt-2">{detail}</div>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}
