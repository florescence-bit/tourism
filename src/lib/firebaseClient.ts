/**
 * @file src/lib/firebaseClient.ts
 * @description Firebase client initialization and authentication/Firestore helpers.
 * This module handles:
 * - Firebase app initialization and configuration
 * - Email/password, Google, and GitHub authentication
 * - Auth state management and listeners
 * - Firestore CRUD operations for profiles and notifications
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import { sendEmailVerification } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  DocumentSnapshot,
} from 'firebase/firestore';

import { FIREBASE_AUTH_TIMEOUT_MS } from './constants';
import QRCode from 'qrcode';

/** Firebase configuration loaded from environment variables */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Validates that Firebase configuration is complete.
 * Returns true if all required config values are present (non-empty strings).
 * Returns false if any values are missing or empty.
 */
function isFirebaseConfigValid(): boolean {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  return requiredKeys.every(
    (key) => firebaseConfig[key] && firebaseConfig[key].trim().length > 0
  );
}

/**
 * Returns whether Firebase configuration is present and appears valid.
 * Exported so UI code can present a helpful message when configuration is missing
 */
export function isFirebaseConfigured(): boolean {
  return isFirebaseConfigValid();
}

/** Global Firebase initialization flag */
let appInitialized = false;

/** Global Auth instance */
let auth: Auth | null = null;

/** Global Firestore instance */
let db: Firestore | null = null;

/**
 * Initializes the Firebase app with the provided configuration.
 * Safe to call multiple times; will only initialize once.
 * Catches and logs errors without throwing to allow graceful degradation.
 * 
 * Returns false if Firebase config is incomplete or initialization fails.
 * This allows the app to handle missing credentials gracefully (e.g., on Vercel without env vars).
 *
 * @returns boolean - true if Firebase initialized successfully, false if config invalid or error occurred
 */
export function initFirebase(): boolean {
  try {
    // Check if Firebase config is complete before attempting initialization
    if (!isFirebaseConfigValid()) {
      console.warn('[Firebase] Configuration incomplete - missing required environment variables');
      console.warn('[Firebase] Ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set');
      return false;
    }

    if (!appInitialized) {
      // Initialize Firebase app if not already initialized
      if (!getApps().length) {
        initializeApp(firebaseConfig);
        console.debug('[Firebase] App initialized successfully');
      } else {
        getApp();
      }
      // Get Auth and Firestore instances
      auth = getAuth();
      db = getFirestore();
      appInitialized = true;
      return true;
    }
    
    return appInitialized;
  } catch (error) {
    // Log but don't throw; allow app to continue without Firebase if config is incomplete
    console.error('[Firebase] Initialization error:', error);
    return false;
  }
}

/**
 * Ensures the user is authenticated (signs in anonymously if necessary).
 * Checks current auth state; if no user, attempts anonymous sign-in.
 * Used on app load to guarantee a user context for database operations.
 *
 * @returns Promise resolving to User object, or null if auth unavailable
 */
export async function ensureAnonAuth(): Promise<User | null> {
  if (!auth) initFirebase();
  if (!auth) {
    console.warn('[Firebase] Auth not available for anonymous sign-in');
    return null;
  }

  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      unsubscribe();
      if (user) {
        // Already authenticated
        resolve(user);
      } else {
        // Not authenticated; attempt anonymous sign-in
        signInAnonymously(auth!)
          .then(({ user: anonUser }) => {
            console.debug('[Firebase] Anonymous sign-in successful');
            resolve(anonUser);
          })
          .catch((error) => {
            console.error('[Firebase] Anonymous sign-in failed:', error);
            resolve(null);
          });
      }
    });
  });
}

/**
 * Creates a new user account with email and password.
 * Validates that auth is initialized before attempting sign-up.
 *
 * @param email - User's email address
 * @param password - User's password (should be at least 6 characters)
 * @returns Promise resolving to the created User object
 * @throws Firebase auth errors (e.g., auth/email-already-in-use, auth/weak-password)
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Signing up with email:', email);
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error: any) {
    console.error('[Firebase] Sign-up error:', error);
    throw error;
  }
}

/**
 * Initiates Google OAuth sign-in flow.
 * Opens a popup for the user to authenticate with their Google account.
 * Requires Google provider to be enabled in Firebase Console.
 *
 * @returns Promise resolving to the authenticated User object
 * @throws Firebase auth errors (e.g., auth/popup-blocked, auth/operation-not-allowed)
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Starting Google sign-in');
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    console.debug('[Firebase] Google sign-in successful');
    return user;
  } catch (error: any) {
    console.error('[Firebase] Google sign-in error:', error);
    throw error;
  }
}

/**
 * Initiates GitHub OAuth sign-in flow.
 * Opens a popup for the user to authenticate with their GitHub account.
 * Requires GitHub provider to be enabled in Firebase Console with OAuth App credentials.
 *
 * @returns Promise resolving to the authenticated User object
 * @throws Firebase auth errors (e.g., auth/popup-blocked, auth/operation-not-allowed)
 */
