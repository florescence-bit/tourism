'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Bell, MapPin, Lock, Eye } from 'lucide-react';
import { onAuthChange, getSettings, saveSettings } from '@/lib/firebaseClient';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    shareLocation: true,
    anonymousMode: false,
    dataCollection: true,
  });

  // Subscribe to auth state and load settings
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userSettings = await getSettings(u.uid);
          if (userSettings) {
            setSettings((prev) => ({ ...prev, ...userSettings }));
          }
        } catch (err) {
          console.error('[Settings] Error loading settings:', err);
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

  const handleToggle = async (key: string) => {
    if (!user) {
      setMessage('Please sign in to modify settings.');
      return;
    }

    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    };

    setSettings(newSettings);
    setSaving(true);
    setMessage(null);

    try {
      const success = await saveSettings(user.uid, newSettings);
      if (success) {
        setMessage(`✓ ${key.replace(/([A-Z])/g, ' $1').trim()} updated successfully!`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to update settings. Please try again.');
        // Revert change on failure
        setSettings((prev) => ({
          ...prev,
          [key]: !prev[key as keyof typeof prev],
        }));
      }
    } catch (error: any) {
      console.error('[Settings] Error:', error);
      setMessage(`Error: ${error.message}`);
      // Revert change on error
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev],
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const settingsOptions = [
    {
      key: 'notificationsEnabled',
      title: 'Push Notifications',
      description: 'Receive alerts about incidents, check-ins, and safety updates',
      icon: Bell,
      color: 'text-blue-400',
    },
    {
      key: 'shareLocation',
      title: 'Share Location Data',
      description: 'Allow us to track your location for safety check-ins',
      icon: MapPin,
      color: 'text-green-400',
    },
    {
      key: 'anonymousMode',
      title: 'Anonymous Mode',
      description: 'Hide your name and profile picture from other users',
      icon: Eye,
      color: 'text-purple-400',
    },
    {
      key: 'dataCollection',
      title: 'Analytics & Data Collection',
      description: 'Allow us to collect usage data to improve the app',
      icon: Lock,
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your preferences and privacy settings</p>
      </div>

      {!user && (
        <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-blue-400" />
          <div>
            <div className="font-bold">Sign in Required</div>
            <div className="text-sm text-blue-300">Please sign in to manage your settings</div>
          </div>
        </div>
      )}

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

      <div className="space-y-4">
        {settingsOptions.map(({ key, title, description, icon: Icon, color }) => (
          <div
            key={key}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:border-gray-700 transition"
          >
            <div className="flex items-start gap-4">
              <Icon size={24} className={color} />
              <div>
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </div>

            <button
              onClick={() => handleToggle(key)}
              disabled={saving || !user}
              className={`relative w-14 h-8 rounded-full transition-all ${
                settings[key as keyof typeof settings]
                  ? 'bg-blue-600'
                  : 'bg-gray-700'
              } ${saving || !user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings[key as keyof typeof settings] ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-950 border border-gray-800 rounded-xl">
        <h3 className="font-semibold text-lg mb-4">Privacy Policy</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Your privacy is important to us. We only collect data necessary to provide safety features and improve your experience.
          All location data is encrypted and stored securely. You can disable data collection at any time in these settings.
        </p>
        <a href="#" className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block transition">
          Read our full privacy policy →
        </a>
      </div>
    </div>
  );
}
