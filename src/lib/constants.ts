/**
 * @file src/lib/constants.ts
 * @description Centralized constants for the RAH app.
 * This file contains shared configuration values, UI constants, and API defaults
 * to reduce magic strings/numbers throughout the codebase.
 */

// ============================================================================
// GEOLOCATION & MAP CONSTANTS
// ============================================================================

/** Default map zoom level for displaying location */
export const DEFAULT_MAP_ZOOM = 13;

/** Default latitude (Taj Mahal, Agra) when no location is available */
export const DEFAULT_LATITUDE = 28.6139;

/** Default longitude (Taj Mahal, Agra) when no location is available */
export const DEFAULT_LONGITUDE = 77.209;

/** Geolocation options for watchPosition */
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 3000, // use cached position up to 3 seconds old
  timeout: 10000,   // wait max 10 seconds for position
} as const;

/** Max height of map containers in pixels */
export const MAP_CONTAINER_HEIGHT_PX = 400;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/** localStorage key for persisted check-in history */
export const STORAGE_KEY_CHECKINS = 'bharat_checkins_v1';

/** localStorage key for persisted user profile data */
export const STORAGE_KEY_PROFILE = 'bharat_profile_v1';

/** localStorage key for persisted geofence events */
export const STORAGE_KEY_GEOFENCE_EVENTS = 'bharat_geofence_events_v1';

/** localStorage key for persisted geofence boundaries */
export const STORAGE_KEY_GEOFENCES = 'bharat_geofences_v1';

// ============================================================================
// PAGINATION & LIMITS
// ============================================================================

/** Maximum number of recent check-ins to display on dashboard */
export const MAX_RECENT_CHECKINS = 3;

/** Maximum number of records to fetch from data.gov.in in one request */
export const DATAGOV_FETCH_LIMIT = 1000;

/** Retry attempts for failed API requests */
export const API_RETRY_ATTEMPTS = 3;

/** Delay between API retries in milliseconds */
export const API_RETRY_DELAY_MS = 500;

// ============================================================================
// AUTHENTICATION & FIREBASE
// ============================================================================

/** Minimum password length for email/password auth */
export const MIN_PASSWORD_LENGTH = 6;

/** Firebase anonymousAuth timeout in milliseconds */
export const FIREBASE_AUTH_TIMEOUT_MS = 5000;

// ============================================================================
// VALIDATION & CONSTRAINTS
// ============================================================================

/** Email regex pattern for basic validation */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Threat level thresholds based on check-in count */
export const THREAT_LEVEL_THRESHOLDS = {
  LOW: 5,      // 5+ check-ins = Low threat
  MEDIUM: 1,   // 1-4 check-ins = Medium threat
  // 0 check-ins = High threat
} as const;

// ============================================================================
// UI STRINGS & LABELS
// ============================================================================

/** Default app title */
export const APP_TITLE = 'RAH';

/** Dashboard welcome message */
export const DASHBOARD_WELCOME = 'Welcome';

/** Dashboard subtitle */
export const DASHBOARD_SUBTITLE = 'Your safety dashboard';

// ============================================================================
// API ENDPOINTS
// ============================================================================

/** Geoapify reverse geocoding endpoint */
export const GEOAPIFY_REVERSE_GEOCODE_ENDPOINT = 'https://api.geoapify.com/v1/geocode/reverse';

/** Geoapify tile layer endpoint */
export const GEOAPIFY_TILE_ENDPOINT = 'https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png';

/** data.gov.in API endpoint */
export const DATAGOV_API_ENDPOINT = 'https://api.data.gov.in/resource';

/** Fallback Geoapify API key (public, used if env var not set) */
export const FALLBACK_GEOAPIFY_KEY = 'f18d4c38001d440ca19b2bc9640560da';