export async function signInWithGithub(): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Starting GitHub sign-in');
    const provider = new GithubAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    console.debug('[Firebase] GitHub sign-in successful');
    return user;
  } catch (error: any) {
    console.error('[Firebase] GitHub sign-in error:', error);
    throw error;
  }
}

/**
 * Signs in with email and password.
 * Validates that auth is initialized before attempting sign-in.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated User object
 * @throws Firebase auth errors (e.g., auth/user-not-found, auth/wrong-password)
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Signing in with email:', email);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error: any) {
    console.error('[Firebase] Sign-in error:', error);
    throw error;
  }
}

/**
 * Signs out the currently authenticated user.
 * Clears the user session and auth token.
 *
 * @returns Promise resolving to true if sign-out successful, false otherwise
 */
export async function signOut(): Promise<boolean> {
  if (!auth) initFirebase();
  if (!auth) {
    console.warn('[Firebase] Auth not initialized for sign-out');
    return false;
  }

  try {
    console.debug('[Firebase] Signing out');
    await firebaseSignOut(auth);
    return true;
  } catch (error: any) {
    console.error('[Firebase] Sign-out error:', error);
    return false;
  }
}

/**
 * Subscribes to auth state changes and calls the callback whenever auth state changes.
 * Used to reactively update UI when user signs in/out.
 * 
 * If Firebase is not initialized (config missing), immediately calls callback with null
 * to allow UI to show "not authenticated" state instead of loading forever.
 *
 * @param callback - Function to call with the current User or null
 * @returns Unsubscribe function; call to stop listening for changes
 *
 * @example
 * const unsubscribe = onAuthChange((user) => {
 *   if (user) console.log('Signed in:', user.email);
 *   else console.log('Signed out');
 * });
 * // Later:
 * unsubscribe();
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  // Try to initialize Firebase
  const initialized = initFirebase();
  
  if (!initialized || !auth) {
    console.warn('[Firebase] Firebase not initialized; assuming user is not authenticated');
    // Immediately call callback with null to prevent infinite loading
    // Schedule in next tick to ensure caller has finished setting up the subscription
    setTimeout(() => {
      callback(null);
    }, 0);
    // Return no-op unsubscribe function
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    console.log('[Firebase] Auth state changed:', user ? `User ${user.uid} authenticated` : 'User signed out');
    callback(user);
  });
}

/**
 * Sends a verification email to the user's email address.
 * Call this after sign-up to ask the user to verify their email.
 * Note: Requires "Email/Password" provider to be enabled in Firebase Console
 * AND the user's email provider must allow email forwarding.
 *
 * @param user - The User object to send verification email to
 * @returns Promise resolving to true if email sent successfully, false otherwise
 */
export async function sendVerificationEmail(user: User): Promise<boolean> {
  if (!user) throw new Error('[Firebase] No user provided for verification email');

  try {
    console.debug('[Firebase] Sending verification email to:', user.email);
    await sendEmailVerification(user);
    return true;
  } catch (error: any) {
    console.error('[Firebase] Verification email send error:', error);
    return false;
  }
}

/**
 * Retrieves the user profile document from Firestore.
 * Profiles are stored at /profiles/{uid}.
 *
 * @param uid - The user's UID
 * @returns Promise resolving to profile data object, or null if not found or error occurs
 */
export async function getProfile(uid: string): Promise<Record<string, any> | null> {
  console.log('[Firebase] getProfile called with uid:', uid);
  
  if (!db) {
    console.log('[Firebase] db is null, initializing Firebase');
    initFirebase();
  }
  
  if (!db) {
    console.warn('[Firebase] Firestore not available for getProfile - initialization failed');
    return null;
  }

  try {
    console.log('[Firebase] Getting profile document from /profiles/' + uid);
    const ref = doc(db, 'profiles', uid);
    const snap: DocumentSnapshot = await getDoc(ref);
    const data = snap.exists() ? snap.data() : null;
    console.log('[Firebase] getProfile result:', data ? 'found' : 'not found', data);
    return data;
  } catch (error: any) {
    console.error('[Firebase] getProfile error:', error.message, error.code);
    return null;
  }
}

