'use client';

import { useEffect, useRef, useState } from 'react';

interface CrimeData {
  lat: number;
  lng: number;
  intensity: number; // 0-1, where 1 is highest crime rate
  crimeCount: number;
  description: string;
}

interface CrimeHeatMapProps {
  latitude?: number;
  longitude?: number;
  className?: string;
  crimeData?: CrimeData[];
  showLegend?: boolean;
}

/**
 * Crime Heat Map Component
 * Displays areas with high crime rates using a color-coded heat map overlay
 * Green (low crime) → Yellow → Orange → Red (high crime)
 * 
 * @param props - Component props including coordinates and crime data
 * @returns Heat map visualization with crime rate intensity
 */
export default function CrimeHeatMap({
  latitude = 28.6139,
  longitude = 77.209,
  className = '',
  crimeData = [],
  showLegend = true,
}: CrimeHeatMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const heatLayer = useRef<any>(null);
  const [selectedArea, setSelectedArea] = useState<CrimeData | null>(null);

  // Default crime data for demonstration (representing different areas)
  const defaultCrimeData: CrimeData[] = [
    // High crime areas (red)
    { lat: 28.6200, lng: 77.2100, intensity: 0.9, crimeCount: 45, description: 'Downtown District' },
    { lat: 28.6150, lng: 77.2200, intensity: 0.85, crimeCount: 38, description: 'Market Area' },
    { lat: 28.6100, lng: 77.2000, intensity: 0.8, crimeCount: 32, description: 'Station Area' },
    
    // Medium crime areas (orange/yellow)
    { lat: 28.6300, lng: 77.2300, intensity: 0.6, crimeCount: 18, description: 'Commercial Zone' },
    { lat: 28.6050, lng: 77.1950, intensity: 0.5, crimeCount: 12, description: 'Residential Area' },
    { lat: 28.6400, lng: 77.2000, intensity: 0.55, crimeCount: 14, description: 'Industrial District' },
    
    // Low crime areas (green)
    { lat: 28.5900, lng: 77.2100, intensity: 0.2, crimeCount: 3, description: 'Park Area' },
    { lat: 28.6500, lng: 77.2500, intensity: 0.15, crimeCount: 2, description: 'Residential Complex' },
    { lat: 28.5800, lng: 77.1900, intensity: 0.1, crimeCount: 1, description: 'Educational District' },
    
    // Additional data points for better heat map coverage
    { lat: 28.6250, lng: 77.2150, intensity: 0.7, crimeCount: 25, description: 'Main Street' },
    { lat: 28.6000, lng: 77.2250, intensity: 0.35, crimeCount: 8, description: 'Shopping Mall Area' },
    { lat: 28.6350, lng: 77.1850, intensity: 0.4, crimeCount: 10, description: 'Business Park' },
  ];

  const dataToUse = crimeData.length > 0 ? crimeData : defaultCrimeData;
  const MAP_CONTAINER_HEIGHT_PX = 500;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainer.current || typeof window === 'undefined') return;

    try {
      // Dynamically require Leaflet on client side only
      const L = require('leaflet');
      require('leaflet/dist/leaflet.css');
      require('leaflet.heat/dist/leaflet-heat.js');

      // Initialize map
      map.current = L.map(mapContainer.current).setView([latitude, longitude], 13);

      // Add base tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        opacity: 0.85,
      }).addTo(map.current);

      // Prepare heat map data
      const heatPoints: Array<[number, number, number]> = dataToUse.map(crime => [
        crime.lat,
        crime.lng,
        crime.intensity,
      ]);

      // Create heat map layer with custom gradient colors
      heatLayer.current = L.heatLayer(heatPoints as any, {
        radius: 40,
        blur: 30,
        maxZoom: 18,
        gradient: {
          0.0: '#00b050',
          0.25: '#92d050',
          0.5: '#ffeb3b',
          0.75: '#ff9800',
          1.0: '#f44336',
        },
        minOpacity: 0.3,
        max: 1,
      }).addTo(map.current);

      // Add crime markers with detailed information
      dataToUse.forEach(crime => {
        const severityColor = getSeverityColor(crime.intensity);
        const markerIcon = L.divIcon({
          html: `
            <div class="crime-marker" style="
              background-color: ${severityColor};
              border: 2px solid white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              <span style="color: white; font-size: 12px; font-weight: bold;">
                ${crime.crimeCount}
              </span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([crime.lat, crime.lng], { icon: markerIcon });
        marker.bindPopup(`
          <div style="font-size: 12px; padding: 8px;">
            <strong>${crime.description}</strong><br/>
            Recent Crimes: <span style="color: ${severityColor}; font-weight: bold;">${crime.crimeCount}</span><br/>
            Risk Level: ${getRiskLevel(crime.intensity)}<br/>
            <span style="font-size: 10px; color: #666;">Last 30 days</span>
          </div>
        `);
        marker.addTo(map.current!);

        marker.on('click', () => {
          setSelectedArea(crime);
        });
      });

      // Add user location marker
      const userMarkerIcon = L.icon({
        iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%234a90e2" stroke="white" stroke-width="2"%3E%3Cpath d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/%3E%3Ccircle cx="12" cy="10" r="3" fill="white"/%3E%3C/svg%3E',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([latitude, longitude], { icon: userMarkerIcon }).addTo(map.current);

    } catch (error) {
      console.error('[CrimeHeatMap] Initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isClient, latitude, longitude, dataToUse]);

  const getRiskLevel = (intensity: number): string => {
    if (intensity >= 0.8) return '🔴 Very High';
    if (intensity >= 0.6) return '🟠 High';
    if (intensity >= 0.4) return '🟡 Medium';
    if (intensity >= 0.2) return '🟢 Low';
    return '🟢 Very Low';
  };

  const getSeverityColor = (intensity: number): string => {
    if (intensity >= 0.8) return '#f44336'; // Red
    if (intensity >= 0.6) return '#ff9800'; // Orange
    if (intensity >= 0.4) return '#ffeb3b'; // Yellow
    if (intensity >= 0.2) return '#92d050'; // Light Green
    return '#00b050'; // Green
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="rounded-3xl overflow-hidden border border-gray-700"
        style={{ height: `${MAP_CONTAINER_HEIGHT_PX}px` }}
        role="region"
        aria-label="Crime heat map view"
      />

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-surface-secondary/95 backdrop-blur rounded-lg p-4 border border-gray-700 z-10 max-w-xs">
          <h3 className="text-sm font-semibold text-white mb-3">Crime Risk Level</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f44336' }}></div>
              <span className="text-xs text-text-secondary">Very High Risk (0.8-1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ff9800' }}></div>
              <span className="text-xs text-text-secondary">High Risk (0.6-0.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ffeb3b' }}></div>
              <span className="text-xs text-text-secondary">Medium Risk (0.4-0.6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#92d050' }}></div>
              <span className="text-xs text-text-secondary">Low Risk (0.2-0.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#00b050' }}></div>
              <span className="text-xs text-text-secondary">Very Low Risk (0-0.2)</span>
            </div>
          </div>
        </div>
      )}

      {/* Crime Stats Panel */}
      {selectedArea && (
        <div className="absolute top-4 right-4 bg-surface-secondary/95 backdrop-blur rounded-lg p-4 border border-gray-700 z-10 max-w-sm animate-slideIn">
          <button
            onClick={() => setSelectedArea(null)}
            className="float-right text-text-secondary hover:text-white transition text-xl"
          >
            ✕
          </button>
          <h3 className="text-lg font-semibold text-white mb-2">{selectedArea.description}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Recent Crimes:</span>
              <span className="font-semibold" style={{ color: getSeverityColor(selectedArea.intensity) }}>
                {selectedArea.crimeCount} incidents
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Risk Level:</span>
              <span className="font-semibold">{getRiskLevel(selectedArea.intensity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Intensity:</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-red-500 h-full"
                  style={{ width: `${selectedArea.intensity * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold">{Math.round(selectedArea.intensity * 100)}%</span>
            </div>
            <div className="text-xs text-text-tertiary pt-2 border-t border-gray-700">
              Data based on last 30 days of reported incidents
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
