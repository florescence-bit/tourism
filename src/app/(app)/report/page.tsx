'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Send, MapPin } from 'lucide-react';
import { onAuthChange, saveReport } from '@/lib/firebaseClient';

export default function ReportPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reportData, setReportData] = useState({
    incidentType: 'safety',
    description: '',
    location: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please sign in to submit a report');
      return;
    }

    if (!reportData.incidentType || !reportData.description || !reportData.location) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await saveReport(user.uid, reportData);
      setMessage('✓ Report submitted successfully!');
      setReportData({ incidentType: 'safety', description: '', location: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('[Report] Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-surface-secondary rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-headline text-white mb-2">Report</h1>
            <p className="text-subtitle text-text-secondary">File a safety report</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to file a report</p>
            <p className="text-sm text-text-secondary">
              Please sign in to submit safety reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-headline text-white mb-2">Report</h1>
          <p className="text-subtitle text-text-secondary">File a safety report</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 border animate-fadeIn ${
              message.startsWith('✓')
                ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                : 'bg-accent-red/10 text-accent-red border-accent-red/30'
            }`}
          >
            {message.startsWith('✓') ? (
              <span className="text-xl">✓</span>
            ) : (
              <AlertCircle size={20} />
            )}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-base p-8 space-y-6 border border-surface-secondary/50">
          <div>
            <label htmlFor="incidentType" className="block text-sm font-semibold text-white mb-3">
              Incident Type <span className="text-accent-red">*</span>
            </label>
            <select
              id="incidentType"
              value={reportData.incidentType}
              onChange={(e) => setReportData({ ...reportData, incidentType: e.target.value })}
              disabled={submitting}
              className="input-base w-full"
            >
              <option value="safety">Safety</option>
              <option value="crime">Crime</option>
              <option value="accident">Accident</option>
              <option value="hazard">Hazard</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-white mb-3">
              Location <span className="text-accent-red">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="location"
                type="text"
                required
                value={reportData.location}
                onChange={(e) => setReportData({ ...reportData, location: e.target.value })}
                disabled={submitting}
                placeholder="Location of incident"
                className="input-base w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-3">
              Description <span className="text-accent-red">*</span>
            </label>
            <textarea
              id="description"
              required
              value={reportData.description}
              onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
              disabled={submitting}
              placeholder="Detailed description of the incident"
              rows={5}
              className="input-base w-full resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
