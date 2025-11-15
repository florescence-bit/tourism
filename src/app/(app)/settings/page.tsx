"use client";

import { useEffect, useState } from 'react';

type Settings = {
  notificationsEnabled: boolean;
  shareLocation: boolean;
};

const KEY = 'bharat_settings_v1';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ notificationsEnabled: true, shareLocation: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  function toggle<K extends keyof Settings>(k: K) {
    const next = { ...settings, [k]: !settings[k] } as Settings;
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Settings</h2>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable notifications</p>
              <p className="text-sm text-gray-400">Receive local notifications and alerts in the app.</p>
            </div>
            <button onClick={() => toggle('notificationsEnabled')} className={`px-3 py-1 rounded-2xl ${settings.notificationsEnabled ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}>
              {settings.notificationsEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Share location</p>
              <p className="text-sm text-gray-400">Allow the app to access your location for check-ins and maps (client-side only).</p>
            </div>
            <button onClick={() => toggle('shareLocation')} className={`px-3 py-1 rounded-2xl ${settings.shareLocation ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}>
              {settings.shareLocation ? 'On' : 'Off'}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">Note: These settings are stored locally in your browser (no backend).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
