'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Trash2, Check } from 'lucide-react';
import { onAuthChange, listNotifications, saveNotification } from '@/lib/firebaseClient';

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  createdAt: any;
  read?: boolean;
};

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Subscribe to auth state and load notifications
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userNotifications = await listNotifications(u.uid);
          const formattedNotifications: NotificationItem[] = userNotifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            createdAt: n.createdAt,
            read: n.read || false,
          }));
          setNotifications(formattedNotifications);
        } catch (err) {
          console.error('[Notifications] Error loading notifications:', err);
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

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      setMessage('✓ Marked as read');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setMessage('✓ Notification deleted');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('[Notifications] Error deleting notification:', err);
    }
  };

  const sendTestNotification = async () => {
    if (!user) {
      setMessage('Please sign in to send test notifications');
      return;
    }
    try {
      const notificationId = await saveNotification(user.uid, {
        title: 'Test Notification',
        body: 'This is a test notification from your safety dashboard',
        type: 'info',
      });
      if (notificationId) {
        setMessage('✓ Test notification sent');
        setTimeout(() => setMessage(null), 2000);
        // Reload notifications
        const userNotifications = await listNotifications(user.uid);
        const formattedNotifications: NotificationItem[] = userNotifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          createdAt: n.createdAt,
          read: n.read || false,
        }));
        setNotifications(formattedNotifications);
      }
    } catch (err) {
      console.error('[Notifications] Error sending test:', err);
      setMessage('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Notifications</h1>
          <p className="text-gray-400">Stay updated with safety alerts and check-in reminders</p>
        </div>
      </div>

      {!user && (
        <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-blue-400" />
          <div>
            <div className="font-bold">Sign in Required</div>
            <div className="text-sm text-blue-300">Please sign in to view and manage your notifications</div>
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

      {user && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={sendTestNotification}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Send Test Notification
          </button>
          <button
            onClick={() => setNotifications([])}
            disabled={notifications.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="p-6 text-center bg-gray-900 border border-gray-800 rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">Check-in reminders and safety alerts will appear here</p>
          </div>
        )}

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border transition ${
              notification.read
                ? 'bg-gray-900 border-gray-800 opacity-60'
                : 'bg-gradient-to-br from-gray-900 to-black border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                  {notification.title}
                </p>
                {notification.body && (
                  <p className="text-sm text-gray-400 mt-1">{notification.body}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition text-blue-400 hover:text-blue-300"
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
