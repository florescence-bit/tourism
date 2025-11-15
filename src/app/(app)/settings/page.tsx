'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Bell, Lock, Eye } from 'lucide-react';
import { onAuthChange } from '@/lib/firebaseClient';

type Settings = {
  emailNotifications: boolean;
  locationSharing: boolean;
  publicProfile: boolean;
  twoFactorAuth: boolean;
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    locationSharing: true,
    publicProfile: false,
    twoFactorAuth: false,
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

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-surface-secondary rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-secondary rounded-lg"></div>
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
            <h1 className="text-headline text-white mb-2">Settings</h1>
            <p className="text-subtitle text-text-secondary">Manage your preferences</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to manage settings</p>
            <p className="text-sm text-text-secondary">
              Please sign in to access your settings.
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
          <h1 className="text-headline text-white mb-2">Settings</h1>
          <p className="text-subtitle text-text-secondary">Manage your preferences</p>
        </div>

        <div className="space-y-4">
          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-accent-blue" />
                <div>
                  <h3 className="font-semibold text-white">Email Notifications</h3>
                  <p className="text-sm text-text-secondary">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  settings.emailNotifications
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-surface-secondary text-text-secondary'
                }`}
              >
                {settings.emailNotifications ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-accent-purple" />
                <div>
                  <h3 className="font-semibold text-white">Location Sharing</h3>
                  <p className="text-sm text-text-secondary">Share location with authorities</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('locationSharing')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  settings.locationSharing
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-surface-secondary text-text-secondary'
                }`}
              >
                {settings.locationSharing ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-accent-orange" />
                <div>
                  <h3 className="font-semibold text-white">Public Profile</h3>
                  <p className="text-sm text-text-secondary">Make your profile visible</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('publicProfile')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  settings.publicProfile
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-surface-secondary text-text-secondary'
                }`}
              >
                {settings.publicProfile ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-accent-red" />
                <div>
                  <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-text-secondary">Extra security for your account</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  settings.twoFactorAuth
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-surface-secondary text-text-secondary'
                }`}
              >
                {settings.twoFactorAuth ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 card-base p-6 border border-surface-secondary/50">
          <h2 className="text-lg font-semibold text-white mb-3">Account Info</h2>
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">Email: <span className="text-white">{user.email}</span></p>
            <p className="text-text-secondary">User ID: <span className="text-white font-mono text-xs">{user.uid}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
