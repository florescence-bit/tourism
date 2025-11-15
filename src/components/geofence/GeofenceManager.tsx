"use client";

import React, { useState } from 'react';
import useGeofencing, { Geofence, GeofenceEvent } from '../../lib/useGeofencing';
import useLiveLocation from '../../lib/useLiveLocation';

export default function GeofenceManager() {
  const { position } = useLiveLocation();
  // pass current position into geofencing hook so it can evaluate enter/exit
  const { geofences, events, addGeofence, removeGeofence, clearEvents } = useGeofencing(position ? { lat: position.lat, lon: position.lon } : null as any);

  const [name, setName] = useState('');
  const [radius, setRadius] = useState(200);

  function onAddCurrent() {
    if (!position) {
      alert('Current position not available');
      return;
    }
    const g = { name: name || `Geofence ${geofences.length + 1}`, lat: position.lat, lon: position.lon, radius };
    addGeofence(g);
    setName('');
  }

  return (
    <div className="bg-gray-950 rounded-3xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold mb-4">Geofencing</h3>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home, Office..." className="w-full p-2 rounded-md bg-gray-900 border border-gray-800" />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Radius (meters)</label>
        <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value || 0))} className="w-full p-2 rounded-md bg-gray-900 border border-gray-800" />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={onAddCurrent} className="px-4 py-2 bg-white text-black rounded-2xl font-medium">Add at current location</button>
        <button onClick={() => {
          // quick add placeholder near Delhi if no position
          const lat = position ? position.lat : 28.6139;
          const lon = position ? position.lon : 77.2090;
          const g = { name: name || `Geofence ${geofences.length + 1}`, lat, lon, radius };
          addGeofence(g);
          setName('');
        }} className="px-4 py-2 bg-gray-800 text-white rounded-2xl font-medium">Add (fallback)</button>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Saved Geofences</h4>
        <div className="space-y-2">
          {geofences.length === 0 && <div className="text-sm text-gray-500">No geofences yet</div>}
          {geofences.map((g: Geofence) => (
            <div key={g.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-2xl border border-gray-800">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-gray-500">{g.lat.toFixed(5)}, {g.lon.toFixed(5)} · {g.radius} m</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => removeGeofence(g.id)} className="text-sm px-3 py-1 rounded-full bg-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Recent Events</h4>
          <button onClick={() => clearEvents()} className="text-sm text-gray-400">Clear</button>
        </div>
        <div className="space-y-2 max-h-48 overflow-auto">
          {events.length === 0 && <div className="text-sm text-gray-500">No events yet</div>}
          {events.map((e: GeofenceEvent) => (
            <div key={e.id} className={`p-2 rounded-md ${e.type === 'enter' ? 'bg-green-900' : 'bg-red-900'} border border-gray-800`}> 
              <div className="text-sm font-medium">{e.geofenceName} — {e.type.toUpperCase()}</div>
              <div className="text-xs text-gray-400">{new Date(e.at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
