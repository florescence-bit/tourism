'use client';

import { useState } from 'react';
import { AlertCircle, MapPin, FileText, Send } from 'lucide-react';

export default function Report() {
  const [formData, setFormData] = useState({ type: '', description: '', location: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
      
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 sm:p-8 space-y-6">
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
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white hover:border-gray-600 focus:border-blue-500 focus:outline-none transition"
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
            placeholder="Where did this happen?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition"
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
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe what happened... (Please include any details that might be helpful)"
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">Max 500 characters</p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <Send size={20} />
          Submit Report
        </button>

        {/* Disclaimer */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400">
          <strong>Note:</strong> All reports are reviewed by our safety team. Providing accurate information helps us better protect the community.
        </div>
      </form>
    </div>
  );
}