/**
 * Saves or updates a user profile document in Firestore.
 * Uses merge: true to preserve existing fields not in the update payload.
 * Profiles are stored at /profiles/{uid}.
 *
 * @param uid - The user's UID
 * @param profile - Object containing profile fields to save/update
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function saveProfile(uid: string, profile: Record<string, any>): Promise<boolean> {
  console.log('[Firebase] saveProfile called with uid:', uid);
  
  if (!db) {
    console.log('[Firebase] db is null, initializing Firebase');
    initFirebase();
  }
  
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveProfile - initialization failed');
    return false;
  }

  try {
    console.log('[Firebase] Setting profile document at /profiles/' + uid, profile);
    const ref = doc(db, 'profiles', uid);
    await setDoc(ref, profile, { merge: true });
    console.log('[Firebase] Profile saved successfully');
    return true;
  } catch (error: any) {
    console.error('[Firebase] saveProfile error:', error.message, error.code);
    return false;
  }
}

/**
 * Retrieves the user's notifications from Firestore.
 * Notifications are stored at /profiles/{uid}/notifications and ordered by recency (newest first).
 *
 * @param uid - The user's UID
 * @returns Promise resolving to array of notification documents, or empty array on error
 */
export async function listNotifications(uid: string): Promise<Array<Record<string, any>>> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for listNotifications');
    return [];
  }

  try {
    const col = collection(db, 'profiles', uid, 'notifications');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error: any) {
    console.error('[Firebase] listNotifications error:', error);
    return [];
  }
}

/**
 * Saves a new notification to the user's notifications collection in Firestore.
 * Automatically adds a createdAt timestamp.
 * Notifications are stored at /profiles/{uid}/notifications.
 *
 * @param uid - The user's UID
 * @param payload - Object containing notification data (title, message, etc.)
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function saveNotification(uid: string, payload: Record<string, any>): Promise<boolean> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveNotification');
    return false;
  }

  try {
    const col = collection(db, 'profiles', uid, 'notifications');
    await addDoc(col, { ...payload, createdAt: Date.now() });
    return true;
  } catch (error: any) {
    console.error('[Firebase] saveNotification error:', error);
    return false;
  }
}

// ============================================================================
// DIGITAL ID (QR) GENERATION
// ============================================================================

/**
 * Generates a human-friendly digital ID using the user's name and stores it
 * together with a generated QR code (data URL) in Firestore under
 * `/profiles/{uid}/digitalIds/{digitalId}` and also merges into the profile doc.
 *
 * @param uid - User's UID
 * @param name - Display name or full name to base the digital id on (optional)
 * @returns Object containing digitalId and qrDataUrl on success, or null on failure
 */
export async function generateAndSaveDigitalId(uid: string, name?: string): Promise<{ digitalId: string; qrDataUrl: string } | null> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for generateAndSaveDigitalId');
    return null;
  }

  try {
    const normalized = (name || '').trim() || uid;
    const initials = normalized
      .split(/\s+/)
      .map((s) => (s && s[0] ? s[0].toUpperCase() : ''))
      .join('')
      .slice(0, 4) || 'ID';
    const timestamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const digitalId = `${initials}-${timestamp}-${rand}`;

    const payload = {
      uid,
      name: normalized,
      digitalId,
      createdAt: Date.now(),
    };

    const qrPayload = { uid, digitalId, name: normalized };
    // Generate QR code as data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { margin: 1, width: 300 });

    // Save to subcollection and merge into user profile
    await setDoc(doc(db, 'profiles', uid, 'digitalIds', digitalId), { ...payload, qrDataUrl });
    await setDoc(doc(db, 'profiles', uid), { digitalId, qrDataUrl }, { merge: true });

    return { digitalId, qrDataUrl };
  } catch (error: any) {
    console.error('[Firebase] generateAndSaveDigitalId error:', error);
    return null;
  }
}

// ============================================================================
// CHECK-INS
// ============================================================================

/**
 * Saves a check-in location to Firestore.
 * Check-ins are stored at /profiles/{uid}/checkIns/{checkInId}.
 *
 * @param uid - The user's UID
 * @param checkInData - Object containing location, latitude, longitude, accuracy, place
 * @returns Promise resolving to the check-in ID if successful, null otherwise
 */
export async function saveCheckIn(
  uid: string,
  checkInData: {
    location: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    place?: string;
  }
): Promise<string | null> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveCheckIn');
    return null;
  }

  try {
    const col = collection(db, 'profiles', uid, 'checkIns');
    const docRef = await addDoc(col, {
      ...checkInData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.debug('[Firebase] Check-in saved:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firebase] saveCheckIn error:', error);
    return null;
  }
}

/**
 * Retrieves all check-ins for a user, ordered by most recent first.
 *
 * @param uid - The user's UID
 * @returns Promise resolving to array of check-in documents, or empty array on error
 */
export async function listCheckIns(uid: string): Promise<Array<Record<string, any>>> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for listCheckIns');
    return [];
  }

  try {
    const col = collection(db, 'profiles', uid, 'checkIns');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error: any) {
    console.error('[Firebase] listCheckIns error:', error);
    return [];
  }
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Saves an incident report to Firestore.
 * Reports are stored at /profiles/{uid}/reports/{reportId}.
 *
 * @param uid - The user's UID
 * @param reportData - Object containing incidentType, description, location
 * @returns Promise resolving to the report ID if successful, null otherwise
 */
