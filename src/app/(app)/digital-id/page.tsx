'use client';

import { useEffect, useState } from 'react';
import { Download, User, Mail, Phone, Calendar, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { onAuthChange, getProfile, generateAndSaveDigitalId } from '@/lib/firebaseClient';

export default function DigitalID() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Subscribe to auth state and load profile
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userProfile = await getProfile(u.uid);
          if (userProfile) {
            setProfile(userProfile);
            // Extract QR code if available
            if (userProfile.qrDataUrl) {
              setQrCode(userProfile.qrDataUrl);
            }
          }
        } catch (err) {
          console.error('[Digital ID] Error loading profile:', err);
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

  const handleGenerateID = async () => {
    if (!user || !profile?.fullName) {
      setMessage('Please complete your profile first');
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const digitalId = await generateAndSaveDigitalId(user.uid, profile.fullName);
      if (digitalId) {
        // Reload profile to get updated QR code
        const updated = await getProfile(user.uid);
        if (updated?.qrDataUrl) {
          setQrCode(updated.qrDataUrl);
          setMessage('✓ Digital ID generated successfully!');
          setTimeout(() => setMessage(null), 3000);
        }
      }
    } catch (err: any) {
      console.error('[Digital ID] Error:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) {
      setMessage('QR code not available');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${profile?.fullName || 'digital-id'}-qr.png`;
    link.click();
    setMessage('✓ QR code downloaded!');
    setTimeout(() => setMessage(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-48 bg-gray-800 rounded-2xl"></div>
            <div className="h-48 bg-gray-800 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Digital ID</h1>
          <p className="text-gray-400">Your secure identification card for travel</p>
        </div>
        <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <p className="text-lg font-semibold mb-2">Sign in to view your Digital ID</p>
          <p className="text-sm text-blue-300">Please sign in to generate and view your secure digital identification card.</p>
        </div>
      </div>
    );
  }

  if (!profile?.fullName) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Digital ID</h1>
          <p className="text-gray-400">Your secure identification card for travel</p>
        </div>
        <div className="p-6 bg-yellow-900 border border-yellow-700 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <p className="text-lg font-semibold mb-2">Complete your profile first</p>
          <p className="text-sm text-yellow-300 mb-4">You need to add your full name and other details to generate a Digital ID.</p>
          <a 
            href="/profile"
            className="inline-block px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  const issuedDate = new Date();
  const expiryDate = new Date(issuedDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000); // 3 years

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Digital ID</h1>
        <p className="text-gray-400">Your secure identification card for travel</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ID Card */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 border border-purple-700 rounded-2xl p-8 aspect-video flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-300 font-mono tracking-wider">RAH DIGITAL ID</div>
                <div className="text-4xl font-bold mt-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {profile?.fullName || 'User'}
                </div>
              </div>
              <div className="text-4xl">🛡️</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-gray-300">Issued</div>
                <div className="text-sm font-mono">{issuedDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
              </div>
              <div>
                <div className="text-xs text-gray-300 text-right">Valid Until</div>
                <div className="text-sm font-mono">{expiryDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center">
          {qrCode ? (
            <>
              <img 
                src={qrCode} 
                alt="Digital ID QR Code"
                className="w-40 h-40 rounded-lg mb-4 bg-white p-2"
              />
              <p className="text-sm text-gray-400 text-center">Scan for quick verification</p>
            </>
          ) : (
            <>
              <div className="w-40 h-40 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-gray-500 text-4xl mb-2">↻</div>
                  <p className="text-sm text-gray-500">Generate QR</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 text-center">No QR code yet</p>
            </>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <User size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Full Name</div>
              <div className="font-semibold">{profile?.fullName || '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Mail size={20} className="text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Email</div>
              <div className="font-semibold text-sm">{user?.email || '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Phone size={20} className="text-green-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">User Type</div>
              <div className="font-semibold">{profile?.userType || '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Calendar size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Expiration</div>
              <div className="font-semibold">{expiryDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={handleGenerateID}
          disabled={generating}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : 'Generate Digital ID'}
        </button>
        <button 
          onClick={handleDownload}
          disabled={!qrCode}
          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-700 disabled:to-gray-700 border border-gray-700 hover:border-gray-600 disabled:border-gray-700 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          Download QR Code
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-6 bg-gray-950 border border-gray-800 rounded-xl">
        <h3 className="font-semibold text-lg mb-4">About Your Digital ID</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Your Digital ID is securely stored on Firebase servers</li>
          <li>• The QR code contains your verification information</li>
          <li>• Share your QR code with authorities for quick verification</li>
          <li>• Your ID is valid for 3 years from the issue date</li>
          <li>• You can regenerate your QR code at any time</li>
        </ul>
      </div>
    </div>
  );
}
