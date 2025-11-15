'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, LogOut, Save } from 'lucide-react';
import { onAuthChange, getProfile, saveProfile, signOut } from '@/lib/firebaseClient';

type Profile = {
  fullName?: string;
  email?: string;
  age?: number;
  userType?: string;
  documentType?: string;
  documentNumber?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    email: '',
    age: 0,
    userType: '',
    documentType: '',
    documentNumber: '',
  });

  // Subscribe to auth state and load profile
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userProfile = await getProfile(u.uid);
          if (userProfile) {
            setProfile({
              fullName: userProfile.fullName || '',
              email: userProfile.email || '',
              age: userProfile.age || 0,
              userType: userProfile.userType || '',
              documentType: userProfile.documentType || '',
              documentNumber: userProfile.documentNumber || '',
            });
          }
        } catch (err) {
          console.error('[Profile] Error loading profile:', err);
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

  const handleSave = async () => {
    if (!user) {
      setMessage('Please sign in to save profile');
      return;
    }

    if (!profile.fullName || !profile.age) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const success = await saveProfile(user.uid, profile);
      if (success) {
        setMessage('✓ Profile saved successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to save profile. Please try again.');
      }
    } catch (error: any) {
      console.error('[Profile] Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setProfile({
        fullName: '',
        email: '',
        age: 0,
        userType: '',
        documentType: '',
        documentNumber: '',
      });
      setMessage('✓ Signed out successfully');
    } catch (error: any) {
      console.error('[Profile] Sign out error:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>
        <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <p className="text-lg font-semibold mb-2">Sign in to manage your profile</p>
          <p className="text-sm text-blue-300">Please sign in to view and update your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 border ${
          message.startsWith('✓')
            ? 'bg-green-900 text-green-300 border-green-700'
            : 'bg-red-900 text-red-300 border-red-700'
        }`}>
          {message.startsWith('✓') ? '✓' : <AlertCircle size={20} />}
          {message}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 sm:p-8 space-y-6 mb-6">
        {/* Profile Header */}
        <div className="pb-6 border-b border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Email</p>
          <p className="text-lg font-medium">{user.email || 'No email'}</p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={profile.fullName || ''}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            disabled={saving}
            placeholder="Your full name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold mb-2">Age *</label>
          <input
            type="number"
            required
            value={profile.age || ''}
            onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
            disabled={saving}
            min="18"
            max="120"
            placeholder="Your age (minimum 18)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          />
        </div>

        {/* User Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">User Type</label>
          <select
            value={profile.userType || ''}
            onChange={(e) => setProfile({ ...profile, userType: e.target.value })}
            disabled={saving}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          >
            <option value="">Select type...</option>
            <option value="Indian">Indian Citizen</option>
            <option value="Foreigner">Foreigner</option>
          </select>
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">Document Type</label>
          <select
            value={profile.documentType || ''}
            onChange={(e) => setProfile({ ...profile, documentType: e.target.value })}
            disabled={saving}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          >
            <option value="">Select document...</option>
            {profile.userType === 'Indian' ? (
              <option value="Aadhar">Aadhar Card</option>
            ) : profile.userType === 'Foreigner' ? (
              <>
                <option value="Passport">Passport</option>
                <option value="Visa">Visa</option>
              </>
            ) : null}
          </select>
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-sm font-semibold mb-2">Document Number</label>
          <input
            type="text"
            value={profile.documentNumber || ''}
            onChange={(e) => setProfile({ ...profile, documentNumber: e.target.value })}
            disabled={saving}
            placeholder="Your document number"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 hover:border-gray-600 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          />
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-gray-800 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full p-4 border border-red-700 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}