export async function saveReport(
  uid: string,
  reportData: {
    incidentType: string;
    description: string;
    location: string;
  }
): Promise<string | null> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveReport');
    return null;
  }

  try {
    const col = collection(db, 'profiles', uid, 'reports');
    const docRef = await addDoc(col, {
      ...reportData,
      status: 'submitted',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.debug('[Firebase] Report saved:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firebase] saveReport error:', error);
    return null;
  }
}

/**
 * Retrieves all reports for a user, ordered by most recent first.
 *
 * @param uid - The user's UID
 * @returns Promise resolving to array of report documents, or empty array on error
 */
export async function listReports(uid: string): Promise<Array<Record<string, any>>> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for listReports');
    return [];
  }

  try {
    const col = collection(db, 'profiles', uid, 'reports');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error: any) {
    console.error('[Firebase] listReports error:', error);
    return [];
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Saves user settings to Firestore (merged with profile).
 * Settings include notificationsEnabled, shareLocation, etc.
 *
 * @param uid - The user's UID
 * @param settings - Object containing user preference settings
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function saveSettings(
  uid: string,
  settings: Record<string, any>
): Promise<boolean> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveSettings');
    return false;
  }

  try {
    const ref = doc(db, 'profiles', uid);
    await setDoc(ref, { settings }, { merge: true });
    console.debug('[Firebase] Settings saved for user:', uid);
    return true;
  } catch (error: any) {
    console.error('[Firebase] saveSettings error:', error);
    return false;
  }
}

/**
 * Retrieves user settings from Firestore.
 *
 * @param uid - The user's UID
 * @returns Promise resolving to settings object, or empty object if not found
 */
export async function getSettings(uid: string): Promise<Record<string, any>> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for getSettings');
    return {};
  }

  try {
    const ref = doc(db, 'profiles', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().settings || {};
    }
    return {};
  } catch (error: any) {
    console.error('[Firebase] getSettings error:', error);
    return {};
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Retrieves aggregated analytics for a user based on check-ins.
 * Calculates total check-ins, last check-in time, safety score, etc.
 *
 * @param uid - The user's UID
 * @returns Promise resolving to analytics object with counts and stats
 */
export async function getUserAnalytics(uid: string): Promise<Record<string, any>> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for getUserAnalytics');
    return { totalCheckIns: 0, recentDays: {} };
  }

  try {
    const checkIns = await listCheckIns(uid);
    const reports = await listReports(uid);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const recentCheckIns = checkIns.filter((c) => c.createdAt >= thirtyDaysAgo);
    const recentReports = reports.filter((r) => r.createdAt >= thirtyDaysAgo);

    // Group check-ins by day
    const byDay: Record<string, number> = {};
    for (const checkIn of recentCheckIns) {
      const date = new Date(checkIn.createdAt).toISOString().split('T')[0];
      byDay[date] = (byDay[date] || 0) + 1;
    }

    // Simple safety score: based on check-ins and no reports
    const safetyScore = Math.max(50, Math.min(100, 70 + recentCheckIns.length * 2 - recentReports.length * 10));

    return {
      totalCheckIns: checkIns.length,
      recentCheckIns30Days: recentCheckIns.length,
      totalReports: reports.length,
      recentReports30Days: recentReports.length,
      safetyScore: Math.round(safetyScore),
      threatLevel: safetyScore >= 80 ? 'Low' : safetyScore >= 60 ? 'Medium' : 'High',
      lastCheckInAt: recentCheckIns.length > 0 ? recentCheckIns[0].createdAt : null,
      checkInsPerDay: byDay,
    };
  } catch (error: any) {
    console.error('[Firebase] getUserAnalytics error:', error);
    return { totalCheckIns: 0, recentDays: {} };
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export provides convenient access to main firebase functions.
 * Can be imported as: `import firebase from '@/lib/firebaseClient'`
 */
const firebaseClient = {
  initFirebase,
  ensureAnonAuth,
  getProfile,
  saveProfile,
  listNotifications,
  saveNotification,
  saveCheckIn,
  listCheckIns,
  saveReport,
  listReports,
  saveSettings,
  getSettings,
  getUserAnalytics,
  generateAndSaveDigitalId,
  isFirebaseConfigured,
};

export default firebaseClient;
