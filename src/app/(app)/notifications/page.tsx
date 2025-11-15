"use client";

import { useEffect, useState } from 'react';

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
  read?: boolean;
};

const KEY = 'bharat_notifications_v1';

function load(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => setItems(load()), []);

  function persist(next: NotificationItem[]) {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function markRead(id: string) {
    persist(items.map(i => i.id === id ? { ...i, read: true } : i));
  }

  function removeItem(id: string) {
    persist(items.filter(i => i.id !== id));
  }

  function addTest() {
    const n: NotificationItem = {
      id: String(Date.now()),
      title: 'Test notification',
      body: 'This is a local test notification stored in the frontend.',
      createdAt: Date.now(),
      read: false,
    };
    persist([n, ...items]);
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <div className="flex gap-3">
            <button onClick={addTest} className="px-4 py-2 bg-white text-black rounded-2xl">Send test</button>
            <button onClick={() => persist([])} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-2xl">Clear all</button>
          </div>
        </div>

        <div className="space-y-3">
          {items.length === 0 && <p className="text-sm text-gray-400">No notifications yet — send a test notification.</p>}

          {items.map((it) => (
            <div key={it.id} className={`p-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-start justify-between ${it.read ? 'opacity-60' : ''}`}>
              <div>
                <p className="font-medium">{it.title}</p>
                {it.body && <p className="text-sm text-gray-400 mt-1">{it.body}</p>}
                <p className="text-xs text-gray-500 mt-2">{new Date(it.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {!it.read && <button onClick={() => markRead(it.id)} className="px-3 py-1 bg-white text-black rounded-lg text-sm">Mark read</button>}
                <button onClick={() => removeItem(it.id)} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
