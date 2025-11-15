"use client";

import { useEffect, useRef, useState } from 'react';

export type Geofence = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number; // meters
  enabled?: boolean;
};

export type GeofenceEvent = {
  id: string; // event id
  geofenceId: string;
  geofenceName: string;
  type: 'enter' | 'exit';
  at: number; // timestamp
  position?: { lat: number; lon: number };
};

const GEOFENCE_STORAGE = 'bharat_geofences_v1';
const GEOFENCE_EVENTS_STORAGE = 'bharat_geofence_events_v1';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // metres
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function loadGeofences(): Geofence[] {
  try {
    const raw = localStorage.getItem(GEOFENCE_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveGeofences(list: Geofence[]) {
  try {
    localStorage.setItem(GEOFENCE_STORAGE, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

function loadEvents(): GeofenceEvent[] {
  try {
    const raw = localStorage.getItem(GEOFENCE_EVENTS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveEvents(events: GeofenceEvent[]) {
  try {
    localStorage.setItem(GEOFENCE_EVENTS_STORAGE, JSON.stringify(events));
  } catch (e) {
    // ignore
  }
}

export default function useGeofencing(position: { lat: number; lon: number } | null) {
  const [geofences, setGeofences] = useState<Geofence[]>(() => loadGeofences());
  const [events, setEvents] = useState<GeofenceEvent[]>(() => loadEvents());
  const insideRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // initialize insideRef
    const map: Record<string, boolean> = {};
    geofences.forEach((g) => { map[g.id] = false; });
    insideRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!position) return;
    // On every position update, check geofences
    geofences.forEach((g) => {
      if (!g.enabled && g.enabled !== undefined) return;
      const d = haversineDistance(position.lat, position.lon, g.lat, g.lon);
      const wasInside = !!insideRef.current[g.id];
      const nowInside = d <= (g.radius ?? 100);
      if (!wasInside && nowInside) {
        // enter
        const ev: GeofenceEvent = {
          id: `${Date.now()}_${g.id}`,
          geofenceId: g.id,
          geofenceName: g.name,
          type: 'enter',
          at: Date.now(),
          position: { lat: position.lat, lon: position.lon },
        };
        const next = [ev, ...events].slice(0, 100);
        setEvents(next);
        saveEvents(next);
        insideRef.current[g.id] = true;
      } else if (wasInside && !nowInside) {
        // exit
        const ev: GeofenceEvent = {
          id: `${Date.now()}_${g.id}`,
          geofenceId: g.id,
          geofenceName: g.name,
          type: 'exit',
          at: Date.now(),
          position: { lat: position.lat, lon: position.lon },
        };
        const next = [ev, ...events].slice(0, 100);
        setEvents(next);
        saveEvents(next);
        insideRef.current[g.id] = false;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  function addGeofence(g: Omit<Geofence, 'id'>) {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ge: Geofence = { ...g, id };
    const next = [ge, ...geofences];
    setGeofences(next);
    saveGeofences(next);
    return ge;
  }

  function removeGeofence(id: string) {
    const next = geofences.filter((g) => g.id !== id);
    setGeofences(next);
    saveGeofences(next);
    delete insideRef.current[id];
  }

  function updateGeofence(id: string, patch: Partial<Geofence>) {
    const next = geofences.map((g) => (g.id === id ? { ...g, ...patch } : g));
    setGeofences(next);
    saveGeofences(next);
  }

  function clearEvents() {
    setEvents([]);
    saveEvents([]);
  }

  return {
    geofences,
    events,
    addGeofence,
    removeGeofence,
    updateGeofence,
    clearEvents,
  } as const;
}
