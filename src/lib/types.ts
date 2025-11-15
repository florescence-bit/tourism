/**
 * @file src/lib/types.ts
 * @description Centralized TypeScript type definitions used throughout the app.
 * This file ensures type consistency and reduces duplication.
 */

/**
 * LivePosition represents the user's current geographic location with metadata.
 * Used by the useLiveLocation hook and passed to map components.
 */
export interface LivePosition {
  /** Latitude in decimal degrees */
  lat: number;

  /** Longitude in decimal degrees */
  lon: number;

  /** Accuracy of the position in meters (optional) */
  accuracy?: number;

  /** Timestamp of when the position was last updated */
  updatedAt?: number;

  /** Human-readable place name from reverse geocoding (optional) */
  place?: string;
}

/**
 * CheckIn represents a saved location check-in.
 * Check-ins are persisted to localStorage and can optionally sync to Firestore.
 */
export interface CheckIn {
  /** Unique identifier for this check-in */
  id: number;

  /** Human-readable location name or coordinates */
  location: string;

  /** Time of check-in (relative or absolute) */
  time: string;

  /** Safety status (e.g., "Safe", "Alert") */
  status: string;

  /** Latitude of check-in location */
  lat?: number;

  /** Longitude of check-in location */
  lon?: number;

  /** Timestamp of check-in (milliseconds since epoch) */
  timestamp?: number;
}

/**
 * UserProfile represents persistent user data.
 * Stored in Firestore under /profiles/{uid} or localStorage.
 */
export interface UserProfile {
  /** User's display name (optional) */
  displayName?: string;

  /** User's email address */
  email?: string;

  /** User's phone number (optional) */
  phoneNumber?: string;

  /** User's profile picture URL (optional) */
  photoURL?: string;

  /** User's full name (required on sign-up) */
  fullName?: string;

  /** User's age (optional) */
  age?: number;

  /** User type: 'indian' or 'foreigner' */
  userType?: 'indian' | 'foreigner';

  /** Document type for verification: 'aadhar' (Indian) or 'visa' | 'passport' (Foreigner) */
  documentType?: 'aadhar' | 'visa' | 'passport';

  /** Document number (e.g., Aadhar number, Visa number) */
  documentNumber?: string;

  /** Last known latitude */
  lastLat?: number;

  /** Last known longitude */
  lastLon?: number;

  /** Last known location name */
  lastPlace?: string;

  /** User profile creation timestamp */
  createdAt?: number;

  /** Last profile update timestamp */
  updatedAt?: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Geofence represents a circular geographic boundary with center and radius.
 * Used for proximity alerts and location-based notifications.
 */
export interface Geofence {
  /** Unique identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Center latitude */
  lat: number;

  /** Center longitude */
  lon: number;

  /** Radius in meters */
  radiusMeters: number;

  /** Creation timestamp */
  createdAt?: number;

  /** Additional metadata (e.g., alert type, threshold) */
  metadata?: Record<string, any>;
}

/**
 * GeofenceEvent represents an enter/exit event for a geofence.
 * Persisted to localStorage for history and optionally to Firestore.
 */
export interface GeofenceEvent {
  /** Unique event identifier */
  id: string;

  /** Geofence ID this event belongs to */
  geofenceId: string;

  /** Type of event: "enter" or "exit" */
  type: 'enter' | 'exit';

  /** Latitude where event occurred */
  lat: number;

  /** Longitude where event occurred */
  lon: number;

  /** Human-readable place name (optional) */
  place?: string;

  /** Timestamp of event (milliseconds since epoch) */
  timestamp: number;
}

/**
 * ApiResponse represents a standardized response wrapper for API calls.
 * Can be used to normalize responses from different API sources.
 */
export interface ApiResponse<T> {
  /** Success flag */
  success: boolean;

  /** Response data payload */
  data?: T;

  /** Error message if unsuccessful */
  error?: string;

  /** HTTP status code */
  status?: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * FirebaseError represents a Firebase-specific error with code and message.
 * Used for error mapping and user-friendly error display.
 */
export interface FirebaseErrorInfo {
  /** Firebase error code (e.g., "auth/operation-not-allowed") */
  code: string;

  /** Original error message from Firebase */
  message: string;

  /** User-friendly error message for display */
  userMessage: string;

  /** Whether the error is retryable */
  retryable: boolean;

  /** Optional action hint for the user */
  actionHint?: string;
}

/**
 * AuthState represents the current authentication state.
 * Used across the app for conditional rendering and access control.
 */
export interface AuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Firebase User object or null */
  user: any | null;

  /** Whether auth state is still loading */
  isLoading: boolean;

  /** Error message if authentication failed */
  error?: string;
}
