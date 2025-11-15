'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, MapPin, FileText, Send } from 'lucide-react';
import { saveReport, listReports, onAuthChange } from '@/lib/firebaseClient';

export default function Report() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ type: '', description: '', location: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reports, setReports] = useState<Array<any>>([]);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (u) {
        loadReports(u.uid);
      }
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load user's reports
  const loadReports = async (uid: string) => {
    try {
      const userReports = await listReports(uid);
      setReports(userReports);
    } catch (err) {
      console.error('[Report] Error loading reports:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage('Please sign in to submit reports.');
      return;
    }

    if (!formData.type || !formData.description || !formData.location) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const reportId = await saveReport(user.uid, {
        incidentType: formData.type,
        description: formData.description,
        location: formData.location,
      });

      if (reportId) {
        setMessage('✓ Report submitted successfully!');
        setFormData({ type: '', description: '', location: '' });
        setSubmitted(true);
        await loadReports(user.uid);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setMessage('Failed to submit report. Please try again.');
      }
    } catch (error: any) {
      console.error('[Report] Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Report Incident</h1>
        <p className="text-gray-400">Help us keep the travel community safe. Report any suspicious activity or incidents.</p>
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg flex items-center gap-3">
          <span className="text-green-400">✓</span>
          <div>
            <div className="font-bold text-green-300">Report Submitted</div>
            <div className="text-sm text-green-300 opacity-75">Thank you! Our team will review your report.</div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 sm:p-8 space-y-6 mb-8">
        {/* Incident Type */}
        <div>
          <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-400" />
            Incident Type
          </label>
          <select 
            required
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            disabled={loading || !user}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          >
            <option value="">Select type...</option>
            <option value="suspicious">Suspicious Activity</option>
            <option value="theft">Theft/Robbery</option>
            <option value="harassment">Harassment</option>
            <option value="lost">Lost Item</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-blue-400" />
            Location
          </label>
          <input 
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            disabled={loading || !user}
            placeholder="Where did this happen?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText size={18} className="text-purple-400" />
            Description
          </label>
          <textarea 
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value.slice(0, 500)})}
            disabled={loading || !user}
            placeholder="Describe what happened... (Please include any details that might be helpful)"
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition resize-none disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-2">{formData.description.length}/500 characters</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.startsWith('✓') 
              ? 'bg-green-900 text-green-300 border border-green-700' 
              : 'bg-red-900 text-red-300 border border-red-700'
          }`}>
            {message.startsWith('✓') ? '✓' : <AlertCircle size={20} />}
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading || !user}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <Send size={20} />
          {!user ? 'Sign in to report' : loading ? 'Submitting...' : 'Submit Report'}
        </button>

        {/* Disclaimer */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400">
          <strong>Note:</strong> All reports are reviewed by our safety team. Providing accurate information helps us better protect the community.
        </div>
      </form>

      {/* Recent Reports */}
      {user && reports.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Your Recent Reports</h3>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium capitalize">{report.incidentType}</p>
                    <p className="text-sm text-gray-400">{report.location}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">{report.status}</span>
                </div>
                <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
