/**
 * @file src/components/map/SimpleMap.tsx
 * @description Leaflet-based interactive map component.
 * Features:
 * - Renders map with Geoapify tiles (OpenStreetMap style)
 * - Shows marker at specified latitude/longitude
 * - Responsive container with configurable height
 * - Client-only component (uses browser APIs)
 */

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_ZOOM, GEOAPIFY_TILE_ENDPOINT, FALLBACK_GEOAPIFY_KEY, MAP_CONTAINER_HEIGHT_PX } from '@/lib/constants';

interface SimpleMapProps {
  /** Latitude for map center and marker (default: 28.6139 = Taj Mahal, Agra) */
  latitude?: number;

  /** Longitude for map center and marker (default: 77.2090 = Taj Mahal, Agra) */
  longitude?: number;

  /** Additional CSS classes to apply to container */
  className?: string;
}

/**
 * Renders an interactive map at a specified location.
 * Uses Geoapify tile provider and Leaflet.js for rendering.
 *
 * @param props - Component props
 * @returns Map container div (browser-rendered by Leaflet)
 *
 * @example
 * <SimpleMap latitude={28.6139} longitude={77.2090} className="rounded-lg" />
 */
export default function SimpleMap({
  latitude = 28.6139,
  longitude = 77.209,
  className = '',
}: SimpleMapProps) {
  // Refs to hold map instance and container DOM node
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    // Only initialize if container is mounted
    if (!mapContainer.current) return;

    try {
      // Initialize Leaflet map instance
      map.current = L.map(mapContainer.current).setView([latitude, longitude], DEFAULT_MAP_ZOOM);

      // Fetch Geoapify API key from environment or use fallback
      const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || FALLBACK_GEOAPIFY_KEY;

      // Build tile layer URL with API key
      const tileUrl = `${GEOAPIFY_TILE_ENDPOINT}?apiKey=${geoapifyKey}`;

      // Add tile layer (map background)
      L.tileLayer(tileUrl, {
        attribution: '© OpenStreetMap contributors, © Geoapify',
        maxZoom: 19,
      }).addTo(map.current);

      // Create custom marker icon (SVG-based location pin)
      const markerIcon = L.icon({
        iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ffffff" stroke="black" stroke-width="2"%3E%3Cpath d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/%3E%3Ccircle cx="12" cy="10" r="3" fill="black"/%3E%3C/svg%3E',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      // Add marker at specified location
      L.marker([latitude, longitude], { icon: markerIcon }).addTo(map.current);
    } catch (error) {
      console.error('[SimpleMap] Initialization error:', error);
    }

    // Cleanup: remove map instance when component unmounts
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude]); // Re-initialize if coordinates change

  return (
    <div
      ref={mapContainer}
      className={`rounded-3xl overflow-hidden border border-gray-800 ${className}`}
      style={{ height: `${MAP_CONTAINER_HEIGHT_PX}px` }}
      role="region"
      aria-label="Map view"
    />
  );
}
