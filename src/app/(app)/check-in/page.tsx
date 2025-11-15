"use client";

import { MapPin, Map, Clock, Navigation, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { saveCheckIn, listCheckIns, onAuthChange } from '@/lib/firebaseClient';
import GeofenceManager from '../../../components/geofence/GeofenceManager';

const SimpleMap = dynamic<any>(() => import('@/components/map/SimpleMap'), { 
  loading: () => <div className="rounded-3xl bg-gray-900 h-96 animate-pulse" />,
  ssr: false 
});
const AnySimpleMap = SimpleMap as any;

export default function CheckIn() {
  const [user, setUser] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lon: number; accuracy?: number; updatedAt?: number; place?: string } | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; location: string; time: string; coords: string }>>([]);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (u) {
        loadCheckInHistory(u.uid);
      }
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load check-in history from Firestore
  const loadCheckInHistory = async (uid: string) => {
    try {
      const checkIns = await listCheckIns(uid);
      const mapped = checkIns.map((c) => ({
        id: c.id,
        location: c.place || c.location || `${c.latitude?.toFixed(5) || '?'}, ${c.longitude?.toFixed(5) || '?'}`,
        time: new Date(c.createdAt).toLocaleString(),
        coords: `${c.latitude?.toFixed(5) || '?'}, ${c.longitude?.toFixed(5) || '?'}`,
      }));
      setHistory(mapped);
    } catch (err) {
      console.error('[CheckIn] Error loading history:', err);
    }
  };

  // Start watching the user's geolocation
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const geoSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const updatedAt = pos.timestamp;

      // Try reverse geocoding via Geoapify (if available)
      let place: string | undefined = undefined;
      try {
        const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || '';
        if (key) {
          const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${key}`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (json?.features && json.features.length) {
              place = json.features[0].properties.formatted || undefined;
            }
          }
        }
      } catch (e) {
        console.warn('[CheckIn] Geoapify reverse geocode failed', e);
      }

      setPosition({ lat, lon, accuracy, updatedAt, place });
    };

    const geoError = (err: GeolocationPositionError) => {
      console.warn('[CheckIn] Geolocation error', err.message);
      setMessage(`Geolocation error: ${err.message}`);
    };

    const watcher = navigator.geolocation.watchPosition(geoSuccess, geoError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Handle check-in submission
  async function onCheckIn() {
    if (!position) {
      setMessage('Current position not available yet. Please enable location services.');
      return;
    }

    if (!user) {
      setMessage('Please sign in to save check-ins.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const checkInId = await saveCheckIn(user.uid, {
        location: position.place || `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`,
        latitude: position.lat,
        longitude: position.lon,
        accuracy: position.accuracy,
        place: position.place,
      });

      if (checkInId) {
        setMessage('✓ Check-in saved successfully!');
        setCheckedIn(true);
        
        // Reload history
        await loadCheckInHistory(user.uid);

        setTimeout(() => setCheckedIn(false), 2000);
      } else {
        setMessage('Failed to save check-in. Please try again.');
      }
    } catch (error: any) {
      console.error('[CheckIn] Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-3">Check-In</h1>
        <p className="text-gray-500 text-lg">Share your location with trusted contacts</p>
      </div>
      
      {/* Main Check-In Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Check-In Card */}
        <div className="lg:col-span-2 bg-gray-950 rounded-3xl p-8 border border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gray-800 rounded-2xl">
              <MapPin size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Current Location</h2>
              <p className="text-gray-500">{position ? position.place || `${position.lat.toFixed(4)}°, ${position.lon.toFixed(4)}°` : 'Detecting...'}</p>
            </div>
          </div>

          <div className="mb-6">
            <AnySimpleMap latitude={position?.lat ?? 27.1751} longitude={position?.lon ?? 78.0421} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="text-sm text-gray-500 mb-1">Latitude</div>
              <div className="font-semibold">{position ? `${position.lat.toFixed(5)}°` : '—'}</div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="text-sm text-gray-500 mb-1">Longitude</div>
              <div className="font-semibold">{position ? `${position.lon.toFixed(5)}°` : '—'}</div>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.startsWith('✓') 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {message.startsWith('✓') ? '✓' : <AlertCircle size={20} />}
              {message}
            </div>
          )}

          <button 
            onClick={onCheckIn}
            disabled={loading || !user}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
              checkedIn
                ? 'bg-gray-800 text-green-400 border border-gray-700' 
                : loading || !user
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                  : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {!user ? 'Sign in to check in' : loading ? 'Saving...' : checkedIn ? '✓ Checked In' : 'Check In Now'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Navigation size={24} className="text-white" />
              <h3 className="font-semibold">GPS Active</h3>
            </div>
            <p className="text-sm text-gray-500">{position ? 'Tracking enabled' : 'Waiting for GPS...'}</p>
          </div>

          <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} className="text-white" />
              <h3 className="font-semibold">Last Update</h3>
            </div>
            <p className="text-sm text-gray-500">{position ? new Date(position.updatedAt || Date.now()).toLocaleTimeString() : 'Never'}</p>
          </div>

          <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Map size={24} className="text-white" />
              <h3 className="font-semibold">Accuracy</h3>
            </div>
            <p className="text-sm text-gray-500">{position ? `±${Math.round(position.accuracy || 0)} meters` : '—'}</p>
          </div>
          
          <GeofenceManager />
        </div>
      </div>

      {/* Check-In History */}
      <div className="bg-gray-950 rounded-3xl p-8 border border-gray-800">
        <h3 className="text-2xl font-semibold mb-6">History</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500">No check-ins yet. {user ? 'Check in now to get started!' : 'Sign in to save check-ins.'}</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold">{item.location}</div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
                <div className="text-sm text-gray-500">{item.coords}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
