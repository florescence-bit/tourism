"use client";

import { MapPin, Map, Clock, Navigation, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { saveCheckIn, listCheckIns, onAuthChange } from '@/lib/firebaseClient';
import GeofenceManager from '../../../components/geofence/GeofenceManager';

const SimpleMap = dynamic<any>(() => import('@/components/map/SimpleMap'), { 
  loading: () => <div className="rounded-3xl bg-surface-secondary h-96 animate-pulse" />,
  ssr: false 
});
const AnySimpleMap = SimpleMap as any;

export default function CheckIn() {
  const [user, setUser] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    lat: number;
    lon: number;
    accuracy?: number;
    updatedAt?: number;
    place?: string;
  } | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    location: string;
    time: string;
    coords: string;
  }>>([]);

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

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const geoSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const updatedAt = pos.timestamp;

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

  async function onCheckIn() {
    if (!position) {
      setMessage('Current position not available yet. Please enable location services.');
      return;
    }

    if (!user) {
      setMessage('Please sign in to check in');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await saveCheckIn(user.uid, {
      location: position.place || 'Unknown location',
        latitude: position.lat,
        longitude: position.lon,
        accuracy: position.accuracy || 0,
        place: position.place || 'Unknown location',
      });

      setMessage('✓ Checked in successfully!');
      setCheckedIn(true);

      setTimeout(() => {
        setMessage(null);
        setCheckedIn(false);
      }, 3000);

      loadCheckInHistory(user.uid);
    } catch (err: any) {
      console.error('[CheckIn] Error:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-headline text-white mb-2">Check In</h1>
            <p className="text-subtitle text-text-secondary">Share your location for safety</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to check in</p>
            <p className="text-sm text-text-secondary">
              Please sign in to share your location and check in at safe zones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-headline text-white mb-2">Check In</h1>
          <p className="text-subtitle text-text-secondary">Share your location for safety</p>
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
            <div className="card-base p-6 border border-surface-secondary/50 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-accent-blue" />
                Your Location
              </h2>
              <AnySimpleMap />
            </div>
          </div>

          <div className="card-base p-6 border border-surface-secondary/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Navigation size={20} className="text-accent-green" />
              Position
            </h2>
            {position ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Latitude</p>
                  <p className="text-white font-mono">{position.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Longitude</p>
                  <p className="text-white font-mono">{position.lon.toFixed(6)}</p>
                </div>
                {position.accuracy && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Accuracy</p>
                    <p className="text-white font-mono">{position.accuracy.toFixed(1)}m</p>
                  </div>
                )}
                {position.place && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Place</p>
                    <p className="text-white text-sm break-words">{position.place}</p>
                  </div>
                )}
                <button
                  onClick={onCheckIn}
                  disabled={loading}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                >
                  <MapPin size={20} />
                  {loading ? 'Checking In...' : 'Check In Now'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-text-secondary/50" />
                <p className="text-sm text-text-secondary">Waiting for location...</p>
              </div>
            )}
          </div>
        </div>

        <GeofenceManager />

        <div className="card-base p-6 border border-surface-secondary/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-accent-orange" />
            Check In History
          </h2>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-surface-secondary/50 hover:border-accent-blue/30 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-semibold">{item.location}</p>
                    <span className="text-xs text-text-secondary">{item.time}</span>
                  </div>
                  <p className="text-sm text-text-secondary font-mono">{item.coords}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No check-ins yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
