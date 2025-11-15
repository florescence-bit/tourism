'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, LogOut, Save, QrCode } from 'lucide-react';
import { onAuthChange, getProfile, saveProfile, signOut, generateAndSaveDigitalId } from '@/lib/firebaseClient';

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
  const [generatingId, setGeneratingId] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    email: '',
    age: 0,
    userType: '',
    documentType: '',
    documentNumber: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userProfile = await getProfile(u.uid);
          if (userProfile) {
            setProfile({
              fullName: userProfile.fullName || '',
              email: u.email || userProfile.email || '',
              age: userProfile.age || 0,
              userType: userProfile.userType || '',
              documentType: userProfile.documentType || '',
              documentNumber: userProfile.documentNumber || '',
            });
          } else {
            // If no profile exists, initialize with auth email
            setProfile({
              fullName: '',
              email: u.email || '',
              age: 0,
              userType: '',
              documentType: '',
              documentNumber: '',
            });
          }
        } catch (err) {
          console.error('[Profile] Error loading profile:', err);
          // Initialize with auth email if error occurs
          setProfile({
            fullName: '',
            email: u.email || '',
            age: 0,
            userType: '',
            documentType: '',
            documentNumber: '',
          });
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
      // Ensure email from auth user is saved
      const profileToSave = {
        ...profile,
        email: user.email || profile.email,
        updatedAt: Date.now(),
      };
      
      console.log('[Profile] Saving profile with data:', profileToSave);
      console.log('[Profile] User UID:', user.uid);
      
      const success = await saveProfile(user.uid, profileToSave);
      console.log('[Profile] Save result:', success);
      
      if (success) {
        setMessage('✓ Profile saved successfully!');
        // Update local state to reflect the saved data
        setProfile(profileToSave);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to save profile. Check console for details.');
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
      setQrCode(null);
      setMessage('✓ Signed out successfully');
    } catch (error: any) {
      console.error('[Profile] Sign out error:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleGenerateDigitalID = async () => {
    if (!user || !profile.fullName) {
      setMessage('Please fill in your full name first');
      return;
    }

    setGeneratingId(true);
    setMessage(null);

    try {
      console.log('[Profile] Generating digital ID for:', profile.fullName);
      const result = await generateAndSaveDigitalId(user.uid, profile.fullName);
      
      if (result && result.qrDataUrl) {
        console.log('[Profile] Digital ID generated successfully');
        setQrCode(result.qrDataUrl);
        setMessage('✓ Digital ID generated successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to generate Digital ID. Check console for details.');
      }
    } catch (error: any) {
      console.error('[Profile] Digital ID generation error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setGeneratingId(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-surface-secondary rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
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
            <h1 className="text-headline text-white mb-2">Profile</h1>
            <p className="text-subtitle text-text-secondary">Manage your account information</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to manage your profile</p>
            <p className="text-sm text-text-secondary">
              Please sign in to view and update your profile information.
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
          <h1 className="text-headline text-white mb-2">Profile</h1>
          <p className="text-subtitle text-text-secondary">Manage your account information</p>
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="card-base p-8 space-y-6 mb-6 border border-surface-secondary/50"
        >
          <div className="pb-6 border-b border-surface-secondary/50">
            <p className="text-sm text-text-secondary font-medium mb-2">Email</p>
            <p className="text-lg font-semibold text-white">{user.email || 'No email'}</p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-white mb-3">
              Full Name <span className="text-accent-red">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={profile.fullName || ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={saving}
              placeholder="Your full name"
              className="input-base w-full"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-semibold text-white mb-3">
              Age <span className="text-accent-red">*</span>
            </label>
            <input
              id="age"
              type="number"
              required
              value={profile.age || ''}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
              disabled={saving}
              min="18"
              max="120"
              placeholder="Your age (minimum 18)"
              className="input-base w-full"
            />
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm font-semibold text-white mb-3">
              User Type
            </label>
            <select
              id="userType"
              value={profile.userType || ''}
              onChange={(e) => setProfile({ ...profile, userType: e.target.value })}
              disabled={saving}
              className="input-base w-full"
            >
              <option value="">Select type...</option>
              <option value="Indian">Indian Citizen</option>
              <option value="Foreigner">Foreigner</option>
            </select>
          </div>

          <div>
            <label htmlFor="documentType" className="block text-sm font-semibold text-white mb-3">
              Document Type
            </label>
            <select
              id="documentType"
              value={profile.documentType || ''}
              onChange={(e) => setProfile({ ...profile, documentType: e.target.value })}
              disabled={saving}
              className="input-base w-full"
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

          <div>
            <label
              htmlFor="documentNumber"
              className="block text-sm font-semibold text-white mb-3"
            >
              Document Number
            </label>
            <input
              id="documentNumber"
              type="text"
              value={profile.documentNumber || ''}
              onChange={(e) => setProfile({ ...profile, documentNumber: e.target.value })}
              disabled={saving}
              placeholder="Your document number"
              className="input-base w-full"
            />
          </div>

          <div className="pt-6 border-t border-surface-secondary/50 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={handleGenerateDigitalID}
              disabled={generatingId || !profile.fullName}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <QrCode size={20} className={generatingId ? 'animate-spin' : ''} />
              {generatingId ? 'Generating...' : 'Generate ID'}
            </button>
          </div>
        </form>

        {qrCode && (
          <div className="card-base p-8 mb-6 border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <h3 className="text-lg font-semibold text-white mb-4">Your Digital ID QR Code</h3>
            <div className="flex flex-col items-center gap-4">
              <img
                src={qrCode}
                alt="Digital ID QR Code"
                className="w-48 h-48 rounded-lg bg-white p-3 border border-accent-blue/30"
              />
              <p className="text-sm text-text-secondary text-center max-w-sm">
                Scan this QR code to verify your digital identity. Valid for 3 years from generation.
              </p>
              <a
                href={qrCode}
                download={`${profile.fullName || 'digital-id'}-qr.png`}
                className="btn-secondary flex items-center gap-2"
              >
                Download QR Code
              </a>
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="btn-danger w-full flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
