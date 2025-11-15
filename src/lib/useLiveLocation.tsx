/**
 * @file src/lib/useLiveLocation.tsx
 * @description React hook for real-time geolocation tracking and reverse geocoding.
 * Features:
 * - Watches device position continuously using Geolocation API
 * - Performs reverse geocoding to get human-readable place names
 * - Updates position reactively when device location changes
 * - Provides error handling for permission denied, GPS unavailable, etc.
 */

'use client';

import { useEffect, useState } from 'react';
import { GEOLOCATION_OPTIONS, GEOAPIFY_REVERSE_GEOCODE_ENDPOINT, FALLBACK_GEOAPIFY_KEY } from './constants';
import type { LivePosition } from './types';

/**
 * Hook for tracking device geolocation in real-time.
 * Continuously watches user location and performs reverse geocoding.
 *
 * @returns Object containing:
 *   - position: Current location (lat, lon, accuracy, place name) or null if not available
 *   - error: Error message if geolocation failed or unavailable
 *
 * @example
 * const { position, error } = useLiveLocation();
 * if (error) return <div>Location error: {error}</div>;
 * if (!position) return <div>Getting location...</div>;
 * return <div>You are at {position.place} ({position.lat}, {position.lon})</div>;
 */
export default function useLiveLocation(): {
  position: LivePosition | null;
  error: string | null;
} {
  const [position, setPosition] = useState<LivePosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation API is available in browser
    if (!('geolocation' in navigator)) {
      const msg = 'Geolocation is not supported by your browser.';
      console.warn('[Geolocation]', msg);
      setError(msg);
      return;
    }

    /**
     * Called when geolocation succeeds.
     * Extracts coordinates and attempts reverse geocoding if API key is available.
     */
    const geoSuccess = async (pos: GeolocationPosition): Promise<void> => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const updatedAt = pos.timestamp;

      console.debug('[Geolocation] Position updated:', { lat, lon, accuracy });

      // Attempt reverse geocoding to get a human-readable place name
      let place: string | undefined;
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || FALLBACK_GEOAPIFY_KEY;
        if (apiKey) {
          const url = `${GEOAPIFY_REVERSE_GEOCODE_ENDPOINT}?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            if (data?.features && data.features.length > 0) {
              place = data.features[0].properties.formatted;
              console.debug('[Geolocation] Place name:', place);
            }
          } else {
            console.warn('[Geolocation] Reverse geocode returned non-OK status:', response.status);
          }
        }
      } catch (err) {
        // Silently fail reverse geocoding; still set position with coordinates
        console.warn('[Geolocation] Reverse geocode error (non-fatal):', err);
      }

      // Update position state with or without place name
      setPosition({ lat, lon, accuracy, updatedAt, place });
      setError(null); // Clear any previous errors
    };

    /**
     * Called when geolocation fails.
     * Handles permission denied, position unavailable, and timeout errors.
     */
    const geoError = (err: GeolocationPositionError): void => {
      const errorMessages: Record<number, string> = {
        1: 'Location permission denied. Please enable location in browser settings.',
        2: 'Location not available. Please check GPS signal.',
        3: 'Location request timed out. Please try again.',
      };

      const msg = errorMessages[err.code] || `Geolocation error: ${err.message}`;
      console.error('[Geolocation] Error (code ' + err.code + '):', msg);
      setError(msg);
    };

    // Start watching position; updates whenever location changes
    const watcherId = navigator.geolocation.watchPosition(
      geoSuccess,
      geoError,
      GEOLOCATION_OPTIONS
    );

    console.debug('[Geolocation] Started watching position (watcher ID:', watcherId, ')');

    // Cleanup: stop watching when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watcherId);
      console.debug('[Geolocation] Stopped watching position');
    };
  }, []);

  return { position, error } as const;
}
