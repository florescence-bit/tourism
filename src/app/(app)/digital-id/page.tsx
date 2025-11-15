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

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userProfile = await getProfile(u.uid);
          if (userProfile) {
            setProfile(userProfile);
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
      console.log('[Digital ID] Starting generation for user:', user.uid);
      console.log('[Digital ID] Profile name:', profile.fullName);
      
      const result = await generateAndSaveDigitalId(user.uid, profile.fullName);
      console.log('[Digital ID] Generation result:', result);
      
      if (result && result.qrDataUrl) {
        console.log('[Digital ID] QR code generated, updating state');
        setQrCode(result.qrDataUrl);
        setMessage('✓ Digital ID generated successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        console.error('[Digital ID] No QR data URL in result');
        setMessage('Failed to generate Digital ID. Check console for details.');
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-8 w-full max-w-5xl">
          <div className="h-10 bg-surface-secondary rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-48 bg-surface-secondary rounded-2xl"></div>
            <div className="h-48 bg-surface-secondary rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-secondary rounded-xl"></div>
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
            <h1 className="text-headline text-white mb-2">Digital ID</h1>
            <p className="text-subtitle text-text-secondary">Your secure identification card for travel</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to view your Digital ID</p>
            <p className="text-sm text-text-secondary">
              Please sign in to generate and view your secure digital identification card.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.fullName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-headline text-white mb-2">Digital ID</h1>
            <p className="text-subtitle text-text-secondary">Your secure identification card for travel</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-orange/30 bg-gradient-to-br from-accent-orange/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-orange" />
            <p className="text-lg font-semibold text-white mb-2">Complete your profile first</p>
            <p className="text-sm text-text-secondary mb-4">
              You need to add your full name and other details to generate a Digital ID.
            </p>
            <a href="/profile" className="inline-block btn-primary">
              Go to Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  const issuedDate = new Date();
  const expiryDate = new Date(issuedDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-headline text-white mb-2">Digital ID</h1>
          <p className="text-subtitle text-text-secondary">Your secure identification card for travel</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-accent-blue via-accent-purple to-surface-primary border border-accent-blue/30 rounded-2xl p-8 aspect-video flex flex-col justify-between shadow-elevation3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-text-secondary font-mono tracking-wider">RAH DIGITAL ID</div>
                  <div className="text-4xl font-bold mt-4 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                    {profile?.fullName || 'User'}
                  </div>
                </div>
                <div className="text-4xl">🛡️</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-text-secondary">Issued</div>
                  <div className="text-sm font-mono text-white">
                    {issuedDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary text-right">Valid Until</div>
                  <div className="text-sm font-mono text-white">
                    {expiryDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-base p-8 flex flex-col items-center justify-center border border-surface-secondary/50">
            {qrCode ? (
              <>
                <img
                  src={qrCode}
                  alt="Digital ID QR Code"
                  className="w-40 h-40 rounded-lg mb-4 bg-white p-2"
                />
                <p className="text-sm text-text-secondary text-center">Scan for quick verification</p>
              </>
            ) : (
              <>
                <div className="w-40 h-40 bg-surface-secondary rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-text-secondary text-4xl mb-2">↻</div>
                    <p className="text-sm text-text-secondary">Generate QR</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary text-center">No QR code yet</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-blue/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-surface-secondary rounded-lg">
                <User size={20} className="text-accent-blue" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Full Name</div>
                <div className="font-semibold text-white">{profile?.fullName || '—'}</div>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-purple/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-surface-secondary rounded-lg">
                <Mail size={20} className="text-accent-purple" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Email</div>
                <div className="font-semibold text-white text-sm">{user?.email || '—'}</div>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-green/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-surface-secondary rounded-lg">
                <Phone size={20} className="text-accent-green" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">User Type</div>
                <div className="font-semibold text-white">{profile?.userType || '—'}</div>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50 hover:border-accent-orange/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-surface-secondary rounded-lg">
                <Calendar size={20} className="text-accent-orange" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Expiration</div>
                <div className="font-semibold text-white">
                  {expiryDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleGenerateID}
            disabled={generating}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Generate Digital ID'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!qrCode}
            className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Download QR Code
          </button>
        </div>

        <div className="card-base p-6 border border-surface-secondary/50">
          <h3 className="font-semibold text-lg text-white mb-4">About Your Digital ID</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Your Digital ID is securely stored on Firebase servers</li>
            <li>• The QR code contains your verification information</li>
            <li>• Share your QR code with authorities for quick verification</li>
            <li>• Your ID is valid for 3 years from the issue date</li>
            <li>• You can regenerate your QR code at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
