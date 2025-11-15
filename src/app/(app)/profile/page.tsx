"use client";

import { useEffect, useState } from 'react';
import firebaseClient from '@/lib/firebaseClient';

type Profile = {
  name: string;
  role: string;
  initials: string;
};

const STORAGE_KEY = 'bharat_profile_v1';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: '', role: '', initials: '' });
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    firebaseClient.initFirebase();
    firebaseClient.ensureAnonAuth().then((user: any) => {
      if (user && user.uid) {
        setUid(user.uid);
        firebaseClient.getProfile(user.uid).then((p) => {
          if (p) setProfile({ name: p.name || '', role: p.role || '', initials: p.initials || '' });
          else {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setProfile(JSON.parse(raw));
          }
        }).catch(() => {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setProfile(JSON.parse(raw));
        });
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      }
    }).catch(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    });
  }, []);

  async function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    if (uid) {
      await firebaseClient.saveProfile(uid, profile);
      alert('Profile saved to Firebase');
    } else {
      alert('Profile saved locally');
    }
  }

  function reset() {
    const empty = { name: '', role: '', initials: '' };
    setProfile(empty);
    localStorage.removeItem(STORAGE_KEY);
    if (uid) firebaseClient.saveProfile(uid, empty);
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-sm text-gray-400">Manage your public profile information used in the app.</p>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center text-xl font-bold">{profile.initials || 'U'}</div>
          <div>
            <h2 className="text-2xl font-semibold">{profile.name || 'Anonymous'}</h2>
            <p className="text-sm text-gray-400">{profile.role || 'Traveler'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Full name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full mt-2 bg-black border border-gray-800 rounded-2xl p-3" />
          </div>

          <div>
            <label className="text-sm text-gray-400">Role</label>
            <input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className="w-full mt-2 bg-black border border-gray-800 rounded-2xl p-3" />
          </div>

          <div>
            <label className="text-sm text-gray-400">Initials</label>
            <input value={profile.initials} onChange={(e) => setProfile({ ...profile, initials: e.target.value.slice(0,3) })} className="w-24 mt-2 bg-black border border-gray-800 rounded-2xl p-3" />
          </div>

          <div className="flex gap-3">
            <button onClick={save} className="px-6 py-2 bg-white text-black rounded-2xl font-semibold">Save</button>
            <button onClick={reset} className="px-6 py-2 bg-gray-800 text-gray-300 rounded-2xl">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
