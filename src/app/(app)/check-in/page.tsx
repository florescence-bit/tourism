"use client";

import { MapPin, Map, Clock, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import GeofenceManager from '../../../components/geofence/GeofenceManager';

const SimpleMap = dynamic<any>(() => import('@/components/map/SimpleMap'), { 
  loading: () => <div className="rounded-3xl bg-gray-900 h-96 animate-pulse" />,
  ssr: false 
});
const AnySimpleMap = SimpleMap as any;

export default function CheckIn() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lon: number; accuracy?: number; updatedAt?: number; place?: string } | null>(null);
  const [history, setHistory] = useState<Array<{ location: string; time: string; coords: string }>>([
    { location: 'Taj Mahal, Agra', time: '2 hours ago', coords: '27.1751, 78.0421' },
    { location: 'Gateway of India, Mumbai', time: '5 hours ago', coords: '19.0760, 72.8777' },
    { location: 'Hawa Mahal, Jaipur', time: '1 day ago', coords: '26.9239, 75.8267' },
  ]);

  // Start watching the user's geolocation and reverse-geocode with Geoapify
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const geoSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const updatedAt = pos.timestamp;

      // Try reverse geocoding via Geoapify
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
        // ignore reverse geocode errors
        console.warn('Geoapify reverse geocode failed', e);
      }

      setPosition({ lat, lon, accuracy, updatedAt, place });
    };

    const geoError = (err: GeolocationPositionError) => {
      console.warn('Geolocation error', err.message);
    };

    const watcher = navigator.geolocation.watchPosition(geoSuccess, geoError, { enableHighAccuracy: true, maximumAge: 1000 * 5, timeout: 10000 });

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  function onCheckIn() {
    if (!position) {
      alert('Current position not available yet. Please enable location services and try again.');
      return;
    }
    const time = new Date().toLocaleString();
    const loc = position.place || `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`;
    const coords = `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`;
    const entry = { location: loc, time, coords };
    setHistory((s) => [entry, ...s]);
    setCheckedIn(true);
    // persist history to localStorage
    try { localStorage.setItem('bharat_checkins_v1', JSON.stringify([entry, ...history])); } catch {}
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
              <p className="text-gray-500">New York, USA</p>
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

          <button 
            onClick={onCheckIn}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
              checkedIn 
                ? 'bg-gray-800 text-green-400 border border-gray-700' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {checkedIn ? '✓ Checked In' : 'Check In Now'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Navigation size={24} className="text-white" />
              <h3 className="font-semibold">GPS Active</h3>
            </div>
            <p className="text-sm text-gray-500">Tracking enabled</p>
          </div>

          <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} className="text-white" />
              <h3 className="font-semibold">Last Update</h3>
            </div>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>

          <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Map size={24} className="text-white" />
              <h3 className="font-semibold">Accuracy</h3>
            </div>
            <p className="text-sm text-gray-500">±5 meters</p>
          </div>
          
          <GeofenceManager />
        </div>
      </div>

      {/* Check-In History */}
      <div className="bg-gray-950 rounded-3xl p-8 border border-gray-800">
        <h3 className="text-2xl font-semibold mb-6">History</h3>
        <div className="space-y-3">
          {history.map((item, i) => (
            <div key={i} className="p-4 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold">{item.location}</div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
              <div className="text-sm text-gray-500">{item.coords}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
